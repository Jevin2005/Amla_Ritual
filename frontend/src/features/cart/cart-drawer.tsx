"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { formatCurrency, calculateDiscountPercent } from "@/domain/catalog/products";
import { useStore } from "@/features/store/store-provider";
import { useModalFocus } from "@/shared/hooks/use-modal-focus";
import { CartProductImage } from "./cart-product-image";
import styles from "./cart-drawer.module.css";

export function CartDrawer() {
  const {
    products, source, cart, cartCount, subtotalPaise, totalPaise,
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


  const totalMrpPaise = cart.reduce((sum, line) => {
    const prod = products.find((entry) => line.productId && entry.id === line.productId) || products.find((entry) => entry.slug === line.slug);
    const comp = line.compareAtPricePaise && line.compareAtPricePaise > line.pricePaise
      ? line.compareAtPricePaise
      : (prod?.compareAtPricePaise && prod.compareAtPricePaise > line.pricePaise ? prod.compareAtPricePaise : line.pricePaise);
    return sum + comp * line.quantity;
  }, 0);
  const totalSavingsOnMrp = Math.max(0, totalMrpPaise - subtotalPaise);
  const totalSavingsAll = totalSavingsOnMrp + discountAmountPaise;

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
                  return (
                    <article className={styles.item} key={item.lineId} aria-label={item.productName}>
                      <Link className={styles.image} href={productPath} onClick={closeCart} aria-label={`View ${item.productName}`}>
                        <CartProductImage item={item} product={product} />
                      </Link>
                      <div className={styles.details}>
                        <Link className={styles.name} href={productPath} onClick={closeCart}>{item.productName}</Link>
                        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
                        {(() => {
                          const compareAtPaise = item.compareAtPricePaise && item.compareAtPricePaise > item.pricePaise
                            ? item.compareAtPricePaise
                            : (product?.compareAtPricePaise && product.compareAtPricePaise > item.pricePaise ? product.compareAtPricePaise : null);
                          const itemDiscountPercent = calculateDiscountPercent(item.pricePaise, compareAtPaise);
                          const itemSavingsPaise = compareAtPaise ? (compareAtPaise - item.pricePaise) * item.quantity : 0;
                          return (
                            <>
                              <div className={styles.price}>
                                <strong>{formatCurrency(item.lineTotalPaise, item.currencyCode)}</strong>
                                {compareAtPaise ? (
                                  <>
                                    <del>{formatCurrency(compareAtPaise * item.quantity, item.currencyCode)}</del>
                                    <span className="inline-flex items-center rounded bg-[#2d6a2f]/10 px-1.5 py-0.5 text-[0.66rem] font-bold text-[#235825]">
                                      {itemDiscountPercent}% OFF
                                    </span>
                                  </>
                                ) : item.discountAmountPaise > 0 ? (
                                  <del>{formatCurrency(item.lineSubtotalPaise, item.currencyCode)}</del>
                                ) : null}
                              </div>
                              {itemSavingsPaise > 0 && (
                                <p className="mt-0.5 m-0 text-[0.66rem] font-semibold text-[#2d6a2f]">
                                  Save {formatCurrency(itemSavingsPaise, item.currencyCode)}
                                </p>
                              )}
                            </>
                          );
                        })()}
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
            </div>
            <footer className={styles.footer}>
              {totalSavingsAll > 0 && (
                <div className="mb-3 flex items-center justify-between rounded-xl bg-[#2d6a2f]/10 px-3.5 py-2 text-[0.74rem] font-bold text-[#235825] ring-1 ring-[#2d6a2f]/20">
                  <span className="flex items-center gap-1.5">
                    <span aria-hidden="true">🎉</span>
                    <span>Total Savings on this order:</span>
                  </span>
                  <span>{formatCurrency(totalSavingsAll, currencyCode)}</span>
                </div>
              )}
              <dl className={styles.totals}>
                {totalMrpPaise > subtotalPaise && (
                  <div>
                    <dt>Total MRP</dt>
                    <dd className="line-through text-[var(--muted)]">{formatCurrency(totalMrpPaise, currencyCode)}</dd>
                  </div>
                )}
                {totalSavingsAll > 0 && (
                  <div className={styles.savings}>
                    <dt>Discount Savings</dt>
                    <dd>−{formatCurrency(totalSavingsAll, currencyCode)}</dd>
                  </div>
                )}
                <div>
                  <dt>Subtotal</dt>
                  <dd>{formatCurrency(subtotalPaise, currencyCode)}</dd>
                </div>
                <div className={styles.total}><dt>{totalsEstimated ? "Estimated total" : "Total Payable"}</dt><dd>{formatCurrency(totalPaise, currencyCode)}</dd></div>
              </dl>
              <p className={styles.note}>{source === "shopify" ? "Shipping and taxes calculated at checkout." : "Preview bag. No order or payment will be created."}</p>
              {(unavailable || overStock) && <p className={styles.stock} role="status">Remove unavailable items or adjust quantities to continue.</p>}
              {checkoutBlocked ? <button className={styles.primary} type="button" disabled>{loading ? "Updating bag…" : "Review bag items"}</button> : <Link className={styles.primary} href="/checkout" onClick={() => { track("begin_checkout", { value: totalPaise / 100, currency: currencyCode, mode: "in_app_checkout" }); closeCart(); }}>Continue to checkout <span aria-hidden="true">→</span></Link>}
              <button className={styles.continue} type="button" onClick={closeCart}>Continue shopping</button>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
