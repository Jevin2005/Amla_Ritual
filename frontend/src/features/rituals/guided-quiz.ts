import { type Product } from "@/domain/catalog/products";
import { matchesProductSlug } from "@/domain/catalog/canonical-slug";

export type QuizQuestionId = "goal" | "check" | "reactionIngredient" | "skinNeed" | "skinChecks" | "washNeed" | "conditionNeed" | "scalpNeed" | "scalpType" | "hairHistory" | "treatmentType" | "routine" | "conditionAddon" | "cleanseAddon" | "strand" | "colourTarget" | "colourBase" | "colourHistory" | "henna" | "colourChecks";
export type QuizAnswers = Partial<Record<QuizQuestionId, string[]>>;
export type QuizQuestion = {
  id: QuizQuestionId;
  label: string;
  question: string;
  helper: string;
  multiple: boolean;
  options: { value: string; label: string; description?: string; exclusive?: boolean }[];
};
export type QuizCandidate = { slug: string; reason: string; role: "Cleanse" | "Pack" | "Condition" | "Colour" | "Skin" };
export type QuizCatalog = { products: readonly Product[]; source: "shopify" | "preview" };
export type QuizOutcome = {
  kind: "candidate" | "conditional" | "review" | "guidance" | "pause" | "no-match";
  title: string;
  description: string;
  candidates: QuizCandidate[];
};
export type QuizFlow = { questions: QuizQuestion[]; complete: boolean; outcome: QuizOutcome | null };
export type QuizResult = Omit<QuizOutcome, "candidates"> & {
  items: { product: Product; reason: string; role: QuizCandidate["role"] }[];
  unavailable: boolean;
};

