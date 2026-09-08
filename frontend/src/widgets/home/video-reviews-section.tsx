"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  getPlayableVideoMedia,
  type CustomerReview,
  type VideoReview,
} from "@/domain/reviews/custom-reviews";
import { ReviewCard } from "@/features/reviews/review-card";
import { VideoReviewModal } from "@/features/reviews/video-review-modal";
import { useStore } from "@/features/store/store-provider";

function CarouselControls({
  name,
  controls,
  canPrevious,
  canNext,
  onPrevious,
  onNext,
}: {
  name: string;
  controls: string;
  canPrevious: boolean;
  canNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div
      className="flex items-center gap-2"
      role="group"
      aria-label={`${name} carousel controls`}
    >
      <button
        type="button"
        onClick={onPrevious}
        disabled={!canPrevious}
        aria-controls={controls}
        className="grid size-10 place-items-center rounded-full border border-[var(--line)] bg-white text-[var(--forest)] shadow-md transition-[transform,background-color,opacity,box-shadow] hover:-translate-y-0.5 hover:bg-[var(--sand)] hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--forest)] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:translate-y-0 disabled:shadow-none"
        aria-label={`Scroll ${name} left`}
      >
        <span aria-hidden="true" className="text-base font-bold">&#8592;</span>
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={!canNext}
        aria-controls={controls}
        className="grid size-10 place-items-center rounded-full bg-[var(--forest)] text-white shadow-md transition-[transform,background-color,opacity,box-shadow] hover:-translate-y-0.5 hover:bg-[var(--forest-dark)] hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--forest)] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:translate-y-0 disabled:shadow-none"
        aria-label={`Scroll ${name} right`}
      >
        <span aria-hidden="true" className="text-base font-bold">&#8594;</span>
      </button>
    </div>
  );
}

function useCarousel(ref: React.RefObject<HTMLDivElement | null>) {
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const hasMoved = useRef(false);

  const [state, setState] = useState({
    hasOverflow: false,
    canPrevious: false,
    canNext: false,
  });

  const update = useCallback(() => {
    const element = ref.current;
    if (!element) return;
    const maximum = Math.max(0, element.scrollWidth - element.clientWidth);
    setState({
      hasOverflow: maximum > 4,
      canPrevious: element.scrollLeft > 4,
      canNext: element.scrollLeft < maximum - 4,
    });
  }, [ref]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    update();
    element.addEventListener("scroll", update, { passive: true });
    const observer =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(update);
    observer?.observe(element);

    // Global release listener: guarantees dragging stops the instant mouse is released anywhere
    const handleGlobalMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        if (element) {
          element.style.scrollBehavior = "";
          element.style.scrollSnapType = "";
        }
      }
    };

    window.addEventListener("mouseup", handleGlobalMouseUp);

    return () => {
      element.removeEventListener("scroll", update);
      observer?.disconnect();
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [ref, update]);

  const move = useCallback((direction: -1 | 1) => {
    const element = ref.current;
    if (!element) return;
    const scrollAmount = Math.max(300, element.clientWidth * 0.75);
    element.scrollBy({
      left: direction * scrollAmount,
      behavior: "smooth",
    });
  }, [ref]);

  // Mouse drag-to-scroll support
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Only drag on primary left-click
    if (e.button !== 0) return;
    const element = ref.current;
    if (!element) return;
    isDragging.current = true;
    hasMoved.current = false;
    startX.current = e.pageX - element.offsetLeft;
    scrollLeft.current = element.scrollLeft;
    element.style.scrollBehavior = "auto";
    element.style.scrollSnapType = "none";
  }, [ref]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    const element = ref.current;
    if (!element) return;
    e.preventDefault();
    const x = e.pageX - element.offsetLeft;
    const walk = (x - startX.current) * 1.3;
    if (Math.abs(walk) > 4) {
      hasMoved.current = true;
    }
    element.scrollLeft = scrollLeft.current - walk;
  }, [ref]);

  const handleMouseUp = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const element = ref.current;
    if (element) {
      element.style.scrollBehavior = "";
      element.style.scrollSnapType = "";
    }
  }, [ref]);

  // Prevent accidental clicks when dragging to scroll
  const handleClickCapture = useCallback((e: React.MouseEvent) => {
    if (hasMoved.current) {
      e.preventDefault();
      e.stopPropagation();
      hasMoved.current = false;
    }
  }, []);

  return {
    state,
    move,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleClickCapture,
  };
}

