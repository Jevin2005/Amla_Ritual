import test from "node:test";
import assert from "node:assert/strict";
import { buildSync } from "esbuild";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import React from "react";

const require = createRequire(import.meta.url);
const { outputFiles } = buildSync({
  stdin: {
    contents: 'export * from "./shopify-checkout.ts"; export * from "./checkout-cart.ts"; export * from "./checkout-preview.tsx";',
    resolveDir: fileURLToPath(new URL("../src/features/checkout/", import.meta.url)),
  },
  tsconfig: fileURLToPath(new URL("../tsconfig.json", import.meta.url)),
  bundle: true, platform: "node", format: "cjs", write: false,
  loader: { ".module.css": "empty" },
  external: ["react", "react/jsx-runtime", "next/link", "@/features/store/store-provider", "./checkout-order-summary"],
});
const allowedHosts = ["checkout.naturemist.shop", "zyv78m-p7.myshopify.com"];
const item = {
  lineId: "line-amla", slug: "amla", productName: "Amla", variantId: "variant-amla",
  variantTitle: "100 g", quantity: 2, availableForSale: true, quantityAvailable: 6,
  pricePaise: 24975, compareAtPricePaise: 29900, lineSubtotalPaise: 49950,
  lineTotalPaise: 44955, discountAmountPaise: 4995, currencyCode: "INR",
};
const cart = {
  checkoutUrl: "https://checkout.naturemist.shop/checkouts/old-cart?key=old",
  items: [item], totalQuantity: 2, subtotalPaise: 49950, totalPaise: 44955,
  discountAmountPaise: 4995, currencyCode: "INR", discountCodes: [],
  subtotalEstimated: false, totalEstimated: true,
};

function loadCheckout(overrides = {}) {
  const compiled = { exports: {} };
  const fakeRequire = (name) => {
    if (name in overrides) return overrides[name];
    if (name === "./checkout-order-summary") return { CheckoutOrderSummary: () => null };
    if (name === "@/features/store/store-provider") return { useStore: () => ({}) };
    if (name === "next/link") return function MockLink(props) { return React.createElement("a", props); };
    return require(name);
  };
  new Function("require", "module", "exports", outputFiles[0].text)(fakeRequire, compiled, compiled.exports);
  return compiled.exports;
}
const { prepareShopifyCheckout, validateCheckoutUrl, hasCheckoutCartChanged } = loadCheckout();
const prepare = (overrides = {}) => prepareShopifyCheckout({
  source: "shopify", previousCart: cart, allowedHosts,
  refreshCart: async () => structuredClone(cart), ...overrides,
});
function deferred() {
  let resolve;
  const promise = new Promise((yes) => { resolve = yes; });
  return { promise, resolve };
}

test("handoff waits for the latest Shopify cart and preserves its URL verbatim", async (t) => {
  t.mock.method(globalThis, "fetch", () => { throw new Error("Checkout must not create a separate payment or order"); });
  const pending = deferred();
  let refreshes = 0;
  let completed = false;
  const result = prepare({ refreshCart: () => { refreshes += 1; return pending.promise; } });
  result.then(() => { completed = true; });
  await Promise.resolve();
  assert.equal(refreshes, 1);
  assert.equal(completed, false);
  const fresh = { ...cart, checkoutUrl: "https://checkout.naturemist.shop/cart/c/fresh-token?key=a%2Fb%2Bc&locale=en-IN&buyer_identity%5Bcountry_code%5D=IN" };
  pending.resolve(fresh);
  assert.deepEqual(await result, { url: fresh.checkoutUrl, cart: fresh });
  assert.equal(globalThis.fetch.mock.callCount(), 0);
});

