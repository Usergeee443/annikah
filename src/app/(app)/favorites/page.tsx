import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import ListingCard from "@/components/ListingCard";

export default async function FavoritesPage() {
  const user = await requireUser();
  const now = new Date();

  const favorites = await db.favorite.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { listing: true },
    take: 200,
  });

  const items = favorites
    .map((f) => f.listing)
    .filter(
      (l) =>
        l &&
        l.active &&
        l.moderationStatus === "approved" &&
        l.expiresAt.getTime() > now.getTime(),
    );

  const listingIds = items.map((l) => l.id);
  const [viewsAgg, likesAgg] = listingIds.length
    ? await Promise.all([
        db.listingView.groupBy({
          by: ["listingId"],
          where: { listingId: { in: listingIds } },
          _count: { _all: true },
        }),
        db.favorite.groupBy({
          by: ["listingId"],
          where: { listingId: { in: listingIds } },
          _count: { _all: true },
        }),
      ])
    : [[], []];
  const viewsById = new Map<string, number>(viewsAgg.map((x) => [x.listingId, x._count._all]));
  const likesById = new Map<string, number>(likesAgg.map((x) => [x.listingId, x._count._all]));

  return (
    <div className="grid gap-5">
      {items.length === 0 ? (
        <div className="flex min-h-[calc(100dvh-10rem)] items-center justify-center text-center">
          <div>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-rose-50 ring-1 ring-rose-200">
              <svg viewBox="0 0 24 24" className="h-7 w-7 text-rose-600" fill="none">
                <path
                  d="M12 21s-7-4.35-9.5-9A5.5 5.5 0 0 1 12 6.5 5.5 5.5 0 0 1 21.5 12c-2.5 4.65-9.5 9-9.5 9z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                />
              </svg>
            </div>
            <div className="mt-4 text-[16px] font-black tracking-tight text-zinc-950">
              Sevimlilar bo‘sh
            </div>
            <div className="mt-1 text-[13px] font-medium text-zinc-600">
              Yurakcha bosib saqlagan e’lonlaringiz shu yerda chiqadi.
            </div>
            <Link
              href="/"
              className="mt-6 inline-flex h-10 items-center justify-center rounded-2xl bg-zinc-950 px-5 text-[12px] font-extrabold text-white ring-1 ring-black/10 hover:bg-zinc-900"
            >
              E’lonlarga o‘tish
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-zinc-950 sm:text-[28px]">
              Sevimlilar
            </h1>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((l) => (
              <ListingCard
                key={l.id}
                l={{
                  id: l.id,
                  name: l.name,
                  age: l.age,
                  heightCm: l.heightCm,
                  weightKg: l.weightKg,
                  region: l.region,
                  city: l.city,
                  country: l.country,
                  nationality: l.nationality,
                  category: l.category,
                  jobTitle: l.jobTitle,
                  prayer: l.prayer,
                  maritalStatus: l.maritalStatus,
                  boostUntil: l.boostUntil,
                  createdAt: l.createdAt,
                }}
                isFav={true}
                authed={true}
                viewsCount={viewsById.get(l.id) ?? 0}
                likesCount={likesById.get(l.id) ?? 0}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
