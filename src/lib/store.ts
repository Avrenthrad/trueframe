import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
import type { Article } from "./schema";
import { SEED_ARTICLES } from "./seed";

/* ────────────────────────────────────────────────────────────────────────────
 * Data access. Supabase when configured; otherwise an in-memory store seeded
 * with demo content so `npm run dev` / `npm run build` work with zero setup.
 * ──────────────────────────────────────────────────────────────────────────── */

export const ARTICLES_TAG = "articles";
const TABLE = "articles";

let _sb: SupabaseClient | null | undefined;
export function supabase(): SupabaseClient | null {
  if (_sb !== undefined) return _sb;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  _sb = url && key ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) : null;
  return _sb;
}

export const storeMode = () => (supabase() ? "supabase" : "memory");

/**
 * In production the memory store is per-instance and wiped on cold start, so a
 * bot would "publish" into the void. Refuse writes unless explicitly allowed.
 */
export function writeBlockedReason(): string | null {
  if (supabase()) return null;
  if (process.env.NODE_ENV !== "production" || process.env.UNPATCHED_ALLOW_MEMORY_WRITES === "1") return null;
  return "Supabase is not configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY). Writes are disabled so nothing is silently lost.";
}

/* In-memory fallback (per server instance; resets on cold start). */
const g = globalThis as unknown as { __tfMem?: Map<string, Article> };
function mem() {
  if (!g.__tfMem) g.__tfMem = new Map(SEED_ARTICLES.map((a) => [a.slug, structuredClone(a)]));
  return g.__tfMem;
}

/** Visible to the public: published, or scheduled and already due. */
export function isLive(a: Pick<Article, "status" | "published_at">, now = Date.now()) {
  if (!a.published_at) return false;
  const due = Date.parse(a.published_at) <= now;
  return (a.status === "published" || a.status === "scheduled") && due;
}

function clean(row: Record<string, unknown>): Article {
  // Postgres returns nulls for missing optional JSON; strip them so UI optionals stay `undefined`.
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) if (v !== null || k === "published_at") out[k] = v;
  return out as Article;
}

const byPublishedDesc = (a: Article, b: Article) =>
  Date.parse(b.published_at ?? b.updated_at) - Date.parse(a.published_at ?? a.updated_at);

async function fetchLive(): Promise<Article[]> {
  const sb = supabase();
  const nowIso = new Date().toISOString();
  if (!sb) return [...mem().values()].filter((a) => isLive(a)).sort(byPublishedDesc);
  const { data, error } = await sb
    .from(TABLE)
    .select("*")
    .in("status", ["published", "scheduled"])
    .lte("published_at", nowIso)
    .order("published_at", { ascending: false })
    .limit(1000);
  if (error) throw new Error(`Supabase read failed: ${error.message}`);
  return (data ?? []).map(clean);
}

/** Cached, tag-invalidated list of every live article. Time-based fallback catches due scheduled posts. */
// Seed fingerprint in the key so memory-mode caches reset when seed content changes between builds.
const SEED_FP = (() => {
  let h = 0;
  for (const c of JSON.stringify(SEED_ARTICLES)) h = (Math.imul(31, h) + c.charCodeAt(0)) | 0;
  return (h >>> 0).toString(36);
})();

export const getLiveArticles = unstable_cache(fetchLive, ["live-articles-v1", storeMode(), SEED_FP], {
  tags: [ARTICLES_TAG],
  revalidate: 300,
});

export async function getLiveArticle(slug: string) {
  return (await getLiveArticles()).find((a) => a.slug === slug) ?? null;
}

/* ── Admin operations (API routes only) ─────────────────────────────────── */

export async function findBySlug(slug: string): Promise<Article | null> {
  const sb = supabase();
  if (!sb) return mem().get(slug) ?? null;
  const { data, error } = await sb.from(TABLE).select("*").eq("slug", slug).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? clean(data) : null;
}

export async function insertArticle(a: Article): Promise<Article> {
  const sb = supabase();
  if (!sb) {
    mem().set(a.slug, a);
    return a;
  }
  const { data, error } = await sb.from(TABLE).insert(a).select("*").single();
  if (error) throw new Error(error.message);
  return clean(data);
}

export async function replaceArticle(prevSlug: string, a: Article): Promise<Article> {
  const sb = supabase();
  if (!sb) {
    mem().delete(prevSlug);
    mem().set(a.slug, a);
    return a;
  }
  const { data, error } = await sb.from(TABLE).update(a).eq("slug", prevSlug).select("*").single();
  if (error) throw new Error(error.message);
  return clean(data);
}

export async function deleteArticle(slug: string): Promise<boolean> {
  const sb = supabase();
  if (!sb) return mem().delete(slug);
  const { error, count } = await sb.from(TABLE).delete({ count: "exact" }).eq("slug", slug);
  if (error) throw new Error(error.message);
  return (count ?? 0) > 0;
}

/** Promote every due `scheduled` article to `published`. Returns promoted rows. */
export async function promoteDueScheduled(now = new Date()): Promise<Article[]> {
  const sb = supabase();
  if (!sb) {
    const due = [...mem().values()].filter((a) => a.status === "scheduled" && a.published_at && Date.parse(a.published_at) <= now.getTime());
    for (const a of due) a.status = "published";
    return due;
  }
  const { data, error } = await sb
    .from(TABLE)
    .update({ status: "published" })
    .eq("status", "scheduled")
    .lte("published_at", now.toISOString())
    .select("*");
  if (error) throw new Error(error.message);
  return (data ?? []).map(clean);
}
