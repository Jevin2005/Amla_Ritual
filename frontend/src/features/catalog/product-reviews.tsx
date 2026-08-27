"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Product } from "@/domain/catalog/products";
import {
  filterReviewsByProduct,
  getPlayableVideoMedia,
  getProductReviewSummary,
  type CustomerReview,
  type VideoReview,
} from "@/domain/reviews/custom-reviews";
import { ReviewCard } from "@/features/reviews/review-card";
import { StarRating } from "@/features/reviews/star-rating";
import { VideoReviewModal } from "@/features/reviews/video-review-modal";

type RatingFilter = "all" | 1 | 2 | 3 | 4 | 5;
const PRODUCT_REVIEW_PAGE_SIZE = 6;
const PRODUCT_VIDEO_PAGE_SIZE = 4;

export function ProductReviewsSection({
  product,
  reviews,
  videoReviews,
}: {
  product: Product;
  reviews: CustomerReview[];
  videoReviews: VideoReview[];
}) {
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>("all");
  const [activeVideo, setActiveVideo] = useState<VideoReview | null>(null);
  const [visibleReviewCount, setVisibleReviewCount] = useState(
    PRODUCT_REVIEW_PAGE_SIZE,
  );
  const [visibleVideoCount, setVisibleVideoCount] = useState(
    PRODUCT_VIDEO_PAGE_SIZE,
  );

  const productReviews = useMemo(
    () => filterReviewsByProduct(reviews, product.slug),
    [product.slug, reviews],
  );
  const productVideos = useMemo(
    () => filterReviewsByProduct(videoReviews, product.slug),
    [product.slug, videoReviews],
  );
  const summary = useMemo(
    () => getProductReviewSummary(productReviews, product.slug),
    [product.slug, productReviews],
  );
  const distribution = useMemo(
    () =>
      ([5, 4, 3, 2, 1] as const).map((rating) => {
        const count = productReviews.filter(
          (review) => review.rating === rating,
        ).length;
        return {
          rating,
          count,
          percentage: productReviews.length
            ? Math.round((count / productReviews.length) * 100)
            : 0,
        };
      }),
    [productReviews],
  );
  const filteredReviews =
    ratingFilter === "all"
      ? productReviews
      : productReviews.filter((review) => review.rating === ratingFilter);
  const visibleReviews = filteredReviews.slice(0, visibleReviewCount);
  const visibleVideos = productVideos.slice(0, visibleVideoCount);
  const hasPublishedStories = productReviews.length > 0 || productVideos.length > 0;

  return (
    <section
      id="customer-reviews"
      className="mx-auto mt-14 w-full max-w-[1440px] scroll-mt-24 px-[clamp(20px,4.5vw,72px)] max-[680px]:mt-10 max-[680px]:px-3"
      aria-labelledby="reviews-heading"
    >
      <div className="border-t border-[var(--line)] pt-10 max-[680px]:pt-7">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-1 text-[0.62rem] font-bold uppercase tracking-[0.2em] text-[var(--botanical)]">
              Product-specific experiences
            </p>
            <h2
              id="reviews-heading"
              className="m-0 [font-family:var(--font-display)] text-[clamp(1.75rem,3.2vw,2.7rem)] font-normal leading-tight text-[var(--forest)]"
            >
              Reviews for {product.name}
            </h2>
          </div>
          <Link
            href="/reviews"
            className="text-[0.64rem] font-bold uppercase tracking-[0.1em] text-[var(--botanical)] underline decoration-transparent underline-offset-4 transition-colors hover:text-[var(--forest)] hover:decoration-current"
          >
            Browse all reviews
          </Link>
        </div>

        {!hasPublishedStories ? (
          <div className="mt-6 rounded-3xl border border-[var(--line)] bg-[linear-gradient(135deg,var(--paper),var(--sand))] px-6 py-10 text-center max-[680px]:rounded-2xl max-[680px]:px-4 max-[680px]:py-8">
            <span
              className="mx-auto grid size-11 place-items-center rounded-full bg-white text-lg text-[var(--botanical)] shadow-sm"
              aria-hidden="true"
            >
              &#9734;
            </span>
            <h3 className="mb-0 mt-3 [font-family:var(--font-display)] text-[1.3rem] font-normal text-[var(--forest)]">
              No published reviews yet
            </h3>
            <p className="mx-auto mb-0 mt-2 max-w-[520px] text-[0.76rem] leading-[1.65] text-[var(--muted)]">
              Customer experiences for this botanical will appear here after they are reviewed and published.
            </p>
          </div>
        ) : (
          <>
            {summary && (
              <div className="mt-7 grid grid-cols-[minmax(220px,0.75fr)_minmax(300px,1.25fr)] gap-8 rounded-3xl border border-[var(--line)] bg-[var(--paper)] p-6 shadow-[0_10px_32px_rgba(21,59,45,0.05)] max-[820px]:grid-cols-1 max-[820px]:gap-5 max-[680px]:rounded-2xl max-[680px]:p-4">
                <div className="flex flex-col justify-center border-r border-[var(--line)] pr-8 max-[820px]:border-b max-[820px]:border-r-0 max-[820px]:pb-5 max-[820px]:pr-0">
                  <span className="[font-family:var(--font-display)] text-[3.4rem] leading-none text-[var(--forest)]">
                    {summary.averageRating.toFixed(1)}
                  </span>
                  <StarRating
                    average={summary.averageRating}
                    count={summary.reviewCount}
                    size="default"
                    className="mt-2"
                  />
                  <p className="mb-0 mt-2 text-[0.68rem] leading-[1.5] text-[var(--muted)]">
                    Calculated from published written reviews for this product only.
                  </p>
                </div>

                <div className="flex flex-col justify-center gap-1.5">
                  <span className="mb-1 text-[0.58rem] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
                    Rating breakdown
                  </span>
                  {distribution.map((row) => (
                    <button
                      key={row.rating}
                      type="button"
                      onClick={() => {
                        setRatingFilter((current) =>
                          current === row.rating ? "all" : row.rating,
                        );
                        setVisibleReviewCount(PRODUCT_REVIEW_PAGE_SIZE);
                      }}
                      className={`grid grid-cols-[48px_1fr_42px] items-center gap-3 rounded-lg px-2 py-1.5 text-left text-[0.68rem] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--forest)] ${
                        ratingFilter === row.rating
                          ? "bg-[var(--sand)] font-bold text-[var(--forest)]"
                          : "text-[var(--muted)] hover:bg-black/[0.035]"
                      }`}
                      aria-pressed={ratingFilter === row.rating}
                    >
                      <span>{row.rating} star</span>
                      <span className="h-2 overflow-hidden rounded-full bg-[var(--line)]">
                        <span
                          className="block h-full rounded-full bg-[#d99420]"
                          style={{ width: `${row.percentage}%` }}
                        />
                      </span>
                      <span className="text-right">{row.count}</span>
                    </button>
                  ))}
                  {ratingFilter !== "all" && (
                    <button
                      type="button"
                      onClick={() => {
                        setRatingFilter("all");
                        setVisibleReviewCount(PRODUCT_REVIEW_PAGE_SIZE);
                      }}
                      className="mt-1 self-start text-[0.62rem] font-bold text-[var(--botanical)] underline underline-offset-4"
                    >
                      Clear rating filter
                    </button>
                  )}
                </div>
              </div>
            )}

            {productVideos.length > 0 && (
              <div className="mt-9" aria-labelledby="video-review-heading">
                <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                  <div>
                  <p className="mb-1 text-[0.58rem] font-bold uppercase tracking-[0.16em] text-[var(--botanical)]">
                    Explore their ritual
                  </p>
                  <h3
                    id="video-review-heading"
                    className="m-0 [font-family:var(--font-display)] text-[1.45rem] font-normal text-[var(--forest)]"
                  >
                    Customer video stories
                  </h3>
                  </div>
                  <span className="text-[0.62rem] text-[var(--muted)]" role="status" aria-live="polite" aria-atomic="true">
                    Showing {visibleVideos.length} of {productVideos.length}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-4 max-[980px]:grid-cols-3 max-[760px]:flex max-[760px]:snap-x max-[760px]:snap-mandatory max-[760px]:overflow-x-auto max-[760px]:pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {visibleVideos.map((video) => (
                    <button
                      key={video.id}
                      type="button"
                      onClick={() => setActiveVideo(video)}
                      className="group overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--paper)] text-left shadow-[0_8px_24px_rgba(21,59,45,0.05)] transition-[transform,border-color] hover:-translate-y-1 hover:border-[var(--botanical)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--forest)] max-[760px]:w-[72vw] max-[760px]:max-w-[270px] max-[760px]:shrink-0 max-[760px]:snap-start"
                      aria-label={`${getPlayableVideoMedia(video) ? "Play" : "Open"} ${video.title} by ${video.creator}`}
                    >
                      <span className="relative block aspect-[4/5] overflow-hidden bg-[var(--sand)]">
                        <Image
                          src={video.image}
                          alt=""
                          fill
                          sizes="(max-width: 760px) 72vw, (max-width: 980px) 33vw, 25vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.035]"
                        />
                        <span className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/10" />
                        <span className="absolute inset-0 grid place-items-center">
                          <span className="grid size-12 place-items-center rounded-full border border-white/75 bg-white/25 text-white shadow-xl backdrop-blur-md transition-transform group-hover:scale-105">
                            <span className={getPlayableVideoMedia(video) ? "ml-0.5 text-lg" : "text-xl"} aria-hidden="true">
                              {getPlayableVideoMedia(video) ? "▶" : "“"}
                            </span>
                          </span>
                        </span>
                        <span className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2 text-white">
                          <span className="text-[0.64rem] font-bold uppercase tracking-[0.08em]">
                            {video.creator}
                          </span>
                          <span className="text-[0.56rem] text-white/80">{video.duration}</span>
                        </span>
                      </span>
                      <span className="block p-3.5">
                        <strong className="block text-[0.76rem] leading-[1.35] text-[var(--forest)]">
                          {video.title}
                        </strong>
                        <span className="mt-1 block line-clamp-2 text-[0.65rem] leading-[1.45] text-[var(--muted)]">
                          {video.testimonial}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
                {visibleVideos.length < productVideos.length && (
                  <div className="mt-5 flex justify-center">
                    <button
                      type="button"
                      onClick={() =>
                        setVisibleVideoCount(
                          (count) => count + PRODUCT_VIDEO_PAGE_SIZE,
                        )
                      }
                      className="inline-flex min-h-11 items-center rounded-full border border-[var(--forest)] px-5 py-2 text-[0.62rem] font-bold uppercase tracking-[0.08em] text-[var(--forest)] transition-colors hover:bg-[var(--forest)] hover:text-white"
                    >
                      Load more video stories
                    </button>
                  </div>
                )}
              </div>
            )}

            {productReviews.length > 0 && (
              <div className="mt-9">
                <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                  <h3 className="m-0 [font-family:var(--font-display)] text-[1.45rem] font-normal text-[var(--forest)]">
                    Written experiences
                  </h3>
                  <span
                    className="text-[0.62rem] text-[var(--muted)]"
                    role="status"
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    Showing {visibleReviews.length} of {filteredReviews.length}
                  </span>
                </div>
                {visibleReviews.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4 max-[780px]:grid-cols-1">
                    {visibleReviews.map((review) => (
                      <ReviewCard key={review.id} review={review} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-[var(--line-strong)] bg-[var(--paper)] p-7 text-center text-[0.74rem] text-[var(--muted)]">
                    No {ratingFilter}-star reviews have been published for this product.
                  </div>
                )}
                {visibleReviews.length < filteredReviews.length && (
                  <div className="mt-6 flex justify-center">
                    <button
                      type="button"
                      onClick={() =>
                        setVisibleReviewCount(
                          (count) => count + PRODUCT_REVIEW_PAGE_SIZE,
                        )
                      }
                      className="inline-flex min-h-11 items-center rounded-full border border-[var(--forest)] px-5 py-2 text-[0.62rem] font-bold uppercase tracking-[0.08em] text-[var(--forest)] transition-colors hover:bg-[var(--forest)] hover:text-white"
                    >
                      Load more written reviews
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <VideoReviewModal
        video={activeVideo}
        onClose={() => setActiveVideo(null)}
      />
    </section>
  );
}
