import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import ListingGenderWatermark from "@/components/ListingGenderWatermark";
import ListingSidebar from "@/components/ListingSidebar";
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

function sportLabel(v: number | null) {
  if (v == null) return "Bilinmaydi";
  if (v >= 7) return "Har kuni";
  if (v <= 0) return "Yo‘q";
  return `${v} marta / hafta`;
}

type SectionAccent =
  | "indigo"
  | "rose"
  | "amber"
  | "emerald"
  | "sky"
  | "fuchsia"
  | "violet"
  | "zinc";

/** Kartochka fondi — border yo‘q, faqat yumshoq rang gradient */
const ACCENTS: Record<SectionAccent, { tint: string }> = {
  indigo: { tint: "from-indigo-50/90 via-white to-indigo-50/40" },
  rose: { tint: "from-rose-50/90 via-white to-rose-50/40" },
  amber: { tint: "from-amber-50/90 via-white to-amber-50/40" },
  emerald: { tint: "from-emerald-50/90 via-white to-emerald-50/40" },
  sky: { tint: "from-sky-50/90 via-white to-sky-50/40" },
  fuchsia: { tint: "from-fuchsia-50/90 via-white to-fuchsia-50/40" },
  violet: { tint: "from-violet-50/90 via-white to-violet-50/40" },
  zinc: { tint: "from-zinc-50/90 via-white to-zinc-50/40" },
};

function Section({
  id,
  title,
  accent,
  iconSrc,
  children,
}: {
  id?: string;
  title: string;
  accent: SectionAccent;
  /** `public/section-icons/*.svg` */
  iconSrc: string;
  children: ReactNode;
}) {
  const a = ACCENTS[accent];
  return (
    <section
      id={id}
      className={
        "scroll-mt-24 overflow-hidden rounded-[32px] bg-linear-to-br " + a.tint
      }
    >
      <div className="flex items-center gap-3 px-5 pb-3 pt-5">
        <span className="inline-flex shrink-0" aria-hidden>
          <Image
            src={iconSrc}
            alt=""
            width={28}
            height={28}
            className="h-7 w-7 object-contain"
            unoptimized
          />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-[13px] font-black uppercase tracking-[0.14em] text-zinc-900">
            {title}
          </h2>
        </div>
      </div>
      <div className="px-5 pb-5 pt-0">{children}</div>
    </section>
  );
}

