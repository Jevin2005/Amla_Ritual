"use client";

import { useId, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ritualGoals, type RitualGoal } from "@/domain/catalog/products";
import { ritualStepLabels } from "@/domain/catalog/botanical-uses";
import Link from "next/link";
import { buildCollectionCatalog, filterCollectionCatalog, type CollectionKind, type CollectionSort, type CollectionFilters } from "@/domain/collection-catalog";
import type { ComboCatalogSize } from "@/domain/combo-catalog";
import { CollectionGrid } from "./collection-grid";
import { CollectionTypeFilter } from "./collection-type-filter";
import { useStore } from "@/features/store/store-provider";
import { useSearchTracking } from "@/features/analytics/search-tracking";
import styles from "./shop-explorer.module.css";

const steps = ["All", "Cleanse", "Condition", "Colour"] as const;
const sizes: { value: ComboCatalogSize; label: string }[] = [
  { value: "all", label: "Any size" }, { value: "2", label: "2 jars" },
  { value: "3", label: "3 jars" }, { value: "4+", label: "4+ jars" },
];

export function ShopExplorer() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { products, content, source, track } = useStore();
  const filterId = useId();
  const filterToggleRef = useRef<HTMLButtonElement>(null);
  const goalParam = searchParams.get("goal");
  const collection = searchParams.get("collection")?.trim().toLowerCase() || null;
  const goal: RitualGoal | "All" = ritualGoals.includes(goalParam as RitualGoal) ? goalParam as RitualGoal : "All";
  const typeParam = searchParams.get("type");
  const kind: CollectionKind = typeParam === "individual" || typeParam === "combos" ? typeParam : "all";
  const [step, setStep] = useState<CollectionFilters["step"]>("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<CollectionSort>("collection");
  const [size, setSize] = useState<ComboCatalogSize>("all");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const entries = useMemo(() => buildCollectionCatalog(products, content.botanicalCombos.combos, source), [products, content.botanicalCombos.combos, source]);
  const filtered = useMemo(() => filterCollectionCatalog(entries, { kind, query, goal, step, collection, size: kind === "individual" ? "all" : size, availableOnly, sort }), [entries, kind, query, goal, step, collection, size, availableOnly, sort]);
  useSearchTracking(query, products, filtered.length, source === "shopify");
  const individualCount = entries.filter((entry) => entry.kind === "product").length;
  const counts = { all: entries.length, individual: individualCount, combos: entries.length - individualCount };
  const collectionTitle = collection ? products.flatMap((product) => product.collections ?? []).find((membership) => membership.handle.toLowerCase() === collection)?.title : null;
  const activeFilterCount = Number(kind !== "all") + Number(goal !== "All") + Number(step !== "All") + Number(Boolean(query.trim())) + Number(Boolean(collection)) + Number(kind !== "individual" && size !== "all") + Number(availableOnly);

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value); else params.delete(key);
    router.replace(params.size ? pathname + "?" + params.toString() : pathname, { scroll: false });
  }
  function chooseKind(next: CollectionKind) {
    setSize("all");
    updateParam("type", next === "all" ? null : next);
    track("filter_applied", { filter: "type", value: next });
  }
  function chooseGoal(next: RitualGoal | "All") {
    updateParam("goal", next === "All" ? null : next);
    track("filter_applied", { filter: "goal", value: next });
  }
  function clear() {
    setStep("All"); setQuery(""); setSort("collection"); setSize("all"); setAvailableOnly(false);
    const params = new URLSearchParams(searchParams.toString());
    ["type", "goal", "collection"].forEach((key) => params.delete(key));
    router.replace(params.size ? pathname + "?" + params.toString() : pathname, { scroll: false });
  }

  return <div className={styles.explorer}>
    <CollectionTypeFilter value={kind} onChange={chooseKind} counts={counts} />
    <div className={styles.toolbar}>
      <label className={styles.search}>
        <span className={styles.srOnly}>Search products and combos</span>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.5" /><path d="m16 16 4.5 4.5" stroke="currentColor" strokeWidth="1.5" /></svg>
        <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products, combos or botanicals" />
      </label>
      <label className={styles.sort}><span>Sort by</span><select value={sort} onChange={(event) => setSort(event.target.value as CollectionSort)}>
        <option value="collection">Curated collection</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="name">Name: A to Z</option>
      </select></label>
      <button ref={filterToggleRef} type="button" className={styles.filterToggle} aria-expanded={filtersOpen} aria-controls={filterId} onClick={() => setFiltersOpen(!filtersOpen)}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M4 7h16M4 17h16" /><circle cx="9" cy="7" r="3" fill="var(--paper)" /><circle cx="15" cy="17" r="3" fill="var(--paper)" /></svg>
        Filters{activeFilterCount > 0 && <span>{activeFilterCount}</span>}
      </button>
    </div>
    <div className={styles.layout}>
      <aside className={styles.filters} id={filterId} data-open={filtersOpen} data-native-scroll aria-label="Collection filters">
        <div className={styles.filterHeading}><h2>Refine your ritual</h2>{activeFilterCount > 0 && <button type="button" onClick={clear}>Clear all</button>}</div>
        <fieldset><legend>Ritual goal</legend><div className={styles.choices}>
          {(["All", ...ritualGoals] as const).map((option) => <button key={option} type="button" aria-pressed={goal === option} onClick={() => chooseGoal(option)}>{option === "All" ? "Every goal" : option}</button>)}
        </div></fieldset>
        <fieldset><legend>Product use</legend><div className={styles.choices}>
          {steps.map((option) => <button key={option} type="button" aria-pressed={step === option} onClick={() => { setStep(option); track("filter_applied", { filter: "step", value: option }); }}>{ritualStepLabels[option]}</button>)}
        </div></fieldset>
        <p className={styles.footnote}><Link href="/#specimen-collection">Explore skin &amp; body ingredient research →</Link></p>
        {kind !== "individual" && counts.combos > 0 && <fieldset><legend>Combo size</legend><div className={styles.sizeChoices}>
          {sizes.map((option) => <button key={option.value} type="button" aria-pressed={size === option.value} onClick={() => setSize(option.value)}>{option.label}</button>)}
        </div></fieldset>}
        <label className={styles.available}><input type="checkbox" checked={availableOnly} onChange={(event) => setAvailableOnly(event.target.checked)} />Available only</label>
        <button type="button" className={styles.applyFilters} onClick={() => { setFiltersOpen(false); filterToggleRef.current?.focus({ preventScroll: true }); }}>Show {filtered.length} {filtered.length === 1 ? "item" : "items"}</button>
      </aside>
      <section className={styles.results} aria-labelledby="results-title">
        <div className={styles.resultsHeader}>
          <div><p className={styles.resultEyebrow}>{collectionTitle || (goal === "All" ? "The botanical collection" : goal)}</p><h2 id="results-title">{kind === "combos" ? "Thoughtfully paired." : kind === "individual" ? "One botanical, your way." : "Find your everyday favourites."}</h2></div>
          <p className={styles.resultCount} role="status" aria-live="polite" aria-atomic="true">{filtered.length} {filtered.length === 1 ? "item" : "items"}</p>
        </div>
        {activeFilterCount > 0 && <div className={styles.activeFilters}>
          <span>{activeFilterCount} active {activeFilterCount === 1 ? "filter" : "filters"}{collectionTitle ? " · " + collectionTitle : ""}</span><button type="button" onClick={clear}>Clear filters</button>
        </div>}
        {source === "preview" && <p className={styles.previewNote}>Preview collection · Prices and availability are examples.</p>}
        {filtered.length > 0 ? <CollectionGrid entries={filtered} eagerImages /> : <div className={styles.empty}>
          <h3>A different ritual awaits.</h3><p>No products or combos match these filters. Explore the full collection to find your next botanical.</p><button type="button" onClick={clear}>View all products <span aria-hidden="true">→</span></button>
        </div>}
        {filtered.some((entry) => entry.kind === "combo") && <p className={styles.footnote}>Combos include one of each featured jar. The total reflects current individual prices; any discounts are applied at checkout.</p>}
      </section>
    </div>
  </div>;
}
