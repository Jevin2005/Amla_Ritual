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
const bundleOptions = {
  bundle: true, platform: "node", format: "cjs", write: false, jsx: "automatic",
  plugins: [{ name: "isolated-component-environment", setup(build) {
    build.onResolve({ filter: /^(react|react\/jsx-runtime|next\/image|next\/link|@google\/model-viewer(?:\/dist\/model-viewer\.js)?)$/ }, ({ path }) => ({ path, namespace: "mock" }));
    build.onResolve({ filter: /store-provider|use-motion-preferences|use-deferred-media|media-image$|use-webgl|magnetic-link|shery-background$|shery-poster$|hero-scene$/ }, ({ path }) => ({ path, namespace: "mock" }));
    build.onResolve({ filter: /product-model$|hero-purchase$/ }, ({ path, importer }) => importer.endsWith("product-hero.tsx") ? { path: path.includes("product-model") ? "ModelPlaceholder" : "PurchasePlaceholder", namespace: "mock" } : undefined);
    build.onResolve({ filter: /\.module\.css$/ }, ({ path }) => ({ path, namespace: "css" }));
    build.onLoad({ filter: /.*/, namespace: "css" }, () => ({ contents: 'export default new Proxy({}, { get: (_, key) => String(key) });' }));
    build.onLoad({ filter: /.*/, namespace: "mock" }, ({ path }) => {
      if (path === "react") return { contents: hooks };
      if (path.endsWith("hero-scene")) return { contents: 'export function createHeroScene() { throw new Error("Image hero must not create a WebGL scene"); }' };
      if (path.includes("use-deferred-media")) return { contents: 'export const useDeferredMedia = (enabled, delay) => { globalThis.harness.deferredCalls.push({ enabled, delay }); return enabled && globalThis.harness.deferredReady !== false; };' };
      if (path.includes("media-image")) return { contents: 'export const MediaImage = (props) => ({ type: "img", props });' };
      if (path === "react/jsx-runtime") return { contents: 'export function jsx(type, props) { return typeof type === "function" ? type(props) : {type, props}; } export const jsxs = jsx; export const Fragment = "Fragment";' };
      if (path.includes("store-provider")) return { contents: 'export const useStore = () => globalThis.harness.store;' };
      if (path.includes("use-motion-preferences")) return { contents: 'export const useReducedMotion = () => globalThis.harness.reduced; export const usePageVisible = () => globalThis.harness.pageVisible !== false; export const useFinePointer = () => !globalThis.harness.compact; export const useCompactViewport = () => Boolean(globalThis.harness.compact);' };
      if (path.includes("use-webgl")) return { contents: 'export const useWebGL = () => true; export const isWebGLAvailable = () => true; export const markWebGLUnavailable = () => { globalThis.harness.contextLost = true; };' };
      if (path.startsWith("@google/model-viewer")) return { contents: "export const ModelViewerElement = globalThis.harness.modelViewerConstructor;" };
      const name = path === "ModelPlaceholder" ? "ProductModel" : path === "PurchasePlaceholder" ? "HeroPurchase" : path.includes("magnetic-link") ? "MagneticLink" : path.includes("shery-background") ? "SheryBackground" : path.includes("shery-poster") ? "SheryPoster" : null;
      return { contents: name ? `export const ${name} = (props) => ({ type: '${name}', props });` : `export default (props) => ({type: '${path === "next/image" ? "img" : "a"}', props});` };
    });
  } }],
};
const result = await build({
  ...bundleOptions,
  stdin: { contents: 'export { ProductHero } from "./src/widgets/home/product-hero"; export { ProductModel } from "./src/features/catalog/product-model"; export { HeroPurchase } from "./src/widgets/home/hero-purchase"; export { getHeroScrollMetrics, getHeroScrollOffset, getHeroHandoffMetrics, getHeroLayout } from "./src/widgets/home/hero-motion";', resolveDir: root },
});
const heroBundle = await build({
  ...bundleOptions,
  stdin: { contents: 'export { ProductHero } from "./src/widgets/home/product-hero";', resolveDir: root },
  metafile: true,
});

const defaults = { autoplay: true, intervalSeconds: 8, autoRotate: true, rotationSpeed: 20, cursorMotion: true, transition: "fade" };
const motionDefaults = { enabled: true, cursor: true, duration: 1, intensity: 1 };
const reetha = { id: "p1", slug: "reetha-powder", name: "Reetha Powder", collectionNumber: "1", shortDescription: "Approved description", subtitle: "Wash-day ritual", size: "250 g", ingredient: "Reetha fruit powder", formulation: "Ground fruit", benefits: ["Approved benefit"], howTo: ["Follow pack directions"], pricePaise: 24000 };
const amla = { ...reetha, id: "amla", slug: "amla-powder", name: "Amla Powder" };
const image = { url: "/poster.png", altText: "Poster", width: 600, height: 800 };
const heroProduct = (product, copy = {}) => ({ ...product, heroEnabled: true, heroModel: { url: "/jar.glb", altText: "Jar" }, heroPoster: image, heroBackground: image, hero: copy });
const sixProducts = ["Amla", "Reetha", "Indigo", "Bhringraj", "Hibiscus", "Shikakai"].map((name, index) => ({
  ...reetha, id: name.toLowerCase(), slug: `${name.toLowerCase()}-powder`, name: `${name} Powder`,
  heroEnabled: true, collectionNumber: String(index + 1),
}));

function environment(kind, motion = {}, reduced = false) {
  const frames = new Map(); let next = 0, time = 0;
  const timers = new Map();
  const timerDeadlines = new Map();
  const intersections = new Set();
  const resizes = new Set();
  const harness = { kind, reduced, modelViewerConstructor: { modelCacheSize: 5 }, deferredCalls: [], stateIndex: 0, refIndex: 0, refs: [], values: new Map(), effects: [], store: {
    content: { motionSettings: { ...motionDefaults, ...motion } }, products: [reetha],
    isWishlisted: () => false, toggleWishlist() {}, isCartBusy: false, addToCart: async () => null,
  } };
  const media = eventTarget({ matches: reduced });
  const header = element();
  const document = eventTarget({ hidden: false, querySelector: (selector) => selector === "[data-ritual-header]" ? header : null });
  const context = eventTarget({ harness, module: { exports: {} }, console, URL, document,
    scrollY: 0, innerHeight: 900,
    performance: { now: () => time },
    getComputedStyle: () => ({ minHeight: "auto" }),
    matchMedia: (query) => query.includes("prefers-reduced-motion") ? media : { matches: !harness.compact },
    scrollTo: (options) => { harness.scrollRequest = options; },
    requestAnimationFrame: (callback) => { frames.set(++next, callback); return next; },
    cancelAnimationFrame: (id) => frames.delete(id),
    IntersectionObserver: class {
      constructor(callback) { this.callback = callback; }
      observe(target) { this.target = target; intersections.add(this); }
      disconnect() { intersections.delete(this); }
    },
    ResizeObserver: class {
      constructor(callback) { this.callback = callback; }
      observe(target) { this.target = target; resizes.add(this); }
      disconnect() { resizes.delete(this); }
    },
    setTimeout: (callback, delay = 0) => { timers.set(++next, callback); timerDeadlines.set(next, time + delay); return next; },
    clearTimeout: (id) => { timers.delete(id); timerDeadlines.delete(id); },
  });
  context.window = context;
  vm.createContext(context); vm.runInContext(result.outputFiles[0].text, context);
  return { harness, context, media, frames, timers, header, components: context.module.exports,
    intersect: (target, isIntersecting) => intersections.forEach((observer) => {
      if (observer.target === target) observer.callback([{ target, isIntersecting }]);
    }),
    intersectBatch: (target, states) => intersections.forEach((observer) => {
      if (observer.target === target) observer.callback(states.map((isIntersecting) => ({ target, isIntersecting })));
    }),
    notifyResize: (target) => resizes.forEach((observer) => {
      if (observer.target === target) observer.callback([{ target }]);
    }),
    advanceTime: (milliseconds) => { time += milliseconds; },
    flush: () => { time += 16.7; const pending = [...frames.values()]; frames.clear(); pending.forEach((callback) => callback(time)); },
    flushTimers: () => { const pending = [...timers.values()]; timers.clear(); timerDeadlines.clear(); pending.forEach((callback) => callback()); },
    tickTimers: (milliseconds) => {
      time += milliseconds;
      for (const [id, deadline] of [...timerDeadlines].sort((a, b) => a[1] - b[1])) {
        if (deadline > time || !timers.has(id)) continue;
        const callback = timers.get(id);
        timers.delete(id); timerDeadlines.delete(id);
        callback();
      }
    },
  };
}

