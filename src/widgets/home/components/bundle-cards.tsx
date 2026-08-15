"use client";

import {
  bundles,
  formatCurrency,
  getBundleProducts,
} from "@/domain/catalog/products";
import { ProductJar } from "@/features/catalog/components/product-jar";
import { useStore } from "@/features/store/store-provider";

export function BundleCards() {
  const { addManyToCart } = useStore();

  return (
    <div className="bundle-grid">
      {bundles.map((bundle, index) => {
        const bundleProducts = getBundleProducts(bundle.slugs);
        const total = bundleProducts.reduce((sum, product) => sum + product.pricePaise, 0);
        return (
          <article className={`bundle-card bundle-card--${index + 1}`} key={bundle.id}>
            <div className="bundle-card__jars" aria-hidden="true">
              {bundleProducts.slice(0, 4).map((product) => (
                <ProductJar key={product.slug} product={product} size="small" decorative />
              ))}
              {bundleProducts.length > 4 && (
                <span className="bundle-card__more">+{bundleProducts.length - 4}</span>
              )}
            </div>
            <div className="bundle-card__copy">
              <p className="eyebrow">Ritual set {String(index + 1).padStart(2, "0")}</p>
              <h3>{bundle.name}</h3>
              <p>{bundle.description}</p>
              <div>
                <span>{formatCurrency(total)}</span>
                <small>Combined preview price</small>
              </div>
              <button
                className="button button--dark"
                type="button"
                onClick={() => addManyToCart(bundle.slugs)}
              >
                Add the ritual <span aria-hidden="true">↗</span>
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
