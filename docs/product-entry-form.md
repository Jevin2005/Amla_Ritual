# NatureMist product entry form

This is the content form for every product shown on the NatureMist website. It is not a second database: create the fields once as Shopify product metafield definitions, pin them, and then complete the form at the bottom of each product page in Shopify Admin.

Shopify path: **Settings → Metafields and metaobjects → Products → Add definition**.

For every definition below:

- use namespace `custom` and the exact key shown;
- enable **Storefronts** in Access;
- pin the definition so the team sees it on every product editor;
- keep the definitions in the order below, which follows the website layout.

For `hero_poster`, restrict the file definition to images and add useful alt
text to the uploaded Shopify media. The image itself is the homepage opt-in:
no separate featured-product switch is required. Featured products appear in
ascending numeric `collection_number` order.

## Form fields in website order

| Shopify form label | Key | Type | Required before publishing | Website placement |
| --- | --- | --- | --- | --- |
| Botanical name | `botanical` | Single-line text | Yes | Product specifications |
| Plant part / form | `plant_part` | Single-line text | Yes | Product specifications |
| Collection number | `collection_number` | Single-line text | Recommended | Product ordering/ritual number |
| Card subtitle | `subtitle` | Single-line text | Yes | Cards and product heading |
| Accent colour | `accent` | Color | Recommended | Buttons and product accents |
| Soft accent colour | `accent_soft` | Color | Recommended | Product backgrounds |
| Display size | `size` | Single-line text | Yes | Product specifications |
| Availability label | `availability_label` | Single-line text | No | Optional stock-supporting label |
| Short description | `short_description` | Multi-line text | Yes | Product summary and cards |
| Meta description | `meta_description` | Multi-line text | Yes | Search and social summary fallback |
| Ingredient declaration | `ingredient` | Multi-line text | Yes | Ingredient details |
| Benefits | `benefits` | List of single-line text | Yes | “About this item” bullets |
| Preparation steps | `how_to` | List of single-line text | Yes | Ordered “How to prepare” section |
| Suggested mixers | `mixers` | List of single-line text | No | Ritual suggestions |
| Suitable for | `suitable_for` | List of single-line text | Recommended | Suitability guidance |
| Safety instructions | `safety` | List of single-line text | Yes | Safety guidance |
| Storage instructions | `storage` | Multi-line text | Yes | Storage accordion |
| Texture | `texture` | Single-line text | Recommended | Product detail |
| Customer goals | `concerns` | List of single-line text | Recommended | Shop filters and related products |
| Ritual step | `ritual_step` | Single-line text | Yes | Use `Cleanse`, `Condition`, or `Colour` |
| Experience level | `experience` | Single-line text | Yes | Use `Beginner`, `Familiar`, or `Advanced` |
| Colour considerations | `color_considerations` | List of single-line text | When relevant | Strand-test guidance |
| Search terms | `search_terms` | List of single-line text | Recommended | Store search |
| FAQs | `faqs` | JSON | Recommended | Product FAQ accordion |
| Homepage hero poster | `hero_poster` | File reference, images only | Only to feature this product in the hero | Homepage hero poster; blank keeps the product in standard listings only |
| Hero eyebrow | `hero_eyebrow` | Single-line text | No | Homepage featured-product slide |
| Hero line 1 | `hero_headline_first` | Single-line text | No | Homepage featured-product slide |
| Hero line 2 | `hero_headline_middle` | Single-line text | No | Homepage featured-product slide |
| Hero italic line | `hero_headline_italic` | Single-line text | No | Homepage featured-product slide |
| Hero description | `hero_description` | Multi-line text | No | Homepage featured-product slide |
| Hero badge | `hero_badge_text` | Single-line text | No | Homepage product badge |
| Hero badge detail | `hero_badge_subtitle` | Single-line text | No | Homepage product badge |
| Hero preparation note | `hero_how_to_text` | Multi-line text | No | Homepage preparation card |

For `ritual_step` and `experience`, add preset choices in the definition validation so staff cannot enter a spelling that breaks filtering.

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

Variants
Option names and values:
SKU per variant:
Barcode per variant:
Price per variant:
Compare-at price per variant:
Inventory per variant:
Weight/shipping data per variant:

NatureMist website form
Homepage hero poster filename + alt text (optional; enables homepage hero):
Botanical name:
Plant part / form:
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
Ritual step: Cleanse / Condition / Colour
Experience level: Beginner / Familiar / Advanced
Colour considerations (one per line):
Search terms (one per line):
FAQs JSON:
Hero eyebrow:
Hero line 1:
Hero line 2:
Hero italic line:
Hero description:
Hero badge:
Hero badge detail:
Hero preparation note:
```

## Test product: Amla Powder

Create this as a **Draft** first, check it on the storefront, and activate it only after the pack, price, inventory, safety copy, and photography are approved.

```text
Title: Amla Powder
Handle: amla-powder
Vendor: NatureMist
Product type: Botanical Hair Powder
Card subtitle: Condition + shine
Botanical name: Phyllanthus emblica
Plant part / form: Fruit powder
Collection number: 01
Accent colour: #6f8f2f
Soft accent colour: #dce7ad
Ritual step: Condition
Experience level: Beginner
Customer goals:
- Softness + Shine
- Resilient-Feeling Hair
- Scalp Ritual
Search terms:
- amla
- indian gooseberry
- shine
- conditioning
- mask
FAQs JSON:
[
  {
    "question": "How often should I use Amla Powder?",
    "answer": "Follow the frequency and preparation directions approved for the final product pack. Patch and strand test before first use."
  }
]
```

The remaining copy must match the approved pack and compliance review. Do not copy preview prices, weights, origin claims, reviews, certifications, dispatch promises, or treatment claims into a live product without evidence.

## Daily product workflow

1. Create the product as **Draft** and assign its category, vendor, type, tags, and collections.
2. Add options/variants, SKUs, prices, inventory, shipping weight, and high-quality media with alt text.
3. Complete the pinned NatureMist form from top to bottom. Upload a **Homepage hero poster** only when this product should join the homepage hero; leave it blank for a standard product listing.
4. Preview the product and test every variant, sold-out state, quantity change, cart action, and checkout handoff.
5. Publish it to the **Headless** sales channel and the intended Shopify Markets.
6. Change the status to **Active**. The storefront refreshes automatically; allow up to five minutes if a webhook is not configured.

To remove a product from the website without deleting its history, unpublish it from the Headless channel or set it to Draft. To reorder a ritual set, reorder products inside its Shopify collection.

To remove only the homepage feature while keeping the product for sale, clear
its `hero_poster` value. The product remains in the homepage collection, shop,
search, and other standard product lines.
