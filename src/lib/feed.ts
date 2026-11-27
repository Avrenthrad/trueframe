import type { Article } from "./schema";
import type { FeedItem } from "@/components/LatestFeed";
import { articlePath, DESK_LABEL, deskOf } from "./site";
import { readingTime, wireStamp } from "./format";

export function toFeedItem(a: Article): FeedItem {
  const desk = deskOf(a);
  return {
    slug: a.slug,
    url: articlePath(a),
    title: a.title,
    dek: a.excerpt ?? a.tldr_answer,
    desk,
    deskLabel: DESK_LABEL[desk],
    tier: a.source_tier,
    breaking: a.is_breaking,
    minutes: readingTime(a.body_md || a.tldr_answer),
    updatedIso: a.updated_at,
    updatedLabel: wireStamp(a.updated_at).label,
    score: a.review_meta?.score_100,
    verdict: a.review_meta?.verdict_label,
  };
}
