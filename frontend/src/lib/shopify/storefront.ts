import "server-only";

import { cache } from "react";
import {
  bundles as previewBundles,
  products as previewProducts,
  type Product,
  type ProductBundle,
  type ProductFaq,
  type ProductHeroContent,
  type ProductVariant,
  type StoreImage,
} from "@/domain/catalog/products";

const DEFAULT_API_VERSION = "2026-07";
const DEFAULT_PRODUCT_LIMIT = 50;

const productMetafields = `
  botanical: metafield(namespace: "custom", key: "botanical") { value }
  plantPart: metafield(namespace: "custom", key: "plant_part") { value }
  collectionNumber: metafield(namespace: "custom", key: "collection_number") { value }
  subtitle: metafield(namespace: "custom", key: "subtitle") { value }
  accent: metafield(namespace: "custom", key: "accent") { value }
  accentSoft: metafield(namespace: "custom", key: "accent_soft") { value }
  size: metafield(namespace: "custom", key: "size") { value }
  availability: metafield(namespace: "custom", key: "availability_label") { value }
  shortDescription: metafield(namespace: "custom", key: "short_description") { value }
  metaDescription: metafield(namespace: "custom", key: "meta_description") { value }
  ingredient: metafield(namespace: "custom", key: "ingredient") { value }
  benefits: metafield(namespace: "custom", key: "benefits") { value }
  howTo: metafield(namespace: "custom", key: "how_to") { value }
  mixers: metafield(namespace: "custom", key: "mixers") { value }
  suitableFor: metafield(namespace: "custom", key: "suitable_for") { value }
  safety: metafield(namespace: "custom", key: "safety") { value }
  storage: metafield(namespace: "custom", key: "storage") { value }
  texture: metafield(namespace: "custom", key: "texture") { value }
  concerns: metafield(namespace: "custom", key: "concerns") { value }
  ritualStep: metafield(namespace: "custom", key: "ritual_step") { value }
  experience: metafield(namespace: "custom", key: "experience") { value }
  colorConsiderations: metafield(namespace: "custom", key: "color_considerations") { value }
  searchTerms: metafield(namespace: "custom", key: "search_terms") { value }
  faqs: metafield(namespace: "custom", key: "faqs") { value }
  heroEyebrow: metafield(namespace: "custom", key: "hero_eyebrow") { value }
  heroHeadlineFirst: metafield(namespace: "custom", key: "hero_headline_first") { value }
  heroHeadlineMiddle: metafield(namespace: "custom", key: "hero_headline_middle") { value }
  heroHeadlineItalic: metafield(namespace: "custom", key: "hero_headline_italic") { value }
  heroDescription: metafield(namespace: "custom", key: "hero_description") { value }
  heroBadgeText: metafield(namespace: "custom", key: "hero_badge_text") { value }
  heroBadgeSubtitle: metafield(namespace: "custom", key: "hero_badge_subtitle") { value }
  heroHowToText: metafield(namespace: "custom", key: "hero_how_to_text") { value }
`;

const VARIANT_FRAGMENT = `
  id
  title
  availableForSale
  quantityAvailable
  sku
  selectedOptions { name value }
  price { amount currencyCode }
  compareAtPrice { amount currencyCode }
  image { url altText width height }
`;

const PRODUCT_BASE_FRAGMENT = `
  id
  handle
  title
  description
  productType
  vendor
  tags
  availableForSale
  seo { title description }
  featuredImage { url altText width height }
  images(first: 250) { nodes { url altText width height } }
  priceRange {
    minVariantPrice { amount currencyCode }
    maxVariantPrice { amount currencyCode }
  }
  compareAtPriceRange {
    minVariantPrice { amount currencyCode }
  }
  collections(first: 250) { nodes { id handle title } }
  ${productMetafields}
`;

const PRODUCT_FRAGMENT = `
  ${PRODUCT_BASE_FRAGMENT}
  selectedOrFirstAvailableVariant { ${VARIANT_FRAGMENT} }
  variants(first: 1) { nodes { ${VARIANT_FRAGMENT} } }
`;

