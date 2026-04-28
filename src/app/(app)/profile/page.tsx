import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

function statusPill(s: string) {
  if (s === "approved") return "bg-emerald-50 text-emerald-800 ring-emerald-200";
  if (s === "pending") return "bg-amber-50 text-amber-900 ring-amber-200";
  if (s === "rejected") return "bg-rose-50 text-rose-800 ring-rose-200";
  return "bg-zinc-100 text-zinc-700 ring-zinc-200";
}

function statusLabel(s: string) {
  if (s === "approved") return "Tasdiqlangan";
  if (s === "pending") return "Moderatsiyada";
  if (s === "rejected") return "Rad etilgan";
  return s;
}

export default async function ProfileHubPage() {
  const user = await requireUser();
  const authProvider = (user as any).authProvider as string | undefined;
  const phone = (user as any).phone as string | null | undefined;

  const listings = await db.listing.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      name: true,
      age: true,
      category: true,
      moderationStatus: true,
      active: true,
      expiresAt: true,
      createdAt: true,
    },
  });

  return (
    <div className="grid gap-5">
      <div>
        <div className="text-[11px] font-extrabold tracking-widest text-zinc-500">PROFIL</div>
        <h1 className="mt-1 text-[26px] font-black tracking-tight text-zinc-950">Profil</h1>
      </div>

      {/* Account mini */}
      <div className="rounded-3xl border border-zinc-200/70 bg-white/80 p-5 shadow-sm backdrop-blur">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[12px] font-extrabold tracking-widest text-zinc-500">AKKAUNT</div>
            <div className="mt-2 text-[15px] font-black tracking-tight text-zinc-950">Hisob ma’lumotlari</div>
            <div className="mt-1 text-[13px] font-semibold text-zinc-600">
              {authProvider === "telegram"
                ? `Telefon: ${phone || "—"}`
                : `Email: ${user.email}`}
            </div>
          </div>

          <Link
            href="/profile/wizard"
            className="inline-flex h-10 items-center justify-center rounded-2xl bg-white px-4 text-[12px] font-extrabold text-zinc-900 ring-1 ring-zinc-200 hover:bg-zinc-50"
          >
            Profilni tahrirlash
          </Link>
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

      {/* Yordam CTA */}
      <div className="rounded-3xl bg-linear-to-r from-zinc-50/90 via-white to-zinc-50/80 px-1 py-5 sm:px-2">
        <div className="grid gap-4 sm:flex sm:flex-wrap sm:items-center sm:gap-7">
          <div className="flex items-center gap-5 sm:flex-1 sm:gap-7">
            <div className="relative h-[88px] w-[88px] shrink-0 sm:h-[104px] sm:w-[104px]">
              <Image src="/chat.svg" alt="Yordam" fill sizes="104px" className="object-contain" priority />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[clamp(20px,4vw,28px)] font-black leading-[1.1] tracking-tight text-zinc-950">
                Yordam — admin bilan chat
              </div>
              <div className="mt-2 max-w-xl text-[13px] font-medium leading-relaxed text-zinc-600 sm:text-[14px]">
                Savol yoki muammo bo‘lsa, shu yerda yozing. Javoblar ham shu chat orqali keladi.
              </div>
            </div>
          </div>

          <Link
            href="/help"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-sky-500 via-indigo-500 to-cyan-400 px-6 text-[12px] font-extrabold text-white ring-1 ring-sky-600/30 shadow-[0_14px_34px_rgba(59,130,246,.20)] transition hover:from-sky-400 hover:via-indigo-500 hover:to-cyan-300 sm:h-12 sm:w-auto sm:px-7"
          >
            Admin bilan yozish
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

        {listings.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-zinc-300 bg-white/60 p-8 text-center">
            <div className="text-[14px] font-extrabold text-zinc-950">Hali e’lon yo‘q</div>
            <div className="mt-1 text-[12.5px] font-medium text-zinc-600">Yangi e’lon qo‘shing.</div>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((l) => (
              <Link
                key={l.id}
                href={`/listings/${l.id}`}
                className="rounded-3xl border border-zinc-200/70 bg-white/80 p-4 shadow-sm backdrop-blur transition hover:bg-white"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-[15px] font-black tracking-tight text-zinc-950">
                      {l.name} <span className="text-zinc-500 font-extrabold">{l.age} yosh</span>
                    </div>
                    <div className="mt-1 text-[12.5px] font-semibold text-zinc-600">
                      {l.category === "kelinlar" ? "Kelin" : "Kuyov"}
                    </div>
                  </div>
                  <span
                    className={
                      "inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] font-extrabold ring-1 " +
                      statusPill(l.moderationStatus)
                    }
                  >
                    {statusLabel(l.moderationStatus)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

