import { NextResponse } from "next/server";
import { issueSession } from "@/lib/auth";
import { setSessionCookie } from "@/lib/sessionCookie";
import { db } from "@/lib/db";
import { appBaseUrl } from "@/lib/telegram";

/** Bir martalik kod bilan saytga kirish (bot yuborgan havola). */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code")?.trim();
  const base = appBaseUrl();
  const fail = (msg: string) => NextResponse.redirect(new URL(`/auth/login?error=${encodeURIComponent(msg)}`, base));

  if (!code) return fail("code");

  const row = await db.telegramLoginCode.findUnique({
    where: { code },
    include: { user: true },
  });
  if (!row || row.used || row.expiresAt.getTime() < Date.now()) {
    return fail("Kod eskirgan yoki allaqachon ishlatilgan.");
  }

  await db.telegramLoginCode.update({ where: { id: row.id }, data: { used: true } });
  const { signed, expiresAt } = await issueSession(row.userId);

  const res = NextResponse.redirect(new URL("/profile", base));
  setSessionCookie(res, signed, expiresAt);
  return res;
}
