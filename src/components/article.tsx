import Link from "next/link";
import type { Article } from "@/lib/schema";
import { DESK_LABEL, deskOf, SITE } from "@/lib/site";
import { formatDate, formatDateTime, readingTime } from "@/lib/format";
import { BreakingTag, CreditedImage, IconAlert, IconExternal, PlatformTag, SourceTierPill, TIER } from "./ui";

const DESK_HREF: Record<string, string> = {
  games: "/desks/games",
  film_tv: "/desks/movies-tv",
  anime: "/desks/anime",
  reviews: "/reviews",
  guides: "/guides",
  deals_au: "/deals",
  deals_global: "/deals",
  trackers: "/hubs",
};

const TIER_EXPLAINER = {
  first_party_official: "Confirmed directly by the developer, publisher, platform or studio.",
  verified_report: `Independently confirmed by ${SITE.name} with at least one named, on-record source.`,
  unconfirmed_rumor: "Not confirmed by anyone official. Treat it as speculation until it is.",
} as const;

export function ArticleHeader({ a }: { a: Article }) {
  const desk = deskOf(a);
  return (
    <header className="space-y-5">
      <div className="up-masthead flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line pb-2.5">
        {a.is_breaking && <BreakingTag />}
        <Link href={DESK_HREF[desk]} className="up-desk hover:underline">{DESK_LABEL[desk]}</Link>
        <span className="flex flex-wrap gap-1">{a.platforms.map((p) => <PlatformTag key={p}>{p}</PlatformTag>)}</span>
      </div>
      <h1 className="text-[2.1rem] leading-[1.04] font-bold text-balance sm:text-[3.4rem]">{a.title}</h1>
      {a.excerpt && <p className="max-w-[60ch] text-lg leading-relaxed text-muted">{a.excerpt}</p>}
      <SourceVerificationBar a={a} />
      <Byline a={a} />
    </header>
  );
}

/** Sits directly under the headline: how verified is this, and where's the proof? */
export function SourceVerificationBar({ a }: { a: Article }) {
  const t = TIER[a.source_tier];
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3 border-y border-line py-3" role="note" aria-label={`Source verification: ${t.label}`}>
      <SourceTierPill tier={a.source_tier} />
      <p className="min-w-[14rem] flex-1 basis-[16rem] text-[13px] leading-snug text-muted">{TIER_EXPLAINER[a.source_tier]}</p>
      <a
        href={a.primary_source_url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex max-w-full min-w-0 items-center gap-2 border border-fg px-2.5 py-1 font-mono text-[11.5px] text-fg transition-colors hover:bg-fg hover:text-bg"
      >
        <span className="opacity-70">Primary source</span>
        <span className="truncate font-bold">{a.primary_source_name}</span>
        <IconExternal className="size-3.5 shrink-0" />
      </a>
    </div>
  );
}

export function Byline({ a }: { a: Article }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm">
      <span>
        By{" "}
        {a.author.url ? <a href={a.author.url} className="font-bold hover:underline">{a.author.name}</a> : <span className="font-bold">{a.author.name}</span>}
      </span>
      <span className="font-mono text-[11.5px] text-muted">
        {a.published_at && <>Published <time dateTime={a.published_at}>{formatDate(a.published_at)}</time> · </>}
        Updated <time dateTime={a.updated_at}>{formatDateTime(a.updated_at)}</time> · {readingTime(a.body_md || a.tldr_answer)} min read
      </span>
    </div>
  );
}

/** The direct answer, above the fold. Gold editorial rule, flat paper. */
export function ShortAnswer({ text }: { text: string }) {
  return (
    <section aria-labelledby="short-answer" className="border-l-[4px] border-gold bg-surface py-4 pr-4 pl-5 outline outline-1 -outline-offset-1 outline-line">
      <h2 id="short-answer" className="mb-1.5 font-mono text-[11px] font-bold tracking-[0.12em] text-gold-text uppercase">The Short Answer</h2>
      <p className="text-[17px] leading-relaxed font-medium text-fg sm:text-lg">{text}</p>
    </section>
  );
}

