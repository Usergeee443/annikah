import type { ListingCategory, ListingFormState } from "./constants";

export type QuestionId =
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
  | "smokes"
  | "sportPerWeek"
  | "maritalStatus"
  | "children"
  | "polygamyAllowance"
  | "education"
  | "incomeMonthlyUsd"
  | "aqeeda"
  | "prayer"
  | "quran"
  | "madhab"
  | "about"
  | "partnerAge"
  | "partnerLocation";

export type QuestionDef = {
  id: QuestionId;
  emoji: string;
  title: string;
  subtitle: string;
  optional?: boolean;
  show?: (d: ListingFormState) => boolean;
  isValid: (d: ListingFormState) => boolean;
  hint: (d: ListingFormState) => string | null;
};

function req(cond: boolean, msg: string, d: ListingFormState): string | null {
  return cond ? null : msg;
}

export const ALL_QUESTIONS: QuestionDef[] = [
  {
    id: "category",
    emoji: "💍",
    title: "Siz kuyovmisiz yoki kelinmi?",
    subtitle: "E’lon turiga qarab keyingi savollar biroz o‘zgaradi.",
    isValid: (d) => d.listingCategory === "kelinlar" || d.listingCategory === "kuyovlar",
    hint: () => "Iltimos, birini tanlang.",
  },
  {
    id: "name",
    emoji: "👤",
    title: "Ismingiz nima?",
    subtitle: "E’londa shu ism ko‘rinadi — taxallus ham bo‘ladi.",
    isValid: (d) => d.name.trim().length >= 2,
    hint: (d) => req(d.name.trim().length >= 2, "Kamida 2 harf kiriting.", d),
  },
  {
    id: "age",
    emoji: "🎂",
    title: "Yoshingiz nechada?",
    subtitle: "E’lon uchun kamida 18 yosh kerak.",
    isValid: (d) => d.age >= 18 && d.age <= 80,
    hint: (d) => req(d.age >= 18 && d.age <= 80, "Yosh 18 dan 80 gacha bo‘lishi kerak.", d),
  },
  {
    id: "country",
    emoji: "🌍",
    title: "Qaysi davlatda yashaysiz?",
    subtitle: "Ro‘yxatdan tanlang.",
    isValid: (d) => !!d.country.trim(),
    hint: () => "Davlatni tanlang.",
  },
  {
    id: "region",
    emoji: "📍",
    title: "Qaysi viloyatda?",
    subtitle: "Masalan: Toshkent viloyati.",
    isValid: (d) => d.region.trim().length >= 2,
    hint: (d) => req(d.region.trim().length >= 2, "Viloyat nomini yozing.", d),
  },
  {
    id: "city",
    emoji: "🏙️",
    title: "Qaysi shaharda yoki tumanda?",
    subtitle: "Masalan: Chirchiq, Samarqand.",
    isValid: (d) => d.city.trim().length >= 2,
    hint: (d) => req(d.city.trim().length >= 2, "Shahar yoki tuman nomini yozing.", d),
  },
  {
    id: "nationality",
    emoji: "🤝",
    title: "Millatingiz?",
    subtitle: "Masalan: o‘zbek, tojik, qozoq…",
    isValid: (d) => !!d.nationality.trim(),
    hint: () => "Millatni kiriting.",
  },
  {
    id: "heightCm",
    emoji: "📏",
    title: "Bo‘yingiz necha santimetr?",
    subtitle: "Taxminan ham bo‘ladi — masalan 175.",
    isValid: (d) => d.heightCm >= 140 && d.heightCm <= 220,
    hint: (d) => req(d.heightCm >= 140 && d.heightCm <= 220, "140–220 sm oralig‘ida kiriting.", d),
  },
  {
    id: "weightKg",
    emoji: "⚖️",
    title: "Vazningiz necha kilogramm?",
    subtitle: "Taxminan ham bo‘ladi — masalan 70.",
    isValid: (d) => d.weightKg >= 35 && d.weightKg <= 180,
    hint: (d) => req(d.weightKg >= 35 && d.weightKg <= 180, "35–180 kg oralig‘ida kiriting.", d),
  },
  {
    id: "jobTitle",
    emoji: "💼",
    title: "Kasbingiz nima?",
    subtitle: "Ish, o‘qish yoki kasbingizni qisqacha yozing.",
    isValid: (d) => d.jobTitle.trim().length >= 2,
    hint: (d) => req(d.jobTitle.trim().length >= 2, "Kasbni kamida 2 harfda yozing.", d),
  },
  {
    id: "smokes",
    emoji: "🚭",
    title: "Chekasanizmi?",
    subtitle: "Halol tanlov — shunchaki rostini tanlang.",
    isValid: (d) => d.smokes === "yes" || d.smokes === "no",
    hint: () => "Bir variantni tanlang.",
  },
  {
    id: "sportPerWeek",
    emoji: "🏃",
    title: "Haftasiga sport qancha?",
    subtitle: "Ixtiyoriy. Bilmasangiz «O‘tkazib yuborish» bosing.",
    optional: true,
    isValid: () => true,
    hint: () => null,
  },
  {
    id: "maritalStatus",
    emoji: "💒",
    title: "Oilaviy holatingiz?",
    subtitle: "Hozirgi turmush holatingizni tanlang.",
    isValid: (d) => !!d.maritalStatus && d.maritalStatus !== "bilinmaydi",
    hint: () => "Bir variantni tanlang.",
  },
  {
    id: "children",
    emoji: "👶",
    title: "Farzandingiz bormi?",
    subtitle: "Halol javob yetarli.",
    isValid: (d) => d.children === "yoq" || d.children === "bor",
    hint: () => "Bir variantni tanlang.",
  },
  {
    id: "polygamyAllowance",
    emoji: "📿",
    title: "Ko‘pxotinlikka rozimisiz?",
    subtitle: "Faqat ayol (kelin) e’lonlari uchun so‘raladi.",
    show: (d) => d.listingCategory === "kelinlar",
    isValid: (d) => d.polygamyAllowance !== null && d.polygamyAllowance >= 1,
    hint: () => "Variantlardan birini tanlang.",
  },
  {
    id: "education",
    emoji: "🎓",
    title: "Ta’lim darajangiz?",
    subtitle: "Eng yaqin variantni tanlang.",
    isValid: (d) => !!d.education && d.education !== "bilinmaydi",
    hint: () => "Bir variantni tanlang.",
  },
  {
    id: "incomeMonthlyUsd",
    emoji: "💵",
    title: "Oylik daromad (USD)?",
    subtitle: "Ixtiyoriy. Ko‘rsatmasangiz ham bo‘ladi.",
    optional: true,
    isValid: () => true,
    hint: () => null,
  },
  {
    id: "aqeeda",
    emoji: "☪️",
    title: "Aqidangiz qaysi?",
    subtitle: "Diniy e’tiqodingizni tanlang.",
    isValid: (d) => !!d.aqeeda && d.aqeeda !== "bilinmaydi",
    hint: () => "Bir variantni tanlang.",
  },
  {
    id: "prayer",
    emoji: "🕌",
    title: "Namoz o‘qiysizmi?",
    subtitle: "Shaxsiy — faqat tanlov uchun.",
    isValid: (d) => !!d.prayer && d.prayer !== "bilinmaydi",
    hint: () => "Bir variantni tanlang.",
  },
  {
    id: "quran",
    emoji: "📖",
    title: "Qur’on tilovatingiz qanday?",
    subtitle: "O‘zingizga mos darajani tanlang.",
    isValid: (d) => !!d.quran && d.quran !== "bilinmaydi",
    hint: () => "Bir variantni tanlang.",
  },
  {
    id: "madhab",
    emoji: "📚",
    title: "Mazhabingiz?",
    subtitle: "Odatdagi mazhabingizni tanlang.",
    isValid: (d) => !!d.madhab && d.madhab !== "bilinmaydi",
    hint: () => "Bir variantni tanlang.",
  },
  {
    id: "about",
    emoji: "✍️",
    title: "O‘zingiz haqingizda",
    subtitle: "Qisqa va samimiy yozing — kamida 2–3 jumla (12+ belgi).",
    isValid: (d) => d.about.trim().length >= 12,
    hint: (d) =>
      d.about.trim().length >= 12
        ? null
        : `Yana ${Math.max(0, 12 - d.about.trim().length)} belgi yozing.`,
  },
  {
    id: "partnerAge",
    emoji: "💑",
    title: "Juft uchun yosh oralig‘i?",
    subtitle: "Ixtiyoriy. Bo‘sh qoldirsangiz ham bo‘ladi.",
    optional: true,
    isValid: () => true,
    hint: () => null,
  },
  {
    id: "partnerLocation",
    emoji: "🗺️",
    title: "Juft uchun joy (ixtiyoriy)",
    subtitle: "Davlat, viloyat yoki shahar — vergul bilan. Masalan: O‘zbekiston, Toshkent.",
    optional: true,
    isValid: () => true,
    hint: () => null,
  },
];

