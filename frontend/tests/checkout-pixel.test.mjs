import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const source = await readFile(new URL("../../docs/analytics/shopify-checkout-pixel.js", import.meta.url), "utf8");
const money = (amount) => ({ amount, currencyCode: "INR" });
const checkout = {
  currencyCode: "INR", email: "private@example.com", phone: "private-phone", token: "secret-token",
  shippingAddress: { address1: "private-address" }, order: { id: "gid://shopify/Order/123" },
  subtotalPrice: money(358.2), totalTax: money(18), shippingLine: { price: money(40) },
  lineItems: [{ quantity: 2, finalLinePrice: money(358.2), variant: {
    title: "100g", product: { id: "gid://shopify/Product/10", title: "Amla", type: "Herbal powder" },
  } }],
};
function fixture({ consent = true, storage = new Map(), configured = true, storageFails = false } = {}) {
  const callbacks = new Map();
  const scripts = [];
  let privacyChanged;
  const window = {};
  const context = vm.createContext({
    window,
    document: { createElement: () => ({}), head: { appendChild: (script) => scripts.push(script) } },
    init: { customerPrivacy: { analyticsProcessingAllowed: consent } },
    api: { customerPrivacy: { subscribe: (_name, handler) => { privacyChanged = handler; } } },
    analytics: { subscribe: (name, handler) => callbacks.set(name, handler) },
    browser: { localStorage: {
      getItem: async (key) => { if (storageFails) throw Error("denied"); return storage.get(key); },
      setItem: async (key, value) => { if (storageFails) throw Error("denied"); storage.set(key, value); },
    } },
  });
  vm.runInContext(configured ? source.replace("__GA4_MEASUREMENT_ID__", "G-TEST123") : source, context);
  return {
    scripts, storage, callbacks,
    events: () => Array.from(window.dataLayer || [], (args) => Array.from(args)).filter(([kind]) => kind === "event"),
    consent: (value) => privacyChanged({ customerPrivacy: { analyticsProcessingAllowed: value } }),
    send: (name, data = checkout, id = "callback-1") => callbacks.get(name)?.({ id, data: { checkout: data }, context: { document: { location: { href: "https://checkout.naturemist.shop/checkouts/secret?email=private@example.com" } } } }),
  };
}

test("disconnected draft loads no script and subscribes to nothing", () => {
  const pixel = fixture({ configured: false });
  assert.equal(pixel.scripts.length, 0);
  assert.equal(pixel.callbacks.size, 0);
});

test("denied and revoked permission suppress checkout events without replay", async () => {
  const pixel = fixture({ consent: false });
  await pixel.send("checkout_completed");
  assert.equal(pixel.scripts.length, 0);
  pixel.consent(true);
  await pixel.send("payment_info_submitted");
  assert.deepEqual(pixel.events().map((event) => event[1]), ["add_payment_info"]);
  const queued = pixel.send("checkout_completed");
  pixel.consent(false);
  await queued;
  assert.equal(pixel.events().length, 1);
  pixel.consent(true);
  assert.equal(pixel.events().length, 1);
});

test("only confirmed completion emits purchase; duplicates and refreshed pixel reuse are suppressed", async () => {
  const pixel = fixture();
  await pixel.send("checkout_started");
  await pixel.send("payment_info_submitted", checkout, "payment");
  await pixel.send("checkout_completed", { ...checkout, order: null }, "missing-order");
  await Promise.all([
    pixel.send("checkout_completed", checkout, "first"),
    pixel.send("checkout_completed", checkout, "duplicate"),
  ]);
  assert.deepEqual(pixel.events().map((event) => event[1]), ["shopify_checkout_started", "add_payment_info", "purchase"]);
  const purchase = pixel.events()[2][2];
  assert.equal(purchase.transaction_id, "gid://shopify/Order/123");
  assert.equal(purchase.value, 358.2);
  assert.equal(purchase.items[0].price, 179.1);
  assert.equal(purchase.currency, "INR");
  assert.equal(purchase.tax, 18);
  assert.equal(purchase.shipping, 40);
  const serialized = JSON.stringify(pixel.events());
  for (const forbidden of ["private@example.com", "private-phone", "private-address", "secret-token", "checkouts/secret"]) assert.ok(!serialized.includes(forbidden));
  const refreshed = fixture({ storage: pixel.storage });
  await refreshed.send("checkout_completed");
  assert.equal(refreshed.events().length, 0);
});

test("malformed currency, totals and line prices cannot produce invented revenue", async () => {
  const pixel = fixture();
  await pixel.send("checkout_completed", { ...checkout, subtotalPrice: money(100) });
  await pixel.send("checkout_completed", { ...checkout, currencyCode: "USD" });
  await pixel.send("checkout_completed", { ...checkout, lineItems: [{ ...checkout.lineItems[0], finalLinePrice: null }] });
  assert.equal(pixel.events().length, 0);
});

test("numeric Shopify IDs normalize consistently and storage failure preserves an in-memory duplicate guard", async () => {
  const pixel = fixture({ storageFails: true });
  const data = { ...checkout, order: { id: "123" } };
  await pixel.send("checkout_completed", data);
  await pixel.send("checkout_completed", data, "repeat");
  assert.equal(pixel.events().length, 1);
  assert.equal(pixel.events()[0][2].transaction_id, "gid://shopify/Order/123");
});
