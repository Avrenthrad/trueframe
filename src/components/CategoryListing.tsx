import type { Category } from "@/lib/schema";
import { getLiveArticles } from "@/lib/store";
import { LeadCard, RowCard } from "./cards";

export async function CategoryListing({ category, title, intro }: { category: Category; title: string; intro: string }) {
  const items = (await getLiveArticles()).filter((a) => a.category === category);
  const [first, ...rest] = items;
  return (
    <div className="tf-container space-y-8 pt-8 pb-10">
      <header className="space-y-2 border-b border-line pb-6">
        <p className="tf-eyebrow">{items.length} {items.length === 1 ? "story" : "stories"}</p>
        <h1 className="text-4xl font-bold sm:text-5xl">{title}</h1>
        <p className="max-w-[62ch] text-muted">{intro}</p>
      </header>
      {first ? (
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <LeadCard a={first} />
          <ul className="space-y-1">{rest.slice(0, 3).map((a) => <li key={a.slug}><RowCard a={a} /></li>)}</ul>
        </div>
      ) : (
        <p className="text-muted">Nothing published yet.</p>
      )}
      {rest.length > 3 && <ul className="divide-y divide-line">{rest.slice(3).map((a) => <li key={a.slug}><RowCard a={a} /></li>)}</ul>}
    </div>
  );
}
