"use client";

import { useEffect, useRef, useState } from "react";
import { formatCurrency, getDefaultVariant } from "@/domain/catalog/products";
import { useStore } from "@/features/store/store-provider";

type HeroPurchaseProps = {
  slug: string;
  name: string;
  pricePaise: number;
};

export function HeroPurchase({ slug, name, pricePaise }: HeroPurchaseProps) {
  const {
    products,
    source,
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
    <div className="w-full max-w-[430px]">
      <div className="flex items-baseline justify-between gap-2 border-t border-[rgba(23,63,42,0.16)] py-2 max-[680px]:py-1.5">
        <span className="[color:var(--forest)] [font-family:var(--font-display)] text-[1.45rem] max-[900px]:text-[1.2rem] max-[680px]:text-[1.05rem] max-[420px]:text-[0.95rem]">
          {formatCurrency(currentPricePaise, currencyCode)}
        </span>
        <small className="[color:var(--muted)] text-[0.62rem] tracking-[0.06em] max-[680px]:text-[0.48rem] max-[420px]:text-[0.42rem] max-[680px]:opacity-90">
          {source === "shopify" ? "Live price" : "Preview price"}
        </small>
      </div>
      <div className="flex items-center gap-2 max-[680px]:mt-0.5 max-[680px]:gap-1.5">
        <button
          className="inline-flex min-h-[52px] min-w-[min(245px,calc(100%_-_62px))] items-center justify-center gap-2.5 rounded-full border border-transparent bg-[var(--forest)] px-5 py-3 text-[0.72rem] leading-none font-bold tracking-[0.1em] text-[var(--paper)] uppercase shadow-[0_10px_26px_rgba(21,59,45,0.2)] [transition:transform_300ms_var(--ease),background-color_300ms_var(--ease),box-shadow_300ms_var(--ease)] motion-reduce:transition-none hover:bg-[var(--forest-dark)] hover:shadow-[0_14px_30px_rgba(21,59,45,0.24)] hover:[transform:translateY(-2px)] active:[transform:scale(0.98)] max-[900px]:min-h-[44px] max-[900px]:px-3.5 max-[900px]:text-[0.66rem] max-[680px]:min-h-[36px] max-[680px]:min-w-0 max-[680px]:flex-1 max-[680px]:gap-1.5 max-[680px]:px-2 max-[680px]:py-1.5 max-[680px]:text-[0.54rem] max-[680px]:tracking-[0.04em] max-[420px]:text-[0.48rem]"
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
          className={`grid size-[48px] shrink-0 place-items-center rounded-full border border-[rgba(23,63,42,0.4)] text-[1.3rem] [transition:color_240ms_ease,background_240ms_ease,transform_240ms_ease] motion-reduce:transition-none hover:bg-[var(--forest)] hover:text-[var(--paper)] hover:[transform:translateY(-2px)] active:[transform:scale(0.92)] max-[900px]:size-[42px] max-[900px]:text-[1.1rem] max-[680px]:size-[36px] max-[680px]:text-[0.95rem] ${
            wished
              ? "bg-[var(--forest)] text-[var(--paper)] [transform:translateY(-2px)]"
              : "bg-[rgba(255,253,246,0.85)] text-[var(--forest)]"
          }`}
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
        className="group mt-2.5 inline-flex items-center gap-1.5 text-[0.62rem] font-bold tracking-[0.1em] text-[var(--forest)] uppercase max-[680px]:mt-1.5 max-[680px]:gap-1 max-[680px]:text-[0.48rem]"
        href="#featured-ritual"
      >
        Explore the ritual{" "}
        <span
          className="[transition:transform_220ms_ease] motion-reduce:transition-none group-hover:[transform:translateY(4px)]"
          aria-hidden="true"
        >
          ↓
        </span>
      </a>
    </div>
  );
}
