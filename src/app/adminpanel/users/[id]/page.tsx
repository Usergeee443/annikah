import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireFullAdminPanelAccess } from "@/lib/adminAuth";
import { db } from "@/lib/db";
import DeleteListingButton from "@/components/admin/DeleteListingButton";
import DeleteUserButton from "@/components/admin/DeleteUserButton";

function listingStatusPill(s: string) {
  if (s === "approved") return "bg-emerald-50 text-emerald-800 ring-emerald-200";
  if (s === "pending") return "bg-amber-50 text-amber-900 ring-amber-200";
  if (s === "rejected") return "bg-rose-50 text-rose-800 ring-rose-200";
  return "bg-zinc-100 text-zinc-700 ring-zinc-200";
}

export default async function AdminUserDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireFullAdminPanelAccess();

  const { id } = await params;
  const user = await db.user.findUnique({
    where: { id },
    include: {
      profile: true,
      listings: { orderBy: { createdAt: "desc" } },
      _count: {
        select: {
          listings: true,
          favorites: true,
          requestsSent: true,
          requestsReceived: true,
          chatsA: true,
          chatsB: true,
        },
      },
    },
  });
  if (!user) notFound();

  return (
    <div className="grid gap-4">
      <div className="rounded-3xl border border-zinc-200/70 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,.05)]">
        <Link
          href="/adminpanel/users"
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
          Foydalanuvchilar
        </Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] font-extrabold tracking-widest text-zinc-500">PROFIL</div>
            <h1 className="mt-1 text-[24px] font-black tracking-tight text-zinc-950">
              {user.profile?.name || user.email || user.phone || "—"}
            </h1>
            <div className="mt-1 text-[13px] font-medium text-zinc-600">
              {user.email || "—"}
              {user.phone ? <span> · {user.phone}</span> : null}
              {user.authProvider ? (
                <span
                  className={
                    "ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.14em] ring-1 " +
                    (user.authProvider === "telegram"
                      ? "bg-sky-50 text-sky-800 ring-sky-200"
                      : "bg-zinc-100 text-zinc-700 ring-zinc-200")
                  }
                >
                  {user.authProvider}
                </span>
              ) : null}
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <Stat label="E’lonlar" value={user._count.listings} />
              <Stat label="Sevimlilar" value={user._count.favorites} />
              <Stat label="Yuborgan so‘rov" value={user._count.requestsSent} />
              <Stat label="Kelgan so‘rov" value={user._count.requestsReceived} />
              <Stat label="Chatlar" value={user._count.chatsA + user._count.chatsB} />
              <Stat
                label="Ro‘yxatdan o‘tgan"
                value={new Date(user.createdAt).toLocaleDateString()}
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <DeleteUserButton userId={user.id} email={user.email} />
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-zinc-200/70 bg-white p-5">
        <div className="text-[11px] font-extrabold tracking-widest text-zinc-500">E’LONLAR</div>
        <h2 className="mt-1 text-[18px] font-black tracking-tight text-zinc-950">
          Foydalanuvchi e’lonlari ({user.listings.length})
        </h2>

        {user.listings.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-zinc-300 bg-white p-6 text-center text-[13px] font-medium text-zinc-600">
            E’lon yo‘q.
          </div>
        ) : (
          <div className="mt-4 grid gap-2">
            {user.listings.map((l) => (
              <div
                key={l.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white p-4"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[14px] font-black tracking-tight text-zinc-950">
                      {l.name} · {l.age} yosh
                    </span>
                    <span
                      className={
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.14em] ring-1 " +
                        listingStatusPill(l.moderationStatus)
                      }
                    >
                      {l.moderationStatus}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-zinc-700 ring-1 ring-zinc-200">
                      {l.category}
                    </span>
                    {l.boostUntil && l.boostUntil > new Date() ? (
                      <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-amber-800 ring-1 ring-amber-200">
                        BOOST
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-1 text-[12px] font-semibold text-zinc-600">
                    {l.region}, {l.city} · {l.country}
                  </div>
                  <div className="mt-1 text-[11.5px] font-medium text-zinc-500">
                    Yaratildi: {new Date(l.createdAt).toLocaleString()}
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
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white p-3 ring-1 ring-zinc-200">
      <div className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">{label}</div>
      <div className="mt-1 text-[16px] font-black tracking-tight text-zinc-950">{value}</div>
    </div>
  );
}
