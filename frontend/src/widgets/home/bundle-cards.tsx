"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { formatCurrency } from "@/domain/catalog/products";
import { useStore } from "@/features/store/store-provider";

export function BundleCards() {
  const { products, bundles, addManyToCart } = useStore();
  const bundleAccents = [
    { accent: "#3a6946", soft: "#dde5cc", bg: "bg-[#e8eee0]" },
    { accent: "#8c564b", soft: "#ebdcd3", bg: "bg-[#f4ebe6]" },
    { accent: "#2d5a43", soft: "#d7dfd6", bg: "bg-[#e4ede6]" },
  ];

  return (
    <div className="mt-8 grid grid-cols-3 gap-[clamp(16px,1.8vw,26px)] max-[860px]:grid-cols-2 max-[680px]:grid-cols-2 max-[680px]:gap-2.5 max-[420px]:gap-2">
      {bundles.map((bundle, index) => {
        const bundleProducts = bundle.slugs
          .map((slug) => products.find((product) => product.slug === slug))
          .filter((product) => product !== undefined);
        const total = bundleProducts.reduce(
          (sum, product) => sum + product.pricePaise,
          0
        );
        const currencyCode = bundleProducts[0]?.currencyCode || "INR";
        const isAvailable =
          bundleProducts.length > 0 &&
          bundleProducts.every((product) => product.availableForSale !== false);

        const accentConfig = bundleAccents[index % bundleAccents.length];
        const style = {
          "--product-accent": accentConfig.accent,
          "--product-soft": accentConfig.soft,
        } as CSSProperties;

        return (
          <article
            key={bundle.id}
            className="group/card @container relative flex h-full flex-col overflow-hidden rounded-[var(--radius-md)] bg-[var(--paper)] ring-1 ring-[var(--line)] transition-[transform,box-shadow,ring-color] duration-[420ms] ease-[var(--ease)] hover:-translate-y-1.5 hover:shadow-[var(--shadow-float)] hover:ring-[color-mix(in_srgb,var(--product-accent)_34%,transparent)] max-[680px]:rounded-lg"
            style={style}
          >
            {/* ── Photo Stage (Exact aspect-square as ProductCard) ── */}
            <div
              className={`relative aspect-square w-full flex-none overflow-hidden ${accentConfig.bg} flex items-center justify-center p-3 max-[680px]:p-2`}
            >
              {/* Top-Right Set Badge */}
              <span className="absolute top-3 right-3 z-10 rounded-full border border-black/5 bg-white/90 px-2 py-0.5 text-[0.52rem] font-bold uppercase tracking-wider text-[var(--forest)] shadow-xs backdrop-blur-xs max-[680px]:top-2 max-[680px]:right-2 max-[680px]:text-[0.42rem] max-[680px]:px-1.5">
                Set of {bundleProducts.length}
              </span>

              {/* Overlapping Combo Photo Arrangement */}
              <div className="relative flex size-full items-center justify-center">
                {bundleProducts.slice(0, 3).map((product, productIndex) => {
                  const offsets = [
                    "z-10 -mr-4 max-[680px]:-mr-3",
                    "z-20 -translate-y-2 scale-105 shadow-md",
                    "z-10 -ml-4 max-[680px]:-ml-3",
                  ];
                  return (
                    <div
                      key={product.slug}
                      className={`relative size-[58%] overflow-hidden rounded-xl border border-white/80 bg-white/70 shadow-sm transition-transform duration-300 group-hover/card:scale-105 max-[680px]:rounded-lg ${
                        offsets[productIndex % offsets.length]
                      }`}
                    >
                      <Image
                        src={
                          product.featuredImage?.url ||
                          "/images/amla-powder.jpg"
                        }
                        alt={product.name}
                        fill
                        sizes="(max-width: 680px) 35vw, (max-width: 900px) 30vw, 22vw"
                        className="size-full object-cover object-center"
                      />
                    </div>
                  );
                })}

                {/* Extra badge if more than 3 products */}
                {bundleProducts.length > 3 && (
                  <span className="absolute right-1 bottom-1 z-30 grid size-6 place-items-center rounded-full bg-[var(--forest)] text-[0.52rem] font-bold text-white shadow-md max-[680px]:size-5 max-[680px]:text-[0.46rem]">
                    +{bundleProducts.length - 3}
                  </span>
                )}
              </div>
            </div>

            {/* ── Info Area (Identical typography and padding to ProductCard) ── */}
            <div className="flex flex-1 flex-col border-t border-[var(--line)] px-5 pt-4 pb-5 max-[680px]:px-3 max-[680px]:pt-2.5 max-[680px]:pb-3 max-[420px]:px-2.5 max-[420px]:py-2">
              <p className="mb-1 text-[0.62rem] font-bold tracking-[0.14em] text-[var(--product-accent)] uppercase max-[680px]:mb-0.5 max-[680px]:text-[0.46rem] max-[680px]:tracking-[0.08em]">
                Curated Ritual Set
              </p>

              <h3 className="mb-1 block [font-family:var(--font-display)] text-[clamp(1.45rem,1.75vw,1.95rem)] leading-[1.05] tracking-[-0.03em] text-[var(--forest)] transition-colors duration-200 hover:text-[var(--product-accent)] max-[680px]:mb-0.5 max-[680px]:text-[1.02rem] max-[420px]:text-[0.92rem]">
                {bundle.name}
              </h3>

              <p className="mb-0 text-[0.74rem] leading-[1.5] text-[var(--muted)] max-[680px]:line-clamp-1 max-[680px]:text-[0.56rem] max-[680px]:leading-[1.25] max-[420px]:text-[0.5rem]">
                {bundleProducts
                  .map((product) => product.name.replace(" Powder", ""))
                  .join(" · ")}
              </p>

              <div className="mt-auto pt-4 max-[680px]:pt-2">
                <div className="flex items-center justify-between gap-2 border-t border-[var(--line)] pt-3 max-[680px]:pt-2">
                  <div>
                    <span className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                      <span className="[font-family:var(--font-display)] text-[1.22rem] leading-none text-[var(--forest)] max-[680px]:text-[0.95rem] max-[420px]:text-[0.88rem]">
                        {formatCurrency(total, currencyCode)}
                      </span>
                    </span>
                    <span className="mt-0.5 block text-[0.55rem] font-bold tracking-[0.08em] text-[var(--muted)] uppercase max-[680px]:text-[0.44rem]">
                      {isAvailable ? "Complete Set" : "Sold out"}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="grid size-10 place-items-center rounded-full border border-[var(--forest)] bg-[var(--forest)] text-[1.15rem] text-white shadow-[0_6px_18px_color-mix(in_srgb,var(--forest)_24%,transparent)] transition-[background,color,transform,box-shadow] duration-[240ms] ease-[ease] hover:-translate-y-0.5 hover:bg-[var(--forest-dark)] hover:shadow-[0_10px_28px_rgba(21,59,45,0.2)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 max-[680px]:size-7 max-[680px]:text-[0.85rem] max-[420px]:size-6.5 max-[420px]:text-[0.75rem]"
                    onClick={() =>
                      addManyToCart(
                        bundleProducts.map((product) => product.slug)
                      )
                    }
                    disabled={!isAvailable}
                    aria-label={`Add ${bundle.name} to bag`}
                  >
                    <span aria-hidden="true">＋</span>
                  </button>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}