export const ritualQuestions: QuizQuestion[] = [
  {
    id: "goal", label: "Your goal", question: "What would you like to focus on?", helper: "Choose one main goal.", multiple: false, options: [
      { value: "cleanse", label: "Hair cleansing", description: "A botanical wash-day routine." },
      { value: "softness", label: "Herbal hair packs", description: "Choose a botanical for a traditional hair-pack routine." },
      { value: "scalp", label: "Hair & scalp care", description: "Choose between a hair wash and a traditional pack." },
      { value: "skin", label: "Skin-use guidance", description: "Check whether skin use is confirmed for the current range." },
      { value: "colour", label: "Hair colour", description: "Explore a suitable botanical colour method." },
    ]
  },
  {
    id: "check", label: "Quick check", question: "Anything we should consider first?", helper: "Select all that apply.", multiple: true, options: [
      { value: "irritated", label: "My skin or scalp is irritated, or the skin is broken" },
      { value: "reaction", label: "I have reacted to a skin, hair or botanical product" },
      { value: "none", label: "Neither applies", exclusive: true },
      { value: "unsure", label: "I am not sure", exclusive: true },
    ]
  },
  {
    id: "skinNeed", label: "Your skin ritual", question: "Which botanical would you like to explore?", helper: "Choose by ingredient preference. This guide does not assess skin conditions or predict how your skin will respond.", multiple: false, options: [
      { value: "flower", label: "Hibiscus flower powder", description: "A flower-based rinse-off skin ritual." },
      { value: "fruit", label: "Amla fruit powder", description: "A fruit-based rinse-off skin ritual." },
      { value: "compare", label: "Compare both options", description: "Read about each powder, then choose one to start." },
    ]
  },
  {
    id: "skinChecks", label: "Before skin use", question: "Have you followed the skin-use patch-test directions?", helper: "Use the current pack directions for every powder you are considering. A clear patch test cannot rule out a later reaction.", multiple: false, options: [
      { value: "passed", label: "Yes, with no irritation or reaction" },
      { value: "notyet", label: "Not yet" },
      { value: "reaction", label: "I noticed irritation or a reaction" },
    ]
  },
  {
    id: "reactionIngredient", label: "Ingredient review", question: "Do you know what you reacted to?", helper: "Select known ingredients, or choose Not sure.", multiple: true, options: [
      { value: "reetha", label: "Reetha Powder" }, { value: "shikakai", label: "Shikakai Powder" },
      { value: "amla", label: "Amla Powder" }, { value: "hibiscus", label: "Hibiscus Powder" },
      { value: "bhringraj", label: "Bhringraj Powder" }, { value: "indigo", label: "Indigo Powder" },
      { value: "other", label: "Another ingredient", exclusive: true },
      { value: "unsure", label: "I do not know the ingredient", exclusive: true },
    ]
  },
  {
    id: "washNeed", label: "Your wash", question: "Which hair-wash ingredient interests you?", helper: "Choose an ingredient for a herbal cleansing routine.", multiple: false, options: [
      { value: "oil", label: "Reetha soapnut powder" },
      { value: "manage", label: "Shikakai pod powder" },
      { value: "beginner", label: "Trying my first botanical wash" },
      { value: "unsure", label: "I am not sure" },
    ]
  },
  {
    id: "conditionNeed", label: "Your hair pack", question: "Which hair-pack ingredient interests you?", helper: "Choose by ingredient preference. Softness, shine and manageability have not been established for these finished powders.", multiple: false, options: [
      { value: "flower", label: "Hibiscus flower powder" },
      { value: "fruit", label: "Amla fruit powder" },
      { value: "general", label: "A simple traditional hair pack" },
      { value: "unsure", label: "I am not sure" },
    ]
  },
  {
    id: "scalpNeed", label: "Your scalp", question: "What brings you to scalp care?", helper: "Choose the closest match.", multiple: false, options: [
      { value: "oil", label: "A herbal hair wash" },
      { value: "condition", label: "A traditional hair-and-scalp pack" },
      { value: "irritation", label: "Persistent itching, flaking or discomfort" },
      { value: "loss", label: "Sudden or patchy hair loss" },
      { value: "unsure", label: "I am not sure" },
    ]
  },
  {
    id: "scalpType", label: "Your scalp", question: "Which kind of step are you looking for?", helper: "Choose a hair-wash ingredient or a separate traditional hair pack.", multiple: false, options: [
      { value: "wash", label: "A wash for my scalp and hair" },
      { value: "mask", label: "A traditional hair pack" },
      { value: "unsure", label: "I need help choosing" },
    ]
  },
  {
    id: "hairHistory", label: "Your hair", question: "Which best describes your hair now?", helper: "If your hair is treated, choose the treated option.", multiple: false, options: [
      { value: "natural", label: "Untreated brown or black hair" },
      { value: "light", label: "Naturally light, grey or white hair" },
      { value: "treated", label: "Coloured, bleached or chemically treated hair" },
      { value: "unsure", label: "I am not sure" },
    ]
  },
  {
    id: "treatmentType", label: "Hair history", question: "Which treatments are on your hair?", helper: "Select all that apply.", multiple: true, options: [
      { value: "colour", label: "Hair dye" }, { value: "bleach", label: "Bleach or highlights" },
      { value: "chemical", label: "Perming, relaxing or chemical straightening" },
      { value: "unsure", label: "I am not sure", exclusive: true },
    ]
  },
  {
    id: "routine", label: "Your routine", question: "How simple would you like your routine?", helper: "Choose the number of steps you actually want.", multiple: false, options: [
      { value: "one", label: "One product to start" },
      { value: "two", label: "Two complementary steps" },
      { value: "unsure", label: "I am not sure — keep it simple" },
    ]
  },
  {
    id: "conditionAddon", label: "Your second step", question: "Which hair-pack ingredient would you like?", helper: "This would be a separate pack step, used according to its directions.", multiple: false, options: [
      { value: "flower", label: "Hibiscus flower powder" },
      { value: "fruit", label: "Amla fruit powder" },
      { value: "scalp", label: "Bhringraj for a traditional hair-and-scalp pack" },
      { value: "skip", label: "Keep just the cleanser" },
    ]
  },
  {
    id: "cleanseAddon", label: "Your second step", question: "Which hair-wash ingredient would you like?", helper: "This would be a separate wash step.", multiple: false, options: [
      { value: "oil", label: "Reetha soapnut powder" },
      { value: "manage", label: "Shikakai pod powder" },
      { value: "skip", label: "Keep just the hair pack" },
    ]
  },
  {
    id: "strand", label: "Check before starting", question: "Have you checked these botanicals on a hidden strand?", helper: "Yes means every suggested product was checked. A strand check does not replace a skin patch test.", multiple: false, options: [
      { value: "passed", label: "Yes — I checked each one and am happy with the results" },
      { value: "notyet", label: "Not yet" },
      { value: "changed", label: "The colour or feel changed unexpectedly" },
      { value: "unsure", label: "I am not sure" },
    ]
  },
  {
    id: "colourTarget", label: "Your colour goal", question: "What colour result are you hoping for?", helper: "Choose a direction, rather than an exact promised shade.", multiple: false, options: [
      { value: "deeper", label: "Deeper brown-to-dark tones" },
      { value: "grey", label: "A darker result on greys" },
      { value: "lighter", label: "A lighter or blonde result" },
      { value: "copper", label: "Red or copper tones" },
      { value: "unsure", label: "I am not sure yet" },
    ]
  },
  {
    id: "colourBase", label: "Your starting colour", question: "What colour are you starting with?", helper: "Choose the closest match.", multiple: false, options: [
      { value: "dark", label: "Dark brown or black" }, { value: "brown", label: "Light or medium brown" },
      { value: "light", label: "Blonde or lightened hair" }, { value: "grey", label: "Mostly grey or white" },
      { value: "mixed", label: "Dark hair with some greys" }, { value: "unsure", label: "I am not sure" },
    ]
  },
  {
    id: "colourHistory", label: "Your colour history", question: "Which colour treatments are on your hair?", helper: "Select all that apply.", multiple: true, options: [
      { value: "henna", label: "Henna" }, { value: "dye", label: "Other hair dye" },
      { value: "bleach", label: "Bleach or highlights" }, { value: "chemical", label: "Perming, relaxing or chemical straightening" },
      { value: "none", label: "No previous colour or chemical treatment", exclusive: true },
      { value: "unsure", label: "I am not sure", exclusive: true },
    ]
  },
  {
    id: "henna", label: "Your colour method", question: "Does your colour plan include a suitable henna-first step?", helper: "Indigo is only one stage of this colour method.", multiple: false, options: [
      { value: "ready", label: "Yes — I have the henna step and product directions" },
      { value: "no", label: "No, I only have or want Indigo" },
      { value: "unsure", label: "I need help with the method" },
    ]
  },
  {
    id: "colourChecks", label: "Before full colour", question: "Have you completed the product patch and strand checks?", helper: "Check the complete henna-and-indigo method using its product instructions. A clear test cannot guarantee that a reaction will never happen.", multiple: false, options: [
      { value: "passed", label: "Yes — no reaction and an acceptable strand result" },
      { value: "notyet", label: "Not yet" },
      { value: "reaction", label: "I noticed irritation or a reaction" },
      { value: "shade", label: "The strand colour was not what I wanted" },
    ]
  },
];

