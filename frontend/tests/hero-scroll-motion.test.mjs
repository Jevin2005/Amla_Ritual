import test from "node:test";
import assert from "node:assert/strict";
import { buildSync } from "esbuild";
import { fileURLToPath } from "node:url";

const result = buildSync({
  stdin: {
    contents: 'export * from "./hero-motion.ts";',
    resolveDir: fileURLToPath(new URL("../src/widgets/home/", import.meta.url)),
  },
  bundle: true,
  platform: "node",
  format: "esm",
  write: false,
});
const { createHeroArrivalGuard, getHeroFrame, getCoverScale, getHeroScrollMetrics, getHeroScrollProgress, getHeroScrollOffset, getHeroHandoffMetrics, getHeroLayout, getHeroBackdrop } = await import(
  `data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`
);

test("the incoming hero stays at its beginning through the full reveal and an arrival hold", () => {
  for (const height of [390, 568, 805, 900, 1440]) {
    for (const count of [1, 2, 6, 10]) {
      const story = getHeroScrollMetrics(height, count);
      const handoff = getHeroHandoffMetrics(height, count);
      const incomingStart = story.sectionHeight - handoff.overlap;
      assert.ok(Math.abs(incomingStart - getHeroScrollOffset(0.72, height, count)) < 1e-9);
      assert.ok(Math.abs(handoff.revealEnd - getHeroScrollOffset(0.9, height, count)) < 1e-9);
      assert.ok(handoff.end - story.distance >= 480 - 1e-9, "the fully revealed composition needs deliberate arrival room");
      assert.ok(handoff.end - story.distance <= 960 + 1e-9, "the arrival must not create a long scroll trap");
      assert.ok(Math.abs(incomingStart + handoff.runway - handoff.end) < 1e-9);
      // Native sticky geometry: its natural top is bounded by the viewport top
      // and by its containing section's bottom, including the trailing runway.
      for (const contentHeight of [height * 0.8, height, height * 2.8]) {
        const landingTop = (scrollY) => Math.min(Math.max(incomingStart - scrollY, 0), incomingStart + contentHeight + handoff.runway - scrollY - contentHeight);
        for (let step = 0; step <= 100; step += 1) {
          const scrollY = incomingStart + (handoff.end - incomingStart) * step / 100;
          assert.ok(Math.abs(landingTop(scrollY)) < 1e-9, `incoming top was cropped at ${height}px, ${count} jars, ${contentHeight}px content`);
          if (scrollY >= handoff.revealEnd) {
            const frame = getHeroFrame(getHeroScrollProgress(scrollY, height, count), count);
            assert.ok(Math.abs(frame.reveal - 1) < 1e-12, "the arrival hold must show the incoming composition completely");
          }
        }
      }
    }
  }
});

test("a fast gesture cannot skip the second hero and discarded momentum is never replayed", () => {
  for (const height of [390, 844, 1080]) {
    const metrics = getHeroHandoffMetrics(height, 6);
    const landing = metrics.end - metrics.hold;
    const guard = createHeroArrivalGuard();
    guard.arm();
    assert.equal(guard.limit(metrics.end + height * 3, 100, metrics), landing);
    assert.equal(guard.limit(metrics.end + 500, 1099, metrics), landing);
    assert.equal(guard.limit(landing, 1100, metrics), landing, "time alone does not move the page");
    assert.equal(guard.limit(metrics.end + 50, 1101, metrics), metrics.end + 50);
  }
});

test("slow arrival consumes the pause naturally, reverse scroll is free, and navigation bypasses it", () => {
  const metrics = getHeroHandoffMetrics(900, 6);
  const guard = createHeroArrivalGuard();
  assert.equal(guard.limit(metrics.end + 2000, 0, metrics), metrics.end + 2000, "restored positions are not trapped");
  guard.arm();
  assert.equal(guard.limit(metrics.revealEnd, 100, metrics), metrics.revealEnd);
  assert.equal(guard.limit(metrics.end + 10, 1200, metrics), metrics.end + 10);
  assert.equal(guard.limit(metrics.start - 1, 1300, metrics), metrics.start - 1);
  assert.equal(guard.limit(metrics.end + 10, 1400, metrics), metrics.end - metrics.hold, "returning from the first hero rearms the pause");
  assert.equal(guard.limit(metrics.revealEnd - 1, 1450, metrics), metrics.revealEnd - 1, "upward motion is immediate");
  guard.reset();
  assert.equal(guard.limit(metrics.end + 2000, 1500, metrics), metrics.end + 2000, "links and explicit jumps bypass the hold");
});

