"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { RitualGoal } from "@/domain/catalog/products";
import { ProductJar } from "@/features/catalog/product-jar";
import { useStore } from "@/features/store/store-provider";
import {
  goalOptions,
  hairFeels,
  recommendRitual,
  type HairFeel,
} from "@/features/rituals/recommendation";

export function RitualFinder() {
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState<RitualGoal | null>(null);
  const [hairFeel, setHairFeel] = useState<HairFeel | null>(null);
  const { products, addToCart, track } = useStore();
  const result = useMemo(
    () =>
      goal && hairFeel ? recommendRitual(products, goal, hairFeel) : null,
    [goal, hairFeel, products],
  );

  const finish = () => {
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
    <div className="min-w-0 rounded-[var(--radius-lg)] border border-white/12 bg-white/[0.045] p-[clamp(22px,3vw,38px)] shadow-[0_24px_70px_rgba(0,0,0,0.12)] backdrop-blur-sm max-[680px]:rounded-[var(--radius-md)]">
      <div className="mb-10 grid grid-cols-3 gap-2" aria-label={`Step ${step} of 3`}>
        {[1, 2, 3].map((number) => (
          <span
            key={number}
            className={`h-1 rounded-full transition-colors duration-[350ms] ${
              step >= number ? "bg-[var(--amla)]" : "bg-white/15"
            }`}
          />
        ))}
      </div>

      {step === 1 && (
        <fieldset className="m-0 border-0 p-0">
          <legend className="mb-[30px] grid max-w-[660px] font-serif text-[clamp(1.8rem,3vw,3.3rem)] leading-[1.08] tracking-[-0.035em]">
            <span className="mb-2 font-sans text-[0.65rem] font-bold tracking-[0.14em] text-[var(--amla)]">01</span>
            What would you like your ritual to focus on?
          </legend>
          <div className="mb-[26px] grid grid-cols-2 gap-3 max-[620px]:grid-cols-1">
            {goalOptions.map((option) => (
              <label
                key={option.goal}
                className={`relative grid min-h-[145px] cursor-pointer rounded-[var(--radius-md)] border border-white/12 bg-white/[0.035] p-6 transition-[background-color,border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-[var(--amla)] hover:bg-white/8 [&:has(input:focus-visible)]:-outline-offset-3 [&:has(input:focus-visible)]:outline-2 [&:has(input:focus-visible)]:outline-[var(--amla)] max-[620px]:min-h-[125px] max-[620px]:p-5 ${
                  goal === option.goal ? "border-[var(--amla)] bg-white/10" : ""
                }`}
              >
                <input
                  className="pointer-events-none absolute opacity-0"
                  type="radio"
                  name="ritual-goal"
                  value={option.goal}
                  checked={goal === option.goal}
                  onChange={() => setGoal(option.goal)}
                />
                <span className="text-[0.6rem] text-[var(--amla)]">{option.number}</span>
                <strong className="self-end font-serif text-[1.45rem] font-normal">{option.goal}</strong>
                <small className="text-[0.72rem] leading-[1.5] text-white/68">{option.copy}</small>
                <span
                  className={`absolute right-5 top-5 grid size-[25px] place-items-center rounded-full border text-xs ${
                    goal === option.goal
                      ? "border-[var(--amla)] bg-[var(--amla)] text-[var(--forest)]"
                      : "border-white/30 text-transparent"
                  }`}
                  aria-hidden="true"
                >
                  ✓
                </span>
              </label>
            ))}
          </div>
          <button
            type="button"
            className="inline-flex min-h-[52px] items-center justify-center gap-[14px] rounded-full border border-transparent bg-[var(--paper)] px-6 py-[13px] text-[0.72rem] font-bold uppercase leading-none tracking-[0.12em] text-[var(--forest)] shadow-[0_10px_26px_rgba(0,0,0,0.14)] transition-[transform,background-color,color,border-color] duration-[350ms] ease-[var(--ease)] hover:-translate-y-0.5 hover:bg-[var(--amla)] disabled:cursor-not-allowed disabled:opacity-45"
            disabled={!goal}
            onClick={() => setStep(2)}
          >
            Continue <span aria-hidden="true">→</span>
          </button>
        </fieldset>
      )}

      {step === 2 && (
        <fieldset className="m-0 border-0 p-0">
          <legend className="mb-[30px] grid max-w-[660px] font-serif text-[clamp(1.8rem,3vw,3.3rem)] leading-[1.08] tracking-[-0.035em]">
            <span className="mb-2 font-sans text-[0.65rem] font-bold tracking-[0.14em] text-[var(--amla)]">02</span>
            How do your hair and lengths feel today?
          </legend>
          <div className="mb-[35px] grid grid-cols-2 gap-3 max-[620px]:grid-cols-1">
            {hairFeels.map((option) => (
              <label
                key={option}
                className={`relative min-h-[70px] cursor-pointer rounded-[var(--radius-sm)] border border-white/20 bg-white/[0.025] p-[22px] transition-[border-color,background-color,transform] duration-250 hover:-translate-y-0.5 hover:border-[var(--amla)] hover:bg-[rgba(183,212,90,0.08)] [&:has(input:focus-visible)]:-outline-offset-3 [&:has(input:focus-visible)]:outline-2 [&:has(input:focus-visible)]:outline-[var(--amla)] ${
                  hairFeel === option
                    ? "border-[var(--amla)] bg-[rgba(183,212,90,0.1)]"
                    : ""
                }`}
              >
                <input
                  className="pointer-events-none absolute opacity-0"
                  type="radio"
                  name="hair-feel"
                  value={option}
                  checked={hairFeel === option}
                  onChange={() => setHairFeel(option)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
          <div className="flex gap-3 max-[680px]:flex-col-reverse max-[680px]:[&>button]:w-full">
            <button
              type="button"
              className="inline-flex min-h-[52px] items-center justify-center gap-[14px] rounded-full border border-white/28 bg-transparent px-6 py-[13px] text-[0.72rem] font-bold uppercase leading-none tracking-[0.12em] text-[var(--paper)] transition-[transform,background-color,color,border-color] duration-[350ms] ease-[var(--ease)] hover:-translate-y-0.5 hover:bg-white/8"
              onClick={() => setStep(1)}
            >
              Back
            </button>
            <button
              type="button"
              className="inline-flex min-h-[52px] items-center justify-center gap-[14px] rounded-full border border-transparent bg-[var(--paper)] px-6 py-[13px] text-[0.72rem] font-bold uppercase leading-none tracking-[0.12em] text-[var(--forest)] shadow-[0_10px_26px_rgba(0,0,0,0.14)] transition-[transform,background-color,color,border-color] duration-[350ms] ease-[var(--ease)] hover:-translate-y-0.5 hover:bg-[var(--amla)] disabled:cursor-not-allowed disabled:opacity-45"
              disabled={!hairFeel}
              onClick={finish}
            >
              Reveal my ritual <span aria-hidden="true">→</span>
            </button>
          </div>
        </fieldset>
      )}

      {step === 3 && result && (
        <div className="grid grid-cols-[0.68fr_1fr] items-center gap-[clamp(32px,5vw,56px)] max-[780px]:grid-cols-1" aria-live="polite">
          <div className="flex min-h-[390px] items-end justify-center overflow-hidden rounded-[var(--radius-md)] bg-white/8 ring-1 ring-white/10 max-[780px]:min-h-[340px]">
            <ProductJar product={result.product} size="large" className="max-[780px]:origin-bottom max-[780px]:scale-[0.82]" decorative />
          </div>
          <div>
            <p className="mb-4 text-[0.68rem] font-bold uppercase leading-[1.3] tracking-[0.2em] text-[#c8d88e]">
              {result.requiresColourReview ? "A careful next step" : "Your starting ritual"}
            </p>
            <h3 className="mb-[18px] font-serif text-[clamp(3rem,4vw,5rem)] font-normal leading-[0.95] tracking-[-0.05em]">{result.product.name}</h3>
            <p className="max-w-[520px] text-white/70">{result.product.shortDescription}</p>
            <p className="max-w-[520px] border-l-2 border-[var(--amla)] pl-4 text-[0.78rem] text-white/70">
              {result.guidance || "This is cosmetic guidance, not a diagnosis. Always read the final pack directions and patch test."}
            </p>
            <div className="flex gap-3 max-[680px]:items-stretch max-[680px]:flex-col">
              {result.requiresColourReview ? (
                <Link
                  className="inline-flex min-h-[52px] items-center justify-center gap-[14px] rounded-full border border-transparent bg-[var(--paper)] px-6 py-[13px] text-[0.72rem] font-bold uppercase leading-none tracking-[0.12em] text-[var(--forest)] transition-[transform,background-color,color,border-color] duration-[350ms] ease-[var(--ease)] hover:-translate-y-0.5 hover:bg-[var(--amla)]"
                  href={`/shop/${result.product.slug}`}
                >
                  Read colour guidance <span aria-hidden="true">↗</span>
                </Link>
              ) : (
                <>
                  <button
                    className="inline-flex min-h-[52px] items-center justify-center gap-[14px] rounded-full border border-transparent bg-[var(--paper)] px-6 py-[13px] text-[0.72rem] font-bold uppercase leading-none tracking-[0.12em] text-[var(--forest)] transition-[transform,background-color,color,border-color] duration-[350ms] ease-[var(--ease)] hover:-translate-y-0.5 hover:bg-[var(--amla)] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0"
                    type="button"
                    onClick={() => addToCart(result.product.slug)}
                    disabled={result.product.availableForSale === false}
                  >
                    {result.product.availableForSale === false
                      ? "Sold out"
                      : "Add to bag"}{" "}
                    <span aria-hidden="true">↗</span>
                  </button>
                  <Link className="inline-flex items-center gap-3.5 border-b border-[var(--paper)] pb-[5px] text-[0.76rem] font-bold uppercase tracking-[0.08em] text-[var(--paper)] transition-[gap] duration-[260ms] ease-[var(--ease)] hover:gap-[22px] max-[680px]:min-h-11" href={`/shop/${result.product.slug}`}>
                    Read the ritual
                  </Link>
                </>
              )}
            </div>
            <button className="mt-[25px] border-b border-white/50 bg-transparent pb-[3px] text-[0.66rem] uppercase tracking-[0.1em] text-white/70 max-[680px]:inline-flex max-[680px]:min-h-11 max-[680px]:items-center" type="button" onClick={reset}>
              Start again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
