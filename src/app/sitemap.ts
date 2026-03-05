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

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = normalizeBaseUrl(process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL);
  const lastModified = new Date();

  return [
    {
      url: `${baseUrl}/`,
      lastModified,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/landing-page`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/docs`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];
}