const CATALOG_QUERY = `#graphql
  query NatureMistCatalog(
    $first: Int!
    $after: String
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    products(first: $first, after: $after) {
      nodes { ${PRODUCT_FRAGMENT} }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

const PRODUCT_DETAIL_QUERY = `#graphql
  query NatureMistProductDetail(
    $handle: String!
    $variantFirst: Int!
    $variantAfter: String
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ${PRODUCT_BASE_FRAGMENT}
      selectedOrFirstAvailableVariant { ${VARIANT_FRAGMENT} }
      variants(first: $variantFirst, after: $variantAfter) {
        nodes { ${VARIANT_FRAGMENT} }
        pageInfo { hasNextPage endCursor }
      }
    }
  }
`;

const PRODUCT_VARIANTS_QUERY = `#graphql
  query NatureMistProductVariants(
    $handle: String!
    $variantFirst: Int!
    $variantAfter: String
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      variants(first: $variantFirst, after: $variantAfter) {
        nodes { ${VARIANT_FRAGMENT} }
        pageInfo { hasNextPage endCursor }
      }
    }
  }
`;

const COLLECTIONS_QUERY = `#graphql
  query NatureMistCollections(
    $first: Int!
    $after: String
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collections(first: $first, after: $after) {
      nodes {
        id
        handle
        title
        description
        displayAsBundle: metafield(namespace: "custom", key: "display_as_bundle") { value }
        products(first: 250) { nodes { handle } }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

const SHOP_QUERY = `#graphql
  query NatureMistShop(
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    shop {
      name
      primaryDomain { url }
      privacyPolicy { title handle url body }
      termsOfService { title handle url body }
      shippingPolicy { title handle url body }
      refundPolicy { title handle url body }
    }
  }
`;

const SITE_CONTENT_QUERY = `#graphql
  query NatureMistSiteContent(
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    mainMenu: menu(handle: "main-menu") {
      items {
        id title url
        items {
          id title url
          items { id title url }
        }
      }
    }
    footerMenu: menu(handle: "footer") {
      items {
        id title url
        items {
          id title url
          items { id title url }
        }
      }
    }
    metaobject(handle: { type: "storefront_content", handle: "main" }) {
      announcementText: field(key: "announcement_text") { value }
      announcementLinkLabel: field(key: "announcement_link_label") { value }
      announcementLinkUrl: field(key: "announcement_link_url") { value }
      homeHeroPoster: field(key: "home_hero_poster") {
        reference { ... on MediaImage { image { url altText width height } } }
      }
      ritualPoster: field(key: "ritual_poster") {
        reference { ... on MediaImage { image { url altText width height } } }
      }
      storyPoster: field(key: "story_poster") {
        reference { ... on MediaImage { image { url altText width height } } }
      }
    }
  }
`;

type Money = { amount: string; currencyCode: string };
type GraphImage = {
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
};
type GraphVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  quantityAvailable: number | null;
  sku: string | null;
  selectedOptions: Array<{ name: string; value: string }>;
  price: Money;
  compareAtPrice: Money | null;
  image: GraphImage | null;
};
type GraphProduct = {
  id: string;
  handle: string;
  title: string;
  description: string;
  productType: string;
  vendor: string;
  tags: string[];
  availableForSale: boolean;
  seo: { title: string | null; description: string | null };
  featuredImage: GraphImage | null;
  images: { nodes: GraphImage[] };
  priceRange: { minVariantPrice: Money; maxVariantPrice: Money };
  compareAtPriceRange: { minVariantPrice: Money };
  collections: {
    nodes: Array<{ id: string; handle: string; title: string }>;
  };
  selectedOrFirstAvailableVariant: GraphVariant | null;
  variants: { nodes: GraphVariant[]; pageInfo?: PageInfo };
};
type GraphCollection = {
  id: string;
  handle: string;
  title: string;
  description: string;
  displayAsBundle: { value: string } | null;
  products: { nodes: Array<{ handle: string }> };
};
export type StorefrontPolicy = {
  title: string;
  handle: string;
  url: string;
  body: string;
};
type GraphShop = {
  name: string;
  primaryDomain: { url: string };
  privacyPolicy: StorefrontPolicy | null;
  termsOfService: StorefrontPolicy | null;
  shippingPolicy: StorefrontPolicy | null;
  refundPolicy: StorefrontPolicy | null;
};
type GraphField = {
  value?: string | null;
  reference?: { image?: GraphImage | null } | null;
} | null;
type GraphSiteContent = Record<string, GraphField>;
type GraphMenuItem = {
  id: string;
  title: string;
  url: string | null;
  items: GraphMenuItem[];
};

type PageInfo = { hasNextPage: boolean; endCursor: string | null };
type CatalogResponse = {
  products: { nodes: GraphProduct[]; pageInfo: PageInfo };
};
type CollectionsResponse = {
  collections: { nodes: GraphCollection[]; pageInfo: PageInfo };
};
type ShopResponse = { shop: GraphShop };
type ProductDetailResponse = { product: GraphProduct | null };
type ProductVariantsResponse = {
  product: { variants: { nodes: GraphVariant[]; pageInfo: PageInfo } } | null;
};
type ContentResponse = {
  metaobject: GraphSiteContent | null;
  mainMenu: { items: GraphMenuItem[] } | null;
  footerMenu: { items: GraphMenuItem[] } | null;
};
type GraphQlEnvelope<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

export type StorefrontContent = {
  announcementText: string;
  announcementLinkLabel: string;
  announcementLinkUrl: string;
  homeHeroPoster: StoreImage;
  ritualPoster: StoreImage;
  storyPoster: StoreImage;
  primaryNavigation: NavigationItem[];
  footerNavigation: NavigationItem[];
};

export type NavigationItem = {
  id: string;
  title: string;
  url: string;
  items: NavigationItem[];
};

export type StorefrontData = {
  products: Product[];
  bundles: ProductBundle[];
  content: StorefrontContent;
  shopName: string;
  shopUrl: string | null;
  policies: {
    privacy: StorefrontPolicy | null;
    terms: StorefrontPolicy | null;
    shipping: StorefrontPolicy | null;
    refund: StorefrontPolicy | null;
  };
  source: "shopify" | "preview";
};

export const previewContent: StorefrontContent = {
  announcementText: "Rooted in Ayurveda · Made for modern rituals",
  announcementLinkLabel: "Find your ritual",
  announcementLinkUrl: "/rituals",
  homeHeroPoster: {
    url: "/images/naturemist-hero.png",
    altText: "NatureMist botanical hair ritual",
    width: 1600,
    height: 2000,
  },
  ritualPoster: {
    url: "/images/naturemist-ritual.png",
    altText: "Preparing a NatureMist botanical ritual",
    width: 1600,
    height: 2000,
  },
  storyPoster: {
    url: "/images/naturemist-hero.png",
    altText: "NatureMist botanical hair care",
    width: 1600,
    height: 2000,
  },
  primaryNavigation: [
    { id: "shop", title: "Shop", url: "/shop", items: [] },
    { id: "rituals", title: "Rituals", url: "/rituals", items: [] },
    { id: "story", title: "Our Story", url: "/our-story", items: [] },
  ],
  footerNavigation: [],
};

function cleanDomain(value: string | undefined) {
  if (!value) return null;
  const candidate = value.trim().replace(/^https?:\/\//i, "").replace(/\/$/, "");
  if (!/^[a-z0-9][a-z0-9.-]+\.[a-z]{2,}$/i.test(candidate)) return null;
  return candidate;
}

function configuration() {
  const domain = cleanDomain(process.env.SHOPIFY_STORE_DOMAIN);
  const publicToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN?.trim() || null;
  const privateToken = process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN?.trim() || null;
  const apiVersion =
    process.env.SHOPIFY_STOREFRONT_API_VERSION?.trim() || DEFAULT_API_VERSION;
  return { domain, publicToken, privateToken, apiVersion };
}

export function isShopifyConfigured() {
  const config = configuration();
  return Boolean(config.domain && (config.publicToken || config.privateToken));
}

export async function shopifyStorefrontRequest<T>(
  query: string,
  variables: Record<string, unknown> = {},
  options: {
    allowPartialData?: boolean;
    buyerIp?: string | null;
    revalidate?: number;
    tags?: string[];
  } = {},
): Promise<T> {
  const config = configuration();
  if (!config.domain || (!config.publicToken && !config.privateToken)) {
    throw new Error("Shopify Storefront API is not configured.");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (config.privateToken) {
    headers["Shopify-Storefront-Private-Token"] = config.privateToken;
    if (options.buyerIp) {
      headers["Shopify-Storefront-Buyer-IP"] = options.buyerIp;
    }
  } else if (config.publicToken) {
    headers["X-Shopify-Storefront-Access-Token"] = config.publicToken;
  }

  const cacheOptions = options.revalidate
    ? {
        next: {
          revalidate: options.revalidate,
          tags: options.tags,
        },
      }
    : { cache: "no-store" as const };

  const response = await fetch(
    `https://${config.domain}/api/${config.apiVersion}/graphql.json`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ query, variables }),
      ...cacheOptions,
    },
  );

  const result = (await response.json()) as GraphQlEnvelope<T>;
  const servedVersion = response.headers.get("x-shopify-api-version");
  if (servedVersion && servedVersion !== config.apiVersion) {
    console.warn(
      `Shopify served API version ${servedVersion}; the storefront requested ${config.apiVersion}.`,
    );
  }
  if (result.errors?.length && result.data && options.allowPartialData) {
    console.warn(
      "Shopify returned partial Storefront API data:",
      result.errors.map((error) => error.message).join("; "),
    );
  }
  if (
    !response.ok ||
    (!options.allowPartialData && result.errors?.length) ||
    !result.data
  ) {
    const message = result.errors?.map((error) => error.message).join("; ");
    throw new Error(message || `Shopify returned HTTP ${response.status}.`);
  }
  return result.data;
}

function toPaise(amount: string | number | null | undefined) {
  const value = Number(amount);
  return Number.isFinite(value) ? Math.round(value * 100) : 0;
}

function toImage(image: GraphImage | null | undefined): StoreImage | null {
  if (!image?.url) return null;
  return {
    url: image.url,
    altText: image.altText?.trim() || "",
    width: image.width || 1200,
    height: image.height || 1200,
  };
}

function meta(product: GraphProduct, key: string) {
  const field = (product as unknown as Record<string, unknown>)[key];
  if (!field || typeof field !== "object") return null;
  const value = (field as { value?: unknown }).value;
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function listMeta(product: GraphProduct, key: string, fallback: string[]) {
  const value = meta(product, key);
  if (!value) return fallback;
  try {
    const parsed = JSON.parse(value) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === "string" && Boolean(item.trim()));
    }
  } catch {
    // Plain text metafields are supported as a newline- or comma-separated fallback.
  }
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function faqMeta(product: GraphProduct, fallback: ProductFaq[]) {
  const value = meta(product, "faqs");
  if (!value) return fallback;
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return fallback;
    return parsed.flatMap((entry) => {
      if (!entry || typeof entry !== "object") return [];
      const question = (entry as { question?: unknown }).question;
      const answer = (entry as { answer?: unknown }).answer;
      return typeof question === "string" && typeof answer === "string"
        ? [{ question, answer }]
        : [];
    });
  } catch {
    return fallback;
  }
}

