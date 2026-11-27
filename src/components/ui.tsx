import Image from "next/image";
import type { Article, SourceTier, Verdict } from "@/lib/schema";
import { DESK_LABEL, deskOf } from "@/lib/site";

/* ── Icons (inline, 2px stroke, currentColor) ────────────────────────────── */
type IconProps = { className?: string };
const I = (d: string) =>
  function Icon({ className = "size-3.5" }: IconProps) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="square" strokeLinejoin="miter" className={className} aria-hidden>
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

const tag = "inline-flex items-center gap-1.5 font-mono font-bold tracking-[0.08em] uppercase whitespace-nowrap";

/* ── Source tier ─────────────────────────────────────────────────────────────
 * Verified Green is reserved for the First-Party Official badge (solid fill,
 * white text: 5:1). The other tiers are outline tags so the green stays rare. */
export const TIER = {
  first_party_official: { label: "Primary Source · Official", short: "Official", cls: "bg-verified text-on-verified border-verified", Icon: IconCheckBadge },
  verified_report: { label: "Verified Report", short: "Verified", cls: "border-purple text-purple-text", Icon: IconShield },
  unconfirmed_rumor: { label: "Unconfirmed Rumor", short: "Rumor", cls: "border-gold text-gold-text", Icon: IconAlert },
} as const satisfies Record<SourceTier, unknown>;

export function SourceTierPill({ tier, compact = false }: { tier: SourceTier; compact?: boolean }) {
  const t = TIER[tier];
  return (
    <span className={`${tag} border ${t.cls} ${compact ? "px-1 py-px text-[9.5px]" : "px-1.5 py-0.5 text-[10.5px]"}`} title={t.label}>
      <t.Icon className={compact ? "size-2.5" : "size-3"} />
      {compact ? t.short : t.label}
    </span>
  );
}

/** Purple desk label: Games Desk, Movies & TV, Anime, Reviews, AU Deals… */
export function DeskTag({ a }: { a: Pick<Article, "category" | "vertical" | "deal_meta"> }) {
  return <span className="up-desk">{DESK_LABEL[deskOf(a)]}</span>;
}

/** Pink BREAKING tag. Only shown when an editor sets is_breaking. */
export function BreakingTag() {
  return <span className={`${tag} bg-accent px-1.5 py-px text-[10px] text-on-accent`}>Breaking</span>;
}

export function PlatformTag({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center border border-line px-1.5 py-px font-mono text-[10.5px] text-muted">{children}</span>;
}

/* ── Verdicts & scores: Vice Gold ──────────────────────────────────────────── */
export const VERDICT_STYLE: Record<Verdict, string> = {
  Buy: "bg-gold text-on-gold border-gold",
  Wait: "border-gold text-gold-text",
  Skip: "border-fg text-fg line-through decoration-2",
};

export function VerdictPill({ verdict, size = "md" }: { verdict: Verdict; size?: "sm" | "md" | "lg" }) {
  const s = size === "lg" ? "px-2.5 py-1 text-sm" : size === "sm" ? "px-1 py-px text-[9.5px]" : "px-1.5 py-0.5 text-xs";
  return <span className={`${tag} border ${VERDICT_STYLE[verdict]} ${s}`}>{verdict}</span>;
}

export function ScoreChip({ score }: { score: number }) {
  return (
    <span
      className="inline-grid h-8 w-10 shrink-0 place-items-center border-2 border-gold bg-surface font-mono text-sm font-bold text-fg"
      aria-label={`Score ${score} out of 100`}
    >
      {score}
    </span>
  );
}

/* ── Images ──────────────────────────────────────────────────────────────────
 * Real images render with an explicit credit line. With no image we show a
 * flat, honest placeholder (no gradients, no stock art) and an open credit slot. */
const SLOT_TINT: Record<SourceTier, string> = {
  first_party_official: "var(--up-accent)",
  verified_report: "var(--up-purple)",
  unconfirmed_rumor: "var(--up-gold)",
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
  // Deterministic flat composition: ink field + one hard-edged brand slash.
  let h = 0;
  for (const c of seed) h = (Math.imul(31, h) + c.charCodeAt(0)) | 0;
  const off = 30 + (Math.abs(h) % 60);
  return (
    <div className={`relative overflow-hidden border border-line bg-elevated ${className}`} role={alt ? "img" : undefined} aria-label={alt || undefined}>
      <svg viewBox="0 0 160 90" preserveAspectRatio="none" className="absolute inset-0 size-full" aria-hidden>
        <path d={`M${off} 90L${off + 26} 0H${off + 34}L${off + 8} 90Z`} fill={SLOT_TINT[tier]} />
        <path d="M0 89.5H160" stroke="var(--up-border-strong)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}

/** Figure wrapper with the mandatory `Image: [Studio / Official Press]` credit slot. */
export function CreditedImage({ a, className = "", priority = false, sizes }: { a: Article; className?: string; priority?: boolean; sizes?: string }) {
  return (
    <figure>
      <CoverArt seed={a.slug} tier={a.source_tier} src={a.hero_image_url} alt={a.hero_image_alt ?? (a.hero_image_url ? a.title : "")} priority={priority} sizes={sizes} className={className} />
      <ImageCredit a={a} />
    </figure>
  );
}

export function ImageCredit({ a }: { a: Pick<Article, "hero_image_url" | "hero_image_credit"> }) {
  return (
    <figcaption className="mt-1.5 font-mono text-[10.5px] text-muted">
      {a.hero_image_url ? (
        <>Image: {a.hero_image_credit ?? "credit pending"}</>
      ) : (
        <>Image: [Studio / Official Press] · awaiting asset</>
      )}
    </figcaption>
  );
}
