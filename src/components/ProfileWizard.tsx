"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { COUNTRIES, findCountryByName, type Country } from "@/lib/countries";

/* ============================================================ Types */

export type ProfileData = {
  category: "kelinlar" | "kuyovlar";
  name: string;
  age: number;
  country: string;
  region: string;
  city: string;
  nationality: string;
  heightCm: number;
  weightKg: number;
  smokes: "yes" | "no" | "";
  sportPerWeek: number | null;
  maritalStatus: string;
  children: string;
  polygamyAllowance: number | null;
  education: string;
  jobTitle: string;
  incomeMonthlyUsd: number | null;
  aqeeda: string;
  prayer: string;
  quran: string;
  madhab: string;
  partnerAgeFrom: number | null;
  partnerAgeTo: number | null;
  partnerCountries: string;
  partnerRegions: string;
  partnerCities: string;
  about: string;
};

type AnyProfile = Partial<ProfileData> | null | undefined;

type SaveResult = { ok: true } | { ok: false; error: string };

/* ============================================================ Defaults */

function defaults(p: AnyProfile): ProfileData {
  return {
    category: (p as any)?.category === "kuyovlar" ? "kuyovlar" : "kelinlar",
    name: p?.name ?? "",
    age: typeof p?.age === "number" && p.age > 0 ? p.age : 25,
    country: p?.country ?? "",
    region: p?.region ?? "",
    city: p?.city ?? "",
    nationality: p?.nationality ?? "",
    heightCm: typeof p?.heightCm === "number" && p.heightCm > 0 ? p.heightCm : 170,
    weightKg: typeof p?.weightKg === "number" && p.weightKg > 0 ? p.weightKg : 65,
    smokes:
      p?.smokes === "yes" || p?.smokes === "no"
        ? (p.smokes as "yes" | "no")
        : "",
    sportPerWeek: p?.sportPerWeek ?? null,
    maritalStatus: p?.maritalStatus ?? "",
    children: p?.children ?? "",
    polygamyAllowance: p?.polygamyAllowance ?? null,
    education: p?.education ?? "",
    jobTitle: p?.jobTitle ?? "",
    incomeMonthlyUsd: p?.incomeMonthlyUsd ?? null,
    aqeeda: p?.aqeeda ?? "",
    prayer: p?.prayer ?? "",
    quran: p?.quran ?? "",
    madhab: p?.madhab ?? "",
    partnerAgeFrom: p?.partnerAgeFrom ?? null,
    partnerAgeTo: p?.partnerAgeTo ?? null,
    partnerCountries: p?.partnerCountries ?? "",
    partnerRegions: p?.partnerRegions ?? "",
    partnerCities: p?.partnerCities ?? "",
    about: p?.about ?? "",
  };
}

/* ============================================================ Step config */

type StepKind =
  | "welcome"
  | "text"
  | "number"
  | "country"
  | "chips"
  | "rangeAge"
  | "textarea"
  | "review";

type Step = {
  key: string;
  group: string;
  kind: StepKind;
  title: string;
  subtitle?: string;
  optional?: boolean;
  // for text/textarea
  field?: keyof ProfileData;
  placeholder?: string;
  // for number
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  // for chips
  choices?: { value: string; label: string; sub?: string; emoji?: string }[];
  isValid?: (d: ProfileData) => boolean;
};

const GROUPS = [
  "Tanishuv",
  "Asosiy",
  "Jismoniy",
  "Shaxsiy",
  "Ta’lim & kasb",
  "Diniy",
  "Juftga talab",
  "Yakuniy",
];

