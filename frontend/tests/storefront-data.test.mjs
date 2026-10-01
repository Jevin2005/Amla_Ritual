import test from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { fileURLToPath } from "node:url";

// Compile the public server loader and its real domain mappers. Only the
// framework's server marker/render cache and the network boundary are stubbed.
const bundle = await build({
  stdin: {
    contents: 'export * from "./src/lib/shopify/storefront.ts"; export { formatCurrency, getHomepageHeroProducts } from "./src/domain/catalog/products.ts";',
    resolveDir: fileURLToPath(new URL("../", import.meta.url)),
  },
  tsconfig: fileURLToPath(new URL("../tsconfig.json", import.meta.url)),
  bundle: true,
  platform: "node",
  format: "esm",
  write: false,
  plugins: [{
    name: "server-test-boundary",
    setup(builder) {
      builder.onResolve({ filter: /^(server-only|react)$/ }, ({ path }) => ({ path, namespace: "test-framework" }));
      builder.onLoad({ filter: /.*/, namespace: "test-framework" }, ({ path }) => ({
        contents: path === "react" ? "export const cache = (loader) => loader;" : "export {};",
      }));
    },
  }],
});
const { getStorefront, getStorefrontProduct, formatCurrency, getHomepageHeroProducts } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`);

const pageInfo = { hasNextPage: false, endCursor: null };
const connection = (nodes = []) => ({ nodes, pageInfo });
const field = (value) => ({ value });
const money = (amount) => ({ amount, currencyCode: "INR" });
const variant = {
  id: "gid://shopify/ProductVariant/1", title: "Default Title", availableForSale: true,
  quantityAvailable: 5, sku: "AMLA", selectedOptions: [], price: money("449.50"),
  compareAtPrice: money("499.99"), image: null,
};
const rawProduct = (overrides = {}) => ({
  id: "gid://shopify/Product/1", handle: "amla-powder", title: "Amla Powder",
  description: "", productType: "", vendor: "NatureMist", tags: [], availableForSale: true,
  seo: { title: null, description: null }, featuredImage: null, images: connection(),
  priceRange: { minVariantPrice: money("449.50"), maxVariantPrice: money("449.50") },
  compareAtPriceRange: { minVariantPrice: money("499.99") }, collections: connection(),
  selectedOrFirstAvailableVariant: variant, variants: connection([variant]), ...overrides,
});
const policy = { title: "Store policy", handle: "policy", url: "/policy", body: "Published policy" };
const shop = {
  name: "NatureMist", primaryDomain: { url: "https://naturemist.shop" },
  privacyPolicy: policy, termsOfService: policy, shippingPolicy: policy, refundPolicy: policy,
};

async function withShopify({ products = [], product = null, catalogError = false, detailError = false, configured = true, strict = false, heroes = [] } = {}, callback) {
  const savedFetch = globalThis.fetch;
  const savedEnv = { ...process.env };
  const requests = [];
  Object.assign(process.env, {
    SHOPIFY_STORE_DOMAIN: configured ? "test-naturemist.myshopify.com" : "",
    SHOPIFY_STOREFRONT_ACCESS_TOKEN: configured ? "test-token" : "",
    SHOPIFY_STOREFRONT_PRIVATE_TOKEN: "", SHOPIFY_STRICT_MODE: String(strict), NEXT_PHASE: "",
  });
  globalThis.fetch = async (_url, options) => {
    const request = JSON.parse(options.body);
    requests.push(request);
    const query = request.query;
    let data;
    if (query.includes("query NatureMistCatalog(")) {
      if (catalogError) throw new Error("Catalog unavailable");
      data = { products: connection(products) };
    } else if (query.includes("query NatureMistProductDetail(")) {
      if (detailError) throw new Error("Product unavailable");
      data = { product };
    } else if (query.includes("query NatureMistCollections(")) data = { collections: connection() };
    else if (query.includes("query NatureMistShop(")) data = { shop };
    else if (query.includes("query NatureMistSiteContent(")) data = { metaobject: null, mainMenu: null, footerMenu: null };
    else if (query.includes("query NatureMistReviews(")) data = { videoReviews: connection(), customerReviews: connection() };
    else if (query.includes("query NatureMistHomepageHeroes(")) data = { metaobjects: connection(heroes) };
    else throw new Error("Unexpected Shopify request");
    return new Response(JSON.stringify({ data }), { status: 200 });
  };
  try {
    await callback(requests);
  } finally {
    globalThis.fetch = savedFetch;
    for (const key of Object.keys(process.env)) if (!(key in savedEnv)) delete process.env[key];
    Object.assign(process.env, savedEnv);
  }
}

test("product metafields control hero selection, references, all copy, order and timing", async () => {
  const image = { url: "https://cdn.shopify.com/hero.png", width: 900, height: 900, altText: "Saved poster" };
  const saved = {
    heroEnabled: field("true"), heroOrder: field("2"), heroDuration: field("3"),
    heroPoster: { reference: { image } }, heroBackground: { reference: { image: { ...image, url: "https://cdn.shopify.com/background.png" } } },
    heroModel: { reference: { alt: "Saved model", sources: [{ url: "https://cdn.shopify.com/model.usdz" }, { url: "https://cdn.shopify.com/model.glb" }] } },
    ...Object.fromEntries(["Eyebrow", "HeadlineFirst", "HeadlineMiddle", "HeadlineItalic", "Description", "BadgeText", "BadgeSubtitle"].map((key) => [`hero${key}`, field(`Saved ${key}`)])),
  };
  const first = rawProduct({ ...saved, id: "first", heroOrder: field("1"), heroDuration: field("12"), heroModel: { reference: { url: "https://cdn.shopify.com/file.glb" } } });
  await withShopify({ products: [rawProduct(saved), first, rawProduct({ ...saved, id: "hidden", heroEnabled: field("false") }), rawProduct({ ...saved, id: "missing", heroModel: { reference: null } })] }, async (requests) => {
    const catalog = (await getStorefront()).products;
    const slides = getHomepageHeroProducts(catalog);
    assert.equal(catalog.length, 4);
    assert.deepEqual(slides.map((slide) => slide.id), ["first", "gid://shopify/Product/1"]);
    assert.deepEqual(slides.map((slide) => slide.heroDurationSeconds), [12, 3]);
    assert.equal(slides[0].heroModel.url, "https://cdn.shopify.com/file.glb");
    assert.equal(slides[1].heroModel.url, "https://cdn.shopify.com/model.glb");
    assert.equal(slides[1].heroBackground.url, "https://cdn.shopify.com/background.png");
    for (const key of ["eyebrow", "headlineFirst", "headlineMiddle", "headlineItalic", "description", "badgeText", "badgeSubtitle"]) assert.equal(slides[1].hero[key], `Saved ${key[0].toUpperCase()}${key.slice(1)}`);
    const query = requests.find((request) => request.query.includes("NatureMistCatalog")).query;
    for (const key of ["hero_enabled", "hero_order", "hero_duration", "hero_poster", "hero_background", "hero_model", "hero_eyebrow"]) assert.ok(query.includes(`key: "${key}"`));
    assert.ok(!requests.some((request) => request.query.includes("NatureMistHomepageHeroes")));
  });
});

test("published product facts, formulation and SEO come from Shopify", async () => {
  const product = rawProduct({
    botanicalName: field("Phyllanthus emblica"), botanical: field("legacy botanical"),
    plantPart: field("Fruit"), netQuantity: field("250g"), size: field("legacy size"),
    ingredient: field("Amla fruit powder"), formulation: field(" Botanical powder "),
    subtitle: field("A botanical ritual"), benefits: field('["A published benefit"]'),
    howToUse: field('["Follow the product pack"]'), howTo: field('["Legacy instructions"]'),
    seo: { title: "Shop Amla", description: "The merchant's search description." },
  });
  await withShopify({ products: [product], product }, async () => {
    const [mapped] = (await getStorefront()).products;
    assert.equal(mapped.formulation, "Botanical powder");
    assert.equal(mapped.botanical, "Phyllanthus emblica");
    assert.equal(mapped.plantPart, "Fruit");
    assert.equal(mapped.size, "250g");
    assert.equal(mapped.ingredient, "Amla fruit powder");
    assert.deepEqual(mapped.benefits, ["A published benefit"]);
    assert.deepEqual(mapped.howTo, ["Follow the product pack"]);
    assert.equal(mapped.seoTitle, "Shop Amla");
    assert.equal(mapped.metaDescription, "The merchant's search description.");
    assert.equal(mapped.pricePaise, 44950);
    assert.equal(mapped.compareAtPricePaise, 49999);
    assert.equal((await getStorefrontProduct("amla-powder")).formulation, "Botanical powder");
  });
});

test("catalog and detail queries preserve Shopify description HTML without flattening it", async () => {
  const descriptionHtml = '<h2>Saved heading</h2><p>Original <strong>formatted</strong> copy.</p><ul><li>Saved benefit</li></ul>';
  const product = rawProduct({ description: "Saved heading Original formatted copy. Saved benefit", descriptionHtml });
  await withShopify({ products: [product], product }, async (requests) => {
    assert.equal((await getStorefront()).products[0].descriptionHtml, descriptionHtml);
    const detail = await getStorefrontProduct("amla-powder");
    assert.equal(detail.descriptionHtml, descriptionHtml);
    assert.equal(detail.description, product.description);
    for (const operation of ["NatureMistCatalog", "NatureMistProductDetail"]) {
      assert.match(requests.find(({ query }) => query.includes(operation)).query, /\bdescriptionHtml\b/);
    }
  });
});

test("missing live facts never inherit preview profiles or generated claims", async () => {
  await withShopify({ products: [rawProduct(), rawProduct({ handle: "new-product", title: "New Product" })] }, async () => {
    const { products } = await getStorefront();
    for (const product of products) {
      for (const key of ["botanical", "plantPart", "size", "ingredient", "storage", "texture", "ritualStep", "experience"]) assert.equal(product[key], "", key);
      for (const key of ["benefits", "howTo", "mixers", "suitableFor", "safety", "colorConsiderations", "faqs"]) assert.deepEqual(product[key], [], key);
      assert.equal(product.formulation, undefined);
      assert.equal(product.shortDescription, `Explore ${product.name}.`);
      assert.equal(product.description, `Explore ${product.name}.`);
      assert.equal(product.metaDescription, `Explore ${product.name}.`);
    }
  });
});

test("ritual and experience fields accept casing, whitespace and American color spelling", async () => {
  const cases = [[" cleanse ", "Cleanse"], ["CONDITION", "Condition"], ["colour", "Colour"], ["Color", "Colour"], ["unknown", ""]];
  await withShopify({ products: cases.map(([input], index) => rawProduct({
    id: String(index), ritualStep: field(input), experience: field(" familiar "),
  })) }, async () => {
    const { products } = await getStorefront();
    assert.deepEqual(products.map((product) => product.ritualStep), cases.map(([, expected]) => expected));
    assert.ok(products.every((product) => product.experience === "Familiar"));
  });
});

test("zero-priced selected variants remain zero and fractional prices remain exact", async () => {
  await withShopify({ products: [rawProduct({ selectedOrFirstAvailableVariant: { ...variant, price: money("0") } })] }, async () => {
    assert.equal((await getStorefront()).products[0].pricePaise, 0);
  });
  assert.equal(formatCurrency(44900), "₹449");
  assert.equal(formatCurrency(44950), "₹449.50");
  assert.equal(formatCurrency(49999), "₹499.99");
  assert.equal(formatCurrency(1250, "USD"), "$12.50");
});

test("legacy authored fields still map without inventing new values", async () => {
  await withShopify({ products: [rawProduct({
    botanical: field("Legacy botanical"), size: field("100 g"),
    howTo: field("First pack instruction\nSecond pack instruction"),
    metaDescription: field("Metafield search copy"),
  })] }, async () => {
    const [product] = (await getStorefront()).products;
    assert.equal(product.botanical, "Legacy botanical");
    assert.equal(product.size, "100 g");
    assert.deepEqual(product.howTo, ["First pack instruction", "Second pack instruction"]);
    assert.equal(product.metaDescription, "Metafield search copy");
  });
});

test("all catalog consumers receive the saved numeric collection order, independently of hero order", async () => {
  await withShopify({ products: [
    rawProduct({ id: "tenth", collectionNumber: field("10"), heroOrder: field("1") }),
    rawProduct({ id: "second", collectionNumber: field("2"), heroOrder: field("20"), heroEnabled: field("false") }),
  ] }, async () => {
    const { products } = await getStorefront();
    assert.deepEqual(products.map((product) => product.id), ["second", "tenth"]);
  });
});

test("listing media uses the product's own gallery when featured media is absent", async () => {
  const image = { url: "https://cdn.shopify.com/indigo.jpg", altText: "Indigo", width: 800, height: 800 };
  await withShopify({ products: [rawProduct({ images: connection([image]) }), rawProduct({ id: "empty" })] }, async () => {
    const { products } = await getStorefront();
    assert.deepEqual(products[0].featuredImage, image);
    assert.equal(products[1].featuredImage, null);
  });
});

test("metafield bullets and JSON lists preserve authored sentences and trim whitespace", async () => {
  await withShopify({ products: [rawProduct({
    benefits: field("Soft, smooth lengths • Natural shine"),
    howToUse: field("Mix with water, then apply. • Rinse well."),
    concerns: field("Cleanse, Scalp Ritual"),
    safety: field('["  Avoid eyes.  ", " "]'),
  })] }, async () => {
    const [product] = (await getStorefront()).products;
    assert.deepEqual(product.benefits, ["Soft, smooth lengths", "Natural shine"]);
    assert.deepEqual(product.howTo, ["Mix with water, then apply.", "Rinse well."]);
    assert.deepEqual(product.concerns, ["Cleanse", "Scalp Ritual"]);
    assert.deepEqual(product.safety, ["Avoid eyes."]);
  });
});

test("unconfigured local preview remains available without making network requests", async () => {
  await withShopify({ configured: false }, async (requests) => {
    const storefront = await getStorefront();
    assert.equal(storefront.source, "preview");
    assert.ok(storefront.products.length > 0);
    assert.ok(await getStorefrontProduct("amla-powder"));
    assert.equal(requests.length, 0);
  });
});

test("connected catalog and detail failures or empty responses never expose preview products", async () => {
  for (const failed of [false, true]) {
    await withShopify({ catalogError: failed, detailError: failed }, async () => {
      const storefront = await getStorefront();
      assert.equal(storefront.source, "shopify");
      assert.deepEqual(storefront.products, []);
      assert.deepEqual(storefront.bundles, []);
      assert.equal(await getStorefrontProduct("amla-powder"), undefined);
    });
  }
});

test("strict live catalog validation still rejects failures and an empty published catalog", async () => {
  await withShopify({ strict: true, catalogError: true, detailError: true }, async () => {
    await assert.rejects(getStorefront(), /Catalog unavailable/);
    await assert.rejects(getStorefrontProduct("amla-powder"), /Product unavailable/);
  });
  await withShopify({ strict: true }, async () => {
    await assert.rejects(getStorefront(), /no published products/);
  });
});
