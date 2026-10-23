import test from "node:test";
import assert from "node:assert/strict";
import { buildSync } from "esbuild";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const bundle = buildSync({ entryPoints: [`${root}src/domain/botanical-combos.ts`], bundle: true, platform: "node", format: "esm", write: false });
const { parseBotanicalCombos, parseProductReferences, comboFromProduct, defaultBotanicalCombos, resolveComboProducts, comboProductCount, getBotanicalComboPage, MAX_BOTANICAL_COMBOS } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`);
const gid = (id) => `gid://shopify/Product/${id}`;
const field = (value) => ({ value });
const product = (id, overrides = {}) => ({
  id: gid(id), name: `NatureMist Set ${id}`, slug: `set-${id}`, tags: ["combo"],
  comboProductIds: [gid(900), gid(901)], comboIngredients: "Amla + Reetha", comboCaption: "Two jars",
  featuredImage: { url: "https://cdn.shopify.com/s/files/1/2/3/photo.webp", altText: "Paired jars", width: 1000, height: 700 },
  ...overrides,
});
const section = (products) => ({ comboProducts: field(JSON.stringify(products.map(({ id }) => id))) });
const parse = (products, settings = {}) => parseBotanicalCombos({ ...section(products), ...settings }, products);

test("missing, draft and deliberately empty sections never show sample combos", () => {
  assert.equal(parseBotanicalCombos(null).enabled, false);
  assert.deepEqual(parse([]).combos, []);
  assert.equal(parse([product(1)], { enabled: field("false") }).enabled, false);
  assert.equal(defaultBotanicalCombos.combos.length, 3);
});

test("product IDs preserve selected order and copy without any old metaobjects or linking tags", () => {
  const products = [product(2), product(1)];
  const content = parseBotanicalCombos({ ...section([...products, products[0]]), heading: field("Daily rituals."), pageTurnEnabled: field("false"), pageTurnDuration: field("2.2") }, [...products].reverse());
  assert.deepEqual(content.combos.map(({ id }) => id), [gid(2), gid(1)]);
  assert.equal(content.combos[0].name, "Set 2");
  assert.equal(content.combos[0].caption, "Two jars");
  assert.equal(content.combos[0].ingredients, "Amla + Reetha");
  assert.equal(content.heading, "Daily rituals.");
  assert.equal(content.pageTurnEnabled, false);
  assert.equal(content.pageTurnDuration, 2.2);
  assert.equal(parse([], { pageTurnDuration: field("bad") }).pageTurnDuration, 1.25);
  assert.equal(parse([], { pageTurnDuration: field("100") }).pageTurnDuration, 3);
});

test("unpublished listings are omitted; missing members preserve count and renamed jars resolve by ID", () => {
  const listing = product(1);
  const combo = parseBotanicalCombos(section([product(2), listing]), [listing]).combos[0];
  const renamed = { id: gid(900), slug: "new-amla-name", name: "New Amla Name" };
  assert.equal(combo.id, listing.id);
  assert.deepEqual(resolveComboProducts(combo, [renamed]), [renamed]);
  assert.equal(comboProductCount(combo), 2);
  const nested = product(901);
  assert.deepEqual(resolveComboProducts(combo, [renamed, nested]), [renamed]);
});

test("malformed lists, duplicates, self references and non-combo products do not become book entries", () => {
  for (const value of ["broken json", '["bad-id"]', '[1]', '{}']) assert.deepEqual(parseProductReferences(value), []);
  for (const comboProductIds of [[], [gid(900)], [gid(900), gid(900)], [gid(1), gid(900)], [gid(900), "bad-id"], Array.from({ length: 7 }, (_, i) => gid(900 + i))]) {
    assert.equal(comboFromProduct(product(1, { comboProductIds })), null);
  }
  assert.deepEqual(parse([product(1, { tags: [] })]).combos, []);
  assert.deepEqual(parseBotanicalCombos({ comboProducts: field("bad json") }, [product(1)]).combos, []);
});

test("missing images and blank image labels use the listing gallery or a neutral placeholder", () => {
  const gallery = product(1).featuredImage;
  assert.equal(comboFromProduct(product(1, { featuredImage: null, images: [gallery] })).image.url, gallery.url);
  const missing = comboFromProduct(product(1, { featuredImage: null, images: [] }));
  assert.equal(missing.image.url, "/images/product-placeholder.svg");
  assert.equal(comboFromProduct(product(1, { featuredImage: { ...gallery, altText: " " } })).image.altText, "Set 1");
});

test("pages show every selected combo once in consecutive groups of three", () => {
  for (const count of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
    const combos = parse(Array.from({ length: count }, (_, i) => product(i + 1))).combos;
    const pages = Array.from({ length: Math.ceil(count / 3) }, (_, i) => getBotanicalComboPage(combos, i));
    assert.deepEqual(pages.flatMap(({ combos }) => combos), combos);
    assert.equal(pages.at(-1).combos.length, (count - 1) % 3 + 1);
    assert.equal(pages.at(-1).startIndex, (pages.length - 1) * 3);
  }
  assert.deepEqual(getBotanicalComboPage([], 0), { combos: [], startIndex: 0, pageCount: 0 });
});

test("the supported product list spans twenty pages with no repeated entries", () => {
  const combos = parse(Array.from({ length: MAX_BOTANICAL_COMBOS + 1 }, (_, i) => product(i + 1))).combos;
  assert.equal(combos.length, 60);
  const lastPage = getBotanicalComboPage(combos, 19);
  assert.equal(lastPage.pageCount, 20);
  assert.deepEqual(lastPage.combos.map(({ id }) => id), [gid(58), gid(59), gid(60)]);
});
