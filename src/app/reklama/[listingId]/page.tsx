import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import BoostButton from "@/components/BoostButton";

export default async function ReklamaTarifPage({
  params,
}: {
  params: Promise<{ listingId: string }>;
}) {
  const user = await requireUser();
  const { listingId } = await params;
  if (!listingId) notFound();

  const listing = await db.listing.findUnique({ where: { id: listingId } });
  if (!listing || listing.ownerId !== user.id) notFound();

  const now = new Date();
  if (listing.expiresAt.getTime() < now.getTime()) {
    redirect("/reklama");
  }

  const boostActive = Boolean(listing.boostUntil && listing.boostUntil > now);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="mb-8">
        <Link
          href="/reklama"
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
          E’lonlar
        </Link>
        <h1 className="mt-3 text-[22px] font-black tracking-tight sm:text-[26px]">Boost tariflari</h1>
        <p className="mt-1 text-[13px] font-medium text-zinc-600">
          <span className="font-extrabold text-zinc-900">{listing.name}</span>
          {" · "}
          {listing.region}, {listing.city}
        </p>
      </header>

      {boostActive ? (
        <div className="rounded-3xl bg-amber-50 p-5 text-[13px] font-medium leading-relaxed text-amber-950 ring-1 ring-amber-200 sm:p-6">
          <div className="text-[11px] font-extrabold uppercase tracking-widest text-amber-800/90">
            Faol reklama
          </div>
          <p className="mt-2">
            Bu e’londa boost hali tugamagan.{" "}
            <span className="font-extrabold">
              {listing.boostUntil ? new Date(listing.boostUntil).toLocaleString() : ""}
            </span>{" "}
            gacha yangi reklama qo‘yib bo‘lmaydi.
          </p>
          <Link
            href="/reklama"
            className="mt-4 inline-flex h-10 items-center justify-center rounded-2xl bg-white px-4 text-[12px] font-extrabold text-amber-950 ring-1 ring-amber-300 hover:bg-amber-100"
          >
            Boshqa e’lon tanlash
          </Link>
        </div>
      ) : (
        <div className="rounded-3xl bg-white p-5 ring-1 ring-zinc-200 sm:p-6">
          <div className="text-[11px] font-extrabold tracking-widest text-zinc-500">TARIF</div>
          <p className="mt-1 text-[13px] font-medium text-zinc-600">
            Paketni tanlang. To‘lov integratsiyasi keyingi bosqichda (demo narxlar).
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <BoostButton listingId={listing.id} days={3} label="Mini boost" priceUzs={29000} />
            <BoostButton listingId={listing.id} days={7} label="Standart boost" priceUzs={59000} />
            <BoostButton listingId={listing.id} days={14} label="Premium boost" priceUzs={99000} />
          </div>
        </div>
      )}

      <div className="mt-6 text-center">
        <Link href={`/listings/${listing.id}`} className="text-[12px] font-extrabold text-zinc-600 hover:text-zinc-950">
          E’lonni ko‘rish →
        </Link>
      </div>
    </div>
  );
}
