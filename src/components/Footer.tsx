import Link from "next/link";
import { TrueFrameLogo } from "./TrueFrameLogo";
import { SourceTierPill } from "./ui";
import { SITE } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-surface">
      <div className="tf-container grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-4">
          <TrueFrameLogo size={24} />
          <p className="max-w-sm text-sm text-muted">{SITE.tagline} Independent gaming &amp; entertainment coverage from Australia, written for everyone.</p>
          <div className="flex flex-wrap gap-2">
            <SourceTierPill tier="first_party_official" compact />
            <SourceTierPill tier="verified_report" compact />
            <SourceTierPill tier="unconfirmed_rumor" compact />
          </div>
        </div>
        <div>
          <h2 className="tf-eyebrow mb-3">Sections</h2>
          <ul className="space-y-2 text-sm">
            {[["/news", "News"], ["/reviews", "Reviews"], ["/guides", "Guides"], ["/hubs", "Hubs & Trackers"], ["/deals", "AU & Global Deals"], ["/videos", "Videos"]].map(([h, l]) => (
              <li key={h}><Link className="text-muted hover:text-fg" href={h}>{l}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="tf-eyebrow mb-3">Standards</h2>
          <ul className="space-y-2 text-sm text-muted">
            <li>Every story links its primary source.</li>
            <li>Rumours are labelled, never headlined as fact.</li>
            <li>Scores are signed off by a human reviewer.</li>
            <li>Affiliate links are disclosed; they never affect scores.</li>
            <li><a className="hover:text-fg" href="/feed.xml">RSS feed</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <p className="tf-container py-5 font-mono text-[11px] text-muted">© {new Date().getFullYear()} TrueFrame · Made in Australia · No ads, no autoplay.</p>
      </div>
    </footer>
  );
}
