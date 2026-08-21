"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { formatCurrency, type Product } from "@/domain/catalog/products";
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

  const imageUrl = product.featuredImage?.url || "/images/amla-powder.jpg";
  const imageAlt = product.featuredImage?.altText || product.name;

  return (
    <article
      className="group/card @container relative flex h-full flex-col overflow-hidden rounded-[var(--radius-md)] bg-[var(--paper)] ring-1 ring-[var(--line)] [--product-accent:var(--botanical)] [--product-soft:var(--beige)] transition-[transform,box-shadow,ring-color] duration-[420ms] ease-[var(--ease)] hover:-translate-y-1.5 hover:shadow-[var(--shadow-float)] hover:ring-[color-mix(in_srgb,var(--product-accent)_34%,transparent)] max-[680px]:rounded-lg"
      style={style}
    >
      {/* Product listing photo area - Full Cover */}
      <div className="relative aspect-square w-full flex-none overflow-hidden bg-[var(--paper)]">
        {/* Wishlist button */}
        <button
          className={`absolute top-3 right-3 z-[3] grid size-10 place-items-center rounded-full border text-[1rem] shadow-[0_4px_16px_rgba(21,59,45,0.12)] backdrop-blur-md transition-[background,color,transform,border-color] duration-200 hover:scale-105 active:scale-95 max-[680px]:top-2 max-[680px]:right-2 max-[680px]:size-7 max-[680px]:text-[0.78rem] ${
            wished
              ? "border-[var(--product-accent)] bg-[var(--paper)] text-[var(--product-accent)]"
              : "border-white/80 bg-[rgba(255,252,245,0.88)] text-[var(--forest)] hover:border-[var(--product-accent)] hover:text-[var(--product-accent)]"
          }`}
          type="button"
          onClick={() => toggleWishlist(product.slug)}
          aria-label={`${wished ? "Remove" : "Save"} ${product.name} ${wished ? "from" : "to"} wishlist`}
          aria-pressed={wished}
        >
          <span aria-hidden="true">{wished ? "♥" : "♡"}</span>
        </button>

        {/* Full-Cover listing product photo */}
        <Link
          href={`/shop/${product.slug}`}
          className="relative block size-full overflow-hidden transition-transform duration-[520ms] ease-[var(--ease)] group-hover/card:scale-[1.04]"
          onClick={() => track("select_item", { item_id: product.slug, placement: "product_card" })}
          aria-label={`View ${product.name}`}
        >
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            sizes="(max-width: 680px) 50vw, (max-width: 900px) 50vw, 33vw"
            className="size-full object-cover object-center"
          />
        </Link>
      </div>

      {/* Info area */}
      <div className="flex flex-1 flex-col border-t border-[var(--line)] px-5 pt-4 pb-5 max-[680px]:px-3 max-[680px]:pt-2.5 max-[680px]:pb-3 max-[420px]:px-2.5 max-[420px]:py-2">
        <p className="mb-1 text-[0.62rem] font-bold tracking-[0.14em] text-[var(--product-accent)] uppercase max-[680px]:mb-0.5 max-[680px]:text-[0.46rem] max-[680px]:tracking-[0.08em]">
          {product.ritualStep} Ritual
        </p>

        <Link
          href={`/shop/${product.slug}`}
          className="mb-1 block [font-family:var(--font-display)] text-[clamp(1.45rem,1.75vw,1.95rem)] leading-[1.05] tracking-[-0.03em] text-[var(--forest)] transition-colors duration-200 hover:text-[var(--product-accent)] max-[680px]:mb-0.5 max-[680px]:text-[1.02rem] max-[420px]:text-[0.92rem]"
          onClick={() => track("select_item", { item_id: product.slug, placement: "product_title" })}
        >
          {product.name}
        </Link>

        <p className="mb-0 text-[0.74rem] leading-[1.5] text-[var(--muted)] max-[680px]:line-clamp-1 max-[680px]:text-[0.56rem] max-[680px]:leading-[1.25] max-[420px]:text-[0.5rem]">
          {product.subtitle}
        </p>

        <div className="mt-auto pt-4 max-[680px]:pt-2">
          <div className="flex items-center justify-between gap-2 border-t border-[var(--line)] pt-3 max-[680px]:pt-2">
            <div>
              <span className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                <span className="[font-family:var(--font-display)] text-[1.22rem] leading-none text-[var(--forest)] max-[680px]:text-[0.95rem] max-[420px]:text-[0.88rem]">
                  {formatCurrency(product.pricePaise, currencyCode)}
                </span>
                {compareAtPrice && (
                  <span
                    className="text-[0.68rem] text-[var(--muted)] line-through max-[680px]:text-[0.52rem]"
                    aria-label={`Previously ${formatCurrency(compareAtPrice, currencyCode)}`}
                  >
                    {formatCurrency(compareAtPrice, currencyCode)}
                  </span>
                )}
              </span>
              <span
                className={`mt-0.5 block text-[0.55rem] font-bold tracking-[0.08em] uppercase max-[680px]:text-[0.44rem] ${
                  isAvailable ? "text-[var(--muted)]" : "text-[#9a3f3f]"
                }`}
              >
                {stockLabel}
              </span>
            </div>
            <button
              type="button"
              className="grid size-10 place-items-center rounded-full border border-[var(--product-accent)] bg-[var(--product-accent)] text-[1.15rem] text-white shadow-[0_6px_18px_color-mix(in_srgb,var(--product-accent)_24%,transparent)] transition-[background,color,transform,box-shadow] duration-[240ms] ease-[ease] hover:-translate-y-0.5 hover:bg-[var(--forest)] hover:shadow-[0_10px_28px_rgba(21,59,45,0.2)] active:scale-95 disabled:cursor-not-allowed disabled:border-[var(--line-strong)] disabled:bg-[var(--line-strong)] disabled:text-[var(--muted)] disabled:shadow-none disabled:hover:translate-y-0 max-[680px]:size-7 max-[680px]:text-[0.85rem] max-[420px]:size-6.5 max-[420px]:text-[0.75rem]"
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
