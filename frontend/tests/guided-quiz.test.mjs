import test from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { fileURLToPath } from "node:url";

const bundle = await build({
  stdin: { contents: 'export * from "./src/features/rituals/guided-quiz"; export { products as currentProducts } from "./src/domain/catalog/products";', resolveDir: fileURLToPath(new URL("../", import.meta.url)) },
  bundle: true, platform: "node", format: "esm", write: false,
});
const { getQuizFlow, setQuizAnswer, resolveQuizResult, resolveQuizBrowseItems, ritualQuestions, currentProducts } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`);
const answer = (entries) => Object.fromEntries(Object.entries(entries).map(([id, value]) => [id, Array.isArray(value) ? value : [value]]));
const care = (overrides = {}) => answer({ careArea: "hair", check: "none", hairGoal: "cleanse", washNeed: "reetha", hairHistory: "natural", routine: "one", ...overrides });
const colour = (overrides = {}) => answer({ careArea: "colour", check: "none", colourTarget: "deeper", colourBase: "dark", colourHistory: "none", henna: "ready", colourChecks: "passed", ...overrides });
const skin = (overrides = {}) => answer({ careArea: "skin", check: "none", skinArea: "face", skinNeed: "flower", skinChecks: "passed", ...overrides });
const both = (overrides = {}) => answer({ careArea: "both", check: "none", bothPlan: "shared", skinArea: "face", sharedNeed: "fruit", hairHistory: "natural", skinChecks: "passed", ...overrides });
const liveIds = {
  "amla-powder": "8494763311290", "reetha-powder": "8498815107258", "indigo-powder": "8531585368250",
  "bhringraj-powder": "8531585433786", "hibiscus-powder": "8531585499322", "shikakai-powder": "8531585597626",
};
const product = (slug, overrides = {}) => ({
  id: `gid://shopify/Product/${liveIds[slug]}`, slug, name: slug.replace("-", " "), shopifyHandle: slug,
  ingredient: `100% ${slug.replace("-powder", "")} powder`, howTo: ["Hair: Follow the current pack directions."],
  safety: [], description: "", availableForSale: true,
  ritualStep: slug === "indigo-powder" ? "Colour" : ["reetha-powder", "shikakai-powder"].includes(slug) ? "Cleanse" : "Pack",
  careAreas: [slug === "indigo-powder" ? "Hair Colour" : "Hair Care"],
  variants: [{ id: "gid://shopify/ProductVariant/100", availableForSale: true }], ...overrides,
});
// Synthetic future catalogue only: these fixtures do not approve real products for skin use.
const skinProduct = (slug, overrides = {}) => product(slug, {
  careAreas: ["Hair Care", "Skin Care"],
  howTo: ["Hair: Follow the hair-pack directions.", "Face: Follow the facial-use directions.", "Body: Follow the body-use directions."],
  ...overrides,
});
const hairProducts = Object.keys(liveIds).map((slug) => product(slug));
const futureProducts = hairProducts.map((p) => ["amla-powder", "hibiscus-powder"].includes(p.slug) ? skinProduct(p.slug) : p);
const catalog = { products: futureProducts, source: "shopify" };
const actualCatalog = { products: currentProducts, source: "preview" };
const outcome = (answers, context = catalog) => {
  const flow = getQuizFlow(answers, context);
  assert.equal(flow.complete, true, JSON.stringify(answers));
  assert.ok(flow.outcome);
  return flow.outcome;
};
const slugs = (result) => result.candidates.map((candidate) => candidate.slug);
const ids = (answers, context = catalog) => getQuizFlow(answers, context).questions.map((question) => question.id);
const resolved = (answers, products = futureProducts) => resolveQuizResult(outcome(answers), products, "shopify");

