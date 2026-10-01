import test from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { fileURLToPath } from "node:url";

// Run the real provider's closures with persistent state/ref slots. Tests may
// flush the captured mount effects to control hydration and request ordering.
const reactHarness = `
export const createContext = () => ({ Provider: "Provider" });
export const useContext = () => null;
export const useEffect = (effect) => { globalThis.__storeCartTestHooks.effects.push(effect); };
export const useMemo = (compute) => compute();
export const useCallback = (callback) => callback;
export function useState(initial) {
  const hooks = globalThis.__storeCartTestHooks;
  const index = hooks.cursor++;
  if (!(index in hooks.slots)) hooks.slots[index] = typeof initial === "function" ? initial() : initial;
  return [hooks.slots[index], (next) => {
    hooks.slots[index] = typeof next === "function" ? next(hooks.slots[index]) : next;
  }];
}
export function useRef(initial) { return useState(() => ({ current: initial }))[0]; }
`;
const bundled = await build({
  entryPoints: [fileURLToPath(new URL("../src/features/store/store-provider.tsx", import.meta.url))],
  bundle: true,
  platform: "node",
  format: "esm",
  jsx: "automatic",
  write: false,
  plugins: [{
    name: "cart-action-hook-harness",
    setup(builder) {
      builder.onResolve({ filter: /^react(?:\/jsx-runtime)?$/ }, ({ path }) => ({ path, namespace: "test-react" }));
      builder.onLoad({ filter: /.*/, namespace: "test-react" }, ({ path }) => ({
        contents: path === "react" ? reactHarness : "export const jsx = (type, props) => ({ type, props }); export const jsxs = jsx;",
      }));
    },
  }],
});
const { StoreProvider } = await import(`data:text/javascript;base64,${Buffer.from(bundled.outputFiles[0].text).toString("base64")}`);

const product = {
  id: "gid://shopify/Product/100",
  slug: "test-ritual",
  name: "Test Ritual",
  pricePaise: 10000,
  currencyCode: "INR",
  availableForSale: true,
  variants: [{
    id: "gid://shopify/ProductVariant/101",
    title: "100g",
    selectedOptions: [{ name: "Size", value: "100g" }],
    pricePaise: 10000,
    currencyCode: "INR",
    availableForSale: true,
    quantityAvailable: 10,
  }],
};
const remoteCart = {
  checkoutUrl: "https://example.myshopify.com/checkouts/real-cart",
  items: [{
    lineId: "gid://shopify/CartLine/line-1?cart=cart-1",
    slug: product.slug,
    productId: product.id,
    productName: product.name,
    variantId: product.variants[0].id,
    variantTitle: "100g",
    selectedOptions: product.variants[0].selectedOptions,
    quantity: 1,
    availableForSale: true,
    quantityAvailable: 10,
    pricePaise: 10000,
    compareAtPricePaise: null,
    lineSubtotalPaise: 10000,
    lineTotalPaise: 9500,
    discountAmountPaise: 500,
    currencyCode: "INR",
    image: null,
  }],
  totalQuantity: 1,
  subtotalPaise: 10000,
  totalPaise: 9500,
  discountAmountPaise: 500,
  currencyCode: "INR",
  subtotalEstimated: false,
  totalEstimated: true,
  discountCodes: [{ code: "EXISTING", applicable: true }],
};