function validHex(value: string | null, fallback: string) {
  return value && /^#[0-9a-f]{6}$/i.test(value) ? value : fallback;
}

function defaultHero(product: GraphProduct): ProductHeroContent {
  const shortDescription =
    meta(product, "shortDescription") || product.description || "";
  return {
    eyebrow:
      meta(product, "heroEyebrow") ||
      `The ${product.title.replace(/ Powder$/i, "")} Ritual`,
    headlineFirst: meta(product, "heroHeadlineFirst") || "Discover",
    headlineMiddle:
      meta(product, "heroHeadlineMiddle") || product.title.replace(/ Powder$/i, ""),
    headlineItalic: meta(product, "heroHeadlineItalic") || "Botanical ritual.",
    description: meta(product, "heroDescription") || shortDescription,
    badgeText:
      meta(product, "heroBadgeText") ||
      `${product.title.replace(/ Powder$/i, "")} · ${meta(product, "ritualStep") || "ritual"}`,
    badgeSubtitle:
      meta(product, "heroBadgeSubtitle") || meta(product, "subtitle") || product.productType || "",
    howToText:
      meta(product, "heroHowToText") ||
      listMeta(product, "howTo", ["Follow the directions on the product pack."])[0],
  };
}

function mapVariant(variant: GraphVariant): ProductVariant {
  return {
    id: variant.id,
    title: variant.title,
    availableForSale: variant.availableForSale,
    quantityAvailable: variant.quantityAvailable,
    sku: variant.sku,
    pricePaise: toPaise(variant.price.amount),
    compareAtPricePaise: variant.compareAtPrice
      ? toPaise(variant.compareAtPrice.amount)
      : null,
    currencyCode: variant.price.currencyCode,
    selectedOptions: variant.selectedOptions,
    image: toImage(variant.image),
  };
}

