import test from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = fileURLToPath(new URL("../", import.meta.url));
const hooks = `
export const useMemo = (fn) => fn();
export const useCallback = (fn) => fn;
export const useEffect = (fn) => globalThis.harness.effects.push(fn);
export function useState(initial) {
  const h = globalThis.harness, index = h.stateIndex++;
  let value = typeof initial === 'function' ? initial() : initial;
  if (h.kind === 'hero' && (index === 4 || index === 5)) value = true;
  if (h.kind === 'model') {
    if (index === 0) value = { ...value, status: 'ready' };
    if (index === 1 || index === 3) value = true;
  }
  if (h.values.has(index)) value = h.values.get(index);
  return [value, (next) => h.values.set(index, typeof next === 'function' ? next(value) : next)];
}
export const useRef = (initial) => ({ current: globalThis.harness.refs[globalThis.harness.refIndex++] ?? initial });
export const createElement = (type, props, ...children) => ({ type, props: { ...props, ...(children.length ? { children } : {}) } });
`;
const result = await build({
  stdin: { contents: 'export { ProductHero } from "./src/widgets/home/product-hero"; export { ProductModel } from "./src/features/catalog/product-model"; export { HeroPurchase } from "./src/widgets/home/hero-purchase";', resolveDir: root },
  bundle: true, platform: "node", format: "cjs", write: false, jsx: "automatic",
  plugins: [{ name: "isolated-component-environment", setup(build) {
    build.onResolve({ filter: /^(react|react\/jsx-runtime|next\/image|next\/link|@google\/model-viewer)$/ }, ({ path }) => ({ path, namespace: "mock" }));
    build.onResolve({ filter: /store-provider|use-motion-preferences|use-webgl|magnetic-link|shery-background$|shery-poster$/ }, ({ path }) => ({ path, namespace: "mock" }));
    build.onResolve({ filter: /product-model$|hero-purchase$/ }, ({ path, importer }) => importer.endsWith("product-hero.tsx") ? { path: path.includes("product-model") ? "ModelPlaceholder" : "PurchasePlaceholder", namespace: "mock" } : undefined);
    build.onResolve({ filter: /\.module\.css$/ }, ({ path }) => ({ path, namespace: "css" }));
    build.onLoad({ filter: /.*/, namespace: "css" }, () => ({ contents: 'export default new Proxy({}, { get: (_, key) => String(key) });' }));
    build.onLoad({ filter: /.*/, namespace: "mock" }, ({ path }) => {
      if (path === "react") return { contents: hooks };
      if (path === "react/jsx-runtime") return { contents: 'export function jsx(type, props) { return typeof type === "function" ? type(props) : {type, props}; } export const jsxs = jsx;' };
      if (path.includes("store-provider")) return { contents: 'export const useStore = () => globalThis.harness.store;' };
      if (path.includes("use-motion-preferences")) return { contents: 'export const useReducedMotion = () => globalThis.harness.reduced; export const usePageVisible = () => true; export const useFinePointer = () => true;' };
      if (path.includes("use-webgl")) return { contents: 'export const useWebGL = () => true; export const isWebGLAvailable = () => true; export const markWebGLUnavailable = () => {};' };
      if (path === "@google/model-viewer") return { contents: "export {};" };
      const name = path === "ModelPlaceholder" ? "ProductModel" : path === "PurchasePlaceholder" ? "HeroPurchase" : path.includes("magnetic-link") ? "MagneticLink" : path.includes("shery-background") ? "SheryBackground" : path.includes("shery-poster") ? "SheryPoster" : null;
      return { contents: name ? `export const ${name} = (props) => ({ type: '${name}', props });` : `export default (props) => ({type: '${path === "next/image" ? "img" : "a"}', props});` };
    });
  } }],
});

const defaults = { autoplay: true, intervalSeconds: 8, autoRotate: true, rotationSpeed: 20, cursorMotion: true, transition: "fade" };
const motionDefaults = { enabled: true, cursor: true, duration: 1, intensity: 1 };
const reetha = { id: "p1", slug: "reetha-powder", name: "Reetha Powder", collectionNumber: "1", shortDescription: "Approved description", subtitle: "Wash-day ritual", size: "250 g", ingredient: "Reetha fruit powder", formulation: "Ground fruit", benefits: ["Approved benefit"], howTo: ["Follow pack directions"], pricePaise: 24000 };
const second = { ...reetha, id: "p2", slug: "indigo-powder", name: "Indigo Powder" };
const image = { url: "/poster.png", altText: "Poster", width: 600, height: 800 };
const heroProduct = (product, copy = {}) => ({ ...product, heroEnabled: true, heroModel: { url: "/jar.glb", altText: "Jar" }, heroPoster: image, heroBackground: image, hero: copy });

function environment(kind, motion = {}, reduced = false) {
  const frames = new Map(); let next = 0;
  const harness = { kind, reduced, stateIndex: 0, refIndex: 0, refs: [], values: new Map(), effects: [], store: {
    content: { motionSettings: { ...motionDefaults, ...motion } }, products: [reetha],
    isWishlisted: () => false, toggleWishlist() {}, isCartBusy: false, addToCart: async () => null,
  } };
  const context = { harness, module: { exports: {} }, console, URL,
    requestAnimationFrame: (callback) => { frames.set(++next, callback); return next; },
    cancelAnimationFrame: (id) => frames.delete(id),
    IntersectionObserver: class { observe() {} disconnect() {} },
    setTimeout, clearTimeout,
  };
  context.window = context;
  vm.createContext(context); vm.runInContext(result.outputFiles[0].text, context);
  return { harness, components: context.module.exports, flush: () => { const pending = [...frames.values()]; frames.clear(); pending.forEach((callback) => callback()); } };
}

