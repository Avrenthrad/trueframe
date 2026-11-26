"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { SourceTier, Verdict } from "@/lib/schema";
import type { DeskKey } from "@/lib/site";
import { BreakingTag, ScoreChip, SourceTierPill, VerdictPill } from "./ui";

export type FeedItem = {
  slug: string;
  url: string;
  title: string;
  dek: string;
  desk: DeskKey;
  deskLabel: string;
  tier: SourceTier;
  breaking: boolean;
  minutes: number;
  updatedIso: string;
  updatedLabel: string;
  score?: number;
  verdict?: Verdict;
};

const TABS: { id: "all" | DeskKey; label: string }[] = [
  { id: "all", label: "All desks" },
  { id: "games", label: "Games Desk" },
  { id: "film_tv", label: "Movies & TV" },
  { id: "anime", label: "Anime" },
  { id: "reviews", label: "Reviews" },
  { id: "guides", label: "Guides" },
  { id: "deals_au", label: "AU Deals" },
];

export function LatestFeed({ items }: { items: FeedItem[] }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("all");
  const [limit, setLimit] = useState(10);
  const filtered = useMemo(() => (tab === "all" ? items : items.filter((i) => i.desk === tab)), [items, tab]);
  const visibleSlugs = useMemo(() => new Set(filtered.slice(0, limit).map((i) => i.slug)), [filtered, limit]);
  const counts = useMemo(
    () => Object.fromEntries(TABS.map((t) => [t.id, t.id === "all" ? items.length : items.filter((i) => i.desk === t.id).length])),
    [items],
  );

  return (
    <section aria-labelledby="latest-h" className="min-w-0">
      <div className="up-masthead flex items-baseline justify-between border-b border-line pb-2.5">
        <h2 id="latest-h" className="text-lg font-bold tracking-tight uppercase">Latest</h2>
        <p className="up-eyebrow">Filed continuously</p>
      </div>
      <div role="tablist" aria-label="Filter by desk" className="scrollbar-none -mx-4 flex overflow-x-auto border-b border-line px-4 sm:mx-0 sm:px-0">
        {TABS.map((t) => {
          const selected = tab === t.id;
          return (
            <button
              key={t.id}
              role="tab"
              type="button"
              data-tab={t.id}
              aria-selected={selected}
              aria-controls="latest-panel"
              onClick={() => { setTab(t.id); setLimit(10); }}
              className={`relative flex shrink-0 items-center gap-1.5 px-3 py-3 text-[13px] font-semibold tracking-wide uppercase transition-colors ${
                selected ? "text-fg" : "text-muted hover:text-fg"
              }`}
            >
              {t.label}
              <span className="font-mono text-[10px] font-normal text-muted">{counts[t.id]}</span>
              {selected && <span className="absolute inset-x-3 -bottom-px h-[3px] bg-accent" aria-hidden />}
            </button>
          );
        })}
      </div>

      <ol id="latest-panel" role="tabpanel" className="divide-y divide-line">
        {/* All items stay in the HTML (crawlable, works without JS); filters toggle `hidden`. */}
        {items.map((i) => (
          <li key={i.slug} data-desk={i.desk} hidden={!visibleSlugs.has(i.slug)}>
            <Link href={i.url} className="group grid grid-cols-[64px_1fr_auto] gap-4 py-4">
              <time dateTime={i.updatedIso} className="pt-0.5 font-mono text-[11px] leading-tight text-muted">{i.updatedLabel}</time>
              <div className="min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                  {i.breaking && <BreakingTag />}
                  <span className="up-desk">{i.deskLabel}</span>
                  <SourceTierPill tier={i.tier} compact />
                  {i.verdict && <VerdictPill verdict={i.verdict} size="sm" />}
                </div>
                <h3 className="up-hover-title text-[17px] leading-snug font-bold text-balance">{i.title}</h3>
                <p className="line-clamp-1 text-sm text-muted">{i.dek}</p>
              </div>
              {typeof i.score === "number" ? <ScoreChip score={i.score} /> : <span />}
            </Link>
          </li>
        ))}
        <li data-empty hidden={filtered.length > 0} className="py-10 text-center text-sm text-muted">Nothing filed on this desk yet.</li>
      </ol>
      {filtered.length > limit && (
        <button
          type="button"
          data-load-more
          onClick={() => setLimit((l) => l + 10)}
          className="w-full border-y border-fg py-2.5 font-mono text-xs font-bold tracking-wide uppercase hover:bg-elevated"
        >
          Load more
        </button>
      )}
    </section>
  );
}
