import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { appBaseUrl, notifyUserTelegram } from "@/lib/telegram";
import { CHAT_MEDIA_MAX_BYTES, saveChatMedia } from "@/lib/chatUpload";

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

  const contentType = (req.headers.get("content-type") || "").toLowerCase();
  const isMultipart = contentType.includes("multipart/form-data");

  let message:
    | { id: string; createdAt: Date; chatId: string; senderId: string; body: string | null; kind: string; mediaPath: string | null; mimeType: string | null; durationMs: number | null; sizeBytes: number | null }
    | null = null;

  if (!isMultipart) {
    const body = await req.json().catch(() => ({}));
    const text = String(body?.body || "").trim();
    if (!text) return NextResponse.json({ error: "EMPTY" }, { status: 400 });
    if (text.length > 2000) return NextResponse.json({ error: "TOO_LONG" }, { status: 400 });
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
    message = await db.message.create({
      data: { chatId: id, senderId: user.id, kind: "text", body: text },
    });
  } else {
    // image upload only (audio vaqtincha o‘chirilgan)
    const form = await req.formData().catch(() => null);
    if (!form) return NextResponse.json({ error: "BAD_FORM" }, { status: 400 });

    const kindRaw = String(form.get("kind") || "").toLowerCase();
    const kind = kindRaw === "image" ? "image" : null;
    if (!kind) return NextResponse.json({ error: "BAD_KIND" }, { status: 400 });

    const file = form.get("file");
    if (!(file instanceof File) || file.size < 16) {
      return NextResponse.json({ error: "FILE_REQUIRED" }, { status: 400 });
    }
    if (file.size > CHAT_MEDIA_MAX_BYTES) {
      return NextResponse.json({ error: "FILE_TOO_LARGE" }, { status: 400 });
    }

    message = await db.message.create({
      data: { chatId: id, senderId: user.id, kind, body: null },
    });

    try {
      const bytes = Buffer.from(await file.arrayBuffer());
      const saved = await saveChatMedia({
        chatId: id,
        messageId: message.id,
        kind,
        mimeType: (file.type || "").toLowerCase(),
        bytes,
      });
      message = await db.message.update({
        where: { id: message.id },
        data: {
          mediaPath: saved.rel,
          mimeType: (file.type || "").toLowerCase() || null,
          sizeBytes: file.size,
        },
      });
    } catch (e) {
      await db.message.delete({ where: { id: message.id } }).catch(() => null);
      const msg = e instanceof Error ? e.message : "";
      if (msg === "UNSUPPORTED_MEDIA_TYPE") {
        return NextResponse.json({ error: "UNSUPPORTED_MEDIA_TYPE" }, { status: 400 });
      }
      return NextResponse.json({ error: "UPLOAD_FAILED" }, { status: 400 });
    }
  }

  const peerId = chat.userAId === user.id ? chat.userBId : chat.userAId;
  const preview =
    message.kind === "image"
      ? "[Rasm]"
      : (message.body || "").length > 120
          ? `${(message.body || "").slice(0, 120)}…`
          : message.body || "";
  const base = appBaseUrl();
  await notifyUserTelegram(peerId, `Annikah: yangi chat xabari.\n«${preview}»\n${base}/chats/${id}`);

  return NextResponse.json({ message });
}
