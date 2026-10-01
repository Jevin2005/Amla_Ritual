import type { Product } from "@/domain/catalog/products";
import { getHeroTheme } from "@/domain/catalog/hero-theme";

export function getHeroPresentation(product: Product) {
  const theme = getHeroTheme(product);
  return {
    theme,
    firstLine: product.hero?.headlineFirst?.trim() || "Discover",
    productLine: product.hero?.headlineMiddle?.trim() || `${theme.name.replace(/\.$/, "")}.`,
    tagline: product.hero?.headlineItalic?.trim() || theme.tagline || "Botanical ritual.",
    description: product.hero?.description?.trim() || product.shortDescription,
  };
}
