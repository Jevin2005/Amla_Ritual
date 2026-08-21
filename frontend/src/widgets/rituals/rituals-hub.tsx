"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { formatCurrency } from "@/domain/catalog/products";
import { RitualFinder } from "@/features/rituals/ritual-finder";
import { useStore } from "@/features/store/store-provider";

interface MixingRecipe {
  id: string;
  name: string;
  subtitle: string;
  target: string;
  ratio: string;
  ingredients: { name: string; parts: string; color: string; slug: string }[];
  instructions: string;
  frequency: string;
  time: string;
}

const MIXING_RECIPES: MixingRecipe[] = [
  {
    id: "foundation-cleanse",
    name: "The Foundation Cleanse",
    subtitle: "Low-lather clarifying scalp ritual",
    target: "Oily scalp & low-lather wash day",
    ratio: "2 : 1 : 1",
    ingredients: [
      { name: "Amla Powder", parts: "2 Parts", color: "#60a842", slug: "amla-powder" },
      { name: "Reetha Powder", parts: "1 Part", color: "#c8a165", slug: "reetha-powder" },
      { name: "Shikakai Powder", parts: "1 Part", color: "#8c564b", slug: "shikakai-powder" },
    ],
    instructions:
      "Whisk with warm water into a thin pourable emulsion. Massage into scalp for 3 mins, then rinse thoroughly.",
    frequency: "1–2x weekly",
    time: "5–10 mins",
  },
  {
    id: "mirror-gloss",
    name: "The Mirror Gloss Mask",
    subtitle: "Intense botanical slip & curl bounce",
    target: "Dry lengths, frizz & lack of shine",
    ratio: "2 : 2",
    ingredients: [
      { name: "Amla Powder", parts: "2 Parts", color: "#60a842", slug: "amla-powder" },
      { name: "Hibiscus Powder", parts: "2 Parts", color: "#c44d58", slug: "hibiscus-powder" },
    ],
    instructions:
      "Mix with warm water into a silky yogurt texture. Apply to mid-lengths and ends; rest 30 mins before rinsing.",
    frequency: "Once weekly",
    time: "30–45 mins",
  },
  {
    id: "scalp-grounding",
    name: "The Scalp Grounding Ritual",
    subtitle: "Root strengthening & tension relief",
    target: "Shedding & sensitive scalp",
    ratio: "3 : 1",
    ingredients: [
      { name: "Bhringraj Powder", parts: "3 Parts", color: "#2d5a43", slug: "bhringraj-powder" },
      { name: "Amla Powder", parts: "1 Part", color: "#60a842", slug: "amla-powder" },
    ],
    instructions:
      "Blend with warm water. Part hair into quadrants and apply directly onto scalp in circular motions. Rest 40 mins.",
    frequency: "Weekly",
    time: "40 mins",
  },
  {
    id: "obsidian-depth",
    name: "The Obsidian Depth Glaze",
    subtitle: "Cool dark tone enrichment",
    target: "Dark hair revival & grey blending",
    ratio: "3 : 1",
    ingredients: [
      { name: "Indigo Powder", parts: "3 Parts", color: "#2b3d68", slug: "indigo-powder" },
      { name: "Amla Powder", parts: "1 Part", color: "#60a842", slug: "amla-powder" },
    ],
    instructions:
      "Mix with lukewarm water immediately before application. Apply to clean hair. Always strand test first.",
    frequency: "Monthly",
    time: "60–90 mins",
  },
];

const PREPARATION_STEPS = [
  {
    number: "01",
    title: "Measure into a bone-dry bowl",
    subtitle: "Protect jar freshness",
    description:
      "Keep water and steam strictly out of your jar. Use a dry wooden spoon to scoop 2–3 tablespoons of fresh powder into your bowl.",
    icon: "🥣",
    tip: "A ceramic or glass bowl preserves botanical potency best.",
  },
  {
    number: "02",
    title: "Stream warm water slowly",
    subtitle: "Whisk into a silky paste",
    description:
      "Add warm water gradually while whisking into a smooth, clump-free Greek yogurt texture. Let rest 5 minutes to release actives.",
    icon: "💧",
    tip: "A smooth texture ensures easy spread without tugging.",
  },
  {
    number: "03",
    title: "Part & apply with intention",
    subtitle: "Root massage & lengths coating",
    description:
      "Divide hair into 4 easy sections. Massage paste directly into scalp with gentle circles, then smooth down through your lengths.",
    icon: "🌿",
    tip: "Gentle circular massage stimulates follicle circulation.",
  },
  {
    number: "04",
    title: "Unhurried rest & clear rinse",
    subtitle: "Zero harsh foaming shampoos",
    description:
      "Slip on a cap or warm towel and rest for 20–45 minutes. Rinse thoroughly with lukewarm water until runoff runs completely clear.",
    icon: "✨",
    tip: "Enjoy natural weightless slip and shine once air-dried.",
  },
];

