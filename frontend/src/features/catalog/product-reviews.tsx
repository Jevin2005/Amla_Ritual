"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Product } from "@/domain/catalog/products";
import { filterReviewsByProduct, getProductReviewSummary, type CustomerReview, type VideoReview } from "@/domain/reviews/custom-reviews";
import { ReviewCard } from "@/features/reviews/review-card";
import { ReviewPagination } from "@/features/reviews/review-pagination";
import { StarRating } from "@/features/reviews/star-rating";
import { VideoReviewModal } from "@/features/reviews/video-review-modal";
import { JudgemeReviewWidget } from "@/features/reviews/judgeme-review-widget";
import { WriteReviewModal } from "@/features/reviews/write-review-modal";
import { ProductReviewOverview } from "@/features/reviews/product-review-overview";
import { VideoStoryCard } from "@/features/reviews/video-story-card";
import { readWidgetReviewOverview } from "@/lib/judgeme/widget-summary";
import { isJudgemeConfigured } from "@/lib/judgeme/config";
import { scrollPageTo } from "@/shared/ui/page-scroll";

type RatingFilter = "all" | 1 | 2 | 3 | 4 | 5;
type MediaFilter = "all" | "photos" | "videos";
const REVIEW_PAGE_SIZE = 6;
const VIDEO_PAGE_SIZE = 4;

function focusReviewList(element: HTMLElement | null) {
  element?.focus({ preventScroll: true });
  scrollPageTo(element);
}

