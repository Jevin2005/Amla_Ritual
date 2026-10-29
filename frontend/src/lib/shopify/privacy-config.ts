/** Public storefront identifiers only. Never include access tokens here. */
export function getShopifyStoreDomain() {
  const domain = (process.env.SHOPIFY_STORE_DOMAIN || "").trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
  return /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(domain) ? domain : null;
}

export function getShopifyPrivacyConfig(shopId = "") {
  const domain = getShopifyStoreDomain();
  if (!domain || !/^gid:\/\/shopify\/Shop\/\d+$/.test(shopId)) return null;
  return { shopId, storefrontId: "0", myshopifyDomain: domain };
}
