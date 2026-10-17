"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  reviewTags,
  type CustomerReview,
  type ReviewTag,
  type VideoReview,
} from "@/domain/reviews/custom-reviews";
import { JudgemeAllReviewsWidget } from "@/features/reviews/judgeme-all-reviews-widget";
import { ReviewCard } from "@/features/reviews/review-card";
import { ReviewPagination } from "@/features/reviews/review-pagination";
import { VideoReviewModal } from "@/features/reviews/video-review-modal";
import { VideoStoryCard } from "@/features/reviews/video-story-card";
import { useStore } from "@/features/store/store-provider";
import { isJudgemeConfigured } from "@/lib/judgeme/config";
import type { JudgemeAllReviewsPage } from "@/lib/judgeme/all-reviews";
import { scrollPageTo } from "@/shared/ui/page-scroll";

const REVIEW_PAGE_SIZE = 6;
const VIDEO_PAGE_SIZE = 8;
const sectionClass =
  "mx-auto w-full max-w-[1240px] px-[clamp(20px,4vw,56px)]";
const eyebrowClass =
  "mb-3 mt-0 text-[0.65rem] font-semibold uppercase tracking-[0.19em] text-[var(--botanical)]";
const headingClass =
  "m-0 [font-family:var(--font-display)] text-[clamp(1.85rem,3.3vw,2.8rem)] font-normal leading-[1.12] tracking-[-0.035em] text-[var(--forest)]";

type ReviewFilter = "All" | ReviewTag;
type ReviewsPageProps = {
  initialReviews?: CustomerReview[];
  initialJudgemeReviews?: JudgemeAllReviewsPage | null;
};

function focusReviewSection(section: HTMLElement | null) {
  if (!section) return;
  section.focus({ preventScroll: true });
  scrollPageTo(section);
}