test("starts with four unselected care categories and rejects old or malformed answers", () => {
  assert.equal(ritualQuestions.length, 25);
  assert.deepEqual(ritualQuestions[0].options.map((o) => o.value), ["hair", "skin", "both", "colour"]);
  assert.deepEqual(getQuizFlow({}, catalog), { questions: [ritualQuestions[0]], complete: false, outcome: null });
  for (const careArea of [[], ["unknown"], ["hair", "skin"], ["hair", "hair"], "hair"]) {
    assert.deepEqual(ids({ careArea }), ["careArea"]);
    assert.equal(getQuizFlow({ careArea }, catalog).complete, false);
  }
  assert.deepEqual(ids(answer({ goal: "cleanse", hairHistory: "natural" })), ["careArea"], "old saved answers do not bypass the new entry step");
  assert.deepEqual(ids(answer({ careArea: "hair" })), ["careArea", "check"]);
  assert.deepEqual(ids(care({ washNeed: [] })), ["careArea", "check", "hairGoal", "washNeed"]);
});

test("quick checks precede every product gate and active irritation outranks previous reactions", () => {
  for (const careArea of ["hair", "skin", "both", "colour"]) {
    const answers = care({ careArea, check: ["reaction", "irritated"], reactionIngredient: "amla" });
    for (const context of [catalog, actualCatalog]) {
      assert.deepEqual(ids(answers, context), ["careArea", "check"]);
      assert.equal(outcome(answers, context).kind, "pause");
      assert.deepEqual(slugs(outcome(answers, context)), []);
    }
  }
  assert.equal(getQuizFlow(care({ check: ["none", "irritated"] }), catalog).complete, false);
});

test("reaction review names ingredients without offering allergy-safe replacements", () => {
  assert.equal(getQuizFlow(care({ check: "reaction" }), catalog).complete, false);
  const result = outcome(care({ check: "reaction", reactionIngredient: ["amla", "reetha"] }));
  assert.equal(result.kind, "review");
  assert.match(result.description, /Amla Powder and Reetha Powder/);
  assert.deepEqual(result.candidates, []);
  for (const reactionIngredient of ["other", "unsure"]) assert.equal(outcome(care({ check: "reaction", reactionIngredient })).kind, "review");
  assert.equal(outcome(care({ check: "unsure" })).kind, "review");
});

test("hair ingredient selection preserves all five roles and handles uncertainty", () => {
  for (const [washNeed, slug] of Object.entries({ reetha: "reetha-powder", shikakai: "shikakai-powder", beginner: "shikakai-powder", unsure: "shikakai-powder" })) {
    assert.deepEqual(slugs(outcome(care({ washNeed }))), [slug]);
    assert.equal(outcome(care({ washNeed })).candidates[0].role, "Cleanse");
  }
  for (const [packNeed, slug] of Object.entries({ flower: "hibiscus-powder", fruit: "amla-powder", general: "amla-powder", unsure: "amla-powder" })) {
    assert.deepEqual(slugs(outcome(care({ hairGoal: "pack", packNeed }))), [slug]);
  }
  assert.deepEqual(slugs(outcome(care({ hairGoal: "scalp", scalpNeed: "pack" }))), ["bhringraj-powder"]);
  assert.deepEqual(slugs(outcome(care({ hairGoal: "scalp", scalpNeed: "wash", washNeed: "shikakai" }))), ["shikakai-powder"]);
  for (const hairGoal of ["unsure", "scalp"]) {
    const prefix = { hairGoal, scalpNeed: "unsure" };
    assert.deepEqual(slugs(outcome(care({ ...prefix, hairStep: "pack", packNeed: "flower" }))), ["hibiscus-powder"]);
    assert.deepEqual(slugs(outcome(care({ ...prefix, hairStep: "wash", washNeed: "reetha" }))), ["reetha-powder"]);
    assert.equal(outcome(care({ ...prefix, hairStep: "unsure" })).kind, "guidance");
  }
  for (const scalpNeed of ["irritation", "loss"]) {
    assert.equal(outcome(care({ hairGoal: "scalp", scalpNeed })).kind, "review");
    assert.deepEqual(outcome(care({ hairGoal: "scalp", scalpNeed })).candidates, []);
  }
});

