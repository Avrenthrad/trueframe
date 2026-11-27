import type { Metadata } from "next";
import type { Article } from "./schema";
import { articlePath, ogImageUrl, SITE } from "./site";

export function articleMetadata(a: Article): Metadata {
  const url = articlePath(a);
  const images = a.hero_image_url
    ? [{ url: a.hero_image_url, width: 1200, height: 675, alt: a.hero_image_alt ?? a.title }]
    : [{ url: ogImageUrl(a), width: 1200, height: 630, alt: a.title }];
  const description = a.tldr_answer.length > 200 ? `${a.tldr_answer.slice(0, 197)}…` : a.tldr_answer;
  return {
    title: a.title,
    description,
    alternates: { canonical: url },
    authors: [{ name: a.author.name, url: a.author.url }],
    keywords: [...a.tags, ...a.platforms],
    openGraph: {
      type: "article",
      url,
      title: a.title,
      description,
      siteName: SITE.name,
      locale: SITE.locale,
      publishedTime: a.published_at ?? undefined,
      modifiedTime: a.updated_at,
      authors: [a.author.name],
      section: a.category,
      tags: a.tags,
      images,
    },
    twitter: { card: "summary_large_image", title: a.title, description, images: images.map((i) => i.url) },
    other: { "article:source_tier": a.source_tier },
  };
}
