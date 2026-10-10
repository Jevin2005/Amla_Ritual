# Botanical book controls in Shopify

The book is managed through **Shopify Admin → Content → Metaobjects**. Its desktop page turn and phone layout remain part of the storefront.

[Open the section editor](https://admin.shopify.com/store/amla-ritual/content/metaobjects/entries/botanical_combos/431929295034).

## Section settings

Open **Botanical combos section → Homepage botanical book** (handle `main`).

| Field | What it changes |
| --- | --- |
| Show section | Shows or hides the complete section |
| Small heading | “Botanical combos” label |
| Heading first / second part | The two parts of the large heading |
| Section description | Short introduction beside the heading |
| View combo button text | All combo preview buttons |
| Enable desktop book animation | Enables or disables page turning |
| Page turn duration in seconds | 0.5–3 seconds; larger is slower; initial value 1.25 |
| Combos in display order | Select up to 60 Active combos; drag to reorder |

Save after editing. Each book page shows three combos in the saved order: page 1 shows combos 1–3, page 2 shows 4–6, page 3 shows 7–9, and so on. The first combo on each page supplies the large photo and featured details; the next two appear underneath. A final page can contain one or two combos without repeating earlier entries.

The bottom counter shows the current page and total pages. Next/Previous arrows appear when more than three valid combos are selected; all photos and details turn together on desktop. Removing all selections hides the section. The three installed combos currently fill one page. Create and select additional entries to add more pages.

The website’s global animation setting and pace still apply. Reduced-motion preferences take priority, and phones keep their responsive photo transition.

## Combo entries

Open **Botanical combo**, then choose an entry:

- [Classic Trio](https://admin.shopify.com/store/amla-ritual/content/metaobjects/entries/botanical_combo/431929196730)
- [Botanical Duo](https://admin.shopify.com/store/amla-ritual/content/metaobjects/entries/botanical_combo/431929229498)
- [Floral Duo](https://admin.shopify.com/store/amla-ritual/content/metaobjects/entries/botanical_combo/431929262266)

Edit its name, ingredients line, handwritten caption, photo, and selected products. Use a landscape image with the jars centered; the website adds all lettering and crops the same photo for its main frame and thumbnail. Images are hosted in Shopify Files, where you can also edit their alt text.

Select **2–6 distinct products** per combo. The storefront adds one available variant of each selected product at its current Shopify price, and shows the selected variant in the preview. Product IDs keep the pairing connected when names or handles change. Keep every product published to the Headless channel and the current market. A missing or unavailable product disables adding the complete pairing; the site never silently substitutes another product.

These are curated groups of individual jars. They do not create a separate bundle SKU or a special combo price. Shopify controls product prices, stock, discounts, shipping, and checkout totals.

To add a different pairing, create an Active **Botanical combo** entry, fill its fields, and select it in the section editor. Keep names and captions within the editor’s length limits so they fit the book.

## Publishing and refresh

The section and selected combo entries must be **Active** and available to the Storefront API. A Draft or absent section, or an empty/invalid selection, hides the book. Draft combos are omitted. Use **Show section = false** when deliberately hiding it.

The Shopify entries and all three photos are installed. **The updated frontend must be deployed before the public website uses these controls.** The local preview already reads them. Content is refreshed on the existing approximately two-minute revalidation cycle; an authenticated `metaobjects/update` webhook can invalidate the shared `shopify-storefront` cache sooner. Product updates follow the existing catalog cache policy.

## Developer maintenance

Definitions are versioned in [botanical-combos-schema.mjs](../frontend/scripts/botanical-combos-schema.mjs). They are merchant-owned so the independent storefront and Shopify Admin can share the content. Installation creates both definitions first, upserts the initial entries, then retrieves them through the Storefront API. Existing entries are preserved on reruns.

From `frontend`, `node scripts/setup-botanical-combos.mjs --verify` checks the published content using the existing Storefront credentials. Running without flags only checks the Admin app’s existing permissions; `--apply` installs missing content on a store whose app already has the required permissions. This store was configured through the connected Shopify app; the local order app does not have content-management permissions and does not need them for rendering the section.

Sources: [Shopify metaobjects](https://shopify.dev/docs/api/storefront/2026-07/objects/Metaobject), [definition creation](https://shopify.dev/docs/api/admin-graphql/2026-07/mutations/metaobjectDefinitionCreate), [entry upsert](https://shopify.dev/docs/api/admin-graphql/2026-07/mutations/metaobjectUpsert).
