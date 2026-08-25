"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { useStore } from "@/features/store/store-provider";
import type {
  StorefrontCustomerReview,
  StorefrontVideoReview,
} from "@/lib/shopify/storefront";

interface VideoItem {
  id: string;
  creator: string;
  title: string;
  duration: string;
  image: string;
  productTag: string;
  productSlug: string;
  testimonial: string;
}

interface ReviewItem {
  id: string;
  rating: number;
  quote: string;
  author: string;
  role: string;
  avatarText: string;
  avatarBg: string;
}

const VIDEOS: VideoItem[] = [
  {
    id: "vid-1",
    creator: "Ashley Cooper",
    title: "My 4-week Amla ritual transformation",
    duration: "0:41",
    image: "/images/naturemist-ritual.png",
    productTag: "AMLA POWDER",
    productSlug: "amla",
    testimonial:
      "Shade-dried Amla transformed my roots and gave my hair an unhurried, natural mirror gloss within four weeks.",
  },
  {
    id: "vid-2",
    creator: "Maya Patel",
    title: "How I mix the fresh pre-wash mask",
    duration: "0:55",
    image: "/images/naturemist-hero.png",
    productTag: "THE FOUNDATION TRIO",
    productSlug: "amla",
    testimonial:
      "Mixing two parts Amla with one part Reetha and Shikakai creates the perfect low-lather clarifying cleanse.",
  },
  {
    id: "vid-3",
    creator: "Anton de Swardt",
    title: "Pure shade-dried botanicals routine",
    duration: "1:07",
    image: "/images/naturemist-process.png",
    productTag: "CONDITIONING PAIR",
    productSlug: "bhringraj",
    testimonial:
      "Zero fillers, zero chemical perfumes. Just pure powdered plants that ground and soothe the scalp.",
  },
  {
    id: "vid-4",
    creator: "Elena Rostova",
    title: "Zero silicones, mirror hair shine",
    duration: "0:47",
    image: "/images/amla-powder.jpg",
    productTag: "BHRINGRAJ POWDER",
    productSlug: "bhringraj",
    testimonial:
      "Scalp dryness stopped in week two and my lengths have never felt so lightweight, soft, and glossy.",
  },
];

const REVIEWS: ReviewItem[] = [
  {
    id: "rev-1",
    rating: 5,
    quote:
      "NatureMist transformed my Sunday wash day into a restorative ritual. After 4 weeks of the Amla & Bhringraj mask, my hair feels conditioned, softer, and has a natural mirror shine without heavy silicones.",
    author: "Ashley Cooper",
    role: "Verified Customer · 6 months ritual",
    avatarText: "AC",
    avatarBg: "bg-[#1f3e2b]",
  },
  {
    id: "rev-2",
    rating: 5,
    quote:
      "The ingredient purity is unmatched. You open the pack and smell 100% pure shade-dried botanicals. Scalp dryness stopped on week two and the lengths have so much natural body and slip.",
    author: "Anton de Swardt",
    role: "Verified Customer · 4 months ritual",
    avatarText: "AD",
    avatarBg: "bg-[#3a5a30]",
  },
  {
    id: "rev-3",
    rating: 5,
    quote:
      "I was intimidated by powdered botanicals, but the clear 3 step preparation guide made it effortless. The curls feel deeply hydrated and the gloss lasts until the next wash.",
    author: "Priya Sharma",
    role: "Verified Customer · 8 months ritual",
    avatarText: "PS",
    avatarBg: "bg-[#234938]",
  },
];