test("the incoming hero releases into native flow continuously, without a gap, in either direction", () => {
  for (const height of [390, 805, 1080]) {
    for (const count of [1, 6]) {
      const story = getHeroScrollMetrics(height, count);
      const handoff = getHeroHandoffMetrics(height, count);
      const start = story.sectionHeight - handoff.overlap;
      for (const contentHeight of [height, height * 2.5]) {
        const top = (scrollY) => Math.min(Math.max(start - scrollY, 0), start + handoff.runway - scrollY);
        const samples = [start - 60, start, handoff.revealEnd, story.distance, handoff.end, handoff.end + 60, handoff.end + contentHeight];
        for (const scrollY of [...samples, ...samples.toReversed()]) {
          const expected = scrollY < start ? start - scrollY : scrollY <= handoff.end ? 0 : handoff.end - scrollY;
          assert.ok(Math.abs(top(scrollY) - expected) < 1e-9, "reverse scrolling must retrace the same unclipped composition");
          if (scrollY >= handoff.end) {
            const followingTop = start + contentHeight + handoff.runway - scrollY;
            assert.ok(Math.abs(followingTop - (top(scrollY) + contentHeight)) < 1e-9, "the following section touches the departing hero with no blank runway");
          }
        }
        for (const boundary of [start, handoff.end]) {
          assert.ok(Math.abs(top(boundary - 0.001) - top(boundary + 0.001)) <= 0.002001, "pinning or release must not introduce a visual jump");
        }
      }
    }
  }
});

test("arrival geometry remains bounded when viewport or catalog measurements are invalid", () => {
  for (const height of [0, -1, Number.NaN, Infinity]) {
    for (const count of [0, -1, Number.NaN, Infinity]) {
      const handoff = getHeroHandoffMetrics(height, count);
      assert.ok(Object.values(handoff).every((value) => Number.isFinite(value) && value > 0));
      assert.ok(handoff.start < handoff.revealEnd && handoff.revealEnd < handoff.end);
    }
  }
});

test("each product receives the same measured scroll distance before the fixed final handoff", () => {
  const height = 962;
  const metrics = getHeroScrollMetrics(height, 6);
  const perProduct = metrics.travelDistance / 5;
  assert.ok(Math.abs(perProduct - 596.44) < 1e-10);
  assert.ok(perProduct > height * 0.4 * 1.5, "each jar should receive over 50% more scroll room than the previous pacing");
  assert.ok(Math.abs(metrics.finishDistance - 675.324) < 1e-10);
  assert.equal(metrics.distance, metrics.travelDistance + metrics.finishDistance);
  assert.equal(metrics.sectionHeight, height + metrics.distance);
  assert.equal(getHeroScrollMetrics(500, 6).travelDistance / 5, 380, "small screens retain a usable minimum travel distance");
  for (const compact of [false, true]) {
    const spacing = compact ? 0.68 : 0.37;
    for (let slot = 0; slot <= 5; slot += 0.25) {
      const frame = getHeroFrame(getHeroScrollProgress(slot * perProduct, height, 6), 6, compact);
      assert.ok(Math.abs(frame.poses[0].x - (0.5 - slot * spacing)) < 1e-12, `unequal product pacing at slot ${slot}`);
      if (Number.isInteger(slot)) {
        assert.ok(Math.abs(frame.poses[slot].x - 0.5) < 1e-12);
        assert.equal(frame.focus, slot);
      }
    }
  }
});

test("single-product physical scrolling preserves the original 1.35 viewport timeline", () => {
  for (const height of [390, 844, 962, 1080]) {
    for (const count of [0, 1]) {
      const metrics = getHeroScrollMetrics(height, count);
      assert.ok(Math.abs(metrics.travelDistance - height * 0.648) < 1e-10);
      assert.ok(Math.abs(metrics.distance - height * 1.35) < 1e-10);
      for (let step = 0; step <= 100; step += 1) {
        const phase = step / 100;
        assert.ok(Math.abs(getHeroScrollProgress(phase * height * 1.35, height, count) - phase) < 1e-12);
        assert.ok(Math.abs(getHeroScrollOffset(phase, height, count) - phase * height * 1.35) < 1e-10);
      }
    }
  }
});

test("more products preserve the physical cover, jar exit, and header handoff durations", () => {
  for (const height of [500, 962, 1080]) {
    for (const count of [2, 6, 10]) {
      for (const [start, end] of [[0.5, 0.7], [0.66, 0.86], [0.72, 0.9], [0.48, 1]]) {
        const duration = getHeroScrollOffset(end, height, count) - getHeroScrollOffset(start, height, count);
        const baseline = getHeroScrollOffset(end, height, 1) - getHeroScrollOffset(start, height, 1);
        assert.ok(Math.abs(duration - baseline) < 1e-9, `handoff ${start}–${end} changed with ${count} jars`);
      }
      for (let step = 0; step <= 100; step += 1) {
        const tailOffset = height * 0.702 * step / 100;
        const frame = getHeroFrame(getHeroScrollProgress(getHeroScrollMetrics(height, count).travelDistance + tailOffset, height, count), count);
        const baseline = getHeroFrame(getHeroScrollProgress(height * 0.648 + tailOffset, height, 1), 1);
        for (const key of ["expansion", "exit", "textOpacity", "reveal"]) {
          assert.ok(Math.abs(frame[key] - baseline[key]) < 1e-12, `${key} changed within the physical handoff`);
        }
      }
    }
  }
});

