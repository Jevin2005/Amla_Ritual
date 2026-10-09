# Ingredient clarity images in Shopify

The homepage ingredient section uses three synchronized image galleries: **Meet the plant**, **Make it simply**, and **Keep it honest**. Desktop arranges them as an editorial collage; phones stack them into an arched plant image, a preparation card, and a green lifestyle panel. The wording remains real page text rather than being baked into an uploaded poster.

## 1. Field definitions

Extend the existing merchant-owned **Storefront content** definition (`storefront_content`). Keep its Storefront access set to `PUBLIC_READ` and the **Homepage settings** entry (`main`) active. Add these optional fields before entering their values:

| Key | Shopify type | Image usage |
| --- | --- | --- |
| `ingredient_plant_images` | `list.file_reference`, images only, maximum 8 | Plant/ingredient photograph gallery |
| `ingredient_preparation_images` | `list.file_reference`, images only, maximum 8 | Mixing/preparation photograph gallery |
| `ingredient_lifestyle_images` | `list.file_reference`, images only, maximum 8 | Product/lifestyle photograph gallery |
| `ingredient_background` | `file_reference`, images only | Section background on desktop and default background on phones |
| `ingredient_mobile_background` | `file_reference`, images only | Optional phone background override |
| `ingredient_botanical` | `file_reference`, images only | Decorative botanical artwork; a transparent image works well |

These fields belong to the existing shared content definition. They do not require a new product or a new metaobject entry.

## 2. Choose and save images

Open **Content → Metaobjects → Storefront content → Homepage settings**. Upload images to **Content → Files**, add useful alt text, then select those files in each gallery or artwork field. Drag gallery images into the desired order and save the entry. Select only the photograph or artwork for each field; the website creates the layout and captions.

The first valid image appears first. Two or more images in a gallery enable the Shery gooey transition. All three galleries share one timer and advance together. Each gallery keeps its own order and wraps at the end of its own list; it never borrows another gallery's images. Removing a reference from the entry does not delete the file from Shopify.

Use a landscape plant image, a square or portrait preparation photograph, and a portrait lifestyle photograph with the main subject near the centre. The responsive frames use a cover crop without stretching. Shopify stores the originals and supplies the resized image variants. Common raster image formats supported by Shopify can be selected; video, documents, and 3D files are not image fields.

## 3. Storefront loading and fallbacks

The Storefront API reads all six fields from `storefront_content/main`, including the file's image URL, alt text, width, and height. Content refreshes within approximately two minutes; an authenticated Shopify webhook can refresh it sooner. Deploy the website changes to make the new layout available.

Empty, deleted, or non-image references fall back independently: the plant gallery uses the bundled amla basket photograph (`ingredient-plant-v1.png`), the preparation gallery uses the bundled amla mixing photograph (`naturemist-ritual.png`), and the lifestyle gallery uses the bundled bathroom photograph (`ingredient-lifestyle-v1.png`). The botanical artwork has a bundled transparent engraving (`ingredient-botanical-v1.png`). Missing backgrounds use the section's built-in paper styling; an omitted phone background uses the desktop background. The legacy `ritual_poster` and `ritual_posters` fields remain available for compatibility.

If a gallery image fails to load, the website retries the original Shopify file before showing the gallery's bundled fallback. A failed selected file cannot leave its WebGL layer covering that fallback. Other galleries and working slide images keep their normal animation behavior.

## Animation settings

The existing `ritual_poster_gooey`, `ritual_poster_autoplay`, `ritual_poster_interval`, `ritual_poster_strength`, and `ritual_poster_config` fields still control these galleries. The shared slideshow changes all three photographs every **6 seconds**, exactly matching the saved image duration. Set **Ingredient clarity — image duration (seconds)** to change this interval for all three panels. The 2× pace multiplier applies only to the transition effect, giving a slower 2.64-second animation at the default website timing without changing the interval. Website animation and cursor controls continue to apply.

All three photos use the same Shery organic bloom with a longer reveal phase. The default phase weights are `durationOut: 2.4` and `durationIn: 0.6`; values saved in the Shopify effect configuration override these defaults. If a Shopify resized texture fails to load, the animation retries the original image before falling back to the regular photo.

Each photo has compact, subdued navigation and pause controls with no hover enlargement or highlight. Touch controls retain larger tap areas and keyboard focus remains visible. The extra “Next photos” badge is omitted. In local development, a small gear opens the existing Shery editor; the editor is not included in production.

Hovering or focusing any gallery, or opening its Shery editor, pauses the whole group. Automatic changes also pause when the entire section leaves the viewport or the browser tab is hidden. Previous/next and pause/resume controls in any panel control all three photographs together; a manual change starts a fresh full interval. Reduced-motion preferences disable autoplay and WebGL effects. Previous/next controls remain available. A WebGL or texture failure leaves the ordinary image visible.

## Homepage hero media

The top homepage hero continues to use each enabled product's `custom.hero_poster`, `custom.hero_background`, and `custom.hero_model`, with its existing slide order and animation settings. The separate `home_hero_poster` field is the social-preview fallback. Manage those fields using [the homepage hero guide](homepage-hero-admin.md); ingredient image changes do not alter product hero slides.

## Installed image setup

The six fields are created and populated in Shopify. The plant gallery starts with the new amla basket photograph and then the existing amla harvest image. The lifestyle gallery starts with the new bathroom jar photograph and then the existing sunlit alcove jar image. Preparation starts with the existing amla mixing photograph and then the new overhead preparation photograph (`ingredient-preparation-v2.png`). All three lists currently contain two images. Both backgrounds use the new ivory paper texture, and the botanical field uses the new transparent amla engraving.

The original hero and animation settings were preserved. Local copies of the generated assets and their exact prompts are listed in [ingredient-image-prompts.md](ingredient-image-prompts.md). These are generated reference-matching photographs rather than crops of the supplied poster designs.
