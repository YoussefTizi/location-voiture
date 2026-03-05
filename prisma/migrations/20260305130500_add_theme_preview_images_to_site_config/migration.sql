ALTER TABLE "public"."site_config"
ADD COLUMN "theme_preview_images" JSONB NOT NULL DEFAULT '{}';
