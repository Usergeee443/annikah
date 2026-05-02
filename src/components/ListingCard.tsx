"use client";

import Link from "next/link";
import { useState } from "react";
import FavoriteButton from "@/components/FavoriteButton";
import ListingGenderWatermark from "@/components/ListingGenderWatermark";

type ListingCardProps = {
  l: {
    id: string;
    name: string;
    age: number;
    heightCm: number;
    weightKg: number;
    region: string;
    city: string;
    country: string;
    nationality?: string;
    category: string;
    jobTitle: string;
    prayer: string;
    maritalStatus: string;
    boostUntil: Date | string | null;
    createdAt: Date | string;
  };
  isFav: boolean;
  authed: boolean;
  viewsCount?: number;
  likesCount?: number;
  hideFavorite?: boolean;
  disableLink?: boolean;
  onPress?: () => void;
  /** `pin` — faqat pin belgisi (masalan, asosiy e’lon) */
  coverBadge?: "category" | "pin";
};

function prayerLabel(p: string) {
  switch (p) {
    case "farz":
      return "Doimiy";
    case "bazan":
      return "Ba’zan";
    case "oqimaydi":
      return "O‘qimaydi";
    case "bilinmaydi":
      return "Bilinmaydi";
    default:
      return p || "—";
  }
}

function maritalShort(v: string) {
  switch (v) {
    case "boydoq":
      return "Bo‘ydoq";
    case "ajrashgan":
      return "Ajrashgan";
    case "beva":
      return "Beva";
    default:
      return null;
  }
}

function toMs(v: Date | string | null | undefined) {
  if (v === null || v === undefined) return null;
  return typeof v === "string" ? new Date(v).getTime() : v.getTime();
}

const IconPin = (
  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="none">
    <path
      d="M12 22s7-7.58 7-12a7 7 0 1 0-14 0c0 4.42 7 12 7 12z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.7" />
  </svg>
);
const IconRuler = (
  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="none">
    <path d="M3 17 17 3l4 4L7 21z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    <path d="M7 13l2 2M10 10l2 2M13 7l2 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);
const IconScale = (
  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="none">
    <path
      d="M5 8h14l-2 11H7L5 8zM9 5h6"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  </svg>
);
const IconMoon = (
  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="none">
    <path
      d="M21 13.6A9 9 0 0 1 10.4 3a8 8 0 1 0 10.6 10.6z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
  </svg>
);

const shellCls =
  "block w-full overflow-hidden rounded-3xl bg-[#0b0f0e] text-left ring-1 transition ring-zinc-200/10";

