import { NextResponse } from "next/server";
import { findEmailOnWebsite } from "@/lib/enrichment";
import type { EnrichRequest, EnrichResponse, HotLead } from "@/lib/types";

export const dynamic = "force-dynamic";

const CONCURRENCY = 5;

async function mapWithConcurrency<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

export async function POST(req: Request) {
  let body: EnrichRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!Array.isArray(body.leads)) {
    return NextResponse.json({ error: "leads[] is required" }, { status: 400 });
  }

  let found = 0;
  const attempted = body.leads.filter((l) => !l.email && l.website).length;

  const leads: HotLead[] = await mapWithConcurrency(body.leads, CONCURRENCY, async (lead) => {
    if (lead.email || !lead.website) return lead;
    const email = await findEmailOnWebsite(lead.website);
    if (email) found += 1;
    return email ? { ...lead, email } : lead;
  });

  const response: EnrichResponse = { leads, attempted, found };
  return NextResponse.json(response);
}
