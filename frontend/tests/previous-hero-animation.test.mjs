import test from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const hooks = `
const same = (a, b) => a && b && a.length === b.length && a.every((value, i) => Object.is(value, b[i]));
export function useState(initial) {
  const h = globalThis.harness, index = h.cursor++;
  if (!h.slots[index]) h.slots[index] = { value: typeof initial === 'function' ? initial() : initial };
  const slot = h.slots[index];
  return [slot.value, (next) => { slot.value = typeof next === 'function' ? next(slot.value) : next; }];
}
export function useRef(initial) {
  const h = globalThis.harness, index = h.cursor++;
  return h.slots[index] ??= { current: initial };
}
export function useMemo(fn, deps) {
  const h = globalThis.harness, index = h.cursor++, slot = h.slots[index];
  if (!slot || !same(slot.deps, deps)) h.slots[index] = { value: fn(), deps };
  return h.slots[index].value;
}
export const useCallback = (fn, deps) => useMemo(() => fn, deps);
export function useEffect(fn, deps) {
  const h = globalThis.harness, index = h.cursor++, slot = h.slots[index];
  if (!slot || !same(slot.deps, deps)) h.pending.push(() => {
    slot?.cleanup?.();
    h.slots[index] = { deps, cleanup: fn() };
  });
}
`;

const bundle = await build({
  stdin: {
    contents: 'export { PreviousProductHero } from "./src/widgets/home/previous-product-hero";',
    resolveDir: fileURLToPath(new URL("../", import.meta.url)),
  },
  bundle: true, platform: "node", format: "cjs", write: false, jsx: "automatic", metafile: true,
  plugins: [{ name: "previous-hero-environment", setup(build) {
    build.onResolve({ filter: /^(react|react\/jsx-runtime|next\/link)$/ }, ({ path }) => ({ path, namespace: "mock" }));
    build.onResolve({ filter: /store-provider|use-motion-preferences|use-deferred-media|use-webgl|media-image$|shery-background$|shery-poster$|hero-purchase$|product-model$/ }, ({ path }) => ({ path, namespace: "mock" }));
    build.onResolve({ filter: /\.module\.css$/ }, ({ path }) => ({ path, namespace: "css" }));
    build.onLoad({ filter: /.*/, namespace: "css" }, () => ({ contents: 'export default new Proxy({}, { get: (_, key) => String(key) });' }));
    build.onLoad({ filter: /.*/, namespace: "mock" }, ({ path }) => {
      if (path === "react") return { contents: hooks };
      if (path === "react/jsx-runtime") return { contents: 'export function jsx(type, props, key) { return typeof type === "function" ? type(props) : { type, props, key }; } export const jsxs = jsx; export const Fragment = "Fragment";' };
      if (path === "next/link") return { contents: 'export default (props) => ({ type: "a", props });' };
      if (path.includes("store-provider")) return { contents: 'export const useStore = () => globalThis.harness.store;' };
      if (path.includes("use-motion-preferences")) return { contents: 'export const useReducedMotion = () => globalThis.harness.reduced; export const usePageVisible = () => globalThis.harness.visible; export const useFinePointer = () => !globalThis.harness.compact; export const useCompactViewport = () => globalThis.harness.compact;' };
      if (path.includes("use-deferred-media")) return { contents: 'export const useDeferredMedia = (enabled) => enabled && globalThis.harness.effectsReady;' };
      if (path.includes("use-webgl")) return { contents: 'export const useWebGL = (enabled) => enabled && globalThis.harness.webgl;' };
      const name = path.includes("media-image") ? "MediaImage" : path.includes("shery-background") ? "SheryBackground" : path.includes("shery-poster") ? "SheryPoster" : path.includes("hero-purchase") ? "HeroPurchase" : "ProductModel";
      return { contents: `export const ${name} = (props) => ({ type: "${name === "MediaImage" ? "img" : name}", props });` };
    });
  } }],
});

const settings = { autoplay: true, intervalSeconds: 8, autoRotate: true, rotationSpeed: 20, cursorMotion: true, transition: "fade" };
const products = ["Amla", "Reetha", "Hibiscus"].map((name, index) => ({
  id: `p${index}`, slug: `${name.toLowerCase()}-powder`, name: `${name} Powder`, heroEnabled: true,
  heroModel: { url: `/${name}.glb`, altText: name },
  heroPoster: { url: `/${name}-poster.png`, altText: name, width: 600, height: 800 },
  heroBackground: { url: `/${name}-background.png`, altText: "", width: 1600, height: 1000 },
  featuredImage: { url: `/${name}-photo.png`, altText: name, width: 600, height: 800 },
  shortDescription: `${name} product description`, subtitle: `${name} ritual`, pricePaise: 24000,
  size: "250 g", benefits: ["Product benefit"], howTo: ["Follow pack directions"], ingredient: `${name} powder`,
}));

