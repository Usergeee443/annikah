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
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" {...STROKE} aria-hidden="true">
        <path d="m3 11 9-8 9 8" />
        <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
      </svg>
    ),
  },
  {
    href: "/requests",
    label: "So‘rovlar",
    icon: (
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" {...STROKE} aria-hidden="true">
        <path d="M22 12h-6l-2 3h-4l-2-3H2" />
        <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
      </svg>
    ),
  },
  {
    href: "/chats",
    label: "Chatlar",
    icon: (
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" {...STROKE} aria-hidden="true">
        <path d="M21 12a8 8 0 0 1-11.5 7.16L4 20l1-5A8 8 0 1 1 21 12z" />
      </svg>
    ),
  },
  {
    href: "/favorites",
    label: "Sevimli",
    icon: (
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" {...STROKE} aria-hidden="true">
        <path d="M12 21s-7-4.35-9.5-9A5.5 5.5 0 0 1 12 6.5 5.5 5.5 0 0 1 21.5 12c-2.5 4.65-9.5 9-9.5 9z" />
      </svg>
    ),
  },
  {
    href: "/profile",
    label: "Profil",
    icon: (
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" {...STROKE} aria-hidden="true">
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
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    function onHide(e: Event) {
      const ce = e as CustomEvent<{ hidden?: boolean }>;
      setHidden(Boolean(ce.detail?.hidden));
    }
    window.addEventListener("annikah:bottomnav", onHide as EventListener);
    return () => window.removeEventListener("annikah:bottomnav", onHide as EventListener);
  }, []);

  if (pathname.startsWith("/auth/") || pathname.startsWith("/adminpanel")) return null;
  if (pathname.startsWith("/chats/") && pathname !== "/chats") return null;
  if (pathname.startsWith("/help")) return null;
  if (hidden) return null;

  return (
    <nav
      aria-label="Pastki navigatsiya"
      className="fixed inset-x-0 bottom-0 z-50 md:hidden"
      style={{ paddingBottom: "calc(10px + env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto w-full max-w-lg px-3">
        <div
          className="rounded-[22px] p-1 ring-1 ring-white/40 shadow-[0_16px_44px_rgba(15,23,42,.16)] [backdrop-filter:blur(22px)_saturate(170%)] [-webkit-backdrop-filter:blur(22px)_saturate(170%)]"
          style={{ backgroundColor: "rgba(255,255,255,0.42)" }}
        >
          <div className="grid grid-cols-5 gap-0">
            {ITEMS.map((it) => {
              const active = isActive(pathname, it.href);
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  prefetch
                  aria-current={active ? "page" : undefined}
                  className={cls(
                    "flex flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 text-[9.5px] font-extrabold tracking-tight transition active:scale-[0.97]",
                    active ? "text-indigo-700" : "text-zinc-700/90",
                  )}
                >
                  <span
                    className={cls(
                      "grid h-9 w-9 place-items-center rounded-full transition",
                      active
                        ? "bg-white/75 ring-1 ring-white/55 shadow-[0_6px_18px_rgba(99,102,241,.18)]"
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
      </div>
    </nav>
  );
}
