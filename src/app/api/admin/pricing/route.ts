import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/adminAuth";
import {
  getPricingConfig,
  setPricingConfig,
  type PricingConfig,
} from "@/lib/pricing";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "ADMIN_AUTH_REQUIRED" }, { status: 401 });
  if (session.role !== "super_admin") {
    return NextResponse.json({ error: "ADMIN_SUPER_REQUIRED" }, { status: 403 });
  }
  const cfg = await getPricingConfig();
  return NextResponse.json({ ok: true, pricing: cfg });
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "ADMIN_AUTH_REQUIRED" }, { status: 401 });
  if (session.role !== "super_admin") {
    return NextResponse.json({ error: "ADMIN_SUPER_REQUIRED" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "BAD_BODY" }, { status: 400 });
  }
  const candidate = body as Partial<PricingConfig>;
  if (!Array.isArray(candidate.listingPlans) || !Array.isArray(candidate.boosts)) {
    return NextResponse.json({ error: "BAD_SHAPE" }, { status: 400 });
  }

  const sanitized: PricingConfig = {
    listingPlans: candidate.listingPlans.map((p) => ({
      id: (p?.id as PricingConfig["listingPlans"][number]["id"]) || "month1",
      title: String(p?.title || "").trim() || "Tarif",
      days: Math.max(1, Math.min(3650, Math.floor(Number(p?.days || 1)))),
      priceUzs: Math.max(0, Math.floor(Number(p?.priceUzs || 0))),
      badge: p?.badge ? String(p.badge).slice(0, 24) : undefined,
      description: p?.description ? String(p.description).slice(0, 160) : undefined,
    })),
    boosts: candidate.boosts.map((b) => ({
      id: String(b?.id || "").trim() || "boost",
      label: String(b?.label || "").trim() || "Boost",
      days: Math.max(1, Math.min(365, Math.floor(Number(b?.days || 1)))),
      priceUzs: Math.max(0, Math.floor(Number(b?.priceUzs || 0))),
    })),
  };

  await setPricingConfig(sanitized);
  return NextResponse.json({ ok: true });
}
