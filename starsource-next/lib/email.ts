// ============================================================
// StarSource — email sending (Resend) + unsubscribe link signing
// ============================================================
import { createHmac, timingSafeEqual } from "node:crypto";
import { logApiUsage } from "./api-usage-store";

const RESEND_URL = "https://api.resend.com/emails";

export interface SendEmailInput {
  to: string;
  from: string;
  subject: string;
  html: string;
  /** Where replies should actually land — the sending address/domain may not be monitored. */
  replyTo?: string;
}

export interface SendEmailResult {
  id: string;
}

export async function sendEmailViaResend(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured on the server.");

  const res = await fetch(RESEND_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: input.from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      ...(input.replyTo ? { reply_to: input.replyTo } : {}),
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    let detail = body.slice(0, 300);
    try {
      const parsed = JSON.parse(body) as { message?: string; name?: string };
      if (parsed.message) detail = parsed.message;
    } catch {
      // keep raw body
    }
    throw new Error(`Resend request failed (${res.status}): ${detail}`);
  }

  // $0 while under Resend's free-tier volume — flagged as an estimate since
  // the actual rate depends on which plan/volume band the account is in.
  logApiUsage({ service: "resend", operation: "send", estimatedCostUsd: 0, costBasis: "estimated" });

  const data = await res.json();
  return { id: data.id };
}

function unsubscribeSecret(): string {
  const secret = process.env.UNSUBSCRIBE_SECRET;
  if (!secret) throw new Error("UNSUBSCRIBE_SECRET is not configured on the server.");
  return secret;
}

function sign(email: string): string {
  return createHmac("sha256", unsubscribeSecret()).update(email.trim().toLowerCase()).digest("hex");
}

export function buildUnsubscribeUrl(email: string, baseUrl: string): string {
  const sig = sign(email);
  const params = new URLSearchParams({ email, sig });
  return `${baseUrl}/api/outreach/unsubscribe?${params.toString()}`;
}

export function verifyUnsubscribeSignature(email: string, sig: string): boolean {
  const expected = sign(email);
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(sig, "hex");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** Every outreach send must include a working opt-out — this makes that structural, not optional. */
export function withUnsubscribeFooter(html: string, email: string, baseUrl: string): string {
  const url = buildUnsubscribeUrl(email, baseUrl);
  return `${html}\n<hr/>\n<p style="font-size:12px;color:#888;">Don't want to hear from us again? <a href="${url}">Unsubscribe</a>.</p>`;
}
