import { checkBearer } from "@/lib/auth";
import { json, writeGuard } from "@/lib/publishing";
import { revalidateArticle } from "@/lib/revalidate";
import { promoteDueScheduled } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/cron/publish-scheduled: promotes due `scheduled` articles to
 * `published` and revalidates. Vercel Cron sends `Authorization: Bearer $CRON_SECRET`.
 * Note: due scheduled articles are already visible on the site (the read query
 * includes them and pages revalidate every 5 min). This job makes the status
 * explicit and triggers instant revalidation.
 */
export async function GET(req: Request) {
  const auth = checkBearer(req, "CRON_SECRET");
  if (!auth.ok) return json(401, { error: "unauthorized", reason: auth.reason });

  const blocked = writeGuard();
  if (blocked) return blocked;

  try {
    const promoted = await promoteDueScheduled();
    const revalidated = promoted.length ? revalidateArticle(...promoted) : [];
    return json(200, { ok: true, promoted: promoted.map((a) => a.slug), revalidated, ran_at: new Date().toISOString() });
  } catch (e) {
    return json(500, { error: "cron_failed", message: (e as Error).message });
  }
}