export function ProductReviewsSection({
  product, reviews, videoReviews, reviewWidgetHtml,
}: {
  product: Product;
  reviews: CustomerReview[];
  videoReviews: VideoReview[];
  reviewWidgetHtml?: string | null;
}) {
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>("all");
  const [mediaFilter, setMediaFilter] = useState<MediaFilter>("all");
  const [reviewPage, setReviewPage] = useState(1);
  const [videoPage, setVideoPage] = useState(1);
  const [activeVideo, setActiveVideo] = useState<VideoReview | null>(null);
  const [localReviews, setLocalReviews] = useState<CustomerReview[]>([]);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [buyerEmail, setBuyerEmail] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const reviewListRef = useRef<HTMLDivElement>(null);
  const videoListRef = useRef<HTMLDivElement>(null);
  const closeVideo = useCallback(() => setActiveVideo(null), []);
  const judgemeActive = isJudgemeConfigured();

  useEffect(() => {
    let saved: CustomerReview[] = [];
    try {
      const value = JSON.parse(localStorage.getItem(`naturemist_reviews_${product.slug}`) || "[]");
      if (Array.isArray(value)) saved = value;
    } catch {
      // Reviews remain available when browser storage is disabled.
    }
    const url = new URL(window.location.href);
    const shouldWriteReview = url.searchParams.get("write_review") === "true" || url.searchParams.get("review") === "true";
    queueMicrotask(() => {
      setLocalReviews(saved);
      setBuyerEmail(url.searchParams.get("email") || "");
      setReviewPage(1);
      setVideoPage(1);
      setRatingFilter("all");
      setMediaFilter("all");
      setIsWriteModalOpen(shouldWriteReview);
      if (shouldWriteReview) scrollPageTo(document.getElementById("customer-reviews"));
    });
  }, [product.slug]);

  const productReviews = useMemo(() => {
    const published = filterReviewsByProduct(reviews, product.slug);
    const publishedIds = new Set(published.map((review) => review.id));
    return [...filterReviewsByProduct(localReviews, product.slug).filter((review) => !publishedIds.has(review.id)), ...published];
  }, [product.slug, reviews, localReviews]);
  const productVideos = useMemo(() => filterReviewsByProduct(videoReviews, product.slug), [product.slug, videoReviews]);
  const summary = useMemo(() => getProductReviewSummary(productReviews, product.slug), [product.slug, productReviews]);
  const overview = useMemo(() => {
    if (judgemeActive) return readWidgetReviewOverview(reviewWidgetHtml);
    return {
      average: summary?.averageRating || 0,
      count: summary?.reviewCount || 0,
      distribution: Object.fromEntries([5, 4, 3, 2, 1].map((rating) => [rating, productReviews.filter((review) => review.rating === rating).length])),
    };
  }, [judgemeActive, reviewWidgetHtml, summary, productReviews]);
  const photoCount = productReviews.filter((review) => review.photos?.length).length;
  const videoCount = productReviews.filter((review) => review.video).length;
  const filteredReviews = productReviews.filter((review) =>
    (ratingFilter === "all" || review.rating === ratingFilter) &&
    (mediaFilter === "all" || (mediaFilter === "photos" ? review.photos?.length : review.video)),
  );
  const currentReviewPage = Math.min(reviewPage, Math.max(1, Math.ceil(filteredReviews.length / REVIEW_PAGE_SIZE)));
  const currentVideoPage = Math.min(videoPage, Math.max(1, Math.ceil(productVideos.length / VIDEO_PAGE_SIZE)));
  const visibleReviews = filteredReviews.slice((currentReviewPage - 1) * REVIEW_PAGE_SIZE, currentReviewPage * REVIEW_PAGE_SIZE);
  const visibleVideos = productVideos.slice((currentVideoPage - 1) * VIDEO_PAGE_SIZE, currentVideoPage * VIDEO_PAGE_SIZE);

  return (
    <section id="customer-reviews" className="mx-auto mt-12 w-full max-w-[1440px] scroll-mt-28 px-[clamp(16px,4.5vw,72px)] max-[680px]:mt-9" aria-labelledby="reviews-heading">
      <div className="border-t border-[var(--line)] pt-8 sm:pt-11">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
          <div className="min-w-0">
            <p className="mb-3 mt-0 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[var(--forest)]">Product-specific experiences</p>
            <h2 id="reviews-heading" className="m-0 [font-family:var(--font-display)] text-[clamp(1.7rem,3vw,2.65rem)] font-normal leading-[1.16] tracking-[-0.025em] text-[var(--forest)]">Reviews for {product.name}</h2>
          </div>
          <Link href="/reviews" className="inline-flex min-h-11 items-center gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.13em] text-[var(--forest)] underline-offset-4 hover:underline">Browse all reviews <span aria-hidden="true">&#8599;</span></Link>
        </div>
        <ProductReviewOverview overview={overview} />
        {toastMessage && (
          <div role="status" className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-[var(--line)] bg-[var(--paper)] px-4 py-2 text-sm text-[var(--forest)]">
            <span>{toastMessage}</span>
            <button type="button" onClick={() => setToastMessage("")} className="grid size-11 shrink-0 place-items-center rounded-lg focus-visible:outline-2" aria-label="Dismiss message">&times;</button>
          </div>
        )}
        {visibleVideos.length > 0 && (
          <div ref={videoListRef} id="product-video-list" role="region" tabIndex={-1} className="mt-9 scroll-mt-28 focus:outline-none sm:mt-10" aria-labelledby="video-review-heading">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div><p className="mb-2 mt-0 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-[var(--forest)]">Explore their ritual</p><h3 id="video-review-heading" className="m-0 [font-family:var(--font-display)] text-[clamp(1.5rem,2.5vw,2rem)] font-normal leading-tight tracking-[-0.025em] text-[var(--forest)]">Customer video stories</h3></div>
              <p className="m-0 text-[0.68rem] text-[var(--muted)]">Showing {(currentVideoPage - 1) * VIDEO_PAGE_SIZE + 1}&ndash;{Math.min(currentVideoPage * VIDEO_PAGE_SIZE, productVideos.length)} of {productVideos.length}</p>
            </div>
            <div className="grid grid-cols-1 items-start gap-4 min-[380px]:grid-cols-2 min-[760px]:grid-cols-3 min-[1100px]:grid-cols-4">
              {visibleVideos.map((video) => <VideoStoryCard key={video.id} video={video} onOpen={setActiveVideo} className={productVideos.length === 1 ? "max-w-[300px]" : ""} />)}
            </div>
            {productVideos.length > VIDEO_PAGE_SIZE && <ReviewPagination page={currentVideoPage} totalItems={productVideos.length} pageSize={VIDEO_PAGE_SIZE} label="Videos" controlsId="product-video-list" onPageChange={(page) => { setVideoPage(page); focusReviewList(videoListRef.current); }} />}
          </div>
        )}
        <div className="mt-9 sm:mt-11">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="m-0 [font-family:var(--font-display)] text-[clamp(1.5rem,2.5vw,2rem)] font-normal tracking-[-0.025em] text-[var(--forest)]">Written experiences</h3>
            <button type="button" onClick={() => setIsWriteModalOpen(true)} className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#c8d0be] bg-[#fffcf5] px-5 py-2 text-xs font-semibold text-[var(--forest)] transition-colors hover:bg-[#edf0e6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--forest)]">Write a review</button>
          </div>
        {judgemeActive ? (
          <JudgemeReviewWidget productId={product.id} productTitle={product.name} productHandle={product.shopifyHandle || product.slug} initialHtml={reviewWidgetHtml} className={overview ? "has-review-overview" : ""} />
        ) : (
          <div ref={reviewListRef} id="product-review-list" role="region" tabIndex={-1} className="mt-6 scroll-mt-28 focus:outline-none" aria-label="Product reviews">
            {summary && (
              <div className="mb-5 flex flex-wrap items-center justify-between gap-4 border-y border-[var(--line)] py-4">
                <StarRating average={summary.averageRating} count={summary.reviewCount} />
                <label className="flex items-center gap-2 text-xs text-[var(--muted)]">
                  Rating
                  <select value={ratingFilter} onChange={(event) => { setRatingFilter(event.target.value === "all" ? "all" : Number(event.target.value) as RatingFilter); setReviewPage(1); }} className="min-h-11 rounded-lg border border-[var(--line)] bg-[var(--paper)] px-3 text-sm text-[var(--forest)] focus-visible:outline-2 focus-visible:outline-[var(--forest)]">
                    <option value="all">All ratings</option>
                    {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} star{rating === 1 ? "" : "s"}</option>)}
                  </select>
                </label>
              </div>
            )}
            {(photoCount > 0 || videoCount > 0) && (
              <div className="mb-4 flex flex-wrap gap-2" aria-label="Review media filters">
                {([
                  { value: "all", label: "All reviews", count: productReviews.length },
                  { value: "photos", label: "With photos", count: photoCount },
                  { value: "videos", label: "With videos", count: videoCount },
                ] as const).filter((filter) => filter.count > 0).map((filter) => (
                  <button key={filter.value} type="button" aria-pressed={mediaFilter === filter.value} onClick={() => { setMediaFilter(filter.value); setReviewPage(1); }} className={`min-h-11 rounded-full border px-4 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--forest)] ${mediaFilter === filter.value ? "border-[var(--forest)] bg-[var(--forest)] text-white" : "border-[var(--line)] text-[var(--forest)] hover:bg-[var(--surface-warm)]"}`}>
                    {filter.label} ({filter.count})
                  </button>
                ))}
              </div>
            )}
            {visibleReviews.length > 0 ? (
              <div className="grid grid-cols-1 items-start gap-4 min-[700px]:grid-cols-2">
                {visibleReviews.map((review) => <ReviewCard key={review.id} review={review} />)}
              </div>
            ) : (
              <div className="rounded-xl border border-[var(--line)] bg-[var(--paper)] p-6 text-center">
                <h3 className="m-0 text-base font-semibold text-[var(--forest)]">{productReviews.length ? "No reviews match these filters" : "Be the first to share your experience"}</h3>
                <p className="mb-0 mt-2 text-sm leading-relaxed text-[var(--muted)]">{productReviews.length ? "Try another rating or media type." : `How was your ritual with ${product.name}?`}</p>
                {productReviews.length > 0 && <button type="button" onClick={() => { setMediaFilter("all"); setRatingFilter("all"); setReviewPage(1); }} className="mt-3 min-h-11 text-sm font-semibold text-[var(--forest)] underline underline-offset-4">Clear filters</button>}
              </div>
            )}
            <ReviewPagination page={currentReviewPage} totalItems={filteredReviews.length} pageSize={REVIEW_PAGE_SIZE} controlsId="product-review-list" onPageChange={(page) => { setReviewPage(page); focusReviewList(reviewListRef.current); }} />
          </div>
        )}
        </div>
      </div>
      <VideoReviewModal video={activeVideo} onClose={closeVideo} />
      {isWriteModalOpen && <WriteReviewModal product={product} isOpen={isWriteModalOpen} onClose={() => setIsWriteModalOpen(false)} defaultEmail={buyerEmail} onSubmitSuccess={(newReview) => {
        setLocalReviews((previous) => [newReview, ...previous]);
        setReviewPage(1);
        setRatingFilter("all");
        setMediaFilter("all");
        setToastMessage(`Thank you for sharing your experience, ${newReview.author}.`);
      }} />}
    </section>
  );
}
