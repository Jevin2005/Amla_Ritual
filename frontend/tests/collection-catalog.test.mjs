import test from "node:test";
import assert from "node:assert/strict";
import { buildSync } from "esbuild";
import { fileURLToPath } from "node:url";

const bundle = buildSync({
  entryPoints: [fileURLToPath(new URL("../src/domain/collection-catalog.ts", import.meta.url))],
  bundle: true, platform: "node", format: "esm", write: false,
});
const { buildCollectionCatalog, filterCollectionCatalog } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`);

const variant = (id, price = 10000, overrides = {}) => ({
  id: `gid://shopify/ProductVariant/${id}`, title: "100 g", pricePaise: price,
  currencyCode: "INR", availableForSale: true, quantityAvailable: 5, ...overrides,
});
const product = (id, overrides = {}) => ({
  id: `gid://shopify/Product/${id}`, slug: `jar-${id}`, name: `Jar ${id}`, botanical: "",
  subtitle: "", ingredient: "", formulation: "", size: "100 g", collectionNumber: String(id),
  ritualStep: "Condition", concerns: [], searchTerms: [], collections: [],
  pricePaise: 10000, currencyCode: "INR", availableForSale: true, variants: [variant(id)], ...overrides,
});
const combo = (id, members, overrides = {}) => ({
  id, name: id, ingredients: "Botanical pairing", caption: "",
  image: { url: "/combo.webp", altText: id, width: 1000, height: 700 },
  productIds: members.map((item) => item.id), previewSlugs: [], ...overrides,
});
const defaults = { kind: "all", query: "", goal: "All", step: "All", collection: null, size: "all", availableOnly: false, sort: "collection" };
const filter = (entries, options = {}) => filterCollectionCatalog(entries, { ...defaults, ...options });
const labels = (entries) => entries.map((entry) => entry.kind === "product" ? entry.product.slug : entry.combo.combo.id);
const collection = (handle) => ({ id: handle, handle, title: handle });

test("mixed ordering places two numerically ordered jars before each saved-order combo without mutating inputs", () => {
  const products = [product(10), product(2), product(1), product(20), product(3)];
  const combos = [combo("second", products.slice(0, 2)), combo("first", products.slice(1, 3)), combo("third", products.slice(2, 4))];
  const entries = buildCollectionCatalog(products, combos, "shopify");
  assert.deepEqual(labels(entries), ["jar-1", "jar-2", "second", "jar-3", "jar-10", "first", "jar-20", "third"]);
  assert.deepEqual(products.map((item) => item.collectionNumber), ["10", "2", "1", "20", "3"]);
  assert.deepEqual(combos.map((item) => item.id), ["second", "first", "third"]);
  assert.deepEqual(labels(filter(entries)), labels(entries));
});

test("large collections have no rendering cap and retain all remaining products or combos", () => {
  const products = Array.from({ length: 135 }, (_, index) => product(index + 1));
  const combos = Array.from({ length: 70 }, (_, index) => combo(`combo-${index}`, products.slice(0, 2)));
  const entries = buildCollectionCatalog(products, combos, "shopify");
  assert.equal(entries.length, 205);
  assert.equal(entries.filter((entry) => entry.kind === "product").length, 135);
  assert.equal(entries.filter((entry) => entry.kind === "combo").length, 70);
  assert.deepEqual(labels(entries).slice(-3), ["combo-67", "combo-68", "combo-69"]);
  assert.equal(buildCollectionCatalog(products, [], "shopify").length, 135);
  assert.equal(buildCollectionCatalog([], combos, "shopify").length, 70);
  assert.deepEqual(buildCollectionCatalog([], [], "shopify"), []);
});

test("repeated identities are deduplicated within each kind while product and combo keys remain distinct", () => {
  const amla = product(1);
  const reetha = product(2);
  const pairing = combo(amla.id, [amla, reetha]);
  const entries = buildCollectionCatalog([amla, { ...amla, slug: "renamed" }, { ...reetha, id: "other-id" }, reetha], [pairing, pairing], "shopify");
  assert.deepEqual(labels(entries), ["jar-1", "jar-2", amla.id]);
  assert.equal(new Set(entries.map((entry) => entry.id)).size, 3);
  assert.equal(entries[0].id, `product:${amla.id}`);
  assert.equal(entries[2].id, `combo:${amla.id}`);
});

