import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { build } from "esbuild";
import { fileURLToPath } from "node:url";

const endpointPaths = [
  "razorpay/create-order",
  "razorpay/verify-payment",
  "shopify/order",
  "order",
];

const requestBodies = {
  normal: JSON.stringify({ amountPaise: 23400, currency: "INR" }),
  malformed: '{"amountPaise":',
  forgedPaidOrder: JSON.stringify({
    paymentMethod: "shopify",
    financial_status: "paid",
    totalPaise: 1,
    razorpayOrderId: "order_forged",
    razorpayPaymentId: "pay_forged",
    razorpaySignature: "forged",
    items: [{ variantId: "gid://shopify/ProductVariant/1", quantity: 100 }],
  }),
};

for (const endpoint of endpointPaths) {
  test(`${endpoint} rejects every legacy checkout request without side effects`, async () => {
    const bundle = await build({
      entryPoints: [
        fileURLToPath(new URL(`../src/app/api/${endpoint}/route.ts`, import.meta.url)),
      ],
      bundle: true,
      platform: "node",
      format: "cjs",
      write: false,
      external: ["next/*", "@/lib/shopify/admin-auth"],
    });

    const forbiddenAccess = [];
    const forbid = (operation) => {
      forbiddenAccess.push(operation);
      throw new Error(`Retired checkout must not ${operation}`);
    };
    const testModule = { exports: {} };
    vm.runInNewContext(bundle.outputFiles[0].text, {
      module: testModule,
      exports: testModule.exports,
      Response,
      Buffer,
      process: {
        env: new Proxy({}, { get: (_, name) => forbid(`read environment ${String(name)}`) }),
      },
      fetch: () => forbid("contact a payment or order service"),
      require: (name) => forbid(`load ${name}`),
    });

    let expectedBody;
    for (const [scenario, body] of Object.entries(requestBodies)) {
      const request = new Request(`https://naturemist.shop/api/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer forged" },
        body,
      });
      const unreadableRequest = new Proxy(request, {
        get: (_, name) => forbid(`read request ${String(name)} for ${scenario}`),
      });
      const response = await testModule.exports.POST(unreadableRequest);
      assert.equal(response.status, 410, scenario);
      assert.equal(response.headers.get("Cache-Control"), "no-store", scenario);
      const result = await response.json();
      assert.equal(result.success, false);
      assert.equal(result.verified, false);
      assert.equal(result.code, "CHECKOUT_RETIRED");
      assert.equal(result.checkoutUrl, "/checkout");
      assert.equal(result.orderId, undefined);
      assert.equal(result.paymentId, undefined);
      if (expectedBody) assert.deepEqual(result, expectedBody);
      expectedBody = result;
      assert.equal(request.bodyUsed, false);
    }
    assert.deepEqual(forbiddenAccess, []);
  });
}
