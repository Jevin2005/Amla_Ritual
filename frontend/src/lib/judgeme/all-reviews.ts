import sanitizeHtml from "sanitize-html";
import { normalizeProductSlug } from "@/domain/reviews/custom-reviews";
import { getJudgemeShopDomain, isJudgemeConfigured } from "./config";

export const ALL_REVIEWS_PAGE_SIZE = 6;
export type JudgemeReviewType = "product-reviews" | "shop-reviews";
export type JudgemeAllReviewsPage = {
  html: string;
  page: number;
  reviewType: JudgemeReviewType;
  productReviewCount: number;
  shopReviewCount: number;
};

/** The public endpoint used by Judge.me's legacy AllReviewsPage widget. */
export async function getJudgemeAllReviewsPage(
  page = 1,
  reviewType: JudgemeReviewType = "product-reviews",
): Promise<JudgemeAllReviewsPage | null> {
  if (!isJudgemeConfigured()) return null;
  const requestedPage = Math.max(1, Math.floor(page));
  const url = new URL("https://cdn.judge.me/reviews/all_reviews_js_based");
  url.search = new URLSearchParams({
    shop_domain: getJudgemeShopDomain(),
    platform: "shopify",
    page: String(requestedPage),
    per_page: String(ALL_REVIEWS_PAGE_SIZE),
    review_type: reviewType,
  }).toString();

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 300, tags: ["judgeme-all-reviews"] },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return null;
    const data = await response.json() as {
      html?: unknown;
      number_of_product_reviews?: unknown;
      number_of_shop_reviews?: unknown;
    };
    // Judge.me sends totals on page one only; subsequent pages contain HTML
    // and a page number. Reuse the cached first page rather than treating the
    // missing counts as zero or rejecting otherwise valid review pages.
    const firstPage = requestedPage > 1 && (
      data.number_of_product_reviews == null || data.number_of_shop_reviews == null
    ) ? await getJudgemeAllReviewsPage(1, reviewType) : null;
    const productReviewCount = Number(data.number_of_product_reviews ?? firstPage?.productReviewCount);
    const shopReviewCount = Number(data.number_of_shop_reviews ?? firstPage?.shopReviewCount);
    if (
      typeof data.html !== "string" ||
      !Number.isSafeInteger(productReviewCount) || productReviewCount < 0 ||
      !Number.isSafeInteger(shopReviewCount) || shopReviewCount < 0
    ) return null;

    const total = reviewType === "product-reviews" ? productReviewCount : shopReviewCount;
    const lastPage = Math.max(1, Math.ceil(total / ALL_REVIEWS_PAGE_SIZE));
    if (requestedPage > lastPage) return getJudgemeAllReviewsPage(lastPage, reviewType);

    const html = sanitizeHtml(data.html, {
      allowedTags: [...sanitizeHtml.defaults.allowedTags, "img", "video", "source", "track", "time"],
      allowedAttributes: {
        "*": ["class", "id", "title", "role", "aria-*", "data-*", "tabindex"],
        a: ["href", "target", "rel"],
        img: ["src", "srcset", "sizes", "alt", "width", "height", "loading"],
        video: ["src", "poster", "controls", "playsinline", "preload", "width", "height"],
        source: ["src", "type"],
        track: ["src", "kind", "srclang", "label", "default"],
        time: ["datetime"],
      },
      allowedSchemes: ["https", "http"],
      allowProtocolRelative: false,
      transformTags: {
        a: (tagName, attributes) => {
          let productHref = attributes.href || "";
          if (productHref.startsWith(`https://${getJudgemeShopDomain()}/`)) {
            productHref = productHref.slice(`https://${getJudgemeShopDomain()}`.length);
          }
          const productMatch = productHref.match(/^\/products\/([^?#/]+)(.*)$/);
          if (productMatch) {
            attributes.href = `/shop/${normalizeProductSlug(productMatch[1])}${productMatch[2]}`;
            delete attributes.target;
          } else if (attributes.target === "_blank") {
            attributes.rel = "noopener noreferrer";
          }
          return { tagName, attribs: attributes };
        },
        img: (tagName, attributes) => ({
          tagName,
          attribs: { ...attributes, loading: "lazy" },
        }),
      },
    });

    return { html, page: requestedPage, reviewType, productReviewCount, shopReviewCount };
  } catch {
    console.warn("[Judge.me] Could not load the requested reviews page.");
    return null;
  }
}
