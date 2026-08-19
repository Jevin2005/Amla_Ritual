"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { formatCurrency, type Product } from "@/domain/catalog/products";
import { ProductJar } from "@/features/catalog/product-jar";
import { useStore } from "@/features/store/store-provider";

export function ProductCard({
  product,
  compact = false,
}: {
  product: Product;
  compact?: boolean;
}) {
  const { addToCart, toggleWishlist, isWishlisted, track } = useStore();
  const wished = isWishlisted(product.slug);
  const currencyCode = product.currencyCode || "INR";
  const isAvailable = product.availableForSale !== false;
  const compareAtPrice =
    product.compareAtPricePaise &&
    product.compareAtPricePaise > product.pricePaise
      ? product.compareAtPricePaise
      : null;
  const stockLabel = isAvailable
    ? product.availability || "In stock"
    : "Sold out";
  const style = {
    "--product-accent": product.accent,
    "--product-soft": product.accentSoft,
  } as CSSProperties;

  return (
    <article
      className="group/card @container relative flex h-full flex-col overflow-hidden rounded-[var(--radius-md)] bg-[var(--paper)] ring-1 ring-[var(--line)] [--product-accent:var(--botanical)] [--product-soft:var(--beige)] transition-[transform,box-shadow,ring-color] duration-[420ms] ease-[var(--ease)] hover:-translate-y-1.5 hover:shadow-[var(--shadow-float)] hover:ring-[color-mix(in_srgb,var(--product-accent)_34%,transparent)]"
      style={style}
    >
      {/* Jar image area */}
      <div className="relative flex h-[clamp(260px,24vw,380px)] flex-none items-center justify-center overflow-hidden [background:radial-gradient(circle_at_50%_42%,rgba(255,255,255,0.82)_0_18%,transparent_19%),linear-gradient(155deg,color-mix(in_srgb,var(--product-soft)_48%,white),color-mix(in_srgb,var(--product-soft)_90%,var(--paper)))] before:absolute before:inset-[12%] before:rounded-full before:border before:border-[color-mix(in_srgb,var(--product-accent)_18%,transparent)] before:content-[''] after:absolute after:inset-[22%] after:rounded-full after:border after:border-[color-mix(in_srgb,var(--product-accent)_12%,transparent)] after:content-[''] max-[680px]:h-[clamp(250px,70vw,340px)]">

        {/* Wishlist */}
        <button
          className={`absolute top-3 right-3 z-[3] grid size-11 place-items-center rounded-full border text-[1.05rem] shadow-[0_8px_24px_rgba(21,59,45,0.08)] backdrop-blur-md transition-[background,color,transform,border-color] duration-200 hover:scale-105 active:scale-95 ${
            wished
              ? "border-[var(--product-accent)] bg-[var(--paper)] text-[var(--product-accent)]"
              : "border-white/70 bg-[rgba(255,252,245,0.78)] text-[var(--forest)] hover:border-[var(--product-accent)] hover:text-[var(--product-accent)]"
          }`}
          type="button"
          onClick={() => toggleWishlist(product.slug)}
          aria-label={`${wished ? "Remove" : "Save"} ${product.name} ${wished ? "from" : "to"} wishlist`}
          aria-pressed={wished}
        >
          <span aria-hidden="true">{wished ? "♥" : "♡"}</span>
        </button>

        {/* Jar — centered listing image */}
        <Link
          href={`/shop/${product.slug}`}
          className="relative z-[2] flex items-center justify-center transition-transform duration-[520ms] ease-[var(--ease)] group-hover/card:-translate-y-2 group-hover/card:scale-[1.025]"
          onClick={() => track("select_item", { item_id: product.slug, placement: "product_card" })}
          aria-label={`View ${product.name}`}
        >
          <ProductJar
            product={product}
            size={compact ? "small" : "medium"}
            className="max-[680px]:scale-[0.78] max-[680px]:origin-center"
            decorative
          />
        </Link>
      </div>

      {/* Info area */}
      <div className="flex flex-1 flex-col border-t border-[var(--line)] px-6 pt-5 pb-6 max-[680px]:px-5 max-[680px]:pt-5 max-[680px]:pb-5">
        <p className="mb-2 text-[0.65rem] font-bold tracking-[0.16em] text-[var(--product-accent)] uppercase">
          Ritual {product.collectionNumber}
        </p>

        <Link
          href={`/shop/${product.slug}`}
          className="mb-1.5 block [font-family:var(--font-display)] text-[clamp(1.65rem,1.85vw,2.15rem)] leading-[1.02] tracking-[-0.035em] text-[var(--forest)] transition-colors duration-200 hover:text-[var(--product-accent)] max-[680px]:text-[1.65rem]"
          onClick={() => track("select_item", { item_id: product.slug, placement: "product_title" })}
        >
          {product.name}
        </Link>

        <p className="mb-0 text-[0.78rem] leading-[1.6] text-[var(--muted)] max-[680px]:text-[0.76rem] max-[680px]:line-clamp-2">
          {product.subtitle}
        </p>

        <div className="mt-auto pt-5">
          <div className="flex items-center justify-between gap-3 border-t border-[var(--line)] pt-4">
            <div>
              <span className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="[font-family:var(--font-display)] text-[1.3rem] leading-none text-[var(--forest)]">
                  {formatCurrency(product.pricePaise, currencyCode)}
                </span>
                {compareAtPrice && (
                  <span
                    className="text-[0.72rem] text-[var(--muted)] line-through"
                    aria-label={`Previously ${formatCurrency(compareAtPrice, currencyCode)}`}
                  >
                    {formatCurrency(compareAtPrice, currencyCode)}
                  </span>
                )}
              </span>
              <span
                className={`mt-1 block text-[0.58rem] font-bold tracking-[0.1em] uppercase ${
                  isAvailable ? "text-[var(--muted)]" : "text-[#9a3f3f]"
                }`}
              >
                {stockLabel}
              </span>
            </div>
            <button
              type="button"
              className="grid size-12 place-items-center rounded-full border border-[var(--product-accent)] bg-[var(--product-accent)] text-[1.3rem] text-white shadow-[0_8px_22px_color-mix(in_srgb,var(--product-accent)_24%,transparent)] transition-[background,color,transform,box-shadow] duration-[240ms] ease-[ease] hover:-translate-y-0.5 hover:bg-[var(--forest)] hover:shadow-[0_10px_28px_rgba(21,59,45,0.2)] active:scale-95 disabled:cursor-not-allowed disabled:border-[var(--line-strong)] disabled:bg-[var(--line-strong)] disabled:text-[var(--muted)] disabled:shadow-none disabled:hover:translate-y-0"
              onClick={() => addToCart(product.slug)}
              disabled={!isAvailable}
              aria-label={
                isAvailable
                  ? `Add ${product.name} to bag`
                  : `${product.name} is sold out`
              }
            >
              <span aria-hidden="true">＋</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
