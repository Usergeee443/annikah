"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import EditFieldDrawer from "@/components/listing-edit/EditFieldDrawer";
import {
  ChipsPicker,
  CountryPicker,
  IncomePicker,
  NumberPicker,
  OptionsPicker,
  POLYGAMY_OPTIONS,
  RangeAgePicker,
  SportPicker,
  TextAreaInput,
  TextInput,
  TriStatePicker,
} from "@/components/listing-edit/EditPickers";
import {
  applyPartnerLocationText,
  FIELD_BY_KEY,
  LISTING_EDIT_FIELDS,
  partnerLocationText,
  SECTION_FILTERS,
  SECTION_STYLES,
  type ListingData,
  type SectionFilter,
} from "@/components/listing-edit/fieldConfig";

const IconPencil = (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
    <path d="M12 20h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path
      d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);

function FieldEditor({
  fieldKey,
  draft,
  setDraft,
}: {
  fieldKey: string;
  draft: ListingData;
  setDraft: React.Dispatch<React.SetStateAction<ListingData>>;
}) {
  const def = FIELD_BY_KEY[fieldKey];
  if (!def) return null;

  switch (def.kind) {
    case "text":
      return (
        <TextInput
          value={String(draft[def.key as keyof ListingData] ?? "")}
          onChange={(v) => setDraft({ ...draft, [def.key]: v })}
          placeholder={def.label}
        />
      );
    case "textarea":
      return (
        <TextAreaInput
          value={draft.about || ""}
          onChange={(v) => setDraft({ ...draft, about: v })}
          placeholder="O‘zingiz haqingizda yozing…"
        />
      );
    case "country":
      return <CountryPicker value={draft.country} onChange={(v) => setDraft({ ...draft, country: v })} />;
    case "chips":
      return (
        <ChipsPicker
          value={String(draft[def.key as keyof ListingData] ?? "")}
          options={def.chipOptions ?? []}
          onChange={(v) => setDraft({ ...draft, [def.key]: v })}
        />
      );
    case "number": {
      const num = def.number!;
      const field = def.key as keyof ListingData;
      const val = Number(draft[field]) || num.min;
      return (
        <NumberPicker
          value={val}
          min={num.min}
          max={num.max}
          step={num.step}
          unit={num.unit}
          onChange={(n) => setDraft({ ...draft, [field]: n })}
        />
      );
    }
    case "income":
      return (
        <IncomePicker value={draft.incomeMonthlyUsd} onChange={(v) => setDraft({ ...draft, incomeMonthlyUsd: v })} />
      );
    case "sport":
      return (
        <SportPicker value={draft.sportPerWeek} onChange={(v) => setDraft({ ...draft, sportPerWeek: v })} />
      );
    case "tristate":
      return <TriStatePicker value={draft.smokes} onChange={(v) => setDraft({ ...draft, smokes: v })} />;
    case "polygamy":
      return (
        <OptionsPicker
          value={draft.polygamyAllowance}
          options={[...POLYGAMY_OPTIONS]}
          onChange={(v) => setDraft({ ...draft, polygamyAllowance: v })}
        />
      );
    case "rangeAge":
      return (
        <RangeAgePicker
          from={draft.partnerAgeFrom}
          to={draft.partnerAgeTo}
          onChangeFrom={(n) => setDraft({ ...draft, partnerAgeFrom: n })}
          onChangeTo={(n) => setDraft({ ...draft, partnerAgeTo: n })}
        />
      );
    case "partnerLocation":
      return (
        <TextAreaInput
          value={partnerLocationText(draft)}
          onChange={(v) => setDraft(applyPartnerLocationText(draft, v))}
          placeholder="Masalan: O‘zbekiston, Toshkent viloyati, Chirchiq"
          minHeight={120}
        />
      );
    default:
      return null;
  }
}

