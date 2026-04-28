"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import ListingCard from "@/components/ListingCard";

export type ElonlarimListingPayload = {
  id: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  boostUntil: string | null;
  moderationStatus: string;
  active: boolean;
  plan: string;
  category: string;
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

export type ElonlarimProfilePayload = {
  category: string | null;
  isComplete: boolean;
  name: string | null;
  age: number | null;
  country: string | null;
  region: string | null;
  city: string | null;
  nationality: string | null;
  heightCm: number | null;
  weightKg: number | null;
  jobTitle: string | null;
  prayer: string | null;
  maritalStatus: string | null;
};

type DrawerTab = "edit" | "stats";

type Stats = {
  viewsUnique: number;
  favorites: number;
  views14d: { date: string; count: number }[];
  favorites14d: { date: string; count: number }[];
};

function fmtDateShort(iso: string) {
  const [y, m, d] = iso.split("-").map((x) => Number(x));
  if (!y || !m || !d) return iso;
  return `${String(d).padStart(2, "0")}.${String(m).padStart(2, "0")}`;
}

function MiniBars({ points }: { points: { date: string; count: number }[] }) {
  const max = Math.max(1, ...points.map((p) => p.count));
  return (
    <div className="grid grid-cols-14 items-end gap-1">
      {points.slice(-14).map((p) => (
        <div key={p.date} className="flex flex-col items-center gap-1">
          <div
            className="w-full rounded-full bg-zinc-900/20"
            style={{ height: `${Math.max(6, Math.round((p.count / max) * 42))}px` }}
            title={`${fmtDateShort(p.date)} · ${p.count}`}
          />
          <div className="text-[9px] font-bold text-zinc-400">{fmtDateShort(p.date)}</div>
        </div>
      ))}
    </div>
  );
}

function RowLink({ href, label, value }: { href: string; label: string; value: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 ring-1 ring-zinc-200 transition hover:bg-zinc-50"
    >
      <span className="text-[12px] font-bold text-zinc-500">{label}</span>
      <span className="max-w-[58%] truncate text-right text-[12.5px] font-extrabold text-zinc-950">{value}</span>
    </Link>
  );
}

function moderationLabel(s: string) {
  if (s === "pending") return "Moderatsiyada";
  if (s === "approved") return "Tasdiqlangan";
  if (s === "rejected") return "Rad etilgan";
  return s;
}

export default function ElonlarimDashboard({
  listings,
  profile,
  userEmail,
}: {
  listings: ElonlarimListingPayload[];
  profile: ElonlarimProfilePayload | null;
  userEmail: string;
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<DrawerTab>("edit");
  const [sel, setSel] = useState<null | { kind: "profile" } | { kind: "listing"; id: string }>(null);

  const [stats, setStats] = useState<Stats | null>(null);
  const [statsErr, setStatsErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const primary = useMemo(() => {
    if (listings.length === 0) return null;
    return [...listings].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    )[0]!;
  }, [listings]);

  const others = useMemo(() => {
    if (!primary) return [];
    return listings
      .filter((l) => l.id !== primary.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [listings, primary]);

  const syntheticFromProfile = useMemo(() => {
    if (listings.length > 0 || !profile) return null;
    const cat = profile.category === "kuyovlar" ? "kuyovlar" : "kelinlar";
    const now = new Date().toISOString();
    return {
      id: "__profile__",
      createdAt: now,
      updatedAt: now,
      expiresAt: now,
      boostUntil: null,
      moderationStatus: "pending",
      active: false,
      plan: "—",
      category: cat,
      name: profile.name || userEmail || "Profil",
      age: Math.max(18, profile.age || 18),
      country: profile.country || "—",
      region: profile.region || "—",
      city: profile.city || "—",
      nationality: profile.nationality || "—",
      heightCm: profile.heightCm || 170,
      weightKg: profile.weightKg || 70,
      smokes: null,
      sportPerWeek: null,
      maritalStatus: profile.maritalStatus || "bilinmaydi",
      children: "bilinmaydi",
      polygamyAllowance: null,
      education: "bilinmaydi",
      jobTitle: profile.jobTitle || "",
      incomeMonthlyUsd: null,
      aqeeda: "bilinmaydi",
      prayer: profile.prayer || "bilinmaydi",
      quran: "bilinmaydi",
      madhab: "bilinmaydi",
      partnerAgeFrom: null,
      partnerAgeTo: null,
      partnerCountries: null,
      partnerRegions: null,
      partnerCities: null,
      about: "",
    } satisfies ElonlarimListingPayload;
  }, [listings.length, profile, userEmail]);

  const activeListing = useMemo(() => {
    if (!sel || sel.kind !== "listing") return null;
    return listings.find((l) => l.id === sel.id) || null;
  }, [sel, listings]);

  const loadStats = useCallback(
    (listingId: string) => {
      startTransition(async () => {
        try {
          setStatsErr(null);
          const res = await fetch(`/api/listings/${listingId}/stats`, { cache: "no-store" });
          if (!res.ok) throw new Error(await res.text());
          setStats((await res.json()) as Stats);
        } catch (e: unknown) {
          setStats(null);
          setStatsErr(e instanceof Error ? e.message : "Xatolik");
        }
      });
    },
    [],
  );

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open || tab !== "stats" || sel?.kind !== "listing") return;
    setStats(null);
    loadStats(sel.id);
  }, [open, tab, sel, loadStats]);

  function openProfileDrawer() {
    setSel({ kind: "profile" });
    setTab("edit");
    setStats(null);
    setStatsErr(null);
    setOpen(true);
  }

  function openListingDrawer(id: string) {
    setSel({ kind: "listing", id });
    setTab("edit");
    setStats(null);
    setStatsErr(null);
    setOpen(true);
  }

  function close() {
    setOpen(false);
  }

  function cardProps(l: ElonlarimListingPayload, pin: boolean) {
    return {
      l: {
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
      },
      isFav: false,
      authed: true,
      hideFavorite: true,
      disableLink: true,
      coverBadge: pin ? ("pin" as const) : ("category" as const),
      onPress: () => {
        if (l.id === "__profile__") openProfileDrawer();
        else openListingDrawer(l.id);
      },
    };
  }

  return (
    <>
      {/* First row: only primary / synthetic */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {primary ? (
          <div className="col-span-full flex justify-center">
            <div className="w-full max-w-[240px] sm:max-w-[260px]">
              <ListingCard {...cardProps(primary, true)} />
            </div>
          </div>
        ) : syntheticFromProfile ? (
          <div className="col-span-full flex justify-center">
            <div className="w-full max-w-[240px] sm:max-w-[260px]">
              <ListingCard {...cardProps(syntheticFromProfile, true)} />
            </div>
          </div>
        ) : null}
      </div>

      {others.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {others.map((l) => (
            <ListingCard key={l.id} {...cardProps(l, false)} />
          ))}
        </div>
      ) : null}

      {/* Drawer */}
      <div
        className={
          "fixed inset-0 z-50 transition " + (open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0")
        }
      >
        <button
          type="button"
          aria-label="Yopish"
          onClick={close}
          className={"absolute inset-0 bg-black/40 backdrop-blur-[2px] transition " + (open ? "opacity-100" : "opacity-0")}
        />

        <aside
          className={
            "absolute right-0 top-0 flex h-full w-[min(520px,94vw)] flex-col border-l border-zinc-200/70 bg-white/95 shadow-[0_24px_80px_rgba(15,23,42,.35)] backdrop-blur-xl transition-transform duration-300 ease-out " +
            (open ? "translate-x-0" : "translate-x-full")
          }
        >
          <header className="border-b border-zinc-100 px-5 pb-4 pt-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[11px] font-extrabold tracking-widest text-zinc-500">
                  {sel?.kind === "profile" ? "PROFIL" : "E’LON"}
                </div>
                <div className="mt-1 truncate text-[20px] font-black tracking-tight text-zinc-950">
                  {sel?.kind === "profile"
                    ? profile?.name || userEmail
                    : activeListing?.name || "—"}
                </div>
                {sel?.kind === "listing" && activeListing ? (
                  <div className="mt-1 text-[12px] font-semibold text-zinc-600">
                    {moderationLabel(activeListing.moderationStatus)}
                    {" · "}
                    {activeListing.active ? "Active" : "Active emas"}
                  </div>
                ) : null}
              </div>
              <button
                type="button"
                onClick={close}
                className="inline-flex h-10 shrink-0 items-center justify-center rounded-2xl bg-white px-4 text-[12px] font-extrabold text-zinc-900 ring-1 ring-zinc-200 hover:bg-zinc-50"
              >
                Yopish
              </button>
            </div>

            <div className="mt-4 flex justify-center">
              <div className="inline-flex rounded-2xl bg-zinc-100/80 p-1 ring-1 ring-zinc-200">
                <button
                  type="button"
                  onClick={() => setTab("edit")}
                  className={
                    "h-9 rounded-xl px-5 text-[12px] font-extrabold tracking-tight transition " +
                    (tab === "edit"
                      ? "bg-white text-zinc-950 shadow-sm ring-1 ring-zinc-200/80"
                      : "text-zinc-600 hover:text-zinc-900")
                  }
                >
                  Tahrirlash
                </button>
                <button
                  type="button"
                  onClick={() => setTab("stats")}
                  className={
                    "h-9 rounded-xl px-5 text-[12px] font-extrabold tracking-tight transition " +
                    (tab === "stats"
                      ? "bg-white text-zinc-950 shadow-sm ring-1 ring-zinc-200/80"
                      : "text-zinc-600 hover:text-zinc-900")
                  }
                >
                  Statistika
                </button>
              </div>
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
            {tab === "edit" ? (
              <div className="grid gap-2.5">
                {sel?.kind === "profile" || sel?.kind === "listing" ? (
                  <>
                    <div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-zinc-400">
                      Qatorni bosing — profil wizard ochiladi
                    </div>
                    <RowLink
                      href="/profile?step=asosiy"
                      label="Ism · yosh · joy"
                      value={
                        sel?.kind === "listing" && activeListing
                          ? `${activeListing.name} · ${activeListing.age} · ${activeListing.city}`
                          : `${profile?.name || "—"} · ${profile?.age ?? "—"} · ${profile?.city || "—"}`
                      }
                    />
                    <RowLink href="/profile?step=jismoniy" label="Jismoniy" value="Bo‘y, vazn, sport…" />
                    <RowLink href="/profile?step=diniy" label="Diniy" value="Aqida, namoz, Qur’on…" />
                    <RowLink href="/profile?step=juft" label="Juftga talab" value="Yosh, davlat…" />
                    <RowLink href="/profile?step=yakuniy" label="Yakuniy" value="Tavsif va tekshiruv" />
                  </>
                ) : null}

                {sel?.kind === "listing" && activeListing && activeListing.id !== "__profile__" ? (
                  <>
                    <div className="mt-4 text-[11px] font-extrabold uppercase tracking-[0.16em] text-zinc-400">
                      E’lon
                    </div>
                    <RowLink href={`/listings/${activeListing.id}`} label="Batafsil sahifa" value="Ochish →" />
                    <div className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-200">
                      <div className="text-[12px] font-extrabold text-zinc-900">Snapshot</div>
                      <div className="mt-2 grid gap-2 text-[12px] font-medium text-zinc-600">
                        <div>
                          <span className="font-extrabold text-zinc-900">Kategoriya:</span>{" "}
                          {activeListing.category === "kelinlar" ? "Kelin" : "Kuyov"}
                        </div>
                        <div>
                          <span className="font-extrabold text-zinc-900">Muddat:</span>{" "}
                          {new Date(activeListing.expiresAt).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-extrabold text-zinc-900">Tarif:</span> {activeListing.plan}
                        </div>
                      </div>
                    </div>
                  </>
                ) : null}
              </div>
            ) : (
              <div className="grid gap-4">
                {sel?.kind === "profile" || sel?.kind !== "listing" || !activeListing ? (
                  <div className="rounded-3xl bg-zinc-50 p-5 text-[13px] font-medium leading-relaxed text-zinc-600 ring-1 ring-zinc-200">
                    Statistika faqat joylangan e’lon uchun mavjud. Avval{" "}
                    <Link href="/listings/new" className="font-extrabold text-zinc-950 underline-offset-2 hover:underline">
                      asosiy e’lonni joylang
                    </Link>
                    .
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-3xl bg-zinc-50 p-4 ring-1 ring-zinc-200">
                        <div className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-zinc-500">
                          Unique ko‘rildi
                        </div>
                        <div className="mt-1 text-[22px] font-black tracking-tight text-zinc-950">
                          {stats ? stats.viewsUnique : pending ? "…" : "—"}
                        </div>
                      </div>
                      <div className="rounded-3xl bg-zinc-50 p-4 ring-1 ring-zinc-200">
                        <div className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-zinc-500">
                          Sevimlilar
                        </div>
                        <div className="mt-1 text-[22px] font-black tracking-tight text-zinc-950">
                          {stats ? stats.favorites : pending ? "…" : "—"}
                        </div>
                      </div>
                    </div>
                    {statsErr ? (
                      <div className="rounded-2xl bg-rose-50 p-3 text-[12px] font-semibold text-rose-900 ring-1 ring-rose-200">
                        {statsErr}
                      </div>
                    ) : null}
                    <div className="rounded-3xl bg-white p-4 ring-1 ring-zinc-200">
                      <div className="text-[12px] font-extrabold text-zinc-950">14 kun · ko‘rilish</div>
                      <div className="mt-3">{stats ? <MiniBars points={stats.views14d} /> : null}</div>
                    </div>
                    <div className="rounded-3xl bg-white p-4 ring-1 ring-zinc-200">
                      <div className="text-[12px] font-extrabold text-zinc-950">14 kun · sevimlilar</div>
                      <div className="mt-3">{stats ? <MiniBars points={stats.favorites14d} /> : null}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => activeListing && loadStats(activeListing.id)}
                      className="inline-flex h-10 items-center justify-center rounded-2xl bg-zinc-950 px-4 text-[12px] font-extrabold text-white ring-1 ring-black/10 hover:bg-zinc-900"
                    >
                      Yangilash
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {sel?.kind === "listing" && activeListing && activeListing.id !== "__profile__" ? (
            <footer className="border-t border-zinc-100 bg-white px-5 py-4">
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/listings/${activeListing.id}`}
                  className="inline-flex h-10 min-w-[calc(50%-0.25rem)] flex-1 items-center justify-center rounded-2xl bg-white px-3 text-[12px] font-extrabold text-zinc-900 ring-1 ring-zinc-200 hover:bg-zinc-50 sm:min-w-0"
                >
                  Ko‘rish
                </Link>
                {activeListing.boostUntil &&
                new Date(activeListing.boostUntil).getTime() > Date.now() ? (
                  <span className="inline-flex h-10 min-w-[calc(50%-0.25rem)] flex-1 items-center justify-center rounded-2xl bg-zinc-100 px-3 text-[11px] font-extrabold text-zinc-600 ring-1 ring-zinc-200 sm:min-w-0">
                    Reklama faol
                  </span>
                ) : (
                  <Link
                    href={`/reklama/${activeListing.id}`}
                    className="inline-flex h-10 min-w-[calc(50%-0.25rem)] flex-1 items-center justify-center rounded-2xl bg-amber-50 px-3 text-[12px] font-extrabold text-amber-900 ring-1 ring-amber-200 hover:bg-amber-100 sm:min-w-0"
                  >
                    Boost
                  </Link>
                )}
                <form action={`/api/listings/${activeListing.id}/refresh`} method="post" className="min-w-[calc(50%-0.25rem)] flex-1 sm:min-w-0">
                  <button
                    type="submit"
                    className="inline-flex h-10 w-full items-center justify-center rounded-2xl bg-white px-3 text-[12px] font-extrabold text-zinc-900 ring-1 ring-zinc-200 hover:bg-zinc-50"
                  >
                    Yangilash
                  </button>
                </form>
                <form action={`/api/listings/${activeListing.id}/delete`} method="post" className="min-w-[calc(50%-0.25rem)] flex-1 sm:min-w-0">
                  <button
                    type="submit"
                    className="inline-flex h-10 w-full items-center justify-center rounded-2xl bg-rose-50 px-3 text-[12px] font-extrabold text-rose-700 ring-1 ring-rose-200 hover:bg-rose-100"
                  >
                    O‘chirish
                  </button>
                </form>
              </div>
            </footer>
          ) : sel?.kind === "profile" ? (
            <footer className="border-t border-zinc-100 bg-white px-5 py-4">
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/listings/new"
                  className="inline-flex h-10 flex-1 items-center justify-center rounded-2xl bg-zinc-950 px-4 text-[12px] font-extrabold text-white ring-1 ring-black/10 hover:bg-zinc-900"
                >
                  E’lon berish
                </Link>
                <Link
                  href="/listings/new/extra"
                  className="inline-flex h-10 flex-1 items-center justify-center rounded-2xl bg-white px-4 text-[12px] font-extrabold text-zinc-900 ring-1 ring-zinc-200 hover:bg-zinc-50"
                >
                  + Qo‘shimcha
                </Link>
              </div>
            </footer>
          ) : null}
        </aside>
      </div>
    </>
  );
}
