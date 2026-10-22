# NatureMist product entry form

This is the content form for every product shown on the NatureMist website. It is not a second database: create the fields once as Shopify product metafield definitions, pin them, and then complete the form at the bottom of each product page in Shopify Admin.

Shopify path: **Settings → Metafields and metaobjects → Products → Add definition**.

For every definition below:

- use namespace `custom` and the exact key shown;
- enable **Storefronts** in Access;
- pin the definition so the team sees it on every product editor;
- keep the definitions in the order below, which follows the website layout.

Homepage content uses the optional **Homepage** fields under **Products → Metafields**. No homepage fields are required for a normal product listing. See [Homepage hero editor](homepage-hero-admin.md).

## Form fields in website order

| Shopify form label | Key | Type | Required before publishing | Website placement |
| --- | --- | --- | --- | --- |
| Botanical name | `botanical_name` | Single-line text | Yes | Product specifications; preferred over legacy `botanical` |
| Plant part / form | `plant_part` | Single-line text | Yes | Product specifications |
| Care areas | `care_areas` | List of single-line text | Yes | Product badges, care filters and ritual recommendations |
| Collection number | `collection_number` | Single-line text | Recommended | Product ordering/ritual number |
| Card subtitle | `subtitle` | Single-line text | Yes | Cards and product heading |
| Accent colour | `accent` | Color | Recommended | Buttons and product accents |
| Soft accent colour | `accent_soft` | Color | Recommended | Product backgrounds |
| Net quantity | `net_quantity` | Single-line text | Yes | Product specifications; preferred over legacy `size` |
| Availability label | `availability_label` | Single-line text | No | Optional stock-supporting label |
| Short description | `short_description` | Multi-line text | Yes | Product summary and cards |
| Meta description | `meta_description` | Multi-line text | Yes | Search and social summary fallback |
| Ingredient declaration | `ingredient` | Multi-line text | Yes | Ingredient details |
| Benefits | `benefits` | List of single-line text | Yes | “About this item” bullets |
| Preparation steps | `how_to_use` | List of single-line text | Yes | Grouped “How to prepare” section; preferred over legacy `how_to` |
| Suggested mixers | `mixers` | List of single-line text | No | Ritual suggestions |
| Suitable for | `suitable_for` | List of single-line text | Recommended | Suitability guidance |
| Safety instructions | `safety` | List of single-line text | Yes | Safety guidance |
| Storage instructions | `storage` | Multi-line text | Yes | Storage accordion |
| Texture | `texture` | Single-line text | Recommended | Product detail |
| Customer goals | `concerns` | List of single-line text | Recommended | Shop filters and related products |
| Ritual step | `ritual_step` | Single-line text | Yes | Use `Cleanse`, `Pack`, or `Colour`; `Condition` remains supported for legacy records |
| Experience level | `experience` | Single-line text | Yes | Use `Beginner`, `Familiar`, or `Advanced` |
| Colour considerations | `color_considerations` | List of single-line text | When relevant | Strand-test guidance |
| Search terms | `search_terms` | List of single-line text | Recommended | Store search |
| FAQs | `faqs` | JSON | Recommended | Product FAQ accordion |

For `care_areas`, allow only `Hair Care`, `Skin Care`, and `Hair Colour`, with multiple selections permitted. For `ritual_step` and `experience`, add preset choices in the definition validation so staff cannot enter a spelling that breaks filtering.

Create the `custom.care_areas` definition first with Storefront read access, then save each product's selected values. The storefront reads those explicit values; product names, tags and preview profiles never supply missing care categories.

The approved working source is **NatureMist_Six_Powders_Benefits_and_Claims.xlsx**, reviewed 21 October 2026. Current product roles are **Hair Care** for Amla, Reetha, Shikakai, Hibiscus and Bhringraj, and **Hair Colour** for Indigo. Amla and Hibiscus face/body packs are development options; do not select **Skin Care** or provide facial-use directions until the actual product's identity, suitability, tolerance and instructions have been assessed.

Use `Pack` for Amla, Hibiscus and Bhringraj, `Cleanse` for Reetha and Shikakai, and `Colour` for Indigo. Use neutral goals such as `Hair Packs`, `Cleanse`, `Scalp Ritual` and `Botanical Colour`. Softness, shine, slip, reduced breakage, scalp comfort and sensitive-skin suitability require appropriate finished-product evidence. Ingredient studies and Ayurvedic tradition do not establish those results for the current jars.