test("kind and size filters compose, with jar-count filters excluding individual products", () => {
  const products = Array.from({ length: 5 }, (_, index) => product(index + 1));
  const entries = buildCollectionCatalog(products, [combo("duo", products.slice(0, 2)), combo("trio", products.slice(0, 3)), combo("four", products.slice(0, 4))], "shopify");
  assert.equal(filter(entries, { kind: "individual" }).length, 5);
  assert.deepEqual(labels(filter(entries, { kind: "combos" })), ["duo", "trio", "four"]);
  assert.deepEqual(labels(filter(entries, { size: "2" })), ["duo"]);
  assert.deepEqual(labels(filter(entries, { size: "3" })), ["trio"]);
  assert.deepEqual(labels(filter(entries, { size: "4+" })), ["four"]);
  assert.deepEqual(filter(entries, { kind: "individual", size: "2" }), []);
});

test("goal, step and collection must all match the same combo member", () => {
  const cleanse = product(1, { ritualStep: "Cleanse", concerns: ["Scalp Ritual"], collections: [collection("wash")] });
  const condition = product(2, { ritualStep: "Condition", collections: [collection("mask")] });
  const entries = buildCollectionCatalog([cleanse, condition], [combo("duo", [cleanse, condition])], "shopify");
  assert.deepEqual(labels(filter(entries, { goal: "Scalp Ritual", step: "Cleanse", collection: " WASH " })), ["jar-1", "duo"]);
  assert.deepEqual(filter(entries, { goal: "Softness + Shine", step: "Cleanse" }), []);
  assert.deepEqual(filter(entries, { goal: "Scalp Ritual", step: "Cleanse", collection: "mask" }), []);
  assert.deepEqual(labels(filter(entries, { goal: "Softness + Shine", step: "Condition", collection: "mask" })), ["jar-2", "duo"]);
});

test("search finds saved combo names, ingredients and full member search fields without ignoring other filters", () => {
  const amla = product(1, { name: "Amla", botanical: "Phyllanthus emblica", subtitle: "Natural shine", ingredient: "Amla fruit", formulation: "Single botanical", searchTerms: ["prewash"] });
  const reetha = product(2, { name: "Reetha", ritualStep: "Cleanse", searchTerms: ["soapnut"] });
  const entries = buildCollectionCatalog([amla, reetha], [combo("Classic Duo", [amla, reetha], { ingredients: "Amla + Reetha" })], "shopify");
  for (const query of ["  AMLA  ", "emblica", "Natural shine", "fruit", "single botanical", "prewash"]) {
    assert.deepEqual(labels(filter(entries, { query })), ["jar-1", "Classic Duo"], query);
  }
  assert.deepEqual(labels(filter(entries, { query: "classic" })), ["Classic Duo"]);
  assert.deepEqual(labels(filter(entries, { query: "Amla + Reetha" })), ["Classic Duo"]);
  assert.deepEqual(labels(filter(entries, { query: "soapnut", kind: "combos", step: "Cleanse" })), ["Classic Duo"]);
  assert.deepEqual(filter(entries, { query: "soapnut", kind: "individual", step: "Condition" }), []);
  assert.deepEqual(filter(entries, { query: "missing" }), []);
});

