"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";

type RequestStatus = "none" | "pending" | "accepted" | "rejected" | "cancelled";

type TocItem = {
  id: string;
  label: string;
  icon?: ReactNode;
};

type Props = {
  listingId: string;
  name: string;
  age: number;
  category: "kelinlar" | "kuyovlar" | string;
  city: string;
  country: string;
  authed: boolean;
  isOwner: boolean;
  isFav: boolean;
  requestStatus: RequestStatus;
  chatId: string | null;
  tocItems: TocItem[];
};

export default function ListingSidebar({
  listingId,
  name,
  age,
  category,
  city,
  country,
  authed,
  isOwner,
  isFav,
  requestStatus,
  chatId,
  tocItems,
}: Props) {
  const router = useRouter();
  const initial = (name?.trim()[0] || "?").toUpperCase();
  const isKelin = category === "kelinlar";
  const heroGradient = isKelin
    ? "from-rose-400 via-fuchsia-500 to-rose-700"
    : "from-sky-400 via-indigo-500 to-blue-700";

  const [favored, setFavored] = useState(isFav);
  const [favPending, startFav] = useTransition();
  const [reqStatus, setReqStatus] = useState<RequestStatus>(requestStatus);
  const [reqPending, startReq] = useTransition();
  const [reqError, setReqError] = useState<string | null>(null);

  function toggleFavorite() {
    if (!authed) {
      router.push("/auth/login");
      return;
    }
    const next = !favored;
    setFavored(next);
    startFav(async () => {
      try {
        const res = await fetch("/api/favorites", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ listingId }),
        });
        if (!res.ok) {
          setFavored(!next);
          return;
        }
        const data = await res.json().catch(() => null);
        if (data && typeof data.favored === "boolean") setFavored(data.favored);
        router.refresh();
      } catch {
        setFavored(!next);
      }
    });
  }

  function sendRequest() {
    if (!authed) {
      router.push("/auth/login");
      return;
    }
    setReqError(null);
    startReq(async () => {
      try {
        const res = await fetch("/api/requests", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ listingId }),
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          if (data?.error === "PROFILE_INCOMPLETE") {
            router.push("/profile/wizard");
            return;
          }
          setReqError(data?.error || "Xatolik");
          return;
        }
        setReqStatus((data?.status as RequestStatus) || "pending");
        router.refresh();
      } catch {
        setReqError("Tarmoq xatosi");
      }
    });
  }

  function handleTocClick(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
    if (typeof document === "undefined") return;
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    if (typeof window !== "undefined" && window.history?.replaceState) {
      window.history.replaceState(null, "", `#${id}`);
    }
    el.classList.remove("scroll-pulse");
    void el.offsetWidth;
    el.classList.add("scroll-pulse");
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:grid lg:gap-3 lg:sticky lg:top-20 lg:self-start">
        {/* Profile mini */}
        <section className="overflow-hidden rounded-3xl bg-white ring-1 ring-zinc-200/80 shadow-[0_8px_28px_rgba(15,23,42,.05)]">
          <div className={"relative h-32 bg-linear-to-br " + heroGradient}>
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,.35),transparent_60%)]"
            />
            <div className="absolute left-3 top-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex h-6 items-center rounded-full bg-white/20 px-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-white ring-1 ring-white/30 backdrop-blur">
                {isKelin ? "Kelin" : "Kuyov"}
              </span>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                aria-hidden
                className="select-none font-black tracking-[-0.04em] text-white/95 drop-shadow-[0_8px_22px_rgba(0,0,0,.25)]"
                style={{ fontSize: "84px", lineHeight: 1 }}
              >
                {initial}
              </span>
            </div>
          </div>
          <div className="px-5 pb-5 pt-4">
            <div className="truncate text-[20px] font-black tracking-tight text-zinc-950">
              {name}
            </div>
            <div className="mt-1 text-[12.5px] font-semibold text-zinc-500">
              {age} yosh · {city}
              {country ? ` · ${country}` : ""}
            </div>
          </div>
        </section>

        {/* Request CTA */}
        {!isOwner ? (
          <section className="rounded-3xl bg-linear-to-br from-indigo-50 via-white to-sky-50 p-4 ring-1 ring-indigo-100/80 shadow-[0_8px_28px_rgba(79,70,229,.06)]">
            <div className="flex items-center gap-3">
              <div className="relative h-14 w-14 shrink-0">
                <Image src="/mail.svg" alt="So'rov" fill sizes="56px" className="object-contain" />
              </div>
              <div className="min-w-0">
                <div className="text-[15px] font-black tracking-tight text-zinc-950">
                  So‘rov yuboring
                </div>
                <div className="mt-0.5 text-[11.5px] font-medium leading-snug text-zinc-600">
                  Egasiga xabar bering, qabul qilsa o‘zaro suhbat ochiladi.
                </div>
              </div>
            </div>
            <div className="mt-3">{renderRequestAction()}</div>
            {reqError ? (
              <div className="mt-2 text-[11px] font-extrabold text-rose-700">{reqError}</div>
            ) : null}
          </section>
        ) : (
          <section className="rounded-3xl bg-zinc-100 p-4 ring-1 ring-zinc-200">
            <div className="text-[12px] font-extrabold text-zinc-700">Bu sizning e’loningiz</div>
            <p className="mt-1 text-[11.5px] font-medium text-zinc-500">
              Boshqalar shu yerdan sizga so‘rov yuboradi.
            </p>
          </section>
        )}

        {/* Favorite CTA */}
        {!isOwner ? (
          <section className="rounded-3xl bg-linear-to-br from-rose-50 via-white to-pink-50 p-4 ring-1 ring-rose-100 shadow-[0_8px_28px_rgba(244,63,94,.06)]">
            <div className="flex items-center gap-3">
              <div className="relative h-14 w-14 shrink-0">
                <Image
                  src="/flower.svg"
                  alt="Sevimli"
                  fill
                  sizes="56px"
                  className="object-contain"
                />
              </div>
              <div className="min-w-0">
                <div className="text-[15px] font-black tracking-tight text-zinc-950">
                  {favored ? "Sevimlilarda" : "Sevimliga saqlang"}
                </div>
                <div className="mt-0.5 text-[11.5px] font-medium leading-snug text-zinc-600">
                  {favored
                    ? "Bu e’lon ro‘yxatda turibdi."
                    : "Keyinroq qaytib ko‘rish uchun saqlang."}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleFavorite}
              disabled={favPending}
              className={
                "mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl px-4 text-[12px] font-extrabold tracking-tight transition disabled:opacity-70 " +
                (favored
                  ? "bg-white text-rose-700 ring-1 ring-rose-200 hover:bg-rose-50"
                  : "bg-linear-to-r from-rose-500 via-pink-500 to-rose-600 text-white ring-1 ring-rose-700/30 shadow-[0_14px_30px_rgba(244,63,94,.22)] hover:from-rose-400 hover:via-pink-500 hover:to-rose-600")
              }
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill={favored ? "currentColor" : "none"}
                aria-hidden
              >
                <path
                  d="M12 21s-7-4.35-9.5-9A5.5 5.5 0 0 1 12 6.5 5.5 5.5 0 0 1 21.5 12c-2.5 4.65-9.5 9-9.5 9z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {favored ? "Sevimlilardan olib tashlash" : "Sevimliga qo‘shish"}
            </button>
          </section>
        ) : null}

        {/* TOC anchor links — kompakt matn ro'yxati */}
        {tocItems.length > 0 ? (
          <section className="px-1">
            <div className="mb-1 px-2 text-[9.5px] font-extrabold uppercase tracking-[0.2em] text-zinc-400">
              Bo‘limlar
            </div>
            <nav className="grid">
              {tocItems.map((t) => (
                <a
                  key={t.id}
                  href={`#${t.id}`}
                  onClick={(e) => handleTocClick(e, t.id)}
                  className="group flex items-center justify-between gap-2 px-2 py-1.5 text-[12.5px] font-medium text-zinc-600 transition hover:text-zinc-950"
                >
                  <span className="min-w-0 flex-1 truncate">{t.label}</span>
                  <svg
                    viewBox="0 0 24 24"
                    className="h-3 w-3 shrink-0 text-zinc-300 transition group-hover:translate-x-0.5 group-hover:text-zinc-700"
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d="m9 6 6 6-6 6"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              ))}
            </nav>
          </section>
        ) : null}
      </aside>

      {/* Mobile fixed bottom action bar */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 lg:hidden"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 10px)" }}
      >
        <div
          className="mx-3 rounded-3xl border border-white/40 bg-white/90 p-2 shadow-[0_18px_40px_rgba(15,23,42,.18),inset_0_1px_0_rgba(255,255,255,.7)] [backdrop-filter:blur(20px)_saturate(180%)] [-webkit-backdrop-filter:blur(20px)_saturate(180%)]"
        >
          {isOwner ? (
            <div className="grid h-12 place-items-center rounded-2xl bg-zinc-100 text-[12.5px] font-extrabold text-zinc-700 ring-1 ring-zinc-200">
              Bu sizning e’loningiz
            </div>
          ) : (
            <div className="flex items-stretch gap-2">
              <button
                type="button"
                onClick={toggleFavorite}
                disabled={favPending}
                aria-label={favored ? "Sevimlilardan olib tashlash" : "Sevimliga qo‘shish"}
                className={
                  "inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-1 transition disabled:opacity-70 " +
                  (favored
                    ? "bg-rose-500 text-white ring-rose-600 shadow-[0_10px_24px_rgba(244,63,94,.30)] hover:bg-rose-600"
                    : "bg-white text-rose-600 ring-rose-200 hover:bg-rose-50")
                }
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill={favored ? "currentColor" : "none"}
                  aria-hidden
                >
                  <path
                    d="M12 21s-7-4.35-9.5-9A5.5 5.5 0 0 1 12 6.5 5.5 5.5 0 0 1 21.5 12c-2.5 4.65-9.5 9-9.5 9z"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {renderMobileRequest()}
            </div>
          )}
          {reqError ? (
            <div className="mt-2 px-2 text-center text-[11px] font-extrabold text-rose-700">
              {reqError}
            </div>
          ) : null}
        </div>
      </div>
    </>
  );

  function renderRequestAction() {
    if (reqStatus === "accepted" && chatId) {
      return (
        <a
          href={`/chats/${chatId}`}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-emerald-500 to-emerald-600 px-4 text-[12px] font-extrabold text-white ring-1 ring-emerald-700/30 shadow-[0_10px_24px_rgba(16,185,129,.22)] transition hover:from-emerald-400 hover:to-emerald-500"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
            <path
              d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"
              stroke="currentColor"
              strokeWidth="1.8"
            />
          </svg>
          Chatga o‘tish
        </a>
      );
    }
    if (reqStatus === "pending") {
      return (
        <div className="inline-flex h-11 w-full items-center justify-center rounded-2xl bg-amber-50 px-4 text-[12px] font-extrabold text-amber-800 ring-1 ring-amber-200">
          So‘rov yuborilgan · Kutilmoqda
        </div>
      );
    }
    if (reqStatus === "rejected") {
      return (
        <div className="inline-flex h-11 w-full items-center justify-center rounded-2xl bg-rose-50 px-4 text-[12px] font-extrabold text-rose-800 ring-1 ring-rose-200">
          So‘rov rad etilgan
        </div>
      );
    }
    return (
      <button
        type="button"
        onClick={sendRequest}
        disabled={reqPending}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-indigo-500 via-violet-500 to-sky-500 px-4 text-[12px] font-extrabold text-white ring-1 ring-indigo-600/30 shadow-[0_14px_30px_rgba(99,102,241,.22)] transition hover:from-indigo-400 hover:via-violet-500 hover:to-sky-500 disabled:opacity-70"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
          <path
            d="m22 2-7 20-4-9-9-4z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {reqPending ? "Yuborilmoqda…" : "So‘rov yuborish"}
      </button>
    );
  }

  function renderMobileRequest() {
    if (reqStatus === "accepted" && chatId) {
      return (
        <a
          href={`/chats/${chatId}`}
          className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-emerald-500 to-emerald-600 px-4 text-[13px] font-extrabold text-white ring-1 ring-emerald-700/30 shadow-[0_10px_24px_rgba(16,185,129,.28)] transition hover:from-emerald-400 hover:to-emerald-500"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
            <path
              d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"
              stroke="currentColor"
              strokeWidth="1.8"
            />
          </svg>
          Chatga o‘tish
        </a>
      );
    }
    if (reqStatus === "pending") {
      return (
        <div className="inline-flex h-12 flex-1 items-center justify-center rounded-2xl bg-amber-50 px-4 text-[12.5px] font-extrabold text-amber-800 ring-1 ring-amber-200">
          So‘rov yuborilgan · Kutilmoqda
        </div>
      );
    }
    if (reqStatus === "rejected") {
      return (
        <div className="inline-flex h-12 flex-1 items-center justify-center rounded-2xl bg-rose-50 px-4 text-[12.5px] font-extrabold text-rose-800 ring-1 ring-rose-200">
          So‘rov rad etilgan
        </div>
      );
    }
    return (
      <button
        type="button"
        onClick={sendRequest}
        disabled={reqPending}
        className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-indigo-500 via-violet-500 to-sky-500 px-4 text-[13px] font-extrabold text-white ring-1 ring-indigo-600/30 shadow-[0_14px_30px_rgba(99,102,241,.30)] transition hover:from-indigo-400 hover:via-violet-500 hover:to-sky-500 disabled:opacity-70"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
          <path
            d="m22 2-7 20-4-9-9-4z"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {reqPending ? "Yuborilmoqda…" : "So‘rov yuborish"}
      </button>
    );
  }
}
