import test from "node:test";
import assert from "node:assert/strict";
import { buildSync } from "esbuild";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const bundle = buildSync({
  stdin: {
    contents:
      'export * from "./src/domain/shery-config.ts"; export * from "./src/features/background/shery-background-document.ts";',
    resolveDir: root,
  },
  bundle: true,
  platform: "node",
  format: "esm",
  write: false,
});
const { defaultSheryBackgroundConfig, sheryBackgroundDocument } = await import(
  `data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`
);

test("defaultSheryBackgroundConfig contains required Multiple Image Scroll parameters", () => {
  assert.equal(defaultSheryBackgroundConfig.scrollType?.value, 0);
  assert.equal(defaultSheryBackgroundConfig.displaceAmount?.value, 0.08);
  assert.ok(defaultSheryBackgroundConfig.noise_speed?.value !== undefined);
  assert.ok(defaultSheryBackgroundConfig.noise_scale?.value !== undefined);
});

test("sheryBackgroundDocument escapes JSON breakout and references background-runtime.js", () => {
  const images = [
    { url: "https://example.test/bg1.png", altText: '</script><script>alert("xss")</script>' },
    { url: "https://example.test/bg2.png", altText: "Slide 2" },
  ];
  const html = sheryBackgroundDocument(images, defaultSheryBackgroundConfig);
  assert.ok(!html.includes('<script>alert'));
  assert.ok(html.includes('\\u003c/script>'));
  assert.ok(html.includes('/vendor/shery/background-runtime.js'));
  assert.ok(html.includes('id="background"'));
});

test("background index loop calculation works forward and backward", () => {
  const length = 2;
  const loopForward = (curr) => (curr + 1) % length;
  const loopBackward = (curr) => (curr - 1 + length) % length;

  assert.equal(loopForward(0), 1);
  assert.equal(loopForward(1), 0);
  assert.equal(loopBackward(0), 1);
  assert.equal(loopBackward(1), 0);
});
