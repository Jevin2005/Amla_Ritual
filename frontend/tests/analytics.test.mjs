import test from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { fileURLToPath } from "node:url";

async function load(entry) {
  const bundle = await build({
    entryPoints: [fileURLToPath(new URL(`../src/features/analytics/${entry}.ts`, import.meta.url))],
    bundle: true, platform: "node", format: "esm", write: false,

  });
  return import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}#${Math.random()}`);
}
const commerce = await load("ecommerce");
const product = { id: "gid://shopify/Product/10", slug: "amla", name: "Amla", productType: "Herbal powder", currencyCode: "INR", pricePaise: 19900, variants: [{ id: "gid://shopify/ProductVariant/20", title: "100g" }] };
const line = { productId: product.id, slug: "amla", productName: "Amla", variantId: "gid://shopify/ProductVariant/20", variantTitle: "100g", quantity: 2, pricePaise: 19900, lineTotalPaise: 35820, currencyCode: "INR" };
const cart = (items) => ({ items, currencyCode: "INR" });

test("actual accepted deltas, discounts, no-op, remove and clear use correct money and quantities", () => {
  const changes = commerce.cartChanges(cart([{ ...line, quantity: 1, lineTotalPaise: 17910 }]), cart([line]), [product]);
  assert.deepEqual(changes.added, { currency: "INR", value: 179.1, items: [{ item_id: product.id, item_name: "Amla", item_category: "Herbal powder", item_variant: "100g", price: 179.1, quantity: 1 }] });
  assert.equal(changes.removed.items.length, 0);
  assert.equal(commerce.cartChanges(cart([line]), cart([line]), [product]).added.items.length, 0);
  assert.equal(commerce.cartChanges(cart([line]), cart([]), [product]).removed.value, 358.2);
  assert.equal(commerce.cartChanges(cart([line]), cart([]), [product]).removed.items[0].quantity, 2);
  assert.equal(commerce.cartPayload(cart([line]), [product]).value, 358.2);
});

test("Shopify line ID changes cannot produce false additions; multiple lines aggregate", () => {
  const before = cart([{ ...line, lineId: "old" }]);
  const after = cart([{ ...line, lineId: "new1", quantity: 1 }, { ...line, lineId: "new2", quantity: 1 }]);
  assert.deepEqual(commerce.cartChanges(before, after, [product]).added.items, []);
  assert.deepEqual(commerce.cartChanges(before, after, [product]).removed.items, []);
});

test("URLs, paths and arbitrary search terms cannot leak PII or checkout secrets", () => {
  assert.equal(commerce.safePageUrl("https://naturemist.shop/shop/amla?email=a@b.com#phone", ["amla"]), "https://naturemist.shop/shop/amla");
  assert.equal(commerce.safePageUrl("https://checkout.naturemist.shop/checkouts/private-token?key=secret"), "https://checkout.naturemist.shop/");
  assert.equal(commerce.safePageUrl("https://naturemist.shop/customer@example.com"), "https://naturemist.shop/");
  assert.equal(commerce.safePageUrl("javascript:alert(1)"), "");
  assert.equal(commerce.safeSearchTerm("person@example.com", [product]), "[redacted]");
  assert.equal(commerce.safeSearchTerm("  Amla  ", [product]), "amla");
});

async function browserFixture(t, consent) {
  const old = { window: globalThis.window, document: globalThis.document, calls: globalThis.__shopifyAnalyticsCalls, localStorage: globalThis.localStorage };
  const scripts = [];
  globalThis.__shopifyAnalyticsCalls = [];
  const saved = new Map();
  globalThis.localStorage = { getItem: key => saved.get(key), setItem: (key,value) => saved.set(key,value) };
  globalThis.window = { location: { hostname: "naturemist.shop", href: "https://naturemist.shop/shop/amla?email=private@example.com" }, naturemistConsent: { analytics: consent } };
  window.Shopify = { analytics: { publish: (eventName, payload) => globalThis.__shopifyAnalyticsCalls.push({eventName, payload}), getConfig: () => ({}) } };
  globalThis.document = { referrer: "https://search.example/path?phone=123", createElement: () => ({}), head: { appendChild: (script) => scripts.push(script) } };
  t.after(() => { globalThis.window = old.window; globalThis.document = old.document; globalThis.__shopifyAnalyticsCalls = old.calls; globalThis.localStorage = old.localStorage; });
  const runtime = await load("runtime", true);
  const config = { enabled: true, gaId: "G-TEST123", shopifyEnabled: true, shopId: "gid://shopify/Shop/1", checkoutDomain: "checkout.naturemist.shop", hosts: ["naturemist.shop"] };
  runtime.configureAnalytics(config, [product]);
  const events = () => (window.dataLayer || []).map((args) => Array.from(args)).filter((args) => args[0] === "event");
  return { runtime, config, scripts, events };
}

