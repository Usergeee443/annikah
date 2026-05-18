import type { CSSProperties } from "react";

type Variant = "card" | "detailHero" | "sidebar";

const variantClass: Record<Variant, string> = {
  card: "h-[min(78%,220px)] w-auto max-w-[min(70cqw,240px)] object-contain",
  detailHero: "h-[min(72%,260px)] w-auto max-w-[min(50cqw,280px)] object-contain",
  sidebar: "h-[min(78%,220px)] w-auto max-w-[min(18vw,220px)] object-contain",
};

/**
 * E’lon fonidagi xira watermark:
 * - kelinlar: hijob png
 * - kuyovlar: man-muslim svg
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
  const src =
    category === "kelinlar"
      ? "/watermarks/kelin-hijab.png"
      : category === "kuyovlar"
        ? "/man-muslim-svgrepo-com.svg"
        : null;
  if (!src) return null;

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
        src={src}
        alt=""
        className={
          variantClass[variant] +
          " opacity-[0.13] mix-blend-soft-light drop-shadow-[0_12px_40px_rgba(0,0,0,.18)]"
        }
      />
    </div>
  );
}
