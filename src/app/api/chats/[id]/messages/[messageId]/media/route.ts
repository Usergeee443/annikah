import { readFile } from "fs/promises";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { mediaAbsPath } from "@/lib/chatUpload";

export const runtime = "nodejs";

function guessMime(rel: string) {
  if (rel.endsWith(".png")) return "image/png";
  if (rel.endsWith(".webp")) return "image/webp";
  if (rel.endsWith(".jpg") || rel.endsWith(".jpeg")) return "image/jpeg";
  if (rel.endsWith(".ogg")) return "audio/ogg";
  if (rel.endsWith(".mp3")) return "audio/mpeg";
  if (rel.endsWith(".m4a")) return "audio/mp4";
  return "application/octet-stream";
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string; messageId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const { id: chatId, messageId } = await ctx.params;
  if (!chatId || !messageId) return new NextResponse("Bad request", { status: 400 });

  const chat = await db.chat.findUnique({ where: { id: chatId }, select: { userAId: true, userBId: true } });
  if (!chat || (chat.userAId !== user.id && chat.userBId !== user.id)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const msg = await db.message.findUnique({
    where: { id: messageId },
    select: { id: true, chatId: true, mediaPath: true, mimeType: true },
  });
  if (!msg || msg.chatId !== chatId || !msg.mediaPath) return new NextResponse("Not found", { status: 404 });

  try {
    const abs = mediaAbsPath(msg.mediaPath);
    const buf = await readFile(abs);
    return new NextResponse(buf, {
      headers: {
        "Content-Type": msg.mimeType || guessMime(msg.mediaPath),
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}