function mapProduct(product: GraphProduct, index: number): Product {
  const palette = [
    ["#6f8f2f", "#dce7ad"],
    ["#9a5a3d", "#ead2c3"],
    ["#b18236", "#ecdfbf"],
    ["#244c32", "#c5d5c7"],
    ["#8b3041", "#eccbd1"],
    ["#283c75", "#c9d0e7"],
  ][index % 6];
  const variants = product.variants.nodes.map(mapVariant);
  const selectedVariant = product.selectedOrFirstAvailableVariant
    ? mapVariant(product.selectedOrFirstAvailableVariant)
    : null;
  if (selectedVariant && !variants.some((variant) => variant.id === selectedVariant.id)) {
    variants.unshift(selectedVariant);
  }
  const defaultVariant =
    selectedVariant || variants.find((variant) => variant.availableForSale) || variants[0] || null;
  const fallbackDescription =
    product.description || `Discover ${product.title}.`;
  const ritualStepValue = meta(product, "ritualStep") || "Condition";
  const ritualStep = ["Cleanse", "Condition", "Colour"].includes(ritualStepValue)
    ? (ritualStepValue as Product["ritualStep"])
    : "Condition";
  const experienceValue = meta(product, "experience") || "Beginner";
  const experience = ["Beginner", "Familiar", "Advanced"].includes(experienceValue)
    ? (experienceValue as Product["experience"])
    : "Beginner";
  const featuredImage = toImage(product.featuredImage);

  return {
    id: product.id,
    slug: product.handle,
    name: product.title,
    botanical: meta(product, "botanical") || product.productType || "Botanical",
    plantPart: meta(product, "plantPart") || "See product details",
    collectionNumber:
      meta(product, "collectionNumber") ||
      String(index + 1).padStart(2, "0"),
    subtitle: meta(product, "subtitle") || product.productType || "Botanical ritual",
    accent: validHex(meta(product, "accent"), palette[0]),
    accentSoft: validHex(meta(product, "accentSoft"), palette[1]),
    pricePaise: defaultVariant?.pricePaise || toPaise(product.priceRange.minVariantPrice.amount),
    compareAtPricePaise: defaultVariant?.compareAtPricePaise || null,
    currencyCode: defaultVariant?.currencyCode || product.priceRange.minVariantPrice.currencyCode,
    size:
      meta(product, "size") ||
      (defaultVariant?.title !== "Default Title" ? defaultVariant?.title : "Choose an option") ||
      "See product details",
    availability:
      meta(product, "availability") ||
      (product.availableForSale ? "In stock" : "Sold out"),
    availableForSale: product.availableForSale,
    shortDescription: meta(product, "shortDescription") || fallbackDescription,
    seoTitle: product.seo.title || product.title,
    metaDescription:
      meta(product, "metaDescription") ||
      product.seo.description ||
      fallbackDescription,
    ingredient:
      meta(product, "ingredient") || "See the product pack for the complete ingredient declaration.",
    benefits: listMeta(product, "benefits", []),
    howTo: listMeta(product, "howTo", ["Follow the directions on the product pack."]),
    mixers: listMeta(product, "mixers", []),
    suitableFor: listMeta(product, "suitableFor", []),
    safety: listMeta(product, "safety", []),
    storage: meta(product, "storage") || "See product packaging.",
    texture: meta(product, "texture") || "See product imagery and pack details.",
    concerns: listMeta(product, "concerns", product.tags),
    ritualStep,
    experience,
    colorConsiderations: listMeta(product, "colorConsiderations", []),
    searchTerms: listMeta(product, "searchTerms", product.tags),
    faqs: faqMeta(product, []),
    featuredImage,
    images: product.images.nodes.map(toImage).filter((image): image is StoreImage => Boolean(image)),
    variants,
    collections: product.collections.nodes,
    tags: product.tags,
    hero: defaultHero(product),
  };
}

