import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import ListingCard from "@/components/ListingCard";
import ListingsToolbar, { type ToolbarSearch } from "@/components/ListingsToolbar";

function intOrUndef(v: string | undefined) {
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

const FILTER_KEYS = [
  "q",
  "ageFrom",
  "ageTo",
  "heightFrom",
  "heightTo",
  "weightFrom",
  "weightTo",
  "region",
  "city",
  "nationality",
  "marital",
  "children",
  "education",
  "smokes",
  "prayer",
  "aqeeda",
  "madhab",
  "quran",
  "poly",
] as const;

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<ToolbarSearch>;
}) {
  const sp = (await searchParams) || {};
  const cat = sp.cat === "kuyovlar" ? "kuyovlar" : "kelinlar";
  const user = await getCurrentUser();

  const ageFrom = intOrUndef(sp.ageFrom);
  const ageTo = intOrUndef(sp.ageTo);
  const heightFrom = intOrUndef(sp.heightFrom);
  const heightTo = intOrUndef(sp.heightTo);
  const weightFrom = intOrUndef(sp.weightFrom);
  const weightTo = intOrUndef(sp.weightTo);
  const polyMin = intOrUndef(sp.poly);

  const where: Parameters<typeof db.listing.findMany>[0] = {
    where: {
      active: true,
      moderationStatus: "approved",
      expiresAt: { gt: new Date() },
      category: cat,
      ...(ageFrom !== undefined || ageTo !== undefined
        ? { age: { gte: ageFrom, lte: ageTo } }
        : {}),
      ...(heightFrom !== undefined || heightTo !== undefined
        ? { heightCm: { gte: heightFrom, lte: heightTo } }
        : {}),
      ...(weightFrom !== undefined || weightTo !== undefined
        ? { weightKg: { gte: weightFrom, lte: weightTo } }
        : {}),
      ...(sp.region ? { region: { contains: sp.region } } : {}),
      ...(sp.city ? { city: { contains: sp.city } } : {}),
      ...(sp.nationality ? { nationality: { contains: sp.nationality } } : {}),
      ...(sp.marital ? { maritalStatus: sp.marital } : {}),
      ...(sp.children ? { children: sp.children } : {}),
      ...(sp.education ? { education: sp.education } : {}),
      ...(sp.smokes === "yes" ? { smokes: true } : sp.smokes === "no" ? { smokes: false } : {}),
      ...(sp.prayer ? { prayer: sp.prayer } : {}),
      ...(sp.aqeeda ? { aqeeda: sp.aqeeda } : {}),
      ...(sp.madhab ? { madhab: sp.madhab } : {}),
      ...(sp.quran ? { quran: sp.quran } : {}),
      ...(polyMin !== undefined ? { polygamyAllowance: { gte: polyMin } } : {}),
      ...(sp.q
        ? {
            OR: [
              { name: { contains: sp.q } },
              { about: { contains: sp.q } },
              { jobTitle: { contains: sp.q } },
            ],
          }
        : {}),
    },
    orderBy: [{ boostScore: "desc" }, { createdAt: "desc" }],
    take: 60,
  };

  const listings = await db.listing.findMany(where);

  const myHasListing = user
    ? (await db.listing.count({ where: { ownerId: user.id } })) > 0
    : false;

  const favIds = user
    ? new Set(
        (
          await db.favorite.findMany({
            where: { userId: user.id, listingId: { in: listings.map((l) => l.id) } },
            select: { listingId: true },
          })
        ).map((x) => x.listingId),
      )
    : new Set<string>();

  const hasActiveFilters = FILTER_KEYS.some((k) => {
    const v = (sp as Record<string, string | undefined>)[k];
    return v !== undefined && v !== null && String(v).length > 0;
  });

  return (
    <div className="grid gap-5">
      <ListingsToolbar
        cat={cat}
        initial={sp}
        hasActiveFilters={hasActiveFilters}
        middle={
          user && !myHasListing ? (
            <div className="rounded-3xl bg-linear-to-r from-zinc-50/90 via-white to-zinc-50/80 px-1 py-5 sm:px-2">
              <div className="flex flex-wrap items-center gap-5 sm:gap-7">
                <div className="relative h-[88px] w-[88px] shrink-0 sm:h-[104px] sm:w-[104px]">
                  <Image
                    src="/notice.png"
                    alt="E’loningizni yarating"
                    fill
                    sizes="104px"
                    className="object-contain"
                    priority
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[clamp(20px,4vw,28px)] font-black leading-[1.1] tracking-tight text-zinc-950">
                    E’loningizni yarating
                  </div>
                  <div className="mt-2 max-w-xl text-[13px] font-medium leading-relaxed text-zinc-600 sm:text-[14px]">
                    So‘rov yuborish va chat uchun e’lon joylash — boshqa foydalanuvchilar sizni osonroq topadi.
                  </div>
                </div>
                <Link
                  href="/elonlarim"
                  className="inline-flex h-11 shrink-0 items-center justify-center self-center rounded-2xl bg-zinc-950 px-6 text-[12px] font-extrabold text-white ring-1 ring-black/10 transition hover:bg-zinc-900 sm:h-12 sm:px-7"
                >
                  E’lon berish
                </Link>
              </div>
            </div>
          ) : null
        }
      />

      {listings.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-zinc-300 bg-white/60 p-10 text-center">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-zinc-100 ring-1 ring-zinc-200" />
          <div className="mt-4 text-base font-extrabold tracking-tight text-zinc-950">
            Hech narsa topilmadi
          </div>
          <div className="mt-1 text-sm text-zinc-600">
            Filterlarni tozalab qaytadan urinib ko‘ring.
          </div>
          <Link
            href={`/?cat=${cat}`}
            className="mt-5 inline-flex h-10 items-center justify-center rounded-2xl bg-zinc-950 px-5 text-[12px] font-extrabold text-white ring-1 ring-black/10 hover:bg-zinc-900"
          >
            Tozalash
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {listings.map((l, idx) => (
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
              isFav={favIds.has(l.id)}
              authed={!!user}
              rank={idx + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