test("physical scroll mappings are reversible, monotonic, and clamped at both story ends", () => {
  for (const height of [500, 962]) {
    for (const count of [1, 2, 6, 10]) {
      const { distance } = getHeroScrollMetrics(height, count);
      let previous = 0;
      for (let step = 0; step <= 500; step += 1) {
        const offset = distance * step / 500;
        const phase = getHeroScrollProgress(offset, height, count);
        assert.ok(phase >= previous && phase <= 1);
        assert.ok(Math.abs(getHeroScrollOffset(phase, height, count) - offset) < 1e-8);
        const expectedPhase = step / 500;
        assert.ok(Math.abs(getHeroScrollProgress(getHeroScrollOffset(expectedPhase, height, count), height, count) - expectedPhase) < 1e-10);
        previous = phase;
      }
      for (let step = 500; step >= 0; step -= 1) {
        const phase = getHeroScrollProgress(distance * step / 500, height, count);
        assert.ok(phase <= previous, "scrolling backwards must retrace the finite story");
        previous = phase;
      }
      for (const before of [-Infinity, -100, Number.NaN]) {
        assert.equal(getHeroScrollProgress(before, height, count), 0);
        assert.equal(getHeroScrollOffset(before, height, count), 0);
      }
      for (const after of [distance + 1, Infinity]) assert.equal(getHeroScrollProgress(after, height, count), 1);
      for (const after of [1.01, Infinity]) assert.equal(getHeroScrollOffset(after, height, count), distance);
    }
  }
  for (const height of [0, -1, Number.NaN, Infinity]) {
    for (const count of [0, -1, Number.NaN, Infinity]) {
      const metrics = getHeroScrollMetrics(height, count);
      assert.ok(Object.values(metrics).every((value) => Number.isFinite(value) && value > 0));
      assert.equal(getHeroScrollProgress(metrics.distance, height, count), 1);
      assert.equal(getHeroScrollOffset(1, height, count), metrics.distance);
    }
  }
});

test("the longer product travel joins the existing final animation without a frame jump", () => {
  const height = 962;
  const count = 6;
  const { travelDistance, distance } = getHeroScrollMetrics(height, count);
  assert.equal(getHeroScrollProgress(travelDistance, height, count), 0.48);
  assert.equal(getHeroScrollOffset(0.48, height, count), travelDistance);
  for (const boundary of [0, travelDistance, distance]) {
    const before = getHeroFrame(getHeroScrollProgress(boundary - 0.000001, height, count), count);
    const after = getHeroFrame(getHeroScrollProgress(boundary + 0.000001, height, count), count);
    for (const key of ["expansion", "exit", "textOpacity", "reveal"]) assert.ok(Math.abs(after[key] - before[key]) < 0.0001);
    before.poses.forEach((pose, index) => {
      for (const key of Object.keys(pose)) assert.ok(Math.abs(after.poses[index][key] - pose[key]) < 0.0001, `${key} jumped at scroll offset ${boundary}`);
    });
  }
  const last = getHeroFrame(getHeroScrollProgress(travelDistance, height, count), count);
  assert.equal(last.poses.at(-1).x, 0.5);
  assert.equal(last.expansion, 0);
  assert.equal(last.exit, 0);
  assert.equal(last.poses.at(-1).opacity, 1);
});

test("neighboring jars have opposing gentle tilts that stay bounded while traveling", () => {
  const opening = getHeroFrame(0, 6);
  assert.equal(opening.poses[0].roll, -0.22);
  assert.ok(opening.poses[1].roll > 0, "the neighboring jar should lean opposite the central jar");
  for (const compact of [false, true]) {
    for (const speed of [-0.02, 0, 0.02]) {
      let previous = getHeroFrame(0, 6, compact, 0, speed);
      for (let step = 1; step <= 480; step += 1) {
        const frame = getHeroFrame(step / 1000, 6, compact, 0, speed);
        frame.poses.forEach((pose, index) => {
          assert.ok(Math.abs(pose.roll) <= 0.28, "readable labels should not exceed the restrained pre-exit tilt");
          assert.ok(Math.abs(pose.roll - previous.poses[index].roll) < 0.01, "alternating tilts must change continuously");
        });
        previous = frame;
      }
    }
  }
});

