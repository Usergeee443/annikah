"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type SidebarUser = { email: string; profileComplete: boolean };

type NavItem = {
  key: string;
  href: string;
  label: string;
  icon: React.ReactNode;
};

function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

const ICON = {
  search: (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  ),
  home: (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 11 9-8 9 8" />
      <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
    </svg>
  ),
  inbox: (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-6l-2 3h-4l-2-3H2" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  ),
  chat: (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a8 8 0 0 1-11.5 7.16L4 20l1-5A8 8 0 1 1 21 12z" />
    </svg>
  ),
  heart: (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 21s-7-4.35-9.5-9A5.5 5.5 0 0 1 12 6.5 5.5 5.5 0 0 1 21.5 12c-2.5 4.65-9.5 9-9.5 9z" />
    </svg>
  ),
  flame: (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2c1 4 6 5 6 11a6 6 0 1 1-12 0c0-3 1.5-4 3-5 1.5-1 2-3 3-6z" />
    </svg>
  ),
  user: (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  ),
  help: (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 1-1 1.7v.5M12 17h.01" />
    </svg>
  ),
  gear: (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </svg>
  ),
  logout: (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  ),
  chevronLeft: (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M14 6l-6 6 6 6" />
    </svg>
  ),
  chevronRight: (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M10 6l6 6-6 6" />
    </svg>
  ),
};

const NAV_TOP: NavItem[] = [
  { key: "home", href: "/", label: "E’lonlar", icon: ICON.home },
  { key: "requests", href: "/requests", label: "So‘rovlar", icon: ICON.inbox },
  { key: "chats", href: "/chats", label: "Chatlar", icon: ICON.chat },
  { key: "favorites", href: "/favorites", label: "Sevimlilar", icon: ICON.heart },
  { key: "ads", href: "/ads", label: "Reklama", icon: ICON.flame },
];

const NAV_BOTTOM: NavItem[] = [
  { key: "profile", href: "/profile", label: "Profil", icon: ICON.user },
];

export default function SidebarClient({ user }: { user: SidebarUser | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("annikah:sidebarCollapsed:v1");
      setCollapsed(raw === "1");
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        "annikah:sidebarCollapsed:v1",
        collapsed ? "1" : "0",
      );
    } catch {
      // ignore
    }
  }, [collapsed]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    router.refresh();
  }

  const initial = (user?.email?.[0] || "A").toUpperCase();

  return (
    <aside
      className={cn(
        "hidden lg:block lg:shrink-0",
        collapsed ? "lg:w-[72px]" : "lg:w-[248px]",
      )}
    >
      <div className="sticky top-5 h-[calc(100vh-2.5rem)]">
        <div className="flex h-full flex-col rounded-3xl bg-white p-3 ring-1 ring-zinc-200/80 shadow-[0_2px_28px_rgba(15,23,42,.04)]">
          {/* Top: logo + collapse */}
          <div
            className={cn(
              "flex items-center px-1 pt-1",
              collapsed ? "justify-center" : "justify-between gap-2",
            )}
          >
            <Link
              href="/"
              className={cn(
                "flex items-center gap-2 transition hover:opacity-90",
                collapsed && "hidden",
              )}
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-linear-to-br from-rose-500 via-fuchsia-500 to-pink-700 shadow-sm">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-white" fill="currentColor">
                  <path d="M12 21s-7-4.35-9.5-9A5.5 5.5 0 0 1 12 6.5 5.5 5.5 0 0 1 21.5 12c-2.5 4.65-9.5 9-9.5 9z" />
                </svg>
              </span>
              <span className="text-[15px] font-extrabold tracking-tight text-zinc-950">
                Annikah
              </span>
            </Link>

            {collapsed ? (
              <Link
                href="/"
                aria-label="Annikah"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-rose-500 via-fuchsia-500 to-pink-700 shadow-sm"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" fill="currentColor">
                  <path d="M12 21s-7-4.35-9.5-9A5.5 5.5 0 0 1 12 6.5 5.5 5.5 0 0 1 21.5 12c-2.5 4.65-9.5 9-9.5 9z" />
                </svg>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setCollapsed(true)}
                aria-label="Sidebar yig‘ish"
                title="Yig‘ish"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
              >
                {ICON.chevronLeft}
              </button>
            )}
          </div>

          {collapsed ? (
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              aria-label="Sidebar ochish"
              title="Ochish"
              className="mt-3 inline-flex h-8 w-full items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
            >
              {ICON.chevronRight}
            </button>
          ) : null}

          {/* Main nav */}
          <nav
            className={cn(
              "grid gap-0.5",
              collapsed ? "mt-2" : "mt-3",
            )}
          >
            {NAV_TOP.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "flex items-center rounded-xl transition",
                    collapsed ? "h-10 justify-center px-0" : "gap-3 px-3 py-2",
                    active
                      ? "bg-zinc-950 text-white"
                      : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950",
                  )}
                >
                  <span
                    className={cn(
                      "shrink-0",
                      active ? "text-white" : "text-zinc-500",
                    )}
                  >
                    {item.icon}
                  </span>
                  <span
                    className={cn(
                      "truncate text-[13px] font-bold tracking-tight",
                      collapsed && "sr-only",
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {!collapsed ? <div className="mx-1 mt-3 mb-1 h-px bg-zinc-100" /> : null}

          <nav className={cn("grid gap-0.5", collapsed && "mt-1")}>
            {NAV_BOTTOM.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "flex items-center rounded-xl transition",
                    collapsed ? "h-10 justify-center px-0" : "gap-3 px-3 py-2",
                    active
                      ? "bg-zinc-950 text-white"
                      : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950",
                  )}
                >
                  <span
                    className={cn(
                      "shrink-0",
                      active ? "text-white" : "text-zinc-500",
                    )}
                  >
                    {item.icon}
                  </span>
                  <span
                    className={cn(
                      "truncate text-[13px] font-bold tracking-tight",
                      collapsed && "sr-only",
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="flex-1" />

          {/* Promo / CTA */}
          {!collapsed && user ? (
            <div className="rounded-2xl bg-linear-to-br from-zinc-50 to-zinc-100 p-3.5 ring-1 ring-zinc-200">
              <div className="text-[12.5px] font-extrabold tracking-tight text-zinc-950">
                Yangi e’lon
              </div>
              <div className="mt-0.5 text-[11px] font-medium text-zinc-500">
                Oddiy yoki boost bilan joylang.
              </div>
              <Link
                href="/listings/new"
                className="mt-3 inline-flex h-9 w-full items-center justify-center rounded-xl bg-zinc-950 text-[12px] font-extrabold text-white transition hover:bg-zinc-800"
              >
                E’lon yaratish
              </Link>
            </div>
          ) : null}

          {/* User box */}
          <div className={cn(!collapsed && user ? "mt-3" : "mt-2")}>
            {user ? (
              <div
                className={cn(
                  "flex items-center rounded-2xl px-1 py-1",
                  collapsed && "justify-center px-0",
                )}
              >
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-rose-500 via-fuchsia-500 to-pink-700 text-[13px] font-extrabold text-white shadow-sm">
                  {initial}
                </span>
                {!collapsed ? (
                  <>
                    <div className="ml-2.5 min-w-0 flex-1">
                      <div className="truncate text-[12px] font-extrabold text-zinc-950">
                        {user.email}
                      </div>
                      <span
                        className={cn(
                          "mt-0.5 inline-flex items-center rounded-md px-1.5 py-px text-[9px] font-extrabold uppercase tracking-[0.18em]",
                          user.profileComplete
                            ? "bg-amber-100 text-amber-800"
                            : "bg-zinc-100 text-zinc-500",
                        )}
                      >
                        {user.profileComplete ? "Plus" : "Profil"}
                      </span>
                    </div>
                    <Link
                      href="/settings"
                      aria-label="Sozlamalar"
                      title="Sozlamalar"
                      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
                    >
                      {ICON.gear}
                    </Link>
                    <button
                      type="button"
                      onClick={logout}
                      aria-label="Chiqish"
                      title="Chiqish"
                      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
                    >
                      {ICON.logout}
                    </button>
                  </>
                ) : null}
              </div>
            ) : (
              <div
                className={cn(
                  "grid gap-1.5",
                  collapsed ? "grid-cols-1" : "grid-cols-2",
                )}
              >
                <Link
                  href="/auth/login"
                  className={cn(
                    "inline-flex h-9 items-center justify-center rounded-xl bg-zinc-100 text-[12px] font-extrabold text-zinc-900 hover:bg-zinc-200",
                    collapsed && "sr-only",
                  )}
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className={cn(
                    "inline-flex h-9 items-center justify-center rounded-xl bg-zinc-950 text-[12px] font-extrabold text-white hover:bg-zinc-800",
                    collapsed && "sr-only",
                  )}
                >
                  Kirish
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
