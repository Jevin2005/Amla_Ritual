"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { formatCurrency, getProduct } from "@/domain/catalog/products";
import { ProductJar } from "@/features/catalog/components/product-jar";
import { useStore } from "@/features/store/store-provider";
import { useModalFocus } from "@/shared/hooks/use-modal-focus";

export function CartDrawer() {
  const {
    cart,
    subtotalPaise,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
  } = useStore();
  const [discount, setDiscount] = useState("");
  const [discountMessage, setDiscountMessage] = useState("");
  const drawerRef = useRef<HTMLElement>(null);
  useModalFocus(isCartOpen, drawerRef, closeCart);

  const applyDiscount = (event: FormEvent) => {
    event.preventDefault();
    setDiscountMessage(
      discount.trim()
        ? "Discount codes will activate when launch terms are confirmed."
        : "Enter a code to check it.",
    );
  };

  return (
    <div className={`overlay-shell ${isCartOpen ? "is-open" : ""}`} aria-hidden={!isCartOpen}>
      <button
        className="overlay-backdrop"
        type="button"
        onClick={closeCart}
        aria-label="Close bag"
        tabIndex={isCartOpen ? 0 : -1}
      />
      <aside
        className="cart-drawer"
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bag-title"
      >
        <div className="panel-header">
          <div>
            <p className="eyebrow">Your selection</p>
            <h2 id="bag-title">Ritual bag</h2>
          </div>
          <button type="button" className="close-button" onClick={closeCart}>
            <span aria-hidden="true">×</span>
            <span className="sr-only">Close bag</span>
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="cart-empty empty-state">
            <span className="empty-state__mark" aria-hidden="true">
              ◯
            </span>
            <p className="display-small">Your ritual begins here.</p>
            <p>Explore six single botanicals, each with a clearly explained purpose.</p>
            <Link className="button button--dark" href="/shop" onClick={closeCart}>
              Shop the collection
            </Link>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.map((item) => {
                const product = getProduct(item.slug);
                if (!product) return null;
                return (
                  <article className="cart-item" key={item.slug}>
                    <div
                      className="cart-item__visual"
                      style={{ backgroundColor: product.accentSoft }}
                    >
                      <ProductJar product={product} size="small" decorative />
                    </div>
                    <div className="cart-item__details">
                      <div>
                        <Link href={`/shop/${product.slug}`} onClick={closeCart}>
                          {product.name}
                        </Link>
                        <p>{product.subtitle}</p>
                      </div>
                      <div className="cart-item__controls">
                        <div
                          className="quantity-control"
                          aria-label={`Quantity for ${product.name}`}
                        >
                          <button
                            type="button"
                            onClick={() => updateQuantity(product.slug, item.quantity - 1)}
                            aria-label={`Decrease ${product.name} quantity`}
                          >
                            −
                          </button>
                          <span aria-live="polite">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(product.slug, item.quantity + 1)}
                            aria-label={`Increase ${product.name} quantity`}
                          >
                            +
                          </button>
                        </div>
                        <strong>{formatCurrency(product.pricePaise * item.quantity)}</strong>
                      </div>
                      <button
                        className="remove-link"
                        type="button"
                        onClick={() => removeFromCart(product.slug)}
                      >
                        Remove
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
            <div className="cart-summary">
              <form className="discount-form" onSubmit={applyDiscount}>
                <label htmlFor="discount-code">Discount code</label>
                <div>
                  <input
                    id="discount-code"
                    value={discount}
                    onChange={(event) => setDiscount(event.target.value)}
                    placeholder="Enter code"
                  />
                  <button type="submit">Apply</button>
                </div>
                {discountMessage && <p role="status">{discountMessage}</p>}
              </form>
              <div className="subtotal-line">
                <span>Subtotal</span>
                <strong>{formatCurrency(subtotalPaise)}</strong>
              </div>
              <p className="commercial-note">
                Preview pricing only. Final prices, shipping and taxes will be confirmed before launch.
              </p>
              <Link
                className="button button--dark button--full"
                href="/checkout"
                onClick={closeCart}
              >
                Continue to checkout <span aria-hidden="true">↗</span>
              </Link>
              <Link
                className="text-link text-link--center"
                href="/shop"
                onClick={closeCart}
              >
                Continue exploring
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
