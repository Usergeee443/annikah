import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });

  const url = new URL(req.url);
  const take = Math.max(1, Math.min(300, Number(url.searchParams.get("take") || 120)));

  const thread = await db.supportThread.upsert({
    where: { userId: user.id },
    create: { userId: user.id, status: "open" },
    update: {},
    select: { id: true },
  });

  const messages = await db.supportMessage.findMany({
    where: { threadId: thread.id },
    orderBy: { createdAt: "asc" },
    take,
  });

  return NextResponse.json({
    ok: true,
    messages: messages.map((m) => ({
      id: m.id,
      body: m.body,
      sender: m.sender,
      createdAt: m.createdAt.toISOString(),
    })),
  });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const text = String(body?.body || "").trim();
  if (!text) return NextResponse.json({ error: "EMPTY" }, { status: 400 });
  if (text.length > 4000) return NextResponse.json({ error: "TOO_LONG" }, { status: 400 });

  const thread = await db.supportThread.upsert({
    where: { userId: user.id },
    create: { userId: user.id, status: "open" },
    update: { status: "open" },
    select: { id: true },
  });

  const msg = await db.supportMessage.create({
    data: { threadId: thread.id, sender: "user", body: text },
    select: { id: true, sender: true, body: true, createdAt: true },
  });

  return NextResponse.json({
    ok: true,
    message: { ...msg, createdAt: msg.createdAt.toISOString() },
  });
}