const STEPS: Step[] = [
  {
    key: "welcome",
    group: "Tanishuv",
    kind: "welcome",
    title: "Salom! Keling, tanishamiz.",
    subtitle:
      "Bir nechta savol bilan profilingizni to‘ldiramiz. Har bir savol alohida — qulay va tez.",
    isValid: () => true,
  },
  {
    key: "category",
    group: "Tanishuv",
    kind: "chips",
    title: "Siz kimsiz?",
    subtitle: "Bu tanlov e’lonlaringiz kategoriyasini belgilaydi.",
    field: "category",
    choices: [
      { value: "kelinlar", label: "Kelin (ayol)" },
      { value: "kuyovlar", label: "Kuyov (erkak)" },
    ],
    isValid: (d) => d.category === "kelinlar" || d.category === "kuyovlar",
  },
  {
    key: "name",
    group: "Asosiy",
    kind: "text",
    title: "Ismingiz nima?",
    subtitle: "E’loningizda shu ism ko‘rsatiladi.",
    field: "name",
    placeholder: "Bekzod",
    isValid: (d) => d.name.trim().length >= 2,
  },
  {
    key: "age",
    group: "Asosiy",
    kind: "number",
    title: "Yoshingiz nechida?",
    subtitle: "18 yoshdan kichik bo‘lganlar saytdan foydalana olmaydi.",
    field: "age",
    min: 18,
    max: 80,
    step: 1,
    unit: "yosh",
    isValid: (d) => d.age >= 18 && d.age <= 80,
  },
  {
    key: "country",
    group: "Asosiy",
    kind: "country",
    title: "Qaysi davlatda yashaysiz?",
    subtitle: "Ro‘yxatdan tanlang yoki qidiring.",
    field: "country",
    isValid: (d) => d.country.trim().length > 0,
  },
  {
    key: "region",
    group: "Asosiy",
    kind: "text",
    title: "Viloyat / hudud?",
    subtitle: "Masalan: Toshkent, Farg‘ona, Samarqand.",
    field: "region",
    placeholder: "Toshkent",
    isValid: (d) => d.region.trim().length > 1,
  },
  {
    key: "city",
    group: "Asosiy",
    kind: "text",
    title: "Shahar yoki tuman?",
    subtitle: "Aniqroq joylashuvni kiriting.",
    field: "city",
    placeholder: "Yashnobod",
    isValid: (d) => d.city.trim().length > 1,
  },
  {
    key: "nationality",
    group: "Asosiy",
    kind: "chips",
    title: "Millatingiz?",
    subtitle: "Quyidagilardan birini tanlang yoki ‘Boshqa’ ni tanlab keyin yozing.",
    field: "nationality",
    choices: [
      { value: "O‘zbek", label: "O‘zbek" },
      { value: "Qozoq", label: "Qozoq" },
      { value: "Qirg‘iz", label: "Qirg‘iz" },
      { value: "Tojik", label: "Tojik" },
      { value: "Turkman", label: "Turkman" },
      { value: "Uyg‘ur", label: "Uyg‘ur" },
      { value: "Tatar", label: "Tatar" },
      { value: "Boshqird", label: "Boshqird" },
      { value: "Arab", label: "Arab" },
      { value: "Turk", label: "Turk" },
      { value: "Boshqa", label: "Boshqa" },
    ],
    isValid: (d) => d.nationality.trim().length > 0,
  },

  {
    key: "heightCm",
    group: "Jismoniy",
    kind: "number",
    title: "Bo‘yingiz qancha?",
    subtitle: "Sm-da. Slider yoki +/- tugmalardan foydalaning.",
    field: "heightCm",
    min: 140,
    max: 220,
    step: 1,
    unit: "sm",
    isValid: (d) => d.heightCm >= 140 && d.heightCm <= 220,
  },
  {
    key: "weightKg",
    group: "Jismoniy",
    kind: "number",
    title: "Vazningiz qancha?",
    subtitle: "Kg-da.",
    field: "weightKg",
    min: 35,
    max: 180,
    step: 1,
    unit: "kg",
    isValid: (d) => d.weightKg >= 35 && d.weightKg <= 180,
  },
  {
    key: "smokes",
    group: "Jismoniy",
    kind: "chips",
    title: "Sigaret chekasizmi?",
    field: "smokes",
    choices: [
      { value: "no", label: "Yo‘q", emoji: "🚭" },
      { value: "yes", label: "Ha", emoji: "🚬" },
    ],
    isValid: (d) => d.smokes === "yes" || d.smokes === "no",
  },
  {
    key: "sportPerWeek",
    group: "Jismoniy",
    kind: "number",
    title: "Sport bilan haftasiga necha marta?",
    subtitle: "Shug‘ullanmasangiz 0 qoldiring yoki o‘tkazib yuboring.",
    field: "sportPerWeek",
    min: 0,
    max: 14,
    step: 1,
    unit: "marta",
    optional: true,
    isValid: () => true,
  },

  {
    key: "maritalStatus",
    group: "Shaxsiy",
    kind: "chips",
    title: "Oilaviy holatingiz?",
    field: "maritalStatus",
    choices: [
      { value: "boydoq", label: "Bo‘ydoq", emoji: "🌱" },
      { value: "ajrashgan", label: "Ajrashgan", emoji: "🌗" },
      { value: "beva", label: "Beva", emoji: "🌙" },
    ],
    isValid: (d) => !!d.maritalStatus && d.maritalStatus !== "bilinmaydi",
  },
  {
    key: "children",
    group: "Shaxsiy",
    kind: "chips",
    title: "Farzandingiz bormi?",
    field: "children",
    choices: [
      { value: "yoq", label: "Yo‘q" },
      { value: "bor", label: "Bor" },
    ],
    isValid: (d) => d.children === "yoq" || d.children === "bor",
  },
  {
    key: "polygamyAllowance",
    group: "Shaxsiy",
    kind: "chips",
    title: "Necha xotinlikka rozisiz?",
    subtitle: "Ko‘pxotinlikka chegara. Roziligingizni belgilang.",
    field: "polygamyAllowance",
    optional: true,
    choices: [
      { value: "1", label: "Faqat 1-ro‘zg‘or", sub: "1" },
      { value: "2", label: "2 ro‘zg‘orgacha", sub: "2" },
      { value: "3", label: "3 ro‘zg‘orgacha", sub: "3" },
      { value: "4", label: "4 ro‘zg‘orgacha", sub: "4" },
    ],
    isValid: () => true,
  },

  {
    key: "education",
    group: "Ta’lim & kasb",
    kind: "chips",
    title: "Ta’lim darajangiz?",
    field: "education",
    choices: [
      { value: "orta", label: "O‘rta" },
      { value: "orta_maxsus", label: "O‘rta maxsus" },
      { value: "oliy", label: "Oliy" },
      { value: "boshqa", label: "Boshqa" },
    ],
    isValid: (d) => !!d.education && d.education !== "bilinmaydi",
  },
  {
    key: "jobTitle",
    group: "Ta’lim & kasb",
    kind: "text",
    title: "Kasbingiz nima?",
    subtitle: "Masalan: Dasturchi, O‘qituvchi, Shifokor.",
    field: "jobTitle",
    placeholder: "Dasturchi",
    isValid: (d) => d.jobTitle.trim().length >= 2,
  },
  {
    key: "incomeMonthlyUsd",
    group: "Ta’lim & kasb",
    kind: "number",
    title: "Oyiga taxminiy daromadingiz ($)?",
    subtitle: "Maxfiy bo‘lib qoladi. Aniq belgilamoqchi bo‘lmasangiz, o‘tkazib yuboring.",
    field: "incomeMonthlyUsd",
    min: 0,
    max: 20000,
    step: 50,
    unit: "$",
    optional: true,
    isValid: () => true,
  },

  {
    key: "aqeeda",
    group: "Diniy",
    kind: "chips",
    title: "Aqidangiz qaysi?",
    field: "aqeeda",
    choices: [
      { value: "ahli_sunna", label: "Ahli sunna val jamoa" },
      { value: "salafiy", label: "Salafiy" },
      { value: "boshqa", label: "Boshqa" },
    ],
    isValid: (d) => !!d.aqeeda && d.aqeeda !== "bilinmaydi",
  },
  {
    key: "prayer",
    group: "Diniy",
    kind: "chips",
    title: "Namoz o‘qiysizmi?",
    field: "prayer",
    choices: [
      { value: "farz", label: "Doimiy o‘qiyman" },
      { value: "bazan", label: "Ba’zan" },
      { value: "oqimaydi", label: "O‘qimayman" },
    ],
    isValid: (d) => !!d.prayer && d.prayer !== "bilinmaydi",
  },
  {
    key: "quran",
    group: "Diniy",
    kind: "chips",
    title: "Qur’on tilovati?",
    field: "quran",
    choices: [
      { value: "qiroat_yaxshi", label: "Qiroatim yaxshi" },
      { value: "ortacha", label: "O‘rtacha" },
      { value: "oqimaydi", label: "O‘qimayman" },
    ],
    isValid: (d) => !!d.quran && d.quran !== "bilinmaydi",
  },
  {
    key: "madhab",
    group: "Diniy",
    kind: "chips",
    title: "Mazhabingiz?",
    field: "madhab",
    choices: [
      { value: "hanafiy", label: "Hanafiy" },
      { value: "shofiiy", label: "Shofi’iy" },
      { value: "molikiy", label: "Molikiy" },
      { value: "hanbaliy", label: "Hanbaliy" },
      { value: "boshqa", label: "Boshqa" },
    ],
    isValid: (d) => !!d.madhab && d.madhab !== "bilinmaydi",
  },

  {
    key: "partnerAge",
    group: "Juftga talab",
    kind: "rangeAge",
    title: "Juft uchun yosh oralig‘i?",
    subtitle: "Ixtiyoriy. O‘tkazib yuborsangiz farqsiz hisoblanadi.",
    optional: true,
    isValid: () => true,
  },
  {
    key: "partnerLocation",
    group: "Juftga talab",
    kind: "textarea",
    title: "Juft uchun joylashuv (ixtiyoriy)?",
    subtitle: "Davlat / Viloyat / Shahar — vergul bilan ajrating.",
    optional: true,
    isValid: () => true,
  },

  {
    key: "about",
    group: "Yakuniy",
    kind: "textarea",
    title: "O‘zingiz haqida bir necha jumla.",
    subtitle: "Qisqacha tavsif yozing — qiziqishlar, xarakter va h.k.",
    field: "about",
    placeholder: "O‘zim haqida...",
    isValid: (d) => d.about.trim().length >= 30,
  },
  {
    key: "review",
    group: "Yakuniy",
    kind: "review",
    title: "Hammasi tayyor!",
    subtitle: "Quyida ma’lumotlarni tekshirib chiqing va tasdiqlang.",
    isValid: () => true,
  },
];

