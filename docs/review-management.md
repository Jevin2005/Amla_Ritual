# Review management

The storefront supports two approved review formats:

- written reviews with a 1–5 star rating
- video stories with a poster image, testimonial, and optional playable video

Every review must use the exact Shopify product handle in `productSlug` / `product_slug`. For example, a product at `/shop/wildcrafted-amla-powder` uses `wildcrafted-amla-powder`. This exact link is what prevents one product's ratings or stories from appearing on another product card or product page.

Written review ratings are used for the average and count shown on the matching product card and product page. Video stories do not change the numeric rating.

## Option 1: Manage approved reviews in Shopify

This is the recommended day-to-day workflow after Shopify is connected. It lets a store manager publish content without changing application code.

### Written review definition

In Shopify Admin, create a metaobject definition with type `customer_review`, Storefront access `PUBLIC_READ`, and the publishable capability enabled. Add these fields using the exact keys below:

| Key | Type | Required | Notes |
| --- | --- | --- | --- |
| `author` | Single-line text | Yes | Display name approved by the customer |
| `rating` | Integer | Yes | Whole number from 1 through 5 |
| `quote` | Multi-line text | Yes | Approved review text |
| `product_slug` | Single-line text | Yes | Exact Shopify product handle |
| `role` | Single-line text | No | For example `Customer`; do not claim verification here |
| `verified` | Boolean | No | Enable only after the purchase has actually been verified |
| `product_name` | Single-line text | No | Friendly product label shown on all-reviews cards |
| `headline` | Single-line text | No | Short review heading |
| `date` | Date | No | Publication/review date |
| `location` | Single-line text | No | Only with the reviewer's consent |
| `avatar` | File reference (image) | No | Optional approved customer photo |
| `tag` | Single-line text | No | One of `Hair Fall`, `Scalp Health`, `Shine & Softness`, or `Colour & Graying` |
| `featured_on_home` | Boolean | No | Use this to curate the home page; when any entries set this field, only entries set to `true` are eligible there |

Create an entry, fill the required fields, select **Active/Published**, and save. The review will appear on `/reviews` and only the product whose handle matches `product_slug`. Eligible featured entries can also appear in the home community section. Its rating contributes only to that product's card and product-page summary. Allow up to approximately two minutes for a Shopify metaobject edit to refresh when an immediate webhook refresh is unavailable.

### Video review definition

Create a second metaobject definition with type `video_review`, Storefront access `PUBLIC_READ`, and the publishable capability enabled:

| Key | Type | Required | Notes |
| --- | --- | --- | --- |
| `creator` | Single-line text | Yes | Display name approved by the customer |
| `title` | Single-line text | Yes | Accessible video title |
| `image` | File reference (image) | Yes | Poster/thumbnail shown before playback |
| `product_slug` | Single-line text | Yes | Exact Shopify product handle |
| `testimonial` | Multi-line text | Yes | Approved supporting quote |
| `duration` | Single-line text | No | For example `0:42` |
| `product_tag` | Single-line text | No | Friendly product label |
| `video` | File reference (video or generic file) | No | Shopify-hosted MP4 is preferred |
| `video_url` | URL | No | Alternative HTTPS YouTube, Vimeo, or supported Shopify CDN video URL |
| `captions` | File reference (generic `.vtt` file) | No | Captions for a directly uploaded video |
| `captions_url` | URL | No | Alternative Shopify CDN `.vtt` captions URL |
| `captions_language` | Single-line text | No | BCP 47 language code such as `en` or `hi` |
| `captions_label` | Single-line text | No | Human-readable track label such as `English` or `Hindi` |
| `transcript` | Multi-line text | No | Accessible text transcript for any video story |
| `featured_on_home` | Boolean | No | Curates whether the story is eligible for the home page |

Use either `video` or `video_url`; you do not need both. The player accepts YouTube, Vimeo, a Shopify-hosted MP4/WebM/OGG, or an application-local video path. Unsupported third-party embeds are intentionally rejected. Add captions or a transcript before publishing a playable story; directly uploaded video should have a WebVTT captions file. A story without a playable URL can still be published as a poster-and-testimonial story and is labelled “Video coming soon” in the dialog.

The home page intentionally shows at most four video stories and three written reviews to stay fast. `/reviews` remains the complete published collection, and the Shopify loader follows pagination so product totals are not limited to the first API page.

## Option 2: Manage approved reviews in the project file

For a zero-cost manual workflow, edit:

`frontend/src/domain/reviews/custom-reviews.ts`

The file contains empty `customReviews` and `customVideoReviews` arrays plus copy-ready field examples. Add only authentic, approved customer material. Keep IDs unique and use an ISO date such as `2026-08-25`.

For a local reviewer image:

1. Put the image in `frontend/public/images/avatars/`.
2. Set `avatarImage` to a path such as `/images/avatars/customer-name.jpg`.
3. Set `productSlug` to the exact product handle.
4. Save the file and run the checks below.
5. Perform your normal manual source-control and deployment workflow.

For a local video poster or file, place it under `frontend/public/` and use a leading-slash path. YouTube and Vimeo HTTPS URLs can be used directly in `videoUrl`.
For a local direct video, add a `.vtt` captions file under `frontend/public/` and set `captionsUrl`, `captionsLanguage`, and `captionsLabel`, or supply an approved `transcript`. A direct video without either safe captions or a transcript is deliberately treated as a non-playable story. Use `featuredOnHome: true` to curate a home-page entry. If at least one local entry defines `featuredOnHome`, entries without `true` remain available on `/reviews` and product pages but are omitted from the home page.

## Before publishing

- Confirm the customer approved their name, quote, photo, and video for public use.
- Set `verified: true` only when the purchase was genuinely verified.
- Confirm the exact product handle; a typo intentionally produces no product-level match.
- Use a whole-number written rating from 1 through 5.
- Preview mobile and desktop layouts.
- Confirm every playable story has captions on its host or an accurate transcript; direct videos should include a WebVTT captions track.
- Run `npm.cmd run lint --workspace=frontend`, `npm.cmd run typecheck --workspace=frontend`, and `npm.cmd run build --workspace=frontend` from the project root.

There is no fake browser-only “submit review” form. Adding public customer submissions later requires authentication, durable storage, spam protection, moderation, consent handling, and a trustworthy purchase-verification process. A Shopify review provider can supply that workflow; its API data can then be mapped into these same product-specific components.
