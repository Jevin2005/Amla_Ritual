"use client";

import Link from "next/link";
import { formatCurrency, getProduct } from "@/lib/products";
import { ProductJar } from "@/components/product-jar";
import { useStore } from "@/components/store-provider";

export function CheckoutPreview() {
  const { cart, subtotalPaise, openCart } = useStore();

  if (!cart.length) {
    return (
      <section className="checkout-empty empty-state">
        <span className="empty-state__mark" aria-hidden="true">○</span>
        <p className="display-small">Your bag is waiting.</p>
        <p>Add a botanical ritual before continuing to checkout.</p>
        <Link className="button button--dark" href="/shop">Shop the collection</Link>
      </section>
    );
  }

  return (
    <section className="checkout-layout">
      <div className="checkout-message">
        <p className="eyebrow">Secure checkout handoff</p>
        <h2>Ready for your verified payment provider.</h2>
        <p>
          This storefront preview deliberately does not collect card details or create a pretend order. Connect your chosen hosted checkout provider before launch, then this step can hand over the exact bag safely.
        </p>
        <div className="notice-box">
          <strong>No payment data is collected here.</strong>
          <span>Prices, inventory, shipping, tax and discount rules must also be confirmed before accepting an order.</span>
        </div>
        <button className="button button--outline" type="button" onClick={openCart}>Return to bag</button>
        <Link className="text-link checkout-shop-link" href="/shop">Continue exploring ↗</Link>
      </div>
      <aside className="checkout-summary" aria-label="Order preview">
        <p className="eyebrow">Order preview</p>
        <div className="checkout-summary__items">
          {cart.map((item) => {
            const product = getProduct(item.slug);
            if (!product) return null;
            return (
              <article key={item.slug}>
                <span style={{ backgroundColor: product.accentSoft }}><ProductJar product={product} size="small" decorative /></span>
                <div><strong>{product.name}</strong><small>Quantity {item.quantity}</small></div>
                <em>{formatCurrency(product.pricePaise * item.quantity)}</em>
              </article>
            );
          })}
        </div>
        <div className="subtotal-line"><span>Preview subtotal</span><strong>{formatCurrency(subtotalPaise)}</strong></div>
        <p className="commercial-note">Not a final payable total. Shipping, tax and verified commercial terms are not yet applied.</p>
      </aside>
    </section>
  );
}

