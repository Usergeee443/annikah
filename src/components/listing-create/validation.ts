import type { FormStepId, ListingFormState } from "./constants";

export function stepValid(step: FormStepId, d: ListingFormState): boolean {
  switch (step) {
    case "personal":
      return (
        d.name.trim().length >= 2 &&
        d.age >= 18 &&
        d.age <= 80 &&
        !!d.country.trim() &&
        d.region.trim().length >= 2 &&
        d.city.trim().length >= 2 &&
        !!d.nationality.trim()
      );
    case "body":
      return (
        d.heightCm >= 140 &&
        d.heightCm <= 220 &&
        d.weightKg >= 35 &&
        d.weightKg <= 180 &&
        d.jobTitle.trim().length >= 2 &&
        (d.smokes === "yes" || d.smokes === "no")
      );
    case "din":
      if (!d.maritalStatus || d.maritalStatus === "bilinmaydi") return false;
      if (d.children !== "yoq" && d.children !== "bor") return false;
      if (!d.education || d.education === "bilinmaydi") return false;
      if (
        d.listingCategory === "kelinlar" &&
        (d.polygamyAllowance === null || d.polygamyAllowance < 1)
      )
        return false;
      return (
        !!d.aqeeda.trim() &&
        d.aqeeda !== "bilinmaydi" &&
        !!d.prayer.trim() &&
        d.prayer !== "bilinmaydi" &&
        !!d.quran.trim() &&
        d.quran !== "bilinmaydi" &&
        !!d.madhab.trim() &&
        d.madhab !== "bilinmaydi"
      );
    case "story":
      return d.about.trim().length >= 12;
    default:
      return false;
  }
}

export function stepHint(step: FormStepId, d: ListingFormState): string | null {
  if (stepValid(step, d)) return null;
  switch (step) {
    case "personal":
      if (d.name.trim().length < 2) return "Ism kamida 2 harf bo‘lsin.";
      if (d.age < 18) return "Yosh kamida 18 bo‘lishi kerak.";
      if (!d.country.trim()) return "Davlatni tanlang.";
      if (d.region.trim().length < 2) return "Viloyatni kiriting.";
      if (d.city.trim().length < 2) return "Shaharni kiriting.";
      if (!d.nationality.trim()) return "Millatni kiriting.";
      return "Shaxsiy ma’lumotlarni to‘ldiring.";
    case "body":
      if (d.smokes !== "yes" && d.smokes !== "no") return "Sigaret haqida tanlang.";
      if (d.jobTitle.trim().length < 2) return "Kasbingizni yozing.";
      return "Bo‘y, vazn va kasbni tekshiring.";
    case "din":
      return "Diniy va oilaviy maydonlarni tanlang.";
    case "story":
      return `O‘zingiz haqingizda kamida 12 belgi yozing (${d.about.trim().length}/12).`;
    default:
      return null;
  }
}

export function allStepsValid(d: ListingFormState): boolean {
  return ["personal", "body", "din", "story"].every((s) => stepValid(s as FormStepId, d));
}

/** ExtraListingWizard / ListingCreateWizard dagi 5 bosqich nomlari */
export type LegacyStepId = "basics" | "body" | "life" | "faith" | "match";

const LEGACY_TO_FORM: Record<LegacyStepId, FormStepId> = {
  basics: "personal",
  body: "body",
  life: "din",
  faith: "din",
  match: "story",
};

export function legacyStepValid(step: LegacyStepId, d: ListingFormState): boolean {
  return stepValid(LEGACY_TO_FORM[step], d);
}

export function legacyStepHint(step: LegacyStepId, d: ListingFormState | Record<string, unknown>): string | null {
  return stepHint(LEGACY_TO_FORM[step], d as ListingFormState);
}
