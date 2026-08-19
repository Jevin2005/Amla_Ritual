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
  const style = {
    "--product-accent": product.accent,
    "--product-soft": product.accentSoft,
  } as CSSProperties;

  return (
    <article
      className="group/card @container relative flex h-full flex-col bg-[var(--paper)] [--product-accent:var(--botanical)] [--product-soft:var(--beige)] transition-[transform,box-shadow] duration-[400ms] ease-[var(--ease)] hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(23,63,42,0.12)]"
      style={style}
    >
      {/* Jar image area */}
      <div className="relative flex h-[clamp(260px,24vw,380px)] flex-none items-center justify-center overflow-hidden [background:linear-gradient(160deg,color-mix(in_srgb,var(--product-soft)_60%,white),color-mix(in_srgb,var(--product-soft)_85%,var(--paper)))] max-[680px]:h-[clamp(170px,46vw,230px)]">

        {/* Wishlist */}
        <button
          className={`absolute top-2.5 right-2.5 z-[3] grid size-9 place-items-center rounded-full border text-[1.05rem] transition-[background,color] duration-200 max-[680px]:size-8 max-[680px]:text-[0.95rem] ${
            wished
              ? "border-[var(--product-accent)] bg-[var(--paper)] text-[var(--product-accent)]"
              : "border-[rgba(23,63,42,0.15)] bg-[rgba(255,255,255,0.72)] text-[var(--muted)]"
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
          className="relative z-[2] flex items-center justify-center transition-transform duration-[400ms] ease-[var(--ease)] group-hover/card:-translate-y-1.5"
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
      <div className="flex flex-1 flex-col border-t border-[rgba(23,63,42,0.1)] px-5 pb-5 pt-4 max-[680px]:px-3 max-[680px]:pb-4 max-[680px]:pt-3">
        <p className="mb-1.5 text-[0.58rem] font-bold tracking-[0.18em] text-[var(--product-accent)] uppercase max-[680px]:text-[0.52rem]">
          Ritual {product.collectionNumber}
        </p>

        <Link
          href={`/shop/${product.slug}`}
          className="mb-1 block [font-family:var(--font-display)] text-[clamp(1.45rem,1.75vw,2rem)] leading-[1.04] tracking-[-0.035em] text-[var(--forest)] transition-colors duration-200 hover:text-[var(--product-accent)] max-[680px]:text-[1.05rem] max-[680px]:leading-[1.1]"
          onClick={() => track("select_item", { item_id: product.slug, placement: "product_title" })}
        >
          {product.name}
        </Link>

        <p className="mb-0 text-[0.7rem] leading-[1.5] text-[var(--muted)] max-[680px]:text-[0.62rem] max-[680px]:leading-[1.45] max-[680px]:line-clamp-2">
          {product.subtitle}
        </p>

        <div className="mt-auto pt-4 max-[680px]:pt-3">
          <div className="flex items-center justify-between gap-2 border-t border-[rgba(23,63,42,0.1)] pt-3.5 max-[680px]:pt-2.5">
            <div>
              <span className="block [font-family:var(--font-display)] text-[1.1rem] leading-none text-[var(--forest)] max-[680px]:text-[0.96rem]">
                {formatCurrency(product.pricePaise)}
              </span>
              <span className="mt-0.5 block text-[0.44rem] tracking-[0.1em] text-[var(--muted)] uppercase max-[680px]:hidden">
                Preview price
              </span>
            </div>
            <button
              type="button"
              className="grid size-[42px] place-items-center rounded-full border border-[var(--product-accent)] text-[1.25rem] text-[var(--product-accent)] transition-[background,color,transform] duration-[240ms] ease-[ease] hover:bg-[var(--product-accent)] hover:text-white hover:[transform:scale(1.05)] active:scale-95 max-[680px]:size-[38px] max-[680px]:text-[1.1rem]"
              onClick={() => addToCart(product.slug)}
              aria-label={`Add ${product.name} to bag`}
            >
              <span aria-hidden="true">＋</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
