# Judge.me widget branding

Prepared on 26 September 2026 for NatureMist's headless storefront. The Judge.me account/dashboard was unavailable, so the dashboard targets below are **prepared, not saved**. Frontend CSS changes are local and pending deployment. The account's current plan and widget version have not been confirmed.

## Storefront palette

These values come from `frontend/src/app/globals.css` and the existing review styling, rather than the older palette in the README.

| Use | Value |
| --- | --- |
| Main accent, headings, buttons | Forest `#153b2d` |
| Button hover | Forest dark `#0b281d` |
| Secondary accent | Botanical `#527744` |
| Stars | Existing review gold `#d99420` |
| Page background | Ivory `#f5f1e8` |
| Form surfaces and button text | Paper `#fffcf5` |
| Main text | Charcoal `#20251f` |
| Secondary text | Muted `#5f665e` |
| Verified-buyer badge background | Moss `#dce4cf` |
| Body and buttons | Plus Jakarta Sans |
| Headings | Playfair Display |

Use pill buttons, softly rounded fields and media, and the storefront's existing spacing. The frontend overrides are in `frontend/src/features/reviews/judgeme.css`, imported by `frontend/src/app/layout.tsx`; these can take precedence over dashboard colors.

## Dashboard targets for the legacy Review Widget

Apply only after confirming account access, the active widget version, and the available plan settings. Do not start a trial, upgrade the plan, or switch widget versions as part of branding.

| Legacy color setting | Target | Documented availability |
| --- | --- | --- |
| Star color | `#d99420` | Free |
| Review filter color | `#153b2d` | Awesome |
| Pagination color | `#153b2d` | Awesome |
| Write a review button text | `#fffcf5` | Awesome |
| Write a review button background | `#153b2d` | Awesome |

Judge.me documents these fields in [Customizing the Review Widget (legacy version)](https://judge.me/help/en/articles/8420649-customizing-the-review-widget-legacy-version). Its [platform-independent widget guide](https://judge.me/help/en/articles/8394958-platform-independent-widgets) states that headless installation requires the Awesome plan and the legacy Review Widget. These requirements do not establish the current account's plan or widget version.

No review content, widget layout/version, collection automation, or moderation changes are part of this branding work.

## Verification still pending

- Local validation: the Next.js production build and TypeScript check passed. Shopify catalog fetching was unavailable during the build, so this does not validate live product data. CSS syntax also parsed successfully.
- Save and reload the authorized dashboard color settings, if available on the current plan.
- Deploy the local frontend CSS changes through the existing storefront deployment workflow.
- Inspect the real rendered product review widget and product-card/detail rating badges on desktop and mobile; confirm font, colors, spacing, sorting, pagination, and keyboard focus.
- Confirm readable numeric rating text accompanies the existing gold stars; gold on paper is about 2.5:1 contrast, so the stars should not be the only way the rating is conveyed.
- Open and close the real review form and inspect its fields and media controls without submitting a review. Confirm narrow screens have no clipped controls or horizontal overflow.

Local styling checks alone do not verify the live Judge.me widget or its account settings.
