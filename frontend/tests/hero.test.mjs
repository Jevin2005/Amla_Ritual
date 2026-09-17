import test from "node:test";
import assert from "node:assert/strict";
import { buildSync } from "esbuild";
import { fileURLToPath } from "node:url";

const result = buildSync({
  stdin: { contents: 'export * from "./products.ts"; export * from "./hero.ts";', resolveDir: fileURLToPath(new URL("../src/domain/catalog/", import.meta.url)) },
  bundle: true, platform: "node", format: "esm", write: false,
});
const { products, getHomepageHeroProducts, parseHeroSettings, defaultHeroSettings, boundedNumber, isGlbUrl, nextHeroIndex } = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`);

const image = { url: "https://cdn.shopify.com/poster.png", altText: "Amla", width: 800, height: 800 };
const product = { ...products[0], id: "product-amla", heroEnabled: true, heroModel: { url: "https://cdn.shopify.com/amla.glb", altText: "Amla" }, heroPoster: image, heroBackground: image };

test("only explicitly enabled products with three resolved assets appear", () => {
  const catalog = [product, ...["heroModel", "heroPoster", "heroBackground"].map((key) => ({ ...product, [key]: null })), ...[false, undefined, "true"].map((heroEnabled) => ({ ...product, heroEnabled }))];
  assert.deepEqual(getHomepageHeroProducts(catalog).map((item) => item.id), [product.id]);
  assert.equal(catalog.length, 7, "excluded slides stay in the catalog");
  assert.equal(getHomepageHeroProducts([{ ...product, heroPoster: { ...image, url: " " } }]).length, 0);
  assert.equal(getHomepageHeroProducts([{ ...product, heroModel: { url: "https://cdn.shopify.com/amla.usdz" } }]).length, 0);
});

test("saved order is stable and does not mutate the catalog", () => {
  const catalog = [{ ...product, id: "third", heroOrder: 3 }, { ...product, id: "first", heroOrder: 0 }, { ...product, id: "second", heroOrder: 2 }, { ...product, id: "tied", heroOrder: 2 }];
  assert.deepEqual(getHomepageHeroProducts(catalog).map((item) => item.id), ["first", "second", "tied", "third"]);
  assert.equal(catalog[0].id, "third");
});

test("disabled products cannot be restored by archived hero entries", () => {
  assert.deepEqual(getHomepageHeroProducts([{ ...product, heroEnabled: false }], [{ productId: product.id, poster: image }]), []);
});

test("each slide keeps its own product identity, copy, media and duration", () => {
  const saved = { ...product, hero: { headlineMiddle: "Saved headline" }, heroDurationSeconds: 3 };
  const original = structuredClone(saved);
  const [slide] = getHomepageHeroProducts([saved]);
  assert.equal(slide.heroEntryId, product.id);
  assert.equal(slide.hero.headlineMiddle, "Saved headline");
  assert.equal(slide.heroDurationSeconds, 3);
  assert.equal(slide.heroPoster.url, image.url);
  assert.equal(slide.name, product.name);
  assert.deepEqual(saved, original);
});

test("settings default safely and preserve explicit false and zero", () => {
  assert.deepEqual(parseHeroSettings(null), defaultHeroSettings);
  const settings = parseHeroSettings({ heroAutoplay: { value: "false" }, heroAutoRotate: { value: "false" }, heroCursorMotion: { value: "false" }, heroRotationSpeed: { value: "0" }, heroTransition: { value: "none" } });
  assert.equal(settings.autoplay, false);
  assert.equal(settings.autoRotate, false);
  assert.equal(settings.cursorMotion, false);
  assert.equal(settings.rotationSpeed, 0);
  assert.equal(settings.transition, "none");
});

test("invalid admin timing falls back and finite values stay within bounds", () => {
  for (const value of [null, undefined, "", " ", "broken", Infinity]) assert.equal(boundedNumber(value, 8, 3, 60), 8);
  assert.equal(boundedNumber("1", 8, 3, 60), 3);
  assert.equal(boundedNumber("999", 8, 3, 60), 60);
  assert.equal(parseHeroSettings({ heroTransition: { value: "unexpected" } }).transition, "fade");
});

test("only browser-renderable GLB URLs qualify", () => {
  for (const url of ["https://cdn.shopify.com/model.GLB?v=1", "/models/amla.glb"]) assert.equal(isGlbUrl(url), true, url);
  for (const url of [null, "", "model.glb", "https://", "http://cdn.shopify.com/model.glb", "javascript:model.glb", "https://cdn.shopify.com/model.usdz", "//host/model.glb", "https://user:secret@host/model.glb"]) assert.equal(isGlbUrl(url), false, String(url));
});

test("carousel handles empty, single, forward, backward and removed slides", () => {
  assert.equal(nextHeroIndex(0, 0), 0);
  assert.equal(nextHeroIndex(0, 1), 0);
  assert.equal(nextHeroIndex(1, 2), 0);
  assert.equal(nextHeroIndex(0, 3, -1), 2);
  assert.equal(nextHeroIndex(7, 2, 0), 1);
});
