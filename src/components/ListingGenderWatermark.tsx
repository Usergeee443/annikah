import type { CSSProperties } from "react";

type Variant = "card" | "detailHero" | "sidebar";

/** Faqat ayol (kelin) e’lonlari — hijob vektor rasm, xira fon */
const variantClass: Record<Variant, string> = {
  card: "h-[min(78%,220px)] w-auto max-w-[min(70cqw,240px)] object-contain",
  detailHero: "h-[min(72%,260px)] w-auto max-w-[min(50cqw,280px)] object-contain",
  sidebar: "h-[min(78%,220px)] w-auto max-w-[min(18vw,220px)] object-contain",
};

/**
 * Ayol e’lonlari fonida Pngtree hijob vektori (xira).
 * Erkak (kuyov) e’lonlarida hech narsa ko‘rsatilmaydi.
 */
export default function ListingGenderWatermark({
  category,
  variant,
  className,
  style,
}: {
  category: string;
  variant: Variant;
  /** Chaqiriqlar bilan moslik (kelin/kuyov aniqlash uchun ishlatilmaydi) */
  maskId?: string;
  className?: string;
  style?: CSSProperties;
}) {
  if (category !== "kelinlar") return null;

  return (
    <div
      aria-hidden
      className={
        "pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden " +
        (className || "")
      }
      style={style}
    >
      <img
        src="/watermarks/kelin-hijab.png"
        alt=""
        className={
          variantClass[variant] +
          " opacity-[0.13] drop-shadow-[0_12px_40px_rgba(0,0,0,.18)]"
        }
      />
    </div>
  );
}