test("hair-only second steps require an explicit request and remain separate uses", () => {
  for (const [packAddon, slug] of Object.entries({ flower: "hibiscus-powder", fruit: "amla-powder", scalp: "bhringraj-powder" })) {
    const result = outcome(care({ routine: "two", packAddon }));
    assert.deepEqual(slugs(result), [slug, "reetha-powder"]);
    assert.deepEqual(result.candidates.map((c) => c.role), ["Pack", "Cleanse"]);
    assert.match(result.description, /separate care steps/);
  }
  for (const [washAddon, slug] of Object.entries({ reetha: "reetha-powder", shikakai: "shikakai-powder" })) {
    assert.deepEqual(slugs(outcome(care({ hairGoal: "pack", packNeed: "fruit", routine: "two", washAddon }))), ["amla-powder", slug]);
  }
  assert.equal(outcome(care({ routine: "two", packAddon: "skip" })).candidates.length, 1);
  for (const routine of ["one", "unsure"]) assert.equal(outcome(care({ routine, packAddon: "flower" })).candidates.length, 1);
});

test("history and strand checks use the exact selected hair products", () => {
  assert.equal(outcome(care({ hairHistory: "unsure" })).kind, "review");
  assert.equal(getQuizFlow(care({ hairHistory: "treated" }), catalog).complete, false);
  assert.equal(outcome(care({ hairHistory: "treated", treatmentType: "unsure" })).kind, "review");
  const answers = care({ hairHistory: "treated", treatmentType: ["colour", "bleach", "chemical"], routine: "two", packAddon: "flower" });
  const question = getQuizFlow(answers, catalog).questions.at(-1);
  assert.equal(question.id, "strand");
  assert.match(question.helper, /Hibiscus Powder and Reetha Powder/);
  assert.equal(outcome({ ...answers, strand: ["passed"] }).kind, "candidate");
  assert.equal(outcome({ ...answers, strand: ["notyet"] }).kind, "conditional");
  for (const strand of ["changed", "unsure"]) assert.equal(outcome({ ...answers, strand: [strand] }).kind, "review");
});

test("the actual catalogue offers skin guidance and an explicit Both-to-hair choice", () => {
  assert.deepEqual(ids(skin(), actualCatalog), ["careArea", "check"]);
  assert.match(outcome(skin(), actualCatalog).title, /Skin use is not yet confirmed/);
  assert.equal(getQuizFlow(both(), actualCatalog).questions.at(-1).id, "bothFallback");
  assert.equal(getQuizFlow(both(), actualCatalog).complete, false);
  assert.deepEqual(outcome(both({ bothFallback: "guidance" }), actualCatalog).candidates, []);
  const hairOnly = care({ careArea: "both", bothFallback: "hair", bothPlan: "shared", skinChecks: "reaction" });
  assert.equal(outcome(hairOnly, actualCatalog).careArea, "hair");
  assert.deepEqual(slugs(outcome(hairOnly, actualCatalog)), ["reetha-powder"]);
  assert.ok(!ids(hairOnly, actualCatalog).includes("skinChecks"));
  assert.match(getQuizFlow(skin()).outcome.title, /not yet confirmed/, "absent catalogue never enables skin use");
});

