import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { assertCanModerateListing } from "@/lib/adminAuth";
import { parseListingIdParam } from "@/lib/listingId";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: idRaw } = await params;
  const id = parseListingIdParam(idRaw);
  if (id === null) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

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
      moderationStatus: "approved",
      moderatedAt: new Date(),
      active: true,
    },
    select: { id: true },
  });

  return NextResponse.json({ ok: true, id: updated.id });
}

