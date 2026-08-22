"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
    <>
      <div className="grid pt-[27px] pb-3.5">
        <div className="flex flex-wrap items-baseline gap-3">
          <span className="font-serif text-[2rem] text-[var(--forest)]">
            {formatCurrency(pricePaise, currencyCode)}
          </span>
          {compareAtPricePaise && compareAtPricePaise > pricePaise ? (
            <del className="text-[0.82rem] text-[var(--muted)]">
              {formatCurrency(compareAtPricePaise, currencyCode)}
            </del>
          ) : null}
        </div>
        <small className="text-[0.57rem] tracking-[0.1em] text-[var(--muted)] uppercase">
          {source === "shopify" ? "Live Shopify price" : "Preview price"}
        </small>
      </div>

      {hasVariantChoice && (
        <div className="mb-[18px] grid gap-2">
          <label
            className="text-[0.62rem] font-bold tracking-[0.09em] text-[var(--forest)] uppercase"
            htmlFor={`variant-${product.slug}`}
          >
            Choose an option
          </label>
          <select
            className="h-[52px] w-full rounded-full border border-[var(--line)] bg-[var(--paper)] px-5 text-[0.76rem] text-[var(--forest)] outline-none focus:border-[var(--pdp-accent)]"
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
          {selectedVariant?.selectedOptions.length ? (
            <p className="m-0 text-[0.64rem] text-[var(--muted)]">
              {selectedVariant.selectedOptions
                .map((option) => `${option.name}: ${option.value}`)
                .join(" · ")}
            </p>
          ) : null}
        </div>
      )}

      <p className="mb-[18px] flex items-center gap-[9px] text-[0.68rem] tracking-[0.08em] text-[var(--muted)] uppercase">
        <i
          className={`size-[7px] rounded-full shadow-[0_0_0_4px_color-mix(in_srgb,var(--pdp-accent)_14%,transparent)] ${available ? "bg-[var(--pdp-accent)]" : "bg-[#9a3d2b]"
            }`}
        />
        {available
          ? selectedVariant?.quantityAvailable && selectedVariant.quantityAvailable <= 5
            ? `Only ${selectedVariant.quantityAvailable} available`
            : product.availability
          : "Sold out"}
      </p>

      <div className="grid grid-cols-[130px_minmax(0,1fr)] gap-3 max-[680px]:grid-cols-[104px_minmax(0,1fr)] max-[420px]:grid-cols-1">
        <div
          className="inline-grid h-[52px] grid-cols-3 items-center overflow-hidden rounded-full border border-[var(--line)] bg-[var(--paper)] [&>button]:h-[50px] [&>button]:bg-transparent [&>button]:transition-colors [&>button:hover]:bg-[var(--ivory)] [&>span]:text-center"
          aria-label={`Quantity for ${product.name}`}
        >
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            aria-label="Decrease quantity"
            disabled={isCartBusy || quantity <= 1}
          >
            −
          </button>
          <span aria-live="polite">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity(Math.min(maximumQuantity, quantity + 1))}
            aria-label="Increase quantity"
            disabled={isCartBusy || !available || quantity >= maximumQuantity}
          >
            +
          </button>
        </div>
        <button
          className="inline-flex min-h-[52px] w-full items-center justify-center gap-[14px] rounded-full border border-transparent bg-[var(--forest)] px-6 py-[13px] text-[0.72rem] leading-none font-bold tracking-[0.12em] text-[var(--paper)] uppercase shadow-[0_10px_26px_rgba(21,59,45,0.18)] transition-[transform,background-color,color,border-color,box-shadow] duration-[350ms] ease-[var(--ease)] hover:-translate-y-0.5 hover:bg-[var(--forest-dark)] hover:shadow-[0_14px_30px_rgba(21,59,45,0.22)]"
          type="button"
          onClick={() => void add(true)}
          disabled={isCartBusy || !available || maximumQuantity < 1}
        >
          {isCartBusy ? "Updating bag…" : added ? "Added to your ritual" : "Add to Bag"}
          <span aria-hidden="true">{added ? "✓" : "↗"}</span>
        </button>
      </div>
      <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] gap-3 max-[680px]:grid-cols-1">
        <button
          className="inline-flex min-h-[52px] w-full items-center justify-center gap-[14px] rounded-full border border-[var(--forest)] bg-transparent px-6 py-[13px] text-[0.72rem] leading-none font-bold tracking-[0.12em] text-[var(--forest)] uppercase transition-[transform,background-color,color,border-color] duration-[350ms] ease-[var(--ease)] hover:-translate-y-0.5 hover:bg-[var(--forest)] hover:text-[var(--paper)]"
          type="button"
          onClick={() => void buyNow()}
          disabled={isCartBusy || isBuyingNow || !available || maximumQuantity < 1}
        >
          {isBuyingNow
            ? "Preparing checkout…"
            : source === "shopify"
              ? "Buy now with Shopify"
              : "Continue to checkout preview"}
        </button>
        <button
          className={`flex min-h-[50px] min-w-[150px] items-center justify-center gap-2 rounded-full bg-[var(--paper)] px-4 text-[0.66rem] font-bold tracking-[0.07em] uppercase ring-1 ring-[var(--line)] transition-[transform,ring-color] hover:-translate-y-0.5 hover:ring-[var(--pdp-accent)] max-[680px]:min-h-11 ${wished ? "text-[var(--pdp-accent)]" : "text-[var(--forest)]"
            }`}
          type="button"
          onClick={() => toggleWishlist(product.slug)}
          aria-pressed={wished}
        >
          <span className="text-[1.2rem]" aria-hidden="true">
            {wished ? "♥" : "♡"}
          </span>
          {wished ? "Saved to wishlist" : "Save to wishlist"}
        </button>
      </div>

      {cartError && (
        <div
          className="mt-3 flex items-start justify-between gap-3 rounded-[var(--radius-sm)] bg-[#f7e9e4] px-[15px] py-3 text-[0.72rem] leading-[1.65] text-[#813c2f] ring-1 ring-[#dfb7ad]"
          role="alert"
        >
          <span>{cartError}</span>
          <button
            type="button"
            className="shrink-0 bg-transparent text-base"
            onClick={clearCartError}
            aria-label="Dismiss product error"
          >
            ×
          </button>
        </div>
      )}
      <p className="mt-3 rounded-[var(--radius-sm)] bg-[var(--paper)] px-[15px] py-3 text-[0.72rem] leading-[1.65] text-[var(--muted)] ring-1 ring-[var(--line)]">
        {source === "shopify"
          ? "Payment, delivery, taxes and the final inventory check are handled by Shopify’s secure hosted checkout."
          : "Preview mode keeps this bag on your device and never collects payment details."}
      </p>

      <div className="hidden max-[680px]:fixed max-[680px]:right-0 max-[680px]:bottom-0 max-[680px]:left-0 max-[680px]:z-[90] max-[680px]:grid max-[680px]:grid-cols-[1fr_auto] max-[680px]:items-center max-[680px]:gap-3 max-[680px]:bg-[var(--paper)] max-[680px]:px-3 max-[680px]:pt-2.5 max-[680px]:pb-[calc(10px+env(safe-area-inset-bottom))] max-[680px]:shadow-[0_-12px_35px_rgba(23,63,42,0.14)]">
        <div className="grid leading-[1.2]">
          <strong className="overflow-hidden text-ellipsis whitespace-nowrap font-serif text-base font-normal text-[var(--forest)]">
            {product.name}
          </strong>
          <span className="text-[0.65rem] text-[var(--muted)]">
            {formatCurrency(pricePaise, currencyCode)}
          </span>
        </div>
        <button
          className="min-h-[46px] rounded-full bg-[var(--forest)] px-[19px] text-[0.64rem] font-bold tracking-[0.08em] text-[var(--paper)] uppercase shadow-[0_8px_20px_rgba(21,59,45,0.18)]"
          type="button"
          onClick={() => void add(true)}
          disabled={isCartBusy || !available || maximumQuantity < 1}
        >
          {available ? "Add to Bag" : "Sold out"}
        </button>
      </div>
    </>
  );
}
              </button >
            </div >
          </div >,
  document.body,
        )}
    </div >
  );
}
