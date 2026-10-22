import type { Product, StoreImage } from "./catalog/products";

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
type ComboNode = {
  id: string;
  name?: TextField;
  ingredients?: TextField;
  caption?: TextField;
  photo?: { reference?: { image?: Partial<StoreImage> | null } | null } | null;
  products?: TextField;
};
export type GraphBotanicalCombos = {
  enabled?: TextField;
  eyebrow?: TextField;
  heading?: TextField;
  headingEnding?: TextField;
  description?: TextField;
  buttonLabel?: TextField;
  pageTurnEnabled?: TextField;
  pageTurnDuration?: TextField;
  combos?: { references?: { nodes: ComboNode[] } | null } | null;
};

const text = (field: TextField | undefined, fallback = "") => field?.value?.trim() || fallback;
const boolean = (field: TextField | undefined, fallback: boolean) => field?.value === "false" ? false : field?.value === "true" ? true : fallback;

function parseCombo(node: ComboNode): BotanicalCombo | null {
  const name = text(node.name);
  const photo = node.photo?.reference?.image;
  if (!node.id || !name || !photo?.url) return null;
  try {
    const url = new URL(photo.url);
    if (url.protocol !== "https:" || url.hostname !== "cdn.shopify.com" || !url.pathname.startsWith("/s/files/")) return null;
    const ids: unknown = JSON.parse(node.products?.value || "[]");
    // Keep the saved IDs even when a product is unpublished. The preview must
    // disable the entire pairing instead of silently selling fewer jars.
    if (!Array.isArray(ids) || ids.length < 2 || ids.length > 6 ||
      ids.some((id) => typeof id !== "string" || !/^gid:\/\/shopify\/Product\/\d+$/.test(id)) ||
      new Set(ids).size !== ids.length) return null;
    return {
      id: node.id, name,
      ingredients: text(node.ingredients, name),
      caption: text(node.caption, text(node.ingredients, name)),
      image: { url: photo.url, altText: photo.altText || name, width: photo.width || 1536, height: photo.height || 1024 },
      productIds: ids, previewSlugs: [],
    };
  } catch {
    return null;
  }
}

export function parseBotanicalCombos(section: GraphBotanicalCombos | null | undefined): BotanicalCombosContent {
  // Missing/Draft live content stays hidden; local samples are preview-only.
  if (!section) return emptyBotanicalCombos;
  const defaults = defaultBotanicalCombos;
  const duration = Number(text(section.pageTurnDuration, String(defaults.pageTurnDuration)));
  const seen = new Set<string>();
  const combos = (section.combos?.references?.nodes || []).flatMap((node) => {
    const combo = parseCombo(node);
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
  return candidates.filter((product): product is Product => Boolean(product));
}