function mapBundles(collections: GraphCollection[], catalog: Product[]) {
  const handles = new Set(catalog.map((product) => product.slug));
  const managed = collections
    .filter(
      (collection) =>
        collection.displayAsBundle?.value === "true" || collection.handle.startsWith("bundle-"),
    )
    .map<ProductBundle>((collection) => ({
      id: collection.id,
      handle: collection.handle,
      name: collection.title,
      description: collection.description,
      slugs: collection.products.nodes.map((product) => product.handle).filter((handle) => handles.has(handle)),
    }))
    .filter((bundle) => bundle.slugs.length > 0);

  return managed;
}

function contentText(content: GraphSiteContent | null, key: string, fallback: string) {
  return content?.[key]?.value?.trim() || fallback;
}

function contentImage(content: GraphSiteContent | null, key: string, fallback: StoreImage) {
  return toImage(content?.[key]?.reference?.image) || fallback;
}

function storefrontPath(value: string) {
  try {
    const isAbsolute = /^https?:\/\//i.test(value);
    const path = new URL(value, "https://shopify.invalid").pathname;
    if (path.startsWith("/products/")) {
      return `/shop/${path.slice("/products/".length)}`;
    }
    if (path.startsWith("/collections/")) {
      return `/shop?collection=${encodeURIComponent(path.slice("/collections/".length))}`;
    }
    const pageHandle = path.startsWith("/pages/") ? path.slice("/pages/".length) : "";
    const pageRoutes: Record<string, string> = {
      "our-story": "/our-story",
      rituals: "/rituals",
      privacy: "/privacy",
      terms: "/terms",
      "shipping-returns": "/shipping-returns",
    };
    if (pageHandle && pageRoutes[pageHandle]) return pageRoutes[pageHandle];
    if (path.includes("privacy-policy")) return "/privacy";
    if (path.includes("terms-of-service")) return "/terms";
    if (path.includes("shipping-policy") || path.includes("refund-policy")) {
      return "/shipping-returns";
    }
    return isAbsolute ? value : path;
  } catch {
    return value;
  }
}

