import test from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { fileURLToPath } from "node:url";

const bundle = await build({ entryPoints: [fileURLToPath(new URL("../src/features/rituals/guided-quiz.ts", import.meta.url))], bundle: true, platform: "node", format: "esm", write: false });
const { getQuizFlow, setQuizAnswer, resolveQuizResult, resolveQuizBrowseItems, ritualQuestions } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`);
const answer = (entries) => Object.fromEntries(Object.entries(entries).map(([id, value]) => [id, Array.isArray(value) ? value : [value]]));
const care = (overrides = {}) => answer({ goal: "cleanse", check: "none", washNeed: "oil", hairHistory: "natural", routine: "one", ...overrides });
const colour = (overrides = {}) => answer({ goal: "colour", check: "none", colourTarget: "deeper", colourBase: "dark", colourHistory: "none", henna: "ready", colourChecks: "passed", ...overrides });
const skin = (overrides = {}) => answer({ goal: "skin", check: "none", skinNeed: "flower", skinChecks: "passed", ...overrides });
const outcome = (answers) => {
  const flow = getQuizFlow(answers);
  assert.equal(flow.complete, true, JSON.stringify(answers));
  assert.ok(flow.outcome);
  return flow.outcome;
};
const slugs = (result) => result.candidates.map((candidate) => candidate.slug);
const ids = (answers) => getQuizFlow(answers).questions.map((question) => question.id);
const liveIds = {
  "amla-powder": "8494763311290", "reetha-powder": "8498815107258", "indigo-powder": "8531585368250",
  "bhringraj-powder": "8531585433786", "hibiscus-powder": "8531585499322", "shikakai-powder": "8531585597626",
};
const product = (slug, overrides = {}) => ({
  id: `gid://shopify/Product/${liveIds[slug]}`, slug, name: slug.replace("-", " "), shopifyHandle: slug,
  ingredient: `100% ${slug.replace("-powder", "")} powder`, howTo: ["Follow the current pack directions."],
  safety: [], colorConsiderations: [], availableForSale: true, ritualStep: "Colour",
  careAreas: ["amla-powder", "hibiscus-powder"].includes(slug) ? ["Hair Care", "Skin Care"] : slug === "indigo-powder" ? ["Hair Colour"] : ["Hair Care"],
  variants: [{ id: "gid://shopify/ProductVariant/100", availableForSale: true }], ...overrides,
});

test("starts unanswered and stops at the first missing or invalid answer", () => {
  assert.equal(ritualQuestions.length, 20);
  assert.deepEqual(getQuizFlow({}), { questions: [ritualQuestions[0]], complete: false, outcome: null });
  for (const goal of [[], ["unknown"], ["cleanse", "softness"], ["cleanse", "cleanse"], "cleanse"]) {
    assert.deepEqual(ids({ goal }), ["goal"]);
    assert.equal(getQuizFlow({ goal }).complete, false);
  }
  assert.deepEqual(ids(answer({ goal: "cleanse", routine: "one" })), ["goal", "check"]);
  assert.deepEqual(ids(care({ washNeed: [] })), ["goal", "check", "washNeed"]);
  assert.equal(getQuizFlow(care({ check: ["none", "irritated"] })).outcome, null);
});

test("active irritation overrides a previous reaction and all product preferences", () => {
  for (const goal of ["cleanse", "softness", "scalp", "colour", "skin"]) {
    const answers = care({ goal, check: ["reaction", "irritated"], reactionIngredient: "amla" });
    assert.deepEqual(ids(answers), ["goal", "check"]);
    assert.equal(outcome(answers).kind, "pause");
    assert.deepEqual(slugs(outcome(answers)), []);
  }
});

test("previous reactions require ingredient review without substituting another powder", () => {
  const pending = care({ check: "reaction" });
  assert.deepEqual(ids(pending), ["goal", "check", "reactionIngredient"]);
  assert.equal(getQuizFlow(pending).complete, false);
  const result = outcome(care({ check: "reaction", reactionIngredient: ["amla", "reetha"] }));
  assert.equal(result.kind, "review");
  assert.match(result.description, /Amla Powder/);
  assert.match(result.description, /Reetha Powder/);
  assert.deepEqual(result.candidates, []);
  for (const reactionIngredient of ["other", "unsure"]) assert.equal(outcome(care({ check: "reaction", reactionIngredient })).kind, "review");
  assert.equal(outcome(care({ check: "unsure" })).kind, "review");
});

test("wash preferences select Reetha or explicit cleanser Shikakai", () => {
  const expected = { oil: "reetha-powder", manage: "shikakai-powder", beginner: "shikakai-powder", unsure: "shikakai-powder" };
  for (const [washNeed, slug] of Object.entries(expected)) {
    const result = outcome(care({ washNeed }));
    assert.deepEqual(slugs(result), [slug]);
    assert.equal(result.candidates[0].role, "Cleanse");
    assert.deepEqual(ids(care({ washNeed })), ["goal", "check", "washNeed", "hairHistory", "routine"]);
  }
});

