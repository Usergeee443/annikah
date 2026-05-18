"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, useTransition } from "react";
import QuestionScreen from "./QuestionScreen";
import type { ListingCategory, ListingFormState } from "./constants";
import { profileToForm, visibleQuestions, type QuestionDef } from "./questions";

export type WizardPlan = {
  id: ListingFormState["plan"];
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

const CHIP_AUTO: Set<string> = new Set([
  "category",
  "smokes",
  "maritalStatus",
  "children",
  "polygamyAllowance",
  "education",
  "aqeeda",
  "prayer",
  "quran",
  "madhab",
]);

type Phase = "welcome" | "questions" | "review" | "plan" | "verify";

export default function ListingCreateWizard({
  initialProfile,
  category,
  plans,
  createListingUrl = "/api/listings/create-extra",
}: {
  initialProfile: Record<string, unknown> | null;
  category: string;
  plans?: WizardPlan[];
  createListingUrl?: string;
}) {
  const router = useRouter();
  const PLANS = plans && plans.length > 0 ? plans : DEFAULT_PLANS;
  const initialCat: ListingCategory = category === "kuyovlar" ? "kuyovlar" : "kelinlar";

  const [phase, setPhase] = useState<Phase>("welcome");
  const [qIndex, setQIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const topRef = useRef<HTMLDivElement>(null);
  const [verificationFile, setVerificationFile] = useState<File | null>(null);

  const [d, setD] = useState<ListingFormState>(() =>
    profileToForm(initialProfile, initialCat),
  );

  const questions = useMemo(() => visibleQuestions(d), [d]);
  const totalQ = questions.length;
  const currentQ: QuestionDef | undefined = questions[qIndex];
  const validInfo = useMemo(() => questions.every((q) => q.isValid(d)), [questions, d]);

  const validVerify = validInfo && verificationFile !== null && verificationFile.size > 0;

  function scrollTop() {
    const isMobile =
      typeof window !== "undefined" && window.matchMedia?.("(max-width: 767px)")?.matches;
    topRef.current?.scrollIntoView({ behavior: isMobile ? "auto" : "smooth", block: "start" });
  }

  function overallProgress() {
    if (phase === "welcome") return 4;
    if (phase === "questions" && totalQ > 0) return 8 + Math.round(((qIndex + 1) / totalQ) * 58);
    if (phase === "review") return 72;
    if (phase === "plan") return 86;
    return 96;
  }

  function goQuestions(startAt = 0) {
    setQIndex(startAt);
    setPhase("questions");
    scrollTop();
  }

  function questionNext(skipValidation = false) {
    const q = questions[qIndex];
    if (!q) return;
    if (!skipValidation && !q.optional && !q.isValid(d)) return;
    if (qIndex >= totalQ - 1) {
      setPhase("review");
    } else {
      setQIndex((i) => i + 1);
    }
    scrollTop();
  }

  function questionBack() {
    if (qIndex <= 0) {
      setPhase("welcome");
    } else {
      setQIndex((i) => i - 1);
    }
    scrollTop();
  }

  function onChipPick() {
    const q = questions[qIndex];
    if (!q || !CHIP_AUTO.has(q.id)) return;
    window.setTimeout(() => {
      setD((prev) => {
        const qs = visibleQuestions(prev);
        const idx = qs.findIndex((x) => x.id === q.id);
        const cur = idx >= 0 ? qs[idx] : null;
        if (!cur?.isValid(prev)) return prev;
        if (idx >= qs.length - 1) {
          setPhase("review");
        } else {
          setQIndex(idx + 1);
        }
        return prev;
      });
    }, 320);
  }

  function goBack() {
    scrollTop();
    if (phase === "verify") setPhase("plan");
    else if (phase === "plan") setPhase("review");
    else if (phase === "review") {
      setPhase("questions");
      setQIndex(Math.max(0, totalQ - 1));
    }
  }

  function goToVerify() {
    scrollTop();
    setPhase("verify");
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
      : phase === "questions" && currentQ
        ? currentQ.title
        : phase === "review"
          ? "Hammasi to‘g‘rimi?"
          : phase === "plan"
            ? "Tarifni tanlang"
            : "Tasdiq fotosi";

  const hint = currentQ?.hint(d) ?? null;
  const canNext = currentQ ? currentQ.optional || currentQ.isValid(d) : false;

  return (
    <div ref={topRef} className="grid gap-4 pb-24 md:pb-8">
      <div className="rounded-3xl border border-zinc-200/70 bg-white/80 p-5 shadow-[0_8px_28px_rgba(15,23,42,.05)] backdrop-blur">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-[11px] font-extrabold tracking-widest text-zinc-500">YANGI E’LON</div>
            <h1 className="mt-2 text-[22px] font-black leading-tight tracking-tight text-zinc-950 md:text-[26px]">
              {headerTitle}
            </h1>
            {phase === "questions" && currentQ ? (
              <p className="mt-2 text-[14px] font-medium leading-relaxed text-zinc-600">{currentQ.subtitle}</p>
            ) : (
              <p className="mt-1 text-[13px] font-medium text-zinc-600">
                {phase === "welcome"
                  ? "Har bir savol alohida — tez va tushunarli."
                  : phase === "verify"
                    ? "Foto faqat moderatsiya uchun; boshqalarga ko‘rinmaydi."
                    : "Ma’lumotlaringiz moderatsiyadan o‘tadi."}
              </p>
            )}
          </div>
          <Link
            href="/ads"
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-2xl bg-zinc-100 px-4 text-[12px] font-extrabold text-zinc-800 ring-1 ring-zinc-200 hover:bg-white"
          >
            Bekor
          </Link>
        </div>

        <div className="mt-4">
          <div className="mb-1 flex justify-between text-[10px] font-extrabold uppercase tracking-wider text-zinc-500">
            <span>Jarayon</span>
            <span>{overallProgress()}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
            <div
              className="h-full rounded-full bg-linear-to-r from-indigo-500 via-fuchsia-500 to-rose-500 transition-all duration-500"
              style={{ width: `${overallProgress()}%` }}
            />
          </div>
          {phase === "questions" && totalQ > 0 ? (
            <p className="mt-2 text-center text-[11px] font-bold text-zinc-500">
              Savol {qIndex + 1} / {totalQ}
            </p>
          ) : null}
        </div>
      </div>

      {phase === "welcome" ? (
        <div className="grid gap-4">
          <div className="rounded-3xl border border-indigo-100 bg-indigo-50/50 p-6 text-center ring-1 ring-indigo-100">
            <div className="text-5xl">💍</div>
            <p className="mt-4 text-[15px] font-semibold leading-relaxed text-indigo-950">
              Bir vaqtning o‘zida bitta savol — chalkashmaslik uchun. Taxminan 3–5 daqiqa.
            </p>
            <ul className="mx-auto mt-4 max-w-sm grid gap-2 text-left text-[13px] font-medium text-indigo-900/90">
              <li>✓ Ism, yosh, manzil</li>
              <li>✓ Din va oilaviy holat</li>
              <li>✓ O‘zingiz haqingizda qisqa matn</li>
              <li>✓ Tarif va tasdiq fotosi</li>
            </ul>
          </div>
          <button
            type="button"
            onClick={() => goQuestions(0)}
            className="inline-flex h-14 w-full items-center justify-center rounded-2xl bg-zinc-950 text-[15px] font-extrabold text-white shadow-lg ring-1 ring-black/10 hover:bg-zinc-900"
          >
            Boshlash →
          </button>
        </div>
      ) : null}

      {phase === "questions" && currentQ ? (
        <div className="grid gap-5">
          <div className="rounded-3xl border border-zinc-200/70 bg-white p-6 shadow-sm">
            <div className="mb-6 flex flex-col items-center text-center">
              <span className="text-5xl" aria-hidden>
                {currentQ.emoji}
              </span>
              {currentQ.optional ? (
                <span className="mt-3 rounded-full bg-zinc-100 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-zinc-600">
                  Ixtiyoriy
                </span>
              ) : null}
            </div>
            <QuestionScreen q={currentQ} d={d} setD={setD} onChipPick={onChipPick} />
            {hint ? (
              <p className="mt-4 text-center text-[12px] font-semibold text-rose-600">{hint}</p>
            ) : null}
          </div>

          <div className="sticky bottom-0 z-10 -mx-1 grid gap-2 rounded-t-3xl border-t border-zinc-200/80 bg-white/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur md:static md:mx-0 md:rounded-none md:border-0 md:bg-transparent md:p-0">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={questionBack}
                className="inline-flex h-12 flex-1 items-center justify-center rounded-2xl bg-white text-[13px] font-extrabold text-zinc-900 ring-2 ring-zinc-200 hover:bg-zinc-50"
              >
                ← Orqaga
              </button>
              {currentQ.optional ? (
                <button
                  type="button"
                  onClick={() => questionNext(true)}
                  className="inline-flex h-12 items-center justify-center rounded-2xl px-4 text-[12px] font-extrabold text-zinc-600 underline decoration-zinc-300 underline-offset-2 hover:text-zinc-900"
                >
                  O‘tkazib yuborish
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => questionNext(false)}
                disabled={!canNext}
                className="inline-flex h-12 flex-[1.4] items-center justify-center rounded-2xl bg-zinc-950 text-[13px] font-extrabold text-white ring-1 ring-black/10 hover:bg-zinc-900 disabled:opacity-50"
              >
                {qIndex >= totalQ - 1 ? "Ko‘rib chiqish →" : "Keyingi →"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {phase === "review" ? (
        <div className="grid gap-4">
          <div className="rounded-3xl border border-emerald-200/70 bg-emerald-50/60 p-4 text-[12px] font-medium text-emerald-950 ring-1 ring-emerald-100">
            Hammasi to‘g‘rimi? Pastdan istalgan savolga qaytishingiz mumkin.
          </div>
          <div className="rounded-3xl border border-zinc-200/70 bg-white p-5 shadow-sm">
            <div className="text-[11px] font-extrabold uppercase tracking-widest text-zinc-500">E‘lon kartochkasi</div>
            <div className="mt-3 overflow-hidden rounded-2xl bg-linear-to-br from-rose-400 via-fuchsia-600 to-rose-900 p-5 text-white shadow-md">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-extrabold">
                <span className="rounded-full bg-black/30 px-2 py-0.5">
                  {d.listingCategory === "kuyovlar" ? "Kuyov" : "Kelin"}
                </span>
                <span className="rounded-full bg-black/30 px-2 py-0.5">{d.age} yosh</span>
              </div>
              <div className="mt-3 text-[22px] font-black leading-tight">{d.name}</div>
              <div className="mt-1 text-[12px] font-semibold text-white/85">
                {d.region}, {d.city} · {d.country}
              </div>
              <div className="mt-2 text-[12px] text-white/80">
                {d.jobTitle} · {d.heightCm} sm · {d.weightKg} kg
              </div>
              <p className="mt-3 line-clamp-4 text-[12px] leading-relaxed text-white/90">{d.about}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {questions.map((q, i) => (
              <button
                key={q.id}
                type="button"
                onClick={() => {
                  setQIndex(i);
                  setPhase("questions");
                  scrollTop();
                }}
                className="rounded-xl bg-zinc-100 px-3 py-2 text-[11px] font-extrabold text-zinc-800 ring-1 ring-zinc-200 hover:bg-white"
              >
                {q.emoji} {q.title.length > 28 ? q.title.slice(0, 26) + "…" : q.title}
              </button>
            ))}
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
              onClick={() => {
                setPhase("plan");
                scrollTop();
              }}
              disabled={!validInfo}
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-zinc-950 px-6 text-[12px] font-extrabold text-white ring-1 ring-black/10 hover:bg-zinc-900 disabled:opacity-60"
            >
              Tarif tanlash →
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
                    "relative rounded-2xl border bg-white p-4 text-left transition " +
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
                Bu rasm saytda ko‘rsatilmaydi — faqat <span className="font-extrabold">moderatsiya</span> uchun.
              </li>
              <li>Soxta e’lonlarni kamaytirish uchun yuzingiz aniq ko‘rinishi kerak.</li>
              <li>
                <span className="font-extrabold">Kelin</span> e’lonlarini ayol,{" "}
                <span className="font-extrabold">kuyov</span> e’lonlarini erkak moderatorlar tekshiradi.
              </li>
            </ul>
          </div>
          <div className="rounded-3xl border border-zinc-200/70 bg-white/80 p-5 shadow-[0_8px_28px_rgba(15,23,42,.05)] backdrop-blur">
            <div className="text-[12px] font-extrabold tracking-tight text-zinc-950">Yuzingiz ko‘rinadigan foto</div>
            <p className="mt-1 text-[11px] font-medium text-zinc-600">JPEG, PNG yoki WebP. Maks. ~5 MB.</p>
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
