import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const origin = new URL(req.url).origin;
  const res = NextResponse.redirect(`${origin}/`);
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
