"use client";

import { useEffect, useState } from "react";
import type { TocItem } from "@/lib/markdown";
import type { Video } from "@/lib/schema";
import { IconCheck, IconCopy, IconPlay } from "./ui";

/* ── Sticky Table of Contents with scroll-spy ───────────────────────────── */
export function TableOfContents({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState(items[0]?.id);
  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id);
      },
      { rootMargin: "-80px 0px -65% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);
  if (items.length < 2) return null;
  return (
    <nav aria-label="Jump to section" className="text-sm">
      <p className="tf-eyebrow mb-3">Jump to</p>
      <ol className="space-y-0.5 border-l border-line">
        {items.map((i) => (
          <li key={i.id}>
            <a
              href={`#${i.id}`}
              aria-current={active === i.id ? "location" : undefined}
              className={`-ml-px block border-l-2 py-1.5 leading-snug transition-colors ${i.level === 3 ? "pl-6" : "pl-3"} ${
                active === i.id ? "border-mint font-medium text-fg" : "border-transparent text-muted hover:text-fg"
              }`}
            >
              {i.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/* ── Click-to-load video (no autoplay, no third-party JS until asked) ───── */
export function VideoEmbed({ video }: { video: Video }) {
  const [on, setOn] = useState(false);
  const vertical = video.aspect === "9:16";
  const box = vertical ? "aspect-[9/16] w-full max-w-[340px]" : "aspect-video w-full";
  // Seed/demo slots ("demo-…") never touch YouTube: they render an honest placeholder.
  const demo = video.src.startsWith("demo-");
  const thumb = video.provider === "youtube" && !demo ? `https://i.ytimg.com/vi/${video.src}/hqdefault.jpg` : undefined;
  if (demo) {
    return (
      <figure className={vertical ? "flex flex-col items-center" : ""}>
        <div className={`relative grid place-items-center overflow-hidden rounded-xl border border-dashed border-line-strong bg-surface ${box}`}>
          <div className="space-y-2 p-4 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-full border border-line-strong text-muted"><IconPlay className="size-5 translate-x-0.5" /></span>
            <p className="font-mono text-[11px] tracking-wide text-muted uppercase">{video.aspect} video slot · demo</p>
            <p className="text-xs text-muted">Publish a real YouTube ID or MP4 via the API.</p>
          </div>
        </div>
        <figcaption className="mt-2 font-mono text-[11px] text-muted">{video.title}</figcaption>
      </figure>
    );
  }
  return (
    <figure className={vertical ? "flex flex-col items-center" : ""}>
      <div className={`relative overflow-hidden rounded-xl border border-line bg-[#06080c] ${box}`}>
        {on ? (
          video.provider === "youtube" ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(video.src)}?autoplay=1&rel=0&modestbranding=1`}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 size-full"
            />
          ) : (
            <video src={video.src} controls autoPlay playsInline className="absolute inset-0 size-full object-contain" />
          )
        ) : (
          <button type="button" onClick={() => setOn(true)} className="group absolute inset-0 grid place-items-center" aria-label={`Play video: ${video.title}`}>
            {thumb && (
              <img src={thumb} alt="" loading="lazy" className="absolute inset-0 size-full object-cover opacity-60 transition-opacity group-hover:opacity-75" />
            )}
            <span className="relative grid size-16 place-items-center rounded-full bg-mint text-on-mint shadow-lg transition-transform group-hover:scale-105">
              <IconPlay className="size-6 translate-x-0.5 fill-current" />
            </span>
            {video.duration && (
              <span className="absolute right-3 bottom-3 rounded bg-black/75 px-1.5 py-0.5 font-mono text-[11px] text-white">{video.duration}</span>
            )}
          </button>
        )}
      </div>
      <figcaption className="mt-2 flex items-center gap-2 font-mono text-[11px] text-muted">
        <span className="rounded border border-line px-1 py-px">{video.aspect}</span> {video.title}
      </figcaption>
    </figure>
  );
}

/* ── Quick-copy checklist ───────────────────────────────────────────────── */
export function Checklist({ title, items, storageKey }: { title: string; items: string[]; storageKey: string }) {
  const [done, setDone] = useState<Set<number>>(new Set());
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(`tf-check-${storageKey}`);
      if (raw) setDone(new Set(JSON.parse(raw)));
    } catch {}
  }, [storageKey]);
  const toggle = (i: number) => {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      try {
        localStorage.setItem(`tf-check-${storageKey}`, JSON.stringify([...next]));
      } catch {}
      return next;
    });
  };
  const copy = async () => {
    const text = items.map((t, i) => `${done.has(i) ? "[x]" : "[ ]"} ${t}`).join("\n");
    try {
      await navigator.clipboard.writeText(`${title}\n${text}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };
  return (
    <section aria-labelledby={`cl-${storageKey}`} className="tf-card p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 id={`cl-${storageKey}`} className="text-base font-bold">
          {title} <span className="ml-1 font-mono text-xs font-normal text-muted">{done.size}/{items.length}</span>
        </h2>
        <button type="button" onClick={copy} className="inline-flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1 font-mono text-[11px] text-muted hover:border-mint hover:text-fg">
          {copied ? <IconCheck className="size-3.5 text-mint-text" /> : <IconCopy className="size-3.5" />}
          {copied ? "Copied" : "Copy list"}
        </button>
      </div>
      <div className="mb-3 h-1 overflow-hidden rounded-full bg-elevated" aria-hidden>
        <div className="h-full bg-mint transition-[width]" style={{ width: `${(done.size / Math.max(items.length, 1)) * 100}%` }} />
      </div>
      <ul className="space-y-1">
        {items.map((t, i) => (
          <li key={t}>
            <label className="flex cursor-pointer items-center gap-3 rounded-md px-1.5 py-1.5 hover:bg-elevated">
              <input type="checkbox" checked={done.has(i)} onChange={() => toggle(i)} className="size-4 accent-[var(--tf-mint)]" />
              <span className={`text-sm ${done.has(i) ? "text-muted line-through" : ""}`}>{t}</span>
            </label>
          </li>
        ))}
      </ul>
    </section>
  );
}
