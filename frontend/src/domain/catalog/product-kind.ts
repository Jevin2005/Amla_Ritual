import type { Product } from "./products";

/** Explicit merchant classification; ingredient names never imply a combo. */
export function isComboProduct(product: Pick<Product, "tags" | "productType">) {
  const type = product.productType?.trim().toLowerCase();
  return type === "combo" || type === "bundle" || (product.tags ?? []).some((value) => {
    const tag = value.trim().toLowerCase();
    return tag === "combo" || tag === "bundle" || tag.startsWith("combo:");
  });
}

export function comboJarCount(product: Product) {
  const tag = product.tags?.find((value) => /^combo-count:\s*[1-9]\d*$/i.test(value.trim()));
  const count = tag ? Number(tag.split(":")[1]) : 0;
  return Number.isSafeInteger(count) && count >= 2 ? count : 0;
}
