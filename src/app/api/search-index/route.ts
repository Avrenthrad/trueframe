import { NextResponse } from "next/server";
import { getLiveArticles } from "@/lib/store";
import { articlePath, CATEGORY_LABEL } from "@/lib/site";

export const revalidate = 300;

/** Lightweight index the search modal loads on first open (no third-party search service). */
export async function GET() {
  const items = (await getLiveArticles()).map((a) => ({
    t: a.title,
    u: articlePath(a),
    c: CATEGORY_LABEL[a.category],
    s: a.source_tier,
    k: [a.tags.join(" "), a.platforms.join(" "), a.excerpt ?? a.tldr_answer].join(" ").slice(0, 400),
  }));
  return NextResponse.json(items);
}
