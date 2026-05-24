"use client";

import { useMemo, useState } from "react";
import { COUNTRIES } from "@/lib/countries";
import { INCOME_OPTIONS, SPORT_OPTIONS } from "@/lib/listingEditOptions";

export function inputCls() {
  return "h-11 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-[14px] font-semibold text-zinc-900 outline-none transition focus:border-zinc-300 focus:shadow-[0_0_0_4px_rgba(24,24,27,.06)]";
}

function chipCls(active: boolean) {
  return (
    "flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3.5 text-left text-[14px] font-semibold ring-1 transition active:scale-[0.99] " +
    (active ? "bg-zinc-950 text-white ring-zinc-950" : "bg-white text-zinc-900 ring-zinc-200 hover:bg-zinc-50")
  );
}

const IconCheck = (
  <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" aria-hidden>
    <path d="m5 12 5 5L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconSearch = (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7" />
    <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);

export function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
  min,
  max,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  min?: number;
  max?: number;
}) {
  return (
    <input
      className={inputCls()}
      type={type}
      min={min}
      max={max}
      value={value}
      placeholder={placeholder}
      autoFocus
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function TextAreaInput({
  value,
  onChange,
  placeholder,
  minHeight = 140,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  minHeight?: number;
}) {
  return (
    <textarea
      className="w-full resize-none rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-[14px] font-medium leading-relaxed text-zinc-900 outline-none transition focus:border-zinc-300 focus:shadow-[0_0_0_4px_rgba(24,24,27,.06)]"
      style={{ minHeight }}
      value={value}
      placeholder={placeholder}
      autoFocus
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function ChipsPicker({
  value,
  options,
  onChange,
}: {
  value: string;
  options: readonly (readonly [string, string])[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid gap-2">
      {options.map(([v, label]) => (
        <button key={v} type="button" className={chipCls(value === v)} onClick={() => onChange(v)}>
          <span>{label}</span>
          {value === v ? IconCheck : <span className="h-4 w-4" />}
        </button>
      ))}
    </div>
  );
}

export function OptionsPicker<T extends string | number | null>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="grid gap-2">
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          className={chipCls(value === o.value)}
          onClick={() => onChange(o.value)}
        >
          <span>{o.label}</span>
          {value === o.value ? IconCheck : <span className="h-4 w-4" />}
        </button>
      ))}
    </div>
  );
}

