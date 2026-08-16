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
      <section className="grid min-h-[430px] items-end bg-[radial-gradient(circle_at_82%_30%,rgba(167,201,67,0.18),transparent_28%),var(--ivory-deep)] pb-[70px] pt-[95px] max-[680px]:min-h-[350px] max-[680px]:pb-[52px] max-[680px]:pt-[72px]">
        <div className="mx-auto w-full max-w-[1440px] px-[clamp(24px,5vw,72px)] max-[680px]:px-5">
          <div className="max-w-[820px]">
            <p className="mb-4 text-[0.68rem] font-bold uppercase leading-[1.3] tracking-[0.2em] text-[var(--botanical)]">The botanical cabinet</p>
            <h1 className="m-0 max-w-[14ch] font-serif text-[clamp(3.2rem,5vw,6.25rem)] font-normal leading-[0.96] tracking-[-0.055em] text-[var(--forest)] text-balance max-[680px]:text-[clamp(2.9rem,14vw,4.5rem)]">One ingredient.<br />Your ritual.</h1>
            <p className="mb-0 mt-7 max-w-[620px] text-base leading-[1.7] text-[var(--muted)] max-[680px]:mt-5 max-[680px]:text-[0.94rem]">Explore by botanical, hair feel or the step you want to bring into your routine.</p>
          </div>
        </div>
      </section>
      <Suspense fallback={<div className="mx-auto grid min-h-[420px] w-full max-w-[1440px] place-items-center bg-[var(--paper)] px-6 py-[100px] text-center text-[var(--muted)]">Arranging the botanical cabinet&hellip;</div>}>
        <ShopExplorer />
      </Suspense>
    </main>
  );
}
