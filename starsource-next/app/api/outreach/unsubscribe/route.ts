import { NextResponse } from "next/server";
import { verifyUnsubscribeSignature } from "@/lib/email";
import { suppress } from "@/lib/outreach-store";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const email = url.searchParams.get("email");
  const sig = url.searchParams.get("sig");

  if (!email || !sig) {
    return new NextResponse("Missing email or signature.", { status: 400 });
  }

  if (!verifyUnsubscribeSignature(email, sig)) {
    return new NextResponse("Invalid or tampered unsubscribe link.", { status: 400 });
  }

  suppress(email, "recipient unsubscribe link");

  return new NextResponse(
    `<!doctype html><html><body style="font-family:sans-serif;padding:40px;text-align:center;">
      <p>${email} has been unsubscribed and won't be contacted again.</p>
    </body></html>`,
    { status: 200, headers: { "Content-Type": "text/html" } }
  );
}
