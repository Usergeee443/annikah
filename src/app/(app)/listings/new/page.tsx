import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

type Plan = "days15" | "month1" | "months3";

const PLANS: Array<{
  id: Plan;
  title: string;
  days: number;
  priceUzs: number;
  badge?: string;
}> = [
  { id: "days15", title: "15 kun", days: 15, priceUzs: 39000 },
  { id: "month1", title: "1 oy", days: 30, priceUzs: 69000, badge: "Mashhur" },
  { id: "months3", title: "3 oy", days: 90, priceUzs: 159000, badge: "Eng tejamli" },
];

function priceForPlan(plan: Plan) {
  if (plan === "days15") return 3900;
  if (plan === "month1") return 6900;
  return 15900;
}

function expiresForPlan(plan: Plan) {
  const d = new Date();
  if (plan === "days15") d.setDate(d.getDate() + 15);
  else if (plan === "month1") d.setMonth(d.getMonth() + 1);
  else d.setMonth(d.getMonth() + 3);
  return d;
}

export default async function NewListingPage() {
  const user = await requireUser();
  const profile = await db.profile.findUnique({ where: { userId: user.id } });
  if (!profile?.isComplete) {
    redirect("/profile/wizard");
  }

  async function create(formData: FormData) {
    "use server";
    const user = await requireUser();
    const profile = await db.profile.findUnique({ where: { userId: user.id } });
    if (!profile?.isComplete) redirect("/profile/wizard");

    const plan = (String(formData.get("plan") || "month1") as Plan);

    const priceCents = priceForPlan(plan);
    const expiresAt = expiresForPlan(plan);

    const listing = await db.listing.create({
      data: {
        ownerId: user.id,
        category: profile.category || "kelinlar",
        active: false,
        moderationStatus: "pending",
        moderatedAt: null,
        plan,
        priceCents,
        expiresAt,
        boostUntil: null,
        boostScore: 0,

        name: profile.name,
        age: profile.age,
        country: profile.country,
        region: profile.region,
        city: profile.city,
        nationality: profile.nationality,
        heightCm: profile.heightCm,
        weightKg: profile.weightKg,
        smokes: profile.smokes,
        sportPerWeek: profile.sportPerWeek,
        maritalStatus: profile.maritalStatus,
        children: profile.children,
        polygamyAllowance: profile.polygamyAllowance,
        education: profile.education,
        jobTitle: profile.jobTitle,
        incomeMonthlyUsd: profile.incomeMonthlyUsd,
        aqeeda: profile.aqeeda,
        prayer: profile.prayer,
        quran: profile.quran,
        madhab: profile.madhab,
        partnerAgeFrom: profile.partnerAgeFrom,
        partnerAgeTo: profile.partnerAgeTo,
        partnerCountries: profile.partnerCountries,
        partnerRegions: profile.partnerRegions,
        partnerCities: profile.partnerCities,
        about: profile.about,
      },
      select: { id: true },
    });

    redirect(`/listings/${listing.id}`);
  }

  return (
    <div className="grid gap-6">
      <div className="rounded-3xl border border-zinc-200/70 bg-white/80 p-6 shadow-sm backdrop-blur">
        <div className="text-[11px] font-extrabold tracking-widest text-zinc-500">E’LON BERISH</div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-zinc-950 sm:text-3xl">
          Tarifni tanlang
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-zinc-600">
          Profilingizdagi ma’lumotlar e’longa snapshot sifatida olinadi. Bu sahifada faqat tarif tanlanadi.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/profile/wizard"
            className="inline-flex h-9 items-center justify-center rounded-2xl bg-white px-3 text-[12px] font-extrabold text-zinc-900 ring-1 ring-zinc-200 hover:bg-zinc-50"
          >
            Profilni tekshirish
          </Link>
        </div>
      </div>

      <form action={create} className="grid gap-4">
        <div className="rounded-3xl border border-zinc-200/70 bg-white/80 p-6 shadow-sm backdrop-blur">
          <div className="text-[12px] font-extrabold tracking-tight text-zinc-950">Tarif</div>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {PLANS.map((p, idx) => (
              <label
                key={p.id}
                className="relative flex cursor-pointer flex-col rounded-2xl border border-zinc-200 bg-white p-4 transition has-checked:border-zinc-950 has-checked:shadow-[inset_0_0_0_1px_rgba(0,0,0,1)]"
              >
                {p.badge ? (
                  <span className="absolute right-3 top-3 inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-extrabold text-amber-800 ring-1 ring-amber-200">
                    {p.badge}
                  </span>
                ) : null}
                <div className="text-[14px] font-extrabold tracking-tight text-zinc-950">{p.title}</div>
                <div className="mt-1 text-[11px] font-bold text-zinc-600">{p.days} kun ko‘rinadi</div>
                <div className="mt-1 text-[11px] font-semibold text-zinc-500">
                  {p.id === "days15"
                    ? "Tez start · oddiy joylash"
                    : p.id === "month1"
                      ? "Eng mashhur · balans"
                      : "Ko‘p ko‘rinish · tejamli"}
                </div>
                <div className="mt-3 text-xl font-extrabold tracking-tight text-zinc-950">
                  {p.priceUzs.toLocaleString()} <span className="text-[12px] font-bold text-zinc-600">so‘m</span>
                </div>
                <input
                  type="radio"
                  name="plan"
                  value={p.id}
                  defaultChecked={idx === 1}
                  className="absolute opacity-0"
                />
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-white px-5 text-[12px] font-extrabold text-zinc-900 ring-1 ring-zinc-200 hover:bg-zinc-50"
          >
            Bekor qilish
          </Link>
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-zinc-950 px-6 text-[12px] font-extrabold text-white shadow-sm ring-1 ring-black/10 hover:bg-zinc-900"
          >
            E’lonni joylash
          </button>
        </div>
      </form>
    </div>
  );
}
