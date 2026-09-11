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

## Website animation controls

The same **Storefront content → Homepage settings** entry also controls the new text, image and scroll effects:

| Setting | Recommended value | What it controls |
| --- | --- | --- |
| Website animations | True | Headline, photo, gallery and scroll reveals. False makes CSS transitions immediate. |
| Cursor effects | True | Magnetic link text and gently moving images on devices with a mouse. |
| Animation timing | 1 | 0.6 is quicker; 1.5 is slower. This does not change the slideshow interval. |
| Cursor movement strength | 1 | 0 disables decorative cursor motion; 0.5 is subtler; 1.5 is stronger. |

The hero's existing **Product transition** still accepts `none` to disable its entrance sequence. **Move 3D products with cursor** must also be enabled for the hero poster and Explore link to follow the cursor. 3D rotation, model cursor motion and automatic slide changes keep their own controls above.

The homepage has staggered headline lines, a gentle poster zoom and tilt, magnetic Explore links, individual catalog reveals, and masked ritual imagery. Catalog photos crossfade to the next available product photo on mouse hover after that photo loads. Product-page photos animate when selected; all photos and the 3D thumbnail remain available.

Phones use shorter scroll reveals and no cursor effects. Operating-system reduced-motion preferences take priority. Content is visible without JavaScript; scroll reveals never hide already-visible content during loading, and keyboard focus immediately reveals its target.

The shared effects use React, CSS and native browser animation APIs. The ingredient poster uses the installed Shery.js library for its native gooey effect and built-in debug panels.

## Ingredient clarity: multiple posters and gooey effect

Open **Content → Metaobjects → Storefront content → Homepage settings**. These fields manage only the poster beside **One ingredient. Nothing hidden.**

1. In **Ingredient clarity — poster images**, upload or select **1–8 images**.
2. Drag the selected images into the desired order. The first image appears first.
3. Save. Allow approximately two minutes for the storefront cache to refresh.

| Field | Initial value | Usage |
| --- | --- | --- |
| Ingredient clarity — poster images | Original ritual image, then the existing green lifestyle image | Ordered list of Shopify images; portrait images work best. |
| Ingredient clarity — gooey effect | True | Cursor reveals the next image through an animated liquid mask. |
| Ingredient clarity — automatically change images | True | Cycle images while the poster is visible. |
| Ingredient clarity — image duration (seconds) | 6 | 3–30 seconds between automatic changes. |
| Ingredient clarity — gooey strength | 1 | 0.5 subtle, 1 recommended, 1.5 stronger. |
| Ingredient clarity — Shery preset (JSON) | `{}` | Paste the complete JSON from Shery's native Save To Clipboard button. Saved shader settings override the strength defaults. |

Two or more images enable previous/next arrows, an image counter and a slideshow pause control. One image stays still. An empty list falls back to the original ritual poster. Removing an image here does not delete the file or change product galleries.

The poster calls the original [Shery.js Dynamic Gooey Effect](https://github.com/sheryianscodingschool/sheryjs#dynamic-gooey-effect) with `style: 6` and `gooey: true`. The arch and cover crop are retained. The website supplies image selection and timed transitions through the library's exposed uniforms; it does not pass `slideStyle`, which would disable Shery's gooey shader.

The effect loads when the poster first enters the viewport. Automatic changes pause on mouse hover, keyboard focus, hidden tabs, leaving the viewport or opening the editor. Reduced motion disables automatic changes and WebGL effects; manual navigation remains available. Website animations, Cursor effects, Animation timing and zero Cursor movement strength are respected. If WebGL or texture loading fails, the regular image gallery remains available. Shopify poster textures request a 1024px width. The library runs in its own iframe because it has no complete teardown API. Its animation callbacks pause offscreen, and removing the iframe releases its entire runtime without affecting the rest of the website.

The source attribution and notices are served at `/THIRD_PARTY_NOTICES.md`. `npm run prepare:shery` copies the pinned, original browser distributions to `public/vendor/shery`; it runs automatically before development and both production builds. No CDN script is fetched at runtime. Run `npm run test:poster` for image ordering, preset parsing, iframe safety, animation scheduling and native panel construction checks.

### Shery's built-in adjustment panel

1. In the local development website (`npm run dev`), scroll to **One ingredient. Nothing hidden.** and click **Open Shery controls** beneath the poster.
2. Expand the original **Gooey Panel**. It contains Speed, GooeyBall, Threshold, Antialias, Height and Scale, plus Shery's InfiniteGooey controls. The **Debug Panel** contains the base effect and shape controls.
3. Hover over the image while adjusting. Both panels are created by the installed library through `Shery.imageEffect("#poster", { style: 6, gooey: true, debug: true, config })`. No replacement sliders are rendered by React.
4. Expand **Debug Panel**, then click its built-in **Save To Clipboard** button.
5. Paste that JSON into **Content → Metaobjects → Storefront content → Homepage settings → Ingredient clarity — Shery preset (JSON)**. Save and allow approximately two minutes for the storefront cache to refresh.

Clear the preset to `{}` to restore defaults. Existing admin fields still control automatic image changes and timing. Native InfiniteGooey click cycling is available inside the editor; the storefront uses its existing previous/next buttons, counter and autoplay instead. The preset parser retains supported shader controls and discards runtime data such as textures, aspect ratio, time and canvas z-index. Closing the editor discards unsaved adjustments.

The editor launcher is available only in development. The production poster runs with `debug: false`. The normal poster pauses while the separate native editor is open; closing it resumes the poster. The editor respects reduced motion and the animation master switch.

## Integration

The merchant-owned `homepage_hero` definition is created before entries are written with `metaobjectUpsert`. It has public Storefront read access and the publishable capability. Storefront API returns Active entries only; the website additionally requires a resolved published product and three media references. Normal product queries do not load legacy `custom.hero_*` fields.

- [Shopify metaobject entries and status](https://help.shopify.com/en/manual/custom-data/metaobjects/creating-entries)
- [Shopify Model3d](https://shopify.dev/docs/api/storefront/2026-07/objects/Model3d)