test("skin tags, ambiguous directions and contradictory restrictions cannot authorise application", () => {
  for (const overrides of [
    { howTo: ["Follow the pack directions."] },
    { howTo: ["Skin: Follow directions."] },
    { careAreas: ["Hair Care"] },
    { howTo: ["Face:"] },
    { safety: ["Facial and body-pack suitability has not been established for this powder."] },
    { safety: ["Follow hair-use directions only."] },
    { description: "Face and body use remains a development option." },
    { safety: ["Do not use for skin masks, eyebrows or eyelashes."] },
  ]) {
    const context = { products: [skinProduct("hibiscus-powder", overrides)], source: "shopify" };
    assert.equal(outcome(skin(), context).kind, "guidance", JSON.stringify(overrides));
    assert.deepEqual(outcome(skin(), context).candidates, []);
    assert.deepEqual(resolveQuizResult(outcome(skin()), context.products, "shopify").items, []);
  }
  const faceOnly = { products: [skinProduct("hibiscus-powder", { howTo: ["Face: Use the facial directions."] })], source: "shopify" };
  assert.equal(outcome(skin(), faceOnly).kind, "candidate");
  for (const skinArea of ["body", "both"]) assert.equal(outcome(skin({ skinArea }), faceOnly).kind, "guidance");
  const sharedHeading = { products: [skinProduct("hibiscus-powder", { howTo: ["Face and body: Use the separate area directions."] })], source: "shopify" };
  assert.equal(outcome(skin({ skinArea: "both" }), sharedHeading).kind, "candidate");
});

test("skin-only paths compare alternatives without hair questions or unsupported choices", () => {
  for (const [skinNeed, expected] of Object.entries({ flower: ["hibiscus-powder"], fruit: ["amla-powder"], compare: ["hibiscus-powder", "amla-powder"] })) {
    for (const skinChecks of ["passed", "notyet"]) {
      const answers = skin({ skinNeed, skinChecks, hairHistory: "treated", strand: "changed" });
      const result = outcome(answers);
      assert.deepEqual(slugs(result), expected);
      assert.deepEqual(ids(answers), ["careArea", "check", "skinArea", "skinNeed", "skinChecks"]);
      assert.equal(result.kind, skinChecks === "passed" ? "candidate" : "conditional");
      assert.ok(result.candidates.every((c) => c.role === "Skin" && c.skinArea === "face"));
      assert.doesNotMatch(result.description, /strand|hair wash|acne|collagen|brighten/i);
      if (skinNeed === "compare") assert.match(result.description, /alternatives: choose one/);
    }
  }
  const one = { products: [skinProduct("hibiscus-powder")], source: "shopify" };
  const question = getQuizFlow(skin({ skinNeed: [] }), one).questions.at(-1);
  assert.deepEqual(question.options.map((o) => o.value), ["flower"]);
  assert.equal(getQuizFlow(skin({ skinNeed: "fruit" }), one).complete, false);
  assert.deepEqual(setQuizAnswer(skin({ skinNeed: [] }), "skinNeed", ["fruit"], one).skinNeed, []);
});

test("sold-out skin and dual-use products are distinguished from unconfirmed uses", () => {
  const context = { products: [skinProduct("hibiscus-powder", { availableForSale: false })], source: "shopify" };
  assert.match(outcome(skin(), context).title, /available right now/);
  assert.doesNotMatch(outcome(skin(), context).title, /not yet confirmed/);
  assert.equal(getQuizFlow(both(), context).questions.at(-1).id, "bothFallback");
  assert.match(outcome(both({ bothFallback: "guidance" }), context).title, /available right now/);
});

test("shared Both uses one verified dual-use product and no routine upsell", () => {
  for (const sharedNeed of ["fruit", "flower"]) {
    for (const bothPlan of ["shared", "unsure"]) {
      const answers = both({ sharedNeed, bothPlan, routine: "two", packAddon: "scalp" });
      const result = outcome(answers);
      assert.equal(result.careArea, "both");
      assert.equal(result.plan, "shared");
      assert.equal(result.candidates.length, 1);
      assert.equal(result.candidates[0].role, "Both");
      assert.equal(result.candidates[0].skinArea, "face");
      assert.equal(resolved(answers).items.length, 1);
      assert.ok(!ids(answers).some((id) => ["routine", "hairGoal", "packAddon", "washAddon"].includes(id)));
    }
  }
  const onlySkin = { products: [skinProduct("hibiscus-powder", { careAreas: ["Skin Care"] }), product("reetha-powder")], source: "shopify" };
  const question = getQuizFlow(both({ bothPlan: [] }), onlySkin).questions.at(-1);
  assert.equal(question.id, "bothPlan");
  assert.deepEqual(question.options.map((o) => o.value), ["separate"]);
});

