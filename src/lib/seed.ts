import { articleInputSchema, type Article, type ArticleInput } from "./schema";

/* ────────────────────────────────────────────────────────────────────────────
 * DEMO SEED CONTENT — late November 2026.
 * Games, shows, studios and streamers here are FICTIONAL and every source URL
 * uses the reserved `.example` TLD, so demo data can never be mistaken for a
 * real first-party announcement. Retailer and platform names are real so the
 * deal / platform UI can be judged realistically. Replace via the publish API.
 * Every entry is run through the production Zod schema at build time.
 * ──────────────────────────────────────────────────────────────────────────── */

const MIA = { name: "Mia Tran" };
const JORDAN = { name: "Jordan Ellis" };
const PRIYA = { name: "Priya Raman" };
const SAM = { name: "Sam Okafor" };

function seed(input: ArticleInput): Article {
  const parsed = articleInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(`Invalid seed "${input.slug}": ${JSON.stringify(parsed.error.issues, null, 2)}`);
  }
  return { ...parsed.data, id: `seed-${parsed.data.slug}`, created_at: parsed.data.published_at ?? parsed.data.updated_at, origin: "seed" };
}

export const SEED_ARTICLES: Article[] = [
  /* ── NEWS ─────────────────────────────────────────────────────────────── */
  seed({
    title: "Ironvale: Rising delayed to 19 March 2027, studio confirms",
    slug: "ironvale-rising-delayed-march-2027",
    category: "news",
    is_breaking: true,
    status: "published",
    source_tier: "first_party_official",
    primary_source_name: "Ironvale Studios dev blog",
    primary_source_url: "https://blog.ironvale.example/updates/release-date-update",
    published_at: "2026-11-26T08:10:00+11:00",
    updated_at: "2026-11-26T09:42:00+11:00",
    author: MIA,
    platforms: ["PS5", "Xbox Series X|S", "PC"],
    tags: ["Ironvale", "Delays", "Release dates"],
    excerpt: "The sequel moves from February to March. Pre-orders stay open, and the PC spec sheet is now public.",
    tldr_answer:
      "Yes, it's delayed. Ironvale: Rising now launches 19 March 2027 on PS5, Xbox Series X|S and PC, about five weeks later than its original 12 February date. Existing pre-orders carry over automatically and nobody needs to re-order.",
    hype_vs_reality: {
      confirmed_facts: [
        "New launch date: 19 March 2027 (all platforms, simultaneous)",
        "Pre-orders and the Deluxe Edition early-access window (3 days) carry over",
        "Minimum PC spec: RTX 3060 / RX 6600, 16 GB RAM, SSD required",
        "No Switch 2 version announced",
      ],
      our_expectations: [
        "A final pre-launch trailer around The Game Awards window",
        "Performance mode targeting 60fps on PS5 Pro, based on the studio's last two releases",
        "AU retail pricing to hold at $109.95 standard",
      ],
    },
    faq: [
      { q: "When does Ironvale: Rising release?", a: "19 March 2027 on PS5, Xbox Series X|S and PC." },
      { q: "Do I need to cancel my pre-order?", a: "No. Ironvale Studios confirmed existing pre-orders transfer to the new date automatically." },
      { q: "Is it coming to Switch 2?", a: "Not announced. The studio has only confirmed PS5, Xbox Series X|S and PC." },
    ],
    video: { provider: "youtube", src: "demo-ironvale-rising", aspect: "16:9", title: "Ironvale: Rising — Release Date Update", duration: "2:14" },
    body_md: `## Why was it delayed?

In its post, Ironvale Studios says the extra five weeks are for "performance and stability on every platform at once." The team doesn't want a staggered launch where one console version lags behind.

> "We'd rather ship once, everywhere, and have it run the way we promised." — Ironvale Studios

## What changes for pre-orders?

Nothing you need to act on. Standard and Deluxe pre-orders roll over, and the Deluxe three-day early access moves to **16 March 2027**.

## What are the PC specs?

| Tier | GPU | CPU | RAM |
| --- | --- | --- | --- |
| Minimum (1080p/30) | RTX 3060 / RX 6600 | Ryzen 5 3600 | 16 GB |
| Recommended (1440p/60) | RTX 4070 / RX 7800 XT | Ryzen 7 5800X3D | 32 GB |

An SSD is required on every tier.

## Our take

A five-week slip ahead of a crowded autumn is a sensible move, not a red flag. The studio's last game launched in good shape after a similar short delay.`,
  }),
  seed({
    title: "Kestrel Portable launches in Australia at $799, retailers confirm stock",
    slug: "kestrel-portable-au-launch-price",
    category: "news",
    status: "published",
    source_tier: "verified_report",
    primary_source_name: "Kestrel AU press note + retailer confirmation",
    primary_source_url: "https://press.kestrel-devices.example/au-availability",
    published_at: "2026-11-25T14:30:00+11:00",
    updated_at: "2026-11-26T07:05:00+11:00",
    author: JORDAN,
    platforms: ["PC"],
    tags: ["Hardware", "Handheld", "AU pricing"],
    excerpt: "Two retailers confirmed stock and pricing for the 512 GB model. The 1 TB OLED arrives in December.",
    tldr_answer:
      "The Kestrel Portable 512 GB is $799 in Australia from today. JB Hi-Fi and Amazon AU both confirmed stock to UNPATCHED.GG. The 1 TB OLED model ($1,049) ships 11 December.",
    hype_vs_reality: {
      confirmed_facts: ["512 GB LCD: $799 AUD, in stock 25 Nov", "1 TB OLED: $1,049 AUD, ships 11 Dec", "Runs Windows 11 with a custom launcher"],
      our_expectations: ["Battery life in demanding games closer to 2 hours than the advertised 3–4", "Early stock to sell through before Christmas"],
    },
    body_md: `## How much is it in Australia?

**$799** for the 512 GB LCD model. That's the same as Amazon AU's listing and in line with a direct conversion of the US price plus GST.

## When does the OLED model ship?

The 1 TB OLED is **$1,049** and ships **11 December 2026**. Pre-orders are live at both retailers.

## How did we verify this?

We contacted both retailers directly. Kestrel's own AU press page matches the pricing. This counts as a *Verified Report* rather than *First-Party Official* because the hardware maker's announcement was a regional press note, not a global launch post.`,
  }),
  seed({
    title: "Rumour: Starfall Chronicles remaster reportedly heading to Switch 2 in 2027",
    slug: "rumour-starfall-chronicles-remaster-switch-2",
    category: "news",
    status: "published",
    source_tier: "unconfirmed_rumor",
    primary_source_name: "Retail database listing (unverified)",
    primary_source_url: "https://ratings-board.example/listing/starfall-chronicles-hd",
    published_at: "2026-11-24T19:00:00+11:00",
    updated_at: "2026-11-24T19:00:00+11:00",
    author: PRIYA,
    platforms: ["Switch 2"],
    tags: ["Rumour", "Remaster", "Switch 2"],
    excerpt: "A ratings-board listing names an HD remaster. The publisher hasn't confirmed anything.",
    tldr_answer:
      "Unconfirmed. A ratings-board listing names a 'Starfall Chronicles HD' for Switch 2, but the publisher hasn't announced it and declined to comment. Treat it as a rumour until there's an official post.",
    hype_vs_reality: {
      confirmed_facts: ["The original Starfall Chronicles released in 2019 (publisher back-catalogue)"],
      our_expectations: ["Ratings listings often precede announcements by 1–3 months", "A reveal in a first-party showcase is plausible but not guaranteed"],
    },
    body_md: `## What does the listing say?

The listing names **Starfall Chronicles HD** with Switch 2 as the platform and an M rating. It has no release date and no price.

## Has the publisher confirmed it?

**No.** We asked, and the publisher said it "does not comment on rumour or speculation."

## How much weight should I give this?

Ratings listings are fairly reliable signals, but they aren't announcements. Games get rated and then delayed, renamed or cancelled. We'll upgrade this to *First-Party Official* the moment there's an official post.`,
  }),
  seed({
    title: "The Hollow Crown season 3 premieres 12 February on Lumen+",
    slug: "hollow-crown-season-3-premiere-date",
    category: "news",
    vertical: "film_tv",
    status: "published",
    source_tier: "first_party_official",
    primary_source_name: "Lumen+ press room",
    primary_source_url: "https://press.lumenplus.example/hollow-crown-s3",
    published_at: "2026-11-25T10:00:00+11:00",
    updated_at: "2026-11-25T10:00:00+11:00",
    author: SAM,
    tags: ["TV", "The Hollow Crown", "Streaming"],
    excerpt: "Eight episodes, weekly drops, and the season 2 finale cliffhanger finally gets addressed.",
    tldr_answer:
      "The Hollow Crown season 3 premieres Friday 12 February 2027 on Lumen+, with eight episodes released weekly. The teaser confirms the main cast is back.",
    spoiler_warning: { enabled: true, label: "Spoilers for The Hollow Crown season 2 finale" },
    hype_vs_reality: {
      confirmed_facts: ["Premiere: 12 Feb 2027", "8 episodes, weekly release", "Main cast returns"],
      our_expectations: ["A two-episode premiere, matching season 2", "Season 4 renewal before this season ends"],
    },
    video: { provider: "youtube", src: "demo-hollow-crown-s3", aspect: "9:16", title: "The Hollow Crown S3 — Teaser (vertical)", duration: "0:45" },
    body_md: `## When and where can I watch it?

Friday **12 February 2027** on Lumen+ in Australia and globally, with one new episode every Friday after that.

## Does the teaser address the finale?

Yes. The teaser opens on the burning throne room, which confirms the season 2 coup *didn't* fully succeed.`,
  }),
  seed({
    title: "Game Pass December 2026 wave 1: four games joining, one leaving",
    slug: "game-pass-december-2026-wave-1",
    category: "news",
    status: "published",
    source_tier: "first_party_official",
    primary_source_name: "Platform holder news post",
    primary_source_url: "https://news.platform-holder.example/game-pass-december-wave-1",
    published_at: "2026-11-23T04:00:00+11:00",
    updated_at: "2026-11-23T04:00:00+11:00",
    author: JORDAN,
    platforms: ["Xbox Series X|S", "PC"],
    tags: ["Game Pass", "Subscriptions"],
    tldr_answer:
      "Four games join Game Pass between 2 and 9 December, led by Tidebreaker on day one. Neon Requiem leaves on 15 December, so finish it now if it's on your list.",
    body_md: `## What's joining?

See the full list in our [Game Pass & PS Plus tracker](/hubs/game-pass-ps-plus-tracker).

## What's leaving on 15 December?

Just **Neon Requiem**. The member discount of 20% applies until it leaves.`,
  }),

  seed({
    title: "Starlight Relay season 2 confirmed for April 2027, with a simulcast in Australia",
    slug: "starlight-relay-season-2-april-2027",
    category: "news",
    vertical: "anime",
    status: "published",
    source_tier: "first_party_official",
    primary_source_name: "Studio Kumo official X account + licensor press release",
    primary_source_url: "https://studio-kumo.example/news/starlight-relay-s2",
    published_at: "2026-11-26T07:30:00+11:00",
    updated_at: "2026-11-26T08:15:00+11:00",
    author: SAM,
    platforms: ["Crunchyroll"],
    tags: ["Anime", "Simulcast", "Starlight Relay"],
    excerpt: "Twelve episodes, same director, and a same-day English sub in AU and NZ.",
    tldr_answer:
      "Yes. Starlight Relay season 2 premieres in April 2027 with 12 episodes, and Australian viewers get a same-day subbed simulcast. The English dub follows two weeks later.",
    spoiler_warning: { enabled: true, label: "Light spoilers for the Starlight Relay season 1 finale" },
    hype_vs_reality: {
      confirmed_facts: ["Premieres April 2027 (exact date TBA)", "12 episodes", "Same-day subbed simulcast in AU/NZ", "English dub two weeks behind"],
      our_expectations: ["A key visual and trailer at the studio's December stream", "Season 1 returning to the service in full before the premiere"],
    },
    body_md: `## When does season 2 start?

**April 2027.** The studio has confirmed the month but not the day yet.

## Can I watch it in Australia?

Yes. The licensor's release says AU and NZ get the subbed episodes the same day as Japan.

## Is the original team back?

The director and series composer both return, per the studio's announcement.`,
  }),
  seed({
    title: "Moonlit Arcana anime adaptation reportedly in production",
    slug: "rumour-moonlit-arcana-anime-adaptation",
    category: "news",
    vertical: "anime",
    status: "published",
    source_tier: "unconfirmed_rumor",
    primary_source_name: "Japanese trade magazine listing (unverified)",
    primary_source_url: "https://trade-mag.example/listing/moonlit-arcana",
    published_at: "2026-11-25T20:00:00+11:00",
    updated_at: "2026-11-25T20:00:00+11:00",
    author: PRIYA,
    tags: ["Anime", "Rumour"],
    tldr_answer: "Unconfirmed. A trade-magazine listing names an adaptation, but the publisher and the rumoured studio haven't announced anything.",
    body_md: `## How solid is this?

It's a single trade listing with no studio or date attached. We'll upgrade the tier as soon as there's an official post.`,
  }),

  /* ── REVIEWS ──────────────────────────────────────────────────────────── */
  seed({
    title: "Ironvale: Echoes review — a modern action-RPG benchmark",
    slug: "ironvale-echoes-review",
    category: "review",
    status: "published",
    source_tier: "first_party_official",
    primary_source_name: "Ironvale Studios official game page",
    primary_source_url: "https://ironvale.example/echoes",
    published_at: "2026-11-21T00:01:00+11:00",
    updated_at: "2026-11-22T11:00:00+11:00",
    author: MIA,
    platforms: ["PS5", "Xbox Series X|S", "PC"],
    tags: ["Action RPG", "Ironvale"],
    tldr_answer:
      "Buy it. Ironvale: Echoes is the best action-RPG of 2026: a tight 40-hour campaign, the best combat in the genre, and a PS5 performance mode that holds 60fps.",
    review_meta: {
      score_100: 91,
      verdict_label: "Buy",
      verdict_sentence: "Combat this good comes along once a generation. Echoes earns every one of its 40 hours.",
      the_good: ["Parry-driven combat with real depth", "Dense, hand-built world with no filler", "Locked 60fps performance mode on PS5", "Smart, optional accessibility tuning"],
      the_bad: ["Final act leans on recycled bosses", "Inventory UI is clumsy on controller"],
      platform_tested: "PS5 (also checked on PS5 Pro)",
      hours_played: 46,
      human_approved: true,
      item_name: "Ironvale: Echoes",
      critic_avg: 89,
      community_avg: 84,
      pull_quote: "The first parry you land is a promise the next 40 hours keep.",
      where_to_buy: [
        { retailer: "JB Hi-Fi", region: "AU", url: "https://www.jbhifi.com.au/", price_aud: 89 },
        { retailer: "Amazon AU", region: "AU", url: "https://www.amazon.com.au/", price_aud: 84 },
        { retailer: "Steam", region: "Global", url: "https://store.steampowered.com/", price_aud: 99.95 },
      ],
    },
    video: { provider: "youtube", src: "demo-ironvale-echoes-review", aspect: "16:9", title: "Ironvale: Echoes — Video Review", duration: "9:31" },
    body_md: `## Is the combat as good as the trailers?

Better. Every enemy has a readable tell, and every parry has weight. By hour ten you're stringing perfect deflects into finishers without thinking about it.

## How does it run?

On PS5, **Performance mode** held 60fps in our testing everywhere except two dense hub areas, where it dipped into the low 50s. **Quality mode** runs at 30fps with noticeably better foliage and shadows.

## Where does it stumble?

The final act brings back three earlier bosses with new move-sets. It's competent, but it's padding in a game that otherwise has none.

## Who should skip it?

Anyone who bounces off parry-timing systems. Even with the accessibility options widening the window, the game is built around it.`,
  }),
  seed({
    title: "Tidebreaker review — gorgeous seas, shallow currents",
    slug: "tidebreaker-review",
    category: "review",
    status: "published",
    source_tier: "first_party_official",
    primary_source_name: "Publisher product page",
    primary_source_url: "https://tidebreaker-game.example",
    published_at: "2026-11-18T09:00:00+11:00",
    updated_at: "2026-11-18T09:00:00+11:00",
    author: PRIYA,
    platforms: ["Switch 2", "PC"],
    tags: ["Adventure", "Open world"],
    tldr_answer:
      "Wait for a sale. Tidebreaker's sailing is gorgeous and relaxing, but its 25 hours run out of ideas around the halfway mark. It's day one on Game Pass PC in December.",
    review_meta: {
      score_100: 74,
      verdict_label: "Wait",
      verdict_sentence: "A beautiful voyage that runs out of wind halfway across.",
      the_good: ["Stunning water and weather tech", "Relaxing, low-pressure exploration", "Great handheld performance on Switch 2"],
      the_bad: ["Repetitive island objectives", "Thin story", "Upgrade economy is grindy"],
      platform_tested: "Switch 2 (handheld + docked)",
      hours_played: 27,
      human_approved: true,
      item_name: "Tidebreaker",
      critic_avg: 76,
      community_avg: 81,
      where_to_buy: [
        { retailer: "Big W", region: "AU", url: "https://www.bigw.com.au/", price_aud: 69 },
        { retailer: "Target", region: "AU", url: "https://www.target.com.au/", price_aud: 72 },
      ],
    },
    body_md: `## What's it like to play?

You sail between procedurally decorated islands, gathering salvage and upgrading your boat. The first five hours are magic.

## Why "Wait"?

By hour twelve you've seen every island archetype. Discounted, or on Game Pass, it's a lovely comfort game.`,
  }),
  seed({
    title: "Neon Requiem review — style can't save a broken shooter",
    slug: "neon-requiem-review",
    category: "review",
    status: "published",
    source_tier: "first_party_official",
    primary_source_name: "Steam store page (developer)",
    primary_source_url: "https://neon-requiem.example/steam",
    published_at: "2026-11-12T10:00:00+11:00",
    updated_at: "2026-11-14T16:20:00+11:00",
    author: SAM,
    platforms: ["PC"],
    tags: ["Shooter", "PC"],
    tldr_answer:
      "Skip it. Neon Requiem looks incredible, but on a mid-range PC it stutters constantly, crashes often, and has a campaign that ends abruptly after six hours.",
    review_meta: {
      score_100: 48,
      verdict_label: "Skip",
      verdict_sentence: "A striking art style trapped in a game that barely runs.",
      the_good: ["Phenomenal neon-noir art direction", "Punchy shotgun"],
      the_bad: ["Shader-compilation stutter every few seconds", "Two hard crashes per hour on RTX 4070", "Six-hour campaign with no ending", "No ultrawide support"],
      platform_tested: "PC (RTX 4070, Ryzen 7 7800X3D, 32 GB)",
      hours_played: 9,
      human_approved: true,
      item_name: "Neon Requiem",
      critic_avg: 52,
      community_avg: 38,
      where_to_buy: [{ retailer: "Steam", region: "Global", url: "https://store.steampowered.com/", price_aud: 59.95 }],
    },
    body_md: `## Is it really that broken?

On our test rig, yes. Patch 1.02 helped slightly with crashes, but the stutter is still there. We'll re-test after the promised performance patch.`,
  }),
  seed({
    title: "The Hollow Crown season 2 review — prestige TV at full gallop",
    slug: "hollow-crown-season-2-review",
    category: "review",
    vertical: "film_tv",
    status: "published",
    source_tier: "first_party_official",
    primary_source_name: "Lumen+ series page",
    primary_source_url: "https://lumenplus.example/series/the-hollow-crown",
    published_at: "2026-10-30T18:00:00+11:00",
    updated_at: "2026-10-30T18:00:00+11:00",
    author: SAM,
    tags: ["TV", "Fantasy"],
    tldr_answer: "Buy in. Season 2 is sharper, faster and braver than season 1, with an all-timer of a finale.",
    spoiler_warning: { enabled: true, label: "Light spoilers for season 1" },
    review_meta: {
      score_100: 86,
      verdict_label: "Buy",
      verdict_sentence: "Faster, meaner and more confident than season 1.",
      the_good: ["Tight eight-episode arc", "Career-best lead performance", "Practical battle sets"],
      the_bad: ["Episode 4 subplot goes nowhere", "Score leans on one theme"],
      platform_tested: "Lumen+ (4K Dolby Vision, AU)",
      hours_played: 8,
      human_approved: true,
      item_name: "The Hollow Crown — Season 2",
      critic_avg: 88,
      community_avg: 90,
    },
    body_md: `## Do I need to rewatch season 1?

A recap episode is built in, but the season 1 finale is worth revisiting.`,
  }),
  // Gated example: AI-drafted scored review awaiting human sign-off. Never public.
  seed({
    title: "Kestrel Portable review — the best Windows handheld yet?",
    slug: "kestrel-portable-review",
    category: "review",
    status: "draft",
    source_tier: "first_party_official",
    primary_source_name: "Kestrel product page",
    primary_source_url: "https://kestrel-devices.example/portable",
    updated_at: "2026-11-26T06:00:00+11:00",
    author: JORDAN,
    tldr_answer: "Draft awaiting human approval.",
    review_meta: {
      score_100: 82,
      verdict_label: "Buy",
      the_good: ["Great screen"],
      the_bad: ["Battery"],
      platform_tested: "Kestrel Portable 512 GB",
      hours_played: 30,
      human_approved: false,
    },
  }),

  seed({
    title: "Starlight Relay season 1 review: the sports anime of the year",
    slug: "starlight-relay-season-1-review",
    category: "review",
    vertical: "anime",
    status: "published",
    source_tier: "first_party_official",
    primary_source_name: "Studio Kumo series page",
    primary_source_url: "https://studio-kumo.example/starlight-relay",
    published_at: "2026-10-12T18:00:00+11:00",
    updated_at: "2026-10-12T18:00:00+11:00",
    author: SAM,
    platforms: ["Crunchyroll"],
    tags: ["Anime", "Sports"],
    tldr_answer: "Watch it. Starlight Relay's twelve episodes have the best race animation of the season and a cast you'll actually miss.",
    review_meta: {
      score_100: 88,
      verdict_label: "Buy",
      verdict_sentence: "Every race is animated like a finale, and the quiet episodes land just as hard.",
      the_good: ["Stunning race sequences", "Grounded, likeable team", "Great opening theme"],
      the_bad: ["Episode 7 is a recap in disguise", "Rival team underwritten"],
      platform_tested: "Crunchyroll (1080p, sub)",
      hours_played: 5,
      human_approved: true,
      item_name: "Starlight Relay: Season 1",
      critic_avg: 85,
      community_avg: 91,
    },
    body_md: `## Do I need to like sports anime?

No. The races are the spectacle, but the show is about the team.`,
  }),

  /* ── GUIDES ───────────────────────────────────────────────────────────── */
  seed({
    title: "Ironvale: Echoes — all 12 Relic locations (and the order to get them)",
    slug: "ironvale-echoes-relic-locations",
    category: "guide",
    status: "published",
    source_tier: "first_party_official",
    primary_source_name: "Ironvale: Echoes in-game codex + patch 1.03 notes",
    primary_source_url: "https://blog.ironvale.example/echoes/patch-1-03",
    published_at: "2026-11-24T12:00:00+11:00",
    updated_at: "2026-11-26T08:00:00+11:00",
    author: MIA,
    platforms: ["PS5", "Xbox Series X|S", "PC"],
    tags: ["Ironvale", "Collectibles"],
    tldr_answer:
      "There are 12 Relics. Get the four in the Ashen Reach first (they're missable before Chapter 6), then the rest in any order. All 12 unlock the Echo-Forged armour set.",
    guide_meta: {
      estimated_time: "3–4 hours",
      difficulty: "Medium",
      steps: [
        { title: "Relic of Cinders — Ashen Reach, collapsed chapel", body: "Climb the bell rope behind the altar. The relic sits on the rafters. **Missable** once Chapter 6 starts." },
        { title: "Relic of Thorns — Ashen Reach, briar maze", body: "Follow the blue-flowered path; take every left turn. Guarded by a mini-boss." },
        { title: "Relic of Silence — Ashen Reach, sunken library", body: "Drain the library using the valve on the upper floor, then dive the central shaft." },
        { title: "Relic of Ash — Ashen Reach, the Warden's arena", body: "Dropped by the Warden boss. If you've already beaten the Warden, it's in the arena's east alcove." , spoiler: true },
        { title: "Relics 5–8 — Glasswater Coast", body: "Lighthouse summit, the smuggler's cave (low tide only), the shipwreck hold, and the tidal shrine." },
        { title: "Relics 9–12 — The Hollow Spire", body: "One per floor of the Spire. The final one requires the Echo key from the true-ending path.", spoiler: true },
      ],
      checklist: [
        "Relic of Cinders",
        "Relic of Thorns",
        "Relic of Silence",
        "Relic of Ash",
        "Lighthouse Relic",
        "Smuggler's Relic",
        "Shipwreck Relic",
        "Tidal Relic",
        "Spire Relic I",
        "Spire Relic II",
        "Spire Relic III",
        "Spire Relic IV",
      ],
    },
    body_md: `## Which relics are missable?

Only the four in the **Ashen Reach**. Patch 1.03 made the rest permanently available.

:::spoiler What does the full set unlock? (late-game spoiler)
The **Echo-Forged** armour set, plus a secret dialogue with the Archivist that hints at DLC.
:::`,
  }),
  seed({
    title: "Kestrel Portable: best settings for battery life and performance",
    slug: "kestrel-portable-best-settings",
    category: "guide",
    status: "published",
    source_tier: "first_party_official",
    primary_source_name: "Kestrel support documentation",
    primary_source_url: "https://support.kestrel-devices.example/performance-modes",
    published_at: "2026-11-25T16:00:00+11:00",
    updated_at: "2026-11-25T16:00:00+11:00",
    author: JORDAN,
    platforms: ["PC"],
    tags: ["Hardware", "Settings"],
    tldr_answer:
      "Set TDP to 15W, cap frame rate at 40fps with the 80Hz screen mode, and turn on FSR Balanced. You'll get roughly 3 hours in most AA games with no visible hit to smoothness.",
    guide_meta: {
      estimated_time: "10 minutes",
      difficulty: "Easy",
      steps: [
        { title: "Update firmware and drivers", body: "Open **Kestrel Hub → System → Updates** and install everything. The November BIOS fixes fan curves." },
        { title: "Set the 80Hz display mode", body: "40fps divides evenly into 80Hz, which gives you a smooth frame pace at much lower power." },
        { title: "Set TDP to 15W", body: "Quick menu → Performance → Custom. Above 18W the gains are tiny and battery life falls off a cliff." },
        { title: "Enable FSR Balanced in-game", body: "On the 1200p screen, Balanced looks near-native at handheld distance." },
      ],
      checklist: ["Firmware updated", "80Hz mode on", "40fps cap set", "TDP 15W", "FSR Balanced"],
    },
    body_md: `## Why 40fps instead of 60?

On handhelds, 40fps at 80Hz feels closer to 60 than to 30, and it uses about a third less power.`,
  }),

  /* ── DEALS ────────────────────────────────────────────────────────────── */
  ...(
    [
      ["ironvale-echoes-jb-hi-fi-deal", "Ironvale: Echoes (PS5) is $69 at JB Hi-Fi", "JB Hi-Fi", "AU", 69, 109.95, "PS5", "https://www.jbhifi.com.au/", "2026-12-02T23:59:00+11:00"],
      ["kestrel-portable-amazon-au-deal", "Kestrel Portable 512 GB is $719 at Amazon AU", "Amazon AU", "AU", 719, 799, "PC handheld", "https://www.amazon.com.au/", "2026-11-30T23:59:00+11:00"],
      ["tidebreaker-big-w-deal", "Tidebreaker (Switch 2) is $54 at Big W", "Big W", "AU", 54, 79, "Switch 2", "https://www.bigw.com.au/", "2026-12-04T23:59:00+11:00"],
      ["dualsense-target-deal", "DualSense controllers are $79 at Target", "Target", "AU", 79, 109, "PS5", "https://www.target.com.au/", "2026-12-01T23:59:00+11:00"],
      ["neon-requiem-steam-deal", "Steam Autumn Sale: Neon Requiem drops to $29.97", "Steam", "Global", 29.97, 59.95, "PC", "https://store.steampowered.com/", "2026-12-03T05:00:00+11:00"],
      ["hollow-crown-boxset-amazon-deal", "The Hollow Crown S1–2 4K box set is $39 at Amazon AU", "Amazon AU", "AU", 39, 79.99, "4K Blu-ray", "https://www.amazon.com.au/", null],
    ] as const
  ).map(([slug, title, retailer, region, price, rrp, platform, url, expires], i) =>
    seed({
      title,
      slug,
      category: "deal",
      vertical: slug.includes("hollow") ? "film_tv" : "games",
      status: "published",
      source_tier: "first_party_official",
      primary_source_name: `${retailer} listing`,
      primary_source_url: url,
      published_at: new Date(Date.parse("2026-11-26T07:00:00+11:00") - i * 3_600_000 * 5).toISOString(),
      updated_at: "2026-11-26T09:30:00+11:00",
      author: JORDAN,
      tldr_answer: `${title}, down from $${rrp} RRP. Price checked against the retailer listing at the time of update.`,
      platforms: [platform],
      deal_meta: { retailer, region, price_aud: price, rrp_aud: rrp, expires_at: expires, affiliate_url: url, platform, product_name: title.replace(/ (is|are) \$.*$/, "").replace(/^Steam Autumn Sale: /, "").replace(/ drops to .*$/, "") },
    }),
  ),

  /* ── HUBS ─────────────────────────────────────────────────────────────── */
  seed({
    title: "Release Calendar: games & shows out this week and beyond",
    slug: "release-calendar",
    category: "hub",
    status: "published",
    source_tier: "first_party_official",
    primary_source_name: "Publisher & platform release announcements",
    primary_source_url: "https://unpatched.example/methodology/release-dates",
    published_at: "2026-11-01T09:00:00+11:00",
    updated_at: "2026-11-26T09:00:00+11:00",
    author: PRIYA,
    tldr_answer: "Every confirmed release date for games and shows, in AU time. We only list dates from first-party sources. Rumoured windows stay off the list.",
    hub_meta: {
      hub_type: "release_calendar",
      entries: [
        { title: "Skyhook Rally", release_date: "2026-11-26", platforms: ["PS5", "Xbox Series X|S", "PC"], studio: "Gearline" },
        { title: "Mosswood Tales", release_date: "2026-11-27", platforms: ["Switch 2"], studio: "Little Lantern" },
        { title: "Orbital Siege: Breach", release_date: "2026-11-28", platforms: ["PC"], studio: "Hardpoint" },
        { title: "Cinderwake (Early Access)", release_date: "2026-11-30", platforms: ["PC"], studio: "Ember Forge" },
        { title: "Tidebreaker (Game Pass)", release_date: "2026-12-02", platforms: ["Xbox Series X|S", "PC"], href: "/reviews/tidebreaker-review" },
        { title: "Paper Kingdoms", release_date: "2026-12-04", platforms: ["PS5", "Switch 2", "PC"], studio: "Foldline" },
        { title: "Velocity Drift 2", release_date: "2026-12-10", platforms: ["PS5", "Xbox Series X|S"], studio: "Apex Lane" },
        { title: "The Hollow Crown S3", release_date: "2027-02-12", platforms: ["Lumen+"], href: "/news/hollow-crown-season-3-premiere-date" },
        { title: "Ironvale: Rising", release_date: "2027-03-19", platforms: ["PS5", "Xbox Series X|S", "PC"], href: "/news/ironvale-rising-delayed-march-2027" },
      ],
    },
  }),
  seed({
    title: "GOTY 2026 Tracker: the highest-rated games of the year",
    slug: "goty-tracker-2026",
    category: "hub",
    status: "published",
    source_tier: "first_party_official",
    primary_source_name: "UNPATCHED.GG review scores",
    primary_source_url: "https://unpatched.example/methodology/scoring",
    published_at: "2026-11-01T09:00:00+11:00",
    updated_at: "2026-11-22T11:00:00+11:00",
    author: MIA,
    tldr_answer: "Ironvale: Echoes leads 2026 at 91. The tracker ranks every game we've reviewed this year and updates whenever a new review goes live.",
    hub_meta: {
      hub_type: "goty_tracker",
      entries: [
        { title: "Ironvale: Echoes", score: 91, platforms: ["PS5", "Xbox Series X|S", "PC"], href: "/reviews/ironvale-echoes-review" },
        { title: "Lanternlight", score: 89, platforms: ["Switch 2", "PC"] },
        { title: "Gridfall Tactics", score: 87, platforms: ["PC"] },
        { title: "Harbour Lights", score: 85, platforms: ["PS5", "PC"] },
        { title: "Skyhook Rally", score: 82, platforms: ["PS5", "Xbox Series X|S", "PC"] },
        { title: "Tidebreaker", score: 74, platforms: ["Switch 2", "PC"], href: "/reviews/tidebreaker-review" },
        { title: "Neon Requiem", score: 48, platforms: ["PC"], href: "/reviews/neon-requiem-review" },
      ],
    },
  }),
  seed({
    title: "Game Index: every game we've scored, filterable by platform",
    slug: "game-index",
    category: "hub",
    status: "published",
    source_tier: "first_party_official",
    primary_source_name: "UNPATCHED.GG review scores",
    primary_source_url: "https://unpatched.example/methodology/scoring",
    published_at: "2026-10-01T09:00:00+11:00",
    updated_at: "2026-11-22T11:00:00+11:00",
    author: MIA,
    tldr_answer: "Filter every UNPATCHED.GG-scored game by platform and minimum score. Scores come only from our own hands-on reviews.",
    hub_meta: {
      hub_type: "game_index",
      entries: [
        { title: "Ironvale: Echoes", score: 91, platforms: ["PS5", "Xbox Series X|S", "PC"], studio: "Ironvale Studios", href: "/reviews/ironvale-echoes-review" },
        { title: "Lanternlight", score: 89, platforms: ["Switch 2", "PC"], studio: "Wickstone" },
        { title: "Gridfall Tactics", score: 87, platforms: ["PC"], studio: "Hexwise" },
        { title: "Harbour Lights", score: 85, platforms: ["PS5", "PC"], studio: "Pier Nine" },
        { title: "Skyhook Rally", score: 82, platforms: ["PS5", "Xbox Series X|S", "PC"], studio: "Gearline" },
        { title: "Mosswood Tales", score: 79, platforms: ["Switch 2"], studio: "Little Lantern" },
        { title: "Tidebreaker", score: 74, platforms: ["Switch 2", "PC"], studio: "Saltglass", href: "/reviews/tidebreaker-review" },
        { title: "Velocity Drift", score: 68, platforms: ["PS5", "Xbox Series X|S"], studio: "Apex Lane" },
        { title: "Neon Requiem", score: 48, platforms: ["PC"], studio: "Static Bloom", href: "/reviews/neon-requiem-review" },
      ],
    },
  }),
  seed({
    title: "Game Pass & PS Plus tracker: what's joining and leaving",
    slug: "game-pass-ps-plus-tracker",
    category: "hub",
    status: "published",
    source_tier: "first_party_official",
    primary_source_name: "Platform holder announcements",
    primary_source_url: "https://news.platform-holder.example/subscriptions",
    published_at: "2026-11-01T09:00:00+11:00",
    updated_at: "2026-11-26T05:00:00+11:00",
    author: JORDAN,
    tldr_answer: "Four games join Game Pass and two join PS Plus in December. Neon Requiem leaves Game Pass on 15 December and Velocity Drift leaves PS Plus Extra on 16 December.",
    hub_meta: {
      hub_type: "subscriptions",
      entries: [
        { title: "Tidebreaker", service: "game_pass", tier: "Ultimate / PC", change: "joining", release_date: "2026-12-02", platforms: ["Xbox Series X|S", "PC"] },
        { title: "Gridfall Tactics", service: "game_pass", tier: "PC", change: "joining", release_date: "2026-12-03", platforms: ["PC"] },
        { title: "Paper Kingdoms", service: "game_pass", tier: "Ultimate", change: "joining", release_date: "2026-12-04", platforms: ["Xbox Series X|S", "PC"] },
        { title: "Harbour Lights", service: "game_pass", tier: "Standard", change: "joining", release_date: "2026-12-09", platforms: ["Xbox Series X|S"] },
        { title: "Neon Requiem", service: "game_pass", tier: "PC", change: "leaving", release_date: "2026-12-15", platforms: ["PC"] },
        { title: "Lanternlight", service: "ps_plus", tier: "Extra", change: "joining", release_date: "2026-12-16", platforms: ["PS5"] },
        { title: "Skyhook Rally", service: "ps_plus", tier: "Essential", change: "joining", release_date: "2026-12-02", platforms: ["PS5"] },
        { title: "Velocity Drift", service: "ps_plus", tier: "Extra", change: "leaving", release_date: "2026-12-16", platforms: ["PS5"] },
      ],
    },
  }),
  seed({
    title: "TV Index: every show we've reviewed",
    slug: "tv-index",
    category: "hub",
    vertical: "film_tv",
    status: "published",
    source_tier: "first_party_official",
    primary_source_name: "UNPATCHED.GG review scores",
    primary_source_url: "https://unpatched.example/methodology/scoring",
    published_at: "2026-10-01T09:00:00+11:00",
    updated_at: "2026-10-30T18:00:00+11:00",
    author: SAM,
    tldr_answer: "Every series UNPATCHED.GG has reviewed, with the streamer and our score.",
    hub_meta: {
      hub_type: "show_index",
      entries: [
        { title: "The Hollow Crown — Season 2", score: 86, platforms: ["Lumen+"], href: "/reviews/hollow-crown-season-2-review" },
        { title: "Low Orbit — Season 1", score: 81, platforms: ["Lumen+"] },
        { title: "Saltwater Saints", score: 72, platforms: ["Free-to-air"] },
      ],
    },
  }),
];
