import test from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

// Run the real provider and gallery with persistent hook state, effect dependency
// changes/cleanup, context propagation, and a deterministic browser clock.
const hooks = `
const readHarness = () => globalThis.harness;
const changed = (left, right) => !left || !right || left.length !== right.length || left.some((value, index) => !Object.is(value, right[index]));
function slot() {
  const h = readHarness(), instance = h.current, index = instance.cursor++;
  return instance.hooks[index] ||= {};
}
export function useState(initial) {
  const item = slot();
  if (!('value' in item)) item.value = typeof initial === 'function' ? initial() : initial;
  return [item.value, (update) => {
    const value = typeof update === 'function' ? update(item.value) : update;
    if (!Object.is(item.value, value)) { item.value = value; readHarness().dirty = true; }
  }];
}
export function useRef(initial) { const item = slot(); return item.ref ||= { current: initial }; }
export function useMemo(callback, deps) {
  const item = slot();
  if (changed(item.deps, deps)) { item.value = callback(); item.deps = deps; }
  return item.value;
}
export const useCallback = (callback, deps) => useMemo(() => callback, deps);
export function useEffect(callback, deps) {
  const item = slot();
  if (changed(item.deps, deps)) {
    item.deps = deps;
    readHarness().pending.push(() => { item.cleanup?.(); item.cleanup = callback(); });
  }
}
export function useId() { const item = slot(); return item.id ||= 'gallery-' + (++readHarness().nextId); }
export function createContext(current) { const context = { current }; context.Provider = { context }; return context; }
export const useContext = (context) => context.current;
export const lazy = () => (props) => ({ type: 'editor', props });
export const Suspense = ({ children }) => children;
`;

const bundle = await build({
  stdin: {
    contents: 'export { IngredientSlideshow } from "./src/features/poster/ingredient-slideshow"; export { IngredientPoster } from "./src/features/poster/ingredient-poster";',
    resolveDir: fileURLToPath(new URL("../", import.meta.url)),
  },
  tsconfig: fileURLToPath(new URL("../tsconfig.json", import.meta.url)),
  bundle: true, platform: "node", format: "cjs", jsx: "automatic", write: false,
  define: { "process.env.NODE_ENV": '"development"' },
  plugins: [{ name: "slideshow-browser-boundary", setup(builder) {
    builder.onResolve({ filter: /^(react|react\/jsx-runtime)$/ }, ({ path }) => ({ path, namespace: "mock" }));
    builder.onResolve({ filter: /store-provider$|use-motion-preferences$|use-pointer-motion$|media-image$|shery-poster$|shery-editor$/ }, ({ path }) => ({ path, namespace: "mock" }));
    builder.onResolve({ filter: /\.module\.css$/ }, ({ path }) => ({ path, namespace: "mock" }));
    builder.onLoad({ filter: /.*/, namespace: "mock" }, ({ path }) => ({ contents:
      path === "react" ? hooks :
      path === "react/jsx-runtime" ? 'export const Fragment = Symbol.for("fragment"); export const jsx = (type, props, key) => ({ type, props, key }); export const jsxs = jsx;' :
      path.endsWith("store-provider") ? 'export const useStore = () => ({ content: { motionSettings: globalThis.harness.motion } });' :
      path.endsWith("use-motion-preferences") ? 'export const useReducedMotion = () => globalThis.harness.reduced; export const usePageVisible = () => globalThis.harness.visible;' :
      path.endsWith("use-pointer-motion") ? 'export const usePointerMotion = () => ({});' :
      path.endsWith("media-image") ? 'export const MediaImage = (props) => ({ type: "img", props });' :
      path.endsWith("shery-poster") ? 'export const SheryPoster = (props) => ({ type: "shery", props });' :
      path.endsWith("shery-editor") ? 'export const SheryEditor = (props) => ({ type: "editor", props });' :
      'export default new Proxy({}, { get: (_, key) => String(key) });',
    }));
  } }],
});

const image = (gallery, index) => ({ url: `/${gallery}-${index}.png`, altText: gallery, width: 800, height: 1000 });
const settings = { autoplay: true, gooey: true, interval: 6, strength: 1, config: {} };

