"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import {
  getPlayableVideoMedia,
  normalizeProductSlug,
  reviewTags,
  type ReviewTag,
  type VideoReview,
} from "@/domain/reviews/custom-reviews";
import { ReviewCard } from "@/features/reviews/review-card";
import { StarRating } from "@/features/reviews/star-rating";
import { VideoReviewModal } from "@/features/reviews/video-review-modal";
import { useStore } from "@/features/store/store-provider";

const eyebrowClass =
  "mb-4 text-[0.72rem] leading-[1.3] font-bold tracking-[0.2em] text-[var(--botanical)] uppercase";
const buttonClass =
  "inline-flex min-h-[52px] items-center justify-center gap-[14px] rounded-full border border-transparent bg-[var(--forest)] px-8 py-[14px] text-[0.74rem] leading-none font-bold tracking-[0.14em] text-[var(--paper)] uppercase shadow-[0_10px_26px_rgba(21,59,45,0.18)] transition-[transform,background-color,box-shadow] duration-[350ms] ease-[var(--ease)] hover:-translate-y-0.5 hover:bg-[var(--forest-dark)] hover:shadow-[0_14px_30px_rgba(21,59,45,0.22)]";

type ReviewFilter = "All" | ReviewTag;
const REVIEW_PAGE_SIZE = 8;
const VIDEO_PAGE_SIZE = 8;

