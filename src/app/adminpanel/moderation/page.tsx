import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthed } from "@/lib/adminAuth";
import { db } from "@/lib/db";

function badge(status: string) {
  if (status === "pending") return "bg-amber-50 text-amber-800 ring-amber-200";
  if (status === "approved") return "bg-emerald-50 text-emerald-800 ring-emerald-200";
  return "bg-rose-50 text-rose-800 ring-rose-200";
}

export default async function ModerationPage() {
  const authed = await isAdminAuthed();
  if (!authed) redirect("/adminpanel/login");

  const pending = await db.listing.findMany({
    where: { moderationStatus: "pending" },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="grid gap-4">
      <div className="rounded-3xl border border-zinc-200/70 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,.05)]">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-[11px] font-extrabold tracking-widest text-zinc-500">MODERATSIYA</div>
            <h1 className="mt-2 text-[26px] font-black tracking-tight text-zinc-950">
              Tasdiqlash uchun e’lonlar
            </h1>
            <p className="mt-1 text-[13px] font-medium text-zinc-600">
              Yangi e’lonlar avval moderatsiyadan o‘tadi. Tasdiqlangandan keyin e’lon active bo‘ladi.
            </p>
          </div>
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10.5px] font-extrabold tracking-widest text-zinc-600 ring-1 ring-zinc-200">
            {pending.length} ta pending
          </span>
        </div>
      </div>

      {pending.length === 0 ? (
        <div className="flex min-h-[calc(100dvh-14rem)] items-center justify-center text-center">
          <div>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-zinc-100 ring-1 ring-zinc-200">
              <svg viewBox="0 0 24 24" className="h-7 w-7 text-zinc-600" fill="none">
                <path
                  d="M12 2 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinejoin="round"
                />
                <path
                  d="M9 12l2 2 4-4"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="mt-4 text-[16px] font-black tracking-tight text-zinc-950">
              Pending e’lonlar yo‘q
            </div>
            <div className="mt-1 text-[13px] font-medium text-zinc-600">
              Yangi e’lon yaratilsa, shu yerga tushadi.
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-3">
          {pending.map((l) => (
            <div
              key={l.id}
              className="rounded-3xl border border-zinc-200/70 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,.05)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="truncate text-[16px] font-black tracking-tight text-zinc-950">
                      {l.name} · {l.age} yosh
                    </div>
                    <span
                      className={
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.14em] ring-1 " +
                        badge(l.moderationStatus)
                      }
                    >
                      {l.moderationStatus}
                    </span>
                    <span
                      className={
                        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-extrabold ring-1 " +
                        (l.category === "kelinlar"
                          ? "bg-rose-50 text-rose-800 ring-rose-200"
                          : "bg-sky-50 text-sky-800 ring-sky-200")
                      }
                    >
                      {l.category === "kelinlar" ? "Kelin" : "Kuyov"}
                    </span>
                  </div>
                  <div className="mt-1 text-[13px] font-medium text-zinc-600">
                    {l.region}, {l.city} · {l.country}
                  </div>
                  <div className="mt-2 text-[12px] font-semibold text-zinc-500">
                    Yaratildi: {new Date(l.createdAt).toLocaleString()}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/listings/${l.id}`}
                    className="inline-flex h-10 items-center justify-center rounded-2xl bg-white px-4 text-[12px] font-extrabold text-zinc-900 ring-1 ring-zinc-200 hover:bg-zinc-50"
                  >
                    Ko‘rish
                  </Link>
                  <form
                    action={async () => {
                      "use server";
                      const ok = await isAdminAuthed();
                      if (!ok) redirect("/adminpanel/login");
                      await db.listing.update({
                        where: { id: l.id },
                        data: { moderationStatus: "approved", moderatedAt: new Date(), active: true },
                      });
                    }}
                  >
                    <button
                      type="submit"
                      className="inline-flex h-10 items-center justify-center rounded-2xl bg-emerald-600 px-4 text-[12px] font-extrabold text-white ring-1 ring-emerald-700/20 hover:bg-emerald-700"
                    >
                      Tasdiqlash
                    </button>
                  </form>
                  <form
                    action={async () => {
                      "use server";
                      const ok = await isAdminAuthed();
                      if (!ok) redirect("/adminpanel/login");
                      await db.listing.update({
                        where: { id: l.id },
                        data: { moderationStatus: "rejected", moderatedAt: new Date(), active: false },
                      });
                    }}
                  >
                    <button
                      type="submit"
                      className="inline-flex h-10 items-center justify-center rounded-2xl bg-rose-600 px-4 text-[12px] font-extrabold text-white ring-1 ring-rose-700/20 hover:bg-rose-700"
                    >
                      Rad etish
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

