import test from "node:test";
import assert from "node:assert/strict";
import { buildSync } from "esbuild";
import { fileURLToPath } from "node:url";

const bundle = buildSync({
  entryPoints: [fileURLToPath(new URL("../src/domain/combo-catalog.ts", import.meta.url))],
  bundle: true, platform: "node", format: "esm", write: false,
});
const { getComboPurchaseSummary, buildComboCatalog, filterComboCatalog } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`);

const variant = (id, pricePaise = 10000, overrides = {}) => ({
  id: `gid://shopify/ProductVariant/${id}`, title: "100 g", pricePaise,
  currencyCode: "INR", availableForSale: true, quantityAvailable: 5, ...overrides,
});
const product = (id, name, pricePaise = 10000, overrides = {}) => ({
  id: `gid://shopify/Product/${id}`, slug: `product-${id}`, name,
  botanical: "", pricePaise, currencyCode: "INR", availableForSale: true,
  variants: [variant(id, pricePaise)], ...overrides,
});
const combo = (id, products, overrides = {}) => ({
  id, name: id, ingredients: "Botanical pairing", caption: "",
  image: { url: "/combo.webp", altText: id, width: 1000, height: 700 },
  productIds: products.map((item) => item.id), previewSlugs: [], ...overrides,
});
const defaults = { query: "", size: "all", availableOnly: false, sort: "featured" };
const filter = (entries, options = {}) => filterComboCatalog(entries, { ...defaults, ...options });
const ids = (entries) => entries.map((entry) => entry.combo.id);

test("purchase summaries use available variant prices and preserve product order", () => {
  const amla = product(1, "Amla", 5000, { variants: [variant(11, 9000, { availableForSale: false }), variant(12, 18000)] });
  const reetha = product(2, "Reetha", 6000, { variants: [variant(21, 12000)] });
  const summary = getComboPurchaseSummary([amla, reetha], 2, "shopify");
  assert.equal(summary.total, 30000);
  assert.equal(summary.currencyCode, "INR");
  assert.equal(summary.complete, true);
  assert.equal(summary.canShowTotal, true);
  assert.equal(summary.purchasable, true);
  assert.equal(summary.notice, "");
  assert.deepEqual(summary.items.map((item) => item.variant.id), ["gid://shopify/ProductVariant/12", "gid://shopify/ProductVariant/21"]);
  assert.deepEqual(summary.items.map((item) => item.product), [amla, reetha]);
});

test("missing or unpublished products keep the saved count and prevent incomplete purchases", () => {
  const amla = product(1, "Renamed Amla", 10000, { slug: "new-amla" });
  const reetha = product(2, "Reetha");
  const [entry] = buildComboCatalog([combo("duo", [amla, reetha])], [amla], "shopify");
  assert.equal(entry.count, 2);
  assert.deepEqual(entry.products, [amla]);
  assert.equal(entry.purchase.complete, false);
  assert.equal(entry.purchase.purchasable, false);
  assert.equal(entry.purchase.canShowTotal, false);
  assert.match(entry.purchase.notice, /complete pairing is not available/);
  assert.deepEqual(filter([entry], { availableOnly: true }), []);
  assert.equal(filter([entry], { size: "2" }).length, 1);
});

test("duplicate products and empty pairings cannot be purchased", () => {
  const amla = product(1, "Amla");
  for (const [products, count] of [[[amla, amla], 2], [[], 0]]) {
    const summary = getComboPurchaseSummary(products, count, "shopify");
    assert.equal(summary.complete, false);
    assert.equal(summary.canShowTotal, false);
    assert.equal(summary.purchasable, false);
  }
  assert.equal(getComboPurchaseSummary([], 0, "preview").currencyCode, "INR");
});

test("invalid prices and mixed currencies have no combined total or purchase action", () => {
  const amla = product(1, "Amla");
  for (const price of [-1, NaN, Infinity]) {
    const summary = getComboPurchaseSummary([amla, product(2, "Reetha", price)], 2, "shopify");
    assert.equal(summary.complete, true);
    assert.equal(summary.canShowTotal, false);
    assert.equal(summary.purchasable, false);
    assert.match(summary.notice, /current pricing/);
  }
  const dollars = product(2, "Reetha", 2000, { variants: [variant(2, 2000, { currencyCode: "USD" })] });
  const mixed = getComboPurchaseSummary([amla, dollars], 2, "shopify");
  assert.equal(mixed.canShowTotal, false);
  assert.equal(mixed.purchasable, false);
  assert.match(mixed.notice, /current pricing/);
});

