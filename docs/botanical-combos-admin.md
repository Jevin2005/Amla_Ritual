# Combo products and custom pricing

The homepage's **The botanical cabinet** shows only single products. The final **Botanical combos** section shows combos. Both sections, the shop, and wishlist use the same product card. `/combos` opens `/shop?type=combos`.

## Create a combo listing

1. In Shopify Admin → Products, create a product for the complete combo. Set its title, description, photo, quantity, inventory, and your own selling price. Set a compare-at price only when appropriate.
2. Use product type **Combo** or add the exact tag **combo**. This separates it from single jars. **Bundle** is also supported.
3. For an existing saved pairing, use its name (for example, **Classic Trio** or **NatureMist Classic Trio**). For an explicit link, add `combo:<metaobject ID>` using that pairing's full Shopify metaobject ID. Keep only one listing linked to each pairing.
   In **Content → Metaobjects → Botanical combo**, select all individual powders under **Products in this combo**. These references supply the photos, descriptions, quantities, and product links inside the popup. Select the entry in the **Botanical combos section → Combos in display order** list. A combo-count tag alone does not define which products are included.
4. For a new combo without a saved pairing, optionally add `combo-count:2`, `combo-count:3`, etc. so the jar-count filter knows its size. Without this tag, it appears under all combos without an invented jar count.
5. Once the price and inventory are ready, make the product Active and publish it to the Headless sales channel used by the storefront.

The combo card's image, title, and arrow open a popup. Customers can expand each included product to see its photo, ingredients, directions, and individual price without leaving the popup. **View full product** closes the popup and opens that product page.

Clicking an included product's thumbnail or **View product photos** opens its larger photo gallery inside the same popup. Customers can browse that product's photos with arrows or thumbnails. **Back to combo**, **Close product photos**, or Escape returns to the combo while preserving its option, quantity, and expanded product details.

The popup shows the combo's own price, variant selector (when applicable), quantity, **Add combo to bag**, and **Buy now**. Add to bag opens the cart only after a successful addition. Buy now adds the combo and opens the existing checkout; failed additions keep the popup open with an error. The selected variant and quantity determine the displayed total and cart line.

Adding a set adds **one variant of the combo product**, independently of the individual jar prices. Set inventory for the complete combo; this implementation does not automatically deduct its component jars. To change the selling price later, edit **Products → your combo → Price** (or the specific variant's Price). No code edit is needed.

## Existing pairing content

[Open the section editor](https://admin.shopify.com/store/amla-ritual/content/metaobjects/entries/botanical_combos/431929295034).

Saved Botanical combo metaobjects still supply pairing order, ingredients, photos, and included-jar references. The Botanical combos section's headings, description, and Show section switch control the final homepage section. The old book animation controls are not used by the card grid.

A saved pairing without a published combo product appears as **Coming soon**. Its preview shows individual jars, but it has no combined price or combo checkout action. Publishing its matching combo product automatically replaces it with the standard purchasable product card. The homepage visibility switch does not hide combos from the shop.

## Catalog audit — 19 October 2026

The connected store contains six individual products and no separate combo products. The published saved pairings are Classic Trio (3 jars), Botanical Duo (2 jars), and Floral Duo (2 jars). Their separate listings and merchant-selected selling prices are required before they can be purchased as combos. No live prices were changed by the frontend update.

## Maintenance

Classification lives in `frontend/src/domain/catalog/product-kind.ts`; product linking and pricing live in `frontend/src/domain/combo-catalog.ts`. No new Shopify API fields or metaobject definitions are required: the storefront already fetches product type, tags, variants, and pricing.

Run the collection-catalog and product-card-data tests after changing classification, linking, or prices. Existing editorial schema/setup scripts remain compatible with the saved pairing content.

Reference: [Shopify Storefront product and variant pricing](https://shopify.dev/docs/api/storefront/latest/queries/product).
