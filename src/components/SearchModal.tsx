"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { IconSearch, SourceTierPill } from "./ui";
import type { SourceTier } from "@/lib/schema";

type Item = { t: string; u: string; c: string; s: SourceTier; k: string };

let cache: Item[] | null = null;

function score(item: Item, terms: string[]) {
  const title = item.t.toLowerCase();
  const hay = `${title} ${item.c.toLowerCase()} ${item.k.toLowerCase()}`;
  let s = 0;
  for (const t of terms) {
    if (!hay.includes(t)) return 0;
    s += title.includes(t) ? (title.startsWith(t) ? 6 : 3) : 1;
  }
  return s;
}

export function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Item[]>(cache ?? []);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      requestAnimationFrame(() => inputRef.current?.focus());
      if (!cache) {
        fetch("/api/search-index")
          .then((r) => r.json())
          .then((data: Item[]) => {
            cache = data;
            setItems(data);
          })
          .catch(() => {});
      }
    } else if (!open && d.open) {
      d.close();
    }
  }, [open]);

  const results = useMemo(() => {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return items.slice(0, 8);
    return items
      .map((i) => ({ i, s: score(i, terms) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 10)
      .map((x) => x.i);
  }, [items, q]);

  useEffect(() => setActive(0), [q]);

  const go = (u: string) => {
    onClose();
    setQ("");
    router.push(u);
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => e.target === dialogRef.current && onClose()}
      aria-label="Search"
      className="m-0 mx-auto mt-[10vh] w-[min(640px,calc(100vw-2rem))] max-w-none border border-line-strong bg-surface p-0 text-fg backdrop:bg-black/60"
    >
      <div className="flex items-center gap-3 border-b border-line px-4">
        <IconSearch className="size-5 text-muted" />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((a) => Math.min(a + 1, results.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(a - 1, 0));
            } else if (e.key === "Enter" && results[active]) {
              go(results[active].u);
            }
          }}
          placeholder="Search news, reviews, guides, deals…"
          className="h-14 w-full bg-transparent text-base outline-none placeholder:text-muted"
          role="combobox"
          aria-expanded="true"
          aria-controls="search-results"
          aria-activedescendant={results[active] ? `sr-${active}` : undefined}
          aria-autocomplete="list"
        />
        <kbd className="border border-line px-1.5 py-0.5 font-mono text-[10px] text-muted">ESC</kbd>
      </div>
      <ul id="search-results" role="listbox" className="max-h-[55vh] overflow-y-auto p-2">
        {results.length === 0 && <li className="px-3 py-8 text-center text-sm text-muted">{items.length ? "No matches." : "Loading…"}</li>}
        {results.map((r, i) => (
          <li
            key={r.u}
            id={`sr-${i}`}
            role="option"
            aria-selected={i === active}
            onMouseEnter={() => setActive(i)}
            onClick={() => go(r.u)}
            className={`flex cursor-pointer items-center gap-3 px-3 py-2.5 ${i === active ? "bg-elevated" : ""}`}
          >
            <span className="w-14 shrink-0 font-mono text-[10px] tracking-wide uppercase text-muted">{r.c}</span>
            <span className="min-w-0 flex-1 truncate text-sm font-medium">{r.t}</span>
            <SourceTierPill tier={r.s} compact />
          </li>
        ))}
      </ul>
    </dialog>
  );
}