/* ============================================================ icons */

const I = {
  back: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  forward: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  close: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7" />
      <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <path d="m5 12 5 5L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  edit: (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none">
      <path d="M4 20h4l11-11-4-4L4 16v4z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  ),
  spark: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      <path d="M12 2 14 9l7 1-5 5 1 7-7-3.5L5 22l1-7-5-5 7-1z" />
    </svg>
  ),
};

/* ============================================================ Number picker */

function NumberPicker({
  value,
  setValue,
  min,
  max,
  step,
  unit,
}: {
  value: number;
  setValue: (n: number) => void;
  min: number;
  max: number;
  step: number;
  unit?: string;
}) {
  const dec = () => setValue(Math.max(min, value - step));
  const inc = () => setValue(Math.min(max, value + step));

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-center gap-5">
        <button
          type="button"
          onClick={dec}
          disabled={value <= min}
          className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl font-extrabold text-zinc-900 ring-1 ring-zinc-200 shadow-sm transition hover:bg-zinc-50 disabled:opacity-40"
          aria-label="Kamaytirish"
        >
          −
        </button>
        <div className="grid place-items-center rounded-3xl bg-white px-8 py-5 ring-1 ring-zinc-200/80 shadow-[0_2px_18px_rgba(15,23,42,.05)]">
          <div className="text-[64px] font-black leading-none tracking-tight text-zinc-950 tabular-nums">
            {value}
          </div>
          {unit ? (
            <div className="mt-2 text-[12px] font-extrabold uppercase tracking-[0.18em] text-zinc-500">
              {unit}
            </div>
          ) : null}
        </div>
        <button
          type="button"
          onClick={inc}
          disabled={value >= max}
          className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl font-extrabold text-zinc-900 ring-1 ring-zinc-200 shadow-sm transition hover:bg-zinc-50 disabled:opacity-40"
          aria-label="Oshirish"
        >
          +
        </button>
      </div>

      <div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="w-full accent-zinc-950"
        />
        <div className="mt-1.5 flex items-center justify-between text-[10.5px] font-extrabold uppercase tracking-[0.18em] text-zinc-400">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>
    </div>
  );
}

