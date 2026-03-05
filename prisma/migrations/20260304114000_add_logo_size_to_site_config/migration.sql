ALTER TABLE "public"."site_config"
ADD COLUMN "logo_size" INTEGER;

UPDATE "public"."site_config"
SET "logo_size" = COALESCE("logo_size", 96);

ALTER TABLE "public"."site_config"
ALTER COLUMN "logo_size" SET NOT NULL,
ALTER COLUMN "logo_size" SET DEFAULT 96;