const questionsById = Object.fromEntries(ritualQuestions.map((question) => [question.id, question])) as Record<QuizQuestionId, QuizQuestion>;
const names: Record<string, string> = {
  "reetha-powder": "Reetha Powder", "shikakai-powder": "Shikakai Powder", "amla-powder": "Amla Powder",
  "hibiscus-powder": "Hibiscus Powder", "bhringraj-powder": "Bhringraj Powder", "indigo-powder": "Indigo Powder",
};

function validAnswer(question: QuizQuestion, value: string[] | undefined): value is string[] {
  return Array.isArray(value) && value.length > 0 && (question.multiple || value.length === 1)
    && new Set(value).size === value.length
    && value.every((item) => question.options.some((option) => option.value === item))
    && (value.length === 1 || !value.some((item) => question.options.find((option) => option.value === item)?.exclusive));
}

/** Traverse only the answered, reachable branch; the final question may be unanswered. */
export function getQuizFlow(answers: QuizAnswers, catalog?: QuizCatalog): QuizFlow {
  const questions: QuizQuestion[] = [];
  const pending = (): QuizFlow => ({ questions, complete: false, outcome: null });
  const finish = (kind: QuizOutcome["kind"], title: string, description: string, candidates: QuizCandidate[] = []): QuizFlow => ({ questions, complete: true, outcome: { kind, title, description, candidates } });
  const ask = (id: QuizQuestionId, helper?: string) => {
    const question = helper ? { ...questionsById[id], helper } : questionsById[id];
    questions.push(question);
    return validAnswer(question, answers[id]) ? answers[id] : undefined;
  };
  const goal = ask("goal")?.[0];
  if (!goal) return pending();
  if (goal === "skin" && catalog && !catalog.products.some((product) => product.careAreas?.includes("Skin Care")
    && ["amla-powder", "hibiscus-powder"].some((slug) => isVerifiedCandidate(product, slug, catalog.source)))) {
    const hasSkinUse = catalog.products.some((product) => product.careAreas?.includes("Skin Care"));
    return finish("guidance", hasSkinUse ? "No skin ritual is available right now" : "Skin use is not yet confirmed", hasSkinUse
      ? "No matching product is available with the confirmed details needed for a skin ritual. Check the current product directions before considering skin use."
      : "The current range is for herbal hair packs, hair washes and botanical hair colour. Skin use has not been confirmed for these powders. Do not use hair-pack directions for your face or body.");
  }
  const check = ask("check");
  if (!check) return pending();
  if (check.includes("irritated")) return finish("pause", "Discover the botanical collection", "Explore product details while you plan your care. Avoid applying botanicals to irritated or broken skin, and seek professional advice before use.");
  if (check.includes("reaction")) {
    const ingredients = ask("reactionIngredient");
    if (!ingredients) return pending();
    const known = ingredients.filter((value) => value !== "other" && value !== "unsure").map((value) => names[`${value}-powder`]);
    return finish("review", "Discover the botanical collection", `${known.length ? `Avoid ${known.join(" and ")}, which you linked to a reaction.` : "Explore the ingredients and care benefits below."} After a previous reaction, ask a dermatologist before trying a new botanical.`);
  }
  if (check.includes("unsure")) return finish("review", "Get to know your botanicals", "If you may have reacted before or your skin or scalp is irritated, get professional advice before choosing a botanical.");

  if (goal === "skin") {
    const preference = ask("skinNeed")?.[0];
    if (!preference) return pending();
    const checks = ask("skinChecks")?.[0];
    if (!checks) return pending();
    if (checks === "reaction") return finish("pause", "Pause your skin ritual", "Stop using the product that caused irritation or a reaction. Seek professional advice before trying another botanical; this guide will not suggest a replacement.");
    const candidates: QuizCandidate[] = [];
    if (preference !== "fruit") candidates.push({ slug: "hibiscus-powder", role: "Skin", reason: "Hibiscus matches your interest in a flower-based rinse-off ritual. Use only the skin directions for this powder." });
    if (preference !== "flower") candidates.push({ slug: "amla-powder", role: "Skin", reason: "Amla matches your interest in a fruit-based rinse-off ritual. Use only the skin directions for this powder." });
    return finish(checks === "notyet" ? "conditional" : "candidate", checks === "notyet" ? "Check before starting" : "Your suggested starting ritual", `${preference === "compare" ? "These are alternatives: choose one powder to start, rather than layering or mixing them. " : "A starting option based on your ingredient preference. "}${checks === "notyet" ? "Before applying it to your face or body, follow the current pack's skin-use patch-test directions. " : "Follow the current pack's skin-use directions. "}Keep away from the eyes and lips, rinse off as directed, and stop if irritation occurs.`, candidates);
  }

  if (goal === "colour") {
    const target = ask("colourTarget")?.[0];
    if (!target) return pending();
    if (target === "lighter" || target === "copper") return finish("no-match", "Explore care alongside colour", `This collection does not create ${target === "lighter" ? "lighter or blonde" : "red or copper"} tones. Discover traditional hair-pack ingredients below for a separate hair-care step.`);
    if (target === "unsure") return finish("guidance", "Choose your colour direction first", "Clarify the colour result you want before selecting a botanical colour method. Results depend on your starting colour and the complete method.");
    const base = ask("colourBase")?.[0];
    if (!base) return pending();
    if (base === "unsure") return finish("guidance", "Check your starting colour", "Your starting colour needs to be clear before choosing a darkening method. Get guidance on your current base and the result you want.");
    const history = ask("colourHistory");
    if (!history) return pending();
    if (base === "light" || history.some((value) => ["dye", "bleach", "chemical", "unsure"].includes(value))) return finish("review", "Review colour compatibility first", "Your starting colour or treatment history needs a compatibility review before choosing Indigo. Check the current product instructions and seek guidance for your hair history.");
    const henna = ask("henna")?.[0];
    if (!henna) return pending();
    if (henna !== "ready") return finish("guidance", "Plan the complete colour method", "A suitable henna-first step and its product directions are needed before considering Indigo. Indigo alone cannot promise black results on grey or blonde hair. Henna is not included in this collection.");
    const checks = ask("colourChecks")?.[0];
    if (!checks) return pending();
    if (checks === "reaction") return finish("pause", "Explore care beyond colour", "Stop using the colour products that caused a reaction and seek professional advice before trying another botanical. You can browse general care products below.");
    if (checks === "shade") return finish("review", "Explore care alongside colour", "Your strand result was different from your goal. Review the colour method before a full application; the products below are separate hair-pack ingredients.");
    const candidate: QuizCandidate = { slug: "indigo-powder", role: "Colour", reason: target === "grey" ? "The Indigo stage of your confirmed henna-first method fits your aim of a darker result on greys; the final shade is not guaranteed." : "The Indigo stage of your confirmed henna-first method fits your aim of deeper brown-to-dark tones; the final shade is not guaranteed." };
    return finish(checks === "notyet" ? "conditional" : "candidate", checks === "notyet" ? "Check before starting" : "Your suggested starting ritual", checks === "notyet" ? "Complete the patch and strand checks for the whole henna-and-indigo method using its product directions before deciding on a full application." : "Indigo is one colour stage, alongside your separate suitable henna-first step. Follow the complete method's current directions. An acceptable check does not guarantee a shade or rule out a future reaction.", [candidate]);
  }

  let main: QuizCandidate | undefined;
  const wash = () => {
    const need = ask("washNeed")?.[0];
    if (!need) return;
    main = need === "oil"
      ? { slug: "reetha-powder", role: "Cleanse", reason: "You chose Reetha soapnut powder as an ingredient for a herbal hair wash." }
      : { slug: "shikakai-powder", role: "Cleanse", reason: need === "manage" ? "You chose Shikakai pod powder for a traditional hair-washing routine." : need === "beginner" ? "You are exploring your first herbal wash; Shikakai is a traditional hair-washing ingredient to read about." : "Shikakai is an option to explore for a traditional hair-washing routine." };
  };
  if (goal === "cleanse") wash();
  if (goal === "softness") {
    const need = ask("conditionNeed")?.[0];
    if (!need) return pending();
    main = need === "flower"
      ? { slug: "hibiscus-powder", role: "Pack", reason: "You chose Hibiscus flower powder as an ingredient for a traditional hair pack." }
      : { slug: "amla-powder", role: "Pack", reason: need === "fruit" ? "You chose Amla fruit powder as an ingredient for a traditional hair pack." : "Amla is an option to explore for a simple traditional hair-pack routine." };
  }
  if (goal === "scalp") {
    const need = ask("scalpNeed")?.[0];
    if (!need) return pending();
    if (need === "irritation" || need === "loss") return finish("review", "Get professional guidance first", `You mentioned ${need === "loss" ? "sudden or patchy hair loss" : "persistent itching, flaking or discomfort"}. Seek advice from a qualified healthcare professional. A cosmetic botanical ritual is not a treatment for these concerns.`);
    if (need === "oil") main = { slug: "reetha-powder", role: "Cleanse", reason: "You asked for a herbal hair wash; Reetha is a soapnut ingredient used for cleansing routines." };
    if (need === "condition") main = { slug: "bhringraj-powder", role: "Pack", reason: "You asked for a traditional hair-and-scalp pack; Bhringraj has an Ayurvedic hair-care heritage." };
    if (need === "unsure") {
      const type = ask("scalpType")?.[0];
      if (!type) return pending();
      if (type === "unsure") return finish("guidance", "Choose your care step first", "A herbal hair wash and a traditional hair pack have separate roles. Get help choosing the kind of step you want before selecting a powder.");
      if (type === "wash") wash();
      if (type === "mask") main = { slug: "bhringraj-powder", role: "Pack", reason: "You chose a traditional hair-and-scalp pack; Bhringraj is an ingredient for that routine." };
    }
  }
  if (!main) return pending();
  const history = ask("hairHistory")?.[0];
  if (!history) return pending();
  if (history === "unsure") return finish("review", "Check your hair history first", "Clarify your current colour and treatment history before choosing a botanical. The right guidance depends on what is already on your hair.");
  if (history === "treated") {
    const treatments = ask("treatmentType");
    if (!treatments) return pending();
    if (treatments.includes("unsure")) return finish("review", "Review your treatment history", "You are unsure which treatments are on your hair. Check your treatment history and product compatibility before choosing a botanical.");
  }
  const routine = ask("routine")?.[0];
  if (!routine) return pending();
  const candidates: QuizCandidate[] = [main];
  if (routine === "two") {
    const id = main.role === "Cleanse" ? "conditionAddon" : "cleanseAddon";
    const addon = ask(id)?.[0];
    if (!addon) return pending();
    if (addon !== "skip") {
      if (id === "conditionAddon") candidates.unshift(addon === "flower"
        ? { slug: "hibiscus-powder", role: "Pack", reason: "You chose Hibiscus flower powder for a separate traditional hair-pack step." }
        : addon === "fruit"
          ? { slug: "amla-powder", role: "Pack", reason: "You chose Amla fruit powder for a separate traditional hair-pack step." }
          : { slug: "bhringraj-powder", role: "Pack", reason: "You chose Bhringraj for a separate traditional hair-and-scalp pack." });
      else candidates.push(addon === "oil"
        ? { slug: "reetha-powder", role: "Cleanse", reason: "You chose Reetha soapnut powder for a separate herbal hair-wash step." }
        : { slug: "shikakai-powder", role: "Cleanse", reason: "You chose Shikakai pod powder for a separate traditional hair-wash step." });
    }
  }
  if (history === "light" || history === "treated") {
    const strand = ask("strand", `${candidates.map((candidate) => names[candidate.slug]).join(" and ")}. ${questionsById.strand.helper}`)?.[0];
    if (!strand) return pending();
    if (strand === "changed" || strand === "unsure") return finish("review", "Review your strand result", strand === "changed" ? "The colour or feel changed unexpectedly on your hidden strand. Review these products and your hair history before deciding on a full application." : "You are unsure about the strand result. Review every suggested product and its current directions before deciding on a full application.");
    if (strand === "notyet") return finish("conditional", "Check before starting", `Check ${candidates.map((candidate) => names[candidate.slug]).join(" and ")} on a hidden strand using each product's current directions before deciding to begin. A strand check does not replace a skin patch test.`, candidates);
  }
  return finish("candidate", "Your suggested starting ritual", candidates.length === 2 ? "These are separate care steps: a traditional hair pack and a herbal hair wash. Follow each product's current directions for preparation, order of use and testing." : "A starting suggestion based on your ingredient and routine preferences. Follow the current product directions and patch-test guidance before use.", candidates);
}

