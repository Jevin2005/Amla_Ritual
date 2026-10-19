import test from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { fileURLToPath } from "node:url";

const bundle = await build({
  entryPoints: [fileURLToPath(new URL("../src/widgets/home/combo-preview.tsx", import.meta.url))],
  bundle: true, platform: "node", format: "esm", jsx: "automatic", write: false,
  plugins: [{ name: "popup-boundaries", setup(b) {
    b.onResolve({ filter: /^(react(?:\/jsx-runtime)?|react-dom|next\/(navigation|link)|@\/features\/store\/store-provider|@\/shared\/(hooks\/use-modal-focus|ui\/media-image))$/ }, ({ path }) => ({ path, namespace: "popup-test" }));
    b.onLoad({ filter: /.*/, namespace: "popup-test" }, ({ path }) => ({ contents: {
      react: `
        export const useEffect = () => {};
        export const useCallback = fn => fn;
        export const useId = () => "popup-test";
        export const useSyncExternalStore = () => true;
        export function useState(initial) {
          const h = globalThis.__comboPopupTest, i = h.cursor++;
          if (!(i in h.slots)) h.slots[i] = typeof initial === "function" ? initial() : initial;
          return [h.slots[i], next => { h.slots[i] = typeof next === "function" ? next(h.slots[i]) : next; }];
        }
        export const useRef = initial => useState(() => ({ current: initial }))[0];`,
      "react/jsx-runtime": "export const jsx = (type, props) => ({type, props}); export const jsxs = jsx;",
      "react-dom": "export const createPortal = children => children; export const flushSync = fn => fn();",
      "next/navigation": "export const useRouter = () => globalThis.__comboPopupTest.router;",
      "next/link": "export default 'a';",
      "@/shared/ui/media-image": "export const MediaImage = 'img';",
      "@/shared/hooks/use-modal-focus": "export const useModalFocus = (active, ref, close) => { globalThis.__comboPopupTest.dismiss = close; };",
      "@/features/store/store-provider": "export const useStore = () => globalThis.__comboPopupTest.store;",
    }[path] }));
    b.onResolve({ filter: /\.module\.css$/ }, () => ({ path: "css", namespace: "popup-css" }));
    b.onLoad({ filter: /.*/, namespace: "popup-css" }, () => ({ contents: "export default {};" }));
  } }],
});
const { ComboPreview } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`);

const variant = (id, pricePaise, quantityAvailable = 4) => ({ id: `gid://shopify/ProductVariant/${id}`, title: `${id} g`, pricePaise, currencyCode: "INR", availableForSale: true, quantityAvailable });
const listing = { id: "gid://shopify/Product/100", slug: "duo", name: "Custom Duo", pricePaise: 29900, currencyCode: "INR", availableForSale: true, variants: [variant(101, 29900), variant(102, 49900, 2)] };
const members = [
  { slug: "amla", name: "Amla", pricePaise: 23400, shortDescription: "Amla description", ingredient: "Amla fruit", howTo: ["Mix with water"], size: "250 g", availableForSale: false,
    featuredImage: { url: "/amla-front.jpg", altText: "Amla front" }, images: [{ url: "/amla-front.jpg", altText: "Amla front" }, { url: "/amla-back.jpg", altText: "Amla back" }] },
  { slug: "reetha", name: "Reetha", pricePaise: 32500, shortDescription: "Reetha description", size: "250 g" },
];
const nodes = tree => Array.isArray(tree) ? tree.flatMap(nodes) : tree && typeof tree === "object" ? [tree, ...nodes(tree.props?.children)] : [];
const text = tree => Array.isArray(tree) ? tree.map(text).join("") : tree && typeof tree === "object" ? text(tree.props?.children) : typeof tree === "string" || typeof tree === "number" ? String(tree) : "";

function setup(t, overrides = {}, result = { items: [] }) {
  const previous = globalThis.__comboPopupTest, previousDocument = globalThis.document;
  const calls = [], effects = [];
  const h = {
    cursor: 0, slots: [], router: { push: route => effects.push(route) },
    store: {
      source: "shopify", isCartBusy: false, isCartOpen: false, isHydrated: true, cartError: "",
      clearCartError() {}, track() {}, openCart: () => effects.push("cart"),
      addToCart: async (...args) => { calls.push(args); return typeof result === "function" ? result() : result; },
      addManyToCart: () => { throw new Error("Never purchase the individual jars as the combo"); },
    },
  };
  globalThis.__comboPopupTest = h;
  globalThis.document = { body: {} };
  t.after(() => {
    if (previous === undefined) delete globalThis.__comboPopupTest; else globalThis.__comboPopupTest = previous;
    if (previousDocument === undefined) delete globalThis.document; else globalThis.document = previousDocument;
  });
  const props = { title: "Custom Duo", ingredientLabel: "Amla + Reetha", image: "/duo.webp", products: members, expectedProductCount: 2, listingProduct: listing, onClose: () => effects.push("close"), ...overrides };
  const render = () => { h.cursor = 0; return ComboPreview(props); };
  const button = label => nodes(render()).find(n => n.type === "button" && text(n).includes(label));
  const select = label => nodes(render()).find(n => n.type === "label" && text(n).startsWith(label)).props.children.find(n => n?.type === "select");
  return { render, button, select, calls, effects, h };
}

