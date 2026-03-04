-- Create category catalog for vehicles
CREATE TABLE "public"."car_category" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "car_category_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "car_category_name_key" ON "public"."car_category"("name");
CREATE INDEX "car_category_sort_order_idx" ON "public"."car_category"("sort_order");

-- Backfill category catalog from existing fleet data
INSERT INTO "public"."car_category" ("id", "name", "sort_order", "createdAt", "updatedAt")
SELECT
  CONCAT('cat-', SUBSTRING(MD5(RANDOM()::text || CLOCK_TIMESTAMP()::text) FOR 12)),
  c."category",
  ROW_NUMBER() OVER (ORDER BY c."category") - 1,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM (
  SELECT DISTINCT "category"
  FROM "public"."car"
  WHERE TRIM("category") <> ''
) c;
