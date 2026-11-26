# UNPATCHED.GG Publishing API

Two entry points:

| Endpoint | Who | Auth | Lands as |
| --- | --- | --- | --- |
| `POST /api/publish`, `GET/PATCH/DELETE /api/publish/{slug}` | Grok Bot / in-house automation | `Authorization: Bearer $PUBLISH_API_KEY` | whatever `status` you send |
| `POST /api/intake` | Contributors, partner tools, webhooks | HMAC signature **or** `X-Intake-Secret` | `draft`, unless the source is in `INTAKE_TRUSTED_SOURCES` |

Every successful write instantly revalidates `/`, the category feed, the article, `/feed.xml`, `/sitemap.xml` and `/news-sitemap.xml`. Nothing is rebuilt.

```bash
export TF=https://unpatched.gg
export PUBLISH_API_KEY=…   # from Vercel env
export INTAKE_SECRET=…
```

---

## The schema (enforced on every write)

**Required:** `title`, `slug` (lowercase-kebab), `tldr_answer`, `category` (`news | review | guide | deal | hub`), `source_tier` (`first_party_official | verified_report | unconfirmed_rumor`), `primary_source_name`, `primary_source_url` (https), `updated_at` (ISO 8601 with offset), `author` (string or `{ name, url? }`).

**Common optional:** `status` (`draft` default · `scheduled` · `published`), `published_at`, `vertical` (`games` default · `film_tv` · `anime`, which sets the desk: Games Desk / Movies & TV / Anime), `is_breaking` (pink BREAKING tag; confirmed news only), `excerpt`, `body_md` (Markdown), `hero_image_url`, `hero_image_alt`, `hero_image_credit` (shown as `Image: …`, e.g. `"Ironvale Studios / Official Press"`), `tags[]`, `platforms[]`, `faq[{q,a}]`, `video{provider:'youtube'|'mp4', src, aspect:'16:9'|'9:16', title, duration?}`, `gallery[{url,alt,credit?}]`.

**Rich blocks:**
- `spoiler_warning: { enabled, label }`
- `hype_vs_reality: { confirmed_facts: string[], our_expectations: string[] }`
- `review_meta: { score_100, verdict_label: 'Buy'|'Wait'|'Skip', the_good[], the_bad[], platform_tested, hours_played, human_approved, verdict_sentence?, item_name?, critic_avg?, community_avg?, pull_quote?, where_to_buy?[{retailer, region:'AU'|'Global', url, price_aud?}] }`
- `deal_meta: { retailer, region, price_aud, rrp_aud, expires_at, affiliate_url, product_name?, platform? }`
- `guide_meta: { steps[{title, body, spoiler?}], checklist[], estimated_time?, difficulty? }`
- `hub_meta: { hub_type: 'game_index'|'show_index'|'release_calendar'|'goty_tracker'|'subscriptions', entries[...] }`

**Editorial truth rules (requests that break them get a `422`):**
1. Reviews need `review_meta`, deals need `deal_meta`, hubs need `hub_meta`.
2. `unconfirmed_rumor` headlines must signal uncertainty ("Rumour:", "reportedly", "leak", "claims", or a question). Reviews and deals can't be rumours.
3. Deals must be real discounts (`price_aud < rrp_aud`).
4. `scheduled` needs a `published_at`, and `updated_at` can't predate a past `published_at`.
5. `is_breaking` is only allowed on confirmed news (`category: news`, not `unconfirmed_rumor`).

**Server behaviour:**
- **Human gate:** a `review` with `human_approved !== true` is always saved as `draft` (`"gated": true` in the response). News, explainers, guides, deals and hubs publish fully automatically.
- `published` with a future `published_at` becomes `scheduled`. `published` with no `published_at` is stamped with the current time.
- Markdown/HTML is sanitised: `<script>`, `<iframe>`, `<style>`, `on*=` handlers and `javascript:` links are removed.
- A `hero_image_url` without `hero_image_credit` publishes with a warning, and the page shows `Image: credit pending` until you PATCH a credit in.
- `hero_image_url` is mirrored into Supabase Storage (≤ 8 MB, jpeg/png/webp/avif/gif). If mirroring fails, the original URL is kept and a warning is returned. An image never blocks a publish.

**Responses:** `201` created · `200` updated · `401` auth · `409` duplicate slug · `413` too large · `422` validation (`issues: [{ path, message }]`) · `503` store unavailable.

---

## Grok Bot: `/api/publish`

### Publish a news story now

