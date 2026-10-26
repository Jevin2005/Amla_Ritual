"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { calculateCartBilling, calculateLineBilling, formatBillingCurrency } from "@/domain/cart/billing";
import { CartProductImage } from "@/features/cart/cart-product-image";
import { useStore } from "@/features/store/store-provider";
import styles from "./checkout.module.css";

export function CheckoutOrderSummary({ disabled = false }: { disabled?: boolean }) {
  const {
    products, cart, totalPaise, discountAmountPaise, currencyCode, discountCodes,
    applyDiscountCode, removeDiscountCode, updateQuantity, removeFromCart,
    isCartBusy, cartError, clearCartError,
  } = useStore();
  const [discountInput, setDiscountInput] = useState("");
  const [discountStatus, setDiscountStatus] = useState("");
  const busy = isCartBusy || disabled;
  const billing = calculateCartBilling({ items: cart, totalPaise, discountAmountPaise });

  const handleDiscountSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const code = discountInput.trim();
    if (!code || busy) return;
    setDiscountStatus("");
    if (await applyDiscountCode(code)) {
      setDiscountStatus(`Discount code ${code} updated.`);
      setDiscountInput("");
    }
  };

  return (
    <div className={styles.summary} aria-label="Order summary" aria-busy={isCartBusy}>
      <div className={styles.items}>
        {cart.map((item) => {
          const product = products.find((entry) => item.productId && entry.id === item.productId)
            || products.find((entry) => entry.slug === item.slug);
          const maxQuantity = Math.min(12, item.quantityAvailable ?? 12);
          const lineBilling = calculateLineBilling(item);
          const variantLabel = item.selectedOptions.map((option) => option.value)
            .filter((value) => value !== "Default Title").join(" · ");
          return (
            <article key={item.lineId} className={styles.item}>
              <div className={styles.image}>
                <CartProductImage item={item} product={product} />
              </div>
              <div className={styles.itemDetails}>
                <Link href={`/shop/${product?.slug || item.slug}`} className={styles.name}>
                  {item.productName}
                </Link>
                {variantLabel && <p className={styles.variant}>{variantLabel}</p>}
                <div className={styles.itemActions}>
                  <div className={styles.quantity}>
                    <button type="button" onClick={() => void updateQuantity(item.lineId, item.quantity - 1)}
                      disabled={busy || item.quantity <= 1} aria-label={`Decrease ${item.productName} quantity`}>−</button>
                    <span>{item.quantity}</span>
                    <button type="button" onClick={() => void updateQuantity(item.lineId, item.quantity + 1)}
                      disabled={busy || !item.availableForSale || item.quantity >= maxQuantity}
                      aria-label={`Increase ${item.productName} quantity`}>+</button>
                  </div>
                  <button type="button" className={styles.remove} onClick={() => void removeFromCart(item.lineId)}
                    disabled={busy} aria-label={`Remove ${item.productName}`}>Remove</button>
                </div>
              </div>
              <div className={styles.price}>
                <strong>{formatBillingCurrency(lineBilling.totalPaise, item.currencyCode)}</strong>
                {lineBilling.savingsPaise > 0 && <del>{formatBillingCurrency(lineBilling.mrpPaise, item.currencyCode)}</del>}
              </div>
            </article>
          );
        })}
      </div>

      <details className={styles.discount}>
        <summary>Add a discount code</summary>
        <form onSubmit={handleDiscountSubmit} className={styles.discountForm}>
          <input type="text" value={discountInput} placeholder="Discount code" aria-label="Discount code"
            onChange={(event) => { setDiscountInput(event.target.value); setDiscountStatus(""); clearCartError(); }}
            disabled={busy} />
          <button type="submit" disabled={busy || !discountInput.trim()}>Apply</button>
        </form>
        {discountStatus && <p className={styles.notice} role="status">{discountStatus}</p>}
      </details>
      {discountCodes.length > 0 && <div className={styles.codes}>
        {discountCodes.map((discount) => <span key={discount.code} data-applicable={discount.applicable}>
          <span>{discount.code}{!discount.applicable && " · Not applicable"}</span>
          <button type="button" onClick={() => void removeDiscountCode(discount.code)} disabled={busy}
            aria-label={`Remove discount ${discount.code}`}>×</button>
        </span>)}
      </div>}
      {cartError && <p className={styles.error} role="alert">{cartError}</p>}

      <div className={styles.totals}>
        <dl>
          {billing.discountPaise > 0 && <>
            <div className={styles.subtotal}><dt>Subtotal</dt><dd>{formatBillingCurrency(billing.merchandiseSubtotalPaise, currencyCode)}</dd></div>
            <div className={styles.savings}><dt>Discounts</dt><dd>−{formatBillingCurrency(billing.discountPaise, currencyCode)}</dd></div>
          </>}
          <div className={styles.total} aria-live="polite" aria-atomic="true">
            <dt>Estimated total</dt><dd>{formatBillingCurrency(billing.totalPaise, currencyCode)}</dd>
          </div>
        </dl>
        <p className={styles.note}>Shipping and taxes confirmed at checkout.</p>
      </div>
    </div>
  );
}
