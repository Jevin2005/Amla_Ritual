import type { StoreImage } from "./catalog/products";

// Supplied NatureMist_18_Posters/image-index.csv. Keep each row's three photos
// together so the shared slideshow clock always shows one matching botanical.
export const ingredientPosterSets = [
  { name: "Amla", slug: "amla", preparationWidth: 1204, preparationHeight: 1306 },
  { name: "Reetha", slug: "reetha", preparationWidth: 1113, preparationHeight: 1413 },
  { name: "Shikakai", slug: "shikakai", preparationWidth: 1205, preparationHeight: 1305 },
  { name: "Hibiscus", slug: "hibiscus", preparationWidth: 1205, preparationHeight: 1305 },
  { name: "Bhringraj", slug: "bhringraj", preparationWidth: 1205, preparationHeight: 1305 },
  { name: "Indigo", slug: "indigo", preparationWidth: 1205, preparationHeight: 1305 },
].map(({ name, slug, preparationWidth, preparationHeight }) => {
  const image = (slot: string, altText: string, width: number, height: number): StoreImage => ({
    url: `/images/botanical-posters/${slug}/${slug}-${slot}.webp`, altText, width, height,
  });
  return {
    name, slug,
    ingredient: image("01-ingredient", `${name} botanical ingredients in natural light`, 1484, 1060),
    preparation: image("02-preparation", `Preparing ${name} powder in a ceramic bowl`, preparationWidth, preparationHeight),
    jar: image("03-jar", `NatureMist ${name} Powder 200 g white jar with black lid`, 916, 1717),
  };
});

export const ingredientPosterGalleries = {
  plantImages: ingredientPosterSets.map((set) => set.ingredient),
  preparationImages: ingredientPosterSets.map((set) => set.preparation),
  lifestyleImages: ingredientPosterSets.map((set) => set.jar),
};
