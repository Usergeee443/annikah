import { db } from "@/lib/db";

export type ListingPlanId = "days15" | "month1" | "months3";

export type ListingPlan = {
  id: ListingPlanId;
  title: string;
  days: number;
  priceUzs: number;
  badge?: string;
  description?: string;
};

export type BoostPlan = {
  id: string; // e.g. "mini" | "standard" | "premium"
  label: string;
  days: number;
  priceUzs: number;
};

export type PricingConfig = {
  listingPlans: ListingPlan[];
  boosts: BoostPlan[];
};

export const DEFAULT_PRICING: PricingConfig = {
  listingPlans: [
    {
      id: "days15",
      title: "15 kun",
      days: 15,
      priceUzs: 39000,
      description: "Tez start · oddiy joylash",
    },
    {
      id: "month1",
      title: "1 oy",
      days: 30,
      priceUzs: 69000,
      badge: "Mashhur",
      description: "Eng mashhur · balans",
    },
    {
      id: "months3",
      title: "3 oy",
      days: 90,
      priceUzs: 159000,
      badge: "Eng tejamli",
      description: "Ko‘p ko‘rinish · tejamli",
    },
  ],
  boosts: [
    { id: "mini", label: "Mini boost", days: 3, priceUzs: 29000 },
    { id: "standard", label: "Standart boost", days: 7, priceUzs: 59000 },
    { id: "premium", label: "Premium boost", days: 14, priceUzs: 99000 },
  ],
};

const PRICING_KEY = "pricing";

function isPricingConfig(v: unknown): v is PricingConfig {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return Array.isArray(o.listingPlans) && Array.isArray(o.boosts);
}

export async function getPricingConfig(): Promise<PricingConfig> {
  try {
    const row = await db.appSetting.findUnique({ where: { key: PRICING_KEY } });
    if (row && isPricingConfig(row.value)) {
      return mergeWithDefaults(row.value as PricingConfig);
    }
  } catch {
    // table may not exist yet (migration not applied) — fall through
  }
  return DEFAULT_PRICING;
}

function mergeWithDefaults(cfg: PricingConfig): PricingConfig {
  const ids: ListingPlanId[] = ["days15", "month1", "months3"];
  const listingPlans = ids.map((id) => {
    const fromDb = cfg.listingPlans.find((p) => p.id === id);
    const def = DEFAULT_PRICING.listingPlans.find((p) => p.id === id)!;
    return fromDb ? { ...def, ...fromDb } : def;
  });
  const boostIds = DEFAULT_PRICING.boosts.map((b) => b.id);
  const boosts = boostIds.map((id) => {
    const fromDb = cfg.boosts.find((b) => b.id === id);
    const def = DEFAULT_PRICING.boosts.find((b) => b.id === id)!;
    return fromDb ? { ...def, ...fromDb } : def;
  });
  return { listingPlans, boosts };
}

export async function setPricingConfig(cfg: PricingConfig): Promise<void> {
  const merged = mergeWithDefaults(cfg);
  await db.appSetting.upsert({
    where: { key: PRICING_KEY },
    update: { value: merged as unknown as object },
    create: { key: PRICING_KEY, value: merged as unknown as object },
  });
}

export function getListingPlan(cfg: PricingConfig, plan: string): ListingPlan {
  const found = cfg.listingPlans.find((p) => p.id === plan);
  return found || cfg.listingPlans.find((p) => p.id === "month1") || cfg.listingPlans[0];
}

export function getBoostByDays(cfg: PricingConfig, days: number): BoostPlan | null {
  return cfg.boosts.find((b) => b.days === days) || null;
}

export function expiresForListingPlan(plan: ListingPlan): Date {
  const d = new Date();
  d.setDate(d.getDate() + plan.days);
  return d;
}
