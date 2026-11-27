import type { Metadata } from "next";
import { CategoryListing } from "@/components/CategoryListing";

export const revalidate = 300;

export const metadata: Metadata = { title: "News", description: "Breaking stories and explainers, every one tagged with how verified it is and linked to its primary source.", alternates: { canonical: "/news" } };

export default function Page() {
  return <CategoryListing category="news" title="News" intro="Breaking stories and explainers, every one tagged with how verified it is and linked to its primary source." />;
}
