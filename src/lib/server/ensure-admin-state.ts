import { Prisma } from "@prisma/client";
import {
  initialBookingFormConfig,
  initialCities,
  initialContact,
  initialEstimationConfig,
  initialExtendedSections,
  initialExtendedTheme,
  initialFeatures,
  initialNavItems,
  initialSEO,
  initialSiteConfig,
  initialTestimonials,
} from "@/data/site-config";

type Tx = Prisma.TransactionClient;
const DEFAULT_CAR_CATEGORIES = ["Sedan", "SUV", "Sports", "Compact", "Electric", "Wagon"];

export async function ensureAdminStateInitialized(tx: Tx) {
  await tx.themeConfig.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      primaryColor: initialExtendedTheme.primary_color,
      secondaryColor: initialExtendedTheme.secondary_color,
      accentColor: initialExtendedTheme.accent_color,
      backgroundColor: initialExtendedTheme.background_color,
      textColor: initialExtendedTheme.text_color,
      footerBackgroundColor: initialExtendedTheme.footer_background_color,
      footerTextColor: initialExtendedTheme.footer_text_color,
      fontFamily: initialExtendedTheme.font_family,
      headingFont: initialExtendedTheme.heading_font,
      borderRadius: initialExtendedTheme.border_radius,
      layoutStyle: initialExtendedTheme.layout_style,
      buttonStyle: initialExtendedTheme.button_style,
      cardStyle: initialExtendedTheme.card_style,
      cardStyleVariant: initialExtendedTheme.card_style_variant,
      spacingDensity: initialExtendedTheme.spacing_density,
      darkModeEnabled: initialExtendedTheme.dark_mode_enabled,
      headerStyle: initialExtendedTheme.header_style,
      siteName: initialExtendedTheme.site_name,
      landingPageTheme: initialExtendedTheme.landing_page_theme,
      heroImagePosition: initialExtendedTheme.hero_image_position,
      flatDesign: initialExtendedTheme.flat_design,
      selectedCurrency: initialExtendedTheme.selected_currency,
      heroBackgroundImage: initialExtendedTheme.hero_background_image,
      heroBackgroundEnabled: initialExtendedTheme.hero_background_enabled,
      heroBackgroundType: initialExtendedTheme.hero_background_type,
      heroPatternType: initialExtendedTheme.hero_pattern_type,
      heroPatternOpacity: initialExtendedTheme.hero_pattern_opacity,
      heroSolidColor: initialExtendedTheme.hero_solid_color,
    },
  });

  await tx.siteConfig.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      logoText: initialSiteConfig.logo_text,
      logoImage: initialSiteConfig.logo_image,
      logoDisplayMode: initialSiteConfig.logo_display_mode,
      logoSize: initialSiteConfig.logo_size,
      logoTagline: initialSiteConfig.logo_tagline,
      themePreviewImages: initialSiteConfig.theme_preview_images,
      heroBackgroundImage: initialSiteConfig.hero_background_image,
      heroSideImage: initialSiteConfig.hero_side_image,
      heroSideImageMode: initialSiteConfig.hero_side_image_mode,
      copyright: initialSiteConfig.copyright,
    },
  });

  await tx.sEOConfig.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      title: initialSEO.title,
      description: initialSEO.description,
      keywords: initialSEO.keywords,
      ogImage: initialSEO.og_image,
    },
  });

  await tx.contactConfig.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      phone: initialContact.phone,
      whatsapp: initialContact.whatsapp,
      email: initialContact.email,
      address: initialContact.address,
    },
  });

  await tx.estimationConfig.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      enabled: initialEstimationConfig.enabled,
      defaultCity: initialEstimationConfig.default_city,
      deliveryFreeStart: initialEstimationConfig.delivery_free_start,
      deliveryFreeEnd: initialEstimationConfig.delivery_free_end,
      nightDeliveryFee: initialEstimationConfig.night_delivery_fee,
      currency: initialEstimationConfig.currency,
      currencySymbol: initialEstimationConfig.currency_symbol,
      whatsappMessageTemplate: initialEstimationConfig.whatsapp_message_template,
      showCityField: initialEstimationConfig.show_city_field,
      showDurationField: initialEstimationConfig.show_duration_field,
      showVehicleField: initialEstimationConfig.show_vehicle_field,
      showDateField: initialEstimationConfig.show_date_field,
    },
  });

  await tx.bookingFormConfig.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      showName: initialBookingFormConfig.show_name,
      showEmail: initialBookingFormConfig.show_email,
      showPhone: initialBookingFormConfig.show_phone,
      showPickupDate: initialBookingFormConfig.show_pickup_date,
      showReturnDate: initialBookingFormConfig.show_return_date,
    },
  });

  if ((await tx.sectionConfig.count()) === 0) {
    await tx.sectionConfig.createMany({
      data: initialExtendedSections.map((s) => ({
        id: s.id,
        type: s.type,
        enabled: s.enabled,
        title: s.title,
        subtitle: s.subtitle,
        content: s.content,
        backgroundStyle: s.background_style,
        layoutVariant: s.layout_variant,
        sortOrder: s.order,
        backgroundImage: s.background_image ?? null,
      })),
    });
  }

  if ((await tx.navItem.count()) === 0) {
    await tx.navItem.createMany({
      data: initialNavItems.map((n, i) => ({
        id: n.id,
        label: n.label,
        href: n.href,
        enabled: n.enabled,
        showInMenu: n.show_in_menu,
        sortOrder: i,
      })),
    });
  }

  if ((await tx.city.count()) === 0) {
    await tx.city.createMany({
      data: initialCities.map((c, i) => ({
        id: c.id,
        name: c.name,
        image: c.image,
        enabled: c.enabled,
        sortOrder: i,
      })),
    });
  }

  if ((await tx.testimonial.count()) === 0) {
    await tx.testimonial.createMany({
      data: initialTestimonials.map((t, i) => ({
        id: t.id,
        name: t.name,
        rating: t.rating,
        review: t.review,
        avatar: t.avatar,
        sortOrder: i,
      })),
    });
  }

  if ((await tx.feature.count()) === 0) {
    await tx.feature.createMany({
      data: initialFeatures.map((f, i) => ({
        id: f.id,
        icon: f.icon,
        title: f.title,
        description: f.description,
        sortOrder: i,
      })),
    });
  }

  if ((await tx.socialLink.count({ where: { contactConfigId: "default" } })) === 0 && initialContact.social_links.length > 0) {
    await tx.socialLink.createMany({
      data: initialContact.social_links.map((s, i) => ({
        contactConfigId: "default",
        platform: s.platform,
        url: s.url,
        icon: s.icon,
        sortOrder: i,
      })),
    });
  }

  if ((await tx.agency.count({ where: { contactConfigId: "default" } })) === 0 && initialContact.agencies.length > 0) {
    await tx.agency.createMany({
      data: initialContact.agencies.map((a, i) => ({
        id: a.id,
        contactConfigId: "default",
        name: a.name,
        address: a.address,
        lat: a.lat,
        lng: a.lng,
        phone: a.phone,
        googleMapsUrl: a.google_maps_url,
        enabled: a.enabled,
        sortOrder: i,
      })),
    });
  }

  if ((await tx.pricingTier.count({ where: { estimationConfigId: "default" } })) === 0 && initialEstimationConfig.pricing_tiers.length > 0) {
    await tx.pricingTier.createMany({
      data: initialEstimationConfig.pricing_tiers.map((p, i) => ({
        id: p.id,
        estimationConfigId: "default",
        label: p.label,
        durationLabel: p.duration_label,
        minDays: p.min_days,
        maxDays: p.max_days,
        discountPercent: p.discount_percent,
        sortOrder: i,
      })),
    });
  }

  if ((await tx.estimationBadge.count({ where: { estimationConfigId: "default" } })) === 0 && initialEstimationConfig.badges.length > 0) {
    await tx.estimationBadge.createMany({
      data: initialEstimationConfig.badges.map((b, i) => ({
        estimationConfigId: "default",
        icon: b.icon,
        label: b.label,
        sortOrder: i,
      })),
    });
  }

  if ((await tx.carCategory.count()) === 0) {
    const distinctCarCategories = await tx.car.findMany({
      distinct: ["category"],
      select: { category: true },
      orderBy: { category: "asc" },
    });
    const source = distinctCarCategories.length > 0
      ? distinctCarCategories.map((c) => c.category).filter((c) => c.trim().length > 0)
      : DEFAULT_CAR_CATEGORIES;
    await tx.carCategory.createMany({
      data: source.map((name, index) => ({
        name,
        sortOrder: index,
      })),
      skipDuplicates: true,
    });
  }
}