function VideoStoryCard({
  video,
  onOpen,
}: {
  video: VideoReview;
  onOpen: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const media = getPlayableVideoMedia(video);
  const isDirectVideo = media?.kind === "video";

  useEffect(() => {
    if (!isDirectVideo || !videoRef.current) return;
    if (isHovered) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay on hover fallback
        });
      }
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isHovered, isDirectVideo]);

  return (
    <button
      type="button"
      onClick={onOpen}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      className="group relative aspect-[3/4.2] w-[270px] min-w-[250px] shrink-0 snap-start overflow-hidden rounded-2xl border border-black/5 bg-[#0b2117] text-left shadow-[0_8px_24px_rgba(21,59,45,0.08)] transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1.5 hover:border-[var(--botanical)] hover:shadow-[0_18px_40px_rgba(21,59,45,0.18)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--forest)] max-[680px]:w-[78vw] max-[680px]:min-w-[240px] max-[680px]:max-w-[280px]"
      aria-label={`${isDirectVideo ? "Play" : "Open"} ${video.title} by ${video.creator}`}
    >
      <div className="relative size-full overflow-hidden">
        {/* Poster image */}
        <Image
          src={video.image}
          alt=""
          fill
          sizes="(max-width: 680px) 78vw, 270px"
          className={`object-cover object-center transition-all duration-500 ${isDirectVideo && isHovered
              ? "opacity-0 scale-105"
              : "opacity-100 group-hover:scale-105"
            }`}
        />

        {/* Video element for instant hover preview */}
        {isDirectVideo && (
          <video
            ref={videoRef}
            src={media.url}
            muted
            loop
            playsInline
            preload="metadata"
            className={`absolute inset-0 size-full object-cover transition-opacity duration-300 ${isHovered ? "opacity-100 scale-105" : "opacity-0"
              }`}
          />
        )}

        <span className="absolute inset-0 bg-gradient-to-t from-[#0b2117]/95 via-black/10 to-black/20 pointer-events-none" />

        {/* Play Icon Badge */}
        <span className="absolute inset-0 grid place-items-center pointer-events-none">
          <span
            className={`grid size-14 place-items-center rounded-full border shadow-xl backdrop-blur-md transition-all duration-300 ${isHovered
                ? "scale-110 bg-[var(--botanical)] text-[var(--forest-dark)] border-transparent"
                : "border-white/80 bg-white/25 text-white group-hover:scale-105"
              }`}
          >
            <span className="ml-1 text-xl" aria-hidden="true">
              ▶
            </span>
          </span>
        </span>

        {/* Story details */}
        <span className="absolute bottom-0 left-0 right-0 block p-4 text-white z-10 pointer-events-none">
          <span className="flex items-center justify-between gap-2 text-[0.68rem] font-bold uppercase tracking-[0.1em] text-[#dce8b6]">
            <span>{video.creator}</span>
            <span className="rounded-full bg-black/50 px-2.5 py-0.5 backdrop-blur-xs text-[0.64rem]">
              {video.duration}
            </span>
          </span>
          <strong className="mt-1.5 block [font-family:var(--font-display)] text-[1.12rem] font-normal leading-[1.25] line-clamp-2">
            {video.title}
          </strong>
          <span className="mt-2 block text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[var(--botanical)]">
            {video.productTag}
          </span>
        </span>
      </div>
    </button>
  );
}

function selectBestHomeReviews(
  reviews: readonly CustomerReview[],
  limit = 8,
): CustomerReview[] {
  // Prioritize 5-star ratings, verified badges, and diverse product reviews
  const sorted = [...reviews].sort((a, b) => {
    if (a.featuredOnHome && !b.featuredOnHome) return -1;
    if (!a.featuredOnHome && b.featuredOnHome) return 1;
    if (b.rating !== a.rating) return b.rating - a.rating;
    if (a.verified && !b.verified) return -1;
    if (!a.verified && b.verified) return 1;
    return 0;
  });

  return sorted.filter((r) => r.featuredOnHome !== false).slice(0, limit);
}

function selectBestHomeVideos(
  videos: readonly VideoReview[],
  limit = 6,
): VideoReview[] {
  const sorted = [...videos].sort((a, b) => {
    if (a.featuredOnHome && !b.featuredOnHome) return -1;
    if (!a.featuredOnHome && b.featuredOnHome) return 1;
    return 0;
  });

  return sorted.filter((v) => v.featuredOnHome !== false).slice(0, limit);
}

