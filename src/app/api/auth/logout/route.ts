import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";
import { clearSessionCookie } from "@/lib/sessionCookie";

export async function POST() {
  await destroySession();
  const res = NextResponse.json({ ok: true });
  clearSessionCookie(res);
  return res;
}

