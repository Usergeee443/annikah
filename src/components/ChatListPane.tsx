"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

export type ChatListItem = {
  id: string;
  otherName: string;
  initial: string;
  category: "kelinlar" | "kuyovlar" | string;
  lastMessage: string | null;
  lastFromMe: boolean;
  lastAt: string | null;
  ended: boolean;
  endsAt: string;
  createdAt: string;
};

function formatShortTime(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (24 * 60 * 60 * 1000));
  if (diffDays < 7) {
    return d.toLocaleDateString([], { weekday: "short" });
  }
  return d.toLocaleDateString([], { day: "2-digit", month: "2-digit" });
}

function timeLeftLabel(iso: string): string {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return "Tugagan";
  const days = Math.floor(ms / (24 * 60 * 60 * 1000));
  const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  if (days > 0) return `${days} kun`;
  if (hours > 0) return `${hours} soat`;
  const mins = Math.max(1, Math.floor(ms / (60 * 1000)));
  return `${mins} daq`;
}

export default function ChatListPane({ chats }: { chats: ChatListItem[] }) {
  const pathname = usePathname() || "";
  const currentId = pathname.startsWith("/chats/") ? pathname.split("/")[2] || null : null;

  const [tab, setTab] = useState<"active" | "ended">("active");
  const [q, setQ] = useState("");

  const { active, ended } = useMemo(() => {
    const a: ChatListItem[] = [];
    const e: ChatListItem[] = [];
    for (const c of chats) (c.ended ? e : a).push(c);
    return { active: a, ended: e };
  }, [chats]);

  const visible = useMemo(() => {
    const base = tab === "active" ? active : ended;
    const term = q.trim().toLowerCase();
    if (!term) return base;
    return base.filter(
      (c) =>
        c.otherName.toLowerCase().includes(term) ||
        (c.lastMessage || "").toLowerCase().includes(term),
    );
  }, [tab, active, ended, q]);

  return (
    <aside className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-white lg:rounded-3xl lg:border lg:border-zinc-200/70 lg:bg-white/95 lg:shadow-[0_8px_28px_rgba(15,23,42,.06)]">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 shrink-0 border-b border-zinc-200/70 bg-white/95 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+12px)] backdrop-blur lg:static lg:rounded-t-3xl lg:pt-4">
        {/* Desktop title (mobilda yashirin) */}
        <div className="hidden items-center justify-between lg:flex">
          <h2 className="text-[18px] font-black tracking-tight text-zinc-950">Chatlar</h2>
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10.5px] font-extrabold tracking-widest text-zinc-600">
            {chats.length}
          </span>
        </div>

        {/* Search */}
        <div className="relative lg:mt-3">
          <svg
            viewBox="0 0 24 24"
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
            fill="none"
          >
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7" />
            <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Qidirish"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="search"
            className="h-10 w-full rounded-2xl bg-zinc-100 pl-9 pr-3 text-[13px] font-medium text-zinc-900 outline-none placeholder:text-zinc-400 transition focus:bg-white focus:shadow-[0_0_0_3px_rgba(24,24,27,.06)]"
          />
        </div>

        {/* Tabs */}
        <div className="mt-3 grid grid-cols-2 gap-1 rounded-2xl bg-zinc-100/80 p-1">
          <button
            type="button"
            onClick={() => setTab("active")}
            className={
              "h-9 rounded-xl text-[12px] font-extrabold tracking-tight transition " +
              (tab === "active"
                ? "bg-white text-zinc-950 shadow-sm ring-1 ring-zinc-200/80"
                : "text-zinc-600 hover:text-zinc-900")
            }
          >
            Faol
            <span
              className={
                "ml-1.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-extrabold " +
                (tab === "active"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-white text-zinc-600")
              }
            >
              {active.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setTab("ended")}
            className={
              "h-9 rounded-xl text-[12px] font-extrabold tracking-tight transition " +
              (tab === "ended"
                ? "bg-white text-zinc-950 shadow-sm ring-1 ring-zinc-200/80"
                : "text-zinc-600 hover:text-zinc-900")
            }
          >
            Tugagan
            <span
              className={
                "ml-1.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-extrabold " +
                (tab === "ended"
                  ? "bg-zinc-200 text-zinc-700"
                  : "bg-white text-zinc-600")
              }
            >
              {ended.length}
            </span>
          </button>
        </div>
      </div>

      {/* List (faqat shu qism scroll bo'ladi) */}
      <div className="flex-1 min-h-0 overflow-y-auto pb-[calc(env(safe-area-inset-bottom)+96px)] lg:pb-2">
        {visible.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-6 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
                <path
                  d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                />
              </svg>
            </div>
            <div className="text-[13px] font-extrabold text-zinc-900">
              {tab === "active" ? "Faol chat yo‘q" : "Tugagan chat yo‘q"}
            </div>
            <div className="max-w-[220px] text-[11.5px] font-medium text-zinc-500">
              {q
                ? "Qidiruvga mos chat topilmadi."
                : tab === "active"
                  ? "E’lon egasiga so‘rov yuboring va u qabul qilsa, suhbat shu yerda paydo bo‘ladi."
                  : "Tugatilgan suhbatlar shu bo‘limda saqlanadi."}
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-zinc-100">
            {visible.map((c) => {
              const isActive = c.id === currentId;
              const gradient =
                c.category === "kelinlar"
                  ? "from-rose-300 to-rose-700"
                  : "from-sky-300 to-blue-700";
              const leftLabel = c.ended ? "Tugagan" : timeLeftLabel(c.endsAt);
              return (
                <li key={c.id}>
                  <Link
                    href={`/chats/${c.id}`}
                    className={
                      "flex items-center gap-3 px-4 py-3 transition " +
                      (isActive ? "bg-zinc-100" : "active:bg-zinc-100 hover:bg-zinc-50")
                    }
                  >
                    {/* Avatar */}
                    <div
                      className={
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-linear-to-br text-[16px] font-black text-white shadow-[0_6px_14px_rgba(15,23,42,.18)] " +
                        gradient
                      }
                    >
                      {c.initial}
                    </div>

                    {/* Texts */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 truncate text-[14px] font-extrabold tracking-tight text-zinc-950">
                          {c.otherName}
                        </div>
                        <div className="shrink-0 text-[10.5px] font-bold text-zinc-400">
                          {formatShortTime(c.lastAt || c.createdAt)}
                        </div>
                      </div>
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <div className="min-w-0 truncate text-[12.5px] font-medium text-zinc-600">
                          {c.lastMessage ? (
                            <>
                              {c.lastFromMe ? (
                                <span className="text-zinc-400">Siz: </span>
                              ) : null}
                              {c.lastMessage}
                            </>
                          ) : (
                            <span className="italic text-zinc-400">Hali xabar yo‘q</span>
                          )}
                        </div>
                        <span
                          className={
                            "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-extrabold ring-1 " +
                            (c.ended
                              ? "bg-zinc-100 text-zinc-600 ring-zinc-200"
                              : "bg-emerald-50 text-emerald-700 ring-emerald-200")
                          }
                        >
                          <span
                            className={
                              "h-1.5 w-1.5 rounded-full " +
                              (c.ended ? "bg-zinc-400" : "bg-emerald-500")
                            }
                          />
                          {leftLabel}
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}
