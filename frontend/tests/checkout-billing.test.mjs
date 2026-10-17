import test from "node:test";
import assert from "node:assert/strict";
import { buildSync } from "esbuild";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const require = createRequire(import.meta.url);
const { outputFiles } = buildSync({
  stdin: {
    contents: 'export * from "./checkout-form.tsx"; export * from "./checkout-order-success.tsx"; export * from "./checkout-cart.ts";',
    resolveDir: fileURLToPath(new URL("../src/features/checkout/", import.meta.url)),
  },
  tsconfig: fileURLToPath(new URL("../tsconfig.json", import.meta.url)),
  bundle: true,
  platform: "node",
  format: "cjs",
  write: false,
  external: ["react", "react/jsx-runtime", "next/script", "next/link", "@/features/store/store-provider", "@/shared/ui/page-scroll"],
  define: { "process.env.NEXT_PUBLIC_ENABLE_COD": '"true"' },
});

const item = {
  lineId: "line-amla", slug: "amla", productName: "Amla", variantId: "variant-amla",
  variantTitle: "100 g", quantity: 2, availableForSale: true, pricePaise: 24975,
  compareAtPricePaise: 29900, lineSubtotalPaise: 49950, lineTotalPaise: 44955,
  discountAmountPaise: 4995, currencyCode: "INR",
};
const cart = {
  items: [item], subtotalPaise: 49950, totalPaise: 44955,
  discountAmountPaise: 4995, currencyCode: "INR",
};
const customer = {
  email: "buyer@example.com", phone: "9876543210", newsletter: false,
  firstName: "Test", lastName: "Buyer", address1: "1 Garden Road", address2: "",
  city: "Pune", province: "Maharashtra", zip: "411001", country: "India",
  saveAddress: false, shippingMethod: "express", paymentMethod: "shopify",
};

function loadCheckout({ currentCart = cart, refreshedCart = currentCart, paymentMethod = "shopify" } = {}) {
  const errors = [];
  const submissionStates = [];
  const store = {
    ...currentCart, cart: currentCart.items, source: "shopify", isCartBusy: false,
    updateBuyerIdentity: async () => refreshedCart,
    clearCart: async () => {}, track: () => {},
  };
  const fakeRequire = (name) => {
    if (name === "@/features/store/store-provider") return { useStore: () => store };
    if (name === "@/shared/ui/page-scroll") return { scrollPageTo: () => {} };
    if (name === "next/script") return function MockScript() { return null; };
    if (name === "next/link") return function MockLink(props) { return React.createElement("a", props); };
    if (name === "react") return {
      ...React,
      useState: (initial) => [
        initial && typeof initial === "object" && "email" in initial ? { ...customer, paymentMethod } : initial,
        (value) => {
          if (typeof initial === "string") errors.push(value);
          if (typeof initial === "boolean") submissionStates.push(value);
        },
      ],
    };
    return require(name);
  };
  const compiled = { exports: {} };
  new Function("require", "module", "exports", outputFiles[0].text)(fakeRequire, compiled, compiled.exports);
  return { ...compiled.exports, errors, submissionStates };
}

function submitForm(CheckoutForm, onOrderSuccess = () => {}, shippingFeePaise = 14900) {
  const tree = CheckoutForm({ onOrderSuccess, shippingFeePaise, onShippingChange: () => {} });
  const form = tree.props.children.find((child) => child?.type === "form");
  return form.props.onSubmit({ preventDefault() {} });
}

test("buyer refresh requires review for changed totals, currency, discounts, or lines", () => {
  const { hasCheckoutCartChanged } = loadCheckout();
  assert.equal(hasCheckoutCartChanged(cart, structuredClone(cart)), false);
  for (const changed of [
    { ...cart, totalPaise: 44956 },
    { ...cart, currencyCode: "USD" },
    { ...cart, discountAmountPaise: 5000 },
    { ...cart, items: [{ ...item, quantity: 3 }] },
    { ...cart, items: [{ ...item, variantId: "another-variant" }] },
    { ...cart, items: [{ ...item, availableForSale: false }] },
    { ...cart, items: [] },
  ]) assert.equal(hasCheckoutCartChanged(cart, changed), true);
  const twoLines = { ...cart, items: [item, { ...item, lineId: "line-second" }] };
  assert.equal(hasCheckoutCartChanged(twoLines, { ...twoLines, items: [...twoLines.items].reverse() }), false);
});

test("checkout does not start payment when the buyer refresh fails or changes the bag", async (t) => {
  const requests = [];
  t.mock.method(globalThis, "fetch", async (...args) => { requests.push(args); throw new Error("Unexpected payment request"); });
  for (const refreshedCart of [null, { ...cart, totalPaise: 59955 }]) {
    const { CheckoutForm, errors } = loadCheckout({ refreshedCart });
    await submitForm(CheckoutForm);
    assert.match(errors.at(-1), refreshedCart ? /review the updated order summary/ : /could not confirm your latest bag total/);
  }
  assert.equal(requests.length, 0);
});

test("online checkout rejects totals below the minimum without increasing the charge", async (t) => {
  const requests = [];
  t.mock.method(globalThis, "fetch", async (...args) => { requests.push(args); throw new Error("Unexpected payment request"); });
  const zeroCart = { ...cart, totalPaise: 0, discountAmountPaise: item.lineSubtotalPaise };
  const { CheckoutForm, errors } = loadCheckout({ currentCart: zeroCart });
  await submitForm(CheckoutForm, undefined, 0);
  assert.match(errors.at(-1), /minimum total of ₹1\.00/);
  assert.equal(requests.length, 0);
});

