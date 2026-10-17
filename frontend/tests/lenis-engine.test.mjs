import test from "node:test";
import assert from "node:assert/strict";
import { buildSync } from "esbuild";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

// Bundle the installed library itself: these checks exercise its animation
// state, native event handling and lifecycle together with our scroll owner.
const bundle = buildSync({
  stdin: {
    contents: 'export { installLenisScroll } from "./src/shared/ui/lenis-scroll"; export { scrollPageTo } from "./src/shared/ui/page-scroll";',
    resolveDir: fileURLToPath(new URL("../", import.meta.url)),
  },
  bundle: true, platform: "node", format: "cjs", write: false,
}).outputFiles[0].text;

class Events {
  listeners = new Map();
  addEventListener(type, callback, options = {}) {
    const capture = typeof options === "boolean" ? options : Boolean(options.capture);
    const entries = this.listeners.get(type) ?? [];
    entries.push({ callback, capture });
    this.listeners.set(type, entries);
  }
  removeEventListener(type, callback, options = {}) {
    const capture = typeof options === "boolean" ? options : Boolean(options.capture);
    this.listeners.set(type, (this.listeners.get(type) ?? []).filter((entry) => entry.callback !== callback || entry.capture !== capture));
  }
  emit(type, event = {}) {
    for (const { callback } of [...this.listeners.get(type) ?? []].sort((a, b) => Number(b.capture) - Number(a.capture))) callback(event);
  }
  dispatchEvent(event) { this.emit(event.type, event); return true; }
  get listenerCount() { return [...this.listeners.values()].reduce((total, entries) => total + entries.length, 0); }
}