/** Selecting a new exclusive answer clears other selections, and vice versa. */
export function setQuizAnswer(answers: QuizAnswers, id: QuizQuestionId, values: string[], catalog?: QuizCatalog): QuizAnswers {
  const question = questionsById[id];
  const previous = answers[id] ?? [];
  const allowed = [...new Set(values)].filter((value) => question.options.some((option) => option.value === value));
  const added = allowed.filter((value) => !previous.includes(value));
  const latest = added.at(-1) ?? allowed.at(-1);
  let normalized: string[];
  if (!question.multiple) normalized = latest ? [latest] : [];
  else if (question.options.find((option) => option.value === latest)?.exclusive) normalized = latest ? [latest] : [];
  else normalized = question.options.filter((option) => !option.exclusive && allowed.includes(option.value)).map((option) => option.value);
  if (normalized.length === previous.length && normalized.every((value) => previous.includes(value))) return answers;
  const flow = getQuizFlow(answers, catalog);
  const index = flow.questions.findIndex((entry) => entry.id === id);
  if (index < 0) return answers;
  const next: QuizAnswers = {};
  for (const entry of flow.questions.slice(0, index)) if (answers[entry.id]) next[entry.id] = [...answers[entry.id]!];
  if (normalized.length) next[id] = normalized;
  return next;
}

