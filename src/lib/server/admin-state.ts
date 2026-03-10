import { prisma } from "@/lib/prisma";
import type { Booking, Car, DashboardStats } from "@/data/mock-database";
import { ensureAdminStateInitialized } from "@/lib/server/ensure-admin-state";
import type {
  BookingFormConfig,
  City,
  ContactConfig,
  CustomThemePreset,
  EstimationConfig,
  ExtendedSectionConfig,
  ExtendedThemeConfig,
  Feature,
  NavItem,
  SEOConfig,
  SiteConfig,
  Testimonial,
} from "@/data/site-config";

export type AdminStatePayload = {
  cars: Car[];
  bookings: Booking[];
  stats: DashboardStats;
  theme: ExtendedThemeConfig;
  sections: ExtendedSectionConfig[];
  siteConfig: SiteConfig;
  navItems: NavItem[];
  cities: City[];
  testimonials: Testimonial[];
  features: Feature[];
  contact: ContactConfig;
  seo: SEOConfig;
  estimation: EstimationConfig;
  bookingForm: BookingFormConfig;
  customThemes: CustomThemePreset[];
};

const asLocalized = (value: unknown) => value as { fr: string; en: string; ar: string };

type GetAdminStateOptions = {
  includeThemePreviewImages?: boolean;
};

const sanitizeThemePreviewImages = (input: Record<string, string>) =>
  Object.fromEntries(
    Object.entries(input).map(([key, value]) => {
      if (typeof value !== "string") return [key, ""];
      if (value.startsWith("data:")) return [key, ""];
      return [key, value];
    }),
  );

