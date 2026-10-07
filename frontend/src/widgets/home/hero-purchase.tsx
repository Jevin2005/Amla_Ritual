"use client";

import { useEffect, useRef, useState } from "react";
import { formatCurrency, getDefaultVariant, calculateDiscountPercent, calculateSavingsPaise } from "@/domain/catalog/products";
import { useStore } from "@/features/store/store-provider";
import { MagneticLink } from "@/shared/ui/magnetic-link";
import styles from "./hero-purchase.module.css";

type HeroPurchaseProps = {
  slug: string;
  name: string;
  pricePaise?: number | null;
  compareAtPricePaise?: number | null;
  size?: string;
  currencyCode?: string;
  cursorMotion?: boolean;
};

export function HeroPurchase({
  slug,
  name,
  pricePaise,
  compareAtPricePaise,
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
  const currentCompareAtPaise =
    variant?.compareAtPricePaise ?? product?.compareAtPricePaise ?? compareAtPricePaise ?? null;
  const hasPrice = typeof currentPricePaise === "number" &&
    Number.isFinite(currentPricePaise) && currentPricePaise >= 0;
  const discountPercent = calculateDiscountPercent(currentPricePaise, currentCompareAtPaise);
  const savingsPaise = calculateSavingsPaise(currentPricePaise, currentCompareAtPaise);
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
        <div className="flex flex-wrap items-baseline gap-2">
          <span className={hasPrice ? styles.price : styles.weight}>
            {hasPrice
              ? formatCurrency(currentPricePaise, currencyCode)
              : productSize || "See product details"}
          </span>
          {hasPrice && currentCompareAtPaise && currentCompareAtPaise > currentPricePaise ? (
            <>
              <span className="text-[0.95rem] text-[var(--muted)] line-through max-[900px]:text-[0.82rem]">
                {formatCurrency(currentCompareAtPaise, currencyCode)}
              </span>
              <span className="rounded-full bg-[#2d6a2f]/15 px-2.5 py-0.5 text-[0.72rem] font-bold text-[#235825] max-[900px]:text-[0.65rem]">
                {discountPercent}% OFF
              </span>
            </>
          ) : null}
        </div>
        {hasPrice && (
          <div className="flex items-center gap-2 w-full text-[0.74rem]">
            {savingsPaise > 0 && (
              <span className="font-semibold text-[#2d6a2f]">
                Save {formatCurrency(savingsPaise, currencyCode)}
              </span>
            )}
            {productSize && (
              <small className={styles.tax}>
                {savingsPaise > 0 ? "· " : ""}{productSize}
              </small>
            )}
          </div>
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
