import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdminAuthed } from "@/lib/adminAuth";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const ok = await isAdminAuthed();
  if (!ok) return NextResponse.json({ error: "ADMIN_AUTH_REQUIRED" }, { status: 401 });

  const { id } = await ctx.params;
  await db.supportThread.update({ where: { id }, data: { status: "closed" } }).catch(() => null);
  return NextResponse.json({ ok: true });
}

