"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { COUNTRIES } from "@/lib/countries";
import { legacyStepHint } from "./validation";
import { useMemo, useRef, useState, useTransition } from "react";

type Plan = "days15" | "month1" | "months3";

export type WizardPlan = {
  id: Plan;
  title: string;
  days: number;
  priceUzs: number;
  badge?: string;
  description?: string;
};

const DEFAULT_PLANS: WizardPlan[] = [
  { id: "days15", title: "15 kun", days: 15, priceUzs: 39000 },
  { id: "month1", title: "1 oy", days: 30, priceUzs: 69000, badge: "Mashhur" },
  { id: "months3", title: "3 oy", days: 90, priceUzs: 159000, badge: "Tejamli" },
];

type AnyProfile = any;

type ListingCategory = "kelinlar" | "kuyovlar";

type FormState = {
  listingCategory: ListingCategory;
  name: string;
  age: number;
  country: string;
  region: string;
  city: string;
  nationality: string;
  heightCm: number;
  weightKg: number;
  jobTitle: string;
  about: string;
  aqeeda: string;
  prayer: string;
  quran: string;
  madhab: string;
  maritalStatus: string;
  children: string;
  smokes: "" | "yes" | "no";
  sportPerWeek: number | null;
  incomeMonthlyUsd: number | null;
  polygamyAllowance: number | null;
  education: string;
  partnerAgeFrom: number | null;
  partnerAgeTo: number | null;
  partnerCountries: string;
  partnerRegions: string;
  partnerCities: string;
  plan: Plan;
};

type StepId = "basics" | "body" | "life" | "faith" | "match";

const STEPS: StepId[] = ["basics", "body", "life", "faith", "match"];

const STEP_META: Record<
  StepId,
  { title: (cat: ListingCategory) => string; sub: string; ring: string; bar: string; icon: "user" | "ruler" | "heart" | "moon" | "match" }
> = {
  basics: {
    title: () => "Ism va joylashuv",
    sub: "Kimlik va yashash",
    ring: "ring-rose-200/80",
    bar: "from-rose-500 to-fuchsia-500",
    icon: "user",
  },
  body: {
    title: () => "Jismoniy va kasb",
    sub: "Bo‘y, vazn, ish",
    ring: "ring-amber-200/80",
    bar: "from-amber-500 to-orange-500",
    icon: "ruler",
  },
  life: {
    title: () => "Oila va ta’lim",
    sub: "Turmush, farzand, o‘qish",
    ring: "ring-emerald-200/80",
    bar: "from-emerald-500 to-teal-500",
    icon: "heart",
  },
  faith: {
    title: () => "Diniy ma’lumotlar",
    sub: "Aqida, ibodat",
    ring: "ring-violet-200/80",
    bar: "from-violet-500 to-indigo-500",
    icon: "moon",
  },
  match: {
    title: (cat) =>
      cat === "kuyovlar" ? "Juft talablari va haqida" : "Juft talablari va haqida",
    sub: "Kutilmalar, matn",
    ring: "ring-sky-200/80",
    bar: "from-sky-500 to-cyan-500",
    icon: "match",
  },
};

function StepGlyph({ kind }: { kind: (typeof STEP_META)[StepId]["icon"] }) {
  const cls = "h-5 w-5 shrink-0";
  switch (kind) {
    case "user":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" aria-hidden>
          <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
          <path d="M5 20v-1a7 7 0 0 1 14 0v1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "ruler":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" aria-hidden>
          <path d="M3 17 17 3l4 4L7 21z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M7 13 9 15M10 10l2 2M13 7l2 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "heart":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" aria-hidden>
          <path
            d="M12 21s-7-4.35-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 11c0 5.65-7 10-7 10z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "moon":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" aria-hidden>
          <path
            d="M21 13.6A9 9 0 0 1 10.4 3a8 8 0 1 0 10.6 10.6z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "match":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" aria-hidden>
          <path
            d="M16 3a3 3 0 0 0-3 3v4a6 6 0 0 0 12 0V6a3 3 0 0 0-3-3h-6zM8 21a6 6 0 0 1-6-6V9a3 3 0 0 1 3-3h2"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
        </svg>
      );
    default:
      return null;
  }
}

function stepTitle(step: StepId, listingCategory: ListingCategory): string {
  return STEP_META[step].title(listingCategory);
}

function stepValid(step: StepId, d: FormState): boolean {
  switch (step) {
    case "basics":
      return (
        d.name.trim().length >= 2 &&
        d.age >= 18 &&
        d.age <= 80 &&
        !!d.country.trim() &&
        !!d.region.trim() &&
        !!d.city.trim() &&
        !!d.nationality.trim()
      );
    case "body":
      return (
        d.heightCm >= 140 &&
        d.heightCm <= 220 &&
        d.weightKg >= 35 &&
        d.weightKg <= 180 &&
        !!d.jobTitle.trim() &&
        (d.smokes === "yes" || d.smokes === "no")
      );
    case "life":
      if (!d.maritalStatus || d.maritalStatus === "bilinmaydi") return false;
      if (d.children !== "yoq" && d.children !== "bor") return false;
      if (d.listingCategory === "kelinlar") {
        if (d.polygamyAllowance === null || d.polygamyAllowance < 1) return false;
      }
      return !!d.education && d.education !== "bilinmaydi";
    case "faith":
      return (
        !!d.aqeeda.trim() &&
        !!d.prayer.trim() &&
        !!d.quran.trim() &&
        !!d.madhab.trim()
      );
    case "match":
      return d.about.trim().length >= 12;
    default:
      return false;
  }
}