const RITUAL_PATHS = [
  {
    id: "cleanse",
    title: "Cleanse",
    tagline: "Low-lather botanical wash day",
    herbs: "Reetha · Shikakai",
    slug: "reetha-powder",
    goal: "Cleanse",
    accent: "#c8a165",
    description:
      "Gentle natural saponins cleanse hair and balance scalp sebum without stripping the protective acid mantle.",
    timing: "5–10 mins · 1–2x Weekly",
  },
  {
    id: "condition",
    title: "Condition",
    tagline: "Unhurried moisture & mirror shine",
    herbs: "Amla · Hibiscus",
    slug: "amla-powder",
    goal: "Softness + Shine",
    accent: "#60a842",
    description:
      "Rich in natural Vitamin C and plant mucilage to seal hair cuticles, soften coarse lengths, and impart reflective gloss.",
    timing: "30–45 mins · Weekly",
  },
  {
    id: "ground",
    title: "Ground",
    tagline: "Scalp vitality & root nourishment",
    herbs: "Bhringraj · Amla",
    slug: "bhringraj-powder",
    goal: "Scalp Ritual",
    accent: "#2d5a43",
    description:
      "Traditional Ayurvedic botanical that cools the scalp, relieves stress tension, and revitalizes follicles.",
    timing: "40 mins · Weekly",
  },
  {
    id: "colour",
    title: "Colour",
    tagline: "Pure plant pigment & depth",
    herbs: "Indigo Powder",
    slug: "indigo-powder",
    goal: "Botanical Colour",
    accent: "#2b3d68",
    description:
      "Pure shade-dried Indigofera leaves that deposit rich, natural dark pigment without ammonia or peroxide.",
    timing: "60–90 mins · Monthly",
  },
];

const RITUAL_FAQS = [
  {
    question: "How often should I practice a botanical hair ritual?",
    answer:
      "For cleansing (Reetha & Shikakai), use 1–2 times per week in place of commercial shampoo. For deep conditioning masks (Amla & Hibiscus) or scalp grounding (Bhringraj), once a week is the ideal rhythm.",
  },
  {
    question: "Can I blend multiple NatureMist powders together?",
    answer:
      "Yes, our single-botanical powders are intentionally designed to be custom-blended! Refer to our Botanical Mixing Matrix above for proven traditional ratios such as The Foundation Cleanse (Amla + Reetha + Shikakai) or The Mirror Gloss Mask (Amla + Hibiscus).",
  },
  {
    question: "Why doesn't botanical cleanser lather like commercial shampoo?",
    answer:
      "Traditional botanicals like Reetha and Shikakai contain natural plant saponins rather than synthetic foaming agents (such as SLS/SLES). They cleanse effectively without aggressive foaming, leaving your natural lipid barrier intact.",
  },
  {
    question: "How long can I store freshly mixed botanical paste?",
    answer:
      "Because NatureMist powders contain 100% pure botanical herbs with zero chemical preservatives, freshly prepared paste should be used immediately within 1–2 hours of mixing with water.",
  },
];

