// ============================================================
// StarSource — auth (magic-link, no database)
//
// There's exactly one tenant right now, so a full user table would be
// premature. Instead: a signed, expiring token stands in for both the
// magic-link email and the session cookie — anyone who can produce a
// validly-signed token for an allowed email is authenticated. Swap this
// for real per-client accounts once there's more than one login.
// ============================================================
import { createHmac, timingSafeEqual } from "node:crypto";

const MAGIC_LINK_TTL_MS = 15 * 60 * 1000; // 15 minutes
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export const SESSION_COOKIE = "starsource_session";

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET is not configured on the server.");
  return s;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

function verify(payload: string, sig: string): boolean {
  const expected = sign(payload);
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(sig, "hex");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function makeToken(email: string, ttlMs: number): string {
  const payload = JSON.stringify({ email: email.trim().toLowerCase(), exp: Date.now() + ttlMs });
  const encoded = Buffer.from(payload, "utf-8").toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

function readToken(token: string): { email: string } | null {
  const [encoded, sig] = token.split(".");
  if (!encoded || !sig) return null;
  if (!verify(encoded, sig)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf-8"));
    if (typeof payload.email !== "string" || typeof payload.exp !== "number") return null;
    if (Date.now() > payload.exp) return null;
    return { email: payload.email };
  } catch {
    return null;
  }
}

export function isAllowedEmail(email: string): boolean {
  const allowed = (process.env.ALLOWED_LOGIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(email.trim().toLowerCase());
}

export function createMagicLinkToken(email: string): string {
  return makeToken(email, MAGIC_LINK_TTL_MS);
}

export function verifyMagicLinkToken(token: string): { email: string } | null {
  return readToken(token);
}

export function createSessionToken(email: string): string {
  return makeToken(email, SESSION_TTL_MS);
}

export function verifySessionToken(token: string): { email: string } | null {
  return readToken(token);
}
