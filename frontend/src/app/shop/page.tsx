import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopExplorer } from "@/features/catalog/shop-explorer";

export const metadata: Metadata = {
  title: "Shop Botanical Powders",
  description:
    "Explore six NatureMist botanical powders by ritual goal, from gentle cleansing and conditioning to informed botanical colour.",
  alternates: { canonical: "/shop" },
};

export default function ShopPage() {
  return (
    <main id="main-content">
      <section className="grid min-h-[430px] items-end bg-[radial-gradient(circle_at_82%_30%,rgba(167,201,67,0.18),transparent_28%),var(--ivory-deep)] px-[clamp(25px,7vw,110px)] pt-[95px] pb-[70px] max-[680px]:min-h-[360px] max-[680px]:px-5 max-[680px]:pt-[75px] max-[680px]:pb-[55px]">
        <div className="max-w-[820px]">
          <p className="mb-4 text-[0.68rem] leading-[1.3] font-bold tracking-[0.2em] text-[var(--botanical)] uppercase">The botanical cabinet</p>
          <h1 className="m-0 font-serif text-[clamp(3.2rem,5vw,6.5rem)] leading-[0.96] font-normal tracking-[-0.055em] text-[var(--forest)] max-[680px]:text-[clamp(3rem,15vw,4.8rem)]">One ingredient.<br />Your ritual.</h1>
          <p className="mt-7 mb-0 max-w-[620px] text-base text-[var(--muted)]">Explore by botanical, hair feel or the step you want to bring into your routine.</p>
        </div>
      </section>
      <Suspense fallback={<div className="grid min-h-[420px] place-items-center bg-[var(--paper)] px-[25px] py-[100px] text-[var(--muted)]">Arranging the botanical cabinetâ€¦</div>}>
        <ShopExplorer />
      </Suspense>
    </main>
  );
}
