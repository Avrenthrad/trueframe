/**
 * Upsert the demo seed articles into Supabase.
 * Usage: SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… npm run seed:supabase
 * Safe to re-run (upserts on slug). Delete the demo rows before launch:
 *   delete from articles where origin = 'seed';
 */
import { createClient } from "@supabase/supabase-js";
import { SEED_ARTICLES } from "../src/lib/seed";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY first.");
  process.exit(1);
}

async function main() {
  const sb = createClient(url!, key!, { auth: { persistSession: false } });
  // Seed ids are human-readable ("seed-…"); let Postgres mint UUIDs instead.
  const rows = SEED_ARTICLES.map(({ id: _id, ...rest }) => rest);
  const { error, count } = await sb.from("articles").upsert(rows, { onConflict: "slug", count: "exact" });
  if (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }
  console.log(`Seeded ${count ?? rows.length} articles.`);
}

main();
