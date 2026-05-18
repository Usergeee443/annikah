-- AlterTable
ALTER TABLE "Message"
ADD COLUMN IF NOT EXISTS "kind" TEXT NOT NULL DEFAULT 'text',
ADD COLUMN IF NOT EXISTS "mediaPath" TEXT,
ADD COLUMN IF NOT EXISTS "mimeType" TEXT,
ADD COLUMN IF NOT EXISTS "durationMs" INTEGER,
ADD COLUMN IF NOT EXISTS "sizeBytes" INTEGER;

-- body endi media xabarlar uchun bo‘sh bo‘lishi mumkin
ALTER TABLE "Message" ALTER COLUMN "body" DROP NOT NULL;

