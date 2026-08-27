"use client";

import Image from "next/image";
import { useState } from "react";
import type { Product } from "@/domain/catalog/products";

interface ProductGalleryProps {
  product: Product;
}

export function ProductGallery({ product }: ProductGalleryProps) {
  const baseImage = product.featuredImage?.url
    ? product.featuredImage
    : {
        url: "/images/amla-powder.jpg",
        altText: `${product.name} Primary View`,
        width: 800,
        height: 800,
      };

  // Shopify product media is the only source for gallery slides. A listing
  // with one uploaded photo must stay a one-photo gallery.
  const images = product.images?.length ? product.images : [baseImage];

  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex] || images[0];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="flex flex-col gap-3.5">
      {/* ── Main Showcase Stage ── */}
      <div className="group/stage relative aspect-[0.98] w-full overflow-hidden rounded-3xl border border-[var(--line)] bg-[radial-gradient(circle_at_50%_60%,rgba(255,255,255,0.98),transparent_55%),color-mix(in_srgb,var(--pdp-soft,var(--beige))_65%,var(--ivory))] p-6 shadow-[0_12px_36px_rgba(21,59,45,0.06)] max-[680px]:aspect-[1] max-[680px]:rounded-2xl max-[680px]:p-3">
        {/* Top-Left: Botanical Ritual Step Pill */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 rounded-full border border-black/5 bg-[rgba(255,255,255,0.85)] px-3 py-1 shadow-xs backdrop-blur-md max-[680px]:top-2.5 max-[680px]:left-2.5 max-[680px]:px-2.5 max-[680px]:py-0.5">
          <span className="size-1.5 rounded-full bg-[var(--botanical)]" />
          <span className="text-[0.6rem] font-bold uppercase tracking-[0.14em] text-[var(--forest)] max-[680px]:text-[0.5rem]">
            {product.ritualStep} Ritual
          </span>
        </div>

        {/* Top-Right: Premium Photo Showcase Counter Notation */}
        {images.length > 1 && (
          <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/60 px-3 py-1 text-white shadow-md backdrop-blur-md max-[680px]:top-2.5 max-[680px]:right-2.5 max-[680px]:px-2.5 max-[680px]:py-0.5">
            <svg
              className="size-3.5 text-white/90 max-[680px]:size-3"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="4" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            <span className="font-mono text-[0.68rem] font-bold tracking-wider max-[680px]:text-[0.58rem]">
              {activeIndex + 1} / {images.length}
            </span>
          </div>
        )}

        {/* Master Image View */}
        <div className="relative size-full flex items-center justify-center">
          <Image
            src={activeImage.url}
            alt={activeImage.altText || product.name}
            fill
            loading="eager"
            fetchPriority={activeIndex === 0 ? "high" : "auto"}
            quality={82}
            sizes="(max-width: 960px) 95vw, 48vw"
            className="size-full object-contain object-center transition-all duration-300 ease-out"
          />
        </div>

        {/* Left & Right Chevrons */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 grid size-9 place-items-center rounded-full border border-black/5 bg-white/85 text-[1.1rem] text-[var(--forest)] shadow-md backdrop-blur-md transition-all hover:bg-white hover:scale-105 active:scale-95 cursor-pointer max-[680px]:size-7.5 max-[680px]:text-[0.95rem]"
              aria-label="Previous photo"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 grid size-9 place-items-center rounded-full border border-black/5 bg-white/85 text-[1.1rem] text-[var(--forest)] shadow-md backdrop-blur-md transition-all hover:bg-white hover:scale-105 active:scale-95 cursor-pointer max-[680px]:size-7.5 max-[680px]:text-[0.95rem]"
              aria-label="Next photo"
            >
              ›
            </button>
          </>
        )}

        {/* Bottom Pagination Dots / Progress Indicator */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 rounded-full bg-black/35 px-3 py-1 backdrop-blur-md max-[680px]:bottom-2 max-[680px]:px-2 max-[680px]:py-0.5">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveIndex(i)}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  i === activeIndex
                    ? "w-5 bg-white shadow-xs"
                    : "w-1.5 bg-white/45 hover:bg-white/80"
                }`}
                aria-label={`Jump to photo ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Multi-Photo Thumbnails Track ── */}
      {images.length > 1 && (
        <div
          className="grid grid-cols-4 gap-2.5 max-[680px]:gap-1.5"
          aria-label={`${product.name} photo showcase`}
        >
          {images.map((img, idx) => {
            const isSelected = idx === activeIndex;
            const label = img.altText || `Photo ${idx + 1}`;
            return (
              <button
                key={img.url + idx}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`group relative flex flex-col items-center gap-1 rounded-2xl border p-1.5 transition-all duration-200 cursor-pointer max-[680px]:rounded-xl max-[680px]:p-1 ${
                  isSelected
                    ? "border-[var(--botanical)] bg-[var(--paper)] ring-2 ring-[var(--botanical)]/40 shadow-sm"
                    : "border-[var(--line)] bg-[rgba(255,255,255,0.7)] opacity-75 hover:opacity-100 hover:border-black/20"
                }`}
                aria-label={`View photo ${idx + 1}: ${label}`}
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-white max-[680px]:rounded-lg">
                  <Image
                    src={img.url}
                    alt={img.altText || `${product.name} thumbnail ${idx + 1}`}
                    fill
                    sizes="120px"
                    className="object-contain p-1 transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Number Notation Pill (01, 02, 03, 04) */}
                  <span className="absolute top-1 left-1 rounded bg-black/60 px-1 py-0.2 font-mono text-[0.52rem] font-bold text-white max-[680px]:text-[0.44rem]">
                    0{idx + 1}
                  </span>
                </div>
                <span className="truncate text-center text-[0.62rem] font-semibold text-[var(--forest)] max-[680px]:text-[0.5rem] max-[420px]:hidden">
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
