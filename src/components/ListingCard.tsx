"use client";

import Link from "next/link";
import { useState } from "react";
import FavoriteButton from "@/components/FavoriteButton";

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
  hideFavorite?: boolean;
  disableLink?: boolean;
  onPress?: () => void;
  /** `pin` — faqat pin belgisi (masalan, asosiy e’lon) */
  coverBadge?: "category" | "pin";
  /** Reyting (masalan #3) */
  rank?: number;
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
const IconBriefcase = (
  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="none">
    <rect x="3" y="7" width="18" height="13" rx="2.2" stroke="currentColor" strokeWidth="1.7" />
    <path
      d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 12h18"
      stroke="currentColor"
      strokeWidth="1.7"
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
  "block w-full overflow-hidden rounded-3xl bg-[#0b0f0e] text-left ring-1 ring-zinc-200/10 shadow-[0_10px_40px_rgba(15,23,42,.18)] transition";

export default function ListingCard({
  l,
  isFav,
  authed,
  hideFavorite,
  disableLink,
  onPress,
  coverBadge = "category",
  rank,
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
    "inline-flex min-w-0 max-w-[42cqw] items-center gap-2 rounded-full bg-black/55 px-3 py-1.5 text-[11px] font-black tracking-tight text-white ring-1 ring-white/14 backdrop-blur";

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

      {!hideFavorite ? (
        <div className="absolute right-4 top-4 z-10">
          <FavoriteButton listingId={l.id} initial={isFav} authed={authed} variant="icon" />
        </div>
      ) : null}

      {/* top chips */}
      <div className="absolute left-4 right-4 top-4 flex flex-wrap items-center gap-2 pr-12">
        {typeof rank === "number" ? (
          <span className="inline-flex items-center rounded-xl bg-lime-400 px-2.5 py-1 text-[11px] font-black text-black shadow-[0_8px_20px_rgba(163,230,53,.28)]">
            #{rank}
          </span>
        ) : null}
        {isBoosted ? (
          <span className={chipCls}>
            <span className="text-emerald-300">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                <path d="M12 2l2.7 6.3L22 9l-5 4.6 1.4 7.4L12 17l-6.4 4 1.4-7.4L2 9l7.3-.7z" />
              </svg>
            </span>
            TOP
          </span>
        ) : null}

        {l.nationality ? (
          <span className={chipCls}>
            <span className="text-emerald-300">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
                <path
                  d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path d="M2 12h20" stroke="currentColor" strokeWidth="2" />
              </svg>
            </span>
            <span className="truncate">{l.nationality.toUpperCase()}</span>
          </span>
        ) : null}

        {l.country ? (
          <span className={chipCls}>
            <span className="text-emerald-300">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
                <path
                  d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M12 2c3 3.2 3 16.8 0 20M12 2c-3 3.2-3 16.8 0 20"
                  stroke="currentColor"
                  strokeWidth="2"
                  opacity=".85"
                />
              </svg>
            </span>
            <span className="truncate">{l.country.toUpperCase()}</span>
          </span>
        ) : null}

        {l.city ? (
          <span className={chipCls}>
            <span className="text-emerald-300">{IconPin}</span>
            <span className="truncate">{l.city.toUpperCase()}</span>
          </span>
        ) : null}
      </div>

      {/* bottom panel (name + info) */}
      <div className="absolute bottom-0 left-0 right-0 p-6 pt-0">
        <div className="grid gap-3">
          <div className="font-black leading-none tracking-tight text-white drop-shadow-[0_10px_30px_rgba(0,0,0,.55)] text-[clamp(22px,8cqw,34px)]">
            {l.name} <span className="text-white/65 text-[clamp(14px,5cqw,20px)]">{l.age} yosh</span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-white/90">
            <div className="flex flex-wrap items-center gap-5 font-extrabold text-[clamp(12px,4.3cqw,16px)]">
              <span className="inline-flex items-center gap-2">
                <span className="text-emerald-300">{IconRuler}</span>
                {l.heightCm} sm • {l.weightKg} kg
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-5 font-extrabold text-[clamp(12px,4.3cqw,16px)]">
              <span className="inline-flex items-center gap-2">
                <span className="text-emerald-300">{IconMoon}</span>
                {prayerLabel(l.prayer)}
              </span>
              {marital ? (
                <span className="inline-flex items-center gap-2">
                  <span className="text-emerald-300">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
                      <path
                        d="M12 2 4 5v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V5l-8-3z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  {marital}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <article className="group relative">
      {disableLink ? (
        <button
          type="button"
          onClick={onPress}
          aria-label={`${l.name}, ${l.age} yosh`}
          className={shellCls}
        >
          {cover}
        </button>
      ) : (
        <Link href={`/listings/${l.id}`} aria-label={`${l.name}, ${l.age} yosh`} className={shellCls}>
          {cover}
        </Link>
      )}
    </article>
  );
}
