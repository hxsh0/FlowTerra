/** Public origin used in magic-link and unsubscribe emails. */
export function appBaseUrl(req: Request): string {
  const origin = new URL(req.url).origin;
  const configured = process.env.APP_BASE_URL?.trim().replace(/\/$/, "");

  // On Vercel, never email localhost links even if APP_BASE_URL is still
  // the local-dev default from .env.local.
  if (process.env.VERCEL) {
    const prod = process.env.VERCEL_PROJECT_PRODUCTION_URL?.replace(/^https?:\/\//, "");
    if (prod) return `https://${prod}`;
    return origin;
  }

  return configured || origin;
}

export function outreachFromEmail(): string {
  const from = process.env.OUTREACH_FROM_EMAIL?.trim();
  if (!from) throw new Error("OUTREACH_FROM_EMAIL is not configured on the server.");
  return from;
}
