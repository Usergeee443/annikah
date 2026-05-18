-- E’lon ID: TEXT (cuid) → INTEGER (autoincrement)
-- DIQQAT: barcha e’lonlar, sevimlilar, ko‘rishlar va so‘rovlar o‘chiriladi.

-- Avval bog‘liqliklarni uzamiz
ALTER TABLE "ListingView" DROP CONSTRAINT IF EXISTS "ListingView_listingId_fkey";
ALTER TABLE "Favorite" DROP CONSTRAINT IF EXISTS "Favorite_listingId_fkey";
ALTER TABLE "Request" DROP CONSTRAINT IF EXISTS "Request_listingId_fkey";

DELETE FROM "ListingView";
DELETE FROM "Favorite";
DELETE FROM "Request";
DELETE FROM "Listing";

ALTER TABLE "Listing" DROP CONSTRAINT IF EXISTS "Listing_pkey";

-- Listing.id: TEXT → SERIAL (bo‘sh jadvaldan keyin eng ishonchli usul)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Listing'
      AND column_name = 'id'
      AND data_type IN ('text', 'character varying')
  ) THEN
    ALTER TABLE "Listing" DROP COLUMN "id";
    ALTER TABLE "Listing" ADD COLUMN "id" SERIAL NOT NULL;
    ALTER TABLE "Listing" ADD PRIMARY KEY ("id");
  ELSIF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Listing'
      AND column_name = 'id'
      AND data_type = 'integer'
  ) THEN
    ALTER TABLE "Listing" ADD COLUMN "id" SERIAL NOT NULL;
    ALTER TABLE "Listing" ADD PRIMARY KEY ("id");
  END IF;
END $$;

-- Child jadval listingId ustunlari
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'ListingView'
      AND column_name = 'listingId' AND data_type IN ('text', 'character varying')
  ) THEN
    ALTER TABLE "ListingView" ALTER COLUMN "listingId" TYPE INTEGER USING 0;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Favorite'
      AND column_name = 'listingId' AND data_type IN ('text', 'character varying')
  ) THEN
    ALTER TABLE "Favorite" ALTER COLUMN "listingId" TYPE INTEGER USING 0;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Request'
      AND column_name = 'listingId' AND data_type IN ('text', 'character varying')
  ) THEN
    ALTER TABLE "Request" ALTER COLUMN "listingId" TYPE INTEGER USING 0;
  END IF;
END $$;

ALTER TABLE "ListingView" DROP CONSTRAINT IF EXISTS "ListingView_listingId_fkey";
ALTER TABLE "Favorite" DROP CONSTRAINT IF EXISTS "Favorite_listingId_fkey";
ALTER TABLE "Request" DROP CONSTRAINT IF EXISTS "Request_listingId_fkey";

ALTER TABLE "ListingView" ADD CONSTRAINT "ListingView_listingId_fkey"
  FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_listingId_fkey"
  FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Request" ADD CONSTRAINT "Request_listingId_fkey"
  FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
