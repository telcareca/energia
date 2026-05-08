import type { MetadataRoute } from "next";

const siteUrl = process.env.SITE_URL || "https://economia-energy.onrender.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
