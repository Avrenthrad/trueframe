import type { Article } from "@/lib/schema";
import { absoluteUrl, articlePath, CATEGORY_LABEL, CATEGORY_PATH, ogImageUrl, SITE } from "@/lib/site";

type LD = Record<string, unknown>;

export function JsonLd({ data }: { data: LD | LD[] }) {
  // Escape `<` so article text can never close the script tag.
  const json = JSON.stringify(Array.isArray(data) ? data : data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

const publisher = () => ({
  "@type": "Organization",
  "@id": `${SITE.url}#org`,
  name: SITE.name,
  url: SITE.url,
  logo: { "@type": "ImageObject", url: absoluteUrl("/brand/unpatched-mark.svg") },
});

export const organizationLd = (): LD => ({ "@context": "https://schema.org", ...publisher(), slogan: SITE.tagline });

export const websiteLd = (): LD => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE.name,
  url: SITE.url,
  inLanguage: "en-AU",
  publisher: { "@id": `${SITE.url}#org` },
});

const image = (a: Article) => (a.hero_image_url ? [a.hero_image_url] : [absoluteUrl(ogImageUrl(a))]);
const person = (a: Article) => ({ "@type": "Person", name: a.author.name, ...(a.author.url ? { url: a.author.url } : {}) });

export function newsArticleLd(a: Article): LD {
  return {
    "@context": "https://schema.org",
    "@type": a.category === "news" ? "NewsArticle" : "Article",
    headline: a.title.slice(0, 110),
    description: a.tldr_answer,
    image: image(a),
    datePublished: a.published_at ?? a.updated_at,
    dateModified: a.updated_at,
    author: [person(a)],
    publisher: publisher(),
    mainEntityOfPage: absoluteUrl(articlePath(a)),
    articleSection: CATEGORY_LABEL[a.category],
    keywords: a.tags.join(", ") || undefined,
    isBasedOn: a.primary_source_url,
    citation: { "@type": "CreativeWork", name: a.primary_source_name, url: a.primary_source_url },
    inLanguage: "en-AU",
  };
}

export function reviewLd(a: Article): LD | null {
  const r = a.review_meta;
  if (!r) return null;
  const isTv = a.vertical === "film_tv";
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    name: a.title,
    reviewBody: a.tldr_answer,
    datePublished: a.published_at ?? a.updated_at,
    dateModified: a.updated_at,
    author: person(a),
    publisher: publisher(),
    url: absoluteUrl(articlePath(a)),
    itemReviewed: {
      "@type": isTv ? "TVSeries" : "VideoGame",
      name: r.item_name ?? a.title.replace(/\s+review.*$/i, ""),
      ...(isTv ? {} : { gamePlatform: a.platforms, applicationCategory: "Game", operatingSystem: a.platforms.join(", ") || undefined }),
      image: image(a)[0],
    },
    reviewRating: { "@type": "Rating", ratingValue: r.score_100, bestRating: 100, worstRating: 0 },
    positiveNotes: { "@type": "ItemList", itemListElement: r.the_good.map((g, i) => ({ "@type": "ListItem", position: i + 1, name: g })) },
    negativeNotes: { "@type": "ItemList", itemListElement: r.the_bad.map((g, i) => ({ "@type": "ListItem", position: i + 1, name: g })) },
  };
}

export function faqLd(a: Article): LD | null {
  if (!a.faq?.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: a.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}

export function howToLd(a: Article): LD | null {
  const g = a.guide_meta;
  if (!g?.steps.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: a.title,
    description: a.tldr_answer,
    image: image(a)[0],
    step: g.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.title,
      text: s.body.replace(/[*_`#>]/g, ""),
      url: `${absoluteUrl(articlePath(a))}#step-${i + 1}`,
    })),
  };
}

export function breadcrumbLd(a: Article): LD {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
      { "@type": "ListItem", position: 2, name: CATEGORY_LABEL[a.category], item: absoluteUrl(CATEGORY_PATH[a.category]) },
      { "@type": "ListItem", position: 3, name: a.title, item: absoluteUrl(articlePath(a)) },
    ],
  };
}

export function videoLd(a: Article): LD | null {
  const v = a.video;
  if (!v || v.src.startsWith("demo-")) return null;
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: v.title,
    description: a.tldr_answer,
    uploadDate: a.published_at ?? a.updated_at,
    thumbnailUrl: v.provider === "youtube" ? `https://i.ytimg.com/vi/${v.src}/hqdefault.jpg` : image(a)[0],
    ...(v.provider === "youtube" ? { embedUrl: `https://www.youtube-nocookie.com/embed/${v.src}` } : { contentUrl: v.src }),
  };
}

export function articleLdBundle(a: Article): LD[] {
  return [
    a.category === "review" ? reviewLd(a) : newsArticleLd(a),
    faqLd(a),
    a.category === "guide" ? howToLd(a) : null,
    videoLd(a),
    breadcrumbLd(a),
  ].filter(Boolean) as LD[];
}
