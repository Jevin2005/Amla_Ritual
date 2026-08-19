import {
  getProduct,
  type Product,
  type RitualGoal,
} from "@/domain/catalog/products";

export const goalOptions: Array<{
  goal: RitualGoal;
  number: string;
  copy: string;
}> = [
  { goal: "Cleanse", number: "01", copy: "A low-lather wash-day reset" },
  { goal: "Softness + Shine", number: "02", copy: "A conditioning mask for luminous lengths" },
  { goal: "Scalp Ritual", number: "03", copy: "Grounding care from scalp through ends" },
  { goal: "Botanical Colour", number: "04", copy: "Informed, carefully strand-tested colour" },
];

export const hairFeels = [
  "Oily",
  "Balanced",
  "Dry / textured",
  "Very light / coloured",
] as const;

export type HairFeel = (typeof hairFeels)[number];

export type RitualRecommendation = {
  product: Product;
  requiresColourReview: boolean;
  guidance?: string;
};

function recommendation(
  slug: string,
  options: Omit<RitualRecommendation, "product"> = {
    requiresColourReview: false,
  },
): RitualRecommendation {
  return { product: getProduct(slug)!, ...options };
}

export function recommendRitual(
  goal: RitualGoal,
  hairFeel: HairFeel,
): RitualRecommendation {
  if (goal === "Botanical Colour") {
    const requiresColourReview = hairFeel === "Very light / coloured";

    return recommendation("indigo-powder", {
      requiresColourReview,
      guidance: requiresColourReview
        ? "Because you selected very light or coloured hair, begin with the Indigo guidance instead of adding it straight to your bag. Botanical colour can shift differently on grey, blonde, bleached, porous or previously coloured hair, so read the final pack directions and complete a strand test before deciding."
        : undefined,
    });
  }
  if (goal === "Scalp Ritual") return recommendation("bhringraj-powder");
  if (goal === "Cleanse") {
    return hairFeel === "Oily"
      ? recommendation("reetha-powder")
      : recommendation("shikakai-powder");
  }
  return hairFeel === "Dry / textured"
    ? recommendation("hibiscus-powder")
    : recommendation("amla-powder");
}
