import test from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import { NextRequest } from "next/server.js";

const require = createRequire(import.meta.url);
// Exercise the actual route, request parsing, response/cookie handling and cart
// normalization. Only the Shopify network request is replaced with a queue.
const bundle = await build({
  entryPoints: [fileURLToPath(new URL("../src/app/api/shopify/cart/route.ts", import.meta.url))],
  bundle: true, platform: "node", format: "esm", write: false,
  plugins: [{
    name: "cart-route-network-boundary",
    setup(builder) {
      builder.onResolve({ filter: /^next\/server$/ }, () => ({
        path: pathToFileURL(require.resolve("next/server")).href, external: true,
      }));
      builder.onResolve({ filter: /^@\/lib\/shopify\/storefront$/ }, () => ({ path: "shopify", namespace: "cart-test" }));
      builder.onLoad({ filter: /.*/, namespace: "cart-test" }, () => ({
        contents: "export const shopifyStorefrontRequest = (...args) => globalThis.__cartRouteRequest(...args);",
      }));
    },
  }],
});
const { POST } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`);
const originalId = "gid://shopify/Cart/original?key=private-test-key";
const freshId = "gid://shopify/Cart/new?key=new-private-test-key";
const money = (amount) => ({ amount, currencyCode: "INR" });
const graphCart = (id = originalId) => ({
  id, checkoutUrl: "https://test.myshopify.com/checkouts/original", totalQuantity: 1,
  discountCodes: [{ code: "SAVED10", applicable: true }],
  cost: { subtotalAmount: money("100"), totalAmount: money("90"), subtotalAmountEstimated: false, totalAmountEstimated: true },
  lines: {
    nodes: [{
      id: "gid://shopify/CartLine/original", quantity: 1,
      cost: { amountPerQuantity: money("100"), compareAtAmountPerQuantity: null, subtotalAmount: money("100"), totalAmount: money("90") },
      discountAllocations: [{ discountedAmount: money("10") }],
      merchandise: {
        id: "gid://shopify/ProductVariant/1", title: "100g", availableForSale: true,
        quantityAvailable: 4, selectedOptions: [], image: null,
        product: { id: "gid://shopify/Product/1", handle: "amla", title: "Amla", featuredImage: null },
      },
    }],
    pageInfo: { hasNextPage: false, endCursor: null },
  },
});
const error = { field: ["lines", "0", "merchandiseId"], message: "This option is unavailable.", code: "INVALID" };

function harness(t, responses) {
  const previous = globalThis.__cartRouteRequest;
  const requests = [];
  globalThis.__cartRouteRequest = async (query, variables, options) => {
    requests.push({ query, variables, options });
    assert.ok(responses.length, "Unexpected Shopify request");
    const response = responses.shift();
    if (response instanceof Error) throw response;
    return response;
  };
  t.after(() => {
    if (previous === undefined) delete globalThis.__cartRouteRequest;
    else globalThis.__cartRouteRequest = previous;
  });
  return requests;
}

function addRequest(cartId = originalId) {
  return new NextRequest("https://naturemist.shop/api/shopify/cart", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(cartId ? { cookie: `naturemist_shopify_cart=${encodeURIComponent(cartId)}` } : {}),
    },
    body: JSON.stringify({ action: "add", lines: [{ merchandiseId: "gid://shopify/ProductVariant/2", quantity: 1 }] }),
  });
}

test("a rejected add preserves the existing Shopify bag, error, discount and checkout", async (t) => {
  const requests = harness(t, [
    { cartLinesAdd: { cart: null, userErrors: [error], warnings: [{ code: "NOTICE", message: "Review the selected option." }] } },
    { cart: graphCart() },
  ]);
  const response = await POST(addRequest());
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.deepEqual(body.userErrors, [{ code: error.code, message: error.message }]);
  assert.equal(body.cart.items[0].variantId, "gid://shopify/ProductVariant/1");
  assert.equal(body.cart.checkoutUrl, graphCart().checkoutUrl);
  assert.equal(body.cart.discountCodes[0].code, "SAVED10");
  assert.equal(body.cart.totalPaise, 9000);
  assert.equal(body.warnings[0].code, "NOTICE");
  assert.equal(response.cookies.get("naturemist_shopify_cart").value, originalId);
  assert.equal(requests.length, 2);
  assert.match(requests[0].query, /mutation NatureMistCartLinesAdd/);
  assert.match(requests[1].query, /query NatureMistCart\(/);
  assert.equal(requests[1].variables.cartId, originalId);
});

test("only a confirmed expired bag is recreated", async (t) => {
  const fresh = { ...graphCart(freshId), checkoutUrl: "https://test.myshopify.com/checkouts/new" };
  const requests = harness(t, [
    { cartLinesAdd: { cart: null, userErrors: [{ ...error, message: "Cart not found" }] } },
    { cart: null },
    { cartCreate: { cart: fresh, userErrors: [] } },
  ]);
  const response = await POST(addRequest());
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.deepEqual(body.userErrors, []);
  assert.equal(body.cart.checkoutUrl, fresh.checkoutUrl);
  assert.equal(response.cookies.get("naturemist_shopify_cart").value, freshId);
  assert.equal(requests.length, 3);
  assert.match(requests[2].query, /mutation NatureMistCartCreate/);
  assert.deepEqual(requests[2].variables.input.lines, [{ merchandiseId: "gid://shopify/ProductVariant/2", quantity: 1 }]);
});

test("an inconclusive lookup never retries or replaces the bag", async (t) => {
  const requests = harness(t, [
    { cartLinesAdd: { cart: null, userErrors: [error] } },
    new Error("Shopify is unreachable"),
  ]);
  const response = await POST(addRequest());
  assert.equal(response.status, 502);
  assert.equal(response.cookies.get("naturemist_shopify_cart"), undefined);
  assert.equal(requests.length, 2);
});

test("a lookup with a missing cart field does not confirm expiry", async (t) => {
  const requests = harness(t, [
    { cartLinesAdd: { cart: null, userErrors: [error] } },
    {},
  ]);
  const response = await POST(addRequest());
  assert.equal(response.status, 502);
  assert.equal(response.cookies.get("naturemist_shopify_cart"), undefined);
  assert.equal(requests.length, 2);
});

test("a null mutation without userErrors cannot report a successful add", async (t) => {
  const requests = harness(t, [
    { cartLinesAdd: { cart: null, userErrors: [] } },
    { cart: graphCart() },
  ]);
  const body = await (await POST(addRequest())).json();
  assert.equal(body.userErrors.length, 1);
  assert.match(body.userErrors[0].message, /did not confirm/);
  assert.equal(body.cart.totalQuantity, 1);
  assert.equal(requests.length, 2);
});

test("normal adds keep the single-request path", async (t) => {
  const requests = harness(t, [{ cartLinesAdd: { cart: graphCart(), userErrors: [] } }]);
  const response = await POST(addRequest());
  assert.equal(response.status, 200);
  assert.deepEqual((await response.json()).userErrors, []);
  assert.equal(requests.length, 1);
});
