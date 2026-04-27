import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import FavoriteButton from "@/components/FavoriteButton";
import RequestButton from "@/components/RequestButton";
import ListingStatsDrawer from "@/components/ListingStatsDrawer";

function maritalLabel(v: string) {
  switch (v) {
    case "boydoq":
      return "Bo‘ydoq";
    case "ajrashgan":
      return "Ajrashgan";
    case "beva":
      return "Beva";
    default:
      return "Bilinmaydi";
  }
}
function childrenLabel(v: string) {
  switch (v) {
    case "yoq":
      return "Yo‘q";
    case "bor":
      return "Bor";
    default:
      return "Bilinmaydi";
  }
}
function educationLabel(v: string) {
  switch (v) {
    case "oliy":
      return "Oliy";
    case "orta":
      return "O‘rta";
    case "orta_maxsus":
      return "O‘rta maxsus";
    case "boshqa":
      return "Boshqa";
    default:
      return "Bilinmaydi";
  }
}
function aqeedaLabel(v: string) {
  switch (v) {
    case "ahli_sunna":
      return "Ahli sunna val jamoa";
    case "salafiy":
      return "Salafiy";
    case "boshqa":
      return "Boshqa";
    default:
      return "Bilinmaydi";
  }
}
function prayerLabel(v: string) {
  switch (v) {
    case "farz":
      return "Doimiy";
    case "bazan":
      return "Ba’zan";
    case "oqimaydi":
      return "O‘qimaydi";
    default:
      return "Bilinmaydi";
  }
}
function quranLabel(v: string) {
  switch (v) {
    case "qiroat_yaxshi":
      return "Yaxshi";
    case "ortacha":
      return "O‘rtacha";
    case "oqimaydi":
      return "O‘qimaydi";
    default:
      return "Bilinmaydi";
  }
}
function madhabLabel(v: string) {
  switch (v) {
    case "hanafiy":
      return "Hanafiy";
    case "shofiiy":
      return "Shofi’iy";
    case "molikiy":
      return "Molikiy";
    case "hanbaliy":
      return "Hanbaliy";
    case "boshqa":
      return "Boshqa";
    default:
      return "Bilinmaydi";
  }
}
function smokesLabel(v: boolean | null) {
  if (v === null) return "Bilinmaydi";
  return v ? "Chekadi" : "Chekmaydi";
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white p-4 ring-1 ring-zinc-200/90 sm:p-5">
      <div className="flex items-end justify-between gap-2">
        <h2 className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-zinc-500">{title}</h2>
        {hint ? (
          <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">{hint}</span>
        ) : null}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Dl({ rows }: { rows: Array<{ k: string; v: string }> }) {
  return (
    <dl className="grid gap-2.5 sm:grid-cols-2">
      {rows.map((r) => (
        <div
          key={r.k}
          className="flex items-start justify-between gap-3 rounded-2xl bg-zinc-50/90 px-3.5 py-2.5 ring-1 ring-zinc-200/80"
        >
          <dt className="text-[11px] font-bold text-zinc-500">{r.k}</dt>
          <dd className="max-w-[65%] text-right text-[12.5px] font-extrabold tracking-tight text-zinc-950">
            {r.v}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!id) notFound();
  const listing = await db.listing.findUnique({ where: { id } });
  if (!listing) notFound();

  const user = await getCurrentUser();
  const isOwner = !!user && user.id === listing.ownerId;

  const now0 = new Date();
  const isPublicOk =
    listing.active &&
    listing.moderationStatus === "approved" &&
    listing.expiresAt.getTime() > now0.getTime();
  if (!isOwner && !isPublicOk) notFound();

  if (user && user.id !== listing.ownerId && isPublicOk) {
    await db.listingView.upsert({
      where: { listingId_viewerUserId: { listingId: listing.id, viewerUserId: user.id } },
      update: {},
      create: { listingId: listing.id, viewerUserId: user.id },
    });
  }

  const isFav = user
    ? Boolean(
        await db.favorite.findUnique({
          where: { userId_listingId: { userId: user.id, listingId: listing.id } },
        }),
      )
    : false;

  const myRequest = user
    ? await db.request.findUnique({
        where: { listingId_fromUserId: { listingId: listing.id, fromUserId: user.id } },
        include: { chat: true },
      })
    : null;

  const now = new Date();
  const isBoosted = listing.boostUntil ? listing.boostUntil.getTime() > now.getTime() : false;
  const isKelin = listing.category === "kelinlar";
  const initial = (listing.name?.trim()?.[0] || "?").toUpperCase();
  const heroGradient = isKelin
    ? "from-rose-300 via-fuchsia-500 to-rose-800"
    : "from-sky-300 via-indigo-500 to-blue-800";

  const modHint =
    listing.moderationStatus === "pending"
      ? "Moderatsiyada — tasdiqlangach hammaga ko‘rinadi."
      : listing.moderationStatus === "rejected"
        ? "Rad etilgan. Profilni yangilab qayta yuboring."
        : null;

  return (
    <div className="min-h-screen bg-[#f4f4f5] text-zinc-950">
      <header className="sticky top-0 z-30 border-b border-zinc-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-3 px-4 sm:px-5">
          <Link href="/" className="text-[15px] font-black tracking-tight text-zinc-950">
            Annikah
          </Link>
          <Link
            href="/"
            className="inline-flex h-9 items-center gap-1.5 rounded-2xl bg-white px-3 text-[12px] font-extrabold text-zinc-900 ring-1 ring-zinc-200 hover:bg-zinc-50"
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
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-4 px-4 py-5 sm:space-y-5 sm:px-5 sm:py-6">
        {isOwner && listing.moderationStatus !== "approved" ? (
          <div className="rounded-2xl bg-amber-50 px-4 py-3 text-[12.5px] font-semibold leading-relaxed text-amber-950 ring-1 ring-amber-200">
            <span className="font-extrabold">Holat: </span>
            {modHint}
          </div>
        ) : null}

        {/* Hero — ListingCard bilan bir xil to‘rtburchak gradient */}
        <section className="overflow-hidden rounded-2xl bg-white ring-1 ring-zinc-200/80 shadow-[0_2px_18px_rgba(15,23,42,.04)]">
          <div style={{ containerType: "inline-size" }} className="relative aspect-5/4 w-full sm:aspect-video">
            <div className={`absolute inset-0 bg-linear-to-br ${heroGradient}`}>
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_28%_22%,rgba(255,255,255,.3),transparent_55%)]"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,.5)_0%,transparent_50%)]"
              />

              <div className="absolute left-3 top-3 flex flex-wrap items-center gap-2">
                {isBoosted ? (
                  <span className="inline-flex h-7 items-center gap-1 rounded-full bg-amber-400 px-2.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-amber-950 shadow-sm ring-1 ring-amber-500">
                    Top
                  </span>
                ) : (
                  <span className="inline-flex h-7 items-center rounded-full bg-white/15 px-2.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-white ring-1 ring-white/25 backdrop-blur">
                    {isKelin ? "Kelin" : "Kuyov"}
                  </span>
                )}
              </div>

              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  aria-hidden
                  className="select-none font-black tracking-[-0.04em] text-white/95 drop-shadow-[0_10px_28px_rgba(0,0,0,.28)]"
                  style={{ fontSize: "min(42vw, 140px)" }}
                >
                  {initial}
                </span>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                <h1 className="text-[clamp(22px,5vw,30px)] font-black leading-tight tracking-tight text-white drop-shadow">
                  {listing.name}
                </h1>
                <p className="mt-1 text-[13px] font-semibold text-white/85">
                  {listing.age} yosh · {listing.city} · {listing.country}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-100 p-4 sm:p-5">
            <div className="flex flex-wrap gap-2 text-[12px] font-semibold text-zinc-600">
              <span className="rounded-full bg-zinc-100 px-2.5 py-1 font-extrabold text-zinc-800 ring-1 ring-zinc-200">
                {listing.region}
              </span>
              <span className="rounded-full bg-zinc-100 px-2.5 py-1 ring-1 ring-zinc-200">{listing.nationality}</span>
              <span className="rounded-full bg-zinc-100 px-2.5 py-1 ring-1 ring-zinc-200">
                {listing.heightCm} sm · {listing.weightKg} kg
              </span>
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-stretch">
              <div className="min-w-0 flex-1 sm:min-w-[200px]">
                <RequestButton
                  listingId={listing.id}
                  authed={!!user}
                  isOwner={isOwner}
                  initialStatus={
                    (myRequest?.status as
                      | "pending"
                      | "accepted"
                      | "rejected"
                      | "cancelled"
                      | undefined) || "none"
                  }
                  initialChatId={myRequest?.chat?.id || null}
                />
              </div>
              {isOwner ? <ListingStatsDrawer listingId={listing.id} /> : null}
              <FavoriteButton
                listingId={listing.id}
                initial={isFav}
                authed={!!user}
                variant="block"
              />
            </div>
          </div>
        </section>

        {listing.about ? (
          <Section title="O‘zi haqida" hint="Tavsif">
            <p className="whitespace-pre-line text-[14px] leading-relaxed text-zinc-700">{listing.about}</p>
          </Section>
        ) : null}

        <Section title="Asosiy ma’lumotlar">
          <Dl
            rows={[
              { k: "Yosh", v: `${listing.age}` },
              { k: "Bo‘y / vazn", v: `${listing.heightCm} sm · ${listing.weightKg} kg` },
              { k: "Millat", v: listing.nationality },
              { k: "Joylashuv", v: `${listing.region}, ${listing.city}` },
              { k: "Sigaret", v: smokesLabel(listing.smokes) },
              {
                k: "Sport",
                v: listing.sportPerWeek != null ? `${listing.sportPerWeek} / hafta` : "Bilinmaydi",
              },
            ]}
          />
        </Section>

        <div className="grid gap-4 sm:grid-cols-2">
          <Section title="Shaxsiy holat">
            <Dl
              rows={[
                { k: "Oilaviy holat", v: maritalLabel(listing.maritalStatus) },
                { k: "Farzand", v: childrenLabel(listing.children) },
                ...(listing.polygamyAllowance
                  ? [{ k: "Ko‘pxotinlik", v: `${listing.polygamyAllowance}-ro‘zg‘orgacha` }]
                  : []),
              ]}
            />
          </Section>
          <Section title="Ta’lim va kasb">
            <Dl
              rows={[
                { k: "Ta’lim", v: educationLabel(listing.education) },
                { k: "Kasb", v: listing.jobTitle || "—" },
                ...(listing.incomeMonthlyUsd
                  ? [{ k: "Daromad", v: `$${listing.incomeMonthlyUsd} / oy` }]
                  : []),
              ]}
            />
          </Section>
        </div>

        <Section title="Diniy ma’lumotlar">
          <Dl
            rows={[
              { k: "Aqida", v: aqeedaLabel(listing.aqeeda) },
              { k: "Namoz", v: prayerLabel(listing.prayer) },
              { k: "Qur’on", v: quranLabel(listing.quran) },
              { k: "Mazhab", v: madhabLabel(listing.madhab) },
            ]}
          />
        </Section>

        <Section title="Juftga talablar">
          <Dl
            rows={[
              {
                k: "Yosh",
                v:
                  listing.partnerAgeFrom || listing.partnerAgeTo
                    ? `${listing.partnerAgeFrom ?? "—"} – ${listing.partnerAgeTo ?? "—"}`
                    : "Farqsiz",
              },
              { k: "Davlatlar", v: listing.partnerCountries || "Farqsiz" },
              { k: "Viloyatlar", v: listing.partnerRegions || "Farqsiz" },
              { k: "Shaharlar", v: listing.partnerCities || "Farqsiz" },
            ]}
          />
        </Section>

        <div className="rounded-2xl bg-amber-50/90 p-4 text-[12.5px] leading-relaxed text-amber-950 ring-1 ring-amber-200 sm:p-5">
          <div className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-amber-900/90">Eslatma</div>
          <p className="mt-2 font-medium">
            Telefon yoki tashqi aloqa faqat ikkala tomon roziligi bilan, chat ichida. Platformadan tashqarida
            aloqa so‘rash mumkin emas.
          </p>
        </div>
      </main>
    </div>
  );
}
