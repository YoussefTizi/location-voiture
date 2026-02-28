-- CreateEnum
CREATE TYPE "public"."Transmission" AS ENUM ('automatic', 'manual');

-- CreateEnum
CREATE TYPE "public"."FuelType" AS ENUM ('petrol', 'diesel', 'electric', 'hybrid');

-- CreateEnum
CREATE TYPE "public"."CarAvailabilityStatus" AS ENUM ('available', 'rented', 'maintenance');

-- CreateEnum
CREATE TYPE "public"."BookingStatus" AS ENUM ('pending', 'confirmed', 'cancelled');

-- CreateEnum
CREATE TYPE "public"."LogoDisplayMode" AS ENUM ('text', 'image');

-- CreateEnum
CREATE TYPE "public"."HeroSideImageMode" AS ENUM ('image', 'car_showcase');

-- CreateEnum
CREATE TYPE "public"."ThemeLayoutStyle" AS ENUM ('modern', 'classic', 'minimal');

-- CreateEnum
CREATE TYPE "public"."ThemeButtonStyle" AS ENUM ('rounded', 'sharp', 'pill');

-- CreateEnum
CREATE TYPE "public"."ThemeCardStyle" AS ENUM ('elevated', 'flat', 'bordered');

-- CreateEnum
CREATE TYPE "public"."ThemeSpacingDensity" AS ENUM ('compact', 'normal', 'spacious');

-- CreateEnum
CREATE TYPE "public"."ThemeHeaderStyle" AS ENUM ('transparent', 'solid', 'glass');

-- CreateEnum
CREATE TYPE "public"."HeroImagePosition" AS ENUM ('left', 'right');

-- CreateEnum
CREATE TYPE "public"."HeroBackgroundType" AS ENUM ('solid', 'image', 'pattern');

-- CreateEnum
CREATE TYPE "public"."HeroPatternType" AS ENUM ('dots', 'grid', 'diagonal', 'hexagons', 'waves');

-- CreateEnum
CREATE TYPE "public"."SectionType" AS ENUM ('hero', 'search', 'cars', 'features', 'cities', 'testimonials', 'about', 'faq', 'cta', 'estimation', 'contact', 'footer');

-- CreateEnum
CREATE TYPE "public"."SectionBackgroundStyle" AS ENUM ('light', 'dark', 'gradient', 'accent');

-- CreateEnum
CREATE TYPE "public"."SectionLayoutVariant" AS ENUM ('default', 'centered', 'split', 'minimal');

-- CreateTable
CREATE TABLE "public"."admin_user" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."car" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "price_per_day" DOUBLE PRECISION NOT NULL,
    "transmission" "public"."Transmission" NOT NULL,
    "fuel_type" "public"."FuelType" NOT NULL,
    "seats" INTEGER NOT NULL,
    "availability_status" "public"."CarAvailabilityStatus" NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "car_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."car_image" (
    "id" TEXT NOT NULL,
    "car_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "car_image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."booking" (
    "booking_id" TEXT NOT NULL,
    "customer_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "pickup_date" TIMESTAMP(3) NOT NULL,
    "return_date" TIMESTAMP(3) NOT NULL,
    "car_id" TEXT NOT NULL,
    "status" "public"."BookingStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_pkey" PRIMARY KEY ("booking_id")
);

