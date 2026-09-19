import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import crypto from "node:crypto";
import { build } from "esbuild";
import { fileURLToPath } from "node:url";
async function route(path, auth, fetch, env = {}) {
  const bundle = await build({ entryPoints: [fileURLToPath(new URL(path, import.meta.url))], bundle: true, platform: "node", format: "cjs", write: false, external: ["next/server", "@/lib/shopify/admin-auth"] });
  const module = { exports: {} };
  vm.runInNewContext(bundle.outputFiles[0].text, { module, exports: module.exports, process: { env }, Buffer, fetch, console: { log() {}, warn() {}, error() {} }, require(name) {
    if (name === "next/server") return { NextResponse: { json: (body, options = {}) => ({ body, status: options.status || 200 }) } };
    if (name === "crypto") return crypto;
    if (name === "@/lib/shopify/admin-auth") return { adminDomain: () => "test.myshopify.com", requireOrderAccess: auth };
    throw Error(name);
  } });
  return module.exports.POST;
}
const payload = { customer: { email: "test@example.com", phone: "9999999999", firstName: "Test", lastName: "Buyer" }, deliveryAddress: { firstName: "Test", lastName: "Buyer", address1: "Test", city: "Test", province: "Test", zip: "123456", country: "India" }, items: [{ name: "Test", quantity: 1, pricePaise: 100 }], paymentMethod: "cod", shippingMethod: "standard", shippingFeePaise: 0 };
test("Shopify 401 cannot return a fabricated successful order", async () => {
  let requests = 0;
  const post = await route("../src/app/api/shopify/order/route.ts", async () => "token", async () => { requests++; return { ok: false, status: 401, text: async () => "Invalid token" }; });
  const result = await post({ json: async () => payload });
  assert.equal(result.status, 502);
  assert.equal(result.body.success, false);
  assert.equal(result.body.orderId, undefined);
  assert.equal(requests, 1);
});
test("failed Shopify preflight never starts Razorpay payment", async () => {
  const post = await route("../src/app/api/razorpay/create-order/route.ts", async () => { throw Error("No write_orders"); }, async () => { throw Error("Razorpay must not be called"); }, { RAZORPAY_KEY_ID: "test", RAZORPAY_KEY_SECRET: "secret" });
  const result = await post({ json: async () => ({ amountPaise: 100 }) });
  assert.equal(result.status, 503);
  assert.equal(result.body.success, false);
});