function Dl({
  rows,
  highlightKey,
}: {
  rows: Array<{ k: string; v: string; id?: string }>;
  highlightKey?: string;
}) {
  return (
    <dl className="grid gap-4 sm:grid-cols-2">
      {rows.map((r) => (
        <div key={r.k} id={r.id} data-key={highlightKey} className="scroll-mt-28">
          <dt className="text-[12px] font-extrabold uppercase tracking-widest text-zinc-400">
            {r.k}
          </dt>
          <dd className="mt-2 text-[20px] font-black tracking-tight text-zinc-950">
            {r.v}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function ICONS() {
  return {
    user: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.7" />
        <path d="M4 21a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    ),
    note: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
        <path
          d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path d="M14 3v6h6" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M9 13h6M9 17h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    ),
    rings: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
        <circle cx="9" cy="14" r="5" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="16" cy="14" r="5" stroke="currentColor" strokeWidth="1.7" />
        <path
          d="M9 9 7 5h4l-2 4M16 9l-2-4h4l-2 4"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
      </svg>
    ),
    cap: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
        <path
          d="M12 3 1 9l11 6 9-4.91V17"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path d="M5 12v5a7 7 0 0 0 14 0v-5" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    ),
    mosque: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
        <path
          d="M12 3c2 2 4 4 4 7H8c0-3 2-5 4-7z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path
          d="M4 21V12a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v9"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path
          d="M10 21v-4a2 2 0 0 1 4 0v4"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path d="M2 21h20" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    ),
    users: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
        <circle cx="9" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="17" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.7" />
        <path d="M3 21a6 6 0 0 1 12 0" stroke="currentColor" strokeWidth="1.7" />
        <path d="M15 21a4 4 0 0 1 6.5-3.1" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    ),
    pin: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
        <path
          d="M12 22s-7-7.58-7-12a7 7 0 1 1 14 0c0 4.42-7 12-7 12z"
          stroke="currentColor"
          strokeWidth="1.7"
        />
        <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    ),
    ruler: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
        <path
          d="m3 17 14-14 4 4L7 21z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path d="m6 14 2 2M9 11l3 3M12 8l2 2" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    ),
    star: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
        <path
          d="m12 3 2.6 5.6L20 9.4l-4 4 1 5.6L12 16.8l-5 2.2 1-5.6-4-4 5.4-.8z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
      </svg>
    ),
  };
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
  const heroGradient = isKelin
    ? "from-rose-300 via-fuchsia-500 to-rose-800"
    : "from-sky-300 via-indigo-500 to-blue-800";

  const listingSummaryLine = [
    `${listing.age} yosh`,
    listing.nationality?.trim() || null,
    listing.city?.trim() || null,
    listing.country?.trim() || null,
  ]
    .filter(Boolean)
    .join(" · ");

  const modHint =
    listing.moderationStatus === "pending"
      ? "Moderatsiyada — tasdiqlangach hammaga ko‘rinadi."
      : listing.moderationStatus === "rejected"
        ? "Rad etilgan. Profilni yangilab qayta yuboring."
        : null;

  const I = ICONS();

  const tocItems = [
    ...(listing.about
      ? [{ id: "about", label: "O‘zi haqida", icon: I.note }]
      : []),
    { id: "main", label: "Asosiy ma’lumotlar", icon: I.user },
    { id: "row-address", label: "Manzil", icon: I.pin },
    { id: "row-physical", label: "Bo‘y / vazn", icon: I.ruler },
    { id: "marital", label: "Oilaviy holat", icon: I.rings },
    { id: "education", label: "Ta’lim va kasb", icon: I.cap },
    { id: "religion", label: "Diniy ma’lumotlar", icon: I.mosque },
    { id: "partner", label: "Juftga talablar", icon: I.users },
  ];

  return (
    <div className="min-h-screen bg-[#f4f4f5] text-zinc-950">
      {/* Tozalangan, rangsiz header — orqaga · Annikah · placeholder */}
      <header className="sticky top-0 z-30 bg-transparent">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            aria-label="Orqaga"
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/70 text-zinc-900 ring-1 ring-zinc-200/80 backdrop-blur transition hover:bg-white"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
              <path
                d="m15 6-6 6 6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
          <Link href="/" aria-label="Annikah" className="inline-flex items-center gap-1.5">
            <span className="relative grid h-8 w-8 place-items-center rounded-2xl bg-linear-to-br from-rose-400 via-fuchsia-500 to-indigo-500 text-white shadow-[0_10px_24px_rgba(244,114,182,.32),inset_0_1px_0_rgba(255,255,255,.45)]">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
                <path d="M12 21s-7-4.35-9.5-9A5.5 5.5 0 0 1 12 6.5 5.5 5.5 0 0 1 21.5 12c-2.5 4.65-9.5 9-9.5 9z" />
              </svg>
            </span>
            <span className="text-[19px] font-black tracking-tight bg-linear-to-r from-rose-500 via-fuchsia-500 to-indigo-500 bg-clip-text text-transparent">
              Annikah
            </span>
          </Link>
          <span className="h-10 w-10" aria-hidden />
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-4 pb-24 pt-2 sm:px-6 lg:px-8 lg:pb-12">
        {isOwner && listing.moderationStatus !== "approved" ? (
          <div className="mb-4 rounded-2xl bg-amber-50 px-4 py-3 text-[12.5px] font-semibold leading-relaxed text-amber-950 ring-1 ring-amber-200">
            <span className="font-extrabold">Holat: </span>
            {modHint}
          </div>
        ) : null}

        <div className="grid gap-5 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-8 xl:grid-cols-[360px_minmax(0,1fr)] xl:gap-10">
          {/* Left sticky sidebar (desktop) + mobile bottom action bar */}
          <ListingSidebar
            listingId={listing.id}
            name={listing.name}
            category={listing.category}
            authed={!!user}
            isOwner={isOwner}
            isFav={isFav}
            requestStatus={
              (myRequest?.status as
                | "pending"
                | "accepted"
                | "rejected"
                | "cancelled"
                | undefined) || "none"
            }
            chatId={myRequest?.chat?.id || null}
            tocItems={tocItems}
          />

          {/* Right main content */}
          <div className="grid gap-4">
            {/* Asosiy joyda qisqa meta (desktop) */}
            <p className="hidden text-[13.5px] font-semibold leading-snug text-zinc-600 lg:block">
              {listingSummaryLine}
            </p>

            {/* Mobil: gradient banner — sidebardagi kabi (meta ostida alohida) */}
            <section className="overflow-hidden rounded-3xl bg-white ring-1 ring-zinc-200/80 lg:hidden">
              <div
                style={{ containerType: "inline-size" }}
                className="relative aspect-5/4 w-full sm:aspect-video"
              >
                <div className={"absolute inset-0 bg-linear-to-br " + heroGradient}>
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-black/18"
                  />
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_28%_22%,rgba(255,255,255,.32),transparent_55%)]"
                  />
                  <div className="absolute left-3 top-3 z-2 flex flex-wrap items-center gap-2">
                    {isBoosted ? (
                      <span className="inline-flex h-7 items-center gap-1 rounded-full bg-amber-400 px-2.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-amber-950 shadow-sm ring-1 ring-amber-500">
                        Top
                      </span>
                    ) : (
                      <span className="inline-flex h-7 items-center rounded-full bg-white/20 px-2.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-white ring-1 ring-white/35 backdrop-blur">
                        {isKelin ? "Kelin" : "Kuyov"}
                      </span>
                    )}
                  </div>
                  <ListingGenderWatermark
                    category={listing.category}
                    variant="detailHero"
                    maskId={`hero-${listing.id}`}
                  />
                  <div className="relative z-1 flex h-full min-h-0 flex-col items-center justify-center px-4 pb-8 pt-16">
                    <h1 className="translate-y-1 text-center text-[clamp(20px,5.5vw,30px)] font-black leading-tight tracking-tight text-white drop-shadow-[0_4px_22px_rgba(0,0,0,.38)]">
                      {listing.name}
                    </h1>
                  </div>
                </div>
              </div>
            </section>

            <p className="text-[13.5px] font-semibold leading-snug text-zinc-600 lg:hidden">
              {listingSummaryLine}
            </p>

            {/* Desktop owner stats action */}
            {isOwner ? (
              <div className="flex flex-wrap items-center justify-end gap-2">
                <ListingStatsDrawer listingId={listing.id} />
              </div>
            ) : null}

            <Section
              id="row-physical"
              title="JISMONIY MA’LUMOTLAR"
              accent="sky"
              iconSrc="/section-icons/ruler.svg"
            >
              <Dl
                rows={[
                  { k: "Bo‘yi", v: `${listing.heightCm} sm` },
                  { k: "Vazni", v: `${listing.weightKg} kg` },
                  { k: "Sigaret", v: smokesLabel(listing.smokes) },
                  { k: "Sport", v: sportLabel(listing.sportPerWeek) },
                ]}
              />
            </Section>

            <Section
              id="row-address"
              title="JOYASHUV"
              accent="indigo"
              iconSrc="/section-icons/location.svg"
            >
              <Dl
                rows={[
                  { k: "Davlat", v: listing.country || "—" },
                  { k: "Viloyat", v: listing.region || "—" },
                  { k: "Shahar", v: listing.city || "—" },
                  { k: "Millati", v: listing.nationality || "—" },
                ]}
              />
            </Section>

            <Section id="marital" title="SHAXSIY HOLATI" accent="rose" iconSrc="/section-icons/user-octagon.svg">
              <Dl
                rows={[
                  { k: "Oilaviy holati", v: maritalLabel(listing.maritalStatus) },
                  { k: "Farzand", v: childrenLabel(listing.children) },
                  ...(listing.polygamyAllowance
                    ? [{ k: "Ko‘pxotinlik", v: `${listing.polygamyAllowance}-ro‘zg‘orgacha` }]
                    : []),
                ]}
              />
            </Section>

            <Section id="education" title="ILM & KASB" accent="amber" iconSrc="/section-icons/teacher.svg">
              <Dl
                rows={[
                  { k: "Ta’lim", v: educationLabel(listing.education) },
                  { k: "Kasbi", v: listing.jobTitle || "—" },
                  ...(listing.incomeMonthlyUsd ? [{ k: "Maosh", v: `$${listing.incomeMonthlyUsd}` }] : []),
                ]}
              />
            </Section>

            <Section id="religion" title="DINIY MA’LUMOTLAR" accent="emerald" iconSrc="/section-icons/book.svg">
              <Dl
                rows={[
                  { k: "Aqida", v: aqeedaLabel(listing.aqeeda) },
                  { k: "Namoz", v: prayerLabel(listing.prayer) },
                  { k: "Qur’on o‘qish", v: quranLabel(listing.quran) },
                  { k: "Mazhab", v: madhabLabel(listing.madhab) },
                ]}
              />
            </Section>

            <Section id="partner" title="JUFTGA TALABLARI" accent="fuchsia" iconSrc="/section-icons/document-like.svg">
              <Dl
                rows={[
                  {
                    k: "Yosh oralig‘i",
                    v:
                      listing.partnerAgeFrom || listing.partnerAgeTo
                        ? `${listing.partnerAgeFrom ?? "—"}–${listing.partnerAgeTo ?? "—"} yosh`
                        : "Farqsiz",
                  },
                  { k: "Joylashuv", v: listing.partnerCountries || "Farqsiz" },
                  { k: "Viloyatlar", v: listing.partnerRegions || "Farqsiz" },
                  { k: "Shaharlar", v: listing.partnerCities || "Farqsiz" },
                ]}
              />
            </Section>

            {listing.about ? (
              <Section id="about" title="O‘ZIM HAQIMDA" accent="violet" iconSrc="/section-icons/user-search.svg">
                <p className="whitespace-pre-line text-[15px] leading-relaxed text-zinc-700">
                  {listing.about}
                </p>
              </Section>
            ) : null}

          </div>
        </div>
      </main>
    </div>
  );
}
