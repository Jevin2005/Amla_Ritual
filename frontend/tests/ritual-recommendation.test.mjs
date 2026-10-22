import test from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { fileURLToPath } from "node:url";

const bundle = await build({
  entryPoints: [fileURLToPath(new URL("../src/features/rituals/recommendation.ts", import.meta.url))],
  bundle: true, platform: "node", format: "esm", write: false,
});
const { recommendRitual, goalOptions, hairFeels, catalogueGoalOptions } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`);
const product = (overrides = {}) => ({ slug: "custom-powder", ritualStep: "", concerns: [], availableForSale: true, ...overrides });

test("quiz choices follow catalogue additions and removals without inventing goals", () => {
  assert.deepEqual(catalogueGoalOptions([product()]), []);
  const added = product({ concerns: [" Curl care ", "curl care"], ritualStep: "Pack" });
  assert.deepEqual(catalogueGoalOptions([added]).map((option) => option.goal), ["Hair Packs", "Curl care"]);
  assert.equal(recommendRitual([added], "Curl care", "Balanced").product, added);
  assert.equal(recommendRitual([added], "Unknown", "Balanced"), null);
  assert.deepEqual(catalogueGoalOptions([]), []);
});

test("new colour concerns retain strand-test guidance", () => {
  const added = product({ concerns: ["Rich colour"], ritualStep: "Colour" });
  assert.equal(recommendRitual([added], "Rich colour", "Very light / coloured").requiresColourReview, true);
});

test("a catalogue without a matching ritual never recommends an unrelated first product", () => {
  for (const { goal } of goalOptions) {
    for (const feel of hairFeels) {
      assert.equal(recommendRitual([product()], goal, feel), null);
      assert.equal(recommendRitual([], goal, feel), null);
    }
  }
});

test("merchant ritual metadata selects a matching custom handle regardless of catalogue order", () => {
  const colour = product({ slug: "merchant-colour", ritualStep: "Colour" });
  const result = recommendRitual([product(), colour], "Botanical Colour", "Very light / coloured");
  assert.equal(result.product, colour);
  assert.equal(result.requiresColourReview, true);
  assert.ok(result.guidance);
  assert.equal(recommendRitual([product({ ritualStep: "Cleanse" })], "Botanical Colour", "Balanced"), null);
});

test("available matching products retain priority over a sold-out preferred product", () => {
  const reetha = product({ slug: "reetha-powder", ritualStep: "Cleanse", availableForSale: false });
  const alternative = product({ slug: "other-cleanser", ritualStep: "Cleanse" });
  assert.equal(recommendRitual([reetha, alternative], "Cleanse", "Oily").product, alternative);
});

test("conditioning steps and merchant concerns provide recommendations", () => {
  const amla = product({ slug: "amla-powder", ritualStep: "Condition" });
  const scalp = product({ concerns: ["Scalp Ritual"] });
  assert.equal(recommendRitual([amla], "Softness + Shine", "Balanced").product, amla);
  assert.equal(recommendRitual([scalp], "Scalp Ritual", "Balanced").product, scalp);
});

test("renamed product handles cannot override saved ritual metadata", () => {
  const indigo = product({ slug: "reetha-powder", ritualStep: "Colour" });
  const reetha = product({ slug: "wildcrafted-amla-powder", ritualStep: "Cleanse" });
  assert.equal(recommendRitual([indigo, reetha], "Cleanse", "Oily").product, reetha);
  assert.equal(recommendRitual([indigo, reetha], "Botanical Colour", "Balanced").product, indigo);
  assert.equal(recommendRitual([product({ slug: "amla-powder" })], "Softness + Shine", "Balanced"), null);
});

test("saved steps work without concerns and named concerns ignore casing", () => {
  const conditioner = product({ ritualStep: "Condition" });
  assert.equal(recommendRitual([conditioner], "Softness + Shine", "Balanced").product, conditioner);
  assert.equal(recommendRitual([conditioner], "Scalp Ritual", "Balanced"), null);
  const scalp = product({ concerns: [" scalp ritual "] });
  assert.equal(recommendRitual([scalp], "Scalp Ritual", "Balanced").product, scalp);
});
