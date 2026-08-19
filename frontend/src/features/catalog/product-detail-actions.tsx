"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatCurrency, type Product } from "@/domain/catalog/products";
import { useStore } from "@/features/store/store-provider";

export function ProductDetailActions({ product }: { product: Product }) {
  const router = useRouter();
  const { addToCart, toggleWishlist, isWishlisted, track } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const wished = isWishlisted(product.slug);

  const add = (openDrawer = true) => {
    addToCart(product.slug, quantity, openDrawer);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  const buyNow = () => {
    add(false);
    track("begin_checkout", {
      item_id: product.slug,
      quantity,
      value: (product.pricePaise * quantity) / 100,
      currency: "INR",
      mode: "preview_handoff",
    });
    router.push("/checkout");
  };

  return (
    <>
      <div className="grid pt-[27px] pb-3.5">
        <span className="font-serif text-[2rem] text-[var(--forest)]">{formatCurrency(product.pricePaise)}</span>
        <small className="text-[0.57rem] tracking-[0.1em] text-[var(--muted)] uppercase">Editable preview price</small>
      </div>
      <p className="mb-[18px] flex items-center gap-[9px] text-[0.68rem] tracking-[0.08em] text-[var(--muted)] uppercase">
        <i className="size-[7px] rounded-full bg-[var(--pdp-accent)] shadow-[0_0_0_4px_color-mix(in_srgb,var(--pdp-accent)_14%,transparent)]" /> {product.availability}
      </p>
      <div className="grid grid-cols-[130px_minmax(0,1fr)] gap-3 max-[680px]:grid-cols-[104px_minmax(0,1fr)] max-[420px]:grid-cols-1">
        <div className="inline-grid h-[52px] grid-cols-3 items-center overflow-hidden rounded-full border border-[var(--line)] bg-[var(--paper)] [&>button]:h-[50px] [&>button]:bg-transparent [&>button]:transition-colors [&>button:hover]:bg-[var(--ivory)] [&>span]:text-center" aria-label={`Quantity for ${product.name}`}>
          <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity">−</button>
          <span aria-live="polite">{quantity}</span>
          <button type="button" onClick={() => setQuantity(Math.min(12, quantity + 1))} aria-label="Increase quantity">+</button>
        </div>
        <button className="inline-flex min-h-[52px] w-full items-center justify-center gap-[14px] rounded-full border border-transparent bg-[var(--forest)] px-6 py-[13px] text-[0.72rem] leading-none font-bold tracking-[0.12em] text-[var(--paper)] uppercase shadow-[0_10px_26px_rgba(21,59,45,0.18)] transition-[transform,background-color,color,border-color,box-shadow] duration-[350ms] ease-[var(--ease)] hover:-translate-y-0.5 hover:bg-[var(--forest-dark)] hover:shadow-[0_14px_30px_rgba(21,59,45,0.22)]" type="button" onClick={() => add(true)}>
          {added ? "Added to your ritual" : "Add to Bag"}
          <span aria-hidden="true">{added ? "✓" : "↗"}</span>
        </button>
      </div>
      <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] gap-3 max-[680px]:grid-cols-1">
        <button className="inline-flex min-h-[52px] w-full items-center justify-center gap-[14px] rounded-full border border-[var(--forest)] bg-transparent px-6 py-[13px] text-[0.72rem] leading-none font-bold tracking-[0.12em] text-[var(--forest)] uppercase transition-[transform,background-color,color,border-color] duration-[350ms] ease-[var(--ease)] hover:-translate-y-0.5 hover:bg-[var(--forest)] hover:text-[var(--paper)]" type="button" onClick={buyNow}>
          Continue to secure checkout
        </button>
        <button
          className={`flex min-h-[50px] min-w-[150px] items-center justify-center gap-2 rounded-full bg-[var(--paper)] px-4 text-[0.66rem] font-bold tracking-[0.07em] uppercase ring-1 ring-[var(--line)] transition-[transform,ring-color] hover:-translate-y-0.5 hover:ring-[var(--pdp-accent)] max-[680px]:min-h-11 ${
            wished ? "text-[var(--pdp-accent)]" : "text-[var(--forest)]"
          }`}
          type="button"
          onClick={() => toggleWishlist(product.slug)}
          aria-pressed={wished}
        >
          <span className="text-[1.2rem]" aria-hidden="true">{wished ? "♥" : "♡"}</span>
          {wished ? "Saved to wishlist" : "Save to wishlist"}
        </button>
      </div>
      <p className="mt-3 rounded-[var(--radius-sm)] bg-[var(--paper)] px-[15px] py-3 text-[0.72rem] leading-[1.65] text-[var(--muted)] ring-1 ring-[var(--line)]">
        Checkout is a safe preview handoff and does not collect payment details until a verified provider is connected.
      </p>

      <div className="hidden max-[680px]:fixed max-[680px]:right-0 max-[680px]:bottom-0 max-[680px]:left-0 max-[680px]:z-[90] max-[680px]:grid max-[680px]:grid-cols-[1fr_auto] max-[680px]:items-center max-[680px]:gap-3 max-[680px]:bg-[var(--paper)] max-[680px]:px-3 max-[680px]:pt-2.5 max-[680px]:pb-[calc(10px+env(safe-area-inset-bottom))] max-[680px]:shadow-[0_-12px_35px_rgba(23,63,42,0.14)]">
        <div className="grid leading-[1.2]">
          <strong className="overflow-hidden text-ellipsis whitespace-nowrap font-serif text-base font-normal text-[var(--forest)]">{product.name}</strong>
          <span className="text-[0.65rem] text-[var(--muted)]">{formatCurrency(product.pricePaise)}</span>
        </div>
        <button className="min-h-[46px] rounded-full bg-[var(--forest)] px-[19px] text-[0.64rem] font-bold tracking-[0.08em] text-[var(--paper)] uppercase shadow-[0_8px_20px_rgba(21,59,45,0.18)]" type="button" onClick={() => add(true)}>Add to Bag</button>
      </div>
    </>
  );
}