All six single-product net quantities are **200 g**. Keep `custom.net_quantity`, legacy `custom.size` where retained, relevant variant option text, SEO, descriptions and accessible image text consistent. Preserve product handles and image files; the packaging photographs will be replaced separately. Confirm the supplied species and plant part against supplier records; Bhringraj's leaves/aerial parts must not be described as a whole-plant ingredient.

Prefix preparation list items with `Preparation:`, `Hair:`, `Rinse:`, and `After use:` to show clear groups. `Hair colour:` and `Before colouring:` are also supported. Use the actual product directions for quantities and timing. Do not invent facial timings or untested blend ratios.

## Blank product worksheet

Complete this before opening Shopify. One line in a list becomes one Shopify list item.

```text
Core Shopify product fields
Title:
Handle:
Status: Draft / Active
Vendor: NatureMist
Product type:
Category:
Description:
Tags:
Collections:
SEO title:
SEO description:

Media
Featured image filename:
Featured image alt text:
Gallery image filenames + alt text:
Optional 3D model (.glb) filenames + alt text:

Variants
Option names and values:
SKU per variant:
Barcode per variant:
Price per variant:
Compare-at price per variant:
Inventory per variant:
Weight/shipping data per variant:

NatureMist website form
Botanical name:
Plant part / form:
Care areas (one per line): Hair Care / Skin Care / Hair Colour
Collection number:
Card subtitle:
Accent colour:
Soft accent colour:
Display size:
Availability label:
Short description:
Meta description:
Ingredient declaration:
Benefits (one per line):
Preparation steps (one per line, in order):
Suggested mixers (one per line):
Suitable for (one per line):
Safety instructions (one per line):
Storage instructions:
Texture:
Customer goals (one per line):
Ritual step: Cleanse / Pack / Colour
Experience level: Beginner / Familiar / Advanced
Colour considerations (one per line):
Search terms (one per line):
FAQs JSON:
```

## Test product: Amla Powder

Create this as a **Draft** first, check it on the storefront, and activate it only after the pack, price, inventory, safety copy, and photography are approved.

```text
Title: Amla Powder
Handle: amla-powder
Vendor: NatureMist
Product type: Botanical Hair Pack Powder
Card subtitle: Traditional herbal hair packs
Net quantity: 200 g
SEO title: Amla Fruit Powder for Herbal Hair Packs, 200 g | NatureMist
Short description: A botanical ingredient for a traditional hair-care routine.
Care areas:
- Hair Care
Botanical name: Phyllanthus emblica
Plant part / form: Fruit pulp powder
Collection number: 01
Accent colour: #6f8f2f
Soft accent colour: #dce7ad
Ritual step: Pack
Experience level: Beginner
Customer goals:
- Hair Packs
Search terms:
- amla
- indian gooseberry
- herbal hair pack
- traditional hair care
- hair care
FAQs JSON:
[
  {
    "question": "How often should I use Amla Powder?",
    "answer": "Follow the frequency and preparation directions approved for the final product pack. Patch and strand test before first use."
  }
]
```

The remaining copy must match the approved pack and evidence record. Do not borrow extract, oral, animal or laboratory outcomes as finished-powder claims. Avoid regrowth, grey reversal, dandruff treatment, acne/eczema treatment, fixed vitamin C content and universal-tolerance promises. Indigo shade and grey coverage are process dependent; henna is outside these six products, and Amla does not replace it. See [six-product profiles](claims-refresh-2026-10-21/single-profiles.json) for the workbook-aligned listing data.

## Daily product workflow

1. Create the product as **Draft** and assign its category, vendor, type, tags, and collections.
2. Add options/variants, SKUs, prices, inventory, shipping weight, and high-quality media with alt text.
3. Complete the pinned product fields. These describe the standard product listing; homepage content is managed in the optional Homepage metafields on the same product.
4. Preview the product and test every variant, sold-out state, quantity change, cart action, and checkout handoff.
5. Publish it to the **Headless** sales channel and the intended Shopify Markets.
6. Change the status to **Active**. The storefront refreshes automatically; allow up to five minutes if a webhook is not configured.

To remove a product from the website without deleting its history, unpublish it from the Headless channel or set it to Draft. To reorder a ritual set, reorder products inside its Shopify collection.

To remove only a homepage feature, set the product’s **Show in homepage hero** metafield to **False**. The product remains in normal listings. See [Homepage hero editor](homepage-hero-admin.md).