function eventTarget(extra = {}) {
  const listeners = new Map();
  const listenerOptions = new Map();
  return {
    ...extra, listeners, listenerOptions,
    addEventListener: (type, callback, options) => { listeners.set(type, callback); listenerOptions.set(type, options); },
    removeEventListener: (type, callback) => { if (listeners.get(type) === callback) { listeners.delete(type); listenerOptions.delete(type); } },
    emit: (type, event = {}) => {
      if (type.startsWith("pointer")) for (const [key, value] of Object.entries({ type, pointerId: 1, isPrimary: true, button: 0, timeStamp: 0 })) {
        if (!(key in event)) event[key] = value;
      }
      return listeners.get(type)?.(event);
    },
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
  env.harness.refs = options.refs ?? [];
  const tree = env.components.ProductHero({ products: options.products ?? [{ ...amla, heroEnabled: true }], settings: { ...defaults, ...options.settings } });
  return { ...env, tree };
}

function element(extra = {}) {
  const properties = new Map();
  return eventTarget({ style: {
    setProperty: (key, value) => properties.set(key, value),
    removeProperty: (key) => { const value = properties.get(key) ?? ""; properties.delete(key); return value; },
  }, properties, dataset: {}, ...extra });
}

function assertNumericStyle(actual, expected) {
  const numbers = /-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/gi;
  assert.equal(actual.replace(numbers, "#"), expected.replace(numbers, "#"));
  const actualValues = actual.match(numbers).map(Number);
  const expectedValues = expected.match(numbers).map(Number);
  actualValues.forEach((value, index) => assert.ok(Math.abs(value - expectedValues[index]) < 1e-10, `${actual} differs from ${expected}`));
}

// Express the rendered transform in viewport-relative coordinates so the
// interaction checks assert the visible pose, independent of layout strategy.
function jarStyle(link) {
  const { style, viewport } = link;
  const match = style.transform?.match(/translate3d\(([-\d.e]+)px,([-\d.e]+)px,0\).*scale\(([-\d.e]+)\)/);
  if (!match) return style;
  return {
    ...style,
    left: `${Number(match[1]) / viewport.section.clientWidth * 100}%`,
    top: `${Number(match[2]) / viewport.surface.clientHeight * 100}%`,
    height: `${parseFloat(style.height) * Number(match[3]) / viewport.surface.clientHeight * 100}%`,
    width: `${parseFloat(style.width) * Number(match[3])}px`,
  };
}

async function mountHero(options = {}) {
  const captures = new Set();
  const section = element({ clientWidth: options.width ?? (options.compact ? 390 : 1440),
    setPointerCapture: (id) => captures.add(id),
    releasePointerCapture: (id) => { captures.delete(id); section.emit("lostpointercapture", { pointerId: id }); },
    hasPointerCapture: (id) => captures.has(id),
  });
  const incoming = options.noIncoming ? null : element({ hasAttribute: (name) => name === "data-previous-hero" });
  section.nextElementSibling = incoming;
  const surface = element({ clientHeight: options.height ?? 900, getBoundingClientRect: () => ({ left: 0, top: 0 }) });
  const seal = element(), arc = element(), cue = element(), counter = element(), progress = element();
  const links = [];
  const env = renderHero({ ...options, refs: [section, surface, seal, arc, cue, links, counter, progress] });
  env.context.innerHeight = surface.clientHeight;
  all(env.tree).filter((node) => node.props?.["data-hero-product"] !== undefined).forEach((node) => {
    const link = element({
      viewport: { section, surface },
      getAttribute: (name) => name === "data-hero-product" ? String(node.props["data-hero-product"]) : null,
      closest: (selector) => selector === "[data-hero-product]" ? link : null,
      focus: (options) => { env.harness.focusedLink = link; env.harness.focusOptions = options; },
    });
    links.push(link);
  });
  Object.defineProperty(section, "offsetHeight", { get: () => section.dataset.reducedMotion === "true" ? surface.clientHeight : env.components.getHeroScrollMetrics(surface.clientHeight, links.length).sectionHeight });
  section.documentTop = 0;
  section.getBoundingClientRect = () => ({ top: section.documentTop - env.context.scrollY, bottom: section.documentTop - env.context.scrollY + section.offsetHeight });
  const cleanups = env.harness.effects.map((effect) => effect());
  for (let tick = 0; tick < 5; tick += 1) await Promise.resolve();
  env.flush();
  assert.ok(links.every((link) => link.style.left), "hero should position its images directly in the DOM");
  return {
    ...env, section, surface, seal, arc, cue, counter, progress, links, incoming, captures,
    jarEvent(type, index = 0, extra = {}) {
      const event = { type, target: links[index], pointerId: 1, pointerType: "mouse", isPrimary: true, button: 0,
        clientX: 600, clientY: 350, timeStamp: 100, detail: 1, defaultPrevented: false, propagationStopped: false,
        preventDefault() { this.defaultPrevented = true; }, stopPropagation() { this.propagationStopped = true; }, ...extra };
      section.emit(type, event);
      return event;
    },
    snapshot() { return links.map((link) => ({ ...jarStyle(link), tabIndex: link.tabIndex })); },
    settle() {
      for (let count = 0; count < 150 && env.frames.size; count += 1) env.flush();
      assert.equal(env.frames.size, 0, "the idle hero must stop scheduling frames");
    },
    setScrollPhase(phase) {
      env.context.scrollY = env.components.getHeroScrollOffset(phase, surface.clientHeight, links.length);
    },
    scrollTo(progress) {
      this.setScrollPhase(progress);
      env.context.emit("scroll");
      this.settle();
    },
    resize(width, height) {
      section.clientWidth = width;
      surface.clientHeight = height;
      env.context.innerHeight = height;
      env.notifyResize(surface);
      this.settle();
    },
    dispose() { cleanups.forEach((cleanup) => cleanup?.()); },
  };
}

test("the hero uses each of the six label-based jars once and preserves the matching product destinations", () => {
  const products = [sixProducts[4], sixProducts[1], sixProducts[5], sixProducts[0], sixProducts[3], sixProducts[2]].map((product) => ({
    ...product, featuredImage: { ...image, url: `/unrelated-${product.slug}.png` },
  }));
  const { tree } = renderHero({ products: [
    { ...sixProducts[0], id: "disabled-amla", heroEnabled: false }, ...products,
    { ...sixProducts[0], id: "duplicate-amla", slug: "naturemist-amla-refill", heroOrder: -1 },
    { ...reetha, id: "unknown", slug: "neem-powder", name: "Neem Powder", heroEnabled: true },
  ] });
  const links = all(tree).filter((node) => node.props?.["data-hero-product"] !== undefined);
  assert.deepEqual(links.map((node) => node.props.href), sixProducts.map((product) => `/shop/${product.slug}`));
  const assets = links.map((link, index) => {
    const jar = all(link).find((node) => node.type === "img");
    assert.equal(link.props["aria-label"], `Discover ${sixProducts[index].name}`);
    assert.equal(jar.props.src, `/images/hero/naturemist-${sixProducts[index].id}-200g.png`);
    assert.equal(jar.props.preload, true);
    assert.equal(link.props.draggable, false);
    assert.equal(jar.props.draggable, false);
    return jar.props.src;
  });
  assert.equal(new Set(assets).size, 6);
  assert.equal(text(all(tree).find((node) => node.type === "h1")), "Rooted in nature. Made for your ritual.");
  assert.ok(all(tree).some((node) => node.type === "textPath"), "the motto should follow the seal's arc");
  assert.ok(!all(tree).some((node) => ["canvas", "model-viewer", "ProductModel"].includes(node.type)));
});

test("the image hero accepts every enabled botanical without model, poster, or background assets", () => {
  for (const product of sixProducts) {
    const { tree } = renderHero({ products: [product] });
    assert.ok(tree);
    assert.equal(all(tree).find((node) => node.type === "img").props.src, `/images/hero/naturemist-${product.id}-200g.png`);
    assert.ok(all(tree).some((node) => node.props?.href === `/shop/${product.slug}`));
  }
});

test("saved hero order takes precedence over collection order and disabled products never occupy a slot", () => {
  const products = sixProducts.map((product, index) => ({ ...product, heroOrder: 10 - index }));
  const { tree } = renderHero({ products: [...products, { ...sixProducts[0], id: "another-amla", heroOrder: 0 }] });
  assert.deepEqual(all(tree).filter((node) => node.props?.["data-hero-product"] !== undefined).map((node) => node.props.href), [...sixProducts].reverse().map((product) => `/shop/${product.slug}`));
  const filtered = renderHero({ products: sixProducts.map((product, index) => ({ ...product, heroEnabled: index !== 2 })) });
  assert.deepEqual(all(filtered.tree).filter((node) => node.props?.["data-hero-product"] !== undefined).map((node) => node.props.href), sixProducts.filter((_, index) => index !== 2).map((product) => `/shop/${product.slug}`));
});

test("the hero bundle has no WebGL, GLB loader, or product-model dependency", () => {
  for (const path of Object.keys(heroBundle.metafile.inputs)) {
    assert.doesNotMatch(path, /(?:^|[/\\:])(?:three|hero-scene|product-model|use-webgl)(?:[/\\.]|$)|model-viewer|ModelPlaceholder|GLTFLoader/i);
  }
  const { tree } = renderHero({ products: [heroProduct(amla)] });
  for (const node of all(tree)) {
    assert.ok(!["canvas", "model-viewer", "ProductModel"].includes(node.type));
    for (const key of ["src", "href", "poster"]) {
      if (typeof node.props?.[key] === "string") assert.doesNotMatch(node.props[key], /\.(?:glb|gltf|usdz)(?:\?|$)/i);
    }
  }
});

test("empty, disabled, and unknown-label catalogs hide the entire story", () => {
  for (const products of [[], [{ ...heroProduct(amla), heroEnabled: false }], [{ ...heroProduct(reetha), name: "Neem Powder", slug: "neem-powder" }]]) {
    const env = renderHero({ products });
    assert.equal(env.tree, null);
    env.harness.effects.forEach((effect) => effect());
    assert.equal(env.frames.size, 0);
    assert.equal(env.timers.size, 0);
  }
});

test("the scroll story never starts an autoplay timer and rests between interactions", async () => {
  const env = await mountHero({ settings: { autoplay: true, intervalSeconds: 3, autoRotate: true } });
  const opening = env.snapshot();
  env.settle();
  assert.equal(env.timers.size, 0, "saved slideshow settings must not create a looping timer");
  assert.ok(!all(env.tree).some((node) => ["Pause slideshow", "Next featured product"].includes(node.props?.["aria-label"])));
  env.flushTimers(); env.flush();
  assert.deepEqual(env.snapshot(), opening);
  env.dispose();
});

test("horizontal jar dragging settles with momentum and suppresses only the drag's pointer click", async () => {
  const env = await mountHero({ products: sixProducts });
  const opening = env.snapshot();
  env.jarEvent("pointerdown");
  const drag = env.jarEvent("pointermove", 0, { clientX: 60, timeStamp: 124 });
  assert.equal(drag.defaultPrevented, true);
  assert.equal(env.section.dataset.dragging, "true");
  assert.equal(env.captures.has(1), true);
  env.flush();
  assert.ok(parseFloat(jarStyle(env.links[0]).left) < parseFloat(opening[0].left));
  env.jarEvent("pointerup", 0, { clientX: 60, timeStamp: 140 });
  const releasePosition = jarStyle(env.links[0]).left;
  assert.equal(env.section.dataset.dragging, "false");
  assert.equal(env.captures.size, 0);
  assert.ok(env.frames.size > 0, "released input should settle through the existing animation loop");
  env.settle();
  assert.notEqual(jarStyle(env.links[0]).left, releasePosition);
  const centered = env.links.findIndex((link) => Math.abs(parseFloat(jarStyle(link).left) - 50) < 0.01);
  assert.ok(centered > 0, "the drag settles a later product in the foreground");
  assert.equal(env.links[centered].properties.get("--jar-blur"), undefined);
  assert.equal(env.context.scrollY, 0);
  assert.equal(env.progress.style.transform, "scaleX(0)");
  assert.equal(env.timers.size, 0);
  const dragClick = env.jarEvent("click", centered, { timeStamp: 150 });
  assert.equal(dragClick.defaultPrevented, true);
  assert.equal(dragClick.propagationStopped, true);
  assert.equal(env.jarEvent("click", centered, { timeStamp: 151, detail: 0 }).defaultPrevented, false, "keyboard activation remains available during the pointer-click guard");
  assert.equal(env.jarEvent("click", centered, { timeStamp: 152, target: element() }).defaultPrevented, false, "unrelated links are not intercepted");
  env.jarEvent("pointerdown", centered, { timeStamp: 160 });
  env.jarEvent("pointerup", centered, { timeStamp: 176 });
  assert.equal(env.jarEvent("click", centered, { timeStamp: 177 }).defaultPrevented, false, "a fresh click has normal product navigation");
  env.jarEvent("pointerdown", centered, { timeStamp: 200 });
  env.jarEvent("pointermove", centered, { clientX: 400, timeStamp: 224 });
  env.jarEvent("pointerup", centered, { clientX: 400, timeStamp: 240 });
  assert.equal(env.jarEvent("click", centered, { timeStamp: 250 }).defaultPrevented, true);
  assert.equal(env.jarEvent("click", centered, { timeStamp: 700 }).defaultPrevented, false, "the drag guard expires without needing another pointer-down");
  env.settle();
  env.dispose();
  assert.equal(env.section.listeners.size, 0);
  assert.equal(env.frames.size, 0);
});

test("vertical touch intent and small taps preserve page gestures without capturing or moving jars", async () => {
  const env = await mountHero({ products: sixProducts, compact: true });
  const opening = env.snapshot();
  env.jarEvent("pointerdown", 0, { pointerType: "touch", clientX: 180, clientY: 300 });
  const tapMovement = env.jarEvent("pointermove", 0, { pointerType: "touch", clientX: 177, clientY: 302, timeStamp: 116 });
  assert.equal(tapMovement.defaultPrevented, false);
  assert.equal(env.captures.size, 0);
  env.jarEvent("pointerup", 0, { pointerType: "touch", timeStamp: 132 });
  assert.equal(env.jarEvent("click", 0, { timeStamp: 133 }).defaultPrevented, false);
  env.jarEvent("pointerdown", 0, { pointerType: "touch", clientX: 180, clientY: 300, timeStamp: 200 });
  const vertical = env.jarEvent("pointermove", 0, { pointerType: "touch", clientX: 177, clientY: 350, timeStamp: 216 });
  const laterHorizontal = env.jarEvent("pointermove", 0, { pointerType: "touch", clientX: 70, clientY: 355, timeStamp: 232 });
  assert.equal(vertical.defaultPrevented, false);
  assert.equal(laterHorizontal.defaultPrevented, false, "once a gesture belongs to the page it must not be stolen back");
  env.jarEvent("pointerup", 0, { pointerType: "touch", timeStamp: 248 });
  env.settle();
  assert.equal(env.captures.size, 0);
  assert.deepEqual(env.snapshot(), opening);
  env.dispose();
});

test("interrupted drags release pointer capture and clear tooltip suppression through every lifecycle exit", async () => {
  const cases = {
    preference(env) { env.media.matches = true; env.media.emit("change"); },
    blur(env) { env.context.emit("blur"); },
    hidden(env) { env.context.document.hidden = true; env.context.document.emit("visibilitychange"); },
    cancelled(env) { env.jarEvent("pointercancel", 0, { timeStamp: 140 }); },
    lostCapture(env) { env.captures.clear(); env.section.emit("lostpointercapture", { pointerId: 1 }); },
    disposed(env) { env.dispose(); },
  };
  for (const [name, interrupt] of Object.entries(cases)) {
    const env = await mountHero({ products: sixProducts });
    env.jarEvent("pointerdown");
    env.jarEvent("pointermove", 0, { clientX: 60, timeStamp: 124 });
    assert.equal(env.captures.has(1), true);
    assert.equal(env.section.dataset.dragging, "true");
    interrupt(env);
    assert.equal(env.captures.size, 0, `${name} releases capture`);
    assert.equal(env.section.dataset.dragging, "false", `${name} allows the existing tooltip to work again`);
    env.jarEvent("pointermove", 0, { clientX: 40, pointerType: "touch", buttons: 0, timeStamp: 156 });
    assert.equal(env.captures.size, 0, "a stale gesture must not resume after cancellation");
    env.settle();
    env.dispose();
    assert.equal(env.frames.size, 0);
    assert.equal(env.section.listeners.size, 0);
    assert.equal(env.context.listeners.size, 0);
    assert.equal(env.context.document.listeners.size, 0);
    assert.equal(env.media.listeners.size, 0);
  }
});

test("pointer leave cancels an unstarted gesture but preserves a captured drag until release", async () => {
  const env = await mountHero({ products: sixProducts });
  env.jarEvent("pointerdown");
  env.jarEvent("pointerleave");
  const staleMove = env.jarEvent("pointermove", 0, { clientX: 60, pointerType: "touch", buttons: 0, timeStamp: 124 });
  assert.equal(staleMove.defaultPrevented, false);
  assert.equal(env.captures.size, 0);
  env.jarEvent("pointerdown", 0, { timeStamp: 200 });
  env.jarEvent("pointermove", 0, { clientX: 60, timeStamp: 224 });
  env.jarEvent("pointerleave");
  assert.equal(env.captures.has(1), true);
  assert.equal(env.section.dataset.dragging, "true");
  env.jarEvent("pointerup", 0, { clientX: 60, timeStamp: 240 });
  assert.equal(env.captures.size, 0);
  assert.equal(env.section.dataset.dragging, "false");
  env.settle();
  env.dispose();
});

test("horizontal wheel browsing is local while vertical scrolling, pinch zoom, and boundary input pass through", async () => {
  const env = await mountHero({ products: sixProducts });
  const opening = env.snapshot();
  for (const options of [
    { deltaX: 4, deltaY: 80 },
    { deltaX: 80, deltaY: 0, ctrlKey: true },
    { deltaX: 80, deltaY: 0, target: element() },
    { deltaX: -80, deltaY: 0 },
  ]) {
    const event = env.jarEvent("wheel", 0, { deltaMode: 0, ctrlKey: false, ...options });
    assert.equal(event.defaultPrevented, false);
    env.settle();
    assert.deepEqual(env.snapshot(), opening);
  }
  const horizontal = env.jarEvent("wheel", 0, { deltaX: 240, deltaY: 10, deltaMode: 0, ctrlKey: false });
  assert.equal(horizontal.defaultPrevented, true);
  env.settle();
  assert.ok(parseFloat(jarStyle(env.links[0]).left) < 50);
  assert.equal(env.context.scrollY, 0);
  assert.equal(env.surface.style.opacity, "1");
  env.scrollTo(0.56);
  const exiting = env.jarEvent("wheel", 0, { deltaX: 240, deltaY: 0, deltaMode: 0, ctrlKey: false });
  assert.equal(exiting.defaultPrevented, false, "the established page exit sequence owns input after jar browsing");
  env.dispose();
});

test("all six jars remain reachable by keyboard, including reduced and disabled motion", async () => {
  for (const options of [{}, { reduced: true }, { motion: { enabled: false } }]) {
    const env = await mountHero({ ...options, products: sixProducts, compact: true });
    const reduced = options.reduced || options.motion?.enabled === false;
    assert.equal(env.links.length, 6);
    assert.equal(env.links.at(-1).tabIndex, -1, "offscreen links must not remain in the tab sequence");
    for (let index = 0; index < 5; index += 1) {
      const key = env.jarEvent("keydown", index, { key: "ArrowRight" });
      assert.equal(key.defaultPrevented, true);
      env.settle();
      assert.equal(env.harness.focusedLink, env.links[index + 1]);
      assert.equal(env.harness.focusOptions.preventScroll, true);
      assert.equal(env.links[index + 1].tabIndex, 0);
      assert.equal(env.links[index + 1].style.visibility, "visible");
      assert.ok(Math.abs(parseFloat(jarStyle(env.links[index + 1]).left) - 50) < 0.01);
      if (reduced) for (const link of env.links) {
        assert.equal(link.properties.get("--jar-blur"), undefined);
        assert.equal(link.properties.get("--jar-brightness"), "1");
      }
    }
    assert.equal(env.counter.textContent, "06 / 06");
    for (const [from, key, destination] of [[5, "Home", 0], [0, "End", 5], [5, "ArrowLeft", 4]]) {
      env.jarEvent("keydown", from, { key }); env.settle();
      assert.equal(env.harness.focusedLink, env.links[destination]);
      assert.ok(Math.abs(parseFloat(jarStyle(env.links[destination]).left) - 50) < 0.01);
    }
    assert.equal(env.jarEvent("keydown", 4, { key: "Enter" }).defaultPrevented, false);
    assert.equal(env.jarEvent("click", 4, { detail: 0 }).defaultPrevented, false);
    assert.equal(env.context.scrollY, 0);
    assert.equal(env.progress.style.transform, "scaleX(0)");
    assert.equal(env.frames.size, 0);
    env.dispose();
  }
});

test("six-product browsing preserves the single-jar header, cover, and section handoff timing", async () => {
  for (const compact of [false, true]) {
    const baseline = await mountHero({ compact });
    const six = await mountHero({ compact, products: sixProducts });
    six.jarEvent("keydown", 0, { key: "End" }); six.settle();
    for (const progress of [0.24, 0.5, 0.56, 0.7, 0.8, 0.85, 0.9, 1, 0]) {
      baseline.scrollTo(progress); six.scrollTo(progress);
      assertNumericStyle(six.surface.style.opacity, baseline.surface.style.opacity);
      assert.equal(six.incoming.inert, baseline.incoming.inert);
      assert.equal(six.section.dataset.revealing, baseline.section.dataset.revealing);
      assertNumericStyle(six.seal.style.transform, baseline.seal.style.transform);
      assertNumericStyle(six.arc.style.opacity, baseline.arc.style.opacity);
      assertNumericStyle(six.header.properties.get("--hero-header-progress"), baseline.header.properties.get("--hero-header-progress"));
      assertNumericStyle(six.header.properties.get("--hero-header-surface"), baseline.header.properties.get("--hero-header-surface"));
    }
    assert.ok(Math.abs(parseFloat(jarStyle(six.links[0]).left) - 50) < 0.01, "page scrolling resets manual browsing without changing the opening Amla position");
    baseline.dispose(); six.dispose();
  }
});

test("fine vertical scroll increments reset manual browsing and return to the finite product sequence", async () => {
  const manual = await mountHero({ products: sixProducts });
  const reference = await mountHero({ products: sixProducts });
  manual.jarEvent("keydown", 0, { key: "End" }); manual.settle();
  assert.ok(Math.abs(parseFloat(jarStyle(manual.links.at(-1)).left) - 50) < 0.01);
  for (let step = 1; step <= 40; step += 1) {
    for (const env of [manual, reference]) {
      env.setScrollPhase(step * 0.001);
      env.context.emit("scroll");
      env.flush();
    }
  }
  manual.settle(); reference.settle();
  manual.links.forEach((link, index) => {
    for (const property of ["left", "top", "height", "width", "transform", "opacity", "visibility"]) assert.equal(link.style[property], reference.links[index].style[property], `${property} follows normal scroll for jar ${index}`);
    assert.equal(link.tabIndex, reference.links[index].tabIndex);
  });
  assert.equal(manual.counter.textContent, reference.counter.textContent);
  assert.equal(manual.surface.style.opacity, reference.surface.style.opacity);
  assert.equal(manual.header.properties.get("--hero-header-progress"), reference.header.properties.get("--hero-header-progress"));
  assert.equal(manual.header.properties.get("--hero-header-surface"), reference.header.properties.get("--hero-header-surface"));
  manual.dispose(); reference.dispose();
});

test("each six-product slot receives 558 physical scroll pixels at a 900px viewport", async () => {
  const env = await mountHero({ products: sixProducts });
  const { distance, sectionHeight } = env.components.getHeroScrollMetrics(900, 6);
  assert.equal(env.section.offsetHeight, sectionHeight);
  assert.equal(parseFloat(env.section.properties.get("--story-extra")), distance - 1215);
  for (let index = 0; index < 6; index += 1) {
    env.context.scrollY = index * 558;
    env.context.emit("scroll"); env.settle();
    assert.ok(Math.abs(parseFloat(jarStyle(env.links[index]).left) - 50) < 0.001, `product ${index + 1} should be centered after ${index * 558}px`);
    assert.equal(env.counter.textContent, `${String(index + 1).padStart(2, "0")} / 06`);
    assert.equal(env.surface.style.opacity, "1");
    assert.equal(env.header.properties.get("--hero-header-progress"), "0");
    assert.equal(env.header.properties.get("--hero-header-surface"), "0");
  }
  assert.equal(env.links.at(-1).style.opacity, "1", "the final jar remains clear before the established exit sequence starts");
  env.context.scrollY = distance + 1000;
  env.context.emit("scroll"); env.settle();
  assert.equal(env.surface.style.opacity, "0");
  assert.equal(env.header.properties.has("--hero-header-progress"), false, "the normal sticky header owns navigation after the entire hero is offscreen");
  env.dispose();
});

test("resizing recalculates responsive jars and story dimensions without a breakpoint jump", async () => {
  const env = await mountHero({ products: sixProducts });
  const jarHeight = () => parseFloat(jarStyle(env.links[0]).height) / 100 * env.surface.clientHeight;
  assert.ok(Math.abs(jarHeight() - 450) < 1e-10);
  env.resize(390, 844);
  assert.ok(Math.abs(jarHeight() - 218.4) < 1e-10, "phone sizing follows the smaller reference-width scale instead of retaining a desktop jar height");
  assert.ok(parseFloat(jarStyle(env.links[0]).width) < 390 * 0.75);
  assert.equal(env.surface.clientHeight, 844);
  assert.equal(env.section.offsetHeight, env.components.getHeroScrollMetrics(844, 6).sectionHeight);
  assert.equal(parseFloat(env.section.properties.get("--story-extra")), env.components.getHeroScrollMetrics(844, 6).distance - 844 * 1.35);
  assert.equal(jarStyle(env.links[0]).left, "50%");
  assert.equal(env.surface.style.opacity, "1");
  assert.equal(env.header.properties.get("--hero-header-progress"), "0");
  env.resize(679, 900);
  const before = env.snapshot();
  env.resize(681, 900);
  for (const index of [0, 1]) {
    for (const key of ["left", "top", "height"]) {
      const difference = Math.abs(parseFloat(jarStyle(env.links[index])[key]) - parseFloat(before[index][key]));
      assert.ok(difference < 0.2, `${key} must change smoothly through 680px`);
    }
  }
  env.resize(2560, 1440);
  assert.ok(Math.abs(jarHeight() - 640) < 1e-10, "large monitors use the product size cap");
  env.dispose();
  const disposed = env.links.map((link) => ({ ...link.style }));
  env.resize(390, 844);
  assert.deepEqual(env.links.map((link) => ({ ...link.style })), disposed, "the resize observer disconnects with the hero");
});

test("dragging and horizontal wheel input use the current responsive jar spacing after resize", async () => {
  const env = await mountHero({ products: sixProducts });
  for (const [width, height] of [[390, 844], [768, 1024], [1440, 900]]) {
    env.jarEvent("keydown", 0, { key: "Home" }); env.settle();
    env.resize(width, height);
    const slotPixels = env.components.getHeroLayout(width, height).spacing * width;
    env.jarEvent("pointerdown", 0, { clientX: width * 0.75, timeStamp: 100 });
    const drag = env.jarEvent("pointermove", 0, { clientX: width * 0.75 - slotPixels, timeStamp: 140 });
    assert.equal(drag.defaultPrevented, true);
    env.jarEvent("pointerup", 0, { clientX: width * 0.75 - slotPixels, timeStamp: 300 }); env.settle();
    assert.ok(Math.abs(parseFloat(jarStyle(env.links[1]).left) - 50) < 0.001, "a drag of one current slot centers the next product");
    env.jarEvent("keydown", 1, { key: "Home" }); env.settle();
    const wheel = env.jarEvent("wheel", 0, { deltaX: slotPixels, deltaY: 0, deltaMode: 0, ctrlKey: false }); env.settle();
    assert.equal(wheel.defaultPrevented, true);
    assert.ok(Math.abs(parseFloat(jarStyle(env.links[1]).left) - 50) < 0.001, "wheel browsing uses the same responsive spacing as dragging");
    assert.equal(env.context.scrollY, 0);
    assert.equal(env.header.properties.get("--hero-header-progress"), "0");
  }
  env.dispose();
});

test("scrolling to the end exits every jar and holds the completed scene without wrapping", async () => {
  const env = await mountHero();
  env.scrollTo(1);
  const ending = env.snapshot();
  ending.forEach((style, index) => {
    assert.ok(parseFloat(style.top) + parseFloat(style.height) / 2 < 0);
    assert.equal(style.opacity, "0");
    assert.equal(env.links[index].tabIndex, -1);
    assert.equal(env.links[index].style.visibility, "hidden");
  });
  assert.equal(env.arc.style.opacity, "0");
  assert.equal(env.progress.style.transform, "scaleX(1)");
  assert.match(env.seal.style.transform, /scale\([2-9]/);
  env.scrollTo(3);
  assert.deepEqual(env.snapshot(), ending);
  env.dispose();
});

test("reduced motion and disabled global motion keep the story static during scroll and hover", async () => {
  for (const options of [{ reduced: true }, { motion: { enabled: false } }]) {
    const env = await mountHero(options);
    const opening = env.snapshot();
    assert.equal(env.section.dataset.reducedMotion, "true");
    env.scrollTo(1);
    env.context.emit("pointermove", { pointerType: "mouse", clientX: 1440, clientY: 900 });
    env.settle();
    assert.deepEqual(env.snapshot(), opening);
    assert.equal(env.progress.style.transform, "scaleX(0)");
    env.dispose();
  }
});

test("cursor motion honors hero, global, intensity, and fine-pointer settings", async () => {
  for (const options of [{ settings: { cursorMotion: false } }, { motion: { cursor: false } }, { motion: { intensity: 0 } }, { compact: true }]) {
    const env = await mountHero(options);
    const opening = env.snapshot();
    env.context.emit("pointermove", { pointerType: "mouse", clientX: 1440, clientY: 900 });
    env.settle();
    assert.deepEqual(env.snapshot(), opening);
    env.dispose();
  }
  const env = await mountHero();
  const opening = env.snapshot();
  env.context.emit("pointermove", { pointerType: "touch", clientX: 1440, clientY: 900 });
  env.settle();
  assert.deepEqual(env.snapshot(), opening, "touch should not apply decorative hover");
  env.context.emit("pointermove", { pointerType: "mouse", clientX: 1440, clientY: 900 });
  env.settle();
  assert.ok(parseFloat(env.snapshot()[0].left) > parseFloat(opening[0].left));
  assert.ok(parseFloat(env.snapshot()[0].top) > parseFloat(opening[0].top));
  env.context.emit("pointerout", { relatedTarget: null });
  env.settle();
  assert.ok(Math.abs(parseFloat(env.snapshot()[0].left) - parseFloat(opening[0].left)) < 0.01);
  env.dispose();
});

test("cursor movement over empty space and the fixed header gently follows across the whole viewport", async () => {
  const env = await mountHero({ products: sixProducts });
  const opening = env.snapshot();
  const blank = element();
  assert.equal(env.context.listenerOptions.get("pointermove").passive, true, "decorative tracking must not intercept page gestures");
  assert.equal(env.section.listenerOptions.get("pointermove").passive, false, "only local horizontal dragging may consume input");
  const state = () => ({ progress: env.progress.style.transform, opacity: env.surface.style.opacity, header: [...env.header.properties], inert: env.incoming.inert });
  const initialState = state();
  env.context.emit("pointermove", { target: blank, pointerType: "mouse", buttons: 0, clientX: 1440, clientY: 900 });
  assert.equal(env.frames.size, 1);
  env.flush();
  const intermediateX = parseFloat(jarStyle(env.links[0]).left);
  assert.ok(intermediateX > parseFloat(opening[0].left));
  env.settle();
  const right = env.snapshot();
  assert.ok(intermediateX < parseFloat(right[0].left), "cursor follow should visibly damp through intermediate positions");
  assert.deepEqual(state(), initialState, "decorative motion must not alter page progress or the header handoff");
  env.section.emit("pointerleave");
  env.context.emit("pointerout", { relatedTarget: env.header }); env.settle();
  assert.deepEqual(env.snapshot(), right, "crossing into the fixed header must not reset the jar position");
  env.context.emit("pointermove", { target: env.header, pointerType: "mouse", buttons: 0, clientX: 0, clientY: 0 });
  env.flush();
  const reverseX = parseFloat(jarStyle(env.links[0]).left);
  assert.ok(reverseX < parseFloat(right[0].left));
  env.settle();
  const left = env.snapshot();
  assert.ok(reverseX > parseFloat(left[0].left), "the reverse direction also damps smoothly");
  assert.ok(parseFloat(left[0].left) < parseFloat(opening[0].left));
  assert.ok(parseFloat(left[0].top) < parseFloat(opening[0].top));
  left.forEach((style, index) => {
    const horizontalPixels = (parseFloat(right[index].left) - parseFloat(style.left)) / 100 * env.section.clientWidth;
    const verticalPixels = (parseFloat(right[index].top) - parseFloat(style.top)) / 100 * env.surface.clientHeight;
    assert.ok(horizontalPixels > 0 && horizontalPixels <= 64.000001);
    assert.ok(verticalPixels > 0 && verticalPixels <= 44.000001);
  });
  assert.deepEqual(state(), initialState);
  env.context.emit("pointerout", { relatedTarget: null }); env.flush();
  assert.ok(parseFloat(jarStyle(env.links[0]).left) > parseFloat(left[0].left));
  env.settle();
  assert.deepEqual(env.snapshot(), opening, "leaving the viewport should settle the jars at their original positions");
  env.scrollTo(0.8);
  const revealingState = state();
  env.context.emit("pointermove", { target: env.header, pointerType: "mouse", buttons: 0, clientX: 1440, clientY: 0 }); env.settle();
  assert.deepEqual(state(), revealingState, "cursor movement cannot advance the partially revealed header");
  env.dispose();
  assert.equal(env.context.listeners.size, 0);
  assert.equal(env.context.listenerOptions.size, 0);
  assert.equal(env.frames.size, 0);
});

test("window cursor tracking ignores held buttons, touch, coarse pointers, and disabled motion", async () => {
  for (const options of [{}, { compact: true }, { reduced: true }, { motion: { enabled: false } }, { settings: { cursorMotion: false } }, { motion: { cursor: false } }]) {
    const env = await mountHero({ ...options, products: sixProducts });
    const opening = env.snapshot();
    const blockedByPreference = Object.keys(options).length > 0;
    for (const pointer of blockedByPreference ? [{ pointerType: "mouse", buttons: 0 }] : [{ pointerType: "mouse", buttons: 1 }, { pointerType: "touch", buttons: 0 }, { pointerType: "pen", buttons: 0 }]) {
      env.context.emit("pointermove", { target: env.header, clientX: 1440, clientY: 900, ...pointer });
      assert.equal(env.frames.size, 0);
      assert.deepEqual(env.snapshot(), opening);
    }
    if (!blockedByPreference) {
      env.jarEvent("pointerdown");
      env.context.emit("pointermove", { target: env.header, pointerType: "mouse", buttons: 0, clientX: 1440, clientY: 900 });
      assert.equal(env.frames.size, 0, "an in-progress local gesture owns the pointer even before its drag threshold");
      assert.deepEqual(env.snapshot(), opening);
      env.jarEvent("pointerup");
    }
    env.dispose();
  }
});

test("cursor tracking pauses offscreen and while hidden, clears on blur, and removes its pending work on cleanup", async () => {
  const env = await mountHero({ products: sixProducts });
  const opening = env.snapshot();
  const move = () => env.context.emit("pointermove", { target: env.header, pointerType: "mouse", buttons: 0, clientX: 1440, clientY: 900 });
  move(); env.settle();
  assert.notDeepEqual(env.snapshot(), opening);
  env.context.emit("blur"); env.settle();
  assert.deepEqual(env.snapshot(), opening);
  move(); env.flush();
  assert.equal(env.frames.size, 1);
  env.context.document.hidden = true;
  env.context.document.emit("visibilitychange");
  assert.equal(env.frames.size, 0);
  move();
  assert.equal(env.frames.size, 0, "hidden documents must not schedule pointer frames");
  env.context.document.hidden = false;
  env.context.document.emit("visibilitychange"); env.settle();
  assert.deepEqual(env.snapshot(), opening);
  move(); env.flush();
  env.context.scrollY = env.section.offsetHeight + 1;
  env.intersect(env.section, false);
  assert.equal(env.frames.size, 0);
  assert.ok(env.snapshot().every((style) => style.opacity === "0"), "offscreen settling completes the finite outgoing story");
  move();
  assert.equal(env.frames.size, 0, "an offscreen hero must not respond to header movement");
  env.context.scrollY = 0;
  env.intersect(env.section, true); env.settle();
  move(); env.flush();
  assert.notDeepEqual(env.snapshot(), opening, "tracking resumes when the hero reenters view");
  env.scrollTo(0.9);
  move();
  assert.equal(env.frames.size, 0, "the completed outgoing jars stop reacting during the lower hero");
  env.scrollTo(0);
  move();
  assert.equal(env.frames.size, 1);
  env.dispose();
  assert.equal(env.frames.size, 0);
  assert.equal(env.context.listeners.size, 0);
  assert.equal(env.context.document.listeners.size, 0);
  assert.equal(env.section.listeners.size, 0);
  assert.equal(env.media.listeners.size, 0);
  move();
  assert.equal(env.frames.size, 0);
});

test("changing reduced-motion preference resets the story and unmount releases its resources", async () => {
  const env = await mountHero();
  env.scrollTo(0.5);
  env.media.matches = true;
  env.media.emit("change");
  env.settle();
  assert.equal(env.section.dataset.reducedMotion, "true");
  assert.equal(env.progress.style.transform, "scaleX(0)");
  env.dispose();
  assert.equal(env.frames.size, 0);
  assert.equal(env.context.listeners.size, 0);
  assert.equal(env.context.document.listeners.size, 0);
  assert.equal(env.section.listeners.size, 0);
  assert.equal(env.media.listeners.size, 0);
});

test("the handoff synchronizes incoming arrival geometry with responsive height and catalog size", async () => {
  for (const products of [[sixProducts[0]], sixProducts.slice(0, 2), sixProducts]) {
    const env = await mountHero({ products });
    for (const [width, height] of [[320, 568], [390, 844], [768, 1024], [1440, 900], [2560, 1440]]) {
      env.resize(width, height);
      const handoff = env.components.getHeroHandoffMetrics(height, env.links.length);
      assert.equal(env.incoming.dataset.arrival, "true");
      assert.equal(env.section.properties.get("--handoff-overlap"), `calc(var(--stage-height) + ${handoff.lead}px)`);
      assert.equal(parseFloat(env.incoming.properties.get("--arrival-runway")), handoff.runway);
      assert.equal(parseFloat(env.incoming.properties.get("--arrival-lead")), handoff.lead);
      assert.ok(Math.abs(env.section.offsetHeight - handoff.overlap - handoff.start) < 1e-9, "the second section arrives at the start of the crossfade");
      env.scrollTo(0.85);
      const duringReveal = [...env.incoming.properties];
      env.scrollTo(1);
      env.scrollTo(0);
      assert.deepEqual([...env.incoming.properties], duringReveal, "forward and reverse scrolling must not move the runway or shift document layout");
    }
    env.dispose();
    assert.equal(env.incoming.dataset.arrival, undefined);
    for (const property of ["--arrival-runway", "--arrival-lead"]) assert.equal(env.incoming.properties.has(property), false);
    assert.equal(env.section.properties.has("--handoff-overlap"), false);
  }
});

test("arrival pinning is disabled for reduced motion and restored with current dimensions", async () => {
  const assertNormalFlow = (env) => {
    assert.equal(env.incoming.dataset.arrival, "false");
    assert.equal(env.section.dataset.reducedMotion, "true");
    assert.equal(env.section.offsetHeight, env.surface.clientHeight, "reduced motion uses ordinary section height");
    const handoff = env.components.getHeroHandoffMetrics(env.surface.clientHeight, env.links.length);
    assert.equal(parseFloat(env.incoming.properties.get("--arrival-runway")), handoff.runway, "inactive metrics stay current if the preference is later restored");
    assert.equal(env.incoming.inert, false);
  };
  for (const options of [{ reduced: true }, { motion: { enabled: false } }]) {
    const env = await mountHero({ ...options, products: sixProducts });
    assertNormalFlow(env);
    env.resize(390, 844);
    assertNormalFlow(env);
    env.dispose();
  }
  const env = await mountHero({ products: sixProducts });
  env.scrollTo(0.85);
  env.media.matches = true;
  env.media.emit("change"); env.settle();
  assertNormalFlow(env);
  env.resize(390, 844);
  assertNormalFlow(env);
  env.media.matches = false;
  env.media.emit("change"); env.settle();
  const handoff = env.components.getHeroHandoffMetrics(844, 6);
  assert.equal(env.incoming.dataset.arrival, "true");
  assert.equal(parseFloat(env.incoming.properties.get("--arrival-runway")), handoff.runway);
  assert.equal(env.section.properties.get("--handoff-overlap"), `calc(var(--stage-height) + ${handoff.lead}px)`);
  env.dispose();
});

test("a missing following hero never creates arrival overlap", async () => {
  const env = await mountHero({ products: sixProducts, noIncoming: true });
  assert.equal(env.section.dataset.handoff, "false");
  assert.equal(env.section.properties.has("--handoff-overlap"), false);
  env.resize(390, 844);
  assert.equal(env.section.properties.has("--handoff-overlap"), false);
  env.scrollTo(1);
  assert.equal(env.surface.style.opacity, "1");
  env.dispose();
});

test("the handoff crossfades into the next hero and releases its interaction on reveal", async () => {
  const env = await mountHero();
  assert.equal(env.section.dataset.handoff, "true");
  assert.equal(env.surface.clientHeight, 900);
  assert.equal(env.surface.style.opacity, "1");
  assert.equal(env.incoming.inert, true);
  env.scrollTo(0.85);
  assert.ok(Number(env.surface.style.opacity) > 0 && Number(env.surface.style.opacity) < 1);
  assert.equal(env.section.dataset.revealing, "true");
  assert.equal(env.surface.inert, true);
  assert.equal(env.surface.style.pointerEvents, "none");
  assert.equal(env.incoming.inert, false);
  env.scrollTo(1);
  assert.equal(env.surface.style.opacity, "0");
  env.scrollTo(0.5);
  assert.equal(env.surface.style.opacity, "1");
  assert.equal(env.surface.inert, false);
  assert.equal(env.incoming.inert, true);
  env.media.matches = true;
  env.media.emit("change");
  env.settle();
  assert.equal(env.incoming.inert, false, "reduced motion uses normal section flow");
  assert.equal(env.surface.style.opacity, "1");
  env.dispose();
  assert.equal(env.incoming.inert, false);
  assert.equal(env.section.dataset.handoff, undefined);
});

test("the header morph follows the same scroll frame on desktop and mobile and reverses with scroll", async () => {
  for (const compact of [false, true]) {
    const env = await mountHero({ compact });
    assert.equal(env.header.dataset.heroMotion, "true");
    assert.equal(env.header.properties.get("--hero-header-progress"), "0");
    env.scrollTo(0.7);
    let previous = 0;
    let partialFrames = 0;
    for (let frame = 0; frame <= 45; frame += 1) {
      env.setScrollPhase(0.72 + frame / 45 * 0.18);
      env.context.emit("scroll");
      env.flush();
      const progress = Number(env.header.properties.get("--hero-header-progress"));
      assert.ok(Math.abs(progress - (1 - Number(env.surface.style.opacity))) < 1e-12, "header size and outgoing opacity must share the same scroll frame");
      assert.ok(progress >= previous && progress <= 1);
      if (progress > 0 && progress < 1) partialFrames += 1;
      previous = progress;
    }
    assert.ok(partialFrames > 5, "the header should visibly morph through intermediate states");
    env.scrollTo(1);
    assert.equal(env.header.properties.get("--hero-header-progress"), "1");
    env.scrollTo(0);
    assert.equal(env.header.properties.get("--hero-header-progress"), "0");
    assert.equal(env.header.properties.get("--hero-header-surface"), "0");
    env.scrollTo(0.85);
    assert.ok(Number(env.header.properties.get("--hero-header-progress")) > 0);
    env.dispose();
    assert.equal(env.header.dataset.heroMotion, undefined);
    assert.equal(env.header.properties.has("--hero-header-progress"), false);
    assert.equal(env.header.properties.has("--hero-header-surface"), false);
  }
});

test("Lenis-managed hero progress follows the current page position without a second easing delay", async () => {
  for (const compact of [false, true]) {
    const env = await mountHero({ compact });
    env.context.document.documentElement = { classList: { contains: (name) => name === "lenis" } };
    for (const phase of [0.85, 0.3]) {
      env.setScrollPhase(phase);
      env.context.emit("scroll");
      env.flush();
      assert.ok(Math.abs(Number(env.progress.style.transform.slice(7, -1)) - phase) < 1e-12,
        "hero must track the Lenis position in its next animation frame, including reverse scroll");
      assert.ok(Math.abs(Number(env.header.properties.get("--hero-header-progress")) - (1 - Number(env.surface.style.opacity))) < 1e-12);
    }
    env.dispose();
    const native = await mountHero({ compact });
    native.setScrollPhase(0.85);
    native.context.emit("scroll");
    native.flush();
    const firstFrame = Number(native.progress.style.transform.slice(7, -1));
    assert.ok(Math.abs(firstFrame - 0.85) < 1e-12, "native touch also stays aligned with the sticky handoff");
    native.dispose();
  }
});

test("the header backdrop appears during the green expansion before the next hero starts revealing", async () => {
  const env = await mountHero();
  assert.equal(env.header.properties.get("--hero-header-surface"), "0");
  env.scrollTo(0.56);
  const backdrop = Number(env.header.properties.get("--hero-header-surface"));
  assert.ok(backdrop > 0 && backdrop < 1, "the cream backdrop should fade in while the green cover expands");
  assert.equal(env.header.properties.get("--hero-header-progress"), "0");
  env.scrollTo(0.62);
  assert.equal(env.section.dataset.covered, "true");
  assert.equal(env.header.properties.get("--hero-header-surface"), "1", "the backdrop reaches its full opacity before the green screen reaches navigation");
  assert.equal(env.surface.style.opacity, "1", "navigation is protected before the section crossfade starts");
  assert.equal(env.header.properties.get("--hero-header-progress"), "0");
  env.dispose();
});

test("a fast jump past the hero releases header overrides before a pending frame and restores them on reentry", async () => {
  const env = await mountHero();
  assert.equal(env.header.properties.get("--hero-header-progress"), "0");
  env.setScrollPhase(0.85);
  env.context.emit("scroll");
  assert.equal(env.frames.size, 1);
  env.context.scrollY = env.section.offsetHeight + env.surface.clientHeight;
  env.context.emit("scroll");
  assert.equal(env.frames.size, 0, "a jump past the hero cancels a pending scrub frame before the observer catches up");
  env.intersect(env.section, false);
  assert.equal(env.frames.size, 0);
  assert.equal(env.header.properties.has("--hero-header-progress"), false, "the compact header fallback cannot remain overridden by stale opening progress");
  assert.equal(env.header.properties.has("--hero-header-surface"), false);
  assert.equal(env.surface.style.opacity, "0", "a skipped final frame must still finish the outgoing handoff");
  assert.equal(env.surface.inert, true);
  assert.equal(env.incoming.inert, false, "jumping past the story must leave the incoming hero interactive");
  assert.equal(env.section.dataset.revealing, "true", "the incoming animation gate must receive the completed handoff");
  env.context.emit("scroll"); env.flush();
  assert.equal(env.frames.size, 0, "an offscreen hero does not restart its animation");
  assert.equal(env.header.properties.has("--hero-header-progress"), false);
  env.setScrollPhase(0.85);
  env.intersect(env.section, true);
  assert.equal(env.frames.size, 1);
  env.flush();
  assert.equal(env.header.dataset.heroMotion, "true");
  assert.ok(env.header.properties.has("--hero-header-progress"));
  assert.ok(Math.abs(Number(env.header.properties.get("--hero-header-progress")) - (1 - Number(env.surface.style.opacity))) < 1e-12);
  env.settle();
  const progress = Number(env.header.properties.get("--hero-header-progress"));
  assert.ok(progress > 0 && progress < 1, "reentry restores the current partially revealed header");
  env.scrollTo(0);
  assert.equal(env.header.properties.get("--hero-header-progress"), "0");
  assert.equal(env.surface.style.opacity, "1");
  assert.equal(env.surface.inert, false);
  assert.equal(env.incoming.inert, true);
  assert.equal(env.section.dataset.revealing, "false");
  env.dispose();
});

test("returning through the full page restores the opening jars even before a delayed intersection notification", async () => {
  for (const options of [{}, { products: sixProducts }, { products: sixProducts, compact: true }, { products: sixProducts, reduced: true }]) {
    const env = await mountHero(options);
    const opening = env.snapshot();
    env.scrollTo(1);
    env.context.scrollY = env.section.offsetHeight + 8000;
    env.context.emit("scroll"); env.intersect(env.section, false); env.settle();
    for (const distance of [6000, 3000, 1000]) {
      env.context.scrollY = env.section.offsetHeight + distance;
      env.context.emit("scroll"); env.flush();
      assert.equal(env.frames.size, 0, "the inactive part of the return journey must not animate");
    }
    for (const phase of [0.95, 0.75, 0.4, 0.1, 0]) {
      env.setScrollPhase(phase);
      env.context.emit("scroll"); env.settle();
    }
    assert.deepEqual(env.snapshot(), opening, "scrolling back to the top restores every opening image without waiting for a queued observer callback");
    assert.equal(env.surface.style.opacity, "1");
    assert.equal(env.surface.inert, false);
    assert.equal(env.surface.style.pointerEvents, "auto");
    assert.equal(env.incoming.inert, !options.reduced);
    assert.equal(env.section.dataset.revealing, "false");
    assert.equal(env.links[0].style.visibility, "visible");
    assert.equal(env.links[0].tabIndex, 0);
    assert.equal(env.frames.size, 0);
    env.intersectBatch(env.section, [false, true]);
    env.settle();
    if (!options.reduced && !options.compact) {
      env.context.emit("pointermove", { pointerType: "mouse", buttons: 0, clientX: 1440, clientY: 900 });
      assert.equal(env.frames.size, 1, "the restored hero remains active after batched leave and enter events");
      env.settle();
    }
    env.dispose();
  }
});

test("a long-running page can leave the hero and return without poisoning jar positions during its timestamp reset", async () => {
  for (const products of [[{ ...amla, heroEnabled: true }], sixProducts]) {
    const env = await mountHero({ products });
    const opening = env.snapshot();
    env.advanceTime(180000);
    env.scrollTo(0.8);
    assert.ok(Number(env.surface.style.opacity) > 0 && Number(env.surface.style.opacity) < 1);
    env.context.scrollY = env.section.offsetHeight + 8000;
    env.context.emit("scroll"); env.intersect(env.section, false);
    for (const style of env.snapshot()) {
      for (const property of ["left", "top", "transform", "height", "width", "opacity"]) {
        assert.doesNotMatch(style[property], /NaN|Infinity/, `${property} must stay finite when a late animation frame settles without a timestamp`);
      }
    }
    assert.equal(env.frames.size, 0);
    for (const phase of [0.95, 0.8, 0.5, 0.25, 0]) env.scrollTo(phase);
    assert.deepEqual(env.snapshot(), opening);
    assert.equal(env.links[0].style.visibility, "visible");
    assert.equal(env.surface.inert, false);
    assert.equal(env.incoming.inert, true);
    env.context.emit("pointermove", { pointerType: "mouse", buttons: 0, clientX: 1440, clientY: 900 }); env.settle();
    assert.ok(Number.isFinite(parseFloat(jarStyle(env.links[0]).left)) && parseFloat(jarStyle(env.links[0]).left) > 50, "cursor following remains usable after the return");
    env.dispose();
  }
});

test("invalid pointer coordinates cannot contaminate finite jar positions", async () => {
  const env = await mountHero({ products: sixProducts });
  const opening = env.snapshot();
  for (const coordinates of [{ clientX: Number.NaN, clientY: 400 }, { clientX: 700, clientY: Infinity }, { clientX: undefined, clientY: 400 }]) {
    env.context.emit("pointermove", { pointerType: "mouse", buttons: 0, ...coordinates });
    assert.equal(env.frames.size, 0);
    assert.deepEqual(env.snapshot(), opening);
  }
  env.context.emit("pointermove", { pointerType: "mouse", buttons: 0, clientX: 1440, clientY: 900 }); env.settle();
  assert.ok(parseFloat(jarStyle(env.links[0]).left) > 50);
  env.dispose();
});

test("the curved motto stays attached to the cover throughout scroll and its reverse", async () => {
  const env = await mountHero({ products: sixProducts });
  for (const phase of [0, 0.2, 0.4, 0.56, 0.7, 0.85, 1, 0.7, 0.4, 0]) {
    env.scrollTo(phase);
    assert.equal(env.arc.style.transform, env.seal.style.transform);
    assert.ok(Number(env.arc.style.opacity) >= 0 && Number(env.arc.style.opacity) <= 1);
  }
  assert.equal(env.arc.style.opacity, "1");
  env.dispose();
});

test("history restoration replaces a stale animation token and remeasures the hero before revealing its opening", async () => {
  const env = await mountHero({ products: sixProducts });
  const opening = env.snapshot();
  env.scrollTo(1);
  env.setScrollPhase(0.8); env.context.emit("scroll");
  assert.equal(env.frames.size, 1);
  env.frames.clear(); // A frozen page can discard work without running its callback.
  env.section.documentTop = 32;
  env.context.scrollY = 0;
  env.context.emit("pageshow", { persisted: true });
  assert.equal(env.frames.size, 1, "restoration must replace, rather than trust, the pre-freeze pending token");
  env.settle();
  assert.deepEqual(env.snapshot(), opening);
  assert.equal(env.surface.inert, false);
  assert.equal(env.incoming.inert, true);
  env.context.scrollY = 32;
  env.context.emit("scroll"); env.settle();
  assert.deepEqual(env.snapshot(), opening, "the actual section start is remeasured after layout restoration");
  env.dispose();
  assert.equal(env.context.listeners.has("pageshow"), false);
  assert.equal(env.frames.size, 0);
});

test("restoring a hidden tab at the top restarts an offscreen hero and restores its interactions", async () => {
  const env = await mountHero({ products: sixProducts });
  const opening = env.snapshot();
  env.context.scrollY = env.section.offsetHeight + 6000;
  env.context.emit("scroll"); env.intersect(env.section, false);
  assert.equal(env.surface.style.opacity, "0");
  env.context.document.hidden = true;
  env.context.document.emit("visibilitychange");
  env.context.scrollY = 0;
  assert.equal(env.frames.size, 0);
  env.context.document.hidden = false;
  env.context.document.emit("visibilitychange");
  assert.equal(env.frames.size, 1);
  env.settle();
  assert.deepEqual(env.snapshot(), opening);
  assert.equal(env.surface.style.opacity, "1");
  assert.equal(env.surface.inert, false);
  assert.equal(env.incoming.inert, true);
  env.jarEvent("keydown", 0, { key: "ArrowRight" }); env.settle();
  assert.equal(env.harness.focusedLink, env.links[1]);
  assert.equal(env.frames.size, 0);
  env.dispose();
});

test("reduced and disabled motion release header scrub overrides, including after a preference change", async () => {
  for (const options of [{ reduced: true }, { motion: { enabled: false } }]) {
    const env = await mountHero(options);
    env.scrollTo(1);
    assert.equal(env.header.dataset.heroMotion, "false");
    assert.equal(env.header.properties.has("--hero-header-progress"), false);
    assert.equal(env.header.properties.has("--hero-header-surface"), false);
    env.dispose();
  }
  const env = await mountHero();
  env.scrollTo(0.85);
  assert.ok(Number(env.header.properties.get("--hero-header-progress")) > 0);
  env.media.matches = true;
  env.media.emit("change");
  env.settle();
  assert.equal(env.header.dataset.heroMotion, "false");
  assert.equal(env.header.properties.has("--hero-header-progress"), false);
  assert.equal(env.header.properties.has("--hero-header-surface"), false);
  env.media.matches = false;
  env.media.emit("change");
  env.settle();
  assert.equal(env.header.dataset.heroMotion, "true");
  assert.ok(Number(env.header.properties.get("--hero-header-progress")) > 0);
  env.dispose();
});

test("a standalone hero never fades into a missing following hero", async () => {
  const env = await mountHero({ noIncoming: true });
  env.scrollTo(1);
  assert.equal(env.section.dataset.handoff, "false");
  assert.equal(env.surface.style.opacity, "1");
  assert.equal(env.surface.inert, false);
  env.dispose();
});

test("the discover cue stays usable while browsing and leaves with the outgoing hero", async () => {
  const env = await mountHero({ products: sixProducts, compact: true, height: 844 });
  for (const phase of [0, 0.12, 0.3, 0.48, 0.66]) {
    env.scrollTo(phase);
    assert.equal(env.cue.style.opacity, "1", `guidance remains visible at phase ${phase}`);
    assert.equal(env.cue.style.visibility, "visible");
    assert.equal(env.cue.style.pointerEvents, "auto");
    assert.equal(env.cue.tabIndex, 0);
  }
  env.scrollTo(0.7);
  assert.ok(Number(env.cue.style.opacity) > 0 && Number(env.cue.style.opacity) < 1, "guidance fades during the final handoff");
  env.scrollTo(0.8);
  assert.equal(env.cue.style.opacity, "0");
  assert.equal(env.cue.style.visibility, "hidden");
  assert.equal(env.cue.style.pointerEvents, "none");
  assert.equal(env.cue.tabIndex, -1, "the outgoing cue must not remain in keyboard navigation");
  env.scrollTo(0.3);
  assert.equal(env.cue.style.opacity, "1", "returning to the story restores guidance");
  assert.equal(env.cue.tabIndex, 0);
  env.dispose();
});

test("the discover cue lands on the fully revealed following hero with native motion preferences", async () => {
  for (const options of [{}, { products: sixProducts, compact: true, height: 844 }, { reduced: true }, { motion: { enabled: false } }]) {
    const env = await mountHero(options);
    env.section.documentTop = 120;
    env.context.scrollY = 300;
    let prevented = false;
    const cue = all(env.tree).find((node) => node.props?.className === "scrollCue");
    cue.props.onClick({ preventDefault() { prevented = true; } });
    const reduced = options.reduced || options.motion?.enabled === false;
    const distance = env.components.getHeroScrollMetrics(env.surface.clientHeight, env.links.length).distance;
    assert.equal(prevented, true);
    assert.equal(env.harness.scrollRequest.behavior, reduced ? "instant" : "smooth");
    assert.equal(env.harness.scrollRequest.top, env.section.documentTop + (reduced ? env.section.offsetHeight : distance));
    if (!reduced) {
      const handoff = env.components.getHeroHandoffMetrics(env.surface.clientHeight, env.links.length);
      assert.ok(distance >= handoff.revealEnd && distance < handoff.end, "landing completes the reveal while retaining arrival room");
      env.context.scrollY = env.harness.scrollRequest.top;
      env.context.emit("scroll");
      env.settle();
      assert.equal(env.surface.style.opacity, "0");
      assert.equal(env.incoming.inert, false);
    }
    env.dispose();
  }
});

function mountModel(motion = {}, reduced = false, props = {}, initial = {}) {
  const env = environment("model", motion, reduced);
  if (initial.status) env.harness.values.set(0, { url: "/jar.glb", status: initial.status });
  if (initial.visible !== undefined) env.harness.values.set(1, initial.visible);
  if (initial.pageVisible !== undefined) env.harness.pageVisible = initial.pageVisible;
  const attributes = new Map(), stageAttributes = new Map(), styles = new Map();
  const viewer = eventTarget({ loaded: true, toggleAttribute: (key, value) => attributes.set(key, value), setAttribute: (key, value) => attributes.set(key, value) });
  const stage = {
    style: { setProperty: (key, value) => styles.set(key, value) },
    setAttribute: (key, value) => stageAttributes.set(key, value),
    removeAttribute: (key) => stageAttributes.delete(key),
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100 }),
  };
  env.harness.refs = [viewer, stage];
  const render = () => {
    env.harness.stateIndex = 0; env.harness.refIndex = 0; env.harness.effects = [];
    return env.components.ProductModel({ model: { url: "/jar.glb", altText: "Jar" }, settings: defaults, ...props });
  };
  const tree = render();
  const cleanups = env.harness.effects.map((effect) => effect());
  env.flush();
  return {
    ...env, tree, viewer, stage, attributes, stageAttributes, styles, render,
    move: (event = {}) => tree.props.onPointerMove({ pointerType: "mouse", buttons: 0, clientX: 100, clientY: 100, currentTarget: stage, ...event }),
    dispose: () => cleanups.forEach((cleanup) => cleanup?.()),
  };
}

