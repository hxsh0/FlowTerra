import { NextResponse } from "next/server";
import { DEFAULT_ICP_CRITERIA } from "@/lib/data";
import { runDiscovery } from "@/lib/discovery";
import { hasUsedFreeScan, recordScan } from "@/lib/scan-store";
import type { NicheConfig, ScanRequest, ScanResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

const TEASER_SIZE = 5;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let body: ScanRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = body.email?.trim();
  const industry = body.industry?.trim();
  const location = body.location?.trim();

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }
  if (!industry || !location) {
    return NextResponse.json({ error: "Industry and location are required." }, { status: 400 });
  }

  if (hasUsedFreeScan(email)) {
    return NextResponse.json(
      { error: `${email} has already used its free market scan.` },
      { status: 429 }
    );
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GOOGLE_PLACES_API_KEY is not configured on the server." },
      { status: 500 }
    );
  }

  const niche: NicheConfig = {
    industry,
    location,
    radiusKm: 50,
    jurisdiction: "US",
    icpCriteria: DEFAULT_ICP_CRITERIA,
    clientName: "",
    clientOffer: "",
  };

  try {
    const leads = await runDiscovery(niche, apiKey);
    recordScan({ email, industry, location, ranAt: new Date().toISOString() });

    const response: ScanResponse = { leads: leads.slice(0, TEASER_SIZE), totalFound: leads.length };
    return NextResponse.json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Scan failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