function environment(counts = [2, 3, 1]) {
  const h = {
    motion: { enabled: true, cursor: true, duration: 1, intensity: 1 }, reduced: false, visible: true,
    settings: { ...settings }, hasSlides: counts.some((count) => count > 1), nextId: 0,
    current: null, pending: [], dirty: true,
    galleries: counts.map((count, index) => ({ id: `panel-${index}`, images: Array.from({ length: count }, (_, item) => image(`panel-${index}`, item)) })),
  };
  const instances = new Map(), hosts = new Map(), timers = new Map(), observers = new Set();
  let now = 0, nextTimer = 0, tree;
  const context = { harness: h, module: { exports: {} }, console, URL,
    setTimeout(callback, delay) { const id = ++nextTimer; timers.set(id, { callback, at: now + delay }); return id; },
    clearTimeout(id) { timers.delete(id); },
    IntersectionObserver: class {
      constructor(callback) { this.callback = callback; observers.add(this); }
      observe(target) { this.target = target; }
      disconnect() { observers.delete(this); }
    },
  };
  context.window = context;
  context.location = { href: "https://naturemist.test/" };
  vm.createContext(context);
  vm.runInContext(bundle.outputFiles[0].text, context);
  const { IngredientSlideshow, IngredientPoster } = context.module.exports;

  function renderNode(node, path, seen) {
    if (Array.isArray(node)) return node.map((child, index) => renderNode(child, `${path}/${child?.key ?? index}`, seen));
    if (!node || typeof node !== "object") return node;
    const { type, props = {} } = node;
    if (typeof type === "symbol") return renderNode(props.children, `${path}/fragment`, seen);
    if (type?.context) {
      const previous = type.context.current;
      type.context.current = props.value;
      const result = renderNode(props.children, `${path}/provider`, seen);
      type.context.current = previous;
      return result;
    }
    if (typeof type === "function") {
      seen.add(path);
      let instance = instances.get(path);
      if (!instance) { instance = { hooks: [] }; instances.set(path, instance); }
      instance.cursor = 0;
      h.current = instance;
      const result = type(props);
      h.current = null;
      return renderNode(result, `${path}/result`, seen);
    }
    let host = hosts.get(path);
    if (!host) { host = { type, props: {}, contains: () => false }; hosts.set(path, host); }
    host.props = { ...props, children: renderNode(props.children, `${path}/children`, seen) };
    if (props.ref) props.ref.current = host;
    return host;
  }

  function flush(force = false) {
    h.dirty ||= force;
    let renders = 0;
    while (h.dirty) {
      assert.ok(++renders < 30, "effects must settle without a render loop");
      h.dirty = false;
      h.pending = [];
      const seen = new Set();
      tree = renderNode({ type: IngredientSlideshow, props: {
        settings: h.settings, hasSlides: h.hasSlides,
        children: h.galleries.map((gallery) => ({ type: IngredientPoster, key: gallery.id, props: {
          images: gallery.images, fallback: image(gallery.id, "fallback"), settings: h.settings,
          pace: 2, variant: "editorial", label: gallery.id,
        } })),
      } }, "root", seen);
      for (const [path, instance] of instances) {
        if (seen.has(path)) continue;
        instance.hooks.forEach((item) => item.cleanup?.());
        instances.delete(path);
      }
      h.pending.forEach((effect) => effect());
    }
  }

  function intersect(visible, sectionOnly = false) {
    for (const observer of observers) {
      if (sectionOnly && !("data-ingredient-slideshow" in observer.target.props)) continue;
      observer.callback([{ isIntersecting: visible }]);
    }
    flush();
  }

  function advance(milliseconds) {
    const end = now + milliseconds;
    let ticks = 0;
    while (timers.size) {
      const [id, timer] = [...timers].sort((left, right) => left[1].at - right[1].at)[0];
      if (timer.at > end) break;
      assert.ok(++ticks < 100, "timer must not create a zero-delay loop");
      now = timer.at;
      timers.delete(id);
      timer.callback();
      flush();
    }
    now = end;
  }

  function panel(id) { return all(tree).find((node) => node.props?.role === "region" && node.props["aria-label"] === `panel-${id}`); }
  function button(id, label) { return all(panel(id)).find((node) => node.type === "button" && node.props["aria-label"] === label); }
  function act(callback) { callback(); flush(); }
  function unmount() {
    for (const instance of instances.values()) instance.hooks.forEach((item) => item.cleanup?.());
    instances.clear();
    hosts.clear();
  }
  flush();
  return { h, timers, observers, flush, intersect, advance, act, panel, button, unmount,
    sources: () => h.galleries.map((gallery) => all(tree).find((node) => node.props?.role === "region" && node.props["aria-label"] === gallery.id)).map((node) => all(node).find((child) => child.type === "img").props.src),
  };
}

