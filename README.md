# UNPATCHED.GG

**unpatched.gg · First-Party Truth. Real Hype.** Games, movies & TV and anime news, plus reviews, guides, trackers and AU deals, built like a broadsheet: flat editorial ink and 1px hairline grids, with no glow or gradients.

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Supabase (Postgres + Storage) · Vercel. Every tier used here has a free plan.

- **Instant publishing.** Publish/patch/delete via API → on-demand `revalidateTag` + `revalidatePath`. No rebuilds.
- **Editorial truth in code.** Zod schema + DB constraints: every article names its primary source and source tier. Rumours must read as rumours, there are no fake discounts, and scored reviews need human sign-off.
- **Zero bloat.** No ads, no autoplay, self-hosted fonts, click-to-load video.

> Bots: see **[PUBLISHING_API.md](./PUBLISHING_API.md)** for `curl` examples.

---

## Quick start (local, no accounts needed)

```bash
npm install
cp .env.example .env.local     # optional for local dev
npm run dev                    # http://localhost:3000
```

Without Supabase env vars the site runs on **built-in demo seed data** and the API writes to an in-memory store. That's fine for development, but the store resets on restart.

> **Demo content is fictional.** Seed games, shows and studios are invented, and every source URL uses the reserved `.example` domain. That way demo data can never pass as a real announcement. Retailer and platform names are real so the UI is realistic. Remove the seed before launch (see below).

## Project map

```
src/
  app/                      routes: /, /desks/{games,movies-tv,anime}, /news/[slug], /reviews/[slug], /guides/[slug], /hubs/[slug], /deals, /videos
    api/publish/            POST create · [slug]: GET / PATCH / DELETE   (Bearer PUBLISH_API_KEY)
    api/intake/             POST external submissions                   (HMAC or X-Intake-Secret)
    api/cron/publish-scheduled  promotes due scheduled posts            (Bearer CRON_SECRET)
    api/og/                 dynamic 1200×630 OpenGraph cards
    feed.xml · sitemap.xml · news-sitemap.xml · robots.txt
  components/               UnpatchedLogo, Header/Search, LiveWire, VerdictCard, HypeVsReality, HubView, Deals …
  lib/schema.ts             ★ Zod schema + editorial rules (source of truth for content)
  lib/publishing.ts         shared publish pipeline (sanitise → gate → mirror image → save → revalidate)
  lib/store.ts              Supabase data access + in-memory fallback, cached with tag "articles"
  lib/seed.ts               demo content (validated against the schema at build time)
supabase/migrations/001_init.sql
```

## Design system

Flat editorial ink: no glow, no gradients, no drop shadows, no rounded "SaaS cards". Structure comes from **1px hairline dividers** and **3px ink rules** on section mastheads.

| Token | Dark (default) | Light |
| --- | --- | --- |
| Background | `#0B0A10` Obsidian | `#F6F3EE` Editorial Paper |
| Surface / Elevated | `#14121C` / `#1C1927` | `#FFFFFF` / `#EFEBE4` |
| Hairline border | `#262235` | `#DCD7CE` |
| Text / Muted | `#F6F3EE` / `#A39DB0` | `#0B0A10` / `#575163` |
| **Vice Pink**: accent, BREAKING, `.GG`, active nav | `#FF2E93` | fill `#FF2E93` · small text `#C2185B` |
| **Vice Gold**: verdicts, scores, editorial rules (Short Answer, spoilers) | `#F5B700` | fill `#F5B700` · small text `#8A6100` |
| **Vice Purple**: desk tags, interactive filters | `#7C3AED` fill · `#A78BFA` text | `#7C3AED` |
| **Verified Green**: *only* the Primary Source · Official badge | `#15803D` (white text) | `#15803D` (white text) |

- **Desks:** every story carries a purple desk label (Games Desk, Movies & TV, Anime, Reviews, Guides, AU Deals, Trackers) derived from `category` + `vertical`.
- **Live Wire:** a timestamped rail of editorial filings on the homepage.
- **Image credits:** every image renders an `Image: [Studio / Official Press]` line from `hero_image_credit` (or `gallery[].credit`). The publish API warns when a credit is missing. Without an image, a flat placeholder shows an open credit slot. There's no stock art and no generated gradients.
- **Fonts:** Space Grotesk (headlines), Inter (body), JetBrains Mono (scores, timestamps, tags). They're self-hosted via `@fontsource-variable`.
- **Contrast:** pink, gold and purple fall below 4.5:1 as small text on some backgrounds, so each has a separate `*-text` token, all ≥ 4.5:1 (WCAG AA). Fills that sit behind text use ink or white, whichever passes. Tokens live in `src/app/globals.css`.

### Logo
`src/components/UnpatchedLogo.tsx` is pure SVG geometry with no font dependency, so it renders the same in the nav, favicon and OG cards.
- **Wordmark:** heavy condensed block `UNPATCHED` with a diagonal slash cut through the left stem of the U, `.GG` in Vice Pink, underscored by a thin Vice Gold bar.
- **Mark / favicon:** a square split diagonally, Pink top-left and Purple bottom-right, with a Gold folded top-right corner and a bold white sliced U.
- **Files:** `src/app/icon.svg` (favicon), `public/brand/unpatched-logo.svg` (wordmark, for dark backgrounds), `public/brand/unpatched-mark.svg`.

## Deploy (Supabase + Vercel)

### 1. Supabase (free tier)
1. Create a project at [supabase.com](https://supabase.com).
2. **SQL Editor** → paste and run `supabase/migrations/001_init.sql` (or `supabase db push` with the CLI). This creates the `articles` table, constraints, RLS and the public `hero-images` storage bucket.
3. **Project Settings → API**: copy the **Project URL** and the **service_role** key.
4. Optional, to load the demo content: `SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… npm run seed:supabase`. Remove it before launch with `delete from articles where origin = 'seed';`

### 2. Vercel
1. Import the GitHub repo at [vercel.com/new](https://vercel.com/new). The framework (Next.js) is auto-detected.
2. **Settings → Environment Variables** (Production + Preview):

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://unpatched.gg` (no trailing slash) |
| `SUPABASE_URL` | Supabase Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key (**server-only, never `NEXT_PUBLIC_`**) |
| `SUPABASE_STORAGE_BUCKET` | `hero-images` |
| `PUBLISH_API_KEY` | `openssl rand -hex 32` |
| `INTAKE_SECRET` | `openssl rand -hex 32` |
| `INTAKE_TRUSTED_SOURCES` | e.g. `partner-bot,senior-contributor` |
| `CRON_SECRET` | `openssl rand -hex 32` (Vercel Cron sends it automatically) |

3. Deploy. Then check with `curl https://unpatched.gg/api/publish -X POST` → expect `401`.

> In production, the write APIs return **503** until Supabase is configured. That stops a bot from "publishing" into the per-instance memory store and losing the article. (`UNPATCHED_ALLOW_MEMORY_WRITES=1` overrides this; use it only for local testing.)

### Scheduling on the free tier
`vercel.json` runs `/api/cron/publish-scheduled` daily, which is the most Vercel Hobby allows. Scheduled posts **don't depend on the cron to go live**: the public query includes `scheduled` rows whose `published_at` has passed, and pages revalidate every 5 minutes. So a scheduled article appears within about 5 minutes of its time. For exact-minute publishing, point any free external scheduler (GitHub Actions, cron-job.org) at the cron URL every 5 minutes with `Authorization: Bearer $CRON_SECRET`, or upgrade to Vercel Pro and change the schedule to `*/5 * * * *`.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Production build (also validates all seed content against the schema) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run seed:supabase` | Upsert demo content into Supabase |
