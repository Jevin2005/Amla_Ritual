"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { useStore } from "@/features/store/store-provider";

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
  avatarBg: string;
  avatarText: string;
}

const VIDEOS: VideoItem[] = [
  {
    id: "vid-1",
    creator: "Ashley Cooper",
    title: "My 4-week Amla ritual transformation",
    duration: "0:45",
    image: "/images/naturemist-ritual.png",
    productTag: "Amla Powder",
    productSlug: "amla-powder",
    testimonial: "Shade-dried Amla transformed my roots and gave my hair an unhurried, natural mirror gloss.",
  },
  {
    id: "vid-2",
    creator: "Maya Patel",
    title: "How I mix the fresh pre-wash mask",
    duration: "0:38",
    image: "/images/naturemist-hero.png",
    productTag: "The Foundation Trio",
    productSlug: "amla-powder",
    testimonial: "Mixing 2 parts Amla with 1 part Reetha and Shikakai creates the perfect low-lather cleanse.",
  },
  {
    id: "vid-3",
    creator: "Anton de Swardt",
    title: "Pure shade-dried botanicals routine",
    duration: "1:02",
    image: "/images/naturemist-process.png",
    productTag: "Conditioning Pair",
    productSlug: "bhringraj-powder",
    testimonial: "Zero fillers, zero chemical perfumes. Just pure powdered plants that soothe the scalp.",
  },
  {
    id: "vid-4",
    creator: "Elena Rostova",
    title: "Zero silicones, mirror hair shine",
    duration: "0:52",
    image: "/images/amla-powder.jpg",
    productTag: "Bhringraj Powder",
    productSlug: "bhringraj-powder",
    testimonial: "Scalp irritation stopped in week two and my lengths have never felt so lightweight.",
  },
  {
    id: "vid-5",
    creator: "Zainab Al-Hassan",
    title: "Scalp grounding massage with Shikakai",
    duration: "0:48",
    image: "/images/shikakai-powder.jpg",
    productTag: "Shikakai Powder",
    productSlug: "shikakai-powder",
    testimonial: "The natural saponins cleanse thoroughly without stripping essential scalp moisture.",
  },
  {
    id: "vid-6",
    creator: "Priya Sharma",
    title: "Sunday unhurried conditioning mask",
    duration: "1:15",
    image: "/images/hibiscus-powder.jpg",
    productTag: "Hibiscus Powder",
    productSlug: "hibiscus-powder",
    testimonial: "Deep conditioning with Hibiscus gave my curls intense bounce and vivid color vibrancy.",
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
    avatarBg: "bg-[#2d4a36]",
    avatarText: "AC",
  },
  {
    id: "rev-2",
    rating: 5,
    quote:
      "The ingredient purity is unmatched. You open the pack and smell 100% pure shade-dried botanicals. Scalp dryness stopped on week two and the lengths have so much natural body and slip.",
    author: "Anton de Swardt",
    role: "Verified Customer · 4 months ritual",
    avatarBg: "bg-[#527d42]",
    avatarText: "AD",
  },
  {
    id: "rev-3",
    rating: 5,
    quote:
      "I was intimidated by powdered botanicals, but the clear 3-step preparation guide made it effortless. The curls feel deeply hydrated and the gloss lasts until the next wash.",
    author: "Priya Sharma",
    role: "Verified Customer · 8 months ritual",
    avatarBg: "bg-[#3e5f48]",
    avatarText: "PS",
  },
  {
    id: "rev-4",
    rating: 5,
    quote:
      "Finally, a botanical formulation with zero fragrance fillers. My sensitive scalp feels calm, balanced, and shedding during brush out has visibly decreased.",
    author: "Marcus Vance",
    role: "Verified Customer · 3 months ritual",
    avatarBg: "bg-[#456b54]",
    avatarText: "MV",
  },
  {
    id: "rev-5",
    rating: 5,
    quote:
      "The Shikakai and Reetha combination cleanses effectively without foaming harsh detergents. My lengths stay soft for days between washes.",
    author: "Dr. Sunita Rao",
    role: "Verified Customer · 1 year ritual",
    avatarBg: "bg-[#254636]",
    avatarText: "SR",
  },
];

