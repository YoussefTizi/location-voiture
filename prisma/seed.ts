import { PrismaClient } from "@prisma/client";
import { initialCars } from "../src/data/mock-database";
import {
  initialExtendedTheme,
  initialExtendedSections,
  initialSiteConfig,
  initialSEO,
  initialContact,
  initialNavItems,
  initialCities,
  initialTestimonials,
  initialFeatures,
  initialEstimationConfig,
  initialBookingFormConfig,
} from "../src/data/site-config";

const prisma = new PrismaClient();

async function main() {
  await prisma.$transaction([
    prisma.booking.deleteMany(),
    prisma.carImage.deleteMany(),
    prisma.car.deleteMany(),
    prisma.socialLink.deleteMany(),
    prisma.agency.deleteMany(),
    prisma.navItem.deleteMany(),
    prisma.city.deleteMany(),
    prisma.testimonial.deleteMany(),
    prisma.feature.deleteMany(),
    prisma.pricingTier.deleteMany(),
    prisma.estimationBadge.deleteMany(),
    prisma.customTheme.deleteMany(),
    prisma.sectionConfig.deleteMany(),
  ]);

  await prisma.adminUser.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      passwordHash: "admin",
      isActive: true,
    },
  });

  for (const car of initialCars) {
    await prisma.car.create({
      data: {
        id: car.id,
        name: car.name,
        category: car.category,
        pricePerDay: car.price_per_day,
        transmission: car.transmission,
        fuelType: car.fuel_type,
        seats: car.seats,
        availabilityStatus: car.availability_status,
        featured: car.featured,
        description: car.description,
        images: {
          create: car.images.map((url, index) => ({ url, sortOrder: index })),
        },
      },
    });
  }

  await prisma.themeConfig.upsert({
    where: { id: "default" },
    update: {
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

  await prisma.siteConfig.upsert({
    where: { id: "default" },
    update: {
      logoText: initialSiteConfig.logo_text,
      logoImage: initialSiteConfig.logo_image,
      logoDisplayMode: initialSiteConfig.logo_display_mode,
      logoTagline: initialSiteConfig.logo_tagline,
      heroBackgroundImage: initialSiteConfig.hero_background_image,
      heroSideImage: initialSiteConfig.hero_side_image,
      heroSideImageMode: initialSiteConfig.hero_side_image_mode,
      copyright: initialSiteConfig.copyright,
    },
    create: {
      id: "default",
      logoText: initialSiteConfig.logo_text,
      logoImage: initialSiteConfig.logo_image,
      logoDisplayMode: initialSiteConfig.logo_display_mode,
      logoTagline: initialSiteConfig.logo_tagline,
      heroBackgroundImage: initialSiteConfig.hero_background_image,
      heroSideImage: initialSiteConfig.hero_side_image,
      heroSideImageMode: initialSiteConfig.hero_side_image_mode,
      copyright: initialSiteConfig.copyright,
    },
  });

  await prisma.sEOConfig.upsert({
    where: { id: "default" },
    update: {
      title: initialSEO.title,
      description: initialSEO.description,
      keywords: initialSEO.keywords,
      ogImage: initialSEO.og_image,
    },
    create: {
      id: "default",
      title: initialSEO.title,
      description: initialSEO.description,
      keywords: initialSEO.keywords,
      ogImage: initialSEO.og_image,
    },
  });

  await prisma.contactConfig.upsert({
    where: { id: "default" },
    update: {
      phone: initialContact.phone,
      whatsapp: initialContact.whatsapp,
      email: initialContact.email,
      address: initialContact.address,
    },
    create: {
      id: "default",
      phone: initialContact.phone,
      whatsapp: initialContact.whatsapp,
      email: initialContact.email,
      address: initialContact.address,
    },
  });

  await prisma.socialLink.createMany({
    data: initialContact.social_links.map((item, index) => ({
      contactConfigId: "default",
      platform: item.platform,
      url: item.url,
      icon: item.icon,
      sortOrder: index,
    })),
  });

  await prisma.agency.createMany({
    data: initialContact.agencies.map((agency, index) => ({
      id: agency.id,
      contactConfigId: "default",
      name: agency.name,
      address: agency.address,
      lat: agency.lat,
      lng: agency.lng,
      phone: agency.phone,
      googleMapsUrl: agency.google_maps_url,
      enabled: agency.enabled,
      sortOrder: index,
    })),
  });

  await prisma.navItem.createMany({
    data: initialNavItems.map((item, index) => ({
      id: item.id,
      label: item.label,
      href: item.href,
      enabled: item.enabled,
      showInMenu: item.show_in_menu,
      sortOrder: index,
    })),
  });

  await prisma.city.createMany({
    data: initialCities.map((city, index) => ({
      id: city.id,
      name: city.name,
      image: city.image,
      enabled: city.enabled,
      sortOrder: index,
    })),
  });

  await prisma.testimonial.createMany({
    data: initialTestimonials.map((item, index) => ({
      id: item.id,
      name: item.name,
      rating: item.rating,
      review: item.review,
      avatar: item.avatar,
      sortOrder: index,
    })),
  });

  await prisma.feature.createMany({
    data: initialFeatures.map((feature, index) => ({
      id: feature.id,
      icon: feature.icon,
      title: feature.title,
      description: feature.description,
      sortOrder: index,
    })),
  });

  await prisma.sectionConfig.createMany({
    data: initialExtendedSections.map((section) => ({
      id: section.id,
      type: section.type,
      enabled: section.enabled,
      title: section.title,
      subtitle: section.subtitle,
      content: section.content,
      backgroundStyle: section.background_style,
      layoutVariant: section.layout_variant,
      sortOrder: section.order,
      backgroundImage: section.background_image,
    })),
  });

  await prisma.estimationConfig.upsert({
    where: { id: "default" },
    update: {
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

  await prisma.pricingTier.createMany({
    data: initialEstimationConfig.pricing_tiers.map((tier, index) => ({
      id: tier.id,
      estimationConfigId: "default",
      label: tier.label,
      durationLabel: tier.duration_label,
      minDays: tier.min_days,
      maxDays: tier.max_days,
      discountPercent: tier.discount_percent,
      sortOrder: index,
    })),
  });

  await prisma.estimationBadge.createMany({
    data: initialEstimationConfig.badges.map((badge, index) => ({
      estimationConfigId: "default",
      icon: badge.icon,
      label: badge.label,
      sortOrder: index,
    })),
  });

  await prisma.bookingFormConfig.upsert({
    where: { id: "default" },
    update: {
      showName: initialBookingFormConfig.show_name,
      showEmail: initialBookingFormConfig.show_email,
      showPhone: initialBookingFormConfig.show_phone,
      showPickupDate: initialBookingFormConfig.show_pickup_date,
      showReturnDate: initialBookingFormConfig.show_return_date,
    },
    create: {
      id: "default",
      showName: initialBookingFormConfig.show_name,
      showEmail: initialBookingFormConfig.show_email,
      showPhone: initialBookingFormConfig.show_phone,
      showPickupDate: initialBookingFormConfig.show_pickup_date,
      showReturnDate: initialBookingFormConfig.show_return_date,
    },
  });

  console.log("Seed complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
