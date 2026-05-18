import { NextResponse } from "next/server";
import { randomToken } from "@/lib/crypto";
import { db } from "@/lib/db";
import { getTelegramBotToken, getTelegramBotUsername } from "@/lib/telegram";

/** Ro‘yxatdan o‘tish uchun Telegram sessiyasi (deep link `reg_<token>`). */
export async function POST() {
  try {
    const username = getTelegramBotUsername();
    const tokenOk = Boolean(getTelegramBotToken());
    if (!username || !tokenOk) {
      return NextResponse.json(
        { ok: false, error: "Telegram bot hozircha sozlanmagan (TELEGRAM_BOT_TOKEN / TELEGRAM_BOT_USERNAME)." },
        { status: 503 },
      );
    }

    const linkToken = randomToken(18);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    await db.telegramRegisterSession.create({
      data: { linkToken, expiresAt, step: "new" },
    });

    const startPayload = `reg_${linkToken}`;
    const deepLink = `https://t.me/${username}?start=${startPayload}`;

    return NextResponse.json({ ok: true, deepLink, startPayload });
  } catch (e) {
    console.error("[telegram/session]", e);
    const detail = e instanceof Error ? e.message : "Xatolik";
    return NextResponse.json(
      {
        ok: false,
        error:
          process.env.NODE_ENV === "development"
            ? detail
            : "Sessiya yaratilmadi. Loyihada `npx prisma db push` qilinganini va serverni qayta ishga tushirganingizni tekshiring.",
      },
      { status: 500 },
    );
  }
}
