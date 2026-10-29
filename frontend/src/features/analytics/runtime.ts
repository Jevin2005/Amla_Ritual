import type { Product } from "@/domain/catalog/products";
import { AnalyticsEvent, trackCartAnalytics, type AnalyticsCart, type StorefrontAnalytics, type ProductPayload } from "@shopify/hydrogen";
import { ecommercePayload, productItem, safePageUrl, type EcommercePayload } from "./ecommerce";

type Privacy = { analyticsProcessingAllowed: () => boolean };
type AnalyticsWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  Shopify?: { customerPrivacy?: Privacy; analytics?: StorefrontAnalytics };
  naturemistConsent?: { analytics: boolean };
};
export type AnalyticsConfig = {
  enabled: boolean;
  gaId: string;
  shopifyEnabled: boolean;
  hosts: string[];
};
type EventPayload = Partial<EcommercePayload> & { search_term?: string; result_count?: number; item_list_id?: string; item_list_name?: string };
type EventName = "view_item" | "view_item_list" | "select_item" | "add_to_cart" | "remove_from_cart" | "view_cart" | "checkout_handoff" | "search";
let config: AnalyticsConfig | undefined;
let catalog: readonly Product[] = [];
let consent = false;
let initializedGa = false;
let lastPage = "";
let lastPageKey = "";
let previousPage = "";
type Destination = "google" | "shopify";
export type CartViewDelivery = Partial<Record<Destination, true>>;
export type SearchViewDelivery = Partial<Record<Destination, true>>;
const pageDestinations = new Set<Destination>();
const observed = new Map<string, Set<Destination>>();
const browser = () => window as AnalyticsWindow;

function permitted() {
  if (typeof window === "undefined" || !config?.enabled || !config.hosts.includes(window.location.hostname)) return false;
  try {
    const privacy = browser().Shopify?.customerPrivacy;
    return privacy ? privacy.analyticsProcessingAllowed() === true : browser().naturemistConsent?.analytics === true;
  } catch { return false; }
}

