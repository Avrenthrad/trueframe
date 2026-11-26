"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { TrueFrameLogo } from "./TrueFrameLogo";
import { IconMenu, IconMoon, IconSearch, IconSun, IconX } from "./ui";
import { SearchModal } from "./SearchModal";

const NAV = [
  { href: "/news", label: "News" },
  { href: "/reviews", label: "Reviews" },
  { href: "/guides", label: "Guides" },
  { href: "/hubs", label: "Hubs" },
  { href: "/deals", label: "AU Deals" },
  { href: "/videos", label: "Videos" },
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
      localStorage.setItem("tf-theme", next);
    } catch {}
    setTheme(next);
  };
  const isLight = theme === "light";
  return (
    <button
      type="button"
      onClick={toggle}
      className="grid size-9 place-items-center rounded-lg border border-line text-muted transition-colors hover:border-line-strong hover:text-fg"
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
      <a href="#main" className="sr-only z-[60] rounded bg-mint px-3 py-2 text-on-mint focus:not-sr-only focus:fixed focus:top-2 focus:left-2">
        Skip to content
      </a>
      <header className="sticky top-0 z-50 border-b border-line bg-bg/85 backdrop-blur-md supports-[backdrop-filter]:bg-bg/75">
        <div className="tf-container flex h-16 items-center gap-6">
          <Link href="/" className="shrink-0 rounded-md" aria-label="TrueFrame home">
            <TrueFrameLogo size={26} />
          </Link>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {NAV.map((n) => (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    aria-current={isActive(n.href) ? "page" : undefined}
                    className={`relative rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      isActive(n.href) ? "text-fg" : "text-muted hover:text-fg"
                    }`}
                  >
                    {n.label}
                    {isActive(n.href) && <span className="absolute inset-x-3 -bottom-[13px] h-0.5 rounded-full bg-mint" aria-hidden />}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={openSearch}
              className="flex h-9 items-center gap-2 rounded-lg border border-line bg-surface px-3 text-sm text-muted transition-colors hover:border-line-strong hover:text-fg sm:w-56"
              aria-label="Search TrueFrame"
            >
              <IconSearch className="size-4" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="ml-auto hidden rounded border border-line px-1.5 font-mono text-[10px] sm:inline">⌘K</kbd>
            </button>
            <ThemeToggle />
            <button
              type="button"
              className="grid size-9 place-items-center rounded-lg border border-line text-muted hover:text-fg lg:hidden"
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
          <nav id="mobile-nav" aria-label="Mobile" className="border-t border-line bg-bg lg:hidden">
            <ul className="tf-container grid grid-cols-2 gap-1 py-3">
              {NAV.map((n) => (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    aria-current={isActive(n.href) ? "page" : undefined}
                    className={`block rounded-md px-3 py-2.5 font-medium ${isActive(n.href) ? "bg-elevated text-fg" : "text-muted"}`}
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
