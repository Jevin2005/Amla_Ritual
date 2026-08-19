import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopExplorer } from "@/features/catalog/shop-explorer";
import { PageHero } from "@/shared/ui/page-hero";

export const metadata: Metadata = {
  title: "Shop Botanical Powders",
  description:
    "Explore six NatureMist botanical powders by ritual goal, from gentle cleansing and conditioning to informed botanical colour.",
  alternates: { canonical: "/shop" },
};

export default function ShopPage() {
  return (
    <main id="main-content">
      <PageHero
        eyebrow="The botanical cabinet"
        title={<><span>One ingredient.</span><br />Your ritual.</>}
        description="Explore by botanical, hair feel or the step you want to bring into your routine."
      />
      <Suspense fallback={<div className="mx-auto grid min-h-[420px] w-full max-w-[1440px] place-items-center bg-[var(--paper)] px-6 py-[100px] text-center text-[var(--muted)]">Arranging the botanical cabinet&hellip;</div>}>
        <ShopExplorer />
      </Suspense>
    </main>
  );
}
