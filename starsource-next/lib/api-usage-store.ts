// ============================================================
// StarSource — cross-provider API usage log
//
// Tracks every real call to a paid external API (Google Places, Anthropic,
// Resend) so cost is visible in one place instead of three separate
// vendor consoles. This is for VISIBILITY, not enforcement — it
// complements Google Cloud's own spend cap, it doesn't replace it.
//
// Same caveat as the other local-file stores (outreach-store.ts,
// scan-store.ts): fine for local dev, won't survive a serverless
// deploy — swap for the real database alongside them.
// ============================================================
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const DATA_DIR = join(process.cwd(), ".data");
const USAGE_FILE = join(DATA_DIR, "api-usage.json");
const MAX_ENTRIES = 2000;

export type ApiService = "google_places" | "anthropic" | "resend";

export interface ApiUsageEntry {
  service: ApiService;
  operation: string;
  at: string;
  estimatedCostUsd: number;
  /** "measured" = computed from real token counts the provider returned; "estimated" = a rate-card guess. */
  costBasis: "measured" | "estimated";
}

function ensureDataDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
}

function readUsage(): ApiUsageEntry[] {
  ensureDataDir();
  if (!existsSync(USAGE_FILE)) return [];
  try {
    return JSON.parse(readFileSync(USAGE_FILE, "utf-8")) as ApiUsageEntry[];
  } catch {
    return [];
  }
}

function writeUsage(entries: ApiUsageEntry[]) {
  ensureDataDir();
  writeFileSync(USAGE_FILE, JSON.stringify(entries, null, 2), "utf-8");
}

export function logApiUsage(entry: Omit<ApiUsageEntry, "at">) {
  const entries = readUsage();
  entries.push({ ...entry, at: new Date().toISOString() });
  writeUsage(entries.slice(-MAX_ENTRIES));
}

export function getApiUsage(): ApiUsageEntry[] {
  return readUsage();
}
