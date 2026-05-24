import { CHIP } from "@/components/listing-create/constants";
import {
  labelAqeeda,
  labelEducation,
  labelIncome,
  labelMadhab,
  labelMarital,
  labelPrayer,
  labelQuran,
} from "@/lib/listingEditOptions";
import { POLYGAMY_OPTIONS } from "./EditPickers";

export type ListingData = {
  id: number;
  name: string;
  age: number;
  country: string;
  region: string;
  city: string;
  nationality: string;
  heightCm: number;
  weightKg: number;
  smokes: boolean | null;
  sportPerWeek: number | null;
  maritalStatus: string;
  children: string;
  polygamyAllowance: number | null;
  education: string;
  jobTitle: string;
  incomeMonthlyUsd: number | null;
  aqeeda: string;
  prayer: string;
  quran: string;
  madhab: string;
  partnerAgeFrom: number | null;
  partnerAgeTo: number | null;
  partnerCountries: string | null;
  partnerRegions: string | null;
  partnerCities: string | null;
  about: string;
};

export type FieldKind =
  | "text"
  | "textarea"
  | "country"
  | "chips"
  | "number"
  | "income"
  | "sport"
  | "tristate"
  | "polygamy"
  | "rangeAge"
  | "partnerLocation";

export type EditFieldDef = {
  key: string;
  section: string;
  label: string;
  panelTitle: string;
  panelSubtitle?: string;
  hint?: string;
  kind: FieldKind;
  chipOptions?: readonly (readonly [string, string])[];
  number?: { min: number; max: number; step: number; unit?: string };
  getDisplay: (d: ListingData) => string;
  getPatch: (draft: ListingData) => Partial<ListingData>;
};

function row(
  def: Omit<EditFieldDef, "getDisplay" | "getPatch"> & {
    display: (d: ListingData) => string;
    patch: (d: ListingData) => Partial<ListingData>;
  },
): EditFieldDef {
  return {
    ...def,
    getDisplay: def.display,
    getPatch: def.patch,
  };
}

