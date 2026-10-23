import { type Product } from "@/domain/catalog/products";
import { matchesProductSlug } from "@/domain/catalog/canonical-slug";
import { botanicalProfiles, profilesForTopic } from "@/domain/catalog/botanical-uses";

export type QuizQuestionId = "goal" | "hairGoal" | "researchArea" | "researchFocus" | "check" | "reactionIngredient" | "washNeed" | "conditionNeed" | "scalpNeed" | "scalpType" | "hairHistory" | "treatmentType" | "routine" | "conditionAddon" | "cleanseAddon" | "strand" | "colourTarget" | "colourBase" | "colourHistory" | "henna" | "colourChecks";
export type QuizAnswers = Partial<Record<QuizQuestionId, string[]>>;
export type QuizQuestion = {
  id: QuizQuestionId;
  label: string;
  question: string;
  helper: string;
  multiple: boolean;
  options: { value: string; label: string; description?: string; exclusive?: boolean }[];
};
export type QuizCandidate = { slug: string; reason: string; role: "Cleanse" | "Condition" | "Colour" };
export type QuizOutcome = {
  kind: "candidate" | "conditional" | "review" | "guidance" | "pause" | "no-match" | "research";
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
      { value: "cleanse", label: "Cleanse", description: "A botanical wash-day routine." },
      { value: "softness", label: "Hair packs", description: "Choose a botanical pack ingredient." },
      { value: "scalp", label: "Scalp care", description: "Choose between cleansing and conditioning." },
      { value: "colour", label: "Botanical colour", description: "Explore a suitable colour method." },
      { value: "skin", label: "Skin research", description: "Discover ingredient studies and traditions." },
      { value: "body", label: "Body research", description: "Explore botanical cleanser research." },
      { value: "both", label: "Hair + skin or body", description: "Plan hair care and explore wider ingredient research." },
    ]
  },
  {
    id: "researchArea", label: "Your wider interest", question: "Which research would you like alongside your hair ritual?", helper: "Your product suggestions will be for hair use. Wider uses are presented as ingredient research.", multiple: false, options: [
      { value: "skin", label: "Skin research" }, { value: "body", label: "Body research" },
    ]
  },
  {
    id: "researchFocus", label: "Your ingredient interest", question: "Which botanical would you like to learn about?", helper: "Explore the evidence and what it can tell us about the ingredient.", multiple: false, options: [
      { value: "all", label: "Show all relevant botanicals" },
      ...botanicalProfiles.filter((profile) => profile.research.length > 0).map((profile) => ({ value: profile.slug, label: profile.name })),
    ]
  },
  {
    id: "hairGoal", label: "Your hair ritual", question: "What would you like your hair ritual to include?", helper: "Choose the hair-care step you want to explore.", multiple: false, options: [
      { value: "cleanse", label: "Hair cleansing" }, { value: "softness", label: "A botanical hair pack" }, { value: "scalp", label: "Hair and scalp care" },
    ]
  },
  {
    id: "check", label: "Quick check", question: "Anything we should consider first?", helper: "Select all that apply.", multiple: true, options: [
      { value: "irritated", label: "My scalp is irritated or the skin is broken" },
      { value: "reaction", label: "I have reacted to a hair product or botanical" },
      { value: "none", label: "Neither applies", exclusive: true },
      { value: "unsure", label: "I am not sure", exclusive: true },
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
    id: "washNeed", label: "Your wash", question: "What matters most in your wash?", helper: "Choose the closest match.", multiple: false, options: [
      { value: "oil", label: "Removing oil and everyday buildup" },
      { value: "manage", label: "A traditional Shikakai wash" },
      { value: "beginner", label: "Trying my first botanical wash" },
      { value: "unsure", label: "I am not sure" },
    ]
  },
  {
    id: "conditionNeed", label: "Your hair pack", question: "Which kind of hair pack interests you?", helper: "Choose an ingredient preference. Individual results vary.", multiple: false, options: [
      { value: "dry", label: "A floral hair pack" },
      { value: "manage", label: "Explore Hibiscus flower powder" },
      { value: "shine", label: "Explore Amla fruit powder" },
      { value: "general", label: "A simple herbal pack routine" },
      { value: "unsure", label: "I am not sure" },
    ]
  },
  {
    id: "scalpNeed", label: "Your scalp", question: "What brings you to scalp care?", helper: "Choose the closest match.", multiple: false, options: [
      { value: "oil", label: "Oil and everyday buildup" },
      { value: "condition", label: "A general hair-and-scalp conditioning ritual" },
      { value: "irritation", label: "Persistent itching, flaking or discomfort" },
      { value: "loss", label: "Sudden or patchy hair loss" },
      { value: "unsure", label: "I am not sure" },
    ]
  },
  {
    id: "scalpType", label: "Your scalp", question: "Which kind of step are you looking for?", helper: "A wash cleanses. A mask adds a conditioning step.", multiple: false, options: [
      { value: "wash", label: "A wash for my scalp and hair" },
      { value: "mask", label: "A conditioning mask" },
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
    id: "conditionAddon", label: "Your second step", question: "What should your conditioning step focus on?", helper: "This would be a separate mask step.", multiple: false, options: [
      { value: "dry", label: "A Hibiscus flower pack" },
      { value: "shine", label: "An Amla fruit pack" },
      { value: "scalp", label: "Hair-and-scalp conditioning" },
      { value: "skip", label: "Keep just the cleanser" },
    ]
  },
  {
    id: "cleanseAddon", label: "Your second step", question: "What should your cleansing step focus on?", helper: "This would be a separate wash step.", multiple: false, options: [
      { value: "oil", label: "Oil and everyday buildup" },
      { value: "manage", label: "A traditional Shikakai wash" },
      { value: "skip", label: "Keep just the mask" },
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
export function getQuizFlow(answers: QuizAnswers): QuizFlow {
  const questions: QuizQuestion[] = [];
  const pending = (): QuizFlow => ({ questions, complete: false, outcome: null });
  const finish = (kind: QuizOutcome["kind"], title: string, description: string, candidates: QuizCandidate[] = []): QuizFlow => ({ questions, complete: true, outcome: { kind, title, description, candidates } });
  const ask = (id: QuizQuestionId, helper?: string, options?: QuizQuestion["options"]) => {
    const question = { ...questionsById[id], ...(helper ? { helper } : {}), ...(options ? { options } : {}) };
    questions.push(question);
    return validAnswer(question, answers[id]) ? answers[id] : undefined;
  };
  let goal = ask("goal")?.[0];
  if (!goal) return pending();
  if (["skin", "body", "both"].includes(goal)) {
    const area = goal === "both" ? ask("researchArea")?.[0] : goal;
    if (area !== "skin" && area !== "body") return pending();
    const relevant = profilesForTopic(area);
    const focus = ask("researchFocus", `Choose from botanicals with ${area} research or traditional references. These references do not establish application directions for the current powders.`, questionsById.researchFocus.options.filter((option) => option.value === "all" || relevant.some((profile) => profile.slug === option.value)))?.[0];
    if (!focus) return pending();
    if (goal !== "both") return finish("research", `Your ${area} research guide`, "Explore the references for your selected ingredients below. Each entry explains the preparation studied and the limits of the evidence. The current powders have hair-use directions; these references are for learning about wider uses.");
    goal = ask("hairGoal")?.[0];
    if (!goal) return pending();
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
  if (check.includes("unsure")) return finish("review", "Get to know your botanicals", "Explore the ingredients and care benefits below. If you may have reacted before or your scalp is irritated, get professional advice before use.");

  if (goal === "colour") {
    const target = ask("colourTarget")?.[0];
    if (!target) return pending();
    if (target === "lighter" || target === "copper") return finish("no-match", "Explore care alongside colour", `This collection does not create ${target === "lighter" ? "lighter or blonde" : "red or copper"} tones. Discover conditioning botanicals below for a separate hair-care step.`);
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
    if (checks === "shade") return finish("review", "Explore care alongside colour", "Your strand result was different from your goal. Adjust the colour method before a full application; the products below are for general conditioning.");
    const candidate: QuizCandidate = { slug: "indigo-powder", role: "Colour", reason: target === "grey" ? "The Indigo stage of your confirmed henna-first method fits your aim of a darker result on greys; the final shade is not guaranteed." : "The Indigo stage of your confirmed henna-first method fits your aim of deeper brown-to-dark tones; the final shade is not guaranteed." };
    return finish(checks === "notyet" ? "conditional" : "candidate", checks === "notyet" ? "Check before starting" : "Your suggested starting ritual", checks === "notyet" ? "Complete the patch and strand checks for the whole henna-and-indigo method using its product directions before deciding on a full application." : "Indigo is one colour stage, alongside your separate suitable henna-first step. Follow the complete method's current directions. An acceptable check does not guarantee a shade or rule out a future reaction.", [candidate]);
  }

  let main: QuizCandidate | undefined;
  const wash = () => {
    const need = ask("washNeed")?.[0];
    if (!need) return;
    main = need === "oil"
      ? { slug: "reetha-powder", role: "Cleanse", reason: "You want a wash focused on removing oil and everyday buildup." }
      : { slug: "shikakai-powder", role: "Cleanse", reason: need === "manage" ? "You chose a traditional Shikakai wash; this pod powder has a hair-cleansing role." : need === "beginner" ? "You are trying your first botanical wash; Shikakai is a starting suggestion based on its cleansing role." : "You are still choosing your wash priority; Shikakai offers a traditional hair-cleansing starting point." };
  };
  if (goal === "cleanse") wash();
  if (goal === "softness") {
    const need = ask("conditionNeed")?.[0];
    if (!need) return pending();
    main = need === "dry" || need === "manage"
      ? { slug: "hibiscus-powder", role: "Condition", reason: need === "dry" ? "You chose a floral hair pack; Hibiscus is the flower powder in this collection." : "You chose to explore Hibiscus flower powder for a separate hair-pack step." }
      : { slug: "amla-powder", role: "Condition", reason: need === "shine" ? "You chose Amla fruit powder for your hair-pack step." : "You want a simple herbal pack routine; Amla offers a traditional fruit-powder starting point." };
  }
  if (goal === "scalp") {
    const need = ask("scalpNeed")?.[0];
    if (!need) return pending();
    if (need === "irritation" || need === "loss") return finish("review", "Get professional guidance first", `You mentioned ${need === "loss" ? "sudden or patchy hair loss" : "persistent itching, flaking or discomfort"}. Seek advice from a qualified healthcare professional. A cosmetic botanical ritual is not a treatment for these concerns.`);
    if (need === "oil") main = { slug: "reetha-powder", role: "Cleanse", reason: "Your scalp-care priority is cleansing away oil and everyday buildup." };
    if (need === "condition") main = { slug: "bhringraj-powder", role: "Condition", reason: "You asked for a general hair-and-scalp conditioning ritual." };
    if (need === "unsure") {
      const type = ask("scalpType")?.[0];
      if (!type) return pending();
      if (type === "unsure") return finish("guidance", "Choose your care step first", "A wash cleanses the scalp and hair; a mask adds conditioning. Get help choosing the kind of care step you want before selecting a powder.");
      if (type === "wash") wash();
      if (type === "mask") main = { slug: "bhringraj-powder", role: "Condition", reason: "You chose a conditioning mask for your hair and scalp." };
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
      if (id === "conditionAddon") candidates.unshift(addon === "dry"
        ? { slug: "hibiscus-powder", role: "Condition", reason: "You chose a Hibiscus flower pack as your separate second care step." }
        : addon === "shine"
          ? { slug: "amla-powder", role: "Condition", reason: "You chose an Amla fruit pack as your separate second care step." }
          : { slug: "bhringraj-powder", role: "Condition", reason: "You asked for a separate hair-and-scalp conditioning step." });
      else candidates.push(addon === "oil"
        ? { slug: "reetha-powder", role: "Cleanse", reason: "You asked for a separate wash focused on oil and everyday buildup." }
        : { slug: "shikakai-powder", role: "Cleanse", reason: "You chose a traditional Shikakai wash as your separate cleansing step." });
    }
  }
  if (history === "light" || history === "treated") {
    const strand = ask("strand", `${candidates.map((candidate) => names[candidate.slug]).join(" and ")}. ${questionsById.strand.helper}`)?.[0];
    if (!strand) return pending();
    if (strand === "changed" || strand === "unsure") return finish("review", "Review your strand result", strand === "changed" ? "The colour or feel changed unexpectedly on your hidden strand. Review these products and your hair history before deciding on a full application." : "You are unsure about the strand result. Review every suggested product and its current directions before deciding on a full application.");
    if (strand === "notyet") return finish("conditional", "Check before starting", `Check ${candidates.map((candidate) => names[candidate.slug]).join(" and ")} on a hidden strand using each product's current directions before deciding to begin. A strand check does not replace a skin patch test.`, candidates);
  }
  return finish("candidate", "Your suggested starting ritual", candidates.length === 2 ? "Use these as separate care steps: the conditioning mask first, then the wash. Follow each product's current pack instructions and testing guidance." : "A starting suggestion based on your care priority. Follow the current product directions and patch-test guidance before use.", candidates);
}

/** Selecting a new exclusive answer clears other selections, and vice versa. */
export function setQuizAnswer(answers: QuizAnswers, id: QuizQuestionId, values: string[]): QuizAnswers {
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
  const flow = getQuizFlow(answers);
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
  { slug: "amla-powder", role: "Condition", reason: "A fruit powder for traditional herbal hair packs." },
  { slug: "hibiscus-powder", role: "Condition", reason: "A flower powder for a separate herbal hair-pack step." },
  { slug: "bhringraj-powder", role: "Condition", reason: "A botanical for a general hair-and-scalp conditioning ritual." },
  { slug: "shikakai-powder", role: "Cleanse", reason: "A pod powder for traditional hair washing." },
  { slug: "reetha-powder", role: "Cleanse", reason: "A cleansing botanical for removing everyday oil and buildup." },
];

/** General product discovery for completed routes without a personal recommendation. */
export function resolveQuizBrowseItems(answers: QuizAnswers, products: readonly Product[], source: "shopify" | "preview"): QuizResult["items"] {
  const flow = getQuizFlow(answers);
  if (!flow.complete || !flow.outcome || resolveQuizResult(flow.outcome, products, source).items.length > 0) return [];
  if (flow.outcome.kind === "research") return [];
  const goal = answers.goal?.[0] === "both" ? answers.hairGoal?.[0] : answers.goal?.[0];
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
    // Colour dead ends show general conditioning, never an incompatible colour substitute.
    if (goal === "colour" && role !== "Condition") return [];
    if (changedStrandSlugs.includes(slug)) return [];
    if (excluded.some((ingredient) => slug === `${ingredient}-powder`)) return [];
    const product = products.find((entry) => isVerifiedCandidate(entry, slug, source)
      && !excluded.some((ingredient) => new RegExp(`\\b${ingredient}\\b`, "i").test(`${entry.name} ${entry.ingredient}`)));
    return product ? [{ product, role, reason }] : [];
  }).slice(0, 2);
}

/** Research is editorial information, never a product-use recommendation. */
export function getQuizResearch(answers: QuizAnswers) {
  const flow = getQuizFlow(answers);
  if (!flow.complete || !flow.questions.some((question) => question.id === "researchFocus")) return [];
  const area = answers.goal?.[0] === "both" ? answers.researchArea?.[0] : answers.goal?.[0];
  if (area !== "skin" && area !== "body") return [];
  const focus = answers.researchFocus?.[0];
  return profilesForTopic(area).filter((profile) => focus === "all" || profile.slug === focus)
    .flatMap((profile) => profile.research.filter((entry) => entry.topic === area).map((entry) => ({ ...entry, name: profile.name, slug: profile.slug })));
}

/** Resolve exact candidates against current records; never fill a gap with another role. */
export function resolveQuizResult(outcome: QuizOutcome, products: readonly Product[], source: "shopify" | "preview"): QuizResult {
  const { kind, title, description } = outcome;
  if (kind !== "candidate" && kind !== "conditional") return { kind, title, description, items: [], unavailable: false };
  const items = outcome.candidates.slice(0, 2).flatMap(({ slug, reason, role }) => {
    const product = products.find((entry) => isVerifiedCandidate(entry, slug, source));
    return product ? [{ product, reason, role }] : [];
  });
  const unavailable = items.length !== outcome.candidates.length;
  if (!items.length) return { kind: "no-match", title: "Discover more botanicals", description: "Your selected ritual is not available right now. Explore the collection below or edit your answers to plan a different care routine.", items, unavailable: true };
  const partialDescription = `Only part of your requested ritual is available with confirmed product information. The remaining suggested step is unavailable; no substitute has been added. ${kind === "conditional" ? "Before deciding to begin, check the available product on a hidden strand and follow its current patch-test guidance." : "Follow the available product's current pack instructions and testing guidance."}`;
  return { kind, title, description: unavailable ? partialDescription : description, items, unavailable };
}
