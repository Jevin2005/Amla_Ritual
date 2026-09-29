import Image from "next/image";
import Link from "next/link";
import {
  normalizeProductSlug,
  type CustomerReview,
} from "@/domain/reviews/custom-reviews";
import { StarRating } from "@/features/reviews/star-rating";

function reviewerInitials(review: CustomerReview) {
  if (review.avatarText?.trim()) return review.avatarText.trim().slice(0, 2);

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
  const date = reviewDate(review);
  const supportingDetails = [review.location, review.role].filter(Boolean);
  const productSlug = normalizeProductSlug(review.productSlug);

  return (
    <article
      className={`flex h-full flex-col select-none rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-5 shadow-[0_8px_28px_rgba(21,59,45,0.045)] transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--botanical)_45%,var(--line))] hover:shadow-[0_14px_34px_rgba(21,59,45,0.07)] max-[680px]:p-4 ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-full text-[0.7rem] font-bold uppercase tracking-[0.05em] text-white ${review.avatarBg || "bg-[var(--forest)]"}`}
            aria-hidden="true"
          >
            {review.avatarImage ? (
              <Image
                src={review.avatarImage}
                alt=""
                fill
                sizes="40px"
                className="object-cover"
              />
            ) : (
              reviewerInitials(review)
            )}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h3 className="m-0 truncate text-[0.86rem] font-bold text-[var(--forest)]">
                {review.author}
              </h3>
              {review.verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#eaf3e7] px-2 py-0.5 text-[0.66rem] font-bold uppercase tracking-[0.07em] text-[#397228]">
                  <span aria-hidden="true">&#10003;</span> Verified purchase
                </span>
              )}
            </div>
            {supportingDetails.length > 0 && (
              <p className="m-0 mt-0.5 truncate text-[0.72rem] text-[var(--muted)]">
                {supportingDetails.join(" · ")}
              </p>
            )}
          </div>
        </div>
        {date && (
          <time
            dateTime={date.dateTime}
            className="shrink-0 text-[0.72rem] text-[var(--muted)]"
          >
            {date.label}
          </time>
        )}
      </div>

      <div className="mt-4">
        <StarRating
          average={review.rating}
          count={1}
          size="compact"
          showCount={false}
        />
      </div>

      {review.headline && (
        <h4 className="mb-0 mt-3 [font-family:var(--font-display)] text-[1.12rem] font-normal leading-[1.3] text-[var(--forest)]">
          {review.headline}
        </h4>
      )}
      <p className="mb-0 mt-2 flex-1 text-[0.84rem] leading-[1.65] text-[var(--muted)]">
        &ldquo;{review.quote}&rdquo;
      </p>

      {/* Customer Attached Photos */}
      {review.photos && review.photos.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {review.photos.map((photo, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onPhotoClick?.(photo)}
              className="group relative size-14 overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--sand)] shadow-2xs transition-all hover:scale-105 hover:border-[var(--botanical)] cursor-pointer"
              aria-label={`Enlarge customer photo ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo}
                alt=""
                className="size-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Customer Attached Video */}
      {review.video && (
        <div className="mt-2.5">
          <button
            type="button"
            onClick={() => onVideoClick?.(review.video!)}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--sand)] px-3 py-1.5 text-[0.72rem] font-bold text-[var(--forest)] transition-all hover:border-[var(--botanical)] hover:bg-white cursor-pointer"
          >
            <span className="grid size-5 place-items-center rounded-full bg-[var(--forest)] text-[0.55rem] text-white">
              ▶
            </span>
            <span className="truncate">{review.video.title || "Watch Customer Video"}</span>
          </button>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] pt-3">
        <div className="flex flex-wrap items-center gap-2">
          {review.tag && (
            <span className="rounded-full bg-[var(--sand)] px-2.5 py-1 text-[0.66rem] font-bold uppercase tracking-[0.08em] text-[var(--forest)]">
              {review.tag}
            </span>
          )}
          {review.productName && (
            <span className="text-[0.72rem] font-semibold text-[var(--muted)]">
              {review.productName}
            </span>
          )}
        </div>
        {showProductLink && productSlug && (
          <Link
            href={`/shop/${productSlug}#customer-reviews`}
            className="inline-flex min-h-8 items-center px-1 text-[0.72rem] font-bold uppercase tracking-[0.08em] text-[var(--botanical)] underline decoration-transparent underline-offset-4 transition-colors hover:text-[var(--forest)] hover:decoration-current"
          >
            View product
          </Link>
        )}
      </div>
    </article>
  );
}
