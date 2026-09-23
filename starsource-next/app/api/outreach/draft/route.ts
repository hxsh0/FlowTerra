import { NextResponse } from "next/server";
import { draftOutreachEmail } from "@/lib/draft";
import type { OutreachDraftRequest, OutreachDraftResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: OutreachDraftRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { lead, niche } = body;
  if (!lead || !niche) {
    return NextResponse.json({ error: "lead and niche are required" }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured on the server. Add it to .env.local and restart the dev server." },
      { status: 400 }
    );
  }

  try {
    const draft = await draftOutreachEmail(lead, niche);
    const response: OutreachDraftResponse = draft;
    return NextResponse.json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Drafting failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