function setup(t, { source = "shopify", products = [product] } = {}) {
  const oldWindow = globalThis.window;
  const oldHooks = globalThis.__storeCartTestHooks;
  const events = [];
  const requests = [];
  const responses = [];
  const cleanups = [];
  globalThis.window = {
    dispatchEvent: (event) => events.push(event.detail),
    localStorage: { getItem: () => null, setItem: () => {} },
  };
  globalThis.__storeCartTestHooks = { cursor: 0, slots: [], effects: [] };
  t.after(() => {
    for (const cleanup of cleanups) cleanup();
    if (oldWindow === undefined) delete globalThis.window;
    else globalThis.window = oldWindow;
    if (oldHooks === undefined) delete globalThis.__storeCartTestHooks;
    else globalThis.__storeCartTestHooks = oldHooks;
  });
  t.mock.method(globalThis, "fetch", async (url, options) => {
    requests.push({ url, method: options.method, body: options.body ? JSON.parse(options.body) : undefined });
    assert.match(url, /^\/api\/(?:shopify\/)?cart$/);
    assert.ok(responses.length, "Unexpected cart request; tests never access the network");
    const response = await responses.shift();
    if (response instanceof Error) throw response;
    return Response.json(response.body, { status: response.status || 200 });
  });
  const render = () => {
    globalThis.__storeCartTestHooks.cursor = 0;
    globalThis.__storeCartTestHooks.effects = [];
    return StoreProvider({ children: null, initialProducts: products, initialBundles: [], content: {}, source }).props.value;
  };
  const flushMountEffects = () => {
    for (const effect of globalThis.__storeCartTestHooks.effects.splice(0)) {
      const cleanup = effect();
      if (cleanup) cleanups.push(cleanup);
    }
  };
  return { render, requests, responses, events, flushMountEffects };
}

function displayedCart(store) {
  return {
    items: store.cart,
    count: store.cartCount,
    subtotal: store.subtotalPaise,
    total: store.totalPaise,
    discountAmount: store.discountAmountPaise,
    discountCodes: store.discountCodes,
    checkout: store.checkoutUrl,
    estimated: store.totalsEstimated,
  };
}

async function seedRemoteCart(harness) {
  harness.responses.push({ body: { cart: structuredClone(remoteCart) } });
  assert.deepEqual(await harness.render().addToCart(product.slug), remoteCart);
  harness.requests.length = 0;
  harness.events.length = 0;
  return displayedCart(harness.render());
}

const mutations = [
  ["add", (store) => store.addToCart(product.slug), null],
  ["bundle add", (store) => store.addManyToCart([product.slug]), null],
  ["update quantity", (store) => store.updateQuantity(product.slug, 2), undefined],
  ["remove", (store) => store.removeFromCart(product.slug), undefined],
  ["clear", (store) => store.clearCart(), undefined],
  ["apply preview-known discount", (store) => store.applyDiscountCode("WELCOME10"), false],
  ["remove discount", (store) => store.removeDiscountCode("EXISTING"), undefined],
  ["buyer identity", (store) => store.updateBuyerIdentity({ countryCode: "IN" }), null],
];

for (const [failure, response, expectedMessage] of [
  ["network failure", new Error("Shopify connection failed"), "Shopify connection failed"],
  ["HTTP failure", { status: 503, body: { error: "Shopify is temporarily unavailable" } }, "Shopify is temporarily unavailable"],
  ["Shopify user error", { body: { cart: remoteCart, userErrors: [{ code: "REJECTED", message: "Shopify rejected this change" }] } }, "Shopify rejected this change"],
  ["missing cart response", { body: { cart: null } }, "We could not update your bag. Please try again."],
]) {
  test(`Shopify ${failure} preserves the real bag across mutations`, async (t) => {
    for (const [name, mutate, result] of mutations) {
      await t.test(name, async (subtest) => {
        const harness = setup(subtest);
        const original = await seedRemoteCart(harness);
        harness.responses.push(response instanceof Error ? response : structuredClone(response));
        assert.equal(await mutate(harness.render()), result);
        const store = harness.render();
        assert.deepEqual(displayedCart(store), original);
        assert.equal(store.cartError, expectedMessage);
        assert.equal(store.announcement, expectedMessage);
        assert.equal(store.isCartBusy, false);
        assert.deepEqual(harness.events, [], "Failed actions must not emit success analytics");
        assert.equal(harness.requests.length, 1);
      });
    }
  });
}