test("available-only excludes unavailable individual stock and incomplete or unpurchasable combos", () => {
  const available = product(1);
  const soldOut = product(2, { availableForSale: false, variants: [variant(2, 10000, { availableForSale: false })] });
  const emptyStock = product(3, { variants: [variant(3, 10000, { quantityAvailable: 0 })] });
  const untracked = product(4, { variants: [variant(4, 10000, { quantityAvailable: null })] });
  const products = [available, soldOut, emptyStock, untracked];
  const entries = buildCollectionCatalog(products, [combo("available", [available, untracked]), combo("sold-out", [available, soldOut]), combo("zero-stock", [available, emptyStock]), combo("incomplete", [available, product(99)])], "shopify");
  assert.deepEqual(labels(filter(entries, { availableOnly: true })), ["jar-1", "jar-4"]);
  assert.equal(entries.find((entry) => entry.kind === "combo" && entry.combo.combo.id === "incomplete").combo.count, 2);
  assert.equal(filter(entries, { kind: "combos", size: "2" }).length, 4);
});

test("unknown member sets stay discoverable without member filters, but cannot satisfy an active member filter", () => {
  const missing = combo("missing", [product(90), product(91)]);
  const entries = buildCollectionCatalog([], [missing], "shopify");
  assert.deepEqual(labels(filter(entries)), ["missing"]);
  assert.deepEqual(labels(filter(entries, { query: "missing", size: "2" })), ["missing"]);
  assert.deepEqual(filter(entries, { goal: "Cleanse" }), []);
  assert.deepEqual(filter(entries, { collection: "wash" }), []);
  assert.deepEqual(filter(entries, { availableOnly: true }), []);
});

test("editorial pairings resolve their jars but cannot be purchased without a separate listing", () => {
  const amla = product(1, { variants: undefined });
  const reetha = product(2, { variants: undefined });
  const preview = combo("preview", [], { previewSlugs: [amla.slug, reetha.slug] });
  const entries = buildCollectionCatalog([amla, reetha], [preview], "preview");
  assert.equal(filter(entries, { kind: "combos", availableOnly: true }).length, 0);
  assert.deepEqual(entries[2].combo.products, [amla, reetha]);
  assert.equal(entries[2].combo.purchase.canShowTotal, false);
  assert.equal(filter(buildCollectionCatalog([amla, reetha], [preview], "shopify"), { kind: "combos", availableOnly: true }).length, 0);
  const dollars = product(2, { variants: [variant(2, 100, { currencyCode: "USD" })] });
  const mixed = buildCollectionCatalog([product(1), dollars], [combo("mixed", [product(1), dollars])], "shopify");
  assert.equal(filter(mixed, { kind: "combos", availableOnly: true }).length, 0);
});

test("price order uses the combo product's own variant price instead of summing its members", () => {
  const low = product(1, { pricePaise: 5000, variants: [variant(1, 40000)] });
  const high = product(2, { pricePaise: 30000, variants: [variant(2, 10000)] });
  const mid = product(3, { pricePaise: 20000 });
  const listing = product(4, { tags: ["combo:pair"], pricePaise: 1000, variants: [variant(4, 45000)] });
  const entries = buildCollectionCatalog([low, high, mid, listing], [combo("pair", [low, high])], "shopify");
  assert.deepEqual(labels(filter(entries, { sort: "price-low" })), ["jar-1", "jar-3", "jar-2", "pair"]);
  assert.deepEqual(labels(filter(entries, { sort: "price-high" })), ["pair", "jar-2", "jar-3", "jar-1"]);
  assert.equal(entries[2].combo.purchase.total, 45000);
  assert.equal(entries[2].combo.listingProduct.pricePaise, 45000);
  assert.equal(filter(entries, { kind: "individual" }).length, 3);
  assert.deepEqual(labels(entries), ["jar-1", "jar-2", "pair", "jar-3"]);
});

test("unknown totals and invalid individual prices remain last in either price direction", () => {
  const known = product(1);
  const invalid = [product(2, { pricePaise: NaN }), product(3, { pricePaise: -1 }), product(4, { pricePaise: Infinity })];
  const entries = buildCollectionCatalog([known, ...invalid], [combo("missing", [known, product(99)])], "shopify");
  for (const sort of ["price-low", "price-high"]) {
    assert.deepEqual(labels(filter(entries, { sort })), ["jar-1", "jar-2", "missing", "jar-3", "jar-4"]);
  }
});

