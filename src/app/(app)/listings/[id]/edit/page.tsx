import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseListingIdParam } from "@/lib/listingId";
import ListingEditWorkspace from "@/components/ListingEditWorkspace";

export default async function ListingEditPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id: idRaw } = await params;
  const id = parseListingIdParam(idRaw);
  if (id === null) notFound();

  const listing = await db.listing.findUnique({ where: { id } });
  if (!listing) notFound();
  if (listing.ownerId !== user.id) notFound();

  return (
    <div className="grid gap-4">
      <div className="rounded-3xl border border-zinc-200/70 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,.05)]">
        <div className="text-[11px] font-extrabold tracking-widest text-zinc-500">E’LON TAHRIRI</div>
        <h1 className="mt-2 text-[26px] font-black tracking-tight text-zinc-950">E’lonni bo‘limlar bo‘yicha tahrirlash</h1>
        <p className="mt-1 text-[13px] font-medium text-zinc-600">
          Istalgan bo‘limni tanlab «O‘zgartirish» bosing va faqat shu bo‘limni saqlang.
        </p>
      </div>
      <ListingEditWorkspace
        initial={{
          id: listing.id,
          name: listing.name,
          age: listing.age,
          country: listing.country,
          region: listing.region,
          city: listing.city,
          nationality: listing.nationality,
          heightCm: listing.heightCm,
          weightKg: listing.weightKg,
          smokes: listing.smokes,
          sportPerWeek: listing.sportPerWeek,
          maritalStatus: listing.maritalStatus,
          children: listing.children,
          polygamyAllowance: listing.polygamyAllowance,
          education: listing.education,
          jobTitle: listing.jobTitle,
          incomeMonthlyUsd: listing.incomeMonthlyUsd,
          aqeeda: listing.aqeeda,
          prayer: listing.prayer,
          quran: listing.quran,
          madhab: listing.madhab,
          partnerAgeFrom: listing.partnerAgeFrom,
          partnerAgeTo: listing.partnerAgeTo,
          partnerCountries: listing.partnerCountries,
          partnerRegions: listing.partnerRegions,
          partnerCities: listing.partnerCities,
          about: listing.about,
        }}
      />
    </div>
  );
}

