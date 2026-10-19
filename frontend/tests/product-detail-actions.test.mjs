import test from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { fileURLToPath } from "node:url";

// Exercise the real rendered controls and event closures. Framework boundaries
// use deterministic state slots; the provider itself is covered separately.
const hookSource = `
export const useEffect = () => {};
export const useSyncExternalStore = () => false;
export function useState(initial) {
  const hooks = globalThis.__detailActionTest;
  const index = hooks.cursor++;
  if (!(index in hooks.slots)) hooks.slots[index] = typeof initial === "function" ? initial() : initial;
  return [hooks.slots[index], (next) => { hooks.slots[index] = typeof next === "function" ? next(hooks.slots[index]) : next; }];
}
export function useRef(initial) { return useState(() => ({ current: initial }))[0]; }
`;
const bundle = await build({
  entryPoints: [fileURLToPath(new URL("../src/features/catalog/product-detail-actions.tsx", import.meta.url))],
  bundle: true, platform: "node", format: "esm", jsx: "automatic", write: false,
  plugins: [{
    name: "detail-actions-boundaries",
    setup(builder) {
      builder.onResolve({ filter: /^(react(?:\/jsx-runtime)?|react-dom|next\/navigation|@\/features\/store\/store-provider)$/ }, ({ path }) => ({ path, namespace: "detail-test" }));
      builder.onLoad({ filter: /.*/, namespace: "detail-test" }, ({ path }) => ({
        contents: {
          react: hookSource,
          "react/jsx-runtime": "export const jsx = (type, props) => ({ type, props }); export const jsxs = jsx; export const Fragment = Symbol.for('react.fragment');",
          "react-dom": "export const createPortal = (children) => children;",
          "next/navigation": "export const useRouter = () => globalThis.__detailActionTest.router;",
          "@/features/store/store-provider": "export const useStore = () => globalThis.__detailActionTest.store;",
        }[path],
      }));
    },
  }],
});
const { ProductDetailActions } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`);
const product = {
  id: "gid://shopify/Product/100", slug: "test-product", name: "Test Product",
  pricePaise: 10000, currencyCode: "INR", availableForSale: true,
  variants: [
    { id: "gid://shopify/ProductVariant/101", title: "100g", pricePaise: 10000, currencyCode: "INR", availableForSale: true, quantityAvailable: 10 },
    { id: "gid://shopify/ProductVariant/102", title: "250g", pricePaise: 24950, currencyCode: "INR", availableForSale: true, quantityAvailable: 3 },
  ],
};

function nodes(tree) {
  if (Array.isArray(tree)) return tree.flatMap(nodes);
  if (!tree || typeof tree !== "object") return [];
  return [tree, ...nodes(tree.props?.children)];
}

function text(tree) {
  if (Array.isArray(tree)) return tree.map(text).join("");
  if (tree && typeof tree === "object") return text(tree.props?.children);
  return typeof tree === "string" || typeof tree === "number" ? String(tree) : "";
}

function setup(t, succeed) {
  const previous = globalThis.__detailActionTest;
  const previousWindow = globalThis.window;
  const calls = [], routes = [], events = [];
  const fixture = {
    cursor: 0, slots: [],
    router: { push: (route) => routes.push(route) },
    store: {
      source: "shopify", isCartBusy: false, cartError: "",
      isWishlisted: () => false, toggleWishlist: () => {}, clearCartError: () => {},
      track: (...event) => events.push(event),
      addToCart: async (...args) => {
        calls.push(args);
        if (succeed) return { checkoutUrl: "https://example.myshopify.com/checkout" };
        fixture.store.cartError = "Shopify could not add this option.";
        return null;
      },
    },
  };
  globalThis.__detailActionTest = fixture;
  globalThis.window = { setTimeout: () => 1, clearTimeout: () => {} };
  t.after(() => {
    if (previous === undefined) delete globalThis.__detailActionTest;
    else globalThis.__detailActionTest = previous;
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  });
  const render = () => { fixture.cursor = 0; return ProductDetailActions({ product }); };
  const button = (label) => nodes(render()).find((node) => node.type === "button" && text(node).includes(label));
  const select = nodes(render()).find((node) => node.type === "select");
  select.props.onChange({ target: { value: product.variants[1].id } });
  nodes(render()).find((node) => node.props?.["aria-label"] === "Increase quantity").props.onClick();
  return { render, button, calls, routes, events };
}

test("detail Add to Bag forwards the chosen variant and full product context", async (t) => {
  const harness = setup(t, true);
  harness.button("Add to Bag").props.onClick();
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(harness.calls, [[product.slug, 2, true, product.variants[1].id, product]]);
  assert.match(text(harness.render()), /Added to Ritual/);
  assert.deepEqual(harness.routes, []);
});

test("failed Buy Now keeps the product page and exposes the cart error without checkout analytics", async (t) => {
  const harness = setup(t, false);
  harness.button("Buy Now").props.onClick();
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(harness.calls, [[product.slug, 2, false, product.variants[1].id, product]]);
  assert.deepEqual(harness.routes, []);
  assert.deepEqual(harness.events, []);
  const alert = nodes(harness.render()).find((node) => node.props?.role === "alert");
  assert.match(text(alert), /Shopify could not add this option/);
  assert.equal(harness.button("Buy Now").props.disabled, false);
  assert.doesNotMatch(text(harness.render()), /Added to Ritual|Preparing Checkout/);
});

test("successful Buy Now navigates once and records the selected variant price", async (t) => {
  const harness = setup(t, true);
  harness.button("Buy Now").props.onClick();
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(harness.calls, [[product.slug, 2, false, product.variants[1].id, product]]);
  assert.deepEqual(harness.routes, ["/checkout"]);
  assert.deepEqual(harness.events, [["begin_checkout", {
    item_id: product.variants[1].id, quantity: 2, value: 499, currency: "INR", mode: "in_app_checkout",
  }]]);
});
