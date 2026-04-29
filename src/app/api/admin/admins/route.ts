import { NextResponse } from "next/server";
import { createAdminUser, getAdminSession } from "@/lib/adminAuth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "ADMIN_AUTH_REQUIRED" }, { status: 401 });

  const admins = await db.adminUser.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, username: true, role: true, createdAt: true },
  });
  return NextResponse.json({ ok: true, admins });
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "ADMIN_AUTH_REQUIRED" }, { status: 401 });
  if (session.role !== "super") {
    return NextResponse.json({ error: "ADMIN_SUPER_REQUIRED" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const username = String(body?.username || "").trim();
  const password = String(body?.password || "");
  const role = body?.role === "super" ? "super" : "admin";

  if (!username) return NextResponse.json({ error: "BAD_USERNAME" }, { status: 400 });
  if (password.length < 6) return NextResponse.json({ error: "WEAK_PASSWORD" }, { status: 400 });

  const exists = await db.adminUser.findUnique({ where: { username } });
  if (exists) return NextResponse.json({ error: "USERNAME_TAKEN" }, { status: 409 });

  const created = await createAdminUser({ username, password, role });
  return NextResponse.json({ ok: true, admin: created });
}