test("a shared plan with no matching skin area explicitly offers hair-only fallback", () => {
  const context = { products: [skinProduct("amla-powder", { howTo: ["Hair: Pack directions.", "Face: Face directions."] }), product("reetha-powder")], source: "shopify" };
  assert.equal(getQuizFlow(both({ skinArea: "body" }), context).questions.at(-1).id, "bothFallback");
  const answers = { ...care(), ...both({ skinArea: "body", bothFallback: "hair", skinChecks: "reaction" }) };
  assert.equal(outcome(answers, context).careArea, "hair");
  assert.deepEqual(slugs(outcome(answers, context)), ["reetha-powder"]);
});

test("separate Both plans keep use labels distinct, cap products at two, and deduplicate a shared jar", () => {
  const answers = { ...care({ routine: "two", packAddon: "scalp" }), ...both({ bothPlan: "separate", skinNeed: "flower" }) };
  const result = outcome(answers);
  assert.deepEqual(slugs(result), ["reetha-powder", "hibiscus-powder"]);
  assert.deepEqual(result.candidates.map((c) => c.role), ["Cleanse", "Skin"]);
  assert.ok(!ids(answers).some((id) => ["routine", "packAddon", "washAddon"].includes(id)));
  assert.deepEqual(resolved(answers).items.map((i) => i.role), ["Cleanse", "Skin"]);
  const duplicate = { ...answers, hairGoal: ["pack"], packNeed: ["flower"] };
  assert.deepEqual(slugs(outcome(duplicate)), ["hibiscus-powder"]);
  assert.equal(outcome(duplicate).candidates[0].role, "Both");
  const noChoice = { ...answers, skinNeed: [] };
  assert.deepEqual(getQuizFlow(noChoice, catalog).questions.at(-1).options.map((o) => o.value), ["flower", "fruit"]);
});

test("Both waits for every relevant check, and a reaction or strand concern stops the complete plan", () => {
  for (const skinChecks of ["passed", "notyet"]) for (const strand of ["passed", "notyet"]) {
    const answers = both({ hairHistory: "light", skinChecks, strand });
    const result = outcome(answers);
    assert.equal(result.kind, skinChecks === "notyet" || strand === "notyet" ? "conditional" : "candidate");
    if (skinChecks === "notyet") assert.match(result.description, /skin-use patch-test/);
    if (strand === "notyet") assert.match(result.description, /hidden strand/);
  }
  const separate = { ...care(), ...both({ bothPlan: "separate", skinNeed: "flower", hairHistory: "light", strand: [] }) };
  const strand = getQuizFlow(separate, catalog).questions.at(-1);
  assert.equal(strand.id, "strand");
  assert.match(strand.helper, /Reetha Powder/);
  assert.doesNotMatch(strand.helper, /Hibiscus Powder/, "skin-only product must not appear in hair strand checks");
  for (const answers of [both({ skinChecks: "reaction" }), both({ hairHistory: "light", strand: "changed" }), both({ hairHistory: "unsure" })]) {
    assert.deepEqual(outcome(answers).candidates, []);
    assert.deepEqual(resolveQuizBrowseItems(answers, futureProducts, "shopify"), []);
  }
});

