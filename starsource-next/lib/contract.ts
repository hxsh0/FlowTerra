// ============================================================
// StarSource — contract drafting
//
// Generates a FIRST-DRAFT service agreement between a StarSource client
// and a customer they closed. This is explicitly not legal advice and
// not a finished document — it's a reasonable starting point with
// placeholders where deal-specific or jurisdiction-specific legal input
// is required.
//
// The disclaimer is appended by code, never left to the model — the same
// pattern as the unsubscribe footer on outreach emails. It must never be
// possible to get a draft back without it.
// ============================================================
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { logApiUsage } from "./api-usage-store";
import { opus5Cost } from "./pricing";
import type { ContractDraftRequest } from "./types";

const ContractSchema = z.object({
  title: z.string().describe('Short document title, e.g. "Service Agreement — [Provider] and [Customer]"'),
  bodyHtml: z
    .string()
    .describe(
      "The contract body as semantic HTML (h2 for section headings, p for prose, ol/li for numbered clauses). " +
        "Standard sections: Parties & Effective Date, Scope of Services, Fees & Payment Terms, Term & Termination, " +
        "Confidentiality, Limitation of Liability, Independent Contractor Relationship, Governing Law, Signatures. " +
        "Use bracketed placeholders like [GOVERNING STATE/PROVINCE] or [LIABILITY CAP AMOUNT] for anything not " +
        "given in the deal description — never invent specific legal terms, dollar figures, or dates that weren't provided."
    ),
});

const SYSTEM_PROMPT = `You draft first-draft B2B service agreements between two named businesses, based on a plain-language deal description.

Rules:
- This is a STARTING DRAFT for a human (ideally with a lawyer) to review and finish — not a finished, ready-to-sign document.
- Use standard, commonly-seen contract language and structure. Don't be creative or unusual — boring and conventional is correct here.
- Only include specific terms (prices, dates, durations, liability caps, governing jurisdiction) that were actually given in the deal description. Where something contracts normally specify but wasn't given, insert a clear bracketed placeholder like [PAYMENT DUE DATE] rather than inventing a value.
- Do not include your own disclaimer, warning, or "consult a lawyer" text anywhere in the output — that is added separately, outside your output, exactly once.
- Do not claim to be a lawyer or that this constitutes legal advice.
- Output semantic HTML only: h2 section headings, p paragraphs, ol/li for numbered terms where natural. No markdown, no inline styles, no signature images — a plain "Signed: ___" line per party is enough.`;

function buildUserPrompt(input: ContractDraftRequest): string {
  return `Draft a service agreement.

Provider (Party A): ${input.providerName}
Provider address: ${input.providerAddress}

Customer (Party B): ${input.customerName}
Customer address: ${input.customerAddress}

Deal description (use only what's stated here for specific terms):
${input.dealDescription}

Draft the agreement now.`;
}

export async function draftContract(input: ContractDraftRequest): Promise<{ title: string; bodyHtml: string }> {
  const client = new Anthropic();

  const response = await client.messages.parse({
    model: "claude-opus-5",
    max_tokens: 16000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildUserPrompt(input) }],
    output_config: { format: zodOutputFormat(ContractSchema) },
  });

  logApiUsage({
    service: "anthropic",
    operation: "contract_draft",
    estimatedCostUsd: opus5Cost(response.usage.input_tokens, response.usage.output_tokens),
    costBasis: "measured",
  });

  if (!response.parsed_output) {
    throw new Error("Claude did not return a parseable contract draft.");
  }
  return response.parsed_output;
}

/** The one non-negotiable part of this feature — always appended, never model-generated. */
export const CONTRACT_DISCLAIMER_HTML = `<div class="contract-disclaimer">
  <strong>This is an AI-generated first draft, not legal advice and not a finished document.</strong>
  It was produced from the deal description you provided and standard contract language — it has not
  been reviewed by a lawyer, may be missing terms specific to your situation or jurisdiction, and should
  not be sent to anyone or signed until a licensed attorney in your jurisdiction has reviewed it.
</div>`;
