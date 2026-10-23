import type { Product, StoreImage } from "./catalog/products";
import { isComboProduct } from "./catalog/product-kind";

export const COMBOS_PER_PAGE = 3;
export const MAX_BOTANICAL_COMBOS = 60;

export type BotanicalCombo = {
  id: string;
  name: string;
  ingredients: string;
  caption: string;
  image: StoreImage;
  productIds: string[];
  previewSlugs: string[];
};

export type BotanicalCombosContent = {
  enabled: boolean;
  eyebrow: string;
  heading: string;
  headingEnding: string;
  description: string;
  buttonLabel: string;
  pageTurnEnabled: boolean;
  pageTurnDuration: number;
  combos: BotanicalCombo[];
};

const previewCombos = [
  { id: "classic-trio", name: "Classic Trio", ingredients: "Amla + Reetha + Shikakai", caption: "Amla · Reetha · Shikakai", previewSlugs: ["amla-powder", "reetha-powder", "shikakai-powder"], alt: "NatureMist Amla, Reetha and Shikakai jars on linen with fresh amla, soapnuts and shikakai pods" },
  { id: "botanical-duo", name: "Botanical Duo", ingredients: "Amla + Bhringraj", caption: "Amla · Bhringraj", previewSlugs: ["amla-powder", "bhringraj-powder"], alt: "NatureMist Amla and Bhringraj jars with green amla fruit and delicate white flowers" },
  { id: "floral-duo", name: "Floral Duo", ingredients: "Hibiscus + Amla", caption: "Hibiscus · Amla", previewSlugs: ["hibiscus-powder", "amla-powder"], alt: "NatureMist Hibiscus and Amla jars with red hibiscus flowers and fresh amla fruit" },
];

export const defaultBotanicalCombos: BotanicalCombosContent = {
  enabled: true,
  eyebrow: "Botanical combos",
  heading: "Your ritual.",
  headingEnding: "Better together.",
  description: "Choose a herbal wash duo, a traditional hair-pack pairing or a set with separate wash and pack steps. Each jar contains 200 g and has its own directions.",
  buttonLabel: "View combo",
  pageTurnEnabled: true,
  pageTurnDuration: 1.25,
  combos: previewCombos.map(({ alt, ...combo }) => ({
    ...combo, productIds: [],
    image: { url: `/images/botanical-combos/${combo.id}.webp`, altText: alt, width: 1536, height: 1024 },
  })),
};

export const emptyBotanicalCombos: BotanicalCombosContent = { ...defaultBotanicalCombos, enabled: false, combos: [] };

type TextField = { value?: string | null } | null;
export type GraphBotanicalCombos = {
  enabled?: TextField;
  eyebrow?: TextField;
  heading?: TextField;
  headingEnding?: TextField;
  description?: TextField;
  buttonLabel?: TextField;
  pageTurnEnabled?: TextField;
  pageTurnDuration?: TextField;
  comboProducts?: TextField;
};

const text = (field: TextField | undefined, fallback = "") => field?.value?.trim() || fallback;
const boolean = (field: TextField | undefined, fallback: boolean) => field?.value === "false" ? false : field?.value === "true" ? true : fallback;

export function parseProductReferences(value: string | null | undefined): string[] {
  try {
    const ids: unknown = JSON.parse(value || "[]");
    return Array.isArray(ids) && ids.every((id) => typeof id === "string" && /^gid:\/\/shopify\/Product\/\d+$/.test(id)) ? ids : [];
  } catch {
    return [];
  }
}

/** Product-owned copy and members survive removal of the old combo metaobjects. */
export function comboFromProduct(product: Product): BotanicalCombo | null {
  const ids = product.comboProductIds || [];
  if (!product.id || !isComboProduct(product) || ids.length < 2 || ids.length > 6 ||
    ids.includes(product.id) || new Set(ids).size !== ids.length ||
    ids.some((id) => !/^gid:\/\/shopify\/Product\/\d+$/.test(id))) return null;
  const name = product.name.replace(/^naturemist\s+/i, "").trim() || product.name;
  const image = product.featuredImage || product.images?.[0] || { url: "/images/product-placeholder.svg", altText: name, width: 800, height: 800 };
  return {
    id: product.id, name,
    ingredients: product.comboIngredients?.trim() || name,
    caption: product.comboCaption?.trim() || product.comboIngredients?.trim() || name,
    image: { ...image, altText: image.altText?.trim() || name },
    // Retain unpublished member IDs so the displayed jar count never shrinks.
    productIds: [...ids], previewSlugs: [],
  };
}

export function parseBotanicalCombos(section: GraphBotanicalCombos | null | undefined, products: Product[] = []): BotanicalCombosContent {
  // Missing/Draft live content stays hidden; local samples are preview-only.
  if (!section) return emptyBotanicalCombos;
  const defaults = defaultBotanicalCombos;
  const duration = Number(text(section.pageTurnDuration, String(defaults.pageTurnDuration)));
  const seen = new Set<string>();
  const byId = new Map(products.map((product) => [product.id, product]));
  const combos = parseProductReferences(section.comboProducts?.value).flatMap((id) => {
    const product = byId.get(id);
    const combo = product ? comboFromProduct(product) : null;
    if (!combo || seen.has(combo.id)) return [];
    seen.add(combo.id);
    return [combo];
  }).slice(0, MAX_BOTANICAL_COMBOS);
  return {
    enabled: boolean(section.enabled, defaults.enabled),
    eyebrow: text(section.eyebrow, defaults.eyebrow),
    heading: text(section.heading, defaults.heading),
    headingEnding: text(section.headingEnding, defaults.headingEnding),
    description: text(section.description, defaults.description),
    buttonLabel: text(section.buttonLabel, defaults.buttonLabel),
    pageTurnEnabled: boolean(section.pageTurnEnabled, defaults.pageTurnEnabled),
    pageTurnDuration: Number.isFinite(duration) ? Math.min(3, Math.max(.5, duration)) : defaults.pageTurnDuration,
    combos,
  };
}

export function comboProductCount(combo: BotanicalCombo) {
  return combo.productIds.length || combo.previewSlugs.length;
}

export function getBotanicalComboPage(combos: BotanicalCombo[], pageIndex: number) {
  const pageCount = Math.ceil(combos.length / COMBOS_PER_PAGE);
  const index = Number.isInteger(pageIndex) ? Math.max(0, Math.min(pageIndex, Math.max(0, pageCount - 1))) : 0;
  const startIndex = index * COMBOS_PER_PAGE;
  return { combos: combos.slice(startIndex, startIndex + COMBOS_PER_PAGE), startIndex, pageCount };
}

export function resolveComboProducts(combo: BotanicalCombo, products: Product[]): Product[] {
  const candidates = combo.productIds.length
    ? combo.productIds.map((id) => products.find((product) => product.id === id))
    : combo.previewSlugs.map((slug) => products.find((product) => product.slug === slug));
  return candidates.filter((product): product is Product => Boolean(product) && !isComboProduct(product!));
}