test("colour remains isolated and requires a supported target, history, method and checks", () => {
  for (const colourTarget of ["lighter", "copper"]) assert.equal(outcome(colour({ colourTarget })).kind, "no-match");
  for (const overrides of [{ colourTarget: "unsure" }, { colourBase: "unsure" }, { henna: "no" }, { henna: "unsure" }]) assert.equal(outcome(colour(overrides)).kind, "guidance");
  for (const colourHistory of [["dye"], ["bleach"], ["chemical"], ["unsure"], ["henna", "dye"]]) assert.equal(outcome(colour({ colourHistory })).kind, "review");
  assert.equal(outcome(colour({ colourBase: "light" })).kind, "review");
  for (const colourTarget of ["deeper", "grey"]) for (const colourBase of ["dark", "brown", "grey", "mixed"]) for (const colourHistory of ["henna", "none"]) {
    const answers = colour({ colourTarget, colourBase, colourHistory });
    assert.deepEqual(slugs(outcome(answers)), ["indigo-powder"]);
    assert.equal(resolved(answers).items[0].role, "Colour");
    assert.ok(!ids(answers).some((id) => ["hairGoal", "skinArea", "routine"].includes(id)));
  }
  assert.equal(outcome(colour({ colourChecks: "notyet" })).kind, "conditional");
  assert.equal(outcome(colour({ colourChecks: "reaction" })).kind, "pause");
  assert.equal(outcome(colour({ colourChecks: "shade" })).kind, "review");
});

test("exclusive choices, Back and edits preserve valid answers and clear all later dependencies", () => {
  let answers = answer({ careArea: "hair" });
  for (const [values, expected] of [[["reaction"], ["reaction"]], [["reaction", "none"], ["none"]], [["none", "irritated"], ["irritated"]], [["irritated", "reaction"], ["irritated", "reaction"]], [["irritated", "reaction", "unsure"], ["unsure"]]]) {
    answers = setQuizAnswer(answers, "check", values, catalog);
    assert.deepEqual(answers.check, expected);
  }
  const complete = both({ hairHistory: "light", skinChecks: "passed", strand: "passed" });
  assert.equal(setQuizAnswer(complete, "sharedNeed", ["fruit"], catalog), complete);
  assert.deepEqual(setQuizAnswer(complete, "careArea", ["colour"], catalog), answer({ careArea: "colour" }));
  const changed = setQuizAnswer(complete, "sharedNeed", ["flower"], catalog);
  assert.equal(changed.skinChecks, undefined);
  assert.equal(changed.strand, undefined);
  assert.equal(changed.hairHistory, undefined);
  assert.equal(getQuizFlow(changed, catalog).questions.at(-1).id, "hairHistory");
  const separate = setQuizAnswer(complete, "bothPlan", ["separate"], catalog);
  assert.equal(separate.sharedNeed, undefined);
  assert.equal(separate.skinArea, undefined);
  assert.equal(separate.skinChecks, undefined);
  assert.equal(setQuizAnswer(care(), "henna", ["ready"], catalog).henna, undefined);
  const treated = care({ hairHistory: "treated", treatmentType: ["colour", "bleach"], strand: "passed" });
  assert.equal(setQuizAnswer(treated, "treatmentType", ["bleach", "colour", "bogus"], catalog), treated);
});

test("live resolution requires identity, directions, the matching care role, stock and valid variants", () => {
  const result = outcome(care());
  assert.equal(resolveQuizResult(result, [product("reetha-powder")], "shopify").items.length, 1);
  for (const overrides of [
    { availableForSale: false }, { availableForSale: undefined }, { id: "gid://shopify/Product/999" },
    { slug: "different-powder", shopifyHandle: "different-powder", name: "Different Powder" },
    { ingredient: "" }, { ingredient: "Amla Powder" }, { ingredient: "Reetha powder, details pending" }, { howTo: [] },
    { careAreas: [] }, { ritualStep: "Colour" }, { variants: [] },
    { variants: [{ id: "preview:reetha-powder", availableForSale: true }] },
    { variants: [{ id: "gid://shopify/ProductVariant/100", availableForSale: false }] },
    { variants: [{ id: "gid://shopify/ProductVariant/100", availableForSale: true, quantityAvailable: 0 }] },
  ]) {
    const resultNow = resolveQuizResult(result, [product("reetha-powder", overrides), product("shikakai-powder")], "shopify");
    assert.equal(resultNow.kind, "no-match", JSON.stringify(overrides));
    assert.deepEqual(resultNow.items, []);
  }
  for (const kind of ["review", "pause", "guidance", "no-match"]) assert.deepEqual(resolveQuizResult({ ...result, kind }, futureProducts, "shopify").items, []);
  const preview = product("reetha-powder", { id: undefined, ingredient: "Preview details", availableForSale: undefined, variants: [] });
  assert.equal(resolveQuizResult(result, [preview], "preview").items.length, 1);
  assert.equal(resolveQuizResult(result, [preview], "shopify").items.length, 0);
});

