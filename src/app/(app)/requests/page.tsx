import Link from "next/link";
import type { ReactNode } from "react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import RequestActionsCompact from "@/components/RequestActionsCompact";
import ListingCard from "@/components/ListingCard";

type Search = { tab?: string; q?: string };

function statusMeta(status: string) {
  switch (status) {
    case "pending":
      return { label: "Kutilmoqda", tone: "amber" as const };
    case "accepted":
      return { label: "Tasdiqlangan", tone: "emerald" as const };
    case "rejected":
      return { label: "Rad etilgan", tone: "rose" as const };
    case "cancelled":
      return { label: "Bekor qilingan", tone: "zinc" as const };
    default:
      return { label: status, tone: "zinc" as const };
  }
}

function Pill({
  children,
  tone,
}: {
  children: ReactNode;
  tone: "rose" | "blue" | "amber" | "zinc" | "emerald";
}) {
  const map: Record<string, string> = {
    rose: "bg-rose-50 text-rose-800 ring-rose-200",
    blue: "bg-sky-50 text-sky-800 ring-sky-200",
    amber: "bg-amber-50 text-amber-800 ring-amber-200",
    zinc: "bg-zinc-100 text-zinc-700 ring-zinc-200",
    emerald: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  };
  return (
    <span
      className={
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-extrabold ring-1 " +
        map[tone]
      }
    >
      {children}
    </span>
  );
}

