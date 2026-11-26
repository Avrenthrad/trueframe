import { getLiveArticles } from "@/lib/store";
import { LeadCard, SecondaryCard } from "@/components/cards";
import { LatestFeed } from "@/components/LatestFeed";
import { RailDeals, ReleaseWidget, TopRated, upcomingReleases } from "@/components/Rail";
import { toFeedItem } from "@/lib/feed";
import { JsonLd, organizationLd, websiteLd } from "@/components/JsonLd";

export const revalidate = 300;

export default async function HomePage() {
  const all = await getLiveArticles();
  const editorial = all.filter((a) => a.category === "news" || a.category === "review" || a.category === "guide");
  // Lead: newest confirmed story (rumours never lead the homepage).
  const lead = editorial.find((a) => a.source_tier !== "unconfirmed_rumor") ?? editorial[0];
  const secondary = editorial.filter((a) => a !== lead).slice(0, 3);
  const feed = all.filter((a) => a.category !== "hub").map(toFeedItem);
  const reviews = all.filter((a) => a.category === "review");
  const hubs = all.filter((a) => a.category === "hub");
  const deals = all.filter((a) => a.category === "deal" && a.deal_meta?.region === "AU");

  return (
    <>
      <JsonLd data={[organizationLd(), websiteLd()]} />
      <h1 className="sr-only">TrueFrame: gaming and entertainment news, reviews, guides and deals</h1>

      <section aria-label="Top stories" className="tf-container pt-6 sm:pt-8">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
          {lead && <LeadCard a={lead} />}
          <div className="grid content-start gap-3">
            {secondary.map((a) => <SecondaryCard key={a.slug} a={a} />)}
          </div>
        </div>
      </section>

      <div className="tf-container mt-12 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
        <LatestFeed items={feed} />
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start" aria-label="Utility rail">
          <ReleaseWidget entries={upcomingReleases(hubs)} />
          <TopRated reviews={reviews} />
          {deals.length > 0 && <RailDeals deals={deals} />}
        </aside>
      </div>
    </>
  );
}
