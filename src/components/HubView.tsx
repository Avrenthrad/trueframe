"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { HubEntry, HubMeta } from "@/lib/schema";
import { PlatformTag, ScoreChip } from "./ui";

/* Every entry is always in the HTML; filters only toggle `hidden`. That keeps
 * the full tracker crawlable and usable without JavaScript, and lets static
 * previews drive the same markup through the data-* attributes. */

const fmtDay = (d: string) =>
  new Date(`${d}T00:00:00`).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" });
const fmtMonth = (d: string) => new Date(`${d}T00:00:00`).toLocaleDateString("en-AU", { month: "long", year: "numeric" });

function Chip({ on, onClick, kind, value, children }: { on: boolean; onClick: () => void; kind: string; value: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      data-filter={kind}
      data-value={value}
      onClick={onClick}
      className={`border px-3 py-1 text-[13px] font-semibold transition-colors ${
        on ? "border-purple bg-purple text-on-purple" : "border-line bg-surface text-muted hover:border-line-strong hover:text-fg"
      }`}
    >
      {children}
    </button>
  );
}

function Title({ e }: { e: HubEntry }) {
  return e.href ? (
    <Link href={e.href} className="font-semibold hover:text-accent-text hover:underline">{e.title}</Link>
  ) : (
    <span className="font-semibold">{e.title}</span>
  );
}

const dataAttrs = (e: HubEntry) => ({
  "data-platforms": e.platforms.join("|"),
  "data-score": e.score ?? 0,
  "data-service": e.service ?? "",
});