test("responsive layout keeps jars within readable viewport bounds across portrait, landscape, and large screens", () => {
  for (const [width, height] of [[320, 568], [330, 480], [320, 740], [390, 844], [768, 1024], [844, 390], [1024, 768], [1440, 900], [1920, 1080], [2560, 1440]]) {
    const layout = getHeroLayout(width, height);
    const frame = getHeroFrame(0, 6, width < 680, 0, 0, layout);
    const central = frame.poses[0];
    const pixels = central.height * height;
    assert.ok(pixels <= height * 0.6 + 1e-10);
    assert.ok(pixels <= width * 0.9 + 1e-10, "narrow screens must constrain jar height by their available width");
    assert.ok(pixels <= 640 + 1e-10, "large monitors must not inflate the product indefinitely");
    assert.ok(pixels * 0.74 > Math.min(width * 0.35, height * 0.3, 400), "the central product remains large enough to read");
    assert.equal(central.x, 0.5);
    assert.ok(central.y - central.height / 2 > 0.14, "the central jar needs space below the header");
    assert.ok(central.y + central.height / 2 < 0.91);
    assert.ok(layout.spacing >= 0.34 - 1e-12 && layout.spacing <= 0.6);
    assert.ok(layout.centerY >= 0.44 - 1e-12 && layout.centerY <= 0.6 + 1e-12);
    assert.ok(layout.waveAmplitude >= 0.035 && layout.waveAmplitude <= 0.07 + 1e-12);
    assert.ok(frame.poses[1].height < central.height);
    assert.ok(frame.poses.at(-1).height >= central.height * 0.58, "side products must remain recognizable");
    assert.deepEqual(getHeroFrame(0.25, 6, false, 0.2, 0, layout), getHeroFrame(0.25, 6, true, 0.2, 0, layout), "an explicit layout must not inherit the old compact breakpoint");
  }
  for (const dimension of [0, -1, Infinity, Number.NaN]) {
    assert.ok(Object.values(getHeroLayout(dimension, dimension)).every((value) => Number.isFinite(value) && value > 0));
  }
});

test("responsive sizing and positioning change continuously across the old 680px breakpoint", () => {
  for (const height of [600, 900, 1100]) {
    let previousLayout = getHeroLayout(670, height);
    let previousFrame = getHeroFrame(0.2, 6, true, 0, 0, previousLayout);
    for (let width = 670.25; width <= 690; width += 0.25) {
      const layout = getHeroLayout(width, height);
      const frame = getHeroFrame(0.2, 6, width < 680, 0, 0, layout);
      for (const key of Object.keys(layout)) assert.ok(Math.abs(layout[key] - previousLayout[key]) < 0.001, `${key} jumps near width ${width}`);
      frame.poses.forEach((pose, index) => {
        for (const key of ["x", "y", "height"]) assert.ok(Math.abs(pose[key] - previousFrame.poses[index][key]) < 0.001, `${key} jumps for jar ${index} at width ${width}`);
      });
      previousLayout = layout;
      previousFrame = frame;
    }
  }
});

test("single and multiple jars match the six supplied reference widths", () => {
  const fixtures = [[320, 179.2], [375, 210], [425, 238], [768, 476.16], [1024, 483], [1440, 402.5]];
  for (const [width, expectedPixels] of fixtures) {
    const height = 805;
    const layout = getHeroLayout(width, height);
    for (const count of [1, 6]) {
      const central = getHeroFrame(0, count, width < 680, 0, 0, layout).poses[0];
      assert.ok(Math.abs(central.height * height - expectedPixels) < 1e-10, `${width}px width should use the reference product scale with ${count} jars`);
      assert.equal(central.x, 0.5);
      assert.equal(central.opacity, 1);
    }
    if (width <= 425) {
      assert.ok(layout.centerHeight < 0.3, "phone jars leave the broad breathing room visible in the reference");
      const neighbor = getHeroFrame(0, 6, true, 0, 0, layout).poses[1];
      const reach = neighbor.height * height * (0.74 * Math.abs(Math.cos(neighbor.roll)) + Math.abs(Math.sin(neighbor.roll))) / (2 * width);
      assert.ok(neighbor.x > 1 && neighbor.x - reach < 1, "the next jar should remain partially visible at the phone edge");
    }
  }
});

test("reference layout and backdrop transitions stay continuous at every width boundary", () => {
  for (const width of [480, 680, 768, 1024, 1280]) {
    for (const height of [480, 805, 1100]) {
      const before = getHeroLayout(width - 0.001, height);
      const after = getHeroLayout(width + 0.001, height);
      for (const key of Object.keys(before)) assert.ok(Math.abs(after[key] - before[key]) < 0.00001, `${key} jumps at width ${width}`);
      for (const count of [1, 6]) {
        const first = getHeroFrame(0.24, count, width < 680, 0, 0, before);
        const second = getHeroFrame(0.24, count, width >= 680, 0, 0, after);
        first.poses.forEach((pose, index) => {
          for (const key of ["x", "y", "height"]) assert.ok(Math.abs(pose[key] - second.poses[index][key]) < 0.0001, `${count}-jar ${key} jumps at width ${width}`);
        });
      }
      const firstBackdrop = getHeroBackdrop(width - 0.001, height);
      const secondBackdrop = getHeroBackdrop(width + 0.001, height);
      for (const key of Object.keys(firstBackdrop)) assert.ok(Math.abs(firstBackdrop[key] - secondBackdrop[key]) < 0.01, `${key} jumps at width ${width}`);
    }
  }
});

