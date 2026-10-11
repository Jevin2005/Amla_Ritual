import test from "node:test";
import assert from "node:assert/strict";
import { buildSync } from "esbuild";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = fileURLToPath(new URL("../", import.meta.url));
const bundle = buildSync({
  entryPoints: [`${root}src/features/rituals/ritual-navigation.ts`],
  bundle: true,
  platform: "browser",
  format: "iife",
  globalName: "ritualNavigation",
  write: false,
}).outputFiles[0].text;
const context = vm.createContext({});
vm.runInContext(bundle, context);

function fixture({ motion = true, animate = true, stagePresent = true } = {}) {
  const animations = [];
  const busyChanges = [];
  const commits = [];
  const events = [];
  let motionAllowed = motion;
  const stage = {
    ...(animate ? {
      animate(keyframes, options) {
        let resolve;
        let reject;
        let settled = false;
        const animation = {
          keyframes, options, cancelled: false, finished: new Promise((done, fail) => {
            resolve = done;
            reject = fail;
          }),
          finish() {
            if (settled) return;
            settled = true;
            resolve();
          },
          cancel() {
            this.cancelled = true;
            if (settled) return;
            settled = true;
            reject(new Error("Animation cancelled"));
          },
        };
        animations.push(animation);
        events.push(`animation:${animations.length}`);
        return animation;
      },
    } : {}),
  };
  const navigation = context.ritualNavigation.createQuizNavigation({
    getStage: () => stagePresent ? stage : null,
    motionEnabled: () => motionAllowed,
    onBusyChange: (busy) => { busyChanges.push(busy); },
    afterCommit: () => { events.push("afterCommit"); },
  });
  const commit = (label = "next") => () => { commits.push(label); events.push(`commit:${label}`); };
  return {
    navigation, animations, busyChanges, commits, events, commit,
    setMotion: (enabled) => { motionAllowed = enabled; },
  };
}

// Resolve both nested await continuations without relying on wall-clock timers.
async function flush() {
  for (let index = 0; index < 5; index++) await Promise.resolve();
}

test("rapid navigation requests commit only once until both transitions finish", async () => {
  const { navigation, animations, busyChanges, commits, commit } = fixture();
  const pending = navigation.navigate(commit(), "forward");
  assert.equal(navigation.busy, true);
  await navigation.navigate(commit("duplicate outgoing"), "forward");
  assert.equal(animations.length, 1);
  assert.deepEqual(commits, []);
  animations[0].finish();
  await flush();
  assert.deepEqual(commits, ["next"]);
  assert.equal(animations.length, 2);
  assert.equal(navigation.busy, true);
  await navigation.navigate(commit("duplicate incoming"), "forward");
  animations[1].finish();
  await pending;
  assert.deepEqual(commits, ["next"]);
  assert.deepEqual(busyChanges, [true, false]);
  assert.equal(navigation.busy, false);
});

test("forward transitions move left 12px in 140ms then enter from right in 220ms", async () => {
  const { navigation, animations, events, commit } = fixture();
  const pending = navigation.navigate(commit(), "forward");
  const outgoing = animations[0];
  assert.equal(outgoing.options.duration, 140);
  assert.equal(outgoing.keyframes[0].opacity, 1);
  assert.equal(outgoing.keyframes[0].transform, "translateX(0px)");
  assert.equal(outgoing.keyframes[1].opacity, 0);
  assert.equal(outgoing.keyframes[1].transform, "translateX(-12px)");
  outgoing.finish();
  await flush();
  const incoming = animations[1];
  assert.equal(outgoing.cancelled, true, "outgoing styles are removed before new content enters");
  assert.equal(incoming.options.duration, 220);
  assert.equal(incoming.keyframes[0].opacity, 0);
  assert.equal(incoming.keyframes[0].transform, "translateX(12px)");
  assert.equal(incoming.keyframes[1].opacity, 1);
  assert.equal(incoming.keyframes[1].transform, "translateX(0px)");
  for (const animation of animations) {
    assert.equal(animation.options.easing, "cubic-bezier(0.22, 1, 0.36, 1)");
    assert.equal(animation.options.fill, "both");
  }
  assert.deepEqual(events, ["animation:1", "commit:next", "afterCommit", "animation:2"]);
  incoming.finish();
  await pending;
  assert.equal(incoming.cancelled, true, "no transform is retained after entrance");
});

