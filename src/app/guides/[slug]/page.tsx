import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getLiveArticle, getLiveArticles } from "@/lib/store";
import { renderMarkdown } from "@/lib/markdown";
import { articleMetadata } from "@/lib/meta";
import { ArticleShell } from "@/components/ArticleShell";
import { FaqBlock, Prose, ShortAnswer, SourceFooter, SpoilerBanner } from "@/components/article";
import { Checklist, VideoEmbed } from "@/components/client";

export const revalidate = 300;
export const dynamicParams = true;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getLiveArticles()).filter((a) => a.category === "guide").map((a) => ({ slug: a.slug }));
}

async function load(slug: string) {
  const a = await getLiveArticle(slug);
  return a && a.category === "guide" ? a : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const a = await load((await params).slug);
  return a ? articleMetadata(a) : { title: "Not found" };
}

export default async function GuidePage({ params }: Props) {
  const a = await load((await params).slug);
  if (!a) notFound();
  const g = a.guide_meta;
  const { html, toc } = renderMarkdown(a.body_md);
  const steps = (g?.steps ?? []).map((s) => ({ ...s, html: renderMarkdown(s.body).html }));
  const fullToc = [
    ...(steps.length ? [{ id: "steps", text: `Step-by-step (${steps.length})`, level: 2 as const }] : []),
    ...toc,
  ];
  const checklist = g?.checklist.length ? <Checklist title="Checklist" items={g.checklist} storageKey={a.slug} /> : null;

  return (
    <ArticleShell a={a} toc={fullToc}>
      <ShortAnswer text={a.tldr_answer} />
      {a.spoiler_warning?.enabled && <SpoilerBanner label={a.spoiler_warning.label} />}
      {(g?.estimated_time || g?.difficulty) && (
        <dl className="flex flex-wrap gap-3 font-mono text-xs">
          {g.estimated_time && <div className="tf-card flex gap-2 px-3 py-2"><dt className="text-muted">Time</dt><dd className="font-semibold">{g.estimated_time}</dd></div>}
          {g.difficulty && <div className="tf-card flex gap-2 px-3 py-2"><dt className="text-muted">Difficulty</dt><dd className="font-semibold">{g.difficulty}</dd></div>}
          {steps.length > 0 && <div className="tf-card flex gap-2 px-3 py-2"><dt className="text-muted">Steps</dt><dd className="font-semibold">{steps.length}</dd></div>}
        </dl>
      )}

      {steps.length > 0 && (
        <section id="steps" aria-labelledby="steps-h" className="space-y-3">
          <h2 id="steps-h" className="text-2xl font-bold">Step-by-step</h2>
          <ol className="space-y-3">
            {steps.map((s, i) => (
              <li key={s.title} id={`step-${i + 1}`} className="tf-card flex gap-4 p-4 sm:p-5">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-mint font-mono text-sm font-bold text-on-mint" aria-hidden>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="mb-1.5 text-[17px] leading-snug font-semibold">
                    <span className="sr-only">Step {i + 1}: </span>{s.title}
                  </h3>
                  {s.spoiler ? (
                    <details className="tf-spoiler mt-2">
                      <summary className="tf-spoiler-summary">Spoiler: tap to reveal</summary>
                      <div className="tf-prose text-[15px]" dangerouslySetInnerHTML={{ __html: s.html }} />
                    </details>
                  ) : (
                    <div className="tf-prose text-[15px] text-muted" dangerouslySetInnerHTML={{ __html: s.html }} />
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {checklist}
      <Prose html={html} />
      {a.video && <VideoEmbed video={a.video} />}
      {a.faq?.length ? <FaqBlock faq={a.faq} /> : null}
      <SourceFooter a={a} />
    </ArticleShell>
  );
}
