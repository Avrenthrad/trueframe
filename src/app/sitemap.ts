import type { MetadataRoute } from "next";
import { getLiveArticles } from "@/lib/store";
import { absoluteUrl, articlePath } from "@/lib/site";

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const all = await getLiveArticles();
  const latest = all[0]?.updated_at ?? new Date().toISOString();
  const sections = ["/", "/news", "/reviews", "/guides", "/hubs", "/deals", "/videos"].map((p) => ({
    url: absoluteUrl(p),
    lastModified: latest,
    changeFrequency: "hourly" as const,
    priority: p === "/" ? 1 : 0.8,
  }));
  const articles = all
    .filter((a) => a.category !== "deal")
    .map((a) => ({
      url: absoluteUrl(articlePath(a)),
      lastModified: a.updated_at,
      changeFrequency: (a.category === "hub" ? "daily" : "weekly") as "daily" | "weekly",
      priority: a.category === "news" ? 0.9 : 0.7,
    }));
  return [...sections, ...articles];
}
