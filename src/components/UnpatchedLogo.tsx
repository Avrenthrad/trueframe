/* unpatched.gg brand marks. Pure SVG geometry (no font dependency), so the
 * wordmark renders identically in the navbar, favicon, OG cards and print.
 *
 *  - Wordmark: heavy condensed block "UNPATCHED" with a diagonal slash cut
 *    through the left stem of the U, ".GG" in Vice Pink, underscored by a thin
 *    Vice Gold bar.
 *  - Mark: square split diagonally Pink (top-left) / Purple (bottom-right),
 *    a Gold folded top-right corner, and a bold white sliced "U".
 */

export const BRAND = {
  pink: "#FF2E93",
  gold: "#F5B700",
  purple: "#7C3AED",
  ink: "#0B0A10",
  paper: "#F6F3EE",
} as const;

/* Glyph cell: 14 wide × 30 tall, stems 5 wide. Paths use evenodd for counters. */
const GLYPH: Record<string, string> = {
  // U with the diagonal slash cut through its left stem.
  U: "M0 0H5V10L0 13Z M0 16.4L5 13.4V25H9V0H14V30H0Z",
  N: "M0 30V0H5L9 13.5V0H14V30H9L5 16.5V30Z",
  P: "M0 0H14V18H5V30H0Z M5 5V13H9V5Z",
  A: "M0 30V0H14V30H9V19.5H5V30Z M5 5V14.5H9V5Z",
  T: "M0 0H14V5H9.5V30H4.5V5H0Z",
  C: "M0 0H14V8H9V5H5V25H9V22H14V30H0Z",
  H: "M0 0H5V12.5H9V0H14V30H9V17.5H5V30H0Z",
  E: "M0 0H14V5H5V12.5H12V17.5H5V25H14V30H0Z",
  D: "M0 0H10L14 4V26L10 30H0Z M5 5V25H8L9 24V6L8 5Z",
  G: "M0 0H14V8H9V5H5V25H9V18.5H7V13.5H14V30H0Z",
  ".": "M0 25H5V30H0Z",
};
const ADV: Record<string, number> = { ".": 5 };
const GAP = 2.6;

function layout(text: string, x0 = 0) {
  let x = x0;
  const parts: { d: string; x: number }[] = [];
  for (const ch of text) {
    parts.push({ d: GLYPH[ch], x });
    x += (ADV[ch] ?? 14) + GAP;
  }
  return { parts, end: x - GAP };
}

const MAIN = layout("UNPATCHED");
const TLD = layout(".GG", MAIN.end + GAP);
/** Wordmark viewBox: 0 0 WORDMARK_W 36 (30 cap height + 2.5 gap + 2 bar + pad). */
export const WORDMARK_W = Math.ceil(TLD.end);
export const WORDMARK_H = 36;

/** Raw SVG children for the wordmark; usable in React and in next/og. */
export function wordmarkPaths(ink: string, pink: string = BRAND.pink, gold: string = BRAND.gold) {
  return {
    main: MAIN.parts.map((p) => ({ d: p.d, transform: `translate(${p.x} 0)`, fill: ink })),
    tld: TLD.parts.map((p) => ({ d: p.d, transform: `translate(${p.x} 0)`, fill: pink })),
    bar: { x: 0, y: 33, width: WORDMARK_W, height: 2, fill: gold },
  };
}

/* Mark geometry on a 32 grid. */
export const MARK = {
  // Diagonal x+y=32 splits the square; the fold's inner corner (24,8) sits exactly on it.
  pink: "M0 0H24V8L0 32Z",
  purple: "M24 8H32V32H0Z",
  fold: "M24 0V8H32Z",
  // Bold sliced U, centred: 14 wide × 16 tall, stems 5, slash through left stem.
  u: "M9 8H14V11.6L9 14.1Z M9 17.1L14 14.6V19H18V8H23V24H9Z",
} as const;

type MarkProps = { size?: number; className?: string; title?: string };

export function UnpatchedMark({ size = 28, className, title }: MarkProps) {
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
      <path d={MARK.pink} fill={BRAND.pink} />
      <path d={MARK.purple} fill={BRAND.purple} />
      <path d={MARK.fold} fill={BRAND.gold} />
      <path d={MARK.u} fill="#FFFFFF" fillRule="evenodd" />
    </svg>
  );
}

type WordmarkProps = {
  /** Rendered height in px (cap height ≈ 83% of this). */
  height?: number;
  className?: string;
  /** "auto" follows the theme ink; "paper"/"ink" force a colour (OG, print). */
  tone?: "auto" | "paper" | "ink";
};

export function UnpatchedWordmark({ height = 22, className, tone = "auto" }: WordmarkProps) {
  const ink = tone === "paper" ? BRAND.paper : tone === "ink" ? BRAND.ink : "var(--up-text)";
  const w = wordmarkPaths(ink);
  return (
    <svg
      height={height}
      width={(height * WORDMARK_W) / WORDMARK_H}
      viewBox={`0 0 ${WORDMARK_W} ${WORDMARK_H}`}
      className={className}
      role="img"
      aria-label="UNPATCHED.GG"
      shapeRendering="crispEdges"
    >
      {w.main.map((p, i) => <path key={`m${i}`} {...p} fillRule="evenodd" />)}
      {w.tld.map((p, i) => <path key={`t${i}`} {...p} fillRule="evenodd" />)}
      <rect {...w.bar} />
    </svg>
  );
}

/** Header/footer lockup: mark + wordmark. */
export function UnpatchedLogo({ height = 24, className = "", withMark = true }: { height?: number; className?: string; withMark?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {withMark && <UnpatchedMark size={Math.round(height * 1.15)} />}
      <UnpatchedWordmark height={height} />
    </span>
  );
}
