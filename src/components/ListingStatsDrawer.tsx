"use client";

import { useMemo, useState, useTransition } from "react";

type SeriesPoint = { date: string; count: number };
type Stats = {
  viewsUnique: number;
  favorites: number;
  views14d: SeriesPoint[];
  favorites14d: SeriesPoint[];
};

function fmtDate(d: string) {
  // d: YYYY-MM-DD
  const [y, m, day] = d.split("-").map((x) => Number(x));
  if (!y || !m || !day) return d;
  return `${String(day).padStart(2, "0")}.${String(m).padStart(2, "0")}`;
}

function MiniBars({ points }: { points: SeriesPoint[] }) {
  const max = useMemo(() => Math.max(1, ...points.map((p) => p.count)), [points]);
  return (
    <div className="grid grid-cols-14 items-end gap-1">
      {points.slice(-14).map((p) => (
        <div key={p.date} className="flex flex-col items-center gap-1">
          <div
            className="w-full rounded-full bg-zinc-900/20"
            style={{ height: `${Math.max(6, Math.round((p.count / max) * 42))}px` }}
            title={`${fmtDate(p.date)} · ${p.count}`}
          />
          <div className="text-[9px] font-bold text-zinc-400">{fmtDate(p.date)}</div>
        </div>
      ))}
    </div>
  );
}

export default function ListingStatsDrawer({ listingId }: { listingId: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [stats, setStats] = useState<Stats | null>(null);
  const [err, setErr] = useState<string | null>(null);

  function load() {
    startTransition(async () => {
      try {
        setErr(null);
        const res = await fetch(`/api/listings/${listingId}/stats`, { cache: "no-store" });
        if (!res.ok) throw new Error(await res.text());
        const json = (await res.json()) as Stats;
        setStats(json);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Xatolik";
        setErr(msg);
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          if (!stats && !pending) load();
        }}
        className="inline-flex h-11 items-center justify-center rounded-2xl bg-white px-4 text-[12px] font-extrabold text-zinc-900 ring-1 ring-zinc-200 hover:bg-zinc-50"
      >
        Statistika
      </button>

      <div
        className={
          "fixed inset-0 z-50 transition " +
          (open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0")
        }
      >
        <button
          type="button"
          aria-label="Yopish"
          onClick={() => setOpen(false)}
          className={
            "absolute inset-0 bg-black/35 backdrop-blur-[2px] transition " +
            (open ? "opacity-100" : "opacity-0")
          }
        />

        <aside
          className={
            "absolute right-0 top-0 h-full w-[92vw] max-w-[420px] border-l border-zinc-200/70 bg-white/92 p-4 shadow-[0_20px_70px_rgba(15,23,42,.35)] backdrop-blur-xl transition sm:p-5 " +
            (open ? "translate-x-0" : "translate-x-full")
          }
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[11px] font-extrabold tracking-widest text-zinc-500">E’LON</div>
              <div className="mt-1 text-[18px] font-black tracking-tight text-zinc-950">
                Statistika
              </div>
              <div className="mt-0.5 text-[12px] font-medium text-zinc-600">
                Ko‘rilish va saqlashlar (unique user bo‘yicha).
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-9 items-center justify-center rounded-2xl bg-white px-3 text-[12px] font-extrabold text-zinc-900 ring-1 ring-zinc-200 hover:bg-zinc-50"
            >
              Yopish
            </button>
          </div>

          <div className="mt-4 grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-3xl bg-zinc-50 p-4 ring-1 ring-zinc-200">
                <div className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-zinc-500">
                  Unique ko‘rildi
                </div>
                <div className="mt-1 text-[24px] font-black tracking-tight text-zinc-950">
                  {stats ? stats.viewsUnique : pending ? "…" : "—"}
                </div>
              </div>
              <div className="rounded-3xl bg-zinc-50 p-4 ring-1 ring-zinc-200">
                <div className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-zinc-500">
                  Sevimlilar
                </div>
                <div className="mt-1 text-[24px] font-black tracking-tight text-zinc-950">
                  {stats ? stats.favorites : pending ? "…" : "—"}
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-4 ring-1 ring-zinc-200">
              <div className="flex items-center justify-between gap-2">
                <div className="text-[12px] font-extrabold tracking-tight text-zinc-950">
                  Oxirgi 14 kun · ko‘rilish
                </div>
                <button
                  type="button"
                  onClick={load}
                  className="inline-flex h-8 items-center justify-center rounded-2xl bg-white px-3 text-[11px] font-extrabold text-zinc-900 ring-1 ring-zinc-200 hover:bg-zinc-50"
                >
                  Yangilash
                </button>
              </div>
              <div className="mt-3">
                {err ? (
                  <div className="rounded-2xl bg-rose-50 p-3 text-[12px] font-semibold text-rose-900 ring-1 ring-rose-200">
                    {err}
                  </div>
                ) : stats ? (
                  <MiniBars points={stats.views14d} />
                ) : (
                  <div className="text-[12px] font-medium text-zinc-500">
                    {pending ? "Yuklanmoqda..." : "Ma’lumot yo‘q"}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-3xl bg-white p-4 ring-1 ring-zinc-200">
              <div className="text-[12px] font-extrabold tracking-tight text-zinc-950">
                Oxirgi 14 kun · sevimlilar
              </div>
              <div className="mt-3">
                {stats ? (
                  <MiniBars points={stats.favorites14d} />
                ) : (
                  <div className="text-[12px] font-medium text-zinc-500">
                    {pending ? "Yuklanmoqda..." : "Ma’lumot yo‘q"}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-3xl bg-zinc-50 p-4 text-[12px] font-medium text-zinc-600 ring-1 ring-zinc-200">
              Eslatma: ko‘rilishlar faqat login bo‘lgan foydalanuvchi e’lonni ochganda unique hisoblanadi.
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}

