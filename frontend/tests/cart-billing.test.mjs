import test from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const require = createRequire(import.meta.url);
const bundle = await build({
  stdin: {
    contents: 'export * from "./src/domain/cart/billing"; export * from "./src/features/cart/cart-bill-summary";',
    resolveDir: fileURLToPath(new URL("../", import.meta.url)),
  },
  bundle: true,
  platform: "node",
  format: "esm",
  jsx: "automatic",
  write: false,
  plugins: [{
    name: "billing-view-boundaries",
    setup(builder) {
      builder.onResolve({ filter: /^react(?:\/jsx-runtime)?$/ }, ({ path }) => ({
        path: pathToFileURL(require.resolve(path)).href, external: true,
      }));
      builder.onResolve({ filter: /\.module\.css$/ }, () => ({ path: "css", namespace: "billing-css" }));
      builder.onLoad({ filter: /.*/, namespace: "billing-css" }, () => ({ contents: "export default {};" }));
    },
  }],
});
const { calculateCartBilling, calculateLineBilling, formatBillingCurrency, CartBillSummary } = await import(
  `data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`
);

const line = (overrides = {}) => ({
  quantity: 1,
  pricePaise: 10000,
  compareAtPricePaise: null,
  lineSubtotalPaise: 10000,
  lineTotalPaise: 10000,
  discountAmountPaise: 0,
  ...overrides,
});

function assertReconciles(billing) {
  assert.equal(billing.mrpPaise - billing.saleSavingsPaise, billing.merchandiseSubtotalPaise);
  assert.equal(billing.merchandiseSubtotalPaise - billing.discountPaise, billing.merchandiseTotalPaise);
  assert.equal(
    billing.merchandiseSubtotalPaise - billing.discountPaise + billing.shippingFeePaise,
    billing.totalPaise,
  );
  assert.equal(billing.totalSavingsPaise, billing.saleSavingsPaise + billing.discountPaise);
  for (const value of Object.values(billing)) assert.ok(Number.isSafeInteger(value));
}

const renderBill = (billing, props = {}) => renderToStaticMarkup(createElement(CartBillSummary, {
  billing, currencyCode: "INR", ...props,
}));

test("a full-price bag has no invented savings and reconciles to the server total", () => {
  const billing = calculateCartBilling({ items: [line()], totalPaise: 10000, discountAmountPaise: 0 });
  assertReconciles(billing);
  assert.equal(billing.merchandiseSubtotalPaise, 10000);
  assert.equal(billing.totalSavingsPaise, 0);
  const html = renderBill(billing);
  assert.match(html, /<dt>Subtotal<\/dt><dd>₹100\.00<\/dd>/);
  assert.match(html, /<dt>Delivery<\/dt><dd>FREE<\/dd>/);
  assert.match(html, /<dt>Taxes<\/dt><dd>Included in price<\/dd>/);
  assert.doesNotMatch(html, /Total MRP|Product savings|Applied discounts|You save/);
});

test("sale pricing plus coupon savings uses raw line subtotals even if the cart subtotal is already discounted", () => {
  const item = line({
    quantity: 2, pricePaise: 8000, compareAtPricePaise: 10000,
    lineSubtotalPaise: 16000, lineTotalPaise: 14400, discountAmountPaise: 1600,
  });
  const billing = calculateCartBilling({
    items: [item], subtotalPaise: 14400, totalPaise: 14400, discountAmountPaise: 1600,
  });
  assertReconciles(billing);
  assert.deepEqual(calculateLineBilling(item), {
    mrpPaise: 20000, totalPaise: 14400, savingsPaise: 5600, saleSavingsPaise: 4000,
  });
  assert.equal(billing.merchandiseSubtotalPaise, 16000);
  assert.equal(billing.discountPaise, 1600);
  assert.equal(billing.saleSavingsPaise, 4000);
  assert.equal(billing.totalSavingsPaise, 5600);
  const html = renderBill(billing);
  assert.match(html, /<dt>Total MRP<\/dt><dd>₹200\.00<\/dd>/);
  assert.match(html, /<dt>Product savings<\/dt><dd>−₹40\.00<\/dd>/);
  assert.match(html, /<dt>Subtotal<\/dt><dd>₹160\.00<\/dd>/);
  assert.match(html, /<dt>Applied discounts<\/dt><dd>−₹16\.00<\/dd>/);
  assert.match(html, /<dd>₹144\.00<\/dd>/);
  assert.match(html, /You save <strong>₹56\.00<\/strong>/);
});

test("order discount allocations give the same result whether line totals include them or not", () => {
  for (const lineTotalPaise of [10000, 9000, 7000]) {
    const item = line({ lineTotalPaise, discountAmountPaise: 3000 });
    const billing = calculateCartBilling({ items: [item], totalPaise: 7000, discountAmountPaise: 3000 });
    assertReconciles(billing);
    assert.equal(calculateLineBilling(item).totalPaise, 7000);
    assert.equal(billing.discountPaise, 3000);
    assert.equal(billing.merchandiseTotalPaise, 7000);
  }
});

