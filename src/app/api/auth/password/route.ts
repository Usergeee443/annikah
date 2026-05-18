import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, hashPassword, verifyPassword } from "@/lib/auth";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const currentPassword = String(body?.currentPassword || "");
  const newPassword = String(body?.newPassword || "");

  if (newPassword.length < 6) {
    return NextResponse.json({ error: "PASSWORD_TOO_SHORT" }, { status: 400 });
  }

  const u = await db.user.findUnique({ where: { id: user.id }, select: { passwordHash: true } });
  if (!u?.passwordHash) return NextResponse.json({ error: "NO_PASSWORD_SET" }, { status: 400 });

  const ok = await verifyPassword(currentPassword, u.passwordHash);
  if (!ok) return NextResponse.json({ error: "BAD_PASSWORD" }, { status: 400 });

  const passwordHash = await hashPassword(newPassword);
  await db.user.update({ where: { id: user.id }, data: { passwordHash } });

  return NextResponse.json({ ok: true });
}

