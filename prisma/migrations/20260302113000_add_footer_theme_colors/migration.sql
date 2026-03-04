ALTER TABLE "public"."theme_config"
ADD COLUMN "footer_background_color" TEXT,
ADD COLUMN "footer_text_color" TEXT;

UPDATE "public"."theme_config"
SET
  "footer_background_color" = COALESCE("footer_background_color", "secondary_color"),
  "footer_text_color" = COALESCE("footer_text_color", "text_color");

ALTER TABLE "public"."theme_config"
ALTER COLUMN "footer_background_color" SET NOT NULL,
ALTER COLUMN "footer_text_color" SET NOT NULL;
