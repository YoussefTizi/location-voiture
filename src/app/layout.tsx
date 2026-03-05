import type { Metadata } from "next";
import { cache } from "react";
import "../index.css";
import Providers from "./providers";
import { prisma } from "@/lib/prisma";
import { DEFAULT_SITE_NAME } from "@/data/site-config";

const asLocalized = (value: unknown): { fr?: string; en?: string; ar?: string } =>
  typeof value === "object" && value !== null ? (value as { fr?: string; en?: string; ar?: string }) : {};

const normalizeBaseUrl = (value?: string | null) => {
  const fallback = "http://localhost:3000";
  const raw = (value || "").trim();
  const withProtocol = raw
    ? (raw.startsWith("http://") || raw.startsWith("https://") ? raw : `https://${raw}`)
    : fallback;
  try {
    return new URL(withProtocol).origin;
  } catch {
    return fallback;
  }
};

const getBaseUrl = () => normalizeBaseUrl(process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL);

const toAbsoluteUrl = (pathOrUrl: string, baseUrl: string) => {
  const value = (pathOrUrl || "").trim();
  if (!value) return "";
  try {
    return new URL(value).toString();
  } catch {
    const base = new URL(baseUrl);
    return new URL(value.startsWith("/") ? value : `/${value}`, base).toString();
  }
};

const safeJson = (value: unknown) => JSON.stringify(value).replace(/</g, "\\u003c");

const getSeoBootstrap = cache(async () => {
  const [siteConfig, seo, contact] = await Promise.all([
    prisma.siteConfig.findUnique({ where: { id: "default" }, select: { logoText: true, logoImage: true } }),
    prisma.sEOConfig.findUnique({ where: { id: "default" }, select: { title: true, description: true, keywords: true, ogImage: true } }),
    prisma.contactConfig.findUnique({ where: { id: "default" }, select: { phone: true, email: true } }),
  ]);
  return { siteConfig, seo, contact };
});

export async function generateMetadata(): Promise<Metadata> {
  const fallbackTitle = `${DEFAULT_SITE_NAME} - Car Rental Platform`;
  const fallbackDescription = "Premium car rental website builder and management platform";
  const baseUrl = getBaseUrl();
  const metadataBase = new URL(baseUrl);

  try {
    const { siteConfig, seo } = await getSeoBootstrap();

    const seoTitle = asLocalized(seo?.title).en || asLocalized(seo?.title).fr || siteConfig?.logoText;
    const seoDescription = asLocalized(seo?.description).en || asLocalized(seo?.description).fr;
    const ogImage = toAbsoluteUrl(seo?.ogImage || siteConfig?.logoImage || "", baseUrl);
    const images = ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: seoTitle || fallbackTitle }] : undefined;

    return {
      metadataBase,
      title: seoTitle || fallbackTitle,
      description: seoDescription || fallbackDescription,
      keywords: seo?.keywords || undefined,
      alternates: {
        canonical: "/",
        languages: {
          fr: "/?lang=fr",
          en: "/?lang=en",
          ar: "/?lang=ar",
          "x-default": "/",
        },
      },
      openGraph: {
        type: "website",
        url: baseUrl,
        siteName: siteConfig?.logoText || DEFAULT_SITE_NAME,
        title: seoTitle || fallbackTitle,
        description: seoDescription || fallbackDescription,
        locale: "fr_MA",
        alternateLocale: ["en_US", "ar_MA"],
        images,
      },
      twitter: {
        card: "summary_large_image",
        title: seoTitle || fallbackTitle,
        description: seoDescription || fallbackDescription,
        images: ogImage ? [ogImage] : undefined,
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-image-preview": "large",
          "max-snippet": -1,
          "max-video-preview": -1,
        },
      },
    };
  } catch {
    return {
      metadataBase,
      title: fallbackTitle,
      description: fallbackDescription,
      alternates: {
        canonical: "/",
      },
    };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const baseUrl = getBaseUrl();
  let orgJsonLd: string | null = null;
  let websiteJsonLd: string | null = null;

  try {
    const { siteConfig, contact } = await getSeoBootstrap();
    const siteName = siteConfig?.logoText || DEFAULT_SITE_NAME;
    const logo = toAbsoluteUrl(siteConfig?.logoImage || "", baseUrl);
    const organization = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: siteName,
      url: baseUrl,
      logo: logo || undefined,
      contactPoint: contact?.phone
        ? [
            {
              "@type": "ContactPoint",
              telephone: contact.phone,
              contactType: "customer service",
              email: contact.email || undefined,
              availableLanguage: ["French", "English", "Arabic"],
            },
          ]
        : undefined,
    };
    const website = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: siteName,
      url: baseUrl,
      inLanguage: ["fr", "en", "ar"],
      potentialAction: {
        "@type": "SearchAction",
        target: `${baseUrl}/?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    };
    orgJsonLd = safeJson(organization);
    websiteJsonLd = safeJson(website);
  } catch {
    // If DB is unavailable, keep the app rendering with base metadata only.
  }

  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,300..900;1,300..900&family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Space+Grotesk:wght@300..700&family=Playfair+Display:wght@400..900&family=Outfit:wght@100..900&family=Inter:wght@100..900&display=swap"
          rel="stylesheet"
        />
        {orgJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: orgJsonLd }} />}
        {websiteJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: websiteJsonLd }} />}
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
