"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type Props = {
  listingId: string;
  authed: boolean;
  isOwner: boolean;
  initialStatus?: "none" | "pending" | "accepted" | "rejected" | "cancelled";
  initialChatId?: string | null;
};

export default function RequestButton({
  listingId,
  authed,
  isOwner,
  initialStatus = "none",
  initialChatId = null,
}: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [chatId] = useState(initialChatId);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (isOwner) {
    return (
      <div className="inline-flex h-11 items-center justify-center rounded-2xl bg-zinc-100 px-5 text-[12px] font-extrabold text-zinc-600 ring-1 ring-zinc-200">
        Bu sizning e’loningiz
      </div>
    );
  }

  function send() {
    if (!authed) {
      router.push("/auth/login");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/requests", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ listingId }),
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          if (data?.error === "PROFILE_INCOMPLETE") {
            router.push("/profile/wizard");
            return;
          }
          setError(data?.error || "Xatolik");
          return;
        }
        setStatus(data?.status || "pending");
        router.refresh();
      } catch {
        setError("Tarmoq xatosi");
      }
    });
  }

  if (status === "accepted" && chatId) {
    return (
      <a
        href={`/chats/${chatId}`}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 text-[12px] font-extrabold text-white shadow-sm ring-1 ring-emerald-700 hover:bg-emerald-500"
      >
        Chatga o‘tish
      </a>
    );
  }

  if (status === "pending") {
    return (
      <div className="inline-flex h-11 items-center justify-center rounded-2xl bg-amber-50 px-5 text-[12px] font-extrabold text-amber-800 ring-1 ring-amber-200">
        So‘rov yuborilgan · Kutilmoqda
      </div>
    );
  }

  if (status === "rejected") {
    return (
      <div className="inline-flex h-11 items-center justify-center rounded-2xl bg-rose-50 px-5 text-[12px] font-extrabold text-rose-800 ring-1 ring-rose-200">
        So‘rov rad etilgan
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={send}
        disabled={pending}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-5 text-[12px] font-extrabold text-white shadow-sm ring-1 ring-black/10 hover:bg-zinc-900 disabled:opacity-60"
      >
        {pending ? "Yuborilmoqda…" : "So‘rov yuborish"}
      </button>
      {error ? <span className="text-[11px] font-extrabold text-rose-700">{error}</span> : null}
    </div>
  );
}
