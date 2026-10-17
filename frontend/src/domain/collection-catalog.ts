import type { BotanicalCombo } from "./botanical-combos";
import { getDefaultVariant, matchesRitualGoal, type Product, type RitualGoal } from "./catalog/products";
import { buildComboCatalog, type ComboCatalogEntry, type ComboCatalogSize } from "./combo-catalog";

export type CollectionKind = "all" | "individual" | "combos";
export type CollectionSort = "collection" | "price-low" | "price-high" | "name";
export type CollectionStep = "All" | "Cleanse" | "Condition" | "Colour";
export type CollectionEntry =
  | { kind: "product"; id: string; product: Product }
  | { kind: "combo"; id: string; combo: ComboCatalogEntry };
export type CollectionFilters = {
  kind: CollectionKind;
  query: string;
  goal: RitualGoal | "All";
  step: CollectionStep;
  collection: string | null;
  size: ComboCatalogSize;
  availableOnly: boolean;
  sort: CollectionSort;
};

/** One collection: two individual jars, then one pairing, without hiding overflow. */
export function buildCollectionCatalog(products: Product[], combos: BotanicalCombo[], source: "shopify" | "preview"): CollectionEntry[] {
  const seenIds = new Set<string>();
  const seenSlugs = new Set<string>();
  const individualProducts = products.filter((product) => {
    const id = product.id || product.slug;
    if (seenIds.has(id) || seenSlugs.has(product.slug)) return false;
    seenIds.add(id);
    seenSlugs.add(product.slug);
    return true;
  }).sort((a, b) => a.collectionNumber.localeCompare(b.collectionNumber, "en", { numeric: true }));
  const seenCombos = new Set<string>();
  const uniqueCombos = combos.filter((combo) => {
    if (seenCombos.has(combo.id)) return false;
    seenCombos.add(combo.id);
    return true;
  });
  const comboEntries = buildComboCatalog(uniqueCombos, individualProducts, source);
  const entries: CollectionEntry[] = [];
  let productIndex = 0;
  let comboIndex = 0;
  while (productIndex < individualProducts.length || comboIndex < comboEntries.length) {
    for (let slot = 0; slot < 2 && productIndex < individualProducts.length; slot += 1) {
      const product = individualProducts[productIndex++];
      entries.push({ kind: "product", id: `product:${product.id || product.slug}`, product });
    }
    if (comboIndex < comboEntries.length) {
      const combo = comboEntries[comboIndex++];
      entries.push({ kind: "combo", id: `combo:${combo.combo.id}`, combo });
    }
  }
  return entries;
}

function productSearchFields(product: Product) {
  return [product.name, product.botanical, product.subtitle, product.ingredient, product.formulation, product.size, ...(product.searchTerms ?? [])];
}

function individualAvailable(product: Product) {
  const variant = getDefaultVariant(product);
  return product.availableForSale !== false
    && (variant?.availableForSale ?? true)
    && (variant?.quantityAvailable == null || variant.quantityAvailable > 0);
}

function entryPrice(entry: CollectionEntry) {
  if (entry.kind === "combo") {
    const { total, canShowTotal, currencyCode } = entry.combo.purchase;
    return { price: total, known: canShowTotal && Number.isFinite(total) && total >= 0, currency: currencyCode };
  }
  const { pricePaise, currencyCode } = entry.product;
  return { price: pricePaise, known: Number.isFinite(pricePaise) && pricePaise >= 0, currency: currencyCode || "INR" };
}

/** Goal, step and collection must describe the same jar inside a pairing. */
export function filterCollectionCatalog(entries: CollectionEntry[], filters: CollectionFilters): CollectionEntry[] {
  const query = filters.query.trim().toLowerCase();
  const collection = filters.collection?.trim().toLowerCase();
  const hasMemberFilter = filters.goal !== "All" || filters.step !== "All" || Boolean(collection);
  const matchesMember = (product: Product) =>
    (filters.goal === "All" || matchesRitualGoal(product, filters.goal))
    && (filters.step === "All" || product.ritualStep === filters.step)
    && (!collection || (product.collections ?? []).some((membership) => membership.handle.toLowerCase() === collection));
  const filtered = entries.filter((entry) => {
    if (filters.kind === "individual" && entry.kind !== "product") return false;
    if (filters.kind === "combos" && entry.kind !== "combo") return false;
    if (entry.kind === "product") {
      return filters.size === "all"
        && matchesMember(entry.product)
        && (!filters.availableOnly || individualAvailable(entry.product))
        && (!query || productSearchFields(entry.product).join(" ").toLowerCase().includes(query));
    }
    const { combo, products, count, purchase } = entry.combo;
    const matchesSize = filters.size === "all" || (filters.size === "4+" ? count >= 4 : count === Number(filters.size));
    const searchText = [combo.name, combo.ingredients, ...products.flatMap(productSearchFields)].join(" ").toLowerCase();
    return matchesSize
      && (!hasMemberFilter || products.some(matchesMember))
      && (!filters.availableOnly || purchase.purchasable)
      && (!query || searchText.includes(query));
  });

  if (filters.sort === "name") {
    const name = (entry: CollectionEntry) => entry.kind === "product" ? entry.product.name : entry.combo.combo.name;
    return filtered.sort((a, b) => name(a).localeCompare(name(b), "en"));
  }
  if (filters.sort === "price-low" || filters.sort === "price-high") {
    const direction = filters.sort === "price-low" ? 1 : -1;
    return filtered.sort((a, b) => {
      const left = entryPrice(a);
      const right = entryPrice(b);
      // Unknown totals stay last in either direction. Different currencies are
      // grouped, never treated as numerically comparable amounts.
      if (left.known !== right.known) return left.known ? -1 : 1;
      if (!left.known) return 0;
      return left.currency.localeCompare(right.currency, "en") || direction * (left.price - right.price);
    });
  }
  return filtered;
}
