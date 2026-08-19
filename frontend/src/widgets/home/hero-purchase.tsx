"use client";

import { useEffect, useRef, useState } from "react";
import { formatCurrency } from "@/domain/catalog/products";
import { useStore } from "@/features/store/store-provider";

type HeroPurchaseProps = {
  slug: string;
  name: string;
  pricePaise: number;
};

export function HeroPurchase({ slug, name, pricePaise }: HeroPurchaseProps) {
  const { addToCart, isWishlisted, toggleWishlist } = useStore();
  const [added, setAdded] = useState(false);
  const resetTimer = useRef<number | null>(null);
  const wished = isWishlisted(slug);

  useEffect(() => {
    return () => {
      if (resetTimer.current) window.clearTimeout(resetTimer.current);
    };
  }, []);

  const add = () => {
    addToCart(slug);
    setAdded(true);
    if (resetTimer.current) window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="w-full max-w-[430px]">
      <div className="flex items-baseline justify-between gap-2 border-t border-[rgba(23,63,42,0.14)] py-2 max-[680px]:py-1.5">
        <span className="[color:var(--forest)] [font-family:var(--font-display)] text-[1.45rem] max-[900px]:text-[1.25rem] max-[680px]:text-[1.05rem]">
          {formatCurrency(pricePaise)}
        </span>
        <small className="[color:var(--muted)] text-[0.62rem] tracking-[0.06em] max-[680px]:text-[0.46rem] max-[680px]:opacity-90">
          Preview price
        </small>
      </div>
      <div className="flex items-center gap-2 max-[680px]:mt-0.5 max-[680px]:gap-1.5">
        <button
          className="inline-flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-[2px] border border-transparent bg-[var(--botanical)] px-4 py-2.5 text-[0.68rem] leading-none font-bold tracking-[0.1em] text-[var(--paper)] uppercase shadow-[0_4px_14px_rgba(63,125,58,0.22)] [transition:transform_300ms_var(--ease),background-color_300ms_var(--ease),box-shadow_300ms_var(--ease)] motion-reduce:transition-none hover:bg-[var(--forest-dark)] hover:[transform:translateY(-2px)] active:[transform:scale(0.98)] max-[900px]:min-h-[42px] max-[680px]:min-h-[36px] max-[680px]:px-2.5 max-[680px]:text-[0.52rem] max-[680px]:tracking-[0.06em]"
          type="button"
          onClick={add}
        >
          {added ? "Added" : "Add to Bag"}
          <span aria-hidden="true">{added ? "✓" : "↗"}</span>
        </button>
        <button
          className={`grid size-[46px] shrink-0 place-items-center rounded-full border border-[rgba(23,63,42,0.35)] text-[1.2rem] [transition:color_240ms_ease,background_240ms_ease,transform_240ms_ease] motion-reduce:transition-none hover:bg-[var(--forest)] hover:text-[var(--paper)] hover:[transform:translateY(-2px)] active:[transform:scale(0.92)] max-[900px]:size-[42px] max-[680px]:size-[36px] max-[680px]:text-[1rem] ${wished
              ? "bg-[var(--forest)] text-[var(--paper)] [transform:translateY(-2px)]"
              : "bg-[rgba(255,253,246,0.85)] text-[var(--forest)]"
            }`}
          type="button"
          aria-label={wished ? `Remove ${name} from wishlist` : `Save ${name} to wishlist`}
          aria-pressed={wished}
          onClick={() => toggleWishlist(slug)}
        >
          <span aria-hidden="true">{wished ? "♥" : "♡"}</span>
        </button>
      </div>
      <a
        className="group mt-2.5 inline-flex items-center gap-1.5 text-[0.6rem] font-bold tracking-[0.1em] text-[var(--forest)] uppercase max-[680px]:mt-1.5 max-[680px]:text-[0.48rem]"
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
