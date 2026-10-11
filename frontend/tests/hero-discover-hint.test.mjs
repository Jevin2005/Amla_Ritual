import test from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = fileURLToPath(new URL("../", import.meta.url));
const bundle = await build({
  bundle: true, platform: "node", format: "cjs", write: false, jsx: "automatic",
  stdin: { contents: 'export { HeroDiscoverHint } from "./src/widgets/home/hero-discover-hint";', resolveDir: root },
  plugins: [{ name: "isolated-hover-environment", setup(build) {
    build.onResolve({ filter: /^(react|react\/jsx-runtime)$/ }, ({ path }) => ({ path, namespace: "mock" }));
    build.onResolve({ filter: /\.module\.css$/ }, ({ path }) => ({ path, namespace: "mock" }));
    build.onLoad({ filter: /.*/, namespace: "mock" }, ({ path }) => {
      if (path === "react") return { contents: "export const useRef = () => ({ current: globalThis.harness.hint }); export const useEffect = (effect) => globalThis.harness.effects.push(effect);" };
      if (path === "react/jsx-runtime") return { contents: "export const jsx = (type, props) => ({ type, props }); export const jsxs = jsx;" };
      return { contents: "export default new Proxy({}, { get: (_, key) => String(key) });" };
    });
  } }],
});

function eventTarget(extra = {}) {
  const listeners = new Map();
  return { ...extra, listeners,
    addEventListener(type, callback) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(callback);
    },
    removeEventListener(type, callback) {
      listeners.get(type)?.delete(callback);
      if (!listeners.get(type)?.size) listeners.delete(type);
    },
    emit(type, event = {}) { listeners.get(type)?.forEach((callback) => callback(event)); },
  };
}

function mount(options = {}) {
  const frames = new Map(), observers = new Set();
  let nextFrame = 0, time = 0;
  const section = eventTarget({ dataset: {}, contains: (node) => jars.includes(node) });
  const jars = [0, 1].map(() => {
    const jar = { closest: (selector) => selector === "[data-hero-product]" ? jar : null };
    return jar;
  });
  const hint = { dataset: {}, style: {}, offsetWidth: 100, offsetHeight: 20,
    closest: () => options.missingSection ? null : section,
  };
  const finePointer = eventTarget({ matches: options.finePointer ?? true });
  const reducedMotion = eventTarget({ matches: options.reducedMotion ?? false });
  const document = eventTarget({ hidden: false, documentElement: { clientWidth: 1000 } });
  const harness = { hint: options.missingRoot ? null : hint, effects: [] };
  const context = eventTarget({ harness, document, console, module: { exports: {} }, innerHeight: 600,
    matchMedia: (query) => query.includes("prefers-reduced-motion") ? reducedMotion : finePointer,
    requestAnimationFrame: (callback) => { frames.set(++nextFrame, callback); return nextFrame; },
    cancelAnimationFrame: (id) => frames.delete(id),
    MutationObserver: class {
      constructor(callback) { this.callback = callback; }
      observe(target, settings) { this.target = target; this.settings = settings; observers.add(this); }
      disconnect() { observers.delete(this); }
    },
  });
  context.window = context;
  vm.createContext(context);
  vm.runInContext(bundle.outputFiles[0].text, context);
  const tree = context.module.exports.HeroDiscoverHint({ animated: options.animated ?? true });
  const cleanups = harness.effects.map((effect) => effect());
  const fixture = { tree, hint, section, jars, context, document, finePointer, reducedMotion, frames, observers,
    pointer(type = "pointermove", extra = {}) {
      const event = { type, target: jars[0], pointerType: "mouse", buttons: 0, clientX: 200, clientY: 200, ...extra };
      section.emit(type, event);
      return event;
    },
    position() {
      const values = hint.style.transform?.match(/translate3d\(([-\d.e]+)px, ([-\d.e]+)px, 0\)/);
      assert.ok(values, `expected a finite translation, got ${hint.style.transform}`);
      const point = [Number(values[1]), Number(values[2])];
      assert.ok(point.every(Number.isFinite));
      return point;
    },
    flush(milliseconds = 16.7) {
      time += milliseconds;
      const pending = [...frames.values()];
      frames.clear();
      pending.forEach((callback) => callback(time));
    },
    settle() {
      for (let i = 0; i < 120 && frames.size; i += 1) fixture.flush();
      assert.equal(frames.size, 0, "stationary hover must not keep an animation loop alive");
    },
    mutate(property, value) {
      section.dataset[property] = value;
      observers.forEach((observer) => observer.callback([{ target: section }]));
    },
    dispose() { cleanups.forEach((cleanup) => cleanup?.()); },
  };
  return fixture;
}

