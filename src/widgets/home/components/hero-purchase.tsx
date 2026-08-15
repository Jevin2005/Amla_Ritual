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
    <div className="hero-purchase">
      <div className="hero-price-row">
        <span>{formatCurrency(pricePaise)}</span>
        <small>Preview price · final pack details pending</small>
      </div>
      <div className="hero-actions">
        <button className="button button--dark" type="button" onClick={add}>
          {added ? "Added to your ritual" : "Add to Bag"}
          <span aria-hidden="true">{added ? "✓" : "↗"}</span>
        </button>
        <button
          className={`hero-wishlist ${wished ? "is-active" : ""}`}
          type="button"
          aria-label={wished ? `Remove ${name} from wishlist` : `Save ${name} to wishlist`}
          aria-pressed={wished}
          onClick={() => toggleWishlist(slug)}
        >
          <span aria-hidden="true">{wished ? "♥" : "♡"}</span>
        </button>
      </div>
      <a className="hero-ritual-link" href="#amla-ritual">
        Explore the ritual <span aria-hidden="true">↓</span>
      </a>
    </div>
  );
}
