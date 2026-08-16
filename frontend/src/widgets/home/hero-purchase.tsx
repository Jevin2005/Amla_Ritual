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
      <div className="flex items-baseline justify-between gap-4 border-t border-[rgba(23,63,42,0.18)] py-[14px_12px] max-[680px]:flex-row max-[680px]:items-baseline max-[680px]:gap-2 max-[680px]:py-[8px_7px]">
        <span className="[color:var(--forest)] [font-family:var(--font-display)] text-[1.55rem]">
          {formatCurrency(pricePaise)}
        </span>
        <small className="[color:var(--muted)] text-[0.62rem] tracking-[0.04em] max-[680px]:hidden">
          Preview price · final pack details pending
        </small>
      </div>
      <div className="flex items-center gap-3 max-[680px]:gap-[10px]">
        <button
          className="inline-flex min-h-[50px] min-w-[min(245px,calc(100%_-_62px))] items-center justify-center gap-[22px] border border-transparent bg-[var(--botanical)] px-6 py-[13px] text-[0.72rem] leading-none font-bold tracking-[0.12em] text-[var(--paper)] uppercase [transition:transform_350ms_var(--ease),background-color_350ms_var(--ease),color_350ms_var(--ease),border-color_350ms_var(--ease)] motion-reduce:transition-none hover:bg-[var(--forest-dark)] hover:[transform:translateY(-2px)] max-[900px]:min-h-[46px] max-[900px]:px-4 max-[680px]:min-h-[50px] max-[680px]:min-w-0 max-[680px]:flex-1 max-[680px]:gap-2 max-[680px]:px-2 max-[680px]:text-[0.63rem]"
          type="button"
          onClick={add}
        >
          <span className="max-[680px]:hidden">
            {added ? "Added to your ritual" : "Add to Bag"}
          </span>
          <span className="hidden leading-[1.08] max-[680px]:block">
            {added ? (
              "Added"
            ) : (
              <>
                Add to
                <br />
                bag
              </>
            )}
          </span>
          <span aria-hidden="true">{added ? "✓" : "↗"}</span>
        </button>
        <button
          className={`grid size-[50px] shrink-0 place-items-center rounded-full border border-[rgba(23,63,42,0.45)] text-[1.35rem] [transition:color_240ms_ease,background_240ms_ease,transform_240ms_ease] motion-reduce:transition-none hover:bg-[var(--forest)] hover:text-[var(--paper)] hover:[transform:translateY(-2px)] max-[900px]:size-[46px] max-[680px]:size-[50px] ${
            wished
              ? "bg-[var(--forest)] text-[var(--paper)] [transform:translateY(-2px)]"
              : "bg-[rgba(255,253,246,0.7)] text-[var(--forest)]"
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
        className="group mt-[15px] inline-flex items-center gap-[9px] text-[0.61rem] font-bold tracking-[0.12em] text-[var(--forest)] uppercase max-[680px]:hidden"
        href="#amla-ritual"
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
