"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { formatCurrency, type Product } from "@/domain/catalog/products";
import { ProductJar } from "@/features/catalog/components/product-jar";
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
      className={`product-card ${compact ? "product-card--compact" : ""}`}
      style={style}
    >
      <div className="product-card__visual">
        <span className="product-card__botanical" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <button
          className={`wishlist-button ${wished ? "is-active" : ""}`}
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
          className="product-card__jar-link"
          onClick={() =>
            track("select_item", { item_id: product.slug, placement: "product_card" })
          }
          aria-label={`View ${product.name}`}
        >
          <ProductJar product={product} size={compact ? "small" : "medium"} decorative />
        </Link>
      </div>
      <div className="product-card__content">
        <p className="eyebrow">Ritual {product.collectionNumber}</p>
        <Link
          href={`/shop/${product.slug}`}
          className="product-card__title"
          onClick={() =>
            track("select_item", { item_id: product.slug, placement: "product_title" })
          }
        >
          {product.name}
        </Link>
        <p className="product-card__subtitle">{product.subtitle}</p>
        <div className="product-card__footer">
          <div>
            <span className="product-card__price">{formatCurrency(product.pricePaise)}</span>
            <span className="preview-label">Preview price</span>
          </div>
          <button
            type="button"
            className="round-add"
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
