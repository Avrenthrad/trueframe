import { checkBearer } from "@/lib/auth";
import { json, readJson, updateArticle, writeGuard } from "@/lib/publishing";
import { revalidateArticle } from "@/lib/revalidate";
import { deleteArticle, findBySlug } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ slug: string }> };

/** GET /api/publish/{slug}: read back any article (incl. drafts) for the bot. */
export async function GET(req: Request, { params }: Ctx) {
  const auth = checkBearer(req, "PUBLISH_API_KEY");
  if (!auth.ok) return json(401, { error: "unauthorized", reason: auth.reason });
  const { slug } = await params;
  const a = await findBySlug(slug);
  return a ? json(200, { ok: true, article: a }) : json(404, { error: "not_found", slug });
}

/** PATCH /api/publish/{slug}: partial update; editorial rules re-run on the merged article. */
export async function PATCH(req: Request, { params }: Ctx) {
  const auth = checkBearer(req, "PUBLISH_API_KEY");
  if (!auth.ok) return json(401, { error: "unauthorized", reason: auth.reason });
  const blocked = writeGuard();
  if (blocked) return blocked;
  const { slug } = await params;

  const parsed = await readJson(req);
  if ("error" in parsed) return parsed.error;

  try {
    return await updateArticle(slug, parsed.body);
  } catch (e) {
    return json(500, { error: "update_failed", message: (e as Error).message });
  }
}

/** DELETE /api/publish/{slug}: hard delete + instant revalidation. */
export async function DELETE(req: Request, { params }: Ctx) {
  const auth = checkBearer(req, "PUBLISH_API_KEY");
  if (!auth.ok) return json(401, { error: "unauthorized", reason: auth.reason });
  const blocked = writeGuard();
  if (blocked) return blocked;
  const { slug } = await params;

  try {
    const existing = await findBySlug(slug);
    if (!existing) return json(404, { error: "not_found", slug });
    await deleteArticle(slug);
    const revalidated = revalidateArticle(existing);
    return json(200, { ok: true, deleted: slug, revalidated });
  } catch (e) {
    return json(500, { error: "delete_failed", message: (e as Error).message });
  }
}
