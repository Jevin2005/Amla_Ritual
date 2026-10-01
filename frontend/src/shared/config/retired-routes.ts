/** Also recognise legacy Shopify menu URLs for the removed rituals page. */
export function isRetiredRitualUrl(value: string): boolean {
  try {
    const path = new URL(value, "https://storefront.invalid").pathname.replace(/\/+$/, "").toLowerCase();
    return path === "/rituals" || path === "/pages/rituals" || path === "/pages/ritual";
  } catch {
    return false;
  }
}
