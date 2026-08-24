// ============================================================
// StarSource — ICP scoring
//
// Scores a sourced candidate against the client's weighted ICP
// criteria. Each sub-score is 0-100 and derived from a real signal
// where the data source provides one. Google Places does not expose
// employee count / revenue, so "Business size" has no real signal
// yet and is scored neutrally until an enrichment source (Apollo,
// Clearbit, etc.) is wired into Agent 2 (Probe).
// ============================================================
import type { IcpCriterion } from "./types";

export interface ScoreCandidate {
  name: string;
  address?: string;
  types?: string[];
  rating?: number;
  reviewCount?: number;
  hasWebsite: boolean;
  hasPhone: boolean;
}

const NO_SIGNAL_SCORE = 50;

function subScore(criterionId: string, c: ScoreCandidate, locationQuery: string, industryQuery: string): number {
  switch (criterionId) {
    case "location": {
      if (!c.address) return NO_SIGNAL_SCORE;
      const needle = locationQuery.toLowerCase().split(",")[0].trim();
      return c.address.toLowerCase().includes(needle) ? 100 : 45;
    }
    case "reviews": {
      const n = c.reviewCount ?? 0;
      return Math.max(0, Math.min(100, Math.round((n / 200) * 100)));
    }
    case "presence": {
      return c.hasWebsite ? 100 : 20;
    }
    case "industry": {
      const needle = industryQuery.toLowerCase();
      const haystack = [c.name, ...(c.types ?? [])].join(" ").toLowerCase();
      const tokens = needle.split(/\s+/).filter((t) => t.length > 2);
      const hit = tokens.some((t) => haystack.includes(t));
      return hit ? 90 : 60;
    }
    case "contact": {
      return c.hasPhone ? 100 : 30;
    }
    case "size":
    default:
      return NO_SIGNAL_SCORE;
  }
}

/** Weighted ICP score, 0-100, rounded. `criteria` weights must sum to 100. */
export function scoreCandidate(
  candidate: ScoreCandidate,
  criteria: IcpCriterion[],
  locationQuery: string,
  industryQuery: string
): number {
  const total = criteria.reduce(
    (sum, c) => sum + (subScore(c.id, candidate, locationQuery, industryQuery) * c.weight) / 100,
    0
  );
  return Math.max(0, Math.min(100, Math.round(total)));
}
