import type { Metadata } from "next";
import { CategoryListing } from "@/components/CategoryListing";

export const revalidate = 300;

export const metadata: Metadata = { title: "Reviews", description: "Scored 0–100 by humans who finished the game. Buy, Wait or Skip, with the reasons up front.", alternates: { canonical: "/reviews" } };

export default function Page() {
  return <CategoryListing category="review" title="Reviews" intro="Scored 0–100 by humans who finished the game. Buy, Wait or Skip, with the reasons up front." />;
}
