import { matchesRitualGoal, type Product, type RitualGoal } from "@/domain/catalog/products";

export const goalOptions: Array<{
  goal: RitualGoal;
  number: string;
  copy: string;
}> = [
  { goal: "Cleanse", number: "01", copy: "An ingredient for a herbal hair wash" },
  { goal: "Hair Packs", number: "02", copy: "An ingredient for a traditional herbal hair pack" },
  { goal: "Scalp Ritual", number: "03", copy: "A traditional hair-and-scalp routine" },
  { goal: "Botanical Colour", number: "04", copy: "Informed, carefully strand-tested colour" },
];

export const hairFeels = [
  "Oily",
  "Balanced",
  "Dry / textured",
  "Very light / coloured",
] as const;

export type HairFeel = (typeof hairFeels)[number];

export function matchesQuizGoal(product: Product, goal: string) {
  if (goal === "Softness + Shine" || goal === "Resilient-Feeling Hair") return matchesRitualGoal(product, goal);
  const known = goalOptions.find((option) => option.goal === goal);
  return known ? matchesRitualGoal(product, known.goal)
    : product.concerns.some((concern) => concern.trim().toLowerCase() === goal.trim().toLowerCase());
}

export function catalogueGoalOptions(products: readonly Product[]) {
  const options: Array<{ goal: string; copy: string }> = goalOptions
    .filter(({ goal }) => products.some((product) => matchesRitualGoal(product, goal)))
    .map(({ goal, copy }) => ({ goal, copy }));
  const seen = new Set([...options.map(({ goal }) => goal.toLowerCase()), "pack", "condition", "colour"]);
  for (const product of products) {
    for (const concern of product.concerns) {
      const goal = concern.trim();
      if (!goal || seen.has(goal.toLowerCase())) continue;
      seen.add(goal.toLowerCase());
      options.push({ goal, copy: "Explore botanicals for this ritual" });
    }
  }
  return options;
}

export type RitualRecommendation = {
  product: Product;
  requiresColourReview: boolean;
  guidance?: string;
};

function recommendation(
  product: Product,
  options: Omit<RitualRecommendation, "product"> = {
    requiresColourReview: false,
  },
): RitualRecommendation {
  return { product, ...options };
}

function selectProduct(
  products: readonly Product[],
  preferredSlug: string,
  matches: (product: Product) => boolean,
) {
  return (
    products.find(
      (product) =>
        product.slug === preferredSlug && matches(product) && product.availableForSale !== false,
    ) ??
    products.find(
      (product) => matches(product) && product.availableForSale !== false,
    ) ??
    products.find((product) => product.slug === preferredSlug && matches(product)) ??
    products.find(matches) ??
    null
  );
}

export function recommendRitual(
  products: readonly Product[],
  goal: string,
  hairFeel: HairFeel,
): RitualRecommendation | null {
  if (!goalOptions.some((option) => option.goal === goal)) {
    const product = selectProduct(products, "", (item) => matchesQuizGoal(item, goal));
    if (!product) return null;
    // Keep colour guidance even when a merchant adds a new concern label.
    if (product.ritualStep === "Colour") return recommendRitual([product], "Botanical Colour", hairFeel);
    return recommendation(product);
  }
  if (goal === "Botanical Colour") {
    const requiresColourReview = hairFeel === "Very light / coloured";
    const product = selectProduct(
      products,
      "indigo-powder",
      (item) => matchesQuizGoal(item, goal),
    );
    if (!product) return null;

    return recommendation(product, {
      requiresColourReview,
      guidance: requiresColourReview
        ? "Because you selected very light or coloured hair, begin with the Indigo guidance instead of adding it straight to your bag. Botanical colour can shift differently on grey, blonde, bleached, porous or previously coloured hair, so read the final pack directions and complete a strand test before deciding."
        : undefined,
    });
  }
  if (goal === "Scalp Ritual") {
    const product = selectProduct(
      products,
      "bhringraj-powder",
      (item) => matchesQuizGoal(item, goal),
    );
    return product ? recommendation(product) : null;
  }
  if (goal === "Cleanse") {
    const product = selectProduct(
      products,
      "shikakai-powder",
      (item) => matchesQuizGoal(item, goal),
    );
    return product ? recommendation(product) : null;
  }
  const product = selectProduct(
    products,
    "amla-powder",
    (item) => matchesQuizGoal(item, goal),
  );
  return product ? recommendation(product) : null;
}
