import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import ExtraListingWizard from "@/components/ExtraListingWizard";
import { getPricingConfig } from "@/lib/pricing";

export default async function ExtraListingPage() {
  const user = await requireUser();
  const profile = await db.profile.findUnique({ where: { userId: user.id } });
  if (!profile?.isComplete) redirect("/profile/wizard");

  const initialPricing = await getPricingConfig();

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