function all(node) {
  if (!node || typeof node !== "object") return [];
  return [node, ...[node.props?.children].flat(Infinity).flatMap(all)];
}

function eventTarget(properties = {}) {
  const listeners = new Map();
  return {
    ...properties, listeners,
    addEventListener(type, callback) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(callback);
    },
    removeEventListener(type, callback) {
      listeners.get(type)?.delete(callback);
      if (!listeners.get(type)?.size) listeners.delete(type);
    },
    dispatch(type, event = {}) { [...(listeners.get(type) ?? [])].forEach((callback) => callback(event)); },
  };
}

function environment(options = {}) {
  const frames = new Map(), timers = new Map(), observers = new Set(), mutations = new Set();
  const mediaNodes = new Map();
  const makeCanvas = () => {
    const canvas = eventTarget({ dataset: {}, paints: 0, getBoundingClientRect: () => ({ width: 390, height: 800 }) });
    canvas.ownerDocument = { createElement: makeCanvas };
    canvas.getContext = () => ({ canvas, drawImage() { canvas.paints++; }, fillRect() {}, createLinearGradient: () => ({ addColorStop() {} }) });
    return canvas;
  };
  const outgoing = options.outgoing ? {
    dataset: { ...options.outgoing },
    hasAttribute: (name) => name === "data-ritual-hero",
  } : null;
  let next = 0;
  const harness = {
    cursor: 0, slots: [], pending: [], reduced: Boolean(options.reduced), compact: Boolean(options.compact),
    visible: true, now: 1000, effectsReady: options.effectsReady !== false, webgl: options.webgl !== false,
    store: { content: { motionSettings: { enabled: true, cursor: true, intensity: 1, duration: 1, ...options.motion } } },
  };
  const context = eventTarget({
    harness, module: { exports: {} }, console, URL,
    Date: class extends Date { static now() { return harness.now; } },
    requestAnimationFrame: (callback) => { frames.set(++next, callback); return next; },
    cancelAnimationFrame: (id) => frames.delete(id),
    setTimeout: (callback, delay) => { timers.set(++next, { callback, delay, due: harness.now + delay }); return next; },
    clearTimeout: (id) => timers.delete(id),
    IntersectionObserver: class {
      constructor(callback, options) { this.callback = callback; this.options = options; }
      observe() { observers.add(this); }
      disconnect() { observers.delete(this); }
    },
    MutationObserver: class {
      constructor(callback) { this.callback = callback; }
      observe(target, options) { this.target = target; this.options = options; mutations.add(this); }
      disconnect() { mutations.delete(this); }
    },
    ResizeObserver: class { observe() {} disconnect() {} },
  });
  context.window = context;
  vm.createContext(context);
  vm.runInContext(bundle.outputFiles[0].text, context);
  const env = {
    harness, frames, timers, tree: null,
    render() {
      harness.cursor = 0; harness.pending = [];
      this.tree = context.module.exports.PreviousProductHero({ products: options.products ?? products, settings: { ...settings, ...options.settings } });
      const attach = (node, layerKey = "") => {
        if (!node || typeof node !== "object") return;
        if (node.key !== undefined) layerKey = node.key;
        if (node.props?.ref && typeof node.props.ref === "object") {
          node.props.ref.current ??= eventTarget({ complete: false, previousElementSibling: node.props.id === "previous-hero" ? outgoing : null });
        } else if (typeof node.props?.ref === "function") {
          const key = `${node.type}:${node.props.src ?? layerKey}`;
          if (!mediaNodes.has(key)) mediaNodes.set(key, node.type === "canvas" ? makeCanvas() : eventTarget({ complete: false, naturalWidth: 0, naturalHeight: 0 }));
          node.props.ref(mediaNodes.get(key));
        }
        [node.props?.children].flat(Infinity).forEach((child) => attach(child, layerKey));
      };
      attach(this.tree);
      harness.pending.forEach((effect) => effect());
      return this.tree;
    },
    load(url) {
      const image = all(this.tree).find((node) => node.type === "img" && node.props.src === url && node.props.onLoad);
      assert.ok(image, `expected a loading image for ${url}`);
      const element = mediaNodes.get(`img:${url}`);
      if (element) {
        element.complete = true; element.naturalWidth = 1600; element.naturalHeight = 1000;
        element.dispatch("load");
      }
      image.props.onLoad();
      this.render();
    },
    intersect(isIntersecting) {
      observers.forEach((observer) => { if (!observer.options?.rootMargin) observer.callback([{ isIntersecting }]); });
      this.render();
    },
    near(isIntersecting) {
      observers.forEach((observer) => { if (observer.options?.rootMargin === "100% 0px") observer.callback([{ isIntersecting }]); });
      this.render();
    },
    updateOutgoing(dataset) {
      assert.ok(outgoing, "this environment must have an outgoing hero");
      Object.assign(outgoing.dataset, dataset);
      const attributes = Object.keys(dataset).map((key) => `data-${key.replace(/[A-Z]/g, (character) => `-${character.toLowerCase()}`)}`);
      mutations.forEach((observer) => {
        if (observer.target === outgoing && observer.options.attributes && attributes.some((attribute) => !observer.options.attributeFilter || observer.options.attributeFilter.includes(attribute))) observer.callback();
      });
      this.render();
    },
    click(label) {
      const control = all(this.tree).find((node) => node.props?.["aria-label"] === label);
      assert.ok(control, `missing control: ${label}`);
      control.props.onClick();
      this.render();
    },
    flushFrames() {
      const pending = [...frames.values()]; frames.clear(); pending.forEach((callback) => callback());
      this.render();
    },
    advanceTime(milliseconds) {
      const until = harness.now + milliseconds;
      while (true) {
        const pending = [...timers].filter(([, timer]) => timer.due <= until).sort((a, b) => a[1].due - b[1].due)[0];
        if (!pending) break;
        const [id, timer] = pending;
        harness.now = timer.due;
        timers.delete(id);
        timer.callback();
        this.render();
      }
      harness.now = until;
    },
    dispatch(type, event) { context.dispatch(type, event); this.render(); },
    windowListeners: context.listeners,
    mutations,
    mediaNodes,
    dispose() { harness.slots.forEach((slot) => slot?.cleanup?.()); },
  };
  env.render();
  return env;
}