export function CountryPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return COUNTRIES;
    return COUNTRIES.filter((c) => c.name.toLowerCase().includes(s));
  }, [q]);

  return (
    <div className="grid gap-3">
      <label className="relative block">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">{IconSearch}</span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Davlat qidiring…"
          className="h-11 w-full rounded-2xl bg-zinc-50 pl-11 pr-4 text-[14px] font-semibold text-zinc-900 ring-1 ring-zinc-200 outline-none focus:bg-white focus:ring-zinc-300"
          autoFocus
        />
      </label>
      <ul className="max-h-[min(52vh,420px)] divide-y divide-zinc-100 overflow-y-auto rounded-2xl ring-1 ring-zinc-200">
        {filtered.length === 0 ? (
          <li className="px-4 py-8 text-center text-[13px] font-semibold text-zinc-500">Topilmadi</li>
        ) : (
          filtered.map((c) => {
            const active = value === c.name;
            return (
              <li key={c.code}>
                <button
                  type="button"
                  onClick={() => onChange(c.name)}
                  className={
                    "flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition " +
                    (active ? "bg-zinc-950 text-white" : "hover:bg-zinc-50")
                  }
                >
                  <span className="flex items-center gap-3">
                    <span className="text-lg leading-none">{c.flag}</span>
                    <span className="text-[14px] font-semibold">{c.name}</span>
                  </span>
                  {active ? <span className="text-white">{IconCheck}</span> : null}
                </button>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}

export function NumberPicker({
  value,
  onChange,
  min,
  max,
  step,
  unit,
}: {
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
  step: number;
  unit?: string;
}) {
  return (
    <div className="grid gap-5 py-2">
      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - step))}
          disabled={value <= min}
          className="inline-flex h-11 w-12 items-center justify-center rounded-full bg-white text-xl font-semibold text-zinc-900 ring-1 ring-zinc-200 disabled:opacity-40"
        >
          −
        </button>
        <div className="grid min-w-[120px] place-items-center rounded-3xl bg-zinc-50 px-8 py-5 ring-1 ring-zinc-200">
          <div className="text-3xl font-bold tabular-nums text-zinc-950">{value}</div>
          {unit ? <div className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">{unit}</div> : null}
        </div>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + step))}
          disabled={value >= max}
          className="inline-flex h-11 w-12 items-center justify-center rounded-full bg-white text-xl font-semibold text-zinc-900 ring-1 ring-zinc-200 disabled:opacity-40"
        >
          +
        </button>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-zinc-950"
      />
      <div className="flex justify-between text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

export function RangeAgePicker({
  from,
  to,
  onChangeFrom,
  onChangeTo,
}: {
  from: number | null;
  to: number | null;
  onChangeFrom: (n: number | null) => void;
  onChangeTo: (n: number | null) => void;
}) {
  const f = from ?? 22;
  const t = to ?? 32;
  return (
    <div className="grid gap-5 py-1">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-zinc-50 px-4 py-3.5 ring-1 ring-zinc-200">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Dan</div>
          <div className="mt-1 text-2xl font-bold tabular-nums text-zinc-950">{f}</div>
        </div>
        <div className="rounded-2xl bg-zinc-50 px-4 py-3.5 ring-1 ring-zinc-200">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Gacha</div>
          <div className="mt-1 text-2xl font-bold tabular-nums text-zinc-950">{t}</div>
        </div>
      </div>
      <div className="grid gap-2">
        <div className="text-[11px] font-semibold text-zinc-500">Eng kichik yosh</div>
        <input
          type="range"
          min={18}
          max={70}
          value={f}
          onChange={(e) => {
            const n = Number(e.target.value);
            onChangeFrom(n);
            if (t < n) onChangeTo(n);
          }}
          className="w-full accent-zinc-950"
        />
      </div>
      <div className="grid gap-2">
        <div className="text-[11px] font-semibold text-zinc-500">Eng katta yosh</div>
        <input
          type="range"
          min={18}
          max={70}
          value={t}
          onChange={(e) => {
            const n = Number(e.target.value);
            onChangeTo(n);
            if (f > n) onChangeFrom(n);
          }}
          className="w-full accent-zinc-950"
        />
      </div>
    </div>
  );
}

export function IncomePicker({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
}) {
  return <OptionsPicker value={value} options={INCOME_OPTIONS} onChange={onChange} />;
}

export function SportPicker({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
}) {
  return <OptionsPicker value={value} options={SPORT_OPTIONS} onChange={onChange} />;
}

export function TriStatePicker({
  value,
  onChange,
}: {
  value: boolean | null;
  onChange: (v: boolean | null) => void;
}) {
  const options: { value: boolean | null; label: string }[] = [
    { value: null, label: "Bilinmaydi" },
    { value: false, label: "Chekmaydi" },
    { value: true, label: "Chekadi" },
  ];
  return (
    <div className="grid gap-2">
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          className={chipCls(value === o.value)}
          onClick={() => onChange(o.value)}
        >
          <span>{o.label}</span>
          {value === o.value ? IconCheck : <span className="h-4 w-4" />}
        </button>
      ))}
    </div>
  );
}

export const POLYGAMY_OPTIONS = [
  { value: 1, label: "Faqat 1" },
  { value: 2, label: "2 gacha" },
  { value: 3, label: "3 gacha" },
  { value: 4, label: "4 gacha" },
] as const;
