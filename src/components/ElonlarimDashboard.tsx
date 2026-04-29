"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import ListingCard from "@/components/ListingCard";

export type ElonlarimListingPayload = {
  id: string;
  viewsCount?: number;
  likesCount?: number;
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

  const ordered = useMemo(() => {
    return [...listings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [listings]);

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
      viewsCount: typeof l.viewsCount === "number" ? l.viewsCount : 0,
      likesCount: typeof l.likesCount === "number" ? l.likesCount : 0,
      hideFavorite: true,
      disableLink: true,
      coverBadge: pin ? ("pin" as const) : ("category" as const),
      onPress: () => {
        if (l.id === "__profile__") openProfileDrawer();
        else openListingDrawer(l.id);
      },
    };
  }

  function inputCls() {
    return "h-11 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-[13px] font-semibold text-zinc-900 outline-none transition focus:border-zinc-300 focus:shadow-[0_0_0_4px_rgba(24,24,27,.06)]";
  }

  function toNum(v: string) {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }

  function SectionEdit({
    title,
    subtitle,
    editing,
    onEdit,
    onCancel,
    onSave,
    children,
  }: {
    title: string;
    subtitle?: string;
    editing: boolean;
    onEdit: () => void;
    onCancel: () => void;
    onSave: () => void;
    children: React.ReactNode;
  }) {
    return (
      <div className="rounded-3xl border border-zinc-200/70 bg-white p-4 shadow-[0_8px_28px_rgba(15,23,42,.05)] sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-zinc-500">{title}</div>
            {subtitle ? <div className="mt-1 text-[12.5px] font-semibold text-zinc-600">{subtitle}</div> : null}
          </div>
          {!editing ? (
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-zinc-900 ring-1 ring-zinc-200 hover:bg-zinc-50"
              aria-label="Tahrirlash"
              title="Tahrirlash"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                <path
                  d="M12 20h9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="inline-flex h-10 items-center justify-center rounded-2xl bg-white px-4 text-[12px] font-extrabold text-zinc-900 ring-1 ring-zinc-200 hover:bg-zinc-50"
              >
                Bekor
              </button>
              <button
                type="button"
                onClick={onSave}
                className="inline-flex h-10 items-center justify-center rounded-2xl bg-zinc-950 px-4 text-[12px] font-extrabold text-white ring-1 ring-black/10 hover:bg-zinc-900"
              >
                Saqlash
              </button>
            </div>
          )}
        </div>
        <div className="mt-4">{children}</div>
      </div>
    );
  }

  return (
    <>
      {/* Grid — asosiy sahifadagi kabi */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {ordered.map((l) => (
          <ListingCard key={l.id} {...cardProps(l, false)} />
        ))}
        {syntheticFromProfile ? <ListingCard {...cardProps(syntheticFromProfile, true)} /> : null}
      </div>

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
            // Mobile: bottomsheet, Desktop: right sidebar
            "absolute flex flex-col bg-white/95 shadow-[0_24px_80px_rgba(15,23,42,.35)] backdrop-blur-xl transition-transform duration-300 ease-out " +
            "inset-x-0 bottom-0 max-h-[88dvh] w-full rounded-t-[28px] md:inset-x-auto md:bottom-auto md:right-0 md:top-0 md:h-full md:max-h-none md:w-[min(520px,94vw)] md:rounded-none md:border-l md:border-zinc-200/70 " +
            (open ? "translate-y-0 md:translate-x-0" : "translate-y-full md:translate-y-0 md:translate-x-full")
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
              <EditPanel
                sel={sel}
                profile={profile}
                userEmail={userEmail}
                listing={activeListing}
                inputCls={inputCls}
                toNum={toNum}
                SectionEdit={SectionEdit}
                onSaved={() => {
                  // Refresh cards / stats after save
                  window.location.reload();
                }}
              />
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

function EditPanel({
  sel,
  profile,
  userEmail,
  listing,
  inputCls,
  toNum,
  SectionEdit,
  onSaved,
}: {
  sel: null | { kind: "profile" } | { kind: "listing"; id: string };
  profile: ElonlarimProfilePayload | null;
  userEmail: string;
  listing: ElonlarimListingPayload | null;
  inputCls: () => string;
  toNum: (v: string) => number | null;
  SectionEdit: React.ComponentType<{
    title: string;
    subtitle?: string;
    editing: boolean;
    onEdit: () => void;
    onCancel: () => void;
    onSave: () => void;
    children: React.ReactNode;
  }>;
  onSaved: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<ElonlarimListingPayload | null>(listing);

  useEffect(() => {
    setDraft(listing);
    setEditing(null);
    setErr(null);
  }, [listing?.id]);

  if (!sel) return null;

  if (sel.kind === "profile") {
    return (
      <div className="grid gap-3">
        <div className="rounded-3xl bg-zinc-50 p-5 text-[13px] font-medium leading-relaxed text-zinc-600 ring-1 ring-zinc-200">
          E’lon yaratish yoki e’lon ma’lumotlarini tahrirlash uchun profilingiz to‘liq bo‘lishi kerak.
        </div>
        <Link
          href="/profile/wizard"
          className="inline-flex h-11 items-center justify-center rounded-2xl bg-zinc-950 px-5 text-[12px] font-extrabold text-white ring-1 ring-black/10 hover:bg-zinc-900"
        >
          Profilni to‘ldirish
        </Link>
      </div>
    );
  }

  if (!listing || !draft) {
    return (
      <div className="rounded-3xl bg-zinc-50 p-5 text-[13px] font-medium text-zinc-600 ring-1 ring-zinc-200">
        E’lon topilmadi.
      </div>
    );
  }

  const listingId = listing.id;

  function save(part: Partial<ElonlarimListingPayload>) {
    setErr(null);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/listings/${listingId}/update`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(part),
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) throw new Error(data?.error || "Saqlab bo‘lmadi");
        setEditing(null);
        onSaved();
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Xatolik");
      }
    });
  }

  const S = SectionEdit;

  return (
    <div className="grid gap-3">
      <S
        title="Asosiy"
        subtitle={`${listing.name} · ${listing.age} · ${listing.city}`}
        editing={editing === "basic"}
        onEdit={() => setEditing("basic")}
        onCancel={() => {
          setDraft(listing);
          setEditing(null);
        }}
        onSave={() =>
          save({
            name: draft.name,
            age: draft.age,
            country: draft.country,
            region: draft.region,
            city: draft.city,
            nationality: draft.nationality,
          })
        }
      >
        {editing === "basic" ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <input className={inputCls()} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Ism" />
            <input className={inputCls()} type="number" value={draft.age} onChange={(e) => setDraft({ ...draft, age: Number(e.target.value) })} placeholder="Yosh" />
            <input className={inputCls()} value={draft.country} onChange={(e) => setDraft({ ...draft, country: e.target.value })} placeholder="Davlat" />
            <input className={inputCls()} value={draft.region} onChange={(e) => setDraft({ ...draft, region: e.target.value })} placeholder="Viloyat" />
            <input className={inputCls()} value={draft.city} onChange={(e) => setDraft({ ...draft, city: e.target.value })} placeholder="Shahar" />
            <input className={inputCls()} value={draft.nationality} onChange={(e) => setDraft({ ...draft, nationality: e.target.value })} placeholder="Millat" />
          </div>
        ) : (
          <div className="grid gap-2 text-[13px] font-semibold text-zinc-700">
            <div>Davlat: <span className="font-extrabold text-zinc-950">{listing.country}</span></div>
            <div>Joy: <span className="font-extrabold text-zinc-950">{listing.region}, {listing.city}</span></div>
            <div>Millat: <span className="font-extrabold text-zinc-950">{listing.nationality}</span></div>
          </div>
        )}
      </S>

      <S
        title="Jismoniy"
        subtitle={`${listing.heightCm} sm · ${listing.weightKg} kg`}
        editing={editing === "phys"}
        onEdit={() => setEditing("phys")}
        onCancel={() => {
          setDraft(listing);
          setEditing(null);
        }}
        onSave={() =>
          save({
            heightCm: draft.heightCm,
            weightKg: draft.weightKg,
            sportPerWeek: draft.sportPerWeek,
            smokes: draft.smokes,
          })
        }
      >
        {editing === "phys" ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <input className={inputCls()} type="number" value={draft.heightCm} onChange={(e) => setDraft({ ...draft, heightCm: Number(e.target.value) })} placeholder="Bo‘y (sm)" />
            <input className={inputCls()} type="number" value={draft.weightKg} onChange={(e) => setDraft({ ...draft, weightKg: Number(e.target.value) })} placeholder="Vazn (kg)" />
            <input className={inputCls()} type="number" value={draft.sportPerWeek ?? ""} onChange={(e) => setDraft({ ...draft, sportPerWeek: e.target.value ? Number(e.target.value) : null })} placeholder="Sport/hafta (0-14)" />
            <select className={inputCls()} value={draft.smokes === null ? "" : draft.smokes ? "yes" : "no"} onChange={(e) => setDraft({ ...draft, smokes: e.target.value === "" ? null : e.target.value === "yes" })}>
              <option value="">Sigaret: Bilinmaydi</option>
              <option value="no">Chekmaydi</option>
              <option value="yes">Chekadi</option>
            </select>
          </div>
        ) : (
          <div className="grid gap-2 text-[13px] font-semibold text-zinc-700">
            <div>Bo‘y/vazn: <span className="font-extrabold text-zinc-950">{listing.heightCm} sm · {listing.weightKg} kg</span></div>
          </div>
        )}
      </S>

      <S
        title="Diniy"
        subtitle={`${listing.aqeeda} · ${listing.prayer}`}
        editing={editing === "relig"}
        onEdit={() => setEditing("relig")}
        onCancel={() => {
          setDraft(listing);
          setEditing(null);
        }}
        onSave={() => save({ aqeeda: draft.aqeeda, prayer: draft.prayer, quran: draft.quran, madhab: draft.madhab })}
      >
        {editing === "relig" ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <input className={inputCls()} value={draft.aqeeda} onChange={(e) => setDraft({ ...draft, aqeeda: e.target.value })} placeholder="Aqida" />
            <input className={inputCls()} value={draft.prayer} onChange={(e) => setDraft({ ...draft, prayer: e.target.value })} placeholder="Namoz" />
            <input className={inputCls()} value={draft.quran} onChange={(e) => setDraft({ ...draft, quran: e.target.value })} placeholder="Qur’on" />
            <input className={inputCls()} value={draft.madhab} onChange={(e) => setDraft({ ...draft, madhab: e.target.value })} placeholder="Mazhab" />
          </div>
        ) : (
          <div className="grid gap-2 text-[13px] font-semibold text-zinc-700">
            <div>Aqida: <span className="font-extrabold text-zinc-950">{listing.aqeeda}</span></div>
            <div>Namoz: <span className="font-extrabold text-zinc-950">{listing.prayer}</span></div>
          </div>
        )}
      </S>

      <S
        title="Juftga talab"
        subtitle={`${listing.partnerAgeFrom ?? "—"}–${listing.partnerAgeTo ?? "—"}`}
        editing={editing === "partner"}
        onEdit={() => setEditing("partner")}
        onCancel={() => {
          setDraft(listing);
          setEditing(null);
        }}
        onSave={() =>
          save({
            partnerAgeFrom: draft.partnerAgeFrom,
            partnerAgeTo: draft.partnerAgeTo,
            partnerCountries: draft.partnerCountries,
            partnerRegions: draft.partnerRegions,
            partnerCities: draft.partnerCities,
          })
        }
      >
        {editing === "partner" ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <input className={inputCls()} type="number" value={draft.partnerAgeFrom ?? ""} onChange={(e) => setDraft({ ...draft, partnerAgeFrom: toNum(e.target.value) })} placeholder="Yosh dan" />
            <input className={inputCls()} type="number" value={draft.partnerAgeTo ?? ""} onChange={(e) => setDraft({ ...draft, partnerAgeTo: toNum(e.target.value) })} placeholder="Yosh gacha" />
            <input className={inputCls()} value={draft.partnerCountries || ""} onChange={(e) => setDraft({ ...draft, partnerCountries: e.target.value })} placeholder="Davlatlar" />
            <input className={inputCls()} value={draft.partnerRegions || ""} onChange={(e) => setDraft({ ...draft, partnerRegions: e.target.value })} placeholder="Viloyatlar" />
            <input className={inputCls()} value={draft.partnerCities || ""} onChange={(e) => setDraft({ ...draft, partnerCities: e.target.value })} placeholder="Shaharlar" />
          </div>
        ) : (
          <div className="grid gap-2 text-[13px] font-semibold text-zinc-700">
            <div>Yosh: <span className="font-extrabold text-zinc-950">{listing.partnerAgeFrom ?? "—"}–{listing.partnerAgeTo ?? "—"}</span></div>
          </div>
        )}
      </S>

      <S
        title="O‘zim haqimda"
        subtitle="Tavsif"
        editing={editing === "about"}
        onEdit={() => setEditing("about")}
        onCancel={() => {
          setDraft(listing);
          setEditing(null);
        }}
        onSave={() => save({ about: draft.about })}
      >
        {editing === "about" ? (
          <textarea
            className="min-h-[120px] w-full resize-none rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-[13px] font-medium text-zinc-900 outline-none transition focus:border-zinc-300 focus:shadow-[0_0_0_4px_rgba(24,24,27,.06)]"
            value={draft.about || ""}
            onChange={(e) => setDraft({ ...draft, about: e.target.value })}
            placeholder="Qisqacha…"
          />
        ) : (
          <div className="text-[13px] font-medium leading-relaxed text-zinc-700">
            {listing.about ? listing.about : "—"}
          </div>
        )}
      </S>

      {pending && !err ? (
        <div className="text-center text-[12px] font-extrabold text-zinc-500">Saqlanmoqda…</div>
      ) : null}
      {err ? <div className="rounded-2xl bg-rose-50 p-3 text-[12px] font-semibold text-rose-900 ring-1 ring-rose-200">{err}</div> : null}
    </div>
  );
}
