import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { products } from "@/domain/catalog/products";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host")?.split(",")[0]?.trim() ||
    requestHeaders.get("host") ||
    "localhost:3000";
  const protocol =
    requestHeaders.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
    (host.startsWith("localhost") ? "http" : "https");
  const base = `${protocol}://${host}`;
  const routes = ["", "/shop", "/rituals", "/our-story", "/shipping-returns", "/privacy", "/terms"];

  return [
    ...routes.map((route) => ({ url: `${base}${route}`, changeFrequency: "monthly" as const, priority: route === "" ? 1 : 0.7 })),
    ...products.map((product) => ({ url: `${base}/shop/${product.slug}`, changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
}
