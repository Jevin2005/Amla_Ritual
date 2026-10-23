import test from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const bundle = await build({
  stdin: {
    contents: 'export { ProductHero } from "./src/widgets/home/product-hero"; export * from "./src/widgets/home/hero-motion";',
    resolveDir: fileURLToPath(new URL("../", import.meta.url)),
  },
  bundle: true, platform: "node", format: "cjs", write: false, jsx: "automatic",
  plugins: [{ name: "hero-viewport-environment", setup(build) {
    build.onResolve({ filter: /^(react|react\/jsx-runtime|next\/link)$/ }, ({ path }) => ({ path, namespace: "mock" }));
    build.onResolve({ filter: /store-provider$|media-image$|page-scroll$|hero-discover-hint$/ }, ({ path }) => ({ path, namespace: "mock" }));
    build.onResolve({ filter: /\.module\.css$/ }, ({ path }) => ({ path, namespace: "mock" }));
    build.onLoad({ filter: /.*/, namespace: "mock" }, ({ path }) => {
      if (path === "react") return { contents: 'export const useRef = (initial) => ({ current: initial }); export const useMemo = (read) => read(); export const useEffect = (effect) => globalThis.harness.effects.push(effect);' };
      if (path === "react/jsx-runtime") return { contents: 'export const jsx = (type, props) => typeof type === "function" ? type(props) : ({ type, props }); export const jsxs = jsx;' };
      if (path === "next/link") return { contents: 'export default (props) => ({ type: "a", props });' };
      if (path.endsWith("store-provider")) return { contents: 'export const useStore = () => globalThis.harness.store;' };
      if (path.endsWith("page-scroll")) return { contents: 'export const scrollPageTo = (top, options) => { globalThis.harness.scrollCalls.push({ top, ...options }); globalThis.harness.onScroll?.(top); };' };
      if (path.endsWith("media-image")) return { contents: 'export const MediaImage = (props) => ({ type: "img", props });' };
      if (path.endsWith("hero-discover-hint")) return { contents: 'export const HeroDiscoverHint = () => null;' };
      return { contents: 'export default new Proxy({}, { get: (_, key) => String(key) });' };
    });
  } }],
});

