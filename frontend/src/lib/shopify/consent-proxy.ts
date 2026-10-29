import { createShopifyRequestContext, createStorefrontClient, handleShopifyRoutes } from "@shopify/hydrogen";
import { getShopifyStoreDomain } from "./privacy-config";
import { getPublicRequestUrl, getShopifyBuyerIp } from "./cart-session";

/** Only Shopify's browser API namespaces reach this handler; existing application routes stay owned by Next. */
export async function handleConsentRequest(request: Request) {
  const domain = getShopifyStoreDomain();
  if (!domain) return Response.json({ error: "Shopify privacy is not configured." }, { status: 503 });
  // Next can expose an internal URL behind a proxy. Host is the incoming public
  // authority; trusted hosting must overwrite the forwarded protocol header.
  const publicUrl = getPublicRequestUrl(request);
  const origin = request.headers.get("origin");
  if ((origin && origin !== publicUrl.origin) || request.headers.get("sec-fetch-site") === "cross-site") return new Response(null, { status: 403 });
  const headers = new Headers(request.headers);
  for (const name of ["authorization", "Shopify-Storefront-Private-Token", "X-Shopify-Access-Token"]) headers.delete(name);
  const init: RequestInit & { duplex?: "half" } = {
    method: request.method, headers, signal: request.signal,
    ...(!["GET", "HEAD"].includes(request.method) ? { body: request.body, duplex: "half" as const } : {}),
  };
  request = new Request(publicUrl, init);
  const buyerIp = getShopifyBuyerIp(request);
  const i18n = { country: "IN", language: "EN" } as const;
  const requestContext = buyerIp
    ? createShopifyRequestContext({ request, buyerIp, i18n })
    : createShopifyRequestContext({ request, i18n });
  // The browser proxy is deliberately tokenless. Never attach a private token to browser-supplied GraphQL.
  const storefrontClient = createStorefrontClient({ type: "public", requestContext, config: {
    storeDomain: domain, storefrontId: "0",
  } });
  const response = await handleShopifyRoutes({ request, requestContext, storefrontClient });
  return response || new Response(null, { status: 404 });
}