test("catalogue changes revalidate skin area, dual-use permission and partial stock without substitutions", () => {
  const chosen = outcome(both());
  for (const overrides of [{ careAreas: ["Skin Care"] }, { howTo: ["Hair: Hair use only."] }, { availableForSale: false }]) {
    assert.equal(resolveQuizResult(chosen, [skinProduct("amla-powder", overrides)], "shopify").items.length, 0);
  }
  const pair = outcome({ ...care(), ...both({ bothPlan: "separate", skinNeed: "flower" }) });
  const partial = resolveQuizResult(pair, [product("reetha-powder"), skinProduct("hibiscus-powder", { availableForSale: false })], "shopify");
  assert.equal(partial.unavailable, true);
  assert.match(partial.title, /unavailable/);
  assert.match(partial.description, /Only part.*no substitute/);
  assert.deepEqual(partial.items.map((i) => i.product.slug), ["reetha-powder"]);
  const newCatalog = { products: hairProducts, source: "shopify" };
  assert.equal(getQuizFlow(both(), newCatalog).questions.at(-1).id, "bothFallback");
  assert.equal(getQuizFlow(both(), newCatalog).complete, false);
});

test("generic browsing is clearly separate and never substitutes skin, colour or excluded ingredients", () => {
  for (const answers of [skin({ check: "irritated" }), skin({ skinChecks: "reaction" }), both({ check: "unsure" })]) {
    assert.deepEqual(resolveQuizBrowseItems(answers, futureProducts, "shopify"), []);
  }
  const reaction = care({ check: "reaction", reactionIngredient: ["amla", "reetha"] });
  const items = resolveQuizBrowseItems(reaction, futureProducts, "shopify");
  assert.ok(items.length <= 2 && items.length > 0);
  assert.ok(items.every((i) => !["amla-powder", "reetha-powder", "indigo-powder"].includes(i.product.slug)));
  for (const answers of [colour({ colourTarget: "lighter" }), colour({ colourHistory: "bleach" })]) {
    assert.ok(resolveQuizBrowseItems(answers, futureProducts, "shopify").every((i) => i.role === "Pack"));
  }
  const changed = care({ hairHistory: "light", strand: "changed", routine: "two", packAddon: "flower" });
  assert.ok(resolveQuizBrowseItems(changed, futureProducts, "shopify").every((i) => !["reetha-powder", "hibiscus-powder"].includes(i.product.slug)));
  assert.deepEqual(resolveQuizBrowseItems(care(), futureProducts, "shopify"), []);
  const excluded = Object.keys(liveIds).map((slug) => slug.replace("-powder", ""));
  assert.deepEqual(resolveQuizBrowseItems(care({ check: "reaction", reactionIngredient: excluded }), futureProducts, "shopify"), []);
  const terminal = care({ check: "unsure" });
  assert.deepEqual(resolveQuizBrowseItems({ ...terminal, reactionIngredient: excluded }, futureProducts, "shopify"), resolveQuizBrowseItems(terminal, futureProducts, "shopify"));
});

