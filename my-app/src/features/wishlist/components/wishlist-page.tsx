"use client";

import Link from "next/link";
import { products } from "@/domain/catalog/products";
import { ProductCard } from "@/features/catalog/components/product-card";
import { useStore } from "@/features/store/store-provider";

export function WishlistPage() {
  const { wishlist } = useStore();
  const savedProducts = products.filter((product) => wishlist.includes(product.slug));

  if (!savedProducts.length) {
    return (
      <section className="wishlist-empty empty-state">
        <span className="empty-state__mark" aria-hidden="true">♡</span>
        <p className="display-small">Save a ritual for later.</p>
        <p>Your favourite botanicals will remain here on this device while you explore.</p>
        <Link className="button button--dark" href="/shop">Explore the collection</Link>
      </section>
    );
  }

  return (
    <section className="section wishlist-section" aria-labelledby="saved-title">
      <div className="shop-results__meta">
        <h2 id="saved-title">{savedProducts.length} saved ritual{savedProducts.length === 1 ? "" : "s"}</h2>
        <span>Saved on this device</span>
      </div>
      <div className="shop-grid">
        {savedProducts.map((product) => <ProductCard key={product.slug} product={product} />)}
      </div>
    </section>
  );
}
