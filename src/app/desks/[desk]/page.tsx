import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLiveArticles } from "@/lib/store";
import { Listing } from "@/components/CategoryListing";
import type { Vertical } from "@/lib/schema";

export const revalidate = 300;
export const dynamicParams = false;

const DESKS: Record<string, { vertical: Vertical; title: string; intro: string }> = {
  games: { vertical: "games", title: "Games Desk", intro: "News, explainers, reviews and guides for PlayStation, Xbox, Nintendo and PC, sourced first-party wherever possible." },
  "movies-tv": { vertical: "film_tv", title: "Movies & TV", intro: "Premieres, streaming dates, trailers and reviews, with spoilers always flagged up front." },
  anime: { vertical: "anime", title: "Anime", intro: "Season premieres, simulcast schedules, dub news and reviews from studios and licensors." },
};

type Props = { params: Promise<{ desk: string }> };

export function generateStaticParams() {
  return Object.keys(DESKS).map((desk) => ({ desk }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const d = DESKS[(await params).desk];
  return d ? { title: d.title, description: d.intro, alternates: { canonical: `/desks/${(await params).desk}` } } : {};
}

export default async function DeskPage({ params }: Props) {
  const d = DESKS[(await params).desk];
  if (!d) notFound();
  const items = (await getLiveArticles()).filter((a) => a.vertical === d.vertical && a.category !== "deal" && a.category !== "hub");
  return <Listing items={items} title={d.title} intro={d.intro} eyebrow={`Desk · ${items.length} ${items.length === 1 ? "story" : "stories"}`} />;
}
