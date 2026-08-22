"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  formatCurrency,
  getDefaultVariant,
  type Product,
} from "@/domain/catalog/products";
import { useStore } from "@/features/store/store-provider";

export function ProductDetailActions({ product }: { product: Product }) {
  const router = useRouter();
  const {
    source,
    addToCart,
    toggleWishlist,
    isWishlisted,
    track,
    cartError,
    clearCartError,
    isCartBusy,
  } = useStore();
  const defaultVariant = getDefaultVariant(product);
  const [selectedVariantId, setSelectedVariantId] = useState(
    defaultVariant?.id || "",
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [mounted, setMounted] = useState(false);
  const resetTimer = useRef<number | null>(null);
  const wished = isWishlisted(product.slug);
  const variants = product.variants || [];
  const selectedVariant =
    variants.find((variant) => variant.id === selectedVariantId) ||
    defaultVariant;
  const pricePaise = selectedVariant?.pricePaise ?? product.pricePaise;
  const compareAtPricePaise =
    selectedVariant?.compareAtPricePaise ?? product.compareAtPricePaise ?? null;
  const currencyCode =
    selectedVariant?.currencyCode || product.currencyCode || "INR";
  const available =
    selectedVariant?.availableForSale ?? product.availableForSale ?? true;
  const maximumQuantity = Math.max(
    0,
    Math.min(12, selectedVariant?.quantityAvailable ?? 12),
  );
  const hasVariantChoice =
    variants.length > 1 ||
    (variants.length === 1 && variants[0].title !== "Default Title");

  useEffect(() => {
    setMounted(true);
    return () => {
      if (resetTimer.current) window.clearTimeout(resetTimer.current);
    };
  }, []);

  const add = async (openDrawer = true) => {
    const nextCart = await addToCart(
      product.slug,
      quantity,
      openDrawer,
      selectedVariant?.id,
    );
    if (!nextCart) return null;
    setAdded(true);
    if (resetTimer.current) window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setAdded(false), 1800);
    return nextCart;
  };

  const buyNow = async () => {
    setIsBuyingNow(true);
    try {
      const nextCart = await add(false);
      if (!nextCart) return;
      track("begin_checkout", {
        item_id: selectedVariant?.id || product.slug,
        quantity,
        value: (pricePaise * quantity) / 100,
        currency: currencyCode,
        mode: source === "shopify" ? "shopify_hosted" : "preview_handoff",
      });
      if (source === "shopify" && nextCart.checkoutUrl) {
        window.location.assign(nextCart.checkoutUrl);
      } else {
        router.push("/checkout");
      }
    } finally {
      setIsBuyingNow(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Price & Stock Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-y border-[var(--line)] py-2.5">
        <div className="flex items-baseline gap-2">
          <span className="[font-family:var(--font-display)] text-[1.85rem] font-semibold text-[var(--forest)] max-[680px]:text-[1.55rem]">
            {formatCurrency(pricePaise, currencyCode)}
          </span>
          {compareAtPricePaise && compareAtPricePaise > pricePaise ? (
            <del className="text-[0.82rem] text-[var(--muted)]">
              {formatCurrency(compareAtPricePaise, currencyCode)}
            </del>
          ) : null}
        </div>

        {/* Stock status indicator */}
        <div className="flex items-center gap-1.5 text-[0.66rem] font-bold uppercase tracking-wider max-[680px]:text-[0.6rem]">
          <span
            className={`size-2 rounded-full ${
              available ? "bg-[#529d38] ring-2 ring-[#529d38]/30 animate-pulse" : "bg-red-500"
            }`}
          />
          <span className={available ? "text-[var(--forest)]" : "text-red-600"}>
            {available
              ? selectedVariant?.quantityAvailable && selectedVariant.quantityAvailable <= 5
                ? `Only ${selectedVariant.quantityAvailable} left`
                : "In Stock · Ready to ship"
              : "Sold Out"}
          </span>
        </div>
      </div>

      {/* Variant Choice If Applicable */}
      {hasVariantChoice && (
        <div className="grid gap-1">
          <label
            className="text-[0.62rem] font-bold tracking-[0.1em] text-[var(--forest)] uppercase"
            htmlFor={`variant-${product.slug}`}
          >
            Select Option
          </label>
          <select
            className="h-10 w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3 text-[0.76rem] text-[var(--forest)] outline-none focus:border-[var(--botanical)] cursor-pointer"
            id={`variant-${product.slug}`}
            value={selectedVariant?.id || ""}
            onChange={(event) => {
              const nextVariant = variants.find(
                (variant) => variant.id === event.target.value,
              );
              setSelectedVariantId(event.target.value);
              setQuantity((current) =>
                Math.max(
                  1,
                  Math.min(
                    current,
                    Math.min(12, nextVariant?.quantityAvailable ?? 12),
                  ),
                ),
              );
              setAdded(false);
              clearCartError();
            }}
          >
            {variants.map((variant) => (
              <option
                value={variant.id}
                key={variant.id}
                disabled={!variant.availableForSale}
              >
                {variant.title} — {formatCurrency(variant.pricePaise, variant.currencyCode)}
                {!variant.availableForSale ? " — Sold out" : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Desktop Inline Actions (Only shown in Desktop 2-column view min-width 961px) */}
      <div className="flex flex-col gap-2.5 max-[960px]:hidden">
        {/* Main Action Buttons Grid */}
        <div className="grid grid-cols-[105px_minmax(0,1fr)] gap-2.5">
          {/* Quantity Stepper */}
          <div
            className="inline-grid h-11 grid-cols-3 items-center overflow-hidden rounded-full border border-[var(--line)] bg-[var(--paper)] shadow-2xs"
            aria-label={`Quantity for ${product.name}`}
          >
            <button
              type="button"
              className="h-full bg-transparent text-sm text-[var(--forest)] transition-colors hover:bg-[var(--ivory)] disabled:opacity-40 cursor-pointer"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              aria-label="Decrease quantity"
              disabled={isCartBusy || quantity <= 1}
            >
              −
            </button>
            <span className="text-center text-[0.82rem] font-bold text-[var(--forest)]" aria-live="polite">
              {quantity}
            </span>
            <button
              type="button"
              className="h-full bg-transparent text-sm text-[var(--forest)] transition-colors hover:bg-[var(--ivory)] disabled:opacity-40 cursor-pointer"
              onClick={() => setQuantity(Math.min(maximumQuantity, quantity + 1))}
              aria-label="Increase quantity"
              disabled={isCartBusy || !available || quantity >= maximumQuantity}
            >
              +
            </button>
          </div>

          {/* Add to Bag Button */}
          <button
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#529d38] px-6 text-[0.74rem] font-bold uppercase tracking-[0.1em] text-white shadow-[0_8px_20px_rgba(82,157,56,0.22)] transition-all hover:bg-[#43852d] active:scale-98 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
            onClick={() => void add(true)}
            disabled={isCartBusy || !available || maximumQuantity < 1}
          >
            <span>{isCartBusy ? "Updating…" : added ? "Added to Ritual" : "Add to Bag"}</span>
            <span aria-hidden="true">{added ? "✓" : "＋"}</span>
          </button>
        </div>

        {/* Secondary Action Row: Buy Now + Wishlist */}
        <div className="grid grid-cols-[1fr_auto] gap-2.5">
          <button
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border border-[var(--forest)] bg-transparent px-5 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-[var(--forest)] transition-all hover:bg-[var(--forest)] hover:text-white active:scale-98 cursor-pointer disabled:opacity-50"
            type="button"
            onClick={() => void buyNow()}
            disabled={isCartBusy || isBuyingNow || !available || maximumQuantity < 1}
          >
            {isBuyingNow
              ? "Preparing checkout…"
              : source === "shopify"
                ? "Buy Now ↗"
                : "Direct Checkout Preview ↗"}
          </button>

          <button
            className={`inline-flex h-10 items-center justify-center gap-1.5 rounded-full border px-4 text-[0.66rem] font-bold tracking-[0.06em] uppercase transition-all cursor-pointer ${
              wished
                ? "border-red-300 bg-red-50 text-red-500"
                : "border-[var(--line)] bg-[var(--paper)] text-[var(--forest)] hover:bg-[var(--beige)]"
            }`}
            type="button"
            onClick={() => toggleWishlist(product.slug)}
            aria-pressed={wished}
          >
            <span className="text-sm" aria-hidden="true">
              {wished ? "♥" : "♡"}
            </span>
            <span>{wished ? "Saved" : "Save"}</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {cartError && (
        <div
          className="flex items-start justify-between gap-3 rounded-xl bg-[#f7e9e4] p-3 text-[0.72rem] text-[#813c2f] ring-1 ring-[#dfb7ad]"
          role="alert"
        >
          <span>{cartError}</span>
          <button
            type="button"
            className="shrink-0 text-base font-bold cursor-pointer"
            onClick={clearCartError}
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {/* ── React Portal: Mobile Fixed Sticky Bottom Bar (Permanently docked to screen viewport on phone/tablet) ── */}
      {mounted &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-x-0 bottom-0 z-[9999] hidden max-[960px]:flex items-center justify-between gap-1.5 border-t border-[var(--line)] bg-[#fbfaf6]/98 px-3 py-2 max-[380px]:px-2 max-[380px]:py-1.5 pb-[calc(8px+env(safe-area-inset-bottom))] backdrop-blur-xl shadow-[0_-10px_40px_rgba(0,0,0,0.16)]"
            role="region"
            aria-label="Sticky Purchase Footer"
          >
            {/* Left Price & Stock Info (Compact, no wrapping) */}
            <div className="flex flex-col shrink-0 min-w-0 pr-1 max-[360px]:pr-0.5">
              <span className="[font-family:var(--font-display)] text-[1.15rem] font-bold leading-tight text-[var(--forest)] whitespace-nowrap max-[380px]:text-[1.05rem]">
                {formatCurrency(pricePaise, currencyCode)}
              </span>
              <div className="flex items-center gap-1 text-[0.52rem] font-bold text-[#529d38] uppercase tracking-wider whitespace-nowrap max-[380px]:text-[0.48rem]">
                <span className="size-1.5 rounded-full bg-[#529d38] animate-pulse shrink-0" />
                <span>{available ? "In Stock" : "Sold Out"}</span>
              </div>
            </div>

            {/* Right Actions Group: Stepper + Add to Bag + Wishlist (Aligned & Proportional) */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Stepper (Compact on small phones) */}
              <div className="inline-flex h-8.5 items-center rounded-full border border-[var(--line)] bg-white px-0.5 shadow-2xs max-[380px]:h-8">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={isCartBusy || quantity <= 1}
                  className="size-6 text-xs font-bold text-[var(--forest)] disabled:opacity-40 cursor-pointer flex items-center justify-center"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="w-4 text-center text-[0.7rem] font-bold text-[var(--forest)] select-none">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(maximumQuantity, quantity + 1))}
                  disabled={isCartBusy || !available || quantity >= maximumQuantity}
                  className="size-6 text-xs font-bold text-[var(--forest)] disabled:opacity-40 cursor-pointer flex items-center justify-center"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              {/* Add to Bag Button */}
              <button
                type="button"
                onClick={() => void add(true)}
                disabled={isCartBusy || !available || maximumQuantity < 1}
                className="inline-flex h-8.5 items-center justify-center gap-1 rounded-full bg-[#529d38] px-3.5 text-[0.68rem] font-bold uppercase tracking-wider text-white shadow-xs transition-all hover:bg-[#43852d] active:scale-95 cursor-pointer disabled:opacity-50 whitespace-nowrap max-[380px]:h-8 max-[380px]:px-2.5 max-[380px]:text-[0.62rem]"
              >
                <span>{isCartBusy ? "..." : added ? "Added ✓" : "Add to Bag"}</span>
                <span aria-hidden="true">{added ? "" : "＋"}</span>
              </button>

              {/* Wishlist Button */}
              <button
                type="button"
                onClick={() => toggleWishlist(product.slug)}
                className={`grid size-8.5 place-items-center rounded-full border text-xs transition-colors cursor-pointer shrink-0 max-[380px]:size-8 ${
                  wished
                    ? "border-red-300 bg-red-50 text-red-500"
                    : "border-[var(--line)] bg-white text-[var(--forest)] hover:bg-[var(--beige)]"
                }`}
                aria-label="Wishlist"
              >
                {wished ? "♥" : "♡"}
              </button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
