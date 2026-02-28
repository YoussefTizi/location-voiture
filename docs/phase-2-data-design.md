# Phase 2 - Conception Data (PostgreSQL + Prisma)

## 1) Objectif de conception
Transformer l'état local (`AdminContext` + fichiers `initial*`) en données persistées PostgreSQL sans impact visuel.

Principes:
- Préserver les structures UI existantes
- Normaliser le coeur métier (cars/bookings/content)
- Garder certains blocs fortement dynamiques en JSON pour limiter la régression (sections content, thèmes custom)

## 2) Domaines métier et tables cibles

### A. Auth / Admin
- `admin_user`
  - id (uuid)
  - username (unique)
  - password_hash
  - is_active (bool)
  - created_at, updated_at

- `admin_session` (si session DB)
  - id (uuid)
  - user_id (fk -> admin_user)
  - token_hash (unique)
  - expires_at
  - created_at

### B. Flotte / Réservations
- `car`
  - id (string conservé ou uuid)
  - name
  - category
  - price_per_day (decimal)
  - transmission (enum: automatic/manual)
  - fuel_type (enum: petrol/diesel/electric/hybrid)
  - seats (int)
  - availability_status (enum: available/rented/maintenance)
  - featured (bool)
  - description (text)
  - created_at, updated_at

- `car_image`
  - id (uuid)
  - car_id (fk -> car)
  - url
  - sort_order (int)

- `booking`
  - id (booking_id actuel)
  - car_id (fk -> car)
  - customer_name
  - phone
  - email
  - pickup_date (date)
  - return_date (date)
  - status (enum: pending/confirmed/cancelled)
  - created_at, updated_at

### C. Configuration du site
- `site_config`
  - id (singleton)
  - logo_text
  - logo_image
  - logo_display_mode (enum)
  - logo_tagline_fr/en/ar
  - hero_background_image
  - hero_side_image
  - hero_side_image_mode
  - copyright
  - created_at, updated_at

- `seo_config`
  - id (singleton)
  - title_fr/en/ar
  - description_fr/en/ar
  - keywords
  - og_image
  - created_at, updated_at

- `contact_config`
  - id (singleton)
  - phone
  - whatsapp
  - email
  - address_fr/en/ar
  - created_at, updated_at

- `social_link`
  - id (uuid)
  - contact_config_id (fk)
  - platform
  - url
  - icon
  - sort_order

- `agency`
  - id (string existant)
  - contact_config_id (fk)
  - name_fr/en/ar
  - address_fr/en/ar
  - lat, lng
  - phone
  - google_maps_url
  - enabled

### D. Contenu dynamique front
- `nav_item`
  - id (string existant)
  - label_fr/en/ar
  - href
  - enabled
  - show_in_menu
  - sort_order

- `city`
  - id (string existant)
  - name_fr/en/ar
  - image
  - enabled
  - sort_order

- `testimonial`
  - id (string existant)
  - name
  - rating
  - review_fr/en/ar
  - avatar
  - sort_order

- `feature`
  - id (string existant)
  - icon
  - title_fr/en/ar
  - description_fr/en/ar
  - sort_order

### E. Thème / Sections / Personnalisation
- `theme_config` (singleton)
  - id
  - tous les champs `ExtendedThemeConfig`
  - created_at, updated_at

- `section_config`
  - id (string existant)
  - type (enum)
  - enabled
  - title_fr/en/ar
  - subtitle_fr/en/ar
  - content_json (jsonb)
  - background_style
  - layout_variant
  - background_image (nullable)
  - sort_order

- `custom_theme`
  - id (string existant ou uuid)
  - name
  - description
  - preview_colors_json (jsonb)
  - overrides_json (jsonb)
  - is_custom (bool)
  - created_at

### F. Estimation / Form booking
- `estimation_config` (singleton)
  - id
  - enabled
  - default_city
  - delivery_free_start
  - delivery_free_end
  - night_delivery_fee
  - currency
  - currency_symbol
  - whatsapp_message_template
  - show_city_field
  - show_duration_field
  - show_vehicle_field
  - show_date_field

- `pricing_tier`
  - id (string existant)
  - estimation_config_id (fk)
  - label_fr/en/ar
  - duration_label
  - min_days
  - max_days
  - discount_percent
  - sort_order

- `estimation_badge`
  - id (uuid)
  - estimation_config_id (fk)
  - icon
  - label_fr/en/ar
  - sort_order

- `booking_form_config` (singleton)
  - id
  - show_name
  - show_email
  - show_phone
  - show_pickup_date
  - show_return_date

## 3) Choix de modélisation
- `LocalizedText` -> colonnes `*_fr`, `*_en`, `*_ar` (plus simple pour requêtes/typage)
- `content` de section -> `jsonb` (compatible FAQ/CTA/bloc custom existants)
- configurations globales -> tables singleton (1 ligne active)
- `custom_theme.overrides` -> `jsonb` (structure flexible)

## 4) Contraintes et index
- Uniques: `admin_user.username`, `booking.id`
- Index:
  - `booking(car_id, status)`
  - `car(featured, availability_status)`
  - `section_config(sort_order)`
  - `nav_item(sort_order)`
  - `city(sort_order)`, `feature(sort_order)`, `testimonial(sort_order)`

## 5) Mapping migration depuis l'existant
- `initialCars` -> `car` + `car_image`
- `initialBookings` -> `booking`
- `initialExtendedTheme` -> `theme_config`
- `initialExtendedSections` -> `section_config`
- `initialSiteConfig` -> `site_config`
- `initialContact` -> `contact_config` + `social_link` + `agency`
- `initialSEO` -> `seo_config`
- `initialNavItems` -> `nav_item`
- `initialCities` -> `city`
- `initialTestimonials` -> `testimonial`
- `initialFeatures` -> `feature`
- `initialEstimationConfig` -> `estimation_config` + `pricing_tier` + `estimation_badge`
- `initialBookingFormConfig` -> `booking_form_config`
- `custom-themes` (localStorage) -> import manuel ou endpoint de migration client

## 6) Ordre d'implémentation recommandé (phase suivante)
1. Prisma setup + enums + tables coeur (`car`, `car_image`, `booking`)
2. Tables singleton config (`theme_config`, `site_config`, `seo_config`, `contact_config`)
3. Tables contenu (`section_config`, `nav_item`, `city`, `feature`, `testimonial`)
4. Estimation/booking form/custom themes
5. Auth admin réelle

## 7) Hors scope immédiat (à garder statique au début)
- `/` landing marketing (`SalesLanding`) et `/docs` docs peuvent rester statiques dans la première itération pour réduire le risque