// Verified against the live Storefront catalogue on 11 October 2026. Earlier
// listing snapshots used different names for several IDs and must not be used.
// Compatibility is gated by the explicit branches above; empty Shopify safety
// or colour-consideration fields never establish that a botanical is safe.
const verifiedProductIds: Record<string, string> = {
  "amla-powder": "gid://shopify/Product/8494763311290",
  "reetha-powder": "gid://shopify/Product/8498815107258",
  "indigo-powder": "gid://shopify/Product/8531585368250",
  "bhringraj-powder": "gid://shopify/Product/8531585433786",
  "hibiscus-powder": "gid://shopify/Product/8531585499322",
  "shikakai-powder": "gid://shopify/Product/8531585597626",
};

function isVerifiedCandidate(product: Product, slug: string, source: "shopify" | "preview") {
  if (source === "preview") return matchesProductSlug(slug, product) && product.availableForSale !== false;
  if (!verifiedProductIds[slug] || product.id !== verifiedProductIds[slug] || !matchesProductSlug(slug, product)) return false;
  if (product.availableForSale !== true || !product.variants?.some((variant) => /^gid:\/\/shopify\/ProductVariant\/\d+$/.test(variant.id) && variant.availableForSale && (variant.quantityAvailable == null || variant.quantityAvailable > 0))) return false;
  const ingredient = product.ingredient?.trim();
  if (!ingredient || !new RegExp(`\\b${slug.replace("-powder", "")}\\b`, "i").test(ingredient) || /to be confirmed|pending|confirmed on|verified on/i.test(ingredient)) return false;
  return product.howTo.some((line) => Boolean(line.trim()));
}