function renderModel(motion = {}, reduced = false, props = {}) {
  const fixture = mountModel(motion, reduced, props);
  fixture.move();
  fixture.flush();
  return fixture;
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

test("showcase keeps the product facing forward and exposes a floating pause control", () => {
  const env = mountModel({}, false, { presentation: "showcase", cameraDistancePercent: 90 });
  const viewer = all(env.tree).find((node) => node.type === "model-viewer");
  assert.equal(env.attributes.get("auto-rotate"), false);
  assert.equal(viewer.props["camera-orbit"], "0deg 90deg 90%");
  assert.ok(Number(viewer.props["interpolation-decay"]) > 50, "showcase should damp camera changes more softly than the vendor default");
  assert.ok(Number(viewer.props["interpolation-decay"]) <= 200, "the camera must remain responsive");
  assert.ok(Object.hasOwn(viewer.props, "camera-controls"), "manual inspection remains available");
  const floating = all(env.tree).find((node) => node.props?.["data-floating"] === true);
  assert.equal(floating.props["data-floating-running"], true);
  const pause = all(env.tree).find((node) => node.type === "button");
  assert.equal(pause.props["aria-label"], "Pause product floating");
  pause.props.onClick();
  const paused = env.render();
  assert.equal(all(paused).find((node) => node.props?.["data-floating"] === true).props["data-floating-running"], false);
  assert.equal(all(paused).find((node) => node.type === "button").props["aria-label"], "Resume product floating");
  assert.equal(env.frames.size, 0, "idle showcase must not schedule an animation loop");
  env.dispose();
});

test("showcase hover clamps extreme pointer positions, lifts the model and stops scheduling frames", () => {
  const env = mountModel({ intensity: 1.5 }, false, { presentation: "showcase", cameraDistancePercent: 90 });
  for (const [clientX, clientY] of [[-1000, -1000], [1000, 1000], [50, 50]]) {
    env.move({ clientX, clientY });
    env.flush();
    const [yaw, elevation, distance] = env.attributes.get("camera-orbit").split(" ").map(parseFloat);
    assert.ok(Math.abs(yaw) <= 21 && elevation >= 79.5 && elevation <= 100.5, "hover must stay within a readable front-facing orbit");
    assert.equal(distance, 90, "hover does not zoom through the model");
    assert.ok(Math.abs(parseFloat(env.styles.get("--model-x"))) <= 10.5);
    assert.ok(parseFloat(env.styles.get("--model-y")) <= -9 && parseFloat(env.styles.get("--model-y")) >= -18, "hover always lifts, without a large vertical jump");
    assert.ok(Math.abs(parseFloat(env.styles.get("--model-roll"))) <= 2.5);
    assert.ok(Number(env.styles.get("--model-scale")) > 1 && Number(env.styles.get("--model-scale")) < 1.06);
    assert.equal(env.stageAttributes.get("data-hovered"), "true");
    assert.equal(env.attributes.get("auto-rotate"), false);
    assert.equal(env.frames.size, 0, "vendor interpolation handles settling without an application frame loop");
  }
  env.dispose();
});

test("the selected near-viewport model starts eagerly without waiting for its poster", () => {
  const env = mountModel({}, false, { presentation: "showcase", poster: image, preload: true, eager: true }, { status: "loading", visible: false });
  assert.equal(env.harness.deferredCalls.at(-1).enabled, true);
  assert.equal(env.harness.deferredCalls.at(-1).delay, 0);
  assert.equal(all(env.tree).filter((node) => node.type === "model-viewer").length, 1);
  assert.equal(all(env.tree).find((node) => node.type === "model-viewer").props.loading, "eager");
  assert.ok(all(env.tree).some((node) => node.type === "img" && node.props.src === image.url));
  assert.equal(all(env.tree).find((node) => node.props?.["data-floating"] !== undefined).props["data-floating-running"], false);
  env.dispose();
  for (const [props, initial] of [
    [{}, { visible: false }],
    [{ preload: true, enabled: false }, { visible: false }],
    [{ preload: true }, { visible: false, pageVisible: false }],
  ]) {
    const inactive = mountModel({}, false, { poster: image, ...props }, { status: "loading", ...initial });
    assert.ok(!all(inactive.tree).some((node) => node.type === "model-viewer"));
    assert.ok(!text(inactive.tree).includes("Loading 3D"));
    inactive.dispose();
  }
});

test("model loading keeps the poster until a rendered frame is ready and reports real progress", () => {
  const env = mountModel({}, false, { poster: image }, { status: "loading" });
  assert.equal(env.viewer.loaded, true, "the vendor can mark loaded before it renders");
  assert.equal(env.render().props["data-status"], "loading", "loaded property alone must not reveal an unrendered model");
  for (const totalProgress of [0.42, 0.2, NaN, Infinity]) env.viewer.emit("progress", { detail: { totalProgress } });
  let tree = env.render();
  assert.ok(all(tree).some((node) => node.props?.style?.transform === "scaleX(0.42)"), "progress is finite and never runs backwards");
  env.viewer.emit("progress", { detail: { totalProgress: 1 } });
  tree = env.render();
  assert.ok(text(tree).includes("Preparing 3D view"));
  assert.equal(tree.props["data-status"], "loading", "100% network/processing progress does not substitute for load");
  const viewerBefore = all(tree).find((node) => node.type === "model-viewer");
  assert.equal(viewerBefore.props.style.opacity, 0);
  assert.equal(viewerBefore.props.inert, true);
  env.viewer.emit("load");
  tree = env.render();
  assert.equal(tree.props["data-status"], "ready");
  const poster = all(tree).find((node) => node.props?.className === "posterLayer");
  assert.ok(poster, "poster stays mounted for the crossfade");
  assert.equal(poster.props["aria-hidden"], true);
  assert.equal(all(tree).find((node) => node.type === "model-viewer").props.style.opacity, 1);
  assert.equal(env.timers.size, 0, "successful load releases the failure timeout");
  env.dispose();
  assert.equal(env.viewer.listeners.size, 0);
});

test("model failure retains the photo and a late load cannot revive a failed attempt", () => {
  const env = mountModel({}, false, { poster: image }, { status: "loading" });
  env.viewer.emit("progress", { detail: { totalProgress: 0.8 } });
  env.viewer.emit("error", { detail: { type: "loadfailure" } });
  env.viewer.emit("load");
  let tree = env.render();
  assert.equal(tree.props["data-status"], "error");
  assert.ok(all(tree).some((node) => node.type === "img"));
  assert.ok(!all(tree).some((node) => node.type === "model-viewer"));
  all(tree).find((node) => node.type === "button" && text(node) === "Retry 3D view").props.onClick();
  tree = env.render();
  assert.equal(tree.props["data-status"], "loading");
  assert.ok(all(tree).some((node) => node.props?.style?.transform === "scaleX(0)"));
  assert.equal(env.harness.values.get(5), 1);
  env.dispose();
});

test("a real renderer context-loss error after load restores the product photograph", () => {
  const env = mountModel({}, false, { poster: image }, { status: "loading" });
  env.viewer.emit("load");
  env.viewer.emit("error", { detail: { type: "webglcontextlost" } });
  const tree = env.render();
  assert.equal(env.harness.contextLost, true);
  assert.equal(tree.props["data-status"], "error");
  assert.equal(all(tree).find((node) => node.props?.className === "posterLayer").props["aria-hidden"], false);
  assert.ok(!all(tree).some((node) => node.type === "model-viewer"));
  env.dispose();
});

test("floating respects motion settings, loading and visibility, and pauses for model interaction", () => {
  for (const options of [
    { motion: { enabled: false } }, { motion: { intensity: 0 } }, { reduced: true },
    { props: { paused: true } }, { initial: { visible: false }, props: { preload: true } },
    { initial: { pageVisible: false } }, { initial: { status: "loading" } },
  ]) {
    const env = mountModel(options.motion, options.reduced, { presentation: "showcase", ...options.props }, options.initial);
    assert.ok(!all(env.tree).some((node) => node.props?.["data-floating-running"] === true));
    env.dispose();
  }
  const env = mountModel({ cursor: false }, false, { presentation: "showcase" });
  assert.equal(all(env.tree).find((node) => node.props?.["data-floating"] === true).props["data-floating-running"], true,
    "floating remains independent from cursor decoration on touch screens");
  env.tree.props.onPointerDown();
  assert.equal(env.stageAttributes.get("data-interacting"), "true");
  env.tree.props.onPointerUp();
  assert.equal(env.stageAttributes.has("data-interacting"), false);
  env.tree.props.onPointerDown();
  env.tree.props.onPointerCancel();
  assert.equal(env.stageAttributes.has("data-interacting"), false);
  env.dispose();
});

test("unmount cancels pending model startup and ignores events from the old viewer", () => {
  const env = mountModel({}, false, { poster: image }, { status: "loading" });
  const pendingLoad = env.viewer.listeners.get("load");
  const pendingTimeout = [...env.timers.values()][0];
  env.dispose();
  pendingLoad();
  pendingTimeout();
  assert.equal(env.harness.values.get(0).status, "loading");
  assert.equal(env.viewer.listeners.size, 0);
  assert.equal(env.timers.size, 0);
  assert.equal(env.frames.size, 0);
});

test("advancing model download progress extends the stall deadline even within one displayed percent", () => {
  const env = mountModel({}, false, { poster: image }, { status: "loading" });
  env.tickTimers(19000);
  env.viewer.emit("progress", { detail: { totalProgress: 0.4 } });
  env.tickTimers(19000);
  assert.equal(env.render().props["data-status"], "loading", "active slow downloads can exceed the original 20-second deadline");
  env.viewer.emit("progress", { detail: { totalProgress: 0.40001 } });
  env.tickTimers(19000);
  assert.equal(env.render().props["data-status"], "loading", "small raw progress advances count even when the displayed percent stays the same");
  env.tickTimers(2000);
  assert.equal(env.render().props["data-status"], "error", "20 seconds without a further advance still triggers the photo fallback");
  assert.equal(env.timers.size, 0);
  env.dispose();
});

test("repeated, regressive and invalid model progress cannot keep a stalled request alive", () => {
  for (const totalProgress of [0.4, 0.2, NaN, Infinity]) {
    const env = mountModel({}, false, { poster: image }, { status: "loading" });
    env.tickTimers(15000);
    env.viewer.emit("progress", { detail: { totalProgress: 0.4 } });
    env.tickTimers(19000);
    env.viewer.emit("progress", { detail: { totalProgress } });
    env.tickTimers(2000);
    assert.equal(env.render().props["data-status"], "error");
    assert.equal(env.timers.size, 0);
    env.dispose();
  }
});

test("a continuously progressing model still reaches the two-minute loading limit", () => {
  const env = mountModel({}, false, { poster: image }, { status: "loading" });
  for (let step = 1; step <= 6; step += 1) {
    env.tickTimers(19000);
    assert.equal(env.render().props["data-status"], "loading");
    env.viewer.emit("progress", { detail: { totalProgress: step / 10 } });
  }
  env.tickTimers(6000);
  const tree = env.render();
  assert.equal(tree.props["data-status"], "error");
  assert.ok(all(tree).some((node) => node.type === "img"));
  assert.equal(env.timers.size, 0);
  env.dispose();
});

test("model success, failure and unmount release both loading deadlines", () => {
  for (const outcome of ["load", "error", "unmount"]) {
    const env = mountModel({}, false, { poster: image }, { status: "loading" });
    assert.equal(env.timers.size, 2);
    env.viewer.emit("progress", { detail: { totalProgress: 0.5 } });
    assert.equal(env.timers.size, 2, "advancing progress replaces the stall timer instead of accumulating timers");
    if (outcome === "unmount") env.dispose();
    else env.viewer.emit(outcome, outcome === "error" ? { detail: { type: "loadfailure" } } : {});
    assert.equal(env.timers.size, 0);
    env.tickTimers(120000);
    assert.equal(env.render().props["data-status"], outcome === "load" ? "ready" : outcome === "error" ? "error" : "loading");
    if (outcome !== "unmount") env.dispose();
  }
});

test("showcase pointer leave and cancellation clear decoration and cancel stale hover updates", () => {
  for (const event of ["onPointerLeave", "onPointerCancel"]) {
    const env = renderModel({}, false, { presentation: "showcase", cameraDistancePercent: 90 });
    env.move({ clientX: 0, clientY: 0 });
    assert.equal(env.frames.size, 1);
    env.tree.props[event]();
    assert.equal(env.frames.size, 0);
    env.flush();
    assert.equal(env.stageAttributes.has("data-hovered"), false);
    for (const [property, value] of [["--model-x", "0px"], ["--model-y", "0px"], ["--model-roll", "0deg"], ["--model-scale", "1"], ["--model-glow-x", "50%"], ["--model-glow-y", "50%"]]) {
      assert.equal(env.styles.get(property), value, property + " returns to rest");
    }
    assert.equal(env.attributes.get("camera-orbit"), "0deg 90deg 90%");
    env.dispose();
  }
});

test("showcase hover yields to dragging until the pointer leaves and preserves the manually chosen angle", () => {
  const env = renderModel({}, false, { presentation: "showcase", cameraDistancePercent: 90 });
  env.move({ clientX: 0 });
  env.tree.props.onPointerDown();
  assert.equal(env.frames.size, 0, "starting a drag cancels a queued hover write");
  assert.equal(env.stageAttributes.has("data-hovered"), false);
  assert.equal(env.styles.get("--model-y"), "0px");
  env.viewer.setAttribute("camera-orbit", "55deg 102deg 90%");
  for (const buttons of [1, 0]) {
    env.move({ buttons, clientX: 0, clientY: 0 });
    env.flush();
    assert.equal(env.attributes.get("camera-orbit"), "55deg 102deg 90%", "hover must not override the native drag, including after button release");
  }
  env.tree.props.onPointerLeave();
  assert.equal(env.attributes.get("camera-orbit"), "55deg 102deg 90%", "leaving preserves a manually inspected angle");
  env.move();
  env.flush();
  assert.equal(env.stageAttributes.get("data-hovered"), "true");
  assert.notEqual(env.attributes.get("camera-orbit"), "55deg 102deg 90%", "a fresh hover can resume the showcase");
  env.dispose();
});

test("showcase hover respects pause, disabled and reduced motion, cursor settings, and touch input", () => {
  for (const options of [
    { motion: { enabled: false } }, { reduced: true }, { props: { paused: true } },
    { motion: { cursor: false } }, { motion: { intensity: 0 } },
    { props: { settings: { ...defaults, cursorMotion: false } } },
  ]) {
    const env = renderModel(options.motion, options.reduced, { presentation: "showcase", ...options.props });
    assert.equal(env.attributes.get("auto-rotate"), false);
    assert.equal(env.attributes.has("camera-orbit"), false);
    assert.equal(env.styles.size, 0);
    assert.equal(env.stageAttributes.has("data-hovered"), false);
    assert.equal(env.frames.size, 0);
    env.dispose();
  }
  const env = mountModel({}, false, { presentation: "showcase" });
  for (const event of [{ pointerType: "touch" }, { pointerType: "pen" }, { buttons: 1 }]) {
    env.move(event);
    env.flush();
    assert.equal(env.styles.size, 0);
    assert.equal(env.attributes.has("camera-orbit"), false);
  }
  env.dispose();
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
  env.harness.refs = [{ loaded: false, toggleAttribute() {}, addEventListener() {}, removeEventListener() {} }, { removeAttribute() {} }];
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
