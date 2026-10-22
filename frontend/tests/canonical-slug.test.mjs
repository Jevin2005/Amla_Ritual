import test from "node:test";
import assert from "node:assert/strict";
import { buildSync } from "esbuild";
import { fileURLToPath } from "node:url";

const bundle = buildSync({ entryPoints: [fileURLToPath(new URL("../src/domain/catalog/canonical-slug.ts", import.meta.url))], bundle: true, platform: "node", format: "esm", write: false });
const { getCanonicalProductSlug, matchesProductSlug, findProductBySlug } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`);
const titles = {
  "amla-powder": "Amla Fruit Powder for Herbal Hair Packs",
  "reetha-powder": "Reetha Cleansing Powder for Herbal Hair Washes",
  "shikakai-powder": "Shikakai Pod Powder for Traditional Hair Washing",
  "hibiscus-powder": "Hibiscus Flower Powder for Herbal Hair Packs",
  "bhringraj-powder": "Bhringraj Powder for Traditional Hair & Scalp Packs",
  "indigo-powder": "Indigo Leaf Powder for Botanical Hair Colour",
};

test("descriptive workbook titles and 200 g packaging preserve each established powder URL", () => {
  for (const [slug, title] of Object.entries(titles)) {
    for (const weight of ["", ", 200 g", " 200g", " (200 grams)"]) {
      const name = `NatureMist ${title}${weight}`;
      assert.equal(getCanonicalProductSlug(name, "an-old-conflicting-handle"), slug, name);
      assert.equal(matchesProductSlug(slug, { slug: getCanonicalProductSlug(name), name }), true);
    }
  }
  assert.equal(getCanonicalProductSlug("100% Pure Amla Powder 200g"), "amla-powder");
});

test("a blend or a different product format does not acquire a single powder's URL", () => {
  assert.notEqual(getCanonicalProductSlug("Amla and Hibiscus Powder Hair Pack 200 g"), "amla-powder");
  assert.notEqual(getCanonicalProductSlug("Amla Hair Oil 200g"), "amla-powder");
  assert.equal(getCanonicalProductSlug("Neem Leaf Powder 200g"), "neem-leaf-powder");
});

test("shared pack words and weight are not distinctive ingredient lookup tokens", () => {
  const catalog = Object.entries(titles).map(([slug, name]) => ({ slug, name: `${name} 200g` }));
  for (const query of ["200g", "Hair Packs", "Fruit Powder", "Traditional", "Aloe Hair Pack 200g"]) assert.equal(findProductBySlug(query, catalog), undefined, query);
  assert.equal(findProductBySlug("hibiscus", catalog)?.slug, "hibiscus-powder");
});

test("unprefixed live titles keep canonical navigation ahead of conflicting historical Shopify handles", () => {
  const handles = { "amla-powder": "amla", "reetha-powder": "wildcrafted-amla-powder", "indigo-powder": "reetha-powder", "shikakai-powder": "indigo-powder", "bhringraj-powder": "bhringraj-powder", "hibiscus-powder": "hibiscus-powder" };
  const catalog = Object.entries(titles).map(([expectedSlug, title]) => {
    const name = `${title}, 200 g`;
    const shopifyHandle = handles[expectedSlug];
    const slug = getCanonicalProductSlug(name, shopifyHandle);
    assert.equal(slug, expectedSlug);
    return { slug, name, shopifyHandle };
  }).reverse();
  for (const expectedSlug of Object.keys(titles)) assert.equal(findProductBySlug(expectedSlug, catalog)?.slug, expectedSlug);
});
