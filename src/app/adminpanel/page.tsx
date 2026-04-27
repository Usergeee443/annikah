import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { isAdminAuthed } from "@/lib/adminAuth";

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-3xl bg-white/80 p-5 ring-1 ring-zinc-200/70 shadow-[0_8px_28px_rgba(15,23,42,.05)] backdrop-blur">
      <div className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">{label}</div>
      <div className="mt-2 text-[26px] font-black tracking-tight text-zinc-950">{value}</div>
    </div>
  );
}

export default async function AdminPanelPage() {
  const authed = await isAdminAuthed();
  if (!authed) redirect("/adminpanel/login");

  const [users, listings, requests, chats, openThreads] = await Promise.all([
    db.user.count(),
    db.listing.count(),
    db.request.count(),
    db.chat.count(),
    db.supportThread.count({ where: { status: "open" } }),
  ]);

  return (
    <div className="grid gap-4">
      <div className="rounded-3xl border border-zinc-200/70 bg-white/80 p-5 shadow-[0_8px_28px_rgba(15,23,42,.05)] backdrop-blur">
        <div className="text-[11px] font-extrabold tracking-widest text-zinc-500">ADMINPANEL</div>
        <h1 className="mt-2 text-[26px] font-black tracking-tight text-zinc-950">Statistika</h1>
        <p className="mt-1 text-[13px] font-medium text-zinc-600">
          Hozircha demo: support chatlar + asosiy sonlar.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/adminpanel/support"
            className="inline-flex h-10 items-center justify-center rounded-2xl bg-zinc-950 px-4 text-[12px] font-extrabold text-white ring-1 ring-black/10 hover:bg-zinc-900"
          >
            Support chatlarga o‘tish
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="Foydalanuvchilar" value={users} />
        <Stat label="E’lonlar" value={listings} />
        <Stat label="So‘rovlar" value={requests} />
        <Stat label="Chatlar" value={chats} />
        <Stat label="Open support" value={openThreads} />
      </div>
    </div>
  );
}

