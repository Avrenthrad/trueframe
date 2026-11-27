import { checkBearer } from "@/lib/auth";
import { createArticle, json, readJson, writeGuard } from "@/lib/publishing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/publish: Grok Bot direct publish. Auth: `Authorization: Bearer $PUBLISH_API_KEY`. */
export async function POST(req: Request) {
  const auth = checkBearer(req, "PUBLISH_API_KEY");
  if (!auth.ok) return json(401, { error: "unauthorized", reason: auth.reason });

  const blocked = writeGuard();
  if (blocked) return blocked;

  const parsed = await readJson(req);
  if ("error" in parsed) return parsed.error;

  try {
    return await createArticle(parsed.body, { origin: "publish_api" });
  } catch (e) {
    return json(500, { error: "publish_failed", message: (e as Error).message });
  }
}
