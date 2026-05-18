"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProfileAccountActions() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    router.push("/auth/login");
    router.refresh();
  }

  const iconBtn =
    "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-zinc-700 ring-1 ring-zinc-200 transition hover:bg-zinc-50 hover:text-zinc-950 active:scale-[0.98]";

  return (
    <div className="flex shrink-0 items-center gap-2">
      <Link href="/profile/wizard" aria-label="Profilni tahrirlash" title="Profilni tahrirlash" className={iconBtn}>
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" aria-hidden="true">
          <path
            d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Link>
      <button type="button" onClick={logout} aria-label="Chiqish" title="Chiqish" className={iconBtn}>
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" aria-hidden="true">
          <path
            d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
