import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/adminAuth";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "ADMIN_AUTH_REQUIRED" }, { status: 401 });
  if (session.role !== "super_admin") {
    return NextResponse.json({ error: "ADMIN_SUPER_REQUIRED" }, { status: 403 });
  }

  const { id } = await ctx.params;
  await db.supportThread.update({ where: { id }, data: { status: "closed" } }).catch(() => null);
  return NextResponse.json({ ok: true });
}

