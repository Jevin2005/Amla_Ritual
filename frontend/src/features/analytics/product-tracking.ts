"use client";

import { useEffect, useRef } from "react";
import type { Product, ProductVariant } from "@/domain/catalog/products";
import { ecommercePayload, productItem } from "./ecommerce";
import { trackImpression } from "./runtime";

const EVENTS = ["naturemist:analytics-ready", "visitorConsentCollected", "consentTrackingApiLoaded", "shopifyCustomerPrivacyApiLoaded", "naturemist:consent"];

export function useProductView(product: Product | undefined, variant?: ProductVariant | null) {
  useEffect(() => {
    if (!product?.id) return;
    const record = () => trackImpression(`detail:${product.id}:${variant?.id || "default"}`, "view_item",
      ecommercePayload([productItem(product, variant)], variant?.currencyCode || product.currencyCode || "INR"));
    record();
    for (const event of EVENTS) document.addEventListener(event, record);
    return () => { for (const event of EVENTS) document.removeEventListener(event, record); };
  }, [product, variant]);
}

/** One impression per product per page, only after it actually enters the viewport. */
export function useProductListImpression(product: Product, enabled: boolean) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!enabled || !product.id || !element || typeof IntersectionObserver === "undefined") return;
    let visible = false;
    const record = () => {
      if (visible) trackImpression(`list:${product.id}`, "view_item_list", ecommercePayload([productItem(product)], product.currencyCode || "INR"));
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting && entry.intersectionRatio >= 0.25; record(); }, { threshold: 0.25 });
    observer.observe(element);
    for (const event of EVENTS) document.addEventListener(event, record);
    return () => { observer.disconnect(); for (const event of EVENTS) document.removeEventListener(event, record); };
  }, [product, enabled]);
  return ref;
}
