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
  if (h.kind === 'hero' && index === 8) value = ['/poster.png'];
  if (h.kind === 'model') {
    if (index === 0) value = { ...value, status: 'ready' };
    if (index === 1 || index === 3) value = true;
  }
  if (h.values.has(index)) value = h.values.get(index);
  return [value, (next) => h.values.set(index, typeof next === 'function' ? next(h.values.has(index) ? h.values.get(index) : value) : next)];
}
export const useRef = (initial) => ({ current: globalThis.harness.refs[globalThis.harness.refIndex++] ?? initial });
export const createElement = (type, props, ...children) => ({ type, props: { ...props, ...(children.length ? { children } : {}) } });
`;
const result = await build({
  stdin: { contents: 'export { ProductHero } from "./src/widgets/home/product-hero"; export { ProductModel } from "./src/features/catalog/product-model"; export { HeroPurchase } from "./src/widgets/home/hero-purchase";', resolveDir: root },
  bundle: true, platform: "node", format: "cjs", write: false, jsx: "automatic",
  plugins: [{ name: "isolated-component-environment", setup(build) {
    build.onResolve({ filter: /^(react|react\/jsx-runtime|next\/image|next\/link|@google\/model-viewer)$/ }, ({ path }) => ({ path, namespace: "mock" }));
    build.onResolve({ filter: /store-provider|use-motion-preferences|use-deferred-media|media-image$|use-webgl|magnetic-link|shery-background$|shery-poster$/ }, ({ path }) => ({ path, namespace: "mock" }));
    build.onResolve({ filter: /product-model$|hero-purchase$/ }, ({ path, importer }) => importer.endsWith("product-hero.tsx") ? { path: path.includes("product-model") ? "ModelPlaceholder" : "PurchasePlaceholder", namespace: "mock" } : undefined);
    build.onResolve({ filter: /\.module\.css$/ }, ({ path }) => ({ path, namespace: "css" }));
    build.onLoad({ filter: /.*/, namespace: "css" }, () => ({ contents: 'export default new Proxy({}, { get: (_, key) => String(key) });' }));
    build.onLoad({ filter: /.*/, namespace: "mock" }, ({ path }) => {
      if (path === "react") return { contents: hooks };
      if (path.includes("use-deferred-media")) return { contents: 'export const useDeferredMedia = () => globalThis.harness.deferredReady !== false;' };
      if (path.includes("media-image")) return { contents: 'export const MediaImage = (props) => ({ type: "img", props });' };
      if (path === "react/jsx-runtime") return { contents: 'export function jsx(type, props) { return typeof type === "function" ? type(props) : {type, props}; } export const jsxs = jsx;' };
      if (path.includes("store-provider")) return { contents: 'export const useStore = () => globalThis.harness.store;' };
      if (path.includes("use-motion-preferences")) return { contents: 'export const useReducedMotion = () => globalThis.harness.reduced; export const usePageVisible = () => true; export const useFinePointer = () => !globalThis.harness.compact; export const useCompactViewport = () => Boolean(globalThis.harness.compact);' };
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
  const timers = new Map();
  const harness = { kind, reduced, stateIndex: 0, refIndex: 0, refs: [], values: new Map(), effects: [], store: {
    content: { motionSettings: { ...motionDefaults, ...motion } }, products: [reetha],
    isWishlisted: () => false, toggleWishlist() {}, isCartBusy: false, addToCart: async () => null,
  } };
  const context = { harness, module: { exports: {} }, console, URL,
    requestAnimationFrame: (callback) => { frames.set(++next, callback); return next; },
    cancelAnimationFrame: (id) => frames.delete(id),
    IntersectionObserver: class { observe() {} disconnect() {} },
    setTimeout: (callback) => { timers.set(++next, callback); return next; },
    clearTimeout: (id) => timers.delete(id),
  };
  context.window = context;
  vm.createContext(context); vm.runInContext(result.outputFiles[0].text, context);
  return { harness, components: context.module.exports,
    flush: () => { const pending = [...frames.values()]; frames.clear(); pending.forEach((callback) => callback()); },
    flushTimers: () => { const pending = [...timers.values()]; timers.clear(); pending.forEach((callback) => callback()); },
  };
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
  env.harness.compact = options.compact;
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

test("phone hero uses lightweight image transitions and keeps a photo behind the 3D model", () => {
  const env = environment("hero");
  env.harness.compact = true;
  const tree = env.components.ProductHero({ products: [{ ...heroProduct(reetha), featuredImage: image }, heroProduct(second)], settings: defaults });
  assert.equal(tree.props["data-transition"], "fade");
  const background = all(tree).find((node) => node.type === "SheryBackground");
  const poster = all(tree).find((node) => node.type === "SheryPoster");
  assert.equal(background, undefined);
  assert.equal(poster, undefined);
  assert.equal(all(tree).find((node) => node.type === "ProductModel").props.poster.url, image.url);
  assert.ok(all(tree).some((node) => node.props?.["aria-label"] === "Pause slideshow"));
  const desktop = all(renderHero().tree);
  assert.equal(desktop.find((node) => node.type === "ProductModel").props.poster.url, image.url);
  assert.equal(desktop.find((node) => node.type === "SheryBackground").props.fit, "cover");
  assert.equal(desktop.find((node) => node.type === "SheryPoster").props.cursor, true);
  for (const options of [{ reduced: true }, { motion: { enabled: false } }, { settings: { transition: "none" } }]) {
    assert.ok(!all(renderHero({ compact: true, ...options }).tree).some((node) => node.type === "SheryBackground" || node.type === "SheryPoster"));
  }
});

test("touch focus pauses for reading disclosures and releases when another hero control is tapped", () => {
  const { tree, harness } = renderHero({ compact: true });
  const focus = (keyboard, disclosure) => tree.props.onFocusCapture({ target: { matches: () => keyboard, closest: () => disclosure ? {} : null } });
  focus(false, true);
  assert.equal(harness.values.get(3), true);
  focus(false, false);
  assert.equal(harness.values.get(3), false);
  focus(true, false);
  assert.equal(harness.values.get(3), true, "keyboard navigation still pauses autoplay");
  const desktop = renderHero();
  desktop.tree.props.onFocusCapture({ target: { matches: () => false, closest: () => null } });
  assert.equal(desktop.harness.values.get(3), true, "desktop focus behavior is unchanged");
});

test("hover on hero does not pause autoplay, but 3D element interaction pauses and resumes", () => {
  const { tree, harness } = renderHero();
  const modelNode = all(tree).find((node) => node.props?.className === "model");
  assert.ok(modelNode, "model container rendered");
  assert.equal(typeof modelNode.props.onPointerDown, "function");
  assert.equal(typeof modelNode.props.onMouseDown, "function");
  assert.equal(typeof modelNode.props.onTouchStart, "function");

  // Hovering does not pause autoplay (index 2 is hovered, index 7 is modelInteracting)
  tree.props.onPointerEnter({ pointerType: "mouse" });
  assert.equal(harness.values.get(7), undefined, "hovering does not set modelInteracting");

  // Interaction with 3D model sets modelInteracting state
  modelNode.props.onPointerDown();
  assert.equal(harness.values.get(7), true, "3D element interaction marks modelInteracting true");

  // Progress bar element is rendered with running/paused animation support
  const progressBar = all(tree).find((node) => node.props?.className === "progress");
  assert.ok(progressBar, "progress bar element rendered");
});

test("poster and background animations share duration and navigation requests a prepared slide", () => {
  const { tree, harness } = renderHero();
  const background = all(tree).find((node) => node.type === "SheryBackground");
  const poster = all(tree).find((node) => node.type === "SheryPoster");
  assert.ok(background, "SheryBackground rendered");
  assert.ok(poster, "SheryPoster rendered");
  assert.equal(background.props.duration, poster.props.duration, "poster and background transition durations are synchronized");
  assert.equal(typeof poster.props.onSelect, "function", "SheryPoster has onSelect callback");

  // Navigation requests preparation without removing the current slide.
  poster.props.onSelect(1);
  assert.equal(harness.values.get(0), undefined);
  assert.equal(harness.values.get(9), 1);
});

test("all text blocks (copy, caption, product details) mount with transition data on ritual change", () => {
  const { tree } = renderHero();
  const copy = all(tree).find((node) => node.props?.className === "copy");
  const caption = all(tree).find((node) => node.props?.className === "caption");
  const details = all(tree).find((node) => node.props?.className === "productDetails");
  assert.ok(copy, "copy rendered");
  assert.ok(caption, "caption rendered");
  assert.ok(details, "productDetails rendered");
  assert.equal(copy.props["data-transition"], "fade");
  assert.equal(caption.props["data-transition"], "fade");
  assert.equal(details.props["data-transition"], "fade");
});

test("transition none removes both Shery effects while keeping static images and navigation", () => {
  const animated = renderHero().tree;
  assert.ok(all(animated).some((node) => node.type === "SheryPoster"));
  assert.ok(all(animated).some((node) => node.type === "SheryBackground"));
  for (const options of [{ settings: { transition: "none" } }, { motion: { enabled: false } }, { reduced: true }]) {
    const tree = renderHero(options).tree;
    assert.equal(tree.props["data-transition"], "none");
    assert.ok(!all(tree).some((node) => node.type === "SheryPoster" || node.type === "SheryBackground"));
    assert.equal(all(tree).filter((node) => node.type === "img" && node.props.fetchPriority !== "low").length, 2);
    assert.ok(all(tree).some((node) => node.props?.["aria-label"] === "Next featured product"));
  }
  for (const motion of [{ cursor: false }, { intensity: 0 }]) {
    const tree = renderHero({ motion }).tree;
    assert.ok(!all(tree).some((node) => node.type === "SheryPoster"));
    assert.equal(all(tree).find((node) => node.type === "HeroPurchase").props.cursorMotion, false);
  }
});

function renderModel(motion = {}, reduced = false, props = {}) {
  const env = environment("model", motion, reduced);
  const attributes = new Map(), styles = new Map();
  const viewer = { loaded: true, toggleAttribute: (key, value) => attributes.set(key, value), setAttribute: (key, value) => attributes.set(key, value), addEventListener() {}, removeEventListener() {} };
  const stage = { style: { setProperty: (key, value) => styles.set(key, value) } };
  env.harness.refs = [viewer, stage];
  const tree = env.components.ProductModel({ model: { url: "/jar.glb", altText: "Jar" }, settings: defaults, ...props });
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
  assert.equal(subtle.attributes.get("camera-orbit"), "12.5deg 96deg 105%");
});

test("gallery model keeps its fitted camera when the pointer moves", () => {
  const result = renderModel({}, false, { presentation: "gallery", cameraDistancePercent: 110 });
  const viewer = all(result.tree).find((node) => node.type === "model-viewer");
  assert.equal(viewer.props["camera-orbit"], "0deg 90deg 110%");
  assert.equal(viewer.props["auto-rotate-delay"], "3000");
  assert.equal(result.styles.size, 0);
  assert.equal(result.attributes.has("camera-orbit"), false, "manual orbit is not overwritten by decorative cursor motion");
});

test("gallery keeps a product photograph visible when WebGL is unavailable", () => {
  const env = environment("model");
  env.harness.values.set(3, false);
  const tree = env.components.ProductModel({ model: { url: "/jar.glb", altText: "Jar" }, presentation: "gallery", poster: image });
  assert.ok(all(tree).some((node) => node.type === "img" && node.props.src === image.url));
  assert.ok(text(tree).includes("3D view unavailable"));
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

test("hero stays static and defers 3D until its poster and background have loaded", () => {
  const env = environment("hero");
  env.harness.values.set(8, []);
  const tree = env.components.ProductHero({ products: [heroProduct(reetha), heroProduct(second)], settings: defaults });
  assert.equal(tree.props["data-media-ready"], false);
  assert.equal(tree.props["data-transition"], "none");
  assert.equal(all(tree).find((node) => node.type === "ProductModel").props.enabled, false);
  assert.ok(!all(tree).some((node) => node.type === "SheryPoster" || node.type === "SheryBackground" || node.props?.className === "progress"));
});

test("navigation preserves the current slide until BOTH target images load", () => {
  const env = environment("hero");
  const products = [heroProduct(reetha), { ...heroProduct(second), heroPoster: { ...image, url: "/next-poster.png" }, heroBackground: { ...image, url: "/next-background.png" } }];
  const render = () => {
    env.harness.stateIndex = 0; env.harness.refIndex = 0; env.harness.effects = [];
    return env.components.ProductHero({ products, settings: { ...defaults, autoplay: false } });
  };
  const runEffects = () => { env.harness.effects.forEach((effect) => effect()); env.flush(); };
  let tree = render();
  all(tree).find((node) => node.props?.["aria-label"] === "Next featured product").props.onClick();
  tree = render(); runEffects();
  assert.notEqual(env.harness.values.get(0), 1);
  all(tree).find((node) => node.type === "img" && node.props.src === "/next-poster.png").props.onLoad();
  tree = render(); runEffects();
  assert.notEqual(env.harness.values.get(0), 1, "one loaded image cannot expose an incomplete slide");
  all(tree).find((node) => node.type === "img" && node.props.src === "/next-background.png").props.onLoad();
  render(); runEffects();
  assert.equal(env.harness.values.get(0), 1);
  assert.equal(env.harness.values.get(9), null);
});

test("3D loading does not hold up the ready poster slideshow", () => {
  const env = environment("hero");
  env.harness.values.set(10, "/jar.glb");
  const tree = env.components.ProductHero({ products: [heroProduct(reetha), heroProduct(second)], settings: defaults });
  assert.equal(all(tree).find((node) => node.props?.className === "progress").props.style.animationPlayState, "running");
});

test("the first poster is preloaded and the next poster warms while the background is still loading", () => {
  const env = environment("hero");
  const products = [{ ...heroProduct(reetha), heroBackground: { ...image, url: "/first-background.png" }, featuredImage: { ...image, url: "/first-photo.png" } },
    { ...heroProduct(second), heroPoster: { ...image, url: "/next-poster.png" }, featuredImage: { ...image, url: "/next-photo.png" } }];
  const tree = env.components.ProductHero({ products, settings: defaults });
  const main = all(tree).find((node) => node.props?.className === "posterImage");
  assert.equal(main.props.preload, true);
  assert.equal(main.props.loading, undefined);
  assert.equal(tree.props["data-media-ready"], false);
  assert.ok(all(tree).some((node) => node.type === "img" && node.props.src === "/next-poster.png" && node.props.fetchPriority === "low"));
  assert.ok(all(tree).some((node) => node.type === "img" && node.props.src === "/next-photo.png" && node.props.fetchPriority === "low"));
});

test("a ready poster starts its full interval without waiting for the mini photo or 3D", () => {
  const env = environment("hero");
  const products = [{ ...heroProduct(reetha), featuredImage: { ...image, url: "/slow-mini-photo.png" } }, heroProduct(second)];
  const tree = env.components.ProductHero({ products, settings: defaults });
  assert.equal(tree.props["data-media-ready"], true);
  assert.equal(all(tree).find((node) => node.props?.className === "progress").props.style.animationPlayState, "running");
});

test("an offscreen model has a photo but no model-viewer element or loading label", () => {
  const env = environment("model");
  env.harness.deferredReady = false;
  env.harness.values.set(0, { url: "/jar.glb", status: "loading" });
  const tree = env.components.ProductModel({ model: { url: "/jar.glb", altText: "Jar" }, poster: image });
  assert.ok(all(tree).some((node) => node.type === "img"));
  assert.ok(!all(tree).some((node) => node.type === "model-viewer"));
  assert.ok(!text(tree).includes("Loading 3D"));
});

test("a stalled model times out to its photograph and can be retried", () => {
  const env = environment("model");
  env.harness.values.set(0, { url: "/jar.glb", status: "loading" });
  env.harness.refs = [{ loaded: false, toggleAttribute() {}, addEventListener() {}, removeEventListener() {} }, {}];
  const render = () => {
    env.harness.stateIndex = 0; env.harness.refIndex = 0; env.harness.effects = [];
    return env.components.ProductModel({ model: { url: "/jar.glb", altText: "Jar" }, poster: image });
  };
  render();
  const cleanups = env.harness.effects.map((effect) => effect());
  env.flush(); env.flushTimers();
  const tree = render();
  assert.ok(all(tree).some((node) => node.type === "img"));
  assert.ok(!all(tree).some((node) => node.type === "model-viewer"));
  all(tree).find((node) => node.type === "button" && text(node) === "Retry 3D view").props.onClick();
  assert.equal(env.harness.values.get(0).status, "loading");
  cleanups.forEach((cleanup) => cleanup?.());
});
