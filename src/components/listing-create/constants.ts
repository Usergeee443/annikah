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
  { title: string; sub: string; bar: string; iconSrc: string }
> = {
  personal: {
    title: "Kim va qayerda",
    sub: "Ism, yosh, manzil",
    bar: "from-indigo-500 to-violet-500",
    iconSrc: "/section-icons/location.svg",
  },
  body: {
    title: "Jismoniy",
    sub: "Bo‘y, kasb, odat",
    bar: "from-sky-500 to-cyan-500",
    iconSrc: "/section-icons/ruler.svg",
  },
  din: {
    title: "Din va oila",
    sub: "Aqida, turmush",
    bar: "from-emerald-500 to-teal-500",
    iconSrc: "/section-icons/book.svg",
  },
  story: {
    title: "Hikoya",
    sub: "O‘zingiz va juft",
    bar: "from-violet-500 to-fuchsia-500",
    iconSrc: "/section-icons/user-search.svg",
  },
};

export const STEP_BADGE: Record<FormStepId, string> = {
  personal: "bg-rose-100 text-rose-950",
  body: "bg-amber-100 text-amber-950",
  din: "bg-violet-100 text-violet-950",
  story: "bg-cyan-100 text-cyan-950",
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
