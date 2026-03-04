import type { Metadata } from "next";
import "../index.css";
import Providers from "./providers";
import { prisma } from "@/lib/prisma";
import { DEFAULT_SITE_NAME } from "@/data/site-config";

const asLocalized = (value: unknown): { fr?: string; en?: string; ar?: string } =>
  typeof value === "object" && value !== null ? (value as { fr?: string; en?: string; ar?: string }) : {};

export async function generateMetadata(): Promise<Metadata> {
  const fallbackTitle = `${DEFAULT_SITE_NAME} - Car Rental Platform`;
  const fallbackDescription = "Premium car rental website builder and management platform";

  try {
    const [siteConfig, seo] = await Promise.all([
      prisma.siteConfig.findUnique({ where: { id: "default" }, select: { logoText: true } }),
      prisma.sEOConfig.findUnique({ where: { id: "default" }, select: { title: true, description: true } }),
    ]);

    const seoTitle = asLocalized(seo?.title).en || asLocalized(seo?.title).fr || siteConfig?.logoText;
    const seoDescription = asLocalized(seo?.description).en || asLocalized(seo?.description).fr;

    return {
      title: seoTitle || fallbackTitle,
      description: seoDescription || fallbackDescription,
    };
  } catch {
    return {
      title: fallbackTitle,
      description: fallbackDescription,
    };
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,300..900;1,300..900&family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Space+Grotesk:wght@300..700&family=Playfair+Display:wght@400..900&family=Outfit:wght@100..900&family=Inter:wght@100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
