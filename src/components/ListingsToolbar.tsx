"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";

export type ToolbarSearch = {
  cat?: string;
  q?: string;
  ageFrom?: string;
  ageTo?: string;
  heightFrom?: string;
  heightTo?: string;
  weightFrom?: string;
  weightTo?: string;
  region?: string;
  city?: string;
  nationality?: string;
  marital?: string;
  children?: string;
  education?: string;
  smokes?: string;
  prayer?: string;
  aqeeda?: string;
  madhab?: string;
  quran?: string;
  poly?: string;
};

function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

const inputCls =
  "h-11 rounded-2xl border border-zinc-200 bg-white px-3 text-[13px] font-semibold text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-zinc-300 focus:shadow-[0_0_0_4px_rgba(24,24,27,.06)]";

type Accent = "rose" | "sky" | "emerald" | "amber" | "violet" | "fuchsia" | "indigo" | "zinc";

const ACCENTS: Record<
  Accent,
  { tint: string; ring: string; iconBg: string; iconText: string }
> = {
  rose: { tint: "bg-rose-50/70", ring: "ring-rose-200/60", iconBg: "bg-rose-100", iconText: "text-rose-700" },
  sky: { tint: "bg-sky-50/70", ring: "ring-sky-200/60", iconBg: "bg-sky-100", iconText: "text-sky-700" },
  emerald: { tint: "bg-emerald-50/70", ring: "ring-emerald-200/60", iconBg: "bg-emerald-100", iconText: "text-emerald-700" },
  amber: { tint: "bg-amber-50/70", ring: "ring-amber-200/60", iconBg: "bg-amber-100", iconText: "text-amber-800" },
  violet: { tint: "bg-violet-50/70", ring: "ring-violet-200/60", iconBg: "bg-violet-100", iconText: "text-violet-700" },
  fuchsia: { tint: "bg-fuchsia-50/70", ring: "ring-fuchsia-200/60", iconBg: "bg-fuchsia-100", iconText: "text-fuchsia-700" },
  indigo: { tint: "bg-indigo-50/70", ring: "ring-indigo-200/60", iconBg: "bg-indigo-100", iconText: "text-indigo-700" },
  zinc: { tint: "bg-zinc-50/80", ring: "ring-zinc-200", iconBg: "bg-zinc-100", iconText: "text-zinc-700" },
};