/* ============================================================ Country picker */

function CountryPicker({
  value,
  setValue,
}: {
  value: string;
  setValue: (s: string) => void;
}) {
  const [q, setQ] = useState("");
  const filtered = useMemo<Country[]>(() => {
    const s = q.trim().toLowerCase();
    if (!s) return COUNTRIES;
    return COUNTRIES.filter((c) => c.name.toLowerCase().includes(s));
  }, [q]);

  return (
    <div className="grid gap-3">
      <label className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
          {I.search}
        </span>
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Davlat qidiring..."
          className="h-12 w-full rounded-2xl bg-white pl-11 pr-4 text-[14px] font-semibold text-zinc-950 ring-1 ring-zinc-200 outline-none transition focus:ring-zinc-300"
        />
      </label>

      <div className="max-h-[44vh] overflow-y-auto rounded-2xl bg-white ring-1 ring-zinc-200">
        <ul className="divide-y divide-zinc-100">
          {filtered.length === 0 ? (
            <li className="px-4 py-6 text-center text-[13px] font-semibold text-zinc-500">
              Topilmadi
            </li>
          ) : (
            filtered.map((c) => {
              const active = value === c.name;
              return (
                <li key={c.code}>
                  <button
                    type="button"
                    onClick={() => setValue(c.name)}
                    className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition ${
                      active ? "bg-zinc-950 text-white" : "hover:bg-zinc-50"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-[22px] leading-none">{c.flag}</span>
                      <span className="text-[14px] font-extrabold tracking-tight">
                        {c.name}
                      </span>
                    </span>
                    {active ? (
                      <span className="text-white">{I.check}</span>
                    ) : null}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
}

/* ============================================================ Chips */

function Chips({
  value,
  setValue,
  choices,
}: {
  value: string;
  setValue: (s: string) => void;
  choices: { value: string; label: string; sub?: string; emoji?: string }[];
}) {
  return (
    <div className="grid gap-2.5">
      {choices.map((c) => {
        const active = value === c.value;
        return (
          <button
            key={c.value}
            type="button"
            onClick={() => setValue(c.value)}
            className={`group flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-4 text-left ring-1 transition ${
              active
                ? "bg-zinc-950 text-white ring-zinc-950 shadow-[0_8px_24px_rgba(15,23,42,.18)]"
                : "bg-white text-zinc-900 ring-zinc-200 hover:bg-zinc-50"
            }`}
          >
            <span className="flex items-center gap-3">
              {c.emoji ? <span className="text-[22px] leading-none">{c.emoji}</span> : null}
              <span>
                <span className="block text-[15px] font-extrabold tracking-tight">
                  {c.label}
                </span>
                {c.sub ? (
                  <span
                    className={`block text-[11px] font-semibold ${
                      active ? "text-white/70" : "text-zinc-500"
                    }`}
                  >
                    {c.sub}
                  </span>
                ) : null}
              </span>
            </span>
            <span
              className={`inline-flex h-7 w-7 items-center justify-center rounded-full ring-1 transition ${
                active
                  ? "bg-white/15 text-white ring-white/30"
                  : "bg-zinc-50 text-zinc-300 ring-zinc-200 group-hover:bg-white"
              }`}
            >
              {active ? I.check : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ============================================================ Range Age */

function RangeAge({
  from,
  to,
  setFrom,
  setTo,
}: {
  from: number | null;
  to: number | null;
  setFrom: (n: number | null) => void;
  setTo: (n: number | null) => void;
}) {
  const f = from ?? 22;
  const t = to ?? 32;
  return (
    <div className="grid gap-5">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white px-4 py-3.5 ring-1 ring-zinc-200">
          <div className="text-[10.5px] font-extrabold uppercase tracking-[0.18em] text-zinc-500">
            Dan
          </div>
          <div className="mt-1 text-[28px] font-black leading-none tracking-tight text-zinc-950 tabular-nums">
            {f}
            <span className="ml-1 text-[12px] font-bold text-zinc-500">yosh</span>
          </div>
        </div>
        <div className="rounded-2xl bg-white px-4 py-3.5 ring-1 ring-zinc-200">
          <div className="text-[10.5px] font-extrabold uppercase tracking-[0.18em] text-zinc-500">
            Gacha
          </div>
          <div className="mt-1 text-[28px] font-black leading-none tracking-tight text-zinc-950 tabular-nums">
            {t}
            <span className="ml-1 text-[12px] font-bold text-zinc-500">yosh</span>
          </div>
        </div>
      </div>

      <div className="grid gap-2">
        <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-zinc-500">Eng kichik yosh</div>
        <input
          type="range"
          min={18}
          max={70}
          step={1}
          value={f}
          onChange={(e) => {
            const n = Number(e.target.value);
            setFrom(n);
            if (t < n) setTo(n);
          }}
          className="w-full accent-zinc-950"
        />
      </div>
      <div className="grid gap-2">
        <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-zinc-500">Eng katta yosh</div>
        <input
          type="range"
          min={18}
          max={70}
          step={1}
          value={t}
          onChange={(e) => {
            const n = Number(e.target.value);
            setTo(n);
            if (f > n) setFrom(n);
          }}
          className="w-full accent-zinc-950"
        />
      </div>
    </div>
  );
}

/* ============================================================ Review row */

function ReviewRow({
  label,
  value,
  onEdit,
}: {
  label: string;
  value: string;
  onEdit: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3.5">
      <div className="min-w-0">
        <div className="text-[10.5px] font-extrabold uppercase tracking-[0.18em] text-zinc-500">
          {label}
        </div>
        <div className="mt-0.5 truncate text-[14px] font-extrabold tracking-tight text-zinc-950">
          {value || "—"}
        </div>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="inline-flex h-8 items-center gap-1.5 rounded-full bg-zinc-100 px-3 text-[11px] font-extrabold tracking-tight text-zinc-700 ring-1 ring-zinc-200 transition hover:bg-zinc-200"
      >
        {I.edit} O‘zgartirish
      </button>
    </div>
  );
}

/* ============================================================ Main */

export default function ProfileWizard({
  initial,
  userEmail,
  initialStepKey,
  onSubmit,
  onExit,
}: {
  initial: AnyProfile;
  userEmail: string;
  initialStepKey?: string | null;
  onSubmit: (d: ProfileData) => Promise<SaveResult>;
  onExit: () => Promise<void>;
}) {
  const router = useRouter();
  const [data, setData] = useState<ProfileData>(() => defaults(initial));
  const [step, setStep] = useState(0);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [savedOk, setSavedOk] = useState(false);
  const stepRef = useRef<HTMLDivElement>(null);

  const total = STEPS.length;
  const cur = STEPS[step];
  const isFirst = step === 0;
  const isLast = step === total - 1;

  const valid = cur.isValid ? cur.isValid(data) : true;

  // Jump to a specific step (from Elonlarim -> /profile?step=...)
  useEffect(() => {
    if (!initialStepKey) return;
    const idx = STEPS.findIndex((s) => s.key === initialStepKey);
    if (idx >= 0) setStep(idx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialStepKey]);

  // Persist between refreshes
  useEffect(() => {
    const raw = sessionStorage.getItem("annikah:profile-wizard");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          setData((prev) => ({ ...prev, ...parsed }));
        }
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    sessionStorage.setItem("annikah:profile-wizard", JSON.stringify(data));
  }, [data]);

  // Scroll to top on step change
  useEffect(() => {
    stepRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  const next = () => {
    if (!valid && !cur.optional) return;
    if (!isLast) setStep((s) => s + 1);
  };
  const back = () => {
    if (!isFirst) setStep((s) => s - 1);
  };
  const goTo = (k: string) => {
    const idx = STEPS.findIndex((s) => s.key === k);
    if (idx >= 0) setStep(idx);
  };

  function update<K extends keyof ProfileData>(key: K, v: ProfileData[K]) {
    setData((d) => ({ ...d, [key]: v }));
  }

  const handleSubmit = () => {
    setError(null);
    startTransition(async () => {
      try {
        const res = await onSubmit(data);
        if (res.ok) {
          sessionStorage.removeItem("annikah:profile-wizard");
          setSavedOk(true);
          setTimeout(() => router.push("/"), 600);
        } else {
          setError(res.error);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Xatolik yuz berdi");
      }
    });
  };

  const groupIdx = GROUPS.indexOf(cur.group);
  const totalSteps = total - 1; // exclude welcome from progress
  const progress = Math.max(0, Math.min(100, Math.round((step / totalSteps) * 100)));

  return (
    <div className="flex min-h-screen flex-col bg-[#f4f4f5]">
      {/* TOP BAR */}
      <header className="sticky top-0 z-30 w-full border-b border-zinc-200/70 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-3 px-5">
          <Link href="/" className="inline-flex items-center gap-2 text-[14px] font-extrabold tracking-tight text-zinc-950">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-linear-to-br from-rose-500 to-fuchsia-600 text-white shadow-sm">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
                <path d="M12 21s-7-4.35-9.5-9A5.5 5.5 0 0 1 12 6.5 5.5 5.5 0 0 1 21.5 12c-2.5 4.65-9.5 9-9.5 9z" />
              </svg>
            </span>
            Annikah
          </Link>

          <form action={onExit}>
            <button
              type="submit"
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-white px-3 text-[12px] font-extrabold text-zinc-900 ring-1 ring-zinc-200 transition hover:bg-zinc-50"
            >
              {I.close}
              <span className="hidden sm:inline">Yopish</span>
            </button>
          </form>
        </div>

        {/* Progress + group chips */}
        <div className="mx-auto max-w-3xl px-5 pb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {GROUPS.map((g, i) => {
              const active = i === groupIdx;
              const done = i < groupIdx;
              return (
                <span
                  key={g}
                  className={`inline-flex h-7 items-center rounded-full px-2.5 text-[10.5px] font-extrabold uppercase tracking-[0.16em] transition ${
                    active
                      ? "bg-zinc-950 text-white"
                      : done
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-zinc-100 text-zinc-500"
                  }`}
                >
                  {done ? <span className="mr-1">✓</span> : null}
                  {g}
                </span>
              );
            })}
          </div>
          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-zinc-200">
            <div
              className="h-full rounded-full bg-zinc-950 transition-[width] duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-1 flex items-center justify-between text-[10.5px] font-extrabold uppercase tracking-[0.18em] text-zinc-500">
            <span>
              Bosqich {Math.min(step + 1, total)} / {total}
            </span>
            <span className="hidden sm:inline">{userEmail}</span>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main ref={stepRef} className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 pb-32 pt-8 sm:pt-12">
        {/* Step header */}
        <div className="grid gap-2">
          <div className="text-[10.5px] font-extrabold uppercase tracking-[0.18em] text-zinc-500">
            {cur.group}
          </div>
          <h1 className="text-[28px] font-extrabold leading-[1.15] tracking-tight text-zinc-950 sm:text-[36px]">
            {cur.title}
          </h1>
          {cur.subtitle ? (
            <p className="text-[14px] font-medium text-zinc-600 sm:text-[15px]">
              {cur.subtitle}
            </p>
          ) : null}
        </div>

        {/* Step body */}
        <div className="mt-7 grid gap-4">
          {cur.kind === "welcome" ? (
            <div className="grid gap-3 rounded-3xl bg-white p-6 ring-1 ring-zinc-200/80">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                  {I.spark}
                </span>
                <div className="text-[12px] font-extrabold uppercase tracking-[0.18em] text-zinc-500">
                  Tezkor anketa
                </div>
              </div>
              <p className="text-[14px] leading-relaxed text-zinc-700">
                Profil ma’lumotlarini bosqichma-bosqich to‘ldiramiz. Davlat ro‘yxatdan tanlanadi (bayroq emojisi bilan), bo‘y va vazn slider yordamida — yozish shart emas. Oxirida hammasini tekshirib, tasdiqlaysiz.
              </p>
              <ul className="grid gap-1.5 text-[13px] font-semibold text-zinc-600">
                <li>· Har bir savol alohida ekranda</li>
                <li>· To‘ldirgan ma’lumotlar avtomatik saqlanadi</li>
                <li>· Istalgan vaqtda orqaga qaytib o‘zgartirishingiz mumkin</li>
              </ul>
            </div>
          ) : null}

          {cur.kind === "text" && cur.field ? (
            <input
              autoFocus
              value={String(data[cur.field] ?? "")}
              onChange={(e) => update(cur.field as keyof ProfileData, e.target.value as never)}
              placeholder={cur.placeholder}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  next();
                }
              }}
              className="h-14 w-full rounded-2xl bg-white px-5 text-[18px] font-semibold text-zinc-950 ring-1 ring-zinc-200 outline-none transition focus:ring-zinc-300"
            />
          ) : null}

          {cur.kind === "textarea" ? (
            cur.key === "partnerLocation" ? (
              <div className="grid gap-3">
                <label className="grid gap-1.5">
                  <span className="text-[10.5px] font-extrabold uppercase tracking-[0.18em] text-zinc-500">Davlatlar</span>
                  <input
                    value={data.partnerCountries}
                    onChange={(e) => update("partnerCountries", e.target.value)}
                    placeholder="O‘zbekiston, Qozog‘iston"
                    className="h-12 w-full rounded-2xl bg-white px-4 text-[14px] font-semibold text-zinc-950 ring-1 ring-zinc-200 outline-none focus:ring-zinc-300"
                  />
                </label>
                <label className="grid gap-1.5">
                  <span className="text-[10.5px] font-extrabold uppercase tracking-[0.18em] text-zinc-500">Viloyatlar</span>
                  <input
                    value={data.partnerRegions}
                    onChange={(e) => update("partnerRegions", e.target.value)}
                    placeholder="Toshkent, Farg‘ona"
                    className="h-12 w-full rounded-2xl bg-white px-4 text-[14px] font-semibold text-zinc-950 ring-1 ring-zinc-200 outline-none focus:ring-zinc-300"
                  />
                </label>
                <label className="grid gap-1.5">
                  <span className="text-[10.5px] font-extrabold uppercase tracking-[0.18em] text-zinc-500">Shaharlar</span>
                  <input
                    value={data.partnerCities}
                    onChange={(e) => update("partnerCities", e.target.value)}
                    placeholder="Toshkent, Samarqand"
                    className="h-12 w-full rounded-2xl bg-white px-4 text-[14px] font-semibold text-zinc-950 ring-1 ring-zinc-200 outline-none focus:ring-zinc-300"
                  />
                </label>
              </div>
            ) : (
              <textarea
                autoFocus
                value={String(data[cur.field as keyof ProfileData] ?? "")}
                onChange={(e) => update(cur.field as keyof ProfileData, e.target.value as never)}
                placeholder={cur.placeholder}
                rows={6}
                className="w-full rounded-2xl bg-white p-4 text-[15px] font-medium text-zinc-950 ring-1 ring-zinc-200 outline-none transition focus:ring-zinc-300"
              />
            )
          ) : null}

          {cur.kind === "number" && cur.field ? (
            <NumberPicker
              value={
                typeof data[cur.field] === "number"
                  ? (data[cur.field] as number)
                  : cur.min ?? 0
              }
              setValue={(n) => update(cur.field as keyof ProfileData, n as never)}
              min={cur.min ?? 0}
              max={cur.max ?? 100}
              step={cur.step ?? 1}
              unit={cur.unit}
            />
          ) : null}

          {cur.kind === "country" ? (
            <CountryPicker
              value={data.country}
              setValue={(s) => update("country", s)}
            />
          ) : null}

          {cur.kind === "chips" && cur.field && cur.choices ? (
            <Chips
              value={String(data[cur.field] ?? "")}
              setValue={(v) => {
                if (cur.field === "polygamyAllowance") {
                  update("polygamyAllowance", Number(v) as never);
                } else {
                  update(cur.field as keyof ProfileData, v as never);
                }
              }}
              choices={cur.choices}
            />
          ) : null}

          {cur.kind === "rangeAge" ? (
            <RangeAge
              from={data.partnerAgeFrom}
              to={data.partnerAgeTo}
              setFrom={(n) => update("partnerAgeFrom", n)}
              setTo={(n) => update("partnerAgeTo", n)}
            />
          ) : null}

          {cur.kind === "review" ? (
            <div className="grid gap-4">
              {savedOk ? (
                <div className="rounded-3xl bg-emerald-50 p-6 ring-1 ring-emerald-200">
                  <div className="flex items-center gap-2 text-emerald-700">
                    {I.check}
                    <strong className="text-[14px] font-extrabold tracking-tight">
                      Saqlandi! Bosh sahifaga o‘tilmoqda...
                    </strong>
                  </div>
                </div>
              ) : null}
              {error ? (
                <div className="rounded-2xl bg-rose-50 p-4 ring-1 ring-rose-200 text-[13px] font-semibold text-rose-700">
                  {error}
                </div>
              ) : null}

              <div className="rounded-3xl bg-white ring-1 ring-zinc-200 divide-y divide-zinc-100">
                <ReviewRow label="Ism" value={data.name} onEdit={() => goTo("name")} />
                <ReviewRow label="Yosh" value={`${data.age} yosh`} onEdit={() => goTo("age")} />
                <ReviewRow
                  label="Joylashuv"
                  value={[data.country, data.region, data.city].filter(Boolean).join(", ")}
                  onEdit={() => goTo("country")}
                />
                <ReviewRow label="Millat" value={data.nationality} onEdit={() => goTo("nationality")} />
                <ReviewRow label="Bo‘y" value={`${data.heightCm} sm`} onEdit={() => goTo("heightCm")} />
                <ReviewRow label="Vazn" value={`${data.weightKg} kg`} onEdit={() => goTo("weightKg")} />
                <ReviewRow
                  label="Sigaret"
                  value={data.smokes === "yes" ? "Chekadi" : data.smokes === "no" ? "Chekmaydi" : "—"}
                  onEdit={() => goTo("smokes")}
                />
                <ReviewRow
                  label="Sport"
                  value={
                    data.sportPerWeek != null
                      ? `${data.sportPerWeek} marta / hafta`
                      : "Belgilanmagan"
                  }
                  onEdit={() => goTo("sportPerWeek")}
                />
                <ReviewRow
                  label="Oilaviy holat"
                  value={
                    data.maritalStatus === "boydoq"
                      ? "Bo‘ydoq"
                      : data.maritalStatus === "ajrashgan"
                        ? "Ajrashgan"
                        : data.maritalStatus === "beva"
                          ? "Beva"
                          : ""
                  }
                  onEdit={() => goTo("maritalStatus")}
                />
                <ReviewRow
                  label="Farzand"
                  value={data.children === "yoq" ? "Yo‘q" : data.children === "bor" ? "Bor" : ""}
                  onEdit={() => goTo("children")}
                />
                <ReviewRow
                  label="Ko‘pxotinlik"
                  value={
                    data.polygamyAllowance ? `${data.polygamyAllowance}-ro‘zg‘orgacha` : "Belgilanmagan"
                  }
                  onEdit={() => goTo("polygamyAllowance")}
                />
                <ReviewRow
                  label="Ta’lim"
                  value={
                    data.education === "oliy"
                      ? "Oliy"
                      : data.education === "orta"
                        ? "O‘rta"
                        : data.education === "orta_maxsus"
                          ? "O‘rta maxsus"
                          : data.education === "boshqa"
                            ? "Boshqa"
                            : ""
                  }
                  onEdit={() => goTo("education")}
                />
                <ReviewRow label="Kasb" value={data.jobTitle} onEdit={() => goTo("jobTitle")} />
                <ReviewRow
                  label="Daromad (oyiga)"
                  value={data.incomeMonthlyUsd ? `$${data.incomeMonthlyUsd}` : "Belgilanmagan"}
                  onEdit={() => goTo("incomeMonthlyUsd")}
                />
                <ReviewRow
                  label="Aqida"
                  value={
                    data.aqeeda === "ahli_sunna"
                      ? "Ahli sunna val jamoa"
                      : data.aqeeda === "salafiy"
                        ? "Salafiy"
                        : data.aqeeda === "boshqa"
                          ? "Boshqa"
                          : ""
                  }
                  onEdit={() => goTo("aqeeda")}
                />
                <ReviewRow
                  label="Namoz"
                  value={
                    data.prayer === "farz"
                      ? "Doimiy"
                      : data.prayer === "bazan"
                        ? "Ba’zan"
                        : data.prayer === "oqimaydi"
                          ? "O‘qimaydi"
                          : ""
                  }
                  onEdit={() => goTo("prayer")}
                />
                <ReviewRow
                  label="Qur’on"
                  value={
                    data.quran === "qiroat_yaxshi"
                      ? "Qiroati yaxshi"
                      : data.quran === "ortacha"
                        ? "O‘rtacha"
                        : data.quran === "oqimaydi"
                          ? "O‘qimaydi"
                          : ""
                  }
                  onEdit={() => goTo("quran")}
                />
                <ReviewRow
                  label="Mazhab"
                  value={
                    data.madhab === "hanafiy"
                      ? "Hanafiy"
                      : data.madhab === "shofiiy"
                        ? "Shofi’iy"
                        : data.madhab === "molikiy"
                          ? "Molikiy"
                          : data.madhab === "hanbaliy"
                            ? "Hanbaliy"
                            : data.madhab === "boshqa"
                              ? "Boshqa"
                              : ""
                  }
                  onEdit={() => goTo("madhab")}
                />
                <ReviewRow
                  label="Juftga yosh"
                  value={
                    data.partnerAgeFrom != null && data.partnerAgeTo != null
                      ? `${data.partnerAgeFrom} – ${data.partnerAgeTo} yosh`
                      : "Farqsiz"
                  }
                  onEdit={() => goTo("partnerAge")}
                />
                <ReviewRow
                  label="Juftga joy"
                  value={
                    [data.partnerCountries, data.partnerRegions, data.partnerCities]
                      .filter(Boolean)
                      .join(" · ") || "Farqsiz"
                  }
                  onEdit={() => goTo("partnerLocation")}
                />
                <ReviewRow
                  label="O‘zi haqida"
                  value={data.about ? data.about.slice(0, 100) + (data.about.length > 100 ? "…" : "") : ""}
                  onEdit={() => goTo("about")}
                />
              </div>
            </div>
          ) : null}
        </div>

        {/* Currently selected country preview */}
        {cur.kind === "country" && data.country ? (
          <div className="mt-5 rounded-2xl bg-zinc-950 px-4 py-3 text-white">
            <div className="text-[10.5px] font-extrabold uppercase tracking-[0.18em] text-white/70">
              Tanlandi
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-[22px] leading-none">
                {findCountryByName(data.country)?.flag ?? "🏳️"}
              </span>
              <span className="text-[15px] font-extrabold tracking-tight">
                {data.country}
              </span>
            </div>
          </div>
        ) : null}
      </main>

      {/* FOOTER ACTIONS */}
      <footer className="sticky bottom-0 z-30 w-full border-t border-zinc-200/70 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-3 px-5">
          <button
            type="button"
            onClick={back}
            disabled={isFirst}
            className="inline-flex h-11 items-center gap-1.5 rounded-full bg-white px-4 text-[12px] font-extrabold text-zinc-900 ring-1 ring-zinc-200 transition hover:bg-zinc-50 disabled:opacity-40"
          >
            {I.back} Orqaga
          </button>

          <div className="flex items-center gap-2">
            {cur.optional && !isLast ? (
              <button
                type="button"
                onClick={next}
                className="inline-flex h-11 items-center gap-1 rounded-full bg-zinc-100 px-4 text-[12px] font-extrabold text-zinc-700 ring-1 ring-zinc-200 transition hover:bg-zinc-200"
              >
                O‘tkazib yuborish
              </button>
            ) : null}

            {isLast ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={pending || savedOk}
                className="inline-flex h-11 items-center gap-1.5 rounded-full bg-emerald-600 px-5 text-[12.5px] font-extrabold tracking-tight text-white shadow-[0_8px_22px_rgba(16,185,129,.32)] transition hover:bg-emerald-700 disabled:opacity-60"
              >
                {pending ? "Saqlanmoqda..." : savedOk ? "Saqlandi!" : "Tasdiqlash va saqlash"}
                {!pending && !savedOk ? I.check : null}
              </button>
            ) : (
              <button
                type="button"
                onClick={next}
                disabled={!valid && !cur.optional}
                className="inline-flex h-11 items-center gap-1.5 rounded-full bg-zinc-950 px-5 text-[12.5px] font-extrabold tracking-tight text-white shadow-[0_8px_22px_rgba(15,23,42,.20)] transition hover:bg-zinc-900 disabled:opacity-40"
              >
                Davom etish {I.forward}
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
