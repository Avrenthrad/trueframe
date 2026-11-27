import type { Article } from "@/lib/schema";
import type { TocItem } from "@/lib/markdown";
import { JsonLd, articleLdBundle } from "./JsonLd";
import { ArticleHeader } from "./article";
import { TableOfContents } from "./client";

/** Two-column article frame: readable main column + sticky jump-to rail. */
export function ArticleShell({ a, toc, children, rail }: { a: Article; toc: TocItem[]; children: React.ReactNode; rail?: React.ReactNode }) {
  return (
    <article className="up-container pt-6 pb-10 sm:pt-10">
      <JsonLd data={articleLdBundle(a)} />
      <div className="grid gap-10 lg:grid-cols-[minmax(0,760px)_1fr] xl:gap-16">
        <div className="min-w-0 space-y-8">
          <ArticleHeader a={a} />
          {children}
        </div>
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-6">
            <TableOfContents items={toc} />
            {rail}
          </div>
        </aside>
      </div>
    </article>
  );
}