test("no tags or events before consent; grants do not replay old actions; revocation blocks collection", async (t) => {
  const { runtime, scripts, events } = await browserFixture(t, false);
  runtime.trackPage();
  runtime.trackEcommerce("add_to_cart", commerce.cartPayload(cart([line]), [product]));
  assert.equal(scripts.length, 0);
  assert.equal(events().length, 0);
  window.naturemistConsent.analytics = true;
  runtime.trackPage();
  runtime.trackPage();
  assert.equal(scripts.length, 1);
  assert.deepEqual(events().map((event) => event[1]), ["page_view"]);
  window.naturemistConsent.analytics = false;
  runtime.trackEcommerce("checkout_handoff", commerce.cartPayload(cart([line]), [product]));
  assert.equal(events().length, 1);
  assert.equal(window["ga-disable-G-TEST123"], true);
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(globalThis.__shopifyAnalyticsCalls.length, 1, "only the page viewed during consent is published");
});

test("navigation, impressions, money, Shopify SDK fields and no storefront purchase", async (t) => {
  const { runtime, events } = await browserFixture(t, true);
  runtime.trackPage();
  const payload = commerce.cartPayload(cart([line]), [product]);
  runtime.trackImpression("product", "view_item", payload);
  runtime.trackImpression("product", "view_item", payload);
  runtime.trackEcommerce("add_to_cart", { ...payload, email: "private@example.com" }, "gid://shopify/Cart/public-token");
  runtime.trackEcommerce("purchase", { ...payload, transaction_id: "fake" });
  runtime.trackEcommerce("refund", payload);
  runtime.trackEcommerce("add_to_cart", { ...payload, items: [{ ...payload.items[0], quantity: NaN }] });
  window.location.href = "https://naturemist.shop/shop";
  runtime.trackPage();
  window.location.href = "https://naturemist.shop/shop/amla";
  runtime.trackPage();
  assert.deepEqual(events().map((event) => event[1]), ["page_view", "view_item", "add_to_cart", "page_view", "page_view"]);
  assert.equal(events()[3][2].page_referrer, "https://naturemist.shop/shop/amla");
  assert.ok(!JSON.stringify(events()).includes("private@example.com"));
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(globalThis.__shopifyAnalyticsCalls.filter(event => event.eventName === "page_viewed").length, 3);
  assert.equal(globalThis.__shopifyAnalyticsCalls.filter(event => event.eventName === "product_viewed").length, 1);
  assert.ok(!JSON.stringify(globalThis.__shopifyAnalyticsCalls).includes("private@example.com"));
});

test("preview hosts and Shopify privacy denial override a permissive CMP", async (t) => {
  const { runtime, config, events } = await browserFixture(t, false);
  window.naturemistConsent.analytics = true;
  window.Shopify = { customerPrivacy: { analyticsProcessingAllowed: () => false } };
  runtime.trackPage();
  assert.equal(events().length, 0);
  delete window.Shopify;
  window.location.hostname = "preview.vercel.app";
  runtime.configureAnalytics(config, [product]);
  runtime.trackPage();
  assert.equal(events().length, 0);
});

test("a blocked Google script cannot throw through initialization or a cart action", async (t) => {
  const { runtime, config } = await browserFixture(t, false);
  document.head.appendChild = () => { throw new Error("Blocked script"); };
  window.naturemistConsent.analytics = true;
  assert.doesNotThrow(() => runtime.configureAnalytics(config, [product]));
  assert.doesNotThrow(() => runtime.trackEcommerce("checkout_handoff", commerce.cartPayload(cart([line]), [product])));
});

