import "server-only";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import {
  articleInputSchema,
  articlePatchSchema,
  formatIssues,
  requiresHumanGate,
  type Article,
  type ArticleData,
} from "./schema";
import { plainText, sanitizeMarkdownInput } from "./markdown";
import { mirrorHeroImage } from "./storage";
import { findBySlug, insertArticle, replaceArticle, storeMode, writeBlockedReason } from "./store";
import { revalidateArticle } from "./revalidate";
import { absoluteUrl, articlePath } from "./site";

/* Shared publish pipeline used by /api/publish and /api/intake. */

export const json = (status: number, body: Record<string, unknown>) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store", "X-TrueFrame-Store": storeMode() } });

/** 503 when the backing store can't durably persist writes. */
export function writeGuard() {
  const reason = writeBlockedReason();
  return reason ? json(503, { error: "store_unavailable", reason }) : null;
}

export async function readJson(req: Request, maxBytes = 1_000_000): Promise<{ raw: string; body: unknown } | { error: Response }> {
  const raw = await req.text();
  if (raw.length > maxBytes) return { error: json(413, { error: "payload_too_large", max_bytes: maxBytes }) };
  try {
    return { raw, body: JSON.parse(raw) };
  } catch {
    return { error: json(400, { error: "invalid_json" }) };
  }
}

const SHORT_TEXT_FIELDS = ["title", "tldr_answer", "excerpt", "primary_source_name", "hero_image_alt"] as const;

/** Strip HTML from short fields and dangerous HTML from the markdown body. */
function sanitize(a: ArticleData): ArticleData {
  const out = { ...a };
  for (const k of SHORT_TEXT_FIELDS) {
    const v = out[k];
    if (typeof v === "string") (out as Record<string, unknown>)[k] = plainText(v);
  }
  out.body_md = sanitizeMarkdownInput(out.body_md);
  return out;
}

type Finalised = { article: ArticleData; warnings: string[]; gated: boolean };

/** Apply server rules: human gate for scored reviews, publish timestamps, image mirroring. */
async function finalise(data: ArticleData, now: Date): Promise<Finalised> {
  const warnings: string[] = [];
  let a = sanitize(data);
  let gated = false;

  if (requiresHumanGate(a)) {
    gated = true;
    warnings.push("Scored reviews require review_meta.human_approved=true before publishing. Saved as draft.");
    a = { ...a, status: "draft" };
  }

  if (a.status === "published" && !a.published_at) a = { ...a, published_at: now.toISOString() };
  if (a.status === "published" && a.published_at && Date.parse(a.published_at) > now.getTime()) {
    a = { ...a, status: "scheduled" };
    warnings.push("published_at is in the future, so status was set to 'scheduled'.");
  }
  // A scheduled story's "Updated" stamp should never predate its go-live time.
  if (a.status === "scheduled" && a.published_at && Date.parse(a.updated_at) < Date.parse(a.published_at)) {
    a = { ...a, updated_at: a.published_at };
  }
  if (a.status === "scheduled" && a.published_at && Date.parse(a.published_at) <= now.getTime()) {
    warnings.push("published_at is already due. The article is live now and the cron will mark it 'published'.");
  }

  if (a.deal_meta?.expires_at && Date.parse(a.deal_meta.expires_at) < now.getTime()) {
    warnings.push("deal_meta.expires_at is in the past. The deal will display as expired.");
  }

  if (a.hero_image_url) {
    const m = await mirrorHeroImage(a.hero_image_url, a.slug);
    a = { ...a, hero_image_url: m.url };
    if (m.warning) warnings.push(`hero image: ${m.warning}`);
  }

  return { article: a, warnings, gated };
}

export async function createArticle(
  body: unknown,
  opts: { origin: Article["origin"]; intakeSource?: string | null; forceDraft?: boolean },
) {
  const parsed = articleInputSchema.safeParse(body);
  if (!parsed.success) return json(422, { error: "validation_failed", issues: formatIssues(parsed.error) });

  let data = parsed.data;
  const extraWarnings: string[] = [];
  if (opts.forceDraft && data.status !== "draft") {
    data = { ...data, status: "draft" };
    extraWarnings.push("Untrusted intake source: routed to draft for editorial review.");
  }

  if (await findBySlug(data.slug)) {
    return json(409, { error: "duplicate_slug", slug: data.slug, hint: "Use PATCH /api/publish/{slug} to update an existing article." });
  }

  const now = new Date();
  const { article, warnings, gated } = await finalise(data, now);
  const row: Article = {
    ...article,
    id: randomUUID(),
    created_at: now.toISOString(),
    origin: opts.origin,
    intake_source: opts.intakeSource ?? null,
  };

  const saved = await insertArticle(row);
  const revalidated = saved.status === "draft" ? [] : revalidateArticle(saved);
  return json(201, {
    ok: true,
    slug: saved.slug,
    status: saved.status,
    published_at: saved.published_at ?? null,
    gated,
    warnings: [...extraWarnings, ...warnings],
    revalidated,
    url: saved.status === "draft" ? null : absoluteUrl(articlePath(saved)),
  });
}

export async function updateArticle(slug: string, body: unknown) {
  const existing = await findBySlug(slug);
  if (!existing) return json(404, { error: "not_found", slug });

  const patch = articlePatchSchema.safeParse(body);
  if (!patch.success) return json(422, { error: "validation_failed", issues: formatIssues(patch.error) });

  const now = new Date();
  const { id, created_at, origin, intake_source, ...prev } = existing;
  // Zod applies field defaults even on .partial(): keep only keys the caller actually sent,
  // otherwise a PATCH of `title` would silently reset status/body/tags to their defaults.
  const sent = new Set(Object.keys(body as Record<string, unknown>));
  const provided = Object.fromEntries(Object.entries(patch.data).filter(([k]) => sent.has(k)));
  const merged = { ...prev, ...provided, updated_at: patch.data.updated_at && sent.has("updated_at") ? patch.data.updated_at : now.toISOString() };
  const full = articleInputSchema.safeParse(merged);
  if (!full.success) return json(422, { error: "validation_failed", issues: formatIssues(full.error) });

  if (full.data.slug !== slug && (await findBySlug(full.data.slug))) {
    return json(409, { error: "duplicate_slug", slug: full.data.slug });
  }

  // Only re-mirror when the image actually changed.
  const imageChanged = full.data.hero_image_url !== existing.hero_image_url;
  const { article, warnings, gated } = await finalise(
    imageChanged ? full.data : { ...full.data, hero_image_url: null },
    now,
  );
  const row: Article = {
    ...article,
    hero_image_url: imageChanged ? article.hero_image_url : existing.hero_image_url,
    id,
    created_at,
    origin,
    intake_source,
  };
  const saved = await replaceArticle(slug, row);
  const revalidated = revalidateArticle(existing, saved);
  return json(200, { ok: true, slug: saved.slug, status: saved.status, gated, warnings, revalidated });
}
