import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
  const { id } = await ctx.params;

  const chat = await db.chat.findUnique({ where: { id } });
  if (!chat || (chat.userAId !== user.id && chat.userBId !== user.id)) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  if (chat.endedAt) {
    return NextResponse.json({ ok: true, alreadyEnded: true });
  }
  await db.chat.update({ where: { id }, data: { endedAt: new Date() } });
  return NextResponse.json({ ok: true });
}
