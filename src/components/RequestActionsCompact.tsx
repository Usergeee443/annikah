"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useState, useTransition } from "react";

type Action = "accept" | "reject" | "cancel";

export default function RequestActionsCompact({
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

  const Btn = ({
    tone,
    onClick,
    children,
  }: {
    tone: "danger" | "success" | "neutral";
    onClick: () => void;
    children: ReactNode;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className={
        "inline-flex h-9 items-center justify-center rounded-2xl px-3 text-[12px] font-extrabold ring-1 transition disabled:opacity-60 " +
        (tone === "danger"
          ? "bg-rose-50 text-rose-700 ring-rose-200 hover:bg-rose-100"
          : tone === "success"
            ? "bg-emerald-500 text-white ring-emerald-300/50 shadow-[0_10px_24px_rgba(16,185,129,.16)] hover:bg-emerald-400"
            : "bg-white text-zinc-900 ring-zinc-200 hover:bg-zinc-50")
      }
    >
      {children}
    </button>
  );

  return (
    <div className="grid gap-1">
      <div className="flex flex-wrap items-center justify-end gap-2">
        {kind === "sent" ? (
          <Btn tone="danger" onClick={() => call("cancel")}>
            Bekor qilish
          </Btn>
        ) : (
          <>
            <Btn tone="danger" onClick={() => call("reject")}>
              Rad etish
            </Btn>
            <Btn tone="success" onClick={() => call("accept")}>
              Qabul qilish
            </Btn>
          </>
        )}
      </div>
      {error ? <span className="text-[11px] font-extrabold text-rose-600">{error}</span> : null}
    </div>
  );
}

