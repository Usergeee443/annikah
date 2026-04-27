import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import ElonlarimDashboard, {
  type ElonlarimListingPayload,
  type ElonlarimProfilePayload,
} from "@/components/ElonlarimDashboard";

function toPayload(listings: Awaited<ReturnType<typeof db.listing.findMany>>): ElonlarimListingPayload[] {
  return listings.map((l) => ({
    id: l.id,
    createdAt: l.createdAt.toISOString(),
    updatedAt: l.updatedAt.toISOString(),
    expiresAt: l.expiresAt.toISOString(),
    boostUntil: l.boostUntil ? l.boostUntil.toISOString() : null,
    moderationStatus: l.moderationStatus,
    active: l.active,
    plan: l.plan,
    category: l.category,
    name: l.name,
    age: l.age,
    country: l.country,
    region: l.region,
    city: l.city,
    nationality: l.nationality,
    heightCm: l.heightCm,
    weightKg: l.weightKg,
    smokes: l.smokes,
    sportPerWeek: l.sportPerWeek,
    maritalStatus: l.maritalStatus,
    children: l.children,
    polygamyAllowance: l.polygamyAllowance,
    education: l.education,
    jobTitle: l.jobTitle,
    incomeMonthlyUsd: l.incomeMonthlyUsd,
    aqeeda: l.aqeeda,
    prayer: l.prayer,
    quran: l.quran,
    madhab: l.madhab,
    partnerAgeFrom: l.partnerAgeFrom,
    partnerAgeTo: l.partnerAgeTo,
    partnerCountries: l.partnerCountries,
    partnerRegions: l.partnerRegions,
    partnerCities: l.partnerCities,
    about: l.about,
  }));
}

export default async function ElonlarimPage() {
  const user = await requireUser();

  const profile = await db.profile.findUnique({ where: { userId: user.id } });
  const listings = await db.listing.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const profilePayload: ElonlarimProfilePayload | null = profile
    ? {
        category: profile.category,
        isComplete: profile.isComplete,
        name: profile.name,
        age: profile.age,
        country: profile.country,
        region: profile.region,
        city: profile.city,
        nationality: profile.nationality,
        heightCm: profile.heightCm,
        weightKg: profile.weightKg,
        jobTitle: profile.jobTitle,
        prayer: profile.prayer,
        maritalStatus: profile.maritalStatus,
      }
    : null;

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/listings/new/extra"
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-2xl bg-zinc-950 px-4 text-[12px] font-extrabold text-white ring-1 ring-black/10 hover:bg-zinc-900"
        >
          <span className="text-[15px] leading-none">+</span>
          E’lon qo‘shish
        </Link>
        <h1 className="text-[22px] font-black tracking-tight text-zinc-950 sm:text-[26px]">E’lonlarim</h1>
      </div>

      <ElonlarimDashboard
        listings={toPayload(listings)}
        profile={profilePayload}
        userEmail={user.email ?? ""}
      />
    </div>
  );
}
