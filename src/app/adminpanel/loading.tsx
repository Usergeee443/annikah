export default function AdminLoading() {
  return (
    <div className="grid gap-4">
      <div className="rounded-3xl border border-zinc-200/70 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,.05)]">
        <div className="h-3 w-28 animate-pulse rounded-full bg-zinc-200" />
        <div className="mt-3 h-7 w-56 animate-pulse rounded-xl bg-zinc-200" />
        <div className="mt-2 h-4 w-72 animate-pulse rounded-full bg-zinc-100" />
        <div className="mt-4 flex gap-2">
          <div className="h-10 w-32 animate-pulse rounded-2xl bg-zinc-200" />
          <div className="h-10 w-28 animate-pulse rounded-2xl bg-zinc-100" />
          <div className="h-10 w-28 animate-pulse rounded-2xl bg-zinc-100" />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="rounded-3xl border border-zinc-200/70 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,.04)]"
          >
            <div className="h-3 w-20 animate-pulse rounded-full bg-zinc-200" />
            <div className="mt-3 h-7 w-16 animate-pulse rounded-xl bg-zinc-200" />
            <div className="mt-2 h-3 w-24 animate-pulse rounded-full bg-zinc-100" />
          </div>
        ))}
      </div>

      <div className="grid gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-2xl border border-zinc-200/70 bg-white p-4"
          >
            <div className="grid gap-2">
              <div className="h-4 w-44 animate-pulse rounded-full bg-zinc-200" />
              <div className="h-3 w-32 animate-pulse rounded-full bg-zinc-100" />
            </div>
            <div className="h-9 w-24 animate-pulse rounded-2xl bg-zinc-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