test("price sorting groups currencies and leaves equal-price entries in curated order", () => {
  const products = [product(1, { pricePaise: 50000 }), product(2, { pricePaise: 100, currencyCode: "USD" }), product(3, { pricePaise: 20000 }), product(4, { pricePaise: 20000 })];
  const listing = product(5, { tags: ["combo:pair"], variants: [variant(5, 20000)] });
  const entries = buildCollectionCatalog([...products, listing], [combo("pair", [products[0], products[2]])], "shopify");
  assert.deepEqual(labels(filter(entries, { sort: "price-low" })), ["pair", "jar-3", "jar-4", "jar-1", "jar-2"]);
  assert.deepEqual(labels(filter(entries, { sort: "price-high" })), ["jar-1", "pair", "jar-3", "jar-4", "jar-2"]);
});

test("name sort spans individual products and combos without changing collection order", () => {
  const products = [product(1, { name: "Zebra" }), product(2, { name: "Amla" })];
  const entries = buildCollectionCatalog(products, [combo("Botanical Duo", products)], "shopify");
  assert.deepEqual(labels(filter(entries, { sort: "name" })), ["jar-2", "Botanical Duo", "jar-1"]);
  assert.deepEqual(labels(filter(entries)), ["jar-1", "jar-2", "Botanical Duo"]);
});

test("standalone combo products have their own listing, currency, count, and stock", () => {
  const single = product(1);
  const bundle = product(2, { productType: "Combo", tags: ["combo-count:3"], name: "Custom Trio", variants: [variant(2, 39900, { currencyCode: "INR" })] });
  const entries = buildCollectionCatalog([single, bundle, bundle], [], "shopify");
  assert.deepEqual(labels(filter(entries, { kind: "individual" })), [single.slug]);
  const [entry] = filter(entries, { kind: "combos", size: "3", availableOnly: true });
  assert.equal(entry.combo.listingProduct.slug, bundle.slug);
  assert.equal(entry.combo.purchase.total, 39900);
  assert.equal(entry.combo.purchase.items.length, 1);
  assert.equal(entry.combo.purchase.items[0].variant.id, bundle.variants[0].id);
  assert.equal(filter(entries, { kind: "combos", query: "custom" }).length, 1);
});

test("published combos use their own stock even if an individual jar is sold out", () => {
  const jars = [product(1, { availableForSale: false }), product(2)];
  const listing = product(3, { name: "NatureMist Classic Trio", tags: ["combo"], variants: [variant(3, 49900)] });
  const entries = buildCollectionCatalog([...jars, listing], [combo("saved-entry", jars, { name: "Classic Trio" })], "shopify");
  const [entry] = filter(entries, { kind: "combos", availableOnly: true });
  assert.equal(entry.combo.listingProduct.slug, listing.slug);
  assert.equal(entry.combo.purchase.total, 49900);
  assert.equal(filter(entries, { kind: "combos" }).length, 1);
  for (const overrides of [{ availableForSale: false }, { variants: [variant(3, 49900, { quantityAvailable: 0 })] }, { variants: [] }]) {
    const unavailable = buildCollectionCatalog([...jars, { ...listing, ...overrides }], [], "shopify");
    assert.equal(filter(unavailable, { kind: "combos", availableOnly: true }).length, 0);
  }
});

test("unknown combo counts do not invent a duo or trio and ambiguous names never pick a price", () => {
  const listings = [product(1, { tags: ["combo"], name: "Duo" }), product(2, { tags: ["combo"], name: "Duo" })];
  const entries = buildCollectionCatalog(listings, [combo("saved-duo", [], { name: "Duo" })], "shopify");
  assert.equal(entries[0].combo.listingProduct, undefined);
  assert.equal(entries[0].combo.purchase.canShowTotal, false);
  assert.equal(filter(entries, { kind: "individual" }).length, 0);
  assert.equal(filter(entries, { size: "2" }).length, 0);
  assert.equal(filter(entries, { availableOnly: true }).length, 2);
});

