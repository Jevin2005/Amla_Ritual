"use client";

import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";
import { products } from "@/domain/catalog/products";
import { ProductJar } from "@/features/catalog/product-jar";
import { useStore } from "@/features/store/store-provider";
import { useModalFocus } from "@/shared/hooks/use-modal-focus";

const emptyStateTextLinkClass =
  "inline-flex items-center gap-[14px] border-b border-[var(--forest)] pb-[5px] text-[0.76rem] font-bold tracking-[0.08em] text-[var(--forest)] uppercase transition-[gap] duration-[260ms] ease-[var(--ease)] hover:gap-[22px]";

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
    <div
      className={`fixed inset-0 z-[500] ${
        isSearchOpen ? "visible pointer-events-auto" : "invisible pointer-events-none"
      }`}
      aria-hidden={!isSearchOpen}
    >
      <button
        className={`absolute inset-0 bg-[rgba(11,29,18,0.56)] backdrop-blur-[4px] transition-opacity duration-[380ms] ease-[ease] ${
          isSearchOpen ? "opacity-100" : "opacity-0"
        }`}
        type="button"
        onClick={closeDialog}
        aria-label="Close search"
        tabIndex={isSearchOpen ? 0 : -1}
      />
      <section
        className={`absolute inset-y-0 left-0 w-[min(720px,100%)] overflow-y-auto rounded-r-[var(--radius-lg)] bg-[var(--paper)] px-[clamp(25px,5vw,65px)] py-[35px] shadow-[30px_0_70px_rgba(0,0,0,0.15)] transition-[transform] duration-[520ms] ease-[var(--ease)] max-[680px]:rounded-none max-[680px]:px-5 max-[680px]:py-6 ${
          isSearchOpen ? "[transform:translateX(0)]" : "[transform:translateX(-102%)]"
        }`}
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="search-title"
      >
        <div className="flex items-center justify-between">
          <p
            className="m-0 text-[0.68rem] leading-[1.3] font-bold tracking-[0.2em] text-[var(--botanical)] uppercase"
            id="search-title"
          >
            Search NatureMist
          </p>
          <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-full border border-[var(--line)] bg-transparent text-[1.5rem] text-[var(--forest)] transition-[transform,background] duration-[280ms] ease-[ease] hover:bg-[var(--ivory)] hover:[transform:rotate(90deg)]"
            onClick={closeDialog}
          >
            <span aria-hidden="true">×</span>
            <span className="sr-only">Close search</span>
          </button>
        </div>
        <label className="mt-[60px] mb-2.5 grid grid-cols-[1fr_auto] items-center rounded-[var(--radius-md)] border border-[var(--line-strong)] bg-[var(--ivory)] px-5 shadow-[0_10px_30px_rgba(21,59,45,0.06)] focus-within:border-[var(--botanical)] focus-within:ring-4 focus-within:ring-[color-mix(in_srgb,var(--botanical)_12%,transparent)] max-[680px]:mt-10 max-[680px]:px-4">
          <span className="sr-only">Search botanicals and ritual goals</span>
          <input
            className="h-[76px] min-w-0 rounded-none border-0 bg-transparent font-serif text-[clamp(1.7rem,4vw,3rem)] text-[var(--forest)] outline-none shadow-none placeholder:text-[rgba(21,59,45,0.36)] focus:shadow-none max-[680px]:h-[68px] max-[680px]:text-[1.5rem]"
            data-autofocus
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try 'shine', 'soapnut' or 'colour'"
            autoComplete="off"
          />
          <span className="self-center text-[1.4rem] text-[var(--forest)]" aria-hidden="true">
            ↗
          </span>
        </label>
        <div
          className="flex items-center justify-between px-0 pt-3 pb-5 text-[0.62rem] tracking-[0.08em] text-[var(--muted)] uppercase"
          aria-live="polite"
        >
          <span>
            {results.length} botanical{results.length === 1 ? "" : "s"}
          </span>
          {query && (
            <button
              className="border-b border-[var(--line)] bg-transparent p-0 [font-size:inherit] [text-transform:inherit]"
              type="button"
              onClick={() => setQuery("")}
            >
              Clear search
            </button>
          )}
        </div>
        <div className="border-t border-[var(--line)]">
          {results.map((product) => (
            <Link
              className="group/result grid grid-cols-[82px_1fr_30px] items-center gap-[18px] border-b border-[var(--line)] px-2 py-[13px] transition-[background-color,padding] duration-300 hover:bg-[var(--ivory)] hover:px-3 max-[680px]:grid-cols-[68px_1fr_20px]"
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
                className="flex h-[92px] w-[82px] items-end justify-center overflow-hidden rounded-[var(--radius-sm)] ring-1 ring-[var(--line)] max-[680px]:w-[68px]"
                style={{ backgroundColor: product.accentSoft }}
                aria-hidden="true"
              >
                <ProductJar
                  className="[transform:scale(0.58)] [transform-origin:bottom_center]"
                  product={product}
                  size="small"
                  decorative
                />
              </span>
              <span>
                <strong className="block font-serif text-[1.45rem] font-normal text-[var(--forest)]">
                  {product.name}
                </strong>
                <small className="text-[0.68rem] text-[var(--muted)]">
                  {product.subtitle}
                </small>
              </span>
              <span aria-hidden="true">↗</span>
            </Link>
          ))}
          {results.length === 0 && (
            <div className="px-[25px] py-20 text-center">
              <p className="m-0 font-serif text-[clamp(2rem,3vw,3rem)] leading-[1.04]">
                No ritual found.
              </p>
              <p className="max-w-[360px] text-[var(--muted)]">
                Try a botanical name or a goal such as cleanse, softness or colour.
              </p>
              <button
                className={emptyStateTextLinkClass}
                type="button"
                onClick={() => setQuery("")}
              >
                See all botanicals
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
