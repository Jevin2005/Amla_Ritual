import test from "node:test";
import assert from "node:assert/strict";
import { buildSync } from "esbuild";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const code = buildSync({ entryPoints: [fileURLToPath(new URL("../src/lib/judgeme/product-pagination.ts", import.meta.url))], bundle: true, platform: "node", format: "cjs", write: false }).outputFiles[0].text;

function fixture() {
  let click, changed;
  let currentPage = "1", reviewId = "review-1", revealed = 0, loadingShown = 0, disconnected = false;
  let timer, frame;
  const states = [];
  const container = {
    style: { minHeight: "" }, contains: () => true,
    querySelector: () => ({ getAttribute: () => currentPage }),
    querySelectorAll: () => reviewId ? [{ getAttribute: () => reviewId }] : [],
    getBoundingClientRect: () => ({ height: 700 }),
    addEventListener: (name, callback) => { click = callback; },
    removeEventListener: () => { click = null; },
  };
  const context = vm.createContext({ module: { exports: {} },
    MutationObserver: class { constructor(callback) { changed = callback; } observe() {} disconnect() { disconnected = true; } },
    setTimeout: callback => { timer = callback; return 1; }, clearTimeout: () => { timer = null; },
    requestAnimationFrame: callback => { frame = callback; return 1; }, cancelAnimationFrame: () => { frame = null; },
  });
  vm.runInContext(code, context);
  const cleanup = context.module.exports.installProductReviewPagination(container, state => states.push(state), () => revealed++, () => loadingShown++);
  return { container, states, cleanup,
    click(current = false) {
      const event = { button: 0, target: { closest: () => ({ getAttribute: () => "2", classList: { contains: () => current } }) },
        prevented: false, stopped: false, preventDefault() { this.prevented = true; }, stopPropagation() { this.stopped = true; } };
      click(event); return event;
    },
    update(page, id) { currentPage = page; reviewId = id; changed(); },
    flush: () => { const pending = frame; frame = null; pending?.(); },
    timeout: () => timer?.(),
    get revealed() { return revealed; },
    get loadingShown() { return loadingShown; },
    get cleaned() { return disconnected && !timer && !frame && !click; },
  };
}

test("next page holds layout and blocks overlapping provider requests", () => {
  const f = fixture();
  assert.equal(f.click().prevented, false, "the first click must reach Judge.me");
  assert.equal(f.container.style.minHeight, "700px");
  assert.deepEqual(f.states, ["loading"]);
  f.flush();
  assert.equal(f.loadingShown, 1, "bring the loader into view after the loading state renders");
  const duplicate = f.click();
  assert.equal(duplicate.prevented, true);
  assert.equal(duplicate.stopped, true);
  f.cleanup();
});

test("only a different loaded page releases and reveals the new reviews", () => {
  const f = fixture();
  f.click();
  f.update("1", "review-1");
  f.update("2", "review-1");
  assert.deepEqual(f.states, ["loading"], "pagination alone is not loaded review content");
  f.update("2", "review-6");
  assert.deepEqual(f.states, ["loading"], "keep the loader until the replacement layout is ready");
  assert.equal(f.revealed, 0, "wait until provider focus and layout have settled");
  f.flush();
  assert.deepEqual(f.states, ["loading", "ready"]);
  assert.equal(f.container.style.minHeight, "");
  assert.equal(f.revealed, 1);
  f.update("2", "review-6");
  f.flush();
  assert.equal(f.revealed, 1);
  f.cleanup();
});

test("empty intermediate DOM and unrelated pages never dismiss the loader", () => {
  const f = fixture();
  f.click(); f.flush();
  f.update("", ""); f.flush();
  f.update("2", ""); f.flush();
  f.update("3", "review-other"); f.flush();
  assert.deepEqual(f.states, ["loading"]);
  assert.equal(f.revealed, 0);
  f.update("2", "review-6"); f.flush();
  assert.deepEqual(f.states, ["loading", "ready"]);
  f.cleanup();
});

test("a failed provider request unlocks controls and allows a retry", () => {
  const f = fixture();
  f.click(); f.timeout();
  assert.deepEqual(f.states, ["loading", "error"]);
  assert.equal(f.container.style.minHeight, "");
  assert.equal(f.click().prevented, false);
  f.cleanup();
  assert.equal(f.cleaned, true);
});

test("current-page clicks do nothing and unmount cancels a pending scroll", () => {
  const f = fixture();
  f.click(true);
  assert.deepEqual(f.states, []);
  f.click(); f.update("2", "review-6"); f.cleanup(); f.flush();
  assert.equal(f.revealed, 0);
  assert.equal(f.cleaned, true);
});
