import Link from "next/link";
import type { Article, HubEntry } from "@/lib/schema";
import { articlePath } from "@/lib/site";
import { formatDate } from "@/lib/format";
import { IconCalendar, PlatformTag, ScoreChip, VerdictPill } from "./ui";

/** Release entries in the next 7 days (AU time), falling back to the next 6 upcoming. */
export function upcomingReleases(hubs: Article[], now = new Date()): HubEntry[] {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Sydney" }).format(now); // YYYY-MM-DD
  const weekOut = new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Sydney" }).format(new Date(now.getTime() + 7 * 864e5));
  const all = hubs
    .filter((h) => h.hub_meta?.hub_type === "release_calendar")
    .flatMap((h) => h.hub_meta!.entries)
    .filter((e) => e.release_date && e.release_date >= today)
    .sort((a, b) => a.release_date!.localeCompare(b.release_date!));
  const week = all.filter((e) => e.release_date! <= weekOut);
  return (week.length >= 3 ? week : all).slice(0, 6);
}

export function ReleaseWidget({ entries }: { entries: HubEntry[] }) {
  return (
    <section aria-labelledby="ootw-h" className="tf-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 id="ootw-h" className="flex items-center gap-2 text-base font-bold">
          <IconCalendar className="size-4 text-mint-text" /> Out This Week
        </h2>
        <Link href="/hubs/release-calendar" className="font-mono text-[11px] text-mint-text hover:underline">Calendar →</Link>
      </div>
      {entries.length === 0 ? (
        <p className="text-sm text-muted">No confirmed releases this week.</p>
      ) : (
        <ol className="space-y-1">
          {entries.map((e) => {
            const d = new Date(`${e.release_date}T00:00:00`);
            const inner = (
              <>
                <span className="grid w-11 shrink-0 place-items-center rounded-md border border-line bg-elevated py-1 text-center leading-none">
                  <span className="font-mono text-[9px] tracking-wider text-muted uppercase">{d.toLocaleDateString("en-AU", { month: "short" })}</span>
                  <span className="font-display text-lg font-bold">{d.getDate()}</span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{e.title}</span>
                  <span className="mt-1 flex flex-wrap gap-1">{e.platforms.slice(0, 3).map((p) => <PlatformTag key={p}>{p}</PlatformTag>)}</span>
                </span>
              </>
            );
            return (
              <li key={`${e.title}-${e.release_date}`}>
                {e.href ? (
                  <Link href={e.href} className="flex items-center gap-3 rounded-lg p-1.5 hover:bg-elevated">{inner}</Link>
                ) : (
                  <div className="flex items-center gap-3 p-1.5">{inner}</div>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

export function TopRated({ reviews }: { reviews: Article[] }) {
  const top = reviews.filter((r) => r.review_meta).sort((a, b) => b.review_meta!.score_100 - a.review_meta!.score_100).slice(0, 5);
  return (
    <section aria-labelledby="top-h" className="tf-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 id="top-h" className="text-base font-bold">Top Rated Right Now</h2>
        <Link href="/hubs/game-index" className="font-mono text-[11px] text-mint-text hover:underline">Index →</Link>
      </div>
      <ol className="space-y-1">
        {top.map((r, i) => (
          <li key={r.slug}>
            <Link href={articlePath(r)} className="group flex items-center gap-3 rounded-lg p-1.5 hover:bg-elevated">
              <span className="w-4 font-mono text-xs text-muted">{i + 1}</span>
              <ScoreChip score={r.review_meta!.score_100} />
              <span className="min-w-0 flex-1">
                <span className="tf-hover-title block truncate text-sm font-semibold">{r.review_meta!.item_name ?? r.title}</span>
                <span className="font-mono text-[10.5px] text-muted">{r.review_meta!.platform_tested.split(" (")[0]}</span>
              </span>
              <VerdictPill verdict={r.review_meta!.verdict_label} size="sm" />
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function RailDeals({ deals }: { deals: Article[] }) {
  return (
    <section aria-labelledby="rd-h" className="tf-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 id="rd-h" className="text-base font-bold">AU Deals</h2>
        <Link href="/deals" className="font-mono text-[11px] text-mint-text hover:underline">All deals →</Link>
      </div>
      <ul className="space-y-2">
        {deals.slice(0, 3).map((d) => {
          const m = d.deal_meta!;
          return (
            <li key={d.slug}>
              <Link href={articlePath(d)} className="flex items-center justify-between gap-3 rounded-lg p-1.5 hover:bg-elevated">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{m.product_name ?? d.title}</span>
                  <span className="font-mono text-[10.5px] text-muted">{m.retailer} · ends {m.expires_at ? formatDate(m.expires_at, { day: "numeric", month: "short" }) : "TBC"}</span>
                </span>
                <span className="shrink-0 rounded-md bg-mint px-1.5 py-0.5 font-mono text-[11px] font-bold text-on-mint">-{Math.round((1 - m.price_aud / m.rrp_aud) * 100)}%</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
