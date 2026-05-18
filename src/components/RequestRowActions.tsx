"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";

type Tab = "received" | "sent";

const dialogCls =
  "fixed left-1/2 top-1/2 z-[200] max-h-[min(90dvh,560px)] w-[min(92vw,400px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl border border-zinc-200 bg-white p-5 shadow-2xl backdrop:bg-black/40";

export default function RequestRowActions({
  tab,
  initialStatus,
  requestId,
  chatId,
}: {
  tab: Tab;
  initialStatus: string;
  requestId: string;
  chatId: string | null;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const warnEndRef = useRef<HTMLDialogElement>(null);
  const warnCancelRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  const refresh = useCallback(() => router.refresh(), [router]);

  function post(body: Record<string, string>) {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/requests/${requestId}`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
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
        refresh();
      } catch {
        setError("Tarmoq xatosi");
      }
    });
  }

  const chatBtn =
    "inline-flex h-9 min-h-[36px] flex-1 items-center justify-center rounded-xl bg-white px-4 text-[12px] font-semibold text-zinc-900 ring-1 ring-zinc-200 transition hover:bg-zinc-50 active:scale-[0.99]";

  const dangerOutline =
    "inline-flex h-9 min-h-[36px] flex-1 items-center justify-center rounded-xl bg-rose-600 px-4 text-[12px] font-semibold text-white ring-1 ring-rose-500/40 shadow-sm transition hover:bg-rose-500 active:scale-[0.99] disabled:opacity-60";

  const successBtn =
    "inline-flex h-9 min-h-[36px] flex-1 items-center justify-center rounded-xl bg-emerald-600 px-4 text-[12px] font-semibold text-white ring-1 ring-emerald-500/35 shadow-sm transition hover:bg-emerald-500 active:scale-[0.99] disabled:opacity-60";

  const neutralDanger =
    "inline-flex h-9 min-h-[36px] flex-1 items-center justify-center rounded-xl bg-white px-4 text-[12px] font-semibold text-rose-700 ring-1 ring-rose-200 transition hover:bg-rose-50 active:scale-[0.99] disabled:opacity-60";

  const soloBtn =
    "inline-flex h-9 min-h-[36px] w-full max-w-full items-center justify-center rounded-xl bg-zinc-900 px-4 text-[12px] font-semibold text-white ring-1 ring-black/10 transition hover:bg-zinc-800 active:scale-[0.99] disabled:opacity-60 sm:max-w-xs";

  if (status === "rejected" || status === "cancelled") {
    return (
      <div className="grid gap-1 px-1">
        <p className="text-[12px] font-semibold text-zinc-500">
          {status === "cancelled" ? "So‘rov bekor qilingan." : "So‘rov rad etilgan."}
        </p>
      </div>
    );
  }

  /* ----- Kelgan ----- */
  if (tab === "received") {
    if (status === "pending") {
      return (
        <div className="grid gap-2 px-1">
          <div className="flex gap-2">
            <button type="button" disabled={pending} className={neutralDanger} onClick={() => post({ action: "reject" })}>
              Rad qilish
            </button>
            <button type="button" disabled={pending} className={successBtn} onClick={() => post({ action: "accept" })}>
              Qabul qilish
            </button>
          </div>
          {error ? <p className="text-[11px] font-semibold text-rose-600">{error}</p> : null}
        </div>
      );
    }

    if (status === "accepted" && chatId) {
      return (
        <div className="grid gap-2 px-1">
          <div className="flex gap-2">
            <Link href={`/chats/${chatId}`} className={chatBtn}>
              Chatni ochish
            </Link>
            <button
              type="button"
              disabled={pending}
              className={dangerOutline}
              onClick={() => warnEndRef.current?.showModal()}
            >
              O‘chirish
            </button>
          </div>
          <dialog ref={warnEndRef} className={dialogCls}>
            <p className="text-[14px] font-extrabold tracking-tight text-zinc-950">Ogohlantirish</p>
            <p className="mt-2 text-[13px] font-medium leading-relaxed text-zinc-600">
              Chat tugatiladi va aloqa yakunlanadi. Keyin qayta yozish uchun yangi so‘rov yuborishingiz kerak bo‘ladi.
              Davom etasizmi?
            </p>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                className="inline-flex h-10 items-center justify-center rounded-2xl bg-white px-4 text-[12px] font-extrabold text-zinc-900 ring-1 ring-zinc-200"
                onClick={() => warnEndRef.current?.close()}
              >
                Bekor qilish
              </button>
              <button
                type="button"
                disabled={pending}
                className="inline-flex h-10 items-center justify-center rounded-2xl bg-rose-600 px-4 text-[12px] font-extrabold text-white ring-1 ring-rose-500/30"
                onClick={() => {
                  warnEndRef.current?.close();
                  post({ action: "end_connection" });
                }}
              >
                Ha, tugatish
              </button>
            </div>
          </dialog>
          {error ? <p className="text-[11px] font-semibold text-rose-600">{error}</p> : null}
        </div>
      );
    }

    return (
      <div className="px-1">
        <p className="text-[12px] font-semibold text-zinc-500">Holat yangilanmoqda…</p>
      </div>
    );
  }

  /* ----- Yuborilgan (sent) ----- */
  if (status === "pending") {
    return (
      <div className="grid gap-2 px-1">
        <button type="button" disabled={pending} className={soloBtn} onClick={() => post({ action: "cancel" })}>
          Bekor qilish
        </button>
        {error ? <p className="text-[11px] font-semibold text-rose-600">{error}</p> : null}
      </div>
    );
  }

  if (status === "accepted") {
    return (
      <div className="grid gap-2 px-1">
        <button type="button" disabled={pending} className={soloBtn} onClick={() => warnCancelRef.current?.showModal()}>
          Bekor qilish
        </button>
        <dialog ref={warnCancelRef} className={dialogCls}>
          <p className="text-[14px] font-extrabold tracking-tight text-zinc-950">Ogohlantirish</p>
          <p className="mt-2 text-[13px] font-medium leading-relaxed text-zinc-600">
            Chat tugatiladi va so‘rov bekor qilinadi. Qabul qilgan tomonda ham aloqa yopiladi. Keyin qayta yozish uchun
            yangi so‘rov kerak bo‘ladi. Davom etasizmi?
          </p>
          <div className="mt-4 flex flex-wrap justify-end gap-2">
            <button
              type="button"
              className="inline-flex h-10 items-center justify-center rounded-2xl bg-white px-4 text-[12px] font-extrabold text-zinc-900 ring-1 ring-zinc-200"
              onClick={() => warnCancelRef.current?.close()}
            >
              Orqaga
            </button>
            <button
              type="button"
              disabled={pending}
              className="inline-flex h-10 items-center justify-center rounded-2xl bg-zinc-950 px-4 text-[12px] font-extrabold text-white ring-1 ring-black/10"
              onClick={() => {
                warnCancelRef.current?.close();
                post({ action: "cancel" });
              }}
            >
              Ha, bekor qilish
            </button>
          </div>
        </dialog>
        {error ? <p className="text-[11px] font-semibold text-rose-600">{error}</p> : null}
      </div>
    );
  }

  return <div className="px-1" />;
}
