import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdminAuthed } from "@/lib/adminAuth";

export async function GET(req: Request) {
  const ok = await isAdminAuthed();
  if (!ok) return NextResponse.json({ error: "ADMIN_AUTH_REQUIRED" }, { status: 401 });

  const url = new URL(req.url);
  const status = url.searchParams.get("status") || "open";
  const q = (url.searchParams.get("q") || "").trim().toLowerCase();

  const threads = await db.supportThread.findMany({
    where: { status: status === "closed" ? "closed" : "open" },
    orderBy: { updatedAt: "desc" },
    include: {
      user: { select: { id: true, email: true, profile: { select: { name: true } } } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    take: 200,
  });

  const filtered = q
    ? threads.filter((t) => {
        const name = (t.user.profile?.name || "").toLowerCase();
        const email = (t.user.email || "").toLowerCase();
        const last = (t.messages[0]?.body || "").toLowerCase();
        return name.includes(q) || email.includes(q) || last.includes(q);
      })
    : threads;

  return NextResponse.json({
    ok: true,
    threads: filtered.map((t) => ({
      id: t.id,
      userId: t.userId,
      status: t.status,
      updatedAt: t.updatedAt.toISOString(),
      userName: t.user.profile?.name || null,
      userEmail: t.user.email,
      lastMessage: t.messages[0]?.body || null,
      lastAt: t.messages[0]?.createdAt ? t.messages[0].createdAt.toISOString() : null,
    })),
  });
}

