import Link from "next/link";

export default function ChatsIndexPage() {
  return (
    <div className="flex h-full min-h-0 items-center justify-center rounded-3xl border border-zinc-200/70 bg-white/70 shadow-[0_8px_28px_rgba(15,23,42,.05)]">
      <div className="flex flex-col items-center gap-4 px-8 py-12 text-center">
        <div className="relative">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-linear-to-br from-sky-100 to-emerald-100 ring-1 ring-zinc-200/80">
            <svg viewBox="0 0 24 24" className="h-10 w-10 text-zinc-700" fill="none">
              <path
                d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <path
                d="M8 10h8M8 13h5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        <div>
          <div className="text-[18px] font-black tracking-tight text-zinc-950">
            Suhbatni tanlang
          </div>
          <p className="mt-1 max-w-[340px] text-[13px] font-medium text-zinc-600">
            Chap tomondan suhbatni oching yoki yangisini boshlash uchun e’longa so‘rov yuboring.
          </p>
        </div>

        <Link
          href="/"
          className="mt-1 inline-flex h-10 items-center justify-center rounded-2xl bg-zinc-950 px-4 text-[12px] font-extrabold text-white ring-1 ring-black/10 hover:bg-zinc-900"
        >
          E’lonlarga o‘tish
        </Link>
      </div>
    </div>
  );
}
