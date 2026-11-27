import type { Article, Category } from "./schema";

export const SITE = {
  name: "UNPATCHED.GG",
  domain: "unpatched.gg",
  tagline: "First-Party Truth. Real Hype.",
  description:
    "Games, movies & TV, anime and AU deals. Every story sourced first-party, verified, and written to answer you first.",
  locale: "en_AU",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://unpatched.gg").replace(/\/$/, ""),
};

/** Newsroom desk an article belongs to. Drives the purple desk labels and feed tabs. */
export type DeskKey = "games" | "film_tv" | "anime" | "reviews" | "guides" | "deals_au" | "deals_global" | "trackers";
export const DESK_LABEL: Record<DeskKey, string> = {
  games: "Games Desk",
  film_tv: "Movies & TV",
  anime: "Anime",
  reviews: "Reviews",
  guides: "Guides",
  deals_au: "AU Deals",
  deals_global: "Global Deals",
  trackers: "Trackers",
};
export function deskOf(a: Pick<Article, "category" | "vertical" | "deal_meta">): DeskKey {
  if (a.category === "review") return "reviews";
  if (a.category === "guide") return "guides";
  if (a.category === "hub") return "trackers";
  if (a.category === "deal") return a.deal_meta?.region === "Global" ? "deals_global" : "deals_au";
  return a.vertical;
}

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

export function ogImageUrl(a: Pick<Article, "title" | "category" | "source_tier" | "vertical" | "deal_meta">) {
  const q = new URLSearchParams({ title: a.title, category: a.category, tier: a.source_tier, desk: DESK_LABEL[deskOf(a)] });
  return `/api/og?${q.toString()}`;
}
