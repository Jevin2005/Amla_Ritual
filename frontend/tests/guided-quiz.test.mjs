import test from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { fileURLToPath } from "node:url";
const bundle = await build({ entryPoints: [fileURLToPath(new URL("../src/features/rituals/guided-quiz.ts", import.meta.url))], bundle: true, platform: "node", format: "esm", write: false });
const { rankRitualProducts, ritualQuestions } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`);
const answers = { goal: "Cleanse", feel: "Oily", use: "Wash-day cleanse", experience: "First time", colour: "Natural / untreated" };
const product = (slug, overrides = {}) => ({ id: slug, slug, concerns: ["Cleanse"], ritualStep: "Cleanse", suitableFor: [], howTo: [], availableForSale: true, ...overrides });
test("five short steps require all valid answers before recommending", () => {
  assert.equal(ritualQuestions.length, 5);
  assert.ok(ritualQuestions.every((q) => q.options.length <= 4));
  assert.deepEqual(rankRitualProducts([product("a")], {}), []);
  assert.deepEqual(rankRitualProducts([product("a")], { ...answers, use: "invalid" }), []);
});
test("catalogue suitability ranks new products without handle-specific rules", () => {
  const oily = product("new-listing", { suitableFor: ["Oily hair", "Beginners"] });
  const dry = product("a", { suitableFor: ["Dry hair"] });
  assert.equal(rankRitualProducts([dry, oily], answers)[0].product, oily);
  assert.equal(rankRitualProducts([dry, oily], { ...answers, feel: "Dry", experience: "Occasionally" })[0].product, dry);
});
test("intended use and experience change the ranking", () => {
  const mask = product("mask", { ritualStep: "Condition", concerns: ["Scalp Ritual"], howTo: ["Apply a pre-wash mask"], suitableFor: ["Experienced users"] });
  const wash = product("wash", { concerns: ["Scalp Ritual"], suitableFor: ["Beginners"] });
  assert.equal(rankRitualProducts([mask, wash], { ...answers, goal: "Scalp Ritual", use: "Pre-wash mask", experience: "Regularly" })[0].product, mask);
  assert.equal(rankRitualProducts([mask, wash], { ...answers, goal: "Scalp Ritual", use: "Help me choose" })[0].product, wash);
});
test("no unrelated or unavailable fallback; colour answers preserve guidance", () => {
  assert.deepEqual(rankRitualProducts([product("sold", { availableForSale: false })], answers), []);
  const colour = product("colour", { ritualStep: "Colour", concerns: [] });
  assert.deepEqual(rankRitualProducts([colour], answers), []);
  assert.equal(rankRitualProducts([colour], { ...answers, goal: "Botanical Colour", colour: "Light / grey / bleached" })[0].requiresColourReview, true);
});
