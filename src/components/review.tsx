import type { Article, ReviewMeta } from "@/lib/schema";
import { aud } from "@/lib/format";
import { CoverArt, IconCheck, IconExternal, IconMinus, IconPlus, scoreColor, VerdictPill } from "./ui";

export function ScoreRing({ score, size = 112 }: { score: number; size?: number }) {
  const stroke = size * 0.09;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const color = scoreColor(score);
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={`TrueFrame score: ${score} out of 100`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--tf-border)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${(score / 100) * c} ${c}`}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center leading-none" aria-hidden>
        <div>
          <span className="block font-mono font-bold text-fg" style={{ fontSize: size * 0.34 }}>{score}</span>
          <span className="font-mono text-[10px] tracking-wider text-muted">/100</span>
        </div>
      </div>
    </div>
  );
}

const VERDICT_COPY = { Buy: "Worth it at full price.", Wait: "Good, but wait for a sale or patch.", Skip: "Not worth your time or money." } as const;

export function VerdictCard({ a, position }: { a: Article; position: "top" | "bottom" }) {
  const r = a.review_meta!;
  const headingId = `verdict-${position}`;
  return (
    <section aria-labelledby={headingId} className="tf-card overflow-hidden">
      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
        <ScoreRing score={r.score_100} size={position === "top" ? 120 : 104} />
        <div className="min-w-0 flex-1 space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <h2 id={headingId} className="font-mono text-[11px] font-semibold tracking-[0.1em] text-muted uppercase">
              {position === "top" ? "Verdict" : "Final Verdict"}
            </h2>
            <VerdictPill verdict={r.verdict_label} size="lg" />
            <span className="text-xs text-muted">{VERDICT_COPY[r.verdict_label]}</span>
          </div>
          <p className="font-display text-xl leading-snug font-semibold text-balance sm:text-2xl">{r.verdict_sentence ?? a.tldr_answer}</p>
          <dl className="flex flex-wrap gap-x-5 gap-y-1 font-mono text-[11.5px] text-muted">
            <div className="flex gap-1.5"><dt>Tested on</dt><dd className="text-fg">{r.platform_tested}</dd></div>
            <div className="flex gap-1.5"><dt>{a.vertical === "film_tv" ? "Watched" : "Played"}</dt><dd className="text-fg">{r.hours_played} hrs</dd></div>
            {r.human_approved && <div className="flex items-center gap-1 text-mint-text"><IconCheck className="size-3.5" /><dd>Human-reviewed score</dd></div>}
          </dl>
        </div>
      </div>
      <div className="grid border-t border-line md:grid-cols-2">
        <div className="border-b border-line p-5 md:border-r md:border-b-0">
          <h3 className="mb-3 font-mono text-[11px] font-semibold tracking-wider text-mint-text uppercase">The Good</h3>
          <ul className="space-y-2">
            {r.the_good.map((g) => (
              <li key={g} className="flex gap-2.5 text-[15px] leading-snug">
                <IconPlus className="mt-0.5 size-4 shrink-0 text-mint-text" />{g}
              </li>
            ))}
          </ul>
        </div>
        <div className="p-5">
          <h3 className="mb-3 font-mono text-[11px] font-semibold tracking-wider text-coral-text uppercase">The Bad</h3>
          <ul className="space-y-2">
            {r.the_bad.map((g) => (
              <li key={g} className="flex gap-2.5 text-[15px] leading-snug">
                <IconMinus className="mt-0.5 size-4 shrink-0 text-coral-text" />{g}
              </li>
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
    <div className="border-t border-line bg-elevated/40 p-5">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-mono text-[11px] font-semibold tracking-wider text-muted uppercase">Where to Buy</h3>
        <p className="text-[11px] text-muted">Affiliate links. We may earn a commission, and it never affects scores.</p>
      </div>
      <div className="space-y-3">
        {groups.map((g) => (
          <div key={g.region} className="flex flex-wrap items-center gap-2">
            <span className="w-14 font-mono text-[10.5px] text-muted">{g.region === "AU" ? "AU" : "Global"}</span>
            {g.list.map((w) => (
              <a
                key={w.retailer}
                href={w.url}
                target="_blank"
                rel="sponsored nofollow noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm font-semibold transition-colors hover:border-mint"
              >
                {w.retailer}
                {typeof w.price_aud === "number" && <span className="font-mono text-xs text-mint-text">{aud(w.price_aud)}</span>}
                <IconExternal className="size-3.5 text-muted" />
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
    { label: "TrueFrame", v: ours },
    ...(critic !== undefined ? [{ label: "Critic avg", v: critic }] : []),
    ...(community !== undefined ? [{ label: "Community", v: community }] : []),
  ];
  if (rows.length < 2) return null;
  return (
    <section aria-labelledby="sentiment-h" className="tf-card p-5">
      <h2 id="sentiment-h" className="mb-4 text-base font-bold">Critic vs. Community</h2>
      <dl className="space-y-3">
        {rows.map((r) => (
          <div key={r.label} className="grid grid-cols-[88px_1fr_36px] items-center gap-3">
            <dt className="font-mono text-[11px] text-muted">{r.label}</dt>
            <dd className="h-2.5 overflow-hidden rounded-full bg-elevated" aria-hidden>
              <div className="h-full rounded-full" style={{ width: `${r.v}%`, background: scoreColor(r.v) }} />
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
    <figure className="border-y border-line py-8 text-center">
      <blockquote className="mx-auto max-w-[30ch] font-display text-2xl leading-tight font-bold text-balance sm:text-3xl">
        <span className="text-mint-strong" aria-hidden>“</span>{quote}<span className="text-mint-strong" aria-hidden>”</span>
      </blockquote>
      <figcaption className="mt-3 font-mono text-[11px] text-muted">{author}, TrueFrame</figcaption>
    </figure>
  );
}

export function ScreenshotStrip({ a }: { a: Article }) {
  const shots = a.gallery?.length ? a.gallery : Array.from({ length: 5 }, (_, i) => ({ url: "", alt: `${a.title}: gallery frame ${i + 1}` }));
  return (
    <section aria-label="Screenshots" className="-mx-4 sm:mx-0">
      <ul className="scrollbar-none flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:px-0">
        {shots.map((s, i) => (
          <li key={i} className="w-[72%] shrink-0 snap-start sm:w-[44%]">
            <CoverArt seed={`${a.slug}-shot-${i}`} tier={a.source_tier} src={s.url || null} alt={s.alt} className="aspect-video rounded-lg border border-line" sizes="(min-width: 640px) 360px, 72vw" />
          </li>
        ))}
      </ul>
    </section>
  );
}