function ready(options = {}) {
  const env = environment(options);
  env.load(products[0].heroPoster.url);
  env.load(products[0].heroBackground.url);
  env.intersect(true);
  return env;
}

test("entrance animations wait until the lower hero has been seen and its images are ready", () => {
  const env = environment();
  assert.equal(env.tree.props["data-transition"], "none");
  env.load(products[0].heroPoster.url);
  env.load(products[0].heroBackground.url);
  assert.equal(env.tree.props["data-media-ready"], true);
  assert.equal(env.tree.props["data-transition"], "none", "loading below the fold must not consume the entrance animation");
  assert.equal(env.timers.size, 0);
  env.intersect(true);
  assert.equal(env.tree.props["data-transition"], "fade");
  for (const className of ["copy", "caption", "purchase", "productDetails"]) {
    assert.equal(all(env.tree).find((node) => node.props?.className === className).props["data-transition"], "fade");
  }
  const background = all(env.tree).find((node) => node.type === "SheryBackground");
  const poster = all(env.tree).find((node) => node.type === "SheryPoster");
  assert.ok(background && poster);
  assert.equal(background.props.duration, poster.props.duration);
  assert.equal(background.props.duration, 2800);
  assert.equal(env.tree.props.style["--hero-media-duration"], "2800ms");
  assert.equal(env.tree.props.style["--hero-content-duration"], "1300ms");
  assert.equal(background.props.active, true);
  assert.equal(poster.props.cursor, true);
  env.dispose();
});

test("intersection alone cannot animate a partially loaded slide", () => {
  const env = environment();
  env.intersect(true);
  env.load(products[0].heroPoster.url);
  assert.equal(env.tree.props["data-transition"], "none");
  assert.ok(!all(env.tree).some((node) => node.type === "SheryPoster"));
  env.load(products[0].heroBackground.url);
  assert.equal(env.tree.props["data-transition"], "fade");
  env.dispose();
});

