import { StarRating } from "./star-rating";
import type { ReviewOverview } from "@/lib/judgeme/widget-summary";

export function ProductReviewOverview({ overview }: { overview: ReviewOverview | null }) {
  if (!overview) return null;
  return (
    <div className={`grid gap-6 rounded-[18px] border border-[#d7ddcf] bg-[#fffcf5] p-6 shadow-[0_8px_24px_rgba(21,59,45,0.035)] sm:gap-8 sm:p-7 ${overview.distribution ? "sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)]" : ""}`} aria-label="Product review summary">
      <div className={`flex flex-col justify-center ${overview.distribution ? "sm:border-r sm:border-[#d7ddcf] sm:pr-8" : ""}`}>
        {overview.count > 0 ? (
          <>
            <p className="mb-3 mt-0 [font-family:var(--font-display)] text-[3.4rem] leading-none tracking-[-0.04em] text-[var(--forest)]" aria-hidden="true">{overview.average.toFixed(1)}</p>
            <StarRating average={overview.average} count={overview.count} />
            <p className="mb-0 mt-3 text-[0.72rem] leading-relaxed text-[var(--muted)]">Published written reviews for this product only.</p>
          </>
        ) : (
          <p className="m-0 [font-family:var(--font-display)] text-2xl text-[var(--forest)]">Be the first to share your experience.</p>
        )}
      </div>
      {overview.distribution && (
        <div>
          <p className="mb-3 mt-0 text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-[var(--forest)]">Rating breakdown</p>
          <div className="grid gap-3.5">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = overview.distribution?.[rating] || 0;
              return (
                <div key={rating} className="grid grid-cols-[38px_minmax(0,1fr)_22px] items-center gap-3 text-[0.68rem] text-[var(--muted)]" aria-label={`${rating} stars: ${count} reviews`}>
                  <span aria-hidden="true">{rating} star</span>
                  <span aria-hidden="true" className="h-1.5 overflow-hidden rounded-full bg-[#daddd4]"><span className="block h-full rounded-full bg-[#d99420]" style={{ width: `${overview.count ? count / overview.count * 100 : 0}%` }} /></span>
                  <span aria-hidden="true" className="text-right tabular-nums">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