function mapMenu(items: GraphMenuItem[] | undefined): NavigationItem[] {
  return (items || []).map((item) => ({
    id: item.id,
    title: item.title,
    url: item.url
      ? storefrontPath(item.url)
      : item.items[0]?.url
        ? storefrontPath(item.items[0].url)
        : "/shop",
    items: mapMenu(item.items),
  }));
}

function mapContent(response: ContentResponse): StorefrontContent {
  const content = response.metaobject;
  return {
    announcementText: contentText(content, "announcementText", previewContent.announcementText),
    announcementLinkLabel: contentText(
      content,
      "announcementLinkLabel",
      previewContent.announcementLinkLabel,
    ),
    announcementLinkUrl: contentText(
      content,
      "announcementLinkUrl",
      previewContent.announcementLinkUrl,
    ),
    homeHeroPoster: contentImage(content, "homeHeroPoster", previewContent.homeHeroPoster),
    ritualPoster: contentImage(content, "ritualPoster", previewContent.ritualPoster),
    storyPoster: contentImage(content, "storyPoster", previewContent.storyPoster),
    primaryNavigation:
      mapMenu(response.mainMenu?.items).length > 0
        ? mapMenu(response.mainMenu?.items)
        : previewContent.primaryNavigation,
    footerNavigation: mapMenu(response.footerMenu?.items),
  };
}

