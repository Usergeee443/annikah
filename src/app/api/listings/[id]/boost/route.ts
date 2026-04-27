import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
  const { id } = await ctx.params;

  const body = await req.json().catch(() => ({}));
  const days = Math.max(1, Math.min(60, Number(body?.days || 7)));

  const listing = await db.listing.findUnique({ where: { id } });
  if (!listing) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  if (listing.ownerId !== user.id) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const now = new Date();
  if (listing.boostUntil && listing.boostUntil > now) {
    return NextResponse.json(
      {
        error: "BOOST_ACTIVE",
        message: "Reklama (boost) hali tugamagan. Tugaguncha qayta reklama qilib bo‘lmaydi.",
      },
      { status: 409 },
    );
  }

  const boostUntil = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  const updated = await db.listing.update({
    where: { id },
    data: {
      boostUntil,
      boostScore: Math.max(15, (listing.boostScore || 0) + days),
    },
    select: { id: true, boostUntil: true, boostScore: true },
  });
  return NextResponse.json({ ok: true, listing: updated });
}
