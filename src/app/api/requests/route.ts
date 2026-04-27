import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { appBaseUrl, notifyUserTelegram } from "@/lib/telegram";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
  }
  const profile = await db.profile.findUnique({ where: { userId: user.id } });
  if (!profile?.isComplete) {
    return NextResponse.json({ error: "PROFILE_INCOMPLETE" }, { status: 400 });
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
  if (listing.ownerId === user.id) {
    return NextResponse.json({ error: "OWN_LISTING" }, { status: 400 });
  }

  const existing = await db.request.findUnique({
    where: { listingId_fromUserId: { listingId, fromUserId: user.id } },
  });
  if (existing) {
    return NextResponse.json({ ok: true, requestId: existing.id, status: existing.status });
  }

  const created = await db.request.create({
    data: {
      listingId,
      fromUserId: user.id,
      toUserId: listing.ownerId,
      status: "pending",
    },
    select: { id: true, status: true },
  });

  const base = appBaseUrl();
  await notifyUserTelegram(
    listing.ownerId,
    `Annikah: yangi so‘rov. E’lon: ${listing.name}. Ko‘rish: ${base}/requests`,
  );

  return NextResponse.json({ ok: true, requestId: created.id, status: created.status });
}
