import { type Product } from "@/domain/catalog/products";
import { availableProduct, verifiedProduct, verifiedCandidate, supportsHairRole, skinDirections, skinSlugs, type SkinArea } from "./quiz-catalog";

export type QuizQuestionId = "careArea" | "hairGoal" | "check" | "reactionIngredient" | "skinArea" | "skinNeed" | "skinChecks" | "bothPlan" | "sharedNeed" | "bothFallback" | "washNeed" | "packNeed" | "scalpNeed" | "hairStep" | "hairHistory" | "treatmentType" | "routine" | "packAddon" | "washAddon" | "strand" | "colourTarget" | "colourBase" | "colourHistory" | "henna" | "colourChecks";
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
  items: (Omit<QuizCandidate, "slug"> & { product: Product })[];
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
    id: "bothFallback", label: "Available care", question: "How would you like to continue?", helper: "No matching shared ritual is available. You can still explore a hair routine.", multiple: false, options: [
      { value: "hair", label: "Continue with hair care only" },
      { value: "guidance", label: "Show me the current product-use guidance" },
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
      { value: "reetha", label: "Reetha soapnut powder" },
      { value: "shikakai", label: "Shikakai pod powder" },
      { value: "beginner", label: "Trying my first botanical wash" },
      { value: "unsure", label: "I am not sure" },
    ]
  },
  {
    id: "packNeed", label: "Your hair pack", question: "Which hair-pack ingredient interests you?", helper: "Choose by ingredient preference. Choose a botanical ingredient without a promise of a particular result.", multiple: false, options: [
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
  const check = ask("check");
  if (!check) return pending();
  if (check.includes("irritated")) return finish("pause", "Pause before starting", "Avoid applying botanicals to irritated or broken skin or scalp. Seek professional advice before choosing a ritual.");
  if (check.includes("reaction")) {
    const ingredients = ask("reactionIngredient");
    if (!ingredients) return pending();
    const known = ingredients.map((value) => names[value + "-powder"]).filter(Boolean);
    return finish("review", "Review your ingredients first", (known.length ? "Avoid " + known.join(" and ") + ", which you linked to a reaction. " : "") + "Get professional advice before trying another botanical. This guide will not suggest an allergy-safe substitute.");
  }
  if (check.includes("unsure")) return finish("review", "Check before choosing", "Clarify any previous reactions or current skin or scalp irritation before choosing a botanical.");

  const skinPool = (shared = false, forArea?: SkinArea) => catalog?.products.filter((product) =>
    skinSlugs.some((slug) => verifiedProduct(product, slug, catalog.source))
    && (forArea ? skinDirections(product, forArea).length > 0 : skinDirections(product, "face").length > 0 || skinDirections(product, "body").length > 0)
    && (!shared || supportsHairRole(product, "Pack"))) ?? [];
  const availableSkin = (shared = false, forArea?: SkinArea) => skinPool(shared, forArea).filter((product) => availableProduct(product, catalog!.source));
  const skinGuidance = (shared = false, forArea?: SkinArea) => skinPool(shared, forArea).length
    ? finish("guidance", "No skin ritual is available right now", "Matching skin-use directions are confirmed, but no matching product is currently available. Check back or edit your care choice.")
    : finish("guidance", "Skin use is not yet confirmed", "No matching powder has confirmed directions for your selected skin use. Do not use hair-pack directions for your face or body. Explore the stated product uses or edit your care choice.");
  const hairFallback = (shared = false, forArea?: SkinArea): QuizFlow | "hair" => {
    const choice = ask("bothFallback", skinPool(shared, forArea).length
      ? "The matching skin or shared product is unavailable right now. You can still explore hair care."
      : "No matching product has confirmed skin-use directions. You can still explore hair care.")?.[0];
    if (!choice) return pending();
    if (choice === "guidance") return skinGuidance(shared, forArea);
    return "hair";
  };
  if (careArea === "skin" || careArea === "both") {
    if (!availableSkin().length) {
      if (careArea === "skin") return skinGuidance();
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
        if (plan !== "shared") return skinGuidance(false, area);
        const fallback = hairFallback(true, area);
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

  if (careArea === "colour") {
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
    if (henna !== "ready") return finish("guidance", "Plan the complete colour method", "This quiz's Indigo route needs a suitable henna-first step and its directions; other colour methods need separate verified guidance. Indigo alone cannot promise black results on grey or blonde hair. Henna is not included in this collection.");
    const checks = ask("colourChecks")?.[0];
    if (!checks) return pending();
    if (checks === "reaction") return finish("pause", "Explore care beyond colour", "Stop using the colour products that caused a reaction and seek professional advice before trying another botanical. You can browse general care products below.");
    if (checks === "shade") return finish("review", "Explore care alongside colour", "Your strand result was different from your goal. Review the colour method before a full application; the products below are separate hair-pack ingredients.");
    const candidate: QuizCandidate = { slug: "indigo-powder", role: "Colour", reason: target === "grey" ? "The Indigo stage of your confirmed henna-first method fits your aim of a darker result on greys; the final shade is not guaranteed." : "The Indigo stage of your confirmed henna-first method fits your aim of deeper brown-to-dark tones; the final shade is not guaranteed." };
    return finish(checks === "notyet" ? "conditional" : "candidate", checks === "notyet" ? "Check before starting" : "Your suggested starting ritual", checks === "notyet" ? "Complete the patch and strand checks for the whole henna-and-indigo method using its product directions before deciding on a full application." : "Indigo is one colour stage, alongside your separate suitable henna-first step. Follow the complete method's current directions. An acceptable check does not guarantee a shade or rule out a future reaction.", [candidate]);
  }



  let main: QuizCandidate | undefined;
  const pack = (choice: string): QuizCandidate => choice === "flower"
    ? { slug: "hibiscus-powder", role: "Pack", reason: "You chose Hibiscus flower powder for a separate traditional hair-pack step." }
    : choice === "scalp"
      ? { slug: "bhringraj-powder", role: "Pack", reason: "You chose Bhringraj for a traditional hair-and-scalp pack." }
      : { slug: "amla-powder", role: "Pack", reason: choice === "fruit" ? "You chose Amla fruit powder for a traditional hair pack." : "Amla is an option to explore for a simple traditional hair-pack routine." };
  const cleanser = (choice: string): QuizCandidate => choice === "reetha"
    ? { slug: "reetha-powder", role: "Cleanse", reason: "You chose Reetha soapnut powder for a separate herbal hair-wash step." }
    : { slug: "shikakai-powder", role: "Cleanse", reason: choice === "shikakai" ? "You chose Shikakai pod powder for a traditional hair-washing routine." : "Shikakai is an ingredient to explore for a simple traditional herbal wash." };
  if (plan === "shared") {
    const selected = skinChoice(true);
    if (!selected) return pending();
    main = selected[0];
  } else {
    let goal = ask("hairGoal")?.[0];
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
      if (step === "unsure") return finish("guidance", "Choose your care step first", "A herbal wash cleanses; a traditional hair pack is a separate care step. Explore the product directions before choosing a powder.");
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
  if (history === "unsure") return finish("review", "Check your hair history first", "Clarify your current colour and treatment history before choosing a botanical.");
  if (history === "treated") {
    const treatments = ask("treatmentType");
    if (!treatments) return pending();
    if (treatments.includes("unsure")) return finish("review", "Review your treatment history", "Check which treatments are on your hair and review product compatibility before choosing a botanical.");
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
  if (history === "light" || history === "treated") {
    const hairCandidates = candidates.filter((c) => c.role !== "Skin");
    strandCheck = ask("strand", hairCandidates.map((c) => names[c.slug]).join(" and ") + ". " + questionsById.strand.helper)?.[0];
    if (!strandCheck) return pending();
    if (strandCheck === "changed" || strandCheck === "unsure") return finish("review", "Review your strand result", "The strand result was unexpected or uncertain. Review the selected products and your hair history before a full application.");
  }
  const conditional = skinCheck === "notyet" || strandCheck === "notyet";
  const instructions = careArea === "both"
    ? "Use separate preparations and follow the product directions for each hair and skin use. Hair-care instructions do not apply to skin."
    : candidates.length > 1 ? "These are separate care steps: a traditional hair pack and a herbal hair wash. Follow each product's current directions."
      : "Follow the current product directions and patch-test guidance before use.";
  const outstanding = [
    ...(skinCheck === "notyet" ? ["Complete the skin-use patch-test directions for " + candidates.filter((c) => c.role === "Skin" || c.role === "Both").map((c) => names[c.slug]).join(" and ") + "."] : []),
    ...(strandCheck === "notyet" ? ["Check " + candidates.filter((c) => c.role !== "Skin").map((c) => names[c.slug]).join(" and ") + " on a hidden strand before starting."] : []),
  ].join(" ");
  return finish(conditional ? "conditional" : "candidate",
    conditional ? "Check before starting" : careArea === "both" ? (candidates.length === 1 ? "One botanical, two separately directed uses" : "Your hair and skin starting plan") : "Your suggested starting ritual",
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

/** General product discovery for completed routes without a personal recommendation. */
export function resolveQuizBrowseItems(answers: QuizAnswers, products: readonly Product[], source: "shopify" | "preview"): QuizResult["items"] {
  const flow = getQuizFlow(answers, { products, source });
  if (!flow.complete || !flow.outcome || resolveQuizResult(flow.outcome, products, source).items.length > 0) return [];
  const care = flow.outcome.careArea ?? answers.careArea?.[0];
  const goal = care === "hair" ? answers.hairGoal?.[0] : care;
  // A stopped skin route must not turn a reaction or an unconfirmed product
  // into a recommendation for a different powder.
  if (care === "skin" || care === "both") return [];
  const excluded = flow.questions.some((question) => question.id === "reactionIngredient")
    ? (answers.reactionIngredient ?? []).filter((ingredient) => Boolean(names[`${ingredient}-powder`]))
    : [];
  const changedStrandSlugs = flow.questions.some((question) => question.id === "strand") && answers.strand?.[0] === "changed"
    ? getQuizFlow({ ...answers, strand: ["passed"] }, { products, source }).outcome?.candidates.map((candidate) => candidate.slug) ?? []
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
    const product = products.find((entry) => verifiedCandidate(entry, slug, source)
      && supportsHairRole(entry, role as "Pack" | "Cleanse")
      && !excluded.some((ingredient) => new RegExp(`\\b${ingredient}\\b`, "i").test(`${entry.name} ${entry.ingredient}`)));
    return product ? [{ product, role, reason }] : [];
  }).slice(0, 2);
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
  if (!items.length) return { ...context, kind: "no-match", title: skinOnly ? "No confirmed skin ritual is available" : "Discover more botanicals", description: skinOnly ? "No matching product is available with confirmed skin-use information. The current powders are for their stated hair-care or hair-colour roles; do not adapt hair-pack directions for your face or body." : "Your selected ritual is not available right now. Explore the collection below or edit your answers to plan a different care routine.", items, unavailable: true };
  const partialDescription = skinOnly
    ? "Only one of your skin-care options is available with confirmed product information. No substitute has been added. Follow the available product's current skin-use directions and patch-test guidance before starting."
    : "Only part of your requested ritual is available with confirmed product information. The remaining suggested step is unavailable; no substitute has been added. Follow the available product's directions and complete the relevant checks for its stated use before starting.";
  return { ...context, kind, title: unavailable ? "Part of your ritual is unavailable" : title, description: unavailable ? partialDescription : description, items, unavailable };
}