test("responsive seal and arc fit short screens and their expansion covers every viewport corner", () => {
  const sizes = [[320, 805], [375, 805], [425, 805], [768, 805], [1024, 805], [1440, 805], [330, 480], [320, 568], [844, 390], [2560, 1440]];
  for (const [width, height] of sizes) {
    const backdrop = getHeroBackdrop(width, height);
    assert.ok(Object.values(backdrop).every((value) => Number.isFinite(value) && value > 0));
    assert.equal(backdrop.arcTop, backdrop.top);
    assert.equal(backdrop.arcSize, backdrop.diameter, "the text contour and seal must share the same coordinate space");
    assert.ok(backdrop.arcSize <= height * 1.12 + 1e-10);
    assert.ok(backdrop.top + backdrop.diameter * 0.4 <= height - 74 + 1e-10, "the full upper title arc must clear the footer on short screens");
    const centerY = backdrop.top + backdrop.diameter / 2;
    const scale = getCoverScale(width, height, backdrop.diameter, centerY);
    const innerRadius = backdrop.diameter * 0.44 * scale;
    for (const x of [0, width]) for (const y of [0, height]) {
      assert.ok(Math.hypot(x - width / 2, y - centerY) < innerRadius, `${width}x${height} must be fully covered before revealing the lower hero`);
    }
  }
  assert.ok(Math.abs(getHeroBackdrop(320, 805).diameter - 371.2) < 1e-10);
});

test("short landscape viewports reserve header space throughout the foreground label wave", () => {
  for (const [width, height] of [[844, 390], [1024, 600]]) {
    const layout = getHeroLayout(width, height);
    const headerBottom = Math.min(120, height * 0.27);
    assert.ok(layout.centerY > 0.46, "short viewports must lower the jar path below the navigation");
    for (let step = 0; step <= 480; step += 1) {
      const frame = getHeroFrame(step / 1000, 6, false, 0, 0, layout);
      for (const pose of frame.poses) {
        if (pose.x < 0.15 || pose.x > 0.85) continue;
        // Reserve the upper fifth for the lid and conservatively bound the
        // remaining label area, including its rotated outer corners.
        const labelTop = (pose.y - pose.height * (0.3 * Math.cos(pose.roll) + 0.37 * Math.abs(Math.sin(pose.roll)))) * height;
        assert.ok(labelTop > headerBottom, `a foreground label enters the header at ${width}x${height}, phase ${step / 1000}`);
      }
    }
  }
  const ordinary = getHeroLayout(1440, 900);
  const portrait = getHeroLayout(390, 844);
  assert.equal(ordinary.centerY, 0.44);
  assert.ok(Math.abs(portrait.centerY - 0.45) < 1e-12);
  for (let height = 350; height < 900; height += 1) {
    assert.ok(Math.abs(getHeroLayout(844, height).centerY - getHeroLayout(844, height + 1).centerY) < 0.002, "navigation clearance must change continuously with viewport height");
  }
});

test("the responsive product path rises and falls along a visible continuous sine wave", () => {
  for (const [width, height] of [[390, 844], [768, 1024], [1440, 900]]) {
    const layout = getHeroLayout(width, height);
    const poseAtOffset = (offset) => getHeroFrame(0, 6, false, 2 - offset, 0, layout).poses[2];
    const peak = Math.PI / (2 * 1.35);
    const middle = poseAtOffset(0);
    const low = poseAtOffset(peak);
    const high = poseAtOffset(-peak);
    assert.ok(low.y - high.y >= 0.069999, "the wave should remain visible on a narrow screen");
    assert.ok(low.y > middle.y && high.y < middle.y);
    assert.ok(low.x > middle.x && high.x < middle.x);
    assert.ok(Math.abs(poseAtOffset(peak * 2).y - middle.y) < 1e-12, "the path must return to its baseline rather than remain a diagonal");
    assert.ok(low.height < middle.height && high.height < middle.height, "foreground prominence should grow as each product approaches the center");
    let previous = poseAtOffset(-3);
    for (let step = 1; step <= 600; step += 1) {
      const pose = poseAtOffset(-3 + step / 100);
      assert.ok(Math.abs(pose.y - previous.y) < 0.001, "the wave must stay continuous while dragging or scrolling");
      assert.ok(pose.y - pose.height / 2 > 0.1 && pose.y + pose.height / 2 < 0.75);
      previous = pose;
    }
  }
});

