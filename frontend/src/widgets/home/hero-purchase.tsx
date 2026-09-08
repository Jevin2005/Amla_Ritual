"use client";

import { useEffect, useRef, useState } from "react";
import { formatCurrency, getDefaultVariant } from "@/domain/catalog/products";
import { useStore } from "@/features/store/store-provider";
import styles from "./hero-purchase.module.css";

type HeroPurchaseProps = {
  slug: string;
  name: string;
  pricePaise: number;
};

export function HeroPurchase({ slug, name, pricePaise }: HeroPurchaseProps) {
  const {
    products,
    addToCart,
    isWishlisted,
    toggleWishlist,
    isCartBusy,
  } = useStore();
  const [added, setAdded] = useState(false);
  const resetTimer = useRef<number | null>(null);
  const wished = isWishlisted(slug);
  const product = products.find((item) => item.slug === slug);
  const variant = product ? getDefaultVariant(product) : null;
  const currentPricePaise =
    variant?.pricePaise ?? product?.pricePaise ?? pricePaise;
  const currencyCode = variant?.currencyCode || product?.currencyCode || "INR";
  const available =
    variant?.availableForSale ?? product?.availableForSale ?? true;

  useEffect(() => {
    return () => {
      if (resetTimer.current) window.clearTimeout(resetTimer.current);
    };
  }, []);

  const add = async () => {
    const nextCart = await addToCart(slug, 1, true, variant?.id);
    if (!nextCart) return;
    setAdded(true);
    if (resetTimer.current) window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className={styles.purchase}>
      <div className={styles.priceRow}>
        <span className={styles.price}>
          {formatCurrency(currentPricePaise, currencyCode)}
        </span>
        <small className={styles.tax}>
          Tax included · {product?.size || "See product details"}
        </small>
      </div>
      <div className={styles.actions}>
        <button
          className={styles.add}
          type="button"
          onClick={() => void add()}
          disabled={!available || isCartBusy}
        >
          {isCartBusy
            ? "Updating…"
            : !available
              ? "Sold out"
              : added
                ? "Added"
                : "Add to Bag"}
          <span aria-hidden="true">{added ? "✓" : "↗"}</span>
        </button>
        <button
          className={styles.wishlist}
          data-saved={wished}
          type="button"
          aria-label={
            wished ? `Remove ${name} from wishlist` : `Save ${name} to wishlist`
          }
          aria-pressed={wished}
          onClick={() => toggleWishlist(slug)}
        >
          <span aria-hidden="true">{wished ? "♥" : "♡"}</span>
        </button>
      </div>
      <a
        className={styles.explore}
        href="#featured-ritual"
      >
        Explore the ritual{" "}
        <span
          aria-hidden="true"
        >
          ↓
        </span>
      </a>
    </div>
  );
}