test("hair-pack ingredient preferences map to traditional packs without sensory promises", () => {
  const expected = { flower: "hibiscus-powder", fruit: "amla-powder", general: "amla-powder", unsure: "amla-powder" };
  const reasons = new Set();
  for (const [conditionNeed, slug] of Object.entries(expected)) {
    const result = outcome(care({ goal: "softness", conditionNeed }));
    assert.deepEqual(slugs(result), [slug]);
    assert.equal(result.candidates[0].role, "Pack");
    reasons.add(result.candidates[0].reason);
  }
  assert.equal(reasons.size, 3);
});

test("scalp branches distinguish cleansing, conditioning, uncertainty and symptoms", () => {
  assert.deepEqual(slugs(outcome(care({ goal: "scalp", scalpNeed: "oil" }))), ["reetha-powder"]);
  assert.deepEqual(slugs(outcome(care({ goal: "scalp", scalpNeed: "condition" }))), ["bhringraj-powder"]);
  assert.deepEqual(slugs(outcome(care({ goal: "scalp", scalpNeed: "unsure", scalpType: "mask" }))), ["bhringraj-powder"]);
  const wash = care({ goal: "scalp", scalpNeed: "unsure", scalpType: "wash", washNeed: "manage" });
  assert.deepEqual(ids(wash), ["goal", "check", "scalpNeed", "scalpType", "washNeed", "hairHistory", "routine"]);
  assert.deepEqual(slugs(outcome(wash)), ["shikakai-powder"]);
  assert.equal(outcome(care({ goal: "scalp", scalpNeed: "unsure", scalpType: "unsure" })).kind, "guidance");
  for (const scalpNeed of ["irritation", "loss"]) {
    const result = outcome(care({ goal: "scalp", scalpNeed }));
    assert.equal(result.kind, "review");
    assert.match(result.description, /healthcare professional/);
    assert.deepEqual(result.candidates, []);
  }
});

test("two steps pair a chosen traditional pack with a chosen herbal wash", () => {
  for (const [conditionAddon, slug] of Object.entries({ flower: "hibiscus-powder", fruit: "amla-powder", scalp: "bhringraj-powder" })) {
    const result = outcome(care({ routine: "two", conditionAddon }));
    assert.deepEqual(slugs(result), [slug, "reetha-powder"]);
    assert.deepEqual(result.candidates.map((candidate) => candidate.role), ["Pack", "Cleanse"]);
    assert.match(result.description, /separate care steps/);
  }
  for (const [cleanseAddon, slug] of Object.entries({ oil: "reetha-powder", manage: "shikakai-powder" })) {
    assert.deepEqual(slugs(outcome(care({ goal: "softness", conditionNeed: "fruit", routine: "two", cleanseAddon }))), ["amla-powder", slug]);
  }
  assert.deepEqual(slugs(outcome(care({ routine: "two", conditionAddon: "skip" }))), ["reetha-powder"]);
  assert.deepEqual(slugs(outcome(care({ goal: "softness", conditionNeed: "flower", routine: "two", cleanseAddon: "skip" }))), ["hibiscus-powder"]);
  for (const routine of ["one", "unsure"]) assert.equal(outcome(care({ routine, conditionAddon: "flower" })).candidates.length, 1);
});

test("unknown care history ends in review; treated history adds only relevant questions", () => {
  assert.equal(outcome(care({ hairHistory: "unsure" })).kind, "review");
  assert.deepEqual(ids(care({ hairHistory: "treated" })), ["goal", "check", "washNeed", "hairHistory", "treatmentType"]);
  assert.equal(outcome(care({ hairHistory: "treated", treatmentType: "unsure" })).kind, "review");
  const treated = care({ hairHistory: "treated", treatmentType: ["colour", "bleach", "chemical"], strand: "passed" });
  assert.equal(outcome(treated).kind, "candidate");
  assert.deepEqual(ids(treated), ["goal", "check", "washNeed", "hairHistory", "treatmentType", "routine", "strand"]);
});

test("strand question names each exact candidate; unchecked is conditional and changed is review", () => {
  const answers = care({ hairHistory: "light", routine: "two", conditionAddon: "flower" });
  const question = getQuizFlow(answers).questions.at(-1);
  assert.equal(question.id, "strand");
  assert.match(question.helper, /Hibiscus Powder and Reetha Powder/);
  assert.match(question.helper, /every suggested product/);
  assert.equal(outcome({ ...answers, strand: ["passed"] }).kind, "candidate");
  const conditional = outcome({ ...answers, strand: ["notyet"] });
  assert.equal(conditional.kind, "conditional");
  assert.equal(conditional.title, "Check before starting");
  assert.equal(conditional.candidates.length, 2);
  for (const strand of ["changed", "unsure"]) {
    assert.equal(outcome({ ...answers, strand: [strand] }).kind, "review");
    assert.deepEqual(slugs(outcome({ ...answers, strand: [strand] })), []);
  }
});

