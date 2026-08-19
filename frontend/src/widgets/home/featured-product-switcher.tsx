"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { ProductJar } from "@/features/catalog/product-jar";
import { useStore } from "@/features/store/store-provider";

export function FeaturedProductSwitcher() {
  const { products, addToCart } = useStore();
  const [activeSlug, setActiveSlug] = useState(products[0]?.slug ?? "");
  const product =
    products.find((item) => item.slug === activeSlug) ?? products[0];

  if (!product) return null;

  return (
    <div
      className="grid min-h-[580px] min-w-0 grid-cols-[0.42fr_0.78fr_0.8fr] overflow-hidden rounded-[var(--radius-lg)] border border-[color-mix(in_srgb,var(--family-accent)_22%,transparent)] bg-[color-mix(in_srgb,var(--family-soft)_75%,var(--ivory))] shadow-[var(--shadow-soft)] [--family-accent:var(--botanical)] [--family-soft:var(--beige)] [transition:background-color_600ms_var(--ease),border-color_600ms_var(--ease)] motion-reduce:transition-none max-[1180px]:grid-cols-[minmax(145px,0.36fr)_minmax(220px,0.64fr)_minmax(220px,0.8fr)] max-[900px]:min-h-[520px] max-[900px]:grid-cols-[minmax(130px,0.35fr)_minmax(190px,0.62fr)_minmax(205px,0.82fr)] max-[680px]:min-h-0 max-[680px]:grid-cols-1 max-[680px]:rounded-[var(--radius-md)]"
      style={{
        "--family-accent": product.accent,
        "--family-soft": product.accentSoft,
      } as CSSProperties}
    >
      <div
        className="flex flex-col justify-center border-r border-[color-mix(in_srgb,var(--family-accent)_24%,transparent)] py-[26px] pl-7 max-[900px]:py-5 max-[900px]:pl-3 max-[680px]:flex-row max-[680px]:justify-start max-[680px]:overflow-x-auto max-[680px]:overscroll-x-contain max-[680px]:border-r-0 max-[680px]:border-b max-[680px]:border-b-[var(--line)] max-[680px]:p-0 max-[680px]:[scroll-snap-type:x_mandatory] max-[680px]:[scrollbar-width:none] max-[680px]:[&::-webkit-scrollbar]:hidden"
        role="group"
        aria-label="Choose a botanical"
      >
        {products.map((item) => (
          <button
            key={item.slug}
            type="button"
            aria-pressed={item.slug === product.slug}
            className={`flex min-h-[62px] items-center gap-[18px] border-b border-[color-mix(in_srgb,var(--family-accent)_17%,transparent)] bg-transparent pr-3 text-left [font-family:var(--font-display)] text-[1.15rem] [transition:color_250ms_ease,padding_250ms_ease,background-color_250ms_ease] motion-reduce:transition-none hover:bg-white/35 hover:pl-[22px] hover:text-[var(--family-accent)] max-[900px]:min-h-[58px] max-[900px]:gap-3 max-[900px]:text-[1rem] max-[900px]:hover:pl-4 max-[680px]:min-w-[140px] max-[680px]:pr-4 max-[680px]:text-[1.1rem] max-[680px]:[scroll-snap-align:start] max-[680px]:hover:pl-4 ${
              item.slug === product.slug
                ? "pl-[22px] text-[var(--family-accent)] max-[900px]:pl-3 max-[680px]:pl-4"
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
        className="relative flex min-w-0 items-center justify-center overflow-hidden max-[900px]:min-h-[520px] max-[680px]:min-h-[380px]"
      >
        <span
          className="absolute aspect-square w-[min(82%,400px)] rounded-full border border-[color-mix(in_srgb,var(--family-accent)_28%,transparent)] bg-[radial-gradient(circle,rgba(255,255,255,0.52),transparent_64%)] before:absolute before:inset-[11%] before:rounded-full before:border before:border-[color-mix(in_srgb,var(--family-accent)_18%,transparent)] before:content-[''] after:absolute after:inset-[24%] after:rounded-full after:border after:border-[color-mix(in_srgb,var(--family-accent)_18%,transparent)] after:content-['']"
          aria-hidden="true"
        />
        <div
          className="relative z-[2] origin-center scale-100 max-[900px]:scale-[0.74] max-[680px]:scale-[0.82]"
          key={product.slug}
        >
          <ProductJar
            product={product}
            size="large"
            className="[animation:product-enter_650ms_var(--ease),jar-float_5s_650ms_ease-in-out_infinite] motion-reduce:animate-none"
          />
        </div>
      </div>
      <div className="flex min-w-0 flex-col justify-center border-l border-transparent px-[clamp(34px,3.8vw,52px)] py-[clamp(46px,4.5vw,62px)] max-[900px]:border-l-[color-mix(in_srgb,var(--family-accent)_18%,transparent)] max-[900px]:px-5 max-[900px]:py-8 max-[680px]:border-t max-[680px]:border-l-0 max-[680px]:border-[var(--line)] max-[680px]:px-[25px] max-[680px]:py-[36px] max-[430px]:px-5 max-[430px]:py-[30px]">
        <p className="mb-4 text-[0.68rem] leading-[1.3] font-bold tracking-[0.2em] text-[var(--family-accent)] uppercase">
          Ritual {product.collectionNumber}
        </p>
        <h3 className="m-0 [color:var(--forest)] [font-family:var(--font-display)] text-[clamp(3.1rem,4.4vw,4.8rem)] leading-[0.94] font-normal tracking-[-0.055em] max-[900px]:text-[clamp(2.35rem,5vw,3rem)] max-[680px]:text-[clamp(3rem,14vw,3.7rem)]">
          {product.name}
        </h3>
        <p className="[color:var(--muted)] text-[clamp(1.02rem,1.3vw,1.2rem)] leading-[1.75] max-[900px]:text-[0.8rem] max-[900px]:leading-[1.58] max-[680px]:text-base max-[680px]:leading-[1.7]">
          {product.shortDescription}
        </p>
        <ul className="my-[20px_28px] list-none p-0 max-[900px]:my-[14px_20px] max-[680px]:my-[20px_28px]">
          {product.benefits.slice(0, 3).map((benefit) => (
            <li
              className="border-b border-[color-mix(in_srgb,var(--family-accent)_18%,transparent)] py-[10px] pl-[22px] text-[0.78rem] [color:var(--muted)] before:-ml-[22px] before:mr-[13px] before:text-[var(--family-accent)] before:content-['○'] max-[900px]:py-2 max-[900px]:pl-[17px] max-[900px]:text-[0.68rem] max-[900px]:before:-ml-[17px] max-[900px]:before:mr-2 max-[680px]:py-[10px] max-[680px]:pl-[22px] max-[680px]:text-[0.78rem] max-[680px]:before:-ml-[22px] max-[680px]:before:mr-[13px]"
              key={benefit}
            >
              {benefit}
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between gap-[15px]">
          <Link
            className="inline-flex min-h-11 items-center gap-[14px] border-b border-[var(--forest)] text-[0.76rem] font-bold tracking-[0.08em] text-[var(--forest)] uppercase [transition:gap_260ms_var(--ease)] motion-reduce:transition-none hover:gap-[22px]"
            href={`/shop/${product.slug}`}
          >
            View the ritual <span aria-hidden="true">↗</span>
          </Link>
          <button
            className="grid size-12 shrink-0 place-items-center rounded-full border border-[var(--forest)] bg-[var(--forest)] text-[1.3rem] text-[var(--paper)] shadow-[0_10px_24px_rgba(21,59,45,0.18)] [--product-accent:var(--forest)] [transition:background_260ms_ease,color_260ms_ease,transform_260ms_ease] motion-reduce:transition-none hover:bg-[var(--forest-dark)] hover:text-[var(--paper)] hover:[transform:rotate(90deg)] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:transform-none"
            type="button"
            onClick={() => addToCart(product.slug)}
            disabled={product.availableForSale === false}
          >
            <span className="sr-only">
              {product.availableForSale === false
                ? `${product.name} is sold out`
                : `Add ${product.name} to bag`}
            </span>
            <span aria-hidden="true">＋</span>
          </button>
        </div>
      </div>
    </div>
  );
}