export function ReviewsPage({ initialReviews = [], initialJudgemeReviews = null }: ReviewsPageProps) {
  const { content } = useStore();
  const usesJudgeme = isJudgemeConfigured();
  const [activeFilter, setActiveFilter] = useState<ReviewFilter>("All");
  const [activeVideo, setActiveVideo] = useState<VideoReview | null>(null);
  const [reviewPage, setReviewPage] = useState(1);
  const [videoPage, setVideoPage] = useState(1);
  const [localAllReviews, setLocalAllReviews] = useState<CustomerReview[]>([]);
  const reviewSectionRef = useRef<HTMLElement>(null);
  const videoSectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (usesJudgeme) return;
    try {
      const saved = JSON.parse(localStorage.getItem("naturemist_all_reviews") || "[]");
      if (Array.isArray(saved) && saved.length > 0) {
        queueMicrotask(() => setLocalAllReviews(saved));
      }
    } catch {
      // Reviews from the store remain available when local storage is unavailable.
    }
  }, [usesJudgeme]);

  const reviews = useMemo(() => {
    const baseReviews = initialReviews.length > 0 ? initialReviews : content.customerReviews;
    const existingIds = new Set(baseReviews.map((review) => review.id));
    const uniqueLocal = localAllReviews.filter((review) => !existingIds.has(review.id));
    return [...uniqueLocal, ...baseReviews];
  }, [content.customerReviews, localAllReviews, initialReviews]);

  // Attached review videos remain in their review cards or Judge.me.
  const videos = content.videoReviews;
  const availableTags = useMemo(
    () => reviewTags.filter((tag) => reviews.some((review) => review.tag === tag)),
    [reviews],
  );
  const filteredReviews = useMemo(
    () => activeFilter === "All"
      ? reviews
      : reviews.filter((review) => review.tag === activeFilter),
    [activeFilter, reviews],
  );
  const reviewPageCount = Math.max(1, Math.ceil(filteredReviews.length / REVIEW_PAGE_SIZE));
  const videoPageCount = Math.max(1, Math.ceil(videos.length / VIDEO_PAGE_SIZE));
  const currentReviewPage = Math.min(reviewPage, reviewPageCount);
  const currentVideoPage = Math.min(videoPage, videoPageCount);
  const visibleReviews = filteredReviews.slice(
    (currentReviewPage - 1) * REVIEW_PAGE_SIZE,
    currentReviewPage * REVIEW_PAGE_SIZE,
  );
  const visibleVideos = videos.slice(
    (currentVideoPage - 1) * VIDEO_PAGE_SIZE,
    currentVideoPage * VIDEO_PAGE_SIZE,
  );
  const writtenReviewCount = usesJudgeme
    ? initialJudgemeReviews?.productReviewCount
    : reviews.length;
  const closeVideo = useCallback(() => setActiveVideo(null), []);
  const hasStories = reviews.length > 0 || videos.length > 0;

  return (
    <main id="main-content" className="overflow-x-clip bg-[#f8f6ef] pb-12 sm:pb-16">
      <header className={`${sectionClass} pb-[clamp(36px,5vw,60px)] pt-[clamp(44px,7vw,84px)] text-center`}>
        <div className="mx-auto max-w-[850px]">
          <p className={eyebrowClass}>Community reflections &amp; results</p>
          <h1 className="m-0 [font-family:var(--font-display)] text-[clamp(2.65rem,5.6vw,4.8rem)] font-normal leading-[1.02] tracking-[-0.045em] text-[var(--forest)]">
            Real experiences.<br />Product by product.
          </h1>
          <p className="mx-auto mb-0 mt-5 max-w-[540px] text-[0.9rem] leading-[1.8] text-[var(--muted)]">
            Explore written reviews, customer photos and video stories from everyday botanical routines.
          </p>
          {(writtenReviewCount !== undefined || videos.length > 0) && (
            <dl className="mx-auto mb-0 mt-7 flex w-fit min-w-[min(100%,300px)] max-w-full items-center justify-center divide-x divide-[#dcded1] rounded-2xl border border-[#dcded1] bg-[#fffdf7] px-3 py-5 shadow-[0_5px_22px_rgba(21,59,45,0.025)] sm:mt-8 sm:px-5">
              {writtenReviewCount !== undefined && (
                <div className="flex flex-1 flex-col-reverse gap-2 px-5 sm:px-8">
                  <dt className="text-[0.59rem] font-semibold uppercase tracking-[0.12em] text-[#727967]">Written reviews</dt>
                  <dd className="m-0 [font-family:var(--font-display)] text-[2rem] leading-none text-[var(--forest)]">{writtenReviewCount.toLocaleString("en-IN")}</dd>
                </div>
              )}
              <div className="flex flex-1 flex-col-reverse gap-2 px-5 sm:px-8">
                <dt className="text-[0.59rem] font-semibold uppercase tracking-[0.12em] text-[#727967]">Video stories</dt>
                <dd className="m-0 [font-family:var(--font-display)] text-[2rem] leading-none text-[var(--forest)]">{videos.length.toLocaleString("en-IN")}</dd>
              </div>
            </dl>
          )}
        </div>
      </header>

      {videos.length > 0 && (
        <section
          ref={videoSectionRef}
          id="customer-video-list"
          tabIndex={-1}
          className={`${sectionClass} scroll-mt-28 pb-[clamp(44px,6vw,76px)] outline-none`}
          aria-labelledby="video-stories-title"
        >
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className={eyebrowClass}>Explore the ritual</p>
              <h2 id="video-stories-title" className={headingClass}>Customer video stories</h2>
            </div>
            <p className="m-0 text-[0.72rem] text-[var(--muted)]">Videos play muted</p>
          </div>
          <div id="customer-video-cards" className="grid grid-cols-1 items-start gap-3 min-[380px]:grid-cols-2 sm:gap-5 lg:grid-cols-4">
            {visibleVideos.map((video) => (
              <VideoStoryCard key={video.id} video={video} onOpen={setActiveVideo} />
            ))}
          </div>
          <ReviewPagination
            page={currentVideoPage}
            totalItems={videos.length}
            pageSize={VIDEO_PAGE_SIZE}
            label="Video stories"
            controlsId="customer-video-cards"
            onPageChange={(page) => {
              setVideoPage(Math.min(videoPageCount, Math.max(1, page)));
              focusReviewSection(videoSectionRef.current);
            }}
          />
        </section>
      )}

      {(usesJudgeme || reviews.length > 0) && (
        <section
          ref={reviewSectionRef}
          id="customer-review-list"
          tabIndex={-1}
          className={`${sectionClass} scroll-mt-28 pb-[clamp(44px,6vw,76px)] outline-none`}
          aria-labelledby="written-reviews-title"
        >
          <div className="mb-7 text-center sm:mb-8">
            <p className={eyebrowClass}>Published experiences</p>
            <h2 id="written-reviews-title" className={headingClass}>Written customer reviews</h2>
          </div>

          {usesJudgeme ? (
            <JudgemeAllReviewsWidget initialPage={initialJudgemeReviews} />
          ) : (
            <>
              {availableTags.length > 0 && (
                <div className="mb-7 flex flex-wrap justify-center gap-2" role="group" aria-label="Filter reviews by concern">
                  {(["All", ...availableTags] as ReviewFilter[]).map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setActiveFilter(tag);
                        setReviewPage(1);
                      }}
                      className={`min-h-11 rounded-full border px-4 py-2 text-[0.72rem] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--forest)] ${activeFilter === tag ? "border-[var(--forest)] bg-[var(--forest)] text-[var(--paper)]" : "border-[#deded1] bg-[#fffdf7] text-[var(--muted)] hover:border-[var(--forest)] hover:text-[var(--forest)]"}`}
                      aria-pressed={activeFilter === tag}
                      aria-controls="customer-review-cards"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}
              <div id="customer-review-cards" className="grid grid-cols-1 items-start gap-5 md:grid-cols-2">
                {visibleReviews.map((review) => (
                  <ReviewCard key={review.id} review={review} showProductLink />
                ))}
              </div>
              {filteredReviews.length > 0 ? (
                <ReviewPagination
                  page={currentReviewPage}
                  totalItems={filteredReviews.length}
                  pageSize={REVIEW_PAGE_SIZE}
                  label="Customer reviews"
                  controlsId="customer-review-cards"
                  onPageChange={(page) => {
                    setReviewPage(Math.min(reviewPageCount, Math.max(1, page)));
                    focusReviewSection(reviewSectionRef.current);
                  }}
                />
              ) : (
                <p role="status" className="rounded-2xl border border-[var(--line)] bg-[var(--paper)] px-5 py-8 text-center text-sm text-[var(--muted)]">
                  No reviews are published in this category yet.
                </p>
              )}
            </>
          )}
        </section>
      )}

      {!hasStories && !usesJudgeme && (
        <section className={`${sectionClass} py-10`} aria-labelledby="empty-reviews-title">
          <div className="border-y border-[var(--line)] py-10 text-center">
            <h2 id="empty-reviews-title" className={headingClass}>Customer stories are on their way</h2>
            <p className="mx-auto mb-0 mt-3 max-w-[480px] text-[0.9rem] leading-relaxed text-[var(--muted)]">
              Published customer reviews, photos and videos will appear here.
            </p>
          </div>
        </section>
      )}

      <section className={sectionClass} aria-labelledby="reviews-collection-title">
        <div className="rounded-[24px] border border-[#dddfd1] bg-[#f1efe5] px-5 py-9 text-center sm:px-10 sm:py-11">
          <p className={eyebrowClass}>Find your botanical</p>
          <h2 id="reviews-collection-title" className={`${headingClass} mx-auto max-w-[660px]`}>Explore the product behind each story.</h2>
          <Link
            href="/shop"
            className="mt-6 inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[var(--forest)] px-7 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[var(--paper)] transition-colors hover:bg-[var(--forest-dark)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--forest)]"
          >
            Explore the collection
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </section>

      <VideoReviewModal video={activeVideo} onClose={closeVideo} />
    </main>
  );
}
