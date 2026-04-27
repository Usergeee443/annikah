import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth";
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
  await createSession(row.userId);

  return NextResponse.redirect(new URL("/profile", base));
}
