import type { Article, ReviewMeta } from "@/lib/schema";
import { aud } from "@/lib/format";
import { SITE } from "@/lib/site";
import { CoverArt, IconExternal, VerdictPill } from "./ui";

/** Flat score block: big number, gold frame, gold fill bar. No rings, no glow. */
export function ScoreBlock({ score, size = "lg" }: { score: number; size?: "lg" | "md" }) {
  const big = size === "lg";
  return (
    <div
      className={`shrink-0 border-[3px] border-gold bg-surface ${big ? "w-[124px]" : "w-[104px]"}`}
      role="img"
      aria-label={`${SITE.name} score: ${score} out of 100`}
    >
      <div className="flex items-baseline justify-center gap-1 px-2 pt-2 pb-1.5" aria-hidden>
        <span className={`font-mono leading-none font-bold text-fg ${big ? "text-[52px]" : "text-[42px]"}`}>{score}</span>
        <span className="font-mono text-[11px] text-muted">/100</span>
      </div>
      <div className="h-1.5 border-t border-line bg-elevated" aria-hidden>
        <div className="h-full bg-gold" style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

const VERDICT_COPY = { Buy: "Worth it at full price.", Wait: "Good, but wait for a sale or patch.", Skip: "Not worth your time or money." } as const;

export function VerdictCard({ a, position }: { a: Article; position: "top" | "bottom" }) {
  const r = a.review_meta!;
  const headingId = `verdict-${position}`;
  return (
    <section aria-labelledby={headingId} className="border-y-[3px] border-gold">
      <div className="flex flex-col gap-5 py-5 sm:flex-row sm:items-center">
        <ScoreBlock score={r.score_100} size={position === "top" ? "lg" : "md"} />
        <div className="min-w-0 flex-1 space-y-2.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 id={headingId} className="font-mono text-[11px] font-bold tracking-[0.12em] text-gold-text uppercase">
              {position === "top" ? "Verdict" : "Final Verdict"}
            </h2>
            <VerdictPill verdict={r.verdict_label} size="lg" />
            <span className="text-xs text-muted">{VERDICT_COPY[r.verdict_label]}</span>
          </div>
          <p className="font-display text-xl leading-snug font-bold text-balance sm:text-2xl">{r.verdict_sentence ?? a.tldr_answer}</p>
          <dl className="flex flex-wrap gap-x-5 gap-y-1 font-mono text-[11.5px] text-muted">
            <div className="flex gap-1.5"><dt>Tested on</dt><dd className="text-fg">{r.platform_tested}</dd></div>
            <div className="flex gap-1.5"><dt>{a.vertical === "games" ? "Played" : "Watched"}</dt><dd className="text-fg">{r.hours_played} hrs</dd></div>
            {r.human_approved && <div className="flex gap-1.5"><dt className="sr-only">Sign-off</dt><dd className="text-fg">✓ Human-reviewed score</dd></div>}
          </dl>
        </div>
      </div>
      <div className="grid border-t border-line md:grid-cols-2 md:divide-x md:divide-line">
        <div className="border-b border-line py-5 md:border-b-0 md:pr-5">
          <h3 className="mb-3 font-mono text-[11px] font-bold tracking-[0.1em] text-fg uppercase">+ The Good</h3>
          <ul className="space-y-2">
            {r.the_good.map((g) => (
              <li key={g} className="border-l-2 border-gold pl-3 text-[15px] leading-snug">{g}</li>
            ))}
          </ul>
        </div>
        <div className="py-5 md:pl-5">
          <h3 className="mb-3 font-mono text-[11px] font-bold tracking-[0.1em] text-accent-text uppercase">− The Bad</h3>
          <ul className="space-y-2">
            {r.the_bad.map((g) => (
              <li key={g} className="border-l-2 border-accent pl-3 text-[15px] leading-snug">{g}</li>
            ))}
          </ul>
        </div>
      </div>
      {r.where_to_buy?.length ? <WhereToBuy items={r.where_to_buy} /> : null}
    </section>
  );
}

export function WhereToBuy({ items }: { items: NonNullable<ReviewMeta["where_to_buy"]> }) {
  const groups = (["AU", "Global"] as const).map((region) => ({ region, list: items.filter((i) => i.region === region) })).filter((g) => g.list.length);
  return (
    <div className="border-t border-line py-5">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-mono text-[11px] font-bold tracking-[0.1em] text-muted uppercase">Where to Buy</h3>
        <p className="text-[11px] text-muted">Affiliate links. We may earn a commission, and it never affects scores.</p>
      </div>
      <div className="space-y-3">
        {groups.map((g) => (
          <div key={g.region} className="flex flex-wrap items-center gap-2">
            <span className="w-14 font-mono text-[10.5px] font-bold text-muted">{g.region}</span>
            {g.list.map((w) => (
              <a
                key={w.retailer}
                href={w.url}
                target="_blank"
                rel="sponsored nofollow noopener noreferrer"
                className="inline-flex items-center gap-2 border border-fg px-3 py-2 text-sm font-bold transition-colors hover:bg-fg hover:text-bg"
              >
                {w.retailer}
                {typeof w.price_aud === "number" && <span className="font-mono text-xs font-normal">{aud(w.price_aud)}</span>}
                <IconExternal className="size-3.5" />
              </a>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SentimentBar({ ours, critic, community }: { ours: number; critic?: number; community?: number }) {
  const rows = [
    { label: SITE.name, v: ours, ours: true },
    ...(critic !== undefined ? [{ label: "Critic avg", v: critic, ours: false }] : []),
    ...(community !== undefined ? [{ label: "Community", v: community, ours: false }] : []),
  ];
  if (rows.length < 2) return null;
  return (
    <section aria-labelledby="sentiment-h" className="up-card p-5">
      <h2 id="sentiment-h" className="mb-4 text-sm font-bold tracking-wide uppercase">Critic vs. Community</h2>
      <dl className="space-y-3">
        {rows.map((r) => (
          <div key={r.label} className="grid grid-cols-[104px_1fr_36px] items-center gap-3">
            <dt className="truncate font-mono text-[11px] text-muted">{r.label}</dt>
            <dd className="h-2.5 border border-line bg-elevated" aria-hidden>
              <div className={`h-full ${r.ours ? "bg-gold" : "bg-fg"}`} style={{ width: `${r.v}%` }} />
            </dd>
            <dd className="text-right font-mono text-sm font-bold">{Math.round(r.v)}</dd>
          </div>
        ))}
      </dl>
      {community !== undefined && critic !== undefined && Math.abs(community - critic) >= 10 && (
        <p className="mt-3 text-xs text-muted">Players and critics disagree by {Math.round(Math.abs(community - critic))} points.</p>
      )}
    </section>
  );
}

export function PullQuote({ quote, author }: { quote: string; author: string }) {
  return (
    <figure className="border-y-[3px] border-fg py-8">
      <blockquote className="max-w-[30ch] font-display text-3xl leading-[1.1] font-bold text-balance sm:text-4xl">
        <span className="text-accent" aria-hidden>“</span>{quote}<span className="text-accent" aria-hidden>”</span>
      </blockquote>
      <figcaption className="mt-3 font-mono text-[11px] text-muted">{author}, {SITE.name}</figcaption>
    </figure>
  );
}

export function ScreenshotStrip({ a }: { a: Article }) {
  const shots = a.gallery?.length
    ? a.gallery
    : Array.from({ length: 4 }, (_, i) => ({ url: "", alt: `${a.title}: gallery frame ${i + 1}`, credit: undefined as string | undefined }));
  return (
    <section aria-label="Screenshots" className="-mx-4 sm:mx-0">
      <ul className="scrollbar-none flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:px-0">
        {shots.map((s, i) => (
          <li key={i} className="w-[72%] shrink-0 snap-start sm:w-[44%]">
            <figure>
              <CoverArt seed={`${a.slug}-shot-${i}`} tier={a.source_tier} src={s.url || null} alt={s.alt} className="aspect-video" sizes="(min-width: 640px) 360px, 72vw" />
              <figcaption className="mt-1.5 font-mono text-[10.5px] text-muted">
                Image: {s.url ? s.credit ?? "credit pending" : "[Studio / Official Press] · awaiting asset"}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}
