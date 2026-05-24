"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, useTransition } from "react";
import QuestionScreen from "./QuestionScreen";
import type { ListingCategory, ListingFormState } from "./constants";
import { FORM_STEPS, STEP_BADGE, STEP_UI, type FormStepId } from "./constants";
import { profileToForm, questionStep, stepUiForQuestion, visibleQuestions, type QuestionDef } from "./questions";

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

  const progressStep: FormStepId =
    phase === "questions" && currentQ ? questionStep(currentQ) : phase === "review" ? "story" : "personal";
  const progressBar = STEP_UI[progressStep].bar;

  const btnPrimary =
    "inline-flex h-11 items-center justify-center rounded-2xl bg-zinc-950 px-5 text-[13px] font-semibold text-white ring-1 ring-black/10 transition hover:bg-zinc-900 disabled:opacity-50";
  const btnSecondary =
    "inline-flex h-11 items-center justify-center rounded-2xl bg-white px-5 text-[13px] font-semibold text-zinc-900 ring-1 ring-zinc-200 transition hover:bg-zinc-50";

  return (
    <div ref={topRef} className="grid gap-4 pb-24 md:pb-8">
      <div className="rounded-3xl border border-zinc-200/70 bg-white/80 p-5 shadow-[0_8px_28px_rgba(15,23,42,.05)] backdrop-blur">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold tracking-wide text-zinc-500">YANGI E’LON</div>
            <h1 className="mt-2 text-lg font-bold leading-tight tracking-normal text-zinc-950 md:text-xl">
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
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-2xl bg-zinc-100 px-4 text-[12px] font-semibold text-zinc-800 ring-1 ring-zinc-200 hover:bg-white"
          >
            Bekor
          </Link>
        </div>

        <div className="mt-4">
          <div className="mb-1 flex justify-between text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            <span>Jarayon</span>
            <span>{overallProgress()}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
            <div
              className={`h-full rounded-full bg-linear-to-r ${progressBar} transition-all duration-500`}
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
          <div className="rounded-3xl border border-zinc-200/70 bg-white p-5 shadow-[0_4px_18px_rgba(15,23,42,.04)]">
            <p className="text-center text-[14px] font-semibold leading-relaxed text-zinc-700">
              Har bir savol alohida — taxminan <span className="font-bold text-zinc-950">3–5 daqiqa</span>.
            </p>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {FORM_STEPS.map((step) => {
                const ui = STEP_UI[step];
                return (
                  <div
                    key={step}
                    className={`flex items-start gap-3 rounded-2xl bg-zinc-50 p-4 ring-1 ${ui.ring}`}
                  >
                    <span className="text-2xl leading-none" aria-hidden>
                      {ui.icon}
                    </span>
                    <div className="min-w-0">
                      <div className={`inline-flex rounded-md px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${STEP_BADGE[step]}`}>
                        {ui.title}
                      </div>
                      <div className="mt-1 text-[13px] font-semibold text-zinc-950">{ui.sub}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 grid gap-2 rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-200">
              <div className="flex items-center gap-2 text-[13px] font-semibold text-zinc-800">
                <span className="text-lg">📋</span> Tarif tanlash
              </div>
              <div className="flex items-center gap-2 text-[13px] font-semibold text-zinc-800">
                <span className="text-lg">📷</span> Tasdiq fotosi (moderatsiya uchun)
              </div>
            </div>
          </div>
          <button type="button" onClick={() => goQuestions(0)} className={btnPrimary + " w-full"}>
            Boshlash →
          </button>
        </div>
      ) : null}

      {phase === "questions" && currentQ ? (
        <div className="grid gap-5">
          {(() => {
            const step = questionStep(currentQ);
            const ui = stepUiForQuestion(currentQ);
            return (
              <div className={`rounded-3xl border bg-white p-5 shadow-[0_4px_18px_rgba(15,23,42,.04)] ring-1 ${ui.ring}`}>
                <div className="mb-5 flex flex-col items-center text-center">
                  <span
                    className={`mb-3 inline-flex rounded-md px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${STEP_BADGE[step]}`}
                  >
                    {ui.title}
                  </span>
                  <span className="text-4xl leading-none" aria-hidden>
                    {currentQ.emoji}
                  </span>
                  {currentQ.optional ? (
                    <span className="mt-3 rounded-full bg-zinc-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                      Ixtiyoriy
                    </span>
                  ) : null}
                </div>
                <QuestionScreen q={currentQ} d={d} setD={setD} onChipPick={onChipPick} />
                {hint ? (
                  <p className="mt-4 text-center text-[12px] font-semibold text-rose-600">{hint}</p>
                ) : null}
              </div>
            );
          })()}

          <div className="sticky bottom-0 z-10 -mx-1 grid gap-2 rounded-t-3xl border-t border-zinc-200/80 bg-white/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur md:static md:mx-0 md:rounded-none md:border-0 md:bg-transparent md:p-0">
            <div className="flex items-center gap-2">
              <button type="button" onClick={questionBack} className={btnSecondary + " flex-1"}>
                ← Orqaga
              </button>
              {currentQ.optional ? (
                <button
                  type="button"
                  onClick={() => questionNext(true)}
                  className="inline-flex h-11 items-center justify-center rounded-2xl px-3 text-[12px] font-semibold text-zinc-600 underline decoration-zinc-300 underline-offset-2 hover:text-zinc-900"
                >
                  O‘tkazib yuborish
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => questionNext(false)}
                disabled={!canNext}
                className={btnPrimary + " flex-[1.4]"}
              >
                {qIndex >= totalQ - 1 ? "Ko‘rib chiqish →" : "Keyingi →"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {phase === "review" ? (
        <div className="grid gap-4">
          <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/60 p-4 text-[13px] font-semibold text-emerald-950 ring-1 ring-emerald-100">
            Hammasi to‘g‘rimi? Pastdan istalgan bo‘limga qaytishingiz mumkin.
          </div>
          <div className="rounded-3xl border border-zinc-200/70 bg-white p-5 shadow-[0_4px_18px_rgba(15,23,42,.04)]">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">E‘lon kartochkasi</div>
            <div className="mt-3 overflow-hidden rounded-2xl bg-linear-to-br from-rose-400 via-fuchsia-600 to-rose-900 p-5 text-white shadow-[0_8px_28px_rgba(15,23,42,.12)]">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
                <span className="rounded-full bg-black/30 px-2 py-0.5">
                  {d.listingCategory === "kuyovlar" ? "Kuyov" : "Kelin"}
                </span>
                <span className="rounded-full bg-black/30 px-2 py-0.5">{d.age} yosh</span>
              </div>
              <div className="mt-3 text-lg font-bold leading-tight">{d.name}</div>
              <div className="mt-1 text-[12px] font-semibold text-white/85">
                {d.region}, {d.city} · {d.country}
              </div>
              <div className="mt-2 text-[12px] text-white/80">
                {d.jobTitle} · {d.heightCm} sm · {d.weightKg} kg
              </div>
              <p className="mt-3 line-clamp-4 text-[12px] leading-relaxed text-white/90">{d.about}</p>
            </div>
          </div>
          <div className="grid gap-3">
            {FORM_STEPS.map((step) => {
              const ui = STEP_UI[step];
              const stepQuestions = questions.filter((q) => questionStep(q) === step);
              if (stepQuestions.length === 0) return null;
              return (
                <div key={step} className={`rounded-2xl bg-zinc-50 p-3 ring-1 ${ui.ring}`}>
                  <div className={`mb-2 inline-flex rounded-md px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${STEP_BADGE[step]}`}>
                    {ui.icon} {ui.title}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {stepQuestions.map((q) => {
                      const i = questions.findIndex((x) => x.id === q.id);
                      return (
                        <button
                          key={q.id}
                          type="button"
                          onClick={() => {
                            setQIndex(i);
                            setPhase("questions");
                            scrollTop();
                          }}
                          className="rounded-xl bg-white px-3 py-2 text-[11px] font-semibold text-zinc-800 ring-1 ring-zinc-200 transition hover:bg-zinc-50"
                        >
                          {q.emoji} {q.title.length > 24 ? q.title.slice(0, 22) + "…" : q.title}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button type="button" onClick={goBack} className={btnSecondary}>
              ← Orqaga
            </button>
            <button
              type="button"
              onClick={() => {
                setPhase("plan");
                scrollTop();
              }}
              disabled={!validInfo}
              className={btnPrimary + " px-6 disabled:opacity-60"}
            >
              Tarif tanlash →
            </button>
          </div>
        </div>
      ) : null}

      {phase === "plan" ? (
        <div className="grid gap-4">
          <div className="rounded-3xl border border-zinc-200/70 bg-white p-5 shadow-[0_4px_18px_rgba(15,23,42,.04)]">
            <div className="flex items-center gap-2">
              <span className="text-xl" aria-hidden>
                📋
              </span>
              <div className="text-[14px] font-bold text-zinc-950">Tarifni tanlang</div>
            </div>
            <p className="mt-1 text-[13px] font-medium text-zinc-600">E’lon qancha vaqt ko‘rinsin?</p>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {PLANS.map((p) => {
                const selected = d.plan === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setD({ ...d, plan: p.id })}
                    className={
                      "relative rounded-2xl border bg-white p-4 text-left transition ring-1 " +
                      (selected
                        ? "border-zinc-950 ring-zinc-950 shadow-[0_4px_18px_rgba(15,23,42,.08)]"
                        : "border-zinc-200 ring-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/50")
                    }
                  >
                    {p.badge ? (
                      <span className="absolute right-3 top-3 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-900 ring-1 ring-amber-200">
                        {p.badge}
                      </span>
                    ) : null}
                    <div className="text-[15px] font-bold text-zinc-950">{p.title}</div>
                    <div className="mt-1 text-[12px] font-semibold text-zinc-600">{p.days} kun ko‘rinadi</div>
                    {p.description ? (
                      <div className="mt-1 text-[11px] font-medium text-zinc-500">{p.description}</div>
                    ) : null}
                    <div className="mt-3 text-xl font-bold tabular-nums text-zinc-950">
                      {p.priceUzs.toLocaleString()}{" "}
                      <span className="text-[12px] font-semibold text-zinc-600">so‘m</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button type="button" onClick={goBack} className={btnSecondary}>
              ← Orqaga
            </button>
            <button type="button" onClick={goToVerify} className={btnPrimary + " px-6"}>
              Keyingi: tasdiq fotosi →
            </button>
          </div>
        </div>
      ) : null}

      {phase === "verify" ? (
        <div className="grid gap-4">
          <div className="rounded-3xl border border-violet-200/70 bg-violet-50/80 p-5 ring-1 ring-violet-100">
            <div className="flex items-center gap-2">
              <span className="text-xl" aria-hidden>
                📷
              </span>
              <div className="text-[14px] font-bold text-violet-950">Nega rasm kerak?</div>
            </div>
            <ul className="mt-3 grid gap-2 text-[13px] font-medium leading-relaxed text-violet-950/90">
              <li className="flex gap-2">
                <span className="text-violet-600">•</span>
                <span>
                  Bu rasm saytda ko‘rsatilmaydi — faqat <strong>moderatsiya</strong> uchun.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-violet-600">•</span>
                <span>Soxta e’lonlarni kamaytirish uchun yuzingiz aniq ko‘rinishi kerak.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-violet-600">•</span>
                <span>
                  <strong>Kelin</strong> e’lonlarini ayol, <strong>kuyov</strong> e’lonlarini erkak moderatorlar
                  tekshiradi.
                </span>
              </li>
            </ul>
          </div>
          <div className="rounded-3xl border border-zinc-200/70 bg-white p-5 shadow-[0_4px_18px_rgba(15,23,42,.04)]">
            <div className="text-[13px] font-bold text-zinc-950">Yuzingiz ko‘rinadigan foto</div>
            <p className="mt-1 text-[12px] font-medium text-zinc-600">JPEG, PNG yoki WebP · maks. ~5 MB</p>
            <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50 px-4 py-8 transition hover:border-zinc-300 hover:bg-white">
              <span className="text-3xl" aria-hidden>
                {verificationFile ? "✓" : "📤"}
              </span>
              <span className="mt-2 text-[13px] font-semibold text-zinc-900">
                {verificationFile ? verificationFile.name : "Rasm tanlash"}
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(e) => setVerificationFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button type="button" onClick={goBack} className={btnSecondary}>
              ← Orqaga
            </button>
            <button type="button" onClick={submit} disabled={pending || !validVerify} className={btnPrimary + " px-6 disabled:opacity-60"}>
              {pending ? "Joylanmoqda…" : "Moderatsiyaga yuborish"}
            </button>
          </div>
          {error ? (
            <div className="rounded-2xl bg-rose-50 p-3 text-[12px] font-semibold text-rose-800 ring-1 ring-rose-200">
              {error}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
