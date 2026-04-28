import Link from "next/link";
import Image from "next/image";
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
      {/* Reklama berishga undash (asosiy sahifadagi CTA uslubida) */}
      <div className="rounded-3xl bg-linear-to-r from-zinc-50/90 via-white to-zinc-50/80 px-1 py-5 sm:px-2">
        <div className="grid gap-4 sm:flex sm:flex-wrap sm:items-center sm:gap-7">
          <div className="flex items-center gap-5 sm:flex-1 sm:gap-7">
            <div className="relative h-[88px] w-[88px] shrink-0 sm:h-[104px] sm:w-[104px]">
              <Image
                src="/fire.svg"
                alt="Reklama bering"
                fill
                sizes="104px"
                className="object-contain"
                priority
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[clamp(20px,4vw,28px)] font-black leading-[1.1] tracking-tight text-zinc-950">
                Reklama bering — tezroq topiling
              </div>
              <div className="mt-2 max-w-xl text-[13px] font-medium leading-relaxed text-zinc-600 sm:text-[14px]">
                Reklamadagi e’lonlarda <span className="font-extrabold text-zinc-900">“Top”</span> belgisi ko‘rinadi va
                ko‘proq ko‘rishlar bo‘ladi.
              </div>
            </div>
          </div>

          <Link
            href="/reklama"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-amber-500 via-orange-500 to-rose-500 px-6 text-[12px] font-extrabold text-white ring-1 ring-orange-600/30 shadow-[0_14px_34px_rgba(249,115,22,.22)] transition hover:from-amber-400 hover:via-orange-500 hover:to-rose-500 sm:h-12 sm:w-auto sm:px-7"
          >

            Reklama berish
          </Link>
        </div>
      </div>

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
          

          <div>
            <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
              <h2 className="text-[12px] font-extrabold uppercase tracking-widest text-zinc-500">
                Mening reklamalarim
              </h2>
            </div>
            
            {sorted.length === 0 ? (
              <p className="text-[13px] font-medium text-zinc-600">
                Hozircha faol (tasdiqlangan va muddati tugamagan) e’lon yo‘q. Barcha e’lonlaringizni «E’lonlarim»
                bo‘limidan ko‘rishingiz mumkin.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {sorted.map((l) => (
                  <ListingCard
                    key={l.id}
                    l={
                      {
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
                      } as any
                    }
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