export function VideoReviewsSection() {
  const videoScrollRef = useRef<HTMLDivElement>(null);
  const reviewScrollRef = useRef<HTMLDivElement>(null);
  const [activeModalVideo, setActiveModalVideo] = useState<StorefrontVideoReview | null>(null);
  const { content, addToCart } = useStore();

  const videos = content.videoReviews?.length ? content.videoReviews : VIDEOS;
  const reviews = content.customerReviews?.length ? content.customerReviews : REVIEWS;

  const handleVideoScroll = (direction: "left" | "right") => {
    if (videoScrollRef.current) {
      const scrollAmount = direction === "left" ? -320 : 320;
      videoScrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const handleReviewScroll = (direction: "left" | "right") => {
    if (reviewScrollRef.current) {
      const scrollAmount = direction === "left" ? -350 : 350;
      reviewScrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section
      className="relative mx-auto w-full max-w-[1440px] px-[clamp(24px,5vw,72px)] py-[clamp(65px,8vw,110px)] max-[680px]:px-4 max-[680px]:py-12"
      id="community-rituals"
      aria-label="Community Videos and Reviews"
    >
      {/* ─────────────────────────────────────────────────────────────
          TOP SECTION: Videos for this product.
      ───────────────────────────────────────────────────────────── */}
      <div className="mb-14 max-[680px]:mb-10">
        {/* Section Header */}
        <div className="mb-10 text-center max-[680px]:mb-6">
          <p className="mb-3 text-[0.68rem] font-bold tracking-[0.2em] text-[#529d38] uppercase max-[680px]:mb-1.5 max-[680px]:text-[0.56rem]">
            A Community in Rhythm
          </p>
          <h2 className="m-0 font-serif text-[clamp(2.6rem,4.5vw,4.6rem)] font-normal leading-[0.98] tracking-[-0.045em] text-[var(--forest)] [font-family:var(--font-display)] max-[680px]:text-[clamp(1.8rem,8vw,2.4rem)]">
            Videos for this product.
          </h2>
          <p className="mx-auto mt-4 max-w-[620px] text-[0.94rem] leading-[1.65] text-[var(--muted)] max-[680px]:mt-2 max-[680px]:text-[0.76rem] max-[680px]:leading-[1.45]">
            See how our community prepares fresh botanical pastes, applies scalp rituals, and cares for their lengths.
          </p>
        </div>

        {/* 4 Video Cards Grid / Carousel */}
        <div
          ref={videoScrollRef}
          className="grid grid-cols-4 gap-5 max-[1120px]:flex max-[1120px]:overflow-x-auto max-[1120px]:scroll-smooth max-[1120px]:snap-x max-[1120px]:snap-mandatory max-[1120px]:pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-[680px]:gap-3.5"
          role="region"
          aria-label="Community video stories"
        >
          {videos.map((video) => (
            <article
              key={video.id}
              className="group/video relative aspect-[3/4.2] w-full min-w-[250px] shrink-0 snap-center cursor-pointer overflow-hidden rounded-2xl border border-black/5 bg-[#e4ede3] shadow-[0_8px_24px_rgba(21,59,45,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(21,59,45,0.14)] max-[1120px]:w-[280px] max-[680px]:w-[76vw] max-[680px]:min-w-[220px] max-[680px]:max-w-[260px]"
              onClick={() => setActiveModalVideo(video)}
            >
              {/* Background Thumbnail Image */}
              <Image
                src={video.image}
                alt={video.title}
                fill
                sizes="(max-width: 680px) 76vw, (max-width: 1120px) 280px, 25vw"
                className="size-full object-cover object-center transition-transform duration-500 group-hover/video:scale-105"
              />

              {/* Gradient Dark Overlay */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30" />

              {/* Top-Left Category Tag */}
              <div className="absolute top-3.5 left-3.5 z-10 rounded-full bg-black/45 px-3 py-1 text-[0.54rem] font-bold tracking-[0.08em] text-white uppercase backdrop-blur-md max-[680px]:top-2.5 max-[680px]:left-2.5 max-[680px]:text-[0.46rem]">
                {video.productTag}
              </div>

              {/* Center Translucent Play Button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className="grid size-12 place-items-center rounded-full border border-white/80 bg-white/35 text-white shadow-lg backdrop-blur-md transition-transform duration-200 group-hover/video:scale-110 max-[680px]:size-10"
                  aria-hidden="true"
                >
                  <svg
                    className="ml-0.5 size-5 text-white max-[680px]:size-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              </div>

              {/* Bottom Info Overlay */}
              <div className="absolute right-3.5 bottom-3.5 left-3.5 z-10 text-white max-[680px]:right-2.5 max-[680px]:bottom-2.5 max-[680px]:left-2.5">
                <p className="m-0 line-clamp-2 text-[0.82rem] font-semibold leading-tight drop-shadow-sm max-[680px]:text-[0.7rem]">
                  {video.title}
                </p>
                <div className="mt-1.5 flex items-center justify-between text-[0.62rem] text-white/85 max-[680px]:text-[0.52rem]">
                  <span>{video.creator}</span>
                  <span className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-[0.58rem]">
                    {video.duration}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Carousel Navigation Arrows */}
        <div className="mt-7 flex items-center justify-center gap-3 max-[680px]:mt-5">
          <button
            type="button"
            onClick={() => handleVideoScroll("left")}
            className="grid size-10 place-items-center rounded-full border border-[var(--line)] bg-white text-[1rem] text-[var(--forest)] shadow-xs transition-all duration-200 hover:bg-[var(--sand)] hover:scale-105 active:scale-95 cursor-pointer max-[680px]:size-8 max-[680px]:text-[0.85rem]"
            aria-label="Previous video"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => handleVideoScroll("right")}
            className="grid size-10 place-items-center rounded-full bg-[#529d38] text-[1rem] text-white shadow-sm transition-all duration-200 hover:bg-[#43852d] hover:scale-105 active:scale-95 cursor-pointer max-[680px]:size-8 max-[680px]:text-[0.85rem]"
            aria-label="Next video"
          >
            →
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          DECORATIVE FLOATING LEAVES DIVIDER
      ───────────────────────────────────────────────────────────── */}
      <div
        className="pointer-events-none relative my-8 flex items-center justify-between px-16 opacity-70 max-[680px]:my-4 max-[680px]:px-4"
        aria-hidden="true"
      >
        <svg
          className="size-8 -rotate-45 text-[#60a842] max-[680px]:size-5"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
        </svg>
        <svg
          className="size-8 rotate-45 text-[#529d38] max-[680px]:size-5"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
        </svg>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          BOTTOM SECTION: Our customer reviews.
      ───────────────────────────────────────────────────────────── */}
      <div>
        {/* Section Header */}
        <div className="mb-10 text-center max-[680px]:mb-6">
          <p className="mb-3 text-[0.68rem] font-bold tracking-[0.2em] text-[#529d38] uppercase max-[680px]:mb-1.5 max-[680px]:text-[0.56rem]">
            Voices of the Ritual
          </p>
          <h2 className="m-0 font-serif text-[clamp(2.6rem,4.5vw,4.6rem)] font-normal leading-[0.98] tracking-[-0.045em] text-[var(--forest)] [font-family:var(--font-display)] max-[680px]:text-[clamp(1.8rem,8vw,2.4rem)]">
            Our customer reviews.
          </h2>
          <p className="mx-auto mt-4 max-w-[620px] text-[0.94rem] leading-[1.65] text-[var(--muted)] max-[680px]:mt-2 max-[680px]:text-[0.76rem] max-[680px]:leading-[1.45]">
            Real experiences from customers who made botanical powders part of their weekly rhythm.
          </p>
        </div>

        {/* 3 Review Cards Grid */}
        <div
          ref={reviewScrollRef}
          className="grid grid-cols-3 gap-6 max-[960px]:flex max-[960px]:overflow-x-auto max-[960px]:scroll-smooth max-[960px]:snap-x max-[960px]:snap-mandatory max-[960px]:pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-[680px]:gap-3.5"
          role="region"
          aria-label="Customer written reviews"
        >
          {reviews.map((review) => (
            <article
              key={review.id}
              className="flex w-full shrink-0 snap-start flex-col justify-between rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-7 shadow-[0_4px_18px_rgba(21,59,45,0.03)] transition-all duration-300 hover:shadow-[0_12px_28px_rgba(21,59,45,0.06)] max-[960px]:w-[320px] max-[680px]:w-[82vw] max-[680px]:min-w-[260px] max-[680px]:max-w-[300px] max-[680px]:p-5"
            >
              <div>
                {/* 5 Gold Stars */}
                <div
                  className="mb-3.5 flex items-center gap-1 text-[#f5a623] max-[680px]:mb-2.5"
                  aria-label={`${review.rating} out of 5 stars`}
                >
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <span key={i} className="text-base max-[680px]:text-sm">
                      ★
                    </span>
                  ))}
                </div>

                {/* Review Text */}
                <p className="m-0 text-[0.88rem] leading-[1.7] text-[#2c3e34] max-[680px]:text-[0.74rem] max-[680px]:leading-[1.5]">
                  &ldquo;{review.quote}&rdquo;{" "}
                  <Link href="/reviews" className="font-semibold text-[#529d38] hover:underline">
                    Learn More...
                  </Link>
                </p>
              </div>

              {/* Author Footer */}
              <div className="mt-7 flex items-center gap-3.5 border-t border-[var(--line)] pt-4 max-[680px]:mt-5 max-[680px]:gap-2.5 max-[680px]:pt-3">
                <div
                  className={`grid size-10 shrink-0 place-items-center rounded-full ${review.avatarBg || "bg-[#1f3e2b]"} text-[0.76rem] font-bold text-white shadow-xs max-[680px]:size-8 max-[680px]:text-[0.65rem]`}
                >
                  {review.avatarText || review.author.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="m-0 text-[0.88rem] font-bold text-[var(--forest)] max-[680px]:text-[0.76rem]">
                    {review.author}
                  </h3>
                  <p className="m-0 text-[0.66rem] text-[var(--muted)] max-[680px]:text-[0.56rem]">
                    {review.role}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Reviews Navigation & See All Reviews Button */}
        <div className="mt-8 flex flex-col items-center justify-center gap-5 max-[680px]:mt-6">
          {/* Arrow Buttons */}
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => handleReviewScroll("left")}
              className="grid size-10 place-items-center rounded-full border border-[var(--line)] bg-white text-[1rem] text-[var(--forest)] shadow-xs transition-all duration-200 hover:bg-[var(--sand)] hover:scale-105 active:scale-95 cursor-pointer max-[680px]:size-8 max-[680px]:text-[0.85rem]"
              aria-label="Previous review"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => handleReviewScroll("right")}
              className="grid size-10 place-items-center rounded-full bg-[#529d38] text-[1rem] text-white shadow-sm transition-all duration-200 hover:bg-[#43852d] hover:scale-105 active:scale-95 cursor-pointer max-[680px]:size-8 max-[680px]:text-[0.85rem]"
              aria-label="Next review"
            >
              →
            </button>
          </div>

          {/* See All Reviews CTA Pill Button */}
          <Link
            href="/reviews"
            className="inline-flex min-h-[46px] items-center justify-center rounded-xl bg-[#529d38] px-8 py-3 text-[0.78rem] font-bold tracking-[0.08em] uppercase text-white shadow-[0_8px_22px_rgba(82,157,56,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#43852d] hover:shadow-[0_12px_28px_rgba(82,157,56,0.34)] active:scale-95 max-[680px]:min-h-[38px] max-[680px]:px-6 max-[680px]:py-2.5 max-[680px]:text-[0.68rem]"
          >
            See All Reviews
          </Link>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          INTERACTIVE VIDEO PLAYER MODAL (Plays MP4 video if provided)
      ───────────────────────────────────────────────────────────── */}
      {activeModalVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm transition-opacity"
          onClick={() => setActiveModalVideo(null)}
          role="dialog"
          aria-modal="true"
          aria-label={activeModalVideo.title}
        >
          <div
            className="relative flex max-h-[90vh] w-full max-w-[420px] flex-col overflow-hidden rounded-3xl bg-[#0e271b] text-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setActiveModalVideo(null)}
              className="absolute top-4 right-4 z-20 grid size-9 place-items-center rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-black/80 cursor-pointer"
              aria-label="Close video modal"
            >
              ✕
            </button>

            {/* Video Player or Thumbnail */}
            <div className="relative aspect-[9/13] w-full overflow-hidden bg-black">
              {activeModalVideo.videoUrl ? (
                <video
                  src={activeModalVideo.videoUrl}
                  controls
                  autoPlay
                  playsInline
                  poster={activeModalVideo.image}
                  className="size-full object-cover"
                />
              ) : (
                <>
                  <Image
                    src={activeModalVideo.image}
                    alt={activeModalVideo.title}
                    fill
                    className="size-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0e271b] via-transparent to-black/40" />

                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="grid size-16 place-items-center rounded-full border border-white/80 bg-white/30 text-white backdrop-blur-md shadow-2xl animate-pulse">
                      <svg className="ml-1 size-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Video Details & Quick Add */}
            <div className="p-5">
              <div className="flex items-center justify-between text-[0.62rem] uppercase tracking-wider text-[#c8d88e]">
                <span>{activeModalVideo.creator}</span>
                <span>{activeModalVideo.duration}</span>
              </div>
              <h3 className="my-1.5 [font-family:var(--font-display)] text-[1.2rem] font-normal leading-tight text-white">
                {activeModalVideo.title}
              </h3>
              <p className="m-0 text-[0.76rem] leading-[1.5] text-white/80">
                &ldquo;{activeModalVideo.testimonial}&rdquo;
              </p>

              <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-3">
                <div>
                  <span className="block text-[0.55rem] uppercase tracking-wider text-white/60">Featured Botanical</span>
                  <span className="text-[0.78rem] font-semibold text-white">{activeModalVideo.productTag}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    addToCart(activeModalVideo.productSlug);
                    setActiveModalVideo(null);
                  }}
                  className="rounded-full bg-[#529d38] px-5 py-2 text-[0.7rem] font-bold uppercase tracking-wider text-white transition-all hover:bg-[#43852d] active:scale-95 cursor-pointer"
                >
                  Add to Bag +
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
