// ============================================================
// StarSource — shared data
// ============================================================

export const DEFAULT_ICP_CRITERIA = [
  { id: "size", label: "Business size", weight: 20 },
  { id: "location", label: "Location fit", weight: 20 },
  { id: "reviews", label: "Review volume", weight: 15 },
  { id: "presence", label: "Online presence", weight: 15 },
  { id: "industry", label: "Industry relevance", weight: 20 },
  { id: "contact", label: "Contact availability", weight: 10 },
];

export const DEFAULT_NICHE = {
  industry: "",
  location: "",
  radiusKm: 50,
  jurisdiction: "US" as const,
  icpCriteria: DEFAULT_ICP_CRITERIA,
  clientName: "Your company",
  clientOffer: "Describe what you offer prospects in a sentence or two — this is what drafted emails will pitch.",
};

export const icpWeightSum = (criteria: { weight: number }[]) =>
  criteria.reduce((n, c) => n + c.weight, 0);

/** Curated B2B-serving-B2B industries — searchable suggestions for the niche field, not a restricted list. */
export const B2B_INDUSTRIES: { sector: string; industries: string[] }[] = [
  {
    sector: "Professional & Legal Services",
    industries: [
      "corporate law firms",
      "commercial litigation law firms",
      "intellectual property law firms",
      "corporate immigration law firms",
      "management consulting firms",
      "HR consulting firms",
      "business valuation firms",
    ],
  },
  {
    sector: "Marketing & Creative Services",
    industries: [
      "advertising agencies",
      "digital marketing agencies",
      "branding agencies",
      "corporate video production companies",
      "commercial photographers",
      "public relations firms",
      "web design agencies",
      "commercial signage companies",
    ],
  },
  {
    sector: "IT & Technology Services",
    industries: [
      "managed IT services companies",
      "IT support companies",
      "cybersecurity companies",
      "software development companies",
      "IT consulting firms",
      "VoIP phone system providers",
      "structured cabling companies",
    ],
  },
  {
    sector: "Facilities & Commercial Services",
    industries: [
      "commercial cleaning companies",
      "commercial HVAC contractors",
      "commercial landscaping companies",
      "commercial pest control companies",
      "commercial electricians",
      "commercial plumbing companies",
      "commercial security system installers",
      "commercial locksmiths",
    ],
  },
  {
    sector: "Logistics & Supply Chain",
    industries: [
      "freight brokers",
      "commercial trucking companies",
      "third-party logistics companies",
      "warehousing companies",
      "customs brokers",
      "fleet management companies",
      "industrial packaging suppliers",
    ],
  },
  {
    sector: "Financial & Insurance Services",
    industries: [
      "commercial insurance brokers",
      "employee benefits brokers",
      "business accounting firms",
      "payroll service companies",
      "business loan brokers",
      "equipment leasing companies",
      "invoice factoring companies",
    ],
  },
  {
    sector: "Real Estate & Construction Services",
    industries: [
      "commercial real estate agencies",
      "commercial general contractors",
      "commercial architecture firms",
      "commercial property management companies",
      "commercial roofing contractors",
      "commercial moving companies",
      "office furniture suppliers",
      "commercial interior design firms",
    ],
  },
  {
    sector: "Staffing & Industrial Support Services",
    industries: [
      "staffing agencies",
      "executive search firms",
      "employee background screening companies",
      "corporate training companies",
      "PEO companies",
      "industrial equipment suppliers",
      "commercial printing companies",
      "commercial uniform and linen services",
    ],
  },
];
