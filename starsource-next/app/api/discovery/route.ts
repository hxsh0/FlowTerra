import { NextResponse } from "next/server";
import { runDiscovery } from "@/lib/discovery";
import type { DiscoveryRequest, DiscoveryResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

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
    const leads = await runDiscovery(niche, apiKey);
    const response: DiscoveryResponse = { leads };
    return NextResponse.json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Discovery run failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
