// ============================================================
// StarSource — Discovery (Google Places sourcing + ICP scoring)
//
// Shared by the authenticated Discovery agent (app/api/discovery) and
// the public free-market-scan demo (app/api/scan) — same real pipeline,
// different callers.
// ============================================================
import { evaluateAllChannels } from "@/lib/consent";
import { logApiUsage } from "@/lib/api-usage-store";
import { PLACES_ENTERPRISE_PER_CALL_ESTIMATE } from "@/lib/pricing";
import { scoreCandidate, type ScoreCandidate } from "@/lib/scoring";
import type { HotLead, NicheConfig } from "@/lib/types";

const PLACES_SEARCH_URL = "https://places.googleapis.com/v1/places:searchText";
const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.location",
  "places.rating",
  "places.userRatingCount",
  "places.websiteUri",
  "places.nationalPhoneNumber",
  "places.businessStatus",
  "places.types",
].join(",");

interface PlaceResult {
  id: string;
  displayName?: { text: string };
  formattedAddress?: string;
  location?: { latitude: number; longitude: number };
  rating?: number;
  userRatingCount?: number;
  websiteUri?: string;
  nationalPhoneNumber?: string;
  businessStatus?: string;
  types?: string[];
}

async function searchPlaces(niche: NicheConfig, apiKey: string): Promise<PlaceResult[]> {
  const res = await fetch(PLACES_SEARCH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": FIELD_MASK,
    },
    body: JSON.stringify({
      textQuery: `${niche.industry} in ${niche.location}`,
      maxResultCount: 20,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Google Places request failed (${res.status}): ${body.slice(0, 300)}`);
  }

  // Only successful calls are billed — a 403/failed request costs nothing.
  logApiUsage({
    service: "google_places",
    operation: "text_search",
    estimatedCostUsd: PLACES_ENTERPRISE_PER_CALL_ESTIMATE,
    costBasis: "estimated",
  });

  const data = await res.json();
  return (data.places ?? []) as PlaceResult[];
}

function placeToLead(place: PlaceResult, niche: NicheConfig): HotLead {
  const candidate: ScoreCandidate = {
    name: place.displayName?.text ?? "Unknown business",
    address: place.formattedAddress,
    types: place.types,
    rating: place.rating,
    reviewCount: place.userRatingCount,
    hasWebsite: Boolean(place.websiteUri),
    hasPhone: Boolean(place.nationalPhoneNumber),
  };

  const icpScore = scoreCandidate(candidate, niche.icpCriteria, niche.location, niche.industry);

  // Places gives us a business listing, not a named decision-maker, and
  // has no notion of legal entity type — both default to the most
  // conservative values until an enrichment step (e.g. Probe) fills them in.
  const channelEligibility = evaluateAllChannels({
    jurisdiction: niche.jurisdiction,
    contactSource: "public_business_listing",
    businessStructure: "unknown",
  });

  return {
    id: `places-${place.id}`,
    company: candidate.name,
    icpScore,
    source: "places",
    stage: "Scored",
    status: "active",
    address: place.formattedAddress,
    website: place.websiteUri,
    phone: place.nationalPhoneNumber,
    lat: place.location?.latitude,
    lng: place.location?.longitude,
    rating: place.rating,
    reviewCount: place.userRatingCount,
    contactSource: "public_business_listing",
    businessStructure: "unknown",
    channelEligibility,
  };
}

/** Runs a real Places search + ICP scoring pass, sorted best-fit first. */
export async function runDiscovery(niche: NicheConfig, apiKey: string): Promise<HotLead[]> {
  const places = await searchPlaces(niche, apiKey);
  return places.map((p) => placeToLead(p, niche)).sort((a, b) => b.icpScore - a.icpScore);
}
