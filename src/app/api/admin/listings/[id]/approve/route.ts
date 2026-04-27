import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/adminAuth";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Admin auth required" }, { status: 401 });
  }
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const updated = await db.listing.update({
    where: { id },
    data: {
      moderationStatus: "approved",
      moderatedAt: new Date(),
      active: true,
    },
    select: { id: true },
  });

  return NextResponse.json({ ok: true, id: updated.id });
}

