import test from "node:test";
import assert from "node:assert/strict";
import { buildSync } from "esbuild";
import { fileURLToPath } from "node:url";

const result = buildSync({
  entryPoints: [fileURLToPath(new URL("../src/shared/ui/wheel-scroll.ts", import.meta.url))],
  bundle: true, platform: "node", format: "esm", write: false,
});
const { installWheelScroll } = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`);

function fixture({ y = 0, fine = true, reduced = false } = {}) {
  const handlers = new Map();
  const frames = new Map();
  let id = 0;
  let clock = 0;
  const events = () => ({
    addEventListener(name, fn) { handlers.set(name, fn); },
    removeEventListener(name) { handlers.delete(name); },
  });
  const body = { overflowY: "visible" };
  const root = { overflowY: "visible", scrollHeight: 10000 };
  const view = {
    ...events(), scrollY: y, scrollX: 0, innerHeight: 800,
    document: { ...events(), body, documentElement: root, hidden: false },
    matchMedia: (query) => ({ matches: query.includes("reduce") ? reduced : fine, addEventListener() {}, removeEventListener() {} }),
    getComputedStyle: (element) => element,
    requestAnimationFrame(fn) { frames.set(++id, fn); return id; },
    cancelAnimationFrame(key) { frames.delete(key); },
    // Real browsers may quantize scroll offsets; the animation must still finish.
    scrollTo({ top }) { this.scrollY = Math.round(top); },
  };
  const dispose = installWheelScroll(view);
  const step = (ms = 16.67) => {
    clock += ms;
    const pending = [...frames.values()];
    frames.clear();
    pending.forEach((fn) => fn(clock));
  };
  const settle = () => {
    for (let i = 0; frames.size && i < 180; i++) step();
    assert.equal(frames.size, 0, "must stop scheduling after settling");
  };
  const wheel = (dy, options = {}) => {
    const event = { deltaY: dy, deltaX: 0, deltaMode: 0, cancelable: true, defaultPrevented: false,
      composedPath: () => [body], preventDefault() { this.defaultPrevented = true; }, ...options };
    handlers.get("wheel")(event);
    return event;
  };
  return { view, handlers, frames, step, settle, wheel, dispose };
}

test("wheel movement eases in, slows slightly and settles without a permanent loop", () => {
  const f = fixture();
  assert.equal(f.wheel(120).defaultPrevented, true);
  f.step();
  assert.ok(f.view.scrollY > 0 && f.view.scrollY < 102);
  f.settle();
  assert.equal(f.view.scrollY, 102);
  f.dispose();
  assert.equal(f.handlers.size, 0);
});

test("fast wheel input has bounded momentum and immediately reverses", () => {
  const f = fixture({ y: 1000 });
  for (let i = 0; i < 30; i++) f.wheel(500);
  f.settle();
  assert.equal(f.view.scrollY, 1400);
  f.wheel(400); f.step();
  const before = f.view.scrollY;
  f.wheel(-120); f.step();
  assert.ok(f.view.scrollY < before);
  f.settle();
  f.wheel(-100000); f.settle();
  assert.ok(f.view.scrollY >= 0);
});

test("touch devices, reduced motion, zoom and horizontal gestures retain native handling", () => {
  for (const options of [{ fine: false }, { reduced: true }]) {
    const f = fixture(options);
    assert.equal(f.wheel(120).defaultPrevented, false);
    assert.equal(f.frames.size, 0);
  }
  const f = fixture();
  for (const options of [{ ctrlKey: true }, { shiftKey: true }, { deltaX: 200 }, { defaultPrevented: true }]) {
    f.wheel(120, options);
    assert.equal(f.frames.size, 0);
  }
});

test("drawers and nested scrolling do not move the document", () => {
  const f = fixture({ y: 300 });
  const panel = { nodeType: 1, matches: () => false, overflowY: "auto", scrollHeight: 1000, clientHeight: 200 };
  assert.equal(f.wheel(120, { composedPath: () => [panel] }).defaultPrevented, false);
  f.wheel(120);
  f.view.document.body.overflowY = "hidden";
  f.step();
  assert.equal(f.view.scrollY, 300);
  assert.equal(f.frames.size, 0);
});

test("navigation, keyboard, touch and restored scroll positions cancel pending movement", () => {
  for (const name of ["keydown", "pointerdown", "touchstart", "pageshow", "popstate", "hashchange", "resize"]) {
    const f = fixture({ y: 1000 });
    f.wheel(120); f.handlers.get(name)();
    assert.equal(f.frames.size, 0);
  }
  const f = fixture({ y: 1000 });
  f.wheel(120); f.view.scrollY = 0; f.step();
  assert.equal(f.view.scrollY, 0);
  assert.equal(f.frames.size, 0);
  f.wheel(120); f.settle();
  assert.equal(f.view.scrollY, 102);
});

test("line/page units and document boundaries are handled consistently", () => {
  const f = fixture();
  assert.equal(f.wheel(-120).defaultPrevented, false);
  f.wheel(3, { deltaMode: 1 }); f.settle();
  assert.equal(f.view.scrollY, 41);
  f.wheel(1, { deltaMode: 2 }); f.settle();
  assert.equal(f.view.scrollY, 441);
  f.view.scrollY = 9180;
  f.wheel(120); f.settle();
  assert.equal(f.view.scrollY, 9200);
  assert.equal(f.wheel(120).defaultPrevented, false);
});
