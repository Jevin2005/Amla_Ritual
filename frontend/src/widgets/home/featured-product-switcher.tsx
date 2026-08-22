"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { useStore } from "@/features/store/store-provider";

export function FeaturedProductSwitcher() {
  const { products, addToCart } = useStore();
  const [activeSlug, setActiveSlug] = useState(products[0]?.slug ?? "");
  const product =
    products.find((item) => item.slug === activeSlug) ?? products[0];

  if (!product) return null;

  return (
    <div
      className="relative min-w-0 overflow-hidden rounded-[28px] border border-[color-mix(in_srgb,var(--family-accent)_24%,transparent)] bg-[color-mix(in_srgb,var(--family-soft)_75%,var(--ivory))] shadow-[0_16px_44px_rgba(23,63,42,0.06)] [--family-accent:var(--botanical)] [--family-soft:var(--beige)] transition-[background-color,border-color] duration-500 max-[680px]:rounded-2xl"
      style={{
        "--family-accent": product.accent,
        "--family-soft": product.accentSoft,
      } as CSSProperties}
    >
      {/* ── Mobile View: Horizontal Pill Switcher + Compact 2-Column Showcase Card ── */}
      <div className="hidden max-[680px]:block p-3 max-[440px]:p-2.5">
        {/* Horizontal scrollable pills */}
        <div
          className="mb-2.5 flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="group"
          aria-label="Choose a botanical"
        >
          {products.map((item) => {
            const isSelected = item.slug === product.slug;
            return (
              <button
                key={item.slug}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setActiveSlug(item.slug)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.68rem] font-medium transition-all duration-200 active:scale-95 max-[440px]:px-2.5 max-[440px]:py-1 max-[440px]:text-[0.62rem] ${
                  isSelected
                    ? "bg-[var(--forest)] text-white shadow-sm font-semibold"
                    : "border border-[color-mix(in_srgb,var(--family-accent)_25%,transparent)] bg-white/45 text-[var(--forest)] hover:bg-white/70"
                }`}
              >
                <span>{item.name.replace(" Powder", "")}</span>
              </button>
            );
          })}
        </div>

        {/* 2-Column Side-by-Side Product Card */}
        <div className="grid grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] items-center gap-3 rounded-xl border border-[color-mix(in_srgb,var(--family-accent)_20%,transparent)] bg-white/40 p-2.5 shadow-sm max-[440px]:gap-2 max-[440px]:p-2">
          {/* Left Column: Product Photo */}
          <div className="relative aspect-[0.84] w-full overflow-hidden rounded-lg border border-black/5 bg-white/60 shadow-inner">
            <Image
              src={product.featuredImage?.url || "/images/amla-powder.jpg"}
              alt={product.name}
              fill
              sizes="45vw"
              className="size-full object-cover object-center"
            />
          </div>

          {/* Right Column: Title, concise copy, actions */}
          <div className="flex flex-col justify-between">
            <div>
              <p className="m-0 text-[0.52rem] font-bold uppercase tracking-[0.16em] text-[var(--family-accent)]">
                {product.ritualStep} Ritual
              </p>
              <h3 className="my-0.5 [color:var(--forest)] [font-family:var(--font-display)] text-[1.12rem] font-normal leading-tight max-[440px]:text-[1.02rem]">
                {product.name}
              </h3>
              <p className="my-1 line-clamp-2 text-[0.6rem] leading-[1.3] text-[var(--muted)] max-[440px]:text-[0.55rem]">
                {product.shortDescription}
              </p>

              {/* 2 Key Benefits */}
              <ul className="my-1 list-none p-0">
                {product.benefits.slice(0, 2).map((benefit) => (
                  <li
                    key={benefit}
                    className="flex items-start gap-1 py-0.5 text-[0.54rem] leading-[1.25] text-[var(--muted)] max-[440px]:text-[0.48rem]"
                  >
                    <span className="text-[var(--family-accent)] font-bold">○</span>
                    <span className="line-clamp-1">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions: View the ritual + Add to Bag button */}
            <div className="mt-2 flex items-center justify-between gap-2 pt-1 border-t border-[color-mix(in_srgb,var(--family-accent)_15%,transparent)]">
              <Link
                className="text-[0.58rem] font-bold uppercase tracking-[0.08em] text-[var(--forest)] underline-offset-2 hover:underline"
                href={`/shop/${product.slug}`}
              >
                View Ritual ↗
              </Link>
              <button
                type="button"
                onClick={() => addToCart(product.slug)}
                disabled={product.availableForSale === false}
                className="grid size-7 shrink-0 place-items-center rounded-full bg-[var(--forest)] text-[0.9rem] text-white shadow-sm transition-all hover:bg-[var(--forest-dark)] active:scale-90 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label={`Add ${product.name} to bag`}
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Desktop & Tablet View: 3-Column Split Matching Reference Layout ── */}
      <div className="grid min-h-[560px] grid-cols-[0.4fr_0.8fr_0.8fr] max-[1180px]:grid-cols-[minmax(140px,0.36fr)_minmax(220px,0.64fr)_minmax(220px,0.8fr)] max-[900px]:min-h-[500px] max-[900px]:grid-cols-[minmax(125px,0.35fr)_minmax(190px,0.62fr)_minmax(205px,0.82fr)] max-[680px]:hidden">
        {/* Left Column: Vertical 6 Botanical Tabs */}
        <div
          className="flex flex-col justify-center border-r border-[color-mix(in_srgb,var(--family-accent)_24%,transparent)] py-6 pl-6 max-[900px]:py-4 max-[900px]:pl-3"
          role="group"
          aria-label="Choose a botanical"
        >
          {products.map((item) => {
            const isSelected = item.slug === product.slug;
            return (
              <button
                key={item.slug}
                type="button"
                aria-pressed={isSelected}
                className={`flex min-h-[62px] items-center gap-3.5 border-b border-[color-mix(in_srgb,var(--family-accent)_17%,transparent)] bg-transparent pr-3 text-left [font-family:var(--font-display)] text-[1.12rem] transition-all duration-200 hover:bg-white/35 hover:pl-5 hover:text-[var(--family-accent)] max-[900px]:min-h-[54px] max-[900px]:text-[0.96rem] ${
                  isSelected
                    ? "pl-5 font-medium text-[var(--family-accent)]"
                    : "pl-2.5 [color:color-mix(in_srgb,var(--family-accent)_55%,var(--muted))]"
                }`}
                onClick={() => setActiveSlug(item.slug)}
              >
                <span
                  className="size-2 rounded-full inline-block"
                  style={{ backgroundColor: item.accent }}
                />
                <span>{item.name.replace(" Powder", "")}</span>
              </button>
            );
          })}
        </div>

        {/* Center Column: Full-cover Product Image */}
        <div className="relative flex min-w-0 items-center justify-center overflow-hidden bg-white/20">
          <div
            className="relative size-full min-h-[380px] overflow-hidden"
            key={product.slug}
          >
            <Image
              src={product.featuredImage?.url || "/images/amla-powder.jpg"}
              alt={product.name}
              fill
              sizes="(max-width: 900px) 50vw, 33vw"
              className="size-full object-cover object-center"
            />
          </div>
        </div>

        {/* Right Column: Title, copy, 3 bullets, and action bar */}
        <div className="flex min-w-0 flex-col justify-center border-l border-[color-mix(in_srgb,var(--family-accent)_18%,transparent)] px-[clamp(32px,3.8vw,52px)] py-[clamp(40px,4vw,56px)] max-[900px]:px-5 max-[900px]:py-7">
          <p className="mb-3 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[var(--family-accent)]">
            {product.ritualStep} Ritual
          </p>
          <h3 className="m-0 [color:var(--forest)] [font-family:var(--font-display)] text-[clamp(2.6rem,3.8vw,4.2rem)] font-normal leading-[0.95] tracking-[-0.04em] max-[900px]:text-[2.2rem]">
            {product.name}
          </h3>
          <p className="my-3 text-[clamp(0.95rem,1.2vw,1.1rem)] leading-[1.65] [color:var(--muted)] max-[900px]:text-[0.78rem] max-[900px]:leading-[1.5]">
            {product.shortDescription}
          </p>

          <ul className="my-5 list-none p-0 max-[900px]:my-3">
            {product.benefits.slice(0, 3).map((benefit) => (
              <li
                className="flex items-start gap-2.5 border-b border-[color-mix(in_srgb,var(--family-accent)_18%,transparent)] py-2.5 text-[0.78rem] [color:var(--muted)] max-[900px]:py-1.5 max-[900px]:text-[0.68rem]"
                key={benefit}
              >
                <span className="text-[var(--family-accent)]">○</span>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex items-center justify-between gap-4">
            <Link
              className="inline-flex min-h-11 items-center gap-3 border-b border-[var(--forest)] text-[0.74rem] font-bold uppercase tracking-[0.08em] text-[var(--forest)] transition-[gap] duration-200 hover:gap-5"
              href={`/shop/${product.slug}`}
            >
              View the ritual <span aria-hidden="true">↗</span>
            </Link>
            <button
              className="grid size-12 shrink-0 place-items-center rounded-full bg-[var(--forest)] text-[1.4rem] text-white shadow-[0_10px_24px_rgba(21,59,45,0.18)] transition-all duration-200 hover:bg-[var(--forest-dark)] hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-45"
              type="button"
              onClick={() => addToCart(product.slug)}
              disabled={product.availableForSale === false}
            >
              <span className="sr-only">
                {product.availableForSale === false
                  ? `${product.name} is sold out`
                  : `Add ${product.name} to bag`}
              </span>
              <span aria-hidden="true">+</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dark Circular Brand Badge 'N' */}
      <span
        className="absolute bottom-3 left-3 grid size-7 place-items-center rounded-full bg-[#18281d] text-[0.66rem] font-serif font-bold text-[#faf8f4] shadow-md max-[680px]:hidden"
        aria-hidden="true"
      >
        N
      </span>
    </div>
  );
}

