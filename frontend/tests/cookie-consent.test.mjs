import test from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { fileURLToPath } from "node:url";

async function load(name) {
  const bundle = await build({ entryPoints: [fileURLToPath(new URL(`../src/lib/shopify/${name}.ts`, import.meta.url))], bundle: true, platform: "node", format: "esm", write: false });
  return import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`);
}
const { handleConsentRequest } = await load("consent-proxy");
const { createCartRequestSession } = await load("cart-session");
const { getShopifyPrivacyConfig } = await load("privacy-config");

function harness(t) {
  const prior = { fetch: globalThis.fetch, domain: process.env.SHOPIFY_STORE_DOMAIN, token: process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN };
  process.env.SHOPIFY_STORE_DOMAIN = "test-shop.myshopify.com";
  process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN = "server-only-secret";
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), headers: new Headers(init.headers) });
    return Response.json({ data: { shop: { name: "Test" } } }, { headers: { "set-cookie": "_shopify_essential=confirmed; Path=/; HttpOnly; Secure; SameSite=Lax" } });
  };
  t.after(() => {
    globalThis.fetch = prior.fetch;
    for (const [key, value] of [["SHOPIFY_STORE_DOMAIN", prior.domain], ["SHOPIFY_STOREFRONT_PRIVATE_TOKEN", prior.token]]) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  });
  return calls;
}

test("consent proxy forwards privacy/session headers and sets Shopify's response cookies without exposing server credentials", async (t) => {
  const calls = harness(t);
  const response = await handleConsentRequest(new Request("https://naturemist.shop/api/unstable/graphql.json", {
    method: "POST", headers: { origin: "https://naturemist.shop", "content-type": "application/json", "Shopify-Storefront-Consent-Management": "1", "sec-gpc": "1", "x-forwarded-for": "203.0.113.7", cookie: "_shopify_essential=previous", "Shopify-Storefront-Private-Token": "untrusted-input" },
    body: JSON.stringify({ query: "{shop{name}}" }),
  }));
  assert.equal(response.status, 200);
  assert.equal(calls[0].url, "https://test-shop.myshopify.com/api/unstable/graphql.json");
  assert.equal(calls[0].headers.get("Shopify-Storefront-Private-Token"), null);
  assert.equal(calls[0].headers.get("Shopify-Storefront-Buyer-IP"), "203.0.113.7");
  assert.equal(calls[0].headers.get("sec-gpc"), "1");
  assert.equal(calls[0].headers.get("cookie"), "_shopify_essential=previous");
  assert.match(response.headers.get("set-cookie"), /_shopify_essential=confirmed/);
  assert.match(response.headers.get("cache-control"), /private/);
  assert.match(response.headers.get("cache-control"), /no-store/);
});

test("cross-site consent writes are rejected before contacting Shopify", async (t) => {
  const calls = harness(t);
  const response = await handleConsentRequest(new Request("https://naturemist.shop/api/unstable/graphql.json", { method: "POST", headers: { origin: "https://foreign.example" } }));
  assert.equal(response.status, 403);
  assert.equal(calls.length, 0);
});

test("consent requests use the public Host and HTTPS protocol behind a Next hosting proxy", async (t) => {
  const calls = harness(t);
  const response = await handleConsentRequest(new Request("http://localhost:3000/api/unstable/graphql.json", {
    method: "POST", headers: { host: "naturemist.shop", "x-forwarded-proto": "https", origin: "https://naturemist.shop", "sec-fetch-site": "same-origin", "content-type": "application/json" },
    body: JSON.stringify({ query: "{shop{name}}" }),
  }));
  assert.equal(response.status, 200);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].headers.get("Sec-Shopify-Storefront-Origin"), "https://naturemist.shop");
});

test("cart request client forwards the visitor session and preserves response cookies through its public context API", async (t) => {
  const calls = harness(t);
  const session = createCartRequestSession(new Request("https://naturemist.shop/api/cart", { method: "POST", headers: { cookie: "_shopify_essential=visitor-a", "sec-gpc": "1" } }), "203.0.113.9");
  await session.client.graphql("{shop{name}}");
  const headers = new Headers({ "content-type": "application/json" });
  session.client.requestContext.applyResponseHeaders(headers);
  assert.equal(calls[0].headers.get("cookie"), "_shopify_essential=visitor-a");
  assert.equal(calls[0].headers.get("Shopify-Storefront-Private-Token"), "server-only-secret");
  assert.match(headers.get("set-cookie"), /_shopify_essential=confirmed/);
  assert.match(headers.get("cache-control"), /no-store/);
  const second = createCartRequestSession(new Request("https://naturemist.shop/api/cart", { method: "POST" }), "203.0.113.10");
  await second.client.graphql("{shop{name}}");
  assert.equal(calls[1].headers.get("cookie"), null, "requests must not share visitor cookies");
});

test("banner identity comes from the configured store's response, with no hard-coded alternate shop", (t) => {
  harness(t);
  assert.equal(getShopifyPrivacyConfig(), null);
  assert.deepEqual(getShopifyPrivacyConfig("gid://shopify/Shop/123"), { shopId: "gid://shopify/Shop/123", storefrontId: "0", myshopifyDomain: "test-shop.myshopify.com" });
  process.env.SHOPIFY_STORE_DOMAIN = "https://evil.example/path";
  assert.equal(getShopifyPrivacyConfig("gid://shopify/Shop/123"), null);
});
