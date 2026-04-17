import { NextResponse } from "next/server";

import { AUTH_COOKIE, shouldUseSecureAuthCookie } from "@/lib/auth";

function clearAuthCookie(response: NextResponse, request: Request) {
  response.cookies.set(AUTH_COOKIE, "", {
    httpOnly: true,
    secure: shouldUseSecureAuthCookie(request),
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0)
  });
}

export async function POST(request: Request) {
  const response = NextResponse.json({ ok: true });
  clearAuthCookie(response, request);
  return response;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const redirectTo = url.searchParams.get("redirect") || "/";
  const response = NextResponse.redirect(new URL(redirectTo, url.origin));
  clearAuthCookie(response, request);
  return response;
}
