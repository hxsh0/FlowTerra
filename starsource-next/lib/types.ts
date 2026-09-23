// ============================================================
// StarSource — domain types
// ============================================================

export type LeadSource = "places" | "scraper";

// ---- Outreach consent / eligibility ----
// The market a discovery run targets. Each has a distinct cold-outreach
// compliance regime (CASL in Canada, PECR + UK GDPR in the UK, CAN-SPAM/TCPA
// in the US) — see lib/consent.ts for the actual rules.
export type Jurisdiction = "US" | "CA" | "UK";

export type Channel = "email" | "sms" | "voice";

/**
 * How we came to have this contact's info. The legal basis for outreach
 * depends heavily on this — a name+role found on a company's own site is
 * treated very differently from a bare business listing.
 */
export type ContactSource =
  | "public_business_listing" // e.g. a Google Places result — business-level, no named contact
  | "named_individual_public" // a specific person + role, publicly listed (e.g. "VP Sales" on their site)
  | "prior_customer"
  | "prior_inquiry"
  | "explicit_optin";

/** UK PECR treats corporate subscribers very differently from individuals. */
export type BusinessStructure = "company" | "sole_trader_or_partnership" | "unknown";

export interface ChannelEligibility {
  channel: Channel;
  eligible: boolean;
  /** Plain-language basis for the decision, or reason it's blocked. */
  basis: string;
  requiresOptOutMechanism: boolean;
  /** ISO date the eligibility lapses, if the underlying consent expires. */
  expiresAt?: string;
}

export interface HotLead {
  id: string;
  company: string;
  icpScore: number;
  source: LeadSource;
  stage: string;
  status: "active" | "won" | "nurture";
  /** Enrichment fields available for leads sourced from Google Places. */
  address?: string;
  lat?: number;
  lng?: number;
  website?: string;
  phone?: string;
  rating?: number;
  reviewCount?: number;
  /**
   * Not populated by Discovery today — Google Places has no email field.
   * Needs an enrichment step (e.g. a contact-finder) before Outreach can
   * actually send anything to a Places-sourced lead.
   */
  email?: string;
  /** Consent/eligibility inputs and the computed per-channel result. */
  contactSource?: ContactSource;
  businessStructure?: BusinessStructure;
  channelEligibility?: ChannelEligibility[];
}

// ---- Outreach sending ----
export interface OutreachSendRequest {
  lead: HotLead;
  jurisdiction: Jurisdiction;
  subject: string;
  bodyHtml: string;
}

export type OutreachSendStatus = "sent" | "blocked_consent" | "suppressed" | "rate_limited" | "missing_email" | "error";

export interface OutreachSendResult {
  status: OutreachSendStatus;
  reason: string;
  providerId?: string;
}

export interface OutreachDraftRequest {
  lead: HotLead;
  niche: NicheConfig;
}

export interface OutreachDraftResponse {
  subject: string;
  bodyHtml: string;
}

export interface IcpCriterion {
  id: string;
  label: string;
  weight: number;
}

export interface NicheConfig {
  industry: string;
  location: string;
  radiusKm: number;
  jurisdiction: Jurisdiction;
  icpCriteria: IcpCriterion[];
  /** The paying client's own business name — outreach is sent on their behalf. */
  clientName: string;
  /** What the client actually offers/sells — the pitch a drafted email needs to make. */
  clientOffer: string;
  /** The client's public Calendly scheduling link, e.g. https://calendly.com/their-business/intro-call */
  calendlyLink?: string;
}

export interface DiscoveryRequest {
  niche: NicheConfig;
  source: LeadSource;
}

export interface DiscoveryResponse {
  leads: HotLead[];
}

export interface EnrichRequest {
  leads: HotLead[];
}

export interface EnrichResponse {
  leads: HotLead[];
  attempted: number;
  found: number;
}

export interface ScanRequest {
  email: string;
  industry: string;
  location: string;
}

export interface ScanResponse {
  leads: HotLead[];
  totalFound: number;
}

// ---- Contract drafting ----
// A first-draft generator for the service agreement between a StarSource
// client and a customer they closed — never auto-sent, never treated as
// final. See lib/contract.ts for the non-negotiable disclaimer.
export interface ContractDraftRequest {
  providerName: string;
  providerAddress: string;
  customerName: string;
  customerAddress: string;
  /** Plain-language deal description — scope, price, payment terms, length, etc. */
  dealDescription: string;
}

export interface ContractDraftResponse {
  title: string;
  bodyHtml: string;
}

// ---- Admin usage monitoring ----
export interface ApiUsageSummary {
  calls: number;
  estimatedCostUsd: number;
}

export interface AdminUsageResponse {
  summary: {
    google_places: ApiUsageSummary;
    anthropic: ApiUsageSummary;
    resend: ApiUsageSummary;
  };
  totalEstimatedCostUsd: number;
  recent: {
    service: string;
    operation: string;
    at: string;
    estimatedCostUsd: number;
    costBasis: "measured" | "estimated";
  }[];
}
