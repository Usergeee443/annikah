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
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => call("cancel")}
          disabled={pending}
          className="inline-flex h-9 items-center justify-center rounded-2xl bg-white px-3 text-[12px] font-extrabold text-zinc-900 ring-1 ring-zinc-200 hover:bg-zinc-50 disabled:opacity-60"
        >
          Bekor qilish
        </button>
        {error ? <span className="text-[11px] font-extrabold text-rose-700">{error}</span> : null}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => call("accept")}
        disabled={pending}
        className="inline-flex h-9 items-center justify-center rounded-2xl bg-emerald-600 px-3 text-[12px] font-extrabold text-white ring-1 ring-emerald-700 hover:bg-emerald-500 disabled:opacity-60"
      >
        Qabul qilish
      </button>
      <button
        type="button"
        onClick={() => call("reject")}
        disabled={pending}
        className="inline-flex h-9 items-center justify-center rounded-2xl bg-white px-3 text-[12px] font-extrabold text-rose-700 ring-1 ring-rose-200 hover:bg-rose-50 disabled:opacity-60"
      >
        Rad etish
      </button>
      {error ? <span className="text-[11px] font-extrabold text-rose-700">{error}</span> : null}
    </div>
  );
}
