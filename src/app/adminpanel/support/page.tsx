import Link from "next/link";
import { db } from "@/lib/db";
import { requireFullAdminPanelAccess } from "@/lib/adminAuth";

type Search = { status?: string };

function fmtTime(d: Date) {
  return d.toLocaleString();
}

export default async function AdminSupportListPage({ searchParams }: { searchParams: Promise<Search> }) {
  await requireFullAdminPanelAccess();

  const sp = (await searchParams) || {};
  const status = sp.status === "closed" ? "closed" : "open";

  const threads = await db.supportThread.findMany({
    where: { status },
    orderBy: { updatedAt: "desc" },
    include: {
      user: { select: { email: true, profile: { select: { name: true } } } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    take: 200,
  });

  return (
    <div className="grid gap-4">
      <div className="rounded-3xl border border-zinc-200/70 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,.05)]">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-[11px] font-extrabold tracking-widest text-zinc-500">SUPPORT</div>
            <h1 className="mt-2 text-[26px] font-black tracking-tight text-zinc-950">Chatlar</h1>
            <p className="mt-1 text-[13px] font-medium text-zinc-600">
              Foydalanuvchilar Yordam sahifasidan yozgan xabarlar.
            </p>
          </div>
          <div className="inline-flex rounded-2xl bg-zinc-100/80 p-1 ring-1 ring-zinc-200">
            <Link
              href="/adminpanel/support?status=open"
              className={
                "inline-flex h-9 items-center justify-center rounded-xl px-4 text-[12px] font-extrabold tracking-tight transition " +
                (status === "open"
                  ? "bg-white text-zinc-950 shadow-sm ring-1 ring-zinc-200/80"
                  : "text-zinc-600 hover:text-zinc-900")
              }
            >
              Open
            </Link>
            <Link
              href="/adminpanel/support?status=closed"
              className={
                "inline-flex h-9 items-center justify-center rounded-xl px-4 text-[12px] font-extrabold tracking-tight transition " +
                (status === "closed"
                  ? "bg-white text-zinc-950 shadow-sm ring-1 ring-zinc-200/80"
                  : "text-zinc-600 hover:text-zinc-900")
              }
            >
              Closed
            </Link>
          </div>
        </div>
      </div>

      {threads.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-zinc-300 bg-white p-10 text-center shadow-[0_8px_28px_rgba(15,23,42,.05)]">
          <div className="text-[18px] font-black tracking-tight text-zinc-950">Hech narsa yo‘q</div>
          <div className="mt-1 text-[13px] font-medium text-zinc-600">
            {status === "open" ? "Ochiq support chat yo‘q." : "Yopilgan support chat yo‘q."}
          </div>
        </div>
      ) : (
        <div className="grid gap-3">
          {threads.map((t) => {
            const name = t.user.profile?.name || null;
            const email = t.user.email;
            const last = t.messages[0];
            return (
              <Link
                key={t.id}
                href={`/adminpanel/support/${t.id}`}
                className="block rounded-3xl border border-zinc-200/70 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,.05)] transition hover:shadow-[0_18px_36px_rgba(15,23,42,.10)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-[15px] font-black tracking-tight text-zinc-950">
                      {name || email}
                    </div>
                    <div className="mt-0.5 text-[12px] font-semibold text-zinc-600">{email}</div>
                    <div className="mt-2 line-clamp-2 text-[13px] text-zinc-800">
                      {last?.body || <span className="italic text-zinc-400">Hali xabar yo‘q</span>}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span
                      className={
                        "rounded-full px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em] ring-1 " +
                        (t.status === "open"
                          ? "bg-emerald-50 text-emerald-800 ring-emerald-200"
                          : "bg-zinc-100 text-zinc-700 ring-zinc-200")
                      }
                    >
                      {t.status}
                    </span>
                    <span className="text-[11px] font-bold text-zinc-500">{fmtTime(t.updatedAt)}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

