const field = (key, name, type, description, validations = [], required = false) => ({ key, name, type, description, validations, required });
const short = (key, name, max, required = false) => field(key, name, "single_line_text_field", "Use short wording to fit the book layout.", [{ name: "max", value: String(max) }], required);
const definition = (type, name, description, fields) => ({
  type, name, description, displayNameKey: "name",
  access: { storefront: "PUBLIC_READ" },
  capabilities: { publishable: { enabled: true } },
  fieldDefinitions: fields,
});

// Merchant-owned so the independent Headless channel and Admin can share them.
export const comboDefinition = definition("botanical_combo", "Botanical combo", "One botanical pairing in the homepage book. Set Active, then select it in Botanical combos section.", [
  short("name", "Combo name", 32, true),
  short("ingredients", "Ingredients line", 80, true),
  short("caption", "Handwritten photo caption", 65),
  field("photo", "Combo photo", "file_reference", "Landscape product photo without text overlays. Add image alt text in Files.", [{ name: "file_type_options", value: '["Image"]' }], true),
  field("products", "Products in this combo", "list.product_reference", "Choose 2–6 different products. One available variant of each is added at its current Shopify price. Publish every product to Headless.", [{ name: "list.min", value: "2" }, { name: "list.max", value: "6" }], true),
]);

export function sectionDefinition(comboDefinitionId) {
  return definition("botanical_combos", "Botanical combos section", "Homepage book settings. Edit the main entry. Keep Active and use Show section to control visibility.", [
    short("name", "Editor name", 60, true),
    field("enabled", "Show section", "boolean", "Hide or show the whole section on desktop and phones."),
    short("eyebrow", "Small heading", 40),
    short("heading", "Heading first part", 35),
    short("heading_ending", "Heading second part", 40),
    field("description", "Section description", "multi_line_text_field", "A short introduction beside the heading.", [{ name: "max", value: "140" }]),
    short("button_label", "View combo button text", 24),
    field("page_turn_enabled", "Enable desktop book animation", "boolean", "Global motion settings and reduced-motion preferences take priority."),
    field("page_turn_duration", "Page turn duration in seconds", "number_decimal", "0.5–3 seconds; higher is slower. The global motion pace also applies.", [{ name: "min", value: "0.5" }, { name: "max", value: "3.0" }]),
    field("combos", "Combos in display order", "list.metaobject_reference", "Select up to 60 Active combos and drag to reorder. Page 1 shows 1–3, page 2 shows 4–6, and so on. An empty list hides the book.", [{ name: "metaobject_definition_id", value: comboDefinitionId }, { name: "list.max", value: "60" }]),
  ]);
}

export const adminQueries = {
  inspect: `query InspectBotanicalCombos {
    shop { name myshopifyDomain }
    currentAppInstallation { accessScopes { handle } }
  }`,
  products: `query ComboSeedProducts { products(first: 100) { nodes { id title handle } pageInfo { hasNextPage endCursor } } }`,
  definition: `query ComboDefinition($type: String!) { metaobjectDefinitionByType(type: $type) { id type fieldDefinitions { key type { name } } } }`,
  entry: `query ComboEntry($handle: MetaobjectHandleInput!) { metaobjectByHandle(handle: $handle) { id handle fields { key value } capabilities { publishable { status } } } }`,
  createDefinition: `mutation CreateComboDefinition($definition: MetaobjectDefinitionCreateInput!) { metaobjectDefinitionCreate(definition: $definition) { metaobjectDefinition { id type } userErrors { field message code } } }`,
  upsert: `mutation SaveCombo($handle: MetaobjectHandleInput!, $metaobject: MetaobjectUpsertInput!) { metaobjectUpsert(handle: $handle, metaobject: $metaobject) { metaobject { id handle fields { key value } } userErrors { field message code } } }`,
  files: `query ComboFiles($query: String!) { files(first: 10, query: $query) { nodes { id fileStatus ... on MediaImage { image { url } } } } }`,
  stagedUpload: `mutation StageComboImage($input: [StagedUploadInput!]!) { stagedUploadsCreate(input: $input) { stagedTargets { url resourceUrl parameters { name value } } userErrors { field message } } }`,
  createFile: `mutation CreateComboImage($files: [FileCreateInput!]!) { fileCreate(files: $files) { files { id fileStatus } userErrors { field message code } } }`,
  fileStatus: `query ComboImageStatus($id: ID!) { node(id: $id) { ... on MediaImage { id fileStatus image { url altText width height } } } }`,
};