test("the covered lower hero waits for the outgoing hero to reveal it and pauses again on scrollback", () => {
  const env = ready({ outgoing: { handoff: "true", reducedMotion: "false", revealing: "false" } });
  const viewer = () => all(env.tree).find((node) => node.type === "ProductModel");
  assert.equal(env.tree.props["data-media-ready"], true);
  assert.equal(env.tree.props["data-transition"], "none", "geometric intersection must not consume the covered entrance");
  assert.equal(env.timers.size, 0, "a covered slide cannot advance before it is revealed");
  assert.equal(viewer().props.paused, true);
  assert.ok(!all(env.tree).some((node) => ["SheryPoster", "SheryBackground"].includes(node.type)));

  env.updateOutgoing({ revealing: "true" });
  assert.equal(env.tree.props["data-transition"], "fade");
  assert.equal(env.timers.size, 1);
  assert.equal(viewer().props.paused, false);
  assert.ok(all(env.tree).some((node) => node.type === "SheryPoster" && node.props.active));
  env.harness.now += 2000;
  env.updateOutgoing({ revealing: "false" });
  assert.equal(env.timers.size, 0, "scrolling back into the covering hero pauses the carousel");
  assert.equal(viewer().props.paused, true);
  env.harness.now += 4000;
  env.updateOutgoing({ revealing: "true" });
  assert.equal(env.timers.size, 1);
  assert.equal([...env.timers.values()][0].delay, 7600, "time covered by the outgoing hero does not consume the slide duration");
  env.intersect(false);
  env.updateOutgoing({ revealing: "false" });
  env.updateOutgoing({ revealing: "true" });
  assert.equal(env.timers.size, 0, "a reveal signal cannot activate an offscreen lower hero");
  assert.equal(viewer().props.paused, true);
  env.dispose();
  assert.equal(env.mutations.size, 0, "unmount disconnects the handoff observer");
});

test("reduced motion and a disabled outgoing handoff preserve ordinary lower-hero visibility", () => {
  const env = ready({ reduced: true, outgoing: { handoff: "true", reducedMotion: "true", revealing: "false" } });
  assert.equal(all(env.tree).find((node) => node.type === "ProductModel").props.paused, false);
  assert.equal(env.tree.props["data-transition"], "none");
  assert.equal(env.timers.size, 0, "the reduced-motion preference still suppresses autoplay");
  env.dispose();

  for (const update of [{ reducedMotion: "true" }, { handoff: "false" }]) {
    const changing = ready({ outgoing: { handoff: "true", reducedMotion: "false", revealing: "false" } });
    assert.equal(all(changing.tree).find((node) => node.type === "ProductModel").props.paused, true);
    changing.updateOutgoing(update);
    assert.equal(all(changing.tree).find((node) => node.type === "ProductModel").props.paused, false);
    assert.equal(changing.tree.props["data-transition"], "fade");
    assert.equal(changing.timers.size, 1);
    changing.dispose();
  }
});

test("the original multi-product controls preserve product identity and wait for both target images", () => {
  const env = ready({ products: [...products, { ...products[0], id: "disabled", heroEnabled: false }] });
  for (const product of products) assert.ok(all(env.tree).some((node) => node.props?.["aria-label"] === `Show ${product.name}`));
  assert.equal(all(env.tree).filter((node) => node.props?.["aria-pressed"] !== undefined && node.props?.["aria-label"]?.startsWith("Show ")).length, 3);
  assert.ok(all(env.tree).some((node) => node.props?.["aria-label"] === "Previous featured product"));
  env.click("Next featured product");
  assert.equal(all(env.tree).find((node) => node.type === "HeroPurchase").props.slug, products[0].slug);
  env.load(products[1].heroPoster.url); env.flushFrames();
  assert.equal(all(env.tree).find((node) => node.type === "HeroPurchase").props.slug, products[0].slug);
  env.load(products[1].heroBackground.url); env.flushFrames();
  const purchase = all(env.tree).find((node) => node.type === "HeroPurchase");
  assert.equal(purchase.props.slug, products[1].slug);
  assert.equal(purchase.props.pricePaise, products[1].pricePaise);
  assert.equal(all(env.tree).find((node) => node.type === "SheryPoster").props.selected, 1);
  assert.ok(all(env.tree).some((node) => node.props?.href === `/shop/${products[1].slug}`));
  env.click(`Show ${products[2].name}`);
  env.load(products[2].heroPoster.url); env.load(products[2].heroBackground.url); env.flushFrames();
  assert.equal(all(env.tree).find((node) => node.type === "HeroPurchase").props.slug, products[2].slug);
  env.click("Next featured product"); env.flushFrames();
  assert.equal(all(env.tree).find((node) => node.type === "HeroPurchase").props.slug, products[0].slug);
  env.dispose();
});