const previewCatalog: Product[] = previewProducts.map((product) => ({
  ...product,
  availableForSale: true,
  currencyCode: "INR",
  compareAtPricePaise: null,
  variants: [
    {
      id: `preview:${product.slug}`,
      title: "Default Title",
      availableForSale: true,
      quantityAvailable: null,
      sku: null,
      pricePaise: product.pricePaise,
      compareAtPricePaise: null,
      currencyCode: "INR",
      selectedOptions: [],
      image: null,
    },
  ],
  collections: [],
  tags: product.searchTerms,
  hero: {
    eyebrow: `The ${product.name.replace(/ Powder$/i, "")} Ritual · No. ${product.collectionNumber}`,
    headlineFirst: "Discover",
    headlineMiddle: product.name.replace(/ Powder$/i, ""),
    headlineItalic: "Botanical ritual.",
    description: product.shortDescription,
    badgeText: `${product.name.replace(/ Powder$/i, "")} · ${product.ritualStep.toLowerCase()}`,
    badgeSubtitle: product.subtitle,
    howToText: product.howTo[0] || "Follow the directions on the product pack.",
  },
}));

const previewStorefront: StorefrontData = {
  products: previewCatalog,
  bundles: previewBundles,
  content: previewContent,
  shopName: "NatureMist",
  shopUrl: null,
  policies: {
    privacy: null,
    terms: null,
    shipping: null,
    refund: null,
  },
  source: "preview",
};

type MarketContext = { country: string; language: string };

function getMarketContext(): MarketContext {
  return {
    country: process.env.SHOPIFY_DEFAULT_COUNTRY?.trim().toUpperCase() || "IN",
    language: process.env.SHOPIFY_DEFAULT_LANGUAGE?.trim().toUpperCase() || "EN",
  };
}

async function loadAllProducts(marketContext: MarketContext) {
  const products: GraphProduct[] = [];
  let after: string | null = null;

  do {
    const page: CatalogResponse = await shopifyStorefrontRequest<CatalogResponse>(
      CATALOG_QUERY,
      { first: DEFAULT_PRODUCT_LIMIT, after, ...marketContext },
      { revalidate: 300, tags: ["shopify-storefront"] },
    );
    products.push(...page.products.nodes);

    const nextCursor = page.products.pageInfo.endCursor;
    if (page.products.pageInfo.hasNextPage && (!nextCursor || nextCursor === after)) {
      throw new Error("Shopify returned a non-advancing product cursor.");
    }
    after = page.products.pageInfo.hasNextPage ? nextCursor : null;
  } while (after);

  return products;
}

async function loadAllCollections(marketContext: MarketContext) {
  const collections: GraphCollection[] = [];
  let after: string | null = null;

  do {
    const page: CollectionsResponse = await shopifyStorefrontRequest<CollectionsResponse>(
      COLLECTIONS_QUERY,
      { first: 50, after, ...marketContext },
      { revalidate: 300, tags: ["shopify-storefront"] },
    );
    collections.push(...page.collections.nodes);

    const nextCursor = page.collections.pageInfo.endCursor;
    if (page.collections.pageInfo.hasNextPage && (!nextCursor || nextCursor === after)) {
      throw new Error("Shopify returned a non-advancing collection cursor.");
    }
    after = page.collections.pageInfo.hasNextPage ? nextCursor : null;
  } while (after);

  return collections;
}

function warnStorefrontPart(part: string, reason: unknown) {
  console.warn(
    `Shopify ${part} data was unavailable.`,
    reason instanceof Error ? reason.message : reason,
  );
}

