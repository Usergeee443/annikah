"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type ListingData = {
  id: number;
  name: string;
  age: number;
  country: string;
  region: string;
  city: string;
  nationality: string;
  heightCm: number;
  weightKg: number;
  smokes: boolean | null;
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
  partnerCountries: string | null;
  partnerRegions: string | null;
  partnerCities: string | null;
  about: string;
};

function inputCls() {
  return "h-11 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-[13px] font-semibold text-zinc-900 outline-none transition focus:border-zinc-300 focus:shadow-[0_0_0_4px_rgba(24,24,27,.06)]";
}

function chipCls(active: boolean) {
  return (
    "rounded-xl px-3 py-2 text-[11.5px] font-extrabold tracking-tight ring-1 transition " +
    (active ? "bg-zinc-950 text-white ring-zinc-950" : "bg-white text-zinc-800 ring-zinc-200 hover:bg-zinc-50")
  );
}

const SECTION_STYLES: Record<string, string> = {
  Asosiy: "bg-rose-100 text-rose-950",
  Manzil: "bg-fuchsia-100 text-fuchsia-950",
  Jismoniy: "bg-amber-100 text-amber-950",
  Shaxsiy: "bg-emerald-100 text-emerald-950",
  "Ta’lim": "bg-teal-100 text-teal-950",
  Diniy: "bg-violet-100 text-violet-950",
  Juft: "bg-sky-100 text-sky-950",
  Haqida: "bg-cyan-100 text-cyan-950",
};

const IconPencil = (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
    <path
      d="M12 20h9"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);

