import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopExplorer } from "@/features/catalog/components/shop-explorer";

export const metadata: Metadata = {
  title: "Shop Botanical Powders",
  description:
    "Explore six NatureMist botanical powders by ritual goal, from gentle cleansing and conditioning to informed botanical colour.",
  alternates: { canonical: "/shop" },
};

export default function ShopPage() {
  return (
    <main id="main-content">
      <section className="page-hero shop-page-hero">
        <div className="page-hero__inner">
          <p className="eyebrow">The botanical cabinet</p>
          <h1>One ingredient.<br />Your ritual.</h1>
          <p>Explore by botanical, hair feel or the step you want to bring into your routine.</p>
        </div>
      </section>
      <Suspense fallback={<div className="shop-loading">Arranging the botanical cabinet…</div>}>
        <ShopExplorer />
      </Suspense>
    </main>
  );
}
