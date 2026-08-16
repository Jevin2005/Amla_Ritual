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
      className="@container relative flex h-full min-w-0 flex-col bg-[var(--paper)] [--product-accent:var(--botanical)] [--product-soft:var(--beige)] transition-[transform,box-shadow] duration-[480ms] ease-[var(--ease)] hover:z-[2] hover:-translate-y-1.5 hover:shadow-[var(--shadow-soft)]"
      style={style}
    >
      <div className="relative flex h-[clamp(330px,28vw,430px)] flex-none items-end justify-center overflow-hidden pb-[35px] [background:radial-gradient(circle_at_50%_78%,rgba(255,255,255,0.95)_0,rgba(255,255,255,0.28)_28%,transparent_55%),linear-gradient(145deg,color-mix(in_srgb,var(--product-soft)_72%,white),var(--product-soft))] before:absolute before:top-[14%] before:h-[65%] before:w-[65%] before:rounded-t-[50%] before:border before:border-[color-mix(in_srgb,var(--product-accent)_35%,transparent)] before:content-[''] max-[800px]:pb-7 max-[680px]:h-[clamp(360px,70vw,430px)] max-[520px]:h-[360px] @max-[220px]:h-[350px] @max-[220px]:pb-6 @max-[220px]:before:top-[10%] @max-[220px]:before:h-[72%] @max-[220px]:before:w-[88%]">
        <span className="absolute top-[14%] right-[7%] h-40 w-[100px] rotate-24 before:absolute before:left-1/2 before:h-full before:w-px before:bg-[color-mix(in_srgb,var(--product-accent)_45%,transparent)] before:content-[''] [&>i]:absolute [&>i]:h-[18px] [&>i]:w-[37px] [&>i]:rounded-[100%_0_100%_0] [&>i]:bg-[color-mix(in_srgb,var(--product-accent)_25%,transparent)] [&>i:nth-child(1)]:top-5 [&>i:nth-child(1)]:left-4 [&>i:nth-child(2)]:top-[65px] [&>i:nth-child(2)]:right-[15px] [&>i:nth-child(2)]:-scale-x-100 [&>i:nth-child(3)]:top-[108px] [&>i:nth-child(3)]:left-[15px] @max-[220px]:right-[-6px] @max-[220px]:top-[8%] @max-[220px]:scale-[0.82]" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <button
          className={`absolute top-[17px] right-[17px] z-[4] grid size-11 place-items-center rounded-full border border-[color-mix(in_srgb,var(--product-accent)_30%,transparent)] text-[1.28rem] text-[var(--product-accent)] transition-[background,transform] duration-250 ease-[ease] hover:scale-[1.06] hover:bg-[var(--paper)] @max-[220px]:top-2.5 @max-[220px]:right-2.5 ${
            wished
              ? "scale-[1.06] bg-[var(--paper)]"
              : "bg-[rgba(255,255,255,0.58)]"
          }`}
          type="button"
          onClick={() => toggleWishlist(product.slug)}
          aria-label={`${wished ? "Remove" : "Save"} ${product.name} ${
            wished ? "from" : "to"
          } wishlist`}
          aria-pressed={wished}
        >
          <span aria-hidden="true">{wished ? "♥" : "♡"}</span>
        </button>
        <Link
          href={`/shop/${product.slug}`}
          className="relative z-[2] flex min-h-[270px] min-w-[180px] items-end justify-center @max-[220px]:min-h-[270px] @max-[220px]:w-full @max-[220px]:min-w-0"
          onClick={() =>
            track("select_item", { item_id: product.slug, placement: "product_card" })
          }
          aria-label={`View ${product.name}`}
        >
          <ProductJar
            product={product}
            size={compact ? "small" : "medium"}
            className="@max-[220px]:origin-bottom @max-[220px]:scale-[0.94]"
            decorative
          />
        </Link>
      </div>
      <div className="flex flex-1 flex-col px-[30px] pb-[30px] pt-7 max-[800px]:px-6 max-[680px]:pb-6 @max-[220px]:px-3 @max-[220px]:pt-4 @max-[220px]:pb-4">
        <p className="mb-2 text-[0.68rem] leading-[1.3] font-bold tracking-[0.2em] text-[var(--product-accent)] uppercase @max-[220px]:mb-2 @max-[220px]:text-[0.58rem] @max-[220px]:tracking-[0.12em]">Ritual {product.collectionNumber}</p>
        <Link
          href={`/shop/${product.slug}`}
          className="inline-block font-serif text-[clamp(1.8rem,2.2vw,2.5rem)] leading-none tracking-[-0.04em] text-[var(--forest)] @max-[220px]:flex @max-[220px]:min-h-[2em] @max-[220px]:items-start @max-[220px]:text-[1.7rem] @max-[220px]:leading-none @max-[220px]:tracking-[-0.04em] @max-[220px]:[overflow-wrap:anywhere]"
          onClick={() =>
            track("select_item", { item_id: product.slug, placement: "product_title" })
          }
        >
          {product.name}
        </Link>
        <p className="mb-6 mt-2.5 min-h-[2.5em] text-[0.78rem] leading-[1.5] tracking-[0.04em] text-[var(--muted)] @max-[220px]:mb-4 @max-[220px]:mt-2 @max-[220px]:line-clamp-2 @max-[220px]:min-h-[2.8em] @max-[220px]:text-[0.7rem] @max-[220px]:leading-[1.4] @max-[220px]:tracking-normal">{product.subtitle}</p>
        <div className="mt-auto flex items-end justify-between gap-[15px] border-t border-[var(--line)] pt-5 @max-[220px]:gap-2 @max-[220px]:pt-3">
          <div className="grid">
            <span className="font-serif text-xl text-[var(--forest)] @max-[220px]:text-lg">{formatCurrency(product.pricePaise)}</span>
            <span className="text-[0.52rem] tracking-[0.11em] text-[var(--muted)] uppercase @max-[220px]:hidden">Preview price</span>
          </div>
          <button
            type="button"
            className="grid size-[46px] flex-none place-items-center rounded-full border border-[var(--product-accent,var(--forest))] bg-transparent text-[1.3rem] text-[var(--product-accent,var(--forest))] transition-[background,color,transform] duration-[260ms] ease-[ease] hover:rotate-90 hover:bg-[var(--product-accent,var(--forest))] hover:text-[var(--paper)] @max-[220px]:size-11"
            onClick={() => addToCart(product.slug)}
            aria-label={`Add ${product.name} to bag`}
          >
            <span aria-hidden="true">＋</span>
          </button>
        </div>
      </div>
    </article>
  );
}
