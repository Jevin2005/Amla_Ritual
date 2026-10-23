import test from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import vm from "node:vm";

const bundle = await build({
  entryPoints: [fileURLToPath(new URL("../src/shared/hooks/use-webgl.ts", import.meta.url))],
  bundle: true, platform: "node", format: "cjs", write: false,
  plugins: [{ name: "unused-hooks", setup(builder) {
    builder.onResolve({ filter: /^react$/ }, () => ({ path: "react", namespace: "mock" }));
    builder.onLoad({ filter: /.*/, namespace: "mock" }, () => ({ contents: "export const useState = () => {}; export const useEffect = () => {};" }));
  } }],
});

test("explicit retry rechecks WebGL after a temporary allocation failure", () => {
  let available = false, probes = 0, released = 0;
  const context = { module: { exports: {} }, window: {}, document: {
    createElement() {
      probes++;
      return { getContext: () => available ? { getExtension: () => ({ loseContext() { released++; } }) } : null };
    },
  } };
  vm.runInNewContext(bundle.outputFiles[0].text, context);
  const { isWebGLAvailable } = context.module.exports;
  assert.equal(isWebGLAvailable(), false);
  available = true;
  assert.equal(isWebGLAvailable(), false, "normal callers share the cached probe");
  assert.equal(probes, 1);
  assert.equal(isWebGLAvailable(true), true, "retry recovers without a page reload");
  assert.equal(probes, 2);
  assert.equal(released, 1, "the probe must release its own GPU context");
  assert.equal(isWebGLAvailable(), true);
  assert.equal(probes, 2);
});