test("responsive jars preserve the finite final product, exit, and lower-hero reveal", () => {
  for (const [width, height] of [[320, 740], [390, 844], [768, 1024], [844, 390], [1440, 900], [2560, 1440]]) {
    const layout = getHeroLayout(width, height);
    const finalProduct = getHeroFrame(0.48, 6, false, 0, 0, layout);
    assert.equal(finalProduct.poses.at(-1).x, 0.5);
    assert.equal(finalProduct.poses.at(-1).height, Math.max(...finalProduct.poses.map((pose) => pose.height)));
    assert.equal(finalProduct.poses.at(-1).opacity, 1);
    assert.equal(finalProduct.expansion, 0);
    assert.equal(finalProduct.exit, 0);
    for (let step = 0; step <= 1000; step += 1) {
      const phase = step / 1000;
      const frame = getHeroFrame(phase, 6, false, 0, 0, layout);
      const baseline = getHeroFrame(phase, 6);
      for (const key of ["expansion", "exit", "textOpacity", "reveal", "progress"]) assert.equal(frame[key], baseline[key]);
      assert.ok(frame.poses.every((pose) => pose.height > 0));
      const finalJar = frame.poses.at(-1);
      if (finalJar.opacity === 0 || finalJar.y + finalJar.height / 2 <= 0) assert.ok(frame.reveal > 0, "clearing the final jar must not expose an empty section");
    }
    const end = getHeroFrame(1, 6, false, 0, 0, layout);
    assert.ok(end.poses.every((pose) => pose.opacity === 0 && pose.y + pose.height / 2 < 0));
    assert.equal(end.reveal, 1);
    assert.deepEqual(getHeroFrame(2, 6, false, 0, 0, layout), end);
    const single = getHeroFrame(0.24, 1, false, 0, 0, layout);
    assert.equal(single.poses[0].height, layout.centerHeight * 0.955, "a single enabled jar uses the same responsive size");
    assert.equal(single.poses[0].y, layout.centerY - 0.0175);
    assert.deepEqual(single, getHeroFrame(0.24, 1, true, 0, 0, layout), "responsive single-jar sizing does not depend on the old compact breakpoint");
  }
});

test("scrolling outside the story holds its opening or completed frame", () => {
  for (const [count, compact] of [[1, false], [1, true], [6, false], [6, true]]) {
    const opening = getHeroFrame(0, count, compact);
    const completed = getHeroFrame(1, count, compact);
    for (const progress of [-100, -1, -0.001]) {
      assert.deepEqual(getHeroFrame(progress, count, compact), opening);
    }
    for (const progress of [1.001, 2, 100]) {
      assert.deepEqual(getHeroFrame(progress, count, compact), completed);
    }
    assert.notDeepEqual(completed.poses, opening.poses, "the story must not wrap back to its opening");
  }
});

test("the supplied single jar remains visible through its gentle drift before returning to center", () => {
  for (const compact of [false, true]) {
    let maximumX = 0;
    for (let step = 0; step <= 48; step += 1) {
      const frame = getHeroFrame(step / 100, 1, compact);
      const jar = frame.poses[0];
      maximumX = Math.max(maximumX, jar.x);
      assert.ok(jar.x >= 0.5 && jar.x <= 0.6);
      assert.ok(jar.y - jar.height / 2 > 0 && jar.y + jar.height / 2 < 1);
      assert.equal(jar.opacity, 1);
      assert.equal(frame.exit, 0);
    }
    assert.ok(maximumX > 0.52, "scroll should gently move the supplied jar");
    assert.ok(Math.abs(getHeroFrame(0.48, 1, compact).poses[0].x - 0.5) < 0.0001);
  }
});

test("the last product reaches the central foreground before the cover or exit starts", () => {
  for (const count of [3, 4, 6, 10]) {
    for (const compact of [false, true]) {
      const frame = getHeroFrame(0.48, count, compact);
      const finalJar = frame.poses.at(-1);
      assert.ok(Math.abs(finalJar.x - 0.5) < 0.001, `last jar must reach center for ${count} products`);
      assert.equal(finalJar.height, Math.max(...frame.poses.map((pose) => pose.height)));
      assert.equal(finalJar.opacity, 1);
      assert.equal(frame.expansion, 0);
      assert.equal(frame.exit, 0);
    }
  }
});

test("the single-jar visual baseline stays unchanged and ignores multi-product input", () => {
  const desktop = [
    [0, { x: 0.5, y: 0.405, height: 0.55, roll: -0.22, opacity: 1 }],
    [0.24, { x: 0.585, y: 0.3875, height: 0.5275, roll: -0.155, opacity: 1 }],
    [0.48, { x: 0.5, y: 0.37, height: 0.505, roll: -0.09, opacity: 1 }],
    [0.8, { x: 0.5, y: -0.6884, height: 0.505, roll: 0.24712, opacity: 0.7407407407407407 }],
    [1, { x: 0.5, y: -0.98, height: 0.505, roll: 0.34, opacity: 0 }],
  ];
  const mobile = [
    [0, { x: 0.5, y: 0.395, height: 0.48, roll: -0.22, opacity: 1 }],
    [0.24, { x: 0.525, y: 0.3775, height: 0.4575, roll: -0.155, opacity: 1 }],
    [0.48, { x: 0.5, y: 0.36, height: 0.435, roll: -0.09, opacity: 1 }],
    [1, { x: 0.5, y: -0.99, height: 0.435, roll: 0.34, opacity: 0 }],
  ];
  for (const [compact, fixtures] of [[false, desktop], [true, mobile]]) {
    for (const [progress, expected] of fixtures) {
      const frame = getHeroFrame(progress, 1, compact);
      for (const [key, value] of Object.entries(expected)) assert.ok(Math.abs(frame.poses[0][key] - value) < 1e-12, `${key} changed at ${progress}`);
      assert.equal(frame.poses[0].brightness, 1);
      assert.equal(frame.poses[0].depthBlur, 0);
      assert.deepEqual(getHeroFrame(progress, 1, compact, 3, 0.015), frame);
    }
  }
});

