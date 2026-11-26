import Link from "next/link";
import type { Article } from "@/lib/schema";
import { CATEGORY_LABEL, CATEGORY_PATH } from "@/lib/site";
import { formatDate, formatDateTime, readingTime } from "@/lib/format";
import { CategoryPill, CoverArt, IconAlert, IconCheck, IconExternal, IconBolt, PlatformTag, SourceTierPill, TIER } from "./ui";

const TIER_EXPLAINER = {
  first_party_official: "Confirmed directly by the developer, publisher, platform or studio.",
  verified_report: "Independently confirmed by TrueFrame with at least one named, on-record source.",
  unconfirmed_rumor: "Not confirmed by anyone official. Treat it as speculation until it is.",
} as const;

export function ArticleHeader({ a }: { a: Article }) {
  return (
    <header className="space-y-5">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-mono text-[11px] text-muted">
        <Link href="/" className="hover:text-fg">Home</Link>
        <span aria-hidden>/</span>
        <Link href={CATEGORY_PATH[a.category]} className="hover:text-fg">{CATEGORY_LABEL[a.category]}</Link>
      </nav>
      <div className="flex flex-wrap items-center gap-2">
        <CategoryPill category={a.category} vertical={a.vertical} />
        {a.platforms.map((p) => <PlatformTag key={p}>{p}</PlatformTag>)}
      </div>
      <h1 className="text-[2rem] leading-[1.08] font-bold text-balance sm:text-5xl">{a.title}</h1>
      {a.excerpt && <p className="max-w-[60ch] text-lg leading-relaxed text-muted">{a.excerpt}</p>}
      <SourceVerificationBar a={a} />
      <Byline a={a} />
    </header>
  );
}

/** Sits directly under the headline: how verified is this, and where's the proof? */
export function SourceVerificationBar({ a }: { a: Article }) {
  const t = TIER[a.source_tier];
  const ring =
    a.source_tier === "first_party_official" ? "border-mint/35" : a.source_tier === "verified_report" ? "border-sky/35" : "border-amber/45";
  return (
    <div className={`flex flex-wrap items-center gap-x-4 gap-y-3 rounded-xl border ${ring} bg-surface p-3 sm:p-3.5`} role="note" aria-label={`Source verification: ${t.label}`}>
      <SourceTierPill tier={a.source_tier} />
      <p className="min-w-[14rem] flex-1 basis-[16rem] text-[13px] leading-snug text-muted">{TIER_EXPLAINER[a.source_tier]}</p>
      <a
        href={a.primary_source_url}
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex max-w-full min-w-0 items-center gap-2 rounded-lg border border-line-strong bg-elevated px-3 py-1.5 font-mono text-[11.5px] text-fg transition-colors hover:border-mint"
      >
        <span className="text-muted">Primary source</span>
        <span className="truncate font-semibold">{a.primary_source_name}</span>
        <IconExternal className="size-3.5 shrink-0 text-mint-text" />
      </a>
    </div>
  );
}

export function Byline({ a }: { a: Article }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line pb-5 text-sm">
      <span className="flex items-center gap-2">
        <span className="grid size-8 place-items-center rounded-full bg-elevated font-display text-xs font-bold text-mint-text" aria-hidden>
          {a.author.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
        </span>
        <span>
          By{" "}
          {a.author.url ? <a href={a.author.url} className="font-semibold hover:underline">{a.author.name}</a> : <span className="font-semibold">{a.author.name}</span>}
        </span>
      </span>
      <span className="font-mono text-[11.5px] text-muted">
        {a.published_at && <>Published <time dateTime={a.published_at}>{formatDate(a.published_at)}</time> · </>}
        Updated <time dateTime={a.updated_at}>{formatDateTime(a.updated_at)}</time> · {readingTime(a.body_md || a.tldr_answer)} min read
      </span>
    </div>
  );
}

/** The direct answer, above the fold, zero padding. */
export function ShortAnswer({ text }: { text: string }) {
  return (
    <section aria-labelledby="short-answer" className="relative overflow-hidden rounded-xl border border-mint/40 bg-mint/[0.07] p-5 pl-6">
      <span className="absolute inset-y-0 left-0 w-1 bg-mint" aria-hidden />
      <h2 id="short-answer" className="mb-2 flex items-center gap-1.5 font-mono text-[11px] font-semibold tracking-[0.1em] text-mint-text uppercase">
        <IconBolt className="size-3.5" /> The Short Answer
      </h2>
      <p className="text-[17px] leading-relaxed font-medium text-fg sm:text-lg">{text}</p>
    </section>
  );
}