export function ReviewsPage() {
  const { content } = useStore();
  const [activeFilter, setActiveFilter] = useState<ReviewFilter>("All");
  const [activeVideo, setActiveVideo] = useState<VideoReview | null>(null);
  const [visibleReviewCount, setVisibleReviewCount] = useState(REVIEW_PAGE_SIZE);
  const [visibleVideoCount, setVisibleVideoCount] = useState(VIDEO_PAGE_SIZE);

  const reviews = content.customerReviews;
  const videos = content.videoReviews;
  const availableTags = useMemo(
    () => reviewTags.filter((tag) => reviews.some((review) => review.tag === tag)),
    [reviews],
  );
  const filteredReviews = useMemo(
    () =>
      activeFilter === "All"
        ? reviews
        : reviews.filter((review) => review.tag === activeFilter),
    [activeFilter, reviews],
  );
  const visibleReviews = filteredReviews.slice(0, visibleReviewCount);
  const visibleVideos = videos.slice(0, visibleVideoCount);
  const average = useMemo(
    () =>
      reviews.length
        ? reviews.reduce((total, review) => total + review.rating, 0) /
          reviews.length
        : 0,
    [reviews],
  );
  const productCount = useMemo(
    () =>
      new Set(
        [...reviews, ...videos]
          .map((item) => normalizeProductSlug(item.productSlug))
          .filter(Boolean),
      ).size,
    [reviews, videos],
  );
  const closeVideo = useCallback(() => setActiveVideo(null), []);
  const hasStories = reviews.length > 0 || videos.length > 0;

  return (
    <main className="overflow-x-clip" id="main-content">
      <section className="relative isolate overflow-hidden bg-[radial-gradient(circle_at_50%_0%,rgba(183,212,90,0.15),transparent_40%),linear-gradient(180deg,#faf7f0,#f4efe4_70%,#f8f5ed)] px-[clamp(24px,5vw,72px)] pb-[clamp(50px,6vw,90px)] pt-[clamp(65px,8vw,110px)] text-center">
        <div className="mx-auto max-w-[840px]">
          <p className={eyebrowClass}>Community Reflections & Results</p>
          <h1 className="m-0 [font-family:var(--font-display)] text-[clamp(2.8rem,5.5vw,5.5rem)] font-normal leading-[0.95] tracking-[-0.045em] text-[var(--forest)] text-balance">
            Real experiences. Product by product.
          </h1>
          <p className="mx-auto mt-6 max-w-[600px] text-[1.02rem] leading-[1.75] text-[var(--muted)]">
            Explore published written reviews and customer video stories. Every item is connected to the exact botanical it describes.
          </p>

          {hasStories && (
            <div className="mx-auto mt-10 grid max-w-[760px] grid-cols-3 gap-4 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--paper)] p-6 shadow-[0_12px_32px_rgba(21,59,45,0.06)] max-[600px]:grid-cols-1 max-[600px]:gap-5">
              <div className="flex flex-col items-center justify-center">
                {reviews.length > 0 ? (
                  <StarRating
                    average={average}
                    count={reviews.length}
                    size="large"
                  />
                ) : (
                  <span className="[font-family:var(--font-display)] text-[2rem] text-[var(--forest)]">—</span>
                )}
                <p className="mb-0 mt-2 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
                  Written rating
                </p>
              </div>
              <div className="border-x border-[var(--line)] max-[600px]:border-x-0 max-[600px]:border-y max-[600px]:py-4">
                <p className="m-0 [font-family:var(--font-display)] text-[2.35rem] font-normal leading-none text-[var(--forest)]">
                  {videos.length}
                </p>
                <p className="mb-0 mt-2 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
                  Video {videos.length === 1 ? "story" : "stories"}
                </p>
              </div>
              <div>
                <p className="m-0 [font-family:var(--font-display)] text-[2.35rem] font-normal leading-none text-[var(--forest)]">
                  {productCount}
                </p>
                <p className="mb-0 mt-2 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
                  {productCount === 1 ? "Botanical" : "Botanicals"} reviewed
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {!hasStories ? (
        <section className="mx-auto w-full max-w-[920px] px-[clamp(24px,5vw,64px)] py-[clamp(70px,9vw,120px)] text-center" aria-labelledby="empty-reviews-title">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-[var(--sand)] text-2xl text-[var(--botanical)]" aria-hidden="true">
            &#9734;
          </span>
          <h2 id="empty-reviews-title" className="mb-0 mt-5 [font-family:var(--font-display)] text-[clamp(1.8rem,4vw,2.7rem)] font-normal text-[var(--forest)]">
            Customer stories are being prepared
          </h2>
          <p className="mx-auto mb-0 mt-3 max-w-[560px] text-[0.9rem] leading-[1.75] text-[var(--muted)]">
            This page will populate automatically when approved written or video reviews are published.
          </p>
          <Link href="/shop" className={`${buttonClass} mt-8`}>
            Explore the collection
          </Link>
        </section>
      ) : (
        <>
          {videos.length > 0 && (
            <section className="mx-auto w-full max-w-[1280px] px-[clamp(24px,5vw,64px)] pt-[clamp(60px,7vw,96px)]" aria-labelledby="video-stories-title">
              <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className={`${eyebrowClass} mb-2`}>Explore the ritual</p>
                  <h2 id="video-stories-title" className="m-0 [font-family:var(--font-display)] text-[clamp(2rem,4vw,3.2rem)] font-normal text-[var(--forest)]">
                    Customer video stories
                  </h2>
                </div>
                <span
                  className="text-[0.74rem] text-[var(--muted)]"
                  role="status"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  Showing {visibleVideos.length} of {videos.length} · Select a story to open
                </span>
              </div>
              <div className="grid grid-cols-4 gap-5 max-[1000px]:grid-cols-3 max-[760px]:flex max-[760px]:snap-x max-[760px]:snap-mandatory max-[760px]:overflow-x-auto max-[760px]:pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {visibleVideos.map((video) => (
                  <button
                    key={video.id}
                    type="button"
                    onClick={() => setActiveVideo(video)}
                    className="group overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--paper)] text-left shadow-[0_10px_30px_rgba(21,59,45,0.06)] transition-[transform,border-color] hover:-translate-y-1 hover:border-[var(--botanical)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--forest)] max-[760px]:w-[72vw] max-[760px]:max-w-[290px] max-[760px]:shrink-0 max-[760px]:snap-start"
                    aria-label={`${getPlayableVideoMedia(video) ? "Play" : "Open"} ${video.title} by ${video.creator}`}
                  >
                    <span className="relative block aspect-[4/5] overflow-hidden bg-[var(--sand)]">
                      <Image
                        src={video.image}
                        alt=""
                        fill
                        sizes="(max-width: 760px) 72vw, (max-width: 1000px) 33vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                      <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10" />
                      <span className="absolute inset-0 grid place-items-center">
                        <span className="grid size-14 place-items-center rounded-full border border-white/75 bg-white/25 text-white shadow-xl backdrop-blur-md transition-transform group-hover:scale-105">
                          <span className={getPlayableVideoMedia(video) ? "ml-1 text-xl" : "text-2xl"} aria-hidden="true">
                            {getPlayableVideoMedia(video) ? "▶" : "“"}
                          </span>
                        </span>
                      </span>
                      <span className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3 text-white">
                        <strong className="text-[0.74rem] uppercase tracking-[0.08em]">{video.creator}</strong>
                        <span className="text-[0.66rem] text-white/90">{video.duration}</span>
                      </span>
                    </span>
                    <span className="block p-4">
                      <strong className="block text-[0.88rem] leading-[1.35] text-[var(--forest)]">{video.title}</strong>
                      <span className="mt-2 block line-clamp-2 text-[0.78rem] leading-[1.55] text-[var(--muted)]">{video.testimonial}</span>
                      <span className="mt-3 block text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[var(--botanical)]">{video.productTag}</span>
                    </span>
                  </button>
                ))}
              </div>
              {visibleVideos.length < videos.length && (
                <div className="mt-7 flex justify-center">
                  <button
                    type="button"
                    onClick={() =>
                      setVisibleVideoCount((count) => count + VIDEO_PAGE_SIZE)
                    }
                    className="inline-flex min-h-12 items-center rounded-full border border-[var(--forest)] px-7 py-3 text-[0.74rem] font-bold uppercase tracking-[0.12em] text-[var(--forest)] transition-colors hover:bg-[var(--forest)] hover:text-white"
                  >
                    Load more video stories
                  </button>
                </div>
              )}
            </section>
          )}

          {reviews.length > 0 && (
            <section className="mx-auto w-full max-w-[1280px] px-[clamp(24px,5vw,64px)] py-[clamp(60px,7vw,100px)]" aria-labelledby="written-reviews-title">
              <div className="mb-9 text-center">
                <p className={`${eyebrowClass} mb-2`}>Published experiences</p>
                <h2 id="written-reviews-title" className="m-0 [font-family:var(--font-display)] text-[clamp(2rem,4vw,3.2rem)] font-normal text-[var(--forest)]">
                  Written customer reviews
                </h2>
              </div>

              {availableTags.length > 0 && (
                <div className="mb-10 flex flex-wrap items-center justify-center gap-2.5" aria-label="Filter reviews by concern">
                  {(["All", ...availableTags] as ReviewFilter[]).map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setActiveFilter(tag);
                        setVisibleReviewCount(REVIEW_PAGE_SIZE);
                      }}
                      className={`rounded-full px-5 py-2.5 text-[0.74rem] font-bold uppercase tracking-[0.1em] transition-[background-color,color,transform] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--forest)] ${
                        activeFilter === tag
                          ? "bg-[var(--forest)] text-[var(--paper)] shadow-[0_6px_18px_rgba(21,59,45,0.15)]"
                          : "border border-[var(--line)] bg-[var(--paper)] text-[var(--muted)] hover:border-[var(--forest)] hover:text-[var(--forest)]"
                      }`}
                      aria-pressed={activeFilter === tag}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}

              <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
                Showing {visibleReviews.length} of {filteredReviews.length} matching written reviews
                {activeFilter === "All" ? "." : ` for ${activeFilter}.`}
              </p>

              <div className="grid grid-cols-2 gap-6 max-[850px]:grid-cols-1">
                {visibleReviews.map((review) => (
                  <ReviewCard key={review.id} review={review} showProductLink />
                ))}
              </div>

              {visibleReviews.length < filteredReviews.length && (
                <div className="mt-8 flex justify-center">
                  <button
                    type="button"
                    onClick={() =>
                      setVisibleReviewCount((count) => count + REVIEW_PAGE_SIZE)
                    }
                    className="inline-flex min-h-12 items-center rounded-full border border-[var(--forest)] px-7 py-3 text-[0.74rem] font-bold uppercase tracking-[0.12em] text-[var(--forest)] transition-colors hover:bg-[var(--forest)] hover:text-white"
                  >
                    Load more written reviews
                  </button>
                </div>
              )}

              {filteredReviews.length === 0 && (
                <div className="rounded-2xl border border-dashed border-[var(--line-strong)] bg-[var(--paper)] p-8 text-center text-[0.86rem] text-[var(--muted)]">
                  No reviews are published in this category yet.
                </div>
              )}
            </section>
          )}

          <section className="mx-auto mb-[clamp(60px,8vw,100px)] w-full max-w-[1280px] px-[clamp(24px,5vw,64px)]">
            <div className="rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--sand)]/50 p-[clamp(32px,5vw,56px)] text-center">
              <p className={eyebrowClass}>Find Your Botanical</p>
              <h2 className="m-0 [font-family:var(--font-display)] text-[clamp(2rem,4vw,3.2rem)] font-normal text-[var(--forest)]">
                Explore the product behind each story.
              </h2>
              <div className="mt-8 flex justify-center">
                <Link href="/shop" className={buttonClass}>
                  Explore the collection
                </Link>
              </div>
            </div>
          </section>
        </>
      )}

      <VideoReviewModal video={activeVideo} onClose={closeVideo} />
    </main>
  );
}
