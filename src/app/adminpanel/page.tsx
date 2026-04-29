import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { isAdminAuthed } from "@/lib/adminAuth";
import { getPricingConfig } from "@/lib/pricing";

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="rounded-3xl bg-white p-5 ring-1 ring-zinc-200/70 shadow-[0_8px_28px_rgba(15,23,42,.05)]">
      <div className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">{label}</div>
      <div className="mt-2 text-[26px] font-black tracking-tight text-zinc-950">{value}</div>
      {hint ? <div className="mt-1 text-[11.5px] font-medium text-zinc-500">{hint}</div> : null}
    </div>
  );
}

export default async function AdminPanelPage() {
  const authed = await isAdminAuthed();
  if (!authed) redirect("/adminpanel/login");

  const now = new Date();
  const [
    users,
    usersTelegram,
    listingsTotal,
    listingsActive,
    listingsPending,
    listingsBoosted,
    requestsTotal,
    chatsTotal,
    openThreads,
    adminCount,
    pricing,
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { authProvider: "telegram" } }),
    db.listing.count(),
    db.listing.count({
      where: { active: true, moderationStatus: "approved", expiresAt: { gt: now } },
    }),
    db.listing.count({ where: { moderationStatus: "pending" } }),
    db.listing.count({ where: { boostUntil: { gt: now } } }),
    db.request.count(),
    db.chat.count(),
    db.supportThread.count({ where: { status: "open" } }),
    db.adminUser.count().catch(() => 0),
    getPricingConfig(),
  ]);

  return (
    <div className="grid gap-4">
      <div className="rounded-3xl border border-zinc-200/70 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,.05)]">
        <div className="text-[11px] font-extrabold tracking-widest text-zinc-500">ADMINPANEL</div>
        <h1 className="mt-2 text-[26px] font-black tracking-tight text-zinc-950">Statistika</h1>
        <p className="mt-1 text-[13px] font-medium text-zinc-600">
          Asosiy ko‘rsatkichlar, narxlar va boshqaruv havolalari.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/adminpanel/users"
            className="inline-flex h-10 items-center justify-center rounded-2xl bg-zinc-950 px-4 text-[12px] font-extrabold text-white ring-1 ring-black/10 hover:bg-zinc-900"
          >
            Foydalanuvchilar
          </Link>
          <Link
            href="/adminpanel/listings"
            className="inline-flex h-10 items-center justify-center rounded-2xl bg-white px-4 text-[12px] font-extrabold text-zinc-900 ring-1 ring-zinc-200 hover:bg-zinc-50"
          >
            E’lonlar
          </Link>
          <Link
            href="/adminpanel/pricing"
            className="inline-flex h-10 items-center justify-center rounded-2xl bg-white px-4 text-[12px] font-extrabold text-zinc-900 ring-1 ring-zinc-200 hover:bg-zinc-50"
          >
            Narxlar
          </Link>
          <Link
            href="/adminpanel/admins"
            className="inline-flex h-10 items-center justify-center rounded-2xl bg-white px-4 text-[12px] font-extrabold text-zinc-900 ring-1 ring-zinc-200 hover:bg-zinc-50"
          >
            Adminlar
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Foydalanuvchilar" value={users} hint={`${usersTelegram} ta Telegram orqali`} />
        <Stat label="E’lonlar (jami)" value={listingsTotal} hint={`${listingsActive} ta aktiv`} />
        <Stat label="Boostda" value={listingsBoosted} hint="Faol reklama" />
        <Stat label="Moderatsiyada" value={listingsPending} hint="Tasdiqlash kutilmoqda" />
        <Stat label="So‘rovlar" value={requestsTotal} />
        <Stat label="Chatlar" value={chatsTotal} />
        <Stat label="Open support" value={openThreads} />
        <Stat label="Admin user’lar" value={adminCount} hint="DB’dagi adminlar" />
      </div>

      {/* Joriy tariflar va boost narxlari */}
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-3xl border border-zinc-200/70 bg-white p-5 ring-1 ring-zinc-200/70">
          <div className="flex items-center justify-between gap-2">
            <div className="text-[11px] font-extrabold tracking-widest text-zinc-500">TARIFLAR</div>
            <Link
              href="/adminpanel/pricing"
              className="text-[11.5px] font-extrabold text-zinc-700 hover:text-zinc-950"
            >
              O‘zgartirish →
            </Link>
          </div>
          <div className="mt-3 grid gap-2">
            {pricing.listingPlans.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 ring-1 ring-zinc-200"
              >
                <div className="min-w-0">
                  <div className="text-[13.5px] font-extrabold text-zinc-950">{p.title}</div>
                  <div className="text-[11.5px] font-semibold text-zinc-500">{p.days} kun</div>
                </div>
                <div className="text-[14px] font-black text-zinc-950">
                  {p.priceUzs.toLocaleString()} <span className="text-[11px] font-extrabold text-zinc-500">so‘m</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-200/70 bg-white p-5 ring-1 ring-zinc-200/70">
          <div className="flex items-center justify-between gap-2">
            <div className="text-[11px] font-extrabold tracking-widest text-zinc-500">REKLAMA (BOOST)</div>
            <Link
              href="/adminpanel/pricing"
              className="text-[11.5px] font-extrabold text-zinc-700 hover:text-zinc-950"
            >
              O‘zgartirish →
            </Link>
          </div>
          <div className="mt-3 grid gap-2">
            {pricing.boosts.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 ring-1 ring-zinc-200"
              >
                <div className="min-w-0">
                  <div className="text-[13.5px] font-extrabold text-zinc-950">{b.label}</div>
                  <div className="text-[11.5px] font-semibold text-zinc-500">{b.days} kun</div>
                </div>
                <div className="text-[14px] font-black text-zinc-950">
                  {b.priceUzs.toLocaleString()} <span className="text-[11px] font-extrabold text-zinc-500">so‘m</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