test("unsupported colour goals and unknown targets never reach Indigo", () => {
  for (const colourTarget of ["lighter", "copper"]) {
    const answers = colour({ colourTarget });
    assert.equal(outcome(answers).kind, "no-match");
    assert.deepEqual(ids(answers), ["goal", "check", "colourTarget"]);
    assert.deepEqual(slugs(outcome(answers)), []);
  }
  assert.equal(outcome(colour({ colourTarget: "unsure" })).kind, "guidance");
  assert.equal(outcome(colour({ colourBase: "unsure" })).kind, "guidance");
});

test("colour compatibility review takes priority over a ready method or successful check", () => {
  for (const colourHistory of [["dye"], ["bleach"], ["chemical"], ["unsure"], ["henna", "dye"]]) {
    const answers = colour({ colourHistory });
    assert.equal(outcome(answers).kind, "review");
    assert.deepEqual(slugs(outcome(answers)), []);
    assert.equal(ids(answers).at(-1), "colourHistory");
  }
  assert.equal(outcome(colour({ colourBase: "light" })).kind, "review");
  for (const henna of ["no", "unsure"]) assert.equal(outcome(colour({ henna })).kind, "guidance");
});

test("Indigo requires known base and henna-first method; checks determine the outcome", () => {
  for (const colourTarget of ["deeper", "grey"]) {
    for (const colourBase of ["dark", "brown", "grey", "mixed"]) {
      for (const colourHistory of ["henna", "none"]) {
        const result = outcome(colour({ colourTarget, colourBase, colourHistory }));
        assert.equal(result.kind, "candidate");
        assert.deepEqual(slugs(result), ["indigo-powder"]);
        assert.equal(result.candidates[0].role, "Colour");
      }
    }
  }
  assert.equal(outcome(colour({ colourChecks: "notyet" })).kind, "conditional");
  assert.equal(outcome(colour({ colourChecks: "reaction" })).kind, "pause");
  assert.equal(outcome(colour({ colourChecks: "shade" })).kind, "review");
});

test("exclusive multiple-choice options replace other answers and reverse cleanly", () => {
  let answers = answer({ goal: "cleanse" });
  answers = setQuizAnswer(answers, "check", ["reaction"]);
  answers = setQuizAnswer(answers, "check", ["reaction", "none"]);
  assert.deepEqual(answers.check, ["none"]);
  answers = setQuizAnswer(answers, "check", ["none", "irritated"]);
  assert.deepEqual(answers.check, ["irritated"]);
  answers = setQuizAnswer(answers, "check", ["irritated", "reaction"]);
  assert.deepEqual(answers.check, ["irritated", "reaction"]);
  answers = setQuizAnswer(answers, "check", ["irritated", "reaction", "unsure"]);
  assert.deepEqual(answers.check, ["unsure"]);
  const reaction = care({ check: "reaction", reactionIngredient: ["amla", "reetha"] });
  assert.deepEqual(setQuizAnswer(reaction, "reactionIngredient", ["amla", "reetha", "other"]).reactionIngredient, ["other"]);
  const treated = care({ hairHistory: "treated", treatmentType: "unsure" });
  assert.deepEqual(setQuizAnswer(treated, "treatmentType", ["unsure", "bleach"]).treatmentType, ["bleach"]);
  assert.deepEqual(setQuizAnswer(colour(), "colourHistory", ["none", "henna"]).colourHistory, ["henna"]);
});

test("Back preserves answers; changing an earlier answer clears every dependent answer", () => {
  const answers = care({ hairHistory: "light", routine: "two", conditionAddon: "flower", strand: "passed" });
  assert.equal(setQuizAnswer(answers, "washNeed", ["oil"]), answers);
  const edited = setQuizAnswer(answers, "washNeed", ["manage"]);
  assert.deepEqual(edited, answer({ goal: "cleanse", check: "none", washNeed: "manage" }));
  assert.equal(getQuizFlow(edited).questions.at(-1).id, "hairHistory");
  assert.deepEqual(setQuizAnswer(answers, "goal", ["colour"]), answer({ goal: "colour" }));
  assert.deepEqual(setQuizAnswer(answers, "routine", ["one"]), answer({ goal: "cleanse", check: "none", washNeed: "oil", hairHistory: "light", routine: "one" }));
  assert.deepEqual(setQuizAnswer(answers, "check", []), answer({ goal: "cleanse" }));
  assert.equal(setQuizAnswer(answers, "henna", ["ready"]), answers, "unreachable question cannot inject a branch answer");
});

