import Link from "next/link";
import { requireFullAdminPanelAccess } from "@/lib/adminAuth";
import { db } from "@/lib/db";

type Search = {
  q?: string;
  provider?: string;
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  await requireFullAdminPanelAccess();

  const params = await searchParams;
  const q = (params.q || "").trim();
  const provider = params.provider === "telegram" || params.provider === "email" ? params.provider : "";

  const where: Record<string, unknown> = {};
  if (provider) where.authProvider = provider;
  if (q) {
    where.OR = [
      { email: { contains: q, mode: "insensitive" } },
      { phone: { contains: q } },
      { profile: { is: { name: { contains: q, mode: "insensitive" } } } },
    ];
  }

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true,
        email: true,
        phone: true,
        authProvider: true,
        createdAt: true,
        profile: { select: { name: true, age: true, category: true } },
        _count: { select: { listings: true, requestsSent: true } },
      },
    }),
    db.user.count({ where }),
  ]);

  return (
    <div className="grid gap-4">
      <div className="rounded-3xl border border-zinc-200/70 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,.05)]">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-[11px] font-extrabold tracking-widest text-zinc-500">FOYDALANUVCHILAR</div>
            <h1 className="mt-2 text-[26px] font-black tracking-tight text-zinc-950">Foydalanuvchilar</h1>
            <p className="mt-1 text-[13px] font-medium text-zinc-600">
              Jami: <span className="font-extrabold text-zinc-900">{total}</span>. Mos
              keladigan natijalar shu yerda.
            </p>
          </div>
        </div>

        <form method="GET" className="mt-4 grid gap-2 sm:grid-cols-[1fr_180px_140px]">
          <input
            name="q"
            defaultValue={q}
            placeholder="Email, telefon yoki ism bo‘yicha qidirish"
            className="h-11 rounded-2xl border border-zinc-200 bg-white px-4 text-[13px] font-semibold outline-none focus:border-zinc-300 focus:shadow-[0_0_0_4px_rgba(24,24,27,.06)]"
          />
          <select
            name="provider"
            defaultValue={provider}
            className="h-11 rounded-2xl border border-zinc-200 bg-white px-3 text-[13px] font-semibold outline-none"
          >
            <option value="">Barcha turlar</option>
            <option value="email">Email</option>
            <option value="telegram">Telegram</option>
          </select>
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-zinc-950 px-5 text-[12px] font-extrabold text-white ring-1 ring-black/10 hover:bg-zinc-900"
          >
            Qidirish
          </button>
        </form>
      </div>

      {users.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-zinc-300 bg-white p-8 text-center">
          <div className="text-[14px] font-extrabold text-zinc-950">Foydalanuvchi topilmadi</div>
        </div>
      ) : (
        <div className="grid gap-2">
          {users.map((u) => (
            <Link
              key={u.id}
              href={`/adminpanel/users/${u.id}`}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-200/70 bg-white p-4 transition hover:bg-white"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[14px] font-black tracking-tight text-zinc-950">
                    {u.profile?.name || u.email || u.phone || "—"}
                  </span>
                  <span
                    className={
                      "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.14em] ring-1 " +
                      (u.authProvider === "telegram"
                        ? "bg-sky-50 text-sky-800 ring-sky-200"
                        : "bg-zinc-100 text-zinc-700 ring-zinc-200")
                    }
                  >
                    {u.authProvider}
                  </span>
                  {u.profile?.category ? (
                    <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-amber-800 ring-1 ring-amber-200">
                      {u.profile.category}
                    </span>
                  ) : null}
                </div>
                <div className="mt-1 text-[12px] font-semibold text-zinc-600">
                  {u.email || "—"}
                  {u.phone ? <span> · {u.phone}</span> : null}
                  <span className="ml-2 text-zinc-400">
                    · {new Date(u.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-[11.5px] font-extrabold text-zinc-700">
                  E’lon: <span className="text-zinc-950">{u._count.listings}</span>
                </span>
                <span className="text-[11.5px] font-extrabold text-zinc-700">
                  So‘rov: <span className="text-zinc-950">{u._count.requestsSent}</span>
                </span>
                <span className="text-zinc-300">›</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
