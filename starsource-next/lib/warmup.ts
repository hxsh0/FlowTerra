// ============================================================
// StarSource — sending-domain warm-up curve
//
// A brand-new sending domain/mailbox has no reputation with inbox
// providers, so blasting full volume from day one is exactly what gets
// flagged as spam. Ramping volume gradually over ~4 weeks is standard
// cold-email practice. This is a starting-point curve, not a guarantee —
// tune it against your own bounce/spam-complaint rates once live.
// ============================================================

const DAY_MS = 24 * 60 * 60 * 1000;

/** Daily send cap for a domain, based on how many days it's been warming up. */
export function dailySendCap(warmupStartDate: Date, now: Date = new Date()): number {
  const daysSinceStart = Math.floor((now.getTime() - warmupStartDate.getTime()) / DAY_MS);

  if (daysSinceStart < 0) return 0;
  if (daysSinceStart < 3) return 20; // days 0-2
  if (daysSinceStart < 7) return 50; // days 3-6
  if (daysSinceStart < 14) return 100; // week 2
  if (daysSinceStart < 21) return 150; // week 3
  if (daysSinceStart < 28) return 200; // week 4
  return 300; // fully warmed
}