test("reduced motion, disabled motion, and transition none suppress image effects without removing controls", () => {
  for (const options of [{ reduced: true }, { motion: { enabled: false } }, { settings: { transition: "none" } }]) {
    const env = ready(options);
    assert.equal(env.tree.props["data-transition"], "none");
    assert.ok(!all(env.tree).some((node) => ["SheryPoster", "SheryBackground"].includes(node.type)));
    assert.ok(all(env.tree).some((node) => node.props?.["aria-label"] === "Next featured product"));
    if (options.reduced || options.motion?.enabled === false) assert.equal(env.timers.size, 0);
    env.dispose();
  }
});

test("cursor preferences suppress poster interaction and mobile or unavailable WebGL keeps CSS transitions", () => {
  for (const options of [{ motion: { cursor: false } }, { motion: { intensity: 0 } }, { settings: { cursorMotion: false } }]) {
    const env = ready(options);
    assert.ok(!all(env.tree).some((node) => node.type === "SheryPoster"));
    assert.ok(all(env.tree).some((node) => node.type === "SheryBackground"));
    assert.equal(all(env.tree).find((node) => node.type === "HeroPurchase").props.cursorMotion, false);
    env.dispose();
  }
  for (const options of [{ compact: true }, { webgl: false }, { effectsReady: false }]) {
    const env = ready(options);
    assert.equal(env.tree.props["data-transition"], "fade");
    assert.ok(!all(env.tree).some((node) => ["SheryPoster", "SheryBackground"].includes(node.type)));
    env.dispose();
  }
});

test("autoplay pauses offscreen, while the tab is hidden, and when its pause control is used", () => {
  const env = ready();
  assert.equal(env.timers.size, 1);
  assert.equal([...env.timers.values()][0].delay, 9600);
  env.intersect(false);
  assert.equal(env.timers.size, 0);
  env.intersect(true);
  assert.equal(env.timers.size, 1);
  env.click("Pause slideshow");
  assert.equal(env.timers.size, 0);
  env.click("Resume slideshow");
  assert.equal(env.timers.size, 1);
  env.harness.visible = false; env.render();
  assert.equal(env.timers.size, 0);
  env.dispose();
});

test("hovering the showcase holds its slide without pausing cursor motion and resumes the remaining time on exit", () => {
  const env = ready();
  const slot = () => all(env.tree).find((node) => node.props?.className === "model");
  env.harness.now += 2000;
  slot().props.onPointerEnter({ pointerType: "touch" }); env.render();
  assert.equal(env.timers.size, 1, "touch does not latch the carousel into a hover pause");
  slot().props.onPointerEnter({ pointerType: "mouse" }); env.render();
  assert.equal(env.timers.size, 0);
  assert.equal(all(env.tree).find((node) => node.type === "ProductModel").props.paused, false, "cursor motion remains interactive while holding the slide");
  assert.equal(all(env.tree).find((node) => node.props?.className === "progress").props.style.animationPlayState, "paused");
  env.harness.now += 4000;
  slot().props.onPointerLeave(); env.render();
  assert.equal([...env.timers.values()][0].delay, 7600);
  env.dispose();
});

test("the restored 3D viewer occupies the original featured-product slot and follows the selected product", () => {
  const env = ready();
  const featured = all(env.tree).find((node) => node.type === "aside" && node.props.className === "featured");
  const slot = all(featured).find((node) => node.props?.className === "model");
  const model = all(slot).find((node) => node.type === "ProductModel");
  assert.ok(model, "the viewer belongs in the original featured-product column");
  assert.equal(all(env.tree).filter((node) => node.type === "ProductModel").length, 1);
  assert.equal(model.props.model.url, products[0].heroModel.url);
  assert.equal(model.props.poster.url, products[0].featuredImage.url);
  assert.equal(model.props.cameraDistancePercent, 95);
  assert.equal(model.props.presentation, "showcase");
  assert.equal(model.props.settings.rotationSpeed, 20);
  assert.equal(model.props.settings.autoRotate, true);
  assert.equal(model.props.settings.cursorMotion, true);
  assert.equal(model.props.paused, false);
  assert.equal(model.props.eager, true);
  env.click("Next featured product");
  env.load(products[1].heroPoster.url); env.load(products[1].heroBackground.url); env.flushFrames();
  assert.equal(all(env.tree).find((node) => node.type === "ProductModel").props.model.url, products[1].heroModel.url);
  assert.equal(all(env.tree).find((node) => node.type === "ProductModel").props.poster.url, products[1].featuredImage.url);
  env.intersect(false);
  assert.equal(all(env.tree).find((node) => node.type === "ProductModel").props.paused, true);
  env.intersect(true);
  env.click("Pause slideshow");
  assert.equal(all(env.tree).find((node) => node.type === "ProductModel").props.paused, true);
  env.click("Resume slideshow");
  assert.equal(all(env.tree).find((node) => node.type === "ProductModel").props.paused, false);
  env.dispose();

  const customized = ready({ settings: { autoRotate: false, rotationSpeed: 30, cursorMotion: false } });
  const configured = all(customized.tree).find((node) => node.type === "ProductModel");
  assert.equal(configured.props.settings.autoRotate, false);
  assert.equal(configured.props.settings.rotationSpeed, 30);
  assert.equal(configured.props.settings.cursorMotion, false);
  customized.dispose();
});

