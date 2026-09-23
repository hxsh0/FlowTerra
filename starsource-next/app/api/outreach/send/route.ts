import { NextResponse } from "next/server";
import { evaluateChannel } from "@/lib/consent";
import { sendEmailViaResend, withUnsubscribeFooter } from "@/lib/email";
import { countSendsSince, isSuppressed, recordSend, sentToRecently } from "@/lib/outreach-store";
import { dailySendCap } from "@/lib/warmup";
import type { OutreachSendRequest, OutreachSendResult } from "@/lib/types";

export const dynamic = "force-dynamic";

function startOfToday(now: Date): Date {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function respond(result: OutreachSendResult, status: number) {
  return NextResponse.json(result, { status });
}

export async function POST(req: Request) {
  let body: OutreachSendRequest;
  try {
    body = await req.json();
  } catch {
    return respond({ status: "error", reason: "Invalid JSON body" }, 400);
  }

  const { lead, jurisdiction, subject, bodyHtml } = body;
  if (!lead || !jurisdiction || !subject || !bodyHtml) {
    return respond({ status: "error", reason: "lead, jurisdiction, subject, and bodyHtml are required" }, 400);
  }

  if (!lead.email) {
    return respond(
      { status: "missing_email", reason: "This lead has no email address on file — Discovery doesn't source one; needs an enrichment step first." },
      422
    );
  }

  // Re-validate consent server-side. Never trust a client-supplied
  // "eligible: true" flag as authorization to send.
  const eligibility = evaluateChannel("email", {
    jurisdiction,
    contactSource: lead.contactSource ?? "public_business_listing",
    businessStructure: lead.businessStructure ?? "unknown",
  });
  if (!eligibility.eligible) {
    return respond({ status: "blocked_consent", reason: eligibility.basis }, 403);
  }

  if (isSuppressed(lead.email)) {
    return respond({ status: "suppressed", reason: "This address opted out previously." }, 403);
  }

  if (sentToRecently(lead.email, 14)) {
    return respond({ status: "rate_limited", reason: "Already messaged this lead within the last 14 days." }, 429);
  }

  const warmupStart = process.env.OUTREACH_WARMUP_START_DATE
    ? new Date(process.env.OUTREACH_WARMUP_START_DATE)
    : new Date(); // no configured start = treat as day 0 (most conservative cap)
  const now = new Date();
  const cap = dailySendCap(warmupStart, now);
  const sentToday = countSendsSince(startOfToday(now));
  if (sentToday >= cap) {
    return respond(
      { status: "rate_limited", reason: `Daily warm-up cap reached (${sentToday}/${cap} sent today).` },
      429
    );
  }

  const fromEmail = process.env.OUTREACH_FROM_EMAIL;
  const baseUrl = process.env.APP_BASE_URL;
  if (!fromEmail || !baseUrl) {
    return respond(
      { status: "error", reason: "OUTREACH_FROM_EMAIL and APP_BASE_URL must be configured on the server." },
      500
    );
  }

  const html = withUnsubscribeFooter(bodyHtml, lead.email, baseUrl);

  try {
    const result = await sendEmailViaResend({
      to: lead.email,
      from: fromEmail,
      subject,
      html,
      replyTo: process.env.REPLY_TO_EMAIL,
    });
    recordSend({
      email: lead.email,
      leadId: lead.id,
      company: lead.company,
      subject,
      sentAt: now.toISOString(),
      providerId: result.id,
    });
    return respond({ status: "sent", reason: "Sent.", providerId: result.id }, 200);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Send failed";
    return respond({ status: "error", reason: message }, 502);
  }
}
