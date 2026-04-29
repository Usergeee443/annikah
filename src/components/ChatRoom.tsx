"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Msg = {
  id: string;
  body: string;
  senderId: string;
  createdAt: string;
};

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function dayLabel(d: Date) {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (isSameDay(d, today)) return "Bugun";
  if (isSameDay(d, yesterday)) return "Kecha";
  const sameYear = d.getFullYear() === today.getFullYear();
  return d.toLocaleDateString("uz-UZ", {
    day: "numeric",
    month: "long",
    year: sameYear ? undefined : "numeric",
  });
}

function timeOnly(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

type Group = { dayKey: string; label: string; messages: Msg[] };

function groupByDay(msgs: Msg[]): Group[] {
  const out: Group[] = [];
  for (const m of msgs) {
    const d = new Date(m.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    const last = out[out.length - 1];
    if (last && last.dayKey === key) {
      last.messages.push(m);
    } else {
      out.push({ dayKey: key, label: dayLabel(d), messages: [m] });
    }
  }
  return out;
}

export default function ChatRoom({
  chatId,
  meId,
  otherName,
  category,
  initialMessages,
  endsAt,
  endedAt,
}: {
  chatId: string;
  meId: string;
  otherName: string;
  category?: string;
  initialMessages: Msg[];
  endsAt: string;
  endedAt: string | null;
}) {
  const router = useRouter();
  const [messages, setMessages] = useState<Msg[]>(initialMessages);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [endingPending, startEndingTransition] = useTransition();
  const [serverEndedAt, setServerEndedAt] = useState<string | null>(endedAt);
  const scrollRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const isExpired = new Date(endsAt).getTime() < Date.now();
  const isEnded = !!serverEndedAt || isExpired;

  const groups = useMemo(() => groupByDay(messages), [messages]);
  const initial = (otherName.trim()[0] || "?").toUpperCase();
  const gradient =
    category === "kelinlar" ? "from-rose-300 to-rose-700" : "from-sky-300 to-blue-700";

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    if (isEnded) return;
    let cancelled = false;
    const tick = async () => {
      try {
        const res = await fetch(`/api/chats/${chatId}/messages`, { cache: "no-store" });
        const data = await res.json().catch(() => null);
        if (!cancelled && Array.isArray(data?.messages)) {
          setMessages(data.messages);
        }
      } catch {
        // ignore
      }
    };
    const id = setInterval(tick, 4000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [chatId, isEnded]);

  function autoresize() {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(160, ta.scrollHeight) + "px";
  }

  function send() {
    const body = text.trim();
    if (!body || pending || isEnded) return;
    setError(null);

    startTransition(async () => {
      try {
        const res = await fetch(`/api/chats/${chatId}/messages`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ body }),
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          setError(data?.message || data?.error || "Xatolik");
          return;
        }
        setText("");
        if (taRef.current) {
          taRef.current.style.height = "auto";
        }
        if (data?.message) {
          setMessages((prev) => [...prev, data.message]);
        }
      } catch {
        setError("Tarmoq xatosi");
      }
    });
  }

  function endChat() {
    if (!confirm("Chatni tugatishni xohlaysizmi? Bu amalni qaytarib bo‘lmaydi.")) return;
    startEndingTransition(async () => {
      try {
        const res = await fetch(`/api/chats/${chatId}/end`, { method: "POST" });
        if (res.ok) {
          setServerEndedAt(new Date().toISOString());
          router.refresh();
        }
      } catch {
        // ignore
      }
    });
  }

  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(endsAt).getTime() - Date.now()) / (24 * 60 * 60 * 1000)),
  );

  return (
    <section className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-white lg:rounded-3xl lg:border lg:border-zinc-200/70 lg:shadow-[0_8px_28px_rgba(15,23,42,.06)]">
      {/* Sticky header (orqaga, ism, tugatish) */}
      <header className="sticky top-0 z-10 flex shrink-0 items-center justify-between gap-3 border-b border-zinc-200/70 bg-white/95 px-4 py-3 pt-[calc(env(safe-area-inset-top)+12px)] backdrop-blur lg:static lg:px-5 lg:pt-3">
        <div className="flex min-w-0 items-center gap-3">
          {/* back on mobile */}
          <Link
            href="/chats"
            className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-700 hover:bg-zinc-100 lg:hidden"
            aria-label="Orqaga"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
              <path
                d="M15 6l-6 6 6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>

          {/* avatar */}
          <div
            className={
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br text-[14px] font-black text-white shadow-[0_4px_12px_rgba(15,23,42,.18)] " +
              gradient
            }
          >
            {initial}
          </div>

          <div className="min-w-0">
            <div className="truncate text-[14.5px] font-extrabold tracking-tight text-zinc-950">
              {otherName}
            </div>
            <div className="mt-0.5 flex items-center gap-1.5">
              <span
                className={
                  "inline-block h-1.5 w-1.5 rounded-full " +
                  (isEnded ? "bg-zinc-400" : "bg-emerald-500")
                }
              />
              <div className="text-[11px] font-bold text-zinc-500">
                {isEnded
                  ? "Chat tugagan"
                  : daysLeft > 0
                    ? `${daysLeft} kun qoldi`
                    : "Bugun tugaydi"}
              </div>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {!isEnded ? (
            <button
              type="button"
              onClick={endChat}
              disabled={endingPending}
              className="inline-flex h-9 items-center justify-center rounded-2xl bg-rose-50 px-3 text-[12px] font-extrabold text-rose-700 ring-1 ring-rose-200 transition hover:bg-rose-100 disabled:opacity-60"
            >
              {endingPending ? "Tugatilmoqda…" : "Tugatish"}
            </button>
          ) : (
            <span className="inline-flex h-9 items-center rounded-2xl bg-zinc-100 px-3 text-[11px] font-extrabold text-zinc-700 ring-1 ring-zinc-200">
              Yopildi
            </span>
          )}
        </div>
      </header>

      {/* Messages (faqat shu qism scroll bo'ladi) */}
      <div
        ref={scrollRef}
        className="chat-telegram-bg flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 py-4 pb-[calc(92px+env(safe-area-inset-bottom))] sm:px-6 lg:pb-4"
      >
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="rounded-3xl bg-white/80 px-5 py-4 text-center shadow-sm ring-1 ring-zinc-200">
              <div className="text-[13px] font-extrabold tracking-tight text-zinc-900">
                Suhbatni boshlang
              </div>
              <div className="mt-1 text-[11.5px] font-medium text-zinc-500">
                Salomlashing va o‘zingiz haqida qisqacha yozing.
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-3xl">
            {groups.map((g) => (
              <div key={g.dayKey}>
                <div className="my-3 flex justify-center">
                  <span className="rounded-full bg-white/85 px-3 py-0.5 text-[10.5px] font-extrabold uppercase tracking-[0.14em] text-zinc-600 shadow-sm ring-1 ring-zinc-200 backdrop-blur">
                    {g.label}
                  </span>
                </div>

                {g.messages.map((m, i) => {
                  const mine = m.senderId === meId;
                  const prev = g.messages[i - 1];
                  const next = g.messages[i + 1];
                  const sameSenderPrev = prev && prev.senderId === m.senderId;
                  const sameSenderNext = next && next.senderId === m.senderId;

                  // Telegram-like grouped bubble corners
                  let radius = "rounded-2xl";
                  if (mine) {
                    if (sameSenderPrev && sameSenderNext) radius = "rounded-2xl rounded-r-md";
                    else if (sameSenderPrev) radius = "rounded-2xl rounded-tr-md";
                    else if (sameSenderNext) radius = "rounded-2xl rounded-br-md";
                  } else {
                    if (sameSenderPrev && sameSenderNext) radius = "rounded-2xl rounded-l-md";
                    else if (sameSenderPrev) radius = "rounded-2xl rounded-tl-md";
                    else if (sameSenderNext) radius = "rounded-2xl rounded-bl-md";
                  }

                  return (
                    <div
                      key={m.id}
                      className={
                        "flex " +
                        (mine ? "justify-end" : "justify-start") +
                        " " +
                        (sameSenderNext ? "mb-0.5" : "mb-2.5")
                      }
                    >
                      <div
                        className={
                          "max-w-[78%] px-3.5 py-2 text-[13.5px] leading-snug shadow-[0_1px_2px_rgba(15,23,42,.08)] " +
                          radius +
                          " " +
                          (mine
                            ? "bg-[#d9fdd3] text-zinc-900 ring-1 ring-emerald-200 shadow-[0_1px_1px_rgba(0,0,0,.08)]"
                            : "bg-white text-zinc-900 ring-1 ring-zinc-200 shadow-[0_1px_1px_rgba(0,0,0,.06)]")
                        }
                      >
                        <div className="whitespace-pre-wrap wrap-break-word">{m.body}</div>
                        <div
                          className={
                            "mt-0.5 flex items-center justify-end gap-1 text-[10px] " +
                            (mine ? "text-emerald-900/60" : "text-zinc-400")
                          }
                        >
                          <span>{timeOnly(m.createdAt)}</span>
                          {mine ? (
                            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none">
                              <path
                                d="m4 13 4 4 8-8"
                                stroke="currentColor"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="m11 17 8-8"
                                stroke="currentColor"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Composer (qotib turadi) */}
      <div className="lg:static lg:shrink-0 lg:border-t lg:border-zinc-200/70 lg:bg-white/95 lg:backdrop-blur">
        {/* Mobile: fixed composer — klaviatura ustida turadi */} 
        <div
          className="fixed inset-x-0 bottom-0 z-20 border-t border-zinc-200/70 bg-white/95 px-3 py-3 backdrop-blur sm:px-5 lg:static lg:border-0 lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-0"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)" }}
        >
        {isEnded ? (
          <div className="flex items-center justify-center rounded-2xl bg-zinc-100 px-4 py-3 text-[12.5px] font-extrabold text-zinc-600 ring-1 ring-zinc-200">
            Suhbat tugagan — yangi xabar yuborib bo‘lmaydi
          </div>
        ) : (
          <div className="mx-auto flex w-full max-w-3xl items-end gap-2">
            <div className="flex flex-1 items-end rounded-2xl bg-zinc-100 px-3 py-1.5 transition focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(24,24,27,.06)] focus-within:ring-1 focus-within:ring-zinc-200">
              <textarea
                ref={taRef}
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  autoresize();
                }}
                placeholder="Xabar yozing…"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                className="max-h-40 min-h-[24px] w-full resize-none bg-transparent py-1.5 text-[14px] font-medium text-zinc-900 outline-none placeholder:text-zinc-400"
              />
            </div>
            <button
              type="button"
              onClick={send}
              disabled={pending || !text.trim()}
              aria-label="Yuborish"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sky-500 text-white shadow-[0_8px_20px_rgba(14,165,233,.35)] transition hover:bg-sky-600 disabled:bg-zinc-300 disabled:shadow-none"
            >
              {pending ? (
                <svg viewBox="0 0 24 24" className="h-5 w-5 animate-spin" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity=".25" />
                  <path
                    d="M21 12a9 9 0 0 0-9-9"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                  <path d="M3.4 20.6 21 12 3.4 3.4 3.4 10l12 2-12 2z" />
                </svg>
              )}
            </button>
          </div>
        )}
        {error ? (
          <div className="mx-auto mt-2 max-w-3xl text-[12px] font-extrabold text-rose-700">
            {error}
          </div>
        ) : null}
        </div>
      </div>
    </section>
  );
}
