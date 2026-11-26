# TrueFrame

**First-Party Truth. Real Hype.** Gaming & entertainment news, reviews, guides, hubs and AU deals.

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
  app/                      routes: /, /news/[slug], /reviews/[slug], /guides/[slug], /hubs/[slug], /deals, /videos
    api/publish/            POST create · [slug]: GET / PATCH / DELETE   (Bearer PUBLISH_API_KEY)
    api/intake/             POST external submissions                   (HMAC or X-Intake-Secret)
    api/cron/publish-scheduled  promotes due scheduled posts            (Bearer CRON_SECRET)
    api/og/                 dynamic 1200×630 OpenGraph cards
    feed.xml · sitemap.xml · news-sitemap.xml · robots.txt
  components/               TrueFrameLogo, Header/Search, VerdictCard, HypeVsReality, HubView, Deals …
  lib/schema.ts             ★ Zod schema + editorial rules (source of truth for content)
  lib/publishing.ts         shared publish pipeline (sanitise → gate → mirror image → save → revalidate)
  lib/store.ts              Supabase data access + in-memory fallback, cached with tag "articles"
  lib/seed.ts               demo content (validated against the schema at build time)
supabase/migrations/001_init.sql
```

## Design system

| Token | Dark (default) | Light |
| --- | --- | --- |
| Base / Surface / Elevated | `#0B0D12` / `#131722` / `#1A2030` | `#F8FAFC` / `#FFFFFF` / `#F1F5F9` |
| Border | `#222838` | `#E2E8F0` |
| Text / Muted | `#F4F6F8` / `#94A3B8` | `#0F172A` / `#475569` |
| Signal Mint (accent, First-Party Official) | `#00E599` | `#00B87A` fill · `#047857` small text |
| Sky Cyan (Verified Report) | `#38BDF8` | `#0369A1` text |
| Editorial Amber (Rumor, Spoilers) | `#F59E0B` | `#B45309` text |
| Signal Coral (Skip / negative) | `#FF4D5E` | `#BE123C` text |

Fonts: Space Grotesk (headlines), Inter (body), JetBrains Mono (scores, timestamps, pills). They're self-hosted via `@fontsource-variable`, so there are no Google Fonts requests.

**Contrast note:** the brand colours `#00B87A`, `#38BDF8`, `#F59E0B` and `#FF4D5E` drop below WCAG AA (4.5:1) as small text on light backgrounds. Light mode keeps them for fills, rings and borders, and uses the darker `*-text` tokens above for text. All tokens live in `src/app/globals.css`.

Logo: `<TrueFrameLogo />` / `<TrueFrameMark />` in `src/components/TrueFrameLogo.tsx`. There's also a favicon at `src/app/icon.svg` and a static wordmark at `public/brand/trueframe-logo.svg`.

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
| `NEXT_PUBLIC_SITE_URL` | `https://your-domain.com.au` (no trailing slash) |
| `SUPABASE_URL` | Supabase Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key (**server-only, never `NEXT_PUBLIC_`**) |
| `SUPABASE_STORAGE_BUCKET` | `hero-images` |
| `PUBLISH_API_KEY` | `openssl rand -hex 32` |
| `INTAKE_SECRET` | `openssl rand -hex 32` |
| `INTAKE_TRUSTED_SOURCES` | e.g. `partner-bot,senior-contributor` |
| `CRON_SECRET` | `openssl rand -hex 32` (Vercel Cron sends it automatically) |

3. Deploy. Then check with `curl https://your-domain/api/publish -X POST` → expect `401`.

> In production, the write APIs return **503** until Supabase is configured. That stops a bot from "publishing" into the per-instance memory store and losing the article. (`TRUEFRAME_ALLOW_MEMORY_WRITES=1` overrides this; use it only for local testing.)

### Scheduling on the free tier
`vercel.json` runs `/api/cron/publish-scheduled` daily, which is the most Vercel Hobby allows. Scheduled posts **don't depend on the cron to go live**: the public query includes `scheduled` rows whose `published_at` has passed, and pages revalidate every 5 minutes. So a scheduled article appears within about 5 minutes of its time. For exact-minute publishing, point any free external scheduler (GitHub Actions, cron-job.org) at the cron URL every 5 minutes with `Authorization: Bearer $CRON_SECRET`, or upgrade to Vercel Pro and change the schedule to `*/5 * * * *`.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Production build (also validates all seed content against the schema) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run seed:supabase` | Upsert demo content into Supabase |