test("Shopify rejects missing, malformed and foreign variants without a cart request", async (t) => {
  for (const [name, altered, variantId] of [
    ["missing", { ...product, variants: [] }, undefined],
    ["malformed", { ...product, variants: [{ ...product.variants[0], id: "preview:101" }] }, undefined],
    ["foreign", product, "gid://shopify/ProductVariant/999"],
  ]) {
    await t.test(name, async (subtest) => {
      const harness = setup(subtest, { products: [altered] });
      assert.equal(await harness.render().addToCart(product.slug, 1, true, variantId), null);
      assert.equal(harness.render().cartCount, 0);
      assert.match(harness.render().cartError, /product option is no longer available/);
      assert.equal(harness.requests.length, 0);
      assert.deepEqual(harness.events, []);
    });
  }
});

test("a Shopify bundle cannot silently omit an item whose variant is missing", async (t) => {
  const invalid = { ...product, slug: "missing-variant", variants: [] };
  const harness = setup(t, { products: [product, invalid] });
  assert.equal(await harness.render().addManyToCart([product.slug, invalid.slug]), null);
  assert.match(harness.render().cartError, /purchasable (?:Shopify )?variants/);
  assert.equal(harness.requests.length, 0);
});

const detailVariant = {
  ...product.variants[0],
  id: "gid://shopify/ProductVariant/102",
  title: "250g",
  selectedOptions: [{ name: "Size", value: "250g" }],
  pricePaise: 24950,
  quantityAvailable: 3,
};
const detailProduct = { ...product, variants: [...product.variants, detailVariant] };

test("complete product detail context purchases a non-default variant with its own stock and price", async (t) => {
  const harness = setup(t);
  const returnedCart = {
    ...remoteCart,
    items: [{ ...remoteCart.items[0], variantId: detailVariant.id, variantTitle: detailVariant.title, quantity: 3, pricePaise: 24950, quantityAvailable: 3 }],
    totalQuantity: 3,
    subtotalPaise: 74850,
    totalPaise: 74850,
  };
  harness.responses.push({ body: { cart: returnedCart } });
  assert.deepEqual(await harness.render().addToCart(product.slug, 8, false, detailVariant.id, detailProduct), returnedCart);
  assert.deepEqual(harness.requests[0].body, {
    action: "add",
    lines: [{ merchandiseId: detailVariant.id, quantity: 3 }],
  });
  assert.equal(harness.render().cart[0].variantId, detailVariant.id);
  assert.equal(harness.render().totalPaise, 74850);
  assert.deepEqual(harness.events, [{ event: "add_to_cart", item_id: detailVariant.id, item_variant: "250g", quantity: 3, value: 748.5, currency: "INR" }]);
  assert.equal(await harness.render().addToCart(product.slug, 1, false, detailVariant.id, detailProduct), null);
  assert.match(harness.render().cartError, /already in your bag/);
  assert.equal(harness.requests.length, 1, "The detail variant stock limit includes its existing cart quantity");
});

test("detail variant validation rejects mismatched products, foreign options and unavailable stock", async (t) => {
  for (const [name, context, variantId, error] of [
    ["different product ID", { ...detailProduct, id: "gid://shopify/Product/999" }, detailVariant.id, /product option is no longer available/],
    ["different slug", { ...detailProduct, slug: "another-product" }, detailVariant.id, /product option is no longer available/],
    ["missing product ID", { ...detailProduct, id: undefined }, detailVariant.id, /product option is no longer available/],
    ["option absent from details", detailProduct, "gid://shopify/ProductVariant/999", /product option is no longer available/],
    ["malformed option", { ...detailProduct, variants: [{ ...detailVariant, id: "preview:102" }] }, "preview:102", /product option is no longer available/],
    ["sold out selected option", { ...detailProduct, variants: [{ ...detailVariant, availableForSale: false }] }, detailVariant.id, /currently sold out/],
    ["zero stock selected option", { ...detailProduct, variants: [{ ...detailVariant, quantityAvailable: 0 }] }, detailVariant.id, /available quantity/],
  ]) {
    await t.test(name, async (subtest) => {
      const harness = setup(subtest);
      const existing = await seedRemoteCart(harness);
      assert.equal(await harness.render().addToCart(product.slug, 1, true, variantId, context), null);
      assert.match(harness.render().cartError, error);
      assert.deepEqual(displayedCart(harness.render()), existing);
      assert.equal(harness.requests.length, 0);
      assert.deepEqual(harness.events, []);
    });
  }
});

