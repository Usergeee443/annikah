import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import ExtraListingWizard from "@/components/ExtraListingWizard";
import ProfileGapsPanel from "@/components/ProfileGapsPanel";
import { getPricingConfig } from "@/lib/pricing";
import { computeProfileComplete } from "@/lib/profileCompleteness";

export default async function ExtraListingPage() {
  const user = await requireUser();
  const profile = await db.profile.findUnique({ where: { userId: user.id } });
  const initialPricing = await getPricingConfig();

  const profileComplete = profile ? computeProfileComplete(profile) : false;

  if (!profile || !profileComplete) {
    return (
      <div className="grid gap-5">
        <div className="rounded-3xl border border-zinc-200/70 bg-white/80 p-6 shadow-sm backdrop-blur">
          <div className="text-[11px] font-extrabold tracking-widest text-zinc-500">QO‘SHIMCHA E‘LON</div>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-zinc-950">Profilni yakunlang</h1>
          <p className="mt-1 max-w-2xl text-sm text-zinc-600">
            Faqat yetishmayotgan maydonlarni to‘ldiring — keyin qo‘shimcha e‘lon yaratishingiz mumkin.
          </p>
        </div>
        {profile ? (
          <ProfileGapsPanel profile={profile} />
        ) : (
          <div className="rounded-3xl border border-dashed border-zinc-300 bg-white/60 p-8 text-center">
            <p className="text-[13px] font-medium text-zinc-600">Avval asosiy profil ma’lumotlarini kiriting.</p>
            <Link
              href="/profile/wizard"
              className="mt-4 inline-flex h-11 items-center justify-center rounded-2xl bg-zinc-950 px-5 text-[12px] font-extrabold text-white"
            >
              Profilni boshlash
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <ExtraListingWizard
      initialProfile={profile}
      category={profile.category}
      plans={initialPricing.listingPlans.map((p) => ({
        id: p.id,
        title: p.title,
        days: p.days,
        priceUzs: p.priceUzs,
        badge: p.badge,
        description: p.description,
      }))}
    />
  );
}
