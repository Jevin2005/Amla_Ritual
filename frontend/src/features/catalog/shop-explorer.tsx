"use client";

import { useId, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ritualGoals, type RitualGoal } from "@/domain/catalog/products";
import { buildCollectionCatalog, filterCollectionCatalog, type CollectionCare, type CollectionKind, type CollectionSort, type CollectionFilters } from "@/domain/collection-catalog";
import type { ComboCatalogSize } from "@/domain/combo-catalog";
import { CollectionGrid } from "./collection-grid";
import { CollectionTypeFilter } from "./collection-type-filter";
import { useStore } from "@/features/store/store-provider";
import styles from "./shop-explorer.module.css";

const steps = ["All", "Cleanse", "Pack", "Condition", "Colour"] as const;
const careCategories: { value: CollectionCare; label: string; description: string }[] = [
  { value: "all", label: "All care", description: "Explore the current collection by its intended role: herbal hair packs, hair washes and botanical hair colour." },
  { value: "hair", label: "Hair care", description: "Find traditional hair-pack ingredients and herbal hair-wash powders. In a set, follow the directions for each jar's individual role." },
  { value: "skin", label: "Skin care", description: "This category includes only products with confirmed skin-use information. Hair-care directions do not establish suitability for the face or body." },
  { value: "both", label: "Hair & skin", description: "This category requires confirmed hair and skin uses for each product, with separate directions for each application." },
  { value: "colour", label: "Hair colour", description: "Explore Indigo and colour pairings. Indigo is the colour step; any accompanying care powders have their own separate role." },
];
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
  const careParam = searchParams.get("care");
  const care = careCategories.find((category) => category.value === careParam)?.value ?? "all";
  const careCategory = careCategories.find((category) => category.value === care)!;
  const [step, setStep] = useState<CollectionFilters["step"]>("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<CollectionSort>("collection");
  const [size, setSize] = useState<ComboCatalogSize>("all");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const entries = useMemo(() => buildCollectionCatalog(products, content.botanicalCombos.combos, source), [products, content.botanicalCombos.combos, source]);
  const filtered = useMemo(() => filterCollectionCatalog(entries, { kind, care, query, goal, step, collection, size: kind === "individual" ? "all" : size, availableOnly, sort }), [entries, kind, care, query, goal, step, collection, size, availableOnly, sort]);
  const careEntries = useMemo(() => filterCollectionCatalog(entries, { kind: "all", care, query: "", goal: "All", step: "All", collection: null, size: "all", availableOnly: false, sort: "collection" }), [entries, care]);
  const individualCount = careEntries.filter((entry) => entry.kind === "product").length;
  const counts = { all: careEntries.length, individual: individualCount, combos: careEntries.length - individualCount };
  const noConfirmedSkinUse = (care === "skin" || care === "both" || goal === "Skin Care") && !products.some((product) => product.careAreas?.includes("Skin Care"));
  const collectionTitle = collection ? products.flatMap((product) => product.collections ?? []).find((membership) => membership.handle.toLowerCase() === collection)?.title : null;
  const activeFilterCount = Number(kind !== "all") + Number(care !== "all") + Number(goal !== "All") + Number(step !== "All") + Number(Boolean(query.trim())) + Number(Boolean(collection)) + Number(kind !== "individual" && size !== "all") + Number(availableOnly);

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
  function chooseCare(next: CollectionCare) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "all") params.delete("care"); else params.set("care", next);
    params.delete("goal");
    setStep("All");
    router.replace(params.size ? pathname + "?" + params.toString() : pathname, { scroll: false });
    track("filter_applied", { filter: "care", value: next });
  }
  function clear() {
    setStep("All"); setQuery(""); setSort("collection"); setSize("all"); setAvailableOnly(false);
    const params = new URLSearchParams(searchParams.toString());
    ["type", "care", "goal", "collection"].forEach((key) => params.delete(key));
    router.replace(params.size ? pathname + "?" + params.toString() : pathname, { scroll: false });
  }

  return <div className={styles.explorer}>
    <fieldset className={styles.careCategories}>
      <legend>Shop by care</legend>
      <div>{careCategories.map((category) => <button key={category.value} type="button" aria-pressed={care === category.value} onClick={() => chooseCare(category.value)}>{category.label}</button>)}</div>
    </fieldset>
    <p className={styles.careDescription}>{careCategory.description}</p>
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
        {(care === "all" || care === "hair") && <fieldset><legend>{care === "hair" ? "Hair ritual goal" : "Ritual goal"}</legend><div className={styles.choices}>
          {(["All", ...ritualGoals] as const).filter((option) => care !== "hair" || option !== "Skin Care").map((option) => <button key={option} type="button" aria-pressed={goal === option} onClick={() => chooseGoal(option)}>{option === "All" ? "Every goal" : option}</button>)}
        </div></fieldset>}
        {(care === "all" || care === "hair") && <fieldset><legend>Hair ritual step</legend><div className={styles.choices}>
          {steps.filter((option) => option !== "Condition" || products.some((product) => product.ritualStep === "Condition")).map((option) => <button key={option} type="button" aria-pressed={step === option} onClick={() => { setStep(option); track("filter_applied", { filter: "step", value: option }); }}>{option === "All" ? "Every step" : option === "Pack" ? "Hair pack" : option}</button>)}
        </div></fieldset>}
        {kind !== "individual" && counts.combos > 0 && <fieldset><legend>Combo size</legend><div className={styles.sizeChoices}>
          {sizes.map((option) => <button key={option.value} type="button" aria-pressed={size === option.value} onClick={() => setSize(option.value)}>{option.label}</button>)}
        </div></fieldset>}
        <label className={styles.available}><input type="checkbox" checked={availableOnly} onChange={(event) => setAvailableOnly(event.target.checked)} />Available only</label>
        <button type="button" className={styles.applyFilters} onClick={() => { setFiltersOpen(false); filterToggleRef.current?.focus({ preventScroll: true }); }}>Show {filtered.length} {filtered.length === 1 ? "item" : "items"}</button>
      </aside>
      <section className={styles.results} aria-labelledby="results-title">
        <div className={styles.resultsHeader}>
          <div><p className={styles.resultEyebrow}>{collectionTitle || (care !== "all" ? careCategory.label : goal === "All" ? "The botanical collection" : goal)}</p><h2 id="results-title">{kind === "combos" ? "Thoughtfully paired." : kind === "individual" ? "One botanical, your way." : "Find your everyday favourites."}</h2></div>
          <p className={styles.resultCount} role="status" aria-live="polite" aria-atomic="true">{filtered.length} {filtered.length === 1 ? "item" : "items"}</p>
        </div>
        {activeFilterCount > 0 && <div className={styles.activeFilters}>
          <span>{activeFilterCount} active {activeFilterCount === 1 ? "filter" : "filters"}{collectionTitle ? " · " + collectionTitle : ""}</span><button type="button" onClick={clear}>Clear filters</button>
        </div>}
        {source === "preview" && <p className={styles.previewNote}>Preview collection · Prices and availability are examples.</p>}
        {filtered.length > 0 ? <CollectionGrid entries={filtered} eagerImages /> : <div className={styles.empty}>
          <h3>{noConfirmedSkinUse ? "Skin use is not yet confirmed." : "A different ritual awaits."}</h3><p>{noConfirmedSkinUse ? "The current powders are offered for herbal hair packs, hair washes and botanical hair colour. Skin use remains a development option; do not apply hair-pack directions to your face or body." : "No products or combos match these filters. Explore the full collection to find your next botanical."}</p><button type="button" onClick={clear}>View all products <span aria-hidden="true">→</span></button>
        </div>}
        {filtered.some((entry) => entry.kind === "combo") && <p className={styles.footnote}>Combos include the jars shown in each set. Review the listed set price and included products; shipping and any applicable discounts are calculated at checkout.</p>}
      </section>
    </div>
  </div>;
}
