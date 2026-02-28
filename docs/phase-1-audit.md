# Phase 1 - Audit & Analyse (Next.js -> Dynamique PostgreSQL + Prisma)

## 1) Routing et architecture
- Framework: Next.js (App Router)
- Dossier routes: `src/app`
- Routes détectées:
  - `/` -> `src/app/page.tsx` -> `src/views/SalesLanding.tsx`
  - `/demo` -> `src/app/demo/page.tsx` -> `src/views/Index.tsx`
  - `/admin` -> `src/app/admin/page.tsx` -> `src/views/Admin.tsx`
  - `/docs` -> `src/app/docs/page.tsx` -> `src/views/Documentation.tsx`
  - `/login` -> `src/app/login/page.tsx` -> `src/views/Login.tsx`
  - `not-found` -> `src/app/not-found.tsx` -> `src/views/NotFound.tsx`

## 2) Pages statiques identifiées
- `src/views/SalesLanding.tsx`
  - Landing marketing entièrement hardcodée (copy + features + testimonials + FAQ + pricing)
- `src/views/Documentation.tsx`
  - Documentation entièrement hardcodée (sections multilingues volumineuses)
- `src/views/Login.tsx`
  - Auth mock locale (`admin/admin`) via contexte
- `src/views/Admin.tsx`
  - Dashboard/gestion branché sur état local contextuel (pas DB)
- `src/views/Index.tsx`
  - Affiche `DynamicFrontend` (qui lit les données du contexte local)
- `src/views/NotFound.tsx`
  - Statique (pas de data métier)

## 3) Sources de données hardcodées
- `src/data/mock-database.ts`
  - `initialCars`, `initialBookings`, `initialStats`, `initialTheme`, `initialSections`
- `src/data/site-config.ts`
  - `initialNavItems`, `initialCities`, `initialTestimonials`, `initialFeatures`
  - `initialContact`, `initialSEO`, `initialSiteConfig`
  - `initialBookingFormConfig`, `initialEstimationConfig`
  - `initialExtendedTheme`, `initialExtendedSections`
  - dictionnaires UI/traductions
- Données inline dans vues:
  - `src/views/SalesLanding.tsx`: `copy`, `featuresList`
  - `src/views/Documentation.tsx`: `ui`, `sections`
- Persistances locales (navigateur):
  - `localStorage`: `admin-auth`, `admin-dark-mode`, `custom-themes`

## 4) Composants réutilisables repérés
- UI base (shadcn): `src/components/ui/*`
- Front dynamique principal: `src/components/frontend/DynamicFrontend.tsx`
- Backoffice modulaire:
  - `src/components/admin/DashboardOverview.tsx`
  - `CarsManager.tsx`, `BookingsManager.tsx`
  - `SectionsManager.tsx`, `ThemesManager.tsx`, `ThemeEngine.tsx`
  - `SiteSettingsManager.tsx`, `FAQEditor.tsx`, `TestimonialsEditor.tsx`, `FeaturesEditor.tsx`, `CTAEditor.tsx`, `HeroBackgroundEditor.tsx`
- State partagé actuel:
  - `src/context/AdminContext.tsx`
  - `src/context/LanguageContext.tsx`

## 5) Matrice page -> données -> opérations dynamiques attendues
- `/admin` (vue admin)
  - Données: cars, bookings, stats, theme, sections, navItems, cities, testimonials, features, contact, seo, siteConfig, estimation, bookingForm, customThemes, auth admin
  - Opérations:
    - Cars: CRUD
    - Bookings: Read + update status
    - Theme/Site/SEO/Contact/Estimation/BookingForm: Read + Update
    - Sections/NavItems: Read + Update + Reorder
    - Cities/Testimonials/Features/CustomThemes/Agencies: CRUD
    - Auth: login/logout/session
- `/demo` (frontend dynamique réel)
  - Données: theme + sections + siteConfig + cars + testimonials + features + contact + estimation + bookingForm + navItems
  - Opérations: Read principalement (éventuellement create booking plus tard)
- `/` (landing commerciale)
  - Données: actuellement inline hardcodées
  - Opérations: Read (si CMS marketing souhaité)
- `/docs`
  - Données: inline hardcodées
  - Opérations: Read (optionnel: CMS docs)
- `/login`
  - Données: auth admin mock
  - Opérations: Login

## 6) Priorisation de migration dynamique
- Priorité P1 (coeur produit):
  - `AdminContext` + `DynamicFrontend` + modules admin (cars/bookings/site/theme/sections)
- Priorité P2:
  - SEO/contact/features/testimonials/cities/nav/estimation/bookingForm
- Priorité P3:
  - Landing `/` et docs `/docs` (si on veut aussi les rendre pilotables DB)

## 7) Risques techniques repérés
- Couplage fort UI <-> `AdminContext` local (beaucoup d'états en mémoire)
- Plusieurs structures JSON imbriquées (thème/sections/traductions) -> attention au design du schéma Prisma
- Auth actuelle non sécurisée (credentials codées en dur)
- `custom-themes` dépend du localStorage: définir stratégie DB + compat migration

## 8) Découpage de suite recommandé (Phase 2)
- Concevoir schéma Prisma par domaine:
  - UserAdmin, Car, Booking, ThemeConfig, SectionConfig, SiteConfig, NavItem, City, Testimonial, Feature, ContactConfig, Agency, SEOConfig, EstimationConfig, PricingTier, BookingFormConfig, CustomTheme
- Décider ce qui reste inline (marketing/docs) vs ce qui passe DB