class Element extends Events {
  constructor(tag = "div") {
    super();
    this.tag = tag;
    this.attributes = new Map();
    this.dataset = {};
    this.classes = new Set();
    this.classList = { add: (value) => this.classes.add(value), remove: (value) => this.classes.delete(value), [Symbol.iterator]: () => this.classes.values() };
    this.scrollHeight = this.clientHeight = 800;
    this.scrollWidth = this.clientWidth = 390;
    this.scrollTop = this.scrollLeft = 0;
    this.overflowX = this.overflowY = "visible";
    this.overscrollBehaviorX = this.overscrollBehaviorY = "auto";
    this.scrollPaddingTop = this.scrollMarginTop = "0px";
  }
  hasAttribute(name) { return this.attributes.has(name); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  matches() { return this.tag === "dialog" || this.getAttribute("role") === "dialog"; }
}

function fixture({ phone = false } = {}) {
  const frames = new Map(), timers = new Map(), observers = [];
  let nextId = 0, time = 0;
  const root = new Element("html"), body = new Element("body");
  root.scrollHeight = 10000;
  const document = Object.assign(new Events(), { documentElement: root, body, hidden: false });
  const reduced = Object.assign(new Events(), { matches: false });
  class Window extends Events {}
  const view = Object.assign(new Window(), {
    document, innerWidth: 390, innerHeight: 800, scrollX: 0, scrollY: 0,
    location: new URL("https://naturemist.test/"),
    matchMedia: () => reduced,
    getComputedStyle: (element) => element,
    getSelection: () => null,
    requestAnimationFrame: (callback) => { frames.set(++nextId, callback); return nextId; },
    cancelAnimationFrame: (id) => frames.delete(id),
    scrollTo({ top }) {
      this.scrollY = Math.max(0, Math.min(root.scrollHeight - this.innerHeight, Math.round(top)));
      this.emit("scroll");
    },
  });
  class Observer {
    constructor(callback) { this.callback = callback; observers.push(this); }
    observe(target) { this.target = target; }
    disconnect() { this.disconnected = true; }
  }
  class CustomEvent {
    constructor(type, options) { this.type = type; Object.assign(this, options); }
  }
  const context = vm.createContext({
    module: { exports: {} }, window: view, document, URL, Window,
    HTMLElement: Element, Element, HTMLAnchorElement: Element,
    MutationObserver: Observer, ResizeObserver: Observer, CustomEvent,
    navigator: { userAgent: phone ? "iPhone" : "Desktop" },
    getComputedStyle: view.getComputedStyle,
    requestAnimationFrame: view.requestAnimationFrame,
    cancelAnimationFrame: view.cancelAnimationFrame,
    setTimeout: (callback) => { timers.set(++nextId, callback); return nextId; },
    clearTimeout: (id) => timers.delete(id),
  });
  vm.runInContext(bundle, context);
  const { installLenisScroll, scrollPageTo } = context.module.exports;
  const dispose = installLenisScroll(view);
  const step = (elapsed = 1000 / 60) => {
    time += elapsed;
    const pending = [...frames.values()]; frames.clear();
    pending.forEach((callback) => callback(time));
  };
  const settle = () => {
    for (let i = 0; frames.size && i < 300; i++) step();
    assert.equal(frames.size, 0, "both library completion callbacks and the app animation loop must settle");
  };
  const input = (type = "wheel", options = {}) => {
    const event = { type, deltaX: 0, deltaY: 120, deltaMode: 0, cancelable: true, defaultPrevented: false,
      clientX: 150, clientY: 400,
      composedPath: () => [body, root, document, view],
      preventDefault() { this.defaultPrevented = true; }, ...options };
    view.emit(type, event);
    return event;
  };
  return { view, document, root, body, reduced, frames, observers, step, settle, input, scrollPageTo,
    setLocked(locked) {
      body.overflowY = locked ? "hidden" : "visible";
      observers.filter((observer) => observer.target === body).forEach((observer) => observer.callback());
    },
    dispose() { dispose(); settle(); },
  };
}

test("installed Lenis eases wheel input, sleeps at rest and resumes without an idle-time jump", () => {
  const f = fixture();
  assert.ok(f.root.classes.has("lenis"));
  assert.equal(f.input().defaultPrevented, true);
  f.step(); f.step();
  assert.ok(f.view.scrollY > 0 && f.view.scrollY < 120);
  f.settle();
  assert.equal(f.view.scrollY, 120);
  assert.equal(f.root.classes.has("lenis-smooth"), false);
  f.input();
  f.step(120000);
  assert.ok(f.view.scrollY > 120 && f.view.scrollY < 240, "resuming after two idle minutes still eases");
  f.settle();
  assert.equal(f.view.scrollY, 240);
  f.dispose();
  assert.equal(f.view.listenerCount + f.document.listenerCount + f.reduced.listenerCount, 0);
  assert.equal(f.root.classes.has("lenis"), false);
  assert.ok(f.observers.every((observer) => observer.disconnected));
});

test("a programmatic request at the current position cancels real Lenis momentum", () => {
  const f = fixture();
  f.input("wheel", { deltaY: 900 });
  f.step(); f.step();
  const stoppedAt = f.view.scrollY;
  assert.ok(stoppedAt > 0 && stoppedAt < 900);
  f.scrollPageTo(stoppedAt, { immediate: true });
  f.settle();
  assert.equal(f.view.scrollY, stoppedAt, "resize/scrollTo must not leave the preceding animation running");
  f.scrollPageTo(1500);
  f.settle();
  assert.equal(f.view.scrollY, 1500);
  f.dispose();
});

test("native phone touch cancels wheel momentum without preventing scrolling or pinch gestures", () => {
  const f = fixture({ phone: true });
  f.input(); f.step(); f.step();
  const beforeTouch = f.view.scrollY;
  assert.equal(f.input("touchstart").defaultPrevented, false);
  assert.equal(f.input("touchmove", { clientY: 300 }).defaultPrevented, false);
  assert.equal(f.input("touchstart", { targetTouches: [{ clientX: 100, clientY: 300 }, { clientX: 250, clientY: 300 }] }).defaultPrevented, false);
  assert.equal(f.input("touchmove", { targetTouches: [{ clientX: 80, clientY: 300 }, { clientX: 270, clientY: 300 }] }).defaultPrevented, false);
  f.settle();
  assert.equal(f.view.scrollY, beforeTouch);
  f.view.scrollTo({ top: 480 });
  f.input("touchend");
  f.scrollPageTo(1100);
  f.settle();
  assert.equal(f.view.scrollY, 1100, "button navigation resumes from the native touch position");
  f.dispose();
});

test("body locks stop the actual engine while nested dialogs remain native and unlock cleanly", () => {
  const f = fixture();
  f.input(); f.step(); f.step();
  const beforeLock = f.view.scrollY;
  f.setLocked(true);
  assert.ok(f.root.classes.has("lenis-stopped"));
  assert.equal(f.input().defaultPrevented, true);
  const dialog = new Element("dialog");
  assert.equal(f.input("wheel", { composedPath: () => [dialog, f.body, f.root] }).defaultPrevented, false);
  f.settle();
  assert.equal(f.view.scrollY, beforeLock);
  f.setLocked(false);
  assert.equal(f.root.classes.has("lenis-stopped"), false);
  f.input(); f.settle();
  assert.equal(f.view.scrollY, beforeLock + 120);
  f.dispose();
});
