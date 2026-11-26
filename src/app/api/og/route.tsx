import { readFile } from "node:fs/promises";
import { ImageResponse } from "next/og";
import { BRAND, MARK, WORDMARK_H, WORDMARK_W, wordmarkPaths } from "@/components/UnpatchedLogo";

const TIER = {
  first_party_official: { label: "PRIMARY SOURCE · OFFICIAL", bg: "#15803D", fg: "#FFFFFF", border: "#15803D" },
  verified_report: { label: "VERIFIED REPORT", bg: "transparent", fg: "#A78BFA", border: "#7C3AED" },
  unconfirmed_rumor: { label: "UNCONFIRMED RUMOR", bg: "transparent", fg: "#F5B700", border: "#F5B700" },
} as const;

const DESK: Record<string, string> = {
  news: "GAMES DESK",
  review: "REVIEWS",
  guide: "GUIDES",
  deal: "AU DEALS",
  hub: "TRACKERS",
};

// Space Grotesk Bold (SIL Open Font License), bundled next to the route so headlines match the site.
let fontData: Promise<Buffer> | null = null;
const loadFont = () => (fontData ??= readFile(new URL("./space-grotesk-700.woff", import.meta.url)));

/** Dynamic 1200×630 OpenGraph/Twitter card: /api/og?title=…&category=…&tier=…&desk=… */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = (searchParams.get("title") ?? "First-Party Truth. Real Hype.").slice(0, 140);
  const desk = (searchParams.get("desk") ?? DESK[searchParams.get("category") ?? ""] ?? "").toUpperCase().slice(0, 24);
  const tier = TIER[(searchParams.get("tier") ?? "") as keyof typeof TIER];
  const wm = wordmarkPaths(BRAND.paper);
  const wmH = 34;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: BRAND.ink, color: BRAND.paper, fontFamily: "Space Grotesk" }}>
        {/* Masthead */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "40px 64px 24px", borderBottom: `4px solid ${BRAND.paper}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <svg width="44" height="44" viewBox="0 0 32 32">
              <path d={MARK.pink} fill={BRAND.pink} />
              <path d={MARK.purple} fill={BRAND.purple} />
              <path d={MARK.fold} fill={BRAND.gold} />
              <path d={MARK.u} fill="#FFFFFF" fillRule="evenodd" />
            </svg>
            <svg width={(wmH * WORDMARK_W) / WORDMARK_H} height={wmH} viewBox={`0 0 ${WORDMARK_W} ${WORDMARK_H}`}>
              {wm.main.map((p, i) => <path key={`m${i}`} d={p.d} transform={p.transform} fill={p.fill} fillRule="evenodd" />)}
              {wm.tld.map((p, i) => <path key={`t${i}`} d={p.d} transform={p.transform} fill={p.fill} fillRule="evenodd" />)}
              <rect x={wm.bar.x} y={wm.bar.y} width={wm.bar.width} height={wm.bar.height} fill={wm.bar.fill} />
            </svg>
          </div>
          {desk && <div style={{ display: "flex", fontSize: 22, fontWeight: 700, letterSpacing: 3, color: "#A78BFA" }}>{desk}</div>}
        </div>
        {/* Headline */}
        <div style={{ display: "flex", flex: 1, alignItems: "center", padding: "0 64px" }}>
          <div style={{ display: "flex", fontSize: title.length > 80 ? 54 : 68, fontWeight: 700, lineHeight: 1.04, letterSpacing: -1.5, maxWidth: 1072 }}>{title}</div>
        </div>
        {/* Footer rule */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "22px 64px 40px", borderTop: "1px solid #262235", fontSize: 20, fontWeight: 700 }}>
          {tier && (
            <div style={{ display: "flex", padding: "6px 12px", background: tier.bg, color: tier.fg, border: `2px solid ${tier.border}`, letterSpacing: 2 }}>{tier.label}</div>
          )}
          <div style={{ display: "flex", marginLeft: "auto", color: "#A39DB0", letterSpacing: 1 }}>unpatched.gg</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [{ name: "Space Grotesk", data: await loadFont(), weight: 700, style: "normal" }],
      headers: { "Cache-Control": "public, max-age=86400, immutable" },
    },
  );
}
