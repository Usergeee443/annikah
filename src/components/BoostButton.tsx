"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function BoostButton({
  listingId,
  days,
  label,
  priceUzs,
  disabled: disabledProp,
}: {
  listingId: string;
  days: number;
  label: string;
  priceUzs: number;
  /** Masalan, boost hali faol bo‘lsa */
  disabled?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function go() {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/listings/${listingId}/boost`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ days }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          setError(data?.error || "Xatolik");
          return;
        }
        setDone(true);
        router.refresh();
      } catch {
        setError("Tarmoq xatosi");
      }
    });
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[12px] font-extrabold tracking-tight text-zinc-950">{label}</div>
          <div className="mt-0.5 text-[11px] font-bold text-zinc-600">
            {days} kun · {priceUzs.toLocaleString()} so‘m (demo)
          </div>
        </div>
        <button
          type="button"
          onClick={go}
          disabled={pending || done || disabledProp}
          className="inline-flex h-9 items-center justify-center rounded-2xl bg-amber-500 px-3 text-[12px] font-extrabold text-white ring-1 ring-amber-600 hover:bg-amber-400 disabled:opacity-60"
        >
          {disabledProp
            ? "Mavjud emas"
            : done
              ? "Faollashtirildi"
              : pending
                ? "Jarayonda…"
                : "Boost"}
        </button>
      </div>
      {error ? <div className="mt-2 text-[11px] font-extrabold text-rose-700">{error}</div> : null}
    </div>
  );
}