test("Back reverses both directions while preserving transition durations", async () => {
  const { navigation, animations, commit } = fixture();
  const pending = navigation.navigate(commit("back"), "back");
  assert.equal(animations[0].keyframes[1].transform, "translateX(12px)");
  assert.equal(animations[0].options.duration, 140);
  animations[0].finish();
  await flush();
  assert.equal(animations[1].keyframes[0].transform, "translateX(-12px)");
  assert.equal(animations[1].options.duration, 220);
  animations[1].finish();
  await pending;
});

test("reduced motion, missing animate and missing stage commit without movement", async () => {
  for (const preferences of [{ motion: false }, { animate: false }, { stagePresent: false }]) {
    const { navigation, animations, commits, busyChanges, events, commit } = fixture(preferences);
    await navigation.navigate(commit(), "forward");
    assert.deepEqual(commits, ["next"]);
    assert.deepEqual(events, ["commit:next", "afterCommit"]);
    assert.equal(animations.length, 0);
    assert.equal(navigation.busy, false);
    assert.deepEqual(busyChanges, [true, false]);
  }
});

test("enabling reduced motion during exit safely commits and skips entrance", async () => {
  const { navigation, animations, commits, busyChanges, setMotion, commit } = fixture();
  const pending = navigation.navigate(commit(), "forward");
  setMotion(false);
  navigation.finishMotion();
  await pending;
  assert.deepEqual(commits, ["next"]);
  assert.equal(animations.length, 1);
  assert.equal(animations[0].cancelled, true);
  assert.equal(navigation.busy, false);
  assert.deepEqual(busyChanges, [true, false]);
});

test("enabling reduced motion during entrance finishes without a second commit", async () => {
  const { navigation, animations, commits, setMotion, commit } = fixture();
  const pending = navigation.navigate(commit(), "forward");
  animations[0].finish();
  await flush();
  setMotion(false);
  navigation.finishMotion();
  await pending;
  assert.deepEqual(commits, ["next"]);
  assert.equal(animations[1].cancelled, true);
  assert.equal(navigation.busy, false);
});

test("disposal cancels outgoing animation and prevents late commits or callbacks", async () => {
  const { navigation, animations, commits, busyChanges, events, commit } = fixture();
  const pending = navigation.navigate(commit(), "forward");
  navigation.dispose();
  await pending;
  assert.equal(animations[0].cancelled, true);
  assert.deepEqual(commits, []);
  assert.deepEqual(events, ["animation:1"]);
  assert.deepEqual(busyChanges, [true], "disposed component receives no state update");
  assert.equal(navigation.busy, false);
  await navigation.navigate(commit("late"), "forward");
  navigation.finishMotion();
  assert.deepEqual(commits, []);
  assert.equal(animations.length, 1);
});

test("disposal during entrance cancels motion without repeating an existing commit", async () => {
  const { navigation, animations, commits, busyChanges, commit } = fixture();
  const pending = navigation.navigate(commit(), "forward");
  animations[0].finish();
  await flush();
  navigation.dispose();
  await pending;
  assert.equal(animations[1].cancelled, true);
  assert.deepEqual(commits, ["next"]);
  assert.deepEqual(busyChanges, [true]);
  assert.equal(navigation.busy, false);
});

test("results use only the outgoing stage motion so their own reveal is not transformed twice", async () => {
  const { navigation, animations, commits, events, commit } = fixture();
  const pending = navigation.navigate(commit("result"), "forward", true);
  animations[0].finish();
  await pending;
  assert.equal(animations.length, 1);
  assert.deepEqual(commits, ["result"]);
  assert.deepEqual(events, ["animation:1", "commit:result", "afterCommit"]);
  assert.equal(navigation.busy, false);
});

test("rejected animation finished promises cannot strand the navigation lock", async () => {
  const { navigation, animations, commits, busyChanges, commit } = fixture();
  const pending = navigation.navigate(commit(), "forward");
  animations[0].cancel();
  await flush();
  assert.deepEqual(commits, ["next"]);
  assert.equal(animations.length, 2);
  animations[1].cancel();
  await pending;
  assert.equal(navigation.busy, false);
  assert.deepEqual(busyChanges, [true, false]);

  const next = navigation.navigate(commit("next unlocked"), "forward", true);
  assert.equal(animations.length, 3);
  animations[2].finish();
  await next;
  assert.deepEqual(commits, ["next", "next unlocked"]);
  assert.deepEqual(busyChanges, [true, false, true, false]);
});
