// ============================================================
// StarSource — AI outreach message drafting
//
// Writes a short, honest cold email on the client's behalf. The system
// prompt is deliberately strict about not fabricating specifics about the
// lead beyond what's actually known — a hallucinated "I saw your recent
// award" is worse than no personalization at all.
// ============================================================
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { logApiUsage } from "./api-usage-store";
import { opus5Cost } from "./pricing";
import type { HotLead, NicheConfig } from "./types";

const DraftSchema = z.object({
  subject: z.string().describe("Short, plain subject line. No clickbait, no ALL CAPS, no excessive punctuation."),
  bodyHtml: z
    .string()
    .describe("2-4 short paragraphs as plain <p> tags. No inline styles, no signature block, no unsubscribe text."),
});

const SYSTEM_PROMPT = `You write cold B2B outreach emails on behalf of a client, addressed to a prospect the client wants as a customer.

Rules:
- Write in the client's voice, first person plural ("we"), pitching the client's own offer.
- Use ONLY the facts given about the prospect below. Never invent specifics you weren't given — no fabricated compliments about their website, no invented recent news, no made-up shared connections. If you don't have a personal detail, personalize with what you do have (their industry, their location, or their business type) instead of guessing.
- Keep the body to 60-120 words, 2-4 short paragraphs.
- One clear, low-friction call to action. If a booking link is provided below, the CTA IS that link — e.g. "<a href=\"LINK\">grab 15 minutes here</a>" — so the prospect can book directly instead of having to reply first. If no link is provided, ask if they'd be open to a short call instead.
- Plain, professional tone. No exclamation points, no hype words ("amazing", "revolutionary"), no fake urgency or scarcity.
- Do not include a signature block, company footer, or unsubscribe line — those are added separately.
- Output valid HTML paragraphs only (<p>...</p>), no markdown, no inline CSS.`;

function buildUserPrompt(lead: HotLead, niche: NicheConfig): string {
  const facts = [
    `Prospect company: ${lead.company}`,
    lead.address ? `Prospect location: ${lead.address}` : undefined,
    `Prospect industry/niche: ${niche.industry}`,
    lead.website ? `Prospect website: ${lead.website}` : undefined,
  ]
    .filter(Boolean)
    .join("\n");

  const booking = niche.calendlyLink
    ? `Booking link (use as the CTA): ${niche.calendlyLink}`
    : "No booking link configured — ask if they'd be open to a short call instead.";

  return `Write a cold outreach email.

Client (sender): ${niche.clientName}
What the client offers: ${niche.clientOffer}
${booking}

What we know about the prospect:
${facts}

Write the email now.`;
}

export async function draftOutreachEmail(lead: HotLead, niche: NicheConfig): Promise<{ subject: string; bodyHtml: string }> {
  const client = new Anthropic();

  const response = await client.messages.parse({
    model: "claude-opus-5",
    max_tokens: 16000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildUserPrompt(lead, niche) }],
    output_config: { format: zodOutputFormat(DraftSchema) },
  });

  logApiUsage({
    service: "anthropic",
    operation: "outreach_draft",
    estimatedCostUsd: opus5Cost(response.usage.input_tokens, response.usage.output_tokens),
    costBasis: "measured",
  });

  if (!response.parsed_output) {
    throw new Error("Claude did not return a parseable draft.");
  }
  return response.parsed_output;
}