export function visibleQuestions(d: ListingFormState): QuestionDef[] {
  return ALL_QUESTIONS.filter((q) => !q.show || q.show(d));
}

export function profileToForm(
  p: Record<string, unknown> | null | undefined,
  cat: ListingCategory,
): ListingFormState {
  return {
    listingCategory: cat,
    name: String(p?.name || ""),
    age: Math.max(18, Number(p?.age || 25)),
    country: String(p?.country || ""),
    region: String(p?.region || ""),
    city: String(p?.city || ""),
    nationality: String(p?.nationality || ""),
    heightCm: Number(p?.heightCm || 170),
    weightKg: Number(p?.weightKg || 65),
    jobTitle: String(p?.jobTitle || ""),
    about: String(p?.about || ""),
    aqeeda: String(p?.aqeeda || ""),
    prayer: String(p?.prayer || ""),
    quran: String(p?.quran || ""),
    madhab: String(p?.madhab || ""),
    maritalStatus: String(p?.maritalStatus || "bilinmaydi"),
    children: String(p?.children || "bilinmaydi"),
    smokes: p?.smokes === true ? "yes" : p?.smokes === false ? "no" : "",
    sportPerWeek: (p?.sportPerWeek as number | null) ?? null,
    incomeMonthlyUsd: (p?.incomeMonthlyUsd as number | null) ?? null,
    polygamyAllowance: cat === "kelinlar" ? ((p?.polygamyAllowance as number | null) ?? null) : null,
    education: String(p?.education || "bilinmaydi"),
    partnerAgeFrom: (p?.partnerAgeFrom as number | null) ?? null,
    partnerAgeTo: (p?.partnerAgeTo as number | null) ?? null,
    partnerCountries: String(p?.partnerCountries || ""),
    partnerRegions: String(p?.partnerRegions || ""),
    partnerCities: String(p?.partnerCities || ""),
    plan: "month1",
  };
}
