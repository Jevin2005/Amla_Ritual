import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ShopExplorer } from "@/features/catalog/shop-explorer";
import { PageHero } from "@/shared/ui/page-hero";

export const metadata: Metadata = {
  title: "Shop Botanical Powders",
  description:
    "Explore NatureMist botanical powders by ritual goal, from gentle cleansing and conditioning to informed botanical colour.",
  alternates: { canonical: "/shop" },
};

export default function ShopPage() {
  return (
    <main id="main-content">
      <PageHero
        eyebrow="The botanical cabinet"
        title={<><span>One ingredient.</span><br />Your ritual.</>}
        description="Explore by botanical, hair feel or the step you want to bring into your routine."
        className="max-[900px]:min-h-[250px] max-[900px]:py-10 max-[900px]:pb-6 max-[680px]:min-h-[190px] max-[680px]:py-6 max-[680px]:pb-4"
      />
      <nav aria-label="Shop catalogs" className="mx-auto flex w-full max-w-[1440px] flex-wrap gap-2 px-[clamp(18px,4vw,64px)] pb-4 max-[680px]:px-2.5">
        <Link href="/shop" aria-current="page" className="inline-flex min-h-11 items-center rounded-full border border-[var(--forest)] bg-[var(--forest)] px-5 py-2 text-sm font-medium text-[var(--paper)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--forest)]">
          Shop individual powders
        </Link>
        <Link href="/combos" className="inline-flex min-h-11 items-center rounded-full border border-[var(--line)] px-5 py-2 text-sm font-medium text-[var(--forest)] transition-colors hover:border-[var(--forest)] hover:bg-[var(--paper)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--forest)]">
          Shop combos
        </Link>
      </nav>
      <Suspense fallback={<div className="mx-auto grid min-h-[420px] w-full max-w-[1440px] place-items-center bg-[var(--paper)] px-6 py-[100px] text-center text-[var(--muted)]">Arranging the botanical cabinet&hellip;</div>}>
        <ShopExplorer />
      </Suspense>
    </main>
  );
}
