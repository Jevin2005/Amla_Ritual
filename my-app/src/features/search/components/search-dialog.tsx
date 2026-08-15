"use client";

import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";
import { products } from "@/domain/catalog/products";
import { ProductJar } from "@/features/catalog/components/product-jar";
import { useStore } from "@/features/store/store-provider";
import { useModalFocus } from "@/shared/hooks/use-modal-focus";

export function SearchDialog() {
  const { isSearchOpen, closeSearch, track } = useStore();
  const [query, setQuery] = useState("");
  const dialogRef = useRef<HTMLElement>(null);
  const closeDialog = useCallback(() => {
    setQuery("");
    closeSearch();
  }, [closeSearch]);
  useModalFocus(isSearchOpen, dialogRef, closeDialog);

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return products;
    return products.filter((product) =>
      [product.name, product.botanical, product.subtitle, ...product.searchTerms]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [query]);

  return (
    <div className={`overlay-shell ${isSearchOpen ? "is-open" : ""}`} aria-hidden={!isSearchOpen}>
      <button
        className="overlay-backdrop"
        type="button"
        onClick={closeDialog}
        aria-label="Close search"
        tabIndex={isSearchOpen ? 0 : -1}
      />
      <section
        className="search-dialog"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="search-title"
      >
        <div className="search-dialog__topline">
          <p className="eyebrow" id="search-title">
            Search NatureMist
          </p>
          <button type="button" className="close-button" onClick={closeDialog}>
            <span aria-hidden="true">×</span>
            <span className="sr-only">Close search</span>
          </button>
        </div>
        <label className="search-field">
          <span className="sr-only">Search botanicals and ritual goals</span>
          <input
            data-autofocus
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try ‘shine’, ‘soapnut’ or ‘colour’"
            autoComplete="off"
          />
          <span aria-hidden="true">↗</span>
        </label>
        <div className="search-dialog__meta" aria-live="polite">
          <span>
            {results.length} botanical{results.length === 1 ? "" : "s"}
          </span>
          {query && (
            <button type="button" onClick={() => setQuery("")}>
              Clear search
            </button>
          )}
        </div>
        <div className="search-results">
          {results.map((product) => (
            <Link
              className="search-result"
              href={`/shop/${product.slug}`}
              key={product.slug}
              onClick={() => {
                track("search", {
                  result_count: results.length,
                  selected_item: product.slug,
                });
                closeDialog();
              }}
            >
              <span
                className="search-result__swatch"
                style={{ backgroundColor: product.accentSoft }}
                aria-hidden="true"
              >
                <ProductJar product={product} size="small" decorative />
              </span>
              <span>
                <strong>{product.name}</strong>
                <small>{product.subtitle}</small>
              </span>
              <span aria-hidden="true">↗</span>
            </Link>
          ))}
          {results.length === 0 && (
            <div className="empty-state">
              <p className="display-small">No ritual found.</p>
              <p>Try a botanical name or a goal such as cleanse, softness or colour.</p>
              <button className="text-link" type="button" onClick={() => setQuery("")}>
                See all botanicals
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
