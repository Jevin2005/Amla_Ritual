"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { calculateCartBilling, calculateLineBilling, formatBillingCurrency } from "@/domain/cart/billing";
import { useStore } from "@/features/store/store-provider";
import { useModalFocus } from "@/shared/hooks/use-modal-focus";
import { CartProductImage } from "./cart-product-image";
import { CartBillSummary } from "./cart-bill-summary";
import styles from "./cart-drawer.module.css";

export function CartDrawer() {
  const {
    products, source, cart, cartCount, totalPaise,
    discountAmountPaise, currencyCode, totalsEstimated, discountCodes,
    cartError, cartWarnings, isCartBusy, isHydrated, isCartOpen, closeCart,
    updateQuantity, removeFromCart, applyDiscountCode, removeDiscountCode,
    clearCartError, track,
  } = useStore();
  const [discount, setDiscount] = useState("");
  const [appliedCode, setAppliedCode] = useState("");
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const drawerRef = useRef<HTMLElement>(null);
  useModalFocus(isCartOpen, drawerRef, closeCart);
  const loading = !isHydrated || isCartBusy;
  const unavailable = cart.some((item) => !item.availableForSale || item.quantityAvailable === 0);
  const overStock = cart.some((item) => item.quantity > Math.min(12, item.quantityAvailable ?? 12));
  const checkoutBlocked = loading || unavailable || overStock;
  const discountApplied = appliedCode && discountCodes.some((code) => code.code.toLowerCase() === appliedCode.toLowerCase() && code.applicable);
  const billing = calculateCartBilling({ items: cart, totalPaise, discountAmountPaise });

  async function applyDiscount(event: FormEvent) {
    event.preventDefault();
    const code = discount.trim();
    if (!code || loading || isApplyingDiscount) return;
    setAppliedCode("");
    setIsApplyingDiscount(true);
    try {
      if (await applyDiscountCode(code)) {
        setAppliedCode(code);
        setDiscount("");
      }
    } finally {
      setIsApplyingDiscount(false);
    }
  }

  const notices = (
    <>
      {cartError && <div className={styles.error} role="alert"><span>{cartError}</span><button type="button" onClick={clearCartError} aria-label="Dismiss bag error">×</button></div>}
      {cartWarnings.map((warning, index) => <p className={styles.warning} role="status" key={`${warning.code}-${index}`}>{warning.message}</p>)}
    </>
  );

  return (
    <div className={`${styles.overlay} ${isCartOpen ? styles.open : ""}`} aria-hidden={!isCartOpen} inert={!isCartOpen}>
      <button className={styles.backdrop} type="button" onClick={closeCart} aria-label="Close bag backdrop" tabIndex={-1} />
      <aside ref={drawerRef} className={styles.drawer} role="dialog" aria-modal="true" aria-labelledby="bag-title" aria-busy={loading}>
        <header className={styles.header}>
          <div><p className={styles.eyebrow}>Your daily ritual</p><h2 id="bag-title">Your bag <span>{cartCount}</span></h2></div>
          <button type="button" className={styles.close} onClick={closeCart} aria-label="Close bag">×</button>
        </header>

        {cart.length === 0 ? (
          <div className={styles.empty}>
            {loading ? <><span className={styles.spinner} aria-hidden="true" /><p role="status">Getting your bag ready…</p></> : <>
              <svg width="56" height="64" viewBox="0 0 56 64" fill="none" aria-hidden="true"><path d="M9 19h38l4 40H5l4-40Z" stroke="currentColor" strokeWidth="1.5" /><path d="M18 23V13a10 10 0 0 1 20 0v10" stroke="currentColor" strokeWidth="1.5" /></svg>
              <h3>A little care starts here.</h3><p>Your bag is waiting for your favourite botanicals.</p>
              {notices}
              <Link className={styles.primary} href="/shop" onClick={closeCart}>Explore the collection <span aria-hidden="true">↗</span></Link>
            </>}
          </div>
        ) : (
          <>
            <div className={styles.content}>


              <div className={styles.list} aria-label="Bag items">
                {cart.map((item) => {
                  const product = products.find((entry) => item.productId && entry.id === item.productId) || products.find((entry) => entry.slug === item.slug);
                  const productPath = `/shop/${product?.slug || item.slug}`;
                  const maxQuantity = Math.min(12, item.quantityAvailable ?? 12);
                  const variantLabel = item.selectedOptions.map((option) => option.value).filter((value) => value !== "Default Title").join(" · ");
                  const subtitle = variantLabel || (item.variantTitle !== "Default Title" ? item.variantTitle : "") || product?.subtitle;
                  const lineBilling = calculateLineBilling(item);
                  return (
                    <article className={styles.item} key={item.lineId} aria-label={item.productName}>
                      <Link className={styles.image} href={productPath} onClick={closeCart} aria-label={`View ${item.productName}`}>
                        <CartProductImage item={item} product={product} />
                      </Link>
                      <div className={styles.details}>
                        <Link className={styles.name} href={productPath} onClick={closeCart}>{item.productName}</Link>
                        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
                        <p className={styles.unitPrice}>{item.quantity} × {formatBillingCurrency(item.pricePaise, item.currencyCode)} each</p>
                        <div className={styles.price}>
                          <strong>{formatBillingCurrency(lineBilling.totalPaise, item.currencyCode)}</strong>
                          {lineBilling.savingsPaise > 0 && <del>{formatBillingCurrency(lineBilling.mrpPaise, item.currencyCode)}</del>}
                        </div>
                        {lineBilling.savingsPaise > 0 && <p className={styles.itemSavings}>Save {formatBillingCurrency(lineBilling.savingsPaise, item.currencyCode)}</p>}
                        {(!item.availableForSale || maxQuantity === 0) ? <p className={styles.stock}>Currently unavailable</p> : item.quantity > maxQuantity ? <p className={styles.stock}>Reduce quantity to {maxQuantity} or fewer.</p> : null}
                        <div className={styles.actions}>
                          <div className={styles.quantity} role="group" aria-label={`Quantity for ${item.productName}`}>
                            <button type="button" onClick={() => void updateQuantity(item.lineId, item.quantity - 1)} disabled={loading || item.quantity <= 1} aria-label={`Decrease ${item.productName} quantity`}>−</button>
                            <span aria-live="polite" aria-atomic="true">{item.quantity}</span>
                            <button type="button" onClick={() => void updateQuantity(item.lineId, item.quantity + 1)} disabled={loading || !item.availableForSale || item.quantity >= maxQuantity} aria-label={`Increase ${item.productName} quantity`}>+</button>
                          </div>
                          <button className={styles.remove} type="button" onClick={() => void removeFromCart(item.lineId)} disabled={loading} aria-label={`Remove ${item.productName} from bag`}>Remove</button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
              <div className={styles.extras}>
                {source === "shopify" && <form onSubmit={(event) => void applyDiscount(event)}>
                  <label className={styles.label} htmlFor="discount-code">Have a discount code?</label>
                  <div className={styles.discountInput}>
                    <input id="discount-code" value={discount} onChange={(event) => { setDiscount(event.target.value); setAppliedCode(""); clearCartError(); }} placeholder="Enter code" autoComplete="off" disabled={loading} />
                    <button type="submit" disabled={loading || !discount.trim()}>{isApplyingDiscount ? "Applying…" : "Apply"}</button>
                  </div>
                  {discountApplied && <p className={styles.success} role="status">{appliedCode} applied.</p>}
                </form>}
                {discountCodes.length > 0 && <div className={styles.codes} aria-label="Discount codes">{discountCodes.map((code) => <span key={code.code} data-applicable={code.applicable}>{code.code}{!code.applicable && " · Not applicable"}<button type="button" onClick={() => void removeDiscountCode(code.code)} disabled={loading} aria-label={`Remove discount code ${code.code}`}>×</button></span>)}</div>}
                {notices}
              </div>
              <div className={styles.bill}>
                <CartBillSummary billing={billing} currencyCode={currencyCode} estimated={totalsEstimated} shippingPending busy={loading} />
                <p className={styles.note}>{source === "shopify" ? "All taxes are included in product prices. Delivery is confirmed at checkout." : "Preview bag. No order or payment will be created."}</p>
              </div>
            </div>
            <footer className={styles.footer}>
              <div className={styles.payable} aria-live="polite" aria-atomic="true"><span>{loading ? "Updating bag…" : "Estimated total"}</span><strong>{formatBillingCurrency(billing.totalPaise, currencyCode)}</strong></div>
              {(unavailable || overStock) && <p className={styles.stock} role="status">Remove unavailable items or adjust quantities to continue.</p>}
              {checkoutBlocked ? <button className={styles.primary} type="button" disabled>{loading ? "Updating bag…" : "Review bag items"}</button> : <Link className={styles.primary} href="/checkout" onClick={() => { track("begin_checkout", { value: billing.totalPaise / 100, currency: currencyCode, mode: "in_app_checkout" }); closeCart(); }}>Continue to checkout <span aria-hidden="true">→</span></Link>}
              <button className={styles.continue} type="button" onClick={closeCart}>Continue shopping</button>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
