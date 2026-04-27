import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { appBaseUrl, notifyUserTelegram } from "@/lib/telegram";

const FORBIDDEN_PATTERNS = [
  /\b\d{3}[\s-]?\d{2}[\s-]?\d{2}[\s-]?\d{2}\b/,
  /\b\+?\d[\d\s().-]{8,}\b/,
  /\b@[A-Za-z0-9_]{3,}\b/,
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
];

function isForbidden(text: string) {
  return FORBIDDEN_PATTERNS.some((re) => re.test(text));
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
  const { id } = await ctx.params;
  const chat = await db.chat.findUnique({ where: { id } });
  if (!chat || (chat.userAId !== user.id && chat.userBId !== user.id)) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const messages = await db.message.findMany({
    where: { chatId: id },
    orderBy: { createdAt: "asc" },
    take: 500,
  });
  return NextResponse.json({ messages });
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
  const { id } = await ctx.params;

  const chat = await db.chat.findUnique({ where: { id } });
  if (!chat || (chat.userAId !== user.id && chat.userBId !== user.id)) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  if (chat.endedAt) {
    return NextResponse.json({ error: "CHAT_ENDED" }, { status: 400 });
  }
  if (chat.endsAt.getTime() < Date.now()) {
    return NextResponse.json({ error: "CHAT_EXPIRED" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const text = String(body?.body || "").trim();
  if (!text) return NextResponse.json({ error: "EMPTY" }, { status: 400 });
  if (text.length > 2000) {
    return NextResponse.json({ error: "TOO_LONG" }, { status: 400 });
  }
  if (isForbidden(text)) {
    return NextResponse.json(
      {
        error: "FORBIDDEN_CONTENT",
        message:
          "Telefon raqami, email yoki tashqi link almashtirishga ruxsat yo‘q. Buni keyinroq, ikki tomon rozi bo‘lganda almashasiz.",
      },
      { status: 400 },
    );
  }

  const message = await db.message.create({
    data: { chatId: id, senderId: user.id, body: text },
  });

  const peerId = chat.userAId === user.id ? chat.userBId : chat.userAId;
  const preview = text.length > 120 ? `${text.slice(0, 120)}…` : text;
  const base = appBaseUrl();
  await notifyUserTelegram(peerId, `Annikah: yangi chat xabari.\n«${preview}»\n${base}/chats/${id}`);

  return NextResponse.json({ message });
}