test("the current 3D model warms near the covered hero independently of slide-image readiness", () => {
  const env = environment({ outgoing: { handoff: "true", reducedMotion: "false", revealing: "false" } });
  const viewer = () => all(env.tree).find((node) => node.type === "ProductModel");
  const effectCount = () => all(env.tree).filter((node) => ["SheryPoster", "SheryBackground"].includes(node.type)).length;
  assert.equal(viewer().props.enabled, true);
  assert.equal(viewer().props.preload, false);
  assert.equal(viewer().props.paused, true);
  env.near(true);
  assert.equal(viewer().props.preload, true, "the selected model can warm before the first hero reveals it");
  assert.equal(viewer().props.paused, true, "preloading must not animate a covered viewer");
  assert.equal(all(env.tree).filter((node) => node.type === "ProductModel").length, 1, "no catalog-wide model prefetch");
  env.load(products[0].heroPoster.url);
  assert.equal(viewer().props.enabled, true);
  env.load(products[0].heroBackground.url);
  assert.equal(viewer().props.enabled, true);
  env.intersect(true);
  env.updateOutgoing({ revealing: "true" });
  assert.equal(effectCount(), 2);
  viewer().props.onLoadingChange(products[0].heroModel.url, true); env.render();
  assert.equal(effectCount(), 0, "shader initialization yields while the active model is loading");
  viewer().props.onLoadingChange(products[1].heroModel.url, false); env.render();
  assert.equal(effectCount(), 0, "another model finishing cannot clear the active loading state");
  viewer().props.onLoadingChange(products[0].heroModel.url, false); env.render();
  assert.equal(effectCount(), 2);
  assert.equal(env.tree.props["data-transition"], "fade");
  env.harness.visible = false; env.render();
  assert.equal(viewer().props.preload, false);
  env.dispose();
});

test("mobile 3D loading waits for the actual reveal instead of geometric proximity", () => {
  const env = environment({ compact: true, outgoing: { handoff: "true", reducedMotion: "false", revealing: "false" } });
  const viewer = () => all(env.tree).find((node) => node.type === "ProductModel");
  assert.equal(viewer().props.enabled, false);
  env.near(true);
  env.intersect(true);
  assert.equal(viewer().props.enabled, false, "an overlapping model's own observer cannot activate it through the cover");
  assert.equal(viewer().props.preload, false, "nearby hidden textures must not compete with opening jar swipes");
  assert.equal(viewer().props.paused, true);

  env.updateOutgoing({ revealing: "true" });
  assert.equal(viewer().props.enabled, true);
  assert.equal(viewer().props.preload, true, "the model can begin immediately when the scene is revealed");
  assert.equal(viewer().props.paused, false);
  assert.equal(viewer().props.eager, true);

  env.updateOutgoing({ revealing: "false" });
  assert.equal(viewer().props.enabled, false);
  assert.equal(viewer().props.preload, false);
  assert.equal(viewer().props.paused, true);
  env.updateOutgoing({ revealing: "true" });
  env.harness.visible = false; env.render();
  assert.equal(viewer().props.enabled, false);
  assert.equal(viewer().props.preload, false);
  env.harness.visible = true; env.render();
  assert.equal(viewer().props.enabled, true);
  env.intersect(false);
  assert.equal(viewer().props.enabled, false, "an offscreen scene does not request initial model activation");
  assert.equal(viewer().props.paused, true, "a model that has already warmed pauses instead of animating behind the cover");
  env.dispose();
});