test("changed totals, currency, discounts or lines require review before a second handoff", async () => {
  for (const changed of [
    { ...cart, totalPaise: 44956 }, { ...cart, subtotalPaise: 49951 },
    { ...cart, currencyCode: "USD" }, { ...cart, discountAmountPaise: 5000 },
    { ...cart, items: [{ ...item, quantity: 3 }] },
    { ...cart, items: [{ ...item, variantId: "another-variant" }] },
    { ...cart, items: [{ ...item, lineTotalPaise: 44956 }] },
  ]) {
    await assert.rejects(prepare({ refreshCart: async () => changed }), /Review the updated items and totals/);
    assert.equal((await prepare({ previousCart: changed, refreshCart: async () => changed })).url, changed.checkoutUrl);
  }
  const twoLines = { ...cart, items: [item, { ...item, lineId: "second-line" }] };
  assert.equal(hasCheckoutCartChanged(twoLines, { ...twoLines, items: [...twoLines.items].reverse() }), false);
});

test("refresh failure or expiry cannot fall back to the saved checkout URL", async () => {
  await assert.rejects(prepare({ refreshCart: async () => null }), /could not confirm your latest bag/);
  await assert.rejects(prepare({ refreshCart: async () => { throw new Error("Shopify unavailable"); } }), /Shopify unavailable/);
  await assert.rejects(prepare({ refreshCart: async () => ({ ...cart, items: [] }) }), /bag is empty/);
  await assert.rejects(prepare({ refreshCart: async () => ({ ...cart, checkoutUrl: null }) }), /temporarily unavailable/);
});

test("current availability and quantity limits are checked before checkout", async () => {
  for (const changedItem of [
    { ...item, availableForSale: false }, { ...item, quantity: 0 },
    { ...item, quantity: 1.5 }, { ...item, quantity: 13, quantityAvailable: 100 },
    { ...item, quantityAvailable: 1 }, { ...item, quantityAvailable: 0 },
  ]) {
    await assert.rejects(prepare({ refreshCart: async () => ({ ...cart, items: [changedItem] }) }), /unavailable items|available stock/);
  }
  const untracked = { ...cart, items: [{ ...item, quantityAvailable: null }] };
  assert.equal((await prepare({ refreshCart: async () => untracked })).url, cart.checkoutUrl);
});

test("only HTTPS checkout paths on explicitly trusted Shopify hosts are accepted", () => {
  for (const value of [
    null, "", "/checkouts/token", "not a URL",
    "http://checkout.naturemist.shop/checkouts/token", "javascript:alert(1)",
    "https://attacker.example/checkouts/token",
    "https://checkout.naturemist.shop.attacker.example/checkouts/token",
    "https://another.myshopify.com/checkouts/token",
    "https://user:password@checkout.naturemist.shop/checkouts/token",
    "https://checkout.naturemist.shop:444/checkouts/token",
    "https://checkout.naturemist.shop/products/amla", "https://checkout.naturemist.shop/cart",
    "https://checkout.naturemist.shop/cart/c",
    "https://checkout.naturemist.shop/checkouts-elsewhere/token",
    "https://checkout.naturemist.shop/checkouts/../products/amla",
  ]) assert.throws(() => validateCheckoutUrl(value, allowedHosts), /temporarily unavailable/);
  for (const value of [
    "https://checkout.naturemist.shop/checkouts/token?key=exact%2Btoken",
    "https://zyv78m-p7.myshopify.com/cart/c/token?key=exact%2Ftoken",
  ]) assert.equal(validateCheckoutUrl(value, allowedHosts), value);
});

test("preview checkout cannot refresh the cart or start payment", async (t) => {
  const refresh = t.mock.fn(async () => cart);
  t.mock.method(globalThis, "fetch", () => { throw new Error("Unexpected payment call"); });
  await assert.rejects(prepare({ source: "preview", refreshCart: refresh }), /preview mode/);
  assert.equal(refresh.mock.callCount(), 0);
  assert.equal(globalThis.fetch.mock.callCount(), 0);
});

