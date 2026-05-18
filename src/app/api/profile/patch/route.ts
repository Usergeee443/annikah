import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { computeProfileComplete } from "@/lib/profileCompleteness";

const PatchSchema = z
  .object({
    category: z.enum(["kelinlar", "kuyovlar"]).optional(),
    name: z.string().min(2).max(64).optional(),
    age: z.number().int().min(18).max(80).optional(),
    country: z.string().min(1).max(64).optional(),
    region: z.string().min(2).max(64).optional(),
    city: z.string().min(2).max(64).optional(),
    nationality: z.string().min(1).max(64).optional(),
    heightCm: z.number().int().min(140).max(220).optional(),
    weightKg: z.number().int().min(35).max(200).optional(),
    jobTitle: z.string().min(2).max(64).optional(),
    about: z.string().min(30).max(2000).optional(),
    aqeeda: z.string().min(1).max(32).optional(),
    prayer: z.string().min(1).max(32).optional(),
    quran: z.string().min(1).max(32).optional(),
    madhab: z.string().min(1).max(32).optional(),
  })
  .strict();

export async function POST(req: Request) {
  const user = await requireUser();
  const json = await req.json().catch(() => null);
  const parsed = PatchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const existing = await db.profile.findUnique({ where: { userId: user.id } });
  const merged = {
    category: parsed.data.category ?? existing?.category ?? "kelinlar",
    name: parsed.data.name ?? existing?.name ?? "",
    age: parsed.data.age ?? existing?.age ?? 0,
    country: parsed.data.country ?? existing?.country ?? "",
    region: parsed.data.region ?? existing?.region ?? "",
    city: parsed.data.city ?? existing?.city ?? "",
    nationality: parsed.data.nationality ?? existing?.nationality ?? "",
    heightCm: parsed.data.heightCm ?? existing?.heightCm ?? 0,
    weightKg: parsed.data.weightKg ?? existing?.weightKg ?? 0,
    jobTitle: parsed.data.jobTitle ?? existing?.jobTitle ?? "",
    about: parsed.data.about ?? existing?.about ?? "",
    aqeeda: parsed.data.aqeeda ?? existing?.aqeeda ?? "",
    prayer: parsed.data.prayer ?? existing?.prayer ?? "",
    quran: parsed.data.quran ?? existing?.quran ?? "",
    madhab: parsed.data.madhab ?? existing?.madhab ?? "",
  };

  const isComplete = computeProfileComplete(merged);

  const data = {
    ...merged,
    smokes: existing?.smokes ?? null,
    sportPerWeek: existing?.sportPerWeek ?? null,
    maritalStatus: existing?.maritalStatus ?? "bilinmaydi",
    children: existing?.children ?? "bilinmaydi",
    polygamyAllowance: existing?.polygamyAllowance ?? null,
    education: existing?.education ?? "bilinmaydi",
    incomeMonthlyUsd: existing?.incomeMonthlyUsd ?? null,
    partnerAgeFrom: existing?.partnerAgeFrom ?? null,
    partnerAgeTo: existing?.partnerAgeTo ?? null,
    partnerCountries: existing?.partnerCountries ?? null,
    partnerRegions: existing?.partnerRegions ?? null,
    partnerCities: existing?.partnerCities ?? null,
    isComplete,
  };

  await db.profile.upsert({
    where: { userId: user.id },
    create: { userId: user.id, ...data },
    update: data,
  });

  return NextResponse.json({ ok: true, isComplete });
}
