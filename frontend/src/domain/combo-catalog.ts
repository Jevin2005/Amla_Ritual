import { comboProductCount, resolveComboProducts, type BotanicalCombo } from "./botanical-combos";
import { getDefaultVariant, type Product } from "./catalog/products";

type ComboSource = "shopify" | "preview";

/** Keep catalog cards and the purchase dialog on the same variant and price. */
export function getComboPurchaseSummary(products: Product[], expectedProductCount: number, source: ComboSource) {
  const items = products.map((product) => {
    const variant = getDefaultVariant(product);
    return {
      product,
      variant,
      price: variant?.pricePaise ?? product.pricePaise,
      currency: variant?.currencyCode || product.currencyCode || "INR",
      available:
        (variant?.availableForSale ?? product.availableForSale ?? true) &&
        (variant?.quantityAvailable == null || variant.quantityAvailable > 0),
      purchasable: source !== "shopify" || /^gid:\/\/shopify\/ProductVariant\/\d+$/.test(variant?.id || ""),
    };
  });
  const complete =
    expectedProductCount > 0 &&
    items.length === expectedProductCount &&
    new Set(products.map((product) => product.slug)).size === expectedProductCount;
  const mixedCurrencies = new Set(items.map((item) => item.currency)).size > 1;
  const invalidPrice = items.some((item) => !Number.isFinite(item.price) || item.price < 0);
  const unavailable = items.some((item) => !item.available || !item.purchasable);
  const notice = !complete
    ? "This complete pairing is not available right now. You can explore the individual jars below."
    : mixedCurrencies || invalidPrice
      ? "This pairing cannot be added together right now. Please view the individual jars for current pricing."
      : unavailable
        ? "One or more jars are currently unavailable. Explore each jar for availability."
        : "";

  return {
    items,
    complete,
    notice,
    total: items.reduce((sum, item) => sum + item.price, 0),
    canShowTotal: complete && !mixedCurrencies && !invalidPrice,
    purchasable: !notice,
    currencyCode: items[0]?.currency || "INR",
  };
}

export type ComboCatalogEntry = {
  combo: BotanicalCombo;
  products: Product[];
  count: number;
  purchase: ReturnType<typeof getComboPurchaseSummary>;
};

export function buildComboCatalog(combos: BotanicalCombo[], products: Product[], source: ComboSource): ComboCatalogEntry[] {
  return combos.map((combo) => {
    const selectedProducts = resolveComboProducts(combo, products);
    const count = comboProductCount(combo);
    return { combo, products: selectedProducts, count, purchase: getComboPurchaseSummary(selectedProducts, count, source) };
  });
}

export type ComboCatalogSize = "all" | "2" | "3" | "4+";
export type ComboCatalogSort = "featured" | "price-low" | "price-high" | "name";
export type ComboCatalogFilters = {
  query: string;
  size: ComboCatalogSize;
  availableOnly: boolean;
  sort: ComboCatalogSort;
};

export function filterComboCatalog(entries: ComboCatalogEntry[], filters: ComboCatalogFilters): ComboCatalogEntry[] {
  const query = filters.query.trim().toLowerCase();
  const filtered = entries.filter(({ combo, products, count, purchase }) => {
    const matchesSize = filters.size === "all" || (filters.size === "4+" ? count >= 4 : count === Number(filters.size));
    const searchText = [combo.name, combo.ingredients, ...products.flatMap((product) => [product.name, product.botanical])].join(" ").toLowerCase();
    return matchesSize && (!filters.availableOnly || purchase.purchasable) && (!query || searchText.includes(query));
  });

  if (filters.sort === "name") return filtered.sort((left, right) => left.combo.name.localeCompare(right.combo.name, "en"));
  if (filters.sort === "price-low" || filters.sort === "price-high") {
    const direction = filters.sort === "price-low" ? 1 : -1;
    return filtered.sort((left, right) => {
      // An incomplete pairing has no comparable total. Keep it after priced
      // combos in either direction, and never compare different currencies.
      if (left.purchase.canShowTotal !== right.purchase.canShowTotal) return left.purchase.canShowTotal ? -1 : 1;
      if (!left.purchase.canShowTotal) return 0;
      const currencyOrder = left.purchase.currencyCode.localeCompare(right.purchase.currencyCode, "en");
      return currencyOrder || direction * (left.purchase.total - right.purchase.total);
    });
  }
  return filtered;
}