test("mobile changes retain outgoing images until the incoming poster and edge canvas are ready", () => {
  const env = ready({ compact: true });
  env.flushFrames();
  const oldCanvas = env.mediaNodes.get("canvas:p0");
  assert.ok(oldCanvas.paints > 0, "the mobile backdrop keeps the edge-composite renderer");
  env.click("Next featured product");
  env.load(products[1].heroPoster.url);
  env.load(products[1].heroBackground.url);
  env.flushFrames();
  assert.equal(env.tree.props["data-media-transition"], "preparing");
  const layers = () => all(env.tree).filter((node) => node.props?.className === "mediaLayer");
  assert.equal(layers().filter((node) => node.props["data-layer"] === "outgoing").length, 2);
  assert.equal(layers().filter((node) => node.props["data-layer"] === "incoming").length, 2);
  assert.equal(env.mediaNodes.get("canvas:p0"), oldCanvas, "outgoing canvas is retained while the incoming source prepares");
  env.load(products[1].heroPoster.url);
  assert.equal(env.tree.props["data-media-transition"], "preparing");
  env.load(products[1].heroBackground.url);
  assert.equal(env.tree.props["data-media-transition"], "preparing", "decode must precede the canvas paint");
  env.flushFrames();
  assert.equal(env.tree.props["data-media-transition"], "running");
  assert.ok(env.mediaNodes.get("canvas:p1").paints > 0);
  assert.ok(!all(env.tree).some((node) => ["SheryPoster", "SheryBackground"].includes(node.type)), "phones do not gain extra WebGL contexts");
  assert.equal(all(env.tree).filter((node) => node.type === "ProductModel").length, 1);
  env.advanceTime(1000);
  assert.equal(env.tree.props["data-media-transition"], "running", "the slower reveal retains both products beyond the old transition duration");
  env.advanceTime(1881);
  assert.equal(env.tree.props["data-media-transition"], "idle");
  assert.equal(layers().length, 2, "completion releases the old background and poster");
  env.dispose();
  assert.equal(env.timers.size, 0);
  assert.equal(env.frames.size, 0);
});

test("mobile transition cancellation handles fast selection, visibility and motion preferences", () => {
  for (const stop of ["hidden", "offscreen", "reduced", "disabled"]) {
    const env = ready({ compact: true });
    env.flushFrames();
    env.click("Next featured product");
    env.load(products[1].heroPoster.url); env.load(products[1].heroBackground.url); env.flushFrames();
    const stalePoster = all(env.tree).find((node) => node.type === "img" && node.props.src === products[1].heroPoster.url);
    env.click(`Show ${products[2].name}`);
    env.load(products[2].heroPoster.url); env.load(products[2].heroBackground.url); env.flushFrames();
    assert.equal(all(env.tree).filter((node) => node.props?.className === "mediaLayer").length, 4, "fast changes keep at most two media pairs");
    stalePoster.props.onLoad(); env.render();
    assert.equal(env.tree.props["data-media-transition"], "preparing", "stale readiness cannot release the newer transition");
    if (stop === "hidden") env.harness.visible = false;
    else if (stop === "offscreen") env.intersect(false);
    else if (stop === "reduced") env.harness.reduced = true;
    else env.harness.store.content.motionSettings.enabled = false;
    env.render(); env.advanceTime(0);
    assert.equal(env.tree.props["data-media-transition"], "idle");
    assert.equal(all(env.tree).filter((node) => node.props?.className === "mediaLayer").length, 2);
    env.dispose();
    assert.equal(env.frames.size, 0);
    assert.equal(env.timers.size, 0);
  }
  const staticHero = ready({ compact: true, settings: { transition: "none" } });
  staticHero.click("Next featured product");
  staticHero.load(products[1].heroPoster.url); staticHero.load(products[1].heroBackground.url); staticHero.flushFrames();
  assert.equal(staticHero.tree.props["data-media-transition"], "idle");
  assert.equal(all(staticHero.tree).filter((node) => node.props?.className === "mediaLayer").length, 2);
  staticHero.dispose();
});

test("returning to a retained mobile poster does not require a second load event", () => {
  const env = ready({ compact: true });
  env.flushFrames();
  env.click("Next featured product");
  env.load(products[1].heroPoster.url); env.load(products[1].heroBackground.url); env.flushFrames();
  env.load(products[1].heroPoster.url); env.load(products[1].heroBackground.url); env.flushFrames();
  assert.equal(env.tree.props["data-media-transition"], "running");
  env.click(`Show ${products[0].name}`);
  env.flushFrames(); env.flushFrames();
  assert.equal(env.tree.props["data-media-transition"], "running", "the already-decoded retained poster can transition immediately after canvas preparation");
  assert.equal(all(env.tree).find((node) => node.type === "ProductModel").props.model.url, products[0].heroModel.url);
  env.advanceTime(2881);
  assert.equal(env.tree.props["data-media-transition"], "idle");
  env.dispose();
});