test("line-level reductions remain visible if the cart allocation total is smaller", () => {
  const billing = calculateCartBilling({
    items: [line({ lineTotalPaise: 7500, discountAmountPaise: 0 })],
    totalPaise: 7500, discountAmountPaise: 0,
  });
  assertReconciles(billing);
  assert.equal(billing.discountPaise, 2500);
  assert.equal(billing.totalSavingsPaise, 2500);
});

test("tax-inclusive prices exclude upstream extra charges and add express delivery only once", () => {
  const billing = calculateCartBilling({
    items: [line({ lineTotalPaise: 9000, discountAmountPaise: 1000 })],
    totalPaise: 10800, discountAmountPaise: 1000, shippingFeePaise: 14900,
  });
  assertReconciles(billing);
  assert.equal(billing.merchandiseTotalPaise, 9000);
  assert.equal(billing.shippingFeePaise, 14900);
  assert.equal(billing.totalPaise, 23900);
  const html = renderBill(billing);
  assert.match(html, /<dt>Taxes<\/dt><dd>Included in price<\/dd>/);
  assert.match(html, /<dt>Delivery<\/dt><dd>₹149\.00<\/dd>/);
  assert.match(html, /<dd>₹239\.00<\/dd>/);
  assert.doesNotMatch(html, /other charges|Other adjustments|₹18\.00|₹257\.00/);
});

test("additional order reductions appear as discounts without an other-charges row", () => {
  const billing = calculateCartBilling({ items: [line()], totalPaise: 9500, discountAmountPaise: 0 });
  assertReconciles(billing);
  assert.equal(billing.discountPaise, 500);
  assert.equal(billing.totalPaise, 9500);
  assert.match(renderBill(billing), /<dt>Applied discounts<\/dt><dd>−₹5\.00<\/dd>/);
});

test("empty, free and fully discounted bags retain zero totals", () => {
  for (const items of [
    [],
    [line({ pricePaise: 0, lineSubtotalPaise: 0, lineTotalPaise: 0 })],
    [line({ lineTotalPaise: 0, discountAmountPaise: 10000 })],
  ]) {
    const discountAmountPaise = items.reduce((sum, item) => sum + item.discountAmountPaise, 0);
    const billing = calculateCartBilling({ items, totalPaise: 0, discountAmountPaise });
    assertReconciles(billing);
    assert.equal(billing.totalPaise, 0);
    assert.match(renderBill(billing), /<dd>₹0\.00<\/dd>/);
  }
});

test("multiple quantities and fractional-rupee prices preserve every paise", () => {
  const items = [
    line({ quantity: 3, pricePaise: 3333, compareAtPricePaise: 4000,
      lineSubtotalPaise: 9999, lineTotalPaise: 8999, discountAmountPaise: 1000 }),
    line({ pricePaise: 101, lineSubtotalPaise: 101, lineTotalPaise: 91, discountAmountPaise: 10 }),
  ];
  const billing = calculateCartBilling({ items, totalPaise: 9090, discountAmountPaise: 1010, shippingFeePaise: 14900 });
  assertReconciles(billing);
  assert.equal(billing.merchandiseSubtotalPaise, 10100);
  assert.equal(billing.saleSavingsPaise, 2001);
  assert.equal(billing.discountPaise, 1010);
  assert.equal(billing.totalSavingsPaise, 3011);
  assert.equal(billing.totalPaise, 23990);
  assert.equal(formatBillingCurrency(1), "₹0.01");
  assert.equal(formatBillingCurrency(100), "₹1.00");
  assert.equal(formatBillingCurrency(12345678), "₹1,23,456.78");
  assert.match(renderBill(billing), /<dd>₹239\.90<\/dd>/);
});

test("a selected variant with no comparison price has no invented product savings", () => {
  const item = line({
    quantity: 2, pricePaise: 15000, compareAtPricePaise: null,
    lineSubtotalPaise: 30000, lineTotalPaise: 27000, discountAmountPaise: 3000,
  });
  const billing = calculateCartBilling({ items: [item], totalPaise: 27000, discountAmountPaise: 3000 });
  assertReconciles(billing);
  assert.equal(calculateLineBilling(item).mrpPaise, 30000);
  assert.equal(billing.saleSavingsPaise, 0);
  assert.equal(billing.totalSavingsPaise, 3000);
  assert.doesNotMatch(renderBill(billing), /Total MRP|Product savings/);
});

test("pending delivery and busy totals are clearly marked rather than promising a final amount", () => {
  const billing = calculateCartBilling({ items: [line()], totalPaise: 10000, discountAmountPaise: 0 });
  const html = renderBill(billing, { shippingPending: true, busy: true });
  assert.match(html, /aria-label="Price details" aria-busy="true"/);
  assert.match(html, /<dt>Delivery<\/dt><dd>At checkout<\/dd>/);
  assert.match(html, /Estimated total<span>Updating amounts…<\/span>/);
  assert.doesNotMatch(html, /Total payable|>FREE</);
});
