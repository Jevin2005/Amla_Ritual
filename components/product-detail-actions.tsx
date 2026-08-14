"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatCurrency, type Product } from "@/lib/products";
import { useStore } from "@/components/store-provider";

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
      <div className="product-price-block">
        <span>{formatCurrency(product.pricePaise)}</span>
        <small>Editable preview price</small>
      </div>
      <p className="product-availability"><i /> {product.availability}</p>
      <div className="product-purchase-row">
        <div className="quantity-control quantity-control--large" aria-label={`Quantity for ${product.name}`}>
          <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity">−</button>
          <span aria-live="polite">{quantity}</span>
          <button type="button" onClick={() => setQuantity(Math.min(12, quantity + 1))} aria-label="Increase quantity">+</button>
        </div>
        <button className="button button--dark product-add-button" type="button" onClick={() => add(true)}>
          {added ? "Added to your ritual" : "Add to Bag"}
          <span aria-hidden="true">{added ? "✓" : "↗"}</span>
        </button>
      </div>
      <div className="product-secondary-actions">
        <button className="button button--outline" type="button" onClick={buyNow}>
          Continue to secure checkout
        </button>
        <button
          className={`product-wishlist-action ${wished ? "is-active" : ""}`}
          type="button"
          onClick={() => toggleWishlist(product.slug)}
          aria-pressed={wished}
        >
          <span aria-hidden="true">{wished ? "♥" : "♡"}</span>
          {wished ? "Saved to wishlist" : "Save to wishlist"}
        </button>
      </div>
      <p className="commercial-note product-commercial-note">
        Checkout is a safe preview handoff and does not collect payment details until a verified provider is connected.
      </p>

      <div className="mobile-sticky-buy">
        <div><strong>{product.name}</strong><span>{formatCurrency(product.pricePaise)}</span></div>
        <button type="button" onClick={() => add(true)}>Add to Bag</button>
      </div>
    </>
  );
}

