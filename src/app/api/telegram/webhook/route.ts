import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth";
import { randomToken } from "@/lib/crypto";
import { db } from "@/lib/db";
import {
  appBaseUrl,
  getTelegramBotToken,
  normalizePhoneDigits,
  sendTelegramText,
} from "@/lib/telegram";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function replyTelegram(chatId: string, text: string, opts?: { replyMarkup?: Record<string, unknown> }) {
  const r = await sendTelegramText(chatId, text, opts);
  if (!r.ok) {
    console.error("[telegram/webhook] sendMessage xato:", chatId, r.error);
  }
}

const CONTACT_KEYBOARD = {
  keyboard: [[{ text: "Telefon raqamini yuborish", request_contact: true }]],
  resize_keyboard: true,
  one_time_keyboard: true,
};

function verifyWebhookSecret(req: Request) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
  if (!secret) return true;
  return req.headers.get("x-telegram-bot-api-secret-token") === secret;
}

/** Brauzerdan tekshirish: webhook qanday sozlangan, xato bormi. */
export async function GET() {
  const token = getTelegramBotToken();
  const base = appBaseUrl();
  const webhookUrl = `${base}/api/telegram/webhook`;
  if (!token) {
    return NextResponse.json(
      {
        ok: false,
        error: "TELEGRAM_BOT_TOKEN .env da yo‘q.",
        webhookUrl,
      },
      { status: 503 },
    );
  }
  let telegramInfo: unknown = null;
  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
    telegramInfo = await r.json();
  } catch (e) {
    telegramInfo = { error: e instanceof Error ? e.message : "getWebhookInfo xato" };
  }
  return NextResponse.json({
    ok: true,
    baseUrl: base,
    webhookUrl,
    hasWebhookSecret: Boolean(process.env.TELEGRAM_WEBHOOK_SECRET?.trim()),
    telegram: telegramInfo,
    uzbek:
      "Bot /start ga javob bermasa: Telegram sizning kompyuteringizdagi localhost ga ulanmaydi. " +
      "Internetdan ochiq HTTPS domen kerak (masalan Vercel, yoki ngrok / cloudflared tunnel). " +
      "Keyin `getWebhookInfo` dagi `url` shu webhookUrl bilan bir xil bo‘lishi va `last_error_message` bo‘sh bo‘lishi kerak. " +
      "Webhookni `POST /api/telegram/set-webhook` (yoki qo‘lda Telegram setWebhook API) bilan qo‘ying.",
  });
}

function parseStartPayload(text: string | undefined) {
  if (!text) return null;
  const m = /^\/start(?:\s+(\S+))?$/.exec(text.trim());
  const arg = m?.[1]?.trim();
  if (!arg?.startsWith("reg_")) return null;
  return arg.slice(4);
}

export async function POST(req: Request) {
  if (!getTelegramBotToken()) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }
  if (!verifyWebhookSecret(req)) {
    const hasHeader = Boolean(req.headers.get("x-telegram-bot-api-secret-token"));
    console.warn(
      "[telegram/webhook] 401: secret mos emas. Telegram sarlavhasi X-Telegram-Bot-Api-Secret-Token:",
      hasHeader ? "bor (qiymat noto‘g‘ri)" : "YO‘Q",
      "— .env da TELEGRAM_WEBHOOK_SECRET bo‘lsa, setWebhook URL ga &secret_token=... qo‘shilgan bo‘lishi kerak. Aks holda .env dan TELEGRAM_WEBHOOK_SECRET ni olib tashlang va webhookni qayta qo‘ying.",
    );
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const raw = await req.text();
  if (!raw.trim()) {
    console.warn("[telegram/webhook] Bo‘sh body");
    return NextResponse.json({ ok: true });
  }

  let update: Record<string, unknown>;
  try {
    update = JSON.parse(raw) as Record<string, unknown>;
  } catch (e) {
    const looksHtml = raw.trimStart().startsWith("<");
    console.error(
      "[telegram/webhook] JSON emas:",
      looksHtml ? "ehtimol ngrok/HTML (tunnel yoki port noto‘g‘ri)." : "format xato",
      e,
    );
    return NextResponse.json({ ok: true });
  }

  console.info("[telegram/webhook] update_id", update.update_id, "kalitlar:", Object.keys(update).join(","));

  const message = update.message as Record<string, unknown> | undefined;
  if (!message || typeof message !== "object") {
    console.info("[telegram/webhook] `message` yo‘q — /start odatda `message` ichida keladi.");
    return NextResponse.json({ ok: true });
  }

  const chat = message.chat as { id?: number } | undefined;
  const from = message.from as { id?: number } | undefined;
  const chatId = chat?.id != null ? String(chat.id) : null;
  const fromId = from?.id != null ? String(from.id) : null;

  if (!chatId || !fromId) {
    console.warn("[telegram/webhook] chat.id yoki from.id yo‘q", { chatId, fromId });
    return NextResponse.json({ ok: true });
  }

  try {
    await handleMessage(message as TelegramMessageShape, chatId, fromId);
  } catch (e) {
    console.error("[telegram/webhook] handleMessage:", e);
  }

  return NextResponse.json({ ok: true });
}