const collectionCare: QuizCandidate[] = [
  { slug: "amla-powder", role: "Pack", reason: "Amla fruit powder is an ingredient for a traditional herbal hair pack." },
  { slug: "hibiscus-powder", role: "Pack", reason: "Hibiscus flower powder is an ingredient for a botanical hair-pack routine." },
  { slug: "bhringraj-powder", role: "Pack", reason: "Bhringraj is an ingredient for traditional hair-and-scalp packs, with an Ayurvedic hair-care heritage." },
  { slug: "shikakai-powder", role: "Cleanse", reason: "Shikakai pod powder is an ingredient for traditional herbal hair washing." },
  { slug: "reetha-powder", role: "Cleanse", reason: "Reetha soapnut powder is an ingredient for a botanical hair-wash routine." },
];

/** General product discovery for completed routes without a personal recommendation. */
export function resolveQuizBrowseItems(answers: QuizAnswers, products: readonly Product[], source: "shopify" | "preview"): QuizResult["items"] {
  const flow = getQuizFlow(answers, { products, source });
  if (!flow.complete || !flow.outcome || resolveQuizResult(flow.outcome, products, source).items.length > 0) return [];
  const goal = answers.goal?.[0];
  // A stopped skin route must not turn a reaction or an unconfirmed product
  // into a recommendation for a different powder.
  if (goal === "skin") return [];
  const excluded = flow.questions.some((question) => question.id === "reactionIngredient")
    ? (answers.reactionIngredient ?? []).filter((ingredient) => Boolean(names[`${ingredient}-powder`]))
    : [];
  const changedStrandSlugs = flow.questions.some((question) => question.id === "strand") && answers.strand?.[0] === "changed"
    ? getQuizFlow({ ...answers, strand: ["passed"] }).outcome?.candidates.map((candidate) => candidate.slug) ?? []
    : [];
  const preferred = goal === "cleanse" ? ["shikakai-powder", "reetha-powder"]
    : goal === "scalp" ? ["bhringraj-powder", "reetha-powder"]
      : ["amla-powder", "hibiscus-powder"];
  const collection = [...collectionCare].sort((a, b) => {
    const priority = (slug: string) => preferred.includes(slug) ? preferred.indexOf(slug) : preferred.length;
    return priority(a.slug) - priority(b.slug);
  });
  return collection.flatMap(({ slug, role, reason }) => {
    // Colour dead ends show separate hair packs, never an incompatible colour substitute.
    if (goal === "colour" && role !== "Pack") return [];
    if (changedStrandSlugs.includes(slug)) return [];
    if (excluded.some((ingredient) => slug === `${ingredient}-powder`)) return [];
    const product = products.find((entry) => isVerifiedCandidate(entry, slug, source)
      && !excluded.some((ingredient) => new RegExp(`\\b${ingredient}\\b`, "i").test(`${entry.name} ${entry.ingredient}`)));
    return product ? [{ product, role, reason }] : [];
  }).slice(0, 2);
}

