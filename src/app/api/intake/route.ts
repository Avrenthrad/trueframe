import { checkIntake, trustedIntakeSources } from "@/lib/auth";
import { createArticle, json, readJson, writeGuard } from "@/lib/publishing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/intake: external articles (contributors, partner tools, webhooks).
 * Auth: HMAC (`X-Intake-Signature` + `X-Intake-Timestamp`) or `X-Intake-Secret`.
 * Routing: sources listed in INTAKE_TRUSTED_SOURCES may publish/schedule directly;
 * everyone else always lands in `draft`. Scored reviews are still human-gated.
 */
export async function POST(req: Request) {
  const parsed = await readJson(req, 500_000);
  if ("error" in parsed) return parsed.error;

  const auth = checkIntake(req, parsed.raw);
  if (!auth.ok) return json(401, { error: "unauthorized", reason: auth.reason });
  const blocked = writeGuard();
  if (blocked) return blocked;

  const source = (req.headers.get("x-intake-source") ?? "").trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9_.-]{1,63}$/.test(source)) {
    return json(400, { error: "missing_source", hint: "Send X-Intake-Source: <your-source-id> (a-z, 0-9, . _ -)." });
  }
  const trusted = trustedIntakeSources().has(source);

  try {
    const res = await createArticle(parsed.body, { origin: "intake", intakeSource: source, forceDraft: !trusted });
    res.headers.set("X-Intake-Trusted", String(trusted));
    return res;
  } catch (e) {
    return json(500, { error: "intake_failed", message: (e as Error).message });
  }
}
