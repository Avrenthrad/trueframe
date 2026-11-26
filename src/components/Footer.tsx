import Link from "next/link";
import { UnpatchedLogo } from "./UnpatchedLogo";
import { SourceTierPill } from "./ui";
import { SITE } from "@/lib/site";

const COLS: [string, [string, string][]][] = [
  ["Desks", [["/desks/games", "Games Desk"], ["/desks/movies-tv", "Movies & TV"], ["/desks/anime", "Anime"], ["/news", "All News"]]],
  ["Coverage", [["/reviews", "Reviews"], ["/guides", "Guides"], ["/hubs", "Trackers"], ["/deals", "AU & Global Deals"], ["/videos", "Video"]]],
];

export function Footer() {
  return (
    <footer className="mt-24 border-t-[3px] border-fg">
      <div className="up-container grid gap-0 md:grid-cols-[1.5fr_1fr_1fr_1.3fr] md:divide-x md:divide-line">
        <div className="space-y-4 py-10 md:pr-8">
          <UnpatchedLogo height={22} />
          <p className="max-w-sm text-sm text-muted">{SITE.tagline} Independent games, screen and deals journalism from Australia, written for everyone.</p>
        </div>
        {COLS.map(([title, links]) => (
          <div key={title} className="border-t border-line py-10 md:border-t-0 md:px-8">
            <h2 className="up-eyebrow mb-3">{title}</h2>
            <ul className="space-y-2 text-sm">
              {links.map(([h, l]) => (
                <li key={h}><Link className="text-muted hover:text-fg hover:underline" href={h}>{l}</Link></li>
              ))}
            </ul>
          </div>
        ))}
        <div className="border-t border-line py-10 md:border-t-0 md:pl-8">
          <h2 className="up-eyebrow mb-3">Standards</h2>
          <ul className="space-y-2 text-sm text-muted">
            <li>Every story links its primary source.</li>
            <li>Rumours are labelled, never headlined as fact.</li>
            <li>Scores are signed off by a human reviewer.</li>
            <li>Every image carries a credit line.</li>
            <li>Affiliate links are disclosed and never affect scores.</li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-1.5">
            <SourceTierPill tier="first_party_official" compact />
            <SourceTierPill tier="verified_report" compact />
            <SourceTierPill tier="unconfirmed_rumor" compact />
          </div>
        </div>
      </div>
      <div className="border-t border-line">
        <p className="up-container flex flex-wrap justify-between gap-2 py-4 font-mono text-[11px] text-muted">
          <span>© {new Date().getFullYear()} {SITE.domain} · Made in Australia · No ads, no autoplay.</span>
          <a className="hover:text-fg" href="/feed.xml">RSS</a>
        </p>
      </div>
    </footer>
  );
}
