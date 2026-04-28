"use client";

import { useRouter } from "next/navigation";
import ListingCard from "@/components/ListingCard";

type L = {
  id: string;
  name: string;
  age: number;
  heightCm: number;
  weightKg: number;
  region: string;
  city: string;
  country: string;
  nationality?: string;
  category: string;
  jobTitle: string;
  prayer: string;
  maritalStatus: string;
  boostUntil: Date | null;
  createdAt: Date;
};

export default function ReklamaListingPick({ l, boostLocked }: { l: L; boostLocked?: boolean }) {
  const router = useRouter();
  return (
    <div
      className={boostLocked ? "opacity-60" : ""}
      title={boostLocked ? "Reklama tugaguncha qayta boost qilib bo‘lmaydi" : undefined}
    >
      <ListingCard
      l={{
        id: l.id,
        name: l.name,
        age: l.age,
        heightCm: l.heightCm,
        weightKg: l.weightKg,
        region: l.region,
        city: l.city,
        country: l.country,
        nationality: l.nationality,
        category: l.category,
        jobTitle: l.jobTitle,
        prayer: l.prayer,
        maritalStatus: l.maritalStatus,
        boostUntil: l.boostUntil,
        createdAt: l.createdAt,
      }}
      isFav={false}
      authed
      hideFavorite
      disableLink
      onPress={boostLocked ? () => {} : () => router.push(`/reklama/${l.id}`)}
    />
    </div>
  );
}
