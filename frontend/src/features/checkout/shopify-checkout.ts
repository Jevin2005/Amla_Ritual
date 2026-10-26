import type { StoreCart } from "@/features/store/store-provider";
import { hasCheckoutCartChanged } from "./checkout-cart";

type CheckoutSnapshot = Parameters<typeof hasCheckoutCartChanged>[0];

export function checkoutCartIssue(cart: Pick<StoreCart, "items">): string | null {
  if (!cart.items.length) return "Your bag is empty. Please add your items again.";
  if (cart.items.some((item) => !item.availableForSale)) {
    return "Remove unavailable items from your bag to continue.";
  }
  if (cart.items.some((item) => !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > Math.min(12, item.quantityAvailable ?? 12))) {
    return "Adjust the quantities in your bag to match the available stock.";
  }
  return null;
}

export function validateCheckoutUrl(value: string | null, allowedHosts: readonly string[]): string {
  const message = "Secure checkout is temporarily unavailable. Please try again.";
  if (!value) throw new Error(message);
  let url: URL;
  try { url = new URL(value); } catch { throw new Error(message); }
  const hosts = allowedHosts.map((host) => host.trim().toLowerCase());
  if (url.protocol !== "https:" || url.username || url.password || url.port ||
      !hosts.includes(url.hostname) || !/^\/(?:checkouts\/|cart\/c\/)/.test(url.pathname)) {
    throw new Error(message);
  }
  // Shopify's token and query parameters must remain untouched.
  return value;
}

export async function prepareShopifyCheckout({ source, previousCart, refreshCart, allowedHosts }: {
  source: "shopify" | "preview";
  previousCart: CheckoutSnapshot;
  refreshCart: () => Promise<StoreCart | null>;
  allowedHosts: readonly string[];
}): Promise<{ url: string; cart: StoreCart }> {
  if (source !== "shopify") throw new Error("Checkout is unavailable in preview mode.");
  const refreshed = await refreshCart();
  if (!refreshed) throw new Error("We could not confirm your latest bag. Please try again.");
  const issue = checkoutCartIssue(refreshed);
  if (issue) throw new Error(issue);
  if (hasCheckoutCartChanged(previousCart, refreshed)) {
    throw new Error("Your bag has changed. Review the updated items and totals, then continue again.");
  }
  return { url: validateCheckoutUrl(refreshed.checkoutUrl, allowedHosts), cart: refreshed };
}