test("Discover is one decorative text hint without an extra interactive target", () => {
  const env = mount();
  assert.equal(env.tree.type, "span");
  assert.equal(env.tree.props["aria-hidden"], "true");
  for (const property of ["href", "role", "tabIndex", "onClick"]) assert.equal(env.tree.props[property], undefined);
  assert.equal(env.frames.size, 0, "nothing animates before a jar is hovered");
  env.dispose();
});

test("entering a jar places the hint immediately to the cursor's right", () => {
  const env = mount();
  env.pointer("pointerover");
  assert.equal(env.hint.dataset.visible, "true");
  assert.deepEqual(env.position(), [222, 190]);
  env.settle();
  assert.deepEqual(env.position(), [222, 190]);
  env.dispose();
});

test("cursor movement is damped, coalesces rapid events and stops when settled", () => {
  const env = mount();
  env.pointer();
  env.settle();
  for (let i = 0; i < 20; i += 1) env.pointer("pointermove", { clientX: 381 + i, clientY: 300 });
  assert.equal(env.frames.size, 1, "rapid pointer events share one frame");
  assert.deepEqual(env.position(), [222, 190]);
  env.flush();
  const [x, y] = env.position();
  assert.ok(x > 222 && x < 422 && y > 190 && y < 290, "motion approaches the cursor without jumping");
  env.settle();
  assert.deepEqual(env.position(), [422, 290]);
  env.dispose();
});

test("the hint flips only at the right edge and stays inside the viewport vertically", () => {
  const env = mount();
  for (const [clientX, clientY, expected] of [[900, 599, [778, 568]], [0, 0, [22, 12]], [999, 300, [877, 290]]]) {
    env.section.emit("pointerleave");
    env.pointer("pointerover", { clientX, clientY });
    assert.deepEqual(env.position(), expected);
    const [x, y] = env.position();
    assert.ok(x >= 12 && x + env.hint.offsetWidth <= 988);
    assert.ok(y >= 12 && y + env.hint.offsetHeight <= 588);
  }
  env.dispose();
});

test("moving among a jar's children keeps the hint but leaving the jar hides it", () => {
  const env = mount();
  const child = { closest: () => env.jars[0] };
  env.pointer("pointerover", { target: child });
  env.pointer("pointerout", { relatedTarget: child });
  assert.equal(env.hint.dataset.visible, "true");
  env.pointer("pointerout", { relatedTarget: null });
  assert.equal(env.hint.dataset.visible, "false");
  assert.equal(env.frames.size, 0);
  env.dispose();
});

test("entering a different jar starts at the new cursor rather than flying across the page", () => {
  const env = mount();
  env.pointer();
  env.settle();
  env.pointer("pointerout", { relatedTarget: env.jars[1] });
  env.pointer("pointerover", { target: env.jars[1], clientX: 650, clientY: 450 });
  assert.equal(env.hint.dataset.visible, "true");
  assert.deepEqual(env.position(), [672, 440]);
  env.dispose();
});

test("drag, scroll, blur, keyboard and visibility events hide and cancel pending movement", () => {
  const cases = [
    ["section", "pointerdown"], ["section", "pointerleave"], ["section", "wheel"],
    ["context", "scroll"], ["context", "resize"], ["context", "blur"],
    ["document", "visibilitychange"], ["document", "keydown"],
  ];
  for (const [target, event] of cases) {
    const env = mount();
    env.pointer();
    env.pointer("pointermove", { clientX: 400 });
    assert.equal(env.frames.size, 1);
    env[target].emit(event);
    assert.equal(env.hint.dataset.visible, "false", event);
    assert.equal(env.frames.size, 0, event);
    env.flush();
    assert.equal(env.hint.dataset.visible, "false", "a cancelled frame cannot revive the hint");
    env.dispose();
  }
});