test("stock and live variant requirements block purchase while retaining a valid total", () => {
  const amla = product(1, "Amla");
  for (const overrides of [
    { quantityAvailable: 0 }, { quantityAvailable: -1 }, { availableForSale: false }, { id: "preview-variant" },
  ]) {
    const unavailable = product(2, "Reetha", 10000, { variants: [variant(2, 10000, overrides)] });
    const summary = getComboPurchaseSummary([amla, unavailable], 2, "shopify");
    assert.equal(summary.canShowTotal, true);
    assert.equal(summary.purchasable, false);
    assert.match(summary.notice, /currently unavailable/);
  }
  const preview = product(2, "Reetha", 12000, { variants: undefined });
  assert.equal(getComboPurchaseSummary([amla, preview], 2, "shopify").purchasable, false);
  assert.equal(getComboPurchaseSummary([amla, preview], 2, "preview").purchasable, true);
  const untracked = product(2, "Reetha", 10000, { variants: [variant(2, 10000, { quantityAvailable: null })] });
  assert.equal(getComboPurchaseSummary([amla, untracked], 2, "shopify").purchasable, true);
});

test("catalog resolves preview slugs and searches saved names, ingredients and current botanicals", () => {
  const products = [product(1, "Amla", 10000, { botanical: "Phyllanthus emblica" }), product(2, "Reetha"), product(3, "Hibiscus")];
  const entries = buildComboCatalog([
    combo("Classic Duo", products.slice(0, 2), { ingredients: "Cleanse and condition" }),
    combo("Floral Duo", [], { previewSlugs: [products[1].slug, products[2].slug] }),
  ], products, "preview");
  assert.deepEqual(ids(filter(entries, { query: "  CLASSIC  " })), ["Classic Duo"]);
  assert.deepEqual(ids(filter(entries, { query: "condition" })), ["Classic Duo"]);
  assert.deepEqual(ids(filter(entries, { query: "emblica" })), ["Classic Duo"]);
  assert.deepEqual(ids(filter(entries, { query: "hibiscus" })), ["Floral Duo"]);
  assert.deepEqual(filter(entries, { query: "unrelated" }), []);
  assert.deepEqual(entries[1].products, products.slice(1));
  assert.equal(entries[1].count, 2);
});

test("size and availability filters compose without changing the saved featured order", () => {
  const products = Array.from({ length: 6 }, (_, index) => product(index + 1, `Jar ${index + 1}`));
  const entries = buildComboCatalog([
    combo("Six", products), combo("Three", products.slice(0, 3)), combo("Two", products.slice(0, 2)), combo("Four", products.slice(0, 4)),
    combo("Missing", [...products.slice(0, 2), product(99, "Unpublished")]),
  ], products, "shopify");
  assert.deepEqual(ids(filter(entries)), ["Six", "Three", "Two", "Four", "Missing"]);
  assert.deepEqual(ids(filter(entries, { size: "4+" })), ["Six", "Four"]);
  assert.deepEqual(ids(filter(entries, { size: "3" })), ["Three", "Missing"]);
  assert.deepEqual(ids(filter(entries, { size: "3", availableOnly: true })), ["Three"]);
  assert.deepEqual(ids(filter(entries, { size: "2" })), ["Two"]);
});

test("price sorting uses selected variant totals and keeps unknown totals last in both directions", () => {
  const products = [product(1, "Base", 10000), product(2, "High", 30000), product(3, "Low", 5000), product(4, "Same", 5000)];
  const entries = buildComboCatalog([
    combo("Unknown", [products[0], product(99, "Missing")]), combo("High", products.slice(0, 2)),
    combo("Low", [products[0], products[2]]), combo("Same", [products[0], products[3]]),
  ], products, "shopify");
  assert.deepEqual(ids(filter(entries, { sort: "price-low" })), ["Low", "Same", "High", "Unknown"]);
  assert.deepEqual(ids(filter(entries, { sort: "price-high" })), ["High", "Low", "Same", "Unknown"]);
  assert.deepEqual(ids(filter(entries, { sort: "name" })), ["High", "Low", "Same", "Unknown"]);
  assert.deepEqual(ids(entries), ["Unknown", "High", "Low", "Same"]);
});

test("price sorting groups currency codes instead of treating amounts as comparable", () => {
  const rupees = [product(1, "Amla", 50000), product(2, "Reetha", 50000)];
  const dollars = [3, 4].map((id) => product(id, `USD ${id}`, 100, { variants: [variant(id, 100, { currencyCode: "USD" })] }));
  const entries = buildComboCatalog([combo("USD", dollars), combo("INR", rupees), combo("Mixed", [rupees[0], dollars[0]])], [...rupees, ...dollars], "shopify");
  assert.deepEqual(ids(filter(entries, { sort: "price-low" })), ["INR", "USD", "Mixed"]);
  assert.deepEqual(ids(filter(entries, { sort: "price-high" })), ["INR", "USD", "Mixed"]);
});