const products = ["amla", "reetha", "indigo", "bhringraj", "hibiscus", "shikakai"].map((name, index) => ({
  id: name, slug: `${name}-powder`, name: `${name} Powder`, heroEnabled: true, heroOrder: index,
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

function style() {
  return {
    setProperty(name, value) { this[name] = String(value); },
    getPropertyValue(name) { return this[name] ?? ""; },
    removeProperty(name) { delete this[name]; },
  };
}

function mount(options = {}) {
  const viewport = { width: 390, height: 740, storyHeight: 740, ...options.viewport };
  const frames = new Map(), observers = new Set(), nodes = new Map();
  let nextFrame = 0, time = 0;
  const harness = {
    effects: [], scrollCalls: [],
    store: { content: { motionSettings: { enabled: !options.disabled, cursor: true, intensity: 1 } } },
  };
  const incoming = { dataset: {}, style: style(), inert: false, hasAttribute: (name) => name === "data-previous-hero" };
  const header = { dataset: {}, style: style() };
  const section = eventTarget({
    dataset: {}, style: style(), nextElementSibling: incoming,
    hasPointerCapture: () => false, releasePointerCapture() {}, setPointerCapture() {},
  });
  const surface = { dataset: {}, style: style(), inert: false };
  const reducedMotion = eventTarget({ matches: Boolean(options.reduced) });
  const finePointer = eventTarget({ matches: false });
  const document = eventTarget({
    hidden: false, querySelector: () => header,
    documentElement: { classList: { contains: (name) => name === "lenis" } },
  });
  const context = eventTarget({
    harness, document, console, performance: { now: () => time }, module: { exports: {} }, scrollY: 0, innerHeight: viewport.height,
    matchMedia: (query) => query.includes("prefers-reduced-motion") ? reducedMotion : finePointer,
    getComputedStyle: () => ({ minHeight: options.minHeight ?? `${viewport.storyHeight}px` }),
    requestAnimationFrame: (callback) => { frames.set(++nextFrame, callback); return nextFrame; },
    cancelAnimationFrame: (id) => frames.delete(id),
    IntersectionObserver: class {
      constructor(callback) { this.callback = callback; this.type = "intersection"; }
      observe(target) { this.target = target; observers.add(this); }
      disconnect() { observers.delete(this); }
    },
    ResizeObserver: class {
      constructor(callback) { this.callback = callback; this.type = "resize"; }
      observe(target) { this.target = target; observers.add(this); }
      disconnect() { observers.delete(this); }
    },
  });
  Object.defineProperties(section, {
    clientWidth: { get: () => viewport.width },
    offsetHeight: { get: () => viewport.height },
  });
  Object.defineProperties(surface, {
    clientWidth: { get: () => viewport.width },
    clientHeight: { get: () => viewport.height },
  });
  section.getBoundingClientRect = () => ({ top: -context.scrollY, bottom: 6000 - context.scrollY, width: viewport.width, height: 6000 });
  surface.getBoundingClientRect = () => ({ top: 0, left: 0, bottom: viewport.height, width: viewport.width, height: viewport.height });
  context.window = context;
  vm.createContext(context);
  vm.runInContext(bundle.outputFiles[0].text, context);
  const api = context.module.exports;
  const tree = api.ProductHero({ products, settings: { cursorMotion: true } });
  const descendants = all(tree);
  for (const node of descendants) {
    const ref = node.props?.ref;
    if (!ref) continue;
    const element = node.props["data-ritual-hero"] !== undefined ? section
      : node.props.className === "stage" ? surface : { dataset: {}, style: style() };
    Object.assign(element.style, node.props.style);
    if (typeof ref === "function") ref(element);
    else ref.current = element;
    nodes.set(node, element);
  }
  const cleanups = harness.effects.map((effect) => effect());
  const byClass = (name) => nodes.get(descendants.find((node) => node.props?.className === name));
  const cueNode = descendants.find((node) => node.props?.className === "scrollCue");
  const progressNode = descendants.find((node) => node.props?.className === "progress").props.children;
  const env = {
    api, viewport, context, document, harness, section, surface, incoming, header, frames, observers, reducedMotion, finePointer,
    seal: byClass("seal"), jar: byClass("product"), progress: nodes.get(progressNode),
    settle() {
      for (let i = 0; i < 240 && frames.size; i += 1) {
        time += 16.7;
        const pending = [...frames.values()];
        frames.clear();
        pending.forEach((callback) => callback(time));
      }
      assert.equal(frames.size, 0, "a stationary hero must finish its animation frames");
    },
    scroll(top) { context.scrollY = top; context.dispatch("scroll"); this.settle(); },
    resize(update, event = "observer") {
      Object.assign(viewport, update);
      context.innerHeight = viewport.height;
      if (event === "observer") observers.forEach((observer) => { if (observer.type === "resize") observer.callback([{ target: surface }]); });
      else context.dispatch("resize");
      this.settle();
    },
    cue() {
      let prevented = false;
      cueNode.props.onClick({ preventDefault() { prevented = true; } });
      assert.equal(prevented, true);
      return harness.scrollCalls.at(-1);
    },
    dispose() { cleanups.forEach((cleanup) => cleanup?.()); },
  };
  env.settle();
  return env;
}

function timing(env) {
  return {
    progress: env.progress.style.transform,
    reveal: env.surface.style.opacity,
    header: env.header.style.getPropertyValue("--hero-header-progress"),
    story: env.section.style.getPropertyValue("--story-extra"),
    lead: env.incoming.style.getPropertyValue("--arrival-lead"),
    runway: env.incoming.style.getPropertyValue("--arrival-runway"),
    destination: env.cue().top,
  };
}

test("collapsing and expanding phone toolbars resize the scene without retiming the story or arrival", () => {
  for (const phase of [0.28, 0.6, 0.8, 0.99]) {
    const env = mount();
    env.scroll(env.api.getHeroScrollOffset(phase, 740, products.length));
    const original = timing(env);
    const originalTop = env.section.style.getPropertyValue("--seal-top");
    const originalJarHeight = env.jar.style.height;
    const originalCover = env.seal.style.transform;
    assert.equal(original.destination, env.api.getHeroScrollMetrics(740, products.length).distance);
    env.resize({ height: 800 });
    assert.deepEqual(timing(env), original, `toolbar collapse must not change phase ${phase}`);
    assert.notEqual(env.section.style.getPropertyValue("--seal-top"), originalTop, "backdrop follows the larger visible area");
    assert.notEqual(env.jar.style.height, originalJarHeight, "jar proportions use the current visible height");
    if (phase > 0.5) assert.notEqual(env.seal.style.transform, originalCover, "the expanding seal covers the current viewport");
    env.resize({ height: 740 }, "window");
    assert.deepEqual(timing(env), original, "expanding the toolbar retraces the same story");
    assert.equal(env.section.style.getPropertyValue("--seal-top"), originalTop);
    assert.equal(env.jar.style.height, originalJarHeight);
    assert.equal(env.seal.style.transform, originalCover);
    env.dispose();
  }
});

test("orientation changes remeasure both viewport dimensions and the story anchor", () => {
  const env = mount();
  const portraitDestination = env.cue().top;
  env.scroll(350);
  const portraitWidth = env.jar.style.width;
  env.resize({ width: 844, height: 390, storyHeight: 390 }, "window");
  assert.equal(env.cue().top, env.api.getHeroScrollMetrics(390, products.length).distance);
  assert.notEqual(env.cue().top, portraitDestination);
  assert.notEqual(env.jar.style.width, portraitWidth);
  for (const value of [env.jar.style.top, env.jar.style.width, env.jar.style.height, env.seal.style.transform]) {
    assert.ok(!/NaN|Infinity|undefined/.test(value), `orientation produced invalid geometry: ${value}`);
  }
  env.resize({ width: 390, height: 740, storyHeight: 740 });
  assert.equal(env.cue().top, portraitDestination);
  assert.equal(env.jar.style.width, portraitWidth);
  env.dispose();
});

test("reduced or disabled motion retains an immediate next-section link after viewport changes", () => {
  for (const options of [{ reduced: true }, { disabled: true }]) {
    const env = mount(options);
    env.scroll(250);
    assert.equal(env.section.dataset.reducedMotion, "true");
    assert.equal(env.incoming.dataset.arrival, "false");
    assert.equal(env.incoming.inert, false);
    assert.equal(env.surface.style.opacity, "1");
    assert.equal(env.cue().top, 740);
    assert.equal(env.cue().immediate, true);
    env.resize({ height: 800 });
    assert.equal(env.cue().top, 800);
    assert.equal(env.cue().immediate, true);
    assert.equal(env.progress.style.transform, "scaleX(0)");
    env.dispose();
  }
});

test("unresolved minimum height falls back to the measured surface without invalid geometry", () => {
  const env = mount({ minHeight: "auto" });
  assert.equal(env.cue().top, env.api.getHeroScrollMetrics(740, products.length).distance);
  assert.ok(!/NaN|Infinity/.test(env.section.style.getPropertyValue("--story-extra")));
  env.dispose();
});

test("unmount cancels viewport work and restores the incoming hero and header", () => {
  const env = mount();
  env.context.scrollY = env.api.getHeroScrollOffset(0.8, 740, products.length);
  env.context.dispatch("scroll");
  assert.ok(env.frames.size > 0);
  env.dispose();
  assert.equal(env.frames.size, 0);
  assert.equal(env.observers.size, 0);
  for (const target of [env.context, env.document, env.section, env.reducedMotion, env.finePointer]) {
    assert.equal(target.listeners.size, 0, "all event listeners are released");
  }
  assert.equal(env.incoming.inert, false);
  assert.equal(env.incoming.dataset.arrival, undefined);
  assert.equal(env.incoming.style.getPropertyValue("--arrival-lead"), "");
  assert.equal(env.incoming.style.getPropertyValue("--arrival-runway"), "");
  assert.equal(env.header.dataset.heroMotion, undefined);
  assert.equal(env.header.style.getPropertyValue("--hero-header-progress"), "");
  assert.equal(env.surface.inert, false);
  assert.equal(env.surface.style.opacity, "1");
});

test("fast wheel and touch arrivals cancel overshoot through the page scroller before rendering", () => {
  for (const type of ["wheel", "touchstart"]) {
    const env = mount();
    const arrival = env.api.getHeroHandoffMetrics(740, products.length);
    const destination = env.api.getHeroScrollMetrics(740, products.length).distance;
    env.harness.onScroll = (top) => { env.context.scrollY = top; };
    env.context.dispatch(type, { type, deltaY: 5000, deltaX: 0 });
    env.context.scrollY = arrival.end + 2000;
    env.context.dispatch("scroll");
    assert.equal(env.context.scrollY, destination);
    assert.equal(env.harness.scrollCalls.at(-1).immediate, true, "cancel pending momentum through the same scroll owner");
    env.settle();
    assert.equal(env.surface.style.opacity, "0", "no opaque first hero remains over the arrival");
    assert.equal(env.incoming.inert, false);
    env.context.dispatch("click");
    env.scroll(arrival.end + 500);
    assert.equal(env.context.scrollY, arrival.end + 500, "explicit navigation must be free to leave");
    env.dispose();
  }
});

test("zoom, sideways gestures, explicit End navigation and reduced motion bypass the arrival guard", () => {
  for (const event of [
    { type: "wheel", deltaY: 5000, deltaX: 0, ctrlKey: true },
    { type: "wheel", deltaY: 100, deltaX: 1000 },
    { type: "keydown", key: "End" },
  ]) {
    const env = mount();
    env.context.dispatch(event.type, event);
    env.scroll(9000);
    assert.equal(env.harness.scrollCalls.length, 0);
    env.dispose();
  }
  for (const options of [{ reduced: true }, { disabled: true }]) {
    const env = mount(options);
    env.context.dispatch("wheel", { type: "wheel", deltaY: 5000, deltaX: 0 });
    env.scroll(9000);
    assert.equal(env.harness.scrollCalls.length, 0);
    env.dispose();
  }
});

test("scroll animation moves jars without rewriting their layout dimensions", () => {
  const env = mount();
  const opening = { ...env.jar.style };
  env.scroll(420);
  for (const key of ["left", "top", "height", "width"]) assert.equal(env.jar.style[key], opening[key]);
  assert.notEqual(env.jar.style.transform, opening.transform);
  assert.match(env.jar.style.transform, /translate3d.*scale/);
  env.dispose();
});
