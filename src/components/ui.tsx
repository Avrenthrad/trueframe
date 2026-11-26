import Image from "next/image";
import type { Category, SourceTier, Verdict } from "@/lib/schema";
import { CATEGORY_LABEL } from "@/lib/site";

/* ── Icons (inline, 1.5px stroke, currentColor) ──────────────────────────── */
type IconProps = { className?: string };
const I = (d: string) =>
  function Icon({ className = "size-3.5" }: IconProps) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
        <path d={d} />
      </svg>
    );
  };
export const IconCheckBadge = I("M9 12l2 2 4-4M12 3l2.4 1.8 3 .2.9 2.8 2.2 2-1 2.8.4 3-2.6 1.6-1.2 2.7-3-.4L12 21l-2.4-1.5-3 .4-1.2-2.7L2.8 15.6l.4-3-1-2.8 2.2-2 .9-2.8 3-.2z");
export const IconShield = I("M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6z M9 12l2 2 4-4");
export const IconAlert = I("M12 9v4m0 4h.01M10.3 3.9L2.4 18a2 2 0 001.7 3h15.8a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z");
export const IconExternal = I("M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5");
export const IconClock = I("M12 7v5l3 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z");
export const IconSearch = I("M21 21l-4.3-4.3M17 11a6 6 0 11-12 0 6 6 0 0112 0z");
export const IconPlay = I("M7 4l13 8-13 8z");
export const IconCopy = I("M8 8h11v11H8z M5 16V5h11");
export const IconCheck = I("M5 12l5 5L20 7");
export const IconX = I("M6 6l12 12M18 6L6 18");
export const IconPlus = I("M12 5v14M5 12h14");
export const IconMinus = I("M5 12h14");
export const IconSun = I("M12 3v2M12 19v2M5 5l1.4 1.4M17.6 17.6L19 19M3 12h2M19 12h2M5 19l1.4-1.4M17.6 6.4L19 5M16 12a4 4 0 11-8 0 4 4 0 018 0z");
export const IconMoon = I("M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z");
export const IconMenu = I("M4 7h16M4 12h16M4 17h16");
export const IconArrowRight = I("M5 12h14M13 6l6 6-6 6");
export const IconCalendar = I("M4 6h16v14H4z M4 10h16 M8 3v4 M16 3v4");
export const IconBolt = I("M13 3L4 14h7l-1 7 9-11h-7z");

/* ── Source tier ─────────────────────────────────────────────────────────── */
export const TIER = {
  first_party_official: { label: "First-Party Official", short: "Official", cls: "text-mint-text bg-mint/10 border-mint/35", Icon: IconCheckBadge },
  verified_report: { label: "Verified Report", short: "Verified", cls: "text-sky-text bg-sky/10 border-sky/35", Icon: IconShield },
  unconfirmed_rumor: { label: "Unconfirmed Rumor", short: "Rumor", cls: "text-amber-text bg-amber/10 border-amber/40", Icon: IconAlert },
} as const satisfies Record<SourceTier, unknown>;

const pillBase = "inline-flex items-center gap-1.5 rounded-md border font-mono font-medium tracking-wide uppercase whitespace-nowrap";

export function SourceTierPill({ tier, compact = false }: { tier: SourceTier; compact?: boolean }) {
  const t = TIER[tier];
  return (
    <span className={`${pillBase} ${t.cls} ${compact ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-[11px]"}`} title={t.label}>
      <t.Icon className={compact ? "size-3" : "size-3.5"} />
      {compact ? t.short : t.label}
    </span>
  );
}

export function CategoryPill({ category, vertical }: { category: Category; vertical?: string }) {
  const label = vertical === "film_tv" && category === "news" ? "Film & TV" : CATEGORY_LABEL[category];
  return <span className={`${pillBase} border-line-strong bg-elevated px-1.5 py-0.5 text-[10px] text-fg`}>{label}</span>;
}

