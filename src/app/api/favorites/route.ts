import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const listingId = String(body?.listingId || "");
  if (!listingId) {
    return NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 });
  }

  const listing = await db.listing.findUnique({ where: { id: listingId } });
  if (!listing) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const existing = await db.favorite.findUnique({
    where: { userId_listingId: { userId: user.id, listingId } },
  });

  if (existing) {
    await db.favorite.delete({
      where: { userId_listingId: { userId: user.id, listingId } },
    });
    return NextResponse.json({ favored: false });
  }

  await db.favorite.create({
    data: { userId: user.id, listingId },
  });
  return NextResponse.json({ favored: true });
}
