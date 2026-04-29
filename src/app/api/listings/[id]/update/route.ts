import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

const UpdateSchema = z
  .object({
    name: z.string().min(2).max(64).optional(),
    age: z.number().int().min(18).max(80).optional(),
    country: z.string().min(1).max(64).optional(),
    region: z.string().min(1).max(64).optional(),
    city: z.string().min(1).max(64).optional(),
    nationality: z.string().min(1).max(64).optional(),
    heightCm: z.number().int().min(140).max(220).optional(),
    weightKg: z.number().int().min(35).max(200).optional(),
    smokes: z.boolean().nullable().optional(),
    sportPerWeek: z.number().int().min(0).max(14).nullable().optional(),
    maritalStatus: z.string().min(1).max(32).optional(),
    children: z.string().min(1).max(32).optional(),
    polygamyAllowance: z.number().int().min(1).max(4).nullable().optional(),
    education: z.string().min(1).max(32).optional(),
    jobTitle: z.string().min(0).max(64).optional(),
    incomeMonthlyUsd: z.number().int().min(0).max(100000).nullable().optional(),
    aqeeda: z.string().min(1).max(32).optional(),
    prayer: z.string().min(1).max(32).optional(),
    quran: z.string().min(1).max(32).optional(),
    madhab: z.string().min(1).max(32).optional(),
    partnerAgeFrom: z.number().int().min(18).max(80).nullable().optional(),
    partnerAgeTo: z.number().int().min(18).max(80).nullable().optional(),
    partnerCountries: z.string().max(400).nullable().optional(),
    partnerRegions: z.string().max(400).nullable().optional(),
    partnerCities: z.string().max(400).nullable().optional(),
    about: z.string().max(2000).optional(),
  })
  .strict();

export async function PATCH(_req: Request) {
  return NextResponse.json({ error: "METHOD_NOT_ALLOWED" }, { status: 405 });
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await ctx.params;
  if (!id) return NextResponse.json({ error: "INVALID_ID" }, { status: 400 });

  const listing = await db.listing.findUnique({ where: { id }, select: { id: true, ownerId: true } });
  if (!listing) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  if (listing.ownerId !== user.id) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const json = await req.json().catch(() => null);
  const parsed = UpdateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  await db.listing.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json({ ok: true });
}

