import test from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { fileURLToPath } from "node:url";

const bundle = await build({
  entryPoints: [fileURLToPath(new URL("../src/features/rituals/recommendation.ts", import.meta.url))],
  bundle: true, platform: "node", format: "esm", write: false,
});
const { recommendRitual, goalOptions, hairFeels } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`);
const product = (overrides = {}) => ({ slug: "custom-powder", ritualStep: "", concerns: [], availableForSale: true, ...overrides });

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

test("explicit preferred products and merchant concerns still provide recommendations", () => {
  const amla = product({ slug: "amla-powder" });
  const scalp = product({ concerns: ["Scalp Ritual"] });
  assert.equal(recommendRitual([amla], "Softness + Shine", "Balanced").product, amla);
  assert.equal(recommendRitual([scalp], "Scalp Ritual", "Balanced").product, scalp);
});