export function HubView({ meta }: { meta: HubMeta }) {
  const platforms = useMemo(() => [...new Set(meta.entries.flatMap((e) => e.platforms))].sort(), [meta.entries]);
  const [platform, setPlatform] = useState<string | null>(null);
  const [minScore, setMinScore] = useState(0);
  const [service, setService] = useState<"game_pass" | "ps_plus">("game_pass");
  const scored = meta.hub_type === "game_index" || meta.hub_type === "show_index" || meta.hub_type === "goty_tracker";
  const subs = meta.hub_type === "subscriptions";

  const sorted = useMemo(
    () =>
      scored
        ? [...meta.entries].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
        : [...meta.entries].sort((a, b) => (a.release_date ?? "").localeCompare(b.release_date ?? "")),
    [meta.entries, scored],
  );
  const visible = (e: HubEntry) =>
    (!platform || e.platforms.includes(platform)) && (!scored || (e.score ?? 0) >= minScore) && (!subs || e.service === service);
  const shown = sorted.filter(visible);
  const rank = new Map(shown.map((e, i) => [e, i + 1]));

  return (
    <div className="space-y-5" data-hub={meta.hub_type}>
      {/* Filters */}
      <div className="up-card flex flex-col gap-4 p-4" role="group" aria-label="Filters">
        {subs && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="up-eyebrow w-20">Service</span>
            <Chip kind="service" value="game_pass" on={service === "game_pass"} onClick={() => setService("game_pass")}>Game Pass</Chip>
            <Chip kind="service" value="ps_plus" on={service === "ps_plus"} onClick={() => setService("ps_plus")}>PS Plus</Chip>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <span className="up-eyebrow w-20">Platform</span>
          <Chip kind="platform" value="" on={platform === null} onClick={() => setPlatform(null)}>All</Chip>
          {platforms.map((p) => (
            <Chip key={p} kind="platform" value={p} on={platform === p} onClick={() => setPlatform(platform === p ? null : p)}>{p}</Chip>
          ))}
        </div>
        {scored && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="up-eyebrow w-20">Min score</span>
            {[0, 60, 75, 85].map((s) => (
              <Chip key={s} kind="score" value={String(s)} on={minScore === s} onClick={() => setMinScore(s)}>{s === 0 ? "Any" : `${s}+`}</Chip>
            ))}
          </div>
        )}
      </div>

      <p className="font-mono text-xs text-muted" aria-live="polite" data-hub-count>
        {shown.length} {shown.length === 1 ? "entry" : "entries"}
      </p>

      {scored && (
        <div className="up-card overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-fg text-left font-mono text-[11px] tracking-wider text-muted uppercase">
                <th scope="col" className="w-12 px-4 py-3">#</th>
                <th scope="col" className="px-2 py-3">Title</th>
                <th scope="col" className="px-2 py-3">Platforms</th>
                <th scope="col" className="w-20 px-4 py-3 text-right">Score</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((e) => (
                <tr key={e.title} {...dataAttrs(e)} hidden={!visible(e)} className="border-b border-line last:border-0 hover:bg-elevated/50">
                  <td className="px-4 py-3 font-mono text-muted" data-rank>{rank.get(e) ?? ""}</td>
                  <td className="px-2 py-3">
                    <Title e={e} />
                    {e.studio && <span className="block text-xs text-muted">{e.studio}</span>}
                  </td>
                  <td className="px-2 py-3"><span className="flex flex-wrap gap-1">{e.platforms.map((p) => <PlatformTag key={p}>{p}</PlatformTag>)}</span></td>
                  <td className="px-4 py-3"><span className="flex justify-end">{e.score !== undefined ? <ScoreChip score={e.score} /> : "—"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {meta.hub_type === "release_calendar" && (
        <div className="space-y-6">
          {Object.entries(
            sorted.reduce<Record<string, HubEntry[]>>((acc, e) => {
              const k = e.release_date ? fmtMonth(e.release_date) : "TBC";
              (acc[k] ??= []).push(e);
              return acc;
            }, {}),
          ).map(([month, list]) => (
            <section key={month} aria-label={month} data-group hidden={!list.some(visible)}>
              <h2 className="up-masthead mb-0 border-b border-line pb-2 text-base font-bold tracking-wide uppercase">{month}</h2>
              <ol className="divide-y divide-line">
                {list.map((e) => (
                  <li key={e.title} {...dataAttrs(e)} hidden={!visible(e)} className="grid grid-cols-[96px_1fr] items-center gap-3 py-3 sm:grid-cols-[120px_1fr_auto]">
                    <time dateTime={e.release_date} className="font-mono text-xs font-bold text-accent-text">{e.release_date ? fmtDay(e.release_date) : "TBC"}</time>
                    <div className="min-w-0">
                      <Title e={e} />
                      {e.studio && <span className="block text-xs text-muted">{e.studio}</span>}
                    </div>
                    <span className="col-span-2 flex flex-wrap gap-1 sm:col-span-1">{e.platforms.map((p) => <PlatformTag key={p}>{p}</PlatformTag>)}</span>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      )}

      {subs && (
        <div className="grid gap-6 md:grid-cols-2">
          {(["joining", "leaving"] as const).map((change) => {
            const list = sorted.filter((e) => e.change === change);
            const count = list.filter(visible).length;
            return (
              <section key={change} aria-label={change} data-group-change={change}>
                <h2 className={`up-masthead border-b border-line pb-2 font-mono text-xs font-bold tracking-wider uppercase ${change === "joining" ? "text-fg" : "text-accent-text"}`}>
                  {change === "joining" ? "▲ Joining" : "▼ Leaving"} <span className="text-muted">(<span data-change-count>{count}</span>)</span>
                </h2>
                <table className="w-full text-sm">
                  <thead className="sr-only"><tr><th>Date</th><th>Title</th><th>Tier</th></tr></thead>
                  <tbody>
                    {list.map((e) => (
                      <tr key={e.title} {...dataAttrs(e)} hidden={!visible(e)} className="border-b border-line">
                        <td className="w-28 py-3 pr-4 font-mono text-xs whitespace-nowrap text-muted">{e.release_date ? fmtDay(e.release_date) : "TBC"}</td>
                        <td className="py-3"><Title e={e} /></td>
                        <td className="py-3 pl-4 text-right"><PlatformTag>{e.tier ?? "—"}</PlatformTag></td>
                      </tr>
                    ))}
                    <tr data-empty hidden={count > 0}><td className="py-6 text-center text-muted" colSpan={3}>None announced.</td></tr>
                  </tbody>
                </table>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
