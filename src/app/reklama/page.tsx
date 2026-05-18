import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import ReklamaListingPick from "@/components/ReklamaListingPick";

export default async function ReklamaChoosePage() {
  const user = await requireUser();
  const now = new Date();
  const listings = await db.listing.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/ads"
            className="inline-flex items-center gap-1.5 text-[12px] font-extrabold text-zinc-600 transition hover:text-zinc-950"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
              <path
                d="M19 12H5M12 5l-7 7 7 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Reklama
          </Link>
          <h1 className="mt-2 text-[22px] font-black tracking-tight sm:text-[26px]">E’lonni tanlang</h1>
          <p className="mt-1 max-w-xl text-[13px] font-medium text-zinc-600">
            Boost qilinadigan e’lonni tanlang — keyingi qadamda tariflarni ko‘rasiz.
          </p>
        </div>
      </header>

      {listings.length === 0 ? (
        <div className="flex min-h-[calc(100dvh-12rem)] flex-col items-center justify-center text-center">
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
          <div className="mt-4 text-[16px] font-black tracking-tight text-zinc-950">E’lon topilmadi</div>
          <p className="mt-1 max-w-sm text-[13px] font-medium text-zinc-600">
            Avval e’lon yarating, so‘ng reklama (boost) xizmatidan foydalaning.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <Link
              href="/listings/new/extra"
              className="inline-flex h-10 items-center justify-center rounded-2xl bg-zinc-950 px-5 text-[12px] font-extrabold text-white ring-1 ring-black/10 hover:bg-zinc-900"
            >
              E’lon qo‘shish
            </Link>
            <Link
              href="/listings/new"
              className="inline-flex h-10 items-center justify-center rounded-2xl bg-white px-5 text-[12px] font-extrabold text-zinc-900 ring-1 ring-zinc-200 hover:bg-zinc-50"
            >
              Asosiy e’lon
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {listings.map((l) => (
            <ReklamaListingPick
              key={l.id}
              l={l}
              boostLocked={Boolean(l.boostUntil && l.boostUntil > now)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
