import { NextResponse } from "next/server";
import { appBaseUrl, getTelegramBotToken } from "@/lib/telegram";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Bir marta webhookni Telegramga yozish.
 * Xavfsizlik: faqat `TELEGRAM_SETUP_SECRET` .env da bo‘lsa va so‘rovda `x-telegram-setup` shu qiymatga teng bo‘lsa.
 */
export async function POST(req: Request) {
  const setup = process.env.TELEGRAM_SETUP_SECRET?.trim();
  if (!setup) {
    return NextResponse.json(
      {
        ok: false,
        error:
          ".env da TELEGRAM_SETUP_SECRET yo‘q. Qo‘shing yoki qo‘lda: https://api.telegram.org/bot<TOKEN>/setWebhook?url=<HTTPS_URL>",
      },
      { status: 501 },
    );
  }
  if (req.headers.get("x-telegram-setup") !== setup) {
    return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });
  }

  const token = getTelegramBotToken();
  if (!token) {
    return NextResponse.json({ ok: false, error: "TELEGRAM_BOT_TOKEN yo‘q" }, { status: 503 });
  }

  const body = await req.json().catch(() => ({}));
  const baseOverride = typeof body?.baseUrl === "string" ? body.baseUrl.trim().replace(/\/$/, "") : "";
  const base = baseOverride || appBaseUrl();
  if (!/^https:\/\//i.test(base)) {
    return NextResponse.json(
      {
        ok: false,
        error: "Webhook faqat HTTPS bo‘lishi kerak. NEXT_PUBLIC_APP_URL ni https://... qiling yoki body.baseUrl yuboring.",
        base,
      },
      { status: 400 },
    );
  }

  const webhookUrl = `${base}/api/telegram/webhook`;
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();

  const params = new URLSearchParams();
  params.set("url", webhookUrl);
  if (secret) params.set("secret_token", secret);

  const url = `https://api.telegram.org/bot${token}/setWebhook?${params.toString()}`;
  const r = await fetch(url, { method: "POST" });
  const data = (await r.json().catch(() => ({}))) as { ok?: boolean; description?: string };

  if (!r.ok || !data.ok) {
    return NextResponse.json(
      { ok: false, error: data.description || r.statusText, webhookUrl },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    webhookUrl,
    secretSent: Boolean(secret),
    description: data.description,
  });
}
