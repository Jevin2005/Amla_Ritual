"use client";

import Image from "next/image";
import { useState } from "react";
import type { Product } from "@/domain/catalog/products";

interface ProductGalleryProps {
  product: Product;
}

export function ProductGallery({ product }: ProductGalleryProps) {
  // Collect all unique available images or fallbacks
  const images = (product.images && product.images.length > 0)
    ? product.images
    : product.featuredImage
      ? [product.featuredImage]
      : [
          {
            url: "/images/amla-powder.jpg",
            altText: `${product.name} Primary View`,
            width: 800,
            height: 800,
          },
        ];

  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex] || images[0];

  return (
    <div className="flex flex-col gap-3">
      {/* Clean, Pristine Main Showcase Stage */}
      <div className="relative aspect-[0.98] w-full overflow-hidden rounded-3xl border border-[var(--line)] bg-[radial-gradient(circle_at_50%_60%,rgba(255,255,255,0.95),transparent_55%),color-mix(in_srgb,var(--pdp-soft,var(--beige))_65%,var(--ivory))] p-6 shadow-[0_12px_36px_rgba(21,59,45,0.05)] max-[680px]:aspect-[1] max-[680px]:rounded-2xl max-[680px]:p-4">
        {/* Master Image View */}
        <div className="relative size-full flex items-center justify-center">
          <Image
            src={activeImage.url}
            alt={activeImage.altText || product.name}
            fill
            priority
            sizes="(max-width: 960px) 95vw, 48vw"
            className="size-full object-contain object-center transition-all duration-300 ease-out"
          />
        </div>
      </div>

      {/* Thumbnail Selector Track (If multiple images available) */}
      {images.length > 1 && (
        <div
          className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label={`${product.name} gallery thumbnails`}
        >
          {images.map((img, idx) => {
            const isSelected = idx === activeIndex;
            return (
              <button
                key={img.url}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`relative size-15 shrink-0 overflow-hidden rounded-xl border bg-white p-1 transition-all duration-200 cursor-pointer max-[680px]:size-13 ${
                  isSelected
                    ? "border-[var(--botanical)] ring-2 ring-[var(--botanical)]/40 scale-105 shadow-xs"
                    : "border-[var(--line)] opacity-70 hover:opacity-100 hover:border-black/20"
                }`}
                aria-label={`View photo ${idx + 1} of ${product.name}`}
              >
                <Image
                  src={img.url}
                  alt={img.altText || `${product.name} thumbnail ${idx + 1}`}
                  fill
                  sizes="60px"
                  className="object-contain"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