test("six jars preserve the established Amla opening position, size, and tilt", () => {
  for (const compact of [false, true]) {
    const single = getHeroFrame(0, 1, compact);
    const six = getHeroFrame(0, 6, compact);
    assert.deepEqual(six.poses[0], single.poses[0]);
    assert.equal(six.focus, 0);
    assert.ok(six.poses[1].height < six.poses[0].height);
    assert.ok(six.poses[1].brightness < six.poses[0].brightness);
    assert.ok(six.poses[1].depthBlur > 0);
    assert.equal(six.poses[0].depthBlur, 0, "the central product label stays sharp at rest");
  }
});

test("catalog size and manual jar movement cannot retime the cover, text, header reveal, or exit", () => {
  for (const compact of [false, true]) {
    for (let step = 0; step <= 100; step += 1) {
      const progress = step / 100;
      const baseline = getHeroFrame(progress, 1, compact);
      for (const count of [2, 6, 10]) {
        const frame = getHeroFrame(progress, count, compact, 0.75, -0.005);
        for (const key of ["expansion", "exit", "textOpacity", "reveal", "progress"]) assert.equal(frame[key], baseline[key]);
        for (const pose of frame.poses) assert.equal(pose.opacity, baseline.poses[0].opacity);
      }
    }
  }
});

test("manual offset moves the existing product band without copies, wrapping, or timeline changes", () => {
  for (const compact of [false, true]) {
    const spacing = compact ? 0.68 : 0.37;
    const rest = getHeroFrame(0, 6, compact);
    const shifted = getHeroFrame(0, 6, compact, 1);
    assert.equal(shifted.poses.length, 6);
    assert.equal(shifted.focus, 1);
    assert.equal(shifted.poses[1].x, 0.5);
    assert.equal(shifted.poses[1].brightness, 1);
    assert.equal(shifted.poses[1].depthBlur, 0);
    shifted.poses.forEach((pose, index) => {
      assert.ok(Math.abs(pose.x - (rest.poses[index].x - spacing)) < 1e-12);
      if (index > 0) assert.ok(pose.x > shifted.poses[index - 1].x);
    });
    const beyond = getHeroFrame(0, 6, compact, 7);
    assert.ok(beyond.poses.every((pose) => pose.x < 0.5), "manual positioning must not silently wrap the finite band");
    assert.deepEqual(getHeroFrame(0, 6, compact, 0), rest);
    assert.deepEqual(getHeroFrame(0, 6, compact, Number.NaN, Number.POSITIVE_INFINITY), rest);
  }
});

test("travel tilt follows input direction and blur stays restrained then clears at rest", () => {
  for (const compact of [false, true]) {
    const rest = getHeroFrame(0, 6, compact, 2);
    const left = getHeroFrame(0, 6, compact, 2, 0.005);
    const right = getHeroFrame(0, 6, compact, 2, -0.005);
    assert.ok(left.poses[2].roll > rest.poses[2].roll);
    assert.ok(right.poses[2].roll < rest.poses[2].roll);
    assert.ok(Math.abs(left.poses[2].roll - rest.poses[2].roll + right.poses[2].roll - rest.poses[2].roll) < 1e-12);
    assert.ok(left.poses[2].depthBlur > 0);
    assert.equal(left.poses[2].depthBlur, right.poses[2].depthBlur);
    assert.equal(rest.poses[2].depthBlur, 0);
    for (const speed of [-1, -0.005, 0, 0.005, 1]) {
      const frame = getHeroFrame(0, 6, compact, 2, speed);
      frame.poses.forEach((pose, index) => {
        assert.ok(pose.brightness >= 0.9 && pose.brightness <= 1);
        assert.ok(pose.depthBlur >= 0 && pose.depthBlur <= 1.5);
        assert.ok(Math.abs(pose.roll - rest.poses[index].roll) <= 0.100000000001);
        for (const key of ["x", "y", "height", "opacity"]) assert.equal(pose[key], rest.poses[index][key]);
      });
      assert.ok(getHeroFrame(1, 6, compact, 2, speed).poses.every((pose) => pose.roll === 0.34 && pose.opacity === 0));
    }
  }
});

test("empty, single-product, and two-product catalogs produce finite poses", () => {
  for (const count of [0, 1, 2]) {
    for (const compact of [false, true]) {
      for (const progress of [-1, 0, 0.2, 0.5, 0.72, 0.9, 1, 2]) {
        const frame = getHeroFrame(progress, count, compact);
        assert.equal(frame.poses.length, count);
        for (const [key, value] of Object.entries(frame)) {
          if (key !== "poses") assert.ok(Number.isFinite(value), `${key} should be finite with ${count} products`);
        }
        for (const pose of frame.poses) {
          for (const [key, value] of Object.entries(pose)) {
            assert.ok(Number.isFinite(value), `${key} should be finite with ${count} products`);
          }
          assert.ok(pose.height > 0);
          assert.ok(pose.opacity >= 0 && pose.opacity <= 1);
        }
      }
    }
  }
});

