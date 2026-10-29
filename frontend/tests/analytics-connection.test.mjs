import test from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { fileURLToPath } from "node:url";
import { getShopifyScriptTags } from "@shopify/hydrogen";

async function bundle(entry, plugins = []) {
  const result = await build({
    entryPoints: [fileURLToPath(new URL(`../src/features/analytics/${entry}`, import.meta.url))],
    bundle: true, platform: "node", format: "esm", write: false, plugins,
  });
  return import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`);
}
const { resolveAnalyticsConfig } = await bundle("config.ts");
const shop = { shopId: "gid://shopify/Shop/123", storefrontId: "0", myshopifyDomain: "example.myshopify.com" };

test("master switch disables Shopify's destination script while cookie controls remain available", () => {
  const config = resolveAnalyticsConfig({ enabled: "false", shopifyEnabled: "true", hosts: "naturemist.shop", gaId: "G-TEST123" });
  assert.equal(config.enabled, false);
  assert.equal(config.gaId, "");
  const tags = getShopifyScriptTags({ shop, consent: { mode: "default-banner" }, shopifyAnalytics: config.shopifyEnabled });
  assert.equal(tags.scripts.some(tag => tag.attributes?.id === "shopify-storefront-analytics"), false);
  assert.ok(tags.scripts.some(tag => tag.attributes?.src?.includes("privacy-banner")));
});

test("Shopify reporting can be configured without a Google Analytics account", () => {
  const config = resolveAnalyticsConfig({ enabled: "true", shopifyEnabled: "true", hosts: "Naturemist.shop, www.naturemist.shop,naturemist.shop" });
  assert.deepEqual(config, { enabled: true, shopifyEnabled: true, gaId: "", hosts: ["naturemist.shop", "www.naturemist.shop"] });
  const tags = getShopifyScriptTags({ shop, consent: { mode: "default-banner" }, shopifyAnalytics: config.shopifyEnabled });
  assert.equal(tags.scripts.filter(tag => tag.attributes?.id === "shopify-storefront-analytics").length, 1);
  assert.equal(tags.scripts.some(tag => tag.attributes?.src?.includes("google")), false);
});

test("missing or unsafe host settings keep reporting disabled", () => {
  for (const hosts of [undefined, "", "*", "https://naturemist.shop/path", "localhost:3000"]) {
    assert.equal(resolveAnalyticsConfig({ enabled: "true", shopifyEnabled: "true", hosts }).shopifyEnabled, false);
  }
});

const { AnalyticsBridge } = await bundle("analytics-bridge.tsx", [{
  name: "analytics-bridge-hooks",
  setup(builder) {
    builder.onResolve({ filter: /^(react|next\/navigation|@\/features\/store\/store-provider|\.\/runtime)$/ }, ({ path }) => ({ path, namespace: "bridge-test" }));
    builder.onLoad({ filter: /.*/, namespace: "bridge-test" }, ({ path }) => ({ contents: path === "react" ? `
      export const useRef = initial => {
        const h = globalThis.__bridgeTest, index = h.cursor++;
        return h.refs[index] ||= { current: initial };
      };
      export const useEffect = (effect, dependencies) => {
        const h = globalThis.__bridgeTest, index = h.cursor++, previous = h.effects[index];
        if (previous && dependencies.every((value, i) => Object.is(value, previous.dependencies[i]))) return;
        previous?.cleanup?.();
        h.effects[index] = { dependencies, effect };
        h.pending.push(index);
      };
    ` : path === "next/navigation" ? `
      export const usePathname = () => globalThis.__bridgeTest.path;
      export const useSearchParams = () => new URLSearchParams(globalThis.__bridgeTest.search);
    ` : path.includes("store-provider") ? `
      export const useStore = () => globalThis.__bridgeTest.store;
    ` : `
      export const configureAnalytics = config => globalThis.__bridgeTest.configurations.push(config);
      export const synchronizeConsent = () => true;
      export const trackPage = key => globalThis.__bridgeTest.pages.push(key);
      export const trackCartView = (...args) => { globalThis.__bridgeTest.views.push(args); return globalThis.__bridgeTest.accept; };
    ` }));
  },
}]);

function bridgeFixture(t) {
  const previous = { harness: globalThis.__bridgeTest, document: globalThis.document };
  const h = globalThis.__bridgeTest = {
    cursor: 0, refs: [], effects: [], pending: [], pages: [], views: [], configurations: [], accept: true,
    path: "/checkout", search: "", store: { source: "shopify", products: [], cart: [], currencyCode: "INR", isCartOpen: false, isCartBusy: false, isHydrated: false },
  };
  globalThis.document = new EventTarget();
  const config = { enabled: true, shopifyEnabled: true, gaId: "", hosts: ["naturemist.shop"] };
  t.after(() => {
    for (const effect of h.effects) effect?.cleanup?.();
    globalThis.document = previous.document;
    globalThis.__bridgeTest = previous.harness;
  });
  h.render = () => {
    h.cursor = 0;
    assert.equal(AnalyticsBridge({ config }), null);
    for (const index of h.pending.splice(0)) h.effects[index].cleanup = h.effects[index].effect();
  };
  return h;
}

test("cart summary waits for confirmed hydration and sends the server snapshot once per viewing", t => {
  const h = bridgeFixture(t);
  h.render();
  assert.equal(h.views.length, 0);
  h.store.isHydrated = true;
  h.store.isCartBusy = true;
  h.render();
  assert.equal(h.views.length, 0);
  h.store.isCartBusy = false;
  h.store.analyticsCart = { id: "gid://shopify/Cart/public", updatedAt: "2026-10-27T00:00:00Z", lines: { nodes: [] } };
  h.render();
  assert.equal(h.views.length, 1);
  assert.equal(h.views[0][1], h.store.analyticsCart);
  h.render();
  document.dispatchEvent(new Event("visitorConsentCollected"));
  assert.equal(h.views.length, 1);
  h.path = "/shop";
  h.render();
  h.store.isCartOpen = true;
  h.render();
  assert.equal(h.views.length, 2);
});

test("consent retry and query-only navigation reach the analytics adapter without UI changes", t => {
  const h = bridgeFixture(t);
  h.store.isHydrated = true;
  h.accept = false;
  h.render();
  h.accept = true;
  document.dispatchEvent(new Event("visitorConsentCollected"));
  assert.equal(h.views.length, 2);
  const pageCount = h.pages.length;
  h.search = "variant=123";
  h.render();
  assert.equal(h.pages.length, pageCount + 1);
  h.store.source = "preview";
  h.render();
  assert.equal(h.configurations.at(-1).enabled, false);
});

test("moving directly from the cart drawer to checkout records the new summary viewing", t => {
  const h = bridgeFixture(t);
  h.path = "/shop";
  h.store.isHydrated = true;
  h.store.isCartOpen = true;
  h.render();
  assert.equal(h.views.length, 1);
  h.path = "/checkout";
  h.store.isCartOpen = false;
  h.render();
  assert.equal(h.views.length, 2);
  h.render();
  assert.equal(h.views.length, 2);
});
