import test from "node:test";
import assert from "node:assert/strict";
import { buildSync } from "esbuild";
import { fileURLToPath } from "node:url";

const bundle = buildSync({
  stdin: {
    contents: 'export * from "./hero-motion.ts";',
    resolveDir: fileURLToPath(new URL("../src/widgets/home/", import.meta.url)),
  },
  bundle: true, platform: "node", format: "esm", write: false,
});
const {
  createHeroArrivalGuard, getHeroFrame, getHeroHandoffMetrics, getHeroLayout,
  getHeroLoopSlotCount, getHeroScrollMetrics, getHeroScrollOffset,
  getHeroScrollProgress, getHeroTravel, wrapHeroIndex,
} = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`);

const close = (actual, expected, message) => assert.ok(Math.abs(actual - expected) < 1e-9, message ?? `${actual} differs from ${expected}`);

test("phone scrolling reaches the next hero promptly regardless of catalog size", () => {
  for (const height of [390, 568, 740, 844]) {
    for (const count of [1, 2, 3, 6, 20]) {
      const metrics = getHeroScrollMetrics(height, count, true);
      close(metrics.distance, height * 1.35);
      close(metrics.sectionHeight, height + metrics.distance);
      for (let step = 0; step <= 100; step += 1) {
        const phase = step / 100;
        const offset = getHeroScrollOffset(phase, height, count, true);
        close(offset, phase * metrics.distance);
        close(getHeroScrollProgress(offset, height, count, true), phase);
      }
      assert.equal(getHeroScrollProgress(-50, height, count, true), 0);
      assert.equal(getHeroScrollProgress(metrics.distance + 50, height, count, true), 1);
    }
  }
  assert.ok(getHeroScrollMetrics(740, 6).distance > getHeroScrollMetrics(740, 6, true).distance * 2);
});

test("the mobile handoff retains its full crossfade but releases without a timed arrival pause", () => {
  for (const count of [1, 2, 6]) {
    const height = 740;
    const metrics = getHeroScrollMetrics(height, count, true);
    const handoff = getHeroHandoffMetrics(height, count, true);
    assert.equal(handoff.hold, 0);
    assert.equal(handoff.runway, handoff.lead);
    close(metrics.sectionHeight - handoff.overlap, handoff.start);
    close(handoff.start + handoff.runway, metrics.distance);
    close(handoff.revealEnd, getHeroScrollOffset(0.9, height, count, true));
    const guard = createHeroArrivalGuard();
    guard.arm();
    for (const offset of [handoff.start, handoff.revealEnd, handoff.end + 100, handoff.start - 100]) {
      assert.equal(guard.limit(offset, 0, handoff), offset, "touch momentum and reverse scrolling must not be held");
    }
  }
});

test("mobile vertical movement continues through the jar exit and reverses exactly", () => {
  assert.equal(getHeroTravel(0.8, 1, true), 0);
  for (const count of [2, 3, 6]) {
    close(getHeroTravel(0.5, count, true), 1.2);
    assert.ok(getHeroTravel(0.8, count, true) > getHeroTravel(0.5, count, true));
    const layout = getHeroLayout(390, 844);
    const manual = 2.35;
    for (const phase of [0, 0.2, 0.5, 0.7, 0.8]) {
      const frame = getHeroFrame(phase, count, true, manual, 0, layout, true);
      const translated = getHeroFrame(phase, count, true, manual + getHeroLoopSlotCount(count), 0, layout, true);
      frame.poses.forEach((pose, index) => {
        for (const key of Object.keys(pose)) close(translated.poses[index][key], pose[key]);
      });
      const reversePhase = getHeroScrollProgress(getHeroScrollOffset(phase, 844, count, true), 844, count, true);
      close(reversePhase, phase);
      assert.equal(frame.focus, wrapHeroIndex(Math.round(manual + phase * 2.4), count));
    }
  }
});

function visible(pose, width, height) {
  const reach = pose.height * height * (0.74 * Math.abs(Math.cos(pose.roll)) + Math.abs(Math.sin(pose.roll))) / (2 * width);
  return pose.x + reach > 0 && pose.x - reach < 1;
}

test("loop seams stay entirely offscreen, including small catalogs at the widest mobile layout", () => {
  for (const [width, height] of [[320, 568], [390, 844], [680, 805]]) {
    const layout = getHeroLayout(width, height);
    for (const count of [2, 3, 6]) {
      const slots = getHeroLoopSlotCount(count);
      assert.equal(slots % count, 0, "each repeated slot must map to its original product");
      for (const direction of [-1, 1]) {
        let previous = getHeroFrame(0, count, true, 0, 0, layout, true);
        for (let step = 1; step <= slots * 300; step += 1) {
          const frame = getHeroFrame(0, count, true, direction * step / 100, 0, layout, true);
          frame.poses.forEach((pose, index) => {
            const before = previous.poses[index];
            if (Math.abs(pose.x - before.x) > 0.1) {
              assert.equal(visible(before, width, height), false, `departing seam visible at ${width}px with ${count} jars`);
              assert.equal(visible(pose, width, height), false, `arriving seam visible at ${width}px with ${count} jars`);
            } else if (visible(before, width, height) || visible(pose, width, height)) {
              for (const key of ["x", "y", "height", "roll"]) assert.ok(Math.abs(pose[key] - before[key]) < 0.015, `${key} jumps during a visible swipe`);
            }
          });
          previous = frame;
        }
      }
    }
  }
});

test("repeated forward and backward turns keep the centered jar and counter in agreement", () => {
  const layout = getHeroLayout(390, 844);
  for (const count of [2, 3, 6]) {
    for (let slot = -count * 10; slot <= count * 10; slot += 1) {
      const frame = getHeroFrame(0, count, true, slot, 0, layout, true);
      const centered = frame.poses.findIndex((pose) => Math.abs(pose.x - 0.5) < 1e-9);
      assert.ok(centered >= 0);
      assert.equal(centered % count, wrapHeroIndex(slot, count));
      assert.equal(frame.focus, centered % count);
    }
  }
  assert.equal(getHeroLoopSlotCount(0), 0);
  assert.equal(getHeroLoopSlotCount(1), 1);
  assert.equal(getHeroLoopSlotCount(2), 4);
  assert.equal(getHeroLoopSlotCount(3), 6);
  assert.equal(getHeroFrame(0, 1, true, 999, 0, layout, true).poses.length, 1);
  assert.equal(getHeroFrame(0, 1, true, 999, 0, layout, true).poses[0].x, 0.5);
});
