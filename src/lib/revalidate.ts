import "server-only";
import { revalidatePath, revalidateTag } from "next/cache";
import type { Article } from "./schema";
import { CATEGORY_PATH } from "./site";
import { ARTICLES_TAG } from "./store";

/** Instantly refresh every surface an article can appear on. No full-site rebuilds. */
export function revalidateArticle(...articles: (Pick<Article, "category" | "slug"> | null | undefined)[]) {
  // { expire: 0 }: the very next request gets fresh data, so publishing feels instant.
  revalidateTag(ARTICLES_TAG, { expire: 0 });

  const paths = new Set(["/", "/deals", "/videos", "/hubs", "/feed.xml", "/sitemap.xml", "/news-sitemap.xml", "/api/search-index"]);
  for (const a of articles) {
    if (!a) continue;
    paths.add(CATEGORY_PATH[a.category]);
    if (a.category !== "deal") paths.add(`${CATEGORY_PATH[a.category]}/${a.slug}`);
  }
  for (const p of paths) revalidatePath(p);
  return [...paths];
}
