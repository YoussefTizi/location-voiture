import type { MetadataRoute } from "next";

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

export default function robots(): MetadataRoute.Robots {
  const baseUrl = normalizeBaseUrl(process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL);
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/preview"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