const STROKE = {
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const IconPin = (
  <svg viewBox="0 0 24 24" className="h-4 w-4" {...STROKE}>
    <path d="M12 22s7-7.5 7-13a7 7 0 1 0-14 0c0 5.5 7 13 7 13z" />
    <circle cx="12" cy="9" r="2.5" />
  </svg>
);
const IconCake = (
  <svg viewBox="0 0 24 24" className="h-4 w-4" {...STROKE}>
    <path d="M3 21h18M5 21V11a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10" />
    <path d="M3 16c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2" />
    <path d="M9 5v4M12 4v5M15 5v4" />
  </svg>
);
const IconRuler = (
  <svg viewBox="0 0 24 24" className="h-4 w-4" {...STROKE}>
    <path d="M3 17 17 3l4 4L7 21z" />
    <path d="m6 12 2 2M9 9l2 2M12 6l2 2" />
  </svg>
);
const IconScale = (
  <svg viewBox="0 0 24 24" className="h-4 w-4" {...STROKE}>
    <path d="M5 21h14M12 3v18" />
    <path d="m6 8 6-3 6 3" />
    <path d="M3 12c0 2 1.5 3 3 3s3-1 3-3l-3-6-3 6zM15 12c0 2 1.5 3 3 3s3-1 3-3l-3-6-3 6z" />
  </svg>
);
const IconHeart = (
  <svg viewBox="0 0 24 24" className="h-4 w-4" {...STROKE}>
    <path d="M12 21s-7-4.35-9.5-9A5.5 5.5 0 0 1 12 6.5 5.5 5.5 0 0 1 21.5 12c-2.5 4.65-9.5 9-9.5 9z" />
  </svg>
);
const IconBaby = (
  <svg viewBox="0 0 24 24" className="h-4 w-4" {...STROKE}>
    <circle cx="12" cy="9" r="4" />
    <path d="M9.5 8.5h.01M14.5 8.5h.01" />
    <path d="M9 11s1 1 3 1 3-1 3-1" />
    <path d="M5 21a7 7 0 0 1 14 0" />
  </svg>
);
const IconSmoke = (
  <svg viewBox="0 0 24 24" className="h-4 w-4" {...STROKE}>
    <rect x="2" y="14" width="14" height="4" rx="1" />
    <path d="M18 14v4M22 14v4" />
    <path d="M14 8c1-1 1-2 0-3M18 9c1-1 1-2 0-3" />
  </svg>
);
const IconCap = (
  <svg viewBox="0 0 24 24" className="h-4 w-4" {...STROKE}>
    <path d="M2 9 12 4l10 5-10 5L2 9z" />
    <path d="M6 11v5c0 1 3 2 6 2s6-1 6-2v-5" />
  </svg>
);
const IconBook = (
  <svg viewBox="0 0 24 24" className="h-4 w-4" {...STROKE}>
    <path d="M4 5a2 2 0 0 1 2-2h13v18H6a2 2 0 0 1-2-2V5z" />
    <path d="M19 17H6a2 2 0 0 0-2 2" />
  </svg>
);
const IconMoon = (
  <svg viewBox="0 0 24 24" className="h-4 w-4" {...STROKE}>
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </svg>
);
const IconQuran = (
  <svg viewBox="0 0 24 24" className="h-4 w-4" {...STROKE}>
    <path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4z" />
    <path d="M12 8v8M9 12h6" />
  </svg>
);
const IconMosque = (
  <svg viewBox="0 0 24 24" className="h-4 w-4" {...STROKE}>
    <path d="M12 3c-2 2-3 4-3 6 0 1.5 1 3 3 3s3-1.5 3-3c0-2-1-4-3-6z" />
    <path d="M3 21V11M21 21V11M9 21v-5a3 3 0 0 1 6 0v5M3 21h18" />
  </svg>
);
const IconUsers = (
  <svg viewBox="0 0 24 24" className="h-4 w-4" {...STROKE}>
    <circle cx="9" cy="8" r="3.5" />
    <circle cx="17" cy="9" r="2.5" />
    <path d="M3 20a6 6 0 0 1 12 0M14 20a4.5 4.5 0 0 1 7-3.5" />
  </svg>
);

function Section({
  title,
  hint,
  icon,
  accent = "zinc",
  children,
}: {
  title: string;
  hint?: string;
  icon?: ReactNode;
  accent?: Accent;
  children: ReactNode;
}) {
  const a = ACCENTS[accent];
  return (
    <section className={cn("rounded-3xl p-4 ring-1", a.tint, a.ring)}>
      <div className="flex items-center gap-2.5">
        {icon ? (
          <span className={cn("grid h-9 w-9 place-items-center rounded-2xl", a.iconBg, a.iconText)}>
            {icon}
          </span>
        ) : null}
        <div className="min-w-0 flex-1">
          <h3 className="text-[12.5px] font-extrabold tracking-tight text-zinc-950">{title}</h3>
          {hint ? <p className="text-[10.5px] font-semibold text-zinc-500">{hint}</p> : null}
        </div>
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Range({
  label,
  fromName,
  toName,
  fromValue,
  toValue,
  unit,
  icon,
  accent,
}: {
  label: string;
  fromName: string;
  toName: string;
  fromValue?: string;
  toValue?: string;
  unit?: string;
  icon?: ReactNode;
  accent?: Accent;
}) {
  return (
    <Section
      title={label}
      hint={unit ? `dan – gacha (${unit})` : undefined}
      icon={icon}
      accent={accent}
    >
      <div className="grid grid-cols-2 gap-2">
        <div className="relative">
          <input
            name={fromName}
            type="number"
            inputMode="numeric"
            defaultValue={fromValue ?? ""}
            placeholder="dan"
            className={cn(inputCls, "w-full pr-8")}
          />
          {unit ? (
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-extrabold text-zinc-400">
              {unit}
            </span>
          ) : null}
        </div>
        <div className="relative">
          <input
            name={toName}
            type="number"
            inputMode="numeric"
            defaultValue={toValue ?? ""}
            placeholder="gacha"
            className={cn(inputCls, "w-full pr-8")}
          />
          {unit ? (
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-extrabold text-zinc-400">
              {unit}
            </span>
          ) : null}
        </div>
      </div>
    </Section>
  );
}

function Chips({
  name,
  value,
  options,
}: {
  name: string;
  value?: string;
  options: { value: string; label: string }[];
}) {
  const v = value ?? "";
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <label key={opt.value} className="inline-flex">
          <input
            type="radio"
            name={name}
            value={opt.value}
            defaultChecked={v === opt.value}
            className="peer sr-only"
          />
          <span className="cursor-pointer rounded-full bg-white px-3 py-1.5 text-[11.5px] font-extrabold text-zinc-700 ring-1 ring-zinc-200 transition hover:bg-zinc-50 peer-checked:bg-zinc-950 peer-checked:text-white peer-checked:ring-zinc-950">
            {opt.label}
          </span>
        </label>
      ))}
    </div>
  );
}

