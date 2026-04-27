import { db } from "@/lib/db";

export function getTelegramBotToken() {
  return (process.env.TELEGRAM_BOT_TOKEN || "").trim();
}

export function getTelegramBotUsername() {
  return (process.env.TELEGRAM_BOT_USERNAME || "").replace(/^@/, "").trim();
}

export function appBaseUrl() {
  const fromEnv = (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://127.0.0.1:3000";
}

export function normalizePhoneDigits(input: string) {
  return input.replace(/\D/g, "");
}

type SendOpts = {
  replyMarkup?: Record<string, unknown>;
};

export async function sendTelegramText(chatId: string, text: string, opts?: SendOpts) {
  const token = getTelegramBotToken();
  if (!token) return { ok: false as const, error: "NO_TOKEN" };
  const body: Record<string, unknown> = { chat_id: chatId, text };
  if (opts?.replyMarkup) body.reply_markup = opts.replyMarkup;
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    return { ok: false as const, error: errText || res.statusText };
  }
  return { ok: true as const };
}

export async function notifyUserTelegram(userId: string, text: string) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { telegramId: true },
    });
    if (!user?.telegramId) return;
    await sendTelegramText(user.telegramId, text);
  } catch {
    // bildirishnoma muvaffaqiyatsiz bo‘lsa asosiy oqimni buzmaymiz
  }
}
