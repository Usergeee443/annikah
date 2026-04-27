import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import ListingCard from "@/components/ListingCard";

export default async function AdsPage() {
  const user = await requireUser();
  const now = new Date();

  const listings = await db.listing.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const activeBoost = listings.filter((l) => l.boostUntil && l.boostUntil > now);
  const faolListings = listings.filter(
    (l) => l.active && l.moderationStatus === "approved" && l.expiresAt.getTime() > now.getTime(),
  );
  const sorted = [...faolListings].sort((a, b) => {
    const ab = a.boostUntil && a.boostUntil > now ? 1 : 0;
    const bb = b.boostUntil && b.boostUntil > now ? 1 : 0;
    return bb - ab;
  });

  return (
    <div className="grid gap-6">
      <h1 className="text-[22px] font-black tracking-tight text-zinc-950 sm:text-[26px]">Reklama</h1>

      {listings.length === 0 ? (
        <div className="flex min-h-[calc(100dvh-10rem)] flex-col items-center justify-center text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-amber-50 ring-1 ring-amber-200">
            <svg viewBox="0 0 24 24" className="h-7 w-7 text-amber-700" fill="none">
              <path
                d="M12 2c1 4 6 5 6 11a6 6 0 1 1-12 0c0-3 1.5-4 3-5 1.5-1 2-3 3-6z"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="mt-4 text-[16px] font-black tracking-tight text-zinc-950">Reklamingiz yo‘q</div>
          <p className="mt-1 max-w-sm text-[13px] font-medium text-zinc-600">
            Boost uchun avval e’lon bo‘lishi kerak.
          </p>
          <Link
            href="/reklama"
            className="mt-6 inline-flex h-10 items-center justify-center rounded-2xl bg-zinc-950 px-6 text-[12px] font-extrabold text-white ring-1 ring-black/10 hover:bg-zinc-900"
          >
            Reklama berish
          </Link>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="max-w-xl text-[13px] font-medium text-zinc-600">
                Faol reklamada e’lonlarda <span className="font-extrabold text-zinc-900">“Top”</span> belgisi
                ko‘rinadi. Reklama tugamaguncha shu e’longa qayta boost qo‘yib bo‘lmaydi.
              </p>
              {activeBoost.length > 0 ? (
                <p className="mt-1 text-[12px] font-semibold text-emerald-700">
                  Faol reklama: {activeBoost.length} ta
                </p>
              ) : null}
            </div>
            <Link
              href="/reklama"
              className="inline-flex h-10 shrink-0 items-center justify-center rounded-2xl bg-zinc-950 px-5 text-[12px] font-extrabold text-white ring-1 ring-black/10 hover:bg-zinc-900"
            >
              Reklama berish
            </Link>
          </div>

          <div>
            <h2 className="mb-3 text-[12px] font-extrabold uppercase tracking-widest text-zinc-500">
              Faol reklamalaringiz
            </h2>
            {sorted.length === 0 ? (
              <p className="text-[13px] font-medium text-zinc-600">
                Hozircha faol (tasdiqlangan va muddati tugamagan) e’lon yo‘q. Barcha e’lonlaringizni «E’lonlarim»
                bo‘limidan ko‘rishingiz mumkin.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {sorted.map((l) => (
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
                      category: l.category,
                      jobTitle: l.jobTitle,
                      prayer: l.prayer,
                      maritalStatus: l.maritalStatus,
                      boostUntil: l.boostUntil,
                      createdAt: l.createdAt,
                    }}
                    isFav={false}
                    authed
                    hideFavorite
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
