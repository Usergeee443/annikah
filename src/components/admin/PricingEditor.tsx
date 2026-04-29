"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { PricingConfig } from "@/lib/pricing";

const inputCls =
  "h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-[13px] font-semibold text-zinc-900 outline-none transition focus:border-zinc-300 focus:shadow-[0_0_0_4px_rgba(24,24,27,.06)]";

export default function PricingEditor({ initial }: { initial: PricingConfig }) {
  const router = useRouter();
  const [cfg, setCfg] = useState<PricingConfig>(initial);
  const [pending, startTransition] = useTransition();
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  function updatePlan(idx: number, field: "title" | "badge", value: string) {
    setCfg((c) => {
      const next = { ...c, listingPlans: c.listingPlans.map((p) => ({ ...p })) };
      (next.listingPlans[idx] as Record<string, unknown>)[field] = value;
      return next;
    });
  }
  function updatePlanNum(idx: number, field: "days" | "priceUzs", value: number) {
    setCfg((c) => {
      const next = { ...c, listingPlans: c.listingPlans.map((p) => ({ ...p })) };
      (next.listingPlans[idx] as Record<string, unknown>)[field] = Math.max(0, Math.floor(value || 0));
      return next;
    });
  }
  function updateBoost(idx: number, field: "label", value: string) {
    setCfg((c) => {
      const next = { ...c, boosts: c.boosts.map((b) => ({ ...b })) };
      (next.boosts[idx] as Record<string, unknown>)[field] = value;
      return next;
    });
  }
  function updateBoostNum(idx: number, field: "days" | "priceUzs", value: number) {
    setCfg((c) => {
      const next = { ...c, boosts: c.boosts.map((b) => ({ ...b })) };
      (next.boosts[idx] as Record<string, unknown>)[field] = Math.max(0, Math.floor(value || 0));
      return next;
    });
  }

  function save() {
    setOk(null);
    setErr(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/pricing", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(cfg),
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) throw new Error(data?.error || "Saqlab bo‘lmadi");
        setOk("Saqlandi.");
        router.refresh();
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Saqlab bo‘lmadi");
      }
    });
  }

  return (
    <div className="grid gap-4">
      <section className="rounded-3xl border border-zinc-200/70 bg-white p-5 ring-1 ring-zinc-200/70">
        <div className="text-[11px] font-extrabold tracking-widest text-zinc-500">TARIF PAKETLARI</div>
        <h2 className="mt-1 text-[18px] font-black tracking-tight text-zinc-950">E’lon joylash narxlari</h2>

        <div className="mt-4 grid gap-3">
          {cfg.listingPlans.map((p, idx) => (
            <div
              key={p.id}
              className="grid gap-3 rounded-2xl border border-zinc-200 bg-white p-4 sm:grid-cols-[110px_1fr_120px_140px_150px]"
            >
              <div className="grid">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">ID</span>
                <span className="mt-1 inline-flex h-11 items-center rounded-2xl bg-zinc-100 px-3 text-[12.5px] font-extrabold text-zinc-900">
                  {p.id}
                </span>
              </div>
              <label className="grid">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">Sarlavha</span>
                <input
                  className={inputCls + " mt-1"}
                  value={p.title}
                  onChange={(e) => updatePlan(idx, "title", e.target.value)}
                />
              </label>
              <label className="grid">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">Kunlar</span>
                <input
                  type="number"
                  inputMode="numeric"
                  className={inputCls + " mt-1"}
                  value={p.days}
                  onChange={(e) => updatePlanNum(idx, "days", Number(e.target.value))}
                />
              </label>
              <label className="grid">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">Narx (so‘m)</span>
                <input
                  type="number"
                  inputMode="numeric"
                  className={inputCls + " mt-1"}
                  value={p.priceUzs}
                  onChange={(e) => updatePlanNum(idx, "priceUzs", Number(e.target.value))}
                />
              </label>
              <label className="grid">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">Belgi (badge)</span>
                <input
                  className={inputCls + " mt-1"}
                  placeholder="Mashhur"
                  value={p.badge || ""}
                  onChange={(e) => updatePlan(idx, "badge", e.target.value)}
                />
              </label>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-zinc-200/70 bg-white p-5 ring-1 ring-zinc-200/70">
        <div className="text-[11px] font-extrabold tracking-widest text-zinc-500">REKLAMA (BOOST)</div>
        <h2 className="mt-1 text-[18px] font-black tracking-tight text-zinc-950">Boost paketlari</h2>

        <div className="mt-4 grid gap-3">
          {cfg.boosts.map((b, idx) => (
            <div
              key={b.id}
              className="grid gap-3 rounded-2xl border border-zinc-200 bg-white p-4 sm:grid-cols-[110px_1fr_120px_140px]"
            >
              <div className="grid">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">ID</span>
                <span className="mt-1 inline-flex h-11 items-center rounded-2xl bg-zinc-100 px-3 text-[12.5px] font-extrabold text-zinc-900">
                  {b.id}
                </span>
              </div>
              <label className="grid">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">Nomi</span>
                <input
                  className={inputCls + " mt-1"}
                  value={b.label}
                  onChange={(e) => updateBoost(idx, "label", e.target.value)}
                />
              </label>
              <label className="grid">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">Kunlar</span>
                <input
                  type="number"
                  inputMode="numeric"
                  className={inputCls + " mt-1"}
                  value={b.days}
                  onChange={(e) => updateBoostNum(idx, "days", Number(e.target.value))}
                />
              </label>
              <label className="grid">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">Narx (so‘m)</span>
                <input
                  type="number"
                  inputMode="numeric"
                  className={inputCls + " mt-1"}
                  value={b.priceUzs}
                  onChange={(e) => updateBoostNum(idx, "priceUzs", Number(e.target.value))}
                />
              </label>
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-end gap-3">
        {ok ? <span className="text-[12px] font-extrabold text-emerald-700">{ok}</span> : null}
        {err ? <span className="text-[12px] font-extrabold text-rose-700">{err}</span> : null}
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="inline-flex h-11 items-center justify-center rounded-2xl bg-zinc-950 px-6 text-[12px] font-extrabold text-white ring-1 ring-black/10 transition hover:bg-zinc-900 disabled:opacity-60"
        >
          {pending ? "Saqlanmoqda…" : "Saqlash"}
        </button>
      </div>
    </div>
  );
}
