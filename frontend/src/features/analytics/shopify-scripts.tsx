"use client";

import { ShopifyScripts } from "@shopify/hydrogen/react";
import { useRouter } from "next/navigation";

export function ShopifyConsentScripts({ shop, analyticsEnabled }: {
  shop: { shopId: string; storefrontId: string; myshopifyDomain: string };
  analyticsEnabled: boolean;
}) {
  const router = useRouter();
  return <ShopifyScripts
    shop={shop}
    i18n={{ country: "IN", language: "EN", currency: "INR" }}
    consent={{ mode: "default-banner" }}
    analytics={{ channel: "headless" }}
    shopifyAnalytics={analyticsEnabled}
    navigate={(url) => router.push(url)}
    routes={{ product: "/shop/:productHandle" }}
    webMcp={false}
  />;
}
