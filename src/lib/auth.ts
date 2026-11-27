import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

/** `Authorization: Bearer <secret>` check against an env var. Fails closed if the env var is unset or weak. */
export function checkBearer(req: Request, envName: "PUBLISH_API_KEY" | "CRON_SECRET") {
  const secret = process.env[envName];
  if (!secret || secret.length < 16) return { ok: false as const, reason: `${envName} is not configured on the server` };
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  return safeEqual(token, secret) ? { ok: true as const } : { ok: false as const, reason: "invalid bearer token" };
}

const MAX_SKEW_SECONDS = 300;

/**
 * Intake auth. Accepts either:
 *  - `X-Intake-Signature: sha256=<hex>` where hex = HMAC_SHA256(INTAKE_SECRET, `${X-Intake-Timestamp}.${rawBody}`)
 *    (preferred: body integrity + 5-minute replay window), or
 *  - `X-Intake-Secret: <INTAKE_SECRET>` (shared secret, for tools that can't sign).
 */
export function checkIntake(req: Request, rawBody: string) {
  const secret = process.env.INTAKE_SECRET;
  if (!secret || secret.length < 16) return { ok: false as const, reason: "INTAKE_SECRET is not configured on the server" };

  const sig = req.headers.get("x-intake-signature");
  if (sig) {
    const ts = req.headers.get("x-intake-timestamp") ?? "";
    const tsNum = Number(ts);
    if (!ts || !Number.isFinite(tsNum) || Math.abs(Date.now() / 1000 - tsNum) > MAX_SKEW_SECONDS) {
      return { ok: false as const, reason: "missing or stale X-Intake-Timestamp (unix seconds, ±5 min)" };
    }
    const expected = "sha256=" + createHmac("sha256", secret).update(`${ts}.${rawBody}`).digest("hex");
    return safeEqual(sig.trim(), expected)
      ? { ok: true as const, method: "hmac" as const }
      : { ok: false as const, reason: "bad signature" };
  }

  const shared = req.headers.get("x-intake-secret");
  if (shared) {
    return safeEqual(shared.trim(), secret)
      ? { ok: true as const, method: "secret" as const }
      : { ok: false as const, reason: "bad intake secret" };
  }

  return { ok: false as const, reason: "missing X-Intake-Signature or X-Intake-Secret" };
}

export function trustedIntakeSources() {
  return new Set(
    (process.env.INTAKE_TRUSTED_SOURCES ?? "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  );
}
