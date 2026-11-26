import type { Article, Category } from "./schema";

export const SITE = {
  name: "TrueFrame",
  tagline: "First-Party Truth. Real Hype.",
  description:
    "Gaming and entertainment news, reviews, guides and AU deals — sourced first-party, verified, and written to answer you first.",
  locale: "en_AU",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
};

export const CATEGORY_PATH: Record<Category, string> = {
  news: "/news",
  review: "/reviews",
  guide: "/guides",
  deal: "/deals",
  hub: "/hubs",
};

export const CATEGORY_LABEL: Record<Category, string> = {
  news: "News",
  review: "Review",
  guide: "Guide",
  deal: "Deal",
  hub: "Hub",
};

export function articlePath(a: Pick<Article, "category" | "slug">) {
  return a.category === "deal" ? `/deals#${a.slug}` : `${CATEGORY_PATH[a.category]}/${a.slug}`;
}

export function absoluteUrl(path: string) {
  return `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;
}

export function ogImageUrl(a: Pick<Article, "title" | "category" | "source_tier">) {
  const q = new URLSearchParams({ title: a.title, category: a.category, tier: a.source_tier });
  return `/api/og?${q.toString()}`;
}
