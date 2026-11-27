import type { Metadata } from "next";
import { getLiveArticles } from "@/lib/store";
import { DealsGrid, type DealItem } from "@/components/Deals";
import { aud, formatDate, formatDateTime, percentOff } from "@/lib/format";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "AU & Global Game Deals",
  description: "Price-checked game, console and entertainment deals from JB Hi-Fi, Target, Big W, Amazon AU and Steam.",
  alternates: { canonical: "/deals" },
};

export default async function DealsPage() {
  const now = Date.now();
  const deals: DealItem[] = (await getLiveArticles())
    .filter((a) => a.category === "deal" && a.deal_meta)
    .map((a) => {
      const m = a.deal_meta!;
      const expired = !!m.expires_at && Date.parse(m.expires_at) < now;
      return {
        slug: a.slug,
        title: a.title,
        product: m.product_name ?? a.title,
        retailer: m.retailer,
        region: m.region,
        price: aud(m.price_aud),
        rrp: aud(m.rrp_aud),
        pct: percentOff(m.price_aud, m.rrp_aud),
        platform: m.platform,
        url: m.affiliate_url,
        updatedIso: a.updated_at,
        updatedLabel: formatDateTime(a.updated_at),
        fresh: now - Date.parse(a.updated_at) < 36 * 3600_000,
        expiresLabel: m.expires_at ? formatDate(m.expires_at, { day: "numeric", month: "short" }) : null,
        expired,
        note: a.tldr_answer,
      };
    })
    .sort((x, y) => Number(x.expired) - Number(y.expired) || y.pct - x.pct);

  return (
    <div className="up-container space-y-6 pt-8 pb-10">
      <header className="space-y-3">
        <p className="up-eyebrow">Price-checked · Updated daily</p>
        <h1 className="text-4xl font-bold sm:text-5xl">AU &amp; Global Deals</h1>
        <p className="max-w-[62ch] text-muted">
          Real discounts only. Every price is checked against the retailer listing and compared to RRP. We never list a full-price item as a deal.
        </p>
        <p className="border border-line bg-surface px-3 py-2 text-[13px] text-muted">
          <strong className="text-fg">Affiliate disclosure:</strong> retailer links on this page are affiliate links. If you buy, UNPATCHED.GG may earn a small commission at no
          extra cost to you. Commissions never influence which deals we list or how we score games.
        </p>
      </header>
      <DealsGrid deals={deals} />
    </div>
  );
}
