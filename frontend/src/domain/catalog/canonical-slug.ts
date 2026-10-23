/**
 * Canonical product slug utility for NatureMist storefront.
 * Ensures consistent, clean, and user-friendly paths (e.g. /shop/reetha-powder,
 * /shop/amla-powder, /shop/indigo-powder) regardless of internal Shopify handle naming.
 *
 * Automatically generates a clean, readable path for ANY new product listing,
 * and accurately resolves links between author reviews and the appropriate product.
 */

const GENERIC_TITLE_WORDS = new Set([
  "naturemist",
  "100",
  "pure",
  "organic",
  "herbal",
  "natural",
  "jar",
  "powder",
  "grams",
  "gram",
  "250g",
  "100g",
  "500g",
]);

/**
 * Generates a clean, canonical URL slug from a product title and fallback handle.
 * E.g., "NatureMist Reetha Powder" -> "reetha-powder"
 * E.g., "NatureMist Indigo Powder" -> "indigo-powder"
 * E.g., "NatureMist Amla Powder" -> "amla-powder"
 * E.g., "NatureMist Shikakai Powder" -> "shikakai-powder"
 * E.g., "Pure Brahmi Powder" -> "brahmi-powder"
 */
export function getCanonicalProductSlug(
  title: string | null | undefined,
  fallbackHandle?: string | null,
): string {
  const rawTitle = (title || "").trim();
  const rawHandle = (fallbackHandle || "").trim().toLowerCase();

  if (rawTitle) {
    // 1. Remove brand prefix like "NatureMist "
    let clean = rawTitle.replace(/^naturemist\s+/i, "").trim();

    // 2. Remove packaging / weight specifications from title for clean URLs
    clean = clean
      .replace(/\b(100%|pure|organic|herbal|natural|jar|250g|100g|500g)\b/gi, "")
      .replace(/\s+/g, " ")
      .trim();

    // 3. Slugify
    const slug = clean
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (slug && slug.length >= 2) {
      return slug;
    }
  }

  // Fallback to sanitized handle
  if (rawHandle) {
    const cleanHandle = rawHandle
      .replace(/^naturemist-/i, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    if (cleanHandle) return cleanHandle;
  }

  return "product";
}

/**
 * Checks whether a given URL slug or candidate path matches a product.
 * Supports:
 *  - Canonical slug (e.g. "reetha-powder")
 *  - Raw Shopify handle (e.g. "wildcrafted-amla-powder")
 *  - Normalized alias (e.g. "amla" -> "amla-powder")
 *  - Distinctive product tokens (e.g. "shikakai", "brahmi")
 */
export function matchesProductSlug(
  candidate: string | null | undefined,
  product: { slug: string; shopifyHandle?: string; name?: string },
): boolean {
  if (!candidate || !product) return false;

  const c = candidate
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\/[^/]+\//, "")
    .replace(/^\/?shop\//, "")
    .replace(/#.*$/, "")
    .replace(/\?.*$/, "")
    .replace(/^-+|-+$/g, "");

  if (!c) return false;

  const canonicalSlug = (product.slug || "").toLowerCase();
  const shopifyHandle = (product.shopifyHandle || "").toLowerCase();
  const productName = (product.name || "").toLowerCase();

  // 1. Exact match with canonical slug (Highest priority)
  if (c === canonicalSlug) return true;

  // 2. Exact match with raw Shopify handle
  if (shopifyHandle && c === shopifyHandle) return true;

  // 3. Match without "naturemist-" prefix
  const cWithoutBrand = c.replace(/^naturemist-/i, "");
  if (cWithoutBrand === canonicalSlug || (shopifyHandle && cWithoutBrand === shopifyHandle)) {
    return true;
  }

  // 4. Match against slug derived directly from current product name
  if (productName) {
    const derivedSlug = getCanonicalProductSlug(productName, shopifyHandle);
    if (c === derivedSlug || cWithoutBrand === derivedSlug) {
      return true;
    }
  }

  // 5. Special known historical aliases for existing catalog items
  if (c === "amla" && canonicalSlug === "amla-powder") return true;
  if (c === "amla-powder" && shopifyHandle === "amla") return true;

  return false;
}

/**
 * Finds the matching product from a list of products using canonical slug resolution.
 */
export function findProductBySlug<
  T extends { slug: string; shopifyHandle?: string; name: string },
>(candidate: string | null | undefined, products: readonly T[]): T | undefined {
  if (!candidate || !products || products.length === 0) return undefined;

  // Priority 1: Exact match on canonical slug
  const exactSlug = products.find(
    (p) => p.slug.toLowerCase() === candidate.toLowerCase().trim(),
  );
  if (exactSlug) return exactSlug;

  // Priority 2: Full flexible matcher (shopifyHandle, brandless, alias)
  const flexible = products.find((p) => matchesProductSlug(candidate, p));
  if (flexible) return flexible;

  // Priority 3: Distinctive keyword token match (e.g. for new listings where user typed "brahmi")
  const candidateTokens = candidate
    .toLowerCase()
    .replace(/[^a-z0-9]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !GENERIC_TITLE_WORDS.has(w));

  if (candidateTokens.length > 0) {
    const tokenMatch = products.find((p) => {
      const pTokens = (p.name || "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length >= 4 && !GENERIC_TITLE_WORDS.has(w));
      return candidateTokens.some((t) => pTokens.includes(t));
    });
    if (tokenMatch) return tokenMatch;
  }

  return undefined;
}