function all(node) {
  if (!node || typeof node !== "object") return [];
  const children = [node.props?.children].flat(Infinity);
  return [node, ...children.flatMap(all)];
}
function text(node) {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node !== "object") return String(node);
  return [node.props?.children].flat(Infinity).map(text).join("");
}
function renderHero(options = {}) {
  const env = environment("hero", options.motion, options.reduced);
  const tree = env.components.ProductHero({ products: [heroProduct(reetha, options.copy), heroProduct(second)], settings: { ...defaults, ...options.settings } });
  return { ...env, tree };
}

test("saved Shopify copy takes priority for a recognized botanical without changing its theme", () => {
  const { tree } = renderHero({ copy: { eyebrow: "SAVED BOTANICAL LABEL", headlineFirst: "Meet", headlineMiddle: "Our Reetha", headlineItalic: "Your saved ritual.", description: "Saved hero description" } });
  assert.equal(all(tree).find((node) => node.props?.className === "introEyebrow").props.children, "SAVED BOTANICAL LABEL");
  assert.equal(text(all(tree).find((node) => node.type === "h1")), "MeetOur Reetha");
  assert.ok(text(tree).includes("Your saved ritual."));
  assert.ok(text(tree).includes("Saved hero description"));
  assert.equal(tree.props["data-theme"], "reetha");
  assert.ok(text(tree).includes("Formulation: Ground fruit"));
  const blank = renderHero({ copy: { headlineFirst: "  ", headlineMiddle: "", headlineItalic: " " } }).tree;
  assert.equal(text(all(blank).find((node) => node.type === "h1")), "DiscoverReetha.");
  assert.ok(text(blank).includes("Your wash-day ritual."));
});

test("transition none removes both Shery effects while keeping static images and navigation", () => {
  const animated = renderHero().tree;
  assert.ok(all(animated).some((node) => node.type === "SheryPoster"));
  assert.ok(all(animated).some((node) => node.type === "SheryBackground"));
  for (const options of [{ settings: { transition: "none" } }, { motion: { enabled: false } }, { reduced: true }]) {
    const tree = renderHero(options).tree;
    assert.equal(tree.props["data-transition"], "none");
    assert.ok(!all(tree).some((node) => node.type === "SheryPoster" || node.type === "SheryBackground"));
    assert.equal(all(tree).filter((node) => node.type === "img").length, 2);
    assert.ok(all(tree).some((node) => node.props?.["aria-label"] === "Next featured product"));
  }
  for (const motion of [{ cursor: false }, { intensity: 0 }]) {
    const tree = renderHero({ motion }).tree;
    assert.ok(!all(tree).some((node) => node.type === "SheryPoster"));
    assert.equal(all(tree).find((node) => node.type === "HeroPurchase").props.cursorMotion, false);
  }
});

function renderModel(motion = {}, reduced = false) {
  const env = environment("model", motion, reduced);
  const attributes = new Map(), styles = new Map();
  const viewer = { loaded: true, toggleAttribute: (key, value) => attributes.set(key, value), setAttribute: (key, value) => attributes.set(key, value), addEventListener() {}, removeEventListener() {} };
  const stage = { style: { setProperty: (key, value) => styles.set(key, value) } };
  env.harness.refs = [viewer, stage];
  const tree = env.components.ProductModel({ model: { url: "/jar.glb", altText: "Jar" }, settings: defaults });
  env.harness.effects.forEach((effect) => effect());
  tree.props.onPointerMove({ pointerType: "mouse", buttons: 0, clientX: 100, clientY: 100, currentTarget: { getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100 }) } });
  env.flush();
  return { tree, attributes, styles };
}

test("actual model honors global enabled, cursor, intensity and reduced-motion controls", () => {
  for (const [motion, reduced] of [[{ enabled: false }, false], [{}, true]]) {
    const result = renderModel(motion, reduced);
    assert.equal(result.attributes.get("auto-rotate"), false);
    assert.equal(result.styles.size, 0);
    assert.ok(!all(result.tree).some((node) => node.type === "button"));
  }
  for (const motion of [{ cursor: false }, { intensity: 0 }]) {
    const result = renderModel(motion);
    assert.equal(result.attributes.get("auto-rotate"), true, "cursor settings do not disable independent auto-rotation");
    assert.equal(result.styles.size, 0);
  }
  const subtle = renderModel({ intensity: .5 });
  assert.equal(subtle.styles.get("--model-x"), "6px");
  assert.equal(subtle.styles.get("--model-y"), "4px");
  assert.equal(subtle.attributes.get("camera-orbit"), "12.5deg 81deg 105%");
});

test("purchase displays supplied size without a tax assertion and never marks a failed add as Added", async () => {
  const env = environment("purchase");
  const tree = env.components.HeroPurchase({ slug: reetha.slug, name: reetha.name, pricePaise: reetha.pricePaise });
  assert.ok(text(tree).includes("250 g"));
  assert.ok(!text(tree).includes("Tax included"));
  const button = all(tree).find((node) => node.type === "button" && text(node).includes("Add to bag"));
  button.props.onClick();
  await Promise.resolve(); await Promise.resolve();
  assert.equal(env.harness.values.get(0), false);
});
