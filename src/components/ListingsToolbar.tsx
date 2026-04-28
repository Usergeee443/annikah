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

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-2.5">
      <div className="flex items-end justify-between gap-2">
        <h3 className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-zinc-500">
          {title}
        </h3>
        {hint ? (
          <span className="text-[10.5px] font-semibold text-zinc-400">{hint}</span>
        ) : null}
      </div>
      {children}
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
}: {
  label: string;
  fromName: string;
  toName: string;
  fromValue?: string;
  toValue?: string;
  unit?: string;
}) {
  return (
    <Section title={label} hint={unit}>
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

  useEffect(() => {
    if (!open) return;
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = orig;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <form method="GET" action="/" className="grid gap-4">
      <input type="hidden" name="cat" value={cat} />

      {/* Top: title left, search+filter right (minimal) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-[18px] font-black tracking-tight text-zinc-950">
            Annikah
          </Link>
          <span className="hidden text-[18px] font-black tracking-tight text-zinc-950 md:inline">E’lonlar</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-[240px] max-w-[60vw]">
            <svg
              viewBox="0 0 24 24"
              className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
              fill="none"
            >
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
              <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <input
              name="q"
              defaultValue={initial.q ?? ""}
              placeholder="Qidirish…"
              className="h-10 w-full rounded-2xl border border-zinc-200 bg-white pl-10 pr-3 text-[12.5px] font-semibold text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-zinc-300 focus:shadow-[0_0_0_4px_rgba(24,24,27,.06)]"
            />
          </div>

          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            className={cn(
              "inline-flex h-10 items-center gap-2 rounded-2xl px-3 text-[12px] font-extrabold tracking-tight ring-1 transition",
              hasActiveFilters
                ? "bg-zinc-950 text-white ring-black/10 hover:bg-zinc-900"
                : "bg-white text-zinc-900 ring-zinc-200 hover:bg-zinc-50",
            )}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
              <path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Filter
            {hasActiveFilters ? (
              <span className="ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[10px] font-extrabold text-zinc-950">
                ON
              </span>
            ) : null}
          </button>
        </div>
      </div>

      {middle}

      {/* Center: category toggle (chat tabs style) */}
      <div className="flex justify-center">
        <div className="grid grid-cols-2 gap-1 rounded-2xl bg-zinc-100/80 p-1 ring-1 ring-zinc-200">
          <Link
            href={buildHref("kelinlar", initial)}
            className={cn(
              "h-9 rounded-xl px-6 text-[12px] font-extrabold tracking-tight transition inline-flex items-center justify-center",
              cat === "kelinlar"
                ? "bg-white text-zinc-950 shadow-sm ring-1 ring-zinc-200/80"
                : "text-zinc-600 hover:text-zinc-900",
            )}
          >
            Kelinlar
          </Link>
          <Link
            href={buildHref("kuyovlar", initial)}
            className={cn(
              "h-9 rounded-xl px-6 text-[12px] font-extrabold tracking-tight transition inline-flex items-center justify-center",
              cat === "kuyovlar"
                ? "bg-white text-zinc-950 shadow-sm ring-1 ring-zinc-200/80"
                : "text-zinc-600 hover:text-zinc-900",
            )}
          >
            Kuyovlar
          </Link>
        </div>
      </div>

      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden="true"
        className={cn(
          "fixed inset-0 z-40 bg-zinc-950/45 backdrop-blur-[3px] transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      {/* Drawer */}
      <aside
        aria-label="Filterlash"
        className={cn(
          "fixed right-0 top-0 z-50 flex h-screen w-[460px] max-w-[94vw] flex-col bg-white shadow-[0_30px_80px_rgba(15,23,42,.35)] transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* Drawer header */}
        <header className="flex items-start justify-between gap-3 border-b border-zinc-100 px-6 pb-4 pt-5">
          <div>
            <div className="text-[10.5px] font-extrabold uppercase tracking-[0.22em] text-zinc-500">
              Filter
            </div>
            <div className="mt-1 text-[18px] font-extrabold tracking-tight text-zinc-950">
              Mukammal qidiruv
            </div>
            <div className="mt-1 text-[12px] font-medium text-zinc-600">
              O‘zingizga mos juftni topish uchun parametrlarni tanlang.
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

        {/* Drawer body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="grid gap-6">
            <Section title="Asosiy ma’lumotlar">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
            />
            <Range
              label="Bo‘y"
              fromName="heightFrom"
              toName="heightTo"
              fromValue={initial.heightFrom}
              toValue={initial.heightTo}
              unit="sm"
            />
            <Range
              label="Vazn"
              fromName="weightFrom"
              toName="weightTo"
              fromValue={initial.weightFrom}
              toValue={initial.weightTo}
              unit="kg"
            />

            <Section title="Oilaviy holat">
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

            <Section title="Farzand">
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

            <Section title="Sigaret">
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

            <Section title="Ta’lim">
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

            <div className="rounded-3xl bg-zinc-50 p-4 ring-1 ring-zinc-200">
              <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-zinc-500">
                Diniy ma’lumotlar
              </div>

              <div className="mt-3 grid gap-4">
                <Section title="Aqida">
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

                <Section title="Namoz">
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

                <Section title="Qur’on tilovati">
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

                <Section title="Mazhab">
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

            <Section title="Ko‘pxotinlikka ruxsat" hint="kamida">
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
        <footer className="sticky bottom-0 border-t border-zinc-100 bg-white px-6 py-4">
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