export function SpoilerBanner({ label }: { label: string }) {
  return (
    <div role="alert" className="flex items-start gap-3 rounded-xl border border-amber/50 bg-amber/[0.09] p-4">
      <IconAlert className="mt-0.5 size-5 shrink-0 text-amber-text" />
      <div>
        <p className="font-mono text-[11px] font-bold tracking-[0.1em] text-amber-text uppercase">Spoiler Warning</p>
        <p className="text-[15px] font-medium text-fg">{label}</p>
      </div>
    </div>
  );
}

export function HypeVsReality({ data, tier }: { data: NonNullable<Article["hype_vs_reality"]>; tier: Article["source_tier"] }) {
  return (
    <section aria-labelledby="hvr" className="tf-card overflow-hidden">
      <h2 id="hvr" className="border-b border-line px-5 py-3 text-lg font-bold">Hype vs. Reality</h2>
      <div className="grid md:grid-cols-2">
        <div className="border-b border-line p-5 md:border-r md:border-b-0">
          <p className="mb-3 flex items-center gap-2 font-mono text-[11px] font-semibold tracking-wider text-mint-text uppercase">
            <span className="size-2 rounded-full bg-mint" aria-hidden /> What&apos;s Confirmed
          </p>
          {data.confirmed_facts.length ? (
            <ul className="space-y-2.5">
              {data.confirmed_facts.map((f) => (
                <li key={f} className="flex gap-2.5 text-[15px] leading-snug">
                  <IconCheck className="mt-0.5 size-4 shrink-0 text-mint-text" />
                  {f}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">Nothing officially confirmed yet.</p>
          )}
          {tier === "unconfirmed_rumor" && data.confirmed_facts.length > 0 && (
            <p className="mt-3 font-mono text-[10.5px] text-muted">Background facts only. The rumour itself is unconfirmed.</p>
          )}
        </div>
        <div className="bg-elevated/40 p-5">
          <p className="mb-3 flex items-center gap-2 font-mono text-[11px] font-semibold tracking-wider text-amber-text uppercase">
            <span className="size-2 rounded-full bg-amber" aria-hidden /> Our Expectations
          </p>
          <ul className="space-y-2.5">
            {data.our_expectations.map((f) => (
              <li key={f} className="flex gap-2.5 text-[15px] leading-snug text-fg">
                <span className="mt-[7px] size-1.5 shrink-0 rotate-45 bg-amber" aria-hidden />
                {f}
              </li>
            ))}
          </ul>
          <p className="mt-3 font-mono text-[10.5px] text-muted">Analysis, not fact. Clearly separated on purpose.</p>
        </div>
      </div>
    </section>
  );
}

export function Prose({ html }: { html: string }) {
  return <div className="tf-prose" dangerouslySetInnerHTML={{ __html: html }} />;
}

export function FaqBlock({ faq }: { faq: NonNullable<Article["faq"]> }) {
  return (
    <section aria-labelledby="faq-h" className="space-y-3">
      <h2 id="faq-h" className="text-2xl font-bold">Quick questions</h2>
      <div className="divide-y divide-line rounded-xl border border-line bg-surface">
        {faq.map((f) => (
          <details key={f.q} className="group p-4 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between gap-4 font-semibold">
              {f.q}
              <span className="font-mono text-mint-text transition-transform group-open:rotate-45" aria-hidden>+</span>
            </summary>
            <p className="mt-2 text-[15px] leading-relaxed text-muted">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function HeroMedia({ a }: { a: Article }) {
  return (
    <CoverArt
      seed={a.slug}
      tier={a.source_tier}
      src={a.hero_image_url}
      alt={a.hero_image_alt ?? a.title}
      priority
      className="aspect-[16/9] rounded-xl border border-line"
      sizes="(min-width: 1024px) 800px, 100vw"
    />
  );
}

export function SourceFooter({ a }: { a: Article }) {
  return (
    <aside className="rounded-xl border border-line bg-surface p-4 text-sm text-muted">
      <p>
        <span className="font-semibold text-fg">Sourcing:</span> this article is based on{" "}
        <a href={a.primary_source_url} target="_blank" rel="noopener noreferrer" className="tf-link text-mint-text">{a.primary_source_name}</a>. Spot an error?
        We correct publicly and update the timestamp above.
      </p>
    </aside>
  );
}
