import type { ReactNode } from "react";
import Image from "next/image";

export type ListingSectionAccent =
  | "indigo"
  | "rose"
  | "amber"
  | "emerald"
  | "sky"
  | "fuchsia"
  | "violet"
  | "zinc";

const ACCENTS: Record<ListingSectionAccent, { tint: string }> = {
  indigo: { tint: "from-indigo-50/90 via-white to-indigo-50/40" },
  rose: { tint: "from-rose-50/90 via-white to-rose-50/40" },
  amber: { tint: "from-amber-50/90 via-white to-amber-50/40" },
  emerald: { tint: "from-emerald-50/90 via-white to-emerald-50/40" },
  sky: { tint: "from-sky-50/90 via-white to-sky-50/40" },
  fuchsia: { tint: "from-fuchsia-50/90 via-white to-fuchsia-50/40" },
  violet: { tint: "from-violet-50/90 via-white to-violet-50/40" },
  zinc: { tint: "from-zinc-50/90 via-white to-zinc-50/40" },
};

export function ListingDetailSection({
  id,
  title,
  accent,
  iconSrc,
  children,
}: {
  id?: string;
  title: string;
  accent: ListingSectionAccent;
  iconSrc: string;
  children: ReactNode;
}) {
  const a = ACCENTS[accent];
  return (
    <section
      id={id}
      className={"scroll-mt-24 overflow-hidden rounded-[32px] bg-linear-to-br " + a.tint}
    >
      <div className="flex items-center gap-3 px-5 pb-3 pt-5">
        <span className="inline-flex shrink-0" aria-hidden>
          <Image
            src={iconSrc}
            alt=""
            width={28}
            height={28}
            className="h-7 w-7 object-contain"
            unoptimized
          />
        </span>
        <h2 className="min-w-0 flex-1 text-[13px] font-bold uppercase tracking-[0.14em] text-zinc-900">
          {title}
        </h2>
      </div>
      <div className="px-5 pb-5 pt-0">{children}</div>
    </section>
  );
}

export function ListingDetailDl({
  rows,
}: {
  rows: Array<{ k: string; v: string }>;
}) {
  return (
    <dl className="grid gap-4 sm:grid-cols-2">
      {rows.map((r) => (
        <div key={r.k}>
          <dt className="text-[12px] font-semibold uppercase tracking-wide text-zinc-400">{r.k}</dt>
          <dd className="mt-2 text-base font-bold tracking-normal text-zinc-950">{r.v}</dd>
        </div>
      ))}
    </dl>
  );
}
