import { getProduct, type RitualGoal } from "@/domain/catalog/products";

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

export function recommendRitual(goal: RitualGoal, hairFeel: HairFeel) {
  if (goal === "Botanical Colour") return getProduct("indigo-powder")!;
  if (goal === "Scalp Ritual") return getProduct("bhringraj-powder")!;
  if (goal === "Cleanse") {
    return hairFeel === "Oily"
      ? getProduct("reetha-powder")!
      : getProduct("shikakai-powder")!;
  }
  return hairFeel === "Dry / textured"
    ? getProduct("hibiscus-powder")!
    : getProduct("amla-powder")!;
}