function gtag(...args: unknown[]) {
  try {
    if (typeof browser().gtag !== "function") return false;
    browser().gtag!(...args);
    return true;
  } catch { return false; /* Third-party code cannot interrupt shopping. */ }
}
function initializeGoogle() {
  if (initializedGa || !config || !/^G-[A-Z0-9]+$/.test(config.gaId)) return;
  try {
  const target = browser();
  target.dataLayer ||= [];
  // Google's documented queue uses Arguments objects (not arbitrary dataLayer events).
  // eslint-disable-next-line prefer-rest-params -- Match Google's documented gtag queue format.
  target.gtag = function () { target.dataLayer!.push(arguments); };
  gtag("consent", "default", { analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
  gtag("consent", "update", { analytics_storage: "granted" });
  gtag("js", new Date());
  gtag("config", config.gaId, {
    send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false,
    page_location: safePageUrl(window.location.href, catalog.map((product) => product.slug)),
    page_referrer: safePageUrl(document.referrer),
    page_title: "NatureMist",
  });
  const script = document.createElement("script");
  script.id = "naturemist-google-tag";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${config.gaId}`;
  document.head.appendChild(script);
  initializedGa = true;
  } catch { /* Blocked scripts must not throw into a React effect. */ }
}

export function synchronizeConsent() {
  const allowed = permitted();
  if (allowed !== consent) {
    lastPage = "";
    lastPageKey = "";
    previousPage = "";
    pageDestinations.clear();
    observed.clear();
  }
  consent = allowed;
  if (config?.gaId) (window as unknown as Record<string, unknown>)[`ga-disable-${config.gaId}`] = !allowed;
  if (allowed) initializeGoogle();
  if (initializedGa) gtag("consent", "update", { analytics_storage: allowed ? "granted" : "denied" });
  return allowed;
}

export function configureAnalytics(next: AnalyticsConfig, products: readonly Product[]) {
  config = next;
  catalog = products;
  synchronizeConsent();
}

function context() {
  return { page_location: safePageUrl(window.location.href, catalog.map((product) => product.slug)), page_referrer: previousPage || safePageUrl(document.referrer), page_title: "NatureMist" };
}

/** Reset before any event: a product effect can run before the route bridge. */
function enterPage(pageKey?: string) {
  const location = new URL(window.location.href);
  const key = pageKey ?? `${location.pathname}${location.search}`;
  if (lastPageKey !== key) {
    previousPage = lastPage || safePageUrl(document.referrer);
    lastPage = context().page_location;
    lastPageKey = key;
    pageDestinations.clear();
    observed.clear();
  }
  return context();
}

function shopifyBus() {
  return permitted() && config?.shopifyEnabled ? browser().Shopify?.analytics : undefined;
}

/** Adapt confirmed server snapshots to Shopify's official cart tracker; never replay pre-consent changes. */
export function trackConfirmedShopifyCart(before: AnalyticsCart | undefined, after: AnalyticsCart | undefined) {
  try {
    if (!shopifyBus() || !after?.updatedAt) return;
    const snapshot = (cart?: AnalyticsCart) => ({
      data: { ...cart, lines: { nodes: (cart?.lines.nodes || []).map((line) => ({
        ...line, cost: { amountPerQuantity: line.merchandise.price },
      })) } },
      revalidating: false,
      pending: { cost: false, note: false, attributes: false, lines: new Set(), discountCodes: new Set() },
    });
    // The tracker only reads these fields; the existing store remains the cart authority.
    type TrackerStore = Parameters<typeof trackCartAnalytics>[0];
    const store = {
      getState: () => snapshot(before),
      subscribe: (listener: (state: ReturnType<typeof snapshot>) => void) => {
        listener(snapshot(after));
        return () => {};
      },
    };
    trackCartAnalytics(store as unknown as TrackerStore)();
  } catch { /* Blocked storage or analytics must never affect a cart action. */ }
}

export function trackPage(pageKey?: string) {
  try {
    if (!synchronizeConsent()) return;
    const page = enterPage(pageKey);
    if (initializedGa && !pageDestinations.has("google") && gtag("event", "page_view", { ...page, send_to: config!.gaId })) pageDestinations.add("google");
    const bus = shopifyBus();
    if (bus && !pageDestinations.has("shopify")) {
      bus.publish(AnalyticsEvent.PAGE_VIEWED, { url: page.page_location });
      pageDestinations.add("shopify");
    }
  } catch { /* Tracking is optional. */ }
}

function publishEcommerce(event: EventName, payload: EventPayload, sent: ReadonlySet<Destination> = new Set(), cart?: AnalyticsCart): Set<Destination> {
  const delivered = new Set<Destination>();
  try {
    if (!["view_item", "view_item_list", "select_item", "add_to_cart", "remove_from_cart", "view_cart", "checkout_handoff", "search"].includes(event)) return delivered;
    if (!synchronizeConsent()) return delivered;
    const page = enterPage();
    if (event !== "search" && (!Array.isArray(payload.items) || (event !== "view_cart" && !payload.items.length) || !/^[A-Z]{3}$/.test(payload.currency || ""))) return delivered;
    // Explicit field construction; never forward caller objects, cart keys, or buyer identity.
    const clean = event === "search"
      ? { search_term: payload.search_term, result_count: payload.result_count }
      : { ...ecommercePayload(payload.items!.map((item) => ({
          item_id: item.item_id, item_name: item.item_name, item_category: item.item_category,
          item_variant: item.item_variant, price: item.price, quantity: item.quantity,
        })), payload.currency!), item_list_id: payload.item_list_id, item_list_name: payload.item_list_name };
    if (event !== "search" && payload.items!.some((item) => !Number.isFinite(item.price) || item.price < 0 || !Number.isInteger(item.quantity) || item.quantity < 1)) return delivered;
    if (initializedGa && !sent.has("google") && (event === "search" || payload.items!.length) && gtag("event", event, { ...clean, ...page, send_to: config!.gaId })) delivered.add("google");
    const bus = shopifyBus();
    if (!bus || sent.has("shopify")) return delivered;
    if (event === "view_cart") {
      bus.publish(AnalyticsEvent.CART_VIEWED, { cart: sanitizeAnalyticsCart(cart), url: page.page_location });
      delivered.add("shopify");
    }
    if (event === "search") {
      bus.publish(AnalyticsEvent.SEARCH_VIEWED, { searchTerm: payload.search_term || "[redacted]", searchResults: { totalCount: payload.result_count || 0 }, url: page.page_location });
      delivered.add("shopify");
    }
    if (event === "view_item") {
      const products = payload.items!.flatMap((item) => {
        const product = catalog.find((entry) => entry.id === item.item_id);
        const variant = product?.variants?.find((entry) => entry.title === item.item_variant);
        const variantId = item.shopifyVariantId || variant?.id;
        if (!/^gid:\/\/shopify\/Product\/\d+$/.test(item.item_id) || !variantId || !/^gid:\/\/shopify\/ProductVariant\/\d+$/.test(variantId)) return [];
        return [{ id: item.item_id, title: item.item_name, price: { amount: String(item.price), currencyCode: payload.currency as ProductPayload["price"]["currencyCode"] }, vendor: item.shopifyVendor || product?.vendor || "NatureMist", variantId, variantTitle: item.item_variant || variant?.title || "Default Title", quantity: item.quantity, sku: item.shopifySku ?? variant?.sku ?? null, productType: item.item_category }];
      });
      if (products.length) {
        bus.publish(AnalyticsEvent.PRODUCT_VIEWED, { products, url: page.page_location });
        delivered.add("shopify");
      }
    }
  } catch { /* Keep delivery acknowledgements from another working destination. */ }
  return delivered;
}

export function trackEcommerce(event: EventName, payload: EventPayload): boolean {
  return publishEcommerce(event, payload).size > 0;
}

export function trackImpression(key: string, event: "view_item" | "view_item_list", payload: EcommercePayload) {
  try {
    if (!synchronizeConsent()) return;
    enterPage();
    const sent = observed.get(key) || new Set<Destination>();
    for (const destination of publishEcommerce(event, payload, sent)) sent.add(destination);
    if (sent.size) observed.set(key, sent);
  } catch { /* Tracking is optional. */ }
}

export function trackCartView(payload: EcommercePayload, cart?: AnalyticsCart, delivery: CartViewDelivery = {}): boolean {
  if (!synchronizeConsent()) return false;
  const sent = new Set<Destination>();
  if (delivery.google) sent.add("google");
  if (delivery.shopify) sent.add("shopify");
  for (const destination of publishEcommerce("view_cart", payload, sent, cart)) delivery[destination] = true;
  // A successful Google send must not prevent a late Shopify destination from
  // receiving this same viewing. The caller retains acknowledgements per view.
  const expected: Destination[] = [];
  if (config?.gaId && payload.items.length) expected.push("google");
  if (config?.shopifyEnabled) expected.push("shopify");
  return expected.length > 0 && expected.every((destination) => delivery[destination]);
}

export function trackSearchView(payload: { search_term: string; result_count: number }, delivery: SearchViewDelivery = {}): boolean {
  if (!synchronizeConsent()) return false;
  const sent = new Set<Destination>();
  if (delivery.google) sent.add("google");
  if (delivery.shopify) sent.add("shopify");
  for (const destination of publishEcommerce("search", payload, sent)) delivery[destination] = true;
  const expected: Destination[] = [];
  if (config?.gaId) expected.push("google");
  if (config?.shopifyEnabled) expected.push("shopify");
  return expected.length > 0 && expected.every((destination) => delivery[destination]);
}

/** Only public commerce fields may enter a cart-view payload. */
function sanitizeAnalyticsCart(cart?: AnalyticsCart): AnalyticsCart | null {
  if (!cart?.id) return null;
  const money = (value: unknown) => {
    if (!value || typeof value !== "object") return undefined;
    const source = value as { amount?: unknown; currencyCode?: unknown };
    return {
      ...(typeof source.amount === "string" && /^\d+(?:\.\d+)?$/.test(source.amount) ? { amount: source.amount } : {}),
      ...(typeof source.currencyCode === "string" && /^[A-Z]{3}$/.test(source.currencyCode) ? { currencyCode: source.currencyCode } : {}),
    };
  };
  return {
    id: cart.id.split("?")[0], updatedAt: cart.updatedAt,
    cost: { subtotalAmount: money(cart.cost?.subtotalAmount), totalAmount: money(cart.cost?.totalAmount) },
    lines: { nodes: (cart.lines.nodes || cart.lines.edges?.map(({ node }) => node) || []).map((line) => ({
      id: line.id.split("?")[0], quantity: line.quantity,
      merchandise: {
        id: line.merchandise.id, title: line.merchandise.title, price: { amount: line.merchandise.price.amount, currencyCode: line.merchandise.price.currencyCode },
        product: { id: line.merchandise.product.id, title: line.merchandise.product.title, vendor: line.merchandise.product.vendor, productType: line.merchandise.product.productType, handle: line.merchandise.product.handle },
      },
    })) },
  };
}

/** Existing non-commerce hooks are intentionally not forwarded to third parties. */
export function trackLegacy(event: string, payload: Record<string, string | number | boolean | undefined>) {
  if (event !== "select_item") return;
  const product = catalog.find((entry) => entry.slug === payload.item_id || entry.id === payload.item_id);
  if (product) trackEcommerce("select_item", ecommercePayload([productItem(product)], product.currencyCode || "INR"));
}
