# Homepage hero: Shopify product metafields

After deploying the product-metafield update, edit **Products → choose a product → Metafields → View all**. These fields are the sole source for each hero slide. The old **Homepage hero** metaobjects are retained but no longer queried. Their Active/Draft status has no effect on the hero.

## Select and arrange products

1. Publish the product to the website's **Headless** sales channel and intended market.
2. Select a processed **Homepage hero poster**, **Homepage background image**, and **Homepage 3D model** (.glb).
3. Set **Show in homepage hero** to **True**. False or blank hides only its hero slide; the product stays in normal listings.
4. Set **Homepage slide order** (lower numbers first) and **Homepage slide duration (seconds)** (3–60 seconds). A blank duration uses the global interval; blank order uses catalog order. Equal orders retain catalog order.
5. Fill the headline, eyebrow, description and caption fields on that same product. Save and allow approximately five minutes for the cached website to refresh, or use the configured authenticated Shopify webhook.

Each enabled product produces one slide. Missing/deleted image references or a missing/non-GLB model exclude the slide until repaired; the website never borrows another product's media. Publishing the product to Online Store alone does not make it available to the Headless website.

## Field mapping

All fields below use the existing merchant-owned **custom** namespace and Storefront **PUBLIC_READ** access. No definition or value recreation is needed. The misleading Legacy prefix has been removed from all 13 definitions in Shopify.

| Shopify key | Controls |
| --- | --- |
| hero_enabled | Explicit true includes this product, subject to publishing and complete media |
| hero_order | Slide order |
| hero_duration | This slide's autoplay interval in seconds |
| hero_poster | Centre poster image |
| hero_background | Full background image |
| hero_model | Product GLB model; accepts processed Model3d or a GLB GenericFile |
| hero_eyebrow | Introductory and product labels |
| hero_headline_first | First headline line |
| hero_headline_middle | Second headline line |
| hero_headline_italic | Italic phrase |
| hero_description | Intro description and Why you'll love it copy |
| hero_badge_text | Poster product caption |
| hero_badge_subtitle | Poster caption detail |

Title, price, availability, variant, benefits, ingredients, formulation, subtitle, quantity and preparation instructions continue to come from the same Shopify product. Blank optional hero text uses existing product/design fallbacks. Product gallery photos and models remain managed under **Products → Media**.

## Layout and display

The existing desktop/mobile layout, poster position, animations and unfiltered backgrounds remain. Text colours identify the current product title before considering its handle, so a renamed product does not inherit another botanical's theme from an old URL.

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

One complete enabled product stays on screen. Two or more change automatically in order. Visitors can navigate and pause slides or rotation. Slides pause on hover, keyboard focus, outside the viewport and in background tabs. Reduced-motion preferences disable automatic slides, rotation, cursor motion and transitions.

Product and hero changes can take approximately five minutes to refresh. Authenticated webhooks can invalidate the shared cache sooner. The collection is shown first when no complete enabled hero products exist.

## Website animation controls

The same **Storefront content → Homepage settings** entry also controls the new text, image and scroll effects:

| Setting | Recommended value | What it controls |
| --- | --- | --- |
| Website animations | True | Headline, photo, gallery and scroll reveals. False also stops automatic hero changes, 3D rotation and decorative cursor motion. |
| Cursor effects | True | Magnetic link text and gently moving images on devices with a mouse. |
| Animation timing | 1 | 0.6 is quicker; 1.5 is slower. This does not change the slideshow interval. |
| Cursor movement strength | 1 | 0 disables decorative cursor motion; 0.5 is subtler; 1.5 is stronger. |

The hero's **Product transition** supports a fade, a directional slide, or `none`. Choosing `none` makes hero image and text changes immediate and disables its Shery effects. **Move 3D products with cursor** must also be enabled for the hero poster and Explore link to follow the cursor. Global Website animations, Cursor effects and Cursor movement strength also govern decorative 3D cursor movement. The separate 3D rotation and automatic slideshow controls remain available.

The homepage has staggered headline lines, an organic hover reveal inside the arched hero poster, magnetic Explore links, individual catalog reveals, and masked ritual imagery. Clicking the hero poster selects the next entry and keeps its product, purchase controls, background and model synchronized. Catalog photos crossfade to the next available product photo on mouse hover after that photo loads. Product-page photos animate when selected; all photos and the 3D thumbnail remain available.

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

The catalog query resolves custom.hero_* metafields directly from each storefront-visible product, including file references. No homepage_hero metaobject query or fallback remains. Product updates invalidate the shared shopify-storefront cache through the authenticated webhook; the catalog also revalidates after 300 seconds.
