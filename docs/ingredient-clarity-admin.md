# Ingredient section controls in Shopify

Open **Shopify Admin → Content → Metaobjects → Ingredient clarity → Homepage ingredient section** (handle `main`).

[Open the installed Shopify entry](https://admin.shopify.com/store/amla-ritual/content/metaobjects/entries/ingredient_clarity/431726788794).

## Fixed text and rotating posters

Define the section heading and each panel's **Fixed title** and **Fixed description** once. The text stays visible and does not change when a poster advances. The current wording is preserved.

Use **01 / 02 / 03 - Posters in display order** to replace or reorder each panel's images. The first selected image appears first; the rest play in their saved order and then repeat. Keep corresponding images at the same list position if all three panels should show the same botanical together. Each list supports up to eight images and wraps independently.

Use **Automatically change posters** to enable playback and **image duration (seconds)** to set its interval. The existing setting is six seconds. Save the entry after editing. There is no title or description to repeat for individual posters.

This one entry manages the whole homepage ingredient collage on phones and desktop. The website builds the responsive curves, captions and animations from the saved content; upload individual photos rather than a finished poster containing text.

## Definition and initial values

The merchant-owned `ingredient_clarity` definition contains 33 fields and has public Storefront read access. Its `main` entry must remain **Active**. Use **Show ingredient section = false** to hide the section.

The complete definition and initial entry values are versioned in [ingredient-clarity-schema.json](ingredient-clarity-schema.json). Setup order is: create the definition, upsert the initial entry, then retrieve it to verify. This uses a merchant-owned definition because the Shopify Admin and the independent storefront share the content. The shared `storefront_content` entry already contains hero and motion settings; a dedicated definition keeps this section within [Shopify's 40-field limit](https://shopify.dev/docs/apps/build/metaobjects/metaobject-limits).

Existing photo references and animation settings are copied into the new entry. Existing shared fields remain for compatibility. Once the dedicated entry exists, edit the ingredient fields **here**, rather than their legacy copies under Storefront content.

## Photos, backgrounds and artwork

Upload files through **Content → Files**, add descriptive alt text, then select them in this entry. Save after replacing or reordering selections.

| Admin field | Key | How to use it |
| --- | --- | --- |
| meet the plant images | `ingredient_plant_images` | 1–8 plant photos in display order |
| preparation images | `ingredient_preparation_images` | 1–8 preparation photos in display order |
| lifestyle images | `ingredient_lifestyle_images` | 1–8 product/lifestyle photos in display order |
| desktop background | `ingredient_background` | Section texture; also used on phones when their override is empty |
| mobile background | `ingredient_mobile_background` | Optional phone-specific background |
| botanical decoration | `ingredient_botanical` | Transparent botanical artwork used in both decorative positions |
| Show botanical decoration | `ingredient_show_botanical` | Hide or show the decorative artwork |

All six media fields accept Shopify images only. Each gallery is independent, supports up to eight images, and follows its saved order. Two or more images enable photo changes. Removing a reference does not delete its file.

Landscape plant photos, square/portrait preparation photos and portrait lifestyle photos work well. Keep subjects near the center: responsive frames crop with cover behavior rather than stretching. Shopify supplies resized variants and image alt text.

Empty galleries use their own bundled fallback photo. Empty artwork removes the decoration. Empty backgrounds reveal the paper background color; an empty phone background falls back to the desktop image. If a resized animated texture fails, the original Shopify image is retried before the ordinary fallback photo is shown.

## Wording, visibility and button

| Admin field | Key |
| --- | --- |
| Show ingredient section | `ingredient_enabled` |
| Brand name | `ingredient_wordmark` |
| Small heading | `ingredient_eyebrow` |
| Main heading | `ingredient_heading` |
| Italic heading | `ingredient_heading_emphasis` |
| 01 — Plant title / description | `ingredient_plant_title` / `ingredient_plant_text` |
| 02 — Preparation title / description | `ingredient_preparation_title` / `ingredient_preparation_text` |
| 03 — Lifestyle title / description | `ingredient_lifestyle_title` / `ingredient_lifestyle_text` |
| Show ingredient promise button | `ingredient_button_enabled` |
| Button text | `ingredient_button_label` |
| Button link | `ingredient_button_href` |

Use short headings and captions to preserve the reference layout. Shopify enforces character limits. Cleared text falls back to the original wording; use the explicit visibility switches to hide the section, decoration or button.

The link accepts a website path such as `/our-story` or `/our-story#promise`, or a complete `https://` address. Invalid links fall back to `/our-story`. Text renders as text, not HTML. Gallery accessibility labels follow the saved titles.

## Colors

Use Shopify's color pickers:

| Admin field | Key | Initial color |
| --- | --- | --- |
| Paper background color | `ingredient_paper_color` | `#f8f4e9` |
| Text color | `ingredient_ink_color` | `#292d1c` |
| Accent and desktop button color | `ingredient_accent_color` | `#af603c` |
| Phone arch background color | `ingredient_panel_color` | `#28331c` |
| Phone arch text color | `ingredient_panel_text_color` | `#f8f4e9` |

Background photos cover the paper color. Clear the background images to show a solid-color section. The paper color also controls the first caption card and preparation frame. Keep text and background colors readable.

## Animation

The following settings now live in this same ingredient entry:

| Admin field | Key | Initial behavior |
| --- | --- | --- |
| automatically change images | `ritual_poster_autoplay` | On |
| image duration (seconds) | `ritual_poster_interval` | 6 seconds; allowed 3–30 |
| gooey effect | `ritual_poster_gooey` | On |
| gooey strength | `ritual_poster_strength` | 1; allowed 0.5–1.5 |
| Shery preset (JSON) | `ritual_poster_config` | `{}`; optional advanced effect preset |
| Photo transition pace | `ingredient_transition_pace` | 2; allowed 0.5–4; higher is slower |

All three galleries share one timer and advance together every six seconds at the initial setting. Each wraps independently through its own list. Photo transition pace affects the animation duration, not the slideshow interval; 2 gives the current slow effect. Default reveal weights are `durationOut: 2.4` and `durationIn: 0.6`, overridden by an explicit saved Shery preset.

The compact navigation and pause controls operate all three photos together. Hovering or focusing any gallery, or opening its local Shery editor, pauses the group. Offscreen sections and hidden browser tabs pause automatically. Reduced-motion preferences disable autoplay and WebGL effects; previous/next controls stay available. The middle photo retains its mouse hover effect.

Global website animation and cursor switches remain in **Storefront content → Homepage settings** and take priority over the section effects.

## Loading and rollout

The Storefront API reads `ingredient_clarity/main` including all image URLs, alt text and dimensions. The website refreshes content on its roughly two-minute revalidation cycle; the existing authenticated Shopify webhook can refresh it sooner.

The updated frontend must be deployed before the live website uses the new section controls. The Shopify definition and entry can be installed first without changing the older deployed frontend.

If the dedicated entry is absent, deleted or Draft, the frontend uses the previous ingredient media and animation fields from `storefront_content/main` with default wording. To intentionally hide the section, keep the entry Active and switch **Show ingredient section** off.

The homepage hero remains separate. Its product media, slide order, 3D and poster settings are documented in [homepage-hero-admin.md](homepage-hero-admin.md). Generated ingredient assets and prompts are documented in [ingredient-image-prompts.md](ingredient-image-prompts.md).
