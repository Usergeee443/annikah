import { requireFullAdminPanelAccess } from "@/lib/adminAuth";
import { getPricingConfig } from "@/lib/pricing";
import PricingEditor from "@/components/admin/PricingEditor";

export default async function AdminPricingPage() {
  await requireFullAdminPanelAccess();

  const cfg = await getPricingConfig();

  return (
    <div className="grid gap-4">
      <div className="rounded-3xl border border-zinc-200/70 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,.05)]">
        <div className="text-[11px] font-extrabold tracking-widest text-zinc-500">NARXLAR</div>
        <h1 className="mt-2 text-[26px] font-black tracking-tight text-zinc-950">
          Tarif va reklama narxlari
        </h1>
        <p className="mt-1 max-w-2xl text-[13px] font-medium text-zinc-600">
          Bu yerdan e’lon joylash tarif paketlari va reklama (boost) paketlarining narxi va kunlarini
          o‘zgartirishingiz mumkin. Saqlangach, foydalanuvchilar yangi narxlarni ko‘radi.
        </p>
      </div>

      <PricingEditor initial={cfg} />
    </div>
  );
}
