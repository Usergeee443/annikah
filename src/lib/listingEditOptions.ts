import { CHIP } from "@/components/listing-create/constants";

export const INCOME_OPTIONS: { value: number | null; label: string }[] = [
  { value: null, label: "Ko‘rsatmaslik" },
  { value: 300, label: "$300 gacha" },
  { value: 500, label: "$500–800" },
  { value: 1000, label: "$800–1,200" },
  { value: 1500, label: "$1,200–2,000" },
  { value: 2500, label: "$2,000–3,500" },
  { value: 5000, label: "$3,500–7,000" },
  { value: 10000, label: "$7,000+" },
];

export const SPORT_OPTIONS: { value: number | null; label: string }[] = [
  { value: null, label: "Belgilanmagan" },
  { value: 0, label: "Yo‘q" },
  { value: 1, label: "1 marta" },
  { value: 2, label: "2 marta" },
  { value: 3, label: "3 marta" },
  { value: 4, label: "4 marta" },
  { value: 5, label: "5+ marta" },
];

const chipLabel = (options: readonly (readonly [string, string])[], value: string) =>
  options.find(([v]) => v === value)?.[1] ?? value;

export function labelMarital(v: string) {
  return chipLabel(CHIP.marital, v);
}
export function labelEducation(v: string) {
  return chipLabel(CHIP.education, v);
}
export function labelAqeeda(v: string) {
  return chipLabel(CHIP.aqeeda, v);
}
export function labelPrayer(v: string) {
  return chipLabel(CHIP.prayer, v);
}
export function labelQuran(v: string) {
  return chipLabel(CHIP.quran, v);
}
export function labelMadhab(v: string) {
  return chipLabel(CHIP.madhab, v);
}

export function labelIncome(v: number | null) {
  if (v == null) return "Belgilanmagan";
  const hit = INCOME_OPTIONS.find((o) => o.value === v);
  return hit?.label ?? `$${v}`;
}
