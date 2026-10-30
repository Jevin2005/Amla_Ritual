// Run against a local preview: npm run test:scroll-layout --workspace=frontend
// Requires Playwright and its browsers. PLAYWRIGHT_MODULE may point to an
// existing installation; BROWSER_CHANNEL selects an installed Chromium channel.
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const require = createRequire(import.meta.url);
const playwright = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const baseURL = process.env.SCROLL_TEST_URL || "http://localhost:3000";
const output = resolve(process.env.SCROLL_TEST_OUTPUT || "../.tmp/scroll-layout");
await mkdir(output, { recursive: true });
const profiles = [
  ["small-phone", 320, 568], ["phone", 390, 844],
  ["tablet", 768, 1024], ["tablet-large", 820, 1180],
  ["tablet-portrait", 1024, 1366], ["tablet-landscape", 1024, 768],
  ["phone-landscape", 844, 390], ["desktop", 1440, 900],
];
const close = (actual, expected, message) => assert.ok(Math.abs(actual - expected) <= 2, `${message}: ${actual} vs ${expected}`);

for (const engine of (process.env.SCROLL_TEST_BROWSERS || "chromium,webkit").split(",")) {
  const browser = await playwright[engine].launch({
    headless: true,
    ...(engine === "chromium" && process.env.BROWSER_CHANNEL ? { channel: process.env.BROWSER_CHANNEL } : {}),
  });
  try {
    for (const [name, width, height] of profiles) {
      const page = await browser.newPage({ viewport: { width, height }, isMobile: name !== "desktop", hasTouch: name !== "desktop" });
      try {
        await page.goto(baseURL, { waitUntil: "domcontentloaded" });
        await page.waitForSelector('[data-ritual-hero][data-handoff="true"]');
        await page.waitForFunction(() => document.fonts.status === "loaded");
        const geometry = () => page.evaluate(() => {
          const rect = (el) => {
            const r = el.getBoundingClientRect();
            return { top: r.top, bottom: r.bottom, height: r.height, width: r.width };
          };
          const hero = document.querySelector("[data-ritual-hero]");
          const stage = hero.querySelector('[class*="_stage"]');
          const previous = document.querySelector("[data-previous-hero]");
          const landing = previous.firstElementChild;
          const background = landing.firstElementChild;
          const style = getComputedStyle(previous);
          return {
            y: scrollY, height: innerHeight, width: document.documentElement.clientWidth,
            scrollWidth: document.documentElement.scrollWidth,
            hero: rect(hero), stage: rect(stage), previous: rect(previous), landing: rect(landing),
            background: rect(background), collection: rect(document.querySelector("#botanical-collection")),
            runway: parseFloat(style.getPropertyValue("--arrival-runway")),
            lead: parseFloat(style.getPropertyValue("--arrival-lead")),
            previousOpacity: Number(style.opacity), previousTransform: style.transform,
            stageOpacity: Number(getComputedStyle(stage).opacity),
          };
        });
        const scroll = async (y) => {
          await page.evaluate(y => window.scrollTo({ top: y, behavior: "instant" }), y);
          // Let scroll/resize observers and the animation frame commit, without
          // waiting out entrance animations that could hide an actual crack.
          await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
          return geometry();
        };
        const opening = await geometry();
        const finish = opening.hero.height - opening.stage.height;
        const start = opening.previous.top + opening.y;
        const release = start + opening.runway;
        for (const y of [0, finish * .15, finish * .6, start + opening.lead * .5, finish, release - 2, release + height * .5, release + height, finish, 400, 0]) {
          const g = await scroll(y);
          assert.ok(g.scrollWidth <= g.width + 1, `${engine}/${name}: horizontal page overflow`);
          assert.equal(g.previousOpacity, 1, `${engine}/${name}: generic reveal hid the incoming hero`);
          assert.equal(g.previousTransform, "none", `${engine}/${name}: generic reveal moved the sticky scene`);
          if (g.y <= finish) {
            close(g.stage.top, 0, `${engine}/${name}: outgoing sticky top`);
            close(g.stage.bottom, g.height, `${engine}/${name}: outgoing viewport coverage`);
          }
          if (g.y >= start && g.y <= release) {
            close(g.landing.top, 0, `${engine}/${name}: incoming sticky top`);
            assert.ok(g.landing.bottom >= g.height - 2, `${engine}/${name}: exposed arrival runway`);
          }
          close(g.background.top, g.landing.top, `${engine}/${name}: background top`);
          close(g.background.bottom, g.landing.bottom, `${engine}/${name}: background bottom`);
          if (g.y > release) close(g.collection.top, g.landing.bottom, `${engine}/${name}: gap before collection`);
        }
        // Resize while scrolled: browser chrome changes and orientation changes.
        await scroll(finish * .4);
        for (const size of [{ width, height: height + 90 }, { width: height, height: width }, { width, height }]) {
          await page.setViewportSize(size);
          const g = await scroll(300);
          close(g.stage.top, 0, `${engine}/${name}: sticky top after resize`);
          close(g.stage.bottom, size.height, `${engine}/${name}: viewport coverage after resize`);
          assert.ok(g.scrollWidth <= g.width + 1, `${engine}/${name}: overflow after resize`);
        }
        await scroll(0);
        await page.screenshot({ path: resolve(output, `${engine}-${name}-opening.png`) });
        const resized = await geometry();
        await scroll(resized.previous.top + resized.y + resized.lead + 10);
        await page.screenshot({ path: resolve(output, `${engine}-${name}-arrival.png`) });
        await page.emulateMedia({ reducedMotion: "reduce" });
        await scroll(0);
        const reduced = await geometry();
        close(reduced.previous.top, reduced.stage.bottom, `${engine}/${name}: reduced-motion section continuity`);
        assert.equal(reduced.previousOpacity, 1);
        // Walk the rest of the page to catch horizontal overflow from late media.
        const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight);
        for (let y = 0; y < pageHeight; y += height * .8) {
          const g = await scroll(y);
          assert.ok(g.scrollWidth <= g.width + 1, `${engine}/${name}: overflow at ${y}`);
        }
        console.log(`PASS ${engine}/${name} ${width}×${height}: scroll, reverse, resize, backgrounds, reduced motion`);
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }
}
