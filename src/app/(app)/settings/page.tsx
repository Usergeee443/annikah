import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

function Row({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white/70 p-4 ring-1 ring-zinc-200">
      <div className="min-w-0">
        <div className="text-[13px] font-extrabold tracking-tight text-zinc-950">{title}</div>
        <div className="mt-0.5 text-[12px] text-zinc-600">{description}</div>
      </div>
      <div>{action}</div>
    </div>
  );
}

export default async function SettingsPage() {
  const user = await requireUser();
  const profile = await db.profile.findUnique({ where: { userId: user.id } });
  const counts = await db.$transaction([
    db.listing.count({ where: { ownerId: user.id } }),
    db.favorite.count({ where: { userId: user.id } }),
    db.request.count({ where: { OR: [{ fromUserId: user.id }, { toUserId: user.id }] } }),
    db.chat.count({ where: { OR: [{ userAId: user.id }, { userBId: user.id }] } }),
  ]);

  return (
    <div className="grid gap-6">
      <div className="rounded-3xl border border-zinc-200/70 bg-white/80 p-6 shadow-sm backdrop-blur">
        <div className="text-[11px] font-extrabold tracking-widest text-zinc-500">SOZLAMALAR</div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-zinc-950 sm:text-3xl">
          Hisob va xavfsizlik
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          Hisob ma’lumotlari, profil holati va statistikangizni ko‘ring. Yangi sozlamalar tez orada
          qo‘shiladi.
        </p>
      </div>

      <div className="grid gap-3">
        <Row
          title="Email"
          description={user.email}
          action={
            <span className="inline-flex h-9 items-center rounded-2xl bg-emerald-50 px-3 text-[12px] font-extrabold text-emerald-800 ring-1 ring-emerald-200">
              Tasdiqlangan
            </span>
          }
        />
        <Row
          title="Profil holati"
          description={profile?.isComplete ? "To‘liq to‘ldirilgan" : "Profilingizni to‘liq to‘ldiring"}
          action={
            <Link
              href="/profile"
              className="inline-flex h-9 items-center justify-center rounded-2xl bg-zinc-950 px-3 text-[12px] font-extrabold text-white ring-1 ring-black/10 hover:bg-zinc-900"
            >
              {profile?.isComplete ? "Tahrirlash" : "To‘ldirish"}
            </Link>
          }
        />
        <Row
          title="Til"
          description="Hozircha O‘zbekcha. Boshqa tillar tez orada qo‘shiladi."
          action={
            <span className="inline-flex h-9 items-center rounded-2xl bg-zinc-100 px-3 text-[12px] font-extrabold text-zinc-700 ring-1 ring-zinc-200">
              O‘zbekcha
            </span>
          }
        />
      </div>

      <div className="rounded-3xl border border-zinc-200/70 bg-white/80 p-6 shadow-sm backdrop-blur">
        <div className="text-[12px] font-extrabold tracking-tight text-zinc-950">Statistika</div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="E’lonlar" value={counts[0]} />
          <Stat label="Sevimlilar" value={counts[1]} />
          <Stat label="So‘rovlar" value={counts[2]} />
          <Stat label="Chatlar" value={counts[3]} />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-zinc-200">
      <div className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">{label}</div>
      <div className="mt-1 text-2xl font-extrabold tracking-tight text-zinc-950">{value}</div>
    </div>
  );
}
