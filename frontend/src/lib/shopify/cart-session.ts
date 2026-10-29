import { createShopifyRequestContext, createStorefrontClient, type StorefrontClient } from "@shopify/hydrogen";

export type CartRequestSession = { buyerIp: string | null; client: StorefrontClient };

export function getPublicRequestUrl(request: Request) {
  const url = new URL(request.url);
  const host = request.headers.get("host");
  if (host) { url.port = ""; url.host = host; }
  const protocol = request.headers.get("x-forwarded-proto");
  if (protocol === "https" || protocol === "http") url.protocol = `${protocol}:`;
  return url;
}

export function createCartRequestSession(request: Request, buyerIp: string | null): CartRequestSession {
  const contextRequest = { url: getPublicRequestUrl(request).href, headers: request.headers, method: request.method, signal: request.signal };
  const config = {
    storeDomain: process.env.SHOPIFY_STORE_DOMAIN || "unconfigured.myshopify.com",
    storefrontId: "0",
    apiVersion: process.env.SHOPIFY_STOREFRONT_API_VERSION || "2026-07",
  };
  const i18n = { country: "IN", language: "EN" } as const;
  const privateToken = process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN;
  if (buyerIp && privateToken) {
    const requestContext = createShopifyRequestContext({ request: contextRequest, buyerIp, i18n });
    return { buyerIp, client: createStorefrontClient({ type: "private", requestContext, config: { ...config, privateStorefrontToken: privateToken } }) };
  }
  const requestContext = createShopifyRequestContext({ request: contextRequest, i18n });
  return { buyerIp, client: createStorefrontClient({ type: "public", requestContext, config: {
    ...config, publicStorefrontToken: process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || undefined,
  } }) };
}

// These forwarding headers must be overwritten by the hosting platform at its trusted ingress.
function validIpv4(value: string) {
  const parts = value.split(".");
  return (
    parts.length === 4 &&
    parts.every((part) => /^\d{1,3}$/.test(part) && Number(part) <= 255)
  );
}

export function getShopifyBuyerIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0];
  const candidate = (
    request.headers.get("cf-connecting-ip") ||
    forwarded ||
    request.headers.get("x-real-ip") ||
    ""
  ).trim();
  // Local development proxies report loopback; it is not a visitor geolocation.
  if (candidate === "::1" || candidate.startsWith("127.") || candidate.startsWith("::ffff:127.")) return null;
  if (validIpv4(candidate)) return candidate;
  if (
    candidate.length <= 45 &&
    candidate.includes(":") &&
    /^[0-9a-f:.]+$/i.test(candidate)
  ) {
    return candidate;
  }
  return null;
}