```bash
curl -sS -X POST "$TF/api/publish" \
  -H "Authorization: Bearer $PUBLISH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Ironvale: Rising delayed to 19 March 2027, studio confirms",
    "slug": "ironvale-rising-delayed-march-2027",
    "category": "news",
    "status": "published",
    "source_tier": "first_party_official",
    "primary_source_name": "Ironvale Studios dev blog",
    "primary_source_url": "https://blog.ironvale.example/updates/release-date-update",
    "updated_at": "2026-11-26T09:42:00+11:00",
    "author": "Mia Tran",
    "platforms": ["PS5", "Xbox Series X|S", "PC"],
    "tldr_answer": "Yes. It now launches 19 March 2027 on PS5, Xbox Series X|S and PC. Pre-orders carry over automatically.",
    "hero_image_url": "https://press.ironvale.example/key-art.jpg",
    "hero_image_alt": "Ironvale: Rising key art",
    "hero_image_credit": "Ironvale Studios / Official Press",
    "is_breaking": true,
    "hype_vs_reality": {
      "confirmed_facts": ["New date: 19 March 2027", "Pre-orders carry over"],
      "our_expectations": ["Final trailer around The Game Awards"]
    },
    "faq": [{ "q": "Do I need to re-order?", "a": "No. Existing pre-orders carry over." }],
    "body_md": "## Why was it delayed?\n\nThe studio says…"
  }'
```

### Schedule a story

```bash
curl -sS -X POST "$TF/api/publish" \
  -H "Authorization: Bearer $PUBLISH_API_KEY" -H "Content-Type: application/json" \
  -d '{
    "title": "Game Pass December wave 2 is live",
    "slug": "game-pass-december-2026-wave-2",
    "category": "news",
    "status": "scheduled",
    "published_at": "2026-12-16T06:00:00+11:00",
    "updated_at": "2026-11-26T10:00:00+11:00",
    "source_tier": "first_party_official",
    "primary_source_name": "Platform holder news post",
    "primary_source_url": "https://news.platform-holder.example/wave-2",
    "author": "Jordan Ellis",
    "tldr_answer": "Five games join today."
  }'
```

### Rumour (headline must signal it)

```bash
curl -sS -X POST "$TF/api/publish" \
  -H "Authorization: Bearer $PUBLISH_API_KEY" -H "Content-Type: application/json" \
  -d '{
    "title": "Rumour: Starfall Chronicles remaster reportedly heading to Switch 2",
    "slug": "rumour-starfall-remaster-switch-2",
    "category": "news", "status": "published",
    "source_tier": "unconfirmed_rumor",
    "primary_source_name": "Ratings board listing (unverified)",
    "primary_source_url": "https://ratings-board.example/listing/starfall-hd",
    "updated_at": "2026-11-24T19:00:00+11:00", "author": "Priya Raman",
    "tldr_answer": "Unconfirmed. A ratings listing names it, but the publisher has not announced anything."
  }'
```

### Scored review (saved as a draft until a human approves it)

```bash
curl -sS -X POST "$TF/api/publish" \
  -H "Authorization: Bearer $PUBLISH_API_KEY" -H "Content-Type: application/json" \
  -d '{
    "title": "Kestrel Portable review: the best Windows handheld yet?",
    "slug": "kestrel-portable-review",
    "category": "review", "status": "published",
    "source_tier": "first_party_official",
    "primary_source_name": "Kestrel product page",
    "primary_source_url": "https://kestrel-devices.example/portable",
    "updated_at": "2026-11-26T06:00:00+11:00", "author": "Jordan Ellis",
    "tldr_answer": "Buy it if you want a Windows handheld: best screen in its class, mediocre battery.",
    "review_meta": {
      "score_100": 82, "verdict_label": "Buy",
      "verdict_sentence": "The best Windows handheld screen, attached to a merely okay battery.",
      "the_good": ["Gorgeous 1200p screen", "Quiet fans"],
      "the_bad": ["2 hrs battery in AAA games"],
      "platform_tested": "Kestrel Portable 512 GB", "hours_played": 30,
      "human_approved": false,
      "where_to_buy": [{ "retailer": "JB Hi-Fi", "region": "AU", "url": "https://www.jbhifi.com.au/", "price_aud": 799 }]
    }
  }'
# → 201 { "status": "draft", "gated": true, ... }
```

Then a human editor approves it:

```bash
curl -sS -X PATCH "$TF/api/publish/kestrel-portable-review" \
  -H "Authorization: Bearer $PUBLISH_API_KEY" -H "Content-Type: application/json" \
  -d '{ "status": "published",
        "review_meta": { "score_100": 82, "verdict_label": "Buy", "the_good": ["Gorgeous 1200p screen", "Quiet fans"],
                         "the_bad": ["2 hrs battery in AAA games"], "platform_tested": "Kestrel Portable 512 GB",
                         "hours_played": 30, "human_approved": true } }'
```

> `PATCH` merges **top-level** keys only. When you change a nested object like `review_meta`, send the whole object.

