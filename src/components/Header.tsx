"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { UnpatchedLogo } from "./UnpatchedLogo";
import { IconMenu, IconMoon, IconSearch, IconSun, IconX } from "./ui";
import { SearchModal } from "./SearchModal";

const NAV = [
  { href: "/desks/games", label: "Games" },
  { href: "/desks/movies-tv", label: "Movies & TV" },
  { href: "/desks/anime", label: "Anime" },
  { href: "/reviews", label: "Reviews" },
  { href: "/guides", label: "Guides" },
  { href: "/hubs", label: "Trackers" },
  { href: "/deals", label: "AU Deals" },
  { href: "/videos", label: "Video" },
];

function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light" | null>(null);
  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "light" ? "light" : "dark");
  }, []);
  const toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("up-theme", next);
    } catch {}
    setTheme(next);
  };
  const isLight = theme === "light";
  return (
    <button
      type="button"
      onClick={toggle}
      className="grid size-9 place-items-center border border-line text-muted transition-colors hover:border-fg hover:text-fg"
      aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
      title={isLight ? "Dark mode" : "Light mode"}
    >
      {isLight ? <IconMoon className="size-4" /> : <IconSun className="size-4" />}
    </button>
  );
}

export function Header() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const openSearch = useCallback(() => setSearchOpen(true), []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement)?.closest("input, textarea, [contenteditable]");
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => setMenuOpen(false), [pathname]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <a href="#main" className="sr-only z-[60] bg-accent px-3 py-2 text-on-accent focus:not-sr-only focus:fixed focus:top-2 focus:left-2">
        Skip to content
      </a>
      <header className="sticky top-0 z-50 border-b border-fg bg-bg">
        <div className="up-container flex h-14 items-center gap-6">
          <Link href="/" className="shrink-0" aria-label="UNPATCHED.GG home">
            <UnpatchedLogo height={20} />
          </Link>

          <nav aria-label="Desks" className="hidden xl:block">
            <ul className="flex items-center">
              {NAV.map((n) => (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    aria-current={isActive(n.href) ? "page" : undefined}
                    className={`relative block px-2.5 py-4 text-[13px] font-semibold tracking-wide uppercase transition-colors ${
                      isActive(n.href) ? "text-fg" : "text-muted hover:text-fg"
                    }`}
                  >
                    {n.label}
                    {isActive(n.href) && <span className="absolute inset-x-2.5 -bottom-px h-[3px] bg-accent" aria-hidden />}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={openSearch}
              className="flex h-9 items-center gap-2 border border-line bg-surface px-3 text-sm text-muted transition-colors hover:border-fg hover:text-fg sm:w-52"
              aria-label="Search UNPATCHED.GG"
            >
              <IconSearch className="size-4" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="ml-auto hidden border border-line px-1.5 font-mono text-[10px] sm:inline">⌘K</kbd>
            </button>
            <ThemeToggle />
            <button
              type="button"
              className="grid size-9 place-items-center border border-line text-muted hover:text-fg xl:hidden"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? <IconX className="size-4" /> : <IconMenu className="size-4" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav id="mobile-nav" aria-label="Desks" className="border-t border-line bg-bg xl:hidden">
            <ul className="up-container grid grid-cols-2 border-l border-line py-0 sm:grid-cols-4">
              {NAV.map((n) => (
                <li key={n.href} className="border-r border-b border-line">
                  <Link
                    href={n.href}
                    aria-current={isActive(n.href) ? "page" : undefined}
                    className={`block px-3 py-3 text-sm font-semibold tracking-wide uppercase ${isActive(n.href) ? "bg-elevated text-fg" : "text-muted"}`}
                  >
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
