import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/adminAuth";
import { db } from "@/lib/db";

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "ADMIN_AUTH_REQUIRED" }, { status: 401 });
  if (session.role !== "super_admin") {
    return NextResponse.json({ error: "ADMIN_SUPER_REQUIRED" }, { status: 403 });
  }
  const { id } = await ctx.params;
  if (!id) return NextResponse.json({ error: "BAD_ID" }, { status: 400 });
  if (session.id === id) {
    return NextResponse.json({ error: "CANNOT_DELETE_SELF" }, { status: 400 });
  }

  const found = await db.adminUser.findUnique({ where: { id }, select: { id: true } });
  if (!found) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  await db.adminUser.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
