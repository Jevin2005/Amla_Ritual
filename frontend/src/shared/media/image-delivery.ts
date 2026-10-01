import type { ImageLoaderProps } from "next/image";

export function isShopifyImage(src: string) {
  try {
    const url = new URL(src);
    return url.protocol === "https:" && url.hostname === "cdn.shopify.com" && url.pathname.startsWith("/s/files/");
  } catch {
    return false;
  }
}

// Let Shopify resize its own assets rather than downloading the original again
// through the hosting platform's image optimizer. Preserve the version key.
export function shopifyImageLoader({ src, width }: ImageLoaderProps) {
  if (!isShopifyImage(src)) return src;
  const url = new URL(src);
  url.searchParams.set("width", String(Math.min(2560, Math.max(1, Math.round(width)))));
  return url.href;
}
