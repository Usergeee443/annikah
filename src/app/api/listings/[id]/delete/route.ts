import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  const url = new URL(_req.url);
  if (!user) return NextResponse.redirect(new URL("/auth/login", url.origin));

  const { id } = await ctx.params;
  const listing = await db.listing.findUnique({ where: { id }, select: { ownerId: true } });
  if (!listing) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  if (listing.ownerId !== user.id) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  await db.listing.delete({ where: { id } });
  return NextResponse.redirect(new URL("/elonlarim", url.origin));
}

