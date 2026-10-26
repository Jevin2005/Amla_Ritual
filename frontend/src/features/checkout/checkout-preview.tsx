"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useStore } from "@/features/store/store-provider";
import { CheckoutOrderSummary } from "./checkout-order-summary";
import { checkoutCartIssue, prepareShopifyCheckout } from "./shopify-checkout";
import styles from "./checkout.module.css";

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
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (!isHydrated) {
    return (
      <section className={styles.state} aria-busy="true" aria-live="polite">
        <span className={styles.spinner} aria-hidden="true" />
        <h1>Loading your bag…</h1>
      </section>
    );
  }

  if (!cart.length) {
    return (
      <section className={styles.state}>
        <h1>Your bag is empty</h1>
        {cartError && <p className={styles.error} role="alert">{cartError}</p>}
        <Link className={styles.primary} href="/shop">
          Continue shopping
        </Link>
      </section>
    );
  }

  return (
    <section className={styles.checkout} aria-labelledby="checkout-title">
      <div className={styles.card}>
        <header className={styles.header}>
          <h1 id="checkout-title">Checkout</h1>
          <span>{itemCount} {itemCount === 1 ? "item" : "items"}</span>
        </header>
        <CheckoutOrderSummary disabled={isLeaving} />
        <div className={styles.actions}>
          {source !== "shopify" && <p className={styles.notice} role="status">Checkout is unavailable in preview mode.</p>}
          {(handoffError || cartIssue) && <p className={styles.error} role="alert">{handoffError || cartIssue}</p>}
          {cartWarnings.map((warning, index) => <p key={`${warning.code}-${index}`} className={styles.notice} role="status">{warning.message}</p>)}
          <button type="button" onClick={() => void continueToCheckout()}
            disabled={source !== "shopify" || isCartBusy || isLeaving || Boolean(cartIssue)}
            aria-busy={isLeaving}
            className={styles.primary}>
            <svg width="16" height="18" viewBox="0 0 16 18" fill="none" aria-hidden="true">
              <rect x="2" y="8" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M4.5 8V5a3.5 3.5 0 0 1 7 0v3" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            {isLeaving ? "Opening checkout…" : "Continue to secure checkout"}
          </button>
          <Link href="/shop" className={styles.back}>Continue shopping</Link>
        </div>
      </div>
    </section>
  );
}
