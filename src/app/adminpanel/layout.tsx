import Link from "next/link";
import { isAdminAuthed } from "@/lib/adminAuth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authed = await isAdminAuthed();

  return (
    <div className="min-h-screen bg-[#f4f4f5]">
      <div className="mx-auto max-w-6xl px-4 py-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <Link href="/adminpanel" className="text-[16px] font-black tracking-tight text-zinc-950">
            Admin Panel
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/adminpanel"
              className="inline-flex h-9 items-center justify-center rounded-2xl bg-white px-3 text-[12px] font-extrabold text-zinc-900 ring-1 ring-zinc-200 hover:bg-zinc-50"
            >
              Statistika
            </Link>
            <Link
              href="/adminpanel/support"
              className="inline-flex h-9 items-center justify-center rounded-2xl bg-white px-3 text-[12px] font-extrabold text-zinc-900 ring-1 ring-zinc-200 hover:bg-zinc-50"
            >
              Support chatlar
            </Link>
            <Link
              href="/adminpanel/moderation"
              className="inline-flex h-9 items-center justify-center rounded-2xl bg-white px-3 text-[12px] font-extrabold text-zinc-900 ring-1 ring-zinc-200 hover:bg-zinc-50"
            >
              Moderatsiya
            </Link>
            {authed ? (
              <form
                action={async () => {
                  "use server";
                  await fetch("/api/admin/auth/logout", { method: "POST" }).catch(() => null);
                }}
              >
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

