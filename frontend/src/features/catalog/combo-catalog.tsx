"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatCurrency } from "@/domain/catalog/products";
import {
  buildComboCatalog,
  filterComboCatalog,
  type ComboCatalogSize,
  type ComboCatalogSort,
} from "@/domain/combo-catalog";
import { useStore } from "@/features/store/store-provider";
import { MediaImage } from "@/shared/ui/media-image";
import { ComboPreview } from "@/widgets/home/combo-preview";
import styles from "./combo-catalog.module.css";

const sizes: { value: ComboCatalogSize; label: string }[] = [
  { value: "all", label: "All combos" },
  { value: "2", label: "Duos" },
  { value: "3", label: "Trios" },
  { value: "4+", label: "4+ jars" },
];

export function ComboCatalog() {
  const { content, products, source, track } = useStore();
  const [query, setQuery] = useState("");
  const [size, setSize] = useState<ComboCatalogSize>("all");
  const [sort, setSort] = useState<ComboCatalogSort>("featured");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);
  // The homepage visibility switch controls the book, while its saved list
  // supplies the catalog. Missing or Draft Shopify content already parses empty.
  const entries = useMemo(
    () => buildComboCatalog(content.botanicalCombos.combos, products, source),
    [content.botanicalCombos.combos, products, source],
  );
  const filtered = useMemo(
    () => filterComboCatalog(entries, { query, size, sort, availableOnly }),
    [entries, query, size, sort, availableOnly],
  );
  const preview = entries.find(({ combo }) => combo.id === previewId);
  const hasFilters = Boolean(query.trim() || size !== "all" || availableOnly);

  function clearFilters() {
    setQuery("");
    setSize("all");
    setAvailableOnly(false);
  }

  return (
    <div className={styles.catalog}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>The combo collection</p>
          <div className={styles.intro}>
            <h1>Your ritual.<br /><em>Better together.</em></h1>
            <div className={styles.introCopy}>
              <p>Thoughtfully paired botanicals for a little time to yourself. Explore each combo and find the jars that belong in your routine.</p>
              <span>One of each jar. One considered ritual.</span>
            </div>
          </div>
          <nav className={styles.catalogNav} aria-label="Shop catalogs">
            <Link href="/shop">Shop individual powders <span aria-hidden="true">↗</span></Link>
            <Link href="/combos" aria-current="page">Shop combos <span aria-hidden="true">↗</span></Link>
          </nav>
        </div>
      </header>

      <section className={styles.collection} aria-label="Botanical combos">
        {source === "preview" && <p className={styles.previewNotice}>Preview catalog · Prices and availability are examples until the store is connected.</p>}
        {entries.length > 0 ? (
          <>
            <div className={styles.toolbar}>
              <label className={styles.search}>
                <span className={styles.srOnly}>Search combos</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.5" /><path d="m16 16 4.5 4.5" stroke="currentColor" strokeWidth="1.5" /></svg>
                <input type="search" placeholder="Search combos or botanicals" value={query} onChange={(event) => setQuery(event.target.value)} />
              </label>
              <label className={styles.sort}>
                <span>Sort by</span>
                <select value={sort} onChange={(event) => setSort(event.target.value as ComboCatalogSort)}>
                  <option value="featured">Featured order</option>
                  <option value="price-low">Price: low to high</option>
                  <option value="price-high">Price: high to low</option>
                  <option value="name">Name: A to Z</option>
                </select>
              </label>
            </div>
            <div className={styles.filterRow}>
              <div className={styles.sizes} role="group" aria-label="Filter by number of jars">
                {sizes.map((option) => (
                  <button key={option.value} type="button" aria-pressed={size === option.value} onClick={() => setSize(option.value)}>{option.label}</button>
                ))}
              </div>
              <label className={styles.available}>
                <input type="checkbox" checked={availableOnly} onChange={(event) => setAvailableOnly(event.target.checked)} />
                Available combos only
              </label>
            </div>
            <div className={styles.results}>
              <p role="status" aria-live="polite" aria-atomic="true">{filtered.length} {filtered.length === 1 ? "combo" : "combos"}{hasFilters ? ` of ${entries.length}` : " to explore"}</p>
              {hasFilters && <button type="button" onClick={clearFilters}>Clear filters <span aria-hidden="true">×</span></button>}
            </div>

            {filtered.length > 0 ? (
              <div className={styles.grid}>
                {filtered.map(({ combo, products: includedProducts, count, purchase }, index) => (
                  <article className={styles.card} key={combo.id}>
                    <div className={styles.photo}>
                      <MediaImage src={combo.image.url} alt={combo.image.altText || combo.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 33vw" loading={index < 3 ? "eager" : "lazy"} className={styles.image} />
                      <span className={styles.jarCount}>{count} jars · one ritual</span>
                    </div>
                    <div className={styles.cardBody}>
                      <div className={styles.cardHeading}>
                        <h2>{combo.name}</h2>
                        <span className={styles.number} aria-hidden="true">{String(entries.findIndex((entry) => entry.combo.id === combo.id) + 1).padStart(2, "0")}</span>
                      </div>
                      <p className={styles.ingredients}>{combo.ingredients}</p>
                      <ul className={styles.products} aria-label={`Products in ${combo.name}`}>
                        {includedProducts.map((product) => <li key={product.slug}><Link href={`/shop/${product.slug}`}>{product.name}</Link></li>)}
                      </ul>
                      <div className={styles.priceRow}>
                        <div>
                          <span className={styles.priceLabel}>{source === "preview" ? "Preview total" : "Combined total"}</span>
                          <strong className={styles.price}>{purchase.canShowTotal ? formatCurrency(purchase.total, purchase.currencyCode) : "Price unavailable"}</strong>
                        </div>
                        <span className={styles.availability} data-available={purchase.purchasable}>
                          <span aria-hidden="true" />{source === "preview" ? "Preview pairing" : purchase.purchasable ? "Available" : "Unavailable"}
                        </span>
                      </div>
                      <button className={styles.viewButton} type="button" aria-label={`View ${combo.name} combo`} aria-haspopup="dialog" onClick={() => {
                        setPreviewId(combo.id);
                        track("select_item", { item_id: combo.id, placement: "combo_catalog" });
                      }}>
                        <span>{content.botanicalCombos.buttonLabel}</span><span aria-hidden="true">↗</span>
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className={styles.empty}>
                <p className={styles.eyebrow}>A different pairing awaits</p>
                <h2>No combos match your filters.</h2>
                <p>Try another botanical or explore the complete collection.</p>
                <button type="button" onClick={clearFilters}>Show all combos <span aria-hidden="true">→</span></button>
              </div>
            )}
            <p className={styles.footnote}>Each combo adds one of each included jar at its current price. Shipping and any applicable discounts are calculated at checkout.</p>
          </>
        ) : (
          <div className={styles.empty}>
            <p className={styles.eyebrow}>Room for a new ritual</p>
            <h2>New pairings are on their way.</h2>
            <p>There are no combos to explore right now. Discover our individual botanical powders in the meantime.</p>
            <Link href="/shop">Explore individual powders <span aria-hidden="true">→</span></Link>
          </div>
        )}
      </section>
      {preview && <ComboPreview title={preview.combo.name} ingredientLabel={preview.combo.ingredients} image={preview.combo.image.url} products={preview.products} expectedProductCount={preview.count} onClose={() => setPreviewId(null)} />}
    </div>
  );
}
