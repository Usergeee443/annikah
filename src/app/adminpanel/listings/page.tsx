import Link from "next/link";
import { requireFullAdminPanelAccess } from "@/lib/adminAuth";
import { db } from "@/lib/db";
import DeleteListingButton from "@/components/admin/DeleteListingButton";

type Search = {
  q?: string;
  status?: string;
  category?: string;
};

function statusPill(s: string) {
  if (s === "approved") return "bg-emerald-50 text-emerald-800 ring-emerald-200";
  if (s === "pending") return "bg-amber-50 text-amber-900 ring-amber-200";
  if (s === "rejected") return "bg-rose-50 text-rose-800 ring-rose-200";
  return "bg-zinc-100 text-zinc-700 ring-zinc-200";
}

export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  await requireFullAdminPanelAccess();

  const params = await searchParams;
  const q = (params.q || "").trim();
  const status =
    params.status === "pending" || params.status === "approved" || params.status === "rejected"
      ? params.status
      : "";
  const category =
    params.category === "kelinlar" || params.category === "kuyovlar" ? params.category : "";

  const where: Record<string, unknown> = {};
  if (status) where.moderationStatus = status;
  if (category) where.category = category;
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { city: { contains: q, mode: "insensitive" } },
      { region: { contains: q, mode: "insensitive" } },
      { country: { contains: q, mode: "insensitive" } },
    ];
  }

  const [listings, total] = await Promise.all([
    db.listing.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        owner: {
          select: { id: true, email: true, phone: true, profile: { select: { name: true } } },
        },
      },
    }),
    db.listing.count({ where }),
  ]);

  const now = new Date();

  return (
    <div className="grid gap-4">
      <div className="rounded-3xl border border-zinc-200/70 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,.05)]">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-[11px] font-extrabold tracking-widest text-zinc-500">E’LONLAR</div>
            <h1 className="mt-2 text-[26px] font-black tracking-tight text-zinc-950">E’lonlar boshqaruvi</h1>
            <p className="mt-1 text-[13px] font-medium text-zinc-600">
              Jami: <span className="font-extrabold text-zinc-900">{total}</span>.
            </p>
          </div>
        </div>

        <form
          method="GET"
          className="mt-4 grid gap-2 sm:grid-cols-[1fr_160px_160px_120px]"
        >
          <input
            name="q"
            defaultValue={q}
            placeholder="Ism, shahar, viloyat, davlat"
            className="h-11 rounded-2xl border border-zinc-200 bg-white px-4 text-[13px] font-semibold outline-none focus:border-zinc-300 focus:shadow-[0_0_0_4px_rgba(24,24,27,.06)]"
          />
          <select
            name="status"
            defaultValue={status}
            className="h-11 rounded-2xl border border-zinc-200 bg-white px-3 text-[13px] font-semibold outline-none"
          >
            <option value="">Barcha holatlar</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            name="category"
            defaultValue={category}
            className="h-11 rounded-2xl border border-zinc-200 bg-white px-3 text-[13px] font-semibold outline-none"
          >
            <option value="">Barchasi</option>
            <option value="kelinlar">Kelinlar</option>
            <option value="kuyovlar">Kuyovlar</option>
          </select>
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-zinc-950 px-5 text-[12px] font-extrabold text-white ring-1 ring-black/10 hover:bg-zinc-900"
          >
            Qidirish
          </button>
        </form>
      </div>

      {listings.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-zinc-300 bg-white p-8 text-center">
          <div className="text-[14px] font-extrabold text-zinc-950">E’lon topilmadi</div>
        </div>
      ) : (
        <div className="grid gap-2">
          {listings.map((l) => (
            <div
              key={l.id}
              className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-zinc-200/70 bg-white p-4"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[14px] font-black tracking-tight text-zinc-950">
                    {l.name} · {l.age} yosh
                  </span>
                  <span
                    className={
                      "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.14em] ring-1 " +
                      statusPill(l.moderationStatus)
                    }
                  >
                    {l.moderationStatus}
                  </span>
                  <span
                    className={
                      "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.14em] ring-1 " +
                      (l.category === "kelinlar"
                        ? "bg-rose-50 text-rose-800 ring-rose-200"
                        : "bg-sky-50 text-sky-800 ring-sky-200")
                    }
                  >
                    {l.category}
                  </span>
                  {l.boostUntil && l.boostUntil > now ? (
                    <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-amber-800 ring-1 ring-amber-200">
                      BOOST
                    </span>
                  ) : null}
                </div>
                <div className="mt-1 text-[12px] font-semibold text-zinc-600">
                  {l.region}, {l.city} · {l.country}
                </div>
                <div className="mt-1 text-[11.5px] font-medium text-zinc-500">
                  Yaratildi: {new Date(l.createdAt).toLocaleString()} · Tugaydi:{" "}
                  {new Date(l.expiresAt).toLocaleDateString()}
                </div>
                <div className="mt-1 text-[11.5px] font-medium text-zinc-500">
                  Egasi:{" "}
                  <Link
                    href={`/adminpanel/users/${l.owner.id}`}
                    className="font-extrabold text-zinc-800 hover:text-zinc-950"
                  >
                    {l.owner.profile?.name || l.owner.email || l.owner.phone || l.owner.id}
                  </Link>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/listings/${l.id}`}
                  className="inline-flex h-9 items-center justify-center rounded-2xl bg-white px-3 text-[12px] font-extrabold text-zinc-900 ring-1 ring-zinc-200 hover:bg-zinc-50"
                >
                  Ko‘rish
                </Link>
                <DeleteListingButton listingId={l.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
