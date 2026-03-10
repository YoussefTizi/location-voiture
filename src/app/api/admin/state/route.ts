import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminState } from "@/lib/server/admin-state";
import { ensureAdminStateInitialized } from "@/lib/server/ensure-admin-state";

export async function GET(req: NextRequest) {
  try {
    const full = req.nextUrl.searchParams.get("full") === "1";
    const state = await getAdminState({ includeThemePreviewImages: full });
    return NextResponse.json(state);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load admin state", detail: error instanceof Error ? error.message : "unknown" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    await prisma.$transaction(async (tx) => {
      await ensureAdminStateInitialized(tx);

      if (body.theme) {
        const t = body.theme;
        await tx.themeConfig.update({
          where: { id: "default" },
          data: {
            primaryColor: t.primary_color,
            secondaryColor: t.secondary_color,
            accentColor: t.accent_color,
            backgroundColor: t.background_color,
            textColor: t.text_color,
            footerBackgroundColor: t.footer_background_color,
            footerTextColor: t.footer_text_color,
            fontFamily: t.font_family,
            headingFont: t.heading_font,
            borderRadius: t.border_radius,
            layoutStyle: t.layout_style,
            buttonStyle: t.button_style,
            cardStyle: t.card_style,
            cardStyleVariant: t.card_style_variant,
            spacingDensity: t.spacing_density,
            darkModeEnabled: t.dark_mode_enabled,
            headerStyle: t.header_style,
            siteName: t.site_name,
            landingPageTheme: t.landing_page_theme,
            heroImagePosition: t.hero_image_position,
            flatDesign: t.flat_design,
            selectedCurrency: t.selected_currency,
            heroBackgroundImage: t.hero_background_image,
            heroBackgroundEnabled: t.hero_background_enabled,
            heroBackgroundType: t.hero_background_type,
            heroPatternType: t.hero_pattern_type,
            heroPatternOpacity: t.hero_pattern_opacity,
            heroSolidColor: t.hero_solid_color,
          },
        });
      }

      if (body.sections) {
        await tx.sectionConfig.deleteMany();
        if (body.sections.length > 0) {
          await tx.sectionConfig.createMany({
            data: body.sections.map((s: any) => ({
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
      }

      if (body.siteConfig) {
        const s = body.siteConfig;
        await tx.siteConfig.update({
          where: { id: "default" },
          data: {
            logoText: s.logo_text,
            logoImage: s.logo_image,
            logoDisplayMode: s.logo_display_mode,
            logoSize: Math.max(32, Math.min(260, Number(s.logo_size) || 96)),
            logoTagline: s.logo_tagline,
            themePreviewImages: s.theme_preview_images ?? {},
            heroBackgroundImage: s.hero_background_image,
            heroSideImage: s.hero_side_image,
            heroSideImageMode: s.hero_side_image_mode,
            copyright: s.copyright,
          },
        });
      }

      if (body.navItems) {
        await tx.navItem.deleteMany();
        if (body.navItems.length > 0) {
          await tx.navItem.createMany({
            data: body.navItems.map((n: any, i: number) => ({
              id: n.id,
              label: n.label,
              href: n.href,
              enabled: n.enabled,
              showInMenu: n.show_in_menu,
              sortOrder: i,
            })),
          });
        }
      }

      if (body.cities) {
        await tx.city.deleteMany();
        if (body.cities.length > 0) {
          await tx.city.createMany({
            data: body.cities.map((c: any, i: number) => ({
              id: c.id,
              name: c.name,
              image: c.image,
              enabled: c.enabled,
              sortOrder: i,
            })),
          });
        }
      }

      if (body.testimonials) {
        await tx.testimonial.deleteMany();
        if (body.testimonials.length > 0) {
          await tx.testimonial.createMany({
            data: body.testimonials.map((t: any, i: number) => ({
              id: t.id,
              name: t.name,
              rating: t.rating,
              review: t.review,
              avatar: t.avatar,
              sortOrder: i,
            })),
          });
        }
      }

      if (body.features) {
        await tx.feature.deleteMany();
        if (body.features.length > 0) {
          await tx.feature.createMany({
            data: body.features.map((f: any, i: number) => ({
              id: f.id,
              icon: f.icon,
              title: f.title,
              description: f.description,
              sortOrder: i,
            })),
          });
        }
      }

      if (body.contact) {
        const c = body.contact;
        await tx.contactConfig.update({
          where: { id: "default" },
          data: {
            phone: c.phone,
            whatsapp: c.whatsapp,
            email: c.email,
            address: c.address,
          },
        });

        await tx.socialLink.deleteMany({ where: { contactConfigId: "default" } });
        if (Array.isArray(c.social_links) && c.social_links.length > 0) {
          await tx.socialLink.createMany({
            data: c.social_links.map((s: any, i: number) => ({
              contactConfigId: "default",
              platform: s.platform,
              url: s.url,
              icon: s.icon,
              sortOrder: i,
            })),
          });
        }

        await tx.agency.deleteMany({ where: { contactConfigId: "default" } });
        if (Array.isArray(c.agencies) && c.agencies.length > 0) {
          await tx.agency.createMany({
            data: c.agencies.map((a: any, i: number) => ({
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
      }

      if (body.seo) {
        const s = body.seo;
        await tx.sEOConfig.update({
          where: { id: "default" },
          data: {
            title: s.title,
            description: s.description,
            keywords: s.keywords,
            ogImage: s.og_image,
          },
        });
      }

      if (body.estimation) {
        const e = body.estimation;
        await tx.estimationConfig.update({
          where: { id: "default" },
          data: {
            enabled: e.enabled,
            defaultCity: e.default_city,
            deliveryFreeStart: e.delivery_free_start,
            deliveryFreeEnd: e.delivery_free_end,
            nightDeliveryFee: e.night_delivery_fee,
            currency: e.currency,
            currencySymbol: e.currency_symbol,
            whatsappMessageTemplate: e.whatsapp_message_template,
            showCityField: e.show_city_field,
            showDurationField: e.show_duration_field,
            showVehicleField: e.show_vehicle_field,
            showDateField: e.show_date_field,
          },
        });

        await tx.pricingTier.deleteMany({ where: { estimationConfigId: "default" } });
        if (Array.isArray(e.pricing_tiers) && e.pricing_tiers.length > 0) {
          await tx.pricingTier.createMany({
            data: e.pricing_tiers.map((p: any, i: number) => ({
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

        await tx.estimationBadge.deleteMany({ where: { estimationConfigId: "default" } });
        if (Array.isArray(e.badges) && e.badges.length > 0) {
          await tx.estimationBadge.createMany({
            data: e.badges.map((b: any, i: number) => ({
              estimationConfigId: "default",
              icon: b.icon,
              label: b.label,
              sortOrder: i,
            })),
          });
        }
      }

      if (body.bookingForm) {
        const b = body.bookingForm;
        await tx.bookingFormConfig.update({
          where: { id: "default" },
          data: {
            showName: b.show_name,
            showEmail: b.show_email,
            showPhone: b.show_phone,
            showPickupDate: b.show_pickup_date,
            showReturnDate: b.show_return_date,
          },
        });
      }

      if (body.customThemes) {
        await tx.customTheme.deleteMany();
        if (body.customThemes.length > 0) {
          await tx.customTheme.createMany({
            data: body.customThemes.map((t: any) => ({
              id: t.id,
              name: t.name,
              description: t.description,
              previewColors: t.preview_colors,
              overrides: t.overrides,
              isCustom: true,
              createdAt: t.createdAt ? new Date(t.createdAt) : new Date(),
            })),
          });
        }
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to persist admin state", detail: error instanceof Error ? error.message : "unknown" },
      { status: 500 },
    );
  }
}
