/** Profil maydonlari — wizard va API bilan bir xil. */
export type ProfileShape = {
  category?: string | null;
  name?: string | null;
  age?: number | null;
  country?: string | null;
  region?: string | null;
  city?: string | null;
  nationality?: string | null;
  heightCm?: number | null;
  weightKg?: number | null;
  smokes?: boolean | null;
  sportPerWeek?: number | null;
  maritalStatus?: string | null;
  children?: string | null;
  polygamyAllowance?: number | null;
  education?: string | null;
  jobTitle?: string | null;
  incomeMonthlyUsd?: number | null;
  aqeeda?: string | null;
  prayer?: string | null;
  quran?: string | null;
  madhab?: string | null;
  partnerAgeFrom?: number | null;
  partnerAgeTo?: number | null;
  partnerCountries?: string | null;
  partnerRegions?: string | null;
  partnerCities?: string | null;
  about?: string | null;
  isComplete?: boolean;
};

export type ProfileGapField =
  | "category"
  | "name"
  | "age"
  | "country"
  | "region"
  | "city"
  | "nationality"
  | "heightCm"
  | "weightKg"
  | "jobTitle"
  | "about"
  | "aqeeda"
  | "prayer"
  | "quran"
  | "madhab";

export type ProfileGap = {
  field: ProfileGapField;
  label: string;
  group: string;
  wizardStep: string;
};

const BILINMAYDI = new Set(["bilinmaydi", ""]);

function isBlank(v: string | null | undefined) {
  return !v || !String(v).trim() || BILINMAYDI.has(String(v).trim());
}

/** `profile/wizard` dagi `isComplete` bilan bir xil. */
export function computeProfileComplete(p: ProfileShape | null | undefined): boolean {
  if (!p) return false;
  return (
    (p.category === "kelinlar" || p.category === "kuyovlar") &&
    !isBlank(p.name) &&
    (p.age ?? 0) >= 18 &&
    !isBlank(p.country) &&
    !isBlank(p.region) &&
    !isBlank(p.city) &&
    !isBlank(p.nationality) &&
    (p.heightCm ?? 0) > 0 &&
    (p.weightKg ?? 0) > 0 &&
    !isBlank(p.jobTitle) &&
    !isBlank(p.about) &&
    !isBlank(p.aqeeda) &&
    !isBlank(p.prayer) &&
    !isBlank(p.quran) &&
    !isBlank(p.madhab)
  );
}

export function getProfileGaps(p: ProfileShape | null | undefined): ProfileGap[] {
  if (!p) {
    return [
      { field: "category", label: "Jins / kategoriya", group: "Asosiy", wizardStep: "category" },
      { field: "name", label: "Ism", group: "Asosiy", wizardStep: "name" },
    ];
  }

  const gaps: ProfileGap[] = [];

  if (p.category !== "kelinlar" && p.category !== "kuyovlar") {
    gaps.push({ field: "category", label: "Jins / kategoriya", group: "Asosiy", wizardStep: "category" });
  }
  if (isBlank(p.name) || (p.name?.trim().length ?? 0) < 2) {
    gaps.push({ field: "name", label: "Ism", group: "Asosiy", wizardStep: "name" });
  }
  if ((p.age ?? 0) < 18) {
    gaps.push({ field: "age", label: "Yosh", group: "Asosiy", wizardStep: "age" });
  }
  if (isBlank(p.country)) {
    gaps.push({ field: "country", label: "Davlat", group: "Manzil", wizardStep: "country" });
  }
  if (isBlank(p.region) || (p.region?.trim().length ?? 0) < 2) {
    gaps.push({ field: "region", label: "Viloyat", group: "Manzil", wizardStep: "region" });
  }
  if (isBlank(p.city) || (p.city?.trim().length ?? 0) < 2) {
    gaps.push({ field: "city", label: "Shahar", group: "Manzil", wizardStep: "city" });
  }
  if (isBlank(p.nationality)) {
    gaps.push({ field: "nationality", label: "Millat", group: "Manzil", wizardStep: "nationality" });
  }
  if ((p.heightCm ?? 0) < 140) {
    gaps.push({ field: "heightCm", label: "Bo‘y (sm)", group: "Jismoniy", wizardStep: "heightCm" });
  }
  if ((p.weightKg ?? 0) < 35) {
    gaps.push({ field: "weightKg", label: "Vazn (kg)", group: "Jismoniy", wizardStep: "weightKg" });
  }
  if (isBlank(p.jobTitle) || (p.jobTitle?.trim().length ?? 0) < 2) {
    gaps.push({ field: "jobTitle", label: "Kasb", group: "Ish", wizardStep: "jobTitle" });
  }
  if (isBlank(p.about) || (p.about?.trim().length ?? 0) < 30) {
    gaps.push({ field: "about", label: "O‘zingiz haqingizda", group: "Matn", wizardStep: "about" });
  }
  if (isBlank(p.aqeeda)) {
    gaps.push({ field: "aqeeda", label: "Aqida", group: "Diniy", wizardStep: "aqeeda" });
  }
  if (isBlank(p.prayer)) {
    gaps.push({ field: "prayer", label: "Namoz", group: "Diniy", wizardStep: "prayer" });
  }
  if (isBlank(p.quran)) {
    gaps.push({ field: "quran", label: "Qur’on", group: "Diniy", wizardStep: "quran" });
  }
  if (isBlank(p.madhab)) {
    gaps.push({ field: "madhab", label: "Mazhab", group: "Diniy", wizardStep: "madhab" });
  }

  return gaps;
}
