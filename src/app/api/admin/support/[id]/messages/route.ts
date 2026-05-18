import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/adminAuth";

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "ADMIN_AUTH_REQUIRED" }, { status: 401 });
  if (session.role !== "super_admin") {
    return NextResponse.json({ error: "ADMIN_SUPER_REQUIRED" }, { status: 403 });
  }

  const { id } = await ctx.params;
  const url = new URL(req.url);
  const take = Math.max(1, Math.min(500, Number(url.searchParams.get("take") || 200)));

  const thread = await db.supportThread.findUnique({ where: { id } });
  if (!thread) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  const messages = await db.supportMessage.findMany({
    where: { threadId: id },
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

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "ADMIN_AUTH_REQUIRED" }, { status: 401 });
  if (session.role !== "super_admin") {
    return NextResponse.json({ error: "ADMIN_SUPER_REQUIRED" }, { status: 403 });
  }

  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const text = String(body?.body || "").trim();
  if (!text) return NextResponse.json({ error: "EMPTY" }, { status: 400 });
  if (text.length > 4000) return NextResponse.json({ error: "TOO_LONG" }, { status: 400 });

  const thread = await db.supportThread.findUnique({ where: { id }, select: { id: true } });
  if (!thread) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  const msg = await db.supportMessage.create({
    data: { threadId: id, sender: "admin", body: text },
    select: { id: true, sender: true, body: true, createdAt: true },
  });

  await db.supportThread.update({ where: { id }, data: { status: "open" } });

  return NextResponse.json({ ok: true, message: { ...msg, createdAt: msg.createdAt.toISOString() } });
}