function choices(question) {
  if (!question.multiple) return question.options.map((option) => [option.value]);
  const regular = question.options.filter((option) => !option.exclusive);
  const combinations = [];
  for (let mask = 1; mask < 2 ** regular.length; mask++) combinations.push(regular.filter((_, index) => mask & (1 << index)).map((option) => option.value));
  return [...combinations, ...question.options.filter((option) => option.exclusive).map((option) => [option.value])];
}

test("all reachable paths terminate with consistent care roles, no stale checks and at most two products", (t) => {
  const seenQuestions = new Set(), seenKinds = new Set(), seenProducts = new Set();
  let paths = 0;
  const visit = (answers, context) => {
    const flow = getQuizFlow(answers, context);
    assert.equal(new Set(flow.questions.map((q) => q.id)).size, flow.questions.length, "no branch cycles");
    for (const q of flow.questions) seenQuestions.add(q.id);
    if (!flow.complete) {
      const q = flow.questions.at(-1);
      assert.ok(q.options.length > 0);
      assert.equal(answers[q.id], undefined);
      for (const values of choices(q)) visit(setQuizAnswer(answers, q.id, values, context), context);
      return;
    }
    paths++;
    const result = flow.outcome;
    seenKinds.add(result.kind);
    assert.ok(result.title && result.description);
    assert.ok(result.candidates.length <= 2);
    assert.equal(new Set(slugs(result)).size, result.candidates.length);
    if (!["candidate", "conditional"].includes(result.kind)) {
      assert.deepEqual(result.candidates, []);
      return;
    }
    assert.deepEqual(answers.check, ["none"]);
    assert.ok(result.candidates.length > 0);
    for (const c of result.candidates) {
      seenProducts.add(c.slug);
      assert.ok(c.reason.length > 15);
      if (c.slug === "indigo-powder") assert.equal(result.careArea, "colour");
      if (c.role === "Skin" || c.role === "Both") {
        assert.ok(["skin", "both"].includes(result.careArea));
        assert.ok(["face", "body", "both"].includes(c.skinArea));
        assert.ok(["passed", "notyet"].includes(answers.skinChecks[0]));
      }
    }
    const resolution = resolveQuizResult(result, context.products, context.source);
    assert.equal(resolution.items.length, result.candidates.length);
    if (result.kind === "conditional") assert.equal(result.title, "Check before starting");
    if (result.careArea === "colour") {
      assert.deepEqual(slugs(result), ["indigo-powder"]);
      assert.deepEqual(answers.henna, ["ready"]);
      assert.ok(["deeper", "grey"].includes(answers.colourTarget[0]));
    } else if (result.careArea === "skin") {
      assert.ok(!flow.questions.some((q) => q.id === "hairHistory"));
      assert.ok(result.candidates.every((c) => c.role === "Skin"));
    } else {
      if (answers.hairHistory[0] !== "natural") assert.ok(["passed", "notyet"].includes(answers.strand[0]));
      if (result.careArea === "hair" && answers.routine[0] !== "two") assert.equal(result.candidates.length, 1);
      if (result.careArea === "both") assert.ok(!flow.questions.some((q) => q.id === "routine"));
    }
    const requiredChecks = result.careArea === "colour" ? [answers.colourChecks[0]] : [
      ...(result.careArea !== "hair" ? [answers.skinChecks[0]] : []),
      ...(flow.questions.some((q) => q.id === "strand") ? [answers.strand[0]] : []),
    ];
    assert.equal(result.kind, requiredChecks.includes("notyet") ? "conditional" : "candidate");
  };
  visit({}, catalog);
  visit({}, { products: hairProducts, source: "shopify" });
  assert.ok(paths > 3400);
  assert.equal(seenQuestions.size, ritualQuestions.length);
  assert.deepEqual([...seenKinds].sort(), ["candidate", "conditional", "guidance", "no-match", "pause", "review"]);
  assert.deepEqual([...seenProducts].sort(), Object.keys(liveIds).sort());
  t.diagnostic(`${paths} completed paths checked across the current-role and synthetic future skin catalogues.`);
});
