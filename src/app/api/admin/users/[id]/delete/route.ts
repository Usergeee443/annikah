import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/adminAuth";
import { db } from "@/lib/db";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "ADMIN_AUTH_REQUIRED" }, { status: 401 });
  if (session.role !== "super_admin") {
    return NextResponse.json({ error: "ADMIN_SUPER_REQUIRED" }, { status: 403 });
  }

  const { id } = await ctx.params;
  if (!id) return NextResponse.json({ error: "BAD_ID" }, { status: 400 });

  const found = await db.user.findUnique({ where: { id }, select: { id: true } });
  if (!found) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  // onDelete: Cascade qoidalari listings, sessions, profile, favorites, requests, chats,
  // messages, supportThread va boshqalarni avtomatik tozalaydi.
  await db.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