/** Resolve exact candidates against current records; never fill a gap with another role. */
export function resolveQuizResult(outcome: QuizOutcome, products: readonly Product[], source: "shopify" | "preview"): QuizResult {
  const { kind, title, description } = outcome;
  if (kind !== "candidate" && kind !== "conditional") return { kind, title, description, items: [], unavailable: false };
  const items = outcome.candidates.slice(0, 2).flatMap(({ slug, reason, role }) => {
    const product = products.find((entry) => isVerifiedCandidate(entry, slug, source)
      && (role !== "Skin" || entry.careAreas?.includes("Skin Care")));
    return product ? [{ product, reason, role }] : [];
  });
  const unavailable = items.length !== outcome.candidates.length;
  const skinOnly = outcome.candidates.every((candidate) => candidate.role === "Skin");
  if (!items.length) return { kind: "no-match", title: skinOnly ? "No confirmed skin ritual is available" : "Discover more botanicals", description: skinOnly ? "No matching product is available with confirmed skin-use information. The current powders are for their stated hair-care or hair-colour roles; do not adapt hair-pack directions for your face or body." : "Your selected ritual is not available right now. Explore the collection below or edit your answers to plan a different care routine.", items, unavailable: true };
  const partialDescription = skinOnly
    ? "Only one of your skin-care options is available with confirmed product information. No substitute has been added. Follow the available product's current skin-use directions and patch-test guidance before starting."
    : `Only part of your requested ritual is available with confirmed product information. The remaining suggested step is unavailable; no substitute has been added. ${kind === "conditional" ? "Before deciding to begin, check the available product on a hidden strand and follow its current patch-test guidance." : "Follow the available product's current pack instructions and testing guidance."}`;
  return { kind, title, description: unavailable ? partialDescription : description, items, unavailable };
}
