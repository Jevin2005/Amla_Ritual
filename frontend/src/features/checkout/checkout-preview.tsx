"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useStore } from "@/features/store/store-provider";
import { CheckoutOrderSummary } from "./checkout-order-summary";
import { checkoutCartIssue, prepareShopifyCheckout } from "./shopify-checkout";

const primaryButtonClass =
  "inline-flex min-h-[52px] items-center justify-center gap-[14px] rounded-full border border-transparent bg-[var(--forest)] px-7 py-[14px] text-[0.74rem] font-bold uppercase leading-none tracking-[0.12em] text-[var(--paper)] shadow-[0_10px_26px_rgba(21,59,45,0.18)] transition-[transform,background-color,box-shadow] duration-[350ms] ease-[var(--ease)] hover:-translate-y-0.5 hover:bg-[var(--forest-dark)] hover:shadow-[0_14px_30px_rgba(21,59,45,0.22)]";

export function CheckoutPreview({ checkoutHosts }: { checkoutHosts: string[] }) {
  const { source, cart, subtotalPaise, totalPaise, discountAmountPaise, currencyCode,
    isHydrated, isCartBusy, cartError, cartWarnings, refreshCart, track } = useStore();
  const [handoffError, setHandoffError] = useState("");
  const [isLeaving, setIsLeaving] = useState(false);
  const submitting = useRef(false);
  useEffect(() => {
    const restore = () => { submitting.current = false; setIsLeaving(false); };
    window.addEventListener("pageshow", restore);
    return () => window.removeEventListener("pageshow", restore);
  }, []);

  const continueToCheckout = async () => {
    if (submitting.current || isCartBusy) return;
    submitting.current = true;
    setIsLeaving(true);
    setHandoffError("");
    try {
      const next = await prepareShopifyCheckout({ source, allowedHosts: checkoutHosts,
        previousCart: { items: cart, subtotalPaise, totalPaise, discountAmountPaise, currencyCode }, refreshCart });
      track("begin_checkout", { value: next.cart.totalPaise / 100, currency: next.cart.currencyCode, mode: "shopify_hosted" });
      window.location.assign(next.url);
    } catch (error) {
      setHandoffError(error instanceof Error ? error.message : "Checkout could not be opened. Please try again.");
      submitting.current = false;
      setIsLeaving(false);
    }
  };
  const cartIssue = checkoutCartIssue({ items: cart });

  // Hydration state
  if (!isHydrated) {
    return (
      <section
        className="mx-auto flex min-h-[560px] w-full max-w-[960px] flex-col items-center justify-center px-6 py-[70px] text-center max-[680px]:min-h-[480px]"
        aria-busy="true"
        aria-live="polite"
      >
        <span
          className="mb-[30px] grid size-[90px] animate-pulse place-items-center rounded-full border border-[var(--line)] text-2xl text-[var(--botanical)] motion-reduce:animate-none"
          aria-hidden="true"
        >
          ◯
        </span>
        <p className="m-0 font-serif text-[clamp(2rem,3vw,3rem)] leading-[1.04]">
          Restoring your ritual bag.
        </p>
        <p className="max-w-[360px] text-[var(--muted)] mt-2">
          {source === "shopify"
            ? "Connecting to secure checkout for current prices and inventory…"
            : "Checking the botanicals saved on this device…"}
        </p>
      </section>
    );
  }

  // Empty Cart State
  if (!cart.length) {
    return (
      <section className="mx-auto flex min-h-[560px] w-full max-w-[960px] flex-col items-center justify-center px-6 py-[70px] text-center max-[680px]:min-h-[480px]">
        <span
          className="mb-[30px] grid size-[90px] place-items-center rounded-full border border-[var(--line)] text-2xl text-[var(--botanical)]"
          aria-hidden="true"
        >
          🌿
        </span>
        <h2 className="m-0 font-serif text-[clamp(2rem,3vw,3rem)] leading-[1.04] text-[var(--forest)]">
          Your ritual bag is waiting.
        </h2>
        <p className="max-w-[420px] text-[var(--muted)] mt-2.5 text-[0.85rem]">
          {cartError || "Select a fresh wildcrafted botanical powder to begin your wash-day ritual checkout."}
        </p>
        <Link className={`${primaryButtonClass} mt-6`} href="/shop">
          Shop the Botanical Collection
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto flex flex-col min-[961px]:grid min-[961px]:grid-cols-[1.15fr_0.85fr] w-full max-w-[1280px] gap-[clamp(28px,4vw,72px)] px-[clamp(16px,4vw,56px)] pb-[120px] pt-[35px] max-[680px]:px-3.5 max-[680px]:pb-[80px] max-[680px]:pt-[20px]">
      {/* ── Left Column on Desktop / 2nd on Mobile (Phone View): Checkout Form ── */}
      <div className="order-2 min-[961px]:order-1 w-full">
        <div className="mb-6 max-[960px]:mt-2">
          <h2 className="font-serif text-[clamp(2.1rem,3.8vw,3.4rem)] font-normal leading-[1] tracking-tight text-[var(--forest)]">
            Your next step, securely.
          </h2>
          <p className="mt-1.5 text-[0.82rem] text-[var(--muted)] max-w-[580px]">
            Review your botanicals, then continue to NatureMist secure checkout to enter your delivery details and choose a payment method.
          </p>
        </div>

        <div className="rounded-3xl border border-[var(--line)] bg-[var(--paper)] p-7 max-[680px]:p-5">
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-[var(--botanical)]">Secure checkout</p>
          <h3 className="mt-3 font-serif text-[1.8rem] leading-tight text-[var(--forest)]">A little closer to your ritual.</h3>
          <p className="mt-3 text-[0.85rem] leading-relaxed text-[var(--muted)]">Your bag and applied discounts travel with you. Delivery charges and the final total are shown before you pay.</p>
          <button type="button" onClick={() => void continueToCheckout()}
            disabled={source !== "shopify" || isCartBusy || isLeaving || Boolean(cartIssue)}
            aria-busy={isLeaving}
            className={`${primaryButtonClass} mt-6 w-full disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0`}>
            {isLeaving ? "Opening secure checkout…" : "Continue to secure checkout"}
          </button>
          {source !== "shopify" && <p className="mt-4 text-sm text-[var(--muted)]" role="status">This is a preview bag. Checkout is unavailable.</p>}
          {(handoffError || cartIssue) && <p className="mt-4 text-sm text-[#9a3d2b]" role="alert">{handoffError || cartIssue}</p>}
          {cartWarnings.map((warning, index) => <p key={`${warning.code}-${index}`} className="mt-3 text-sm text-[var(--muted)]" role="status">{warning.message}</p>)}
          <p className="mt-4 text-center text-[0.72rem] text-[var(--muted)]">Payments and order confirmation are handled securely by Shopify.</p>
          <Link href="/shop" className="mt-5 block text-center text-sm text-[var(--forest)] underline underline-offset-4">Continue shopping</Link>
        </div>
      </div>

      {/* ── Right Column on Desktop / 1st at TOP on Mobile (Phone View): Ritual Bag Summary ── */}
      <div className="order-1 min-[961px]:order-2 self-start w-full">
        <CheckoutOrderSummary />
      </div>
    </section>
  );
}