export async function getAdminState(options?: GetAdminStateOptions): Promise<AdminStatePayload> {
  const includeThemePreviewImages = options?.includeThemePreviewImages ?? true;
  await prisma.$transaction(async (tx) => {
    await ensureAdminStateInitialized(tx);
  });

  const [cars, bookings, theme, sections, siteConfig, navItems, cities, testimonials, features, contact, socialLinks, agencies, seo, estimation, pricingTiers, estimationBadges, bookingForm, customThemes] = await Promise.all([
    prisma.car.findMany({ include: { images: { orderBy: { sortOrder: "asc" } } }, orderBy: { id: "asc" } }),
    prisma.booking.findMany({ orderBy: { id: "asc" } }),
    prisma.themeConfig.findUnique({ where: { id: "default" } }),
    prisma.sectionConfig.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.siteConfig.findUnique({ where: { id: "default" } }),
    prisma.navItem.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.city.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.testimonial.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.feature.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.contactConfig.findUnique({ where: { id: "default" } }),
    prisma.socialLink.findMany({ where: { contactConfigId: "default" }, orderBy: { sortOrder: "asc" } }),
    prisma.agency.findMany({ where: { contactConfigId: "default" }, orderBy: { sortOrder: "asc" } }),
    prisma.sEOConfig.findUnique({ where: { id: "default" } }),
    prisma.estimationConfig.findUnique({ where: { id: "default" } }),
    prisma.pricingTier.findMany({ where: { estimationConfigId: "default" }, orderBy: { sortOrder: "asc" } }),
    prisma.estimationBadge.findMany({ where: { estimationConfigId: "default" }, orderBy: { sortOrder: "asc" } }),
    prisma.bookingFormConfig.findUnique({ where: { id: "default" } }),
    prisma.customTheme.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  const mappedCars: Car[] = cars.map((car) => ({
    id: car.id,
    name: car.name,
    category: car.category,
    price_per_day: car.pricePerDay,
    images: car.images.map((img) => img.url),
    transmission: car.transmission,
    fuel_type: car.fuelType,
    seats: car.seats,
    availability_status: car.availabilityStatus,
    featured: car.featured,
    description: car.description,
  }));

  const mappedBookings: Booking[] = bookings.map((booking) => ({
    booking_id: booking.id,
    customer_name: booking.customerName,
    phone: booking.phone,
    email: booking.email,
    pickup_date: booking.pickupDate.toISOString().slice(0, 10),
    return_date: booking.returnDate.toISOString().slice(0, 10),
    car_id: booking.carId,
    status: booking.status,
    price_per_day_snapshot: booking.pricePerDaySnapshot,
    total_amount_snapshot: booking.totalAmountSnapshot,
    currency_code: booking.currencyCode,
  }));

  const totalRevenue = bookings
    .filter((b) => b.status === "confirmed")
    .reduce((sum, booking) => sum + booking.totalAmountSnapshot, 0);

  const mappedStats: DashboardStats = {
    total_revenue: Math.round(totalRevenue),
    active_bookings: bookings.filter((b) => b.status === "pending" || b.status === "confirmed").length,
    fleet_size: cars.length,
    utilization_rate: cars.length === 0 ? 0 : Math.round((cars.filter((c) => c.availabilityStatus === "rented").length / cars.length) * 100),
    monthly_revenue: [],
  };

  if (!theme || !siteConfig || !contact || !seo || !estimation || !bookingForm) {
    throw new Error("Missing required singleton configuration in database");
  }

  const rawThemePreviewImages = (siteConfig.themePreviewImages as Record<string, string>) ?? {};
  const responseThemePreviewImages = includeThemePreviewImages
    ? rawThemePreviewImages
    : sanitizeThemePreviewImages(rawThemePreviewImages);

  return {
    cars: mappedCars,
    bookings: mappedBookings,
    stats: mappedStats,
    theme: {
      primary_color: theme.primaryColor,
      secondary_color: theme.secondaryColor,
      accent_color: theme.accentColor,
      background_color: theme.backgroundColor,
      text_color: theme.textColor,
      footer_background_color: theme.footerBackgroundColor,
      footer_text_color: theme.footerTextColor,
      font_family: theme.fontFamily,
      heading_font: theme.headingFont,
      border_radius: theme.borderRadius,
      layout_style: theme.layoutStyle,
      button_style: theme.buttonStyle,
      card_style: theme.cardStyle,
      card_style_variant: theme.cardStyleVariant as ExtendedThemeConfig["card_style_variant"],
      spacing_density: theme.spacingDensity,
      dark_mode_enabled: theme.darkModeEnabled,
      header_style: theme.headerStyle,
      site_name: theme.siteName,
      landing_page_theme: theme.landingPageTheme,
      hero_image_position: theme.heroImagePosition,
      flat_design: theme.flatDesign,
      selected_currency: theme.selectedCurrency,
      hero_background_image: theme.heroBackgroundImage,
      hero_background_enabled: theme.heroBackgroundEnabled,
      hero_background_type: theme.heroBackgroundType,
      hero_pattern_type: theme.heroPatternType,
      hero_pattern_opacity: theme.heroPatternOpacity,
      hero_solid_color: theme.heroSolidColor,
    },
    sections: sections.map((section) => ({
      id: section.id,
      type: section.type,
      enabled: section.enabled,
      title: asLocalized(section.title),
      subtitle: asLocalized(section.subtitle),
      content: section.content,
      background_style: section.backgroundStyle,
      layout_variant: section.layoutVariant,
      order: section.sortOrder,
      background_image: section.backgroundImage ?? undefined,
    })),
    siteConfig: {
      logo_text: siteConfig.logoText,
      logo_image: siteConfig.logoImage,
      logo_display_mode: siteConfig.logoDisplayMode,
      logo_size: siteConfig.logoSize,
      logo_tagline: asLocalized(siteConfig.logoTagline),
      theme_preview_images: responseThemePreviewImages,
      hero_background_image: siteConfig.heroBackgroundImage,
      hero_side_image: siteConfig.heroSideImage,
      hero_side_image_mode: siteConfig.heroSideImageMode,
      copyright: siteConfig.copyright,
    },
    navItems: navItems.map((item) => ({
      id: item.id,
      label: asLocalized(item.label),
      href: item.href,
      enabled: item.enabled,
      show_in_menu: item.showInMenu,
    })),
    cities: cities.map((city) => ({
      id: city.id,
      name: asLocalized(city.name),
      image: city.image,
      enabled: city.enabled,
    })),
    testimonials: testimonials.map((item) => ({
      id: item.id,
      name: item.name,
      rating: item.rating,
      review: asLocalized(item.review),
      avatar: item.avatar,
    })),
    features: features.map((feature) => ({
      id: feature.id,
      icon: feature.icon,
      title: asLocalized(feature.title),
      description: asLocalized(feature.description),
    })),
    contact: {
      phone: contact.phone,
      whatsapp: contact.whatsapp,
      email: contact.email,
      address: asLocalized(contact.address),
      social_links: socialLinks.map((s) => ({ platform: s.platform, url: s.url, icon: s.icon })),
      agencies: agencies.map((a) => ({
        id: a.id,
        name: asLocalized(a.name),
        address: asLocalized(a.address),
        lat: a.lat,
        lng: a.lng,
        phone: a.phone,
        google_maps_url: a.googleMapsUrl,
        enabled: a.enabled,
      })),
    },
    seo: {
      title: asLocalized(seo.title),
      description: asLocalized(seo.description),
      keywords: seo.keywords,
      og_image: seo.ogImage,
    },
    estimation: {
      enabled: estimation.enabled,
      default_city: estimation.defaultCity,
      delivery_free_start: estimation.deliveryFreeStart,
      delivery_free_end: estimation.deliveryFreeEnd,
      night_delivery_fee: estimation.nightDeliveryFee,
      currency: estimation.currency,
      currency_symbol: estimation.currencySymbol,
      whatsapp_message_template: estimation.whatsappMessageTemplate,
      pricing_tiers: pricingTiers.map((tier) => ({
        id: tier.id,
        label: asLocalized(tier.label),
        duration_label: tier.durationLabel,
        min_days: tier.minDays,
        max_days: tier.maxDays,
        discount_percent: tier.discountPercent,
      })),
      badges: estimationBadges.map((badge) => ({ icon: badge.icon, label: asLocalized(badge.label) })),
      show_city_field: estimation.showCityField,
      show_duration_field: estimation.showDurationField,
      show_vehicle_field: estimation.showVehicleField,
      show_date_field: estimation.showDateField,
    },
    bookingForm: {
      show_name: bookingForm.showName,
      show_email: bookingForm.showEmail,
      show_phone: bookingForm.showPhone,
      show_pickup_date: bookingForm.showPickupDate,
      show_return_date: bookingForm.showReturnDate,
    },
    customThemes: customThemes.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      preview_colors: (t.previewColors as string[]) ?? [],
      overrides: (t.overrides as Partial<ExtendedThemeConfig>) ?? {},
      isCustom: true,
      createdAt: t.createdAt.toISOString(),
    })),
  };
}
