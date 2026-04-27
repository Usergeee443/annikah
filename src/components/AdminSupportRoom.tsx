"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Msg = {
  id: string;
  body: string;
  sender: "user" | "admin" | string;
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
    if (last && last.dayKey === key) last.messages.push(m);
    else out.push({ dayKey: key, label: dayLabel(d), messages: [m] });
  }
  return out;
}

export default function AdminSupportRoom({
  threadId,
  userLabel,
  initialMessages,
  initialStatus,
}: {
  threadId: string;
  userLabel: string;
  initialMessages: Msg[];
  initialStatus: string;
}) {
  const router = useRouter();
  const [messages, setMessages] = useState<Msg[]>(initialMessages);
  const [status, setStatus] = useState(initialStatus);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [closing, startClosing] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const groups = useMemo(() => groupByDay(messages), [messages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      try {
        const res = await fetch(`/api/admin/support/${threadId}/messages`, { cache: "no-store" });
        const data = await res.json().catch(() => null);
        if (!cancelled && Array.isArray(data?.messages)) setMessages(data.messages);
      } catch {
        // ignore
      }
    };
    const id = setInterval(tick, 4000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [threadId]);

  function autoresize() {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(160, ta.scrollHeight) + "px";
  }

  function send() {
    const body = text.trim();
    if (!body || pending) return;
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/support/${threadId}/messages`, {
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
        if (taRef.current) taRef.current.style.height = "auto";
        if (data?.message) setMessages((p) => [...p, data.message]);
        setStatus("open");
        router.refresh();
      } catch {
        setError("Tarmoq xatosi");
      }
    });
  }

  function closeThread() {
    startClosing(async () => {
      const res = await fetch(`/api/admin/support/${threadId}/close`, { method: "POST" }).catch(() => null);
      if (res?.ok) {
        setStatus("closed");
        router.refresh();
      }
    });
  }

  return (
    <section className="flex h-[calc(100dvh-10rem)] min-h-[520px] flex-col overflow-hidden rounded-3xl border border-zinc-200/70 bg-white shadow-[0_8px_28px_rgba(15,23,42,.06)]">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-zinc-200/70 bg-white/95 px-4 py-3 backdrop-blur sm:px-5">
        <div className="min-w-0">
          <div className="text-[11px] font-extrabold tracking-widest text-zinc-500">SUPPORT</div>
          <div className="mt-1 truncate text-[15px] font-extrabold tracking-tight text-zinc-950">
            {userLabel}
          </div>
          <div className="mt-0.5 text-[11.5px] font-medium text-zinc-500">
            Thread: {threadId.slice(0, 8)}… · Status: {status}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/adminpanel/support"
            className="inline-flex h-9 items-center justify-center rounded-2xl bg-white px-3 text-[12px] font-extrabold text-zinc-900 ring-1 ring-zinc-200 hover:bg-zinc-50"
          >
            Ro‘yxat
          </Link>
          <button
            type="button"
            onClick={closeThread}
            disabled={closing}
            className="inline-flex h-9 items-center justify-center rounded-2xl bg-zinc-100 px-3 text-[12px] font-extrabold text-zinc-700 ring-1 ring-zinc-200 hover:bg-zinc-200 disabled:opacity-60"
          >
            {closing ? "Yopilmoqda…" : "Yopish"}
          </button>
        </div>
      </header>

      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto bg-[radial-gradient(circle_at_50%_-10%,#eef2ff_0%,#f4f4f5_55%)] px-3 py-4 sm:px-6"
      >
        <div className="mx-auto w-full max-w-3xl">
          {groups.map((g) => (
            <div key={g.dayKey}>
              <div className="my-3 flex justify-center">
                <span className="rounded-full bg-white/85 px-3 py-0.5 text-[10.5px] font-extrabold uppercase tracking-[0.14em] text-zinc-600 shadow-sm ring-1 ring-zinc-200 backdrop-blur">
                  {g.label}
                </span>
              </div>

              {g.messages.map((m, i) => {
                const mine = m.sender === "admin";
                const prev = g.messages[i - 1];
                const next = g.messages[i + 1];
                const samePrev = prev && prev.sender === m.sender;
                const sameNext = next && next.sender === m.sender;

                let radius = "rounded-2xl";
                if (mine) {
                  if (samePrev && sameNext) radius = "rounded-2xl rounded-r-md";
                  else if (samePrev) radius = "rounded-2xl rounded-tr-md";
                  else if (sameNext) radius = "rounded-2xl rounded-br-md";
                } else {
                  if (samePrev && sameNext) radius = "rounded-2xl rounded-l-md";
                  else if (samePrev) radius = "rounded-2xl rounded-tl-md";
                  else if (sameNext) radius = "rounded-2xl rounded-bl-md";
                }

                return (
                  <div
                    key={m.id}
                    className={
                      "flex " + (mine ? "justify-end" : "justify-start") + " " + (sameNext ? "mb-0.5" : "mb-2.5")
                    }
                  >
                    <div
                      className={
                        "max-w-[78%] px-3.5 py-2 text-[13.5px] leading-snug shadow-[0_1px_2px_rgba(15,23,42,.08)] " +
                        radius +
                        " " +
                        (mine ? "bg-zinc-950 text-white" : "bg-white text-zinc-900 ring-1 ring-zinc-200")
                      }
                    >
                      <div className="whitespace-pre-wrap wrap-break-word">{m.body}</div>
                      <div className={"mt-0.5 text-[10px] " + (mine ? "text-white/70" : "text-zinc-400")}>
                        {timeOnly(m.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="shrink-0 border-t border-zinc-200/70 bg-white px-3 py-3 sm:px-5">
        <div className="mx-auto flex w-full max-w-3xl items-end gap-2">
          <div className="flex flex-1 items-end rounded-2xl bg-zinc-100 px-3 py-1.5 transition focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(24,24,27,.06)] focus-within:ring-1 focus-within:ring-zinc-200">
            <textarea
              ref={taRef}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                autoresize();
              }}
              placeholder="Admin javobi…"
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
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-zinc-950 px-5 text-[12px] font-extrabold text-white ring-1 ring-black/10 hover:bg-zinc-900 disabled:opacity-60"
          >
            {pending ? "Yuborilmoqda…" : "Yuborish"}
          </button>
        </div>
        {error ? <div className="mx-auto mt-2 max-w-3xl text-[12px] font-extrabold text-rose-700">{error}</div> : null}
      </div>
    </section>
  );
}

