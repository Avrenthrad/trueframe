"use client";

import { useMemo, useState } from "react";
import { IconExternal } from "./ui";

export type DealItem = {
  slug: string;
  title: string;
  product: string;
  retailer: string;
  region: "AU" | "Global";
  price: string;
  rrp: string;
  pct: number;
  platform?: string;
  url: string;
  updatedIso: string;
  updatedLabel: string;
  fresh: boolean;
  expiresLabel: string | null;
  expired: boolean;
  note: string;
};

/* Retailer badge colours: identification only, text stays AA-legible. */
const RETAILER: Record<string, { bg: string; fg: string; mono: string }> = {
  "JB Hi-Fi": { bg: "#FFE600", fg: "#111111", mono: "JB" },
  Target: { bg: "#CC0000", fg: "#FFFFFF", mono: "T" },
  "Big W": { bg: "#0046BE", fg: "#FFFFFF", mono: "W" },
  "Amazon AU": { bg: "#232F3E", fg: "#FFFFFF", mono: "a" },
  Steam: { bg: "#1B2838", fg: "#FFFFFF", mono: "S" },
};

export function RetailerBadge({ name }: { name: string }) {
  const r = RETAILER[name] ?? { bg: "var(--up-elevated)", fg: "var(--up-text)", mono: name.slice(0, 2) };
  return (
    <span className="inline-flex items-center gap-2">
      <span className="grid size-7 place-items-center font-display text-[12px] font-bold" style={{ background: r.bg, color: r.fg }} aria-hidden>
        {r.mono}
      </span>
      <span className="text-sm font-semibold">{name}</span>
    </span>
  );
}

export function DealsGrid({ deals }: { deals: DealItem[] }) {
  const [region, setRegion] = useState<"all" | "AU" | "Global">("AU");
  const [retailer, setRetailer] = useState<string | null>(null);
  const retailers = useMemo(() => [...new Set(deals.map((d) => d.retailer))], [deals]);
  const show = (d: DealItem) => (region === "all" || d.region === region) && (!retailer || d.retailer === retailer);
  const list = deals.filter(show);

  const chip = (on: boolean) =>
    `border px-3 py-1 text-[13px] font-semibold transition-colors ${on ? "border-purple bg-purple text-on-purple" : "border-line bg-surface text-muted hover:text-fg"}`;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter deals">
        {(["AU", "Global", "all"] as const).map((r) => (
          <button key={r} type="button" data-filter="region" data-value={r} aria-pressed={region === r} className={chip(region === r)} onClick={() => setRegion(r)}>
            {r === "AU" ? "Australia" : r === "Global" ? "Global" : "All regions"}
          </button>
        ))}
        <span className="mx-1 h-5 w-px bg-line" aria-hidden />
        {retailers.map((r) => (
          <button key={r} type="button" data-filter="retailer" data-value={r} aria-pressed={retailer === r} className={chip(retailer === r)} onClick={() => setRetailer(retailer === r ? null : r)}>
            {r}
          </button>
        ))}
      </div>

      <ul className="grid border-t border-l border-line sm:grid-cols-2 xl:grid-cols-3">
        {deals.map((d) => (
          <li key={d.slug} id={d.slug} data-region={d.region} data-retailer={d.retailer} hidden={!show(d)} className={`flex scroll-mt-28 flex-col border-r border-b border-line bg-surface p-5 ${d.expired ? "opacity-60" : ""}`}>
            <div className="mb-3 flex items-center justify-between gap-2">
              <RetailerBadge name={d.retailer} />
              {d.expired ? (
                <span className="border border-line px-1.5 py-0.5 font-mono text-[10px] font-semibold text-muted uppercase">Expired</span>
              ) : d.fresh ? (
                <span className="bg-accent px-1.5 py-px font-mono text-[10px] font-bold tracking-[0.08em] text-on-accent uppercase">Update</span>
              ) : null}
            </div>
            <h2 className="text-[18px] leading-snug font-bold text-balance">{d.product}</h2>
            <p className="mt-1 font-mono text-[11px] text-muted">{[d.platform, d.region === "AU" ? "AU" : "Global"].filter(Boolean).join(" · ")}</p>
            <div className="mt-4 flex items-end gap-3">
              <span className="font-display text-3xl leading-none font-bold">{d.price}</span>
              <span className="pb-0.5 text-sm text-muted">
                <span className="sr-only">Recommended retail price </span><s>{d.rrp}</s> RRP
              </span>
              <span className="ml-auto bg-accent px-2 py-1 font-mono text-xs font-bold text-on-accent">{d.pct}% OFF</span>
            </div>
            <p className="mt-3 line-clamp-2 text-[13px] text-muted">{d.note}</p>
            <div className="mt-auto pt-4">
              <a
                href={d.url}
                target="_blank"
                rel="sponsored nofollow noopener noreferrer"
                className="flex items-center justify-center gap-2 border border-fg px-3 py-2.5 text-sm font-bold tracking-wide uppercase transition-colors hover:bg-fg hover:text-bg"
              >
                Get deal at {d.retailer} <IconExternal className="size-3.5" />
              </a>
              <p className="mt-2 flex justify-between font-mono text-[10.5px] text-muted">
                <time dateTime={d.updatedIso}>Checked {d.updatedLabel}</time>
                <span>{d.expiresLabel ? `Ends ${d.expiresLabel}` : "No end date"}</span>
              </p>
            </div>
          </li>
        ))}
      </ul>
      <p data-empty hidden={list.length > 0} className="py-10 text-center text-sm text-muted">No live deals match those filters.</p>
    </div>
  );
}