function Logo() {
  return (
    <Link href="/" aria-label="Annikah" className="shrink-0 inline-flex items-center">
      <span className="text-[19px] font-black tracking-tight bg-linear-to-r from-rose-500 via-fuchsia-500 to-indigo-500 bg-clip-text text-transparent">
        Annikah
      </span>
    </Link>
  );
}

export default function ListingsToolbar({
  cat,
  initial,
  hasActiveFilters,
  middle,
}: {
  cat: "kelinlar" | "kuyovlar";
  initial: ToolbarSearch;
  hasActiveFilters: boolean;
  /** Toolbar va kategoriya tugmalari o‘rtasida (masalan, “E’loningizni yarating”) */
  middle?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = orig;
    };
  }, [open]);

  // Mobil bottom nav'ni filter ochilganda yashirish
  useEffect(() => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    if (!isMobile) return;
    window.dispatchEvent(new CustomEvent("annikah:bottomnav", { detail: { hidden: open } }));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const tabBtn = (active: boolean) =>
    cn(
      "h-9 rounded-xl px-3 text-[12px] font-extrabold tracking-tight transition inline-flex items-center justify-center",
      active
        ? "bg-white text-zinc-950 shadow-sm ring-1 ring-zinc-200/80"
        : "text-zinc-600 hover:text-zinc-900",
    );

  const tabBtnSm = (active: boolean) =>
    cn(
      "h-8 rounded-xl px-3 text-[11.5px] font-extrabold tracking-tight transition inline-flex items-center justify-center",
      active
        ? "bg-white text-zinc-950 shadow-sm ring-1 ring-zinc-200/80"
        : "text-zinc-600",
    );

  return (
    <form method="GET" action="/" className="grid gap-4">
      <input type="hidden" name="cat" value={cat} />

      {/* Top row */}
      <div className="flex items-center gap-2">
        {/* Desktopda sidebar’da logo bor — headerda yashiramiz */}
        <div className={cn("md:hidden", searchOpen ? "hidden" : "block")}>
          <Logo />
        </div>

        {/* Mobile: Kelinlar/Kuyovlar (qidiruv yopiq bo‘lganda) */}
        <div
          className={cn(
            "min-w-0 flex-1 md:hidden",
            searchOpen ? "hidden" : "block",
          )}
        >
          <div className="grid grid-cols-2 gap-1 rounded-2xl bg-zinc-100/80 p-1 ring-1 ring-zinc-200">
            <Link href={buildHref("kelinlar", initial)} className={tabBtnSm(cat === "kelinlar")}>
              Kelinlar
            </Link>
            <Link href={buildHref("kuyovlar", initial)} className={tabBtnSm(cat === "kuyovlar")}>
              Kuyovlar
            </Link>
          </div>
        </div>

        {/* Search input — desktop doimiy, mobil esa searchOpen bo‘lganda */}
        <div
          className={cn(
            "relative min-w-0 flex-1 md:flex-none md:w-[360px] lg:w-[420px]",
            searchOpen ? "block md:block" : "hidden md:block",
          )}
        >
          <svg
            viewBox="0 0 24 24"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
            <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <input
            name="q"
            defaultValue={initial.q ?? ""}
            placeholder="Qidirish"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="search"
            autoFocus={searchOpen}
            className="h-10 w-full rounded-2xl border border-zinc-200 bg-white pl-9 pr-3 text-[13px] font-semibold text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-zinc-300 focus:shadow-[0_0_0_3px_rgba(24,24,27,.05)]"
          />
        </div>

        {/* Mobile: Search/Close icon */}
        <button
          type="button"
          onClick={() => setSearchOpen((v) => !v)}
          aria-expanded={searchOpen}
          aria-label={searchOpen ? "Qidiruvni yopish" : "Qidiruv"}
          className={cn(
            "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ring-1 transition md:hidden",
            searchOpen
              ? "bg-zinc-950 text-white ring-black/10"
              : "bg-white text-zinc-900 ring-zinc-200 hover:bg-zinc-50",
          )}
        >
          {searchOpen ? (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
              <path
                d="M6 6l12 12M18 6 6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
              <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          )}
        </button>

        {/* Desktop: o'ng tomonda segment + filter (mobil: faqat filter) */}
        <div className="flex items-center gap-2 md:ml-auto">
          <div className="hidden md:block">
            <div className="grid h-10 grid-cols-2 gap-1 rounded-2xl bg-zinc-100/80 p-1 ring-1 ring-zinc-200">
              <Link href={buildHref("kelinlar", initial)} className={tabBtn(cat === "kelinlar")}>
                Kelinlar
              </Link>
              <Link href={buildHref("kuyovlar", initial)} className={tabBtn(cat === "kuyovlar")}>
                Kuyovlar
              </Link>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-label="Filter"
            className={cn(
              "relative inline-flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-2xl ring-1 transition md:w-auto md:px-3",
              hasActiveFilters
                ? "bg-zinc-950 text-white ring-black/10 hover:bg-zinc-900"
                : "bg-white text-zinc-900 ring-zinc-200 hover:bg-zinc-50",
            )}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 md:h-4 md:w-4" fill="none" aria-hidden="true">
              <path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="hidden text-[12px] font-extrabold tracking-tight md:inline">Filter</span>
            {hasActiveFilters ? (
              <span className="absolute right-1.5 top-1.5 inline-flex h-2 w-2 rounded-full bg-amber-400 md:static md:ml-1" />
            ) : null}
          </button>
        </div>
      </div>

      {middle}

      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden="true"
        className={cn(
          "fixed inset-0 z-40 bg-zinc-950/45 backdrop-blur-[3px] transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      {/* Drawer / Bottom sheet */}
      <aside
        aria-label="Filterlash"
        className={cn(
          "fixed z-50 flex flex-col bg-white shadow-[0_30px_80px_rgba(15,23,42,.35)] transition-transform duration-300 ease-out",
          // Mobile: bottom sheet
          "inset-x-0 bottom-0 max-h-[88dvh] w-full rounded-t-[28px]",
          // Desktop: right drawer
          "md:inset-x-auto md:bottom-auto md:right-0 md:top-0 md:h-screen md:max-h-none md:w-[460px] md:max-w-[94vw] md:rounded-none",
          open
            ? "translate-y-0 md:translate-x-0"
            : "translate-y-full md:translate-y-0 md:translate-x-full",
        )}
      >
        {/* Mobile drag handle */}
        <div className="flex justify-center pb-1 pt-2 md:hidden">
          <span className="h-1 w-10 rounded-full bg-zinc-300" />
        </div>

        {/* Drawer header */}
        <header className="flex items-start justify-between gap-3 border-b border-zinc-100 px-5 pb-4 pt-2 md:px-6 md:pt-5">
          <div>
            <div className="text-[10.5px] font-extrabold uppercase tracking-[0.22em] text-zinc-500">
              Filter
            </div>
            <div className="mt-1 text-[18px] font-extrabold tracking-tight text-zinc-950">
              Mukammal qidiruv
            </div>
            <div className="mt-1 text-[12px] font-medium text-zinc-600">
              Parametrlarni tanlang.
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Yopish"
            className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-zinc-50 text-zinc-700 ring-1 ring-zinc-200 transition hover:bg-zinc-100"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
              <path
                d="M6 6l12 12M6 18L18 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </header>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-5">
          <div className="grid gap-3">
            <Section title="Joylashuv" icon={IconPin} accent="sky">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <input
                  name="region"
                  defaultValue={initial.region ?? ""}
                  placeholder="Viloyat"
                  className={inputCls}
                />
                <input
                  name="city"
                  defaultValue={initial.city ?? ""}
                  placeholder="Shahar"
                  className={inputCls}
                />
                <input
                  name="nationality"
                  defaultValue={initial.nationality ?? ""}
                  placeholder="Millat"
                  className={cn(inputCls, "sm:col-span-2")}
                />
              </div>
            </Section>

            <Range
              label="Yosh"
              fromName="ageFrom"
              toName="ageTo"
              fromValue={initial.ageFrom}
              toValue={initial.ageTo}
              unit="yosh"
              icon={IconCake}
              accent="amber"
            />
            <Range
              label="Bo‘y"
              fromName="heightFrom"
              toName="heightTo"
              fromValue={initial.heightFrom}
              toValue={initial.heightTo}
              unit="sm"
              icon={IconRuler}
              accent="emerald"
            />
            <Range
              label="Vazn"
              fromName="weightFrom"
              toName="weightTo"
              fromValue={initial.weightFrom}
              toValue={initial.weightTo}
              unit="kg"
              icon={IconScale}
              accent="indigo"
            />

            <Section title="Oilaviy holat" icon={IconHeart} accent="rose">
              <Chips
                name="marital"
                value={initial.marital}
                options={[
                  { value: "", label: "Hammasi" },
                  { value: "boydoq", label: "Bo‘ydoq" },
                  { value: "ajrashgan", label: "Ajrashgan" },
                  { value: "beva", label: "Beva" },
                ]}
              />
            </Section>

            <Section title="Farzand" icon={IconBaby} accent="fuchsia">
              <Chips
                name="children"
                value={initial.children}
                options={[
                  { value: "", label: "Hammasi" },
                  { value: "yoq", label: "Yo‘q" },
                  { value: "bor", label: "Bor" },
                ]}
              />
            </Section>

            <Section title="Sigaret" icon={IconSmoke} accent="zinc">
              <Chips
                name="smokes"
                value={initial.smokes}
                options={[
                  { value: "", label: "Hammasi" },
                  { value: "no", label: "Chekmaydi" },
                  { value: "yes", label: "Chekadi" },
                ]}
              />
            </Section>

            <Section title="Ta’lim" icon={IconCap} accent="sky">
              <Chips
                name="education"
                value={initial.education}
                options={[
                  { value: "", label: "Hammasi" },
                  { value: "oliy", label: "Oliy" },
                  { value: "orta", label: "O‘rta maxsus" },
                  { value: "boshqa", label: "Boshqa" },
                ]}
              />
            </Section>

            {/* Diniy ma'lumotlar */}
            <div className="rounded-3xl bg-emerald-50/50 p-3 ring-1 ring-emerald-200/60">
              <div className="px-1 pt-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-emerald-700">
                Diniy ma’lumotlar
              </div>
              <div className="mt-2 grid gap-3">
                <Section title="Aqida" icon={IconBook} accent="emerald">
                  <Chips
                    name="aqeeda"
                    value={initial.aqeeda}
                    options={[
                      { value: "", label: "Hammasi" },
                      { value: "ahli_sunna", label: "Ahli sunna" },
                      { value: "salafiy", label: "Salafiy" },
                      { value: "boshqa", label: "Boshqa" },
                    ]}
                  />
                </Section>

                <Section title="Namoz" icon={IconMoon} accent="violet">
                  <Chips
                    name="prayer"
                    value={initial.prayer}
                    options={[
                      { value: "", label: "Hammasi" },
                      { value: "farz", label: "Doimiy" },
                      { value: "bazan", label: "Ba’zan" },
                      { value: "oqimaydi", label: "O‘qimaydi" },
                    ]}
                  />
                </Section>

                <Section title="Qur’on tilovati" icon={IconQuran} accent="amber">
                  <Chips
                    name="quran"
                    value={initial.quran}
                    options={[
                      { value: "", label: "Hammasi" },
                      { value: "qiroat_yaxshi", label: "Qiroat yaxshi" },
                      { value: "ortacha", label: "O‘rtacha" },
                      { value: "oqimaydi", label: "O‘qimaydi" },
                    ]}
                  />
                </Section>

                <Section title="Mazhab" icon={IconMosque} accent="sky">
                  <Chips
                    name="madhab"
                    value={initial.madhab}
                    options={[
                      { value: "", label: "Hammasi" },
                      { value: "hanafiy", label: "Hanafiy" },
                      { value: "shofiiy", label: "Shofi’iy" },
                      { value: "molikiy", label: "Molikiy" },
                      { value: "hanbaliy", label: "Hanbaliy" },
                    ]}
                  />
                </Section>
              </div>
            </div>

            <Section title="Ko‘pxotinlikka ruxsat" hint="kamida" icon={IconUsers} accent="amber">
              <Chips
                name="poly"
                value={initial.poly}
                options={[
                  { value: "", label: "Farqsiz" },
                  { value: "1", label: "1-ro‘zg‘or" },
                  { value: "2", label: "2-ro‘zg‘or" },
                  { value: "3", label: "3-ro‘zg‘or" },
                ]}
              />
            </Section>
          </div>
        </div>

        {/* Drawer footer */}
        <footer
          className="sticky bottom-0 border-t border-zinc-100 bg-white px-5 py-3 md:px-6 md:py-4"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)" }}
        >
          <div className="flex items-center gap-2">
            <Link
              href={`/?cat=${cat}`}
              onClick={() => setOpen(false)}
              className="inline-flex h-11 flex-1 items-center justify-center rounded-2xl bg-white px-4 text-[12px] font-extrabold text-zinc-900 ring-1 ring-zinc-200 transition hover:bg-zinc-50"
            >
              Tozalash
            </Link>
            <button
              type="submit"
              className="inline-flex h-11 flex-[1.4] items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-5 text-[12px] font-extrabold tracking-tight text-white ring-1 ring-black/10 transition hover:bg-zinc-900"
            >
              Qidirishni qo‘llash
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
                <path
                  d="M5 12h14M13 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </footer>
      </aside>
    </form>
  );
}

function buildHref(cat: "kelinlar" | "kuyovlar", initial: ToolbarSearch) {
  const merged: Record<string, string | undefined> = { ...initial, cat };
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) {
    if (v !== undefined && v !== null && String(v).length > 0) params.set(k, String(v));
  }
  const qs = params.toString();
  return qs ? `/?${qs}` : "/";
}
