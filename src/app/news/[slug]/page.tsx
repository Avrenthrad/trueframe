import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getLiveArticle, getLiveArticles } from "@/lib/store";
import { renderMarkdown } from "@/lib/markdown";
import { articleMetadata } from "@/lib/meta";
import { ArticleShell } from "@/components/ArticleShell";
import { FaqBlock, HeroMedia, HypeVsReality, Prose, ShortAnswer, SourceFooter, SpoilerBanner } from "@/components/article";
import { VideoEmbed } from "@/components/client";

export const revalidate = 300;
export const dynamicParams = true;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getLiveArticles()).filter((a) => a.category === "news").map((a) => ({ slug: a.slug }));
}

async function load(slug: string) {
  const a = await getLiveArticle(slug);
  return a && a.category === "news" ? a : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const a = await load((await params).slug);
  return a ? articleMetadata(a) : { title: "Not found" };
}

export default async function NewsPage({ params }: Props) {
  const a = await load((await params).slug);
  if (!a) notFound();
  const { html, toc } = renderMarkdown(a.body_md);
  const fullToc = [
    ...(a.hype_vs_reality ? [{ id: "hvr", text: "Hype vs. Reality", level: 2 as const }] : []),
    ...toc,
    ...(a.video ? [{ id: "watch", text: "Watch", level: 2 as const }] : []),
    ...(a.faq?.length ? [{ id: "faq-h", text: "Quick questions", level: 2 as const }] : []),
  ];

  return (
    <ArticleShell a={a} toc={fullToc}>
      <ShortAnswer text={a.tldr_answer} />
      {a.spoiler_warning?.enabled && <SpoilerBanner label={a.spoiler_warning.label} />}
      {a.video?.aspect === "16:9" ? null : <HeroMedia a={a} />}
      {a.video?.aspect === "16:9" && (
        <section id="watch" aria-label="Video"><VideoEmbed video={a.video} /></section>
      )}
      {a.hype_vs_reality && <HypeVsReality data={a.hype_vs_reality} tier={a.source_tier} />}
      <Prose html={html} />
      {a.video?.aspect === "9:16" && (
        <section id="watch" aria-labelledby="watch-h" className="space-y-3">
          <h2 id="watch-h" className="text-2xl font-bold">Watch</h2>
          <VideoEmbed video={a.video} />
        </section>
      )}
      {a.faq?.length ? <FaqBlock faq={a.faq} /> : null}
      <SourceFooter a={a} />
    </ArticleShell>
  );
}