test("a slow model holds its slide and progress until load success or failure releases the remaining time", () => {
  // ProductModel reports loading=false for both its ready and error states.
  for (const completion of ["ready", "error"]) {
    const env = ready({ settings: { intervalSeconds: 3 } });
    const viewer = () => all(env.tree).find((node) => node.type === "ProductModel");
    const progress = () => all(env.tree).find((node) => node.props?.className === "progress");
    env.load(products[1].heroPoster.url);
    env.load(products[1].heroBackground.url);
    env.advanceTime(1000);
    viewer().props.onLoadingChange(products[0].heroModel.url, true); env.render();
    assert.equal(env.timers.size, 0);
    assert.equal(progress().props.style.animationPlayState, "paused");
    env.advanceTime(12000); env.flushFrames();
    assert.equal(viewer().props.model.url, products[0].heroModel.url, "a load longer than the interval must not unmount the viewer");
    assert.equal(env.frames.size, 0, "loading must not request a pending slide change");
    viewer().props.onLoadingChange(products[0].heroModel.url, false); env.render();
    assert.ok(Math.abs([...env.timers.values()][0].delay - 2600) < 0.001, `${completion} resumes the unconsumed slide time`);
    assert.equal(progress().props.style.animationPlayState, "running");
    env.advanceTime(2599); env.flushFrames();
    assert.equal(viewer().props.model.url, products[0].heroModel.url);
    env.advanceTime(1); env.flushFrames();
    assert.equal(viewer().props.model.url, products[1].heroModel.url);
    env.dispose();
  }
});

test("late model callbacks from a previous slide cannot replace the current loading state", () => {
  const env = ready();
  const viewer = () => all(env.tree).find((node) => node.type === "ProductModel");
  const previousCallback = viewer().props.onLoadingChange;
  previousCallback(products[0].heroModel.url, true); env.render();
  env.click("Next featured product");
  env.load(products[1].heroPoster.url); env.load(products[1].heroBackground.url); env.flushFrames();
  assert.equal(viewer().props.model.url, products[1].heroModel.url, "manual navigation remains available during loading");
  viewer().props.onLoadingChange(products[1].heroModel.url, true); env.render();
  for (const loading of [false, true, false]) {
    previousCallback(products[0].heroModel.url, loading); env.render();
    assert.equal(env.timers.size, 0, "old start/completion events must not release the active model's hold");
    assert.equal(all(env.tree).find((node) => node.props?.className === "progress").props.style.animationPlayState, "paused");
  }
  viewer().props.onLoadingChange(products[1].heroModel.url, false); env.render();
  assert.equal(env.timers.size, 1);
  previousCallback(products[0].heroModel.url, true); env.render();
  assert.equal(env.timers.size, 1, "a stale loading event must not pause an already ready current model");
  assert.equal(all(env.tree).find((node) => node.props?.className === "progress").props.style.animationPlayState, "running");
  env.dispose();
});

test("pointer, touch, and camera interaction pause the slideshow until release and remove release listeners", () => {
  const releases = ["pointerup", "pointercancel", "mouseup", "touchend", "touchcancel", "blur"];
  for (const [index, release] of releases.entries()) {
    const env = ready();
    const slot = all(env.tree).find((node) => node.props?.className === "model");
    slot.props.ref.current.dispatch("camera-change", { detail: { source: "none" } }); env.render();
    assert.equal(env.timers.size, 1, "programmatic camera changes keep autoplay running");
    env.harness.now += 2000;
    if (index === 0) slot.props.onPointerDown();
    else if (index === 1) slot.props.onMouseDown();
    else if (index === 2) slot.props.onTouchStart();
    else if (index === 3) slot.props.ref.current.dispatch("pointerdown");
    else if (index === 4) slot.props.ref.current.dispatch("touchstart");
    else slot.props.ref.current.dispatch("camera-change", { detail: { source: "user-interaction" } });
    env.render();
    assert.equal(env.timers.size, 0);
    assert.equal(all(env.tree).find((node) => node.props?.className === "progress").props.style.animationPlayState, "paused");
    slot.props.onPointerDown(); env.render();
    for (const type of releases) assert.equal(env.windowListeners.get(type)?.size, 1, "duplicate events do not attach duplicate handlers");
    env.harness.now += 4000;
    env.dispatch(release);
    assert.equal(env.timers.size, 1);
    assert.equal([...env.timers.values()][0].delay, 7600, "dragging preserves the remaining slide time");
    for (const type of releases) assert.equal(env.windowListeners.has(type), false);
    env.dispose();
  }
});
