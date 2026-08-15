"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { products, ritualGoals, type RitualGoal } from "@/domain/catalog/products";
import { ProductCard } from "@/features/catalog/components/product-card";
import { useStore } from "@/features/store/store-provider";

type StepFilter = "All" | "Cleanse" | "Condition" | "Colour";

export function ShopExplorer() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { track } = useStore();
  const goalParam = searchParams.get("goal");
  const goal: RitualGoal | "All" = ritualGoals.includes(goalParam as RitualGoal)
    ? (goalParam as RitualGoal)
    : "All";
  const [step, setStep] = useState<StepFilter>("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"collection" | "price-low" | "price-high">("collection");

  const chooseGoal = (nextGoal: RitualGoal | "All") => {
    const params = new URLSearchParams(searchParams.toString());
    if (nextGoal === "All") params.delete("goal");
    else params.set("goal", nextGoal);
    const url = params.size ? `${pathname}?${params.toString()}` : pathname;
    router.replace(url, { scroll: false });
    track("filter_applied", { filter: "goal", value: nextGoal });
  };

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const list = products.filter((product) => {
      const matchesGoal = goal === "All" || product.concerns.includes(goal);
      const matchesStep = step === "All" || product.ritualStep === step;
      const matchesQuery =
        !normalized ||
        [product.name, product.botanical, product.subtitle, ...product.searchTerms]
          .join(" ")
          .toLowerCase()
          .includes(normalized);
      return matchesGoal && matchesStep && matchesQuery;
    });

    return [...list].sort((a, b) => {
      if (sort === "price-low") return a.pricePaise - b.pricePaise;
      if (sort === "price-high") return b.pricePaise - a.pricePaise;
      return a.collectionNumber.localeCompare(b.collectionNumber);
    });
  }, [goal, query, sort, step]);

  const clear = () => {
    setStep("All");
    setQuery("");
    router.replace(pathname, { scroll: false });
  };

  return (
    <div className="shop-explorer">
      <aside className="shop-filters" aria-label="Collection filters">
        <div className="shop-filter-block">
          <h2>Ritual goal</h2>
          <div className="filter-chips">
            {["All", ...ritualGoals].map((option) => (
              <button
                type="button"
                key={option}
                className={goal === option ? "is-active" : ""}
                aria-pressed={goal === option}
                onClick={() => chooseGoal(option as RitualGoal | "All")}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        <div className="shop-filter-block">
          <h2>Ritual step</h2>
          <div className="filter-chips">
            {(["All", "Cleanse", "Condition", "Colour"] as StepFilter[]).map((option) => (
              <button
                type="button"
                key={option}
                className={step === option ? "is-active" : ""}
                aria-pressed={step === option}
                onClick={() => {
                  setStep(option);
                  track("filter_applied", { filter: "step", value: option });
                }}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        <button className="clear-filters" type="button" onClick={clear}>
          Clear all filters
        </button>
      </aside>
      <section className="shop-results" aria-labelledby="results-title">
        <div className="shop-toolbar">
          <div>
            <label htmlFor="collection-search">Search this collection</label>
            <input
              id="collection-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Botanical or ritual goal"
            />
          </div>
          <div>
            <label htmlFor="collection-sort">Sort by</label>
            <select
              id="collection-sort"
              value={sort}
              onChange={(event) => setSort(event.target.value as typeof sort)}
            >
              <option value="collection">Collection order</option>
              <option value="price-low">Preview price: low to high</option>
              <option value="price-high">Preview price: high to low</option>
            </select>
          </div>
        </div>
        <div className="shop-results__meta" aria-live="polite">
          <h2 id="results-title">{filtered.length} botanical{filtered.length === 1 ? "" : "s"}</h2>
          <span>{goal === "All" ? "The complete collection" : goal}</span>
        </div>
        {filtered.length ? (
          <div className="shop-grid">
            {filtered.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        ) : (
          <div className="shop-empty empty-state">
            <p className="display-small">No botanical matches those filters.</p>
            <p>Clear the selection or try a broader ritual goal.</p>
            <button type="button" className="button button--outline" onClick={clear}>
              See the full collection
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
