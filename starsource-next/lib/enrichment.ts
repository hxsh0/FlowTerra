// ============================================================
// StarSource — contact enrichment
//
// Discovery (Google Places) gives a business's website but no email —
// Places has no email field at all. This fills that gap by fetching a
// lead's own website and looking for a published contact email
// (mailto: links, visible email text).
//
// Important: this does NOT identify a named individual or their role —
// it only finds a general business inbox (info@, contact@, etc.). That
// means it does not change a lead's contactSource/consent basis (see
// lib/consent.ts) — it only gives Outreach somewhere to send the email
// it was already legally eligible to send. A CA lead blocked by CASL
// stays blocked even after an email address is found here.
// ============================================================

const ROLE_PREFIX_PRIORITY = ["info", "contact", "hello", "sales", "hi", "admin", "office"];
const CONTACT_PAGE_PATHS = ["/contact", "/contact-us", "/contactus", "/about", "/about-us"];
const FETCH_TIMEOUT_MS = 8000;
const USER_AGENT = "StarSourceBot/1.0 (contact enrichment for outreach on behalf of a client)";

const MAILTO_RE = /mailto:([^"'?\s>]+)/gi;
const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

const NOISE_DOMAINS = new Set(["example.com", "sentry.io", "wixpress.com", "godaddy.com", "yourdomain.com", "domain.com"]);
const NOISE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp"];

function normalizeUrl(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function hostnameOf(url: string): string | undefined {
  try {
    return new URL(normalizeUrl(url)).hostname.replace(/^www\./, "");
  } catch {
    return undefined;
  }
}

async function fetchText(url: string): Promise<string | undefined> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal, headers: { "User-Agent": USER_AGENT } });
    if (!res.ok) return undefined;
    return await res.text();
  } catch {
    return undefined;
  } finally {
    clearTimeout(timeout);
  }
}

function extractCandidates(html: string): string[] {
  const found = new Set<string>();
  for (const m of html.matchAll(MAILTO_RE)) found.add(decodeURIComponent(m[1]).split("?")[0]);
  for (const m of html.matchAll(EMAIL_RE)) found.add(m[0]);

  return [...found].filter((e) => {
    const lower = e.toLowerCase();
    const domain = lower.split("@")[1];
    if (!domain) return false;
    if (NOISE_DOMAINS.has(domain)) return false;
    if (NOISE_EXTENSIONS.some((ext) => lower.endsWith(ext))) return false;
    return true;
  });
}

function pickBest(candidates: string[], siteHostname: string | undefined): string | undefined {
  if (candidates.length === 0) return undefined;

  const sameDomain = siteHostname ? candidates.filter((c) => c.toLowerCase().split("@")[1] === siteHostname) : [];
  const pool = sameDomain.length > 0 ? sameDomain : candidates;

  for (const prefix of ROLE_PREFIX_PRIORITY) {
    const hit = pool.find((c) => c.toLowerCase().startsWith(`${prefix}@`));
    if (hit) return hit;
  }
  return pool[0];
}

/** Best-effort: looks for a published contact email on a business's own site. */
export async function findEmailOnWebsite(website: string): Promise<string | undefined> {
  const base = normalizeUrl(website);
  const hostname = hostnameOf(base);

  const homepage = await fetchText(base);
  if (homepage) {
    const found = pickBest(extractCandidates(homepage), hostname);
    if (found) return found;
  }

  for (const path of CONTACT_PAGE_PATHS) {
    const url = new URL(path, base).toString();
    const html = await fetchText(url);
    if (!html) continue;
    const found = pickBest(extractCandidates(html), hostname);
    if (found) return found;
  }

  return undefined;
}
