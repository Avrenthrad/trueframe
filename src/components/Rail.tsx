import Link from "next/link";
import type { Article, HubEntry } from "@/lib/schema";
import { articlePath, DESK_LABEL, deskOf } from "@/lib/site";
import { formatDate, percentOff, wireStamp } from "@/lib/format";
import { BreakingTag, PlatformTag, ScoreChip, VerdictPill } from "./ui";

/** Release entries in the next 7 days (AU time), falling back to the next 6 upcoming. */
export function upcomingReleases(hubs: Article[], now = new Date()): HubEntry[] {
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Sydney" }); // YYYY-MM-DD
  const today = fmt.format(now);
  const weekOut = fmt.format(new Date(now.getTime() + 7 * 864e5));
  const all = hubs
    .filter((h) => h.hub_meta?.hub_type === "release_calendar")
    .flatMap((h) => h.hub_meta!.entries)
    .filter((e) => e.release_date && e.release_date >= today)
    .sort((a, b) => a.release_date!.localeCompare(b.release_date!));
  const week = all.filter((e) => e.release_date! <= weekOut);
  return (week.length >= 3 ? week : all).slice(0, 6);
}

function RailModule({ id, title, href, linkLabel, children }: { id: string; title: string; href?: string; linkLabel?: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id}>
      <div className="up-masthead mb-1 flex items-baseline justify-between border-b border-line pb-2">
        <h2 id={id} className="text-sm font-bold tracking-wide uppercase">{title}</h2>
        {href && <Link href={href} className="font-mono text-[10.5px] font-bold tracking-wide text-accent-text uppercase hover:underline">{linkLabel ?? "All"} →</Link>}
      </div>
      {children}
    </section>
  );
}

/** Timestamped wire of everything filed, newest first. */
export function LiveWire({ items }: { items: Article[] }) {
  return (
    <RailModule id="wire-h" title="Live Wire">
      <ol className="divide-y divide-line">
        {items.slice(0, 8).map((a) => {
          const t = wireStamp(a.updated_at);
          return (
            <li key={a.slug}>
              <Link href={articlePath(a)} className="group grid grid-cols-[44px_1fr] gap-3 py-2.5">
                <time dateTime={a.updated_at} className="font-mono text-[11px] leading-tight font-bold text-fg">
                  {t.clock}
                  <span className="block font-normal text-muted">{t.day}</span>
                </time>
                <span className="min-w-0">
                  <span className="flex items-center gap-2">
                    {a.is_breaking && <BreakingTag />}
                    <span className="up-desk">{DESK_LABEL[deskOf(a)]}</span>
                  </span>
                  <span className="up-hover-title mt-0.5 block text-[14px] leading-snug font-semibold">{a.title}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </RailModule>
  );
}

export function ReleaseWidget({ entries }: { entries: HubEntry[] }) {
  return (
    <RailModule id="ootw-h" title="Out This Week" href="/hubs/release-calendar" linkLabel="Calendar">
      {entries.length === 0 ? (
        <p className="py-3 text-sm text-muted">No confirmed releases this week.</p>
      ) : (
        <ol className="divide-y divide-line">
          {entries.map((e) => {
            const d = new Date(`${e.release_date}T00:00:00`);
            const inner = (
              <>
                <span className="grid w-11 shrink-0 place-items-center border border-fg py-1 text-center leading-none">
                  <span className="font-mono text-[9px] tracking-wider text-muted uppercase">{d.toLocaleDateString("en-AU", { month: "short" })}</span>
                  <span className="font-display text-lg font-bold">{d.getDate()}</span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="up-hover-title block truncate text-sm font-semibold">{e.title}</span>
                  <span className="mt-1 flex flex-wrap gap-1">{e.platforms.slice(0, 3).map((p) => <PlatformTag key={p}>{p}</PlatformTag>)}</span>
                </span>
              </>
            );
            return (
              <li key={`${e.title}-${e.release_date}`}>
                {e.href ? (
                  <Link href={e.href} className="group flex items-center gap-3 py-2.5">{inner}</Link>
                ) : (
                  <div className="flex items-center gap-3 py-2.5">{inner}</div>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </RailModule>
  );
}

export function TopRated({ reviews }: { reviews: Article[] }) {
  const top = reviews.filter((r) => r.review_meta).sort((a, b) => b.review_meta!.score_100 - a.review_meta!.score_100).slice(0, 5);
  return (
    <RailModule id="top-h" title="Top Rated" href="/hubs/game-index" linkLabel="Index">
      <ol className="divide-y divide-line">
        {top.map((r, i) => (
          <li key={r.slug}>
            <Link href={articlePath(r)} className="group flex items-center gap-3 py-2.5">
              <span className="w-3 font-mono text-xs text-muted">{i + 1}</span>
              <ScoreChip score={r.review_meta!.score_100} />
              <span className="min-w-0 flex-1">
                <span className="up-hover-title block truncate text-sm font-semibold">{r.review_meta!.item_name ?? r.title}</span>
                <span className="font-mono text-[10.5px] text-muted">{r.review_meta!.platform_tested.split(" (")[0]}</span>
              </span>
              <VerdictPill verdict={r.review_meta!.verdict_label} size="sm" />
            </Link>
          </li>
        ))}
      </ol>
    </RailModule>
  );
}

export function RailDeals({ deals }: { deals: Article[] }) {
  return (
    <RailModule id="rd-h" title="AU Deals" href="/deals">
      <ul className="divide-y divide-line">
        {deals.slice(0, 3).map((d) => {
          const m = d.deal_meta!;
          return (
            <li key={d.slug}>
              <Link href={articlePath(d)} className="group flex items-center justify-between gap-3 py-2.5">
                <span className="min-w-0">
                  <span className="up-hover-title block truncate text-sm font-semibold">{m.product_name ?? d.title}</span>
                  <span className="font-mono text-[10.5px] text-muted">{m.retailer} · ends {m.expires_at ? formatDate(m.expires_at, { day: "numeric", month: "short" }) : "TBC"}</span>
                </span>
                <span className="shrink-0 bg-accent px-1.5 py-0.5 font-mono text-[11px] font-bold text-on-accent">-{percentOff(m.price_aud, m.rrp_aud)}%</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </RailModule>
  );
}
