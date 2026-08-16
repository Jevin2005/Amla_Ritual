"use client";

import {
  bundles,
  formatCurrency,
  getBundleProducts,
} from "@/domain/catalog/products";
import { ProductJar } from "@/features/catalog/product-jar";
import { useStore } from "@/features/store/store-provider";

export function BundleCards() {
  const { addManyToCart } = useStore();
  const bundleBackgrounds = ["bg-[#d9dfc7]", "bg-[#e2ccc4]", "bg-[#c8d0c2]"];

  return (
    <div className="mt-[clamp(52px,5vw,68px)] grid grid-cols-3 gap-[clamp(14px,1.6vw,22px)] max-[900px]:grid-cols-1">
      {bundles.map((bundle, index) => {
        const bundleProducts = getBundleProducts(bundle.slugs);
        const total = bundleProducts.reduce((sum, product) => sum + product.pricePaise, 0);
        return (
          <article
            className="flex h-full flex-col overflow-hidden bg-[var(--paper)] ring-1 ring-[var(--line)] max-[900px]:grid max-[900px]:grid-cols-2 max-[680px]:block"
            key={bundle.id}
          >
            <div
              className={`relative flex h-[320px] items-end justify-center pb-[30px] ${bundleBackgrounds[index]} max-[900px]:h-auto max-[900px]:min-h-[320px] max-[680px]:h-[290px] max-[680px]:min-h-0`}
              aria-hidden="true"
            >
              {bundleProducts.slice(0, 4).map((product, productIndex) => (
                <ProductJar
                  key={product.slug}
                  product={product}
                  size="small"
                  decorative
                  className={`mx-[-9px] max-[1180px]:mx-[-15px] ${
                    productIndex % 2 === 1
                      ? "[transform:translateY(-14px)] max-[1180px]:[transform:translateY(-12px)_scale(0.88)]"
                      : "max-[1180px]:[transform:scale(0.88)]"
                  }`}
                />
              ))}
              {bundleProducts.length > 4 && (
                <span className="ml-[5px] grid size-[46px] self-center rounded-full bg-[var(--forest)] text-[0.72rem] text-[var(--paper)] [place-items:center]">
                  +{bundleProducts.length - 4}
                </span>
              )}
            </div>
            <div className="flex flex-1 flex-col px-[30px] pt-7 pb-8 max-[680px]:px-6 max-[680px]:pt-[26px] max-[680px]:pb-[30px]">
              <p className="mb-4 text-[0.68rem] leading-[1.3] font-bold tracking-[0.2em] text-[var(--botanical)] uppercase">
                Ritual set {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="m-0 [color:var(--forest)] [font-family:var(--font-display)] text-[clamp(2rem,3vw,3.1rem)] leading-[0.98] font-normal tracking-[-0.045em]">
                {bundle.name}
              </h3>
              <p className="min-h-[50px] text-[0.78rem] [color:var(--muted)]">
                {bundle.description}
              </p>
              <div className="my-[22px] grid">
                <span className="[color:var(--forest)] [font-family:var(--font-display)] text-[1.3rem]">
                  {formatCurrency(total)}
                </span>
                <small className="text-[0.55rem] tracking-[0.08em] text-[var(--muted)] uppercase">
                  Combined preview price
                </small>
              </div>
              <button
                className="mt-auto inline-flex min-h-[50px] items-center justify-center gap-[22px] border border-transparent bg-[var(--forest)] px-6 py-[13px] text-[0.72rem] leading-none font-bold tracking-[0.12em] text-[var(--paper)] uppercase [transition:transform_350ms_var(--ease),background-color_350ms_var(--ease),color_350ms_var(--ease),border-color_350ms_var(--ease)] motion-reduce:transition-none hover:bg-[var(--forest-dark)] hover:[transform:translateY(-2px)]"
                type="button"
                onClick={() => addManyToCart(bundle.slugs)}
              >
                Add the ritual <span aria-hidden="true">↗</span>
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
