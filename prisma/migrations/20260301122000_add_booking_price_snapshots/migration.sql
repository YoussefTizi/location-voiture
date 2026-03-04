-- Add immutable booking price snapshot fields
ALTER TABLE "public"."booking"
ADD COLUMN "price_per_day_snapshot" DOUBLE PRECISION,
ADD COLUMN "total_amount_snapshot" DOUBLE PRECISION,
ADD COLUMN "currency_code" TEXT;

-- Backfill existing reservations using current linked car price at migration time
UPDATE "public"."booking" AS b
SET
  "price_per_day_snapshot" = c."price_per_day",
  "total_amount_snapshot" = c."price_per_day" * GREATEST(
    1,
    CEIL(EXTRACT(EPOCH FROM (b."return_date" - b."pickup_date")) / 86400.0)
  ),
  "currency_code" = 'MAD'
FROM "public"."car" AS c
WHERE c."id" = b."car_id";

ALTER TABLE "public"."booking"
ALTER COLUMN "price_per_day_snapshot" SET NOT NULL,
ALTER COLUMN "total_amount_snapshot" SET NOT NULL,
ALTER COLUMN "currency_code" SET NOT NULL;
