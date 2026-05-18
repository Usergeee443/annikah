/**
 * URL va API parametrlaridan e’lon ID sini ajratadi — faqat musbat butun son.
 */
export function parseListingIdParam(raw: string | undefined): number | null {
  if (raw === undefined || raw === "") return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 1) return null;
  return n;
}

/** JSON bodydan listingId (son yoki `"123"` qatori). */
export function parseListingIdFromBody(raw: unknown): number | null {
  if (typeof raw === "number" && Number.isInteger(raw) && raw > 0) return raw;
  if (typeof raw === "string") return parseListingIdParam(raw);
  return null;
}
