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
const product = { ...products[0], id: "product-amla" };
const complete = { id: "hero-amla", productId: product.id, model: { url: "https://cdn.shopify.com/amla.glb", altText: "Amla in 3D" }, poster: image, background: image, copy: {} };

test("hero requires three resolved assets, while incomplete products stay in the catalog", () => {
  const catalog = [product, { ...product, id: "standard-product", slug: "standard-product" }];
  const entries = [complete, ...["model", "poster", "background"].map((field) => ({ ...complete, id: field, [field]: null }))];
  assert.deepEqual(getHomepageHeroProducts(catalog, entries).map((product) => product.slug), [product.slug]);
  assert.equal(catalog.length, 2);
  assert.equal(getHomepageHeroProducts(catalog, [{ ...complete, poster: { ...image, url: "  " } }]).length, 0);
  assert.equal(getHomepageHeroProducts(catalog, [{ ...complete, model: { url: "https://cdn.shopify.com/amla.usdz" } }]).length, 0);
});

test("hero order respects admin order then collection order without changing input", () => {
  const catalog = [{ ...product, id: "third", slug: "third", collectionNumber: "30" }, { ...product, id: "first", slug: "first" }, { ...product, id: "second", slug: "second", collectionNumber: "2" }, { ...product, id: "last", slug: "last", collectionNumber: "not-a-number" }];
  const entries = catalog.map((item) => ({ ...complete, id: item.id, productId: item.id, order: item.id === "first" ? 0 : undefined }));
  assert.deepEqual(getHomepageHeroProducts(catalog, entries).map((product) => product.slug), ["first", "second", "third", "last"]);
  assert.equal(catalog[0].slug, "third");
});

test("legacy product fields cannot resurrect a draft or deleted homepage entry", () => {
  const legacy = { ...product, heroModel: complete.model, heroPoster: image, heroBackground: image, heroEnabled: true };
  assert.deepEqual(getHomepageHeroProducts([legacy]), []);
  assert.deepEqual(getHomepageHeroProducts([legacy], []), []);
  assert.equal(getHomepageHeroProducts([legacy], [{ ...complete, background: null }]).length, 0);
});

test("homepage copy and media never change the normal product data", () => {
  const original = structuredClone(product);
  const entry = { ...complete, copy: { headlineMiddle: "Hero-only headline" }, durationSeconds: 12 };
  const [slide] = getHomepageHeroProducts([product], [entry]);
  assert.equal(slide.hero.headlineMiddle, "Hero-only headline");
  assert.equal(slide.heroDurationSeconds, 12);
  assert.equal(slide.name, product.name);
  assert.deepEqual(product, original);
  assert.equal(getHomepageHeroProducts([product], [{ ...complete, productId: null }]).length, 0);
  assert.equal(getHomepageHeroProducts([product], [{ ...complete, productId: "unpublished-product" }]).length, 0);
});

test("separate entries for the same product keep distinct identities and media", () => {
  const entries = [complete, { ...complete, id: "second-hero", poster: { ...image, url: "https://cdn.shopify.com/second.png" } }];
  const slides = getHomepageHeroProducts([product], entries);
  assert.deepEqual(slides.map((slide) => slide.heroEntryId), ["hero-amla", "second-hero"]);
  assert.notEqual(slides[0].heroPoster.url, slides[1].heroPoster.url);
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
