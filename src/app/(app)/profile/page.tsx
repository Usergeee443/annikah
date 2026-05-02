import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import ElonlarimDashboard from "@/components/ElonlarimDashboard";
import ProfileAccountActions from "@/components/ProfileAccountActions";

export default async function ProfileHubPage() {
  const user = await requireUser();
  const authProvider = (user as any).authProvider as string | undefined;
  const phone = (user as any).phone as string | null | undefined;

  const [profile, listings] = await Promise.all([
    db.profile.findUnique({
      where: { userId: user.id },
      select: {
        category: true,
        isComplete: true,
        name: true,
        age: true,
        country: true,
        region: true,
        city: true,
        nationality: true,
        heightCm: true,
        weightKg: true,
        jobTitle: true,
        prayer: true,
        maritalStatus: true,
      },
    }),
    db.listing.findMany({
      where: { ownerId: user.id },
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        expiresAt: true,
        boostUntil: true,
        moderationStatus: true,
        active: true,
        plan: true,
        category: true,
        name: true,
        age: true,
        country: true,
        region: true,
        city: true,
        nationality: true,
        heightCm: true,
        weightKg: true,
        smokes: true,
        sportPerWeek: true,
        maritalStatus: true,
        children: true,
        polygamyAllowance: true,
        education: true,
        jobTitle: true,
        incomeMonthlyUsd: true,
        aqeeda: true,
        prayer: true,
        quran: true,
        madhab: true,
        partnerAgeFrom: true,
        partnerAgeTo: true,
        partnerCountries: true,
        partnerRegions: true,
        partnerCities: true,
        about: true,
      },
    }),
  ]);

  const listingIds = listings.map((l) => l.id);
  const [viewsAgg, likesAgg] = listingIds.length
    ? await Promise.all([
        db.listingView.groupBy({
          by: ["listingId"],
          where: { listingId: { in: listingIds } },
          _count: { _all: true },
        }),
        db.favorite.groupBy({
          by: ["listingId"],
          where: { listingId: { in: listingIds } },
          _count: { _all: true },
        }),
      ])
    : [[], []];
  const viewsById = new Map<string, number>(viewsAgg.map((x) => [x.listingId, x._count._all]));
  const likesById = new Map<string, number>(likesAgg.map((x) => [x.listingId, x._count._all]));

  const displayName =
    profile?.name?.trim() ||
    (user.email?.includes("@") ? user.email.split("@")[0] : user.email) ||
    "Profil";

  return (
    <div className="grid gap-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="mt-1 text-[26px] font-black tracking-tight text-zinc-950">Profil</h1>
        <Link
          href="/help"
          aria-label="Yordam — admin bilan chat"
          title="Yordam"
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-2xl border border-zinc-200 bg-transparent px-3.5 text-[12px] font-extrabold text-zinc-900 transition hover:bg-zinc-50 active:scale-[0.98]"
        >
          <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] text-zinc-700" fill="none" aria-hidden="true">
            <path
              d="M21 12a8 8 0 0 1-11.5 7.16L4 20l1-5A8 8 0 1 1 21 12z"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinejoin="round"
            />
          </svg>
          Yordam
        </Link>
      </div>

      {/* Account mini */}
      <div className="rounded-3xl bg-white p-5 backdrop-blur">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="mt-2 truncate text-[17px] font-black tracking-tight text-zinc-950">{displayName}</div>
            <div className="mt-1 text-[13px] font-semibold text-zinc-600">
              {authProvider === "telegram"
                ? `Telefon: ${phone || "—"}`
                : `Email: ${user.email}`}
            </div>
          </div>

          <ProfileAccountActions />
        </div>

        <div className="mt-4 grid gap-2 border-t border-zinc-200/70 pt-4">
          <Link
            href="/profile/password"
            className="-mx-2 inline-flex items-center justify-between gap-3 rounded-2xl px-2 py-2 transition hover:bg-zinc-50"
          >
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-zinc-100 text-zinc-700">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
                  <rect x="4" y="11" width="16" height="9" rx="2" stroke="currentColor" strokeWidth="1.7" />
                  <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                </svg>
              </span>
              <div className="min-w-0">
                <div className="text-[13.5px] font-extrabold tracking-tight text-zinc-950">Parolni o‘zgartirish</div>
                <div className="text-[11.5px] font-semibold text-zinc-500">Akkauntingiz parolini yangilash</div>
              </div>
            </div>
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-zinc-400" fill="none" aria-hidden="true">
              <path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>

      {/* E’lonlarim */}
      <section id="elonlarim" className="grid gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-[18px] font-black tracking-tight text-zinc-950">E’lonlarim</div>
          <Link
            href="/listings/new/extra"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-4 text-[12px] font-extrabold text-white ring-1 ring-black/10 hover:bg-zinc-900"
          >
            <span className="text-[15px] leading-none">+</span>
            E’lon qo‘shish
          </Link>
        </div>

        {listings.length === 0 && !profile ? (
          <div className="rounded-3xl border border-dashed border-zinc-300 bg-white/60 p-8 text-center">
            <div className="text-[14px] font-extrabold text-zinc-950">Hali e’lon yo‘q</div>
            <div className="mt-1 text-[12.5px] font-medium text-zinc-600">Yangi e’lon qo‘shing.</div>
          </div>
        ) : (
          <ElonlarimDashboard
            listings={listings.map((l) => ({
              ...l,
              viewsCount: viewsById.get(l.id) ?? 0,
              likesCount: likesById.get(l.id) ?? 0,
              createdAt: l.createdAt.toISOString(),
              updatedAt: l.updatedAt.toISOString(),
              expiresAt: l.expiresAt.toISOString(),
              boostUntil: l.boostUntil ? l.boostUntil.toISOString() : null,
            }))}
            profile={profile}
            userEmail={user.email}
          />
        )}
      </section>
    </div>
  );
}

