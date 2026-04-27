import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

function ymd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function lastNDays(n: number) {
  const out: Array<{ date: string; start: Date; end: Date }> = [];
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  for (let i = n - 1; i >= 0; i--) {
    const start = new Date(today);
    start.setDate(start.getDate() - i);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    out.push({ date: ymd(start), start, end });
  }
  return out;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requireUser();
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const listing = await db.listing.findUnique({ where: { id }, select: { id: true, ownerId: true } });
  if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (listing.ownerId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const [viewsUnique, favorites] = await Promise.all([
    db.listingView.count({ where: { listingId: id } }),
    db.favorite.count({ where: { listingId: id } }),
  ]);

  const windows = lastNDays(14);
  const since = windows[0]?.start ?? new Date(Date.now() - 14 * 86400000);

  const [viewsRows, favRows] = await Promise.all([
    db.listingView.findMany({
      where: { listingId: id, createdAt: { gte: since } },
      select: { createdAt: true },
      take: 5000,
    }),
    db.favorite.findMany({
      where: { listingId: id, createdAt: { gte: since } },
      select: { createdAt: true },
      take: 5000,
    }),
  ]);

  const views14d = windows.map((w) => ({
    date: w.date,
    count: viewsRows.filter((r) => r.createdAt >= w.start && r.createdAt < w.end).length,
  }));
  const favorites14d = windows.map((w) => ({
    date: w.date,
    count: favRows.filter((r) => r.createdAt >= w.start && r.createdAt < w.end).length,
  }));

  return NextResponse.json({ viewsUnique, favorites, views14d, favorites14d });
}