test("multiple answer order and invalid additions do not clear later answers", () => {
  const answers = care({ hairHistory: "treated", treatmentType: ["colour", "bleach"], strand: "passed" });
  assert.equal(setQuizAnswer(answers, "treatmentType", ["bleach", "colour"]), answers);
  assert.equal(setQuizAnswer(answers, "treatmentType", ["bleach", "colour", "bogus", "bleach"]), answers);
  assert.deepEqual(setQuizAnswer(answers, "treatmentType", ["colour"]), answer({ goal: "cleanse", check: "none", washNeed: "oil", hairHistory: "treated", treatmentType: "colour" }));
});

test("live resolution checks verified identity, ingredient, directions and current availability", () => {
  const result = outcome(care());
  assert.equal(resolveQuizResult(result, [product("reetha-powder")], "shopify").items.length, 1);
  for (const overrides of [
    { availableForSale: false }, { availableForSale: undefined }, { id: "gid://shopify/Product/999" },
    { id: "gid://shopify/Product/8531585368250" }, { slug: "different-powder", shopifyHandle: "different-powder", name: "Different Powder" },
    { ingredient: "" }, { ingredient: "Amla Powder" }, { ingredient: "Reetha powder, details pending" }, { howTo: [] },
    { variants: [] }, { variants: [{ id: "preview:reetha-powder", availableForSale: true }] },
    { variants: [{ id: "gid://shopify/ProductVariant/100", availableForSale: false }] },
    { variants: [{ id: "gid://shopify/ProductVariant/100", availableForSale: true, quantityAvailable: 0 }] },
  ]) {
    const resolved = resolveQuizResult(result, [product("reetha-powder", overrides), product("shikakai-powder")], "shopify");
    assert.equal(resolved.kind, "no-match", JSON.stringify(overrides));
    assert.equal(resolved.unavailable, true);
    assert.deepEqual(resolved.items, []);
  }
});

test("all six verified live products resolve, including Shikakai despite a conflicting role tag", () => {
  const candidates = [
    outcome(care()), outcome(care({ washNeed: "manage" })),
    outcome(care({ goal: "softness", conditionNeed: "fruit" })),
    outcome(care({ goal: "softness", conditionNeed: "flower" })),
    outcome(care({ goal: "scalp", scalpNeed: "condition" })), outcome(colour()),
  ];
  for (const result of candidates) {
    const slug = result.candidates[0].slug;
    const resolved = resolveQuizResult(result, [product(slug)], "shopify");
    assert.equal(resolved.items[0].product.slug, slug);
    assert.equal(resolved.items[0].role, result.candidates[0].role);
    assert.equal(resolved.unavailable, false);
  }
});

test("partial availability is explicit and does not replace a requested care step", () => {
  const result = outcome(care({ routine: "two", conditionAddon: "flower" }));
  const resolved = resolveQuizResult(result, [product("reetha-powder"), product("hibiscus-powder", { availableForSale: false }), product("amla-powder")], "shopify");
  assert.equal(resolved.kind, "candidate");
  assert.equal(resolved.unavailable, true);
  assert.deepEqual(resolved.items.map((item) => item.product.slug), ["reetha-powder"]);
  assert.match(resolved.description, /Only part/);
  assert.match(resolved.description, /no substitute/);
  assert.doesNotMatch(resolved.description, /mask first, then the wash/);
  const conditional = resolveQuizResult(outcome(care({ routine: "two", conditionAddon: "flower", hairHistory: "light", strand: "notyet" })), [product("reetha-powder")], "shopify");
  assert.equal(conditional.kind, "conditional");
  assert.match(conditional.description, /hidden strand/);
});

test("preview identity is separate; stock still applies and terminal outcomes never resolve personalized recommendations", () => {
  const result = outcome(care());
  const preview = product("reetha-powder", { id: undefined, ingredient: "Preview details", availableForSale: undefined, variants: [] });
  assert.equal(resolveQuizResult(result, [preview], "preview").items.length, 1);
  assert.equal(resolveQuizResult(result, [preview], "shopify").items.length, 0);
  assert.equal(resolveQuizResult(result, [{ ...preview, availableForSale: false }], "preview").items.length, 0);
  for (const kind of ["review", "pause", "guidance", "no-match"]) {
    assert.deepEqual(resolveQuizResult({ ...result, kind }, [product("reetha-powder")], "shopify").items, []);
  }
});

