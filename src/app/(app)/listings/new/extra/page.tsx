import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import ExtraListingWizard from "@/components/ExtraListingWizard";

export default async function ExtraListingPage() {
  const user = await requireUser();
  const profile = await db.profile.findUnique({ where: { userId: user.id } });
  if (!profile?.isComplete) redirect("/profile");

  async function create(data: any) {
    "use server";
    const user = await requireUser();
    const profile = await db.profile.findUnique({ where: { userId: user.id } });
    if (!profile?.isComplete) redirect("/profile");

    // sanitize
    const safe = {
      name: String(data?.name || "").trim(),
      age: Math.max(18, Math.min(80, Number(data?.age || 0))),
      country: String(data?.country || "").trim(),
      region: String(data?.region || "").trim(),
      city: String(data?.city || "").trim(),
      nationality: String(data?.nationality || "").trim(),
      heightCm: Math.max(140, Math.min(220, Number(data?.heightCm || 0))),
      weightKg: Math.max(35, Math.min(180, Number(data?.weightKg || 0))),
      smokes: data?.smokes === "yes" ? true : data?.smokes === "no" ? false : null,
      sportPerWeek:
        data?.sportPerWeek === null || data?.sportPerWeek === undefined || data?.sportPerWeek === ""
          ? null
          : Math.max(0, Math.floor(Number(data?.sportPerWeek || 0))),
      maritalStatus: String(data?.maritalStatus || "bilinmaydi").trim(),
      children: String(data?.children || "bilinmaydi").trim(),
      polygamyAllowance:
        data?.polygamyAllowance === null || data?.polygamyAllowance === undefined || data?.polygamyAllowance === ""
          ? null
          : Math.max(1, Math.floor(Number(data?.polygamyAllowance || 1))),
      education: String(data?.education || "bilinmaydi").trim(),
      jobTitle: String(data?.jobTitle || "").trim(),
      incomeMonthlyUsd:
        data?.incomeMonthlyUsd === null || data?.incomeMonthlyUsd === undefined || data?.incomeMonthlyUsd === ""
          ? null
          : Math.max(0, Math.floor(Number(data?.incomeMonthlyUsd || 0))),
      aqeeda: String(data?.aqeeda || "bilinmaydi").trim(),
      prayer: String(data?.prayer || "bilinmaydi").trim(),
      quran: String(data?.quran || "bilinmaydi").trim(),
      madhab: String(data?.madhab || "bilinmaydi").trim(),
      partnerAgeFrom:
        data?.partnerAgeFrom === null || data?.partnerAgeFrom === undefined || data?.partnerAgeFrom === ""
          ? null
          : Math.max(0, Math.floor(Number(data?.partnerAgeFrom || 0))),
      partnerAgeTo:
        data?.partnerAgeTo === null || data?.partnerAgeTo === undefined || data?.partnerAgeTo === ""
          ? null
          : Math.max(0, Math.floor(Number(data?.partnerAgeTo || 0))),
      partnerCountries: String(data?.partnerCountries || "").trim() || null,
      partnerRegions: String(data?.partnerRegions || "").trim() || null,
      partnerCities: String(data?.partnerCities || "").trim() || null,
      about: String(data?.about || "").trim(),
      plan: String(data?.plan || "month1") as "days15" | "month1" | "months3",
    };

    const priceCents =
      safe.plan === "days15" ? 3900 : safe.plan === "month1" ? 6900 : 15900;
    const expiresAt = (() => {
      const d = new Date();
      if (safe.plan === "days15") d.setDate(d.getDate() + 15);
      else if (safe.plan === "month1") d.setMonth(d.getMonth() + 1);
      else d.setMonth(d.getMonth() + 3);
      return d;
    })();

    const listing = await db.listing.create({
      data: {
        ownerId: user.id,
        category: profile.category || "kelinlar",
        active: false,
        moderationStatus: "pending",
        moderatedAt: null,
        priceCents,
        expiresAt,
        boostUntil: null,
        boostScore: 0,
        ...safe,
        // fix nullable fields
        smokes: safe.smokes,
        sportPerWeek: safe.sportPerWeek,
        polygamyAllowance: safe.polygamyAllowance,
        incomeMonthlyUsd: safe.incomeMonthlyUsd,
        partnerCountries: safe.partnerCountries,
        partnerRegions: safe.partnerRegions,
        partnerCities: safe.partnerCities,
      },
      select: { id: true },
    });

    redirect(`/listings/${listing.id}`);
  }

  return <ExtraListingWizard initialProfile={profile} category={profile.category} onCreate={create} />;
}

