import {
  extractNumericProductId,
  getJudgemePublicToken,
  getJudgemeShopDomain,
  isJudgemeConfigured,
} from "./config";
import type { CustomerReview } from "@/domain/reviews/custom-reviews";

export type JudgemeReview = {
  id: string | number;
  rating: number;
  title: string;
  body: string;
  reviewerName: string;
  createdAt: string;
  verified: boolean;
  pictures?: string[];
};

export type JudgemeProductReviewSummary = {
  reviewCount: number;
  averageRating: number;
  reviews: JudgemeReview[];
};

export const JUDGEME_CATALOG_PRODUCTS = [
  { name: "Wildcrafted Amla Powder", id: "8494763311290", slug: "amla", tag: "Scalp Health" },
  { name: "Wildcrafted Reetha Powder", id: "8498815107258", slug: "wildcrafted-amla-powder", tag: "Natural Wash" },
  { name: "Pure Indigo Powder", id: "8531585368250", slug: "reetha-powder", tag: "Hair Color" },
  { name: "Bhringraj Scalp Powder", id: "8531585433786", slug: "bhringraj-powder", tag: "Hair Fall" },
  { name: "Hibiscus Petal Powder", id: "8531585499322", slug: "hibiscus-powder", tag: "Conditioning" },
  { name: "Shikakai Conditioning Powder", id: "8531585597626", slug: "indigo-powder", tag: "Gentle Cleanse" },
] as const;

/**
 * Fetches server-side review data from Judge.me for a specific product.
 * Cached with Next.js revalidation (5 minutes) for fast, SEO-friendly SSR.
 */
export async function getJudgemeProductReviews(
  productId?: string | null,
): Promise<JudgemeProductReviewSummary | null> {
  const numericId = extractNumericProductId(productId);
  if (!numericId || !isJudgemeConfigured()) return null;

  const shopDomain = getJudgemeShopDomain();

  try {
    const url = `https://judge.me/reviews/reviews_for_widget?shop_domain=${encodeURIComponent(
      shopDomain,
    )}&platform=shopify&product_id=${encodeURIComponent(numericId)}`;

    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 300, tags: [`judgeme-${numericId}`] },
    });

    if (!res.ok) return null;

    const data = (await res.json()) as {
      number_of_reviews?: number | string;
      average_rating?: number | string;
      reviews?: Array<{
        id?: string | number;
        uuid?: string;
        rating?: number | string;
        title?: string;
        body?: string;
        body_html?: string;
        created_at?: string;
        verified_buyer?: boolean;
        reviewer_name?: string;
        reviewer?: { name?: string };
        pictures_urls?: string[];
        pictures?: Array<{ url?: string; urls?: { original?: string } }>;
      }>;
    };

    const reviewCount = Number(data.number_of_reviews) || 0;
    const averageRating = parseFloat(String(data.average_rating || 0)) || 0;
    const rawList = Array.isArray(data.reviews) ? data.reviews : [];

    const reviews: JudgemeReview[] = rawList.map((r, idx) => {
      const cleanBody = r.body_html
        ? r.body_html.replace(/<[^>]*>/g, "").trim()
        : r.body?.trim() || "";

      const rawPictures = Array.isArray(r.pictures_urls) && r.pictures_urls.length > 0
        ? r.pictures_urls
        : Array.isArray(r.pictures)
        ? r.pictures
            .map((p) => p.urls?.original || p.url)
            .filter((u): u is string => typeof u === "string" && Boolean(u))
        : [];

      return {
        id: r.uuid || r.id || `jm-rev-${idx}`,
        rating: Number(r.rating) || 5,
        title: r.title?.trim() || "",
        body: cleanBody,
        reviewerName: r.reviewer_name?.trim() || r.reviewer?.name?.trim() || "Verified Customer",
        createdAt: r.created_at || new Date().toISOString(),
        verified: Boolean(r.verified_buyer),
        pictures: rawPictures,
      };
    });

    return {
      reviewCount,
      averageRating: Math.round(averageRating * 10) / 10,
      reviews,
    };
  } catch (error) {
    console.warn(`[Judge.me SSR API] Failed to fetch reviews for product ${numericId}:`, error);
    return null;
  }
}

/**
 * Fetches the complete pre-rendered Judge.me Review Widget HTML from Judge.me's Widget API.
 * This includes customer reviews, summary histogram, rating stars, and verified badges.
 */
export async function getJudgemeProductReviewWidget(
  productHandle?: string | null,
): Promise<string | null> {
  if (!productHandle || !isJudgemeConfigured()) return null;

  const shopDomain = getJudgemeShopDomain();
  const publicToken = getJudgemePublicToken();
  if (!publicToken) return null;

  try {
    const url = `https://api.judge.me/api/v1/widgets/product_review?shop_domain=${encodeURIComponent(
      shopDomain,
    )}&api_token=${encodeURIComponent(publicToken)}&handle=${encodeURIComponent(productHandle)}`;

    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 300, tags: [`judgeme-widget-${productHandle}`] },
    });

    if (!res.ok) return null;
    const data = (await res.json()) as { widget?: string };
    return data.widget || null;
  } catch (error) {
    console.warn(`[Judge.me Widget API] Failed to fetch widget for ${productHandle}:`, error);
    return null;
  }
}

/**
 * Fetches the pre-rendered Judge.me Star Rating Preview Badge HTML for a product.
 */
export async function getJudgemePreviewBadge(
  productHandle?: string | null,
): Promise<string | null> {
  if (!productHandle || !isJudgemeConfigured()) return null;

  const shopDomain = getJudgemeShopDomain();
  const publicToken = getJudgemePublicToken();
  if (!publicToken) return null;

  try {
    const url = `https://api.judge.me/api/v1/widgets/preview_badge?shop_domain=${encodeURIComponent(
      shopDomain,
    )}&api_token=${encodeURIComponent(publicToken)}&handle=${encodeURIComponent(productHandle)}`;

    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 300, tags: [`judgeme-badge-${productHandle}`] },
    });

    if (!res.ok) return null;
    const data = (await res.json()) as { badge?: string };
    return data.badge || null;
  } catch (error) {
    console.warn(`[Judge.me Badge API] Failed to fetch badge for ${productHandle}:`, error);
    return null;
  }
}

/**
 * Fetches all published reviews across all products from Judge.me
 * and formats them as CustomerReview objects for the NatureMist /reviews page.
 */
export async function getAllJudgemeReviews(): Promise<CustomerReview[]> {
  if (!isJudgemeConfigured()) return [];

  try {
    const results = await Promise.all(
      JUDGEME_CATALOG_PRODUCTS.map(async (p) => {
        const summary = await getJudgemeProductReviews(p.id);
        if (!summary || !summary.reviews.length) return [];

        return summary.reviews.map((r): CustomerReview => ({
          id: String(r.id),
          productSlug: p.slug,
          productName: p.name,
          productTag: p.tag,
          author: r.reviewerName,
          verified: r.verified,
          rating: (r.rating >= 1 && r.rating <= 5 ? r.rating : 5) as 1 | 2 | 3 | 4 | 5,
          title: r.title,
          content: r.body,
          date: r.createdAt ? r.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10),
          tag: p.tag as CustomerReview["tag"],
          photos: r.pictures,
        }));
      }),
    );

    return results.flat();
  } catch (error) {
    console.warn("[Judge.me API] Failed to fetch all reviews:", error);
    return [];
  }
}
