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
  "block w-full overflow-hidden rounded-2xl bg-white text-left ring-1 ring-zinc-200/80 shadow-[0_2px_18px_rgba(15,23,42,.04)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(15,23,42,.10)]";

export default function ListingCard({
  l,
  isFav,
  authed,
  hideFavorite,
  disableLink,
  onPress,
  coverBadge = "category",
}: ListingCardProps) {
  const [asOf] = useState(() => new Date());
  const boostMs = toMs(l.boostUntil);
  const isBoosted = boostMs !== null && boostMs > asOf.getTime();

  const isKelin = l.category === "kelinlar";
  const initial = (l.name?.trim()?.[0] || "?").toUpperCase();

  const gradient = isKelin
    ? "from-rose-300 via-fuchsia-500 to-rose-800"
    : "from-sky-300 via-indigo-500 to-blue-800";

  const marital = maritalShort(l.maritalStatus);

  const cover = (
    <div
      style={{ containerType: "inline-size" }}
      className={`relative aspect-square w-full overflow-hidden bg-linear-to-br ${gradient}`}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_28%_22%,rgba(255,255,255,.32),transparent_55%)]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,.42)_0%,transparent_42%)]"
      />

      {isBoosted ? (
        <span className="absolute left-2.5 top-2.5 inline-flex h-7 items-center gap-1 rounded-full bg-amber-400 px-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-amber-950 shadow-[0_4px_14px_rgba(245,158,11,.32)] ring-1 ring-amber-500">
          <svg viewBox="0 0 24 24" className="h-2.5 w-2.5" fill="currentColor">
            <path d="M12 2l2.7 6.3L22 9l-5 4.6 1.4 7.4L12 17l-6.4 4 1.4-7.4L2 9l7.3-.7z" />
          </svg>
          Top
        </span>
      ) : coverBadge === "pin" ? (
        <span
          className="absolute left-2.5 top-2.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/18 text-white ring-1 ring-white/30 backdrop-blur"
          aria-label="Asosiy e’lon"
        >
          <span className="scale-110 text-white">{IconPin}</span>
        </span>
      ) : (
        <span className="absolute left-2.5 top-2.5 inline-flex h-7 items-center rounded-full bg-white/15 px-2.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-white ring-1 ring-white/25 backdrop-blur">
          {isKelin ? "Kelin" : "Kuyov"}
        </span>
      )}

      <div className="absolute inset-0 flex items-center justify-center">
        <span
          aria-hidden
          style={{ fontSize: "58cqw", lineHeight: 1 }}
          className="select-none font-black tracking-[-0.04em] text-white/95 drop-shadow-[0_10px_28px_rgba(0,0,0,.30)]"
        >
          {initial}
        </span>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-3">
        <div className="truncate text-[16px] font-black leading-tight tracking-tight text-white drop-shadow">
          {l.name}, {l.age}
        </div>
        <div className="mt-0.5 flex items-center gap-1 truncate text-[11px] font-bold text-white/85">
          <span className="text-white/75">{IconPin}</span>
          <span className="truncate">
            {l.city}
            {l.country ? ` · ${l.country}` : ""}
          </span>
        </div>
      </div>
    </div>
  );

  const info = (
    <div className="p-3.5">
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-1.5 text-[11.5px] font-bold text-zinc-700">
          <span className="text-zinc-400">{IconRuler}</span>
          <span className="tabular-nums">{l.heightCm} sm</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11.5px] font-bold text-zinc-700">
          <span className="text-zinc-400">{IconScale}</span>
          <span className="tabular-nums">{l.weightKg} kg</span>
        </div>
      </div>

      {l.jobTitle ? (
        <div className="mt-1.5 flex items-center gap-1.5 text-[11.5px] font-bold text-zinc-700">
          <span className="text-zinc-400">{IconBriefcase}</span>
          <span className="truncate">{l.jobTitle}</span>
        </div>
      ) : null}

      <div className="mt-1.5 flex items-center gap-1.5 text-[11.5px] font-bold text-zinc-700">
        <span className="text-emerald-600">{IconMoon}</span>
        <span className="truncate">Namoz: {prayerLabel(l.prayer)}</span>
      </div>

      {marital ? (
        <div className="mt-2.5 flex items-center justify-between gap-2">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.14em] ring-1 ${
              isKelin ? "bg-rose-50 text-rose-700 ring-rose-200/80" : "bg-sky-50 text-sky-700 ring-sky-200/80"
            }`}
          >
            {marital}
          </span>
        </div>
      ) : null}
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
          {info}
        </button>
      ) : (
        <Link href={`/listings/${l.id}`} aria-label={`${l.name}, ${l.age} yosh`} className={shellCls}>
          {cover}
          {info}
        </Link>
      )}

      {!hideFavorite ? (
        <div className="absolute right-2 top-2 z-10">
          <FavoriteButton listingId={l.id} initial={isFav} authed={authed} variant="icon" />
        </div>
      ) : null}
    </article>
  );
}
