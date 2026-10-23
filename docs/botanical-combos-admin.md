# Combo products and custom pricing

The local storefront now reads combos directly from Shopify products. Separate **Botanical combo** entries (`botanical_combo`, singular) are no longer needed by this version. The **Botanical combos section** (`botanical_combos`, plural) remains for homepage headings, visibility, animation and product order.

**Deployment status, 23 October 2026:** the eight products have their migrated fields, but this code has not been deployed. At the owner's request, the old entries and old section field remain intact until deployment. The currently deployed Vercel site still needs them. See the [migration record](combo-product-migration-2026-10-23/README.md).

## Edit or create a combo

1. Open **Shopify Admin → Products → your combo**. Edit its title, photos, description, variants, price and inventory there.
2. Keep the exact **combo** tag (or product type **Combo** or **Bundle**).
3. Under product metafields, select 2–6 different single jars in **Included products** (`custom.combo_products`). Do not select the combo itself or another combo.
4. Edit **Combo ingredients** (`custom.combo_ingredients`) and **Combo caption** (`custom.combo_caption`) on that same product. These supply the book's ingredients line and handwritten photo caption.
5. Set the product Active and publish it, and the included jars, to the storefront's Headless sales channel.
6. In [Botanical combos section → main](https://admin.shopify.com/store/amla-ritual/content/metaobjects/entries/botanical_combos/431929295034), select it under **Combo products in display order**. Drag products to reorder. Up to 60 products are supported, three per page. Keep the section Active and **Show section** enabled.

No separate pairing entry or `combo:<metaobject ID>` tag is needed. Product IDs link the data, so renaming a product does not attach it to another similarly named combo. The old tags can remain harmlessly until the migration cleanup.

## Display and buying behavior

The homepage book uses the selected products in saved order. It uses their current featured photos, then first gallery photos, then a neutral placeholder. Images fit the frames without cropping the jars. Titles come from the products, with the NatureMist prefix omitted in the book. Missing or unpublished listings and invalid member lists are omitted from the book; preview samples appear only when Shopify is unconfigured.

The popup shows the included jars, their photos and details, plus the combo's own variant selector, quantity and price. **Add combo to bag** and **Buy now** add one variant of the combo product. Pricing and inventory are independent of the individual jars; component inventory is not automatically deducted. Missing member references keep the saved jar count and never silently substitute a different jar. The combo's own availability still controls whether its listing can be purchased.

Combos outside the homepage selection still appear in the shop and retain their product-owned members and captions. The homepage visibility switch only hides the book. `/combos` opens `/shop?type=combos`.

## Saved order

1. Classic Trio — 3 jars
2. Botanical Duo — 2 jars
3. Floral Duo — 2 jars
4. Amla Reetha Duo — 2 jars
5. Amla Shikakai Duo — 2 jars
6. Cleansing Duo — 2 jars
7. Botanical Mask Trio — 3 jars
8. Bhringraj Hibiscus Duo — 2 jars

These appear across three pages (3 / 3 / 2). All 24 copied product field values were checked against the original entries. Product prices, inventory and original entries were preserved.

## Verification and maintenance

From the repository root, run `node frontend/scripts/setup-botanical-combos.mjs --verify` to check the published catalog with the same product mapping as the storefront. It is read-only. The old seeder and singular definition schema were retired; `--apply` now fails before contacting Shopify, so it cannot recreate the unwanted entries.

The query lives in `frontend/src/lib/shopify/botanical-combos-query.ts`; product fields are loaded in `frontend/src/lib/shopify/storefront.ts`. Parsing and membership live in `frontend/src/domain/botanical-combos.ts`; listing prices and matching live in `frontend/src/domain/combo-catalog.ts`.

Run the botanical-combos, combo-catalog, collection-catalog and combo-preview-actions tests after changing membership, order or purchase behavior.
