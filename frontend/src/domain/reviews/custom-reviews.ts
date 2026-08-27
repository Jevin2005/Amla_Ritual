export const reviewTags = [
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
export const customReviews: CustomerReview[] = [
  {
    id: "review-001",
    author: "Priya Sharma",
    rating: 5,
    quote: "My hair fall reduced noticeably after 3 weeks of consistent weekly masks. The pure amla powder mixes smoothly without any clumps, and rinses out effortlessly.",
    role: "Verified Customer",
    productSlug: "amla-powder",
    productName: "Amla Powder",
    verified: true,
    date: "2026-08-20",
    location: "Mumbai, Maharashtra",
    tag: "Hair Fall",
    featuredOnHome: true,
    headline: "Remarkable reduction in hair fall",
  },
  {
    id: "review-002",
    author: "Ananya Reddy",
    rating: 5,
    quote: "Leaves my hair feeling deeply conditioned with an undeniable glass-like shine. Paired with warm water and a touch of hibiscus, this ritual is unbeatable.",
    role: "Verified Customer",
    productSlug: "amla-powder",
    productName: "Amla Powder",
    verified: true,
    date: "2026-08-15",
    location: "Bengaluru, Karnataka",
    tag: "Shine & Softness",
    featuredOnHome: true,
    headline: "Unmatched natural shine and softness",
  },
  {
    id: "review-003",
    author: "Dr. Kavita Menon",
    rating: 5,
    quote: "Bhringraj is the king of hair herbs for a reason. This batch is extremely fresh and potent. My scalp feels invigorated and hair density looks visibly fuller at the crown.",
    role: "Verified Customer",
    productSlug: "bhringraj-powder",
    productName: "Bhringraj Powder",
    verified: true,
    date: "2026-08-10",
    location: "Kochi, Kerala",
    tag: "Scalp Health",
    featuredOnHome: true,
    headline: "Crown density and scalp revitalisation",
  },
  {
    id: "review-004",
    author: "Rohan Varma",
    rating: 4,
    quote: "Reetha gives a refreshing, low-foam botanical wash that completely clears away grease and sweat buildup without stripping the scalp dry.",
    role: "Verified Customer",
    productSlug: "reetha-powder",
    productName: "Reetha Powder",
    verified: true,
    date: "2026-08-05",
    location: "Pune, Maharashtra",
    tag: "Scalp Health",
    featuredOnHome: false,
    headline: "Cleanest feel without chemical surfactants",
  },
  {
    id: "review-005",
    author: "Sunita Deshmukh",
    rating: 5,
    quote: "The Shikakai powder provides natural slip that makes detangling so gentle. My curls are bouncy, soft, and retain moisture for days.",
    role: "Verified Customer",
    productSlug: "shikakai-powder",
    productName: "Shikakai Powder",
    verified: true,
    date: "2026-07-28",
    location: "Nagpur, Maharashtra",
    tag: "Shine & Softness",
    featuredOnHome: false,
    headline: "Gentle cleanse and natural slip",
  },
  {
    id: "review-006",
    author: "Meera Nair",
    rating: 5,
    quote: "The Indigo powder produced a rich, natural dark sheen when applied right after henna. No chemical odor, pure botanical goodness that covered early greys seamlessly.",
    role: "Verified Customer",
    productSlug: "indigo-powder",
    productName: "Indigo Powder",
    verified: true,
    date: "2026-07-22",
    location: "Chennai, Tamil Nadu",
    tag: "Colour & Graying",
    featuredOnHome: false,
    headline: "Rich botanical colour and grey coverage",
  },
  {
    id: "review-007",
    author: "Pooja Hegde",
    rating: 4,
    quote: "Hibiscus creates such a velvety, moisturizing mask. Rinsed with cool water, it left my dry ends silky and revitalized with a healthy bounce.",
    role: "Customer",
    productSlug: "hibiscus-powder",
    productName: "Hibiscus Powder",
    verified: false,
    date: "2026-07-18",
    location: "Hyderabad, Telangana",
    tag: "Shine & Softness",
    featuredOnHome: false,
    headline: "Deep hydration for dry lengths",
  },
];

export const customVideoReviews: VideoReview[] = [
  {
    id: "video-review-001",
    creator: "Aditi Rao",
    title: "My 4-Week Amla Hair Mask Journey",
    duration: "1:15",
    image: "/images/amla-powder.jpg",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    productTag: "AMLA POWDER",
    productSlug: "amla-powder",
    testimonial: "I replaced my commercial hair conditioner with a weekly freshly whipped amla mask. The thickness and root strength have completely transformed.",
    transcript: "Welcome to my weekly ritual. Today I am preparing the NatureMist Amla Powder with warm distilled water. I let it steep for 10 minutes, apply from roots to tips, and leave it on for 25 minutes. The difference in shedding when washing is day and night.",
    featuredOnHome: true,
  },
  {
    id: "video-review-002",
    creator: "Vikram Sen",
    title: "Revitalising Scalp Mask with Bhringraj",
    duration: "0:54",
    image: "/images/bhringraj-powder.jpg",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    productTag: "BHRINGRAJ POWDER",
    productSlug: "bhringraj-powder",
    testimonial: "Bhringraj is an essential part of my Sunday Ayurvedic head massage and pack. Calms scalp heat and strengthens the follicles.",
    transcript: "Every Sunday I blend Bhringraj with light warm sesame oil and water. It calms the scalp, enhances circulation, and leaves my hair feeling grounded and conditioned.",
    featuredOnHome: true,
  },
  {
    id: "video-review-003",
    creator: "Shruti Kapoor",
    title: "Zero-Chemical Wash Day with Reetha & Shikakai",
    duration: "1:32",
    image: "/images/shikakai-powder.jpg",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    productTag: "SHIKAKAI POWDER",
    productSlug: "shikakai-powder",
    testimonial: "Combining Shikakai for slip and Reetha for gentle lather gave me the cleanest wash day without a single surfactant.",
    transcript: "Here is how I mix equal parts Reetha and Shikakai. The saponins gently dissolve oils while the Shikakai conditions. Zero buildup, completely natural.",
    featuredOnHome: true,
  },
  {
    id: "video-review-004",
    creator: "Devika Pillai",
    title: "Deep Conditioning Hibiscus Paste for Hydrated Curls",
    duration: "1:08",
    image: "/images/hibiscus-powder.jpg",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    productTag: "HIBISCUS POWDER",
    productSlug: "hibiscus-powder",
    testimonial: "Hibiscus creates a velvety mucilage that gives immense moisture. My dry ends haven't looked this hydrated in years.",
    transcript: "Today we are whipping up a deep conditioning Hibiscus mask. Mixing it with slightly warm rose water brings out that smooth gel-like consistency. It coats every strand and rinses out silky.",
    featuredOnHome: false,
  },
  {
    id: "video-review-005",
    creator: "Tanvi Saxena",
    title: "Gentle Reetha Scalp Clarifying Ritual",
    duration: "0:48",
    image: "/images/reetha-powder.jpg",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    productTag: "REETHA POWDER",
    productSlug: "reetha-powder",
    testimonial: "After heavy oiling or workouts, a strained Reetha tea washes out every bit of grease without disturbing my scalp's natural balance.",
    transcript: "I brew a strained Reetha tea in warm water, let it cool, and pour it gently over the scalp. It lifts excess oil and workout sweat without any tight, drying feeling.",
    featuredOnHome: false,
  },
  {
    id: "video-review-006",
    creator: "Aarav Mehta",
    title: "Natural Grey Blending with Henna & Indigo",
    duration: "1:20",
    image: "/images/indigo-powder.jpg",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    productTag: "INDIGO POWDER",
    productSlug: "indigo-powder",
    testimonial: "The two-step botanical colour with Indigo gave me rich dark brown tones with zero chemical burns or ammoniac smell.",
    transcript: "Here is step two of my natural colour ritual. After rinsing my henna base, I activate fresh Indigo powder with lukewarm water and apply immediately. In 45 minutes, it creates rich dark tones with beautiful botanical shine.",
    featuredOnHome: false,
  },
];

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
  return (value || "")
    .trim()
    .toLocaleLowerCase()
    .replace(/^https?:\/\/[^/]+\//, "")
    .replace(/^\/?shop\//, "")
    .replace(/^\/+|\/+$/g, "");
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
