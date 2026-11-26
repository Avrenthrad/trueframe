import Link from "next/link";
import type { Article } from "@/lib/schema";
import { articlePath } from "@/lib/site";
import { formatDateTime, readingTime } from "@/lib/format";
import { BreakingTag, CoverArt, CreditedImage, DeskTag, PlatformTag, ScoreChip, SourceTierPill, VerdictPill } from "./ui";

export function MetaLine({ a, className = "" }: { a: Article; className?: string }) {
  return (
    <p className={`flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] text-muted ${className}`}>
      <span>By {a.author.name}</span>
      <span aria-hidden>·</span>
      <span>Updated <time dateTime={a.updated_at}>{formatDateTime(a.updated_at)}</time></span>
      <span aria-hidden>·</span>
      <span>{readingTime(a.body_md || a.tldr_answer)} min</span>
    </p>
  );
}

/** Kicker line: desk · breaking · source tier · verdict. */
export function Kicker({ a }: { a: Article }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
      {a.is_breaking && <BreakingTag />}
      <DeskTag a={a} />
      <SourceTierPill tier={a.source_tier} compact />
      {a.review_meta && <VerdictPill verdict={a.review_meta.verdict_label} size="sm" />}
    </div>
  );
}

/** Lead story: full-width credited image, big headline, the short answer as the dek. */
export function LeadCard({ a }: { a: Article }) {
  return (
    <article className="group">
      <Link href={articlePath(a)} className="block">
        <CreditedImage a={a} priority className="aspect-[16/9]" sizes="(min-width:1024px) 760px, 100vw" />
        <div className="mt-4 space-y-3">
          <Kicker a={a} />
          <h2 className="up-hover-title text-[1.9rem] leading-[1.06] font-bold text-balance sm:text-[2.6rem]">{a.title}</h2>
          <p className="max-w-[62ch] text-[16px] leading-relaxed text-muted">{a.tldr_answer}</p>
          <div className="flex items-center gap-3">
            {a.review_meta && <ScoreChip score={a.review_meta.score_100} />}
            <MetaLine a={a} />
          </div>
        </div>
      </Link>
    </article>
  );
}

/** Secondary story: hairline-ruled, headline-led, small credited thumb. */
export function SecondaryCard({ a }: { a: Article }) {
  return (
    <article className="group border-t border-line py-4 first:border-t-0 first:pt-0">
      <Link href={articlePath(a)} className="grid grid-cols-[1fr_112px] gap-4 lg:grid-cols-1">
        <div className="min-w-0 space-y-2">
          <Kicker a={a} />
          <h3 className="up-hover-title text-[17px] leading-snug font-bold text-balance lg:text-[19px]">{a.title}</h3>
          <p className="hidden text-sm leading-snug text-muted lg:line-clamp-2">{a.excerpt ?? a.tldr_answer}</p>
          <p className="font-mono text-[10.5px] text-muted"><time dateTime={a.updated_at}>{formatDateTime(a.updated_at)}</time></p>
        </div>
        <div className="relative lg:hidden">
          <CoverArt seed={a.slug} tier={a.source_tier} src={a.hero_image_url} alt="" className="aspect-[4/3]" sizes="112px" />
          {a.review_meta && <div className="absolute -bottom-px -left-px"><ScoreChip score={a.review_meta.score_100} /></div>}
        </div>
      </Link>
    </article>
  );
}

/** Standard listing row. */
export function RowCard({ a }: { a: Article }) {
  return (
    <article className="group">
      <Link href={articlePath(a)} className="grid gap-4 py-5 sm:grid-cols-[200px_1fr]">
        <CoverArt seed={a.slug} tier={a.source_tier} src={a.hero_image_url} alt="" className="aspect-[16/9]" sizes="200px" />
        <div className="min-w-0 space-y-2">
          <Kicker a={a} />
          <h3 className="up-hover-title text-xl leading-snug font-bold text-balance">{a.title}</h3>
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

/** Broadsheet section masthead: heavy ink rule, label, optional link. */
export function SectionHeading({ title, href, eyebrow, id }: { title: string; href?: string; eyebrow?: string; id?: string }) {
  return (
    <div className="up-masthead mb-4 flex items-baseline justify-between gap-4 border-b border-line pb-2.5">
      <div className="flex items-baseline gap-3">
        <h2 id={id} className="text-lg font-bold tracking-tight uppercase">{title}</h2>
        {eyebrow && <p className="up-eyebrow">{eyebrow}</p>}
      </div>
      {href && <Link href={href} className="font-mono text-[11px] font-bold tracking-wide text-accent-text uppercase hover:underline">All →</Link>}
    </div>
  );
}