function componentFixture(t, refreshCart) {
  const slots = [], effects = [], navigations = [], analytics = [], cleanup = [];
  const listeners = new Map();
  let cursor = 0;
  let mounted = false;
  const oldWindow = globalThis.window;
  globalThis.window = {
    location: { assign: (url) => navigations.push(url) },
    addEventListener: (name, callback) => listeners.set(name, callback),
    removeEventListener: (name) => listeners.delete(name),
  };
  const store = {
    ...cart, cart: cart.items, source: "shopify", isHydrated: true, isCartBusy: false,
    cartError: "", cartWarnings: [], refreshCart, track: (...args) => analytics.push(args),
  };
  const hooks = {
    ...React,
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = typeof initial === "function" ? initial() : initial;
      return [slots[index], (value) => { slots[index] = typeof value === "function" ? value(slots[index]) : value; }];
    },
    useRef(initial) { return hooks.useState(() => ({ current: initial }))[0]; },
    useEffect(effect) { if (!mounted) effects.push(effect); },
  };
  const { CheckoutPreview } = loadCheckout({ react: hooks, "@/features/store/store-provider": { useStore: () => store } });
  const render = () => {
    cursor = 0;
    const tree = CheckoutPreview({ checkoutHosts: allowedHosts });
    if (!mounted) {
      mounted = true;
      for (const effect of effects) cleanup.push(effect());
    }
    return tree;
  };
  t.after(() => {
    for (const fn of cleanup) fn?.();
    if (oldWindow === undefined) delete globalThis.window;
    else globalThis.window = oldWindow;
  });
  function find(tree, predicate) {
    if (!tree || typeof tree !== "object") return null;
    if (predicate(tree)) return tree;
    for (const child of [tree.props?.children].flat(Infinity)) {
      const match = find(child, predicate);
      if (match) return match;
    }
    return null;
  }
  return { store, render, find, navigations, analytics, listeners };
}

test("double clicks produce one handoff and browser back enables a fresh attempt", async (t) => {
  const pending = deferred();
  let refreshes = 0;
  const fresh = { ...cart, checkoutUrl: "https://checkout.naturemist.shop/checkouts/fresh?key=exact%2Bkey" };
  const fixture = componentFixture(t, () => { refreshes += 1; return refreshes === 1 ? pending.promise : Promise.resolve(fresh); });
  const button = fixture.find(fixture.render(), (node) => node.type === "button");
  button.props.onClick();
  button.props.onClick();
  assert.equal(refreshes, 1);
  assert.equal(fixture.find(fixture.render(), (node) => node.type === "button").props.disabled, true);
  assert.deepEqual(fixture.navigations, []);
  pending.resolve(fresh);
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(fixture.navigations, [fresh.checkoutUrl]);
  assert.deepEqual(fixture.analytics, [["begin_checkout", { value: 449.55, currency: "INR", mode: "shopify_hosted" }]]);
  fixture.listeners.get("pageshow")({ persisted: true });
  const restoredButton = fixture.find(fixture.render(), (node) => node.type === "button");
  assert.equal(restoredButton.props.disabled, false);
  restoredButton.props.onClick();
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(refreshes, 2);
  assert.equal(fixture.navigations.length, 2);
});

test("failed handoff displays an error and permits retry without payment or navigation", async (t) => {
  t.mock.method(globalThis, "fetch", () => { throw new Error("Unexpected payment call"); });
  const fixture = componentFixture(t, async () => null);
  fixture.find(fixture.render(), (node) => node.type === "button").props.onClick();
  await new Promise((resolve) => setImmediate(resolve));
  const tree = fixture.render();
  assert.match(fixture.find(tree, (node) => node.props?.role === "alert").props.children, /could not confirm/);
  assert.equal(fixture.find(tree, (node) => node.type === "button").props.disabled, false);
  assert.deepEqual(fixture.navigations, []);
  assert.deepEqual(fixture.analytics, []);
  assert.equal(globalThis.fetch.mock.callCount(), 0);
});
