import test from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const bundle = await build({
  stdin: {
    contents: `export { JudgemeScript } from './features/reviews/judgeme-script';
      export { JudgemePreviewBadge } from './features/reviews/judgeme-preview-badge';
      export { JudgemeReviewWidget } from './features/reviews/judgeme-review-widget';`,
    resolveDir: fileURLToPath(new URL("../src", import.meta.url)), loader: "tsx",
  },
  tsconfig: fileURLToPath(new URL("../tsconfig.json", import.meta.url)),
  bundle: true, platform: "node", format: "esm", jsx: "automatic", write: false,
  loader: { ".module.css": "empty" },
  plugins: [{ name: "hydration-boundaries", setup(builder) {
    builder.onResolve({ filter: /^(react(?:\/jsx-runtime)?|next\/script)$/ }, ({ path }) => ({ path, namespace: "fixture" }));
    builder.onLoad({ filter: /.*/, namespace: "fixture" }, ({ path }) => ({ contents: {
      react: `export const useState = () => [globalThis.__judge.configured, value => {globalThis.__judge.configured = value}];
        export const useRef = () => ({current: null});
        export const useEffect = effect => {globalThis.__judge.effects.push(effect)};
        export const useSyncExternalStore = (subscribe, client, server) => globalThis.__judge.hydrated ? client() : server();`,
      "react/jsx-runtime": "export const jsx = (type, props) => ({type, props}); export const jsxs = jsx; export const Fragment = 'fragment';",
      "next/script": "export default function Script() {}",
    }[path] }));
  } }],
});
const { JudgemeScript, JudgemePreviewBadge, JudgemeReviewWidget } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`);

function setup(t) {
  const previous = globalThis.__judge;
  const previousWindow = globalThis.window;
  globalThis.__judge = { configured: false, hydrated: false, effects: [] };
  globalThis.window = new EventTarget();
  t.after(() => { globalThis.__judge = previous; globalThis.window = previousWindow; });
  return globalThis.__judge;
}
function nodes(tree) {
  if (Array.isArray(tree)) return tree.flatMap(nodes);
  if (!tree || typeof tree !== "object") return [];
  return [tree, ...nodes(tree.props?.children)];
}

test("Judge.me config executes after hydration and gates the external SDK", t => {
  setup(t);
  const initial = nodes(JudgemeScript());
  const config = initial.find(node => node.props.id === "judgeme-init");
  assert.equal(config.props.strategy, "afterInteractive");
  assert.ok(!initial.some(node => node.props.id === "judgeme-widget-js"));
  vm.runInNewContext(config.props.dangerouslySetInnerHTML.__html, { window });
  assert.equal(window.jdgm.PLATFORM, "shopify");
  assert.ok(window.jdgm.SHOP_DOMAIN);
  assert.ok(window.jdgmSettings);
  config.props.onReady();
  const sdk = nodes(JudgemeScript()).find(node => node.props.id === "judgeme-widget-js");
  assert.equal(sdk.props.strategy, "afterInteractive");
  let events = 0;
  window.addEventListener("judgeme:ready", () => events++);
  sdk.props.onReady();
  assert.equal(events, 1);
});

test("unhydrated widgets expose no markup that the SDK can rewrite", t => {
  const state = setup(t);
  const props = { productId: "gid://shopify/Product/123", productHandle: "amla", productTitle: "Amla", initialHtml: '<div class="jdgm-rev">Published review</div>' };
  assert.equal(JudgemePreviewBadge(props), null);
  assert.ok(!nodes(JudgemeReviewWidget(props)).some(node => node.props.className?.includes("jdgm-widget")));
  state.hydrated = true;
  assert.ok(nodes(JudgemePreviewBadge(props)).some(node => node.props["data-id"] === "123"));
  assert.ok(nodes(JudgemeReviewWidget(props)).some(node => node.props.dangerouslySetInnerHTML?.__html.includes("Published review")));
});

test("late SDK readiness initializes a mounted badge and unregisters on unmount", t => {
  const state = setup(t);
  state.hydrated = true;
  JudgemePreviewBadge({ productId: "123" });
  const cleanup = state.effects[0]();
  let initialized = 0;
  window.jdgm = { loadBadgesInContainer: () => initialized++ };
  window.dispatchEvent(new Event("judgeme:ready"));
  assert.equal(initialized, 1);
  cleanup();
  window.dispatchEvent(new Event("judgeme:ready"));
  assert.equal(initialized, 1);
});
