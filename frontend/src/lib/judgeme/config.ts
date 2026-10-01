/**
 * Judge.me configuration and helpers for headless Shopify storefront.
 */

export function getJudgemeShopDomain(): string {
  const domain =
    process.env.NEXT_PUBLIC_JUDGEME_SHOP_DOMAIN ||
    "zyv78m-p7.myshopify.com";
  const clean = domain.trim().replace(/^https?:\/\//i, "").replace(/\/$/, "");
  if (clean === "amla-ritual.myshopify.com") {
    return "zyv78m-p7.myshopify.com";
  }
  return clean;
}

export function getJudgemePublicToken(): string {
  return (
    process.env.NEXT_PUBLIC_JUDGEME_PUBLIC_TOKEN?.trim() ||
    "gwz8iHp1Xmh0DeZQkN2efyvluxI"
  );
}

export function isJudgemeConfigured(): boolean {
  // If explicitly disabled with "false", return false
  if (process.env.NEXT_PUBLIC_ENABLE_JUDGEME === "false") {
    return false;
  }
  // Headless Judge.me requires a non-empty public token to authenticate and render reviews
  const token = getJudgemePublicToken();
  return Boolean(token);
}

/**
 * Extracts the raw numeric Shopify Product ID from a Storefront GraphQL GID.
 * E.g., "gid://shopify/Product/89201928172" -> "89201928172"
 */
export function extractNumericProductId(id?: string | null): string {
  if (!id) return "";
  const match = id.match(/\/Product\/(\d+)/i) || id.match(/^(\d+)$/);
  return match ? match[1] : id.replace(/^gid:\/\/shopify\/Product\//i, "");
}