async function loadStorefront(): Promise<StorefrontData> {
  if (!isShopifyConfigured()) return previewStorefront;

  const marketContext = getMarketContext();
  const [catalogResult, collectionsResult, contentResult, shopResult] =
    await Promise.allSettled([
      loadAllProducts(marketContext),
      loadAllCollections(marketContext),
      shopifyStorefrontRequest<ContentResponse>(
        SITE_CONTENT_QUERY,
        marketContext,
        {
          allowPartialData: true,
          revalidate: 120,
          tags: ["shopify-storefront"],
        },
      ),
      shopifyStorefrontRequest<ShopResponse>(
        SHOP_QUERY,
        marketContext,
        { revalidate: 300, tags: ["shopify-storefront"] },
      ),
    ]);

  // A production build can prerender this loader without Shopify being reachable.
  // Keep deployments deterministic; strict validation still applies when the
  // deployed server loads or revalidates storefront data.
  const strict =
    process.env.SHOPIFY_STRICT_MODE === "true" &&
    process.env.NEXT_PHASE !== "phase-production-build";
  const rejected = [catalogResult, collectionsResult, contentResult, shopResult].find(
    (result) => result.status === "rejected",
  );
  if (strict && rejected?.status === "rejected") throw rejected.reason;

  const content =
    contentResult.status === "fulfilled"
      ? mapContent(contentResult.value)
      : previewContent;
  const shop = shopResult.status === "fulfilled" ? shopResult.value.shop : null;
  if (
    strict &&
    (!shop?.privacyPolicy ||
      !shop.termsOfService ||
      !shop.shippingPolicy ||
      !shop.refundPolicy)
  ) {
    throw new Error(
      "SHOPIFY_STRICT_MODE requires Privacy, Terms, Shipping, and Refund policies to be published.",
    );
  }

  if (catalogResult.status === "rejected") {
    warnStorefrontPart("catalog", catalogResult.reason);
    return {
      products: [],
      bundles: [],
      content,
      shopName: shop?.name || "NatureMist",
      shopUrl: shop?.primaryDomain.url || null,
      policies: {
        privacy: shop?.privacyPolicy || null,
        terms: shop?.termsOfService || null,
        shipping: shop?.shippingPolicy || null,
        refund: shop?.refundPolicy || null,
      },
      source: "shopify",
    };
  }

  const products = catalogResult.value.map(mapProduct);
  if (strict && !products.length) {
    throw new Error(
      "Shopify is connected but returned no published products for this market.",
    );
  }

  if (collectionsResult.status === "rejected") {
    warnStorefrontPart("collection", collectionsResult.reason);
  }
  if (contentResult.status === "rejected") {
    warnStorefrontPart("menu and metaobject", contentResult.reason);
  }
  if (shopResult.status === "rejected") {
    warnStorefrontPart("shop and policy", shopResult.reason);
  }

  const collections =
    collectionsResult.status === "fulfilled" ? collectionsResult.value : [];

  return {
    products,
    bundles: mapBundles(collections, products),
    content,
    shopName: shop?.name || "NatureMist",
    shopUrl: shop?.primaryDomain.url || null,
    policies: {
      privacy: shop?.privacyPolicy || null,
      terms: shop?.termsOfService || null,
      shipping: shop?.shippingPolicy || null,
      refund: shop?.refundPolicy || null,
    },
    source: "shopify",
  };
}

export const getStorefront = cache(loadStorefront);

async function loadStorefrontProduct(handle: string) {
  if (!isShopifyConfigured()) {
    return previewStorefront.products.find((product) => product.slug === handle);
  }

  const marketContext = getMarketContext();
  const firstPage = await shopifyStorefrontRequest<ProductDetailResponse>(
    PRODUCT_DETAIL_QUERY,
    {
      handle,
      variantFirst: 250,
      variantAfter: null,
      ...marketContext,
    },
    { revalidate: 300, tags: ["shopify-storefront"] },
  );
  if (!firstPage.product) return undefined;

  const variants = [...firstPage.product.variants.nodes];
  let pageInfo = firstPage.product.variants.pageInfo;
  while (pageInfo?.hasNextPage) {
    if (!pageInfo.endCursor) {
      throw new Error("Shopify returned a non-advancing variant cursor.");
    }
    const page = await shopifyStorefrontRequest<ProductVariantsResponse>(
      PRODUCT_VARIANTS_QUERY,
      {
        handle,
        variantFirst: 250,
        variantAfter: pageInfo.endCursor,
        ...marketContext,
      },
      { revalidate: 300, tags: ["shopify-storefront"] },
    );
    if (!page.product) return undefined;
    variants.push(...page.product.variants.nodes);
    const nextPageInfo = page.product.variants.pageInfo;
    if (
      nextPageInfo.hasNextPage &&
      (!nextPageInfo.endCursor || nextPageInfo.endCursor === pageInfo.endCursor)
    ) {
      throw new Error("Shopify returned a non-advancing variant cursor.");
    }
    pageInfo = nextPageInfo;
  }

  const storefront = await getStorefront();
  const catalogIndex = storefront.products.findIndex((product) => product.slug === handle);
  return mapProduct(
    { ...firstPage.product, variants: { nodes: variants } },
    Math.max(0, catalogIndex),
  );
}

export const getStorefrontProduct = cache(loadStorefrontProduct);