type TelegramMessageShape = {
  message_id?: number;
  text?: string;
  contact?: { phone_number?: string; user_id?: number };
};

async function handleMessage(msg: TelegramMessageShape, chatId: string, fromId: string) {
  const text = typeof msg.text === "string" ? msg.text : undefined;

  if (text && /^\/start/i.test(text.trim())) {
    const linkToken = parseStartPayload(text);
    if (!linkToken) {
      await replyTelegram(
        chatId,
        "Annikah: ro‘yxatdan o‘tish uchun saytdagi «Telegram orqali kirish» tugmasidan botga kiring.",
      );
      return;
    }

    const session = await db.telegramRegisterSession.findFirst({
      where: { linkToken, expiresAt: { gt: new Date() }, step: { in: ["new", "await_contact", "await_password"] } },
    });
    if (!session) {
      await replyTelegram(chatId, "Bu havola eskirgan yoki noto‘g‘ri. Saytdan qayta urinib ko‘ring.");
      return;
    }

    const existing = await db.user.findUnique({ where: { telegramId: fromId } });
    if (existing) {
      await replyTelegram(
        chatId,
        "Bu Telegram hisobi allaqachon ro‘yxatdan o‘tgan. Saytda telefon raqamingiz va parolingiz bilan kiring.",
      );
      return;
    }

    await db.telegramRegisterSession.update({
      where: { id: session.id },
      data: { telegramChatId: chatId, step: "await_contact" },
    });

    await replyTelegram(
      chatId,
      "Assalomu alaykum! Telefon raqamingizni pastdagi tugma orqali yuboring (faqat o‘z kontaktingiz).",
      { replyMarkup: CONTACT_KEYBOARD },
    );
    return;
  }

  if (msg.contact?.phone_number) {
    const session = await db.telegramRegisterSession.findFirst({
      where: {
        telegramChatId: chatId,
        step: "await_contact",
        expiresAt: { gt: new Date() },
      },
    });
    if (!session) return;

    if (msg.contact.user_id !== undefined && String(msg.contact.user_id) !== fromId) {
      await replyTelegram(chatId, "Faqat o‘zingizning kontaktingizni yuboring.");
      return;
    }

    const phone = normalizePhoneDigits(msg.contact.phone_number);
    if (phone.length < 9) {
      await replyTelegram(chatId, "Telefon raqam noto‘g‘ri. Qaytadan yuboring.", { replyMarkup: CONTACT_KEYBOARD });
      return;
    }

    const taken = await db.user.findUnique({ where: { phone } });
    if (taken) {
      await replyTelegram(
        chatId,
        "Bu telefon raqam boshqa hisobda ro‘yxatdan o‘tgan. Boshqa raqam yoki saytdagi kirishdan foydalaning.",
        { replyMarkup: { remove_keyboard: true } },
      );
      return;
    }

    await db.telegramRegisterSession.update({
      where: { id: session.id },
      data: { phone, step: "await_password" },
    });

    await replyTelegram(
      chatId,
      "Endi saytga kirish uchun parol o‘ylab toping (kamida 6 belgi) va shu yerga yozing. Parolni eslab qoling — keyin shu raqam va parol bilan ham kirasiz.",
      { replyMarkup: { remove_keyboard: true } },
    );
    return;
  }

  if (text && text.trim().startsWith("/")) {
    return;
  }

  const pwdSession = await db.telegramRegisterSession.findFirst({
    where: {
      telegramChatId: chatId,
      step: "await_password",
      expiresAt: { gt: new Date() },
    },
  });
  if (!pwdSession || !pwdSession.phone) return;

  const password = (text || "").trim();
  if (password.length < 6) {
    await replyTelegram(chatId, "Parol kamida 6 belgi bo‘lishi kerak.");
    return;
  }

  const existingTg = await db.user.findUnique({ where: { telegramId: fromId } });
  if (existingTg) {
    await replyTelegram(chatId, "Hisob allaqachon yaratilgan.");
    await db.telegramRegisterSession.deleteMany({ where: { id: pwdSession.id } });
    return;
  }

  const email = `tg_${fromId}@telegram.annikah.app`;
  const passwordHash = await hashPassword(password);
  const user = await db.user.create({
    data: {
      email,
      passwordHash,
      phone: pwdSession.phone,
      telegramId: fromId,
      authProvider: "telegram",
    },
  });

  await db.telegramRegisterSession.delete({ where: { id: pwdSession.id } });

  const code = randomToken(20);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  await db.telegramLoginCode.create({
    data: { code, userId: user.id, expiresAt },
  });

  const loginUrl = `${appBaseUrl()}/api/auth/telegram/complete?code=${code}`;

  await replyTelegram(
    chatId,
    [
      "Ro‘yxatdan o‘tish yakunlandi. Siz tasdiqlangan foydalanuvhisiz.",
      "",
      `Saytga kirish: ${loginUrl}`,
      "",
      `Keyinchalik kirish: telefon ${pwdSession.phone} va siz tanlagan parol.`,
      "",
      "Push xabarlar: yangi chat xabarlari, so‘rovlar va boshqa xabarnomalar shu bot orqali yuboriladi.",
    ].join("\n"),
  );
}
