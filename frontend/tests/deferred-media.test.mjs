import test from "node:test";
import assert from "node:assert/strict";
import { buildSync } from "esbuild";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const bundle = buildSync({
  entryPoints: [fileURLToPath(new URL("../src/shared/hooks/use-deferred-media.ts", import.meta.url))],
  bundle: true, platform: "node", format: "cjs", write: false, external: ["react"],
}).outputFiles[0].text;

function fixture({ enabled = true, delay = 0, idleSupport = true } = {}) {
  const frames = new Map(), timers = new Map(), idle = new Map();
  let id = 0, ready = false, cleanup;
  const view = {
    requestAnimationFrame: (callback) => { frames.set(++id, callback); return id; },
    cancelAnimationFrame: (key) => frames.delete(key),
    setTimeout: (callback, milliseconds) => { timers.set(++id, { callback, milliseconds }); return id; },
    clearTimeout: (key) => timers.delete(key),
    ...(idleSupport ? {
      requestIdleCallback: (callback, options) => { idle.set(++id, { callback, options }); return id; },
      cancelIdleCallback: (key) => idle.delete(key),
    } : {}),
  };
  const context = vm.createContext({
    module: { exports: {} }, window: view, ...view,
    require: () => ({ useState: () => [ready, (value) => { ready = value; }], useEffect: (effect) => { cleanup = effect(); } }),
  });
  vm.runInContext(bundle, context);
  const render = () => context.module.exports.useDeferredMedia(enabled, delay);
  render();
  const flush = (queue) => { const pending = [...queue.values()]; queue.clear(); pending.forEach((item) => (item.callback ?? item)()); };
  return { frames, timers, idle, flush, render, dispose: () => cleanup?.(), get ready() { return ready; } };
}

test("current-model startup gets one paint without waiting for idle time", () => {
  const f = fixture();
  assert.equal(f.ready, false);
  assert.equal(f.frames.size, 1);
  assert.equal(f.timers.size, 0);
  assert.equal(f.idle.size, 0);
  f.flush(f.frames);
  assert.equal(f.ready, true);
  assert.equal(f.render(), true);
  assert.equal(f.frames.size + f.timers.size + f.idle.size, 0);
  f.dispose();
});

test("leaving before the first paint cancels current-model startup", () => {
  const f = fixture();
  f.dispose();
  assert.equal(f.frames.size, 0);
  f.flush(f.frames);
  assert.equal(f.ready, false);
});

test("optional background effects still wait for their delay and browser idle time", () => {
  const f = fixture({ delay: 1200 });
  assert.equal(f.frames.size, 0);
  assert.equal([...f.timers.values()][0].milliseconds, 1200);
  f.flush(f.timers);
  assert.equal(f.ready, false);
  assert.equal(f.idle.size, 1);
  f.dispose();
  assert.equal(f.idle.size, 0);
  assert.equal(f.ready, false);
});

test("disabled media schedules no work and browsers without idle support can activate", () => {
  const disabled = fixture({ enabled: false });
  assert.equal(disabled.frames.size + disabled.timers.size + disabled.idle.size, 0);
  assert.equal(disabled.ready, false);
  const fallback = fixture({ delay: 300, idleSupport: false });
  fallback.flush(fallback.timers);
  assert.equal(fallback.ready, true);
  fallback.dispose();
});
