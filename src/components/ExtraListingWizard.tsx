"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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

type StepId =
  | "basic"
  | "location"
  | "physical"
  | "personal"
  | "education"
  | "religion"
  | "partner"
  | "about";

const STEPS: StepId[] = [
  "basic",
  "location",
  "physical",
  "personal",
  "education",
  "religion",
  "partner",
  "about",
];

function stepTitle(step: StepId, listingCategory: ListingCategory): string {
  switch (step) {
    case "basic":
      return "Ism va yosh";
    case "location":
      return "Manzil va millat";
    case "physical":
      return "Jismoniy ma’lumotlar";
    case "personal":
      return "Oilaviy holat";
    case "education":
      return "Ta’lim";
    case "religion":
      return "Diniy ma’lumotlar";
    case "partner":
      return listingCategory === "kuyovlar" ? "Kelindan kutganingiz" : "Kuyovdan kutganingiz";
    case "about":
      return "O‘zingiz haqingizda";
    default:
      return "";
  }
}

function stepValid(step: StepId, d: FormState): boolean {
  switch (step) {
    case "basic":
      return d.name.trim().length >= 2 && d.age >= 18 && d.age <= 80;
    case "location":
      return (
        !!d.country.trim() &&
        !!d.region.trim() &&
        !!d.city.trim() &&
        !!d.nationality.trim()
      );
    case "physical":
      return (
        d.heightCm >= 140 &&
        d.heightCm <= 220 &&
        d.weightKg >= 35 &&
        d.weightKg <= 180 &&
        !!d.jobTitle.trim() &&
        (d.smokes === "yes" || d.smokes === "no")
      );
    case "personal":
      if (!d.maritalStatus || d.maritalStatus === "bilinmaydi") return false;
      if (d.children !== "yoq" && d.children !== "bor") return false;
      if (d.listingCategory === "kelinlar") {
        if (d.polygamyAllowance === null || d.polygamyAllowance < 1) return false;
      }
      return true;
    case "education":
      return !!d.education && d.education !== "bilinmaydi";
    case "religion":
      return (
        !!d.aqeeda.trim() &&
        !!d.prayer.trim() &&
        !!d.quran.trim() &&
        !!d.madhab.trim()
      );
    case "partner":
      return true;
    case "about":
      return d.about.trim().length >= 20;
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

type Phase = "gender" | "step" | "plan" | "verify";

export default function ExtraListingWizard({
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

  const [phase, setPhase] = useState<Phase>("gender");
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
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
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
      setPhase("plan");
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
    else if (phase === "plan") {
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
        const id = data?.listingId as string | undefined;
        if (!id) throw new Error("Javob noto‘g‘ri");
        router.push(`/listings/${id}`);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Xatolik");
      }
    });
  }

  const headerTitle =
    phase === "gender"
      ? "Jinsingizni tanlang"
      : phase === "step"
        ? stepTitle(currentStep, d.listingCategory)
        : phase === "plan"
          ? "Tarifni tanlang"
          : "Tasdiq fotosi";

  return (
    <div className="grid gap-4" ref={topRef}>
      <div className="rounded-3xl border border-zinc-200/70 bg-white/80 p-5 shadow-[0_8px_28px_rgba(15,23,42,.05)] backdrop-blur">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-[11px] font-extrabold tracking-widest text-zinc-500">YANGI E’LON</div>
            <h1 className="mt-2 text-[26px] font-black tracking-tight text-zinc-950">{headerTitle}</h1>
            <p className="mt-1 text-[13px] font-medium text-zinc-600">
              {phase === "gender" ? (
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
            href="/elonlarim"
            className="inline-flex h-10 items-center justify-center rounded-2xl bg-white px-4 text-[12px] font-extrabold text-zinc-900 ring-1 ring-zinc-200 hover:bg-zinc-50"
          >
            Bekor qilish
          </Link>
        </div>
        {phase === "step" ? (
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-zinc-100">
            <div
              className="h-full rounded-full bg-zinc-900 transition-[width] duration-300"
              style={{ width: `${((stepIndex + 1) / stepCount) * 100}%` }}
            />
          </div>
        ) : null}
      </div>

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
          <div className="rounded-3xl border border-zinc-200/70 bg-white/80 p-5 shadow-[0_8px_28px_rgba(15,23,42,.05)] backdrop-blur">
            {currentStep === "basic" ? (
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
            ) : null}

            {currentStep === "location" ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  className={inputCls()}
                  value={d.country}
                  onChange={(e) => setD({ ...d, country: e.target.value })}
                  placeholder="Davlat"
                />
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
            ) : null}

            {currentStep === "physical" ? (
              <div className="grid gap-4">
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

            {currentStep === "personal" ? (
              <div className="grid gap-4">
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
            ) : null}

            {currentStep === "education" ? (
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
            ) : null}

            {currentStep === "religion" ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  className={inputCls()}
                  value={d.aqeeda}
                  onChange={(e) => setD({ ...d, aqeeda: e.target.value })}
                  placeholder="Aqida"
                />
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
            ) : null}

            {currentStep === "partner" ? (
              <div className="grid gap-3">
                <p className="text-[11px] font-medium text-zinc-500">
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
            ) : null}

            {currentStep === "about" ? (
              <textarea
                className="min-h-[140px] w-full resize-none rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-[13px] font-medium text-zinc-900 outline-none transition focus:border-zinc-300 focus:shadow-[0_0_0_4px_rgba(24,24,27,.06)]"
                value={d.about}
                onChange={(e) => setD({ ...d, about: e.target.value })}
                placeholder="Qisqacha… (kamida 20 ta belgi)"
              />
            ) : null}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={stepBack}
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-white px-5 text-[12px] font-extrabold text-zinc-900 ring-1 ring-zinc-200 hover:bg-zinc-50"
            >
              ← Orqaga
            </button>
            <button
              type="button"
              onClick={stepNext}
              disabled={!stepValid(currentStep, d)}
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-zinc-950 px-6 text-[12px] font-extrabold text-white ring-1 ring-black/10 hover:bg-zinc-900 disabled:opacity-60"
            >
              {stepIndex >= STEPS.length - 1 ? "Tarif tanlash →" : "Keyingi →"}
            </button>
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
