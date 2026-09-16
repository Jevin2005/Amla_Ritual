"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/domain/catalog/products";

interface BenefitItem {
  id: string;
  num: string;
  title: string;
  description: string;
  image: string;
  alt: string;
}

const BENEFIT_ITEMS: BenefitItem[] = [
  {
    id: "follicle-vitality",
    num: "01",
    title: "Follicle Vitality",
    description: "Delivers plant polyphenols and antioxidants to strengthen hair roots.",
    image: "/images/amla-powder.jpg",
    alt: "Pure Amla botanical powder for follicle vitality and root strength",
  },
  {
    id: "natural-slip",
    num: "02",
    title: "Natural Slip & Cuticle Seal",
    description: "Gently detangles while imparting a reflective, silky sheen.",
    image: "/images/reetha-powder.jpg",
    alt: "Reetha powder for natural slip, detangling, and cuticle sealing sheen",
  },
  {
    id: "sebum-balance",
    num: "03",
    title: "Sebum Balance",
    description: "Purifies the scalp without stripping its essential natural moisture barrier.",
    image: "/images/shikakai-powder.jpg",
    alt: "Shikakai powder balancing scalp sebum while protecting the moisture barrier",
  },
  {
    id: "pure-pigment",
    num: "04",
    title: "Pure Pigment Depth",
    description: "Enhances rich natural hair tones with zero synthetic dyes or ammonia.",
    image: "/images/bhringraj-powder.jpg",
    alt: "Bhringraj herbal powder enhancing rich natural hair tones without dyes",
  },
];

interface ProductBenefitsSectionProps {
  products?: Product[];
}

