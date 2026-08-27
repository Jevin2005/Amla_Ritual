import type { CSSProperties } from "react";

type StarRatingProps = {
  average: number;
  count: number;
  size?: "compact" | "default" | "large";
  showCount?: boolean;
  showReviewLabel?: boolean;
  className?: string;
};

export function StarRating({
  average,
  count,
  size = "default",
  showCount = true,
  showReviewLabel = true,
  className = "",
}: StarRatingProps) {
  const safeAverage = Math.min(5, Math.max(0, average));
  const safeCount = Math.max(0, Math.round(count));
  const sizes = {
    compact: {
      wrapper: "gap-1.5 text-[0.62rem] max-[680px]:gap-1 max-[680px]:text-[0.5rem]",
      stars: "text-[0.72rem] max-[680px]:text-[0.58rem]",
    },
    default: {
      wrapper: "gap-2 text-[0.74rem]",
      stars: "text-[0.9rem]",
    },
    large: {
      wrapper: "gap-3 text-[0.86rem]",
      stars: "text-[1.15rem]",
    },
  }[size];
  const formattedCount = safeCount.toLocaleString("en-IN");
  const countLabel = `${formattedCount} review${safeCount === 1 ? "" : "s"}`;

  return (
    <span
      className={`inline-flex flex-wrap items-center ${sizes.wrapper} ${className}`}
      role="img"
      aria-label={
        showCount
          ? `${safeAverage.toFixed(1)} out of 5 stars from ${countLabel}`
          : `${safeAverage.toFixed(1)} out of 5 stars`
      }
    >
      <span
        className={`relative inline-block whitespace-nowrap leading-none tracking-[0.08em] ${sizes.stars}`}
        aria-hidden="true"
      >
        <span className="text-[#d8d5cb]">★★★★★</span>
        <span
          className="absolute inset-y-0 left-0 overflow-hidden whitespace-nowrap text-[#d99420]"
          style={
            { width: `${(safeAverage / 5) * 100}%` } as CSSProperties
          }
        >
          ★★★★★
        </span>
      </span>
      <strong className="font-bold text-[var(--forest)]" aria-hidden="true">
        {safeAverage.toFixed(1)}
      </strong>
      {showCount && (
        <span className="text-[var(--muted)]" aria-hidden="true">
          ({formattedCount}
          {showReviewLabel ? ` review${safeCount === 1 ? "" : "s"}` : ""})
        </span>
      )}
    </span>
  );
}
