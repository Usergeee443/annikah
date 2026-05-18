"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { COUNTRIES } from "@/lib/countries";
import {
  computeProfileComplete,
  getProfileGaps,
  type ProfileGapField,
  type ProfileShape,
} from "@/lib/profileCompleteness";

const CHIP_OPTIONS: Record<
  "aqeeda" | "prayer" | "quran" | "madhab",
  { value: string; label: string }[]
> = {
  aqeeda: [
    { value: "ahli_sunna", label: "Ahli sunna" },
    { value: "moturidiy", label: "Moturidiy" },
    { value: "ashariy", label: "Ash\u2019ariy" },
    { value: "boshqa", label: "Boshqa" },
  ],
  prayer: [
    { value: "farz", label: "Doimiy" },
    { value: "bazan", label: "Ba\u2019zan" },
    { value: "oqimaydi", label: "O\u2018qimayman" },
  ],
  quran: [
    { value: "qiroat_yaxshi", label: "Yaxshi" },
    { value: "ortacha", label: "O\u2018rtacha" },
    { value: "oqimaydi", label: "O\u2018qimayman" },
  ],
  madhab: [
    { value: "hanafiy", label: "Hanafiy" },
    { value: "shofiiy", label: "Shofi\u2019iy" },
    { value: "molikiy", label: "Molikiy" },
    { value: "hanbaliy", label: "Hanbaliy" },
    { value: "boshqa", label: "Boshqa" },
  ],
};

function inputCls() {
  return "mt-1.5 w-full rounded-2xl border border-zinc-200 bg-white px-3.5 py-2.5 text-[13px] font-semibold text-zinc-950 outline-none ring-zinc-950/10 focus:ring-2";
}

function chipBtn(active: boolean) {
  return [
    "inline-flex h-9 items-center justify-center rounded-2xl px-3 text-[11.5px] font-extrabold ring-1 transition",
    active
      ? "bg-zinc-950 text-white ring-zinc-950"
      : "bg-white text-zinc-800 ring-zinc-200 hover:bg-zinc-50",
  ].join(" ");
}

type Props = {
  profile: ProfileShape;
  compact?: boolean;
  onComplete?: () => void;
};

