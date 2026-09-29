function generateCanonicalProductSlug(title, handle) {
  if (!title) return handle || '';

  // Clean the title by removing brand prefix and generic packaging words
  let clean = title
    .toLowerCase()
    .replace(/^naturemist\s+/i, '')
    .replace(/\s+(100%|pure|organic|herbal|natural|jar|250g|100g|500g)\b/gi, '')
    .trim();

  // Convert to url-friendly slug
  let slug = clean
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  // If slug became empty, fallback to handle or generic slug
  if (!slug) {
    slug = (handle || 'product')
      .toLowerCase()
      .replace(/^naturemist-/i, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  return slug;
}

const products = [
  { title: "NatureMist Amla Powder", handle: "amla" },
  { title: "NatureMist Reetha Powder", handle: "wildcrafted-amla-powder" },
  { title: "NatureMist Indigo Powder", handle: "reetha-powder" },
  { title: "NatureMist Bhringraj Powder", handle: "bhringraj-powder" },
  { title: "NatureMist Hibiscus Powder", handle: "hibiscus-powder" },
  { title: "NatureMist Shikakai Powder", handle: "indigo-powder" },
  { title: "NatureMist Brahmi Powder (New Listing)", handle: "brahmi-powder" },
  { title: "Rosemary Hair Oil (New Listing Without Handle)", handle: "" }
];

console.log("Canonical Slugs Generated for Products:");
for (const p of products) {
  console.log(`Title: "${p.title}" | Shopify Handle: "${p.handle}" -> Canonical URL: /shop/${generateCanonicalProductSlug(p.title, p.handle)}`);
}