function all(node) {
  if (Array.isArray(node)) return node.flatMap(all);
  if (!node || typeof node !== "object") return [];
  return [node, ...all(node.props?.children)];
}
const sources = (indices) => indices.map((index, gallery) => `/panel-${gallery}-${index}.png`);

test("three unequal galleries share exactly one six-second clock independent of effect pace", () => {
  const env = environment();
  assert.equal(env.timers.size, 0, "clock waits for the section to enter the viewport");
  env.intersect(true);
  assert.equal(env.timers.size, 1);
  assert.deepEqual(env.sources(), sources([0, 0, 0]));
  env.advance(5999);
  assert.deepEqual(env.sources(), sources([0, 0, 0]));
  env.advance(1);
  assert.deepEqual(env.sources(), sources([1, 1, 0]));
  env.advance(6000);
  assert.deepEqual(env.sources(), sources([0, 2, 0]));
  env.advance(6000);
  assert.deepEqual(env.sources(), sources([1, 0, 0]));
  assert.equal(env.timers.size, 1);
  assert.equal(all(env.panel(0)).find((node) => node.type === "shery").props.duration, 2640, "slower effect keeps its 2× pace without slowing the six-second clock");
  env.unmount();
  assert.equal(env.timers.size, 0);
  assert.equal(env.observers.size, 0);
});

test("navigation, negative wraparound and pause controls change the whole photo set", () => {
  const env = environment();
  env.intersect(true);
  env.act(() => env.button(0, "Previous photo set").props.onClick());
  assert.deepEqual(env.sources(), sources([1, 2, 0]));
  env.act(() => env.button(1, "Next photo set").props.onClick());
  assert.deepEqual(env.sources(), sources([0, 0, 0]));
  env.act(() => all(env.panel(0)).find((node) => node.type === "shery").props.onSelect(1));
  assert.deepEqual(env.sources(), sources([1, 1, 0]));
  env.act(() => env.button(1, "Pause all photos").props.onClick());
  assert.equal(env.timers.size, 0);
  assert.equal(env.button(0, "Resume all photos").props["aria-pressed"], true);
  env.advance(12000);
  assert.deepEqual(env.sources(), sources([1, 1, 0]));
  env.act(() => env.button(0, "Resume all photos").props.onClick());
  assert.equal(env.timers.size, 1);
  env.advance(5999);
  assert.deepEqual(env.sources(), sources([1, 1, 0]));
  env.advance(1);
  assert.deepEqual(env.sources(), sources([0, 2, 0]));
  env.unmount();
});

test("hover, focus and the editor block the single clock until every active blocker clears", () => {
  const env = environment();
  env.intersect(true);
  env.act(() => env.panel(0).props.onPointerEnter({ pointerType: "touch" }));
  assert.equal(env.timers.size, 1, "touch does not leave a synthetic hover pause");
  env.act(() => env.panel(0).props.onPointerEnter({ pointerType: "mouse" }));
  env.act(() => env.panel(1).props.onFocusCapture());
  env.act(() => env.panel(0).props.onPointerLeave());
  assert.equal(env.timers.size, 0, "focus remains after hover is released");
  env.act(() => env.panel(1).props.onBlurCapture({ currentTarget: { contains: () => true }, relatedTarget: {} }));
  assert.equal(env.timers.size, 0, "moving between controls does not release the focus block");
  env.act(() => env.panel(1).props.onBlurCapture({ currentTarget: { contains: () => false }, relatedTarget: null }));
  assert.equal(env.timers.size, 1);
  env.act(() => all(env.panel(0)).find((node) => node.type === "button" && node.props.className === "debugTrigger").props.onClick());
  assert.equal(env.timers.size, 0);
  env.act(() => all(env.panel(0)).find((node) => node.type === "editor").props.onClose());
  assert.equal(env.timers.size, 1);
  for (let index = 0; index < 4; index++) {
    env.act(() => env.panel(0).props.onPointerEnter({ pointerType: "mouse" }));
    env.act(() => env.panel(0).props.onPointerEnter({ pointerType: "mouse" }));
    assert.equal(env.timers.size, 0);
    env.act(() => env.panel(0).props.onPointerLeave());
    env.flush(true);
    assert.equal(env.timers.size, 1, "repeated cleanup and parent rerenders never duplicate the clock");
  }
  env.unmount();
  assert.equal(env.timers.size, 0);
});