test("each jar travels left continuously, preserving order without a carousel wrap", () => {
  for (const compact of [false, true]) {
    let previous = getHeroFrame(0, 6, compact);
    for (let step = 1; step <= 200; step += 1) {
      const current = getHeroFrame(step / 200, 6, compact);
      current.poses.forEach((pose, index) => {
        assert.ok(pose.x <= previous.poses[index].x + 1e-12, `jar ${index} moved right at step ${step}`);
        if (index > 0) assert.ok(pose.x > current.poses[index - 1].x, "product order must be preserved");
      });
      previous = current;
    }
  }
});

test("all products finish above the viewport and invisible", () => {
  for (const count of [1, 2, 4, 8]) {
    for (const compact of [false, true]) {
      const frame = getHeroFrame(1, count, compact);
      assert.equal(frame.expansion, 1);
      assert.equal(frame.exit, 1);
      assert.equal(frame.textOpacity, 0);
      for (const pose of frame.poses) {
        assert.ok(pose.y + pose.height / 2 < 0, "the entire jar must clear the viewport top");
        assert.equal(pose.opacity, 0);
      }
    }
  }
});

test("expanded scalloped cover encloses all four desktop and portrait corners", () => {
  const screens = [
    { width: 1586, height: 992, diameter: 1480, centerY: 1310 },
    { width: 1920, height: 1080, diameter: 1720, centerY: 1450 },
    { width: 390, height: 844, diameter: 760, centerY: 900 },
    { width: 768, height: 1024, diameter: 1100, centerY: 1180 },
  ];
  for (const { width, height, diameter, centerY } of screens) {
    const scale = getCoverScale(width, height, diameter, centerY);
    // The scallop's narrowest radius is 44% of the unscaled diameter.
    const innerRadius = diameter * 0.44 * scale;
    assert.ok(Number.isFinite(scale) && scale > 0);
    for (const x of [0, width]) {
      for (const y of [0, height]) {
        assert.ok(Math.hypot(x - width / 2, y - centerY) < innerRadius,
          `${width}x${height} corner (${x}, ${y}) remains outside the cover`);
      }
    }
  }
});

test("travel, text fade, cover expansion, product exit, and section reveal have no positional jumps", () => {
  const epsilon = 0.000001;
  for (const [count, compact] of [[1, false], [1, true], [6, false], [6, true]]) {
    for (const boundary of [0, 0.44, 0.48, 0.5, 0.6, 0.66, 0.68, 0.7, 0.72, 0.73, 0.76, 0.77, 0.78, 0.81, 0.86, 0.89, 0.9, 0.93, 0.94, 0.965, 0.98, 1]) {
      const before = getHeroFrame(boundary - epsilon, count, compact);
      const after = getHeroFrame(boundary + epsilon, count, compact);
      for (const key of ["expansion", "exit", "textOpacity", "reveal"]) {
        assert.ok(Math.abs(after[key] - before[key]) < 0.0001, `${key} jumps at ${boundary}`);
      }
      before.poses.forEach((pose, index) => {
        for (const key of Object.keys(pose)) {
          assert.ok(Math.abs(after.poses[index][key] - pose[key]) < 0.0001,
            `jar ${index} ${key} jumps at ${boundary}`);
        }
      });
    }
  }
});

test("the next hero is revealed during the jar exit, with no empty final hold", () => {
  for (const [count, compact] of [[1, false], [1, true], [6, false], [6, true]]) {
    let previousReveal = 0;
    for (let step = 0; step <= 1000; step += 1) {
      const frame = getHeroFrame(step / 1000, count, compact);
      const lastJar = frame.poses.at(-1);
      assert.ok(frame.reveal >= previousReveal && frame.reveal <= 1);
      if (frame.reveal > 0) assert.equal(frame.expansion, 1, "the seal should cover the screen before revealing the next hero");
      if (lastJar.opacity === 0) assert.ok(frame.reveal > 0, "an invisible jar must not leave an opaque empty stage");
      if (lastJar.y + lastJar.height / 2 <= 0) assert.ok(frame.reveal > 0, "the next hero must appear before the jar clears the screen");
      previousReveal = frame.reveal;
    }
    assert.equal(getHeroFrame(0.72, count, compact).reveal, 0);
    const overlap = getHeroFrame(0.8, count, compact);
    assert.ok(overlap.reveal > 0 && overlap.poses.at(-1).opacity > 0);
    assert.equal(getHeroFrame(0.9, count, compact).reveal, 1, "the next hero is clear before its header-offset anchor is reached");
    assert.equal(getHeroFrame(1, count, compact).reveal, 1);
  }
});