export default async function RequestsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const user = await requireUser();
  const sp = (await searchParams) || {};
  const tab = sp.tab === "sent" ? "sent" : "received";
  const q = (sp.q || "").trim();

  const received = await db.request.findMany({
    where: { toUserId: user.id },
    orderBy: { createdAt: "desc" },
    include: { listing: true, fromUser: { include: { profile: true } }, chat: true },
    take: 100,
  });

  const sent = await db.request.findMany({
    where: { fromUserId: user.id },
    orderBy: { createdAt: "desc" },
    include: { listing: true, toUser: { include: { profile: true } }, chat: true },
    take: 100,
  });

  const base = tab === "sent" ? sent : received;
  const list = q
    ? base.filter((r) => {
        const hay = [
          r.listing?.name,
          r.listing?.region,
          r.listing?.city,
          tab === "sent"
            ? (r as typeof sent[number]).toUser?.profile?.name
            : (r as typeof received[number]).fromUser?.profile?.name,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(q.toLowerCase());
      })
    : base;

  return (
    <div className="grid gap-5">
      {/* Header: So'rovlar + Kelgan/Ketgan + qidiruv tugmasi (bosilganda input ochiladi) */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="min-w-0">
          <h1 className="text-[22px] font-black tracking-tight text-zinc-950 sm:text-[26px]">So‘rovlar</h1>
        </div>

        <div className="justify-self-center">
          <div className="inline-flex rounded-2xl bg-zinc-100/80 p-1 ring-1 ring-zinc-200">
            <Link
              href={`/requests?tab=received${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              className={
                "inline-flex h-9 items-center justify-center rounded-xl px-4 text-[12px] font-extrabold tracking-tight transition " +
                (tab === "received"
                  ? "bg-white text-zinc-950 shadow-sm ring-1 ring-zinc-200/80"
                  : "text-zinc-600 hover:text-zinc-900")
              }
            >
              Kelgan
            </Link>
            <Link
              href={`/requests?tab=sent${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              className={
                "inline-flex h-9 items-center justify-center rounded-xl px-4 text-[12px] font-extrabold tracking-tight transition " +
                (tab === "sent"
                  ? "bg-white text-zinc-950 shadow-sm ring-1 ring-zinc-200/80"
                  : "text-zinc-600 hover:text-zinc-900")
              }
            >
              Ketgan
            </Link>
          </div>
        </div>

        <details className="group relative justify-self-end">
          <summary className="list-none">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-zinc-900 ring-1 ring-zinc-200 hover:bg-zinc-50">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
                <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </span>
          </summary>
          <div className="absolute right-0 z-20 mt-2 w-[min(92vw,360px)] rounded-3xl bg-white p-3 shadow-[0_18px_60px_rgba(15,23,42,.18)] ring-1 ring-zinc-200">
            <form action="/requests" method="GET" className="grid gap-2">
              <input type="hidden" name="tab" value={tab} />
              <div className="relative">
                <svg
                  viewBox="0 0 24 24"
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
                  fill="none"
                >
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7" />
                  <path
                    d="M20 20l-3.2-3.2"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                </svg>
                <input
                  name="q"
                  defaultValue={q}
                  placeholder="Qidirish…"
                  inputMode="search"
                  className="h-11 w-full rounded-2xl bg-zinc-100 pl-10 pr-3 text-[13px] font-semibold text-zinc-900 outline-none placeholder:text-zinc-400 transition focus:bg-white focus:shadow-[0_0_0_3px_rgba(24,24,27,.06)]"
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                {q ? (
                  <Link
                    href={`/requests?tab=${tab}`}
                    className="inline-flex h-10 items-center justify-center rounded-2xl bg-white px-4 text-[12px] font-extrabold text-zinc-900 ring-1 ring-zinc-200 hover:bg-zinc-50"
                  >
                    Tozalash
                  </Link>
                ) : null}
                <button
                  type="submit"
                  className="inline-flex h-10 items-center justify-center rounded-2xl bg-zinc-950 px-4 text-[12px] font-extrabold text-white ring-1 ring-black/10 hover:bg-zinc-900"
                >
                  Qidirish
                </button>
              </div>
            </form>
          </div>
        </details>
      </div>

      {list.length === 0 ? (
        <div className="flex min-h-[calc(100dvh-12rem)] items-center justify-center text-center">
          <div>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-zinc-100 ring-1 ring-zinc-200">
              <svg viewBox="0 0 24 24" className="h-7 w-7 text-zinc-600" fill="none">
                <path
                  d="M22 12h-6l-2 3h-4l-2-3H2"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinejoin="round"
                />
                <path
                  d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="mt-4 text-[16px] font-black tracking-tight text-zinc-950">
              {q
                ? "Qidiruv bo‘yicha topilmadi"
                : tab === "received"
                  ? "Kelgan so‘rovlar yo‘q"
                  : "Yuborilgan so‘rovlar yo‘q"}
            </div>
            <div className="mt-1 text-[13px] font-medium text-zinc-600">
              {q
                ? "Boshqa so‘z bilan urinib ko‘ring."
                : tab === "received"
                  ? "Hozircha sizga so‘rov kelmagan."
                  : "Hozircha siz hech kimga so‘rov yubormagansiz."}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((r) => {
            const otherProfile =
              tab === "sent"
                ? (r as typeof sent[number]).toUser?.profile
                : (r as typeof received[number]).fromUser?.profile;
            const otherName = otherProfile?.name || "Foydalanuvchi";
            const sl = statusMeta(r.status);
            return (
              <div key={r.id} className="grid gap-3">
                <ListingCard
                  l={{
                    id: r.listing.id,
                    name: r.listing.name,
                    age: r.listing.age,
                    heightCm: r.listing.heightCm,
                    weightKg: r.listing.weightKg,
                    region: r.listing.region,
                    city: r.listing.city,
                    country: r.listing.country,
                    nationality: (r.listing as any).nationality,
                    category: r.listing.category,
                    jobTitle: r.listing.jobTitle,
                    prayer: r.listing.prayer,
                    maritalStatus: r.listing.maritalStatus,
                    boostUntil: r.listing.boostUntil,
                    createdAt: r.listing.createdAt,
                  }}
                  isFav={false}
                  authed={true}
                  hideFavorite
                />

                <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex h-8 items-center rounded-2xl bg-zinc-100 px-3 text-[12px] font-extrabold text-zinc-800 ring-1 ring-zinc-200">
                        {tab === "sent" ? "Yuborilgan" : "Kelgan"}
                      </span>
                      <Pill tone={sl.tone}>{sl.label}</Pill>
                    </div>
                    <div className="mt-1 truncate text-[12.5px] font-semibold text-zinc-600">
                      {tab === "sent"
                        ? `Kimga: ${otherName}`
                        : `Kimdan: ${otherName}`}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {r.chat ? (
                      <Link
                        href={`/chats/${r.chat.id}`}
                        className="inline-flex h-9 items-center justify-center rounded-2xl bg-zinc-950 px-3 text-[12px] font-extrabold text-white ring-1 ring-black/10 hover:bg-zinc-900"
                      >
                        Chat
                      </Link>
                    ) : (
                      <RequestActionsCompact
                        requestId={r.id}
                        kind={tab === "sent" ? "sent" : "received"}
                        initialStatus={r.status}
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