export function PlatformTag({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center rounded border border-line px-1.5 py-0.5 font-mono text-[10.5px] text-muted">{children}</span>;
}

export const VERDICT_STYLE: Record<Verdict, string> = {
  Buy: "bg-mint text-on-mint border-mint",
  Wait: "bg-amber text-[#1a1203] border-amber",
  Skip: "bg-coral text-white border-coral",
};

export function VerdictPill({ verdict, size = "md" }: { verdict: Verdict; size?: "sm" | "md" | "lg" }) {
  const s = size === "lg" ? "px-3 py-1.5 text-sm" : size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-xs";
  return <span className={`${pillBase} font-bold ${VERDICT_STYLE[verdict]} ${s}`}>{verdict}</span>;
}

/** Score colour band: 75+ mint, 50–74 amber, <50 coral. */
export function scoreColor(score: number) {
  return score >= 75 ? "var(--tf-mint)" : score >= 50 ? "var(--tf-amber)" : "var(--tf-coral)";
}

export function ScoreChip({ score }: { score: number }) {
  return (
    <span
      className="inline-grid size-9 shrink-0 place-items-center rounded-lg font-mono text-sm font-bold"
      style={{ background: `color-mix(in srgb, ${scoreColor(score)} 16%, transparent)`, color: "var(--tf-text)", boxShadow: `inset 0 0 0 1.5px ${scoreColor(score)}` }}
      aria-label={`Score ${score} out of 100`}
    >
      {score}
    </span>
  );
}

/* ── Cover art ───────────────────────────────────────────────────────────────
 * When an article has no hero image we render deterministic, on-brand
 * generative art instead of a grey box or a stock photo. Zero network cost. */
function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}
const ART_HUES: Record<SourceTier, [string, string]> = {
  first_party_official: ["#00E599", "#0B6B52"],
  verified_report: ["#38BDF8", "#164E73"],
  unconfirmed_rumor: ["#F59E0B", "#7A4A06"],
};

export function CoverArt({
  seed,
  tier,
  src,
  alt = "",
  priority = false,
  sizes = "(min-width: 1024px) 50vw, 100vw",
  className = "",
}: {
  seed: string;
  tier: SourceTier;
  src?: string | null;
  alt?: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  if (src) {
    return (
      <div className={`relative overflow-hidden bg-elevated ${className}`}>
        <Image src={src} alt={alt} fill priority={priority} sizes={sizes} className="object-cover" />
      </div>
    );
  }
  const h = hash(seed);
  const [c1, c2] = ART_HUES[tier];
  const x = 20 + (h % 60);
  const y = 15 + ((h >> 8) % 70);
  const r = 18 + ((h >> 16) % 22);
  const rot = (h >> 4) % 360;
  const id = `g${h.toString(36)}`;
  return (
    <div className={`relative overflow-hidden bg-[#0B0D12] ${className}`} role={alt ? "img" : undefined} aria-label={alt || undefined}>
      <svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full" aria-hidden>
        <defs>
          <radialGradient id={`${id}a`} cx={`${x}%`} cy={`${y}%`} r="75%">
            <stop offset="0" stopColor={c1} stopOpacity="0.55" />
            <stop offset="0.45" stopColor={c2} stopOpacity="0.35" />
            <stop offset="1" stopColor="#0B0D12" stopOpacity="0" />
          </radialGradient>
          <pattern id={`${id}p`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform={`rotate(${rot % 90})`}>
            <path d="M0 0H8" stroke="#ffffff" strokeOpacity="0.05" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="160" height="90" fill="#0E1119" />
        <rect width="160" height="90" fill={`url(#${id}a)`} />
        <rect width="160" height="90" fill={`url(#${id}p)`} />
        <g transform={`translate(${(x / 100) * 160} ${(y / 100) * 90}) rotate(${rot})`} opacity="0.5">
          <rect x={-r} y={-r} width={r * 2} height={r * 2} fill="none" stroke={c1} strokeOpacity="0.5" strokeWidth="0.6" />
          <rect x={-r * 0.6} y={-r * 0.6} width={r * 1.2} height={r * 1.2} fill="none" stroke={c1} strokeOpacity="0.35" strokeWidth="0.4" />
        </g>
        {/* Viewfinder corners echo the logo */}
        <g stroke="#ffffff" strokeOpacity="0.22" strokeWidth="1" fill="none">
          <path d="M8 16V8h8M144 8h8v8M152 74v8h-8M16 82H8v-8" />
        </g>
      </svg>
    </div>
  );
}
