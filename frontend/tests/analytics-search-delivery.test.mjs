import test from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { fileURLToPath } from "node:url";

const result = await build({
  stdin: {
    contents: 'export {useSearchTracking} from "./search-tracking"; export {configureAnalytics} from "./runtime";',
    resolveDir: fileURLToPath(new URL("../src/features/analytics/", import.meta.url)), loader: "ts",
  },
  bundle: true, platform: "node", format: "esm", write: false,
  plugins: [{ name: "search-delivery-hooks", setup(builder) {
    builder.onResolve({ filter: /^react$/ }, ({ path }) => ({ path, namespace: "search-test" }));
    builder.onLoad({ filter: /.*/, namespace: "search-test" }, () => ({ contents: `
      export const useRef = initial => {
        const h = globalThis.__searchDeliveryTest, index = h.cursor++;
        return h.refs[index] ||= { current: initial };
      };
      export const useEffect = (effect, dependencies) => {
        const h = globalThis.__searchDeliveryTest, index = h.cursor++, previous = h.effects[index];
        if (previous && dependencies.every((value, i) => Object.is(value, previous.dependencies[i]))) return;
        previous?.cleanup?.();
        h.effects[index] = { dependencies, effect };
        h.pending.push(index);
      };
    ` }));
  } }],
});

async function fixture(t) {
  const previous = { harness: globalThis.__searchDeliveryTest, document: globalThis.document, window: globalThis.window };
  const h = globalThis.__searchDeliveryTest = {
    cursor: 0, refs: [], effects: [], pending: [], timers: new Map(), sequence: 0, native: [],
    query: "", count: 2, enabled: true,
    vocabulary: [{ name: "Amla Powder", slug: "amla-powder" }, { name: "Neem Powder", slug: "neem-powder" }],
  };
  globalThis.document = Object.assign(new EventTarget(), { referrer: "", createElement: () => ({}), head: { appendChild() {} } });
  const bus = { publish: (event, payload) => h.native.push({ event, payload }) };
  globalThis.window = {
    location: { hostname: "naturemist.shop", href: "https://naturemist.shop/shop" },
    Shopify: { customerPrivacy: { analyticsProcessingAllowed: () => true } },
    setTimeout: (callback, delay) => { const id = ++h.sequence; h.timers.set(id, { callback, delay }); return id; },
    clearTimeout: (id) => h.timers.delete(id),
  };
  const { useSearchTracking, configureAnalytics } = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}#${Math.random()}`);
  configureAnalytics({ enabled: true, gaId: "G-TEST123", shopifyEnabled: true, hosts: ["naturemist.shop"] }, []);
  h.events = () => (window.dataLayer || []).map((args) => Array.from(args)).filter(([kind, event]) => kind === "event" && event === "search");
  h.setShopifyReady = (ready) => { if (ready) window.Shopify.analytics = bus; else delete window.Shopify.analytics; };
  function SearchProbe() { useSearchTracking(h.query, h.vocabulary, h.count, h.enabled); return null; }
  h.render = () => {
    h.cursor = 0;
    SearchProbe();
    for (const index of h.pending.splice(0)) h.effects[index].cleanup = h.effects[index].effect();
  };
  h.settle = () => {
    for (const [id, timer] of [...h.timers]) { h.timers.delete(id); assert.equal(timer.delay, 600); timer.callback(); }
  };
  h.unmount = () => { for (const effect of h.effects) effect?.cleanup?.(); };
  t.after(() => {
    h.unmount(); globalThis.document = previous.document; globalThis.window = previous.window; globalThis.__searchDeliveryTest = previous.harness;
  });
  return h;
}

test("late Shopify search delivery does not disappear or duplicate the Google event", async t => {
  const h = await fixture(t);
  h.query = "amla powder"; h.render(); h.settle();
  assert.equal(h.events().length, 1);
  assert.equal(h.native.length, 0);
  h.setShopifyReady(true);
  document.dispatchEvent(new Event("naturemist:analytics-ready"));
  document.dispatchEvent(new Event("consentTrackingApiLoaded"));
  assert.equal(h.events().length, 1);
  assert.deepEqual(h.native.map(({ payload }) => payload.searchTerm), ["amla powder"]);
});

test("query changes and closing a search discard undelivered old results", async t => {
  const h = await fixture(t);
  h.query = "amla powder"; h.render(); h.settle();
  h.query = "neem powder"; h.render();
  h.setShopifyReady(true);
  document.dispatchEvent(new Event("naturemist:analytics-ready"));
  assert.equal(h.native.length, 0, "a new query waits for its debounce");
  h.settle();
  assert.deepEqual(h.native.map(({ payload }) => payload.searchTerm), ["neem powder"]);
  assert.deepEqual(h.events().map((event) => event[2].search_term), ["amla powder", "neem powder"]);
  h.setShopifyReady(false);
  h.query = "amla powder"; h.render(); h.settle();
  h.unmount();
  h.setShopifyReady(true);
  document.dispatchEvent(new Event("naturemist:analytics-ready"));
  h.settle();
  assert.equal(h.native.length, 1, "closing removes retries and timers");
});
