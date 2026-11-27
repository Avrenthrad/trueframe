import Link from "next/link";
import { getLiveArticles } from "@/lib/store";
import { LeadCard, SecondaryCard } from "@/components/cards";
import { LatestFeed } from "@/components/LatestFeed";
import { LiveWire, RailDeals, ReleaseWidget, TopRated, upcomingReleases } from "@/components/Rail";
import { toFeedItem } from "@/lib/feed";
import { JsonLd, organizationLd, websiteLd } from "@/components/JsonLd";
import { articlePath, DESK_LABEL, deskOf, type DeskKey } from "@/lib/site";
import { wireStamp } from "@/lib/format";
import type { Article } from "@/lib/schema";

export const revalidate = 300;

const DESK_STRIP: { key: DeskKey; href: string }[] = [
  { key: "games", href: "/desks/games" },
  { key: "film_tv", href: "/desks/movies-tv" },
  { key: "anime", href: "/desks/anime" },
];

function DeskColumn({ desk, href, items }: { desk: DeskKey; href: string; items: Article[] }) {
  return (
    <section aria-labelledby={`desk-${desk}`} className="py-5 md:px-6 md:first:pl-0 md:last:pr-0">
      <div className="mb-2 flex items-baseline justify-between">
        <h2 id={`desk-${desk}`} className="up-desk text-[12px]">{DESK_LABEL[desk]}</h2>
        <Link href={href} className="font-mono text-[10.5px] font-bold tracking-wide text-accent-text uppercase hover:underline">Desk →</Link>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted">Nothing filed yet.</p>
      ) : (
        <ol className="divide-y divide-line">
          {items.slice(0, 3).map((a) => (
            <li key={a.slug}>
              <Link href={articlePath(a)} className="group block py-3">
                <h3 className="up-hover-title text-[16px] leading-snug font-bold text-balance">{a.title}</h3>
                <p className="mt-1 font-mono text-[10.5px] text-muted">{wireStamp(a.updated_at).label}</p>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export default async function HomePage() {
  const all = await getLiveArticles();
  const editorial = all.filter((a) => a.category === "news" || a.category === "review" || a.category === "guide");
  // Lead: an editor-flagged breaking story first, else newest confirmed story. Rumours never lead.
  const confirmed = editorial.filter((a) => a.source_tier !== "unconfirmed_rumor");
  const lead = confirmed.find((a) => a.is_breaking) ?? confirmed[0] ?? editorial[0];
  const secondary = editorial.filter((a) => a !== lead).slice(0, 4);
  const feed = all.filter((a) => a.category !== "hub").map(toFeedItem);
  const wire = [...all].filter((a) => a.category === "news" || a.category === "review" || a.category === "guide").sort((a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at));
  const reviews = all.filter((a) => a.category === "review");
  const hubs = all.filter((a) => a.category === "hub");
  const deals = all.filter((a) => a.category === "deal" && a.deal_meta?.region === "AU");
  const byDesk = (k: DeskKey) => all.filter((a) => a.category !== "deal" && a.category !== "hub" && deskOf(a) === k);

  return (
    <>
      <JsonLd data={[organizationLd(), websiteLd()]} />
      <h1 className="sr-only">UNPATCHED.GG: games, movies &amp; TV, anime news, reviews, guides and AU deals</h1>

      {/* Front page: lead | secondaries | live wire, divided by hairlines */}
      <section aria-label="Top stories" className="up-container pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)_300px] lg:divide-x lg:divide-line">
          <div className="pb-6 lg:pr-6">{lead && <LeadCard a={lead} />}</div>
          <div className="border-t border-line py-6 lg:border-t-0 lg:px-6 lg:pt-0">
            {secondary.map((a) => <SecondaryCard key={a.slug} a={a} />)}
          </div>
          <div className="border-t border-line pt-6 lg:border-t-0 lg:pt-0 lg:pl-6">
            <LiveWire items={wire} />
          </div>
        </div>
      </section>

      {/* Desk strip */}
      <section aria-label="Desks" className="up-container mt-6">
        <div className="grid grid-cols-1 border-y-[3px] border-fg md:grid-cols-3 md:divide-x md:divide-line">
          {DESK_STRIP.map((d) => <DeskColumn key={d.key} desk={d.key} href={d.href} items={byDesk(d.key)} />)}
        </div>
      </section>

      <div className="up-container mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-0 lg:divide-x lg:divide-line">
        <div className="lg:pr-8"><LatestFeed items={feed} /></div>
        <aside className="space-y-8 lg:pl-8" aria-label="Trackers and deals">
          <ReleaseWidget entries={upcomingReleases(hubs)} />
          <TopRated reviews={reviews} />
          {deals.length > 0 && <RailDeals deals={deals} />}
        </aside>
      </div>
    </>
  );
}