test("unknown reactions offer separate browsing without creating a personalized recommendation", () => {
  const products = Object.keys(liveIds).map((slug) => product(slug));
  for (const reactionIngredient of ["other", "unsure"]) {
    const answers = care({ check: "reaction", reactionIngredient });
    const result = outcome(answers);
    const items = resolveQuizBrowseItems(answers, products, "shopify");
    assert.equal(result.kind, "review");
    assert.deepEqual(result.candidates, []);
    assert.deepEqual(resolveQuizResult(result, products, "shopify").items, []);
    assert.equal(items.length, 2);
    assert.equal(new Set(items.map((item) => item.product.slug)).size, 2);
    assert.ok(items.every((item) => item.role !== "Colour" && item.reason.trim().length > 0));
  }
});

test("known reaction ingredients stay excluded from browsing for every goal", () => {
  const products = Object.keys(liveIds).map((slug) => product(slug));
  for (const goal of ["cleanse", "softness", "scalp", "colour"]) {
    for (const ingredient of Object.keys(liveIds).map((slug) => slug.replace("-powder", ""))) {
      const answers = care({ goal, check: "reaction", reactionIngredient: ingredient });
      const items = resolveQuizBrowseItems(answers, products, "shopify");
      assert.ok(items.length > 0 && items.length <= 2, `${goal}: ${ingredient}`);
      assert.ok(items.every((item) => item.product.slug !== `${ingredient}-powder`), `${goal}: ${ingredient}`);
      assert.ok(items.every((item) => item.role !== "Colour"));
      assert.deepEqual(outcome(answers).candidates, []);
    }
  }
});

test("browsing never refills excluded products when all six ingredients were reported", () => {
  const products = Object.keys(liveIds).map((slug) => product(slug));
  const ingredients = Object.keys(liveIds).map((slug) => slug.replace("-powder", ""));
  for (const goal of ["cleanse", "softness", "scalp", "colour"]) {
    const answers = care({ goal, check: "reaction", reactionIngredient: ingredients });
    assert.equal(outcome(answers).kind, "review");
    assert.deepEqual(resolveQuizBrowseItems(answers, products, "shopify"), []);
  }
});

test("browsing excludes reported ingredients in a different product's ingredient text", () => {
  const answers = care({ check: "reaction", reactionIngredient: "amla" });
  const cleanser = product("shikakai-powder");
  assert.equal(resolveQuizBrowseItems(answers, [cleanser], "shopify").length, 1);
  const blend = { ...cleanser, ingredient: "Shikakai powder with AMLA fruit powder" };
  assert.deepEqual(resolveQuizBrowseItems(answers, [blend], "shopify"), []);
  assert.deepEqual(resolveQuizBrowseItems(answers, [product("amla-powder"), blend], "shopify"), []);
  const preview = product("amla-powder", { id: undefined, name: "Botanical fruit powder", ingredient: "Preview ingredient details", variants: [] });
  assert.equal(resolveQuizBrowseItems(care({ check: "reaction", reactionIngredient: "unsure" }), [preview], "preview").length, 1);
  assert.deepEqual(resolveQuizBrowseItems(answers, [preview], "preview"), [], "canonical identity excludes a reported ingredient even when the text does not name it");
});

test("browsing validates live identity, product information and current availability", () => {
  const answers = care({ check: "reaction", reactionIngredient: "unsure" });
  assert.equal(resolveQuizBrowseItems(answers, [product("reetha-powder")], "shopify").length, 1);
  for (const overrides of [
    { availableForSale: false }, { availableForSale: undefined }, { id: "gid://shopify/Product/999" },
    { id: "gid://shopify/Product/8531585368250" }, { slug: "different-powder", shopifyHandle: "different-powder", name: "Different Powder" },
    { ingredient: "" }, { ingredient: "Amla Powder" }, { ingredient: "Reetha powder, details pending" }, { howTo: [] },
    { variants: [] }, { variants: [{ id: "preview:reetha-powder", availableForSale: true }] },
    { variants: [{ id: "gid://shopify/ProductVariant/100", availableForSale: false }] },
    { variants: [{ id: "gid://shopify/ProductVariant/100", availableForSale: true, quantityAvailable: 0 }] },
  ]) {
    assert.deepEqual(resolveQuizBrowseItems(answers, [product("reetha-powder", overrides)], "shopify"), [], JSON.stringify(overrides));
  }
  const available = product("shikakai-powder");
  const items = resolveQuizBrowseItems(answers, [product("reetha-powder", { availableForSale: false }), available], "shopify");
  assert.deepEqual(items.map((item) => item.product.slug), [available.slug]);
});

test("browsing waits for valid completion and does not supplement available candidate or conditional results", () => {
  const products = Object.keys(liveIds).map((slug) => product(slug));
  for (const answers of [
    {}, answer({ goal: "cleanse" }), care({ check: ["none", "reaction"] }),
    care({ check: "reaction" }), care({ check: "reaction", reactionIngredient: ["amla", "unsure"] }),
    care(), care({ hairHistory: "light", strand: "notyet" }), colour(), colour({ colourChecks: "notyet" }),
  ]) {
    assert.deepEqual(resolveQuizBrowseItems(answers, products, "shopify"), [], JSON.stringify(answers));
  }
});

