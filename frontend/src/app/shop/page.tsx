import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopExplorer } from "@/features/catalog/shop-explorer";
import { PageHero } from "@/shared/ui/page-hero";
import { LoadingIndicator } from "@/shared/ui/loading-indicator";

export const metadata: Metadata = {
  title: "Shop Botanical Powders & Combos",
  description:
    "Explore NatureMist individual botanical powders and thoughtfully paired combos in one collection. Filter by product type, care goal or ritual step.",
  alternates: { canonical: "/shop" },
};

export default function ShopPage() {
  return (
    <main id="main-content">
      <PageHero
        eyebrow="The botanical cabinet"
        title={<><span>Your botanicals.</span><br />Your ritual.</>}
        description="A single jar or a thoughtful pairing. Explore every botanical and combo together, then find the care that fits your routine."
        className="max-[900px]:min-h-[250px] max-[900px]:py-10 max-[900px]:pb-6 max-[680px]:min-h-[190px] max-[680px]:py-6 max-[680px]:pb-4"
      />
      <Suspense fallback={<LoadingIndicator page label="Arranging the botanical cabinet…" />}>
        <ShopExplorer />
      </Suspense>
    </main>
  );
}
