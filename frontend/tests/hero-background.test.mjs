import test from "node:test";
import assert from "node:assert/strict";
import { buildSync } from "esbuild";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";

const root = fileURLToPath(new URL("../", import.meta.url));
const bundle = buildSync({
  stdin: {
    contents:
      'export * from "./src/domain/shery-config.ts"; export * from "./src/features/background/shery-background-document.ts"; export * from "./src/features/background/background-fit.ts";',
    resolveDir: root,
  },
  bundle: true,
  platform: "node",
  format: "esm",
  write: false,
});
const { defaultSheryBackgroundConfig, sheryBackgroundDocument, backgroundCrop, backgroundTextureSize, uncroppedBackgroundShader } = await import(
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

test("background texture follows phone, tablet and desktop proportions within its memory limit", () => {
    for (const [width, height] of [
      [320, 1800], [390, 1800], [430, 1800], [844, 390],
      [768, 1500], [1024, 1366], [1366, 810], [1440, 810],
      [1920, 1080], [2560, 900], [3840, 2160],
    ]) {
      const target = backgroundTextureSize(width, height);
      assert.ok(Math.max(target.width, target.height) <= 1920);
      assert.ok(target.width > 0 && target.height > 0);
      assert.ok(Math.abs(target.width / target.height - width / height) < .002);
    }
});

test("the installed Shery shader loses its permanent edge-cropping zoom", () => {
  const shader = readFileSync(new URL("../../node_modules/sheryjs/src/shaders/effect5/fragment.glsl", import.meta.url), "utf8");
  const fitted = uncroppedBackgroundShader(shader);
  assert.notEqual(fitted, shader, "detect library shader changes that would restore cropping");
  assert.ok(fitted.includes("vec2 uv=vuv;"));
  assert.ok(!fitted.includes("vuv/1.1"));
});

test("cover keeps the centre and proportions when cropping either axis", () => {
  assert.deepEqual(backgroundCrop(2400, 1200, 600, 1200), { x: 900, y: 0, width: 600, height: 1200 });
  assert.deepEqual(backgroundCrop(2400, 1200, 2400, 600), { x: 0, y: 300, width: 2400, height: 600 });
  assert.deepEqual(backgroundCrop(2400, 1200, 1200, 600), { x: 0, y: 0, width: 2400, height: 1200 });
  for (const [width, height] of [[320, 1800], [844, 390], [768, 1500], [1440, 810], [3840, 2160]]) {
    const crop = backgroundCrop(1800, 2400, width, height);
    assert.ok(Math.abs(crop.width / crop.height - width / height) < 1e-8);
    assert.ok(Math.abs(crop.x + crop.width / 2 - 900) < 1e-8);
    assert.ok(Math.abs(crop.y + crop.height / 2 - 1200) < 1e-8);
    assert.ok(crop.width <= 1800 && crop.height <= 2400);
  }
});