test("middle photo hover permission survives iframe entry and focus while respecting motion settings", () => {
  const env = environment([2, 2, 2]);
  const middleEffect = () => all(env.panel(1)).find((node) => node.type === "shery");
  env.intersect(true);
  assert.equal(middleEffect().props.cursor, true, "the iframe can detect entry even before its parent receives hover");
  assert.equal(env.timers.size, 1);
  env.act(() => env.panel(1).props.onPointerEnter({ pointerType: "mouse" }));
  assert.equal(middleEffect().props.cursor, true);
  assert.equal(env.timers.size, 0, "hover still pauses the shared photo clock");
  env.act(() => env.panel(1).props.onFocusCapture());
  env.act(() => env.panel(1).props.onPointerLeave());
  assert.equal(middleEffect().props.cursor, true, "iframe focus must not disable its native pointer reveal");
  assert.equal(env.timers.size, 0, "focus independently keeps the shared clock paused");
  env.act(() => env.panel(1).props.onBlurCapture({ currentTarget: { contains: () => false }, relatedTarget: null }));
  assert.equal(env.timers.size, 1);
  env.h.motion.cursor = false;
  env.flush(true);
  assert.equal(middleEffect().props.cursor, false, "merchant cursor setting still disables pointer effects");
  env.h.motion.cursor = true;
  env.h.motion.intensity = 0;
  env.flush(true);
  assert.equal(middleEffect().props.cursor, false, "zero intensity disables pointer effects");
  env.h.motion.intensity = 1;
  env.h.reduced = true;
  env.flush(true);
  assert.equal(middleEffect(), undefined, "reduced motion removes the animated frame");
  assert.equal(env.timers.size, 0);
  env.unmount();
});

test("removing a blocked gallery releases its registration without duplicating timers", () => {
  const env = environment();
  env.intersect(true);
  env.act(() => env.panel(0).props.onFocusCapture());
  assert.equal(env.timers.size, 0);
  env.h.galleries = env.h.galleries.slice(1);
  env.flush(true);
  assert.equal(env.timers.size, 1);
  env.advance(6000);
  assert.deepEqual(env.sources(), ["/panel-1-1.png", "/panel-2-0.png"]);
  env.unmount();
});

test("Shopify autoplay, motion preferences, tab visibility and section visibility each gate the clock", () => {
  const gates = [
    (env, active) => { env.h.settings.autoplay = active; env.flush(true); },
    (env, active) => { env.h.motion.enabled = active; env.flush(true); },
    (env, active) => { env.h.reduced = !active; env.flush(true); },
    (env, active) => { env.h.visible = active; env.flush(true); },
    (env, active) => env.intersect(active, true),
  ];
  for (const gate of gates) {
    const env = environment();
    env.intersect(true);
    gate(env, false);
    assert.equal(env.timers.size, 0);
    env.advance(18000);
    assert.deepEqual(env.sources(), sources([0, 0, 0]));
    gate(env, true);
    assert.equal(env.timers.size, 1);
    env.advance(6000);
    assert.deepEqual(env.sources(), sources([1, 1, 0]));
    env.unmount();
  }
  const singletons = environment([1, 1, 1]);
  singletons.intersect(true);
  assert.equal(singletons.timers.size, 0, "three static photos need no slideshow clock");
  singletons.unmount();
});

test("an edited Shopify interval replaces the pending timeout and begins a full new interval", () => {
  const env = environment();
  env.intersect(true);
  env.advance(3000);
  env.h.settings = { ...env.h.settings, interval: 9 };
  env.flush(true);
  assert.equal(env.timers.size, 1);
  env.advance(8999);
  assert.deepEqual(env.sources(), sources([0, 0, 0]));
  env.advance(1);
  assert.deepEqual(env.sources(), sources([1, 1, 0]));
  env.unmount();
});
