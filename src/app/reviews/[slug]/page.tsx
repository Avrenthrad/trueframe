import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getLiveArticle, getLiveArticles } from "@/lib/store";
import { renderMarkdown } from "@/lib/markdown";
import { articleMetadata } from "@/lib/meta";
import { ArticleShell } from "@/components/ArticleShell";
import { FaqBlock, HeroMedia, Prose, ShortAnswer, SourceFooter, SpoilerBanner } from "@/components/article";
import { PullQuote, ScreenshotStrip, SentimentBar, VerdictCard } from "@/components/review";
import { VideoEmbed } from "@/components/client";
import { ScoreChip, VerdictPill } from "@/components/ui";

export const revalidate = 300;
export const dynamicParams = true;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getLiveArticles()).filter((a) => a.category === "review").map((a) => ({ slug: a.slug }));
}

async function load(slug: string) {
  const a = await getLiveArticle(slug);
  // Defence in depth: never render a scored review without human sign-off.
  return a && a.category === "review" && a.review_meta?.human_approved ? a : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const a = await load((await params).slug);
  return a ? articleMetadata(a) : { title: "Not found" };
}

export default async function ReviewPage({ params }: Props) {
  const a = await load((await params).slug);
  if (!a) notFound();
  const r = a.review_meta!;
  const { html, toc } = renderMarkdown(a.body_md);
  const fullToc = [
    { id: "verdict-top", text: "Verdict", level: 2 as const },
    ...toc,
    { id: "verdict-bottom", text: "Final verdict", level: 2 as const },
  ];

  return (
    <ArticleShell
      a={a}
      toc={fullToc}
      rail={
        <div className="tf-card flex items-center gap-3 p-3">
          <ScoreChip score={r.score_100} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{r.item_name ?? a.title}</p>
            <VerdictPill verdict={r.verdict_label} size="sm" />
          </div>
        </div>
      }
    >
      <ShortAnswer text={a.tldr_answer} />
      {a.spoiler_warning?.enabled && <SpoilerBanner label={a.spoiler_warning.label} />}
      <VerdictCard a={a} position="top" />
      {a.video ? <VideoEmbed video={a.video} /> : <HeroMedia a={a} />}
      <Prose html={html} />
      {r.pull_quote && <PullQuote quote={r.pull_quote} author={a.author.name} />}
      <ScreenshotStrip a={a} />
      <SentimentBar ours={r.score_100} critic={r.critic_avg} community={r.community_avg} />
      <VerdictCard a={a} position="bottom" />
      {a.faq?.length ? <FaqBlock faq={a.faq} /> : null}
      <SourceFooter a={a} />
    </ArticleShell>
  );
}
