"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function FavoriteButton({
  listingId,
  initial,
  authed,
  variant = "pill",
}: {
  listingId: string;
  initial: boolean;
  authed: boolean;
  variant?: "pill" | "icon" | "block";
}) {
  const router = useRouter();
  const [favored, setFavored] = useState(initial);
  const [pending, startTransition] = useTransition();

  function toggle(e?: React.MouseEvent) {
    e?.preventDefault();
    e?.stopPropagation();

    if (!authed) {
      router.push("/auth/login");
      return;
    }

    const next = !favored;
    setFavored(next);

    startTransition(async () => {
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
        if (data && typeof data.favored === "boolean") {
          setFavored(data.favored);
        }
        router.refresh();
      } catch {
        setFavored(!next);
      }
    });
  }

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        aria-label={favored ? "Sevimlilardan olib tashlash" : "Sevimlilarga qo‘shish"}
        title={favored ? "Sevimli" : "Sevimli emas"}
        className={
          "inline-flex h-9 w-9 items-center justify-center rounded-full ring-1 shadow-[0_6px_18px_rgba(15,23,42,.16)] transition " +
          (favored
            ? "bg-rose-500 text-white ring-rose-600 hover:bg-rose-600"
            : "bg-white text-zinc-700 ring-zinc-200 hover:bg-zinc-50")
        }
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill={favored ? "currentColor" : "none"}>
          <path
            d="M12 21s-7-4.35-9.5-9A5.5 5.5 0 0 1 12 6.5 5.5 5.5 0 0 1 21.5 12c-2.5 4.65-9.5 9-9.5 9z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    );
  }

  if (variant === "block") {
    return (
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        className={
          "inline-flex h-11 items-center justify-center gap-2 rounded-2xl px-5 text-[12px] font-extrabold tracking-tight ring-1 transition " +
          (favored
            ? "bg-rose-600 text-white ring-rose-700 hover:bg-rose-500"
            : "bg-white text-zinc-950 ring-zinc-200 hover:bg-zinc-50")
        }
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill={favored ? "currentColor" : "none"}>
          <path
            d="M12 21s-7-4.35-9.5-9A5.5 5.5 0 0 1 12 6.5 5.5 5.5 0 0 1 21.5 12c-2.5 4.65-9.5 9-9.5 9z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {favored ? "Sevimli" : "Sevimliga qo‘shish"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      className={
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold ring-1 transition " +
        (favored
          ? "bg-rose-50 text-rose-700 ring-rose-200 hover:bg-rose-100"
          : "bg-white/80 text-zinc-800 ring-zinc-200 hover:bg-white")
      }
    >
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill={favored ? "currentColor" : "none"}>
        <path
          d="M12 21s-7-4.35-9.5-9A5.5 5.5 0 0 1 12 6.5 5.5 5.5 0 0 1 21.5 12c-2.5 4.65-9.5 9-9.5 9z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {favored ? "Sevimli" : "Sevimli emas"}
    </button>
  );
}
