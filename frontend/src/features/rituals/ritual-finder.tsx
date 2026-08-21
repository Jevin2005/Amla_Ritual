"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { formatCurrency, type RitualGoal } from "@/domain/catalog/products";
import { useStore } from "@/features/store/store-provider";
import {
  goalOptions,
  hairFeels,
  recommendRitual,
  type HairFeel,
} from "@/features/rituals/recommendation";

export function RitualFinder() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [goal, setGoal] = useState<RitualGoal | null>(null);
  const [hairFeel, setHairFeel] = useState<HairFeel | null>(null);
  const { products, addToCart, track } = useStore();

  const result = useMemo(
    () => (goal && hairFeel ? recommendRitual(products, goal, hairFeel) : null),
    [goal, hairFeel, products],
  );

  const handleFinish = () => {
    if (!goal || !hairFeel) return;
    const recommendation = recommendRitual(products, goal, hairFeel);
    if (!recommendation) return;
    setStep(3);
    track("quiz_completed", {
      recommendation: recommendation.product.slug,
      requires_colour_review: recommendation.requiresColourReview,
    });
  };

  const reset = () => {
    setGoal(null);
    setHairFeel(null);
    setStep(1);
  };

  return (
    <div className="w-full min-w-0 rounded-2xl border border-white/12 bg-white/[0.045] p-5 shadow-[0_16px_48px_rgba(0,0,0,0.18)] backdrop-blur-md max-[680px]:p-3.5">
      {/* Top Header / Step indicator */}
      <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[#c8d88e]">
            {step === 3 ? "Recommendation" : `Step 0${step} / 02`}
          </span>
          <span className="text-[0.6rem] text-white/40">·</span>
          <span className="text-[0.65rem] text-white/70">
            {step === 1
              ? "Ritual Goal"
              : step === 2
                ? "Hair Feel"
                : "Your Match"}
          </span>
        </div>
        <div className="flex items-center gap-1.5" aria-label={`Step ${step} of 2`}>
          <span
            className={`h-1.5 w-6 rounded-full transition-all duration-300 ${
              step >= 1 ? "bg-[#c8d88e]" : "bg-white/15"
            }`}
          />
          <span
            className={`h-1.5 w-6 rounded-full transition-all duration-300 ${
              step >= 2 ? "bg-[#c8d88e]" : "bg-white/15"
            }`}
          />
        </div>
      </div>

      {/* Step 1: Goal Selection */}
      {step === 1 && (
        <fieldset className="m-0 border-0 p-0">
          <legend className="mb-3 text-[0.88rem] font-medium text-white max-[680px]:text-[0.82rem]">
            What is your primary ritual focus today?
          </legend>
          <div className="mb-4 grid grid-cols-2 gap-2.5 max-[680px]:grid-cols-2 max-[440px]:grid-cols-1">
            {goalOptions.map((option) => {
              const isSelected = goal === option.goal;
              return (
                <button
                  key={option.goal}
                  type="button"
                  onClick={() => setGoal(option.goal)}
                  className={`group flex items-start gap-2.5 rounded-xl border p-3 text-left transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.99] max-[680px]:p-2.5 ${
                    isSelected
                      ? "border-[#c8d88e] bg-white/10 shadow-[0_4px_14px_rgba(200,216,142,0.15)]"
                      : "border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06]"
                  }`}
                >
                  <span
                    className={`mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border text-[0.55rem] font-bold ${
                      isSelected
                        ? "border-[#c8d88e] bg-[#c8d88e] text-[#122b1e]"
                        : "border-white/30 text-transparent"
                    }`}
                  >
                    ✓
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="m-0 text-[0.82rem] font-semibold text-white group-hover:text-[#c8d88e] max-[680px]:text-[0.76rem]">
                      {option.goal}
                    </p>
                    <p className="m-0 line-clamp-1 text-[0.66rem] text-white/60 max-[680px]:text-[0.62rem]">
                      {option.copy}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="flex items-center justify-end">
            <button
              type="button"
              className="inline-flex min-h-[38px] items-center justify-center gap-2 rounded-lg bg-[#c8d88e] px-5 py-2 text-[0.74rem] font-bold uppercase tracking-[0.08em] text-[#122b1e] shadow-sm transition-all hover:bg-[#d8e8a0] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={!goal}
              onClick={() => setStep(2)}
            >
              Continue <span>→</span>
            </button>
          </div>
        </fieldset>
      )}

      {/* Step 2: Hair Feel Selection */}
      {step === 2 && (
        <fieldset className="m-0 border-0 p-0">
          <legend className="mb-3 text-[0.88rem] font-medium text-white max-[680px]:text-[0.82rem]">
            How do your scalp and hair feel?
          </legend>
          <div className="mb-4 grid grid-cols-2 gap-2.5 max-[680px]:grid-cols-2 max-[440px]:grid-cols-1">
            {hairFeels.map((option) => {
              const isSelected = hairFeel === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setHairFeel(option)}
                  className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.99] max-[680px]:p-2.5 ${
                    isSelected
                      ? "border-[#c8d88e] bg-white/10 shadow-[0_4px_14px_rgba(200,216,142,0.15)]"
                      : "border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06]"
                  }`}
                >
                  <span
                    className={`grid size-4 shrink-0 place-items-center rounded-full border text-[0.55rem] font-bold ${
                      isSelected
                        ? "border-[#c8d88e] bg-[#c8d88e] text-[#122b1e]"
                        : "border-white/30 text-transparent"
                    }`}
                  >
                    ✓
                  </span>
                  <span className="text-[0.8rem] font-medium text-white max-[680px]:text-[0.74rem]">
                    {option}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              className="inline-flex min-h-[38px] items-center justify-center rounded-lg border border-white/20 px-4 py-2 text-[0.72rem] font-semibold text-white/80 transition-all hover:bg-white/10"
              onClick={() => setStep(1)}
            >
              ← Back
            </button>
            <button
              type="button"
              className="inline-flex min-h-[38px] items-center justify-center gap-2 rounded-lg bg-[#c8d88e] px-5 py-2 text-[0.74rem] font-bold uppercase tracking-[0.08em] text-[#122b1e] shadow-sm transition-all hover:bg-[#d8e8a0] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={!hairFeel}
              onClick={handleFinish}
            >
              Reveal Ritual <span>→</span>
            </button>
          </div>
        </fieldset>
      )}

      {/* Step 3: Match Result Card */}
      {step === 3 && result && (
        <div className="flex items-center gap-4 max-[680px]:flex-col max-[680px]:items-start" aria-live="polite">
          {/* Result image */}
          <div className="relative size-[105px] shrink-0 overflow-hidden rounded-xl border border-white/15 bg-white/5 shadow-md max-[680px]:size-[80px]">
            <Image
              src={result.product.featuredImage?.url || "/images/amla-powder.jpg"}
              alt={result.product.name}
              fill
              sizes="120px"
              className="size-full object-cover object-center"
            />
          </div>

          {/* Result details */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[0.56rem] font-bold uppercase tracking-[0.14em] text-[#c8d88e]">
                {result.product.ritualStep} Ritual Match
              </span>
              <span className="text-[0.6rem] text-white/40">·</span>
              <span className="text-[0.7rem] font-bold text-white">
                {formatCurrency(result.product.pricePaise, result.product.currencyCode || "INR")}
              </span>
            </div>
            <h3 className="my-0.5 [font-family:var(--font-display)] text-[1.45rem] font-normal leading-tight text-white max-[680px]:text-[1.25rem]">
              {result.product.name}
            </h3>
            <p className="mb-3 line-clamp-2 text-[0.72rem] leading-[1.4] text-white/70 max-[680px]:mb-2.5 max-[680px]:text-[0.66rem]">
              {result.guidance || result.product.shortDescription}
            </p>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                className="inline-flex min-h-[36px] items-center justify-center gap-1.5 rounded-lg bg-[#c8d88e] px-4 py-1.5 text-[0.72rem] font-bold uppercase tracking-[0.08em] text-[#122b1e] shadow-sm transition-all hover:bg-[#d8e8a0] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                onClick={() => addToCart(result.product.slug)}
                disabled={result.product.availableForSale === false}
              >
                {result.product.availableForSale === false ? "Sold out" : "Add to Bag"} <span>+</span>
              </button>
              <Link
                href={`/shop/${result.product.slug}`}
                className="inline-flex min-h-[36px] items-center justify-center rounded-lg border border-white/20 px-3.5 py-1.5 text-[0.72rem] font-medium text-white transition-all hover:bg-white/10"
              >
                View Ritual ↗
              </Link>
              <button
                type="button"
                onClick={reset}
                className="ml-auto text-[0.62rem] text-white/50 underline-offset-2 hover:text-white hover:underline"
              >
                ↻ Restart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