test("an unavailable selected product allows separate browsing of available care products", () => {
  for (const answers of [care(), care({ hairHistory: "light", strand: "notyet" })]) {
    const products = [product("reetha-powder", { availableForSale: false }), product("shikakai-powder"), product("amla-powder")];
    const original = outcome(answers);
    assert.ok(["candidate", "conditional"].includes(original.kind));
    assert.deepEqual(slugs(original), ["reetha-powder"]);
    const result = resolveQuizResult(original, products, "shopify");
    assert.equal(result.kind, "no-match");
    assert.deepEqual(result.items, []);
    const browseItems = resolveQuizBrowseItems(answers, products, "shopify");
    assert.equal(browseItems.length, 2);
    assert.ok(browseItems.every((item) => item.product.availableForSale && item.product.slug !== "reetha-powder"));
    assert.deepEqual(slugs(outcome(answers)), ["reetha-powder"], "generic browsing must not replace the original selected product");
    assert.deepEqual(resolveQuizBrowseItems(answers, products.map((entry) => ({ ...entry, availableForSale: false })), "shopify"), []);
  }
});

test("a partially available ritual keeps its recommendation without additional browsing products", () => {
  for (const answers of [
    care({ routine: "two", conditionAddon: "flower" }),
    care({ routine: "two", conditionAddon: "flower", hairHistory: "light", strand: "notyet" }),
  ]) {
    const products = [product("reetha-powder"), product("hibiscus-powder", { availableForSale: false }), product("amla-powder"), product("shikakai-powder")];
    const result = resolveQuizResult(outcome(answers), products, "shopify");
    assert.equal(result.unavailable, true);
    assert.deepEqual(result.items.map((item) => item.product.slug), ["reetha-powder"]);
    assert.deepEqual(resolveQuizBrowseItems(answers, products, "shopify"), []);
  }
});

test("changed strand results exclude the original one- or two-product ritual from browsing", () => {
  const products = Object.keys(liveIds).map((slug) => product(slug));
  for (const answers of [
    care({ hairHistory: "light", strand: "changed" }),
    care({ hairHistory: "light", routine: "two", conditionAddon: "flower", strand: "changed" }),
  ]) {
    assert.ok(ids(answers).includes("strand"));
    assert.equal(outcome(answers).kind, "review");
    const originalSlugs = slugs(outcome({ ...answers, strand: ["passed"] }));
    assert.equal(originalSlugs.length, answers.routine[0] === "two" ? 2 : 1);
    const items = resolveQuizBrowseItems(answers, products, "shopify");
    assert.ok(items.length > 0 && items.length <= 2);
    assert.ok(items.every((item) => !originalSlugs.includes(item.product.slug)), originalSlugs.join(", "));
    assert.deepEqual(resolveQuizBrowseItems(answers, products.filter((entry) => originalSlugs.includes(entry.slug)), "shopify"), []);
  }
  const terminal = care({ check: "unsure" });
  assert.ok(!ids(terminal).includes("strand"));
  assert.deepEqual(
    resolveQuizBrowseItems({ ...terminal, strand: ["changed"] }, products, "shopify"),
    resolveQuizBrowseItems(terminal, products, "shopify"),
    "an unreachable strand answer must not exclude unrelated browsing products",
  );
});

test("terminal colour routes browse traditional hair packs only, never an unsupported colour match", () => {
  const products = Object.keys(liveIds).map((slug) => product(slug));
  for (const answers of [
    colour({ colourTarget: "lighter" }), colour({ colourTarget: "copper" }),
    colour({ colourTarget: "unsure" }), colour({ colourBase: "unsure" }),
    colour({ colourHistory: "bleach" }), colour({ henna: "no" }),
    colour({ colourChecks: "reaction" }), colour({ colourChecks: "shade" }),
  ]) {
    const result = outcome(answers);
    assert.deepEqual(result.candidates, []);
    const items = resolveQuizBrowseItems(answers, products, "shopify");
    assert.ok(items.length > 0 && items.length <= 2);
    assert.ok(items.every((item) => item.role === "Pack" && item.product.slug !== "indigo-powder"));
  }
});

test("browsing ignores unreachable reaction answers and respects cleared earlier branches", () => {
  const products = Object.keys(liveIds).map((slug) => product(slug));
  const terminal = care({ check: "unsure" });
  const excluded = Object.keys(liveIds).map((slug) => slug.replace("-powder", ""));
  assert.deepEqual(
    resolveQuizBrowseItems({ ...terminal, reactionIngredient: excluded }, products, "shopify"),
    resolveQuizBrowseItems(terminal, products, "shopify"),
  );
  const reaction = care({ check: "reaction", reactionIngredient: "reetha" });
  const changed = setQuizAnswer(reaction, "check", ["none"]);
  assert.equal(changed.reactionIngredient, undefined);
  assert.deepEqual(resolveQuizBrowseItems(changed, products, "shopify"), []);
});