export function ProductBenefitsSection({ products }: ProductBenefitsSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const magneticBtnRef = useRef<HTMLAnchorElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Map any storefront product images if available, otherwise use default herbal photos
  const benefitRows: BenefitItem[] = BENEFIT_ITEMS.map((item, idx) => {
    const storeProduct = products?.[idx];
    const storeImg = storeProduct?.featuredImage?.url;
    return {
      ...item,
      image: storeImg || item.image,
    };
  });

  // Entrance observer using IntersectionObserver
  useEffect(() => {
    const el = sectionRef.current;
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
        threshold: 0.15,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Magnetic button logic
  useEffect(() => {
    const btn = magneticBtnRef.current;
    if (!btn) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = btn.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const offsetX = e.clientX - centerX;
      const offsetY = e.clientY - centerY;

      // Translate 25% of x offset, 35% of y offset from center
      const moveX = offsetX * 0.25;
      const moveY = offsetY * 0.35;

      btn.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
    };

    const handleMouseLeave = () => {
      btn.style.transform = "translate3d(0px, 0px, 0)";
    };

    btn.addEventListener("mousemove", handleMouseMove);
    btn.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      btn.removeEventListener("mousemove", handleMouseMove);
      btn.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  // High-performance cursor-following floating image with rAF lerp & velocity tilt
  useEffect(() => {
    const container = sectionRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const rows = container.querySelectorAll<HTMLElement>("[data-benefit-row]");

    const cleanupFns: Array<() => void> = [];

    rows.forEach((row) => {
      const imgCard = row.querySelector<HTMLElement>("[data-floating-image]");
      if (!imgCard) return;

      let rafId: number | null = null;
      let isHovered = false;
      let targetX = 0;
      let targetY = 0;
      let currentX = 0;
      let currentY = 0;
      let targetTilt = 0;
      let currentTilt = 0;
      let lastMouseX = 0;
      let lastTime = 0;

      const renderFrame = () => {
        if (!isHovered && Math.abs(currentX - targetX) < 0.1 && Math.abs(currentY - targetY) < 0.1 && Math.abs(currentTilt) < 0.1) {
          rafId = null;
          return;
        }

        // Smooth spring-like lerp (0.16 for ~0.6s trailing ease)
        currentX += (targetX - currentX) * 0.16;
        currentY += (targetY - currentY) * 0.16;
        currentTilt += (targetTilt - currentTilt) * 0.12;
        // Natural tilt leveling when cursor decelerates
        targetTilt *= 0.88;

        const scale = isHovered ? 1 : 0.92;
        imgCard.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%) rotate(${currentTilt.toFixed(2)}deg) scale(${scale})`;

        rafId = requestAnimationFrame(renderFrame);
      };

      const handleMouseEnter = (e: MouseEvent) => {
        const rect = row.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        isHovered = true;
        // Directly spawn at cursor coordinates to eliminate any jump or flying from center
        targetX = x;
        targetY = y;
        currentX = x;
        currentY = y;
        targetTilt = 0;
        currentTilt = 0;
        lastMouseX = e.clientX;
        lastTime = performance.now();

        imgCard.style.opacity = "1";
        imgCard.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) rotate(0deg) scale(0.92)`;

        if (!rafId) {
          rafId = requestAnimationFrame(renderFrame);
        }
      };

      const handleMouseMove = (e: MouseEvent) => {
        const rect = row.getBoundingClientRect();
        targetX = e.clientX - rect.left;
        targetY = e.clientY - rect.top;

        const now = performance.now();
        const dt = Math.max(1, now - lastTime);
        const dx = e.clientX - lastMouseX;

        if (!prefersReducedMotion) {
          // Horizontal velocity = dx / dt, clamp tilt to ±14°
          const velocity = (dx / dt) * 18;
          targetTilt = Math.max(-14, Math.min(14, velocity));
        } else {
          targetTilt = 0;
        }

        lastMouseX = e.clientX;
        lastTime = now;

        if (!rafId) {
          rafId = requestAnimationFrame(renderFrame);
        }
      };

      const handleMouseLeave = () => {
        isHovered = false;
        targetTilt = 0;
        imgCard.style.opacity = "0";

        if (!rafId) {
          rafId = requestAnimationFrame(renderFrame);
        }
      };

      row.addEventListener("mouseenter", handleMouseEnter, { passive: true });
      row.addEventListener("mousemove", handleMouseMove, { passive: true });
      row.addEventListener("mouseleave", handleMouseLeave, { passive: true });

      cleanupFns.push(() => {
        if (rafId) cancelAnimationFrame(rafId);
        row.removeEventListener("mouseenter", handleMouseEnter);
        row.removeEventListener("mousemove", handleMouseMove);
        row.removeEventListener("mouseleave", handleMouseLeave);
      });
    });

    return () => {
      cleanupFns.forEach((fn) => fn());
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="product-benefits"
      aria-labelledby="product-benefits-heading"
      data-benefit-visible={isVisible ? "true" : "false"}
      className="relative w-full overflow-hidden bg-[#FAF7F2] text-[#1F3B2A] py-[clamp(72px,8vw,120px)] selection:bg-[#4E8A2E] selection:text-[#FAF7F2]"
      style={{
        fontFamily: "var(--font-manrope, Manrope, sans-serif)",
      }}
    >
      {/* ── Soft Radial Accent Glow Top-Right ── */}
      <div
        className="pointer-events-none absolute -top-24 right-0 size-[550px] rounded-full bg-[radial-gradient(circle_at_75%_25%,rgba(78,138,46,0.14),transparent_65%)] blur-2xl"
        aria-hidden="true"
      />

      {/* ── Subtle SVG Fractal-Noise Grain Overlay (Opacity 0.35, Multiply) ── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] mix-blend-multiply"
        aria-hidden="true"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.55'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
      />

      {/* ── Background Preload for Fresh Page Load Performance ── */}
      <div className="pointer-events-none absolute -left-[9999px] top-0 size-px overflow-hidden opacity-0" aria-hidden="true">
        {benefitRows.map((b) => (
          <Image
            key={`preload-${b.id}`}
            src={b.image}
            alt=""
            width={230}
            height={280}
            priority
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1200px] px-6 sm:px-12 md:px-[72px]">
        {/* ── Header Row ── */}
        <div className="grid grid-cols-1 items-start justify-between gap-10 md:grid-cols-[1fr_380px] md:gap-14">
          {/* Left Column: Eyebrow + 72px Headline */}
          <div className="flex flex-col items-start">
            {/* Eyebrow with 28px hairline before it */}
            <div
              className="benefit-entrance-item flex items-center gap-3"
              style={{ transitionDelay: "0ms" }}
            >
              <span
                className="inline-block h-[1px] w-[28px] bg-[#DDD6C8]"
                aria-hidden="true"
              />
              <span className="text-[0.72rem] font-bold uppercase tracking-[0.22em] text-[#4E8A2E]">
                BOTANICAL EFFICACY
              </span>
            </div>

            {/* Headline: 72px serif headline with line 2 in italic accent color */}
            <h2
              id="product-benefits-heading"
              className="m-0 mt-5 font-normal tracking-[-0.04em] text-[#1F3B2A] text-[clamp(2.5rem,5.4vw,4.5rem)] leading-[0.98]"
              style={{
                fontFamily: "var(--font-instrument, 'Instrument Serif', Georgia, serif)",
              }}
            >
              <span
                className="benefit-entrance-item block"
                style={{ transitionDelay: "100ms" }}
              >
                The benefit of
              </span>
              <span
                className="benefit-entrance-item block italic text-[#4E8A2E]"
                style={{ transitionDelay: "200ms" }}
              >
                this product.
              </span>
            </h2>
          </div>

          {/* Right Column: Paragraph + Pill Button + Rotating Seal */}
          <div
            className="benefit-entrance-item flex w-full max-w-[380px] flex-col justify-between gap-7 md:pt-4"
            style={{ transitionDelay: "300ms" }}
          >
            <p className="m-0 text-[0.94rem] leading-[1.68] text-[#5E6B5A]">
              Proven botanical hair benefits formulated with pure, single-origin shade-dried herbs.
            </p>

            <div className="flex items-center gap-6">
              {/* Magnetic Pill Button */}
              <Link
                ref={magneticBtnRef}
                href="/shop"
                className="group relative inline-flex items-center gap-3.5 rounded-full bg-[#1F3B2A] px-7 py-3.5 text-[0.76rem] font-bold uppercase tracking-[0.14em] text-[#FAF7F2] shadow-[0_4px_16px_rgba(31,59,42,0.18)] transition-all duration-300 hover:bg-[#4E8A2E] hover:shadow-[0_8px_24px_rgba(78,138,46,0.32)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#4E8A2E]"
                style={{
                  willChange: "transform",
                  transition: "transform 0.22s cubic-bezier(0.2, 0.8, 0.2, 1), background-color 0.3s ease, box-shadow 0.3s ease",
                }}
              >
                <span>EXPLORE US</span>
                {/* Circular arrow chip */}
                <span
                  className="flex size-[22px] items-center justify-center rounded-full bg-white/15 text-[0.75rem] leading-none text-[#FAF7F2] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:bg-white/25"
                  aria-hidden="true"
                >
                  ↗
                </span>
              </Link>

              {/* 56px Rotating Circular Seal reading "100%" */}
              <div
                className="relative flex size-[56px] shrink-0 items-center justify-center select-none"
                title="100% Botanical Single-Origin Shade-Dried Herbs"
                aria-label="100% Botanical Seal"
              >
                {/* Rotating SVG Outer Text Path */}
                <svg
                  viewBox="0 0 100 100"
                  className="animate-benefit-spin absolute inset-0 size-full origin-center text-[#1F3B2A]"
                  aria-hidden="true"
                >
                  <defs>
                    <path
                      id="seal-circle-path"
                      d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
                    />
                  </defs>
                  <circle
                    cx="50"
                    cy="50"
                    r="47"
                    fill="none"
                    stroke="#DDD6C8"
                    strokeWidth="1.2"
                    strokeDasharray="2 2"
                  />
                  <text
                    fontSize="9.5"
                    fontWeight="600"
                    letterSpacing="0.18em"
                    fill="currentColor"
                    className="uppercase"
                  >
                    <textPath href="#seal-circle-path" startOffset="0%">
                      · 100% BOTANICAL · PURE HERBS ·
                    </textPath>
                  </text>
                </svg>

                {/* Center Badge "100%" */}
                <span
                  className="relative z-10 text-[0.82rem] font-bold tracking-tight text-[#1F3B2A]"
                  style={{
                    fontFamily: "var(--font-instrument, 'Instrument Serif', Georgia, serif)",
                  }}
                >
                  100%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Top Divider (scaleX from 0, origin left) ── */}
        <div
          className="benefit-divider-item mt-14 h-[1px] w-full bg-[#DDD6C8]"
          style={{ transitionDelay: "400ms" }}
          aria-hidden="true"
        />

        {/* ── Four Benefit Rows ── */}
        <div className="flex flex-col" role="list">
          {benefitRows.map((item, index) => {
            const delay = 500 + index * 100;
            return (
              <div
                key={item.id}
                role="listitem"
                data-benefit-row
                className="benefit-entrance-item group relative isolate flex flex-col border-b border-[#DDD6C8] py-8 sm:py-9 md:py-10 transition-colors duration-300 hover:z-30"
                style={{ transitionDelay: `${delay}ms` }}
              >
                {/* Warm Tinted Band behind row (Accent at 8% opacity) */}
                <div
                  className="pointer-events-none absolute inset-x-[-24px] inset-y-0 -z-10 rounded-xl bg-[#4E8A2E]/[0.08] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  aria-hidden="true"
                />

                {/* Absolute Cursor-Following Floating Product Image (230x280px) */}
                <div
                  data-floating-image
                  className="pointer-events-none absolute left-0 top-0 z-[5] hidden md:block size-[230px] h-[280px] overflow-hidden rounded-[8px] bg-[#FAF7F2] opacity-0 shadow-[0_24px_50px_-12px_rgba(25,45,30,0.38)]"
                  style={{
                    willChange: "transform, opacity",
                    transition: "opacity 0.28s cubic-bezier(0.16, 1, 0.3, 1)",
                    transform: "translate3d(0, 0, 0) translate(-50%, -50%) scale(0.92)",
                  }}
                  aria-hidden="true"
                >
                  <Image
                    src={item.image}
                    alt={item.alt}
                    fill
                    sizes="230px"
                    priority
                    className="size-full object-cover object-center"
                  />
                  {/* Subtle glass reflection overlay */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1F3B2A]/40 via-transparent to-white/10" />
                </div>

                {/* Row Inner Grid with 16px Indent Transition on Hover */}
                <div className="grid grid-cols-1 items-center gap-4 transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:translate-x-0 md:grid-cols-[60px_1fr_340px_60px] md:gap-8 md:group-hover:translate-x-4">
                  {/* Number: 01–04, serif 26px, accent color */}
                  <div
                    className="text-[1.625rem] leading-none text-[#4E8A2E]"
                    style={{
                      fontFamily: "var(--font-instrument, 'Instrument Serif', Georgia, serif)",
                    }}
                  >
                    {item.num}
                  </div>

                  {/* Title: Serif 54px, with mix-blend-mode: difference */}
                  <div className="relative z-10 pr-4">
                    <h3
                      className="m-0 text-[clamp(1.6rem,3.4vw,3.375rem)] font-normal leading-[1.04] tracking-[-0.03em] text-[#1F3B2A] transition-colors duration-200"
                      style={{
                        fontFamily: "var(--font-instrument, 'Instrument Serif', Georgia, serif)",
                        mixBlendMode: "difference",
                      }}
                    >
                      {item.title}
                    </h3>
                  </div>

                  {/* Description: 14px muted text, 340px width */}
                  <div className="w-full md:max-w-[340px]">
                    <p className="m-0 text-[0.875rem] leading-[1.65] text-[#5E6B5A]">
                      {item.description}
                    </p>
                  </div>

                  {/* 44px Circular Arrow: slides in from -14px and rotates -45° */}
                  <div className="flex justify-end md:justify-center">
                    <div
                      className="flex size-[44px] items-center justify-center rounded-full border border-[#DDD6C8] bg-transparent text-[#1F3B2A] shadow-2xs transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:border-[#1F3B2A] group-hover:bg-[#1F3B2A] group-hover:text-[#FAF7F2] md:-translate-x-[14px] md:rotate-0 md:opacity-60 md:group-hover:translate-x-0 md:group-hover:-rotate-45 md:group-hover:opacity-100"
                      aria-hidden="true"
                    >
                      <svg
                        className="size-4 stroke-current"
                        viewBox="0 0 24 24"
                        fill="none"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Full-Bleed Dark Ticker Strip (Ink color, light text, 28s linear loop) ── */}
      <div
        className="benefit-entrance-item relative mt-16 sm:mt-20 md:mt-24 w-full overflow-hidden bg-[#1F3B2A] py-4 text-[#FAF7F2] select-none"
        style={{ transitionDelay: "900ms" }}
        aria-hidden="true"
      >
        <div className="flex w-max animate-benefit-ticker">
          {/* Repeated ticker items */}
          {[0, 1].map((copyIndex) => (
            <div key={copyIndex} className="flex shrink-0 items-center gap-8 pr-8">
              <span className="text-[0.88rem] font-medium tracking-[0.06em] uppercase">
                Follicle Vitality
              </span>
              <span className="text-[#4E8A2E] text-base">✦</span>

              <span className="text-[0.88rem] font-medium tracking-[0.06em] uppercase">
                Natural Slip & Cuticle Seal
              </span>
              <span className="text-[#4E8A2E] text-base">✦</span>

              <span className="text-[0.88rem] font-medium tracking-[0.06em] uppercase">
                Sebum Balance
              </span>
              <span className="text-[#4E8A2E] text-base">✦</span>

              <span className="text-[0.88rem] font-medium tracking-[0.06em] uppercase">
                Pure Pigment Depth
              </span>
              <span className="text-[#4E8A2E] text-base">✦</span>

              <span className="text-[0.88rem] font-medium tracking-[0.06em] uppercase">
                Single-origin shade-dried herbs
              </span>
              <span className="text-[#4E8A2E] text-base">✦</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
