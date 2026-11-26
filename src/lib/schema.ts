import { z } from "zod";

/* ────────────────────────────────────────────────────────────────────────────
 * TrueFrame content schema.
 *
 * Brand rule: primary first-party sources are the first truth. Every article
 * names the source it rests on, states how verified that source is, and leads
 * with a direct answer. The refinements at the bottom of this file encode the
 * "never lie or mislead" rules that are checkable by a machine.
 * ──────────────────────────────────────────────────────────────────────────── */

export const CATEGORIES = ["news", "review", "guide", "deal", "hub"] as const;
export const SOURCE_TIERS = ["first_party_official", "verified_report", "unconfirmed_rumor"] as const;
export const STATUSES = ["draft", "scheduled", "published"] as const;
export const VERTICALS = ["games", "film_tv"] as const;
export const VERDICTS = ["Buy", "Wait", "Skip"] as const;
export const REGIONS = ["AU", "Global"] as const;

export type Category = (typeof CATEGORIES)[number];
export type SourceTier = (typeof SOURCE_TIERS)[number];
export type Status = (typeof STATUSES)[number];
export type Vertical = (typeof VERTICALS)[number];
export type Verdict = (typeof VERDICTS)[number];

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const text = (max: number) => z.string().trim().min(1).max(max);
const httpsUrl = z
  .string()
  .trim()
  .url()
  .refine((u) => u.startsWith("https://"), "must be an https:// URL");
const isoDate = z.string().datetime({ offset: true });
const stringList = (maxItems: number, maxLen = 400) => z.array(text(maxLen)).max(maxItems);

export const authorSchema = z
  .union([text(120), z.object({ name: text(120), url: httpsUrl.optional() })])
  .transform((a) => (typeof a === "string" ? { name: a } : a));

export const spoilerSchema = z.object({
  enabled: z.boolean(),
  label: text(160).default("Spoilers ahead"),
});

export const hypeVsRealitySchema = z.object({
  confirmed_facts: stringList(20),
  our_expectations: stringList(20),
});

export const whereToBuySchema = z.object({
  retailer: text(60),
  region: z.enum(REGIONS),
  url: httpsUrl,
  price_aud: z.number().nonnegative().optional(),
});

export const reviewMetaSchema = z.object({
  score_100: z.number().int().min(0).max(100),
  verdict_label: z.enum(VERDICTS),
  verdict_sentence: text(240).optional(),
  the_good: stringList(12),
  the_bad: stringList(12),
  platform_tested: text(80),
  hours_played: z.number().nonnegative().max(2000),
  human_approved: z.boolean(),
  item_name: text(160).optional(),
  critic_avg: z.number().min(0).max(100).optional(),
  community_avg: z.number().min(0).max(100).optional(),
  pull_quote: text(280).optional(),
  where_to_buy: z.array(whereToBuySchema).max(8).optional(),
});

export const dealMetaSchema = z.object({
  retailer: text(60),
  region: z.enum(REGIONS),
  price_aud: z.number().nonnegative(),
  rrp_aud: z.number().positive(),
  expires_at: isoDate.nullable().optional(),
  affiliate_url: httpsUrl,
  product_name: text(160).optional(),
  platform: text(60).optional(),
});

export const guideMetaSchema = z.object({
  estimated_time: text(40).optional(),
  difficulty: z.enum(["Easy", "Medium", "Hard"]).optional(),
  steps: z
    .array(z.object({ title: text(160), body: text(4000), spoiler: z.boolean().optional() }))
    .max(60)
    .default([]),
  checklist: stringList(80, 200).default([]),
});

export const hubEntrySchema = z.object({
  title: text(160),
  href: z.string().trim().max(300).optional(),
  platforms: z.array(text(40)).max(10).default([]),
  score: z.number().min(0).max(100).optional(),
  release_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD").optional(),
  studio: text(120).optional(),
  service: z.enum(["game_pass", "ps_plus"]).optional(),
  tier: text(40).optional(),
  change: z.enum(["joining", "leaving"]).optional(),
  note: text(240).optional(),
});

export const hubMetaSchema = z.object({
  hub_type: z.enum(["game_index", "show_index", "release_calendar", "goty_tracker", "subscriptions"]),
  entries: z.array(hubEntrySchema).max(500),
});

export const videoSchema = z.object({
  provider: z.enum(["youtube", "mp4"]),
  /** YouTube video ID, or an https URL for mp4. */
  src: text(300),
  aspect: z.enum(["16:9", "9:16"]).default("16:9"),
  title: text(160),
  duration: z.string().regex(/^\d{1,2}:\d{2}(:\d{2})?$/).optional(),
});

export const faqSchema = z.array(z.object({ q: text(300), a: text(2000) })).max(20);

export const imageSchema = z.object({ url: httpsUrl, alt: text(200) });

