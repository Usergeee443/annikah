"use client";

import Link from "next/link";
import { useMemo, useRef, useState, useTransition } from "react";

type Plan = "days15" | "month1" | "months3";

const PLANS: Array<{ id: Plan; title: string; days: number; priceUzs: number; badge?: string; perks: string[] }> = [
  { id: "days15", title: "15 kun", days: 15, priceUzs: 39000, perks: ["Oddiy joylash", "15 kun faol"] },
  { id: "month1", title: "1 oy", days: 30, priceUzs: 69000, badge: "Mashhur", perks: ["Oddiy joylash", "30 kun faol", "Ko‘proq ko‘rish"] },
  { id: "months3", title: "3 oy", days: 90, priceUzs: 159000, badge: "Tejamli", perks: ["Oddiy joylash", "90 kun faol", "Eng tejamli narx"] },
];

type AnyProfile = any;

type FormState = {
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

function inputCls() {
  return "h-11 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-[13px] font-semibold text-zinc-900 outline-none transition focus:border-zinc-300 focus:shadow-[0_0_0_4px_rgba(24,24,27,.06)]";
}

function toStr(v: any) {
  return v === null || v === undefined ? "" : String(v);
}

export default function ExtraListingWizard({
  initialProfile,
  category,
  onCreate,
}: {
  initialProfile: AnyProfile;
  category: string;
  onCreate: (data: any) => Promise<any>;
}) {
  const [step, setStep] = useState<0 | 1>(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const topRef = useRef<HTMLDivElement>(null);

  const [d, setD] = useState<FormState>(() => ({
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
    polygamyAllowance: initialProfile?.polygamyAllowance ?? null,
    education: initialProfile?.education || "bilinmaydi",
    partnerAgeFrom: initialProfile?.partnerAgeFrom ?? null,
    partnerAgeTo: initialProfile?.partnerAgeTo ?? null,
    partnerCountries: initialProfile?.partnerCountries || "",
    partnerRegions: initialProfile?.partnerRegions || "",
    partnerCities: initialProfile?.partnerCities || "",
    plan: "month1",
  }));

  const validInfo = useMemo(() => {
    return (
      d.name.trim().length >= 2 &&
      d.age >= 18 &&
      d.country.trim() &&
      d.region.trim() &&
      d.city.trim() &&
      d.nationality.trim() &&
      d.heightCm >= 140 &&
      d.weightKg >= 35 &&
      d.jobTitle.trim() &&
      d.about.trim().length >= 20 &&
      d.aqeeda.trim() &&
      d.prayer.trim() &&
      d.quran.trim() &&
      d.madhab.trim()
    );
  }, [d]);

  function goNext() {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setStep(1);
  }

  function goBack() {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setStep(0);
  }

  function submit() {
    setError(null);
    start(async () => {
      try {
        await onCreate(d);
      } catch (e: any) {
        setError(e?.message || "Xatolik");
      }
    });
  }

  return (
    <div className="grid gap-4" ref={topRef}>
      <div className="rounded-3xl border border-zinc-200/70 bg-white/80 p-5 shadow-[0_8px_28px_rgba(15,23,42,.05)] backdrop-blur">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-[11px] font-extrabold tracking-widest text-zinc-500">YANGI E’LON</div>
            <h1 className="mt-2 text-[26px] font-black tracking-tight text-zinc-950">
              {step === 0 ? "Ma’lumotlarni to‘ldiring" : "Tarifni tanlang"}
            </h1>
            <p className="mt-1 text-[13px] font-medium text-zinc-600">
              Kategoriya profilingizdan olinadi:{" "}
              <span className="font-extrabold text-zinc-900">
                {category === "kuyovlar" ? "Kuyov" : "Kelin"}
              </span>
              .
            </p>
          </div>
          <Link
            href="/elonlarim"
            className="inline-flex h-10 items-center justify-center rounded-2xl bg-white px-4 text-[12px] font-extrabold text-zinc-900 ring-1 ring-zinc-200 hover:bg-zinc-50"
          >
            Bekor qilish
          </Link>
        </div>
      </div>

      {step === 0 ? (
        <div className="grid gap-4">
          <div className="rounded-3xl border border-zinc-200/70 bg-white/80 p-5 shadow-[0_8px_28px_rgba(15,23,42,.05)] backdrop-blur">
            <div className="text-[12px] font-extrabold tracking-tight text-zinc-950">Asosiy</div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <input className={inputCls()} value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} placeholder="Ism" />
              <input className={inputCls()} type="number" value={d.age} onChange={(e) => setD({ ...d, age: Number(e.target.value) })} placeholder="Yosh" />
              <input className={inputCls()} value={d.country} onChange={(e) => setD({ ...d, country: e.target.value })} placeholder="Davlat" />
              <input className={inputCls()} value={d.region} onChange={(e) => setD({ ...d, region: e.target.value })} placeholder="Viloyat" />
              <input className={inputCls()} value={d.city} onChange={(e) => setD({ ...d, city: e.target.value })} placeholder="Shahar/Tuman" />
              <input className={inputCls()} value={d.nationality} onChange={(e) => setD({ ...d, nationality: e.target.value })} placeholder="Millat" />
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-200/70 bg-white/80 p-5 shadow-[0_8px_28px_rgba(15,23,42,.05)] backdrop-blur">
            <div className="text-[12px] font-extrabold tracking-tight text-zinc-950">Jismoniy</div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <input className={inputCls()} type="number" value={d.heightCm} onChange={(e) => setD({ ...d, heightCm: Number(e.target.value) })} placeholder="Bo‘y (sm)" />
              <input className={inputCls()} type="number" value={d.weightKg} onChange={(e) => setD({ ...d, weightKg: Number(e.target.value) })} placeholder="Vazn (kg)" />
              <input className={inputCls()} value={d.jobTitle} onChange={(e) => setD({ ...d, jobTitle: e.target.value })} placeholder="Kasb" />
              <input className={inputCls()} value={toStr(d.incomeMonthlyUsd)} onChange={(e) => setD({ ...d, incomeMonthlyUsd: e.target.value ? Number(e.target.value) : null })} placeholder="Daromad (USD) ixtiyoriy" />
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-200/70 bg-white/80 p-5 shadow-[0_8px_28px_rgba(15,23,42,.05)] backdrop-blur">
            <div className="text-[12px] font-extrabold tracking-tight text-zinc-950">Diniy</div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <input className={inputCls()} value={d.aqeeda} onChange={(e) => setD({ ...d, aqeeda: e.target.value })} placeholder="Aqida" />
              <input className={inputCls()} value={d.prayer} onChange={(e) => setD({ ...d, prayer: e.target.value })} placeholder="Namoz" />
              <input className={inputCls()} value={d.quran} onChange={(e) => setD({ ...d, quran: e.target.value })} placeholder="Qur’on" />
              <input className={inputCls()} value={d.madhab} onChange={(e) => setD({ ...d, madhab: e.target.value })} placeholder="Mazhhab" />
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-200/70 bg-white/80 p-5 shadow-[0_8px_28px_rgba(15,23,42,.05)] backdrop-blur">
            <div className="text-[12px] font-extrabold tracking-tight text-zinc-950">O‘zi haqida</div>
            <textarea
              className="mt-3 min-h-[120px] w-full resize-none rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-[13px] font-medium text-zinc-900 outline-none transition focus:border-zinc-300 focus:shadow-[0_0_0_4px_rgba(24,24,27,.06)]"
              value={d.about}
              onChange={(e) => setD({ ...d, about: e.target.value })}
              placeholder="Qisqacha… (kamida 20 ta belgi)"
            />
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={goNext}
              disabled={!validInfo}
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-zinc-950 px-6 text-[12px] font-extrabold text-white ring-1 ring-black/10 hover:bg-zinc-900 disabled:opacity-60"
            >
              Tarif tanlash →
            </button>
          </div>
        </div>
      ) : (
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
                  <div className="mt-3 text-xl font-extrabold tracking-tight text-zinc-950">
                    {p.priceUzs.toLocaleString()}{" "}
                    <span className="text-[12px] font-bold text-zinc-600">so‘m</span>
                  </div>
                  <ul className="mt-3 grid gap-1 text-[11px] font-semibold text-zinc-600">
                    {p.perks.map((x) => (
                      <li key={x} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span>{x}</span>
                      </li>
                    ))}
                  </ul>
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
              onClick={submit}
              disabled={pending}
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-zinc-950 px-6 text-[12px] font-extrabold text-white ring-1 ring-black/10 hover:bg-zinc-900 disabled:opacity-60"
            >
              {pending ? "Joylanmoqda…" : "E’lonni joylash"}
            </button>
          </div>

          {error ? <div className="text-[12px] font-extrabold text-rose-700">{error}</div> : null}
        </div>
      )}
    </div>
  );
}

