import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import ProfileWizard, { type ProfileData } from "@/components/ProfileWizard";

type Search = { step?: string };

function stepKeyFromQuery(step: string | undefined): string | null {
  if (!step) return null;
  const s = String(step).toLowerCase();
  if (s === "asosiy") return "country";
  if (s === "jismoniy") return "heightCm";
  if (s === "diniy") return "aqeeda";
  if (s === "juft") return "partnerAge";
  if (s === "yakuniy") return "review";
  return null;
}

export default async function ProfileWizardPage({ searchParams }: { searchParams: Promise<Search> }) {
  const user = await requireUser();
  const sp = (await searchParams) || {};
  const profile = await db.profile.findUnique({ where: { userId: user.id } });
  const initialStepKey = stepKeyFromQuery(sp.step);

  async function save(data: ProfileData): Promise<{ ok: true } | { ok: false; error: string }> {
    "use server";
    const user = await requireUser();

    const safe = {
      category: (data.category === "kuyovlar" ? "kuyovlar" : "kelinlar") as string,
      name: (data.name || "").trim(),
      age: Math.max(0, Math.floor(Number(data.age) || 0)),
      country: (data.country || "").trim(),
      region: (data.region || "").trim(),
      city: (data.city || "").trim(),
      nationality: (data.nationality || "").trim(),
      heightCm: Math.max(0, Math.floor(Number(data.heightCm) || 0)),
      weightKg: Math.max(0, Math.floor(Number(data.weightKg) || 0)),
      smokes: data.smokes === "yes" ? true : data.smokes === "no" ? false : null,
      sportPerWeek:
        data.sportPerWeek === null || data.sportPerWeek === undefined
          ? null
          : Math.max(0, Math.floor(Number(data.sportPerWeek))),
      maritalStatus: (data.maritalStatus || "bilinmaydi").trim(),
      children: (data.children || "bilinmaydi").trim(),
      polygamyAllowance:
        data.polygamyAllowance === null || data.polygamyAllowance === undefined
          ? null
          : Math.max(1, Math.floor(Number(data.polygamyAllowance))),
      education: (data.education || "bilinmaydi").trim(),
      jobTitle: (data.jobTitle || "").trim(),
      incomeMonthlyUsd:
        data.incomeMonthlyUsd === null || data.incomeMonthlyUsd === undefined
          ? null
          : Math.max(0, Math.floor(Number(data.incomeMonthlyUsd))),
      aqeeda: (data.aqeeda || "bilinmaydi").trim(),
      prayer: (data.prayer || "bilinmaydi").trim(),
      quran: (data.quran || "bilinmaydi").trim(),
      madhab: (data.madhab || "bilinmaydi").trim(),
      partnerAgeFrom:
        data.partnerAgeFrom === null || data.partnerAgeFrom === undefined
          ? null
          : Math.max(0, Math.floor(Number(data.partnerAgeFrom))),
      partnerAgeTo:
        data.partnerAgeTo === null || data.partnerAgeTo === undefined
          ? null
          : Math.max(0, Math.floor(Number(data.partnerAgeTo))),
      partnerCountries: (data.partnerCountries || "").trim() || null,
      partnerRegions: (data.partnerRegions || "").trim() || null,
      partnerCities: (data.partnerCities || "").trim() || null,
      about: (data.about || "").trim(),
    };

    const isComplete =
      !!safe.category &&
      !!safe.name &&
      safe.age >= 18 &&
      !!safe.country &&
      !!safe.region &&
      !!safe.city &&
      !!safe.nationality &&
      safe.heightCm > 0 &&
      safe.weightKg > 0 &&
      !!safe.jobTitle &&
      !!safe.about &&
      !!safe.aqeeda &&
      !!safe.prayer &&
      !!safe.quran &&
      !!safe.madhab;

    await db.profile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, ...safe, isComplete },
      update: { ...safe, isComplete },
    });

    return { ok: true };
  }

  async function exitToProfile() {
    "use server";
    redirect("/profile");
  }

  const initial: Partial<ProfileData> | null =
    profile == null
      ? null
      : {
          category: profile.category === "kuyovlar" ? "kuyovlar" : "kelinlar",
          name: profile.name,
          age: profile.age,
          country: profile.country,
          region: profile.region,
          city: profile.city,
          nationality: profile.nationality,
          heightCm: profile.heightCm,
          weightKg: profile.weightKg,
          smokes: profile.smokes === true ? "yes" : profile.smokes === false ? "no" : "",
          sportPerWeek: profile.sportPerWeek,
          maritalStatus: profile.maritalStatus,
          children: profile.children,
          polygamyAllowance: profile.polygamyAllowance,
          education: profile.education,
          jobTitle: profile.jobTitle,
          incomeMonthlyUsd: profile.incomeMonthlyUsd,
          aqeeda: profile.aqeeda,
          prayer: profile.prayer,
          quran: profile.quran,
          madhab: profile.madhab,
          partnerAgeFrom: profile.partnerAgeFrom,
          partnerAgeTo: profile.partnerAgeTo,
          partnerCountries: profile.partnerCountries ?? "",
          partnerRegions: profile.partnerRegions ?? "",
          partnerCities: profile.partnerCities ?? "",
          about: profile.about,
        };

  return (
    <ProfileWizard
      initial={initial}
      userEmail={user.email}
      initialStepKey={initialStepKey}
      onSubmit={save}
      onExit={exitToProfile}
    />
  );
}

