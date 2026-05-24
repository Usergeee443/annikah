"use client";

import { COUNTRIES } from "@/lib/countries";
import { CHIP, type ListingFormState } from "./constants";
import type { QuestionDef } from "./questions";

function inputCls() {
  return "h-11 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-[14px] font-semibold text-zinc-950 outline-none transition focus:border-zinc-300 focus:shadow-[0_0_0_4px_rgba(24,24,27,.06)]";
}

function chipCls(active: boolean) {
  return (
    "flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3.5 text-left text-[14px] font-semibold ring-1 transition active:scale-[0.99] " +
    (active
      ? "bg-zinc-950 text-white ring-zinc-950"
      : "bg-white text-zinc-900 ring-zinc-200 hover:bg-zinc-50")
  );
}

function Chips({
  value,
  options,
  onPick,
}: {
  value: string;
  options: readonly (readonly [string, string])[];
  onPick: (v: string) => void;
}) {
  return (
    <div className="grid gap-2.5">
      {options.map(([v, label]) => (
        <button key={v} type="button" className={chipCls(value === v)} onClick={() => onPick(v)}>
          {label}
        </button>
      ))}
    </div>
  );
}

export default function QuestionScreen({
  q,
  d,
  setD,
  onChipPick,
}: {
  q: QuestionDef;
  d: ListingFormState;
  setD: React.Dispatch<React.SetStateAction<ListingFormState>>;
  onChipPick?: (field: string, value: string) => void;
}) {
  const pick = (field: keyof ListingFormState, value: string) => {
    setD((p) => ({ ...p, [field]: value }));
    onChipPick?.(field, value);
  };

  switch (q.id) {
    case "category":
      return (
        <div className="grid gap-3">
          <button
            type="button"
            className={chipCls(d.listingCategory === "kelinlar")}
            onClick={() => {
              setD((p) => ({
                ...p,
                listingCategory: "kelinlar",
                polygamyAllowance: p.polygamyAllowance ?? null,
              }));
              onChipPick?.("listingCategory", "kelinlar");
            }}
          >
            Kelin (ayol) e&apos;loni
          </button>
          <button
            type="button"
            className={chipCls(d.listingCategory === "kuyovlar")}
            onClick={() => {
              setD((p) => ({ ...p, listingCategory: "kuyovlar", polygamyAllowance: null }));
              onChipPick?.("listingCategory", "kuyovlar");
            }}
          >
            Kuyov (erkak) e&apos;loni
          </button>
        </div>
      );

    case "name":
      return (
        <input
          className={inputCls()}
          value={d.name}
          autoFocus
          placeholder="Ismingiz"
          onChange={(e) => setD({ ...d, name: e.target.value })}
        />
      );

    case "age":
      return (
        <input
          className={inputCls()}
          type="number"
          min={18}
          max={80}
          value={d.age || ""}
          autoFocus
          onChange={(e) => setD({ ...d, age: Number(e.target.value) })}
        />
      );

    case "country":
      return (
        <select
          className={inputCls() + " text-left"}
          value={d.country}
          onChange={(e) => setD({ ...d, country: e.target.value })}
        >
          <option value="">Tanlang...</option>
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.name}>
              {c.flag} {c.name}
            </option>
          ))}
        </select>
      );

    case "region":
      return (
        <input
          className={inputCls()}
          value={d.region}
          autoFocus
          placeholder="Viloyat"
          onChange={(e) => setD({ ...d, region: e.target.value })}
        />
      );

    case "city":
      return (
        <input
          className={inputCls()}
          value={d.city}
          autoFocus
          placeholder="Shahar yoki tuman"
          onChange={(e) => setD({ ...d, city: e.target.value })}
        />
      );

    case "nationality":
      return (
        <input
          className={inputCls()}
          value={d.nationality}
          autoFocus
          placeholder="Millat"
          onChange={(e) => setD({ ...d, nationality: e.target.value })}
        />
      );

    case "heightCm":
      return (
        <input
          className={inputCls()}
          type="number"
          value={d.heightCm || ""}
          autoFocus
          placeholder="sm"
          onChange={(e) => setD({ ...d, heightCm: Number(e.target.value) })}
        />
      );

    case "weightKg":
      return (
        <input
          className={inputCls()}
          type="number"
          value={d.weightKg || ""}
          autoFocus
          placeholder="kg"
          onChange={(e) => setD({ ...d, weightKg: Number(e.target.value) })}
        />
      );

    case "jobTitle":
      return (
        <input
          className={inputCls()}
          value={d.jobTitle}
          autoFocus
          placeholder="Kasb"
          onChange={(e) => setD({ ...d, jobTitle: e.target.value })}
        />
      );

    case "smokes":
      return (
        <Chips
          value={d.smokes}
          options={[
            ["no", "Chekmayman"],
            ["yes", "Chekaman"],
          ]}
          onPick={(v) => pick("smokes", v as "yes" | "no")}
        />
      );

    case "sportPerWeek":
      return (
        <input
          className={inputCls()}
          type="number"
          min={0}
          value={d.sportPerWeek ?? ""}
          autoFocus
          placeholder="Haftasiga necha marta?"
          onChange={(e) =>
            setD({ ...d, sportPerWeek: e.target.value === "" ? null : Number(e.target.value) })
          }
        />
      );

    case "maritalStatus":
      return <Chips value={d.maritalStatus} options={CHIP.marital} onPick={(v) => pick("maritalStatus", v)} />;

    case "children":
      return (
        <Chips
          value={d.children}
          options={[
            ["yoq", "Yo'q"],
            ["bor", "Bor"],
          ]}
          onPick={(v) => pick("children", v)}
        />
      );

    case "polygamyAllowance":
      return (
        <div className="grid gap-2.5">
          {(
            [
              [1, "Faqat 1"],
              [2, "2 gacha"],
              [3, "3 gacha"],
              [4, "4 gacha"],
            ] as const
          ).map(([n, label]) => (
            <button
              key={n}
              type="button"
              className={chipCls(d.polygamyAllowance === n)}
              onClick={() => {
                setD({ ...d, polygamyAllowance: n });
                onChipPick?.("polygamyAllowance", String(n));
              }}
            >
              {label}
            </button>
          ))}
        </div>
      );

    case "education":
      return <Chips value={d.education} options={CHIP.education} onPick={(v) => pick("education", v)} />;

    case "incomeMonthlyUsd":
      return (
        <input
          className={inputCls()}
          type="number"
          min={0}
          value={d.incomeMonthlyUsd ?? ""}
          autoFocus
          placeholder="USD (ixtiyoriy)"
          onChange={(e) =>
            setD({ ...d, incomeMonthlyUsd: e.target.value === "" ? null : Number(e.target.value) })
          }
        />
      );

    case "aqeeda":
      return <Chips value={d.aqeeda} options={CHIP.aqeeda} onPick={(v) => pick("aqeeda", v)} />;
    case "prayer":
      return <Chips value={d.prayer} options={CHIP.prayer} onPick={(v) => pick("prayer", v)} />;
    case "quran":
      return <Chips value={d.quran} options={CHIP.quran} onPick={(v) => pick("quran", v)} />;
    case "madhab":
      return <Chips value={d.madhab} options={CHIP.madhab} onPick={(v) => pick("madhab", v)} />;

    case "about":
      return (
        <textarea
          className="min-h-[110px] w-full resize-none rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-[14px] font-medium leading-relaxed text-zinc-900 outline-none focus:border-indigo-400 focus:shadow-[0_0_0_3px_rgba(99,102,241,.1)]"
          value={d.about}
          autoFocus
          placeholder="O'zingiz haqingizda yozing..."
          onChange={(e) => setD({ ...d, about: e.target.value })}
        />
      );

    case "partnerAge":
      return (
        <div className="grid grid-cols-2 gap-3">
          <input
            className={inputCls()}
            type="number"
            placeholder="Dan"
            value={d.partnerAgeFrom ?? ""}
            onChange={(e) =>
              setD({ ...d, partnerAgeFrom: e.target.value === "" ? null : Number(e.target.value) })
            }
          />
          <input
            className={inputCls()}
            type="number"
            placeholder="Gacha"
            value={d.partnerAgeTo ?? ""}
            onChange={(e) =>
              setD({ ...d, partnerAgeTo: e.target.value === "" ? null : Number(e.target.value) })
            }
          />
        </div>
      );

    case "partnerLocation":
      return (
        <textarea
          className="min-h-[100px] w-full resize-none rounded-2xl border-2 border-zinc-200 bg-white px-4 py-3 text-[14px] font-medium text-zinc-900 outline-none focus:border-indigo-400"
          value={[d.partnerCountries, d.partnerRegions, d.partnerCities].filter(Boolean).join(", ")}
          placeholder="Masalan: O'zbekiston, Toshkent"
          onChange={(e) => {
            const parts = e.target.value.split(",").map((s) => s.trim());
            setD({
              ...d,
              partnerCountries: parts[0] || "",
              partnerRegions: parts[1] || "",
              partnerCities: parts.slice(2).join(", ") || "",
            });
          }}
        />
      );

    default:
      return null;
  }
}
