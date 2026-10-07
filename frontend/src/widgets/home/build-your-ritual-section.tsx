"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/domain/catalog/products";
import { formatCurrency } from "@/domain/catalog/products";
import { useStore } from "@/features/store/store-provider";

interface OptionItem {
  id: string;
  title: string;
  description: string;
}

const STEP_1_OPTIONS: OptionItem[] = [
  {
    id: "cleanse",
    title: "Cleanse",
    description: "Wash away buildup gently without stripping natural moisture.",
  },
  {
    id: "softness-shine",
    title: "Softness + Shine",
    description: "Restore silky slip, smooth cuticles, and reflective luster.",
  },
  {
    id: "scalp-ritual",
    title: "Scalp Ritual",
    description: "Nourish hair roots and soothe the scalp foundation.",
  },
  {
    id: "botanical-colour",
    title: "Botanical Colour",
    description: "Deepen natural hair tones with vibrant pure plant pigments.",
  },
];

const STEP_2_OPTIONS: OptionItem[] = [
  {
    id: "dry-brittle",
    title: "Dry & Brittle",
    description: "Needs deep moisture, slip, and cuticle conditioning.",
  },
  {
    id: "oily-scalp",
    title: "Oily Scalp / Normal Ends",
    description: "Needs purification at roots with balanced hydration.",
  },
  {
    id: "fine-limp",
    title: "Fine & Limp",
    description: "Craves lightweight lift, fullness, and strand vitality.",
  },
  {
    id: "coarse-dense",
    title: "Coarse & Dense",
    description: "Needs intensive softening, smoothing, and detangling slip.",
  },
];

interface Ripple {
  id: number;
  x: number;
  y: number;
}

interface BuildYourRitualSectionProps {
  products?: Product[];
}

