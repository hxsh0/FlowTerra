import { NextResponse } from "next/server";
import { appBaseUrl, outreachFromEmail } from "@/lib/app-url";
import { createMagicLinkToken, isAllowedEmail } from "@/lib/auth";
import { sendEmailViaResend } from "@/lib/email";

export const dynamic = "force-dynamic";

const GENERIC_MESSAGE = "If that email has access, a sign-in link is on its way.";

export async function POST(req: Request) {
  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = body.email?.trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }

  // Always return the same response whether or not the email is allowed —
  // don't let this endpoint be used to enumerate valid client accounts.
  if (!isAllowedEmail(email)) {
    return NextResponse.json({ message: GENERIC_MESSAGE });
  }

  let fromEmail: string;
  let baseUrl: string;
  try {
    fromEmail = outreachFromEmail();
    baseUrl = appBaseUrl(req);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Email is not configured on the server.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  try {
    const token = createMagicLinkToken(email);
    const link = `${baseUrl}/api/auth/verify?token=${encodeURIComponent(token)}`;
    await sendEmailViaResend({
      to: email,
      from: fromEmail,
      subject: "Your StarSource sign-in link",
      html: `<p>Click below to sign in. This link expires in 15 minutes.</p><p><a href="${link}">Sign in to StarSource</a></p>`,
    });
    return NextResponse.json({ message: GENERIC_MESSAGE });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send sign-in link";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