test("skin-only choices use Amla or Hibiscus without hair-history questions or hair-use instructions", () => {
  for (const [skinNeed, expected] of Object.entries({ flower: ["hibiscus-powder"], fruit: ["amla-powder"], compare: ["hibiscus-powder", "amla-powder"] })) {
    for (const skinChecks of ["passed", "notyet"]) {
      const answers = skin({ skinNeed, skinChecks, hairHistory: "treated", strand: "changed" });
      const result = outcome(answers);
      assert.deepEqual(slugs(result), expected);
      assert.deepEqual(ids(answers), ["goal", "check", "skinNeed", "skinChecks"]);
      assert.equal(result.kind, skinChecks === "passed" ? "candidate" : "conditional");
      assert.ok(result.candidates.every((candidate) => candidate.role === "Skin"));
      assert.doesNotMatch(result.description, /strand|before the wash|minutes|brighten|acne|collagen/i);
      if (skinNeed === "compare") assert.match(result.description, /alternatives.*choose one/);
    }
  }
});

test("skin reactions and uncertainty stop product suggestions and do not browse substitute powders", () => {
  const products = Object.keys(liveIds).map((slug) => product(slug));
  for (const answers of [skin({ check: "irritated" }), skin({ check: "reaction", reactionIngredient: "amla" }), skin({ check: "unsure" }), skin({ skinChecks: "reaction" })]) {
    const result = outcome(answers);
    assert.ok(["pause", "review"].includes(result.kind));
    assert.deepEqual(result.candidates, []);
    assert.deepEqual(resolveQuizResult(result, products, "shopify").items, []);
    assert.deepEqual(resolveQuizBrowseItems(answers, products, "shopify"), []);
  }
});

test("skin candidates require explicit skin eligibility as well as verified live identity and availability", () => {
  const result = outcome(skin());
  for (const source of ["shopify", "preview"]) {
    for (const careAreas of [undefined, [], ["Hair Care"], ["Hair Colour"]]) {
      const resolved = resolveQuizResult(result, [product("hibiscus-powder", { careAreas }), product("amla-powder")], source);
      assert.deepEqual(resolved.items, []);
      assert.equal(resolved.unavailable, true);
    }
  }
  for (const overrides of [{ id: "gid://shopify/Product/999" }, { availableForSale: false }, { howTo: [] }, { ingredient: "" }, { variants: [] }]) {
    assert.deepEqual(resolveQuizResult(result, [product("hibiscus-powder", overrides)], "shopify").items, []);
  }
  assert.equal(resolveQuizResult(result, [product("hibiscus-powder")], "shopify").items.length, 1);
  const partial = resolveQuizResult(outcome(skin({ skinNeed: "compare", skinChecks: "notyet" })), [product("amla-powder")], "shopify");
  assert.equal(partial.unavailable, true);
  assert.match(partial.description, /skin-use directions/);
  assert.doesNotMatch(partial.description, /strand|wash|step/);
});

test("the current hair-only catalog stops skin discovery before offering powders or application questions", () => {
  const products = Object.keys(liveIds).map((slug) => product(slug, { careAreas: slug === "indigo-powder" ? ["Hair Colour"] : ["Hair Care"] }));
  for (const source of ["preview", "shopify"]) {
    const flow = getQuizFlow(answer({ goal: "skin" }), { products, source });
    assert.equal(flow.complete, true);
    assert.equal(flow.outcome.kind, "guidance");
    assert.match(flow.outcome.title, /Skin use is not yet confirmed/);
    assert.match(flow.outcome.description, /Do not use hair-pack directions/);
    assert.deepEqual(flow.questions.map((question) => question.id), ["goal"]);
    assert.deepEqual(flow.outcome.candidates, []);
    assert.deepEqual(resolveQuizBrowseItems(skin(), products, source), []);
    assert.deepEqual(setQuizAnswer(answer({ goal: "skin" }), "skinNeed", ["flower"], { products, source }), answer({ goal: "skin" }));
  }
});

test("explicit future skin eligibility can enable the skin branch without treating sold-out stock as unconfirmed use", () => {
  const products = [product("hibiscus-powder")];
  const flow = getQuizFlow(skin(), { products, source: "shopify" });
  assert.equal(flow.outcome.kind, "candidate");
  assert.deepEqual(slugs(flow.outcome), ["hibiscus-powder"]);
  const soldOut = getQuizFlow(answer({ goal: "skin" }), { products: [product("hibiscus-powder", { availableForSale: false })], source: "shopify" });
  assert.equal(soldOut.outcome.kind, "guidance");
  assert.match(soldOut.outcome.title, /available right now/);
  assert.doesNotMatch(soldOut.outcome.title, /not yet confirmed/);
});

