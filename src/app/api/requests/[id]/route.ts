import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { appBaseUrl, notifyUserTelegram } from "@/lib/telegram";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const action = String(body?.action || "");
  if (!["accept", "reject", "cancel", "end_connection"].includes(action)) {
    return NextResponse.json({ error: "BAD_ACTION" }, { status: 400 });
  }

  const reqRow = await db.request.findUnique({ where: { id }, include: { chat: true } });
  if (!reqRow) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  if (action === "cancel") {
    if (reqRow.fromUserId !== user.id) {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }
    if (reqRow.status === "pending") {
      await db.request.update({ where: { id }, data: { status: "cancelled" } });
      return NextResponse.json({ ok: true, status: "cancelled" });
    }
    if (reqRow.status === "accepted") {
      const chat = reqRow.chat ?? (await db.chat.findUnique({ where: { requestId: id } }));
      if (chat && !chat.endedAt) {
        await db.chat.update({ where: { id: chat.id }, data: { endedAt: new Date() } });
      }
      await db.request.update({ where: { id }, data: { status: "cancelled" } });
      return NextResponse.json({ ok: true, status: "cancelled" });
    }
    return NextResponse.json({ error: "ALREADY_DECIDED" }, { status: 400 });
  }

  if (action === "end_connection") {
    if (reqRow.toUserId !== user.id) {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }
    if (reqRow.status !== "accepted") {
      return NextResponse.json({ error: "BAD_STATE" }, { status: 400 });
    }
    const chat = reqRow.chat ?? (await db.chat.findUnique({ where: { requestId: id } }));
    if (!chat) {
      return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }
    if (!chat.endedAt) {
      await db.chat.update({ where: { id: chat.id }, data: { endedAt: new Date() } });
    }
    await db.request.update({ where: { id }, data: { status: "cancelled" } });
    return NextResponse.json({ ok: true, status: "cancelled" });
  }

  if (reqRow.toUserId !== user.id) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  if (reqRow.status !== "pending") {
    return NextResponse.json({ error: "ALREADY_DECIDED" }, { status: 400 });
  }

  if (action === "reject") {
    await db.request.update({ where: { id }, data: { status: "rejected" } });
    return NextResponse.json({ ok: true, status: "rejected" });
  }

  const endsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const chat = await db.chat.create({
    data: {
      requestId: reqRow.id,
      userAId: reqRow.fromUserId,
      userBId: reqRow.toUserId,
      endsAt,
    },
    select: { id: true },
  });
  await db.request.update({ where: { id }, data: { status: "accepted" } });

  const base = appBaseUrl();
  await notifyUserTelegram(
    reqRow.fromUserId,
    `Annikah: so‘rovingiz qabul qilindi. Chatga o‘ting: ${base}/chats/${chat.id}`,
  );

  return NextResponse.json({ ok: true, status: "accepted", chatId: chat.id });
}
