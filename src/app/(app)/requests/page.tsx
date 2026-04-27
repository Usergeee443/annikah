import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import RequestActions from "@/components/RequestActions";

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
  children: React.ReactNode;
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h1 className="text-[22px] font-black tracking-tight text-zinc-950 sm:text-[26px]">
            So‘rovlar
          </h1>
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10.5px] font-extrabold tracking-widest text-zinc-600 ring-1 ring-zinc-200">
            {tab === "sent" ? sent.length : received.length} ta
          </span>
        </div>
        <form action="/requests" method="GET" className="flex items-center gap-2">
          <input type="hidden" name="tab" value={tab} />
          <div className="relative">
            <svg
              viewBox="0 0 24 24"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
              fill="none"
            >
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7" />
              <path d="M20 20l-3.2-3.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
            <input
              name="q"
              defaultValue={q}
              placeholder="Qidirish..."
              className="h-10 w-[220px] rounded-2xl bg-white pl-10 pr-3 text-[13px] font-semibold text-zinc-900 ring-1 ring-zinc-200 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 sm:w-[280px]"
            />
          </div>
          {q ? (
            <Link
              href={`/requests?tab=${tab}`}
              className="inline-flex h-10 items-center justify-center rounded-2xl bg-white px-3 text-[12px] font-extrabold text-zinc-900 ring-1 ring-zinc-200 hover:bg-zinc-50"
            >
              Tozalash
            </Link>
          ) : null}
        </form>
      </div>

      <div className="flex justify-center">
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
            Kelgan ({received.length})
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
            Yuborilgan ({sent.length})
          </Link>
        </div>
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
        <div className="grid gap-3">
          {list.map((r) => {
            const otherProfile =
              tab === "sent"
                ? (r as typeof sent[number]).toUser?.profile
                : (r as typeof received[number]).fromUser?.profile;
            const otherName = otherProfile?.name || "Foydalanuvchi";
            const sl = statusMeta(r.status);
            return (
              <div
                key={r.id}
                className="rounded-3xl border border-zinc-200/70 bg-white/80 p-5 shadow-[0_8px_28px_rgba(15,23,42,.05)] backdrop-blur"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Pill tone={r.listing.category === "kelinlar" ? "rose" : "blue"}>
                        {r.listing.category === "kelinlar" ? "Kelin" : "Kuyov"}
                      </Pill>
                      <Pill tone={sl.tone}>{sl.label}</Pill>
                      <Pill tone="zinc">{new Date(r.createdAt).toLocaleString()}</Pill>
                    </div>
                    <div className="mt-2 text-[16px] font-black tracking-tight text-zinc-950">
                      {tab === "sent" ? r.listing.name : otherName}
                      {otherProfile?.age ? ` · ${otherProfile.age} yosh` : ""}
                    </div>
                    <div className="mt-0.5 text-[12.5px] font-semibold text-zinc-700">
                      {tab === "sent"
                        ? `E’lon: ${r.listing.name} · ${r.listing.region}, ${r.listing.city}`
                        : otherProfile
                          ? `${otherProfile.country} · ${otherProfile.region}, ${otherProfile.city}`
                          : "Profil to‘liq emas"}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/listings/${r.listingId}`}
                      className="inline-flex h-9 items-center justify-center rounded-2xl bg-white px-3 text-[12px] font-extrabold text-zinc-900 ring-1 ring-zinc-200 hover:bg-zinc-50"
                    >
                      E’lonni ochish
                    </Link>
                    {r.chat ? (
                      <Link
                        href={`/chats/${r.chat.id}`}
                        className="inline-flex h-9 items-center justify-center rounded-2xl bg-emerald-600 px-3 text-[12px] font-extrabold text-white ring-1 ring-emerald-700 hover:bg-emerald-500"
                      >
                        Chatni boshlash
                      </Link>
                    ) : (
                      <RequestActions
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
