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
import {
  customReviews,
  customVideoReviews,
  isReviewTag,
  type CustomerReview,
  type ReviewRating,
  type VideoReview,
} from "@/domain/reviews/custom-reviews";

const DEFAULT_API_VERSION = "2026-07";
const DEFAULT_PRODUCT_LIMIT = 50;

const productMetafields = `
  botanical: metafield(namespace: "custom", key: "botanical") { value }
  botanicalName: metafield(namespace: "custom", key: "botanical_name") { value }
  plantPart: metafield(namespace: "custom", key: "plant_part") { value }
  collectionNumber: metafield(namespace: "custom", key: "collection_number") { value }
  subtitle: metafield(namespace: "custom", key: "subtitle") { value }
  accent: metafield(namespace: "custom", key: "accent") { value }
  accentSoft: metafield(namespace: "custom", key: "accent_soft") { value }
  size: metafield(namespace: "custom", key: "size") { value }
  netQuantity: metafield(namespace: "custom", key: "net_quantity") { value }
  formulation: metafield(namespace: "custom", key: "formulation") { value }
  availability: metafield(namespace: "custom", key: "availability_label") { value }
  shortDescription: metafield(namespace: "custom", key: "short_description") { value }
  metaDescription: metafield(namespace: "custom", key: "meta_description") { value }
  ingredient: metafield(namespace: "custom", key: "ingredient") { value }
  benefits: metafield(namespace: "custom", key: "benefits") { value }
  howTo: metafield(namespace: "custom", key: "how_to") { value }
  howToUse: metafield(namespace: "custom", key: "how_to_use") { value }
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
  heroPoster: metafield(namespace: "custom", key: "hero_poster") {
    reference {
      ... on MediaImage {
        image { url altText width height }
      }
    }
  }
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

const REVIEWS_QUERY = `#graphql
  query NatureMistReviews(
    $videoFirst: Int!
    $videoAfter: String
    $customerFirst: Int!
    $customerAfter: String
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    videoReviews: metaobjects(
      type: "video_review"
      first: $videoFirst
      after: $videoAfter
    ) {
      nodes {
        id
        handle
        fields {
          key
          value
          reference {
            ... on MediaImage { image { url altText width height } }
            ... on GenericFile { url }
            ... on Video {
              sources { url mimeType format }
              previewImage { url }
            }
          }
        }
      }
      pageInfo { hasNextPage endCursor }
    }
    customerReviews: metaobjects(
      type: "customer_review"
      first: $customerFirst
      after: $customerAfter
    ) {
      nodes {
        id
        handle
        fields {
          key
          value
          reference {
            ... on MediaImage { image { url altText width height } }
          }
        }
      }
      pageInfo { hasNextPage endCursor }
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
  heroPoster: GraphImageMetafield;
};
type GraphImageMetafield = {
  reference?: { image?: GraphImage | null } | null;
} | null;
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
type GraphMetaobjectField = {
  key: string;
  value?: string | null;
  reference?: {
    image?: GraphImage | null;
    url?: string | null;
    sources?: Array<{ url: string; mimeType: string; format: string }>;
    previewImage?: { url: string } | null;
  } | null;
};

type GraphMetaobjectNode = {
  id: string;
  handle: string;
  fields: GraphMetaobjectField[];
};

type GraphMetaobjectConnection = {
  nodes: GraphMetaobjectNode[];
  pageInfo: PageInfo;
};

type ContentResponse = {
  metaobject: GraphSiteContent | null;
  mainMenu: { items: GraphMenuItem[] } | null;
  footerMenu: { items: GraphMenuItem[] } | null;
  videoReviews?: GraphMetaobjectConnection | null;
  customerReviews?: GraphMetaobjectConnection | null;
};

type ReviewsResponse = {
  videoReviews?: GraphMetaobjectConnection | null;
  customerReviews?: GraphMetaobjectConnection | null;
};
type GraphQlEnvelope<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

export type StorefrontVideoReview = VideoReview;

export type StorefrontCustomerReview = CustomerReview;

export type StorefrontContent = {
  announcementText: string;
  announcementLinkLabel: string;
  announcementLinkUrl: string;
  homeHeroPoster: StoreImage;
  ritualPoster: StoreImage;
  storyPoster: StoreImage;
  primaryNavigation: NavigationItem[];
  footerNavigation: NavigationItem[];
  videoReviews: StorefrontVideoReview[];
  customerReviews: StorefrontCustomerReview[];
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

export const previewVideoReviews: StorefrontVideoReview[] = customVideoReviews;

export const previewCustomerReviews: StorefrontCustomerReview[] = customReviews;

export const previewContent: StorefrontContent = {
  announcementText: "Rooted in Ayurveda · Made for modern rituals",
  announcementLinkLabel: "Find your ritual",
  announcementLinkUrl: "/rituals",
  homeHeroPoster: {
    url: "/images/naturemist-hero.png",
    altText: "NatureMist botanical hair ritual",
    width: 1692,
    height: 930,
  },
  ritualPoster: {
    url: "/images/naturemist-ritual.png",
    altText: "Preparing a NatureMist botanical ritual",
    width: 1024,
    height: 1536,
  },
  storyPoster: {
    url: "/images/naturemist-hero.png",
    altText: "NatureMist botanical hair care",
    width: 1692,
    height: 930,
  },
  primaryNavigation: [
    { id: "shop", title: "Shop", url: "/shop", items: [] },
    { id: "rituals", title: "Rituals", url: "/rituals", items: [] },
    { id: "reviews", title: "Reviews", url: "/reviews", items: [] },
    { id: "story", title: "Our Story", url: "/our-story", items: [] },
    { id: "contact", title: "Contact", url: "/contact", items: [] },
  ],
  footerNavigation: [],
  videoReviews: previewVideoReviews,
  customerReviews: previewCustomerReviews,
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

function cleanShortSummary(rawText: string | null | undefined, fallback: string): string {
  if (!rawText) return fallback;
  const clean = rawText
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!clean) return fallback;
  if (clean.length <= 180) return clean;
  const match = clean.match(/^([^.!?]+[.!?])/);
  if (match && match[1].length >= 35 && match[1].length <= 220) {
    return match[1].trim();
  }
  const truncated = clean.slice(0, 160);
  const lastSpace = truncated.lastIndexOf(" ");
  return (lastSpace > 60 ? truncated.slice(0, lastSpace) : truncated) + "…";
}

function defaultHero(product: GraphProduct): ProductHeroContent {
  const customShort = meta(product, "shortDescription");
  const heroDesc =
    meta(product, "heroDescription") ||
    customShort ||
    cleanShortSummary(product.description, "Traditional Indian botanical powder, translated into a clear and considered ritual for modern hair care.");

  return {
    eyebrow:
      meta(product, "heroEyebrow") ||
      `The ${product.title.replace(/ Powder$/i, "")} Ritual`,
    headlineFirst: meta(product, "heroHeadlineFirst") || "Discover",
    headlineMiddle:
      meta(product, "heroHeadlineMiddle") || product.title.replace(/ Powder$/i, ""),
    headlineItalic: meta(product, "heroHeadlineItalic") || "Botanical ritual.",
    description: heroDesc,
    badgeText:
      meta(product, "heroBadgeText") ||
      `${product.title.replace(/ Powder$/i, "")} · ${meta(product, "ritualStep") || "ritual"}`,
    badgeSubtitle:
      meta(product, "heroBadgeSubtitle") || meta(product, "subtitle") || product.productType || "",
    howToText:
      meta(product, "heroHowToText") ||
      listMeta(product, "howToUse", [])[0] ||
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

  // Match known botanical profile if specific metafields haven't been entered in Shopify Admin yet
  const matchingPreview = previewProducts.find(
    (p) =>
      p.slug === product.handle ||
      product.handle.toLowerCase().includes(p.slug) ||
      p.slug.includes(product.handle.toLowerCase()) ||
      product.title.toLowerCase().includes(p.name.toLowerCase().replace(/ powder$/i, "")) ||
      product.title.toLowerCase().includes(p.slug.toLowerCase()),
  );

  const fallbackDescription =
    matchingPreview?.shortDescription || `Discover the pure ${product.title} botanical ritual.`;
  const ritualStepValue = meta(product, "ritualStep") || matchingPreview?.ritualStep || "Condition";
  const ritualStep = ["Cleanse", "Condition", "Colour"].includes(ritualStepValue)
    ? (ritualStepValue as Product["ritualStep"])
    : "Condition";
  const experienceValue = meta(product, "experience") || matchingPreview?.experience || "Beginner";
  const experience = ["Beginner", "Familiar", "Advanced"].includes(experienceValue)
    ? (experienceValue as Product["experience"])
    : "Beginner";
  const featuredImage = toImage(product.featuredImage);

  return {
    id: product.id,
    slug: product.handle,
    name: product.title,
    botanical:
      meta(product, "botanicalName") ||
      meta(product, "botanical") ||
      matchingPreview?.botanical ||
      (product.productType && product.productType !== "Default" ? product.productType : "Phyllanthus emblica"),
    plantPart:
      meta(product, "plantPart") ||
      matchingPreview?.plantPart ||
      "Organic Fruit Pulp",
    collectionNumber:
      meta(product, "collectionNumber") ||
      matchingPreview?.collectionNumber ||
      String(index + 1).padStart(2, "0"),
    subtitle:
      meta(product, "subtitle") ||
      matchingPreview?.subtitle ||
      (product.productType && product.productType !== "Default" ? product.productType : "100% Pure Botanical Ritual"),
    accent: validHex(meta(product, "accent"), matchingPreview?.accent || palette[0]),
    accentSoft: validHex(meta(product, "accentSoft"), matchingPreview?.accentSoft || palette[1]),
    pricePaise: defaultVariant?.pricePaise || toPaise(product.priceRange.minVariantPrice.amount),
    compareAtPricePaise: defaultVariant?.compareAtPricePaise || null,
    currencyCode: defaultVariant?.currencyCode || product.priceRange.minVariantPrice.currencyCode,
    size:
      meta(product, "netQuantity") ||
      meta(product, "size") ||
      (defaultVariant?.title && defaultVariant.title !== "Default Title" ? defaultVariant.title : null) ||
      matchingPreview?.size ||
      "250g Jar",
    availability:
      meta(product, "availability") ||
      (product.availableForSale ? "In stock" : "Sold out"),
    availableForSale: product.availableForSale,
    shortDescription:
      meta(product, "shortDescription") ||
      cleanShortSummary(product.description, fallbackDescription),
    description:
      product.description.trim() ||
      meta(product, "shortDescription") ||
      fallbackDescription,
    seoTitle: product.seo.title || product.title,
    metaDescription:
      meta(product, "metaDescription") ||
      cleanShortSummary(product.description, fallbackDescription),
    ingredient:
      meta(product, "ingredient") ||
      matchingPreview?.ingredient ||
      `100% Pure Organic ${product.title.replace(/ Powder$/i, "")} Powder (Zero fillers, zero synthetic additives).`,
    benefits: listMeta(product, "benefits", matchingPreview?.benefits || [
      "Deeply conditions scalp and lengths",
      "Strengthens hair roots and minimizes breakage",
      "Restores natural mirror shine without chemical build-up"
    ]),
    howTo: (
      // Prefer the "How To Use" metafield key (how_to_use) which is what
      // Shopify Admin creates when the field is named "How To Use".
      // Fall back to the legacy "how_to" key, then to the local preview data.
      listMeta(product, "howToUse", []).length > 0
        ? listMeta(product, "howToUse", [])
        : listMeta(product, "howTo", matchingPreview?.howTo || [
            "Mix 1-2 scoops with warm water into a smooth paste.",
            "Apply evenly from roots to ends on damp hair.",
            "Leave on for 15-20 minutes, then rinse thoroughly with cool water.",
          ])
    ),
    mixers: listMeta(product, "mixers", matchingPreview?.mixers || ["Warm water", "Castor oil", "Yogurt"]),
    suitableFor: listMeta(product, "suitableFor", matchingPreview?.suitableFor || ["All hair types", "Color-treated hair", "Sensitive scalps"]),
    safety: listMeta(product, "safety", matchingPreview?.safety || ["Patch test before first use", "For external cosmetic use only", "Avoid contact with eyes"]),
    storage: meta(product, "storage") || matchingPreview?.storage || "Store in a cool, dry place away from moisture and direct sunlight.",
    texture: meta(product, "texture") || matchingPreview?.texture || "Micro-milled, ultra-sifted botanical powder.",
    concerns: listMeta(product, "concerns", matchingPreview?.concerns || product.tags),
    ritualStep,
    experience,
    colorConsiderations: listMeta(product, "colorConsiderations", matchingPreview?.colorConsiderations || []),
    searchTerms: listMeta(product, "searchTerms", matchingPreview?.searchTerms || product.tags),
    faqs: faqMeta(product, matchingPreview?.faqs || []),
    featuredImage,
    heroPoster: toImage(product.heroPoster?.reference?.image),
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
    const config = configuration();
    const urlObj = new URL(value, "https://shopify.invalid");
    const isShopifyDomain =
      urlObj.hostname === "shopify.invalid" ||
      (config.domain && urlObj.hostname.toLowerCase() === config.domain.toLowerCase());

    const path = urlObj.pathname.replace(/\/$/, "") || "/";
    const lowerPath = path.toLowerCase();

    if (lowerPath === "/" || lowerPath === "") return "/";
    if (
      lowerPath === "/collections/all" ||
      lowerPath === "/collections" ||
      lowerPath === "/catalog" ||
      lowerPath === "/shop"
    ) {
      return "/shop";
    }
    if (lowerPath.startsWith("/products/")) {
      return `/shop/${lowerPath.slice("/products/".length)}`;
    }
    if (lowerPath.startsWith("/collections/")) {
      return `/shop?collection=${encodeURIComponent(lowerPath.slice("/collections/".length))}`;
    }

    const pageHandle = lowerPath.startsWith("/pages/")
      ? lowerPath.slice("/pages/".length)
      : "";

    const pageRoutes: Record<string, string> = {
      "our-story": "/our-story",
      about: "/our-story",
      story: "/our-story",
      rituals: "/rituals",
      ritual: "/rituals",
      contact: "/contact",
      "contact-us": "/contact",
      faqs: "/faqs",
      faq: "/faqs",
      reviews: "/reviews",
      privacy: "/privacy",
      "privacy-policy": "/privacy",
      terms: "/terms",
      "terms-of-service": "/terms",
      "shipping-returns": "/shipping-returns",
      shipping: "/shipping-returns",
      "track-order": "/track-order",
    };
    if (pageHandle && pageRoutes[pageHandle]) return pageRoutes[pageHandle];

    if (lowerPath.includes("contact")) return "/contact";
    if (lowerPath.includes("faq")) return "/faqs";
    if (lowerPath.includes("review")) return "/reviews";
    if (lowerPath.includes("privacy")) return "/privacy";
    if (lowerPath.includes("terms")) return "/terms";
    if (lowerPath.includes("shipping") || lowerPath.includes("refund")) {
      return "/shipping-returns";
    }

    // If it points to Shopify domain or an internal path, keep it internal
    if (isShopifyDomain) {
      return path.startsWith("/") ? path : `/${path}`;
    }
    return value;
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

function getMoField(node: GraphMetaobjectNode, key: string): string | null {
  const field = node.fields?.find((f) => f.key === key);
  return field?.value?.trim() || null;
}

function getMoImage(node: GraphMetaobjectNode, key: string): string | null {
  const field = node.fields?.find((f) => f.key === key);
  return field?.reference?.image?.url || field?.reference?.previewImage?.url || null;
}

function getMoBoolean(
  node: GraphMetaobjectNode,
  key: string,
): boolean | undefined {
  const value = getMoField(node, key)?.toLocaleLowerCase();
  if (["true", "1", "yes"].includes(value || "")) return true;
  if (["false", "0", "no"].includes(value || "")) return false;
  return undefined;
}

function getMoFileUrl(node: GraphMetaobjectNode, key: string): string | null {
  const field = node.fields?.find((f) => f.key === key);
  if (field?.reference?.url) return field.reference.url;
  if (field?.reference?.sources && field.reference.sources.length > 0) {
    const preferredSource =
      field.reference.sources.find(
        (source) =>
          source.mimeType.toLocaleLowerCase() === "video/mp4" ||
          source.format.toLocaleLowerCase() === "mp4",
      ) ||
      field.reference.sources.find((source) =>
        ["video/webm", "video/ogg"].includes(
          source.mimeType.toLocaleLowerCase(),
        ),
      );
    return preferredSource?.url || null;
  }
  if (field?.value && /^https?:\/\//i.test(field.value.trim())) {
    return field.value.trim();
  }
  return null;
}

function mapVideoReviews(nodes: GraphMetaobjectNode[] | undefined | null): StorefrontVideoReview[] {
  if (!nodes || nodes.length === 0) return previewVideoReviews;
  const mapped = nodes.flatMap((node, idx): StorefrontVideoReview[] => {
    const creator =
      getMoField(node, "creator") ||
      getMoField(node, "author") ||
      getMoField(node, "name");
    const title =
      getMoField(node, "title") ||
      getMoField(node, "headline");
    const duration = getMoField(node, "duration") || "Video";
    const image =
      getMoImage(node, "image") ||
      getMoImage(node, "thumbnail") ||
      getMoImage(node, "poster");
    const videoUrl =
      getMoFileUrl(node, "video") ||
      getMoFileUrl(node, "video_url") ||
      getMoFileUrl(node, "video_file") ||
      null;
    const captionsUrl =
      getMoFileUrl(node, "captions") ||
      getMoFileUrl(node, "captions_url") ||
      null;
    const captionsLanguage =
      getMoField(node, "captions_language") || undefined;
    const captionsLabel = getMoField(node, "captions_label") || undefined;
    const transcript = getMoField(node, "transcript") || undefined;
    const featuredOnHome = getMoBoolean(node, "featured_on_home");
    const productTag =
      getMoField(node, "product_tag") ||
      getMoField(node, "product_name");
    const productSlug =
      getMoField(node, "product_slug") ||
      getMoField(node, "product_handle");
    const testimonial =
      getMoField(node, "testimonial") ||
      getMoField(node, "quote") ||
      getMoField(node, "description");

    if (!creator || !title || !image || !productSlug || !testimonial) {
      return [];
    }

    return [{
      id: node.id || node.handle || `vid-${idx + 1}`,
      creator,
      title,
      duration,
      image,
      videoUrl,
      productTag:
        productTag || productSlug.replace(/-/g, " ").toLocaleUpperCase(),
      productSlug,
      testimonial,
      captionsUrl,
      captionsLanguage,
      captionsLabel,
      transcript,
      featuredOnHome,
    }];
  });
  // Always merge static customVideoReviews so they appear even when Shopify is connected
  const shopifyVideoIds = new Set(mapped.map((r) => r.id));
  const staticVideoOnly = previewVideoReviews.filter((r) => !shopifyVideoIds.has(r.id));
  return [...mapped, ...staticVideoOnly];
}

function mapCustomerReviews(nodes: GraphMetaobjectNode[] | undefined | null): StorefrontCustomerReview[] {
  if (!nodes || nodes.length === 0) return previewCustomerReviews;
  const mapped = nodes.flatMap((node, idx): StorefrontCustomerReview[] => {
    const author =
      getMoField(node, "author") ||
      getMoField(node, "name");
    const ratingRaw = Number(getMoField(node, "rating"));
    const quote =
      getMoField(node, "quote") ||
      getMoField(node, "content") ||
      getMoField(node, "review_text");
    const productSlug =
      getMoField(node, "product_slug") ||
      getMoField(node, "product_handle");

    if (
      !author ||
      !quote ||
      !productSlug ||
      !Number.isInteger(ratingRaw) ||
      ratingRaw < 1 ||
      ratingRaw > 5
    ) {
      return [];
    }

    const verifiedValue = getMoField(node, "verified")?.toLocaleLowerCase();
    const verified = ["true", "1", "yes"].includes(verifiedValue || "");
    const role =
      getMoField(node, "role") ||
      "Customer";
    const productName = getMoField(node, "product_name") || undefined;
    const headline = getMoField(node, "headline") || undefined;
    const date = getMoField(node, "date") || undefined;
    const location = getMoField(node, "location") || undefined;
    const avatarImage =
      getMoImage(node, "avatar") ||
      getMoImage(node, "avatar_image") ||
      undefined;
    const tagValue =
      getMoField(node, "tag") ||
      getMoField(node, "category");
    const featuredOnHome = getMoBoolean(node, "featured_on_home");

    const initials =
      author
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "NC";

    const palette = [
      "bg-[#1f3e2b]",
      "bg-[#3a5a30]",
      "bg-[#234938]",
      "bg-[#2d4d38]",
      "bg-[#183928]",
    ];
    const avatarBg = palette[idx % palette.length];

    return [{
      id: node.id || node.handle || `rev-${idx + 1}`,
      author,
      rating: ratingRaw as ReviewRating,
      quote,
      role,
      avatarText: initials,
      avatarBg,
      avatarImage,
      productSlug,
      productName,
      headline,
      date,
      location,
      verified,
      tag: isReviewTag(tagValue) ? tagValue : undefined,
      featuredOnHome,
    }];
  });
  // Always merge static customReviews so they appear even when Shopify is connected
  const shopifyIds = new Set(mapped.map((r) => r.id));
  const staticOnly = previewCustomerReviews.filter((r) => !shopifyIds.has(r.id));
  return [...mapped, ...staticOnly];
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
    videoReviews: mapVideoReviews(response.videoReviews?.nodes),
    customerReviews: mapCustomerReviews(response.customerReviews?.nodes),
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

async function loadAllReviewMetaobjects(marketContext: MarketContext) {
  const videoReviews: GraphMetaobjectNode[] = [];
  const customerReviews: GraphMetaobjectNode[] = [];
  let videoAfter: string | null = null;
  let customerAfter: string | null = null;
  let videoHasNext = true;
  let customerHasNext = true;

  do {
    const page: ReviewsResponse = await shopifyStorefrontRequest<ReviewsResponse>(
      REVIEWS_QUERY,
      {
        videoFirst: 50,
        videoAfter,
        customerFirst: 50,
        customerAfter,
        ...marketContext,
      },
      {
        allowPartialData: true,
        revalidate: 120,
        tags: ["shopify-storefront"],
      },
    );
    const videoPage: GraphMetaobjectConnection | null | undefined =
      page.videoReviews;
    const customerPage: GraphMetaobjectConnection | null | undefined =
      page.customerReviews;

    if (videoPage) {
      videoReviews.push(...videoPage.nodes);
      const nextCursor: string | null = videoPage.pageInfo.endCursor;
      if (
        videoPage.pageInfo.hasNextPage &&
        (!nextCursor || nextCursor === videoAfter)
      ) {
        throw new Error("Shopify returned a non-advancing video review cursor.");
      }
      videoHasNext = videoPage.pageInfo.hasNextPage;
      if (nextCursor) videoAfter = nextCursor;
    } else {
      videoHasNext = false;
    }

    if (customerPage) {
      customerReviews.push(...customerPage.nodes);
      const nextCursor: string | null = customerPage.pageInfo.endCursor;
      if (
        customerPage.pageInfo.hasNextPage &&
        (!nextCursor || nextCursor === customerAfter)
      ) {
        throw new Error(
          "Shopify returned a non-advancing customer review cursor.",
        );
      }
      customerHasNext = customerPage.pageInfo.hasNextPage;
      if (nextCursor) customerAfter = nextCursor;
    } else {
      customerHasNext = false;
    }
  } while (videoHasNext || customerHasNext);

  return {
    videoReviews: {
      nodes: videoReviews,
      pageInfo: { hasNextPage: false, endCursor: videoAfter },
    },
    customerReviews: {
      nodes: customerReviews,
      pageInfo: { hasNextPage: false, endCursor: customerAfter },
    },
  } satisfies Pick<ContentResponse, "videoReviews" | "customerReviews">;
}

async function loadSiteContent(marketContext: MarketContext) {
  const content = await shopifyStorefrontRequest<ContentResponse>(
    SITE_CONTENT_QUERY,
    marketContext,
    {
      allowPartialData: true,
      revalidate: 120,
      tags: ["shopify-storefront"],
    },
  );

  try {
    const reviews = await loadAllReviewMetaobjects(marketContext);
    return { ...content, ...reviews };
  } catch (reason) {
    warnStorefrontPart("review metaobject", reason);
    return content;
  }
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
      loadSiteContent(marketContext),
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
      products: strict ? [] : previewProducts,
      bundles: strict ? [] : previewBundles,
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

  const rawProducts = catalogResult.value.map(mapProduct);
  if (strict && !rawProducts.length) {
    throw new Error(
      "Shopify is connected but returned no published products for this market.",
    );
  }
  const products = rawProducts.length ? rawProducts : (strict ? [] : previewProducts);

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
  const bundles = rawProducts.length
    ? mapBundles(collections, products)
    : (strict ? [] : previewBundles);

  return {
    products,
    bundles,
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

  const strict =
    process.env.SHOPIFY_STRICT_MODE === "true" &&
    process.env.NEXT_PHASE !== "phase-production-build";

  const marketContext = getMarketContext();
  let firstPage: ProductDetailResponse | null = null;
  try {
    firstPage = await shopifyStorefrontRequest<ProductDetailResponse>(
      PRODUCT_DETAIL_QUERY,
      {
        handle,
        variantFirst: 250,
        variantAfter: null,
        ...marketContext,
      },
      { revalidate: 300, tags: ["shopify-storefront"] },
    );
  } catch (error) {
    if (strict) throw error;
    return previewStorefront.products.find((product) => product.slug === handle);
  }

  if (!firstPage?.product) {
    if (!strict) {
      return previewStorefront.products.find((product) => product.slug === handle);
    }
    return undefined;
  }

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
