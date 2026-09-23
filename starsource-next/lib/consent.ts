// ============================================================
// StarSource — outreach consent / eligibility engine
//
// Decides, per lead and per channel, whether automated outreach is
// allowed and why. This is a simplified rules engine based on general
// public guidance for CASL (Canada), PECR + UK GDPR (UK), and
// CAN-SPAM/TCPA (US) as of 2026 — it is NOT legal advice. Get a lawyer
// to review this before relying on it for fully automated, unreviewed
// sends across these markets.
//
// Design principle: fail closed. Where the data we have doesn't clearly
// establish a lawful basis, the channel is marked ineligible rather than
// assumed safe.
// ============================================================
import type {
  BusinessStructure,
  Channel,
  ChannelEligibility,
  ContactSource,
  Jurisdiction,
} from "./types";

export interface ConsentInput {
  jurisdiction: Jurisdiction;
  contactSource: ContactSource;
  businessStructure: BusinessStructure;
  /** Required for CASL's implied-consent-by-role test; unset = not confirmed. */
  roleRelevant?: boolean;
  /** ISO date of the underlying event (contract signed, inquiry made, opt-in given). */
  consentDate?: string;
  /** Injectable for tests; defaults to now. */
  now?: Date;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const TWO_YEARS_MS = 2 * 365 * DAY_MS;
const SIX_MONTHS_MS = 182 * DAY_MS;

function withinWindow(consentDate: string | undefined, windowMs: number, now: Date): boolean {
  if (!consentDate) return false;
  const t = new Date(consentDate).getTime();
  if (Number.isNaN(t)) return false;
  return now.getTime() - t <= windowMs;
}

function expiryOf(consentDate: string | undefined, windowMs: number): string | undefined {
  if (!consentDate) return undefined;
  const t = new Date(consentDate).getTime();
  if (Number.isNaN(t)) return undefined;
  return new Date(t + windowMs).toISOString();
}

function evaluateUS(channel: Channel, input: ConsentInput): ChannelEligibility {
  if (channel === "email") {
    return {
      channel,
      eligible: true,
      basis: "CAN-SPAM: prior consent not required for commercial email; accurate sender ID and a working opt-out are required.",
      requiresOptOutMechanism: true,
    };
  }

  // sms and voice (automated/marketing): TCPA generally requires prior
  // express consent. Manual, non-autodialed live calls have more legal
  // nuance than this model captures — treat as needing the same consent
  // bar until reviewed by counsel.
  const hasOptIn = input.contactSource === "explicit_optin";
  return {
    channel,
    eligible: hasOptIn,
    basis: hasOptIn
      ? "TCPA: prior express consent on file."
      : "TCPA: prior express consent required for automated SMS/voice — none on file for this contact.",
    requiresOptOutMechanism: true,
  };
}

function evaluateCA(channel: Channel, input: ConsentInput, now: Date): ChannelEligibility {
  if (channel === "voice") {
    // CASL only covers commercial *electronic messages* (email, SMS, IM) —
    // calls fall under Canada's separate National DNCL rules, not modeled
    // here. Fail closed until that's built.
    return {
      channel,
      eligible: false,
      basis: "CASL doesn't cover voice calls — that's Canada's National DNCL regime, not implemented here. Blocked until reviewed.",
      requiresOptOutMechanism: true,
    };
  }

  // email and sms are both CEMs under CASL.
  if (input.contactSource === "explicit_optin") {
    return {
      channel,
      eligible: true,
      basis: "CASL: express consent on file.",
      requiresOptOutMechanism: true,
    };
  }

  if (input.contactSource === "prior_customer" && withinWindow(input.consentDate, TWO_YEARS_MS, now)) {
    return {
      channel,
      eligible: true,
      basis: "CASL: implied consent from existing business relationship (expires 2 years from contract).",
      requiresOptOutMechanism: true,
      expiresAt: expiryOf(input.consentDate, TWO_YEARS_MS),
    };
  }

  if (input.contactSource === "prior_inquiry" && withinWindow(input.consentDate, SIX_MONTHS_MS, now)) {
    return {
      channel,
      eligible: true,
      basis: "CASL: implied consent from a recent inquiry (expires 6 months from the inquiry).",
      requiresOptOutMechanism: true,
      expiresAt: expiryOf(input.consentDate, SIX_MONTHS_MS),
    };
  }

  if (input.contactSource === "named_individual_public" && input.roleRelevant) {
    return {
      channel,
      eligible: true,
      basis: "CASL: implied consent — contact info conspicuously published, no opt-out notice, and the message is relevant to this person's role.",
      requiresOptOutMechanism: true,
    };
  }

  return {
    channel,
    eligible: false,
    basis: "CASL: no implied or express consent basis established (needs a named, role-relevant contact; a recent inquiry; an active customer relationship; or opt-in).",
    requiresOptOutMechanism: true,
  };
}

function evaluateUK(channel: Channel, input: ConsentInput): ChannelEligibility {
  if (input.businessStructure === "company") {
    if (channel === "voice") {
      // PECR covers marketing calls too; the corporate-subscriber carve-out
      // is less clean-cut for calls than for email/SMS. Fail closed.
      return {
        channel,
        eligible: false,
        basis: "PECR covers marketing calls with rules distinct from email/SMS (and TPS registration matters) — not modeled here. Blocked until reviewed.",
        requiresOptOutMechanism: true,
      };
    }
    return {
      channel,
      eligible: true,
      basis: "PECR: corporate-subscriber exemption applies — no prior consent required for email/SMS to a company address. UK GDPR legitimate interest is the lawful basis for processing the contact data.",
      requiresOptOutMechanism: true,
    };
  }

  // Sole traders / partnerships / unknown structure are treated as
  // individuals under PECR — same consent bar as consumer marketing.
  const hasBasis = input.contactSource === "explicit_optin" || input.contactSource === "prior_customer";
  return {
    channel,
    eligible: hasBasis,
    basis: hasBasis
      ? "PECR: treated as an individual subscriber (sole trader/partnership/unconfirmed) — consent or an existing customer relationship (soft opt-in) is on file."
      : "PECR: treated as an individual subscriber (sole trader/partnership/unconfirmed) — no consent or soft opt-in basis established.",
    requiresOptOutMechanism: true,
  };
}

export function evaluateChannel(channel: Channel, input: ConsentInput): ChannelEligibility {
  const now = input.now ?? new Date();
  switch (input.jurisdiction) {
    case "US":
      return evaluateUS(channel, input);
    case "CA":
      return evaluateCA(channel, input, now);
    case "UK":
      return evaluateUK(channel, input);
  }
}

const ALL_CHANNELS: Channel[] = ["email", "sms", "voice"];

export function evaluateAllChannels(input: ConsentInput): ChannelEligibility[] {
  return ALL_CHANNELS.map((channel) => evaluateChannel(channel, input));
}
