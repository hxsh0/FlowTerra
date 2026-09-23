import { NextResponse } from "next/server";
import { CONTRACT_DISCLAIMER_HTML, draftContract } from "@/lib/contract";
import type { ContractDraftRequest, ContractDraftResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: ContractDraftRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { providerName, providerAddress, customerName, customerAddress, dealDescription } = body;
  if (!providerName || !providerAddress || !customerName || !customerAddress || !dealDescription) {
    return NextResponse.json(
      { error: "providerName, providerAddress, customerName, customerAddress, and dealDescription are all required." },
      { status: 400 }
    );
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured on the server. Add it to .env.local and restart the dev server." },
      { status: 400 }
    );
  }

  try {
    const draft = await draftContract(body);
    // The disclaimer is structural, not optional — appended here regardless of what the model returned.
    const response: ContractDraftResponse = {
      title: draft.title,
      bodyHtml: `${CONTRACT_DISCLAIMER_HTML}\n${draft.bodyHtml}`,
    };
    return NextResponse.json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Contract drafting failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
