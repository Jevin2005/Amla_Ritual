import type { Product, StoreImage } from "./products";

export type ImageHeroProduct = Product & {
  heroEntryId: string;
  heroImage: StoreImage;
};

/** Label-based pack photographs belong only to the opening jar showcase. */
export function getImageHeroProducts(catalog: readonly Product[]): ImageHeroProduct[] {
  const labels = ["amla", "reetha", "indigo", "bhringraj", "hibiscus", "shikakai"];
  const seen = new Set<string>();
  return catalog.flatMap<ImageHeroProduct>((product) => {
    const label = labels.find((name) => new RegExp(`\\b${name}\\b`, "i").test(`${product.slug} ${product.name}`));
    if (!label || product.heroEnabled !== true || seen.has(label)) return [];
    seen.add(label);
    return [{ ...product, heroEntryId: product.id || product.slug, heroImage: {
      url: `/images/hero/naturemist-${label}-200g.png`,
      altText: `${product.name} in its NatureMist botanical care jar`,
      width: 1254,
      height: 1254,
    } }];
  }).sort((left, right) => {
    const order = (product: Product) => {
      const value = product.heroOrder ?? Number(product.collectionNumber);
      return Number.isFinite(value) ? value : Number.MAX_SAFE_INTEGER;
    };
    return order(left) - order(right);
  });
}
