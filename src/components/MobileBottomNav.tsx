"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

function cls(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

const STROKE = {
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const ITEMS: NavItem[] = [
  {
    href: "/",
    label: "E’lonlar",
    icon: (
      <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" {...STROKE} aria-hidden="true">
        <path d="m3 11 9-8 9 8" />
        <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
      </svg>
    ),
  },
  {
    href: "/requests",
    label: "So‘rovlar",
    icon: (
      <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" {...STROKE} aria-hidden="true">
        <path d="M22 12h-6l-2 3h-4l-2-3H2" />
        <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
      </svg>
    ),
  },
  {
    href: "/chats",
    label: "Chatlar",
    icon: (
      <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" {...STROKE} aria-hidden="true">
        <path d="M21 12a8 8 0 0 1-11.5 7.16L4 20l1-5A8 8 0 1 1 21 12z" />
      </svg>
    ),
  },
  {
    href: "/favorites",
    label: "Sevimli",
    icon: (
      <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" {...STROKE} aria-hidden="true">
        <path d="M12 21s-7-4.35-9.5-9A5.5 5.5 0 0 1 12 6.5 5.5 5.5 0 0 1 21.5 12c-2.5 4.65-9.5 9-9.5 9z" />
      </svg>
    ),
  },
  {
    href: "/profile",
    label: "Profil",
    icon: (
      <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" {...STROKE} aria-hidden="true">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </svg>
    ),
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function MobileBottomNav() {
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (pathname.startsWith("/auth/") || pathname.startsWith("/adminpanel")) return null;
  if (pathname.startsWith("/chats/") && pathname !== "/chats") return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden="true"
        className={cls(
          "fixed inset-0 z-40 bg-zinc-950/30 backdrop-blur-[2px] transition-opacity md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      {/* Floating action area */}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-50 md:hidden"
        aria-label="Pastki menyu"
      >
        <div
          className="mx-auto w-full max-w-md px-4"
          style={{ paddingBottom: "calc(16px + env(safe-area-inset-bottom))" }}
        >
          {/* Sheet (above the FAB) */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Sahifalar menyusi"
            className={cls(
              "pointer-events-auto mb-3 origin-bottom rounded-[28px] p-2 ring-1 ring-white/40 shadow-[0_22px_60px_rgba(15,23,42,.22),inset_0_1px_0_rgba(255,255,255,.6)] [backdrop-filter:blur(28px)_saturate(180%)] [-webkit-backdrop-filter:blur(28px)_saturate(180%)] transition duration-200",
              open ? "scale-100 opacity-100 translate-y-0" : "pointer-events-none translate-y-3 scale-95 opacity-0",
            )}
            style={{ backgroundColor: "rgba(255,255,255,0.32)" }}
          >
            <div className="grid grid-cols-5 gap-1">
              {ITEMS.map((it) => {
                const active = isActive(pathname, it.href);
                return (
                  <Link
                    key={it.href}
                    href={it.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={cls(
                      "flex flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-[10.5px] font-extrabold tracking-tight transition",
                      active ? "text-indigo-700" : "text-zinc-700/85",
                    )}
                  >
                    <span
                      className={cls(
                        "grid h-11 w-11 place-items-center rounded-full transition",
                        active
                          ? "bg-white/72 ring-1 ring-white/55 shadow-[0_10px_30px_rgba(99,102,241,.25),inset_0_1px_0_rgba(255,255,255,.7)]"
                          : "bg-transparent",
                      )}
                    >
                      {it.icon}
                    </span>
                    <span className="leading-none">{it.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Single FAB */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label={open ? "Menyuni yopish" : "Menyuni ochish"}
              className={cls(
                "pointer-events-auto inline-flex h-14 w-14 items-center justify-center rounded-full ring-1 ring-white/45 text-zinc-950 transition shadow-[0_22px_50px_rgba(15,23,42,.28),inset_0_1px_0_rgba(255,255,255,.65)] [backdrop-filter:blur(28px)_saturate(180%)] [-webkit-backdrop-filter:blur(28px)_saturate(180%)]",
                open ? "rotate-45" : "rotate-0",
              )}
              style={{ backgroundColor: "rgba(255,255,255,0.42)" }}
            >
              <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden="true">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
