import { getLiveArticles } from "@/lib/store";
import { absoluteUrl, articlePath, CATEGORY_LABEL, SITE } from "@/lib/site";

export const revalidate = 300;

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function GET() {
  const items = (await getLiveArticles()).filter((a) => a.category !== "hub").slice(0, 50);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
<channel>
  <title>${esc(SITE.name)}</title>
  <link>${SITE.url}</link>
  <description>${esc(SITE.tagline)} ${esc(SITE.description)}</description>
  <language>en-au</language>
  <lastBuildDate>${new Date(items[0]?.updated_at ?? Date.now()).toUTCString()}</lastBuildDate>
  <atom:link href="${absoluteUrl("/feed.xml")}" rel="self" type="application/rss+xml"/>
${items
  .map((a) => {
    const url = absoluteUrl(articlePath(a));
    return `  <item>
    <title>${esc(a.title)}</title>
    <link>${esc(url)}</link>
    <guid isPermaLink="true">${esc(url)}</guid>
    <pubDate>${new Date(a.published_at ?? a.updated_at).toUTCString()}</pubDate>
    <dc:creator>${esc(a.author.name)}</dc:creator>
    <category>${CATEGORY_LABEL[a.category]}</category>
    <description>${esc(a.tldr_answer)}</description>
  </item>`;
  })
  .join("\n")}
</channel>
</rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400" } });
}
