import type { Metadata } from "next";
import { ComboCatalog } from "@/features/catalog/combo-catalog";

export const metadata: Metadata = {
  title: "Botanical Combo Catalog",
  description: "Explore NatureMist botanical combos. Discover the jars in each pairing, compare current prices, and find a ritual to make your own.",
  alternates: { canonical: "/combos" },
};

export default function CombosPage() {
  return (
    <main id="main-content">
      <ComboCatalog />
    </main>
  );
}