export default function ListingCard({
  l,
  isFav,
  authed,
  viewsCount,
  likesCount,
  hideFavorite,
  disableLink,
  onPress,
  coverBadge = "category",
}: ListingCardProps) {
  const [asOf] = useState(() => new Date());
  const boostMs = toMs(l.boostUntil);
  const isBoosted = boostMs !== null && boostMs > asOf.getTime();

  const isKelin = l.category === "kelinlar";

  const gradient = isKelin
    ? "from-rose-300 via-fuchsia-500 to-rose-800"
    : "from-sky-300 via-indigo-500 to-blue-800";

  const marital = maritalShort(l.maritalStatus);

  const chipCls =
    "inline-flex min-w-0 items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-extrabold tracking-tight text-white ring-1 ring-white/14 backdrop-blur";

  const cover = (
    <div
      style={{ containerType: "inline-size" }}
      className={`relative min-h-[220px] w-full overflow-hidden bg-linear-to-b ${gradient}`}
    >
      <span aria-hidden className="pointer-events-none absolute inset-0 bg-black/35" />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(255,255,255,.20),transparent_55%)]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,.16),transparent_55%)]"
      />

      <ListingGenderWatermark category={l.category} variant="card" maskId={`card-${l.id}`} />

      <div className="absolute left-4 right-4 top-4 flex items-start justify-between gap-3">
        <div className="min-w-0 font-black leading-none tracking-tight text-white drop-shadow-[0_10px_30px_rgba(0,0,0,.55)] text-[clamp(22px,8cqw,34px)]">
          <span className="truncate">{l.name}</span>
        </div>
        {!hideFavorite ? (
          <div className="shrink-0">
            <FavoriteButton listingId={l.id} initial={isFav} authed={authed} variant="glyph" />
          </div>
        ) : null}
      </div>

      <div className="absolute left-4 right-4 top-[54px] flex min-w-0 flex-wrap items-center gap-2">
        {coverBadge === "pin" ? (
          <span className={chipCls}>
            <span className="text-sky-200">{IconPin}</span>
            Asosiy e’lon
          </span>
        ) : (
          <span className={chipCls}>
            <span className="text-sky-200">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
                <path
                  d="M12 2 4 5v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V5l-8-3z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            {isKelin ? "Kelin" : "Kuyov"}
          </span>
        )}
        <span className={chipCls}>
          <span className="text-sky-200">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
              <path
                d="M8 7V3h8v4M6 7h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          {l.age} yosh
        </span>
        <span className={chipCls}>
          <span className="text-sky-200">{IconPin}</span>
          <span className="truncate">
            {l.region}
            {l.city ? `, ${l.city}` : ""}
          </span>
        </span>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 pt-0">
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 font-extrabold text-[clamp(12px,4.1cqw,15px)] text-white/92">
            <span className="inline-flex items-center gap-2">
              <span className="text-sky-200">{IconRuler}</span>
              {l.heightCm} sm
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="text-sky-200">{IconScale}</span>
              {l.weightKg} kg
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="text-sky-200">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
                  <path
                    d="M12 2 4 5v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V5l-8-3z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              {marital || "—"}
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="text-sky-200">{IconMoon}</span>
              {prayerLabel(l.prayer)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const hasStats = typeof viewsCount === "number" || typeof likesCount === "number";

  const meta =
    hasStats || isBoosted ? (
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 px-1 text-[12px] font-extrabold text-zinc-600">
        {hasStats ? (
          <>
            <span className="inline-flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" aria-hidden="true">
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" stroke="currentColor" strokeWidth="2" />
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
              </svg>
              {viewsCount ?? 0} ko‘rildi
            </span>
            <span className="inline-flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" aria-hidden="true">
                <path
                  d="M12 21s-7-4.35-9.5-9A5.5 5.5 0 0 1 12 6.5 5.5 5.5 0 0 1 21.5 12c-2.5 4.65-9.5 9-9.5 9z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
              </svg>
              {likesCount ?? 0} yoqtirma
              {isBoosted ? (
                <span title="Top" aria-label="Top e’lon" className="inline-flex text-amber-500">
                  <svg viewBox="0 0 24 24" className="h-3 w-3 shrink-0" fill="currentColor" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0l-4.725 2.885a.562.562 0 01-.84-.61l1.285-5.385a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                    />
                  </svg>
                </span>
              ) : null}
            </span>
          </>
        ) : null}
        {!hasStats && isBoosted ? (
          <span title="Top" aria-label="Top e’lon" className="ml-auto inline-flex text-amber-500">
            <svg viewBox="0 0 24 24" className="h-3 w-3 shrink-0" fill="currentColor" aria-hidden="true">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0l-4.725 2.885a.562.562 0 01-.84-.61l1.285-5.385a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
              />
            </svg>
          </span>
        ) : null}
      </div>
    ) : null;

  const wrapCls = shellCls + " ring-zinc-200/10";

  return (
    <article className="group relative">
      {disableLink ? (
        <div>
          <button
            type="button"
            onClick={onPress}
            aria-label={`${l.name}, ${l.age} yosh`}
            className={wrapCls}
          >
            {cover}
          </button>
          {meta}
        </div>
      ) : (
        <div>
          <Link href={`/listings/${l.id}`} aria-label={`${l.name}, ${l.age} yosh`} className={wrapCls}>
            {cover}
          </Link>
          {meta}
        </div>
      )}
    </article>
  );
}
