"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Category, SourceTier, Verdict, Vertical } from "@/lib/schema";
import { CategoryPill, IconClock, ScoreChip, SourceTierPill, VerdictPill } from "./ui";

export type FeedItem = {
  slug: string;
  url: string;
  title: string;
  dek: string;
  category: Category;
  vertical: Vertical;
  tier: SourceTier;
  minutes: number;
  updatedIso: string;
  updatedLabel: string;
  region?: "AU" | "Global";
  score?: number;
  verdict?: Verdict;
};

const TABS = [
  { id: "all", label: "All" },
  { id: "games", label: "Games" },
  { id: "film_tv", label: "Film & TV" },
  { id: "review", label: "Reviews" },
  { id: "guide", label: "Guides" },
  { id: "au_deals", label: "AU Deals" },
] as const;
type TabId = (typeof TABS)[number]["id"];

function match(tab: TabId, i: FeedItem) {
  switch (tab) {
    case "all": return true;
    case "games": return i.vertical === "games" && i.category !== "deal";
    case "film_tv": return i.vertical === "film_tv";
    case "review": return i.category === "review";
    case "guide": return i.category === "guide";
    case "au_deals": return i.category === "deal" && i.region === "AU";
  }
}

export function LatestFeed({ items }: { items: FeedItem[] }) {
  const [tab, setTab] = useState<TabId>("all");
  const [limit, setLimit] = useState(10);
  const filtered = useMemo(() => items.filter((i) => match(tab, i)), [items, tab]);
  const counts = useMemo(() => Object.fromEntries(TABS.map((t) => [t.id, items.filter((i) => match(t.id, i)).length])), [items]);

  return (
    <section aria-labelledby="latest-h" className="min-w-0">
      <div className="mb-3 flex items-end justify-between border-b border-line pb-3">
        <div>
          <p className="tf-eyebrow mb-1">Updated continuously</p>
          <h2 id="latest-h" className="text-xl font-bold">Latest</h2>
        </div>
      </div>
      <div role="tablist" aria-label="Filter latest stories" className="scrollbar-none -mx-4 mb-2 flex gap-1.5 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        {TABS.map((t) => {
          const selected = tab === t.id;
          return (
            <button
              key={t.id}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls="latest-panel"
              onClick={() => { setTab(t.id); setLimit(10); }}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                selected ? "border-mint bg-mint text-on-mint" : "border-line bg-surface text-muted hover:border-line-strong hover:text-fg"
              }`}
            >
              {t.label}
              <span className={`font-mono text-[10px] ${selected ? "text-on-mint/75" : "text-muted"}`}>{counts[t.id]}</span>
            </button>
          );
        })}
      </div>

      <ol id="latest-panel" role="tabpanel" className="divide-y divide-line">
        {filtered.slice(0, limit).map((i) => (
          <li key={i.slug}>
            <Link href={i.url} className="group flex gap-4 py-4">
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <CategoryPill category={i.category} vertical={i.vertical} />
                  <SourceTierPill tier={i.tier} compact />
                  {i.verdict && <VerdictPill verdict={i.verdict} size="sm" />}
                  {i.region && <span className="font-mono text-[10px] text-muted">{i.region === "AU" ? "AU" : "Global"}</span>}
                </div>
                <h3 className="tf-hover-title text-[17px] leading-snug font-semibold text-balance">{i.title}</h3>
                <p className="line-clamp-1 text-sm text-muted">{i.dek}</p>
                <p className="flex items-center gap-2 font-mono text-[11px] text-muted">
                  <IconClock className="size-3" /> {i.minutes} min
                  <span aria-hidden>·</span>
                  <time dateTime={i.updatedIso}>Updated {i.updatedLabel}</time>
                </p>
              </div>
              {typeof i.score === "number" && <ScoreChip score={i.score} />}
            </Link>
          </li>
        ))}
        {filtered.length === 0 && <li className="py-10 text-center text-sm text-muted">Nothing here yet.</li>}
      </ol>
      {filtered.length > limit && (
        <button
          type="button"
          onClick={() => setLimit((l) => l + 10)}
          className="mt-2 w-full rounded-lg border border-line py-2.5 text-sm font-medium text-muted hover:border-line-strong hover:text-fg"
        >
          Load more
        </button>
      )}
    </section>
  );
}