function inputCls() {
  return "h-11 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-[13px] font-semibold text-zinc-900 outline-none transition focus:border-zinc-300 focus:shadow-[0_0_0_4px_rgba(24,24,27,.06)]";
}

function toStr(v: any) {
  return v === null || v === undefined ? "" : String(v);
}

function chipRowCls(active: boolean) {
  return (
    "rounded-xl px-3 py-2 text-[11.5px] font-extrabold tracking-tight ring-1 transition " +
    (active ? "bg-zinc-950 text-white ring-zinc-950" : "bg-white text-zinc-800 ring-zinc-200 hover:bg-zinc-50")
  );
}

type Phase = "welcome" | "gender" | "step" | "review" | "plan" | "verify";

export default function ListingCreateWizard({
  initialProfile,
  category,
  plans,
  createListingUrl = "/api/listings/create-extra",
}: {
  initialProfile: AnyProfile;
  category: string;
  plans?: WizardPlan[];
  createListingUrl?: string;
}) {
  const router = useRouter();
  const PLANS = plans && plans.length > 0 ? plans : DEFAULT_PLANS;
  const initialCat: ListingCategory = category === "kuyovlar" ? "kuyovlar" : "kelinlar";

  const [phase, setPhase] = useState<Phase>("welcome");
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const topRef = useRef<HTMLDivElement>(null);
  const [verificationFile, setVerificationFile] = useState<File | null>(null);

  const [d, setD] = useState<FormState>(() => ({
    listingCategory: initialCat,
    name: initialProfile?.name || "",
    age: Number(initialProfile?.age || 25),
    country: initialProfile?.country || "",
    region: initialProfile?.region || "",
    city: initialProfile?.city || "",
    nationality: initialProfile?.nationality || "",
    heightCm: Number(initialProfile?.heightCm || 170),
    weightKg: Number(initialProfile?.weightKg || 65),
    jobTitle: initialProfile?.jobTitle || "",
    about: initialProfile?.about || "",
    aqeeda: initialProfile?.aqeeda || "",
    prayer: initialProfile?.prayer || "",
    quran: initialProfile?.quran || "",
    madhab: initialProfile?.madhab || "",
    maritalStatus: initialProfile?.maritalStatus || "bilinmaydi",
    children: initialProfile?.children || "bilinmaydi",
    smokes: initialProfile?.smokes === true ? "yes" : initialProfile?.smokes === false ? "no" : "",
    sportPerWeek: initialProfile?.sportPerWeek ?? null,
    incomeMonthlyUsd: initialProfile?.incomeMonthlyUsd ?? null,
    polygamyAllowance:
      initialCat === "kelinlar" ? initialProfile?.polygamyAllowance ?? null : null,
    education: initialProfile?.education || "bilinmaydi",
    partnerAgeFrom: initialProfile?.partnerAgeFrom ?? null,
    partnerAgeTo: initialProfile?.partnerAgeTo ?? null,
    partnerCountries: initialProfile?.partnerCountries || "",
    partnerRegions: initialProfile?.partnerRegions || "",
    partnerCities: initialProfile?.partnerCities || "",
    plan: "month1",
  }));

  const currentStep = STEPS[stepIndex] ?? "basic";
  const stepCount = STEPS.length;

  const validInfo = useMemo(() => STEPS.every((s) => stepValid(s, d)), [d]);

  const validVerify = useMemo(() => {
    return validInfo && verificationFile !== null && verificationFile.size > 0;
  }, [validInfo, verificationFile]);

  function scrollTop() {
    // iOS/mobile’da "smooth" ba’zan tepaga mayda sakrash (bug) qiladi.
    const isMobile = typeof window !== "undefined" && window.matchMedia?.("(max-width: 767px)")?.matches;
    topRef.current?.scrollIntoView({ behavior: isMobile ? "auto" : "smooth", block: "start" });
  }

  function pickGender(next: ListingCategory) {
    setD((prev) => ({
      ...prev,
      listingCategory: next,
      polygamyAllowance:
        next === "kelinlar"
          ? prev.polygamyAllowance ?? initialProfile?.polygamyAllowance ?? null
          : null,
    }));
    setStepIndex(0);
    setPhase("step");
    scrollTop();
  }

  function stepNext() {
    const step = STEPS[stepIndex];
    if (!stepValid(step, d)) return;
    if (stepIndex >= STEPS.length - 1) {
      setPhase("review");
    } else {
      setStepIndex((i) => i + 1);
    }
    scrollTop();
  }

  function stepBack() {
    if (stepIndex <= 0) {
      setPhase("gender");
    } else {
      setStepIndex((i) => i - 1);
    }
    scrollTop();
  }

  function goToVerify() {
    scrollTop();
    setPhase("verify");
  }

  function goBack() {
    scrollTop();
    if (phase === "verify") setPhase("plan");
    else if (phase === "plan") setPhase("review");
    else if (phase === "review") {
      setPhase("step");
      setStepIndex(STEPS.length - 1);
    }
  }

  function submit() {
    setError(null);
    start(async () => {
      try {
        const fd = new FormData();
        fd.append("data", JSON.stringify({ ...d }));
        if (verificationFile) fd.append("verificationPhoto", verificationFile);
        const res = await fetch(createListingUrl, { method: "POST", body: fd });
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          const code = data?.error;
          if (code === "AUTH_REQUIRED") throw new Error("Avval tizimga kiring.");
          if (code === "PROFILE_INCOMPLETE") throw new Error("Profil to‘liq emas.");
          if (code === "PHOTO_REQUIRED") throw new Error("Tasdiqlash fotosini yuklang.");
          if (code === "PHOTO_TOO_LARGE") throw new Error("Rasm juda katta (maks. ~5 MB).");
          if (code === "PHOTO_TYPE" || code === "PHOTO_SAVE")
            throw new Error("Rasmni yuklab bo‘lmadi (JPEG/PNG/WebP).");
          if (code === "VALIDATION") throw new Error(data?.message || "Tekshiruvdan o‘tmadi.");
          throw new Error(data?.message || "Xatolik");
        }
        const id = data?.listingId as number | undefined;
        if (typeof id !== "number" || !Number.isInteger(id) || id < 1) throw new Error("Javob noto‘g‘ri");
        router.push(`/listings/${id}`);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Xatolik");
      }
    });
  }

  const headerTitle =
    phase === "welcome"
      ? "Yangi e‘lon"
      : phase === "gender"
        ? "E‘lon turi"
        : phase === "step"
          ? stepTitle(currentStep, d.listingCategory)
          : phase === "review"
            ? "Tekshiring"
            : phase === "plan"
              ? "Tarifni tanlang"
              : "Tasdiq fotosi";

  const overallProgress =
    phase === "welcome"
      ? 5
      : phase === "gender"
        ? 12
        : phase === "step"
          ? 15 + Math.round(((stepIndex + 1) / stepCount) * 45)
          : phase === "review"
            ? 68
            : phase === "plan"
              ? 82
              : 95;

  return (
    <div className="grid gap-4" ref={topRef}>
      <div className="rounded-3xl border border-zinc-200/70 bg-white/80 p-5 shadow-[0_8px_28px_rgba(15,23,42,.05)] backdrop-blur">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-[11px] font-extrabold tracking-widest text-zinc-500">YANGI E’LON</div>
            <h1 className="mt-2 text-[26px] font-black tracking-tight text-zinc-950">{headerTitle}</h1>
            <p className="mt-1 text-[13px] font-medium text-zinc-600">
              {phase === "welcome" ? (
                "Bosqichma-bosqich. Ma’lumotlaringiz moderatsiyadan o‘tadi."
              ) : phase === "gender" ? (
                "Keyingi savollar tanlovga qarab o‘zgaradi."
              ) : phase === "step" ? (
                <>
                  Qadam {stepIndex + 1} / {stepCount}.{" "}
                  <span className="font-extrabold text-zinc-800">
                    {d.listingCategory === "kuyovlar" ? "Kuyov (erkak)" : "Kelin (ayol)"}
                  </span>{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setPhase("gender");
                      scrollTop();
                    }}
                    className="font-extrabold text-indigo-600 underline decoration-indigo-200 underline-offset-2 hover:text-indigo-800"
                  >
                    O‘zgartirish
                  </button>
                </>
              ) : phase === "verify" ? (
                <>
                  Moderatsiyaga yuborishdan oldin yuzingiz ko‘rinadigan fotoni yuklang. Uchinchi shaxslarga
                  ko‘rinmaydi.
                </>
              ) : (
                <>
                  E’lon turi:{" "}
                  <span className="font-extrabold text-zinc-900">
                    {d.listingCategory === "kuyovlar" ? "Kuyov (erkak)" : "Kelin (ayol)"}
                  </span>
                  .{" "}
                  <button
                    type="button"
                    onClick={() => setPhase("gender")}
                    className="font-extrabold text-indigo-600 underline decoration-indigo-200 underline-offset-2 hover:text-indigo-800"
                  >
                    O‘zgartirish
                  </button>
                </>
              )}
            </p>
          </div>
          <Link
            href="/profile#elonlarim"
            className="inline-flex h-10 items-center justify-center rounded-2xl bg-white px-4 text-[12px] font-extrabold text-zinc-900 ring-1 ring-zinc-200 hover:bg-zinc-50"
          >
            Bekor qilish
          </Link>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-100">
          <div
            className="h-full rounded-full bg-linear-to-r from-indigo-500 via-fuchsia-500 to-rose-500 transition-[width] duration-500"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
        <div className="mt-1 text-[10px] font-bold text-zinc-500">{overallProgress}% tayyor</div>
        {phase === "step" ? (
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-100/80">
            <div
              className={`h-full rounded-full bg-linear-to-r transition-[width] duration-300 ${STEP_META[currentStep].bar}`}
              style={{ width: `${((stepIndex + 1) / stepCount) * 100}%` }}
            />
          </div>
        ) : null}
      </div>

      {phase === "welcome" ? (
        <div className="grid gap-4">
          <div className="rounded-3xl border border-indigo-200/60 bg-linear-to-br from-indigo-50 via-white to-rose-50 p-6 shadow-sm">
            <div className="text-[40px] leading-none">📝</div>
            <h2 className="mt-3 text-[20px] font-black tracking-tight text-zinc-950">E’lonni birga to‘ldiramiz</h2>
            <p className="mt-2 text-[13px] font-medium leading-relaxed text-zinc-600">
              Profilingizdagi ma’lumotlar avtomatik qo‘yiladi. Faqat tekshirib, kerak bo‘lsa o‘zgartirasiz —
              taxminan 3–5 daqiqa.
            </p>
            <ul className="mt-4 grid gap-2 text-[12px] font-semibold text-zinc-700">
              <li className="flex gap-2">
                <span className="text-indigo-600">1.</span> Kim ekaningiz va qayerda yashashingiz
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-600">2.</span> Diniy va oilaviy ma’lumotlar
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-600">3.</span> Tarif va tasdiqlash fotosi
              </li>
            </ul>
          </div>
          <button
            type="button"
            onClick={() => {
              setPhase("gender");
              scrollTop();
            }}
            className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-zinc-950 text-[14px] font-extrabold text-white shadow-lg ring-1 ring-black/10 hover:bg-zinc-900"
          >
            Boshlash →
          </button>
        </div>
      ) : null}

      {phase === "gender" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => pickGender("kelinlar")}
            className="rounded-3xl border border-zinc-200/80 bg-linear-to-br from-rose-50/90 to-fuchsia-100/80 p-6 text-left shadow-sm ring-1 ring-rose-200/50 transition hover:shadow-md active:scale-[0.99]"
          >
            <div className="text-[12px] font-extrabold text-rose-800">Ayol</div>
            <div className="mt-2 text-[18px] font-black tracking-tight text-zinc-950">Kelin e’loni</div>
            <p className="mt-2 text-[12.5px] font-medium leading-relaxed text-zinc-700">
              Kuyov qidirayotgan ayollar uchun. Ba’zi savollar (masalan, ko‘pxotinlik) faqat shu turda
              so‘raladi.
            </p>
          </button>
          <button
            type="button"
            onClick={() => pickGender("kuyovlar")}
            className="rounded-3xl border border-zinc-200/80 bg-linear-to-br from-sky-50/90 to-indigo-100/80 p-6 text-left shadow-sm ring-1 ring-sky-200/50 transition hover:shadow-md active:scale-[0.99]"
          >
            <div className="text-[12px] font-extrabold text-sky-800">Erkak</div>
            <div className="mt-2 text-[18px] font-black tracking-tight text-zinc-950">Kuyov e’loni</div>
            <p className="mt-2 text-[12.5px] font-medium leading-relaxed text-zinc-700">
              Kelin qidirayotgan erkaklar uchun. Jinsga mos bo‘lmagan savollar ko‘rsatilmaydi.
            </p>
          </button>
        </div>
      ) : null}

      {phase === "step" ? (
        <div className="grid gap-4">
          <div className="-mx-1 flex gap-2 overflow-x-auto pb-1 pl-1">
            {STEPS.map((sid, i) => {
              const meta = STEP_META[sid];
              const active = i === stepIndex;
              const reachable =
                i <= stepIndex ||
                STEPS.slice(0, i).every((s) => stepValid(s, d));
              return (
                <button
                  key={sid}
                  type="button"
                  disabled={!reachable}
                  onClick={() => {
                    if (!reachable) return;
                    setStepIndex(i);
                    scrollTop();
                  }}
                  className={
                    "flex min-w-[7.5rem] shrink-0 items-center gap-2 rounded-2xl px-3 py-2.5 text-left text-[11px] font-extrabold tracking-tight ring-1 transition " +
                    (active
                      ? "bg-zinc-950 text-white ring-zinc-950 shadow-md"
                      : reachable
                        ? "bg-white text-zinc-800 ring-zinc-200 hover:bg-zinc-50"
                        : "cursor-not-allowed bg-zinc-50/80 text-zinc-400 ring-zinc-100")
                  }
                >
                  <span className={active ? "text-white" : "text-zinc-600"}>
                    <StepGlyph kind={meta.icon} />
                  </span>
                  <span className="min-w-0 leading-snug">
                    <span className="block truncate">{stepTitle(sid, d.listingCategory)}</span>
                    <span
                      className={
                        "block truncate text-[9px] font-semibold " +
                        (active ? "text-zinc-300" : "text-zinc-500")
                      }
                    >
                      {meta.sub}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div
            className={
              "rounded-3xl border bg-white/80 p-5 shadow-[0_8px_28px_rgba(15,23,42,.05)] backdrop-blur ring-2 " +
              STEP_META[currentStep].ring
            }
          >
            <div className="max-h-[min(70vh,540px)] overflow-y-auto overscroll-contain pr-1 [-webkit-overflow-scrolling:touch]">
            {currentStep === "basics" ? (
              <div className="grid gap-6">
                <div>
                  <div className="mb-2 flex items-center gap-2 text-[11px] font-extrabold text-rose-700">
                    <span className="rounded-lg bg-rose-100 px-2 py-0.5 text-[10px] text-rose-900">Asosiy</span>
                    Ism va yosh
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="grid gap-1">
                      <span className="text-[11px] font-extrabold text-zinc-500">Ism</span>
                      <input
                        className={inputCls()}
                        value={d.name}
                        onChange={(e) => setD({ ...d, name: e.target.value })}
                        placeholder="Ism"
                      />
                    </label>
                    <label className="grid gap-1">
                      <span className="text-[11px] font-extrabold text-zinc-500">Yosh</span>
                      <input
                        className={inputCls()}
                        type="number"
                        min={18}
                        max={80}
                        value={d.age}
                        onChange={(e) => setD({ ...d, age: Number(e.target.value) })}
                        placeholder="Yosh"
                      />
                    </label>
                  </div>
                </div>
                <div className="h-px bg-zinc-100" />
                <div>
                  <div className="mb-2 flex items-center gap-2 text-[11px] font-extrabold text-fuchsia-700">
                    <span className="rounded-lg bg-fuchsia-100 px-2 py-0.5 text-[10px] text-fuchsia-900">Manzil</span>
                    Yashash joyi
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <select
                      className={inputCls()}
                      value={d.country}
                      onChange={(e) => setD({ ...d, country: e.target.value })}
                    >
                      <option value="">Davlat tanlang</option>
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.name}>
                          {c.flag} {c.name}
                        </option>
                      ))}
                    </select>
                    <input
                      className={inputCls()}
                      value={d.region}
                      onChange={(e) => setD({ ...d, region: e.target.value })}
                      placeholder="Viloyat"
                    />
                    <input
                      className={inputCls()}
                      value={d.city}
                      onChange={(e) => setD({ ...d, city: e.target.value })}
                      placeholder="Shahar/Tuman"
                    />
                    <input
                      className={inputCls()}
                      value={d.nationality}
                      onChange={(e) => setD({ ...d, nationality: e.target.value })}
                      placeholder="Millat"
                    />
                  </div>
                </div>
              </div>
            ) : null}

            {currentStep === "body" ? (
              <div className="grid gap-4">
                <div className="mb-1 flex items-center gap-2 text-[11px] font-extrabold text-amber-800">
                  <span className="rounded-lg bg-amber-100 px-2 py-0.5 text-[10px] text-amber-950">Jismoniy</span>
                  Kasb va odatlar
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    className={inputCls()}
                    type="number"
                    value={d.heightCm}
                    onChange={(e) => setD({ ...d, heightCm: Number(e.target.value) })}
                    placeholder="Bo‘y (sm)"
                  />
                  <input
                    className={inputCls()}
                    type="number"
                    value={d.weightKg}
                    onChange={(e) => setD({ ...d, weightKg: Number(e.target.value) })}
                    placeholder="Vazn (kg)"
                  />
                  <input
                    className={inputCls()}
                    value={d.jobTitle}
                    onChange={(e) => setD({ ...d, jobTitle: e.target.value })}
                    placeholder="Kasb"
                  />
                  <input
                    className={inputCls()}
                    value={toStr(d.incomeMonthlyUsd)}
                    onChange={(e) =>
                      setD({
                        ...d,
                        incomeMonthlyUsd: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    placeholder="Daromad (USD) ixtiyoriy"
                  />
                </div>
                <div className="grid gap-2">
                  <div className="text-[11px] font-extrabold text-zinc-500">Sigaret</div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className={chipRowCls(d.smokes === "no")}
                      onClick={() => setD({ ...d, smokes: "no" })}
                    >
                      Chekmayman
                    </button>
                    <button
                      type="button"
                      className={chipRowCls(d.smokes === "yes")}
                      onClick={() => setD({ ...d, smokes: "yes" })}
                    >
                      Chekaman
                    </button>
                  </div>
                </div>
                <label className="grid gap-1">
                  <span className="text-[11px] font-extrabold text-zinc-500">
                    Sport (haftada, ixtiyoriy)
                  </span>
                  <input
                    className={inputCls()}
                    type="number"
                    min={0}
                    value={d.sportPerWeek ?? ""}
                    onChange={(e) =>
                      setD({
                        ...d,
                        sportPerWeek: e.target.value === "" ? null : Math.max(0, Number(e.target.value)),
                      })
                    }
                    placeholder="0"
                  />
                </label>
              </div>
            ) : null}

            {currentStep === "life" ? (
              <div className="grid gap-6">
                <div>
                  <div className="mb-2 flex items-center gap-2 text-[11px] font-extrabold text-emerald-800">
                    <span className="rounded-lg bg-emerald-100 px-2 py-0.5 text-[10px] text-emerald-950">Oila</span>
                    Turmush va farzand
                  </div>
                <div className="grid gap-2">
                  <div className="text-[11px] font-extrabold text-zinc-500">Oilaviy holat</div>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        ["boydoq", "Bo‘ydoq"],
                        ["ajrashgan", "Ajrashgan"],
                        ["beva", "Beva"],
                      ] as const
                    ).map(([v, label]) => (
                      <button
                        key={v}
                        type="button"
                        className={chipRowCls(d.maritalStatus === v)}
                        onClick={() => setD({ ...d, maritalStatus: v })}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid gap-2">
                  <div className="text-[11px] font-extrabold text-zinc-500">Farzand</div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className={chipRowCls(d.children === "yoq")}
                      onClick={() => setD({ ...d, children: "yoq" })}
                    >
                      Yo‘q
                    </button>
                    <button
                      type="button"
                      className={chipRowCls(d.children === "bor")}
                      onClick={() => setD({ ...d, children: "bor" })}
                    >
                      Bor
                    </button>
                  </div>
                </div>
                {d.listingCategory === "kelinlar" ? (
                  <div className="grid gap-2">
                    <div className="text-[11px] font-extrabold text-zinc-500">
                      Necha xotinlikka rozimisiz?
                    </div>
                    <p className="text-[11px] font-medium text-zinc-500">
                      Ko‘pxotinlik turmushiga tayyorgarlik (faqat ayol e’lonlarida).
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(
                        [
                          [1, "Faqat 1-ro‘zg‘or"],
                          [2, "2 gacha"],
                          [3, "3 gacha"],
                          [4, "4 gacha"],
                        ] as const
                      ).map(([n, label]) => (
                        <button
                          key={n}
                          type="button"
                          className={chipRowCls(d.polygamyAllowance === n)}
                          onClick={() => setD({ ...d, polygamyAllowance: n })}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
                </div>
                <div className="h-px bg-zinc-100" />
                <div>
                  <div className="mb-2 flex items-center gap-2 text-[11px] font-extrabold text-teal-800">
                    <span className="rounded-lg bg-teal-100 px-2 py-0.5 text-[10px] text-teal-950">Ta’lim</span>
                    Daraja
                  </div>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ["orta", "O‘rta"],
                    ["orta_maxsus", "O‘rta maxsus"],
                    ["oliy", "Oliy"],
                    ["boshqa", "Boshqa"],
                  ] as const
                ).map(([v, label]) => (
                  <button
                    key={v}
                    type="button"
                    className={chipRowCls(d.education === v)}
                    onClick={() => setD({ ...d, education: v })}
                  >
                    {label}
                  </button>
                ))}
              </div>
                </div>
              </div>
            ) : null}

            {currentStep === "faith" ? (
              <div className="grid gap-4">
                <div className="mb-1 flex items-center gap-2 text-[11px] font-extrabold text-violet-800">
                  <span className="rounded-lg bg-violet-100 px-2 py-0.5 text-[10px] text-violet-950">Din</span>
                  Aqida va amal
                </div>
                <div className="grid gap-2">
                  <div className="text-[11px] font-extrabold text-zinc-500">Aqidangiz</div>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        ["ahli_sunna", "Ahli sunna val jamoa"],
                        ["moturidiy", "Moturidiy"],
                        ["ashariy", "Ash’ariy"],
                        ["boshqa", "Boshqa"],
                      ] as const
                    ).map(([v, label]) => (
                      <button
                        key={v}
                        type="button"
                        className={chipRowCls(d.aqeeda === v)}
                        onClick={() => setD({ ...d, aqeeda: v })}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                <input
                  className={inputCls()}
                  value={d.prayer}
                  onChange={(e) => setD({ ...d, prayer: e.target.value })}
                  placeholder="Namoz"
                />
                <input
                  className={inputCls()}
                  value={d.quran}
                  onChange={(e) => setD({ ...d, quran: e.target.value })}
                  placeholder="Qur’on"
                />
                <input
                  className={inputCls()}
                  value={d.madhab}
                  onChange={(e) => setD({ ...d, madhab: e.target.value })}
                  placeholder="Mazhhab"
                />
                </div>
              </div>
            ) : null}

            {currentStep === "match" ? (
              <div className="grid gap-6">
                <div>
                  <div className="mb-2 flex items-center gap-2 text-[11px] font-extrabold text-sky-800">
                    <span className="rounded-lg bg-sky-100 px-2 py-0.5 text-[10px] text-sky-950">Juft</span>
                    {d.listingCategory === "kuyovlar" ? "Kelindan kutganingiz" : "Kuyovdan kutganingiz"}
                  </div>
                <p className="mb-2 text-[11px] font-medium text-zinc-500">
                  Juftingizdan kutiladigan yosh va joylashuv (ixtiyoriy qatorlar).
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-1">
                    <span className="text-[11px] font-extrabold text-zinc-500">Juft yoshi (dan)</span>
                    <input
                      className={inputCls()}
                      type="number"
                      min={18}
                      max={80}
                      value={d.partnerAgeFrom ?? ""}
                      onChange={(e) =>
                        setD({
                          ...d,
                          partnerAgeFrom: e.target.value === "" ? null : Number(e.target.value),
                        })
                      }
                    />
                  </label>
                  <label className="grid gap-1">
                    <span className="text-[11px] font-extrabold text-zinc-500">Juft yoshi (gacha)</span>
                    <input
                      className={inputCls()}
                      type="number"
                      min={18}
                      max={80}
                      value={d.partnerAgeTo ?? ""}
                      onChange={(e) =>
                        setD({
                          ...d,
                          partnerAgeTo: e.target.value === "" ? null : Number(e.target.value),
                        })
                      }
                    />
                  </label>
                  <input
                    className={inputCls()}
                    value={d.partnerCountries}
                    onChange={(e) => setD({ ...d, partnerCountries: e.target.value })}
                    placeholder="Davlatlar (ixtiyoriy)"
                  />
                  <input
                    className={inputCls()}
                    value={d.partnerRegions}
                    onChange={(e) => setD({ ...d, partnerRegions: e.target.value })}
                    placeholder="Viloyatlar (ixtiyoriy)"
                  />
                  <input
                    className={inputCls()}
                    value={d.partnerCities}
                    onChange={(e) => setD({ ...d, partnerCities: e.target.value })}
                    placeholder="Shaharlar (ixtiyoriy)"
                  />
                </div>
                </div>
                <div className="h-px bg-zinc-100" />
                <div>
                  <div className="mb-2 flex items-center gap-2 text-[11px] font-extrabold text-cyan-800">
                    <span className="rounded-lg bg-cyan-100 px-2 py-0.5 text-[10px] text-cyan-950">Haqida</span>
                    O‘zingiz haqingizda
                  </div>
              <textarea
                className="min-h-[120px] w-full resize-none rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-[13px] font-medium text-zinc-900 outline-none transition focus:border-zinc-300 focus:shadow-[0_0_0_4px_rgba(24,24,27,.06)]"
                value={d.about}
                onChange={(e) => setD({ ...d, about: e.target.value })}
                placeholder="Qisqacha… (kamida 12 ta belgi)"
              />
                </div>
              </div>
            ) : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={stepBack}
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-white px-5 text-[12px] font-extrabold text-zinc-900 ring-1 ring-zinc-200 hover:bg-zinc-50"
            >
              ← Orqaga
            </button>
            <div className="grid gap-1 text-right">
              {!stepValid(currentStep, d) && legacyStepHint(currentStep, d) ? (
                <p className="text-[11px] font-semibold text-rose-600">{legacyStepHint(currentStep, d)}</p>
              ) : null}
              <button
                type="button"
                onClick={stepNext}
                disabled={!stepValid(currentStep, d)}
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-zinc-950 px-6 text-[12px] font-extrabold text-white ring-1 ring-black/10 hover:bg-zinc-900 disabled:opacity-60"
              >
                {stepIndex >= STEPS.length - 1 ? "Ko‘rib chiqish →" : "Keyingi →"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {phase === "review" ? (
        <div className="grid gap-4">
          <div className="rounded-3xl border border-emerald-200/70 bg-emerald-50/60 p-4 text-[12px] font-medium text-emerald-950 ring-1 ring-emerald-100">
            Hammasi to‘g‘rimi? Pastdagi bo‘lim tugmalari orqali qaytib tahrirlashingiz mumkin.
          </div>
          <div className="rounded-3xl border border-zinc-200/70 bg-white p-5 shadow-sm">
            <div className="text-[11px] font-extrabold uppercase tracking-widest text-zinc-500">E‘lon kartochkasi</div>
            <div className="mt-3 overflow-hidden rounded-2xl bg-linear-to-br from-rose-400 via-fuchsia-600 to-rose-900 p-5 text-white shadow-md">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-extrabold">
                <span className="rounded-full bg-black/30 px-2 py-0.5">{d.listingCategory === "kuyovlar" ? "Kuyov" : "Kelin"}</span>
                <span className="rounded-full bg-black/30 px-2 py-0.5">{d.age} yosh</span>
              </div>
              <div className="mt-3 text-[22px] font-black leading-tight">{d.name}</div>
              <div className="mt-1 text-[12px] font-semibold text-white/85">{d.region}, {d.city} · {d.country}</>
              <div className="mt-2 text-[12px] text-white/80">{d.jobTitle} · {d.heightCm} sm · {d.weightKg} kg</div>
              <p className="mt-3 line-clamp-4 text-[12px] leading-relaxed text-white/90">{d.about}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {STEPS.map((sid, i) => (
              <button
                key={sid}
                type="button"
                onClick={() => {
                  setPhase("step");
                  setStepIndex(i);
                  scrollTop();
                }}
                className="rounded-xl bg-zinc-100 px-3 py-2 text-[11px] font-extrabold text-zinc-800 ring-1 ring-zinc-200 hover:bg-white"
              >
                {stepTitle(sid, d.listingCategory)}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button type="button" onClick={goBack} className="inline-flex h-11 items-center justify-center rounded-2xl bg-white px-5 text-[12px] font-extrabold text-zinc-900 ring-1 ring-zinc-200 hover:bg-zinc-50">← Orqaga</button>
            <button type="button" onClick={() => { setPhase("plan"); scrollTop(); }} disabled={!validInfo} className="inline-flex h-11 items-center justify-center rounded-2xl bg-zinc-950 px-6 text-[12px] font-extrabold text-white ring-1 ring-black/10 hover:bg-zinc-900 disabled:opacity-60">Tarif tanlash →</button>
          </div>
        </div>
      ) : null}


      {phase === "plan" ? (
        <div className="grid gap-4">
          <div className="rounded-3xl border border-zinc-200/70 bg-white/80 p-5 shadow-[0_8px_28px_rgba(15,23,42,.05)] backdrop-blur">
            <div className="text-[12px] font-extrabold tracking-tight text-zinc-950">Tarif</div>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {PLANS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setD({ ...d, plan: p.id })}
                  className={
                    "relative text-left rounded-2xl border bg-white p-4 transition " +
                    (d.plan === p.id
                      ? "border-zinc-950 shadow-[inset_0_0_0_1px_rgba(0,0,0,1)]"
                      : "border-zinc-200 hover:border-zinc-300")
                  }
                >
                  {p.badge ? (
                    <span className="absolute right-3 top-3 inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-extrabold text-amber-800 ring-1 ring-amber-200">
                      {p.badge}
                    </span>
                  ) : null}
                  <div className="text-[14px] font-extrabold tracking-tight text-zinc-950">{p.title}</div>
                  <div className="mt-1 text-[11px] font-bold text-zinc-600">{p.days} kun ko‘rinadi</div>
                  {p.description ? (
                    <div className="mt-1 text-[11px] font-semibold text-zinc-500">{p.description}</div>
                  ) : null}
                  <div className="mt-3 text-xl font-extrabold tracking-tight text-zinc-950">
                    {p.priceUzs.toLocaleString()}{" "}
                    <span className="text-[12px] font-bold text-zinc-600">so‘m</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={goBack}
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-white px-5 text-[12px] font-extrabold text-zinc-900 ring-1 ring-zinc-200 hover:bg-zinc-50"
            >
              ← Orqaga
            </button>
            <button
              type="button"
              onClick={goToVerify}
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-zinc-950 px-6 text-[12px] font-extrabold text-white ring-1 ring-black/10 hover:bg-zinc-900"
            >
              Keyingi: tasdiq fotosi →
            </button>
          </div>
        </div>
      ) : null}

      {phase === "verify" ? (
        <div className="grid gap-4">
          <div className="rounded-3xl border border-indigo-200/80 bg-indigo-50/80 p-5 shadow-[0_8px_28px_rgba(15,23,42,.05)] ring-1 ring-indigo-100">
            <div className="text-[12px] font-extrabold tracking-tight text-indigo-950">Nega rasm kerak?</div>
            <ul className="mt-2 grid list-disc gap-1 pl-4 text-[12.5px] font-medium leading-relaxed text-indigo-950/90">
              <li>
                Bu rasm saytda boshqa foydalanuvchilarga ko‘rsatilmaydi va profilda chiqmaydi — faqat{" "}
                <span className="font-extrabold">moderatsiya</span> uchun kerak.
              </li>
              <li>
                Soxta yoki o‘ziga tegishli bo‘lmagan e’lonlarni kamaytirish va platformani xavfsiz saqlash
                uchun yuzingiz aniq ko‘rinishi kerak.
              </li>
              <li>
                Ma’lumotlaringiz moderatsiya uchun maxfiy saqlanadi; tasdiqlashdan keyin ham jamoatga
                tarqatilmaydi.
              </li>
              <li>
                <span className="font-extrabold">Kelin (ayol)</span> e’lonlarini faqat{" "}
                <span className="font-extrabold">ayol</span> moderatorlar,{" "}
                <span className="font-extrabold">kuyov (erkak)</span> e’lonlarini esa faqat{" "}
                <span className="font-extrabold">erkak</span> moderatorlar tekshiradi.
              </li>
            </ul>
          </div>

          <div className="rounded-3xl border border-zinc-200/70 bg-white/80 p-5 shadow-[0_8px_28px_rgba(15,23,42,.05)] backdrop-blur">
            <div className="text-[12px] font-extrabold tracking-tight text-zinc-950">Yuzingiz ko‘rinadigan foto</div>
            <p className="mt-1 text-[11px] font-medium text-zinc-600">
              JPEG, PNG yoki WebP. Juda qorong‘i yoki filtrli rasm rad etilishi mumkin.
            </p>
            <label className="mt-3 grid gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-zinc-500">Fayl</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="text-[12px] font-semibold text-zinc-800 file:mr-3 file:rounded-xl file:border-0 file:bg-zinc-950 file:px-4 file:py-2 file:text-[12px] file:font-extrabold file:text-white"
                onChange={(e) => setVerificationFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={goBack}
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-white px-5 text-[12px] font-extrabold text-zinc-900 ring-1 ring-zinc-200 hover:bg-zinc-50"
            >
              ← Orqaga
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={pending || !validVerify}
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-zinc-950 px-6 text-[12px] font-extrabold text-white ring-1 ring-black/10 hover:bg-zinc-900 disabled:opacity-60"
            >
              {pending ? "Joylanmoqda…" : "Moderatsiyaga yuborish"}
            </button>
          </div>

          {error ? <div className="text-[12px] font-extrabold text-rose-700">{error}</div> : null}
        </div>
      ) : null}
    </div>
  );
}
