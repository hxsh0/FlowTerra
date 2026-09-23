import { NextResponse } from "next/server";
import { createSessionToken, isAllowedEmail, SESSION_COOKIE, verifyMagicLinkToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  const origin = url.origin;

  const result = token ? verifyMagicLinkToken(token) : null;
  if (!result || !isAllowedEmail(result.email)) {
    return NextResponse.redirect(`${origin}/login?error=expired`);
  }

  const res = NextResponse.redirect(`${origin}/dashboard`);
  res.cookies.set(SESSION_COOKIE, createSessionToken(result.email), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });
  return res;
}
