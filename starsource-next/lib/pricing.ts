// ============================================================
// StarSource — real per-unit pricing, used to estimate spend
//
// Anthropic costs are computed from actual token counts the API returns
// (measured). Google Places has no per-call cost in its response, so
// that one stays a labeled estimate based on the Enterprise-tier rate
// our field mask triggers (rating, review count, website, phone).
// ============================================================

// Claude Opus 5 — $5/1M input tokens, $25/1M output tokens.
export const OPUS_5_INPUT_PER_TOKEN = 5 / 1_000_000;
export const OPUS_5_OUTPUT_PER_TOKEN = 25 / 1_000_000;

export function opus5Cost(inputTokens: number, outputTokens: number): number {
  return inputTokens * OPUS_5_INPUT_PER_TOKEN + outputTokens * OPUS_5_OUTPUT_PER_TOKEN;
}

// Google Places Text Search, Enterprise tier (our field mask requires it) — ~$35/1,000 calls.
export const PLACES_ENTERPRISE_PER_CALL_ESTIMATE = 0.035;