test("checkout sends the exact displayed total and blocks a different gateway amount", async (t) => {
  t.mock.method(console, "error", () => {});
  const requests = [];
  t.mock.method(globalThis, "fetch", async (url, options) => {
    requests.push({ url, body: JSON.parse(options.body) });
    return { ok: true, json: async () => ({ orderId: "order_test", amountPaise: 59956, currency: "INR" }) };
  });
  const { CheckoutForm, errors } = loadCheckout();
  await submitForm(CheckoutForm);
  assert.equal(requests[0].body.amountPaise, 59855);
  assert.match(errors.at(-1), /payment amount does not match/);
});

test("payment excludes extra upstream taxes from tax-inclusive prices", async (t) => {
  t.mock.method(console, "error", () => {});
  const requests = [];
  t.mock.method(globalThis, "fetch", async (url, options) => {
    requests.push({ url, body: JSON.parse(options.body) });
    // Reject a gateway that tries to re-add the upstream charge.
    return { ok: true, json: async () => ({ orderId: "order_test", amountPaise: 61655, currency: "INR" }) };
  });
  const taxedCart = { ...cart, totalPaise: cart.totalPaise + 1800 };
  const { CheckoutForm, errors } = loadCheckout({ currentCart: taxedCart });
  await submitForm(CheckoutForm);
  assert.equal(requests[0].body.amountPaise, 59855);
  assert.match(errors.at(-1), /payment amount does not match/);
});

test("cash on delivery retains a zero total and snapshots the receipt breakdown", async (t) => {
  const requests = [];
  t.mock.method(globalThis, "fetch", async (url, options) => {
    requests.push({ url, body: JSON.parse(options.body) });
    return { ok: true, json: async () => ({ success: true, shopifyOrderCreated: true, orderId: "order_cod" }) };
  });
  const zeroCart = { ...cart, totalPaise: 0, discountAmountPaise: item.lineSubtotalPaise };
  const { CheckoutForm } = loadCheckout({ currentCart: zeroCart, paymentMethod: "cod" });
  let confirmation;
  await submitForm(CheckoutForm, (order) => { confirmation = order; }, 0);
  assert.equal(requests[0].body.totalPaise, 0);
  assert.equal(confirmation.subtotalPaise, 49950);
  assert.equal(confirmation.discountPaise, 49950);
  assert.equal(confirmation.shippingFeePaise, 0);
  assert.equal(confirmation.totalPaise, 0);
  assert.equal(confirmation.items[0].pricePaise, 49950);
});

test("online payment keeps its amount snapshot and submit lock until payment completes", async (t) => {
  let paymentOptions;
  const previousWindow = globalThis.window;
  globalThis.window = {
    Razorpay: class {
      constructor(options) { paymentOptions = options; }
      open() {}
      on() {}
    },
  };
  t.after(() => {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  });
  t.mock.method(globalThis, "fetch", async (url) => ({
    ok: true,
    json: async () => url.endsWith("create-order")
      ? { orderId: "order_online", amountPaise: 59855, currency: "INR" }
      : url.endsWith("verify-payment")
        ? { verified: true }
        : { success: true, shopifyOrderCreated: true, orderId: "order_online" },
  }));
  const { CheckoutForm, submissionStates } = loadCheckout();
  let confirmation;
  await submitForm(CheckoutForm, (order) => { confirmation = order; });
  assert.equal(paymentOptions.amount, 59855);
  assert.deepEqual(submissionStates, [true]);
  await paymentOptions.handler({ razorpay_payment_id: "payment_test", razorpay_signature: "signature_test" });
  assert.equal(confirmation.subtotalPaise, 49950);
  assert.equal(confirmation.discountPaise, 4995);
  assert.equal(confirmation.shippingFeePaise, 14900);
  assert.equal(confirmation.totalPaise, 59855);
  assert.equal(confirmation.items[0].pricePaise, 49950);
  assert.deepEqual(submissionStates, [true, false]);
});

test("confirmation and print receipt show the same subtotal, discount, shipping, and exact total", (t) => {
  // esbuild does not transform Next's styled-jsx attributes for this static render.
  t.mock.method(console, "error", () => {});
  const { CheckoutOrderSuccess } = loadCheckout();
  const order = {
    orderId: "order_test", placedAt: "17 Oct 2026", customerName: "Test Buyer",
    email: customer.email, phone: customer.phone, shippingAddress: "Pune, India",
    paymentMethod: "Paid online", shippingMethod: "Priority delivery",
    subtotalPaise: 49950, discountPaise: 4995,
    shippingFeePaise: 14900, totalPaise: 59855, currencyCode: "INR",
    items: [{ name: "Amla", variant: "100 g", quantity: 2, pricePaise: 49950, slug: "amla" }],
  };
  const html = renderToStaticMarkup(React.createElement(CheckoutOrderSuccess, { order }));
  const receipt = html.slice(html.indexOf("print-only-view print-receipt-container"));
  assert.match(receipt, /Subtotal:<\/span><span[^>]*>₹499\.50<\/span>/);
  assert.match(receipt, /Discount:<\/span><span[^>]*>-₹49\.95<\/span>/);
  assert.match(receipt, /Shipping:<\/span><span[^>]*>₹149\.00<\/span>/);
  assert.match(receipt, /Taxes:<\/span><span[^>]*>Included in price<\/span>/);
  assert.doesNotMatch(html, /Other charges|Other adjustments/);
  assert.match(receipt, /Grand Total:<\/span><span[^>]*>₹598\.55<\/span>/);
  assert.equal((html.match(/₹598\.55/g) ?? []).length, 2);
});
