"use client";

import { useEffect, useRef, useState } from "react";
import { formatCurrency, getDefaultVariant } from "@/domain/catalog/products";
import { useStore } from "@/features/store/store-provider";
import { MagneticLink } from "@/shared/ui/magnetic-link";
import styles from "./hero-purchase.module.css";

type HeroPurchaseProps = {
  slug: string;
  name: string;
  pricePaise?: number | null;
  size?: string;
  currencyCode?: string;
  cursorMotion?: boolean;
};

export function HeroPurchase({
  slug,
  name,
  pricePaise,
  size,
  currencyCode: suppliedCurrencyCode,
  cursorMotion = true,
}: HeroPurchaseProps) {
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
  const hasPrice = typeof currentPricePaise === "number" &&
    Number.isFinite(currentPricePaise) && currentPricePaise >= 0;
  const productSize = product?.size?.trim() || size?.trim();
  const currencyCode = variant?.currencyCode || product?.currencyCode || suppliedCurrencyCode || "INR";
  const available =
    variant?.availableForSale ?? product?.availableForSale ?? true;

  useEffect(() => {
    return () => {
      if (resetTimer.current) window.clearTimeout(resetTimer.current);
    };
  }, []);

  const add = async () => {
    setAdded(false);
    const nextCart = await addToCart(slug, 1, true, variant?.id);
    if (!nextCart) return;
    setAdded(true);
    if (resetTimer.current) window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className={styles.purchase}>
      <div className={styles.priceRow}>
        <span className={hasPrice ? styles.price : styles.weight}>
          {hasPrice
            ? formatCurrency(currentPricePaise, currencyCode)
            : productSize || "See product details"}
        </span>
        {hasPrice && productSize && (
          <small className={styles.tax}>
            {productSize}
          </small>
        )}
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
                : "Add to bag"}
          <span aria-hidden="true">{added ? "✓" : "→"}</span>
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
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
          </svg>
        </button>
      </div>
      <MagneticLink
        className={styles.explore}
        href="#featured-ritual"
        motionEnabled={cursorMotion}
      >
        Explore the ritual{" "}
        <span
          aria-hidden="true"
        >
          ↗
        </span>
      </MagneticLink>
    </div>
  );
}