export function SpoilerBanner({ label }: { label: string }) {
  return (
    <div role="alert" className="flex items-start gap-3 border-y-[3px] border-gold py-3">
      <IconAlert className="mt-0.5 size-5 shrink-0 text-gold-text" />
      <div>
        <p className="font-mono text-[11px] font-bold tracking-[0.12em] text-gold-text uppercase">Spoiler Warning</p>
        <p className="text-[15px] font-semibold text-fg">{label}</p>
      </div>
    </div>
  );
}

export function HypeVsReality({ data, tier }: { data: NonNullable<Article["hype_vs_reality"]>; tier: Article["source_tier"] }) {
  return (
    <section aria-labelledby="hvr" className="up-card">
      <h2 id="hvr" className="border-b border-fg px-5 py-3 text-base font-bold tracking-wide uppercase">Hype vs. Reality</h2>
      <div className="grid md:grid-cols-2 md:divide-x md:divide-line">
        <div className="border-b border-line p-5 md:border-b-0">
          <p className="mb-3 font-mono text-[11px] font-bold tracking-[0.1em] text-fg uppercase">✓ What&apos;s Confirmed</p>
          {data.confirmed_facts.length ? (
            <ul className="space-y-2.5">
              {data.confirmed_facts.map((f) => (
                <li key={f} className="border-l-2 border-fg pl-3 text-[15px] leading-snug">{f}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">Nothing officially confirmed yet.</p>
          )}
          {tier === "unconfirmed_rumor" && data.confirmed_facts.length > 0 && (
            <p className="mt-3 font-mono text-[10.5px] text-muted">Background facts only. The rumour itself is unconfirmed.</p>
          )}
        </div>
        <div className="p-5">
          <p className="mb-3 font-mono text-[11px] font-bold tracking-[0.1em] text-purple-text uppercase">◇ Our Expectations</p>
          <ul className="space-y-2.5">
            {data.our_expectations.map((f) => (
              <li key={f} className="border-l-2 border-dashed border-purple pl-3 text-[15px] leading-snug text-fg">{f}</li>
            ))}
          </ul>
          <p className="mt-3 font-mono text-[10.5px] text-muted">Analysis, not fact. Clearly separated on purpose.</p>
        </div>
      </div>
    </section>
  );
}

export function Prose({ html }: { html: string }) {
  return <div className="up-prose" dangerouslySetInnerHTML={{ __html: html }} />;
}

export function FaqBlock({ faq }: { faq: NonNullable<Article["faq"]> }) {
  return (
    <section aria-labelledby="faq-h">
      <h2 id="faq-h" className="up-masthead border-b border-line pb-2.5 text-lg font-bold tracking-tight uppercase">Quick questions</h2>
      <div className="divide-y divide-line border-b border-line">
        {faq.map((f) => (
          <details key={f.q} className="group py-4 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between gap-4 font-semibold">
              {f.q}
              <span className="font-mono text-lg text-accent-text transition-transform group-open:rotate-45" aria-hidden>+</span>
            </summary>
            <p className="mt-2 text-[15px] leading-relaxed text-muted">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function HeroMedia({ a }: { a: Article }) {
  return <CreditedImage a={a} priority className="aspect-[16/9]" sizes="(min-width: 1024px) 800px, 100vw" />;
}

export function SourceFooter({ a }: { a: Article }) {
  return (
    <aside className="border-t-[3px] border-fg pt-3 text-sm text-muted">
      <p>
        <span className="font-bold text-fg">Sourcing:</span> this article is based on{" "}
        <a href={a.primary_source_url} target="_blank" rel="noopener noreferrer" className="up-link text-accent-text">{a.primary_source_name}</a>. Spot an error?
        We correct publicly and update the timestamp above.
      </p>
    </aside>
  );
}