export default function ListingEditWorkspace({
  initial,
  embedded,
  onSaved,
}: {
  initial: ListingData;
  embedded?: boolean;
  onSaved?: (patch: Partial<ListingData>) => void;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState<ListingData>(initial);
  const [draft, setDraft] = useState<ListingData>(initial);
  const [activeField, setActiveField] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<ListingData | null>(null);
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [panelSaved, setPanelSaved] = useState(false);
  const [sectionFilter, setSectionFilter] = useState<SectionFilter>("Barchasi");

  const activeDef = activeField ? FIELD_BY_KEY[activeField] : null;
  const panelPreview = activeDef ? activeDef.getDisplay(draft) : "";

  const visibleFields = useMemo(
    () =>
      LISTING_EDIT_FIELDS.filter((f) => sectionFilter === "Barchasi" || sectionFilter === f.section),
    [sectionFilter],
  );

  useEffect(() => {
    setSaved(initial);
    setDraft(initial);
  }, [initial.id]);

  function openField(key: string) {
    setSnapshot({ ...draft });
    setActiveField(key);
    setErr(null);
  }

  function closePanel() {
    if (snapshot) setDraft(snapshot);
    setSnapshot(null);
    setActiveField(null);
  }

  function save(part: Partial<ListingData>, onDone?: () => void) {
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
        const next = { ...draft, ...part };
        setSaved(next);
        setDraft(next);
        setOk("Saqlandi.");
        onDone?.();
        if (embedded) onSaved?.(part);
        else router.refresh();
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Xatolik");
      }
    });
  }

  function savePanel() {
    if (!activeDef) return;
    const patch = activeDef.getPatch(draft);
    save(patch, () => {
      setSnapshot(null);
      setPanelSaved(true);
      window.setTimeout(() => {
        setActiveField(null);
        setPanelSaved(false);
      }, 1100);
    });
  }

  function fieldDirty(f: (typeof LISTING_EDIT_FIELDS)[number]) {
    return f.getDisplay(draft) !== f.getDisplay(saved);
  }

  const sectionChipCls = (active: boolean, tone: string) =>
    "rounded-xl px-3 py-2 text-[11px] font-semibold tracking-normal ring-1 transition " +
    (active ? tone + " ring-transparent" : "bg-white text-zinc-700 ring-zinc-200 hover:bg-zinc-50");

  const filterBar = (
    <div className="sticky top-0 z-10 -mx-1 mb-1 border-b border-zinc-100 bg-white/95 pb-3 pt-1 backdrop-blur-sm">
      <div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Bo‘limni tanlang</div>
      <div className="flex flex-wrap gap-2">
        {SECTION_FILTERS.map((s) => {
          const tones: Record<string, string> = {
            Barchasi: "bg-zinc-900 text-white",
            Asosiy: "bg-rose-600 text-white",
            Manzil: "bg-fuchsia-600 text-white",
            Jismoniy: "bg-amber-600 text-white",
            Shaxsiy: "bg-emerald-600 text-white",
            "Ta’lim": "bg-teal-600 text-white",
            Diniy: "bg-violet-600 text-white",
            Juft: "bg-sky-600 text-white",
            Haqida: "bg-cyan-600 text-white",
          };
          return (
            <button
              key={s}
              type="button"
              onClick={() => setSectionFilter(s)}
              className={sectionChipCls(sectionFilter === s, tones[s] ?? "bg-zinc-900 text-white")}
            >
              {s === "Ta’lim" ? "Ta'lim" : s}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className={"grid gap-3 " + (embedded ? "" : "max-h-[min(85vh,900px)] overflow-y-auto pr-1 [-webkit-overflow-scrolling:touch]")}>
      {filterBar}

      <div className="grid gap-3">
        {visibleFields.map((f) => {
          const tone = SECTION_STYLES[f.section] || "bg-zinc-100 text-zinc-900";
          const dirty = fieldDirty(f);
          const editing = activeField === f.key;
          return (
            <div
              key={f.key}
              className={
                "rounded-2xl border bg-white p-4 shadow-[0_4px_18px_rgba(15,23,42,.04)] transition " +
                (editing
                  ? "border-zinc-950 ring-2 ring-zinc-950/10"
                  : dirty
                    ? "border-amber-300/80 ring-1 ring-amber-200/80"
                    : "border-zinc-200/80")
              }
            >
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${tone}`}>
                      {f.section}
                    </span>
                    <span className="text-[11px] font-semibold text-zinc-500">{f.label}</span>
                  </div>
                  {f.hint ? <p className="mt-0.5 text-[10px] font-medium text-zinc-400">{f.hint}</p> : null}
                  <div
                    className={
                      "mt-2 text-[14px] font-semibold transition " +
                      (dirty ? "text-zinc-950" : "text-zinc-900")
                    }
                  >
                    {f.getDisplay(draft)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => openField(f.key)}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-zinc-50 text-zinc-800 ring-1 ring-zinc-200/80 transition hover:bg-white"
                  title="Tahrirlash"
                  aria-label={`${f.label}ni tahrirlash`}
                >
                  {IconPencil}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
        {embedded ? (
          <Link
            href={`/listings/${initial.id}/edit`}
            className="inline-flex h-10 items-center justify-center rounded-2xl bg-zinc-100 px-4 text-[12px] font-semibold text-zinc-800 ring-1 ring-zinc-200 hover:bg-white"
          >
            To‘liq tahrirlash sahifasi →
          </Link>
        ) : (
          <Link
            href="/profile#elonlarim"
            className="inline-flex h-10 items-center justify-center rounded-2xl bg-white px-4 text-[12px] font-semibold text-zinc-900 ring-1 ring-zinc-200 hover:bg-zinc-50"
          >
            ← E’lonlarim
          </Link>
        )}
        {pending && !activeField ? <div className="text-[12px] font-semibold text-zinc-500">Saqlanmoqda…</div> : null}
        {ok ? <div className="text-[12px] font-semibold text-emerald-700">{ok}</div> : null}
      </div>
      {err ? <div className="rounded-2xl bg-rose-50 p-3 text-[12px] font-semibold text-rose-900 ring-1 ring-rose-200">{err}</div> : null}

      <EditFieldDrawer
        open={Boolean(activeDef)}
        title={activeDef?.panelTitle ?? ""}
        subtitle={activeDef?.panelSubtitle}
        preview={panelPreview}
        saved={panelSaved}
        onClose={closePanel}
        onSave={savePanel}
        pending={pending}
      >
        {activeField ? <FieldEditor fieldKey={activeField} draft={draft} setDraft={setDraft} /> : null}
      </EditFieldDrawer>
    </div>
  );
}

export type { ListingData };