export const LISTING_EDIT_FIELDS: EditFieldDef[] = [
  row({
    key: "name",
    section: "Asosiy",
    label: "Ism",
    panelTitle: "Ismni tahrirlash",
    panelSubtitle: "E’londa ko‘rinadigan ism yoki taxallus.",
    kind: "text",
    display: (d) => d.name,
    patch: (d) => ({ name: d.name.trim() }),
  }),
  row({
    key: "age",
    section: "Asosiy",
    label: "Yosh",
    panelTitle: "Yoshni tahrirlash",
    kind: "number",
    number: { min: 18, max: 80, step: 1, unit: "yosh" },
    display: (d) => `${d.age} yosh`,
    patch: (d) => ({ age: d.age }),
  }),
  row({
    key: "country",
    section: "Manzil",
    label: "Davlat",
    panelTitle: "Davlatni tahrirlash",
    panelSubtitle: "Ro‘yxatdan tanlang yoki qidiring.",
    kind: "country",
    display: (d) => d.country,
    patch: (d) => ({ country: d.country }),
  }),
  row({
    key: "region",
    section: "Manzil",
    label: "Viloyat",
    panelTitle: "Viloyatni tahrirlash",
    kind: "text",
    display: (d) => d.region,
    patch: (d) => ({ region: d.region.trim() }),
  }),
  row({
    key: "city",
    section: "Manzil",
    label: "Shahar",
    panelTitle: "Shaharni tahrirlash",
    kind: "text",
    display: (d) => d.city,
    patch: (d) => ({ city: d.city.trim() }),
  }),
  row({
    key: "nationality",
    section: "Manzil",
    label: "Millat",
    panelTitle: "Millatni tahrirlash",
    kind: "text",
    display: (d) => d.nationality,
    patch: (d) => ({ nationality: d.nationality.trim() }),
  }),
  row({
    key: "heightCm",
    section: "Jismoniy",
    label: "Bo‘y",
    panelTitle: "Bo‘yni tahrirlash",
    kind: "number",
    number: { min: 140, max: 220, step: 1, unit: "sm" },
    display: (d) => `${d.heightCm} sm`,
    patch: (d) => ({ heightCm: d.heightCm }),
  }),
  row({
    key: "weightKg",
    section: "Jismoniy",
    label: "Vazn",
    panelTitle: "Vaznni tahrirlash",
    kind: "number",
    number: { min: 35, max: 200, step: 1, unit: "kg" },
    display: (d) => `${d.weightKg} kg`,
    patch: (d) => ({ weightKg: d.weightKg }),
  }),
  row({
    key: "smokes",
    section: "Jismoniy",
    label: "Sigaret",
    panelTitle: "Sigaret holati",
    kind: "tristate",
    display: (d) => (d.smokes === null ? "—" : d.smokes ? "Chekadi" : "Chekmaydi"),
    patch: (d) => ({ smokes: d.smokes }),
  }),
  row({
    key: "sportPerWeek",
    section: "Jismoniy",
    label: "Sport",
    panelTitle: "Sport (haftasiga)",
    panelSubtitle: "Haftasiga necha marta sport qilasiz?",
    kind: "sport",
    display: (d) => (d.sportPerWeek == null ? "Belgilanmagan" : `${d.sportPerWeek} marta`),
    patch: (d) => ({ sportPerWeek: d.sportPerWeek }),
  }),
  row({
    key: "maritalStatus",
    section: "Shaxsiy",
    label: "Oilaviy holat",
    panelTitle: "Oilaviy holatni tahrirlash",
    kind: "chips",
    chipOptions: CHIP.marital,
    display: (d) => labelMarital(d.maritalStatus),
    patch: (d) => ({ maritalStatus: d.maritalStatus }),
  }),
  row({
    key: "children",
    section: "Shaxsiy",
    label: "Farzand",
    panelTitle: "Farzand holati",
    kind: "chips",
    chipOptions: [
      ["yoq", "Yo‘q"],
      ["bor", "Bor"],
    ],
    display: (d) => (d.children === "bor" ? "Bor" : d.children === "yoq" ? "Yo‘q" : d.children),
    patch: (d) => ({ children: d.children }),
  }),
  row({
    key: "polygamyAllowance",
    section: "Shaxsiy",
    label: "Ko‘pxotinlik",
    panelTitle: "Ko‘pxotinlikka rozilik",
    hint: "Faqat ayol e’lonlari uchun",
    kind: "polygamy",
    display: (d) =>
      d.polygamyAllowance != null
        ? POLYGAMY_OPTIONS.find((o) => o.value === d.polygamyAllowance)?.label ?? String(d.polygamyAllowance)
        : "—",
    patch: (d) => ({ polygamyAllowance: d.polygamyAllowance }),
  }),
  row({
    key: "education",
    section: "Ta’lim",
    label: "Ta’lim",
    panelTitle: "Ta’lim darajasi",
    kind: "chips",
    chipOptions: CHIP.education,
    display: (d) => labelEducation(d.education),
    patch: (d) => ({ education: d.education }),
  }),
  row({
    key: "jobTitle",
    section: "Ta’lim",
    label: "Kasb",
    panelTitle: "Kasbni tahrirlash",
    kind: "text",
    display: (d) => d.jobTitle || "—",
    patch: (d) => ({ jobTitle: d.jobTitle.trim() }),
  }),
  row({
    key: "incomeMonthlyUsd",
    section: "Ta’lim",
    label: "Daromad",
    panelTitle: "Oylik daromad",
    panelSubtitle: "Taxminiy diapazonni tanlang (USD).",
    kind: "income",
    display: (d) => labelIncome(d.incomeMonthlyUsd),
    patch: (d) => ({ incomeMonthlyUsd: d.incomeMonthlyUsd }),
  }),
  row({
    key: "aqeeda",
    section: "Diniy",
    label: "Aqida",
    panelTitle: "Aqidani tahrirlash",
    kind: "chips",
    chipOptions: CHIP.aqeeda,
    display: (d) => labelAqeeda(d.aqeeda),
    patch: (d) => ({ aqeeda: d.aqeeda }),
  }),
  row({
    key: "prayer",
    section: "Diniy",
    label: "Namoz",
    panelTitle: "Namoz holati",
    kind: "chips",
    chipOptions: CHIP.prayer,
    display: (d) => labelPrayer(d.prayer),
    patch: (d) => ({ prayer: d.prayer }),
  }),
  row({
    key: "quran",
    section: "Diniy",
    label: "Qur’on",
    panelTitle: "Qur’on tilovati",
    kind: "chips",
    chipOptions: CHIP.quran,
    display: (d) => labelQuran(d.quran),
    patch: (d) => ({ quran: d.quran }),
  }),
  row({
    key: "madhab",
    section: "Diniy",
    label: "Mazhab",
    panelTitle: "Mazhabni tahrirlash",
    kind: "chips",
    chipOptions: CHIP.madhab,
    display: (d) => labelMadhab(d.madhab),
    patch: (d) => ({ madhab: d.madhab }),
  }),
  row({
    key: "partnerAge",
    section: "Juft",
    label: "Juft yoshi",
    panelTitle: "Juft yosh oralig‘i",
    kind: "rangeAge",
    display: (d) =>
      d.partnerAgeFrom != null && d.partnerAgeTo != null
        ? `${d.partnerAgeFrom} – ${d.partnerAgeTo} yosh`
        : "—",
    patch: (d) => ({ partnerAgeFrom: d.partnerAgeFrom, partnerAgeTo: d.partnerAgeTo }),
  }),
  row({
    key: "partnerLocation",
    section: "Juft",
    label: "Juft joylashuvi",
    panelTitle: "Juft uchun joylashuv",
    panelSubtitle: "Vergul bilan ajrating: davlat, viloyat, shahar.",
    kind: "partnerLocation",
    display: (d) => [d.partnerCountries, d.partnerRegions, d.partnerCities].filter(Boolean).join(", ") || "—",
    patch: (d) => ({
      partnerCountries: d.partnerCountries,
      partnerRegions: d.partnerRegions,
      partnerCities: d.partnerCities,
    }),
  }),
  row({
    key: "about",
    section: "Haqida",
    label: "Tavsif",
    panelTitle: "O‘zingiz haqingizda",
    panelSubtitle: "Qisqa va samimiy matn yozing.",
    kind: "textarea",
    display: (d) => d.about || "—",
    patch: (d) => ({ about: d.about }),
  }),
];

export const FIELD_BY_KEY = Object.fromEntries(LISTING_EDIT_FIELDS.map((f) => [f.key, f])) as Record<
  string,
  EditFieldDef
>;

export const SECTION_STYLES: Record<string, string> = {
  Asosiy: "bg-rose-100 text-rose-950",
  Manzil: "bg-fuchsia-100 text-fuchsia-950",
  Jismoniy: "bg-amber-100 text-amber-950",
  Shaxsiy: "bg-emerald-100 text-emerald-950",
  "Ta’lim": "bg-teal-100 text-teal-950",
  Diniy: "bg-violet-100 text-violet-950",
  Juft: "bg-sky-100 text-sky-950",
  Haqida: "bg-cyan-100 text-cyan-950",
};

export function partnerLocationText(d: ListingData) {
  return [d.partnerCountries, d.partnerRegions, d.partnerCities].filter(Boolean).join(", ");
}

export function applyPartnerLocationText(d: ListingData, text: string): ListingData {
  const parts = text.split(",").map((s) => s.trim());
  return {
    ...d,
    partnerCountries: parts[0] || null,
    partnerRegions: parts[1] || null,
    partnerCities: parts.slice(2).join(", ") || null,
  };
}
