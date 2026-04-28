import Link from "next/link";
import { requireUser } from "@/lib/auth";
import PasswordChangeCard from "@/components/PasswordChangeCard";

export default async function ChangePasswordPage() {
  await requireUser();

  return (
    <div className="grid gap-5">
      <div className="flex items-center gap-3">
        <Link
          href="/profile"
          aria-label="Orqaga"
          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-zinc-900 ring-1 ring-zinc-200 hover:bg-zinc-50"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
            <path d="m15 6-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <div>
          <div className="text-[11px] font-extrabold tracking-widest text-zinc-500">AKKAUNT</div>
          <h1 className="mt-0.5 text-[22px] font-black tracking-tight text-zinc-950">Parolni o‘zgartirish</h1>
        </div>
      </div>

      <PasswordChangeCard />
    </div>
  );
}
