import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  expiresForListingPlan,
  getListingPlan,
  getPricingConfig,
} from "@/lib/pricing";
import {
  sanitizeExtraListingPayload,
  validateExtraListingBusinessRules,
} from "@/lib/extraListingPayload";
import { saveVerificationPhoto } from "@/lib/verificationUpload";

export const runtime = "nodejs";

const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });

  const profile = await db.profile.findUnique({ where: { userId: user.id } });
  if (!profile?.isComplete) {
    return NextResponse.json({ error: "PROFILE_INCOMPLETE" }, { status: 400 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "BAD_FORM" }, { status: 400 });
  }

  const rawJson = form.get("data");
  if (typeof rawJson !== "string") {
    return NextResponse.json({ error: "BAD_PAYLOAD" }, { status: 400 });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    return NextResponse.json({ error: "BAD_JSON" }, { status: 400 });
  }

  const safe = sanitizeExtraListingPayload(parsed);
  const validationErr = validateExtraListingBusinessRules(safe);
  if (validationErr) {
    return NextResponse.json({ error: "VALIDATION", message: validationErr }, { status: 400 });
  }

  const file = form.get("verificationPhoto");
  if (!(file instanceof File) || file.size < 16) {
    return NextResponse.json({ error: "PHOTO_REQUIRED" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "PHOTO_TOO_LARGE" }, { status: 400 });
  }

  const mime = (file.type || "").toLowerCase();
  const buf = Buffer.from(await file.arrayBuffer());

  const cfg = await getPricingConfig();
  const plan = getListingPlan(cfg, safe.plan);
  const priceCents = plan.priceUzs;
  const expiresAt = expiresForListingPlan(plan);

  const listing = await db.listing.create({
    data: {
      ownerId: user.id,
      category: safe.listingCategory,
      active: false,
      moderationStatus: "pending",
      moderatedAt: null,
      priceCents,
      expiresAt,
      boostUntil: null,
      boostScore: 0,
      plan: safe.plan,
      verificationPhotoPath: null,
      verificationPhotoUploadedAt: null,
      name: safe.name,
      age: safe.age,
      country: safe.country,
      region: safe.region,
      city: safe.city,
      nationality: safe.nationality,
      heightCm: safe.heightCm,
      weightKg: safe.weightKg,
      smokes: safe.smokes === "yes" ? true : safe.smokes === "no" ? false : null,
      sportPerWeek: safe.sportPerWeek,
      maritalStatus: safe.maritalStatus,
      children: safe.children,
      polygamyAllowance: safe.polygamyAllowance,
      education: safe.education,
      jobTitle: safe.jobTitle,
      incomeMonthlyUsd: safe.incomeMonthlyUsd,
      aqeeda: safe.aqeeda,
      prayer: safe.prayer,
      quran: safe.quran,
      madhab: safe.madhab,
      partnerAgeFrom: safe.partnerAgeFrom,
      partnerAgeTo: safe.partnerAgeTo,
      partnerCountries: safe.partnerCountries.trim() || null,
      partnerRegions: safe.partnerRegions.trim() || null,
      partnerCities: safe.partnerCities.trim() || null,
      about: safe.about,
    },
    select: { id: true },
  });

  try {
    const rel = await saveVerificationPhoto(listing.id, buf, mime);
    await db.listing.update({
      where: { id: listing.id },
      data: {
        verificationPhotoPath: rel,
        verificationPhotoUploadedAt: new Date(),
      },
    });
  } catch (e) {
    await db.listing.delete({ where: { id: listing.id } }).catch(() => {});
    const msg = e instanceof Error && e.message === "UNSUPPORTED_IMAGE_TYPE" ? "PHOTO_TYPE" : "PHOTO_SAVE";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  return NextResponse.json({ ok: true, listingId: listing.id });
}