test("official Shopify cart tracker sends confirmed deltas once and never replays denied changes", async (t) => {
  const {runtime} = await browserFixture(t, true);
  const snapshot = (quantity, updatedAt) => ({ id: "gid://shopify/Cart/public", updatedAt, lines: { nodes: quantity ? [{ id: "line", quantity, merchandise: { id: line.variantId, title: "100g", price: { amount: "199", currencyCode: "INR" }, product: { id: product.id, title: "Amla", vendor: "NatureMist" } } }] : [] } });
  const before = snapshot(1, "2026-10-26T10:00:00Z"), after = snapshot(2, "2026-10-26T10:01:00Z");
  runtime.trackConfirmedShopifyCart(before, after);
  runtime.trackConfirmedShopifyCart(before, after);
  assert.equal(__shopifyAnalyticsCalls.filter(e => e.eventName === "product_added_to_cart").length, 1);
  assert.equal(__shopifyAnalyticsCalls.find(e => e.eventName === "product_added_to_cart").payload.currentLine.quantity, 2);
  window.naturemistConsent.analytics = false;
  runtime.trackConfirmedShopifyCart(after, snapshot(3, "2026-10-26T10:02:00Z"));
  assert.equal(__shopifyAnalyticsCalls.length, 2);
});

test("selected non-default variants reach Shopify without exposing internal metadata to Google", async (t) => {
  const { runtime, events } = await browserFixture(t, true);
  const selectedVariant = { id: "gid://shopify/ProductVariant/21", title: "200g", pricePaise: 34900, sku: "AMLA-200" };
  const fullProduct = { ...product, vendor: "NatureMist Botanicals", variants: [...product.variants, selectedVariant] };
  const payload = commerce.ecommercePayload([commerce.productItem(fullProduct, selectedVariant)], "INR");
  runtime.trackImpression("selected-variant", "view_item", payload);
  const viewed = __shopifyAnalyticsCalls.find(({ eventName }) => eventName === "product_viewed").payload.products[0];
  assert.equal(viewed.variantId, selectedVariant.id);
  assert.equal(viewed.variantTitle, "200g");
  assert.equal(viewed.price.amount, "349");
  assert.equal(viewed.vendor, "NatureMist Botanicals");
  assert.equal(viewed.sku, "AMLA-200");
  const googleItem = events().find((event) => event[1] === "view_item")[2].items[0];
  assert.equal(googleItem.item_id, product.id);
  assert.equal(googleItem.item_variant, "200g");
  assert.ok(!Object.keys(googleItem).some((key) => key.startsWith("shopify")));
});

test("late Shopify readiness retries each destination without repeating Google or product effects", async (t) => {
  const { runtime, events } = await browserFixture(t, true);
  const bus = window.Shopify.analytics;
  delete window.Shopify.analytics;
  const payload = commerce.ecommercePayload([commerce.productItem(product)], "INR");
  // Detail effects may precede their parent route bridge during hydration.
  runtime.trackImpression("detail", "view_item", payload);
  runtime.trackPage();
  runtime.trackImpression("detail", "view_item", payload);
  assert.equal(events().filter((event) => event[1] === "view_item").length, 1);
  window.Shopify.analytics = bus;
  runtime.trackPage();
  runtime.trackImpression("detail", "view_item", payload);
  runtime.trackPage();
  runtime.trackImpression("detail", "view_item", payload);
  assert.equal(events().filter((event) => event[1] === "page_view").length, 1);
  assert.equal(events().filter((event) => event[1] === "view_item").length, 1);
  assert.equal(__shopifyAnalyticsCalls.filter(({ eventName }) => eventName === "page_viewed").length, 1);
  assert.equal(__shopifyAnalyticsCalls.filter(({ eventName }) => eventName === "product_viewed").length, 1);
});

test("Shopify-only configuration acknowledges only events actually published", async (t) => {
  const { runtime, config } = await browserFixture(t, false);
  runtime.configureAnalytics({ ...config, gaId: "" }, [product]);
  window.naturemistConsent.analytics = true;
  const payload = commerce.ecommercePayload([commerce.productItem(product)], "INR");
  const bus = window.Shopify.analytics;
  delete window.Shopify.analytics;
  assert.equal(runtime.trackEcommerce("view_item", payload), false);
  runtime.trackImpression("detail", "view_item", payload);
  runtime.trackPage();
  window.Shopify.analytics = bus;
  assert.equal(runtime.trackEcommerce("view_item_list", payload), false, "Shopify has no product-list impression event");
  runtime.trackImpression("detail", "view_item", payload);
  runtime.trackPage();
  assert.deepEqual(__shopifyAnalyticsCalls.map(({ eventName }) => eventName), ["product_viewed", "page_viewed"]);
});

