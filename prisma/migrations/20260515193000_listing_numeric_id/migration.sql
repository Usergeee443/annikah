-- E’lon ID: TEXT (cuid) → INTEGER (autoincrement)
-- DIQQAT: barcha e’lonlar, sevimlilar, ko‘rishlar va so‘rovlar o‘chiriladi.

DELETE FROM "ListingView";
DELETE FROM "Favorite";
DELETE FROM "Request";
DELETE FROM "Listing";

ALTER TABLE "ListingView" DROP CONSTRAINT IF EXISTS "ListingView_listingId_fkey";
ALTER TABLE "Favorite" DROP CONSTRAINT IF EXISTS "Favorite_listingId_fkey";
ALTER TABLE "Request" DROP CONSTRAINT IF EXISTS "Request_listingId_fkey";

ALTER TABLE "Listing" DROP CONSTRAINT "Listing_pkey";

ALTER TABLE "Listing" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "Listing" ALTER COLUMN "id" TYPE INTEGER;

ALTER TABLE "ListingView" ALTER COLUMN "listingId" TYPE INTEGER;
ALTER TABLE "Favorite" ALTER COLUMN "listingId" TYPE INTEGER;
ALTER TABLE "Request" ALTER COLUMN "listingId" TYPE INTEGER;

CREATE SEQUENCE IF NOT EXISTS "Listing_id_seq";
ALTER TABLE "Listing" ALTER COLUMN "id" SET DEFAULT nextval('"Listing_id_seq"');
ALTER SEQUENCE "Listing_id_seq" OWNED BY "Listing"."id";
SELECT setval('"Listing_id_seq"', 1, false);

ALTER TABLE "Listing" ADD CONSTRAINT "Listing_pkey" PRIMARY KEY ("id");

ALTER TABLE "ListingView" ADD CONSTRAINT "ListingView_listingId_fkey"
  FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_listingId_fkey"
  FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Request" ADD CONSTRAINT "Request_listingId_fkey"
  FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
