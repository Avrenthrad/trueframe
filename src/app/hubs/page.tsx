import type { Metadata } from "next";
import { CategoryListing } from "@/components/CategoryListing";

export const revalidate = 300;

export const metadata: Metadata = { title: "Hubs & Trackers", description: "Release calendars, GOTY tracker, game index and subscription trackers. Filter instantly.", alternates: { canonical: "/hubs" } };

export default function Page() {
  return <CategoryListing category="hub" title="Hubs & Trackers" intro="Release calendars, GOTY tracker, game index and subscription trackers. Filter instantly." />;
}