test("hero drag and reveal mutations hide the hint even without new pointer movement", () => {
  for (const property of ["dragging", "revealing"]) {
    const env = mount();
    env.pointer();
    env.mutate(property, "true");
    assert.equal(env.hint.dataset.visible, "false");
    assert.equal(env.frames.size, 0);
    env.pointer();
    assert.equal(env.hint.dataset.visible, "false", "transitioning hero cannot redisplay the hint");
    env.mutate(property, "false");
    env.pointer();
    assert.equal(env.hint.dataset.visible, "true", "returning to the hero permits a fresh hover");
    env.dispose();
  }
});

test("touch, pen, pressed pointers, empty space and unrelated jars never display the hint", () => {
  const outsideJar = { closest: () => outsideJar };
  for (const event of [{ pointerType: "touch" }, { pointerType: "pen" }, { buttons: 1 }, { target: null }, { target: { closest: () => null } }, { target: outsideJar }]) {
    const env = mount();
    env.pointer();
    env.pointer("pointermove", event);
    assert.equal(env.hint.dataset.visible, "false");
    assert.equal(env.frames.size, 0);
    env.dispose();
  }
});

test("coarse pointers and hidden documents cannot show the hover hint", () => {
  for (const options of [{ finePointer: false }, { hidden: true }]) {
    const env = mount(options);
    env.document.hidden = Boolean(options.hidden);
    env.pointer();
    assert.equal(env.hint.dataset.visible, "false");
    assert.equal(env.frames.size, 0);
    env.dispose();
  }
});

test("changing pointer or motion preference clears the current hint", () => {
  for (const name of ["finePointer", "reducedMotion"]) {
    const env = mount();
    env.pointer();
    env[name].matches = !env[name].matches;
    env[name].emit("change");
    assert.equal(env.hint.dataset.visible, "false");
    assert.equal(env.frames.size, 0);
    env.dispose();
  }
});

test("disabled and reduced motion retain the useful hint without cursor interpolation", () => {
  for (const options of [{ animated: false }, { reducedMotion: true }]) {
    const env = mount(options);
    env.pointer();
    env.settle();
    env.pointer("pointermove", { clientX: 400, clientY: 300 });
    env.flush();
    assert.equal(env.hint.dataset.visible, "true");
    assert.deepEqual(env.position(), [422, 290]);
    assert.equal(env.frames.size, 0);
    env.dispose();
  }
});

test("invalid cursor coordinates cannot produce invalid transforms", () => {
  const env = mount();
  for (const [clientX, clientY] of [[NaN, 200], [200, Infinity], [-Infinity, 200]]) {
    env.pointer("pointermove", { clientX, clientY });
    assert.equal(env.hint.style.transform, undefined);
    assert.equal(env.frames.size, 0);
  }
  env.pointer();
  assert.deepEqual(env.position(), [222, 190]);
  env.dispose();
});

test("a hidden hint restarts cleanly after a long pause", () => {
  const env = mount();
  env.pointer();
  env.settle();
  env.context.emit("blur");
  env.flush(10_000);
  env.pointer("pointerover", { clientX: 400, clientY: 300 });
  assert.deepEqual(env.position(), [422, 290]);
  env.pointer("pointermove", { clientX: 500, clientY: 400 });
  env.flush();
  assert.ok(env.position()[0] > 422 && env.position()[0] < 522);
  env.settle();
  assert.deepEqual(env.position(), [522, 390]);
  env.dispose();
});

test("unmount cancels frames, disconnects observers and removes every event listener", () => {
  const env = mount();
  env.pointer();
  env.pointer("pointermove", { clientX: 400 });
  assert.equal(env.frames.size, 1);
  assert.equal(env.observers.size, 1);
  env.dispose();
  assert.equal(env.frames.size, 0);
  assert.equal(env.observers.size, 0);
  assert.equal(env.hint.dataset.visible, "false");
  for (const target of [env.section, env.context, env.document, env.finePointer, env.reducedMotion]) assert.equal(target.listeners.size, 0);
  env.pointer();
  assert.equal(env.hint.dataset.visible, "false");
});

test("an unmounted hint or missing hero is safe and does not attach observers or listeners", () => {
  for (const options of [{ missingRoot: true }, { missingSection: true }]) {
    const env = mount(options);
    assert.equal(env.frames.size, 0);
    assert.equal(env.observers.size, 0);
    for (const target of [env.section, env.context, env.document, env.finePointer, env.reducedMotion]) assert.equal(target.listeners.size, 0);
    env.dispose();
  }
});
