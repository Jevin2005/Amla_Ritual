"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useStore } from "@/features/store/store-provider";
import { cartPayload } from "./ecommerce";
import { configureAnalytics, synchronizeConsent, trackCartView, trackPage, type AnalyticsConfig, type CartViewDelivery } from "./runtime";

export const CONSENT_EVENTS = ["visitorConsentCollected", "consentTrackingApiLoaded", "shopifyCustomerPrivacyApiLoaded", "naturemist:consent"];

/** Zero rendered elements; existing UI and layout remain unchanged. */
export function AnalyticsBridge({ config }: { config: AnalyticsConfig }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // This key stays in memory. Published URLs are sanitized by the runtime.
  const query = searchParams.toString();
  const pageKey = `${pathname}${query ? `?${query}` : ""}`;
  const { source, products, cart, analyticsCart, currencyCode, isCartOpen, isCartBusy, isHydrated } = useStore();
  const cartViewContext = isCartOpen ? `drawer:${pathname}` : pathname === "/checkout" ? "checkout" : "";
  const cartViewed = useRef<{ context: string; complete: boolean; delivery: CartViewDelivery }>({ context: "", complete: false, delivery: {} });
  useEffect(() => {
    configureAnalytics({ ...config, enabled: config.enabled && source === "shopify" }, products);
    const update = () => {
      synchronizeConsent(); trackPage();
      document.dispatchEvent(new Event("naturemist:analytics-ready"));
    };
    update();
    for (const event of CONSENT_EVENTS) document.addEventListener(event, update);
    return () => { for (const event of CONSENT_EVENTS) document.removeEventListener(event, update); };
  }, [config, products, source, pageKey]);
  useEffect(() => {
    if (cartViewed.current.context !== cartViewContext) cartViewed.current = { context: cartViewContext, complete: false, delivery: {} };
    if (!cartViewContext || !isHydrated || isCartBusy || cartViewed.current.complete) return;
    const viewing = cartViewed.current;
    const view = () => {
      if (!viewing.complete) viewing.complete = trackCartView(cartPayload({ items: cart, currencyCode }, products), analyticsCart, viewing.delivery);
    };
    view();
    for (const event of CONSENT_EVENTS) document.addEventListener(event, view);
    return () => { for (const event of CONSENT_EVENTS) document.removeEventListener(event, view); };
  }, [cart, analyticsCart, currencyCode, cartViewContext, isCartBusy, isHydrated, products]);
  return null;
}
