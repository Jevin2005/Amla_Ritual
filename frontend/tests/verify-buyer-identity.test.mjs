import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { build } from "esbuild";
import { fileURLToPath } from "node:url";

const bundle = await build({ entryPoints: [fileURLToPath(new URL("../src/app/api/reviews/verify-buyer/route.ts", import.meta.url))], bundle: true, platform: "node", format: "cjs", write: false, external: ["next/server", "@/lib/shopify/admin-auth"] });
async function verify(item, target = {}) {
  const routeModule = { exports: {} };
  vm.runInNewContext(bundle.outputFiles[0].text, { module: routeModule, exports: routeModule.exports, console, fetch: async () => ({ ok: true, json: async () => ({ orders: [{ id: 1, email: "buyer@shop.example", line_items: [item] }] }) }), require(name) {
    if (name === "next/server") return { NextResponse: { json: (body) => body } };
    if (name === "@/lib/shopify/admin-auth") return { adminDomain: () => "test.myshopify.com", getAdminToken: async () => "test-token" };
    throw Error(name);
  } });
  return routeModule.exports.POST({ json: async () => ({ email: "buyer@shop.example", productSlug: "amla-powder", productName: "Amla Fruit Powder for Herbal Hair Packs 200g", ...target }) });
}

test("shared 200 g packaging and descriptive role words do not verify another powder", async () => {
  for (const title of ["Hibiscus Flower Powder for Herbal Hair Packs 200g", "Reetha Cleansing Powder for Herbal Hair Washes 200 g", "200g", "Traditional Hair Packs"]) {
    assert.equal((await verify({ title })).verified, false, title);
  }
  assert.equal((await verify({ title: "NatureMist Amla Powder 250g" })).verified, true);
});

test("explicit product identity takes priority over old or conflicting titles", async () => {
  assert.equal((await verify({ product_id: 123, title: "Old title" }, { productId: "gid://shopify/Product/123" })).verified, true);
  assert.equal((await verify({ product_id: 456, title: "Amla Powder" }, { productId: "gid://shopify/Product/123" })).verified, false);
});

test("missing names and non-distinctive words cannot match arbitrary order titles", async () => {
  assert.equal((await verify({ title: "Hibiscus Powder" }, { productName: "" })).verified, false);
  assert.equal((await verify({ title: "Hibiscus Powder", properties: [{ name: "slug", value: "hibiscus-powder" }] }, { productSlug: "" })).verified, false);
  assert.equal((await verify({ title: "Reetha Powder 200g" }, { productSlug: "tea-powder", productName: "Tea Powder" })).verified, false);
});
