// ============================================================
// StarSource — free market scan usage log
//
// This endpoint is public and unauthenticated, and it triggers a real,
// billed Google Places call — without a limit, anyone could run it on
// repeat and rack up real cost. One free scan per email address, tracked
// here.
//
// Same caveat as lib/outreach-store.ts: local JSON file, fine for local
// dev, won't survive a serverless deploy — swap for the real database
// alongside that module.
// ============================================================
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const DATA_DIR = join(process.cwd(), ".data");
const SCANS_FILE = join(DATA_DIR, "scans.json");

interface ScanEntry {
  email: string;
  industry: string;
  location: string;
  ranAt: string;
}

function ensureDataDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
}

function readScans(): ScanEntry[] {
  ensureDataDir();
  if (!existsSync(SCANS_FILE)) return [];
  try {
    return JSON.parse(readFileSync(SCANS_FILE, "utf-8")) as ScanEntry[];
  } catch {
    return [];
  }
}

function writeScans(scans: ScanEntry[]) {
  ensureDataDir();
  writeFileSync(SCANS_FILE, JSON.stringify(scans, null, 2), "utf-8");
}

const norm = (email: string) => email.trim().toLowerCase();

export function hasUsedFreeScan(email: string): boolean {
  return readScans().some((s) => s.email === norm(email));
}

export function recordScan(entry: Omit<ScanEntry, "email"> & { email: string }) {
  const scans = readScans();
  scans.push({ ...entry, email: norm(entry.email) });
  writeScans(scans);
}