test("explicit pairing links take precedence over names and never attach to another pairing", () => {
  const tagged = product(1, { name: "Duo", tags: ["combo:specific"], variants: [variant(1, 34500, { compareAtPricePaise: null })], compareAtPricePaise: 60000 });
  const sameName = product(2, { name: "Duo", tags: ["combo"] });
  const entries = buildCollectionCatalog([tagged, sameName], [combo("other", [], { name: "Duo" }), combo("specific", [], { name: "Duo" })], "shopify");
  assert.equal(entries[0].combo.listingProduct.id, sameName.id);
  assert.equal(entries[1].combo.listingProduct.id, tagged.id);
  assert.equal(entries[1].combo.listingProduct.compareAtPricePaise, null);
  assert.equal(entries[1].combo.purchase.total, 34500);
});

test("care filters distinguish dual-use powders, hair cleansers and colour without inferring missing uses", () => {
  const jars = [
    product(1, { name: "Amla", careAreas: ["Hair Care", "Skin Care"] }),
    product(2, { name: "Hibiscus", careAreas: ["Hair Care", "Skin Care"] }),
    product(3, { name: "Reetha", careAreas: ["Hair Care"] }),
    product(4, { name: "Indigo", careAreas: ["Hair Colour"] }),
    product(5, { name: "Amla without confirmed uses" }),
  ];
  const entries = buildCollectionCatalog(jars, [], "shopify");
  assert.deepEqual(labels(filter(entries, { care: "hair" })), ["jar-1", "jar-2", "jar-3"]);
  assert.deepEqual(labels(filter(entries, { care: "skin" })), ["jar-1", "jar-2"]);
  assert.deepEqual(labels(filter(entries, { care: "both" })), ["jar-1", "jar-2"]);
  assert.deepEqual(labels(filter(entries, { care: "colour" })), ["jar-4"]);
  assert.equal(filter(entries, { care: "all" }).length, 5);
  assert.deepEqual(labels(filter(entries, { query: "skin care" })), ["jar-1", "jar-2"]);
});

test("skin and dual-use filters require every jar in a complete combo to qualify", () => {
  const amla = product(1, { careAreas: ["Hair Care", "Skin Care"] });
  const hibiscus = product(2, { careAreas: ["Hair Care", "Skin Care"] });
  const reetha = product(3, { careAreas: ["Hair Care"], ritualStep: "Cleanse" });
  const indigo = product(4, { careAreas: ["Hair Colour"], ritualStep: "Colour" });
  const misleadingListing = product(5, { tags: ["combo:mixed"], careAreas: ["Skin Care"] });
  const pairings = [combo("dual", [amla, hibiscus]), combo("mixed", [amla, reetha]), combo("colour", [amla, indigo]), combo("incomplete", [amla, product(99)])];
  const entries = buildCollectionCatalog([amla, hibiscus, reetha, indigo, misleadingListing], pairings, "shopify");
  for (const care of ["skin", "both"]) assert.deepEqual(labels(filter(entries, { care, kind: "combos" })), ["dual"]);
  assert.deepEqual(filter(entries, { care: "skin", step: "Cleanse" }), []);
  assert.deepEqual(labels(filter(entries, { care: "colour", kind: "combos" })), ["colour"]);
  const unidentified = buildCollectionCatalog([product(6, { tags: ["combo"], careAreas: ["Skin Care"] })], [], "shopify");
  assert.deepEqual(filter(unidentified, { care: "skin" }), []);
});

test("Pack filters select traditional hair packs without classifying them as skin care", () => {
  const pack = product(1, { ritualStep: "Pack", careAreas: ["Hair Care"], concerns: ["Hair Packs"] });
  const wash = product(2, { ritualStep: "Cleanse", careAreas: ["Hair Care"] });
  const entries = buildCollectionCatalog([pack, wash], [], "shopify");
  assert.deepEqual(labels(filter(entries, { care: "hair", goal: "Hair Packs", step: "Pack" })), ["jar-1"]);
  for (const care of ["skin", "both"]) assert.deepEqual(filter(entries, { care }), []);
  assert.deepEqual(filter(entries, { goal: "Skin Care" }), []);
});
