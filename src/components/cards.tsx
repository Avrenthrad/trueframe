import Link from "next/link";
import type { Article } from "@/lib/schema";
import { articlePath } from "@/lib/site";
import { formatDateTime, readingTime } from "@/lib/format";
import { CategoryPill, CoverArt, IconClock, PlatformTag, ScoreChip, SourceTierPill, VerdictPill } from "./ui";

export function MetaLine({ a, className = "" }: { a: Article; className?: string }) {
  return (
    <p className={`flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] text-muted ${className}`}>
      <span className="inline-flex items-center gap-1"><IconClock className="size-3" />{readingTime(a.body_md || a.tldr_answer)} min read</span>
      <span aria-hidden>·</span>
      <span>Updated <time dateTime={a.updated_at}>{formatDateTime(a.updated_at)}</time></span>
    </p>
  );
}

function Pills({ a }: { a: Article }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <CategoryPill category={a.category} vertical={a.vertical} />
      <SourceTierPill tier={a.source_tier} compact />
      {a.review_meta && <VerdictPill verdict={a.review_meta.verdict_label} size="sm" />}
    </div>
  );
}

/** Lead story: big image, big headline, the short answer as the dek. */
export function LeadCard({ a }: { a: Article }) {
  return (
    <article className="group tf-card relative overflow-hidden">
      <Link href={articlePath(a)} className="block focus-visible:outline-offset-[-2px]">
        <CoverArt seed={a.slug} tier={a.source_tier} src={a.hero_image_url} alt={a.hero_image_alt ?? ""} priority className="aspect-[16/9]" sizes="(min-width:1024px) 760px, 100vw" />
        <div className="space-y-3 p-5 sm:p-6">
          <Pills a={a} />
          <h2 className="tf-hover-title text-2xl leading-[1.12] font-bold text-balance sm:text-[2rem]">{a.title}</h2>
          <p className="line-clamp-3 max-w-[62ch] text-[15px] leading-relaxed text-muted">{a.tldr_answer}</p>
          <MetaLine a={a} />
        </div>
      </Link>
      {a.review_meta && (
        <div className="absolute top-4 right-4"><ScoreChip score={a.review_meta.score_100} /></div>
      )}
    </article>
  );
}

/** Secondary hero card: compact image + headline. */
export function SecondaryCard({ a }: { a: Article }) {
  return (
    <article className="group tf-card overflow-hidden">
      <Link href={articlePath(a)} className="grid grid-cols-[112px_1fr] gap-4 p-3 sm:grid-cols-[136px_1fr]">
        <div className="relative">
          <CoverArt seed={a.slug} tier={a.source_tier} src={a.hero_image_url} alt="" className="aspect-[4/3] rounded-lg" sizes="140px" />
          {a.review_meta && <div className="absolute -right-2 -bottom-2"><ScoreChip score={a.review_meta.score_100} /></div>}
        </div>
        <div className="min-w-0 space-y-2 py-0.5">
          <Pills a={a} />
          <h3 className="tf-hover-title line-clamp-3 text-[15px] leading-snug font-semibold">{a.title}</h3>
          <p className="font-mono text-[10.5px] text-muted"><time dateTime={a.updated_at}>{formatDateTime(a.updated_at)}</time></p>
        </div>
      </Link>
    </article>
  );
}

/** Standard listing row. */
export function RowCard({ a }: { a: Article }) {
  return (
    <article className="group">
      <Link href={articlePath(a)} className="grid gap-4 rounded-xl p-2 transition-colors hover:bg-surface sm:grid-cols-[200px_1fr] sm:p-3">
        <CoverArt seed={a.slug} tier={a.source_tier} src={a.hero_image_url} alt="" className="aspect-[16/9] rounded-lg" sizes="200px" />
        <div className="min-w-0 space-y-2">
          <Pills a={a} />
          <h3 className="tf-hover-title text-lg leading-snug font-semibold text-balance">{a.title}</h3>
          <p className="line-clamp-2 text-sm text-muted">{a.excerpt ?? a.tldr_answer}</p>
          <div className="flex flex-wrap items-center gap-2">
            <MetaLine a={a} />
            {a.platforms.slice(0, 3).map((p) => <PlatformTag key={p}>{p}</PlatformTag>)}
          </div>
        </div>
      </Link>
    </article>
  );
}

export function SectionHeading({ title, href, eyebrow }: { title: string; href?: string; eyebrow?: string }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4 border-b border-line pb-3">
      <div>
        {eyebrow && <p className="tf-eyebrow mb-1">{eyebrow}</p>}
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
      {href && <Link href={href} className="font-mono text-xs text-mint-text hover:underline">View all →</Link>}
    </div>
  );
}