export function BuildYourRitualSection({ products = [] }: BuildYourRitualSectionProps) {
  const { addToCart, track } = useStore();
  const panelRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const rippleCounterRef = useRef(0);

  // State
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedFocus, setSelectedFocus] = useState<string | null>(null);
  const [selectedFeel, setSelectedFeel] = useState<string | null>(null);
  const [ripples, setRipples] = useState<{ [cardId: string]: Ripple[] }>({});
  const [isVisible, setIsVisible] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [addedToast, setAddedToast] = useState(false);

  // Observer for entrance
  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: "0px 0px -10% 0px",
        threshold: 0.12,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Cursor Spotlight across the panel
  useEffect(() => {
    const panel = panelRef.current;
    const spotlight = spotlightRef.current;
    if (!panel || !spotlight) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = panel.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      spotlight.style.background = `radial-gradient(380px circle at ${x}px ${y}px, rgba(197, 214, 120, 0.16), transparent 70%)`;
      spotlight.style.opacity = "1";
    };

    const handleMouseLeave = () => {
      spotlight.style.opacity = "0";
    };

    panel.addEventListener("mousemove", handleMouseMove, { passive: true });
    panel.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      panel.removeEventListener("mousemove", handleMouseMove);
      panel.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  // 3D Card Tilt on option cards
  const handleCardMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    const rotateX = -y * 12; // clamp ~ ±6°
    const rotateY = x * 16;  // clamp ~ ±8°

    card.style.transform = `perspective(600px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-2px)`;
  };

  const handleCardMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    const card = e.currentTarget;
    card.style.transform = "perspective(600px) rotateX(0deg) rotateY(0deg) translateY(0px)";
  };

  // Ink ripple on click
  const triggerRipple = (e: React.MouseEvent<HTMLButtonElement>, cardId: string) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    rippleCounterRef.current += 1;
    const newRipple: Ripple = { id: rippleCounterRef.current, x, y };
    setRipples((prev) => ({
      ...prev,
      [cardId]: [...(prev[cardId] || []), newRipple],
    }));

    setTimeout(() => {
      setRipples((prev) => ({
        ...prev,
        [cardId]: (prev[cardId] || []).filter((r) => r.id !== newRipple.id),
      }));
    }, 900);
  };

  // Step change with animation
  const goToStep = (nextStep: 1 | 2 | 3) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setStep(nextStep);
      setIsTransitioning(false);
    }, 280);
  };

  const handleStartOver = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedFocus(null);
      setSelectedFeel(null);
      setStep(1);
      setIsTransitioning(false);
    }, 280);
  };

  // Recommendation calculation
  const recommendation = React.useMemo(() => {
    let matchedSlug = "amla-powder";
    let title = "Amla Botanical Powder";
    let ritualStep = "Strengthen & Fortify";
    let image = "/images/amla-powder.jpg";
    let price = 69900;
    let description =
      "Pure, single-origin shade-dried amla berries ground into an ultra-fine, bioactive restorative paste that revitalizes hair roots.";

    if (selectedFocus === "cleanse") {
      matchedSlug = "reetha-powder";
      title = "Reetha Botanical Cleanser";
      ritualStep = "Cleanse & Clarify";
      image = "/images/reetha-powder.jpg";
      price = 59900;
      description =
        "Naturally rich in gentle plant saponins to lift away impurities while preserving the delicate protective lipid layer.";
    } else if (selectedFocus === "softness-shine") {
      matchedSlug = "shikakai-powder";
      title = "Shikakai Smooth & Shine";
      ritualStep = "Detangle & Seal";
      image = "/images/shikakai-powder.jpg";
      price = 64900;
      description =
        "Infuses essential polyphenols and natural slip to smooth ruffled cuticles and deliver a mirror-like shine.";
    } else if (selectedFocus === "botanical-colour") {
      matchedSlug = "bhringraj-powder";
      title = "Bhringraj Botanical Tone";
      ritualStep = "Deepen Tone & Vitality";
      image = "/images/bhringraj-powder.jpg";
      price = 74900;
      description =
        "The celebrated 'King of Hair' herb that enhances rich natural depth without synthetic oxidants or ammonia.";
    }

    // Cross-match with store products if available
    let compareAtPrice: number | null = null;
    const storeProduct = products.find((p) => p.slug === matchedSlug);
    if (storeProduct) {
      title = storeProduct.name;
      if (storeProduct.featuredImage?.url) image = storeProduct.featuredImage.url;
      if (storeProduct.pricePaise) price = storeProduct.pricePaise;
      compareAtPrice = storeProduct.compareAtPricePaise ?? null;
      if (storeProduct.shortDescription) description = storeProduct.shortDescription;
      if (storeProduct.ritualStep) ritualStep = storeProduct.ritualStep;
    }
    if (!compareAtPrice || compareAtPrice <= price) {
      compareAtPrice = Math.round((price * 1.25) / 1000) * 1000 - 100;
    }

    return { slug: matchedSlug, title, ritualStep, image, price, compareAtPrice, description };
  }, [selectedFocus, products]);

  const handleAddToCart = () => {
    addToCart(recommendation.slug);
    track("quiz_add_to_bag", { product: recommendation.slug });
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  const currentFocusObj = STEP_1_OPTIONS.find((o) => o.id === selectedFocus);
  const currentFeelObj = STEP_2_OPTIONS.find((o) => o.id === selectedFeel);

  return (
    <section
      id="build-your-ritual"
      aria-labelledby="builder-title"
      className="w-full px-4 sm:px-6 md:px-[72px] py-[clamp(48px,6vw,84px)]"
    >
      {/* ── Outer 1200px Panel Container ── */}
      <div
        ref={panelRef}
        data-quiz-visible={isVisible ? "true" : "false"}
        className="relative mx-auto w-full max-w-[1200px] overflow-hidden rounded-[28px] border border-[#2a4d33]/50 p-6 sm:p-10 md:p-[64px] lg:p-[72px] shadow-[0_32px_80px_rgba(8,18,12,0.45)]"
        style={{
          background: "radial-gradient(ellipse at 15% 15%, #26452F 0%, #14291E 55%, #0C1B13 100%)",
          fontFamily: "var(--font-manrope, Manrope, sans-serif)",
        }}
      >
        {/* ── Interactive 380px Cursor Spotlight Glow ── */}
        <div
          ref={spotlightRef}
          className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-500 ease-out"
          aria-hidden="true"
        />

        {/* ── Ambient Drifting Accent Rings ── */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
          {/* Ring 1 */}
          <div className="animate-ambient-1 absolute -left-16 -top-16 size-[280px] rounded-full border border-[#C5D678]/12" />
          {/* Ring 2 */}
          <div className="animate-ambient-2 absolute right-[-40px] top-[20%] size-[420px] rounded-full border border-[#C5D678]/[0.08]" />
          {/* Disc 3 */}
          <div className="animate-ambient-3 absolute bottom-[-50px] left-[35%] size-[240px] rounded-full bg-[radial-gradient(circle,rgba(197,214,120,0.07),transparent_70%)]" />
        </div>

        {/* ── Fractal Noise SVG Grain Overlay (30% Opacity, Overlay Blend) ── */}
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-30 mix-blend-overlay"
          aria-hidden="true"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.5'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
          }}
        />

        {/* ── Two-Column Grid ── */}
        <div className="relative z-10 grid grid-cols-1 items-center gap-10 lg:grid-cols-[1fr_520px] lg:gap-14">
          {/* ── Left Column: Intro Copy & Stats ── */}
          <div className="flex flex-col items-start">
            {/* Eyebrow: Pulsing 8px accent dot + BUILD YOUR RITUAL */}
            <div
              className="quiz-entrance-item flex items-center gap-2.5"
              style={{ transitionDelay: "0ms" }}
            >
              <span className="size-2 rounded-full bg-[#C5D678] animate-pulse" aria-hidden="true" />
              <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#C5D678]">
                BUILD YOUR RITUAL
              </span>
            </div>

            {/* Headline 58px: A botanical starting / point, chosen with care. */}
            <h2
              id="builder-title"
              className="m-0 mt-5 text-[clamp(2.4rem,4.6vw,3.625rem)] font-normal leading-[1.0] tracking-[-0.035em] text-[#F7F3EA]"
              style={{
                fontFamily: "var(--font-cormorant, 'Cormorant Garamond', 'Instrument Serif', Georgia, serif)",
              }}
            >
              <span
                className="quiz-entrance-item block"
                style={{ transitionDelay: "120ms" }}
              >
                A botanical starting
              </span>
              <span
                className="quiz-entrance-item block italic text-[#C5D678]"
                style={{ transitionDelay: "240ms" }}
              >
                point, chosen with care.
              </span>
            </h2>

            {/* Body 16px muted */}
            <p
              className="quiz-entrance-item mt-4 mb-8 max-w-[460px] text-[1rem] leading-[1.68] text-[rgba(242,238,228,0.72)]"
              style={{ transitionDelay: "360ms" }}
            >
              Tell us your ritual goal and how your hair feels today. We&apos;ll suggest a simple place to begin—never a diagnosis or a promise.
            </p>

            {/* Two small stats divided by a hairline */}
            <div
              className="quiz-entrance-item flex items-center gap-6 border-t border-white/10 pt-6"
              style={{ transitionDelay: "480ms" }}
            >
              {/* Stat 1: 2 QUESTIONS */}
              <div className="flex flex-col">
                <span
                  className="text-[2rem] font-normal leading-none text-[#F7F3EA]"
                  style={{
                    fontFamily: "var(--font-cormorant, 'Cormorant Garamond', Georgia, serif)",
                  }}
                >
                  2
                </span>
                <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[rgba(242,238,228,0.6)]">
                  QUESTIONS
                </span>
              </div>

              {/* Hairline vertical divider */}
              <div className="h-9 w-[1px] bg-[#C5D678]/25" aria-hidden="true" />

              {/* Stat 2: 30s TO FINISH */}
              <div className="flex flex-col">
                <span
                  className="text-[2rem] font-normal leading-none text-[#F7F3EA]"
                  style={{
                    fontFamily: "var(--font-cormorant, 'Cormorant Garamond', Georgia, serif)",
                  }}
                >
                  30s
                </span>
                <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[rgba(242,238,228,0.6)]">
                  TO FINISH
                </span>
              </div>
            </div>
          </div>

          {/* ── Right Column: 520px Glass Quiz Card ── */}
          <div
            className="quiz-entrance-item w-full max-w-[520px] rounded-[22px] border border-[rgba(197,214,120,0.16)] bg-[rgba(10,22,15,0.72)] p-6 sm:p-7 md:p-8 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.7)] backdrop-blur-[14px]"
            style={{ transitionDelay: "600ms" }}
          >
            {/* ── Card Header ── */}
            <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
              <span className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-[rgba(242,238,228,0.75)]">
                {step === 1 && "STEP 01 / 02 · Ritual Goal"}
                {step === 2 && "STEP 02 / 02 · Hair Feel"}
                {step === 3 && "RECOMMENDATION · A simple place to begin"}
              </span>

              {/* Progress Pills (30x4px, animated accent fill over 0.7s) */}
              <div className="flex items-center gap-2" aria-hidden="true">
                <div className="h-[4px] w-[30px] overflow-hidden rounded-full bg-white/15">
                  <div
                    className="h-full bg-[#C5D678] transition-[width] duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
                    style={{ width: step >= 1 ? "100%" : "0%" }}
                  />
                </div>
                <div className="h-[4px] w-[30px] overflow-hidden rounded-full bg-white/15">
                  <div
                    className="h-full bg-[#C5D678] transition-[width] duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
                    style={{ width: step >= 2 ? "100%" : "0%" }}
                  />
                </div>
              </div>
            </div>

            {/* ── Step Container with Transition Animation ── */}
            <div
              className={`transition-all duration-300 ease-out ${
                isTransitioning ? "translate-y-3 opacity-0" : "translate-y-0 opacity-100"
              }`}
            >
              {/* ── STEP 1: Primary Ritual Focus ── */}
              {step === 1 && (
                <div>
                  <h3 className="m-0 mb-4 text-[1.125rem] font-semibold text-[#F7F3EA]">
                    What is your primary ritual focus today?
                  </h3>

                  {/* 2x2 Grid of Option Cards */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {STEP_1_OPTIONS.map((opt, i) => {
                      const isSelected = selectedFocus === opt.id;
                      const cardRipples = ripples[opt.id] || [];

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={(e) => {
                            triggerRipple(e, opt.id);
                            setSelectedFocus(opt.id);
                          }}
                          onMouseMove={handleCardMouseMove}
                          onMouseLeave={handleCardMouseLeave}
                          style={{
                            transition: "transform 0.15s ease-out, border-color 0.25s, background-color 0.25s, box-shadow 0.25s",
                            animationDelay: `${i * 70}ms`,
                          }}
                          className={`group relative overflow-hidden rounded-[14px] border p-3.5 text-left select-none ${
                            isSelected
                              ? "border-[#C5D678] bg-[#C5D678]/[0.12] shadow-[0_0_22px_rgba(197,214,120,0.22)]"
                              : "border-white/12 bg-white/[0.035] hover:border-white/25 hover:bg-white/[0.06]"
                          }`}
                        >
                          {/* Ink ripples */}
                          {cardRipples.map((r) => (
                            <span
                              key={r.id}
                              className="animate-ink-ripple pointer-events-none absolute size-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(197,214,120,0.45)_0%,transparent_70%)]"
                              style={{ left: `${r.x}px`, top: `${r.y}px` }}
                              aria-hidden="true"
                            />
                          ))}

                          <div className="relative z-10 flex items-start gap-3">
                            {/* Custom Radio Circle with Overshoot Spring */}
                            <span
                              className={`mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-full border transition-colors duration-200 ${
                                isSelected
                                  ? "border-[#C5D678] bg-[#C5D678]/20"
                                  : "border-white/30 bg-transparent"
                              }`}
                              aria-hidden="true"
                            >
                              <span
                                className={`size-2 rounded-full bg-[#C5D678] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                                  isSelected ? "scale-100 opacity-100" : "scale-0 opacity-0"
                                }`}
                              />
                            </span>

                            <div className="min-w-0 flex-1">
                              <p className="m-0 text-[0.9375rem] font-semibold text-[#F7F3EA] group-hover:text-[#C5D678] transition-colors">
                                {opt.title}
                              </p>
                              <p className="mt-1 m-0 text-[0.78rem] leading-[1.45] text-[rgba(242,238,228,0.65)]">
                                {opt.description}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Footer */}
                  <div className="mt-6 flex items-center justify-end">
                    <button
                      type="button"
                      disabled={!selectedFocus}
                      onClick={() => goToStep(2)}
                      className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-full bg-[#C5D678] px-7 py-2.5 text-[0.78rem] font-bold uppercase tracking-[0.1em] text-[#0C1B13] shadow-[0_4px_16px_rgba(197,214,120,0.2)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#d4e48b] hover:shadow-[0_8px_24px_rgba(197,214,120,0.35)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                    >
                      <span>CONTINUE</span>
                      <span aria-hidden="true">→</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ── STEP 2: Hair Feel ── */}
              {step === 2 && (
                <div>
                  <h3 className="m-0 mb-4 text-[1.125rem] font-semibold text-[#F7F3EA]">
                    How does your hair feel today?
                  </h3>

                  {/* 2x2 Grid of Option Cards */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {STEP_2_OPTIONS.map((opt, i) => {
                      const isSelected = selectedFeel === opt.id;
                      const cardRipples = ripples[opt.id] || [];

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={(e) => {
                            triggerRipple(e, opt.id);
                            setSelectedFeel(opt.id);
                          }}
                          onMouseMove={handleCardMouseMove}
                          onMouseLeave={handleCardMouseLeave}
                          style={{
                            transition: "transform 0.15s ease-out, border-color 0.25s, background-color 0.25s, box-shadow 0.25s",
                            animationDelay: `${i * 70}ms`,
                          }}
                          className={`group relative overflow-hidden rounded-[14px] border p-3.5 text-left select-none ${
                            isSelected
                              ? "border-[#C5D678] bg-[#C5D678]/[0.12] shadow-[0_0_22px_rgba(197,214,120,0.22)]"
                              : "border-white/12 bg-white/[0.035] hover:border-white/25 hover:bg-white/[0.06]"
                          }`}
                        >
                          {/* Ink ripples */}
                          {cardRipples.map((r) => (
                            <span
                              key={r.id}
                              className="animate-ink-ripple pointer-events-none absolute size-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(197,214,120,0.45)_0%,transparent_70%)]"
                              style={{ left: `${r.x}px`, top: `${r.y}px` }}
                              aria-hidden="true"
                            />
                          ))}

                          <div className="relative z-10 flex items-start gap-3">
                            {/* Custom Radio Circle */}
                            <span
                              className={`mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-full border transition-colors duration-200 ${
                                isSelected
                                  ? "border-[#C5D678] bg-[#C5D678]/20"
                                  : "border-white/30 bg-transparent"
                              }`}
                              aria-hidden="true"
                            >
                              <span
                                className={`size-2 rounded-full bg-[#C5D678] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                                  isSelected ? "scale-100 opacity-100" : "scale-0 opacity-0"
                                }`}
                              />
                            </span>

                            <div className="min-w-0 flex-1">
                              <p className="m-0 text-[0.9375rem] font-semibold text-[#F7F3EA] group-hover:text-[#C5D678] transition-colors">
                                {opt.title}
                              </p>
                              <p className="mt-1 m-0 text-[0.78rem] leading-[1.45] text-[rgba(242,238,228,0.65)]">
                                {opt.description}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Footer */}
                  <div className="mt-6 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => goToStep(1)}
                      className="text-[0.78rem] font-bold uppercase tracking-[0.14em] text-[rgba(242,238,228,0.7)] transition-colors hover:text-[#C5D678]"
                    >
                      ← BACK
                    </button>

                    <button
                      type="button"
                      disabled={!selectedFeel}
                      onClick={() => goToStep(3)}
                      className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-full bg-[#C5D678] px-7 py-2.5 text-[0.78rem] font-bold uppercase tracking-[0.1em] text-[#0C1B13] shadow-[0_4px_16px_rgba(197,214,120,0.2)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#d4e48b] hover:shadow-[0_8px_24px_rgba(197,214,120,0.35)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                    >
                      <span>REVEAL</span>
                      <span aria-hidden="true">→</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ── STEP 3: Result Match ── */}
              {step === 3 && (
                <div aria-live="polite">
                  <div className="mb-2">
                    <span className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[#C5D678]">
                      A SIMPLE PLACE TO BEGIN
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pt-2">
                    {/* 150x170 Product Image */}
                    <div className="relative size-[150px] h-[170px] shrink-0 overflow-hidden rounded-xl border border-white/15 bg-white/5 shadow-[0_16px_36px_rgba(0,0,0,0.4)]">
                      <Image
                        src={recommendation.image}
                        alt={recommendation.title}
                        fill
                        sizes="160px"
                        priority
                        className="size-full object-cover object-center"
                      />
                    </div>

                    {/* Content Details */}
                    <div className="flex min-w-0 flex-1 flex-col items-center sm:items-start text-center sm:text-left">
                      <div className="flex flex-wrap items-baseline gap-2">
                        <span className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[#C5D678]">
                          {recommendation.ritualStep}
                        </span>
                        <span className="text-white/30">·</span>
                        <span className="text-[0.85rem] font-bold text-[#F7F3EA]">
                          {formatCurrency(recommendation.price, "INR")}
                        </span>
                        {recommendation.compareAtPrice && recommendation.compareAtPrice > recommendation.price && (
                          <>
                            <span className="text-[0.74rem] text-white/50 line-through">
                              {formatCurrency(recommendation.compareAtPrice, "INR")}
                            </span>
                            <span className="rounded bg-[#C5D678]/20 px-1.5 py-0.5 text-[0.65rem] font-bold text-[#C5D678]">
                              {Math.round(((recommendation.compareAtPrice - recommendation.price) / recommendation.compareAtPrice) * 100)}% OFF
                            </span>
                          </>
                        )}
                      </div>

                      {/* 34px Serif Result Title */}
                      <h3
                        className="my-1.5 text-[clamp(1.5rem,2.4vw,2.125rem)] font-normal leading-[1.05] tracking-[-0.03em] text-[#F7F3EA]"
                        style={{
                          fontFamily: "var(--font-cormorant, 'Cormorant Garamond', Georgia, serif)",
                        }}
                      >
                        {recommendation.title}
                      </h3>

                      <p className="m-0 line-clamp-3 text-[0.82rem] leading-[1.55] text-[rgba(242,238,228,0.75)]">
                        {recommendation.description}
                      </p>

                      {/* Two Outlined Accent Tags */}
                      <div className="mt-3.5 flex flex-wrap items-center gap-2">
                        {currentFocusObj && (
                          <span className="rounded-full border border-[#C5D678]/40 bg-[#C5D678]/10 px-3 py-1 text-[0.72rem] font-semibold text-[#C5D678]">
                            {currentFocusObj.title}
                          </span>
                        )}
                        {currentFeelObj && (
                          <span className="rounded-full border border-[#C5D678]/40 bg-[#C5D678]/10 px-3 py-1 text-[0.72rem] font-semibold text-[#C5D678]">
                            {currentFeelObj.title}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Start Over */}
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                    <button
                      type="button"
                      onClick={handleStartOver}
                      className="text-[0.74rem] font-bold uppercase tracking-[0.14em] text-[rgba(242,238,228,0.65)] transition-colors hover:text-[#C5D678]"
                    >
                      ↺ START OVER
                    </button>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleAddToCart}
                        className="inline-flex min-h-[42px] items-center justify-center rounded-full bg-[#C5D678] px-5 py-2 text-[0.74rem] font-bold uppercase tracking-[0.1em] text-[#0C1B13] shadow-[0_4px_16px_rgba(197,214,120,0.2)] transition-all hover:bg-[#d4e48b] hover:-translate-y-0.5 active:scale-95"
                      >
                        {addedToast ? "ADDED TO BAG ✓" : "ADD TO BAG +"}
                      </button>

                      <Link
                        href={`/shop/${recommendation.slug}`}
                        className="inline-flex min-h-[42px] items-center justify-center rounded-full border border-white/25 px-5 py-2 text-[0.74rem] font-bold uppercase tracking-[0.1em] text-[#F7F3EA] transition-all hover:border-[#C5D678] hover:text-[#C5D678]"
                      >
                        VIEW RITUAL →
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
