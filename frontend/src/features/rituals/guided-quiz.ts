import { type Product } from "@/domain/catalog/products";
import { goalOptions, matchesQuizGoal, type RitualRecommendation } from "./recommendation";

export const ritualQuestions = [
  { id: "goal", label: "Your goal", question: "What would you like from your ritual?", options: goalOptions.map(({ goal, copy }) => ({ value: goal, copy })) },
  { id: "feel", label: "Hair feel", question: "How does your hair feel today?", options: [
    { value: "Oily", copy: "Roots feel oily or weighed down" },
    { value: "Balanced", copy: "Neither very oily nor very dry" },
    { value: "Dry", copy: "Lengths feel dry or rough" },
    { value: "Textured", copy: "Curly or textured lengths" },
  ] },
  { id: "use", label: "How you use it", question: "How would you like to use your botanical?", options: [
    { value: "Wash-day cleanse", copy: "As part of a cleansing routine" },
    { value: "Pre-wash mask", copy: "A mask before washing" },
    { value: "Colour ritual", copy: "For a botanical colour routine" },
    { value: "Help me choose", copy: "Choose a format for my goal" },
  ] },
  { id: "experience", label: "Your experience", question: "Have you used botanical powders before?", options: [
    { value: "First time", copy: "I would like a simple starting point" },
    { value: "Occasionally", copy: "I have tried a few rituals" },
    { value: "Regularly", copy: "They are part of my routine" },
  ] },
  { id: "colour", label: "Colour history", question: "Which best describes your hair colour?", options: [
    { value: "Natural / untreated", copy: "No previous colour treatment" },
    { value: "Coloured / treated", copy: "Previously dyed or chemically treated" },
    { value: "Light / grey / bleached", copy: "Lightened, naturally light or grey hair" },
    { value: "Not sure", copy: "I would like to check the guidance" },
  ] },
] as const;

export type QuizAnswers = Partial<Record<(typeof ritualQuestions)[number]["id"], string>>;

export function rankRitualProducts(products: readonly Product[], answers: QuizAnswers): Array<RitualRecommendation & { reasons: string[] }> {
  if (!ritualQuestions.every((question) => question.options.some((option) => option.value === answers[question.id]))) return [];
  const goal = answers.goal!;
  const usage = answers.use === "Wash-day cleanse" ? "Cleanse" : answers.use === "Pre-wash mask" ? "Condition" : answers.use === "Colour ritual" ? "Colour" : null;
  return products.filter((product) => matchesQuizGoal(product, goal) && product.availableForSale !== false)
    .map((product) => {
      const suitability = (product.suitableFor ?? []).join(" ").toLowerCase();
      const directions = [...(product.howTo ?? []), product.ritualStep].join(" ").toLowerCase();
      const reasons = [`Matches your ${goal.toLowerCase()} goal.`];
      let score = 0;
      const feel = answers.feel === "Oily" ? /oily|oil-prone/ : answers.feel === "Dry" ? /dry|rough/ : answers.feel === "Textured" ? /textured|curl/ : /balanced|normal/;
      if (feel.test(suitability)) { score += 4; reasons.push(`Listed for ${answers.feel!.toLowerCase()} hair.`); }
      if (usage && (product.ritualStep === usage || (usage === "Condition" && /pre.wash|mask/.test(directions)))) { score += 3; reasons.push(`Fits your ${answers.use!.toLowerCase()} preference.`); }
      if (answers.experience === "First time") score += /beginner|first.time|simple/.test(suitability) ? 2 : /experienced/.test(suitability) ? -2 : 0;
      else if (answers.experience === "Regularly" && /experienced/.test(suitability)) score += 2;
      const colourSensitive = answers.colour !== "Natural / untreated";
      if (colourSensitive && /colou?r.treated|grey|bleached|light hair/.test(suitability)) score += 2;
      const requiresColourReview = (product.ritualStep === "Colour" || goal === "Botanical Colour") && colourSensitive;
      const guidance = [
        requiresColourReview ? "Review this product’s colour guidance and complete a strand test before deciding." : "",
        answers.experience === "First time" ? "Start with one botanical and follow its preparation and patch-test directions." : "",
      ].filter(Boolean).join(" ") || undefined;
      return { product, requiresColourReview, guidance, reasons, score };
    }).sort((a, b) => b.score - a.score || a.product.slug.localeCompare(b.product.slug));
}