test("query-only navigation counts once while query values stay out of event payloads", async (t) => {
  const { runtime, events } = await browserFixture(t, true);
  window.location.href = "https://naturemist.shop/shop/amla?variant=20&email=secret@example.com";
  runtime.trackPage();
  runtime.trackPage();
  window.location.href = "https://naturemist.shop/shop/amla?variant=21&email=secret@example.com";
  runtime.trackPage("/shop/amla?variant=21&email=secret@example.com");
  runtime.trackPage();
  assert.equal(events().filter((event) => event[1] === "page_view").length, 2);
  assert.equal(__shopifyAnalyticsCalls.filter(({ eventName }) => eventName === "page_viewed").length, 2);
  assert.ok(!JSON.stringify(events()).includes("secret@example.com"));
  assert.ok(!JSON.stringify(__shopifyAnalyticsCalls).includes("variant="));
});

test("cart views carry only public confirmed cart fields and support an empty cart", async (t) => {
  const { runtime, events } = await browserFixture(t, true);
  const nativeCart = {
    id: "gid://shopify/Cart/public?key=cart-secret", updatedAt: "2026-10-27T10:00:00Z", buyerIdentity: { email: "secret@example.com" },
    checkoutUrl: "https://checkout.naturemist.shop/checkouts/secret", cost: { totalAmount: { amount: "199.00", currencyCode: "INR", email: "secret@example.com" } },
    lines: { nodes: [{ id: "line?key=line-secret", quantity: 1, attributes: [{ key: "email", value: "secret@example.com" }], merchandise: { id: line.variantId, title: "100g", price: { amount: "199.00", currencyCode: "INR" }, product: { id: product.id, title: "Amla", vendor: "NatureMist" } } }] },
  };
  assert.equal(runtime.trackCartView(commerce.cartPayload(cart([line]), [product]), nativeCart), true);
  const payload = __shopifyAnalyticsCalls.find(({ eventName }) => eventName === "cart_viewed").payload;
  assert.equal(payload.cart.id, "gid://shopify/Cart/public");
  assert.equal(payload.cart.lines.nodes[0].id, "line");
  assert.equal(payload.cart.lines.nodes[0].merchandise.id, line.variantId);
  assert.equal(payload.cart.cost.totalAmount.amount, "199.00");
  assert.ok(!JSON.stringify(payload).includes("secret"));
  assert.equal(runtime.trackCartView(commerce.cartPayload(cart([]))), true);
  assert.equal(__shopifyAnalyticsCalls.filter(({ eventName }) => eventName === "cart_viewed").at(-1).payload.cart, null);
  assert.equal(events().filter((event) => event[1] === "view_cart").length, 1, "an empty cart does not invent Google ecommerce items");
  window.naturemistConsent.analytics = false;
  assert.equal(runtime.trackCartView(commerce.cartPayload(cart([]))), false);
  assert.equal(__shopifyAnalyticsCalls.filter(({ eventName }) => eventName === "cart_viewed").length, 2);
});

test("a cart view waits for both configured destinations without repeating Google on a Shopify retry", async (t) => {
  const { runtime, events } = await browserFixture(t, true);
  const bus = window.Shopify.analytics;
  delete window.Shopify.analytics;
  const delivery = {};
  const payload = commerce.cartPayload(cart([line]), [product]);
  assert.equal(runtime.trackCartView(payload, undefined, delivery), false);
  assert.equal(events().filter((event) => event[1] === "view_cart").length, 1);
  window.Shopify.analytics = bus;
  assert.equal(runtime.trackCartView(payload, undefined, delivery), true);
  assert.equal(runtime.trackCartView(payload, undefined, delivery), true);
  assert.equal(events().filter((event) => event[1] === "view_cart").length, 1);
  assert.equal(__shopifyAnalyticsCalls.filter(({ eventName }) => eventName === "cart_viewed").length, 1);
});

test("storefront records checkout handoff while Shopify's Google app owns checkout and purchase events", async (t) => {
  const { runtime, events } = await browserFixture(t, true);
  const payload = commerce.cartPayload(cart([line]), [product]);
  assert.equal(runtime.trackEcommerce("checkout_handoff", payload), true);
  for (const event of ["begin_checkout", "add_shipping_info", "add_payment_info", "purchase"]) {
    assert.equal(runtime.trackEcommerce(event, payload), false);
  }
  assert.deepEqual(events().map((event) => event[1]), ["checkout_handoff"]);
  assert.equal(__shopifyAnalyticsCalls.length, 0);
});
