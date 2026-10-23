import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { build } from "esbuild";
import { fileURLToPath } from "node:url";
const bundle = await build({ entryPoints: [fileURLToPath(new URL("../src/lib/shopify/admin-auth.ts", import.meta.url))], bundle: true, platform: "node", format: "cjs", write: false });
function setup(env, fetch) {
  const testModule = { exports: {} };
  const context = vm.createContext({ module: testModule, exports: testModule.exports, process: { env: { SHOPIFY_STORE_DOMAIN: "test.myshopify.com", ...env } }, fetch, Date });
  vm.runInContext(bundle.outputFiles[0].text, context);
  return testModule.exports;
}
const credentials = { SHOPIFY_CLIENT_ID: "client", SHOPIFY_CLIENT_SECRET: "secret", SHOPIFY_ADMIN_API_TOKEN: "expired" };
const reply = (data, status = 200) => ({ ok: status < 400, status, json: async () => data });
test("refreshable app credentials override stale token and reuse unexpired token", async () => {
  let exchanges = 0;
  const auth = setup(credentials, async (url, init) => {
    if (url.endsWith("access_token")) { exchanges++; return reply({ access_token: "fresh", expires_in: 86399 }); }
    assert.equal(init.headers["X-Shopify-Access-Token"], "fresh");
    return reply({ access_scopes: [{ handle: "write_orders" }] });
  });
  assert.equal(await auth.requireOrderAccess(), "fresh");
  assert.equal(await auth.requireOrderAccess(), "fresh");
  assert.equal(exchanges, 1);
});
test("invalid credentials and missing permissions fail closed", async () => {
  await assert.rejects(setup(credentials, async () => reply({}, 401)).requireOrderAccess(), /authentication failed/);
  await assert.rejects(setup({ SHOPIFY_ADMIN_API_TOKEN: "valid" }, async () => reply({ access_scopes: [{ handle: "read_products" }] })).requireOrderAccess(), /write_orders/);
  await assert.rejects(setup({ SHOPIFY_STOREFRONT_PRIVATE_TOKEN: "not-admin" }, async () => { throw Error("must not call"); }).requireOrderAccess(), /not configured/);
});
test("expired tokens are renewed and invalid domains never receive credentials", async () => {
  let count = 0;
  const auth = setup(credentials, async () => { count++; return reply({ access_token: "fresh", expires_in: 0 }); });
  await auth.getAdminToken(); await auth.getAdminToken(); assert.equal(count, 2);
  await assert.rejects(setup({ ...credentials, SHOPIFY_STORE_DOMAIN: "other.example" }, async () => { throw Error("must not call"); }).getAdminToken(), /myshopify/);
});
