import type { MetadataRoute } from "next";
import { getPublicSiteUrl } from "@/lib/site-url";
import { getStorefront } from "@/lib/shopify/storefront";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const storefront = await getStorefront();
  const base = getPublicSiteUrl();
  const routes = ["", "/shop", "/rituals", "/our-story", "/shipping-returns", "/privacy", "/terms"];

  return [
    ...routes.map((route) => ({ url: `${base}${route}`, changeFrequency: "monthly" as const, priority: route === "" ? 1 : 0.7 })),
    ...storefront.products.map((product) => ({
      url: `${base}/shop/${product.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      images: product.featuredImage ? [product.featuredImage.url] : undefined,
    })),
  ];
}
