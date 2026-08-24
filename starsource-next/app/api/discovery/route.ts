import { NextResponse } from "next/server";
import { scoreCandidate, type ScoreCandidate } from "@/lib/scoring";
import type { DiscoveryRequest, DiscoveryResponse, HotLead, NicheConfig } from "@/lib/types";

export const dynamic = "force-dynamic";

const PLACES_SEARCH_URL = "https://places.googleapis.com/v1/places:searchText";
const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
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
    rating: place.rating,
    reviewCount: place.userRatingCount,
  };
}

export async function POST(req: Request) {
  let body: DiscoveryRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { niche, source } = body;
  if (!niche?.industry || !niche?.location || !Array.isArray(niche?.icpCriteria)) {
    return NextResponse.json({ error: "niche.industry, niche.location, and niche.icpCriteria are required" }, { status: 400 });
  }

  if (source === "scraper") {
    return NextResponse.json(
      { error: "Web scraper fallback isn't wired up yet — use Google Places for now." },
      { status: 501 }
    );
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GOOGLE_PLACES_API_KEY is not configured on the server. Add it to .env.local and restart the dev server." },
      { status: 400 }
    );
  }

  try {
    const places = await searchPlaces(niche, apiKey);
    const leads = places
      .map((p) => placeToLead(p, niche))
      .sort((a, b) => b.icpScore - a.icpScore);

    const response: DiscoveryResponse = { leads };
    return NextResponse.json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Discovery run failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
