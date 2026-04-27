import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  const url = new URL(req.url);
  if (!user) return NextResponse.redirect(new URL("/auth/login", url.origin));

  const { id } = await ctx.params;
  const listing = await db.listing.findUnique({ where: { id } });
  if (!listing) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  if (listing.ownerId !== user.id) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const profile = await db.profile.findUnique({ where: { userId: user.id } });
  if (!profile?.isComplete) return NextResponse.redirect(new URL("/profile", url.origin));

  await db.listing.update({
    where: { id },
    data: {
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
  });

  return NextResponse.redirect(new URL("/elonlarim", url.origin));
}

