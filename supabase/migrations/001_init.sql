-- TrueFrame: initial schema
-- Run with: supabase db push   (or paste into Supabase Dashboard → SQL Editor)
-- Column names mirror src/lib/schema.ts exactly, so rows map 1:1 to the Zod type.

create extension if not exists pgcrypto;

-- ── Enums ────────────────────────────────────────────────────────────────
do $$ begin
  create type article_category as enum ('news', 'review', 'guide', 'deal', 'hub');
exception when duplicate_object then null; end $$;

do $$ begin
  create type source_tier as enum ('first_party_official', 'verified_report', 'unconfirmed_rumor');
exception when duplicate_object then null; end $$;

do $$ begin
  create type article_status as enum ('draft', 'scheduled', 'published');
exception when duplicate_object then null; end $$;

-- ── Articles ─────────────────────────────────────────────────────────────
create table if not exists public.articles (
  id                  uuid primary key default gen_random_uuid(),
  slug                text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title               text not null check (char_length(title) between 1 and 180),
  tldr_answer         text not null,
  category            article_category not null,
  vertical            text not null default 'games' check (vertical in ('games', 'film_tv')),
  source_tier         source_tier not null,
  primary_source_name text not null,
  primary_source_url  text not null check (primary_source_url like 'https://%'),
  author              jsonb not null,                 -- { name, url? }

  status              article_status not null default 'draft',
  published_at        timestamptz,
  updated_at          timestamptz not null default now(),
  created_at          timestamptz not null default now(),

  excerpt             text,
  body_md             text not null default '',
  hero_image_url      text,
  hero_image_alt      text,
  tags                text[] not null default '{}',
  platforms           text[] not null default '{}',

  spoiler_warning     jsonb,                          -- { enabled, label }
  hype_vs_reality     jsonb,                          -- { confirmed_facts[], our_expectations[] }
  review_meta         jsonb,                          -- { score_100, verdict_label, the_good[], the_bad[], platform_tested, hours_played, human_approved, ... }
  deal_meta           jsonb,                          -- { retailer, region, price_aud, rrp_aud, expires_at, affiliate_url, ... }
  guide_meta          jsonb,                          -- { steps[], checklist[], estimated_time, difficulty }
  hub_meta            jsonb,                          -- { hub_type, entries[] }
  video               jsonb,                          -- { provider, src, aspect, title, duration }
  gallery             jsonb,                          -- [{ url, alt }]
  faq                 jsonb,                          -- [{ q, a }]

  origin              text not null default 'publish_api' check (origin in ('publish_api', 'intake', 'seed')),
  intake_source       text,

  -- Brand rules enforced in the database too (defence in depth behind Zod).
  constraint scheduled_needs_time check (status <> 'scheduled' or published_at is not null),
  constraint review_needs_meta check (category <> 'review' or review_meta is not null),
  constraint deal_needs_meta check (category <> 'deal' or deal_meta is not null),
  constraint hub_needs_meta check (category <> 'hub' or hub_meta is not null),
  -- A scored review can never be live without human sign-off.
  constraint review_human_gate check (
    category <> 'review' or status = 'draft' or coalesce((review_meta ->> 'human_approved')::boolean, false)
  ),
  -- No fake discounts.
  constraint deal_is_discount check (
    deal_meta is null or (deal_meta ->> 'price_aud')::numeric < (deal_meta ->> 'rrp_aud')::numeric
  )
);

create index if not exists articles_live_idx on public.articles (status, published_at desc);
create index if not exists articles_category_idx on public.articles (category, published_at desc);
create index if not exists articles_tags_idx on public.articles using gin (tags);

-- ── Row Level Security ───────────────────────────────────────────────────
-- The site reads/writes with the service-role key on the server only.
-- Anonymous clients (if you ever use the anon key) can read live articles only.
alter table public.articles enable row level security;

drop policy if exists "Public can read live articles" on public.articles;
create policy "Public can read live articles"
  on public.articles for select
  to anon, authenticated
  using (status in ('published', 'scheduled') and published_at <= now());

-- ── Storage: mirrored hero images ────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('hero-images', 'hero-images', true, 8388608, array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'])
on conflict (id) do nothing;
