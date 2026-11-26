import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name}: Games, Movies & TV, Anime & AU Deals`, template: `%s · ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": [{ url: "/feed.xml", title: `${SITE.name} RSS` }] },
  },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: SITE.locale,
    title: `${SITE.name}: ${SITE.tagline}`,
    url: "/",
    description: SITE.description,
    images: [{ url: "/api/og?title=First-Party%20Truth.%20Real%20Hype.", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", title: SITE.name, description: SITE.description },
  robots: { index: true, follow: true, "max-image-preview": "large" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0B0A10" },
    { media: "(prefers-color-scheme: light)", color: "#F6F3EE" },
  ],
};

/** Broadsheet dateline. Re-rendered with each page's ISR cycle. */
function Dateline() {
  const now = new Date();
  const date = new Intl.DateTimeFormat("en-AU", { timeZone: "Australia/Sydney", weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(now);
  return (
    <div className="border-b border-line">
      <p className="up-container flex h-8 items-center justify-between gap-4 font-mono text-[10.5px] tracking-wide text-muted uppercase">
        <span>{date} · Sydney</span>
        <span className="hidden sm:inline">{SITE.tagline}</span>
      </p>
    </div>
  );
}

/* Runs before paint: apply the saved theme so there's no flash. Dark is the default. */
const themeScript = `try{var t=localStorage.getItem('up-theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Dateline />
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
