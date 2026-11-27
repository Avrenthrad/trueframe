import { getLiveArticles } from "@/lib/store";
import { absoluteUrl, articlePath, SITE } from "@/lib/site";

export const revalidate = 300;

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Google News sitemap: only news-type articles published in the last 48 hours (per Google's spec). */
export async function GET() {
  const cutoff = Date.now() - 48 * 3600_000;
  const items = (await getLiveArticles()).filter(
    (a) => (a.category === "news" || a.category === "review") && a.published_at && Date.parse(a.published_at) >= cutoff,
  );
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${items
  .map(
    (a) => `  <url>
    <loc>${esc(absoluteUrl(articlePath(a)))}</loc>
    <news:news>
      <news:publication><news:name>${esc(SITE.name)}</news:name><news:language>en</news:language></news:publication>
      <news:publication_date>${new Date(a.published_at!).toISOString()}</news:publication_date>
      <news:title>${esc(a.title)}</news:title>
    </news:news>
  </url>`,
  )
  .join("\n")}
</urlset>`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" } });
}
