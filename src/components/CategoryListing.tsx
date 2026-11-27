import type { Article, Category } from "@/lib/schema";
import { getLiveArticles } from "@/lib/store";
import { LeadCard, RowCard, SecondaryCard } from "./cards";

export function Listing({ items, title, intro, eyebrow }: { items: Article[]; title: string; intro: string; eyebrow?: string }) {
  const [first, ...rest] = items;
  return (
    <div className="up-container pt-8 pb-10">
      <header className="up-masthead space-y-2 border-b border-line pb-6">
        <p className="up-desk">{eyebrow ?? `${items.length} ${items.length === 1 ? "story" : "stories"}`}</p>
        <h1 className="text-4xl font-bold uppercase sm:text-6xl">{title}</h1>
        <p className="max-w-[62ch] text-muted">{intro}</p>
      </header>
      {first ? (
        <div className="grid grid-cols-1 border-b border-line py-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:divide-x lg:divide-line">
          <div className="lg:pr-6"><LeadCard a={first} /></div>
          <div className="border-t border-line pt-6 lg:border-t-0 lg:pt-0 lg:pl-6">
            {rest.slice(0, 3).map((a) => <SecondaryCard key={a.slug} a={a} />)}
          </div>
        </div>
      ) : (
        <p className="py-10 text-muted">Nothing filed on this desk yet.</p>
      )}
      {rest.length > 3 && <ul className="divide-y divide-line">{rest.slice(3).map((a) => <li key={a.slug}><RowCard a={a} /></li>)}</ul>}
    </div>
  );
}

export async function CategoryListing({ category, title, intro }: { category: Category; title: string; intro: string }) {
  const items = (await getLiveArticles()).filter((a) => a.category === category);
  return <Listing items={items} title={title} intro={intro} />;
}
