import { type Product } from "@/domain/catalog/products";
import { availableProduct, verifiedProduct, verifiedCandidate, supportsHairRole, skinDirections, skinSlugs, type SkinArea } from "./quiz-catalog";

export type QuizQuestionId = "careArea" | "hairGoal" | "check" | "comfortCheck" | "reactionIngredient" | "skinArea" | "skinNeed" | "skinChecks" | "bothPlan" | "sharedNeed" | "bothFallback" | "washNeed" | "packNeed" | "scalpNeed" | "hairStep" | "hairHistory" | "treatmentType" | "routine" | "packAddon" | "washAddon" | "strand" | "colourTarget" | "colourFallback" | "colourBase" | "colourHistory" | "henna" | "colourChecks";
export type QuizCare = "hair" | "skin" | "both" | "colour";
export type QuizAnswers = Partial<Record<QuizQuestionId, string[]>>;
export type QuizQuestion = {
  id: QuizQuestionId;
  label: string;
  question: string;
  helper: string;
  multiple: boolean;
  options: { value: string; label: string; description?: string; exclusive?: boolean }[];
};
export type QuizCandidate = { slug: string; reason: string; role: "Cleanse" | "Pack" | "Condition" | "Colour" | "Skin" | "Both"; skinArea?: SkinArea };
export type QuizCatalog = { products: readonly Product[]; source: "shopify" | "preview" };
export type QuizOutcome = {
  kind: "candidate" | "conditional" | "review" | "guidance" | "pause" | "no-match";
  title: string;
  description: string;
  candidates: QuizCandidate[];
  careArea?: QuizCare;
  plan?: "shared" | "separate" | "compare";
};
export type QuizFlow = { questions: QuizQuestion[]; complete: boolean; outcome: QuizOutcome | null };
export type QuizResult = Omit<QuizOutcome, "candidates"> & {
  items: (Omit<QuizCandidate, "slug"> & { product: Product; alternativeFor?: string })[];
  unavailable: boolean;
};

