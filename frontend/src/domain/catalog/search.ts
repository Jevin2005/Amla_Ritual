import type { Product, StoreImage } from "./products";

export type SearchProduct = {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  pricePaise: number;
  currencyCode: string;
  available: boolean;
  size: string;
  ritual: string;
  careAreas?: Product["careAreas"];
  image: StoreImage | null;
  terms: string;
};

export function normalizeSearch(value: string) {
  return value.normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase()
    .replace(/\bcolor\b/g, "colour").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

export function toSearchProduct(product: Product): SearchProduct {
  return {
    id: product.id || product.slug,
    slug: product.slug,
    name: product.name,
    subtitle: product.subtitle || product.botanical,
    pricePaise: product.pricePaise,
    currencyCode: product.currencyCode || "INR",
    available: product.availableForSale !== false,
    size: product.size,
    ritual: product.ritualStep,
    careAreas: product.careAreas ?? [],
    image: product.featuredImage || product.images?.[0] || null,
    terms: normalizeSearch([
      product.name, product.slug, product.shopifyHandle, product.botanical, product.subtitle,
      product.ingredient, product.plantPart, product.shortDescription, product.description,
      product.ritualStep, product.size, ...(product.careAreas || []), ...(product.searchTerms || []), ...(product.tags || []),
      ...(product.benefits || []), ...(product.concerns || []), ...(product.suitableFor || []),
      ...(product.collections || []).map((collection) => collection.title),
    ].filter(Boolean).join(" ")),
  };
}

/** Every query word must match; order, accents and punctuation do not matter. */
export function searchProducts(products: readonly SearchProduct[], query: string) {
  const normalized = normalizeSearch(query);
  if (!normalized) return [...products];
  // A negative instruction such as "not for skin care" must not make a product
  // a skin-care search result. Category searches use its explicit care uses.
  const careQueries: Record<string, NonNullable<Product["careAreas"]>> = {
    "hair care": ["Hair Care"], haircare: ["Hair Care"],
    "skin care": ["Skin Care"], skincare: ["Skin Care"],
    "hair colour": ["Hair Colour"], "hair and skin": ["Hair Care", "Skin Care"],
  };
  const requestedCare = careQueries[normalized];
  if (requestedCare) return products.filter((product) => requestedCare.every((care) => product.careAreas?.includes(care)));
  const tokens = normalized.split(/\s+/);
  return products.map((product, index) => {
    const name = normalizeSearch(product.name);
    if (!tokens.every((token) => product.terms.includes(token))) return null;
    const score = (name === normalized ? 100 : name.startsWith(normalized) ? 60 : name.includes(normalized) ? 40 : 0)
      + tokens.reduce((sum, token) => sum + (name.includes(token) ? 10 : 0), 0);
    return { product, index, score };
  }).filter((entry) => entry !== null)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(({ product }) => product);
}