export function RitualsHub() {
  const [activeRecipeId, setActiveRecipeId] = useState("foundation-cleanse");
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const { products, addToCart } = useStore();

  const activeRecipe =
    MIXING_RECIPES.find((r) => r.id === activeRecipeId) ?? MIXING_RECIPES[0];

  return (
    <div className="w-full">
      {/* ── 1. Editorial Luxury Hero ── */}
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_50%_0%,rgba(183,212,90,0.15),transparent_40%),linear-gradient(180deg,var(--ivory)_0%,var(--paper)_100%)] px-[clamp(24px,5vw,72px)] pt-[clamp(60px,8vw,110px)] pb-[clamp(50px,6vw,80px)] max-[680px]:px-3 max-[680px]:pt-7 max-[680px]:pb-5">
        <div className="mx-auto max-w-[1440px] text-center">
          {/* Eyebrow */}
          <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-white/70 px-3.5 py-1 shadow-xs backdrop-blur-md max-[680px]:mb-1.5 max-[680px]:px-2.5 max-[680px]:py-0.5">
            <span className="size-1.5 rounded-full bg-[var(--botanical)] animate-pulse" />
            <span className="text-[0.64rem] font-bold uppercase tracking-[0.18em] text-[var(--botanical)] max-[680px]:text-[0.5rem]">
              The NatureMist Ritual Room
            </span>
          </div>

          {/* Master Heading */}
          <h1 className="mx-auto my-2.5 max-w-[980px] [font-family:var(--font-display)] text-[clamp(2.8rem,5.5vw,5.6rem)] font-normal leading-[0.94] tracking-[-0.045em] text-[var(--forest)] max-[680px]:my-1.5 max-[680px]:text-[clamp(1.75rem,7.5vw,2.25rem)] max-[680px]:leading-[1.04]">
            Ancient botanical care. <br className="hidden max-[680px]:inline" />
            Translated with calm clarity.
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-3 max-w-[620px] text-[clamp(0.95rem,1.2vw,1.15rem)] leading-[1.65] text-[var(--muted)] max-[680px]:mt-1.5 max-[680px]:text-[0.74rem] max-[680px]:leading-[1.4]">
            Pure shade-dried single herbs, zero chemical detergents, and a personalized rhythm for your scalp and lengths.
          </p>

          {/* Desktop Floating Pillars - Hidden on mobile for compact view */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3 max-[680px]:hidden">
            {[
              "100% Shade-Dried Herbs",
              "Zero Detergents & Silicones",
              "Fresh Water Alchemy",
              "Customizable Ratios",
            ].map((pillar) => (
              <span
                key={pillar}
                className="inline-flex items-center gap-1.5 rounded-full border border-black/5 bg-white/80 px-3.5 py-1.5 text-[0.7rem] font-semibold text-[var(--forest)] shadow-xs"
              >
                <span className="text-[var(--botanical)]">✓</span> {pillar}
              </span>
            ))}
          </div>

          {/* Quick Anchor Navigation (Horizontal scrollable on mobile) */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 max-[680px]:mt-4 max-[680px]:flex-nowrap max-[680px]:overflow-x-auto max-[680px]:justify-start max-[680px]:gap-1.5 max-[680px]:pb-1 max-[680px]:[scrollbar-width:none] max-[680px]:[&::-webkit-scrollbar]:hidden">
            <a
              href="#finder"
              className="shrink-0 rounded-full bg-[var(--forest)] px-4 py-2 text-[0.7rem] font-bold uppercase tracking-[0.08em] text-white shadow-sm transition-all hover:bg-[var(--forest-dark)] active:scale-95 max-[680px]:px-3 max-[680px]:py-1.5 max-[680px]:text-[0.58rem]"
            >
              ✨ Find My Match
            </a>
            <a
              href="#preparation"
              className="shrink-0 rounded-full border border-[var(--line)] bg-white px-3.5 py-2 text-[0.7rem] font-semibold text-[var(--forest)] shadow-xs transition-all hover:bg-[var(--beige)] active:scale-95 max-[680px]:px-2.5 max-[680px]:py-1.5 max-[680px]:text-[0.58rem]"
            >
              🥣 4-Step Prep
            </a>
            <a
              href="#matrix"
              className="shrink-0 rounded-full border border-[var(--line)] bg-white px-3.5 py-2 text-[0.7rem] font-semibold text-[var(--forest)] shadow-xs transition-all hover:bg-[var(--beige)] active:scale-95 max-[680px]:px-2.5 max-[680px]:py-1.5 max-[680px]:text-[0.58rem]"
            >
              ⚗️ Mixing Matrix
            </a>
            <a
              href="#ritual-paths"
              className="shrink-0 rounded-full border border-[var(--line)] bg-white px-3.5 py-2 text-[0.7rem] font-semibold text-[var(--forest)] shadow-xs transition-all hover:bg-[var(--beige)] active:scale-95 max-[680px]:px-2.5 max-[680px]:py-1.5 max-[680px]:text-[0.58rem]"
            >
              🌿 4 Ritual Paths
            </a>
          </div>
        </div>
      </section>

      {/* ── 2. Interactive Ritual Match Chamber ── */}
      <section
        id="finder"
        className="relative overflow-hidden bg-[#0c2419] bg-[radial-gradient(circle_at_15%_10%,rgba(183,212,90,0.18),transparent_40%),linear-gradient(160deg,#0e2a1e_0%,#071710_100%)] px-[clamp(24px,5vw,72px)] py-[clamp(75px,8vw,115px)] text-white max-[680px]:px-3 max-[680px]:py-7 scroll-mt-20"
        aria-labelledby="finder-title"
      >
        <div className="mx-auto grid max-w-[1440px] grid-cols-[0.8fr_1.2fr] items-center gap-[clamp(40px,6vw,90px)] max-[960px]:grid-cols-1 max-[960px]:gap-5">
          {/* Left Narrative */}
          <div>
            <p className="mb-2 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[#c8d88e] max-[680px]:mb-1 max-[680px]:text-[0.52rem]">
              Find your starting point
            </p>
            <h2
              id="finder-title"
              className="m-0 [font-family:var(--font-display)] text-[clamp(2.6rem,4.4vw,4.8rem)] font-normal leading-[0.95] tracking-[-0.045em] text-[#fbfaf6] max-[680px]:text-[clamp(1.6rem,7.5vw,2.15rem)]"
            >
              Begin with how your hair feels today.
            </h2>
            <p className="mt-3.5 mb-5 max-w-[480px] text-[0.92rem] leading-[1.7] text-white/75 max-[680px]:my-2 max-[680px]:text-[0.72rem] max-[680px]:leading-[1.4]">
              Two thoughtful questions to uncover your ideal single-botanical starting point. No synthetic diagnosis—just pure plant synergy.
            </p>

            {/* Desktop bullets - Hidden on mobile for clean compactness */}
            <div className="space-y-3 border-t border-white/12 pt-5 max-[960px]:hidden">
              <div className="flex items-start gap-3">
                <span className="grid size-6 place-items-center rounded-full bg-[#c8d88e] text-[0.65rem] font-bold text-[#0c2419]">
                  1
                </span>
                <div>
                  <h3 className="m-0 text-[0.82rem] font-bold text-white">
                    Zero Miracle Promises
                  </h3>
                  <p className="m-0 text-[0.72rem] text-white/65">
                    Unhurried botanical strength built over 4–6 consistent weekly rituals.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="grid size-6 place-items-center rounded-full bg-[#c8d88e] text-[0.65rem] font-bold text-[#0c2419]">
                  2
                </span>
                <div>
                  <h3 className="m-0 text-[0.82rem] font-bold text-white">
                    Single Origin Purity
                  </h3>
                  <p className="m-0 text-[0.72rem] text-white/65">
                    100% shade-dried herbs with zero silicones, perfumes, or synthetic fillers.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Interactive Finder Card */}
          <div className="w-full">
            <RitualFinder />
          </div>
        </div>
      </section>

      {/* ── 3. The 4-Step Preparation Alchemy ── */}
      <section
        id="preparation"
        className="mx-auto w-full max-w-[1440px] px-[clamp(24px,5vw,72px)] py-[clamp(75px,8vw,115px)] max-[680px]:px-3 max-[680px]:py-7 scroll-mt-20"
        aria-labelledby="prep-title"
      >
        <div className="mb-10 text-center max-[680px]:mb-4">
          <p className="mb-2 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[var(--botanical)] max-[680px]:mb-1 max-[680px]:text-[0.52rem]">
            The Foundational Rhythm
          </p>
          <h2
            id="prep-title"
            className="m-0 [font-family:var(--font-display)] text-[clamp(2.4rem,4.2vw,4.4rem)] font-normal leading-[0.96] tracking-[-0.045em] text-[var(--forest)] max-[680px]:text-[clamp(1.55rem,7vw,2.05rem)]"
          >
            Scoop slowly. Mix gradually. Apply with care.
          </h2>
          <p className="mx-auto mt-3 max-w-[560px] text-[0.88rem] leading-[1.6] text-[var(--muted)] max-[680px]:mt-1.5 max-[680px]:text-[0.68rem] max-[680px]:leading-[1.4]">
            Botanical powder care is a tactile, unhurried art. Follow these 4 foundational steps for a smooth, clumpless paste.
          </p>
        </div>

        {/* Desktop View: Photo Stage Left + Interactive Step List Right */}
        <div className="grid grid-cols-[0.85fr_1.15fr] items-center gap-[clamp(36px,5vw,70px)] max-[900px]:hidden">
          {/* Left Arched Photo Stage */}
          <div className="relative aspect-[0.88] w-full overflow-hidden rounded-3xl border border-[var(--line)] bg-[#e3eae1] shadow-[0_16px_40px_rgba(23,63,42,0.08)]">
            <Image
              src="/images/naturemist-process.png"
              alt="NatureMist Botanical Preparation Process"
              fill
              sizes="45vw"
              className="size-full object-cover object-center"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/10" />

            <div className="absolute right-4 bottom-4 left-4 flex items-center justify-between rounded-2xl border border-white/20 bg-white/80 p-3.5 backdrop-blur-md">
              <div>
                <span className="block text-[0.55rem] font-bold uppercase tracking-wider text-[var(--botanical)]">
                  Fresh Paste Alchemy
                </span>
                <span className="text-[0.82rem] font-bold text-[var(--forest)]">
                  Silky Yogurt Consistency
                </span>
              </div>
              <span className="grid size-9 place-items-center rounded-full bg-[var(--forest)] text-[0.9rem] text-white">
                ✨
              </span>
            </div>
          </div>

          {/* Right 4 Step Accordion */}
          <div className="flex flex-col gap-3">
            {PREPARATION_STEPS.map((step, idx) => {
              const isActive = activeStepIndex === idx;
              return (
                <article
                  key={step.number}
                  onClick={() => setActiveStepIndex(idx)}
                  className={`group cursor-pointer rounded-2xl border p-5 transition-all duration-300 ${
                    isActive
                      ? "border-[var(--botanical)] bg-[var(--paper)] shadow-[0_10px_28px_rgba(23,63,42,0.08)] -translate-y-0.5"
                      : "border-[var(--line)] bg-white/60 hover:bg-white hover:border-black/15"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <span
                      className={`grid size-10 shrink-0 place-items-center rounded-full text-[0.82rem] font-bold transition-colors duration-200 ${
                        isActive
                          ? "bg-[var(--forest)] text-[#c8d88e]"
                          : "bg-[var(--beige)] text-[var(--forest)]"
                      }`}
                    >
                      {step.number}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="m-0 [font-family:var(--font-display)] text-[1.22rem] font-normal text-[var(--forest)]">
                          {step.title}
                        </h3>
                        <span className="text-base">{step.icon}</span>
                      </div>

                      <p className="mt-1 mb-0 text-[0.78rem] leading-[1.55] text-[var(--muted)]">
                        {step.description}
                      </p>

                      {isActive && (
                        <div className="mt-3 flex items-center gap-2 rounded-xl bg-[#edf3ea] px-3 py-1.5 text-[0.68rem] font-medium text-[var(--forest)]">
                          <span className="text-[var(--botanical)] font-bold">💡 Pro Tip:</span>
                          <span>{step.tip}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* Mobile View: Swipeable Horizontal Step Cards (Compact, peeking next step) */}
        <div className="hidden max-[900px]:flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden px-1">
          {PREPARATION_STEPS.map((step) => (
            <article
              key={step.number}
              className="w-[78vw] max-w-[280px] shrink-0 snap-start rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-4 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="grid size-7 place-items-center rounded-full bg-[var(--forest)] text-[#c8d88e] text-[0.68rem] font-bold">
                    {step.number}
                  </span>
                  <span className="text-sm">{step.icon}</span>
                </div>
                <h3 className="my-1 [font-family:var(--font-display)] text-[1.08rem] font-normal text-[var(--forest)] leading-tight">
                  {step.title}
                </h3>
                <p className="m-0 text-[0.68rem] leading-[1.42] text-[var(--muted)] line-clamp-3">
                  {step.description}
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-[var(--line)] flex items-center gap-1.5 text-[0.58rem] text-[var(--forest)]">
                <span className="text-[var(--botanical)] font-bold">💡 Tip:</span>
                <span className="line-clamp-1">{step.tip}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── 4. The Botanical Mixing Matrix & Ratio Calculator ── */}
      <section
        id="matrix"
        className="relative overflow-hidden bg-[#f4f7f2] px-[clamp(24px,5vw,72px)] py-[clamp(75px,8vw,115px)] max-[680px]:px-3 max-[680px]:py-7 scroll-mt-20"
        aria-labelledby="matrix-title"
      >
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-10 text-center max-[680px]:mb-4">
            <p className="mb-2 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[var(--botanical)] max-[680px]:mb-1 max-[680px]:text-[0.52rem]">
              The Cabinet Matrix
            </p>
            <h2
              id="matrix-title"
              className="m-0 [font-family:var(--font-display)] text-[clamp(2.4rem,4.2vw,4.4rem)] font-normal leading-[0.96] tracking-[-0.045em] text-[var(--forest)] max-[680px]:text-[clamp(1.55rem,7vw,2.05rem)]"
            >
              Proven botanical ratios.
            </h2>
            <p className="mx-auto mt-3 max-w-[560px] text-[0.88rem] leading-[1.6] text-[var(--muted)] max-[680px]:mt-1.5 max-[680px]:text-[0.68rem] max-[680px]:leading-[1.4]">
              Traditional Ayurvedic synergies formulated for targeted hair goals.
            </p>
          </div>

          {/* Recipe Selector Tabs (Scrollable on mobile) */}
          <div className="mb-7 flex flex-wrap items-center justify-center gap-2 max-[680px]:mb-3.5 max-[680px]:flex-nowrap max-[680px]:overflow-x-auto max-[680px]:justify-start max-[680px]:gap-1.5 max-[680px]:pb-1 max-[680px]:[scrollbar-width:none] max-[680px]:[&::-webkit-scrollbar]:hidden">
            {MIXING_RECIPES.map((recipe) => {
              const isSelected = recipe.id === activeRecipe.id;
              return (
                <button
                  key={recipe.id}
                  type="button"
                  onClick={() => setActiveRecipeId(recipe.id)}
                  className={`shrink-0 rounded-full px-4 py-2 text-[0.72rem] font-bold transition-all duration-200 cursor-pointer active:scale-95 max-[680px]:px-3 max-[680px]:py-1.5 max-[680px]:text-[0.6rem] ${
                    isSelected
                      ? "bg-[var(--forest)] text-white shadow-sm"
                      : "border border-[var(--line)] bg-white text-[var(--forest)] hover:bg-[var(--beige)]"
                  }`}
                >
                  {recipe.name}
                </button>
              );
            })}
          </div>

          {/* Active Recipe Showcase Card (Compact & Optimized for Mobile) */}
          <div className="mx-auto max-w-[960px] overflow-hidden rounded-3xl border border-[var(--line)] bg-white p-7 shadow-[0_16px_44px_rgba(23,63,42,0.06)] max-[680px]:p-3.5 max-[680px]:rounded-2xl">
            <div className="grid grid-cols-[1fr_0.9fr] items-center gap-7 max-[800px]:grid-cols-1 max-[800px]:gap-4">
              {/* Left Details */}
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[#edf3ea] px-2.5 py-0.5 text-[0.58rem] font-bold uppercase tracking-wider text-[var(--botanical)]">
                    Ratio: {activeRecipe.ratio}
                  </span>
                  <span className="text-[0.62rem] text-[var(--muted)]">·</span>
                  <span className="text-[0.64rem] font-semibold text-[var(--forest)]">
                    {activeRecipe.time}
                  </span>
                </div>

                <h3 className="my-1.5 [font-family:var(--font-display)] text-[clamp(1.5rem,2.8vw,2.2rem)] font-normal leading-tight text-[var(--forest)] max-[680px]:text-[1.25rem]">
                  {activeRecipe.name}
                </h3>
                <p className="m-0 text-[0.8rem] leading-[1.55] text-[var(--muted)] max-[680px]:text-[0.68rem]">
                  {activeRecipe.instructions}
                </p>

                {/* Target & Frequency */}
                <div className="mt-4 grid grid-cols-2 gap-2.5 border-t border-[var(--line)] pt-3 max-[680px]:mt-2.5 max-[680px]:pt-2.5">
                  <div>
                    <span className="block text-[0.52rem] font-bold uppercase tracking-wider text-[var(--muted)]">
                      Target Hair State
                    </span>
                    <span className="text-[0.7rem] font-medium text-[var(--forest)] max-[680px]:text-[0.62rem]">
                      {activeRecipe.target}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[0.52rem] font-bold uppercase tracking-wider text-[var(--muted)]">
                      Rhythm
                    </span>
                    <span className="text-[0.7rem] font-medium text-[var(--forest)] max-[680px]:text-[0.62rem]">
                      {activeRecipe.frequency}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Ingredients Visual Stack */}
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-4 max-[680px]:p-3 max-[680px]:rounded-xl">
                <span className="mb-2 block text-[0.58rem] font-bold uppercase tracking-[0.14em] text-[var(--botanical)]">
                  Botanicals in this Blend
                </span>
                <div className="space-y-2">
                  {activeRecipe.ingredients.map((ing) => (
                    <div
                      key={ing.name}
                      className="flex items-center justify-between rounded-xl border border-black/5 bg-white p-2.5 shadow-2xs max-[680px]:p-2"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="size-2.5 rounded-full"
                          style={{ backgroundColor: ing.color }}
                        />
                        <span className="text-[0.78rem] font-semibold text-[var(--forest)] max-[680px]:text-[0.7rem]">
                          {ing.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="rounded bg-[var(--beige)] px-1.5 py-0.5 text-[0.58rem] font-bold text-[var(--forest)] max-[680px]:text-[0.52rem]">
                          {ing.parts}
                        </span>
                        <button
                          type="button"
                          onClick={() => addToCart(ing.slug)}
                          className="grid size-5.5 place-items-center rounded-full bg-[var(--forest)] text-[0.72rem] text-white hover:bg-[var(--forest-dark)] active:scale-90 cursor-pointer"
                          aria-label={`Add ${ing.name} to bag`}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Explore by Purpose — 4 Core Ritual Paths ── */}
      <section
        id="ritual-paths"
        className="mx-auto w-full max-w-[1440px] px-[clamp(24px,5vw,72px)] py-[clamp(75px,8vw,115px)] max-[680px]:px-3 max-[680px]:py-7 scroll-mt-20"
        aria-labelledby="paths-title"
      >
        <div className="mb-10 text-center max-[680px]:mb-4">
          <p className="mb-2 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[var(--botanical)] max-[680px]:mb-1 max-[680px]:text-[0.52rem]">
            Discover The Four Pillars
          </p>
          <h2
            id="paths-title"
            className="m-0 [font-family:var(--font-display)] text-[clamp(2.4rem,4.2vw,4.4rem)] font-normal leading-[0.96] tracking-[-0.045em] text-[var(--forest)] max-[680px]:text-[clamp(1.55rem,7vw,2.05rem)]"
          >
            Choose a path through the cabinet.
          </h2>
          <p className="mx-auto mt-3 max-w-[560px] text-[0.88rem] leading-[1.6] text-[var(--muted)] max-[680px]:mt-1.5 max-[680px]:text-[0.68rem] max-[680px]:leading-[1.4]">
            Every single botanical serves a dedicated purpose in your weekly rhythm.
          </p>
        </div>

        {/* Desktop 4-Col Grid / Mobile Peeking Snap Carousel */}
        <div className="grid grid-cols-4 gap-5 max-[1080px]:grid-cols-2 max-[680px]:flex max-[680px]:gap-3 max-[680px]:overflow-x-auto max-[680px]:snap-x max-[680px]:snap-mandatory max-[680px]:pb-2 max-[680px]:[scrollbar-width:none] max-[680px]:[&::-webkit-scrollbar]:hidden max-[680px]:px-1">
          {RITUAL_PATHS.map((path) => (
            <article
              key={path.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--paper)] p-6 shadow-[0_6px_20px_rgba(23,63,42,0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_36px_rgba(23,63,42,0.1)] max-[680px]:w-[78vw] max-[680px]:max-w-[280px] max-[680px]:shrink-0 max-[680px]:snap-start max-[680px]:p-4 max-[680px]:rounded-2xl"
            >
              <div>
                {/* Header Tag */}
                <div className="mb-2.5 flex items-center justify-between">
                  <span
                    className="rounded-full px-2.5 py-0.5 text-[0.54rem] font-bold uppercase tracking-wider text-white"
                    style={{ backgroundColor: path.accent }}
                  >
                    {path.herbs}
                  </span>
                  <span className="text-[0.56rem] font-medium text-[var(--muted)]">
                    {path.timing}
                  </span>
                </div>

                <h3 className="my-1 [font-family:var(--font-display)] text-[1.75rem] font-normal leading-tight text-[var(--forest)] transition-colors duration-200 group-hover:text-[var(--botanical)] max-[680px]:text-[1.3rem]">
                  {path.title}
                </h3>
                <p className="mb-2 text-[0.7rem] font-semibold text-[var(--botanical)] max-[680px]:text-[0.62rem]">
                  {path.tagline}
                </p>
                <p className="m-0 text-[0.76rem] leading-[1.55] text-[var(--muted)] max-[680px]:text-[0.66rem] max-[680px]:leading-[1.4] max-[680px]:line-clamp-2">
                  {path.description}
                </p>
              </div>

              <div className="mt-5 border-t border-[var(--line)] pt-3.5 max-[680px]:mt-3 max-[680px]:pt-2.5">
                <Link
                  href={`/shop?goal=${encodeURIComponent(path.goal)}`}
                  className="inline-flex w-full items-center justify-between rounded-xl bg-white px-3.5 py-2 text-[0.7rem] font-bold uppercase tracking-[0.08em] text-[var(--forest)] shadow-2xs transition-all duration-200 hover:bg-[var(--forest)] hover:text-white max-[680px]:text-[0.62rem]"
                >
                  <span>Explore {path.title}</span>
                  <span>↗</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── 6. Safety, Strand Test & Colour Mastery Guide ── */}
      <section
        id="safety"
        className="relative overflow-hidden bg-[#18233c] bg-[radial-gradient(circle_at_20%_20%,rgba(183,212,90,0.12),transparent_45%),linear-gradient(160deg,#1e2c4c_0%,#0f172a_100%)] px-[clamp(24px,5vw,72px)] py-[clamp(75px,8vw,110px)] text-white max-[680px]:px-3 max-[680px]:py-7 scroll-mt-20"
        aria-labelledby="safety-title"
      >
        <div className="mx-auto max-w-[1440px]">
          <div className="grid grid-cols-[0.9fr_1.1fr] items-center gap-[clamp(40px,6vw,80px)] max-[900px]:grid-cols-1 max-[900px]:gap-5">
            <div>
              <p className="mb-1.5 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[#c8d88e] max-[680px]:text-[0.52rem]">
                Care Before Colour
              </p>
              <h2
                id="safety-title"
                className="m-0 [font-family:var(--font-display)] text-[clamp(2.6rem,4.4vw,4.8rem)] font-normal leading-[0.95] tracking-[-0.045em] text-[#fbfaf6] max-[680px]:text-[clamp(1.6rem,7.5vw,2.15rem)]"
              >
                Patch test. Strand test. Read every direction.
              </h2>
              <p className="mt-3.5 max-w-[500px] text-[0.92rem] leading-[1.7] text-white/75 max-[680px]:my-2 max-[680px]:text-[0.72rem] max-[680px]:leading-[1.4]">
                100% natural herbs are potent plant actives. We practice responsible Ayurvedic care before every application.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3.5 max-[680px]:grid-cols-2 max-[680px]:gap-2">
              <div className="rounded-2xl border border-white/12 bg-white/5 p-4 backdrop-blur-md max-[680px]:p-2.5 max-[680px]:rounded-xl">
                <span className="text-lg max-[680px]:text-sm">🧪</span>
                <h3 className="my-1 [font-family:var(--font-display)] text-[1.05rem] font-normal text-white max-[680px]:text-[0.84rem]">
                  48h Patch Test
                </h3>
                <p className="m-0 text-[0.7rem] leading-[1.45] text-white/70 max-[680px]:text-[0.58rem] max-[680px]:line-clamp-2">
                  Dab mixed paste behind ear to ensure zero sensitivity.
                </p>
              </div>

              <div className="rounded-2xl border border-white/12 bg-white/5 p-4 backdrop-blur-md max-[680px]:p-2.5 max-[680px]:rounded-xl">
                <span className="text-lg max-[680px]:text-sm">✂️</span>
                <h3 className="my-1 [font-family:var(--font-display)] text-[1.05rem] font-normal text-white max-[680px]:text-[0.84rem]">
                  Strand Test
                </h3>
                <p className="m-0 text-[0.7rem] leading-[1.45] text-white/70 max-[680px]:text-[0.58rem] max-[680px]:line-clamp-2">
                  Test Indigo on shed hair to confirm desired depth.
                </p>
              </div>

              <div className="rounded-2xl border border-white/12 bg-white/5 p-4 backdrop-blur-md max-[680px]:p-2.5 max-[680px]:rounded-xl">
                <span className="text-lg max-[680px]:text-sm">🌿</span>
                <h3 className="my-1 [font-family:var(--font-display)] text-[1.05rem] font-normal text-white max-[680px]:text-[0.84rem]">
                  Grey & Bleach
                </h3>
                <p className="m-0 text-[0.7rem] leading-[1.45] text-white/70 max-[680px]:text-[0.58rem] max-[680px]:line-clamp-2">
                  Porous hair absorbs pigments fast; adjust timing.
                </p>
              </div>

              <div className="rounded-2xl border border-white/12 bg-white/5 p-4 backdrop-blur-md max-[680px]:p-2.5 max-[680px]:rounded-xl">
                <span className="text-lg max-[680px]:text-sm">🛡️</span>
                <h3 className="my-1 [font-family:var(--font-display)] text-[1.05rem] font-normal text-white max-[680px]:text-[0.84rem]">
                  Zero Synthetic Salts
                </h3>
                <p className="m-0 text-[0.7rem] leading-[1.45] text-white/70 max-[680px]:text-[0.58rem] max-[680px]:line-clamp-2">
                  Free of metallic salts, PPD, ammonia & binders.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. Frequently Asked Questions in the Ritual Room ── */}
      <section
        id="faq"
        className="relative overflow-hidden bg-[#0c2419] bg-[radial-gradient(circle_at_10%_0%,rgba(183,212,90,0.14),transparent_35%),linear-gradient(160deg,#0e2a1e_0%,#071710_100%)] px-[clamp(25px,6vw,96px)] py-[clamp(75px,8vw,110px)] text-white/80 before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(rgba(255,255,255,0.12)_0.5px,transparent_0.5px)] before:bg-size-[9px_9px] before:opacity-10 max-[680px]:px-3.5 max-[680px]:py-8 scroll-mt-20"
        aria-labelledby="ritual-faq-title"
      >
        <div className="mx-auto grid max-w-[1440px] grid-cols-[0.75fr_1.25fr] items-start gap-[clamp(48px,6vw,84px)] max-[900px]:grid-cols-1 max-[900px]:gap-6">
          <div>
            <p className="mb-2.5 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[#c8d88e] max-[680px]:mb-1 max-[680px]:text-[0.52rem]">
              Good questions, clearly answered
            </p>
            <h2
              className="m-0 font-serif text-[clamp(2.8rem,4.8vw,5.2rem)] font-normal leading-[0.94] tracking-[-0.045em] text-[#fbfaf6] max-[680px]:text-[clamp(1.65rem,7.5vw,2.15rem)]"
              id="ritual-faq-title"
            >
              Ritual guidance FAQ.
            </h2>
            <p className="mt-3.5 mb-5 max-w-[380px] text-[0.92rem] leading-[1.65] text-white/75 max-[680px]:my-2 max-[680px]:text-[0.72rem]">
              Begin with curiosity. Continue with care.
            </p>
            <Link
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-[0.7rem] font-bold tracking-[0.1em] uppercase text-[#fbfaf6] backdrop-blur-sm transition-all duration-200 hover:border-[#c8d88e] hover:bg-[#c8d88e] hover:text-[#0c2419] max-[680px]:px-3.5 max-[680px]:py-2 max-[680px]:text-[0.58rem]"
              href="/shop"
            >
              Explore Full Collection <span aria-hidden="true">↗</span>
            </Link>
          </div>

          <div className="border-t border-white/15">
            {RITUAL_FAQS.map((faq, index) => (
              <details
                className="group/faq border-b border-white/15 transition-colors duration-200"
                key={faq.question}
                open={index === 0}
              >
                <summary className="grid min-h-[68px] cursor-pointer list-none grid-cols-[28px_1fr_24px] items-center gap-3 text-[clamp(1.1rem,1.6vw,1.42rem)] font-normal text-[#fbfaf6] [font-family:var(--font-display)] transition-colors duration-200 hover:text-[#c8d88e] [&::-webkit-details-marker]:hidden max-[680px]:grid-cols-[22px_1fr_18px] max-[680px]:text-[0.96rem] max-[680px]:min-h-[50px] max-[680px]:gap-2">
                  <span className="font-sans text-[0.6rem] font-bold text-[#c8d88e] max-[680px]:text-[0.5rem]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{faq.question}</span>
                  <i className="font-sans text-[1rem] font-light not-italic text-[#c8d88e] transition-transform duration-300 group-open/faq:rotate-45 max-[680px]:text-[0.88rem]">
                    ＋
                  </i>
                </summary>
                <p className="m-0 max-w-[680px] pt-0 pr-5 pb-5 pl-10 text-[0.84rem] leading-[1.6] text-white/75 max-[680px]:pl-7 max-[680px]:pb-3.5 max-[680px]:text-[0.7rem]">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
