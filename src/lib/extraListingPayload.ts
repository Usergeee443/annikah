import type { ListingPlanId } from "@/lib/pricing";

export type ExtraListingFormPayload = {
  listingCategory: string;
  name: string;
  age: number;
  country: string;
  region: string;
  city: string;
  nationality: string;
  heightCm: number;
  weightKg: number;
  jobTitle: string;
  about: string;
  aqeeda: string;
  prayer: string;
  quran: string;
  madhab: string;
  maritalStatus: string;
  children: string;
  smokes: "" | "yes" | "no";
  sportPerWeek: number | null;
  incomeMonthlyUsd: number | null;
  polygamyAllowance: number | null;
  education: string;
  partnerAgeFrom: number | null;
  partnerAgeTo: number | null;
  partnerCountries: string;
  partnerRegions: string;
  partnerCities: string;
  plan: ListingPlanId;
};

export function sanitizeExtraListingPayload(data: unknown): ExtraListingFormPayload {
  const d = data as Record<string, unknown>;
  const listingCategory = String(d?.listingCategory || "") === "kuyovlar" ? "kuyovlar" : "kelinlar";

  return {
    listingCategory,
    name: String(d?.name || "").trim(),
    age: Math.max(18, Math.min(80, Number(d?.age || 0))),
    country: String(d?.country || "").trim(),
    region: String(d?.region || "").trim(),
    city: String(d?.city || "").trim(),
    nationality: String(d?.nationality || "").trim(),
    heightCm: Math.max(140, Math.min(220, Number(d?.heightCm || 0))),
    weightKg: Math.max(35, Math.min(180, Number(d?.weightKg || 0))),
    smokes: d?.smokes === "yes" ? "yes" : d?.smokes === "no" ? "no" : "",
    sportPerWeek:
      d?.sportPerWeek === null || d?.sportPerWeek === undefined || d?.sportPerWeek === ""
        ? null
        : Math.max(0, Math.floor(Number(d?.sportPerWeek || 0))),
    maritalStatus: String(d?.maritalStatus || "bilinmaydi").trim(),
    children: String(d?.children || "bilinmaydi").trim(),
    polygamyAllowance:
      listingCategory !== "kelinlar" ||
      d?.polygamyAllowance === null ||
      d?.polygamyAllowance === undefined ||
      d?.polygamyAllowance === ""
        ? null
        : Math.max(1, Math.floor(Number(d?.polygamyAllowance || 1))),
    education: String(d?.education || "bilinmaydi").trim(),
    jobTitle: String(d?.jobTitle || "").trim(),
    incomeMonthlyUsd:
      d?.incomeMonthlyUsd === null || d?.incomeMonthlyUsd === undefined || d?.incomeMonthlyUsd === ""
        ? null
        : Math.max(0, Math.floor(Number(d?.incomeMonthlyUsd || 0))),
    aqeeda: String(d?.aqeeda || "bilinmaydi").trim(),
    prayer: String(d?.prayer || "bilinmaydi").trim(),
    quran: String(d?.quran || "bilinmaydi").trim(),
    madhab: String(d?.madhab || "bilinmaydi").trim(),
    partnerAgeFrom:
      d?.partnerAgeFrom === null || d?.partnerAgeFrom === undefined || d?.partnerAgeFrom === ""
        ? null
        : Math.max(0, Math.floor(Number(d?.partnerAgeFrom || 0))),
    partnerAgeTo:
      d?.partnerAgeTo === null || d?.partnerAgeTo === undefined || d?.partnerAgeTo === ""
        ? null
        : Math.max(0, Math.floor(Number(d?.partnerAgeTo || 0))),
    partnerCountries: String(d?.partnerCountries || "").trim() || "",
    partnerRegions: String(d?.partnerRegions || "").trim() || "",
    partnerCities: String(d?.partnerCities || "").trim() || "",
    about: String(d?.about || "").trim(),
    plan: String(d?.plan || "month1") as ListingPlanId,
  };
}

export function validateExtraListingBusinessRules(safe: ExtraListingFormPayload): string | null {
  if (
    safe.name.trim().length < 2 ||
    safe.age < 18 ||
    !safe.country ||
    !safe.region ||
    !safe.city ||
    !safe.nationality ||
    safe.heightCm < 140 ||
    safe.weightKg < 35 ||
    !safe.jobTitle.trim() ||
    safe.about.trim().length < 20 ||
    (safe.smokes !== "yes" && safe.smokes !== "no") ||
    !safe.maritalStatus ||
    safe.maritalStatus === "bilinmaydi" ||
    (safe.children !== "yoq" && safe.children !== "bor") ||
    !safe.education ||
    safe.education === "bilinmaydi" ||
    !safe.aqeeda.trim() ||
    !safe.prayer.trim() ||
    !safe.quran.trim() ||
    !safe.madhab.trim()
  ) {
    return "Ma’lumotlar to‘liq emas.";
  }
  return null;
}
