import { ImageResponse } from "next/og";
import { MARK_PATHS } from "@/components/TrueFrameLogo";


const TIER = {
  first_party_official: { label: "FIRST-PARTY OFFICIAL", color: "#00E599" },
  verified_report: { label: "VERIFIED REPORT", color: "#38BDF8" },
  unconfirmed_rumor: { label: "UNCONFIRMED RUMOR", color: "#F59E0B" },
} as const;

/** Dynamic 1200×630 OpenGraph/Twitter card: /api/og?title=…&category=…&tier=… */
export function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = (searchParams.get("title") ?? "First-Party Truth. Real Hype.").slice(0, 140);
  const category = (searchParams.get("category") ?? "").toUpperCase().slice(0, 20);
  const tier = TIER[(searchParams.get("tier") ?? "") as keyof typeof TIER];

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#0B0D12", padding: 64, color: "#F4F6F8", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <svg width="56" height="56" viewBox="0 0 32 32">
            <path d={MARK_PATHS.brackets} fill="#00E599" />
            <path d={MARK_PATHS.play} fill="#00E599" />
          </svg>
          <div style={{ display: "flex", fontSize: 40, fontWeight: 800, letterSpacing: -1 }}>
            <span>TRUE</span>
            <span style={{ color: "#00E599" }}>FRAME</span>
          </div>
        </div>
        <div style={{ display: "flex", fontSize: title.length > 80 ? 52 : 64, fontWeight: 800, lineHeight: 1.08, letterSpacing: -1.5, maxWidth: 1050 }}>{title}</div>
        <div style={{ display: "flex", gap: 16, alignItems: "center", fontSize: 22, fontWeight: 700 }}>
          {category && <div style={{ display: "flex", padding: "8px 14px", border: "2px solid #2E3549", borderRadius: 8 }}>{category}</div>}
          {tier && <div style={{ display: "flex", padding: "8px 14px", border: `2px solid ${tier.color}`, color: tier.color, borderRadius: 8 }}>{tier.label}</div>}
          <div style={{ display: "flex", marginLeft: "auto", color: "#94A3B8" }}>First-Party Truth. Real Hype.</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630, headers: { "Cache-Control": "public, max-age=86400, immutable" } },
  );
}
