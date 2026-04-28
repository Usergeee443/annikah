"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  icon: (active: boolean) => React.ReactNode;
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
    icon: () => (
      <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" {...STROKE} aria-hidden="true">
        <path d="m3 11 9-8 9 8" />
        <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
      </svg>
    ),
  },
  {
    href: "/requests",
    label: "So‘rovlar",
    icon: () => (
      <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" {...STROKE} aria-hidden="true">
        <path d="M22 12h-6l-2 3h-4l-2-3H2" />
        <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
      </svg>
    ),
  },
  {
    href: "/chats",
    label: "Chatlar",
    icon: () => (
      <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" {...STROKE} aria-hidden="true">
        <path d="M21 12a8 8 0 0 1-11.5 7.16L4 20l1-5A8 8 0 1 1 21 12z" />
      </svg>
    ),
  },
  {
    href: "/favorites",
    label: "Sevimli",
    icon: () => (
      <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" {...STROKE} aria-hidden="true">
        <path d="M12 21s-7-4.35-9.5-9A5.5 5.5 0 0 1 12 6.5 5.5 5.5 0 0 1 21.5 12c-2.5 4.65-9.5 9-9.5 9z" />
      </svg>
    ),
  },
  {
    href: "/profile",
    label: "Profil",
    icon: () => (
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

  if (pathname.startsWith("/auth/") || pathname.startsWith("/adminpanel")) return null;
  if (pathname.startsWith("/chats/") && pathname !== "/chats") return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 md:hidden" aria-label="Pastki menyu">
      <div
        className="mx-auto w-full max-w-md px-3"
        style={{ paddingBottom: "calc(14px + env(safe-area-inset-bottom))" }}
      >
        <div
          className="relative overflow-hidden rounded-full p-1.5 ring-1 ring-white/40 shadow-[0_22px_60px_rgba(15,23,42,.22),inset_0_1px_0_rgba(255,255,255,.6)] [backdrop-filter:blur(28px)_saturate(180%)] [-webkit-backdrop-filter:blur(28px)_saturate(180%)]"
          style={{ backgroundColor: "rgba(255,255,255,0.30)" }}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-2 top-0 h-1/2 rounded-t-full bg-linear-to-b from-white/40 to-transparent"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-white/20"
          />

          <div className="relative grid grid-cols-5">
            {ITEMS.map((it) => {
              const active = isActive(pathname, it.href);
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  aria-current={active ? "page" : undefined}
                  className={cls(
                    "group flex flex-col items-center justify-center gap-0.5 rounded-full px-1 py-1.5 text-[10.5px] font-extrabold tracking-tight transition",
                    active ? "text-indigo-700" : "text-zinc-700/85 hover:text-zinc-900",
                  )}
                >
                  <span
                    className={cls(
                      "grid h-11 w-11 place-items-center rounded-full transition",
                      active
                        ? "bg-white/72 ring-1 ring-white/55 shadow-[0_10px_30px_rgba(99,102,241,.25),inset_0_1px_0_rgba(255,255,255,.7)]"
                        : "bg-transparent group-hover:bg-white/30",
                    )}
                  >
                    {it.icon(active)}
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
