// ============================================================
// StarSource — outreach persistence (suppression list + send log)
//
// Every outreach jurisdiction's legal basis requires a working opt-out —
// this is the record of who opted out and what's already been sent, so
// the system can actually honor that.
//
// IMPORTANT: this is a local JSON file store — fine for local dev, but it
// will NOT survive on a serverless host like Vercel (no persistent disk
// between invocations). Before deploying real sends, swap this module's
// internals for a hosted database (e.g. Postgres via Supabase/Neon) and
// keep the same function signatures.
// ============================================================
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const DATA_DIR = join(process.cwd(), ".data");
const SUPPRESSIONS_FILE = join(DATA_DIR, "suppressions.json");
const SENDS_FILE = join(DATA_DIR, "sends.json");

export interface SuppressionEntry {
  email: string;
  suppressedAt: string;
  reason: string;
}

export interface SendLogEntry {
  email: string;
  leadId: string;
  company: string;
  subject: string;
  sentAt: string;
  providerId: string;
}

function ensureDataDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
}

function readJson<T>(path: string): T[] {
  ensureDataDir();
  if (!existsSync(path)) return [];
  try {
    return JSON.parse(readFileSync(path, "utf-8")) as T[];
  } catch {
    return [];
  }
}

function writeJson<T>(path: string, data: T[]) {
  ensureDataDir();
  writeFileSync(path, JSON.stringify(data, null, 2), "utf-8");
}

const norm = (email: string) => email.trim().toLowerCase();

export function isSuppressed(email: string): boolean {
  const list = readJson<SuppressionEntry>(SUPPRESSIONS_FILE);
  return list.some((s) => s.email === norm(email));
}

export function suppress(email: string, reason: string) {
  const list = readJson<SuppressionEntry>(SUPPRESSIONS_FILE);
  const e = norm(email);
  if (list.some((s) => s.email === e)) return;
  list.push({ email: e, suppressedAt: new Date().toISOString(), reason });
  writeJson(SUPPRESSIONS_FILE, list);
}

export function recordSend(entry: Omit<SendLogEntry, "email"> & { email: string }) {
  const list = readJson<SendLogEntry>(SENDS_FILE);
  list.push({ ...entry, email: norm(entry.email) });
  writeJson(SENDS_FILE, list);
}

export function countSendsSince(since: Date): number {
  const list = readJson<SendLogEntry>(SENDS_FILE);
  return list.filter((s) => new Date(s.sentAt).getTime() >= since.getTime()).length;
}

/** Guards against re-messaging the same lead too frequently. */
export function sentToRecently(email: string, withinDays: number, now: Date = new Date()): boolean {
  const list = readJson<SendLogEntry>(SENDS_FILE);
  const e = norm(email);
  const cutoff = now.getTime() - withinDays * 24 * 60 * 60 * 1000;
  return list.some((s) => s.email === e && new Date(s.sentAt).getTime() >= cutoff);
}
