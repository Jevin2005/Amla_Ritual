import { getDefaultVariant, type Product, type ProductVariant } from "@/domain/catalog/products";
import type { CartItem, StoreCart } from "@/features/store/store-provider";

export type AnalyticsItem = {
  item_id: string;
  item_name: string;
  item_category: string;
  item_variant?: string;
  /** Internal Shopify identifiers; explicitly excluded from Google event fields. */
  shopifyVariantId?: string;
  shopifyVendor?: string;
  shopifySku?: string | null;
  price: number;
  quantity: number;
};
export type EcommercePayload = {
  currency: string;
  value: number;
  items: AnalyticsItem[];
};

// Product IDs are consistent across catalogue, cart and Shopify checkout pixels.
export function productItem(product: Product, variant: ProductVariant | null = getDefaultVariant(product)): AnalyticsItem {
  return {
    item_id: product.id || product.slug,
    item_name: product.name,
    item_category: product.productType || product.ritualStep || "Botanical care",
    item_variant: variant?.title,
    shopifyVariantId: variant?.id,
    shopifyVendor: product.vendor,
    shopifySku: variant?.sku,
    price: (variant?.pricePaise ?? product.pricePaise) / 100,
    quantity: 1,
  };
}

export function cartItem(line: CartItem, catalog: readonly Product[] = [], quantity = line.quantity): AnalyticsItem {
  const product = catalog.find((entry) => entry.id === line.productId || entry.slug === line.slug);
  return {
    item_id: line.productId || line.slug,
    item_name: line.productName,
    item_category: product?.productType || product?.ritualStep || "Botanical care",
    item_variant: line.variantTitle,
    price: line.quantity > 0 ? line.lineTotalPaise / line.quantity / 100 : line.pricePaise / 100,
    quantity,
  };
}

export function ecommercePayload(items: AnalyticsItem[], currency: string): EcommercePayload {
  return { currency, value: Math.round(items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100) / 100, items };
}

export function cartPayload(cart: Pick<StoreCart, "items" | "currencyCode">, catalog: readonly Product[] = []) {
  return ecommercePayload(cart.items.map((line) => cartItem(line, catalog)), cart.currencyCode);
}

/** Compare accepted Shopify snapshots, never requested quantities or cart hydration. */
export function cartChanges(before: StoreCart, after: StoreCart, catalog: readonly Product[]) {
  const key = (line: CartItem) => line.variantId || line.productId || line.slug;
  const quantities = (lines: CartItem[]) => {
    const result = new Map<string, { line: CartItem; quantity: number }>();
    for (const line of lines) {
      const previous = result.get(key(line));
      result.set(key(line), { line, quantity: (previous?.quantity || 0) + line.quantity });
    }
    return result;
  };
  const previous = quantities(before.items);
  const next = quantities(after.items);
  const added: AnalyticsItem[] = [];
  const removed: AnalyticsItem[] = [];
  for (const id of new Set([...previous.keys(), ...next.keys()])) {
    const oldLine = previous.get(id);
    const newLine = next.get(id);
    const delta = (newLine?.quantity || 0) - (oldLine?.quantity || 0);
    if (delta > 0 && newLine) added.push(cartItem(newLine.line, catalog, delta));
    if (delta < 0 && oldLine) removed.push(cartItem(oldLine.line, catalog, -delta));
  }
  return { added: ecommercePayload(added, after.currencyCode), removed: ecommercePayload(removed, before.currencyCode) };
}

const publicPaths = new Set(["/", "/shop", "/combos", "/checkout", "/wishlist", "/reviews", "/our-story", "/contact", "/faqs", "/privacy", "/terms", "/shipping-returns", "/track-order"]);
/** No query, hash, arbitrary path, checkout token or free-text search leaves the app. */
export function safePageUrl(raw: string, productSlugs: readonly string[] = []): string {
  try {
    const url = new URL(raw);
    if (!/^https?:$/.test(url.protocol)) return "";
    const known = publicPaths.has(url.pathname) || productSlugs.some((slug) => url.pathname === `/shop/${slug}`);
    return `${url.origin}${known ? url.pathname : "/"}`;
  } catch { return ""; }
}

export function safeSearchTerm(query: string, products: readonly { name: string; slug: string; ritual?: string }[]) {
  const value = query.trim().toLowerCase();
  // A strict catalogue vocabulary prevents accidental email/phone/address disclosure.
  const vocabulary = new Set(products.flatMap((product) => [product.name, product.slug.replaceAll("-", " "), product.ritual || ""]).map((term) => term.toLowerCase()));
  return vocabulary.has(value) && value ? value : "[redacted]";
}