-- CreateTable
CREATE TABLE "public"."theme_config" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "primary_color" TEXT NOT NULL,
    "secondary_color" TEXT NOT NULL,
    "accent_color" TEXT NOT NULL,
    "background_color" TEXT NOT NULL,
    "text_color" TEXT NOT NULL,
    "font_family" TEXT NOT NULL,
    "heading_font" TEXT NOT NULL,
    "border_radius" TEXT NOT NULL,
    "layout_style" "public"."ThemeLayoutStyle" NOT NULL,
    "button_style" "public"."ThemeButtonStyle" NOT NULL,
    "card_style" "public"."ThemeCardStyle" NOT NULL,
    "card_style_variant" TEXT NOT NULL,
    "spacing_density" "public"."ThemeSpacingDensity" NOT NULL,
    "dark_mode_enabled" BOOLEAN NOT NULL DEFAULT false,
    "header_style" "public"."ThemeHeaderStyle" NOT NULL,
    "site_name" TEXT NOT NULL,
    "landing_page_theme" TEXT NOT NULL,
    "hero_image_position" "public"."HeroImagePosition" NOT NULL,
    "flat_design" BOOLEAN NOT NULL DEFAULT false,
    "selected_currency" TEXT NOT NULL,
    "hero_background_image" TEXT NOT NULL DEFAULT '',
    "hero_background_enabled" BOOLEAN NOT NULL DEFAULT false,
    "hero_background_type" "public"."HeroBackgroundType" NOT NULL,
    "hero_pattern_type" "public"."HeroPatternType" NOT NULL,
    "hero_pattern_opacity" INTEGER NOT NULL,
    "hero_solid_color" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "theme_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."section_config" (
    "id" TEXT NOT NULL,
    "type" "public"."SectionType" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "title" JSONB NOT NULL,
    "subtitle" JSONB NOT NULL,
    "content" TEXT NOT NULL,
    "background_style" "public"."SectionBackgroundStyle" NOT NULL,
    "layout_variant" "public"."SectionLayoutVariant" NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "background_image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "section_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."site_config" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "logo_text" TEXT NOT NULL,
    "logo_image" TEXT NOT NULL DEFAULT '',
    "logo_display_mode" "public"."LogoDisplayMode" NOT NULL,
    "logo_tagline" JSONB NOT NULL,
    "hero_background_image" TEXT NOT NULL,
    "hero_side_image" TEXT NOT NULL,
    "hero_side_image_mode" "public"."HeroSideImageMode" NOT NULL,
    "copyright" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."seo_config" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "title" JSONB NOT NULL,
    "description" JSONB NOT NULL,
    "keywords" TEXT NOT NULL,
    "og_image" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seo_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."contact_config" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "phone" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "address" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."social_link" (
    "id" TEXT NOT NULL,
    "contact_config_id" TEXT NOT NULL DEFAULT 'default',
    "platform" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "social_link_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."agency" (
    "id" TEXT NOT NULL,
    "contact_config_id" TEXT NOT NULL DEFAULT 'default',
    "name" JSONB NOT NULL,
    "address" JSONB NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "phone" TEXT NOT NULL,
    "google_maps_url" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "agency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."nav_item" (
    "id" TEXT NOT NULL,
    "label" JSONB NOT NULL,
    "href" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "show_in_menu" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nav_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."city" (
    "id" TEXT NOT NULL,
    "name" JSONB NOT NULL,
    "image" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "city_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."testimonial" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "review" JSONB NOT NULL,
    "avatar" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "testimonial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."feature" (
    "id" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "title" JSONB NOT NULL,
    "description" JSONB NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."estimation_config" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "default_city" TEXT NOT NULL,
    "delivery_free_start" TEXT NOT NULL,
    "delivery_free_end" TEXT NOT NULL,
    "night_delivery_fee" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "currency_symbol" TEXT NOT NULL,
    "whatsapp_message_template" TEXT NOT NULL,
    "show_city_field" BOOLEAN NOT NULL DEFAULT true,
    "show_duration_field" BOOLEAN NOT NULL DEFAULT true,
    "show_vehicle_field" BOOLEAN NOT NULL DEFAULT true,
    "show_date_field" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "estimation_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."pricing_tier" (
    "id" TEXT NOT NULL,
    "estimation_config_id" TEXT NOT NULL DEFAULT 'default',
    "label" JSONB NOT NULL,
    "duration_label" TEXT NOT NULL,
    "min_days" INTEGER NOT NULL,
    "max_days" INTEGER,
    "discount_percent" DOUBLE PRECISION NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "pricing_tier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."estimation_badge" (
    "id" TEXT NOT NULL,
    "estimation_config_id" TEXT NOT NULL DEFAULT 'default',
    "icon" TEXT NOT NULL,
    "label" JSONB NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "estimation_badge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."booking_form_config" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "show_name" BOOLEAN NOT NULL DEFAULT true,
    "show_email" BOOLEAN NOT NULL DEFAULT true,
    "show_phone" BOOLEAN NOT NULL DEFAULT true,
    "show_pickup_date" BOOLEAN NOT NULL DEFAULT true,
    "show_return_date" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_form_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."custom_theme" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "preview_colors" JSONB NOT NULL,
    "overrides" JSONB NOT NULL,
    "is_custom" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custom_theme_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_user_username_key" ON "public"."admin_user"("username");

-- CreateIndex
CREATE INDEX "car_image_car_id_sort_order_idx" ON "public"."car_image"("car_id", "sort_order");

-- CreateIndex
CREATE INDEX "booking_car_id_status_idx" ON "public"."booking"("car_id", "status");

-- CreateIndex
CREATE INDEX "section_config_sort_order_idx" ON "public"."section_config"("sort_order");

-- CreateIndex
CREATE INDEX "social_link_contact_config_id_sort_order_idx" ON "public"."social_link"("contact_config_id", "sort_order");

-- CreateIndex
CREATE INDEX "agency_contact_config_id_sort_order_idx" ON "public"."agency"("contact_config_id", "sort_order");

-- CreateIndex
CREATE INDEX "nav_item_sort_order_idx" ON "public"."nav_item"("sort_order");

-- CreateIndex
CREATE INDEX "city_sort_order_idx" ON "public"."city"("sort_order");

-- CreateIndex
CREATE INDEX "testimonial_sort_order_idx" ON "public"."testimonial"("sort_order");

-- CreateIndex
CREATE INDEX "feature_sort_order_idx" ON "public"."feature"("sort_order");

-- CreateIndex
CREATE INDEX "pricing_tier_estimation_config_id_sort_order_idx" ON "public"."pricing_tier"("estimation_config_id", "sort_order");

-- CreateIndex
CREATE INDEX "estimation_badge_estimation_config_id_sort_order_idx" ON "public"."estimation_badge"("estimation_config_id", "sort_order");

-- AddForeignKey
ALTER TABLE "public"."car_image" ADD CONSTRAINT "car_image_car_id_fkey" FOREIGN KEY ("car_id") REFERENCES "public"."car"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."booking" ADD CONSTRAINT "booking_car_id_fkey" FOREIGN KEY ("car_id") REFERENCES "public"."car"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."social_link" ADD CONSTRAINT "social_link_contact_config_id_fkey" FOREIGN KEY ("contact_config_id") REFERENCES "public"."contact_config"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."agency" ADD CONSTRAINT "agency_contact_config_id_fkey" FOREIGN KEY ("contact_config_id") REFERENCES "public"."contact_config"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pricing_tier" ADD CONSTRAINT "pricing_tier_estimation_config_id_fkey" FOREIGN KEY ("estimation_config_id") REFERENCES "public"."estimation_config"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."estimation_badge" ADD CONSTRAINT "estimation_badge_estimation_config_id_fkey" FOREIGN KEY ("estimation_config_id") REFERENCES "public"."estimation_config"("id") ON DELETE CASCADE ON UPDATE CASCADE;
