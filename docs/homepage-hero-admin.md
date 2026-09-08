# Homepage hero: separate Shopify editor

Normal product listings are managed under **Products**. Homepage content is managed separately under **Content → Metaobjects → Homepage hero**. No homepage fields are needed when adding a regular product.

Product-page galleries show photos and processed GLB models attached under **Products → Media**. Select the **3D** thumbnail to rotate a model. These models stay available when the homepage entry is Draft. Wildcrafted Amla Powder's existing model is also attached to its product Media list.

## Create or edit a homepage entry

1. Open **Content → Metaobjects → Homepage hero** and choose **Add entry**, or open an existing entry.
2. Select a product. Its title, price, inventory and standard photos stay managed in Products.
3. Upload the three assets below. Incomplete entries can be saved as **Draft**.
4. Set the entry to **Active** when it is ready to appear on the homepage.

| Field | Requirement | What to enter |
| --- | --- | --- |
| Product | Required | Select an active product published to Headless. |
| 3D model | Required for display | A `.glb` file with embedded textures for the featured product panel. Shopify must finish processing it. |
| Hero poster | Required for display | Tall lifestyle or ritual image, displayed in the arched center frame. |
| Background image | Required for display | Wide background, preferably without a jar. |
| Entry name | Optional | A name for finding the entry in the admin. |
| Slide order | Optional | Lower numbers first; blank uses product collection order. |
| Slide duration | Optional | 3–60 seconds; blank uses the global default. |
| Eyebrow, headline lines, description and captions | Optional | Leave blank to use product-derived copy. |

Media fields are labelled **required for display**. They allow empty draft saves, but an Active entry with missing media still cannot appear. A deleted or unpublished product cannot appear. USDZ-only models do not qualify.

Set an entry to **Draft** to hide it. Removing an entry or clearing its assets affects only the hero. Standard product cards, detail galleries, search, wishlist and cart use normal product data and availability rules.

## Desktop and phone layout

Desktop shows the headline and purchase controls on the left, the tall poster in the center, and the 3D product with its details on the right. At 1000px and below, the headline and poster stay side by side, with the featured product panel beneath them. The background spans both rows.

The taller poster stays visible while the separate model rotates directly over the full hero background. The model has no card background, border or product photo behind it; a short status message appears while loading or if 3D is unavailable. No fourth hero upload is required. Headline fields control the left title, eyebrow controls the label above the product name, and caption fields control the poster badge. The optional homepage description appears inside **Why you'll love it**. Benefits, preparation, ingredient, name, size and price come from the linked product. Both **Explore the ritual** arrows scroll to the featured panel.

## Migrated Amla entry

**Wildcrafted Amla Powder** is **Active**, linked to the original product. Its model, poster, background and saved homepage copy were copied from the old product fields. Future homepage edits belong in this separate entry.

If a hero does not appear, check this entry rather than the old product fields: it must be Active, include all three processed assets, and link to a product published to Headless. Allow approximately two minutes for cached content to refresh. The website must also be running the update that reads these separate entries.

The 13 old Homepage product fields are unpinned so they no longer clutter the normal product form. Their saved values remain as a backup under View all. The updated website reads the separate Homepage hero entries; the old product fields no longer control the new hero.

## Global slideshow settings

Open **Content → Metaobjects → Storefront content → Homepage settings** (handle `main`).

| Setting | Default | Options |
| --- | --- | --- |
| Automatically change hero products | True | True / false |
| Default slide duration | 8 seconds | 3–60 |
| Auto-rotate 3D products | True | True / false |
| Rotation speed | 20 degrees per second | 0–60 |
| Move 3D products with cursor | True | True / false |
| Product transition | `fade` | `fade`, `slide`, `none` |

One complete Active entry stays on screen. Two or more change automatically in order. Visitors can navigate and pause slides or rotation. Slides pause on hover, keyboard focus, outside the viewport and in background tabs. Reduced-motion preferences disable automatic slides, rotation, cursor motion and transitions.

Homepage changes refresh within approximately two minutes; product changes can take up to five minutes. Authenticated webhooks can invalidate the shared cache sooner. The collection is shown first when no complete Active hero entries exist.

## Integration

The merchant-owned `homepage_hero` definition is created before entries are written with `metaobjectUpsert`. It has public Storefront read access and the publishable capability. Storefront API returns Active entries only; the website additionally requires a resolved published product and three media references. Normal product queries do not load legacy `custom.hero_*` fields.

- [Shopify metaobject entries and status](https://help.shopify.com/en/manual/custom-data/metaobjects/creating-entries)
- [Shopify Model3d](https://shopify.dev/docs/api/storefront/2026-07/objects/Model3d)
