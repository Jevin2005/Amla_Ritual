import test from "node:test";
import assert from "node:assert/strict";
import { buildSync } from "esbuild";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const bundle = buildSync({ entryPoints: [`${root}src/domain/botanical-combos.ts`], bundle: true, platform: "node", format: "esm", write: false });
const { parseBotanicalCombos, defaultBotanicalCombos, resolveComboProducts, comboProductCount, getBotanicalComboPage, MAX_BOTANICAL_COMBOS } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`);
const field = (value) => ({ value });
const node = (id, ids = ["gid://shopify/Product/1", "gid://shopify/Product/2"]) => ({ id, name: field(id), products: field(JSON.stringify(ids)), photo: { reference: { image: { url: "https://cdn.shopify.com/s/files/1/2/3/photo.webp", altText: "Paired jars" } } } });
const section = (nodes) => ({ combos: { references: { nodes } } });

test("missing, draft and deliberately empty live sections never show sample combos", () => {
  assert.equal(parseBotanicalCombos(null).enabled, false);
  assert.deepEqual(parseBotanicalCombos(section([])).combos, []);
  assert.equal(parseBotanicalCombos({ ...section([node("a")]), enabled: field("false") }).enabled, false);
  assert.equal(defaultBotanicalCombos.combos.length, 3);
});

test("Shopify selection order, saved copy and animation settings are honored", () => {
  const content = parseBotanicalCombos({ ...section([node("b"), node("a"), node("b")]), heading: field("Daily rituals."), pageTurnEnabled: field("false"), pageTurnDuration: field("2.2") });
  assert.deepEqual(content.combos.map((combo) => combo.id), ["b", "a"]);
  assert.equal(content.heading, "Daily rituals.");
  assert.equal(content.pageTurnEnabled, false);
  assert.equal(content.pageTurnDuration, 2.2);
  assert.equal(parseBotanicalCombos({ pageTurnDuration: field("bad") }).pageTurnDuration, 1.25);
  assert.equal(parseBotanicalCombos({ pageTurnDuration: field("100") }).pageTurnDuration, 3);
});

test("missing products preserve the expected count; renamed products resolve by ID", () => {
  const combo = parseBotanicalCombos(section([node("a")])).combos[0];
  const renamed = { id: "gid://shopify/Product/1", slug: "new-amla-name", name: "New Amla Name" };
  assert.deepEqual(resolveComboProducts(combo, [renamed]), [renamed]);
  assert.equal(comboProductCount(combo), 2);
  assert.equal(resolveComboProducts(combo, [renamed]).length, 1);
});

test("invalid images, duplicate products and malformed product lists are excluded", () => {
  const unsafe = node("unsafe"); unsafe.photo.reference.image.url = "https://other.example/photo.webp";
  const broken = node("broken"); broken.products.value = "broken json";
  const duplicate = node("duplicate", ["gid://shopify/Product/1", "gid://shopify/Product/1"]);
  assert.deepEqual(parseBotanicalCombos(section([unsafe, broken, duplicate, { id: "draft" }])).combos, []);
});

test("pages show consecutive groups of three in the saved Shopify order", () => {
  const combos = parseBotanicalCombos(section(Array.from({ length: 9 }, (_, index) => node(String(index + 1))))).combos;
  const pages = [0, 1, 2].map((index) => getBotanicalComboPage(combos, index));
  assert.deepEqual(pages.map((page) => page.combos.map((combo) => combo.id)), [["1", "2", "3"], ["4", "5", "6"], ["7", "8", "9"]]);
  assert.deepEqual(pages.map((page) => page.startIndex), [0, 3, 6]);
  assert.ok(pages.every((page) => page.pageCount === 3));
  assert.deepEqual(pages.flatMap((page) => page.combos), combos);
});

test("last pages keep their remaining combos without repeating earlier entries", () => {
  for (const count of [1, 2, 3, 4, 5, 6, 7, 8]) {
    const combos = parseBotanicalCombos(section(Array.from({ length: count }, (_, index) => node(String(index + 1))))).combos;
    const pageCount = Math.ceil(count / 3);
    const lastPage = getBotanicalComboPage(combos, pageCount - 1);
    assert.equal(lastPage.pageCount, pageCount);
    assert.deepEqual(lastPage.combos.map((combo) => combo.id), Array.from({ length: (count - 1) % 3 + 1 }, (_, index) => String((pageCount - 1) * 3 + index + 1)));
  }
  assert.deepEqual(getBotanicalComboPage([], 0), { combos: [], startIndex: 0, pageCount: 0 });
});

test("the complete supported Shopify list is available across twenty pages", () => {
  const combos = parseBotanicalCombos(section(Array.from({ length: MAX_BOTANICAL_COMBOS + 1 }, (_, index) => node(String(index + 1))))).combos;
  assert.equal(combos.length, 60);
  const lastPage = getBotanicalComboPage(combos, 19);
  assert.equal(lastPage.pageCount, 20);
  assert.deepEqual(lastPage.combos.map((combo) => combo.id), ["58", "59", "60"]);
});
