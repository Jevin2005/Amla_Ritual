export const reviewTags = [
  "Hair Packs",
  "Hair Washing",
  "Hair Colour",
  "Hair Fall",
  "Scalp Health",
  "Shine & Softness",
  "Colour & Graying",
] as const;

export type ReviewTag = (typeof reviewTags)[number];
export type ReviewRating = 1 | 2 | 3 | 4 | 5;

export type CustomerReview = {
  id: string;
  author: string;
  rating: ReviewRating;
  quote: string;
  role: string;
  productSlug: string;
  verified: boolean;
  avatarText?: string;
  avatarBg?: string;
  avatarImage?: string | null;
  productName?: string;
  headline?: string;
  date?: string;
  location?: string;
  tag?: ReviewTag;
  featuredOnHome?: boolean;
  photos?: string[];
  video?: {
    url: string;
    poster?: string;
    duration?: string;
    title?: string;
  } | null;
};

export type VideoReview = {
  id: string;
  creator: string;
  title: string;
  duration: string;
  image: string;
  videoUrl?: string | null;
  productTag: string;
  productSlug: string;
  testimonial: string;
  captionsUrl?: string | null;
  captionsLanguage?: string;
  captionsLabel?: string;
  transcript?: string;
  featuredOnHome?: boolean;
};

export type SafeVideoMedia =
  | { kind: "embed"; url: string }
  | { kind: "video"; url: string };

export type ProductReviewSummary = {
  averageRating: number;
  reviewCount: number;
};

/**
 * Merchant-managed written reviews.
 *
 * Add only approved, authentic reviews. productSlug must exactly match the
 * Shopify product handle in /shop/{productSlug}. Use an ISO date such as
 * "2026-08-25" when a date is supplied, and set verified to true only after
 * the purchase has actually been verified.
 *
 * Example shape:
 * {
 *   id: "review-001",
 *   author: "Customer name",
 *   rating: 5,
 *   quote: "Approved review text.",
 *   role: "Customer",
 *   productSlug: "exact-shopify-handle",
 *   verified: false,
 *   date: "2026-08-25",
 *   location: "City, Country",
 *   tag: "Shine & Softness",
 *   featuredOnHome: true,
 * }
 */
/**
 * Authentic customer reviews.
 * Populated automatically by real verified customer submissions and Judge.me sync.
 */
export const customReviews: CustomerReview[] = [];

/**
 * Authentic customer video reviews.
 * Populated automatically by real verified customer video submissions.
 */
export const customVideoReviews: VideoReview[] = [];

function safeLocalPath(value: string) {
  if (
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    value.includes("\0")
  ) {
    return null;
  }

  try {
    const base = "https://naturemist.local";
    const url = new URL(value, base);
    return url.origin === base ? `${url.pathname}${url.search}${url.hash}` : null;
  } catch {
    return null;
  }
}

export function getSafeVideoMedia(
  value: string | null | undefined,
): SafeVideoMedia | null {
  const source = value?.trim();
  if (!source) return null;
  if (source.startsWith("/")) {
    const path = safeLocalPath(source);
    const pathname = path?.split(/[?#]/)[0] || "";
    return path && /\.(mp4|webm|ogg)$/i.test(pathname)
      ? { kind: "video", url: path }
      : null;
  }

  try {
    const url = new URL(source);
    if (url.protocol !== "https:" || url.username || url.password) return null;
    const host = url.hostname.toLocaleLowerCase().replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id && /^[A-Za-z0-9_-]{6,20}$/.test(id)
        ? {
          kind: "embed",
          url: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0`,
        }
        : null;
    }

    if (
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "youtube-nocookie.com"
    ) {
      const parts = url.pathname.split("/").filter(Boolean);
      const id =
        url.searchParams.get("v") ||
        (["shorts", "embed", "live"].includes(parts[0]) ? parts[1] : null);
      return id && /^[A-Za-z0-9_-]{6,20}$/.test(id)
        ? {
          kind: "embed",
          url: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0`,
        }
        : null;
    }

    if (host === "vimeo.com" || host === "player.vimeo.com") {
      const id = url.pathname
        .split("/")
        .filter(Boolean)
        .find((part) => /^\d+$/.test(part));
      return id
        ? {
          kind: "embed",
          url: `https://player.vimeo.com/video/${id}?autoplay=1&dnt=1`,
        }
        : null;
    }

    if (
      host === "cdn.shopify.com" ||
      host.endsWith(".shopify.com") ||
      host.endsWith(".shopifycloud.com") ||
      host.endsWith(".myshopify.com") ||
      /\.(mp4|webm|ogg|m4v|mov)$/i.test(url.pathname) ||
      url.pathname.includes("/videos/") ||
      url.pathname.includes("/files/")
    ) {
      if (
        /\.(mp4|webm|ogg|m4v|mov)$/i.test(url.pathname) ||
        url.pathname.includes("/videos/") ||
        url.pathname.includes("/files/") ||
        url.search.includes(".mp4")
      ) {
        return { kind: "video", url: url.href };
      }
    }

    return null;
  } catch {
    return null;
  }
}

export function getSafeCaptionsUrl(value: string | null | undefined) {
  const source = value?.trim();
  if (!source) return null;
  if (source.startsWith("/")) {
    const path = safeLocalPath(source);
    return path && /\.vtt$/i.test(path.split(/[?#]/)[0]) ? path : null;
  }

  try {
    const url = new URL(source);
    const host = url.hostname.toLocaleLowerCase().replace(/^www\./, "");
    return url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      host === "cdn.shopify.com" &&
      /\.vtt$/i.test(url.pathname)
      ? url.href
      : null;
  } catch {
    return null;
  }
}

export function getPlayableVideoMedia(
  review:
    | Pick<VideoReview, "videoUrl" | "captionsUrl" | "transcript">
    | null
    | undefined,
) {
  return getSafeVideoMedia(review?.videoUrl);
}

export function normalizeProductSlug(value: string | null | undefined) {
  const clean = (value || "")
    .trim()
    .toLocaleLowerCase()
    .replace(/^https?:\/\/[^/]+\//, "")
    .replace(/^\/?shop\//, "")
    .replace(/^\/+|\/+$/g, "");
  if (clean === "wildcrafted-amla-powder") return "reetha-powder";
  if (clean === "amla") return "amla-powder";
  return clean;
}

export function filterReviewsByProduct<
  T extends { productSlug?: string | null },
>(reviews: readonly T[], productSlug: string): T[] {
  const normalizedSlug = normalizeProductSlug(productSlug);
  if (!normalizedSlug) return [];

  return reviews.filter(
    (review) => normalizeProductSlug(review.productSlug) === normalizedSlug,
  );
}

export function getProductReviewSummary(
  reviews: readonly CustomerReview[],
  productSlug: string,
): ProductReviewSummary | null {
  const ratings = filterReviewsByProduct(reviews, productSlug)
    .map((review) => Number(review.rating))
    .filter(
      (rating) =>
        Number.isInteger(rating) && rating >= 1 && rating <= 5,
    );

  if (!ratings.length) return null;

  const average =
    ratings.reduce((total, rating) => total + rating, 0) / ratings.length;

  return {
    averageRating: Math.round(average * 10) / 10,
    reviewCount: ratings.length,
  };
}

export function isReviewTag(value: string | null | undefined): value is ReviewTag {
  return reviewTags.includes(value as ReviewTag);
}
