"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type Action = "accept" | "reject" | "cancel";

export default function RequestActions({
  requestId,
  kind,
  initialStatus,
}: {
  requestId: string;
  kind: "received" | "sent";
  initialStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function call(action: Action) {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/requests/${requestId}`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ action }),
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          setError(data?.error || "Xatolik");
          return;
        }
        setStatus(data?.status || status);
        if (data?.chatId) {
          router.push(`/chats/${data.chatId}`);
          return;
        }
        router.refresh();
      } catch {
        setError("Tarmoq xatosi");
      }
    });
  }

  if (status === "accepted") {
    return (
      <span className="inline-flex h-9 items-center rounded-2xl bg-emerald-50 px-3 text-[12px] font-extrabold text-emerald-800 ring-1 ring-emerald-200">
        Qabul qilingan
      </span>
    );
  }
  if (status === "rejected") {
    return (
      <span className="inline-flex h-9 items-center rounded-2xl bg-rose-50 px-3 text-[12px] font-extrabold text-rose-800 ring-1 ring-rose-200">
        Rad etilgan
      </span>
    );
  }
  if (status === "cancelled") {
    return (
      <span className="inline-flex h-9 items-center rounded-2xl bg-zinc-100 px-3 text-[12px] font-extrabold text-zinc-700 ring-1 ring-zinc-200">
        Bekor qilingan
      </span>
    );
  }

  if (kind === "sent") {
    return (
      <div className="grid justify-items-end gap-1">
        <button
          type="button"
          onClick={() => call("cancel")}
          disabled={pending}
          aria-label="Bekor qilish"
          title="Bekor qilish"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/16 backdrop-blur transition hover:bg-white/15 disabled:opacity-60"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
        </button>
        {error ? <span className="text-[11px] font-extrabold text-rose-200">{error}</span> : null}
      </div>
    );
  }

  return (
    <div className="grid justify-items-end gap-1">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => call("reject")}
          disabled={pending}
          aria-label="Rad etish"
          title="Rad etish"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/16 backdrop-blur transition hover:bg-white/15 disabled:opacity-60"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => call("accept")}
          disabled={pending}
          aria-label="Qabul qilish"
          title="Qabul qilish"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/90 text-white ring-1 ring-emerald-300/40 shadow-[0_12px_30px_rgba(16,185,129,.18)] backdrop-blur transition hover:bg-emerald-400 disabled:opacity-60"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      {error ? <span className="text-[11px] font-extrabold text-rose-200">{error}</span> : null}
    </div>
  );
}
