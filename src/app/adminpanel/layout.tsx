import Link from "next/link";
import { redirect } from "next/navigation";
import { clearAdminSession, getAdminSession, isModeratorOnly } from "@/lib/adminAuth";

const NAV_FULL: Array<{ href: string; label: string }> = [
  { href: "/adminpanel", label: "Statistika" },
  { href: "/adminpanel/users", label: "Foydalanuvchilar" },
  { href: "/adminpanel/listings", label: "E’lonlar" },
  { href: "/adminpanel/moderation", label: "Moderatsiya" },
  { href: "/adminpanel/support", label: "Support" },
  { href: "/adminpanel/pricing", label: "Narxlar" },
  { href: "/adminpanel/admins", label: "Adminlar" },
];

const NAV_MODERATOR: Array<{ href: string; label: string }> = [
  { href: "/adminpanel/moderation", label: "Moderatsiya" },
];

async function logoutAction() {
  "use server";
  await clearAdminSession();
  redirect("/adminpanel/login");
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  const nav = session && isModeratorOnly(session) ? NAV_MODERATOR : NAV_FULL;

  return (
    <div className="min-h-screen bg-[#f4f4f5]">
      <div className="mx-auto max-w-6xl px-4 py-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <Link href="/adminpanel" className="text-[16px] font-black tracking-tight text-zinc-950">
            Admin Panel
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            {session
              ? nav.map((it) => (
                  <Link
                    key={it.href}
                    href={it.href}
                    prefetch
                    className="inline-flex h-9 items-center justify-center rounded-2xl bg-white px-3 text-[12px] font-extrabold text-zinc-900 ring-1 ring-zinc-200 hover:bg-zinc-50"
                  >
                    {it.label}
                  </Link>
                ))
              : null}
            {session ? (
              <form action={logoutAction}>
                <span className="mr-2 hidden text-[11.5px] font-extrabold text-zinc-500 sm:inline">
                  {session.username}
                  {session.role === "super_admin"
                    ? " · katta admin"
                    : session.role === "moderator"
                      ? session.gender === "female"
                        ? " · moderator (ayol)"
                        : session.gender === "male"
                          ? " · moderator (erkak)"
                          : " · moderator"
                      : ""}
                </span>
                <button
                  type="submit"
                  className="inline-flex h-9 items-center justify-center rounded-2xl bg-rose-50 px-3 text-[12px] font-extrabold text-rose-700 ring-1 ring-rose-200 hover:bg-rose-100"
                >
                  Chiqish
                </button>
              </form>
            ) : (
              <Link
                href="/adminpanel/login"
                className="inline-flex h-9 items-center justify-center rounded-2xl bg-zinc-950 px-3 text-[12px] font-extrabold text-white ring-1 ring-black/10 hover:bg-zinc-900"
              >
                Kirish
              </Link>
            )}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
