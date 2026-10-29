import test from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { fileURLToPath } from "node:url";

const result = await build({
  entryPoints: [fileURLToPath(new URL("../src/features/analytics/search-tracking.ts", import.meta.url))],
  bundle: true, platform: "node", format: "esm", write: false,
  plugins: [{ name: "search-hooks", setup(builder) {
    builder.onResolve({ filter: /^(react|\.\/runtime)$/ }, ({ path }) => ({ path, namespace: "search-test" }));
    builder.onLoad({ filter: /.*/, namespace: "search-test" }, ({ path }) => ({ contents: path === "react" ? `
      export const useRef = initial => {
        const h = globalThis.__searchTest, index = h.cursor++;
        return h.refs[index] ||= { current: initial };
      };
      export const useEffect = (effect, dependencies) => {
        const h = globalThis.__searchTest, index = h.cursor++, previous = h.effects[index];
        if (previous && dependencies.every((value, i) => Object.is(value, previous.dependencies[i]))) return;
        previous?.cleanup?.();
        h.effects[index] = { dependencies, effect };
        h.pending.push(index);
      };
    ` : `
      export const trackSearchView = (payload) => {
        const h = globalThis.__searchTest;
        if (!h.allowed) return false;
        h.events.push({ event: "search", payload });
        return true;
      };
    ` }));
  } }],
});
const { useSearchTracking } = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`);

function fixture(t) {
  const previous = { harness: globalThis.__searchTest, document: globalThis.document, window: globalThis.window };
  const h = globalThis.__searchTest = {
    cursor: 0, refs: [], effects: [], pending: [], timers: new Map(), sequence: 0, events: [], allowed: true,
    query: "", count: 2, enabled: true, vocabulary: [{ name: "Amla Powder", slug: "amla-powder" }],
  };
  globalThis.document = new EventTarget();
  globalThis.window = {
    setTimeout: (callback, delay) => { const id = ++h.sequence; h.timers.set(id, { callback, delay }); return id; },
    clearTimeout: (id) => h.timers.delete(id),
  };
  function SearchProbe() {
    useSearchTracking(h.query, h.vocabulary, h.count, h.enabled);
    return null;
  }
  h.render = () => {
    h.cursor = 0;
    SearchProbe();
    for (const index of h.pending.splice(0)) h.effects[index].cleanup = h.effects[index].effect();
  };
  h.settle = () => {
    for (const [id, timer] of [...h.timers]) { h.timers.delete(id); assert.equal(timer.delay, 600); timer.callback(); }
  };
  t.after(() => {
    for (const effect of h.effects) effect?.cleanup?.();
    globalThis.document = previous.document;
    globalThis.window = previous.window;
    globalThis.__searchTest = previous.harness;
  });
  return h;
}

test("catalog search cancels intermediate typing and records settled known terms once", t => {
  const h = fixture(t);
  h.query = "am"; h.render();
  h.query = "Amla Powder"; h.render();
  assert.equal(h.events.length, 0);
  assert.equal(h.timers.size, 1);
  h.settle();
  document.dispatchEvent(new Event("naturemist:analytics-ready"));
  assert.deepEqual(h.events, [{ event: "search", payload: { search_term: "amla powder", result_count: 2 } }]);
});

test("zero-result free text is redacted while blank and preview searches are suppressed", t => {
  const h = fixture(t);
  h.query = "person@example.com"; h.count = 0; h.render(); h.settle();
  assert.deepEqual(h.events[0].payload, { search_term: "[redacted]", result_count: 0 });
  h.query = "  "; h.render(); h.settle();
  h.query = "amla powder"; h.enabled = false; h.render(); h.settle();
  assert.equal(h.events.length, 1);
});

test("consent readiness records only the currently displayed search and clearing permits a new search", t => {
  const h = fixture(t);
  h.allowed = false; h.query = "previous query"; h.render(); h.settle();
  h.query = "amla powder"; h.render(); h.settle();
  assert.equal(h.events.length, 0);
  h.allowed = true;
  document.dispatchEvent(new Event("visitorConsentCollected"));
  assert.deepEqual(h.events.map(({ payload }) => payload.search_term), ["amla powder"]);
  h.query = ""; h.render();
  h.query = "amla powder"; h.render(); h.settle();
  assert.equal(h.events.length, 2);
});
