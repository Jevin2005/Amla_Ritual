"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { getProduct, products } from "@/domain/catalog/products";
import { ProductJar } from "@/features/catalog/product-jar";
import { useStore } from "@/features/store/store-provider";

export function FeaturedProductSwitcher() {
  const [activeSlug, setActiveSlug] = useState(products[0].slug);
  const { addToCart } = useStore();
  const product = getProduct(activeSlug) ?? products[0];

  return (
    <div
      className="grid min-h-[580px] grid-cols-[0.42fr_0.78fr_0.8fr] overflow-hidden border-y border-[color-mix(in_srgb,var(--family-accent)_22%,transparent)] bg-[color-mix(in_srgb,var(--family-soft)_75%,var(--ivory))] [--family-accent:var(--botanical)] [--family-soft:var(--beige)] [transition:background-color_600ms_var(--ease)] motion-reduce:transition-none max-[1180px]:grid-cols-[0.36fr_0.64fr_0.8fr] max-[900px]:min-h-0 max-[900px]:grid-cols-[minmax(170px,0.38fr)_minmax(0,0.62fr)] max-[680px]:grid-cols-1"
      style={{
        "--family-accent": product.accent,
        "--family-soft": product.accentSoft,
      } as CSSProperties}
    >
      <div
        className="flex flex-col justify-center border-r border-[color-mix(in_srgb,var(--family-accent)_24%,transparent)] py-[26px] pl-7 max-[900px]:min-h-[420px] max-[900px]:pl-4 max-[680px]:min-h-0 max-[680px]:flex-row max-[680px]:justify-start max-[680px]:overflow-x-auto max-[680px]:border-r-0 max-[680px]:border-b max-[680px]:border-b-[var(--line)] max-[680px]:p-0 max-[680px]:[scroll-snap-type:x_mandatory]"
        role="tablist"
        aria-label="Choose a botanical"
      >
        {products.map((item) => (
          <button
            key={item.slug}
            type="button"
            role="tab"
            aria-selected={item.slug === product.slug}
            className={`flex min-h-[62px] items-center gap-[18px] border-b border-[color-mix(in_srgb,var(--family-accent)_17%,transparent)] bg-transparent pr-3 text-left [font-family:var(--font-display)] text-[1.15rem] [transition:color_250ms_ease,padding_250ms_ease] motion-reduce:transition-none hover:pl-[22px] hover:text-[var(--family-accent)] max-[900px]:gap-3 max-[900px]:text-[1.05rem] max-[680px]:min-w-[140px] max-[680px]:pr-4 max-[680px]:text-[1.1rem] max-[680px]:[scroll-snap-align:start] max-[680px]:hover:pl-4 ${
              item.slug === product.slug
                ? "pl-[22px] text-[var(--family-accent)] max-[680px]:pl-4"
                : "pl-3 [color:color-mix(in_srgb,var(--family-accent)_50%,var(--muted))] max-[680px]:pl-4"
            }`}
            onClick={() => setActiveSlug(item.slug)}
          >
            <span className="[font-family:var(--font-sans)] text-[0.55rem]">
              {item.collectionNumber}
            </span>
            {item.name.replace(" Powder", "")}
          </button>
        ))}
      </div>
      <div
        className="relative flex items-center justify-center overflow-hidden max-[900px]:min-h-[420px] max-[680px]:min-h-[380px]"
        role="tabpanel"
      >
        <span
          className="absolute aspect-square w-[min(82%,400px)] rounded-full border border-[color-mix(in_srgb,var(--family-accent)_28%,transparent)] before:absolute before:inset-[11%] before:rounded-full before:border before:border-[color-mix(in_srgb,var(--family-accent)_18%,transparent)] before:content-[''] after:absolute after:inset-[24%] after:rounded-full after:border after:border-[color-mix(in_srgb,var(--family-accent)_18%,transparent)] after:content-['']"
          aria-hidden="true"
        />
        <ProductJar
          key={product.slug}
          product={product}
          size="large"
          className="z-[2] [animation:product-enter_650ms_var(--ease),jar-float_5s_650ms_ease-in-out_infinite] max-[900px]:[transform:scale(0.92)] max-[680px]:[transform:scale(0.82)] motion-reduce:animate-none"
        />
      </div>
      <div className="flex flex-col justify-center px-[clamp(34px,3.8vw,52px)] py-[clamp(46px,4.5vw,62px)] max-[900px]:col-span-full max-[900px]:border-t max-[900px]:border-[var(--line)] max-[900px]:p-10 max-[680px]:col-auto max-[680px]:px-[25px] max-[680px]:py-[36px]">
        <p className="mb-4 text-[0.68rem] leading-[1.3] font-bold tracking-[0.2em] text-[var(--family-accent)] uppercase">
          Ritual {product.collectionNumber}
        </p>
        <h3 className="m-0 [color:var(--forest)] [font-family:var(--font-display)] text-[clamp(3.1rem,4.4vw,4.8rem)] leading-[0.94] font-normal tracking-[-0.055em] max-[680px]:text-[clamp(3rem,14vw,3.7rem)]">
          {product.name}
        </h3>
        <p className="[color:var(--muted)] text-[clamp(1.02rem,1.3vw,1.2rem)] leading-[1.75]">
          {product.shortDescription}
        </p>
        <ul className="my-[20px_28px] list-none p-0">
          {product.benefits.slice(0, 3).map((benefit) => (
            <li
              className="border-b border-[color-mix(in_srgb,var(--family-accent)_18%,transparent)] py-[10px] pl-[22px] text-[0.78rem] [color:var(--muted)] before:-ml-[22px] before:mr-[13px] before:text-[var(--family-accent)] before:content-['○']"
              key={benefit}
            >
              {benefit}
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between gap-[15px]">
          <Link
            className="inline-flex items-center gap-[14px] border-b border-[var(--forest)] pb-[5px] text-[0.76rem] font-bold tracking-[0.08em] text-[var(--forest)] uppercase [transition:gap_260ms_var(--ease)] motion-reduce:transition-none hover:gap-[22px]"
            href={`/shop/${product.slug}`}
          >
            View the ritual <span aria-hidden="true">↗</span>
          </Link>
          <button
            className="grid size-[46px] shrink-0 place-items-center rounded-full border border-[var(--forest)] bg-[var(--forest)] text-[1.3rem] text-[var(--paper)] [--product-accent:var(--forest)] [transition:background_260ms_ease,color_260ms_ease,transform_260ms_ease] motion-reduce:transition-none hover:bg-[var(--forest)] hover:text-[var(--paper)] hover:[transform:rotate(90deg)]"
            type="button"
            onClick={() => addToCart(product.slug)}
          >
            <span className="sr-only">Add {product.name} to bag</span>
            <span aria-hidden="true">＋</span>
          </button>
        </div>
      </div>
    </div>
  );
}
