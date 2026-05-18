import type { ListingPlanId } from "@/lib/pricing";

export type ListingCategory = "kelinlar" | "kuyovlar";

export type WizardPlan = {
  id: ListingPlanId;
  title: string;
  days: number;
  priceUzs: number;
  badge?: string;
  description?: string;
};

export type ListingFormState = {
  listingCategory: ListingCategory;
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

export type FormStepId = "personal" | "body" | "din" | "story";

export const FORM_STEPS: FormStepId[] = ["personal", "body", "din", "story"];

export const STEP_UI: Record<
  FormStepId,
  { title: string; sub: string; bar: string; ring: string; icon: string }
> = {
  personal: {
    title: "Kim va qayerda",
    sub: "Ism, yosh, manzil",
    bar: "from-rose-500 to-fuchsia-500",
    ring: "ring-rose-200/90",
    icon: "📍",
  },
  body: {
    title: "Jismoniy",
    sub: "Bo‘y, kasb, odat",
    bar: "from-amber-500 to-orange-500",
    ring: "ring-amber-200/90",
    icon: "💪",
  },
  din: {
    title: "Din va oila",
    sub: "Aqida, turmush",
    bar: "from-violet-500 to-indigo-500",
    ring: "ring-violet-200/90",
    icon: "🌙",
  },
  story: {
    title: "Hikoya",
    sub: "O‘zingiz va juft",
    bar: "from-sky-500 to-cyan-500",
    ring: "ring-sky-200/90",
    icon: "✨",
  },
};

export const CHIP = {
  aqeeda: [
    ["ahli_sunna", "Ahli sunna"],
    ["moturidiy", "Moturidiy"],
    ["ashariy", "Ash’ariy"],
    ["boshqa", "Boshqa"],
  ],
  prayer: [
    ["farz", "Doimiy"],
    ["bazan", "Ba’zan"],
    ["oqimaydi", "O‘qimayman"],
  ],
  quran: [
    ["qiroat_yaxshi", "Yaxshi"],
    ["ortacha", "O‘rtacha"],
    ["oqimaydi", "O‘qimayman"],
  ],
  madhab: [
    ["hanafiy", "Hanafiy"],
    ["shofiiy", "Shofi’iy"],
    ["molikiy", "Molikiy"],
    ["hanbaliy", "Hanbaliy"],
    ["boshqa", "Boshqa"],
  ],
  marital: [
    ["boydoq", "Bo‘ydoq"],
    ["ajrashgan", "Ajrashgan"],
    ["beva", "Beva"],
  ],
  education: [
    ["orta", "O‘rta"],
    ["orta_maxsus", "O‘rta maxsus"],
    ["oliy", "Oliy"],
    ["boshqa", "Boshqa"],
  ],
} as const;
