import type { Product } from "@/domain/catalog/products";
import { matchesProductSlug } from "@/domain/catalog/canonical-slug";

export type SkinArea = "face" | "body" | "both";
export const skinSlugs = ["amla-powder", "hibiscus-powder"];

// Keep identity separate from availability: sold-out does not mean unconfirmed use.
const productIds: Record<string, string> = {
  "amla-powder": "8494763311290", "reetha-powder": "8498815107258",
  "indigo-powder": "8531585368250", "bhringraj-powder": "8531585433786",
  "hibiscus-powder": "8531585499322", "shikakai-powder": "8531585597626",
};

export function verifiedProduct(product: Product, slug: string, source: "shopify" | "preview") {
  if (!matchesProductSlug(slug, product) || !product.howTo.some((line) => line.trim())) return false;
  if (source === "preview") return true;
  return Boolean(productIds[slug] && product.id === `gid://shopify/Product/${productIds[slug]}`
    && new RegExp(`\\b${slug.replace("-powder", "")}\\b`, "i").test(product.ingredient)
    && !/to be confirmed|pending|confirmed on|verified on/i.test(product.ingredient));
}

export function availableProduct(product: Product, source: "shopify" | "preview") {
  if (source === "preview") return product.availableForSale !== false;
  return product.availableForSale === true && Boolean(product.variants?.some((variant) =>
    /^gid:\/\/shopify\/ProductVariant\/\d+$/.test(variant.id) && variant.availableForSale
    && (variant.quantityAvailable == null || variant.quantityAvailable > 0)));
}

export function verifiedCandidate(product: Product, slug: string, source: "shopify" | "preview") {
  return verifiedProduct(product, slug, source) && availableProduct(product, source);
}

export function supportsHairRole(product: Product, role: "Cleanse" | "Pack" | "Condition" | "Colour") {
  if (role === "Colour") return product.careAreas?.includes("Hair Colour") && product.ritualStep === "Colour";
  return product.careAreas?.includes("Hair Care") && (role === "Cleanse"
    ? product.ritualStep === "Cleanse" : ["Pack", "Condition"].includes(product.ritualStep));
}

/** Require explicit area-labelled product directions, not incidental skin keywords.
 * Supported authored headings: Face:, Facial:, Body:, Face and body:.
 * Ambiguous copy stays unavailable until the product information is clarified.
 */
export function skinDirections(product: Product, area: SkinArea): string[] {
  if (!skinSlugs.some((slug) => matchesProductSlug(slug, product)) || !product.careAreas?.includes("Skin Care")) return [];
  const restrictions = [...product.safety, ...product.howTo, product.description ?? ""].join("\n");
  if (/(?:skin|facial|face|body)[^.!?\n]*(?:not (?:yet |been |currently )?(?:confirmed|established|assessed|approved|suitable)|remains? a development)|(?:do not|not intended to|not suitable for)[^.!?\n]*(?:face|facial|body|skin masks)|hair(?:[- ]use)?(?: directions)? only/i.test(restrictions)) return [];
  const directionsFor = (target: "face" | "body") => product.howTo.filter((line) => {
    const heading = line.split(":", 1)[0].trim().toLowerCase();
    const shared = /^(?:face|facial)\s*(?:and|&|\/)\s*body$|^body\s*(?:and|&|\/)\s*(?:face|facial)$/.test(heading);
    return line.includes(":") && line.slice(line.indexOf(":") + 1).trim().length > 0
      && (shared || (target === "face" ? /^(?:face|facial)$/ : /^body$/).test(heading));
  });
  const face = directionsFor("face"), body = directionsFor("body");
  if (area === "both") return face.length && body.length ? [...new Set([...face, ...body])] : [];
  return area === "face" ? face : body;
}