export default function ProfileGapsPanel({ profile, compact, onComplete }: Props) {
  const [local, setLocal] = useState<ProfileShape>(profile);
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [savedField, setSavedField] = useState<ProfileGapField | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    setLocal(profile);
  }, [profile]);

  const gaps = useMemo(() => getProfileGaps(local), [local]);
  const complete = useMemo(() => computeProfileComplete(local), [local]);
  const wasCompleteRef = useRef(computeProfileComplete(profile));
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (complete && !wasCompleteRef.current) onCompleteRef.current?.();
    wasCompleteRef.current = complete;
  }, [complete]);

  if (complete) {
    return (
      <div className="rounded-3xl bg-emerald-50 p-4 text-[13px] font-semibold text-emerald-900 ring-1 ring-emerald-200">
        Profil to‘liq. Endi e‘lon yaratishingiz yoki tahrirlashingiz mumkin.
      </div>
    );
  }

  if (gaps.length === 0) return null;

  const grouped = gaps.reduce<Record<string, typeof gaps>>((acc, g) => {
    (acc[g.group] ??= []).push(g);
    return acc;
  }, {});

  function getDraft(field: ProfileGapField): string {
    if (drafts[field] !== undefined) return drafts[field];
    const v = local[field];
    if (v === null || v === undefined) return "";
    return String(v);
  }

  function setDraft(field: ProfileGapField, v: string) {
    setDrafts((d) => ({ ...d, [field]: v }));
  }

  function patchField(field: ProfileGapField, value: unknown) {
    setErr(null);
    setSavedField(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/profile/patch", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ [field]: value }),
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) throw new Error(data?.error || "Saqlab bo\u2018lmadi");
        const next = { ...local, [field]: value as never };
        setLocal(next);
        setSavedField(field);
        setDrafts((d) => {
          const copy = { ...d };
          delete copy[field];
          return copy;
        });
        if (data?.isComplete || computeProfileComplete(next)) onComplete?.();
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Xatolik");
      }
    });
  }

  function parseAndSave(field: ProfileGapField) {
    const raw = getDraft(field);
    if (field === "age" || field === "heightCm" || field === "weightKg") {
      const n = Number(raw);
      if (!Number.isFinite(n)) {
        setErr("Raqam kiriting");
        return;
      }
      patchField(field, Math.round(n));
      return;
    }
    patchField(field, raw.trim());
  }

  function renderField(gap: (typeof gaps)[0]) {
    const { field } = gap;

    if (field === "category") {
      const cur =
        local.category === "kuyovlar"
          ? "kuyovlar"
          : local.category === "kelinlar"
            ? "kelinlar"
            : "";
      return (
        <div className="mt-1.5 flex flex-wrap gap-2">
          {(["kelinlar", "kuyovlar"] as const).map((v) => (
            <button
              key={v}
              type="button"
              disabled={pending}
              className={chipBtn(cur === v)}
              onClick={() => patchField("category", v)}
            >
              {v === "kelinlar" ? "Kelin" : "Kuyov"}
            </button>
          ))}
        </div>
      );
    }

    if (field === "aqeeda" || field === "prayer" || field === "quran" || field === "madhab") {
      const cur = String(local[field] || "");
      return (
        <div className="mt-1.5 flex flex-wrap gap-2">
          {CHIP_OPTIONS[field].map((opt) => (
            <button
              key={opt.value}
              type="button"
              disabled={pending}
              className={chipBtn(cur === opt.value)}
              onClick={() => patchField(field, opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      );
    }

    if (field === "country") {
      return (
        <select
          className={inputCls()}
          value={local.country || ""}
          disabled={pending}
          onChange={(e) => patchField("country", e.target.value)}
        >
          <option value="">Tanlang</option>
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.name}>
              {c.flag} {c.name}
            </option>
          ))}
        </select>
      );
    }

    if (field === "about") {
      return (
        <>
          <textarea
            className={`${inputCls()} min-h-[88px] resize-y`}
            value={getDraft("about")}
            disabled={pending}
            onChange={(e) => setDraft("about", e.target.value)}
            placeholder="Kamida 30 belgi"
          />
          <div className="mt-1 text-[10px] font-semibold text-zinc-500">
            {getDraft("about").trim().length}/30
          </div>
        </>
      );
    }

    const isNum = field === "age" || field === "heightCm" || field === "weightKg";
    return (
      <input
        type={isNum ? "number" : "text"}
        className={inputCls()}
        value={getDraft(field)}
        disabled={pending}
        onChange={(e) => setDraft(field, e.target.value)}
      />
    );
  }

  const instantSave = new Set<ProfileGapField>([
    "category",
    "country",
    "aqeeda",
    "prayer",
    "quran",
    "madhab",
  ]);

  return (
    <div className={compact ? "grid gap-3" : "grid gap-4"}>
      <div className="rounded-3xl bg-amber-50/80 p-4 ring-1 ring-amber-200/80">
        <div className="text-[12px] font-extrabold text-amber-950">
          Profil to‘liq emas — {gaps.length} ta maydon qoldi
        </div>
        <p className="mt-1 text-[12px] font-medium leading-relaxed text-amber-900/90">
          Faqat yetishmayotgan qismlarni to‘ldiring.
        </p>
      </div>

      {err ? (
        <div className="rounded-2xl bg-rose-50 p-3 text-[12px] font-semibold text-rose-900 ring-1 ring-rose-200">
          {err}
        </div>
      ) : null}

      <div className="max-h-[min(60vh,420px)] space-y-4 overflow-y-auto pr-1">
        {Object.entries(grouped).map(([group, items]) => (
          <div key={group}>
            <div className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-zinc-500">{group}</div>
            <div className="mt-2 grid gap-3">
              {items.map((gap) => (
                <div key={gap.field} className="rounded-2xl bg-white p-3.5 ring-1 ring-zinc-200">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-[12px] font-extrabold text-zinc-950">{gap.label}</label>
                    {savedField === gap.field && !pending ? (
                      <span className="text-[10px] font-bold text-emerald-600">Saqlandi</span>
                    ) : null}
                  </div>
                  {renderField(gap)}
                  {!instantSave.has(gap.field) ? (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => parseAndSave(gap.field)}
                      className="mt-2.5 inline-flex h-9 items-center justify-center rounded-2xl bg-zinc-950 px-4 text-[11px] font-extrabold text-white hover:bg-zinc-900 disabled:opacity-60"
                    >
                      {pending ? "…" : "Saqlash"}
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
