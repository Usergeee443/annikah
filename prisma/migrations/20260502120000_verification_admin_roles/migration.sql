-- AlterTable
ALTER TABLE "Listing" ADD COLUMN "verificationPhotoPath" TEXT,
ADD COLUMN "verificationPhotoUploadedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "AdminUser" ADD COLUMN "gender" TEXT;

-- Legacy rollarni yangi qiymatlarga
UPDATE "AdminUser" SET "role" = 'super_admin' WHERE "role" = 'super';
UPDATE "AdminUser" SET "role" = 'moderator' WHERE "role" = 'admin';

ALTER TABLE "AdminUser" ALTER COLUMN "role" SET DEFAULT 'moderator';
