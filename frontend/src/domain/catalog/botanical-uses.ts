import type { Product } from "./products";
import { isComboProduct } from "./product-kind";

export type BotanicalTopic = "all" | "hair" | "skin" | "body" | "colour";
export const botanicalTopics: { value: BotanicalTopic; label: string; description: string }[] = [
  { value: "all", label: "All botanicals", description: "Explore each powder's current role, then discover its wider traditions and ingredient research." },
  { value: "hair", label: "Hair care", description: "Choose a herbal wash or a traditional hair pack. Prepare each powder using its own label directions." },
  { value: "skin", label: "Skin research", description: "Explore traditional skin associations and studies of formulated extracts. These findings do not establish face-use directions or benefits for the current powders." },
  { value: "body", label: "Body research", description: "Explore botanical cleanser research and development possibilities. These references do not establish body-use directions for the current powders." },
  { value: "colour", label: "Hair colour", description: "Explore Indigo's hair-colour role. Follow the label's preparation and testing directions; results depend on your hair and colouring process." },
];

export type BotanicalResearch = {
  topic: "skin" | "body";
  label: string;
  summary: string;
  limitation: string;
  sourceTitle: string;
  sourceUrl: string;
};
export type BotanicalProfile = {
  id: string;
  slug: string;
  name: string;
  image: string;
  alt: string;
  category: "Hair packs" | "Hair cleansing" | "Hair colour";
  topic: "hair" | "colour";
  roles: string[];
  research: BotanicalResearch[];
};

// Editorial classification reviewed 2026-10-23. Research topics are deliberately
// separate from product-use categories and must not grant quiz eligibility.
// See docs/product-information/skin-body-research-2026-10-23.txt.
export const botanicalProfiles: BotanicalProfile[] = [
  {
    id: "gid://shopify/Product/8494763311290", slug: "amla-powder", name: "Amla", image: "amla",
    alt: "Fresh green amla fruits with delicate leafy branches", category: "Hair packs", topic: "hair",
    roles: ["Fruit powder for herbal hair packs", "Ayurvedic care heritage", "A separate pack step in your routine"],
    research: [{ topic: "skin", label: "Facial formulation study", summary: "A study in 30 people examined a 3% Amla fruit-extract toner and reported reduced facial sebum recovery.", limitation: "The study tested a formulated extract. It does not establish oil-control benefits or facial directions for this fruit powder.", sourceTitle: "Read the Amla toner study", sourceUrl: "https://www.mdpi.com/2076-3417/10/22/8193" }],
  },
  {
    id: "gid://shopify/Product/8498815107258", slug: "reetha-powder", name: "Reetha", image: "reetha",
    alt: "Brown reetha soapnuts, an open shell and green leaves", category: "Hair cleansing", topic: "hair",
    roles: ["Soapnut powder for herbal washes", "A botanical cleansing step", "Follow the pack's rinse-out directions"],
    research: [
      { topic: "skin", label: "Preliminary facial cleanser study", summary: "A 20-person study examined washing with a hot-water soapnut fruit extract for 14 days.", limitation: "This small extract study does not establish facial directions or eye-area suitability for the raw powder.", sourceTitle: "Read the soapnut cleansing study", sourceUrl: "https://doi.org/10.15810/jic.2024.20.3.003" },
      { topic: "body", label: "Body-cleanser development possibility", summary: "Soapnut cleansing research makes it an ingredient to explore in a formulated body wash.", limitation: "This is a development inference. The linked study examined facial washing with an extract, not body use of this powder.", sourceTitle: "Read the underlying cleanser study", sourceUrl: "https://doi.org/10.15810/jic.2024.20.3.003" },
    ],
  },
  {
    id: "gid://shopify/Product/8531585597626", slug: "shikakai-powder", name: "Shikakai", image: "shikakai",
    alt: "Dried shikakai pods with green compound leaves", category: "Hair cleansing", topic: "hair",
    roles: ["Pod powder for traditional hair washing", "A rinse-off botanical routine", "A dedicated wash step"],
    research: [{ topic: "body", label: "Multi-ingredient body cleanser study", summary: "A two-week study in 30 people examined a forearm cleanser containing Shikakai and two other botanical extracts.", limitation: "The combined formulation does not establish Shikakai-only benefits, body-use directions for raw powder or eczema treatment.", sourceTitle: "Read the body cleanser study", sourceUrl: "https://apjai-journal.org/original-article/ap-050519-0554/" }],
  },
  {
    id: "gid://shopify/Product/8531585499322", slug: "hibiscus-powder", name: "Hibiscus", image: "hibiscus",
    alt: "A red hibiscus flower with its yellow stamen and green leaves", category: "Hair packs", topic: "hair",
    roles: ["Flower powder for herbal hair packs", "A floral ingredient for a pack step", "Follow the flower powder's label directions"],
    research: [{ topic: "skin", label: "Preliminary facial mask study", summary: "A small study in 15 women examined clay masks containing Hibiscus rosa-sinensis flower extract over four weeks.", limitation: "The publisher's abstract reports a formulated extract study. It does not establish anti-ageing results or face-mask directions for this flower powder.", sourceTitle: "Read the Hibiscus mask study", sourceUrl: "https://journal-jps.com/new/index.php/jps/en/article/view/1783" }],
  },
  {
    id: "gid://shopify/Product/8531585433786", slug: "bhringraj-powder", name: "Bhringraj", image: "bhringraj",
    alt: "Bhringraj leaves and small white flowers", category: "Hair packs", topic: "hair",
    roles: ["Traditional hair and scalp packs", "Ayurvedic hair-care heritage", "Check the supplied plant part on your jar"],
    research: [{ topic: "skin", label: "Ayurvedic tradition", summary: "The Ayurvedic Pharmacopoeia records Tvacya, a traditional skin association, in its whole-plant Bhringraj monograph.", limitation: "This records traditional use. It does not establish facial directions or clinical skin benefits for the supplied powder.", sourceTitle: "Read the Ayurvedic monograph (PDF, page 36)", sourceUrl: "https://www.ayurveda.hu/api/API-Vol-2.pdf#page=36" }],
  },
  {
    id: "gid://shopify/Product/8531585368250", slug: "indigo-powder", name: "Indigo", image: "indigo",
    alt: "Indigo leaves beside a wooden bowl of botanical powder", category: "Hair colour", topic: "colour",
    roles: ["Leaf powder for botanical hair colour", "A suitable henna step may be required", "Strand-test your intended colour process"], research: [],
  },
];

export function profilesForTopic(topic: BotanicalTopic) {
  return botanicalProfiles.filter((profile) => topic === "all" || profile.topic === topic || profile.research.some((item) => item.topic === topic));
}

export function getBotanicalProfile(product: Pick<Product, "id" | "slug" | "productType" | "tags">) {
  if (isComboProduct(product)) return undefined;
  // Live identities are explicit: a similarly named blend must not inherit a
  // single powder's evidence. Exact slugs are used only for the preview catalogue.
  return botanicalProfiles.find((profile) => product.id ? profile.id === product.id : profile.slug === product.slug);
}

export const ritualStepLabels = {
  All: "All uses", Cleanse: "Hair cleansing", Condition: "Hair packs", Colour: "Hair colour",
} as const;
