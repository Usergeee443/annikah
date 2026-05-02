import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { assertCanModerateListing } from "@/lib/adminAuth";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  try {
    await assertCanModerateListing(id);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "ADMIN_AUTH_REQUIRED") {
      return NextResponse.json({ error: "Admin auth required" }, { status: 401 });
    }
    if (msg === "NOT_FOUND") return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await db.listing.update({
    where: { id },
    data: {
      moderationStatus: "rejected",
      moderatedAt: new Date(),
      active: false,
    },
    select: { id: true },
  });

  return NextResponse.json({ ok: true, id: updated.id });
}