test("popup lists every member with details and uses the independent combo price", t => {
  const h = setup(t);
  const tree = h.render();
  assert.equal(nodes(tree).filter(n => n.type === "details").length, 2);
  for (const copy of ["Amla description", "Reetha description", "Mix with water", "Combo price₹299"]) assert.ok(text(tree).includes(copy), copy);
  assert.equal(h.button("Buy now").props.disabled, false, "member stock does not replace combo inventory");
  assert.ok(!text(tree).includes("Combined total"));
});

test("add to bag sends only the combo variant and selected quantity, then closes before opening cart", async t => {
  const h = setup(t);
  h.select("Combo option").props.onChange({ target: { value: listing.variants[1].id } });
  h.select("Quantity").props.onChange({ target: { value: "2" } });
  assert.match(text(h.render()), /Combo total \(2 sets\)₹998/);
  await h.button("Add combo to bag").props.onClick();
  assert.deepEqual(h.calls, [["duo", 2, false, listing.variants[1].id, listing]]);
  assert.deepEqual(h.effects, ["close", "cart"]);
});

test("buy now goes to checkout only after successful addition", async t => {
  const h = setup(t);
  await h.button("Buy now").props.onClick();
  assert.deepEqual(h.calls, [["duo", 1, false, listing.variants[0].id, listing]]);
  assert.deepEqual(h.effects, ["close", "/checkout"]);
});

test("cart failure leaves popup open with an error and no checkout navigation", async t => {
  const h = setup(t, {}, null);
  await h.button("Buy now").props.onClick();
  assert.deepEqual(h.effects, []);
  assert.ok(nodes(h.render()).some(n => n.props?.role === "alert"));
  assert.equal(h.button("Buy now").props.disabled, false);
});

test("unpublished and sold-out combo purchases cannot call the cart", async t => {
  const h = setup(t, { listingProduct: undefined, purchaseUnavailable: true });
  assert.equal(h.button("Coming soon").props.disabled, true);
  await h.button("Coming soon").props.onClick();
  assert.deepEqual(h.calls, []);
  assert.equal(h.button("Buy now"), undefined);
});

test("sold-out selected options are disabled without blocking other options", t => {
  const h = setup(t, { listingProduct: { ...listing, variants: [listing.variants[0], { ...listing.variants[1], quantityAvailable: 0 }] } });
  h.select("Combo option").props.onChange({ target: { value: listing.variants[1].id } });
  assert.equal(h.button("Buy now").props.disabled, true);
  h.select("Combo option").props.onChange({ target: { value: listing.variants[0].id } });
  assert.equal(h.button("Buy now").props.disabled, false);
});

test("repeated clicks during an in-flight request do not add a duplicate combo", async t => {
  let finish;
  const pending = new Promise(resolve => { finish = resolve; });
  const h = setup(t, {}, () => pending);
  const click = h.button("Buy now").props.onClick;
  const first = click();
  await click();
  assert.equal(h.calls.length, 1);
  finish({ items: [] });
  await first;
  assert.deepEqual(h.effects, ["close", "/checkout"]);
});

test("full-product links close the popup and retain each individual product URL", t => {
  const h = setup(t);
  const links = nodes(h.render()).filter(n => n.type === "a");
  assert.deepEqual(links.map(n => n.props.href), ["/shop/amla", "/shop/reetha"]);
  links[0].props.onClick({ preventDefault() {} });
  assert.deepEqual(h.effects, ["close"]);
});

test("product photos open within the popup and browse only that product's distinct images", t => {
  const h = setup(t);
  const thumbnail = nodes(h.render()).find(n => n.props?.["aria-label"] === "View photos of Amla");
  thumbnail.props.onClick({ currentTarget: { focus() {} } });
  assert.ok(text(h.render()).includes("Amla photos"));
  assert.ok(text(h.render()).includes("Photo 1 of 2"));
  const next = nodes(h.render()).find(n => n.props?.["aria-label"] === "Next product photo");
  next.props.onClick();
  assert.ok(text(h.render()).includes("Photo 2 of 2"));
  assert.equal(nodes(h.render()).find(n => n.props?.["aria-label"] === "Next product photo").props.disabled, true);
  assert.ok(nodes(h.render()).some(n => n.type === "img" && n.props.alt === "Amla back"));
  assert.deepEqual(h.effects, []);
});

test("Escape returns from photos without losing combo options, then closes the combo", t => {
  const h = setup(t);
  h.select("Combo option").props.onChange({ target: { value: listing.variants[1].id } });
  h.select("Quantity").props.onChange({ target: { value: "2" } });
  h.button("View product photos").props.onClick({ currentTarget: { focus() {} } });
  h.render();
  h.h.dismiss();
  assert.ok(!text(h.render()).includes("Amla photos"));
  assert.match(text(h.render()), /Combo total \(2 sets\)₹998/);
  assert.deepEqual(h.effects, []);
  h.h.dismiss();
  assert.deepEqual(h.effects, ["close"]);
});

test("products without images show a fallback without inheriting another product's photos", t => {
  const h = setup(t);
  nodes(h.render()).find(n => n.props?.["aria-label"] === "View photos of Reetha").props.onClick({ currentTarget: { focus() {} } });
  assert.ok(text(h.render()).includes("Reetha photos"));
  assert.ok(text(h.render()).includes("Photo 1 of 1"));
  assert.ok(nodes(h.render()).some(n => n.type === "img" && n.props.alt === "Reetha" && n.props.src === "/images/product-placeholder.svg"));
  h.button("Back to combo").props.onClick();
  assert.ok(!text(h.render()).includes("Reetha photos"));
  assert.deepEqual(h.effects, []);
});