export function VideoReviewsSection() {
  const videoRef = useRef<HTMLDivElement>(null);
  const reviewRef = useRef<HTMLDivElement>(null);
  const videoCarousel = useCarousel(videoRef);
  const reviewCarousel = useCarousel(reviewRef);
  const [activeVideo, setActiveVideo] = useState<VideoReview | null>(null);
  const { content } = useStore();

  const videos = selectBestHomeVideos(content.videoReviews, 6);
  const reviews = selectBestHomeReviews(content.customerReviews, 8);
  const closeVideo = useCallback(() => setActiveVideo(null), []);

  if (videos.length === 0 && reviews.length === 0) return null;

  return (
    <section
      className="relative mx-auto w-full max-w-[1440px] px-[clamp(24px,5vw,72px)] py-[clamp(65px,8vw,110px)] max-[680px]:px-4 max-[680px]:py-12"
      id="community-rituals"
      aria-labelledby="community-reviews-title"
    >
      <div className="mx-auto mb-10 max-w-[720px] text-center max-[680px]:mb-7">
        <p className="mb-3 text-[0.74rem] font-bold uppercase tracking-[0.2em] text-[var(--botanical)] max-[680px]:mb-1.5 max-[680px]:text-[0.66rem]">
          A community in rhythm
        </p>
        <h2
          id="community-reviews-title"
          className="m-0 [font-family:var(--font-display)] text-[clamp(2.5rem,4.5vw,4.5rem)] font-normal leading-[0.98] tracking-[-0.04em] text-[var(--forest)] max-[680px]:text-[clamp(1.8rem,8vw,2.4rem)]"
        >
          Customer rituals, honestly shared.
        </h2>
        <p className="mx-auto mb-0 mt-4 max-w-[600px] text-[0.92rem] leading-[1.7] text-[var(--muted)] max-[680px]:mt-2 max-[680px]:text-[0.82rem]">
          Explore published video and written experiences, then open the exact botanical connected to each story.
        </p>
      </div>

      {/* Video stories horizontal carousel */}
      {videos.length > 0 && (
        <div className="mb-14 max-[680px]:mb-10">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="mb-1 text-[0.72rem] font-bold uppercase tracking-[0.16em] text-[var(--botanical)] max-[680px]:text-[0.66rem]">
                Explore their method
              </p>
              <h3 className="m-0 [font-family:var(--font-display)] text-[1.5rem] font-normal text-[var(--forest)]">
                Video stories
              </h3>
            </div>
            <CarouselControls
              name="video stories"
              controls="home-video-stories"
              canPrevious={videoCarousel.state.canPrevious}
              canNext={videoCarousel.state.canNext}
              onPrevious={() => videoCarousel.move(-1)}
              onNext={() => videoCarousel.move(1)}
            />
          </div>

          <div
            id="home-video-stories"
            ref={videoRef}
            onMouseDown={videoCarousel.handleMouseDown}
            onMouseMove={videoCarousel.handleMouseMove}
            onMouseUp={videoCarousel.handleMouseUp}
            onClickCapture={videoCarousel.handleClickCapture}
            className="flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 pt-1 select-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-[680px]:gap-3.5 cursor-grab active:cursor-grabbing"
            role="region"
            aria-label="Customer video stories carousel"
          >
            {videos.map((video) => (
              <VideoStoryCard
                key={video.id}
                video={video}
                onOpen={() => setActiveVideo(video)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Written reviews horizontal carousel */}
      {reviews.length > 0 && (
        <div>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="mb-1 text-[0.72rem] font-bold uppercase tracking-[0.16em] text-[var(--botanical)] max-[680px]:text-[0.66rem]">
                In their words
              </p>
              <h3 className="m-0 [font-family:var(--font-display)] text-[1.5rem] font-normal text-[var(--forest)]">
                Top customer reviews
              </h3>
            </div>
            <CarouselControls
              name="written reviews"
              controls="home-written-reviews"
              canPrevious={reviewCarousel.state.canPrevious}
              canNext={reviewCarousel.state.canNext}
              onPrevious={() => reviewCarousel.move(-1)}
              onNext={() => reviewCarousel.move(1)}
            />
          </div>

          <div
            id="home-written-reviews"
            ref={reviewRef}
            onMouseDown={reviewCarousel.handleMouseDown}
            onMouseMove={reviewCarousel.handleMouseMove}
            onMouseUp={reviewCarousel.handleMouseUp}
            onClickCapture={reviewCarousel.handleClickCapture}
            className="flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 pt-1 select-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden cursor-grab active:cursor-grabbing"
            role="region"
            aria-label="Written customer reviews carousel"
          >
            {reviews.map((review) => (
              <div
                key={review.id}
                className="w-[360px] min-w-[320px] shrink-0 snap-start transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(21,59,45,0.09)] max-[680px]:w-[84vw] max-[680px]:min-w-[260px]"
              >
                <ReviewCard review={review} showProductLink />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-10 flex justify-center">
        <Link
          href="/reviews"
          className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-[var(--forest)] px-8 py-3.5 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-white shadow-[0_8px_24px_rgba(21,59,45,0.18)] transition-[transform,background-color,box-shadow] hover:-translate-y-0.5 hover:bg-[var(--forest-dark)] hover:shadow-[0_12px_28px_rgba(21,59,45,0.24)]"
        >
          See all customer stories →
        </Link>
      </div>

      <VideoReviewModal video={activeVideo} onClose={closeVideo} />
    </section>
  );
}
