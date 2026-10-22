import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopExplorer } from "@/features/catalog/shop-explorer";
import { PageHero } from "@/shared/ui/page-hero";
import { LoadingIndicator } from "@/shared/ui/loading-indicator";

export const metadata: Metadata = {
  title: "Shop Herbal Hair Packs, Cleansers & Hair Colour",
  description:
    "Shop six NatureMist botanical powders in 200 g packs: Amla, Hibiscus and Bhringraj for hair packs, Reetha and Shikakai for herbal washes, and Indigo for hair colour.",
  alternates: { canonical: "/shop" },
};

export default function ShopPage() {
  return (
    <main id="main-content">
      <PageHero
        eyebrow="The botanical cabinet"
        title={<><span>Your botanicals.</span><br />Your ritual.</>}
        description="Traditional hair packs, herbal washes and plant-based colour. Explore six botanicals in 200 g packs, as single jars or thoughtfully chosen sets."
        className="max-[900px]:min-h-[250px] max-[900px]:py-10 max-[900px]:pb-6 max-[680px]:min-h-[190px] max-[680px]:py-6 max-[680px]:pb-4"
      />
      <Suspense fallback={<LoadingIndicator page label="Arranging the botanical cabinet…" />}>
        <ShopExplorer />
      </Suspense>
    </main>
  );
}
