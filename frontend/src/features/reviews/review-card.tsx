"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  normalizeProductSlug,
  type CustomerReview,
  type VideoReview,
} from "@/domain/reviews/custom-reviews";
import { ReviewPhotoModal, type ReviewPhoto } from "@/features/reviews/review-photo-modal";
import { StarRating } from "@/features/reviews/star-rating";
import { VideoReviewModal } from "@/features/reviews/video-review-modal";

function reviewerInitials(review: CustomerReview) {
  if (review.avatarText?.trim()) return review.avatarText.trim().slice(0, 2).toLocaleUpperCase();

  return review.author
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toLocaleUpperCase();
}

function reviewDate(review: CustomerReview) {
  const value = review.date?.trim();
  if (!value) return null;

  const isIsoDate = /^\d{4}-\d{2}-\d{2}$/.test(value);
  if (!isIsoDate) return { label: value, dateTime: undefined };

  const timestamp = Date.parse(`${value}T00:00:00Z`);
  if (Number.isNaN(timestamp)) return { label: value, dateTime: undefined };

  return {
    label: new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(timestamp)),
    dateTime: value,
  };
}

export function ReviewCard({
  review,
  showProductLink = false,
  className = "",
  onPhotoClick,
  onVideoClick,
}: {
  review: CustomerReview;
  showProductLink?: boolean;
  className?: string;
  onPhotoClick?: (photoUrl: string) => void;
  onVideoClick?: (video: { url: string; poster?: string; title?: string }) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [hasMoreText, setHasMoreText] = useState(false);
  const [activePhoto, setActivePhoto] = useState<ReviewPhoto | null>(null);
  const [activeVideo, setActiveVideo] = useState<VideoReview | null>(null);
  const quoteRef = useRef<HTMLParagraphElement>(null);
  const quoteId = useId();
  const date = reviewDate(review);
  const productSlug = normalizeProductSlug(review.productSlug);
  const photos = (review.photos || []).map((url, index) => ({
    url,
    alt: `Photo ${index + 1} from ${review.author}'s review`,
  }));
  const visiblePhotos = photos.slice(0, review.video ? 2 : 3);
  const hiddenPhotoCount = photos.length - visiblePhotos.length;

  useEffect(() => {
    const quote = quoteRef.current;
    if (!quote || expanded) return;

    const measure = () => setHasMoreText(quote.scrollHeight > quote.clientHeight + 1);
    const frame = requestAnimationFrame(measure);
    const observer = new ResizeObserver(measure);
    observer.observe(quote);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [expanded, review.quote]);

  function openVideo() {
    const video = review.video;
    if (!video) return;
    if (onVideoClick) {
      onVideoClick(video);
      return;
    }
    setActiveVideo({
      id: `review-video-${review.id}`,
      creator: review.author,
      title: video.title || `Video review by ${review.author}`,
      duration: video.duration || "",
      image: video.poster || photos[0]?.url || "/images/product-placeholder.svg",
      videoUrl: video.url,
      productTag: review.productName || "",
      productSlug: review.productSlug,
      testimonial: review.quote,
    });
  }

  return (
    <>
      <article
        aria-label={`Review by ${review.author}`}
        className={`flex min-w-0 flex-col rounded-2xl border border-[#e2e5da] bg-[#fffcf5] p-[18px] transition-colors hover:border-[#c2ccba] max-[680px]:p-4 ${className}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <div
              className="relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-[var(--forest)] [font-family:var(--font-sans)] text-xs font-medium uppercase tracking-[0.02em] text-[#fffcf5]"
              aria-hidden="true"
            >
              {review.avatarImage ? (
                <Image src={review.avatarImage} alt="" fill sizes="36px" className="object-cover" />
              ) : (
                reviewerInitials(review)
              )}
            </div>
            <div className="min-w-0">
              <p className="m-0 break-words text-[0.8125rem] font-semibold leading-snug text-[var(--forest)]">{review.author}</p>
              {review.verified && (
                <span className="mt-0.5 inline-flex items-center gap-1 text-[0.625rem] leading-snug text-[#68765a]">
                  <span aria-hidden="true">&#10003;</span> Verified purchase
                </span>
              )}
            </div>
          </div>
          {date && (
            <time dateTime={date.dateTime} className="max-w-[34%] shrink-0 break-words pt-0.5 text-right text-[0.625rem] leading-relaxed text-[#74776b]">
              {date.label}
            </time>
          )}
        </div>

        <div className="mt-2.5">
          <StarRating average={review.rating} count={1} size="compact" showCount={false} className="gap-2 [&>strong]:text-xs [&>strong]:font-medium [&>span]:text-[0.875rem] [&>span>span:last-child]:text-[#a67c42]" />
        </div>

        {review.headline && (
          <h3 className="mb-0 mt-2.5 break-words [font-family:var(--font-display)] text-[1.125rem] font-normal leading-[1.4] tracking-[-0.01em] text-[var(--forest)]">
            {review.headline}
          </h3>
        )}
        {review.quote && (
          <div className={review.headline ? "mt-1.5" : "mt-3"}>
            <p
              ref={quoteRef}
              id={quoteId}
              className={`m-0 whitespace-pre-line break-words text-[0.875rem] leading-[1.65] text-[#62685c] ${expanded ? "" : "line-clamp-4"}`}
            >
              {review.quote}
            </p>
            {(hasMoreText || expanded) && (
              <button
                type="button"
                aria-expanded={expanded}
                aria-controls={quoteId}
                onClick={() => setExpanded((value) => !value)}
                className="-mb-2 inline-flex min-h-11 cursor-pointer items-center rounded text-[0.74rem] font-semibold text-[#45603c] underline decoration-[#bcc5ae] underline-offset-4 transition-colors hover:text-[var(--forest)] hover:decoration-current focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--forest)]"
              >
                {expanded ? "Read less" : "Read more"}
              </button>
            )}
          </div>
        )}

        {(review.video || photos.length > 0) && (
          <div className="mt-3 flex flex-wrap gap-2" aria-label="Customer photos and video">
            {review.video && (
              <button
                type="button"
                onClick={openVideo}
                className="group relative grid aspect-square w-[76px] max-w-[calc((100%_-_1rem)/3)] shrink-0 cursor-pointer place-items-center overflow-hidden rounded-xl border border-[#dce1d3] bg-[var(--forest)] text-white shadow-[0_2px_5px_rgba(21,59,45,0.05)] min-[380px]:w-20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--forest)]"
                aria-label={`Play ${review.video.title || `video review by ${review.author}`}`}
              >
                {review.video.poster && (
                  // Customer media can be hosted outside the image optimizer's allowlist.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={review.video.poster} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
                )}
                <span className="absolute inset-0 bg-gradient-to-t from-black/45 to-black/10 transition-opacity group-hover:opacity-80" />
                <span className="relative grid size-8 place-items-center rounded-full border border-white/65 bg-white/15 shadow-sm backdrop-blur-sm">
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M5 2.5 13 8l-8 5.5z" /></svg>
                </span>
                <span className="absolute inset-x-0 bottom-1 text-[0.56rem] font-medium tracking-[0.035em]">Video</span>
              </button>
            )}
            {visiblePhotos.map((photo, index) => {
              const showsMore = index === visiblePhotos.length - 1 && hiddenPhotoCount > 0;
              return (
                <button
                  key={`${photo.url}-${index}`}
                  type="button"
                  onClick={() => {
                    if (onPhotoClick && !showsMore) onPhotoClick(photo.url);
                    else setActivePhoto(photo);
                  }}
                  className="group relative aspect-square w-[76px] max-w-[calc((100%_-_1rem)/3)] shrink-0 cursor-pointer overflow-hidden rounded-xl border border-[#dce1d3] bg-[var(--surface-warm)] shadow-[0_2px_5px_rgba(21,59,45,0.05)] min-[380px]:w-20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--forest)]"
                  aria-label={showsMore ? `View all ${photos.length} photos from ${review.author}'s review` : `Enlarge photo ${index + 1} from ${review.author}'s review`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.url} alt="" loading="lazy" className="size-full object-cover transition-opacity duration-300 group-hover:opacity-85" />
                  {showsMore && <span className="absolute inset-0 grid place-items-center bg-[#173824]/65 text-base font-medium text-white">+{hiddenPhotoCount}</span>}
                </button>
              );
            })}
          </div>
        )}

        {showProductLink && productSlug && (
          <div className="mt-3.5 border-t border-[#e6e8de] pt-1">
            <Link
              href={`/shop/${productSlug}`}
              className="flex min-h-11 w-full flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-md py-2 text-[0.6875rem] font-medium text-[#637653] transition-colors hover:bg-[#f2f4eb] hover:text-[var(--forest)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--forest)]"
            >
              {review.productName?.trim() && <span className="min-w-0 flex-[1_1_120px] leading-relaxed [overflow-wrap:anywhere]">{review.productName}</span>}
              <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap font-semibold text-[var(--forest)]">
                View product <span aria-hidden="true">&#8599;</span>
              </span>
            </Link>
          </div>
        )}
      </article>
      <ReviewPhotoModal photo={activePhoto} photos={photos} onClose={() => setActivePhoto(null)} />
      {activeVideo && createPortal(
        <div onMouseDown={(event) => event.stopPropagation()}>
          <VideoReviewModal video={activeVideo} onClose={() => setActiveVideo(null)} />
        </div>,
        document.body,
      )}
    </>
  );
}