test("a successful Shopify clear keeps the authoritative checkout and returned cart", async (t) => {
  const harness = setup(t);
  await seedRemoteCart(harness);
  const empty = { ...remoteCart, items: [], totalQuantity: 0, subtotalPaise: 0, totalPaise: 0, discountAmountPaise: 0 };
  harness.responses.push({ body: { cart: empty } });
  await harness.render().clearCart();
  assert.deepEqual(harness.requests[0].body, { action: "remove", lineIds: [remoteCart.items[0].lineId] });
  assert.equal(harness.render().cartCount, 0);
  assert.equal(harness.render().checkoutUrl, remoteCart.checkoutUrl);
  assert.deepEqual(harness.render().discountCodes, remoteCart.discountCodes);
  assert.equal(harness.render().announcement, "Your bag is now empty.");
});

test("preview cart mutations remain local without Shopify variants", async (t) => {
  const harness = setup(t, { source: "preview", products: [{ ...product, variants: [] }] });
  assert.ok(await harness.render().addToCart(product.slug));
  await harness.render().updateQuantity(product.slug, 3);
  assert.equal(harness.render().cartCount, 3);
  assert.equal(await harness.render().applyDiscountCode("WELCOME10"), true);
  assert.equal(harness.render().discountAmountPaise, 3000);
  await harness.render().removeFromCart(product.slug);
  assert.equal(harness.render().cartCount, 0);
  await harness.render().addManyToCart([product.slug]);
  assert.equal(harness.render().cartCount, 1);
  await harness.render().clearCart();
  assert.equal(harness.render().cartCount, 0);
  assert.equal(harness.render().checkoutUrl, null);
  assert.deepEqual(harness.requests, []);
});

test("initial Shopify hydration restores the server cart when no action supersedes it", async (t) => {
  const harness = setup(t);
  harness.responses.push({ body: { cart: remoteCart } });
  harness.render();
  harness.flushMountEffects();
  await new Promise((resolve) => setImmediate(resolve));
  const store = harness.render();
  assert.equal(store.cartCount, 1);
  assert.equal(store.checkoutUrl, remoteCart.checkoutUrl);
  assert.equal(harness.requests[0].method, "GET");
});

for (const [name, staleResponse] of [
  ["empty cart", { body: { cart: null, warnings: [{ message: "Old warning" }], userErrors: [{ message: "Old error" }] } }],
  ["old cart", { body: { cart: { ...remoteCart, totalQuantity: 8, totalPaise: 80000 } } }],
  ["network error", new Error("Old hydration failed")],
]) {
  test(`a late initial Shopify ${name} cannot overwrite a completed cart action`, async (t) => {
    const harness = setup(t);
    let resolveHydration;
    harness.responses.push(new Promise((resolve) => { resolveHydration = resolve; }));
    harness.render();
    harness.flushMountEffects();
    assert.equal(harness.requests[0].method, "GET");

    harness.responses.push({ body: { cart: remoteCart, warnings: [{ message: "Current warning" }] } });
    assert.deepEqual(await harness.render().addToCart(product.slug), remoteCart);
    const current = harness.render();
    const expectedCart = displayedCart(current);

    resolveHydration(staleResponse);
    await new Promise((resolve) => setImmediate(resolve));
    const afterHydration = harness.render();
    assert.deepEqual(displayedCart(afterHydration), expectedCart);
    assert.equal(afterHydration.cartError, current.cartError);
    assert.deepEqual(afterHydration.cartWarnings, current.cartWarnings);
    assert.equal(afterHydration.announcement, "Current warning");
    assert.equal(afterHydration.isCartBusy, false);
    assert.deepEqual(harness.requests.map(({ method }) => method), ["GET", "POST"]);
  });
}