export function VideoReviewsSection() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const reviewsCarouselRef = useRef<HTMLDivElement>(null);
  const [activeModalVideo, setActiveModalVideo] = useState<VideoItem | null>(null);
  const { addToCart } = useStore();

  const handleNext = () => {
    if (carouselRef.current) {
      const card = carouselRef.current.querySelector("article");
      const scrollStep = card ? card.clientWidth + 16 : 290;
      carouselRef.current.scrollBy({ left: scrollStep, behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    if (carouselRef.current) {
      const card = carouselRef.current.querySelector("article");
      const scrollStep = card ? card.clientWidth + 16 : 290;
      carouselRef.current.scrollBy({ left: -scrollStep, behavior: "smooth" });
    }
  };

  const handleReviewsNext = () => {
    if (reviewsCarouselRef.current) {
      const card = reviewsCarouselRef.current.querySelector("article");
      const scrollStep = card ? card.clientWidth + 16 : 300;
      reviewsCarouselRef.current.scrollBy({ left: scrollStep, behavior: "smooth" });
    }
  };

  const handleReviewsPrev = () => {
    if (reviewsCarouselRef.current) {
      const card = reviewsCarouselRef.current.querySelector("article");
      const scrollStep = card ? card.clientWidth + 16 : 300;
      reviewsCarouselRef.current.scrollBy({ left: -scrollStep, behavior: "smooth" });
    }
  };

  return (
    <section
      className="relative mx-auto w-full max-w-[1440px] px-[clamp(24px,5vw,72px)] py-[clamp(60px,7vw,100px)] max-[680px]:px-3.5 max-[680px]:py-10"
      id="customer-reviews"
      aria-label="Customer Videos and Reviews"
    >
      {/* ── PART 1: Videos for this Product ── */}
      <div className="mb-16 max-[680px]:mb-10">
        {/* Section Heading */}
        <div className="mb-10 text-center max-[680px]:mb-6">
          <p className="mb-2 text-[0.68rem] leading-[1.3] font-bold tracking-[0.2em] text-[var(--botanical)] uppercase max-[680px]:mb-1 max-[680px]:text-[0.54rem]">
            A community in rhythm
          </p>
          <h2 className="m-0 text-[clamp(2.4rem,4.2vw,4.4rem)] font-normal leading-[0.96] tracking-[-0.045em] text-[var(--forest)] [font-family:var(--font-display)] max-[680px]:text-[clamp(1.55rem,7vw,2.1rem)]">
            Videos for this product.
          </h2>
          <p className="mx-auto mt-4 max-w-[600px] text-[0.88rem] leading-[1.65] text-[var(--muted)] max-[680px]:mt-2 max-[680px]:text-[0.68rem] max-[680px]:leading-[1.4]">
            See how our community prepares fresh botanical pastes, applies scalp rituals, and cares for their lengths.
          </p>
        </div>

        {/* Scrollable Video Cards Track */}
        <div
          ref={carouselRef}
          className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-[680px]:gap-3"
          tabIndex={0}
          role="region"
          aria-label="Community video stories"
        >
          {VIDEOS.map((video) => (
            <article
              key={video.id}
              className="group/video relative aspect-[9/14] w-[calc(25%-12px)] min-w-[260px] max-[1120px]:w-[calc(33.33%-11px)] max-[860px]:w-[calc(50%-8px)] max-[680px]:w-[70vw] max-[680px]:min-w-[210px] max-[680px]:max-w-[245px] shrink-0 snap-center cursor-pointer overflow-hidden rounded-2xl border border-black/5 bg-[#e4ede3] shadow-[0_6px_20px_rgba(23,63,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(23,63,42,0.12)]"
              onClick={() => setActiveModalVideo(video)}
            >
              {/* Thumbnail Image */}
              <Image
                src={video.image}
                alt={video.title}
                fill
                sizes="(max-width: 680px) 70vw, (max-width: 1080px) 35vw, 25vw"
                className="size-full object-cover object-center transition-transform duration-500 group-hover/video:scale-105"
              />

              {/* Gradient Scrim */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

              {/* Top Tag: Product Name */}
              <div className="absolute top-3 left-3 z-10 rounded-full bg-black/45 px-2.5 py-0.5 text-[0.52rem] font-bold uppercase tracking-wider text-white backdrop-blur-md max-[680px]:top-2 max-[680px]:left-2 max-[680px]:text-[0.44rem]">
                {video.productTag}
              </div>

              {/* Center Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className="grid size-12 place-items-center rounded-full border border-white/70 bg-white/40 text-white shadow-lg backdrop-blur-md transition-transform duration-200 group-hover/video:scale-110 max-[680px]:size-9"
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

              {/* Bottom Details */}
              <div className="absolute right-3 bottom-3 left-3 z-10 text-white max-[680px]:right-2 max-[680px]:bottom-2 max-[680px]:left-2">
                <p className="m-0 line-clamp-2 text-[0.74rem] font-semibold leading-tight drop-shadow-sm max-[680px]:text-[0.6rem]">
                  {video.title}
                </p>
                <div className="mt-1 flex items-center justify-between text-[0.56rem] text-white/85 max-[680px]:text-[0.48rem]">
                  <span>{video.creator}</span>
                  <span className="rounded bg-black/35 px-1 py-0.5">
                    {video.duration}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Carousel Navigation Arrows */}
        <div className="mt-6 flex items-center justify-center gap-3 max-[680px]:mt-4">
          <button
            type="button"
            onClick={handlePrev}
            className="grid size-10 place-items-center rounded-full border border-[var(--line)] bg-white text-[1rem] text-[var(--forest)] shadow-xs transition-all duration-200 hover:bg-[var(--beige)] hover:scale-105 active:scale-95 cursor-pointer max-[680px]:size-8 max-[680px]:text-[0.85rem]"
            aria-label="Previous video"
          >
            ←
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="grid size-10 place-items-center rounded-full bg-[#529d38] text-[1rem] text-white shadow-sm transition-all duration-200 hover:bg-[#43852d] hover:scale-105 active:scale-95 cursor-pointer max-[680px]:size-8 max-[680px]:text-[0.85rem]"
            aria-label="Next video"
          >
            →
          </button>
        </div>
      </div>

      {/* Interactive Video Modal */}
      {activeModalVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm transition-opacity"
          onClick={() => setActiveModalVideo(null)}
          role="dialog"
          aria-modal="true"
          aria-label={activeModalVideo.title}
        >
          <div
            className="relative flex max-h-[90vh] w-full max-w-[420px] flex-col overflow-hidden rounded-3xl bg-[#0e271b] text-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Close Button */}
            <button
              type="button"
              onClick={() => setActiveModalVideo(null)}
              className="absolute top-4 right-4 z-20 grid size-9 place-items-center rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-black/80 cursor-pointer"
              aria-label="Close video modal"
            >
              ✕
            </button>

            {/* Video Player Box */}
            <div className="relative aspect-[9/13] w-full overflow-hidden bg-black">
              <Image
                src={activeModalVideo.image}
                alt={activeModalVideo.title}
                fill
                className="size-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e271b] via-transparent to-black/40" />

              {/* Center Play Graphic */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="grid size-16 place-items-center rounded-full border border-white/80 bg-white/30 text-white backdrop-blur-md shadow-2xl animate-pulse">
                  <svg className="ml-1 size-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              </div>
            </div>

            {/* Video Footer Info & CTA */}
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

      {/* Decorative Floating Leaves */}
      <div
        className="pointer-events-none relative my-6 flex items-center justify-between px-12 opacity-60 max-[680px]:my-3 max-[680px]:px-4"
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
          className="size-9 rotate-45 text-[#529d38] max-[680px]:size-6"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
        </svg>
      </div>

      {/* ── PART 2: Our Customers Reviews ── */}
      <div>
        {/* Section Heading */}
        <div className="mb-10 text-center max-[680px]:mb-6">
          <p className="mb-2 text-[0.68rem] leading-[1.3] font-bold tracking-[0.2em] text-[var(--botanical)] uppercase max-[680px]:mb-1 max-[680px]:text-[0.54rem]">
            Voices of the ritual
          </p>
          <h2 className="m-0 text-[clamp(2.4rem,4.2vw,4.4rem)] font-normal leading-[0.96] tracking-[-0.045em] text-[var(--forest)] [font-family:var(--font-display)] max-[680px]:text-[clamp(1.55rem,7vw,2.1rem)]">
            Our customer reviews.
          </h2>
          <p className="mx-auto mt-4 max-w-[600px] text-[0.88rem] leading-[1.65] text-[var(--muted)] max-[680px]:mt-2 max-[680px]:text-[0.68rem] max-[680px]:leading-[1.4]">
            Real experiences from customers who made botanical powders part of their weekly rhythm.
          </p>
        </div>

        {/* Scrollable Reviews Carousel with Peeking Next Card */}
        <div
          ref={reviewsCarouselRef}
          className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-[680px]:gap-3 max-[680px]:px-1"
          tabIndex={0}
          role="region"
          aria-label="Customer written reviews"
        >
          {REVIEWS.map((review) => (
            <article
              key={review.id}
              className="flex w-[calc(33.333%-11px)] min-w-[290px] max-[960px]:w-[calc(50%-8px)] max-[680px]:w-[78vw] max-[680px]:min-w-[250px] max-[680px]:max-w-[290px] shrink-0 snap-start flex-col justify-between rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-6 shadow-[0_4px_16px_rgba(23,63,42,0.03)] transition-all duration-300 hover:shadow-[0_12px_28px_rgba(23,63,42,0.06)] max-[680px]:p-4.5"
            >
              <div>
                {/* 5 Gold Stars */}
                <div
                  className="mb-3 flex items-center gap-1 text-[#f5a623] max-[680px]:mb-2"
                  aria-label="5 out of 5 stars"
                >
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <span key={i} className="text-sm max-[680px]:text-xs">
                      ★
                    </span>
                  ))}
                </div>

                {/* Review Text */}
                <p className="m-0 text-[0.82rem] leading-[1.65] text-[#33463a] max-[680px]:text-[0.68rem] max-[680px]:leading-[1.45]">
                  &ldquo;{review.quote}&rdquo;{" "}
                  <span className="font-semibold text-[#529d38] cursor-pointer hover:underline">
                    Learn More...
                  </span>
                </p>
              </div>

              {/* Author Info */}
              <div className="mt-6 flex items-center gap-3 border-t border-[var(--line)] pt-4 max-[680px]:mt-4 max-[680px]:gap-2 max-[680px]:pt-3">
                <div
                  className={`grid size-10 shrink-0 place-items-center rounded-full ${review.avatarBg} text-[0.72rem] font-bold text-white shadow-sm max-[680px]:size-8 max-[680px]:text-[0.62rem]`}
                >
                  {review.avatarText}
                </div>
                <div>
                  <h4 className="m-0 text-[0.84rem] font-bold text-[var(--forest)] max-[680px]:text-[0.72rem]">
                    {review.author}
                  </h4>
                  <p className="m-0 text-[0.62rem] text-[var(--muted)] max-[680px]:text-[0.52rem]">
                    {review.role}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Reviews Navigation & See All Reviews Row */}
        <div className="mt-8 flex flex-col items-center justify-center gap-4 max-[680px]:mt-5">
          {/* Arrows */}
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleReviewsPrev}
              className="grid size-10 place-items-center rounded-full border border-[var(--line)] bg-white text-[1rem] text-[var(--forest)] shadow-xs transition-all duration-200 hover:bg-[var(--beige)] hover:scale-105 active:scale-95 cursor-pointer max-[680px]:size-8 max-[680px]:text-[0.85rem]"
              aria-label="Previous review"
            >
              ←
            </button>
            <button
              type="button"
              onClick={handleReviewsNext}
              className="grid size-10 place-items-center rounded-full bg-[#529d38] text-[1rem] text-white shadow-sm transition-all duration-200 hover:bg-[#43852d] hover:scale-105 active:scale-95 cursor-pointer max-[680px]:size-8 max-[680px]:text-[0.85rem]"
              aria-label="Next review"
            >
              →
            </button>
          </div>

          <Link
            href="/our-story"
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[#529d38] px-8 py-2.5 text-[0.78rem] font-semibold text-white shadow-[0_8px_20px_rgba(82,157,56,0.24)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#43852d] hover:shadow-[0_12px_26px_rgba(82,157,56,0.3)] active:scale-95 max-[680px]:min-h-[36px] max-[680px]:px-6 max-[680px]:py-2 max-[680px]:text-[0.68rem]"
          >
            See All Reviews
          </Link>
        </div>
      </div>
    </section>
  );
}