export const ritualQuestions: QuizQuestion[] = [
  {
    id: "careArea", label: "Your care", question: "What would you like to care for?", helper: "Choose the kind of ritual you want to explore.", multiple: false, options: [
      { value: "hair", label: "Hair care", description: "Herbal washes and traditional hair packs." },
      { value: "skin", label: "Skin care", description: "Explore confirmed face and body uses." },
      { value: "both", label: "Hair & skin", description: "One shared botanical or separate care steps." },
      { value: "colour", label: "Hair colour", description: "Explore a botanical colouring method." },
    ]
  },
  {
    id: "hairGoal", label: "Your hair ritual", question: "Which hair-care step would you like?", helper: "Choose a wash or a separate traditional hair pack.", multiple: false, options: [
      { value: "cleanse", label: "Herbal hair wash" },
      { value: "pack", label: "Traditional hair pack" },
      { value: "scalp", label: "Hair & scalp care" },
      { value: "unsure", label: "Help me choose a step" },
    ]
  },
  {
    id: "skinArea", label: "Your skin ritual", question: "Where would you like to use your skin-care product?", helper: "We will match only products with directions for that area.", multiple: false, options: [
      { value: "face", label: "Face" }, { value: "body", label: "Body" }, { value: "both", label: "Face and body" },
    ]
  },
  {
    id: "bothPlan", label: "Hair & skin, your way", question: "How would you like to plan your hair and skin care?", helper: "Each use needs its own product directions.", multiple: false, options: [
      { value: "shared", label: "One product confirmed for both" },
      { value: "separate", label: "Separate hair and skin steps" },
      { value: "unsure", label: "Keep it to one shared product" },
    ]
  },
  {
    id: "sharedNeed", label: "Your shared botanical", question: "Which dual-use botanical would you like?", helper: "Choose one product; prepare and use it separately for each area.", multiple: false, options: [
      { value: "fruit", label: "Amla fruit powder" }, { value: "flower", label: "Hibiscus flower powder" },
    ]
  },
  {
    id: "bothFallback", label: "Explore a hair ritual", question: "Would you like to explore a hair ritual from our current collection?", helper: "Our current powders have directions for hair care. Choose a hair ritual to explore their stated uses.", multiple: false, options: [
      { value: "hair", label: "Yes, help me choose a hair-care step" },
      { value: "pack", label: "Yes, explore a traditional hair pack" },
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
    id: "comfortCheck", label: "A little more about you", question: "Which description fits you best today?", helper: "This helps us choose the next step in your ritual guide.", multiple: false, options: [
      { value: "none", label: "My skin and scalp feel comfortable, with no known product reactions" },
      { value: "irritated", label: "I have current irritation or broken skin" },
      { value: "reaction", label: "I have had a product reaction" },
      { value: "unsure", label: "I would like personal guidance first" },
    ]
  },
  {
    id: "skinNeed", label: "Your skin ritual", question: "Which botanical would you like to explore?", helper: "Choose your preferred ingredient for the skin-use directions you selected.", multiple: false, options: [
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
      { value: "reetha", label: "Reetha soapnut powder" },
      { value: "shikakai", label: "Shikakai pod powder" },
      { value: "beginner", label: "Trying my first botanical wash" },
      { value: "unsure", label: "I am not sure" },
    ]
  },
  {
    id: "packNeed", label: "Your hair pack", question: "Which hair-pack ingredient interests you?", helper: "Choose your favourite botanical for a freshly prepared hair-pack ritual.", multiple: false, options: [
      { value: "flower", label: "Hibiscus flower powder" },
      { value: "fruit", label: "Amla fruit powder" },
      { value: "general", label: "A simple traditional hair pack" },
      { value: "unsure", label: "I am not sure" },
    ]
  },
  {
    id: "scalpNeed", label: "Your scalp", question: "What brings you to scalp care?", helper: "Choose the closest match.", multiple: false, options: [
      { value: "wash", label: "A herbal hair wash" },
      { value: "pack", label: "A traditional hair-and-scalp pack" },
      { value: "irritation", label: "Persistent itching, flaking or discomfort" },
      { value: "loss", label: "Sudden or patchy hair loss" },
      { value: "unsure", label: "I am not sure" },
    ]
  },
  {
    id: "hairStep", label: "Choose a step", question: "Which kind of step are you looking for?", helper: "Choose a hair-wash ingredient or a separate traditional hair pack.", multiple: false, options: [
      { value: "wash", label: "A wash for my scalp and hair" },
      { value: "pack", label: "A traditional hair pack" },
      { value: "unsure", label: "Choose a simple hair pack for me" },
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
      { value: "two", label: "A hair pack and a hair wash" },
      { value: "unsure", label: "I am not sure — keep it simple" },
    ]
  },
  {
    id: "packAddon", label: "Your second step", question: "Which hair-pack ingredient would you like?", helper: "This would be a separate pack step, used according to its directions.", multiple: false, options: [
      { value: "flower", label: "Hibiscus flower powder" },
      { value: "fruit", label: "Amla fruit powder" },
      { value: "scalp", label: "Bhringraj for a traditional hair-and-scalp pack" },
      { value: "skip", label: "Keep just the cleanser" },
    ]
  },
  {
    id: "washAddon", label: "Your second step", question: "Which hair-wash ingredient would you like?", helper: "This would be a separate wash step.", multiple: false, options: [
      { value: "reetha", label: "Reetha soapnut powder" },
      { value: "shikakai", label: "Shikakai pod powder" },
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
    id: "colourFallback", label: "Your next ritual", question: "Which available ritual would you like to explore?", helper: "Indigo is for deeper brown-to-dark tones. You can explore that colour direction or choose a separate hair-care ritual.", multiple: false, options: [
      { value: "deeper", label: "Explore deeper brown-to-dark tones" },
      { value: "hair", label: "Explore a separate hair-care ritual" },
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
    id: "henna", label: "Your colour method", question: "Does your colour plan include a suitable henna-first step?", helper: "This route covers a henna-first method. Henna is not included in this six-product range; other methods need their own verified directions.", multiple: false, options: [
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

/** Traverse only the answered, reachable branch. Skin eligibility always needs a catalogue. */
export function getQuizFlow(answers: QuizAnswers, catalog?: QuizCatalog): QuizFlow {
  const questions: QuizQuestion[] = [];
  let careArea: QuizCare | undefined;
  let plan: QuizOutcome["plan"];
  let area: SkinArea | undefined;
  let startingHairGoal: string | undefined;
  const pending = (): QuizFlow => ({ questions, complete: false, outcome: null });
  const finish = (kind: QuizOutcome["kind"], title: string, description: string, candidates: QuizCandidate[] = []): QuizFlow =>
    ({ questions, complete: true, outcome: { kind, title, description, candidates, careArea, plan } });
  const ask = (id: QuizQuestionId, helper?: string, allowed?: string[]) => {
    const original = questionsById[id];
    const question = { ...original, helper: helper ?? original.helper,
      options: allowed ? original.options.filter((option) => allowed.includes(option.value)) : original.options };
    questions.push(question);
    return validAnswer(question, answers[id]) ? answers[id] : undefined;
  };
  careArea = ask("careArea")?.[0] as QuizCare | undefined;
  if (!careArea) return pending();
  let check = ask("check");
  if (!check) return pending();
  if (check.includes("unsure")) {
    check = ask("comfortCheck");
    if (!check) return pending();
  }
  if (check.includes("irritated")) return finish("pause", "Care begins with comfort", "Give irritated or broken skin or scalp time to recover. Seek professional guidance before applying a new botanical.");
  if (check.includes("reaction")) {
    const ingredients = ask("reactionIngredient");
    if (!ingredients) return pending();
    const known = ingredients.map((value) => names[value + "-powder"]).filter(Boolean);
    return finish("review", "Find your next step with personal guidance", (known.length ? "Share your reaction to " + known.join(" and ") + " with a qualified healthcare professional. " : "") + "Review ingredient compatibility together before trying a new botanical.");
  }
  if (check.includes("unsure")) return finish("review", "Personal guidance for your next ritual", "Review your skin or scalp comfort and previous product experiences with a qualified professional, then return to explore your preferred care step.");

  const skinPool = (shared = false, forArea?: SkinArea) => catalog?.products.filter((product) =>
    skinSlugs.some((slug) => verifiedProduct(product, slug, catalog.source))
    && (forArea ? skinDirections(product, forArea).length > 0 : skinDirections(product, "face").length > 0 || skinDirections(product, "body").length > 0)
    && (!shared || supportsHairRole(product, "Pack"))) ?? [];
  const availableSkin = (shared = false, forArea?: SkinArea) => skinPool(shared, forArea).filter((product) => availableProduct(product, catalog!.source));
  const skinGuidance = (shared = false, forArea?: SkinArea) => skinPool(shared, forArea).length
    ? finish("guidance", "Your next skin ritual", "Explore the confirmed skin-use directions and check back for restocked products, or edit your care choice to discover another ritual.")
    : finish("guidance", "Explore each botanical's intended uses", "Our current collection focuses on hair packs, herbal washes and botanical colour. Choose one of these care areas to discover a product with directions for that use.");
  const hairFallback = (shared = false, forArea?: SkinArea): QuizFlow | "hair" => {
    const hasHair = catalog?.products.some((product) => collectionCare.some((candidate) => verifiedCandidate(product, candidate.slug, catalog.source) && supportsHairRole(product, candidate.role as "Pack" | "Cleanse")));
    if (!hasHair) return skinGuidance(shared, forArea);
    const choice = ask("bothFallback", skinPool(shared, forArea).length
      ? "While your skin-care choice awaits restocking, you can choose a separate hair ritual from the available collection."
      : "Our current powders have confirmed directions for hair care. Choose a hair ritual below, or use Back to revisit your care choice. Hair-use directions apply to hair only.")?.[0];
    if (!choice) return pending();
    if (choice === "pack") startingHairGoal = "pack";
    return "hair";
  };
  if (careArea === "skin" || careArea === "both") {
    if (!availableSkin().length) {
      const fallback = hairFallback();
      if (fallback !== "hair") return fallback;
      careArea = "hair";
    }
    if (careArea === "both") {
      const hasHair = catalog!.products.some((product) => collectionCare.some((candidate) =>
        verifiedCandidate(product, candidate.slug, catalog!.source) && supportsHairRole(product, candidate.role as "Pack" | "Cleanse")));
      const options = [...(availableSkin(true).length ? ["shared", "unsure"] : []), ...(hasHair ? ["separate"] : [])];
      if (!options.length) return finish("guidance", "No complete hair and skin plan is available", "No matching hair product is available alongside the skin options. Edit your care choice to explore a single care area.");
      const selected = ask("bothPlan", undefined, options)?.[0];
      if (!selected) return pending();
      plan = selected === "separate" ? "separate" : "shared";
    }
    if (careArea !== "hair") {
      area = ask("skinArea")?.[0] as SkinArea | undefined;
      if (!area) return pending();
      if (!availableSkin(plan === "shared", area).length) {
        const fallback = hairFallback(plan === "shared", area);
        if (fallback !== "hair") return fallback;
        careArea = "hair";
        plan = undefined;
        area = undefined;
      }
    }
  }

  const skinChoice = (shared = false): QuizCandidate[] | null => {
    const pool = availableSkin(shared, area);
    const options = [
      ...(pool.some((p) => verifiedProduct(p, "amla-powder", catalog!.source)) ? ["fruit"] : []),
      ...(pool.some((p) => verifiedProduct(p, "hibiscus-powder", catalog!.source)) ? ["flower"] : []),
      ...(careArea === "skin" && pool.length > 1 ? ["compare"] : []),
    ];
    const preference = ask(shared ? "sharedNeed" : "skinNeed", undefined, options)?.[0];
    if (!preference) return null;
    if (preference === "compare") plan = "compare";
    return (preference === "fruit" ? ["amla-powder"] : preference === "flower" ? ["hibiscus-powder"] : ["hibiscus-powder", "amla-powder"])
      .map<QuizCandidate>((slug) => ({ slug, role: shared ? "Both" : "Skin", skinArea: area,
        reason: names[slug] + (shared ? " matches your preference for one botanical with separate hair and skin directions." : " matches your ingredient preference and has directions for your selected skin area.") }));
  };
  const checkSkin = (candidates: QuizCandidate[]): QuizFlow | "passed" | "notyet" => {
    const checks = ask("skinChecks", candidates.map((c) => names[c.slug]).join(" and ") + ". " + questionsById.skinChecks.helper)?.[0];
    if (!checks) return pending();
    if (checks === "reaction") return finish("pause", "Pause your skin ritual", "Stop using the product that caused irritation or a reaction. Seek professional advice before trying another botanical.");
    return checks as "passed" | "notyet";
  };
  if (careArea === "skin") {
    const candidates = skinChoice();
    if (!candidates) return pending();
    const checks = checkSkin(candidates);
    if (typeof checks !== "string") return checks;
    return finish(checks === "notyet" ? "conditional" : "candidate", checks === "notyet" ? "Check before starting" : "Your suggested starting ritual",
      (plan === "compare" ? "These are alternatives: choose one powder to start, rather than layering or mixing them. " : "") +
      (checks === "notyet" ? "Complete the selected product's skin-use patch-test directions before starting. " : "") +
      "Follow the current directions for your selected skin area and stop if irritation occurs.", candidates);
  }

  let target: string | undefined;
  if (careArea === "colour") {
    target = ask("colourTarget")?.[0];
    if (!target) return pending();
    if (["lighter", "copper", "unsure"].includes(target)) {
      const next = ask("colourFallback")?.[0];
      if (!next) return pending();
      if (next === "hair") careArea = "hair";
      else target = "deeper";
    }
  }
  if (careArea === "colour") {
    const candidate: QuizCandidate = { slug: "indigo-powder", role: "Colour", reason: target === "grey" ? "Explore Indigo as the colour stage for your goal of a darker result on greys, with your complete colouring method." : "Explore Indigo as the colour stage for your chosen deeper brown-to-dark direction, with your complete colouring method." };
    const base = ask("colourBase")?.[0];
    if (!base) return pending();
    const history = ask("colourHistory");
    if (!history) return pending();
    const compatibilityReview = ["light", "unsure"].includes(base) || history.some((value) => ["dye", "bleach", "chemical", "unsure"].includes(value));
    const henna = ask("henna")?.[0];
    if (!henna) return pending();
    if (henna !== "ready") return finish("conditional", "Explore your colour ritual", "Start by reading Indigo's colour directions and planning the complete method with a suitable, separately sourced henna step. Confirm compatibility with your starting colour and treatment history before use, then complete the method's patch and strand checks.", [candidate]);
    const checks = ask("colourChecks")?.[0];
    if (!checks) return pending();
    if (checks === "reaction") return finish("pause", "Pause your colour ritual", "Stop using the colour products that caused a reaction and seek professional advice before trying another botanical.");
    if (checks === "shade") return finish("review", "Review your colour result", "Your strand result was different from your goal. Review the colour method before a full application. No replacement has been suggested.");
    if (compatibilityReview) return finish("conditional", "Explore your colour ritual", "Read Indigo's directions with a qualified colour professional to confirm compatibility with your starting colour and treatments before use. Complete the patch and strand checks for the agreed method.", [candidate]);
    return finish(checks === "notyet" ? "conditional" : "candidate", checks === "notyet" ? "Check before starting" : "Your suggested starting ritual", checks === "notyet" ? "Complete the patch and strand checks for the whole henna-and-indigo method using its product directions before deciding on a full application." : "Indigo is one colour stage, alongside your separate suitable henna-first step. Follow the complete method's current directions. An acceptable check does not guarantee a shade or rule out a future reaction.", [candidate]);
  }



  let main: QuizCandidate | undefined;
  const generalChoice = (role: "Pack" | "Cleanse", preferred: string[], beginner = false): QuizCandidate => {
    const eligible = preferred.filter((slug) => !catalog || catalog.products.some((product) =>
      verifiedCandidate(product, slug, catalog.source) && supportsHairRole(product, role)));
    const slug = eligible[0] ?? preferred[0];
    return { slug, role, reason: `${names[slug]} matches your request for ${role === "Cleanse" ? "a herbal hair wash" : "a traditional hair pack"} without a specific ingredient preference.${catalog && eligible.length ? " It is available with confirmed directions for this step." : ""}${beginner ? " For your first botanical wash, follow this ingredient's preparation directions." : ""}` };
  };
  const pack = (choice: string): QuizCandidate => choice === "flower"
    ? { slug: "hibiscus-powder", role: "Pack", reason: "You chose Hibiscus flower powder for a separate traditional hair-pack step." }
    : choice === "scalp"
      ? { slug: "bhringraj-powder", role: "Pack", reason: "You chose Bhringraj for a traditional hair-and-scalp pack." }
      : choice === "fruit" ? { slug: "amla-powder", role: "Pack", reason: "You chose Amla fruit powder for a traditional hair pack." }
        : generalChoice("Pack", ["amla-powder", "hibiscus-powder", "bhringraj-powder"]);
  const cleanser = (choice: string): QuizCandidate => choice === "reetha"
    ? { slug: "reetha-powder", role: "Cleanse", reason: "You chose Reetha soapnut powder for a separate herbal hair-wash step." }
    : choice === "shikakai" ? { slug: "shikakai-powder", role: "Cleanse", reason: "You chose Shikakai pod powder for a traditional hair-washing routine." }
      : generalChoice("Cleanse", ["shikakai-powder", "reetha-powder"], choice === "beginner");
  if (plan === "shared") {
    const selected = skinChoice(true);
    if (!selected) return pending();
    main = selected[0];
  } else {
    let goal = startingHairGoal ?? ask("hairGoal")?.[0];
    if (!goal) return pending();
    if (goal === "scalp") {
      const need = ask("scalpNeed")?.[0];
      if (!need) return pending();
      if (need === "irritation" || need === "loss") return finish("review", "Get professional guidance first", "You mentioned persistent scalp symptoms or sudden or patchy hair loss. Seek advice from a qualified healthcare professional. A botanical care ritual is not a treatment for these concerns.");
      if (need === "pack") main = pack("scalp");
      else goal = need === "wash" ? "cleanse" : "unsure";
    }
    if (goal === "unsure") {
      const step = ask("hairStep")?.[0];
      if (!step) return pending();
      goal = step === "wash" ? "cleanse" : "pack";
    }
    if (!main) {
      const need = ask(goal === "cleanse" ? "washNeed" : "packNeed")?.[0];
      if (!need) return pending();
      main = goal === "cleanse" ? cleanser(need) : pack(need);
    }
  }
  const history = ask("hairHistory")?.[0];
  if (!history) return pending();
  let historyReview = history === "unsure";
  if (history === "treated") {
    const treatments = ask("treatmentType");
    if (!treatments) return pending();
    historyReview = treatments.includes("unsure");
  }
  const candidates: QuizCandidate[] = [main];
  if (careArea === "hair") {
    const routine = ask("routine")?.[0];
    if (!routine) return pending();
    if (routine === "two") {
      const id = main.role === "Cleanse" ? "packAddon" : "washAddon";
      const addon = ask(id)?.[0];
      if (!addon) return pending();
      if (addon !== "skip") {
        if (id === "packAddon") candidates.unshift(pack(addon));
        else candidates.push(cleanser(addon));
      }
    }
  }
  let skinCheck: "passed" | "notyet" | undefined;
  if (careArea === "both") {
    if (plan === "separate") {
      const selected = skinChoice();
      if (!selected) return pending();
      if (selected[0].slug === main.slug) {
        main.role = "Both";
        main.skinArea = area;
        main.reason += " You also selected this same product for its separately directed skin use.";
      } else candidates.push(selected[0]);
    }
    const checks = checkSkin(candidates.filter((c) => c.role === "Skin" || c.role === "Both"));
    if (typeof checks !== "string") return checks;
    skinCheck = checks;
  }
  let strandCheck: string | undefined;
  if (history !== "natural") {
    const hairCandidates = candidates.filter((c) => c.role !== "Skin");
    strandCheck = ask("strand", hairCandidates.map((c) => names[c.slug]).join(" and ") + ". " + questionsById.strand.helper)?.[0];
    if (!strandCheck) return pending();
    if (strandCheck === "changed") return finish("review", "Plan your next step with care", "Review the unexpected strand result and your hair history with a qualified professional before a full application.");
  }
  const conditional = historyReview || skinCheck === "notyet" || strandCheck === "notyet" || strandCheck === "unsure";
  const instructions = careArea === "both"
    ? "Use separate preparations and follow the product directions for each hair and skin use. Hair-care instructions do not apply to skin."
    : candidates.length > 1 ? "These are separate care steps: a traditional hair pack and a herbal hair wash. Follow each product's current directions."
      : "Follow the current product directions and patch-test guidance before use.";
  const outstanding = [
    ...(historyReview ? ["Confirm your hair treatment history and the selected product's compatibility before use."] : []),
    ...(skinCheck === "notyet" ? ["Complete the skin-use patch-test directions for " + candidates.filter((c) => c.role === "Skin" || c.role === "Both").map((c) => names[c.slug]).join(" and ") + "."] : []),
    ...(["notyet", "unsure"].includes(strandCheck ?? "") ? ["Check " + candidates.filter((c) => c.role !== "Skin").map((c) => names[c.slug]).join(" and ") + " on a hidden strand before starting."] : []),
  ].join(" ");
  return finish(conditional ? "conditional" : "candidate",
    conditional ? "Your ritual, with a little preparation" : careArea === "both" ? (candidates.length === 1 ? "One botanical, two separately directed uses" : "Your hair and skin starting plan") : "Your suggested starting ritual",
    (conditional ? outstanding + " " : "") + instructions, candidates);
}

/** Selecting a new exclusive answer clears other selections, and vice versa. */
export function setQuizAnswer(answers: QuizAnswers, id: QuizQuestionId, values: string[], catalog?: QuizCatalog): QuizAnswers {
  const flow = getQuizFlow(answers, catalog);
  const question = flow.questions.find((entry) => entry.id === id);
  if (!question) return answers;
  const previous = answers[id] ?? [];
  const allowed = [...new Set(values)].filter((value) => question.options.some((option) => option.value === value));
  const added = allowed.filter((value) => !previous.includes(value));
  const latest = added.at(-1) ?? allowed.at(-1);
  let normalized: string[];
  if (!question.multiple) normalized = latest ? [latest] : [];
  else if (question.options.find((option) => option.value === latest)?.exclusive) normalized = latest ? [latest] : [];
  else normalized = question.options.filter((option) => !option.exclusive && allowed.includes(option.value)).map((option) => option.value);
  if (normalized.length === previous.length && normalized.every((value) => previous.includes(value))) return answers;
  const index = flow.questions.findIndex((entry) => entry.id === id);
  if (index < 0) return answers;
  const next: QuizAnswers = {};
  for (const entry of flow.questions.slice(0, index)) if (answers[entry.id]) next[entry.id] = [...answers[entry.id]!];
  if (normalized.length) next[id] = normalized;
  return next;
}

const collectionCare: QuizCandidate[] = [
  { slug: "amla-powder", role: "Pack", reason: "Amla fruit powder is an ingredient for a traditional herbal hair pack." },
  { slug: "hibiscus-powder", role: "Pack", reason: "Hibiscus flower powder is an ingredient for a botanical hair-pack routine." },
  { slug: "bhringraj-powder", role: "Pack", reason: "Bhringraj is an ingredient for traditional hair-and-scalp packs, with an Ayurvedic hair-care heritage." },
  { slug: "shikakai-powder", role: "Cleanse", reason: "Shikakai pod powder is an ingredient for traditional herbal hair washing." },
  { slug: "reetha-powder", role: "Cleanse", reason: "Reetha soapnut powder is an ingredient for a botanical hair-wash routine." },
];

/** Only reachable, validated preferences belong in the customer's result summary. */
export function getQuizAnswerSummary(answers: QuizAnswers, flow: QuizFlow) {
  const preferences: QuizQuestionId[] = ["careArea", "bothFallback", "bothPlan", "skinArea", "skinNeed", "sharedNeed", "hairGoal", "hairStep", "scalpNeed", "washNeed", "packNeed", "routine", "packAddon", "washAddon", "colourTarget", "colourFallback"];
  return flow.questions.filter((question) => preferences.includes(question.id) && validAnswer(question, answers[question.id]))
    .map((question) => ({ id: question.id, label: question.label, value: question.options.filter((option) => answers[question.id]!.includes(option.value)).map((option) => option.label).join(", ") }));
}

/** Reset a running quiz when eligibility changes: checks cannot transfer to a new product. */
export function quizCatalogKey({ products, source }: QuizCatalog): string {
  return JSON.stringify([source, products.map((product) => [product.id, product.slug, product.shopifyHandle, product.name,
    product.ingredient, product.careAreas, product.ritualStep, product.howTo, product.safety, product.description,
    availableProduct(product, source)]).sort((a, b) => String(a[0] ?? a[1]).localeCompare(String(b[0] ?? b[1])))]);
}

/** Resolve exact candidates against current records; never fill a gap with another role. */
export function resolveQuizResult(outcome: QuizOutcome, products: readonly Product[], source: "shopify" | "preview"): QuizResult {
  const { kind, title, description, careArea, plan } = outcome;
  const context = { careArea, plan };
  if (kind !== "candidate" && kind !== "conditional") return { ...context, kind, title, description, items: [], unavailable: false };
  const items = outcome.candidates.slice(0, 2).flatMap(({ slug, reason, role, skinArea }) => {
    const product = products.find((entry) => verifiedCandidate(entry, slug, source)
      && (role === "Skin" || role === "Both"
        ? Boolean(skinArea && skinDirections(entry, skinArea).length) && (role !== "Both" || supportsHairRole(entry, "Pack"))
        : supportsHairRole(entry, role)));
    return product ? [{ product, reason, role, skinArea }] : [];
  });
  const unavailable = items.length !== outcome.candidates.length;
  const skinOnly = outcome.candidates.every((candidate) => candidate.role === "Skin");
  if (!items.length) return { ...context, kind: "no-match", title: skinOnly ? "No confirmed skin ritual is available" : "Your matching ritual is unavailable", description: skinOnly ? "No matching product is available with confirmed skin-use information. The current powders are for their stated hair-care or hair-colour roles; do not adapt hair-pack directions for your face or body." : "No available product with confirmed directions matches your selected ritual right now. Your ingredient and care preferences have been kept; no unrelated substitute has been added. Edit your answers to choose a different preference or check back later.", items, unavailable: true };
  const partialDescription = skinOnly
    ? "Only one of your skin-care options is available with confirmed product information. No substitute has been added. Follow the available product's current skin-use directions and patch-test guidance before starting."
    : "Only part of your requested ritual is available with confirmed product information. The remaining suggested step is unavailable; no substitute has been added. Follow the available product's directions and complete the relevant checks for its stated use before starting.";
  return { ...context, kind, title: unavailable ? "Part of your ritual is unavailable" : title, description: unavailable ? partialDescription : description, items, unavailable };
}

/** Keep exact matches first, then offer clearly named alternatives for missing steps. */
export function resolveQuizRecommendations(outcome: QuizOutcome, products: readonly Product[], source: "shopify" | "preview"): QuizResult {
  const exact = resolveQuizResult(outcome, products, source);
  if (!exact.unavailable || !["candidate", "conditional"].includes(outcome.kind)) return exact;
  // Reserve all original choices so an alternative cannot duplicate another requested step.
  const reserved = new Set(outcome.candidates.map((candidate) => candidate.slug));
  const alternatives: QuizResult["items"] = [];
  const items = outcome.candidates.slice(0, 2).flatMap((candidate) => {
    const match = resolveQuizResult({ ...outcome, candidates: [candidate] }, products, source).items[0];
    if (match) return [match];
    if (candidate.role === "Colour") return [];
    const pool = candidate.role === "Skin" || candidate.role === "Both"
      ? skinSlugs : collectionCare.filter((entry) => candidate.role === "Cleanse" ? entry.role === "Cleanse" : entry.role === "Pack").map((entry) => entry.slug);
    for (const slug of pool) {
      if (reserved.has(slug)) continue;
      const replacement = resolveQuizResult({ ...outcome, candidates: [{ ...candidate, slug }] }, products, source).items[0];
      if (!replacement) continue;
      reserved.add(slug);
      const step = candidate.role === "Cleanse" ? "herbal wash" : candidate.role === "Both" ? "separate hair and skin uses" : candidate.role === "Skin" ? "selected skin area" : "traditional hair-pack step";
      const item = { ...replacement, alternativeFor: names[candidate.slug],
        reason: `${replacement.product.name} is an available alternative for your ${step}, in place of your original ${names[candidate.slug]} choice. It uses a different ingredient; explore its own preparation directions.` };
      alternatives.push(item);
      return [item];
    }
    return [];
  });
  if (!alternatives.length) return exact;
  return { ...exact, kind: "conditional", title: "Your available botanical picks",
    description: `Explore these available products for the care steps you chose. Alternatives to your original choices are labelled on each card.${items.length < outcome.candidates.length ? " This selection covers part of your requested routine; check back for the remaining step." : ""} Follow each alternative's own directions and complete its patch and strand checks where required. Checks for a different product do not carry over.`, items };
}
