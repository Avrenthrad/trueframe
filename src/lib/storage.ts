import "server-only";
import { createHash } from "node:crypto";
import { supabase } from "./store";

const MAX_BYTES = 8 * 1024 * 1024;
const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};

/** Hosts we never fetch from server-side (SSRF guard). */
function isPrivateHost(host: string) {
  return (
    host === "localhost" ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    /^(127\.|10\.|0\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host) ||
    host === "[::1]" ||
    host.startsWith("[fc") ||
    host.startsWith("[fd")
  );
}

export type MirrorResult = { url: string; mirrored: boolean; warning?: string };

/**
 * Copy a remote hero image into Supabase Storage so articles never hotlink a
 * third party. On any failure the original URL is kept and a warning returned:
 * publishing is never blocked by an image.
 */
export async function mirrorHeroImage(sourceUrl: string, slug: string): Promise<MirrorResult> {
  const sb = supabase();
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "hero-images";
  if (!sb) return { url: sourceUrl, mirrored: false, warning: "storage not configured; using source URL" };

  const supaHost = new URL(process.env.SUPABASE_URL!).host;
  let u: URL;
  try {
    u = new URL(sourceUrl);
  } catch {
    return { url: sourceUrl, mirrored: false, warning: "invalid hero_image_url" };
  }
  if (u.host === supaHost) return { url: sourceUrl, mirrored: false }; // already ours
  if (u.protocol !== "https:" || isPrivateHost(u.hostname)) {
    return { url: sourceUrl, mirrored: false, warning: "refused to fetch non-public image host" };
  }

  try {
    const res = await fetch(u, { redirect: "follow", signal: AbortSignal.timeout(10_000), cache: "no-store" });
    if (!res.ok) return { url: sourceUrl, mirrored: false, warning: `image fetch failed: HTTP ${res.status}` };
    const type = (res.headers.get("content-type") ?? "").split(";")[0].trim();
    const ext = EXT[type];
    if (!ext) return { url: sourceUrl, mirrored: false, warning: `unsupported image type: ${type || "unknown"}` };
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.byteLength > MAX_BYTES) return { url: sourceUrl, mirrored: false, warning: "image larger than 8 MB" };

    const hash = createHash("sha256").update(buf).digest("hex").slice(0, 16);
    const path = `${slug}/${hash}.${ext}`;
    const { error } = await sb.storage.from(bucket).upload(path, buf, { contentType: type, upsert: true, cacheControl: "31536000" });
    if (error) return { url: sourceUrl, mirrored: false, warning: `storage upload failed: ${error.message}` };
    return { url: sb.storage.from(bucket).getPublicUrl(path).data.publicUrl, mirrored: true };
  } catch (e) {
    return { url: sourceUrl, mirrored: false, warning: `image mirror error: ${(e as Error).message}` };
  }
}
