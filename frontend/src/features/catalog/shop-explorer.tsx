"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { products, ritualGoals, type RitualGoal } from "@/domain/catalog/products";
import { ProductCard } from "@/features/catalog/product-card";
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
    <div className="mx-auto grid w-[min(100%,1500px)] grid-cols-[235px_1fr] gap-[clamp(40px,5vw,75px)] px-[clamp(25px,6vw,96px)] pt-[70px] pb-[140px] max-[900px]:grid-cols-1 max-[680px]:px-5 max-[680px]:pt-[50px] max-[680px]:pb-[95px]">
      <aside className="self-start max-[900px]:grid max-[900px]:grid-cols-2 max-[900px]:gap-5 max-[680px]:grid-cols-1" aria-label="Collection filters">
        <div className="border-t border-[var(--line)] py-[25px] max-[900px]:border max-[900px]:p-5">
          <h2 className="mt-0 mb-4 text-[0.63rem] tracking-[0.13em] text-[var(--forest)] uppercase">Ritual goal</h2>
          <div className="flex flex-col items-start gap-[3px] max-[900px]:flex-row max-[900px]:flex-wrap max-[900px]:items-center">
            {["All", ...ritualGoals].map((option) => (
              <button
                type="button"
                key={option}
                className={`relative min-h-9 bg-transparent py-[3px] pr-0 pl-[22px] text-left text-[0.76rem] before:absolute before:top-1/2 before:left-0 before:size-2.5 before:-translate-y-1/2 before:rounded-full before:content-[''] max-[900px]:min-h-10 max-[900px]:py-1.5 max-[900px]:pr-3 max-[900px]:pl-[30px] max-[900px]:before:left-[9px] ${
                  goal === option
                    ? "font-bold text-[var(--forest)] before:border-[3px] before:border-[var(--ivory)] before:bg-[var(--botanical)] before:shadow-[0_0_0_1px_var(--botanical)]"
                    : "text-[var(--muted)] before:border before:border-[var(--line)]"
                }`}
                aria-pressed={goal === option}
                onClick={() => chooseGoal(option as RitualGoal | "All")}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        <div className="border-t border-[var(--line)] py-[25px] max-[900px]:border max-[900px]:p-5">
          <h2 className="mt-0 mb-4 text-[0.63rem] tracking-[0.13em] text-[var(--forest)] uppercase">Ritual step</h2>
          <div className="flex flex-col items-start gap-[3px] max-[900px]:flex-row max-[900px]:flex-wrap max-[900px]:items-center">
            {(["All", "Cleanse", "Condition", "Colour"] as StepFilter[]).map((option) => (
              <button
                type="button"
                key={option}
                className={`relative min-h-9 bg-transparent py-[3px] pr-0 pl-[22px] text-left text-[0.76rem] before:absolute before:top-1/2 before:left-0 before:size-2.5 before:-translate-y-1/2 before:rounded-full before:content-[''] max-[900px]:min-h-10 max-[900px]:py-1.5 max-[900px]:pr-3 max-[900px]:pl-[30px] max-[900px]:before:left-[9px] ${
                  step === option
                    ? "font-bold text-[var(--forest)] before:border-[3px] before:border-[var(--ivory)] before:bg-[var(--botanical)] before:shadow-[0_0_0_1px_var(--botanical)]"
                    : "text-[var(--muted)] before:border before:border-[var(--line)]"
                }`}
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
        <button className="border-b border-[var(--forest)] bg-transparent pb-[3px] text-[0.63rem] tracking-[0.08em] text-[var(--forest)] uppercase max-[900px]:col-span-full max-[900px]:justify-self-start" type="button" onClick={clear}>
          Clear all filters
        </button>
      </aside>
      <section className="min-w-0" aria-labelledby="results-title">
        <div className="grid grid-cols-[1fr_240px] items-end gap-5 max-[680px]:grid-cols-1">
          <div>
            <label className="mb-[7px] block text-[0.58rem] font-bold tracking-[0.12em] text-[var(--forest)] uppercase" htmlFor="collection-search">Search this collection</label>
            <input
              className="h-[50px] w-full rounded-none border border-[var(--line)] bg-[var(--paper)] px-[15px] outline-none"
              id="collection-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Botanical or ritual goal"
            />
          </div>
          <div>
            <label className="mb-[7px] block text-[0.58rem] font-bold tracking-[0.12em] text-[var(--forest)] uppercase" htmlFor="collection-sort">Sort by</label>
            <select
              className="h-[50px] w-full rounded-none border border-[var(--line)] bg-[var(--paper)] px-[15px] outline-none"
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
        <div className="flex items-center justify-between px-0 pt-[30px] pb-[22px] max-[680px]:flex-col max-[680px]:items-start max-[680px]:gap-1" aria-live="polite">
          <h2 className="m-0 font-serif text-[1.7rem] font-normal text-[var(--forest)]" id="results-title">{filtered.length} botanical{filtered.length === 1 ? "" : "s"}</h2>
          <span className="text-[0.61rem] tracking-[0.1em] text-[var(--muted)] uppercase">{goal === "All" ? "The complete collection" : goal}</span>
        </div>
        {filtered.length ? (
          <div className="grid grid-cols-2 gap-[22px] max-[680px]:grid-cols-1 [&>article>div:first-child]:h-[clamp(340px,32vw,460px)]">
            {filtered.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        ) : (
          <div className="min-h-[420px] bg-[var(--paper)] px-[25px] py-[100px] text-center">
            <p className="m-0 font-serif text-[clamp(2rem,3vw,3rem)] leading-[1.04]">No botanical matches those filters.</p>
            <p className="max-w-[360px] text-[var(--muted)]">Clear the selection or try a broader ritual goal.</p>
            <button type="button" className="mt-[15px] inline-flex min-h-[50px] items-center justify-center gap-[22px] border border-[var(--forest)] bg-transparent px-6 py-[13px] text-[0.72rem] leading-none font-bold tracking-[0.12em] text-[var(--forest)] uppercase transition-[transform,background-color,color,border-color] duration-[350ms] ease-[var(--ease)] hover:-translate-y-0.5 hover:bg-[var(--forest)] hover:text-[var(--paper)]" onClick={clear}>
              See the full collection
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
