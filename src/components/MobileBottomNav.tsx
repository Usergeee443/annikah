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

const ITEMS: NavItem[] = [
  {
    href: "/",
    label: "Bosh sahifa",
    icon: (active) => (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <path
          d="M3 10.5L12 3l9 7.5V21a1.5 1.5 0 0 1-1.5 1.5H4.5A1.5 1.5 0 0 1 3 21V10.5z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
          className={active ? "opacity-100" : "opacity-80"}
        />
        <path
          d="M9.5 22V14.5h5V22"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={active ? "opacity-100" : "opacity-80"}
        />
      </svg>
    ),
  },
  {
    href: "/listings",
    label: "E’lonlar",
    icon: (active) => (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <path
          d="M7 8h10M7 12h10M7 16h7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
          className={active ? "opacity-100" : "opacity-80"}
        />
      </svg>
    ),
  },
  {
    href: "/chats",
    label: "Chat",
    icon: (active) => (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <path
          d="M20 14a4 4 0 0 1-4 4H9l-5 3V6a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
          className={active ? "opacity-100" : "opacity-80"}
        />
        <path
          d="M8 8h8M8 12h6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    href: "/requests",
    label: "So‘rov",
    icon: (active) => (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <path
          d="M7 4h10v16H7z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
          className={active ? "opacity-100" : "opacity-80"}
        />
        <path
          d="M9 8h6M9 12h6M9 16h4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    href: "/profile",
    label: "Profil",
    icon: (active) => (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <path
          d="M20 21a8 8 0 0 0-16 0"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M12 12a4.5 4.5 0 1 0-4.5-4.5A4.5 4.5 0 0 0 12 12z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
          className={active ? "opacity-100" : "opacity-80"}
        />
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

  // Auth/admin sahifalarda ko‘rsatmaymiz
  if (pathname.startsWith("/auth/") || pathname.startsWith("/adminpanel")) return null;

  return (
    <nav
      className={cls(
        "fixed inset-x-0 bottom-0 z-50 border-t border-zinc-200/70 bg-white/90 backdrop-blur supports-backdrop-filter:bg-white/70",
        "md:hidden",
      )}
      style={{
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
      aria-label="Pastki menyu"
    >
      <div className="mx-auto grid max-w-md grid-cols-5 px-2 py-2">
        {ITEMS.map((it) => {
          const active = isActive(pathname, it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              className={cls(
                "flex flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-[10px] font-extrabold tracking-tight transition",
                active ? "text-zinc-950" : "text-zinc-500 hover:text-zinc-800",
              )}
            >
              <span
                className={cls(
                  "grid h-9 w-9 place-items-center rounded-2xl",
                  active ? "bg-zinc-950 text-white shadow-sm" : "bg-transparent",
                )}
              >
                {it.icon(active)}
              </span>
              <span className="leading-none">{it.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

