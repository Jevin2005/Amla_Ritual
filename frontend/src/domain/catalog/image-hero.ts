import type { Product, StoreImage } from "./products";

export type ImageHeroProduct = Product & {
  heroEntryId: string;
  heroImage: StoreImage;
};

/** Share the opening hero's cutout with the matching 3D loading placeholder. */
export function getHeroJarImage(product: Pick<Product, "slug" | "name">): StoreImage | null {
  const labels = ["amla", "reetha", "indigo", "bhringraj", "hibiscus", "shikakai"];
  const label = labels.find((name) => new RegExp(`\\b${name}\\b`, "i").test(`${product.slug} ${product.name}`));
  return label ? {
    url: `/images/hero/naturemist-${label}-200g.png`,
    altText: `${product.name} in its NatureMist botanical care jar`,
    width: 1254,
    height: 1254,
  } : null;
}

export function getImageHeroProducts(catalog: readonly Product[]): ImageHeroProduct[] {
  const seen = new Set<string>();
  return catalog.flatMap<ImageHeroProduct>((product) => {
    const heroImage = getHeroJarImage(product);
    if (!heroImage || product.heroEnabled !== true || seen.has(heroImage.url)) return [];
    seen.add(heroImage.url);
    return [{ ...product, heroEntryId: product.id || product.slug, heroImage }];
  }).sort((left, right) => {
    const order = (product: Product) => {
      const value = product.heroOrder ?? Number(product.collectionNumber);
      return Number.isFinite(value) ? value : Number.MAX_SAFE_INTEGER;
    };
    return order(left) - order(right);
  });
}
