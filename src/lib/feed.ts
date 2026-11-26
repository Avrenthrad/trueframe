import type { Article } from "./schema";
import type { FeedItem } from "@/components/LatestFeed";
import { articlePath } from "./site";
import { formatDateTime, readingTime } from "./format";

export function toFeedItem(a: Article): FeedItem {
  return {
    slug: a.slug,
    url: articlePath(a),
    title: a.title,
    dek: a.excerpt ?? a.tldr_answer,
    category: a.category,
    vertical: a.vertical,
    tier: a.source_tier,
    minutes: readingTime(a.body_md || a.tldr_answer),
    updatedIso: a.updated_at,
    updatedLabel: formatDateTime(a.updated_at),
    region: a.deal_meta?.region,
    score: a.review_meta?.score_100,
    verdict: a.review_meta?.verdict_label,
  };
}
