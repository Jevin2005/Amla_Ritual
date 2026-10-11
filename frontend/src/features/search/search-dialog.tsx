"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatCurrency } from "@/domain/catalog/products";
import { searchProducts, toSearchProduct, type SearchProduct } from "@/domain/catalog/search";
import { useStore } from "@/features/store/store-provider";
import { useModalFocus } from "@/shared/hooks/use-modal-focus";
import { MediaImage } from "@/shared/ui/media-image";
import styles from "./search-dialog.module.css";

export function SearchDialog() {
  const { isSearchOpen } = useStore();
  return isSearchOpen ? <SearchPanel /> : null;
}

function SearchIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="10.75" cy="10.75" r="6.75" /><path d="m16 16 4.5 4.5" strokeLinecap="round" /></svg>;
}

function SearchPanel() {
  const { products, closeSearch, track } = useStore();
  const [query, setQuery] = useState("");
  const [catalog, setCatalog] = useState<SearchProduct[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const dialogRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const closeDialog = useCallback(() => closeSearch(), [closeSearch]);
  useModalFocus(true, dialogRef, closeDialog);

  useEffect(() => {
    let controller: AbortController | undefined;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    let disposed = false;
    async function refresh() {
      controller?.abort();
      clearTimeout(timeout);
      const request = new AbortController();
      controller = request;
      timeout = setTimeout(() => request.abort(), 15000);
      setLoading(true);
      setError(false);
      try {
        const response = await fetch("/api/search/catalog", { cache: "no-store", signal: request.signal });
        if (!response.ok) throw new Error("Catalog unavailable");
        const data = await response.json() as { products: SearchProduct[] };
        if (!Array.isArray(data.products)) throw new Error("Invalid catalog");
        if (!disposed && controller === request) setCatalog(data.products);
      } catch {
        if (!disposed && controller === request) setError(true);
      } finally {
        if (!disposed && controller === request) {
          clearTimeout(timeout);
          setLoading(false);
        }
      }
    }
    const onFocus = () => { if (!document.hidden) void refresh(); };
    void refresh();
    window.addEventListener("focus", onFocus);
    return () => {
      disposed = true;
      controller?.abort();
      clearTimeout(timeout);
      window.removeEventListener("focus", onFocus);
    };
  }, [attempt]);

  const entries = useMemo(() => catalog ?? products.map(toSearchProduct), [catalog, products]);
  const results = useMemo(() => searchProducts(entries, query), [entries, query]);
  const suggestions = useMemo(() => [...new Set(entries.map((product) => product.ritual).filter(Boolean))].slice(0, 5), [entries]);
  const clear = () => { setQuery(""); inputRef.current?.focus(); };

  useEffect(() => {
    resultsRef.current?.scrollTo({ top: 0 });
  }, [query]);

  return (
    <div className={styles.overlay}>
      <button className={styles.backdrop} type="button" onClick={closeDialog} aria-label="Close search backdrop" tabIndex={-1} />
      <section id="site-search-dialog" className={styles.panel} ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="search-title">
        <div className={styles.top}>
          <div className={styles.headingRow}>
            <div><p className={styles.eyebrow}>The botanical cabinet</p><h2 id="search-title">Find your ritual.</h2></div>
            <button className={styles.close} onClick={closeDialog} type="button" aria-label="Close search"><span aria-hidden="true">×</span></button>
          </div>
          <p className={styles.intro}>Explore by product, ingredient, or the care you’re looking for.</p>
          <div className={styles.inputWrap}>
            <SearchIcon />
            <input ref={inputRef} data-autofocus type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search all products…" aria-label="Search all products" autoComplete="off" maxLength={200} />
            {query && <button className={styles.clear} type="button" onClick={clear} aria-label="Clear search">×</button>}
          </div>
          {suggestions.length > 0 && <div className={styles.suggestions} aria-label="Search by ritual"><span>Explore</span>{suggestions.map((term) => <button key={term} type="button" aria-pressed={query === term} onClick={() => { setQuery(term); inputRef.current?.focus(); }}>{term}</button>)}</div>}
          <div className={styles.resultBar}><p role="status">{query.trim() ? `${results.length} result${results.length === 1 ? "" : "s"}` : `All products · ${results.length}`}</p>{loading && <span className={styles.refreshing}>Updating catalog…</span>}</div>
          {error && <p className={styles.notice} role="status">Couldn’t refresh products. {entries.length ? "Showing the available catalog." : "Please try again."} <button onClick={() => setAttempt((value) => value + 1)} type="button">Retry</button></p>}
        </div>
        <div className={styles.results} ref={resultsRef} aria-label="Product results" aria-busy={loading}>
          {results.length > 0 ? <ul className={styles.grid}>{results.map((product) => <li key={product.id}>
            <Link className={styles.card} href={`/shop/${product.slug}`} onClick={() => { track("search", { result_count: results.length, selected_item: product.slug }); closeDialog(); }}>
              <div className={styles.image}><MediaImage src={product.image?.url || "/images/product-placeholder.svg"} alt="" fill sizes="(max-width: 600px) 84px, 108px" /> </div>
              <div className={styles.copy}>
                {product.ritual && <span className={styles.category}>{product.ritual} ritual</span>}
                <h3>{product.name}</h3><p>{product.subtitle}</p>
                <div className={styles.price}>{formatCurrency(product.pricePaise, product.currencyCode)}{product.size && <span> · {product.size}</span>}</div>
                {!product.available && <span className={styles.soldOut}>Sold out</span>}
              </div><span className={styles.arrow} aria-hidden="true">↗</span>
            </Link>
          </li>)}</ul> : <div className={styles.empty}>
            <SearchIcon /><h3>{loading ? "Finding your botanicals…" : query.trim() ? "No products found." : "The cabinet is being prepared."}</h3>
            <p>{query.trim() ? "Try a shorter name, another ingredient, or a ritual such as cleanse or colour." : "Please check back soon for our botanicals."}</p>
            {query && <button type="button" onClick={clear}>Explore all products <span aria-hidden="true">↗</span></button>}
          </div>}
        </div>
        <footer className={styles.footer}><span>Rooted in nature. Made for your ritual.</span><Link href="/shop" onClick={closeDialog}>View collection <span aria-hidden="true">↗</span></Link></footer>
      </section>
    </div>
  );
}
