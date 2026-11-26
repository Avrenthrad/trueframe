import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getLiveArticle, getLiveArticles } from "@/lib/store";
import { renderMarkdown } from "@/lib/markdown";
import { articleMetadata } from "@/lib/meta";
import { ArticleHeader, Prose, ShortAnswer } from "@/components/article";
import { HubView } from "@/components/HubView";
import { JsonLd, articleLdBundle } from "@/components/JsonLd";

export const revalidate = 300;
export const dynamicParams = true;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getLiveArticles()).filter((a) => a.category === "hub").map((a) => ({ slug: a.slug }));
}

async function load(slug: string) {
  const a = await getLiveArticle(slug);
  return a && a.category === "hub" && a.hub_meta ? a : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const a = await load((await params).slug);
  return a ? articleMetadata(a) : { title: "Not found" };
}

export default async function HubPage({ params }: Props) {
  const a = await load((await params).slug);
  if (!a) notFound();
  const { html } = renderMarkdown(a.body_md);
  return (
    <div className="tf-container max-w-[1040px] space-y-8 pt-6 pb-10 sm:pt-10">
      <JsonLd data={articleLdBundle(a)} />
      <ArticleHeader a={a} />
      <ShortAnswer text={a.tldr_answer} />
      <HubView meta={a.hub_meta!} />
      {a.body_md && <Prose html={html} />}
    </div>
  );
}
