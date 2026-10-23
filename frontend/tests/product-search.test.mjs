import test from "node:test";
import assert from "node:assert/strict";
import { buildSync } from "esbuild";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const compiled = buildSync({ entryPoints: [`${root}src/domain/catalog/search.ts`], bundle: true, platform: "node", format: "esm", write: false });
const { searchProducts, toSearchProduct } = await import(`data:text/javascript;base64,${Buffer.from(compiled.outputFiles[0].text).toString("base64")}`);
const product = (overrides = {}) => ({ slug: "amla-powder", name: "Amla Powder", botanical: "Phyllanthus emblica", subtitle: "For hair care", pricePaise: 23400, size: "250 g", ingredient: "Indian gooseberry", shortDescription: "Botanical conditioning", ritualStep: "Condition", searchTerms: [], benefits: ["Shine"], concerns: ["Dry hair"], tags: [], ...overrides });
const base = [toSearchProduct(product()), toSearchProduct(product({ slug: "indigo", name: "Indigo Powder", botanical: "Indigofera tinctoria", ingredient: "Indigo", ritualStep: "Colour" }))];

test("blank search returns every product with no six-item or first-page cap", () => {
  const catalog = Array.from({ length: 125 }, (_, i) => toSearchProduct(product({ slug: `new-${i}`, name: `New botanical ${i}` })));
  assert.equal(searchProducts(catalog, "  ").length, 125);
  assert.equal(searchProducts(catalog, "botanical 124")[0].slug, "new-124");
});
test("matches reordered words across name and ingredient fields", () => {
  assert.deepEqual(searchProducts(base, "  powder   AMLA ").map(p => p.slug), ["amla-powder"]);
  assert.deepEqual(searchProducts(base, "amla gooseberry").map(p => p.slug), ["amla-powder"]);
  assert.equal(searchProducts(base, "amla impossible").length, 0);
});
test("normalizes accents, hyphens and colour spelling", () => {
  const catalog = [toSearchProduct(product({ name: "Café Hair-Oil", slug: "cafe-oil", ritualStep: "Colour" }))];
  assert.equal(searchProducts(catalog, "cafe hair oil").length, 1);
  assert.equal(searchProducts(catalog, "color").length, 1);
  assert.equal(searchProducts(base, "amla-powder")[0].slug, "amla-powder");
});
test("includes tags, benefits, botanical names, concerns and collection titles", () => {
  const catalog = [toSearchProduct(product({ tags: ["New Arrival"], collections: [{ title: "Summer rituals" }] }))];
  for (const query of ["arrival", "shine", "emblica", "dry", "summer"]) assert.equal(searchProducts(catalog, query).length, 1, query);
});
test("ranks a product name above a secondary ingredient mention", () => {
  const catalog = [toSearchProduct(product({ slug: "mask", name: "Hair Mask", ingredient: "Amla powder" })), base[0]];
  assert.equal(searchProducts(catalog, "amla powder")[0].slug, "amla-powder");
});
test("new products without hero media or custom search terms are searchable", () => {
  const newProduct = toSearchProduct(product({ id: "new-shopify-id", slug: "neem-leaf", name: "Neem Leaf Powder", ingredient: "Neem leaves", heroEnabled: false, searchTerms: undefined, featuredImage: null }));
  assert.equal(searchProducts([...base, newProduct], "neem")[0].id, "new-shopify-id");
});
test("a refreshed catalog replaces removed entries and updates availability", () => {
  const refreshed = [toSearchProduct(product({ slug: "neem", name: "Neem Powder", availableForSale: false }))];
  assert.equal(searchProducts(refreshed, "indigo").length, 0);
  assert.equal(searchProducts(refreshed, "neem")[0].available, false);
});
test("search payload is limited to public result fields and does not mutate products", () => {
  const source = product({ descriptionHtml: "<p>Private implementation markup</p>", heroModel: { url: "model.glb" } });
  const before = JSON.stringify(source);
  const entry = toSearchProduct(source);
  assert.equal(entry.descriptionHtml, undefined);
  assert.equal(entry.heroModel, undefined);
  searchProducts([entry], "amla");
  assert.equal(JSON.stringify(source), before);
});
