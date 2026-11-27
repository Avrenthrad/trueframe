import type { Metadata } from "next";
import { CategoryListing } from "@/components/CategoryListing";

export const revalidate = 300;

export const metadata: Metadata = { title: "Guides", description: "Step-by-step help, with collapsible spoilers and checklists you can copy.", alternates: { canonical: "/guides" } };

export default function Page() {
  return <CategoryListing category="guide" title="Guides" intro="Step-by-step help, with collapsible spoilers and checklists you can copy." />;
}