function choices(question) {
  if (!question.multiple) return question.options.map((option) => [option.value]);
  const regular = question.options.filter((option) => !option.exclusive);
  const combinations = [];
  for (let mask = 1; mask < 2 ** regular.length; mask += 1) combinations.push(regular.filter((_, index) => mask & (1 << index)).map((option) => option.value));
  return [...combinations, ...question.options.filter((option) => option.exclusive).map((option) => [option.value])];
}

test("exhaustively traverses every reachable completed path and verifies routing invariants", () => {
  let paths = 0;
  const products = Object.keys(liveIds).map((slug) => product(slug));
  const seenQuestions = new Set();
  const seenKinds = new Set();
  const seenProducts = new Set();
  const visit = (answers) => {
    const flow = getQuizFlow(answers);
    const questionIds = flow.questions.map((question) => question.id);
    assert.equal(new Set(questionIds).size, questionIds.length, "no branching cycle");
    assert.ok(questionIds.length <= ritualQuestions.length);
    flow.questions.forEach((question) => seenQuestions.add(question.id));
    if (!flow.complete) {
      assert.equal(flow.outcome, null);
      const question = flow.questions.at(-1);
      assert.equal(answers[question.id], undefined, `did not advance after ${question.id}`);
      for (const values of choices(question)) visit(setQuizAnswer(answers, question.id, values));
      return;
    }
    paths += 1;
    const result = flow.outcome;
    const browseItems = resolveQuizBrowseItems(answers, products, "shopify");
    assert.ok(browseItems.length <= 2);
    assert.equal(new Set(browseItems.map((item) => item.product.slug)).size, browseItems.length);
    assert.ok(browseItems.every((item) => item.product.slug !== "indigo-powder" && item.role !== "Colour"));
    if (questionIds.includes("reactionIngredient")) {
      for (const ingredient of answers.reactionIngredient) {
        assert.ok(browseItems.every((item) => item.product.slug !== `${ingredient}-powder`), `${ingredient} leaked into browsing`);
      }
    }
    seenKinds.add(result.kind);
    assert.ok(result.title && result.description);
    assert.ok(result.candidates.length <= 2);
    if (!["candidate", "conditional"].includes(result.kind)) assert.deepEqual(result.candidates, []);
    else {
      assert.deepEqual(browseItems, []);
      assert.ok(result.candidates.length >= 1);
      assert.deepEqual(answers.check, ["none"]);
      assert.equal(result.title, result.kind === "conditional" ? "Check before starting" : "Your suggested starting ritual");
      assert.ok(result.candidates.every((candidate) => candidate.reason.length > 15));
      result.candidates.forEach((candidate) => seenProducts.add(candidate.slug));
      if (answers.goal[0] === "colour") {
        assert.deepEqual(slugs(result), ["indigo-powder"]);
        assert.ok(["deeper", "grey"].includes(answers.colourTarget[0]));
        assert.ok(["dark", "brown", "grey", "mixed"].includes(answers.colourBase[0]));
        assert.ok(["none", "henna"].includes(answers.colourHistory[0]));
        assert.deepEqual(answers.henna, ["ready"]);
        assert.equal(answers.colourChecks[0], result.kind === "conditional" ? "notyet" : "passed");
      } else if (answers.goal[0] === "skin") {
        assert.ok(result.candidates.every((candidate) => candidate.role === "Skin" && ["amla-powder", "hibiscus-powder"].includes(candidate.slug)));
        assert.ok(!questionIds.includes("hairHistory"));
        assert.equal(answers.skinChecks[0], result.kind === "conditional" ? "notyet" : "passed");
        assert.equal(result.candidates.length, answers.skinNeed[0] === "compare" ? 2 : 1);
      } else {
        assert.ok(!slugs(result).includes("indigo-powder"));
        if (answers.routine[0] !== "two") assert.equal(result.candidates.length, 1);
        if (result.candidates.length === 2) assert.deepEqual(result.candidates.map((candidate) => candidate.role), ["Pack", "Cleanse"]);
        if (answers.hairHistory[0] !== "natural") assert.equal(answers.strand[0], result.kind === "conditional" ? "notyet" : "passed");
        else assert.equal(result.kind, "candidate");
      }
    }
  };
  visit({});
  assert.equal(paths, 3409);
  assert.equal(seenQuestions.size, ritualQuestions.length);
  assert.deepEqual([...seenKinds].sort(), ["candidate", "conditional", "guidance", "no-match", "pause", "review"]);
  assert.deepEqual([...seenProducts].sort(), Object.keys(liveIds).sort());
});