/** Fields shared by create (POST) input and stored articles. */
const articleShape = {
  title: text(180),
  slug: z.string().trim().min(3).max(120).regex(SLUG_RE, "lowercase-kebab-case only"),
  tldr_answer: text(600),
  category: z.enum(CATEGORIES),
  vertical: z.enum(VERTICALS).default("games"),
  source_tier: z.enum(SOURCE_TIERS),
  primary_source_name: text(120),
  primary_source_url: httpsUrl,
  updated_at: isoDate,
  author: authorSchema,

  status: z.enum(STATUSES).default("draft"),
  published_at: isoDate.nullable().optional(),

  excerpt: text(300).optional(),
  body_md: z.string().max(200_000).default(""),
  hero_image_url: httpsUrl.nullable().optional(),
  hero_image_alt: text(200).optional(),
  tags: z.array(text(40)).max(20).default([]),
  platforms: z.array(text(40)).max(10).default([]),

  spoiler_warning: spoilerSchema.optional(),
  hype_vs_reality: hypeVsRealitySchema.optional(),
  review_meta: reviewMetaSchema.optional(),
  deal_meta: dealMetaSchema.optional(),
  guide_meta: guideMetaSchema.optional(),
  hub_meta: hubMetaSchema.optional(),
  video: videoSchema.optional(),
  gallery: z.array(imageSchema).max(24).optional(),
  faq: faqSchema.optional(),
};

const baseObject = z.object(articleShape);
type BaseArticle = z.infer<typeof baseObject>;

const RUMOR_SIGNAL = /\b(rumou?r(ed)?|reportedly|unconfirmed|leak(ed|s)?|claims?|alleged(ly)?|insider|could|may)\b|\?/i;

/**
 * Editorial truth rules. Each issue explains *why* in plain language so a bot
 * (or human) can fix the payload without reading this file.
 */
export function editorialRules(a: Partial<BaseArticle>, ctx: z.RefinementCtx) {
  const issue = (path: string, message: string) => ctx.addIssue({ code: "custom", path: [path], message });

  // 1. Category ↔ meta consistency.
  if (a.category === "review" && !a.review_meta) issue("review_meta", "reviews must include review_meta (score, verdict, good/bad, platform, hours).");
  if (a.category === "deal" && !a.deal_meta) issue("deal_meta", "deals must include deal_meta (retailer, price, RRP, affiliate URL).");
  if (a.category === "hub" && !a.hub_meta) issue("hub_meta", "hubs must include hub_meta (hub_type + entries).");
  if (a.review_meta && a.category !== "review") issue("review_meta", "review_meta is only allowed on category=review.");

  // 2. Rumours must read as rumours. A rumour never wears a headline that sounds confirmed.
  if (a.source_tier === "unconfirmed_rumor") {
    if (a.category === "review" || a.category === "deal") {
      issue("source_tier", "reviews and deals are first-hand by definition and cannot be unconfirmed_rumor.");
    }
    if (a.title && !RUMOR_SIGNAL.test(a.title)) {
      issue("title", "unconfirmed_rumor headlines must signal uncertainty (e.g. 'Rumour:', 'reportedly', 'leak', or a question).");
    }
  }

  // 3. Deals: no fake discounts.
  if (a.deal_meta) {
    if (a.deal_meta.price_aud >= a.deal_meta.rrp_aud) {
      issue("deal_meta", "price_aud must be lower than rrp_aud — we never label full-price items as deals.");
    }
  }

  // 4. Timestamps cannot go backwards (for already-published items; scheduled ones are aligned server-side).
  if (a.published_at && a.updated_at && Date.parse(a.published_at) <= Date.now() && Date.parse(a.updated_at) < Date.parse(a.published_at)) {
    issue("updated_at", "updated_at cannot be earlier than published_at.");
  }

  // 5. Scheduling needs a time.
  if (a.status === "scheduled" && !a.published_at) {
    issue("published_at", "scheduled articles need a future published_at ISO timestamp.");
  }

  // 6. Spoilers must be explicit.
  if (a.spoiler_warning?.enabled && !a.spoiler_warning.label) {
    issue("spoiler_warning", "spoiler_warning.label is required when enabled.");
  }
}

/** Full article input for POST /api/publish and POST /api/intake. */
export const articleInputSchema = baseObject.superRefine(editorialRules);

/** PATCH body: every field optional; editorial rules re-run on the merged result. */
export const articlePatchSchema = baseObject.partial().omit({ slug: true }).extend({
  slug: articleShape.slug.optional(),
});

export type ArticleInput = z.input<typeof articleInputSchema>;
export type ArticleData = z.output<typeof articleInputSchema>;
export type ReviewMeta = z.infer<typeof reviewMetaSchema>;
export type DealMeta = z.infer<typeof dealMetaSchema>;
export type GuideMeta = z.infer<typeof guideMetaSchema>;
export type HubMeta = z.infer<typeof hubMetaSchema>;
export type HubEntry = z.infer<typeof hubEntrySchema>;
export type Video = z.infer<typeof videoSchema>;

/** Stored article = validated data + server-managed fields. */
export type Article = ArticleData & {
  id: string;
  created_at: string;
  origin: "publish_api" | "intake" | "seed";
  intake_source?: string | null;
};

/** Re-validate a fully merged article (used after PATCH). */
export function validateMerged(merged: unknown) {
  return articleInputSchema.safeParse(merged);
}

/** Flatten a ZodError into a bot-friendly list. */
export function formatIssues(error: z.ZodError) {
  return error.issues.map((i) => ({ path: i.path.join("."), message: i.message }));
}

/** Scored reviews never auto-publish: a human must sign off. */
export function requiresHumanGate(a: Pick<ArticleData, "category" | "review_meta" | "status">) {
  return a.category === "review" && a.status !== "draft" && a.review_meta?.human_approved !== true;
}
