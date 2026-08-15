"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { getProduct, products } from "@/domain/catalog/products";
import { ProductJar } from "@/features/catalog/product-jar";
import { useStore } from "@/features/store/store-provider";

export function FeaturedProductSwitcher() {
  const [activeSlug, setActiveSlug] = useState(products[0].slug);
  const { addToCart } = useStore();
  const product = getProduct(activeSlug) ?? products[0];

  return (
    <div
      className="family-switcher"
      style={{
        "--family-accent": product.accent,
        "--family-soft": product.accentSoft,
      } as CSSProperties}
    >
      <div className="family-switcher__tabs" role="tablist" aria-label="Choose a botanical">
        {products.map((item) => (
          <button
            key={item.slug}
            type="button"
            role="tab"
            aria-selected={item.slug === product.slug}
            className={item.slug === product.slug ? "is-active" : ""}
            onClick={() => setActiveSlug(item.slug)}
          >
            <span>{item.collectionNumber}</span>
            {item.name.replace(" Powder", "")}
          </button>
        ))}
      </div>
      <div className="family-switcher__stage" role="tabpanel">
        <span className="family-switcher__ring" aria-hidden="true" />
        <ProductJar key={product.slug} product={product} size="large" />
      </div>
      <div className="family-switcher__copy">
        <p className="eyebrow">Ritual {product.collectionNumber}</p>
        <h3>{product.name}</h3>
        <p className="lead">{product.shortDescription}</p>
        <ul className="mini-benefits">
          {product.benefits.slice(0, 3).map((benefit) => (
            <li key={benefit}>{benefit}</li>
          ))}
        </ul>
        <div className="family-switcher__actions">
          <Link className="text-link" href={`/shop/${product.slug}`}>
            View the ritual <span aria-hidden="true">↗</span>
          </Link>
          <button
            className="round-add round-add--dark"
            type="button"
            onClick={() => addToCart(product.slug)}
          >
            <span className="sr-only">Add {product.name} to bag</span>
            <span aria-hidden="true">＋</span>
          </button>
        </div>
      </div>
    </div>
  );
}
