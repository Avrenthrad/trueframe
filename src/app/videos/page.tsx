import type { Metadata } from "next";
import Link from "next/link";
import { getLiveArticles } from "@/lib/store";
import { articlePath } from "@/lib/site";
import { VideoEmbed } from "@/components/client";
import { SourceTierPill } from "@/components/ui";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Videos",
  description: "Trailers, video reviews and vertical shorts. Click to play, never autoplay.",
  alternates: { canonical: "/videos" },
};

export default async function VideosPage() {
  const withVideo = (await getLiveArticles()).filter((a) => a.video);
  const wide = withVideo.filter((a) => a.video!.aspect === "16:9");
  const shorts = withVideo.filter((a) => a.video!.aspect === "9:16");

  return (
    <div className="up-container space-y-12 pt-8 pb-10">
      <header className="space-y-3">
        <p className="up-eyebrow">Click to play · Zero autoplay</p>
        <h1 className="text-4xl font-bold sm:text-5xl">Videos</h1>
        <p className="max-w-[60ch] text-muted">Nothing loads from YouTube until you press play, so this page stays fast.</p>
      </header>

      {wide.length > 0 && (
        <section aria-labelledby="wide-h">
          <h2 id="wide-h" className="mb-4 text-xl font-bold">Trailers &amp; reviews</h2>
          <ul className="grid gap-6 md:grid-cols-2">
            {wide.map((a) => (
              <li key={a.slug} className="space-y-3">
                <VideoEmbed video={a.video!} />
                <div className="flex items-start justify-between gap-3">
                  <Link href={articlePath(a)} className="font-semibold leading-snug hover:text-accent-text">{a.title}</Link>
                  <SourceTierPill tier={a.source_tier} compact />
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {shorts.length > 0 && (
        <section aria-labelledby="shorts-h">
          <h2 id="shorts-h" className="mb-4 text-xl font-bold">Shorts</h2>
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {shorts.map((a) => (
              <li key={a.slug} className="space-y-2">
                <VideoEmbed video={a.video!} />
                <Link href={articlePath(a)} className="line-clamp-2 text-sm font-semibold hover:text-accent-text">{a.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