### Deal

```bash
curl -sS -X POST "$TF/api/publish" \
  -H "Authorization: Bearer $PUBLISH_API_KEY" -H "Content-Type: application/json" \
  -d '{
    "title": "DualSense controllers are $79 at Target",
    "slug": "dualsense-target-deal-dec",
    "category": "deal", "status": "published",
    "source_tier": "first_party_official",
    "primary_source_name": "Target listing",
    "primary_source_url": "https://www.target.com.au/",
    "updated_at": "2026-11-26T09:30:00+11:00", "author": "Jordan Ellis",
    "tldr_answer": "DualSense controllers are $79 at Target, down from $109 RRP.",
    "deal_meta": { "retailer": "Target", "region": "AU", "price_aud": 79, "rrp_aud": 109,
                   "expires_at": "2026-12-01T23:59:00+11:00", "affiliate_url": "https://www.target.com.au/",
                   "product_name": "DualSense Wireless Controller", "platform": "PS5" }
  }'
```

### Update, read back, delete

```bash
# Patch any top-level fields (updated_at is bumped automatically)
curl -sS -X PATCH "$TF/api/publish/ironvale-rising-delayed-march-2027" \
  -H "Authorization: Bearer $PUBLISH_API_KEY" -H "Content-Type: application/json" \
  -d '{ "tldr_answer": "Yes, delayed to 19 March 2027. UPDATE: the PC specs are now public." }'

# Read back (includes drafts)
curl -sS "$TF/api/publish/ironvale-rising-delayed-march-2027" -H "Authorization: Bearer $PUBLISH_API_KEY"

# Delete (instantly removed from every page, feed and sitemap)
curl -sS -X DELETE "$TF/api/publish/ironvale-rising-delayed-march-2027" -H "Authorization: Bearer $PUBLISH_API_KEY"
```

---

## External submissions: `/api/intake`

Send `X-Intake-Source: <your-id>` on every request. Sources listed in `INTAKE_TRUSTED_SOURCES` can publish or schedule directly. Everyone else lands in `draft` for review. Duplicate slugs return `409`.

### Option A: HMAC signature (recommended)

`signature = hex(HMAC_SHA256(INTAKE_SECRET, "<unix_ts>.<raw_body>"))`. Requests older than ±5 minutes are rejected, which blocks replays.

```bash
BODY='{"title":"Hands-on: Paper Kingdoms is a papercraft delight","slug":"paper-kingdoms-hands-on","category":"news","status":"published","source_tier":"first_party_official","primary_source_name":"Foldline preview event","primary_source_url":"https://foldline.example/press","updated_at":"2026-11-26T11:00:00+11:00","author":{"name":"Alex Contributor"},"tldr_answer":"Two hours in, it is charming and tactile.","body_md":"## What is it?\n\nA papercraft adventure…"}'
TS=$(date +%s)
SIG="sha256=$(printf '%s' "$TS.$BODY" | openssl dgst -sha256 -hmac "$INTAKE_SECRET" -hex | sed 's/^.* //')"

curl -sS -X POST "$TF/api/intake" \
  -H "Content-Type: application/json" \
  -H "X-Intake-Source: partner-bot" \
  -H "X-Intake-Timestamp: $TS" \
  -H "X-Intake-Signature: $SIG" \
  --data-binary "$BODY"
```

Node.js signer:

```js
import { createHmac } from "node:crypto";
const body = JSON.stringify(article);
const ts = Math.floor(Date.now() / 1000).toString();
const sig = "sha256=" + createHmac("sha256", process.env.INTAKE_SECRET).update(`${ts}.${body}`).digest("hex");
await fetch(`${TF}/api/intake`, { method: "POST", body, headers: {
  "Content-Type": "application/json", "X-Intake-Source": "partner-bot",
  "X-Intake-Timestamp": ts, "X-Intake-Signature": sig } });
```

### Option B: shared secret (for tools that can't sign)

```bash
curl -sS -X POST "$TF/api/intake" \
  -H "Content-Type: application/json" \
  -H "X-Intake-Source: community-writer" \
  -H "X-Intake-Secret: $INTAKE_SECRET" \
  --data-binary "$BODY"
# untrusted source → 201 { "status": "draft", "warnings": ["Untrusted intake source: routed to draft…"] }
```

---

## Scheduled publishing cron

```bash
curl -sS "$TF/api/cron/publish-scheduled" -H "Authorization: Bearer $CRON_SECRET"
# → { "ok": true, "promoted": ["game-pass-december-2026-wave-2"], "revalidated": [...] }
```

Vercel Cron calls this automatically (see `vercel.json`). Due scheduled posts go live within about 5 minutes even if the cron hasn't run yet.
