"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ritualGoals, type RitualGoal } from "@/domain/catalog/products";
import { ProductCard } from "@/features/catalog/product-card";
import { useStore } from "@/features/store/store-provider";

type StepFilter = "All" | "Cleanse" | "Condition" | "Colour";

export function ShopExplorer() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { products, track } = useStore();
  const goalParam = searchParams.get("goal");
  const collection = searchParams.get("collection")?.trim().toLowerCase() || null;
  const goal: RitualGoal | "All" = ritualGoals.includes(goalParam as RitualGoal)
    ? (goalParam as RitualGoal)
    : "All";
  const [step, setStep] = useState<StepFilter>("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"collection" | "price-low" | "price-high">("collection");
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

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
      const matchesCollection =
        !collection ||
        (product.collections ?? []).some(
          (membership) => membership.handle.toLowerCase() === collection,
        );
      const matchesStep = step === "All" || product.ritualStep === step;
      const matchesQuery =
        !normalized ||
        [product.name, product.botanical, product.subtitle, ...product.searchTerms]
          .join(" ")
          .toLowerCase()
          .includes(normalized);
      return matchesGoal && matchesCollection && matchesStep && matchesQuery;
    });

    return [...list].sort((a, b) => {
      if (sort === "price-low") return a.pricePaise - b.pricePaise;
      if (sort === "price-high") return b.pricePaise - a.pricePaise;
      return a.collectionNumber.localeCompare(b.collectionNumber);
    });
  }, [collection, goal, products, query, sort, step]);

  const collectionTitle = collection
    ? products
        .flatMap((product) => product.collections ?? [])
        .find((membership) => membership.handle.toLowerCase() === collection)?.title
    : null;

  const clear = () => {
    setStep("All");
    setQuery("");
    router.replace(pathname, { scroll: false });
  };

  const activeFilterCount =
    (goal !== "All" ? 1 : 0) + (step !== "All" ? 1 : 0) + (query ? 1 : 0);

  return (
    <div className="mx-auto w-full max-w-[1440px] px-[clamp(18px,4vw,64px)] pt-4 pb-[80px] max-[680px]:px-2.5 max-[680px]:pt-1.5 max-[680px]:pb-12">
      {/* ── Mobile Compact Filter & Search Bar (Phone View Only) ── */}
      <div className="mb-3 hidden max-[900px]:block">
        {/* Top Action Row: Search Input + Filter Drawer Button */}
        <div className="flex items-center gap-1.5">
          {/* Search Box */}
          <div className="relative flex-1">
            <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-[0.7rem] text-[var(--muted)]" aria-hidden="true">
              🔍
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search botanicals..."
              className="h-8.5 w-full rounded-full border border-[var(--line)] bg-[var(--paper)] pr-7 pl-7.5 text-[0.72rem] outline-none transition-colors focus:border-[var(--botanical)] placeholder:text-[var(--muted)]"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute top-1/2 right-2 -translate-y-1/2 grid size-4 place-items-center rounded-full text-[0.65rem] text-[var(--muted)] hover:text-[var(--forest)]"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter & Sort Button */}
          <button
            type="button"
            onClick={() => setIsFilterDrawerOpen(true)}
            className={`inline-flex h-8.5 items-center gap-1 rounded-full border px-3 text-[0.68rem] font-bold transition-all active:scale-95 cursor-pointer ${
              activeFilterCount > 0
                ? "border-[var(--forest)] bg-[var(--forest)] text-white shadow-2xs"
                : "border-[var(--line)] bg-[var(--paper)] text-[var(--forest)] hover:bg-[var(--beige)]"
            }`}
          >
            <span>⚙️ Filters</span>
            {activeFilterCount > 0 && (
              <span className="grid size-4 place-items-center rounded-full bg-[#c8d88e] text-[0.52rem] font-bold text-[#0c2419]">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Quick Goal Pills Row (Horizontal Scroll with compact padding) */}
        <div className="mt-2 flex items-center gap-1 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {["All", ...ritualGoals].map((option) => {
            const isSelected = goal === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => chooseGoal(option as RitualGoal | "All")}
                className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[0.62rem] font-medium transition-all active:scale-95 ${
                  isSelected
                    ? "bg-[var(--forest)] text-white font-semibold shadow-2xs"
                    : "border border-[var(--line)] bg-white text-[var(--forest)] hover:bg-[var(--beige)]"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Main Layout: Desktop Sidebar + Product Results ── */}
      <div className="grid grid-cols-[230px_minmax(0,1fr)] gap-[clamp(28px,3.5vw,48px)] max-[900px]:grid-cols-1">
        {/* Desktop Sidebar (Hidden on Mobile) */}
        <aside
          className="self-start rounded-2xl bg-[var(--paper)] p-4 shadow-[0_12px_38px_rgba(21,59,45,0.06)] ring-1 ring-[var(--line)] sticky top-[calc(var(--header-height)+24px)] max-[900px]:hidden"
          aria-label="Collection filters"
        >
          {/* Ritual Goal */}
          <div className="border-b border-[var(--line)] pb-4">
            <h2 className="mt-0 mb-2.5 text-[0.64rem] font-bold tracking-[0.14em] text-[var(--forest)] uppercase">
              Ritual Goal
            </h2>
            <div className="flex flex-col items-start gap-0.5">
              {["All", ...ritualGoals].map((option) => (
                <button
                  type="button"
                  key={option}
                  className={`relative w-full rounded-xl py-1.5 pr-2.5 pl-6 text-left text-[0.74rem] transition-colors cursor-pointer ${
                    goal === option
                      ? "bg-[var(--ivory)] font-bold text-[var(--forest)]"
                      : "text-[var(--muted)] hover:bg-white/60 hover:text-[var(--forest)]"
                  }`}
                  onClick={() => chooseGoal(option as RitualGoal | "All")}
                >
                  <span
                    className={`absolute top-1/2 left-2 size-1.5 -translate-y-1/2 rounded-full ${
                      goal === option ? "bg-[var(--botanical)] ring-2 ring-[var(--botanical)]/30" : "bg-[var(--line)]"
                    }`}
                  />
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Ritual Step */}
          <div className="py-4 border-b border-[var(--line)]">
            <h2 className="mt-0 mb-2.5 text-[0.64rem] font-bold tracking-[0.14em] text-[var(--forest)] uppercase">
              Ritual Step
            </h2>
            <div className="flex flex-col items-start gap-0.5">
              {(["All", "Cleanse", "Condition", "Colour"] as StepFilter[]).map((option) => (
                <button
                  type="button"
                  key={option}
                  className={`relative w-full rounded-xl py-1.5 pr-2.5 pl-6 text-left text-[0.74rem] transition-colors cursor-pointer ${
                    step === option
                      ? "bg-[var(--ivory)] font-bold text-[var(--forest)]"
                      : "text-[var(--muted)] hover:bg-white/60 hover:text-[var(--forest)]"
                  }`}
                  onClick={() => {
                    setStep(option);
                    track("filter_applied", { filter: "step", value: option });
                  }}
                >
                  <span
                    className={`absolute top-1/2 left-2 size-1.5 -translate-y-1/2 rounded-full ${
                      step === option ? "bg-[var(--botanical)] ring-2 ring-[var(--botanical)]/30" : "bg-[var(--line)]"
                    }`}
                  />
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Clear Filters */}
          {activeFilterCount > 0 && (
            <button
              className="mt-3.5 w-full rounded-xl border border-[var(--line)] py-1.5 text-center text-[0.64rem] font-bold tracking-[0.08em] text-[var(--forest)] uppercase hover:bg-[var(--beige)] cursor-pointer"
              type="button"
              onClick={clear}
            >
              Clear All Filters
            </button>
          )}
        </aside>

        {/* ── Product Results Area ── */}
        <section className="min-w-0" aria-labelledby="results-title">
          {/* Desktop Search & Sort Bar (Compact & Clean) */}
          <div className="mb-5 grid grid-cols-[1fr_200px] items-end gap-3 rounded-xl bg-[var(--paper)] p-3 shadow-xs ring-1 ring-[var(--line)] max-[900px]:hidden">
            <div>
              <label
                className="mb-1 block text-[0.62rem] font-bold tracking-[0.12em] text-[var(--forest)] uppercase"
                htmlFor="desktop-search"
              >
                Search this collection
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-xs text-[var(--muted)]" aria-hidden="true">
                  🔍
                </span>
                <input
                  className="h-9.5 w-full rounded-lg border border-[var(--line)] bg-[var(--ivory)] pr-7 pl-8 text-[0.78rem] outline-none transition-colors focus:border-[var(--botanical)]"
                  id="desktop-search"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Botanical name, goal, or benefit..."
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="absolute top-1/2 right-2.5 -translate-y-1/2 text-xs text-[var(--muted)] hover:text-[var(--forest)]"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
            <div>
              <label
                className="mb-1 block text-[0.62rem] font-bold tracking-[0.12em] text-[var(--forest)] uppercase"
                htmlFor="desktop-sort"
              >
                Sort by
              </label>
              <select
                className="h-9.5 w-full rounded-lg border border-[var(--line)] bg-[var(--ivory)] px-2.5 text-[0.78rem] outline-none transition-colors focus:border-[var(--botanical)] cursor-pointer"
                id="desktop-sort"
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
              >
                <option value="collection">Collection order</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Results Summary Bar */}
          <div
            className="mb-4 flex items-center justify-between px-1 max-[680px]:mb-2.5"
            aria-live="polite"
          >
            <h2
              className="m-0 [font-family:var(--font-display)] text-[1.4rem] font-normal text-[var(--forest)] max-[680px]:text-[1.12rem]"
              id="results-title"
            >
              {filtered.length} Botanical{filtered.length === 1 ? "" : "s"}
            </h2>
            <span className="text-[0.62rem] font-medium tracking-[0.08em] text-[var(--muted)] uppercase max-[680px]:text-[0.52rem]">
              {collectionTitle || (goal === "All" ? "Complete collection" : goal)}
            </span>
          </div>

          {/* Product Grid (2-columns on mobile, 3 on desktop) */}
          {filtered.length ? (
            <div className="grid grid-cols-3 gap-4 max-[1140px]:grid-cols-2 max-[680px]:grid-cols-2 max-[680px]:gap-2.5 max-[420px]:gap-2">
              {filtered.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          ) : (
            <div className="min-h-[340px] rounded-2xl bg-[var(--paper)] p-8 text-center shadow-xs ring-1 ring-[var(--line)] flex flex-col items-center justify-center">
              <span className="text-3xl mb-2">🌿</span>
              <p className="m-0 [font-family:var(--font-display)] text-[1.4rem] text-[var(--forest)]">
                No botanicals match these filters.
              </p>
              <p className="mt-1 mb-4 text-[0.8rem] text-[var(--muted)]">
                Try clearing your search query or choosing another ritual goal.
              </p>
              <button
                type="button"
                className="rounded-full bg-[var(--forest)] px-6 py-2.5 text-[0.72rem] font-bold uppercase tracking-[0.1em] text-white hover:bg-[var(--forest-dark)] active:scale-95 cursor-pointer"
                onClick={clear}
              >
                View Full Collection
              </button>
            </div>
          )}
        </section>
      </div>

      {/* ── Mobile Filter & Sort Drawer Modal (Bottom Sheet) ── */}
      {isFilterDrawerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/65 backdrop-blur-xs transition-opacity"
          onClick={() => setIsFilterDrawerOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Filter and sort botanicals"
        >
          <div
            className="relative flex max-h-[85vh] w-full flex-col overflow-hidden rounded-t-3xl bg-[var(--paper)] shadow-2xl animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-3.5">
              <div className="flex items-center gap-2">
                <h3 className="m-0 [font-family:var(--font-display)] text-[1.15rem] font-normal text-[var(--forest)]">
                  Filter & Sort
                </h3>
                {activeFilterCount > 0 && (
                  <span className="rounded-full bg-[var(--forest)] px-2 py-0.5 text-[0.56rem] font-bold text-white">
                    {activeFilterCount} active
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={clear}
                    className="text-[0.65rem] font-semibold text-[var(--botanical)] underline cursor-pointer"
                  >
                    Reset
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="grid size-8 place-items-center rounded-full bg-[var(--ivory)] text-sm text-[var(--forest)] hover:bg-black/10 cursor-pointer"
                  aria-label="Close filters"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Drawer Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Sort Selection */}
              <div>
                <span className="mb-2 block text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--forest)]">
                  Sort By
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: "collection", label: "Curated" },
                    { id: "price-low", label: "Price ↑" },
                    { id: "price-high", label: "Price ↓" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSort(s.id as typeof sort)}
                      className={`rounded-xl py-2 text-center text-[0.68rem] font-semibold transition-all cursor-pointer ${
                        sort === s.id
                          ? "bg-[var(--forest)] text-white shadow-2xs"
                          : "border border-[var(--line)] bg-white text-[var(--forest)]"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ritual Goal Selection */}
              <div>
                <span className="mb-2 block text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--forest)]">
                  Ritual Goal
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {["All", ...ritualGoals].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => chooseGoal(option as RitualGoal | "All")}
                      className={`rounded-xl p-2.5 text-left text-[0.72rem] transition-all cursor-pointer ${
                        goal === option
                          ? "border border-[var(--forest)] bg-[var(--forest)] text-white font-semibold shadow-2xs"
                          : "border border-[var(--line)] bg-white text-[var(--forest)] hover:bg-[var(--ivory)]"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ritual Step Selection */}
              <div>
                <span className="mb-2 block text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--forest)]">
                  Ritual Step
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {(["All", "Cleanse", "Condition", "Colour"] as StepFilter[]).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setStep(option);
                        track("filter_applied", { filter: "step", value: option });
                      }}
                      className={`rounded-xl p-2.5 text-left text-[0.72rem] transition-all cursor-pointer ${
                        step === option
                          ? "border border-[var(--forest)] bg-[var(--forest)] text-white font-semibold shadow-2xs"
                          : "border border-[var(--line)] bg-white text-[var(--forest)] hover:bg-[var(--ivory)]"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sticky Bottom Apply Button */}
            <div className="border-t border-[var(--line)] p-4 bg-[var(--paper)]">
              <button
                type="button"
                onClick={() => setIsFilterDrawerOpen(false)}
                className="w-full rounded-full bg-[#529d38] py-3 text-[0.78rem] font-bold uppercase tracking-wider text-white shadow-md transition-all hover:bg-[#43852d] active:scale-98 cursor-pointer"
              >
                Show {filtered.length} Botanical{filtered.length === 1 ? "" : "s"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
