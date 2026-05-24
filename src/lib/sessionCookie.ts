import { NextResponse } from "next/server";
import { SESSION_COOKIE, sessionCookieOptions, verifySignedToken } from "@/lib/auth";

export function setSessionCookie(res: NextResponse, signed: string, expiresAt: Date) {
  res.cookies.set(SESSION_COOKIE, signed, sessionCookieOptions(expiresAt));
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set(SESSION_COOKIE, "", { ...sessionCookieOptions(new Date(0)), maxAge: 0 });
}

export function isSessionCookieValid(signed: string | undefined) {
  if (!signed) return false;
  return Boolean(verifySignedToken(signed));
}
