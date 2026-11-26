/* TrueFrame brand mark: a geometric viewfinder frame whose right edge is
 * broken by a sharp play triangle ("we frame the truth, then hit play").
 * Pure SVG, no font dependency in the mark. Colours come from CSS tokens so
 * it adapts to dark/light automatically; pass `tone="brand"` for fixed brand
 * colours (OG images, press kits). */

export const MARK_PATHS = {
  brackets:
    "M3 3h9v3.5H6.5V12H3z M3 29v-9h3.5v5.5H12V29z M29 3v6.5h-3.5V6.5H20V3z M29 29v-6.5h-3.5v3H20V29z",
  play: "M13.5 9.5 29 16 13.5 22.5z",
} as const;

type MarkProps = { size?: number; className?: string; title?: string; color?: string };

export function TrueFrameMark({ size = 28, className, title, color = "var(--tf-mint-strong)" }: MarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      shapeRendering="geometricPrecision"
    >
      <path d={MARK_PATHS.brackets} fill={color} />
      <path d={MARK_PATHS.play} fill={color} />
    </svg>
  );
}

type LogoProps = {
  variant?: "full" | "mark";
  /** Height of the mark in px; the wordmark scales with it. */
  size?: number;
  className?: string;
  tone?: "auto" | "brand";
};

export function TrueFrameLogo({ variant = "full", size = 28, className = "", tone = "auto" }: LogoProps) {
  const mint = tone === "brand" ? "#00E599" : "var(--tf-mint-strong)";
  const ink = tone === "brand" ? "#F4F6F8" : "var(--tf-text)";
  if (variant === "mark") return <TrueFrameMark size={size} className={className} title="TrueFrame" color={mint} />;
  return (
    <span className={`inline-flex items-center gap-2 select-none ${className}`} aria-label="TrueFrame">
      <TrueFrameMark size={size} color={mint} />
      <span
        aria-hidden
        className="font-display leading-none font-bold"
        style={{ fontSize: size * 0.72, letterSpacing: "-0.01em" }}
      >
        <span style={{ color: ink }}>TRUE</span>
        <span style={{ color: mint }}>FRAME</span>
      </span>
    </span>
  );
}