export default function ListingEditWorkspace({ initial }: { initial: ListingData }) {
  const router = useRouter();
  const [draft, setDraft] = useState<ListingData>(initial);
  const [editing, setEditing] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  useEffect(() => {
    setDraft(initial);
  }, [initial]);

  function toNum(v: string) {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }

  function cancelEdit() {
    setDraft(initial);
    setEditing(null);
    setErr(null);
  }

  function save(part: Partial<ListingData>) {
    setErr(null);
    setOk(null);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/listings/${initial.id}/update`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(part),
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) throw new Error(data?.error || "Saqlab bo‘lmadi");
        setEditing(null);
        setOk("Saqlandi.");
        router.refresh();
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Xatolik");
      }
    });
  }

  function EditableRow({
    section,
    label,
    rowKey,
    hint,
    childrenView,
    childrenEdit,
    onSave,
  }: {
    section: string;
    label: string;
    rowKey: string;
    hint?: string;
    childrenView: ReactNode;
    childrenEdit: ReactNode;
    onSave: () => void;
  }) {
    const on = editing === rowKey;
    const tone = SECTION_STYLES[section] || "bg-zinc-100 text-zinc-900";
    return (
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-[0_4px_18px_rgba(15,23,42,.04)]">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide ${tone}`}>
                {section}
              </span>
              <span className="text-[11px] font-extrabold text-zinc-500">{label}</span>
            </div>
            {hint ? <p className="mt-0.5 text-[10px] font-medium text-zinc-400">{hint}</p> : null}
            <div className="mt-2">{on ? childrenEdit : childrenView}</div>
          </div>
          <button
            type="button"
            onClick={() => (on ? cancelEdit() : setEditing(rowKey))}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-zinc-50 text-zinc-800 ring-1 ring-zinc-200/80 transition hover:bg-white"
            title={on ? "Bekor" : "Tahrirlash"}
            aria-label={on ? "Bekor" : "Tahrirlash"}
          >
            {IconPencil}
          </button>
        </div>
        {on ? (
          <div className="mt-4 flex flex-wrap gap-2 border-t border-zinc-100 pt-3">
            <button
              type="button"
              onClick={cancelEdit}
              className="inline-flex h-10 items-center justify-center rounded-2xl bg-white px-4 text-[12px] font-extrabold text-zinc-900 ring-1 ring-zinc-200 hover:bg-zinc-50"
            >
              Bekor
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={pending}
              className="inline-flex h-10 items-center justify-center rounded-2xl bg-zinc-950 px-4 text-[12px] font-extrabold text-white ring-1 ring-black/10 hover:bg-zinc-900 disabled:opacity-60"
            >
              Saqlash
            </button>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="grid max-h-[min(85vh,900px)] gap-3 overflow-y-auto pr-1 [-webkit-overflow-scrolling:touch]">
      <div className="rounded-2xl border border-indigo-200/70 bg-indigo-50/60 p-4 text-[12px] font-medium text-indigo-950 ring-1 ring-indigo-100">
        Barcha qatorlar ko‘rinadi. Yonidagi qalamcha orqali faqat shu maydonni tahrirlang va saqlang — bo‘lim nomi
        pastki yorliqda ko‘rsatilgan.
      </div>

      <EditableRow
        section="Asosiy"
        label="Ism"
        rowKey="name"
        childrenView={<div className="text-[15px] font-extrabold text-zinc-950">{draft.name}</div>}
        childrenEdit={
          <input className={inputCls()} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
        }
        onSave={() => save({ name: draft.name })}
      />

      <EditableRow
        section="Asosiy"
        label="Yosh"
        rowKey="age"
        childrenView={<div className="text-[15px] font-extrabold text-zinc-950">{draft.age}</div>}
        childrenEdit={
          <input
            className={inputCls()}
            type="number"
            min={18}
            max={80}
            value={draft.age}
            onChange={(e) => setDraft({ ...draft, age: Number(e.target.value) })}
          />
        }
        onSave={() => save({ age: draft.age })}
      />

      <EditableRow
        section="Manzil"
        label="Davlat"
        rowKey="country"
        childrenView={<div className="text-[14px] font-semibold text-zinc-900">{draft.country}</div>}
        childrenEdit={<input className={inputCls()} value={draft.country} onChange={(e) => setDraft({ ...draft, country: e.target.value })} />}
        onSave={() => save({ country: draft.country })}
      />

      <EditableRow
        section="Manzil"
        label="Viloyat"
        rowKey="region"
        childrenView={<div className="text-[14px] font-semibold text-zinc-900">{draft.region}</div>}
        childrenEdit={<input className={inputCls()} value={draft.region} onChange={(e) => setDraft({ ...draft, region: e.target.value })} />}
        onSave={() => save({ region: draft.region })}
      />

      <EditableRow
        section="Manzil"
        label="Shahar"
        rowKey="city"
        childrenView={<div className="text-[14px] font-semibold text-zinc-900">{draft.city}</div>}
        childrenEdit={<input className={inputCls()} value={draft.city} onChange={(e) => setDraft({ ...draft, city: e.target.value })} />}
        onSave={() => save({ city: draft.city })}
      />

      <EditableRow
        section="Manzil"
        label="Millat"
        rowKey="nationality"
        childrenView={<div className="text-[14px] font-semibold text-zinc-900">{draft.nationality}</div>}
        childrenEdit={
          <input className={inputCls()} value={draft.nationality} onChange={(e) => setDraft({ ...draft, nationality: e.target.value })} />
        }
        onSave={() => save({ nationality: draft.nationality })}
      />

      <EditableRow
        section="Jismoniy"
        label="Bo‘y (sm)"
        rowKey="heightCm"
        childrenView={<div className="text-[14px] font-semibold text-zinc-900">{draft.heightCm}</div>}
        childrenEdit={
          <input
            className={inputCls()}
            type="number"
            value={draft.heightCm}
            onChange={(e) => setDraft({ ...draft, heightCm: Number(e.target.value) })}
          />
        }
        onSave={() => save({ heightCm: draft.heightCm })}
      />

      <EditableRow
        section="Jismoniy"
        label="Vazn (kg)"
        rowKey="weightKg"
        childrenView={<div className="text-[14px] font-semibold text-zinc-900">{draft.weightKg}</div>}
        childrenEdit={
          <input
            className={inputCls()}
            type="number"
            value={draft.weightKg}
            onChange={(e) => setDraft({ ...draft, weightKg: Number(e.target.value) })}
          />
        }
        onSave={() => save({ weightKg: draft.weightKg })}
      />

      <EditableRow
        section="Jismoniy"
        label="Sigaret"
        rowKey="smokes"
        childrenView={
          <div className="text-[14px] font-semibold text-zinc-900">
            {draft.smokes === null ? "—" : draft.smokes ? "Chekadi" : "Chekmaydi"}
          </div>
        }
        childrenEdit={
          <select
            className={inputCls()}
            value={draft.smokes === null ? "" : draft.smokes ? "yes" : "no"}
            onChange={(e) =>
              setDraft({ ...draft, smokes: e.target.value === "" ? null : e.target.value === "yes" })
            }
          >
            <option value="">Bilinmaydi</option>
            <option value="no">Chekmaydi</option>
            <option value="yes">Chekadi</option>
          </select>
        }
        onSave={() => save({ smokes: draft.smokes })}
      />

      <EditableRow
        section="Jismoniy"
        label="Sport (haftada)"
        rowKey="sportPerWeek"
        childrenView={
          <div className="text-[14px] font-semibold text-zinc-900">{draft.sportPerWeek ?? "—"}</div>
        }
        childrenEdit={
          <input
            className={inputCls()}
            type="number"
            min={0}
            value={draft.sportPerWeek ?? ""}
            onChange={(e) => setDraft({ ...draft, sportPerWeek: e.target.value ? Number(e.target.value) : null })}
          />
        }
        onSave={() => save({ sportPerWeek: draft.sportPerWeek })}
      />

      <EditableRow
        section="Shaxsiy"
        label="Oilaviy holat"
        rowKey="maritalStatus"
        childrenView={<div className="text-[14px] font-semibold text-zinc-900">{draft.maritalStatus}</div>}
        childrenEdit={
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["boydoq", "Bo‘ydoq"],
                ["ajrashgan", "Ajrashgan"],
                ["beva", "Beva"],
              ] as const
            ).map(([v, lab]) => (
              <button key={v} type="button" className={chipCls(draft.maritalStatus === v)} onClick={() => setDraft({ ...draft, maritalStatus: v })}>
                {lab}
              </button>
            ))}
          </div>
        }
        onSave={() => save({ maritalStatus: draft.maritalStatus })}
      />

      <EditableRow
        section="Shaxsiy"
        label="Farzand"
        rowKey="children"
        childrenView={<div className="text-[14px] font-semibold text-zinc-900">{draft.children}</div>}
        childrenEdit={
          <div className="flex flex-wrap gap-2">
            <button type="button" className={chipCls(draft.children === "yoq")} onClick={() => setDraft({ ...draft, children: "yoq" })}>
              Yo‘q
            </button>
            <button type="button" className={chipCls(draft.children === "bor")} onClick={() => setDraft({ ...draft, children: "bor" })}>
              Bor
            </button>
          </div>
        }
        onSave={() => save({ children: draft.children })}
      />

      <EditableRow
        section="Shaxsiy"
        label="Ko‘pxotinlik (ayol e’lonlari)"
        rowKey="polygamy"
        hint="Faqat ma’lum e’lon turlarida"
        childrenView={<div className="text-[14px] font-semibold text-zinc-900">{draft.polygamyAllowance ?? "—"}</div>}
        childrenEdit={
          <input
            className={inputCls()}
            type="number"
            min={1}
            max={4}
            value={draft.polygamyAllowance ?? ""}
            onChange={(e) => setDraft({ ...draft, polygamyAllowance: toNum(e.target.value) })}
          />
        }
        onSave={() => save({ polygamyAllowance: draft.polygamyAllowance })}
      />

      <EditableRow
        section="Ta’lim"
        label="Ta’lim darajasi"
        rowKey="education"
        childrenView={<div className="text-[14px] font-semibold text-zinc-900">{draft.education}</div>}
        childrenEdit={
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["orta", "O‘rta"],
                ["orta_maxsus", "O‘rta maxsus"],
                ["oliy", "Oliy"],
                ["boshqa", "Boshqa"],
              ] as const
            ).map(([v, lab]) => (
              <button key={v} type="button" className={chipCls(draft.education === v)} onClick={() => setDraft({ ...draft, education: v })}>
                {lab}
              </button>
            ))}
          </div>
        }
        onSave={() => save({ education: draft.education })}
      />

      <EditableRow
        section="Ta’lim"
        label="Kasb"
        rowKey="jobTitle"
        childrenView={<div className="text-[14px] font-semibold text-zinc-900">{draft.jobTitle || "—"}</div>}
        childrenEdit={<input className={inputCls()} value={draft.jobTitle} onChange={(e) => setDraft({ ...draft, jobTitle: e.target.value })} />}
        onSave={() => save({ jobTitle: draft.jobTitle })}
      />

      <EditableRow
        section="Ta’lim"
        label="Daromad (USD)"
        rowKey="income"
        childrenView={<div className="text-[14px] font-semibold text-zinc-900">{draft.incomeMonthlyUsd ?? "—"}</div>}
        childrenEdit={
          <input
            className={inputCls()}
            type="number"
            value={draft.incomeMonthlyUsd ?? ""}
            onChange={(e) => setDraft({ ...draft, incomeMonthlyUsd: toNum(e.target.value) })}
          />
        }
        onSave={() => save({ incomeMonthlyUsd: draft.incomeMonthlyUsd })}
      />

      <EditableRow
        section="Diniy"
        label="Aqida"
        rowKey="aqeeda"
        childrenView={<div className="text-[14px] font-semibold text-zinc-900">{draft.aqeeda}</div>}
        childrenEdit={
          <select className={inputCls()} value={draft.aqeeda} onChange={(e) => setDraft({ ...draft, aqeeda: e.target.value })}>
            <option value="ahli_sunna">Ahli sunna val jamoa</option>
            <option value="moturidiy">Moturidiy</option>
            <option value="ashariy">Ash’ariy</option>
            <option value="boshqa">Boshqa</option>
          </select>
        }
        onSave={() => save({ aqeeda: draft.aqeeda })}
      />

      <EditableRow
        section="Diniy"
        label="Namoz"
        rowKey="prayer"
        childrenView={<div className="text-[14px] font-semibold text-zinc-900">{draft.prayer}</div>}
        childrenEdit={<input className={inputCls()} value={draft.prayer} onChange={(e) => setDraft({ ...draft, prayer: e.target.value })} />}
        onSave={() => save({ prayer: draft.prayer })}
      />

      <EditableRow
        section="Diniy"
        label="Qur’on"
        rowKey="quran"
        childrenView={<div className="text-[14px] font-semibold text-zinc-900">{draft.quran}</div>}
        childrenEdit={<input className={inputCls()} value={draft.quran} onChange={(e) => setDraft({ ...draft, quran: e.target.value })} />}
        onSave={() => save({ quran: draft.quran })}
      />

      <EditableRow
        section="Diniy"
        label="Mazhab"
        rowKey="madhab"
        childrenView={<div className="text-[14px] font-semibold text-zinc-900">{draft.madhab}</div>}
        childrenEdit={<input className={inputCls()} value={draft.madhab} onChange={(e) => setDraft({ ...draft, madhab: e.target.value })} />}
        onSave={() => save({ madhab: draft.madhab })}
      />

      <EditableRow
        section="Juft"
        label="Yosh (dan)"
        rowKey="pFrom"
        childrenView={<div className="text-[14px] font-semibold text-zinc-900">{draft.partnerAgeFrom ?? "—"}</div>}
        childrenEdit={
          <input
            className={inputCls()}
            type="number"
            value={draft.partnerAgeFrom ?? ""}
            onChange={(e) => setDraft({ ...draft, partnerAgeFrom: toNum(e.target.value) })}
          />
        }
        onSave={() => save({ partnerAgeFrom: draft.partnerAgeFrom })}
      />

      <EditableRow
        section="Juft"
        label="Yosh (gacha)"
        rowKey="pTo"
        childrenView={<div className="text-[14px] font-semibold text-zinc-900">{draft.partnerAgeTo ?? "—"}</div>}
        childrenEdit={
          <input
            className={inputCls()}
            type="number"
            value={draft.partnerAgeTo ?? ""}
            onChange={(e) => setDraft({ ...draft, partnerAgeTo: toNum(e.target.value) })}
          />
        }
        onSave={() => save({ partnerAgeTo: draft.partnerAgeTo })}
      />

      <EditableRow
        section="Juft"
        label="Davlatlar"
        rowKey="pC"
        childrenView={<div className="text-[14px] font-semibold text-zinc-900">{draft.partnerCountries || "—"}</div>}
        childrenEdit={
          <input
            className={inputCls()}
            value={draft.partnerCountries || ""}
            onChange={(e) => setDraft({ ...draft, partnerCountries: e.target.value })}
          />
        }
        onSave={() => save({ partnerCountries: draft.partnerCountries })}
      />

      <EditableRow
        section="Juft"
        label="Viloyatlar"
        rowKey="pR"
        childrenView={<div className="text-[14px] font-semibold text-zinc-900">{draft.partnerRegions || "—"}</div>}
        childrenEdit={
          <input
            className={inputCls()}
            value={draft.partnerRegions || ""}
            onChange={(e) => setDraft({ ...draft, partnerRegions: e.target.value })}
          />
        }
        onSave={() => save({ partnerRegions: draft.partnerRegions })}
      />

      <EditableRow
        section="Juft"
        label="Shaharlar"
        rowKey="pCi"
        childrenView={<div className="text-[14px] font-semibold text-zinc-900">{draft.partnerCities || "—"}</div>}
        childrenEdit={
          <input className={inputCls()} value={draft.partnerCities || ""} onChange={(e) => setDraft({ ...draft, partnerCities: e.target.value })} />
        }
        onSave={() => save({ partnerCities: draft.partnerCities })}
      />

      <EditableRow
        section="Haqida"
        label="Matn"
        rowKey="about"
        childrenView={<div className="whitespace-pre-wrap text-[14px] font-medium leading-relaxed text-zinc-800">{draft.about || "—"}</div>}
        childrenEdit={
          <textarea
            className="min-h-[120px] w-full resize-none rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-[13px] font-medium text-zinc-900 outline-none transition focus:border-zinc-300 focus:shadow-[0_0_0_4px_rgba(24,24,27,.06)]"
            value={draft.about || ""}
            onChange={(e) => setDraft({ ...draft, about: e.target.value })}
          />
        }
        onSave={() => save({ about: draft.about })}
      />

      <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
        <Link
          href="/profile#elonlarim"
          className="inline-flex h-10 items-center justify-center rounded-2xl bg-white px-4 text-[12px] font-extrabold text-zinc-900 ring-1 ring-zinc-200 hover:bg-zinc-50"
        >
          ← E’lonlarim
        </Link>
        {pending && !err ? <div className="text-[12px] font-extrabold text-zinc-500">Saqlanmoqda…</div> : null}
        {ok ? <div className="text-[12px] font-extrabold text-emerald-700">{ok}</div> : null}
      </div>
      {err ? <div className="rounded-2xl bg-rose-50 p-3 text-[12px] font-semibold text-rose-900 ring-1 ring-rose-200">{err}</div> : null}
    </div>
  );
}
