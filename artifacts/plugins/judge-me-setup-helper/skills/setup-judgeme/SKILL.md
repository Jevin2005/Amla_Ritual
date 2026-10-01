---
name: setup-judgeme
description: "Install, customize, or troubleshoot Judge.me review widgets, branding, and review collection settings on a Shopify store or headless storefront backed by Shopify. Use for Judge.me setup requests, rather than general Shopify administration or bulk review moderation."
---

# Set up Judge.me

Help the merchant make Judge.me work with their existing store, design, and
review collection flow. This plugin provides instructions, not a Judge.me app
connection. For live work, read [working in Judge.me](references/live-actions.md)
and perform the user's requested changes through available authenticated tools
or browser access. Do not stop at instructions when the required access and
authorization already exist.

For a complete review-system setup, cover the requested parts of collection,
email templates, storefront display, and review management. Inspect what is
already configured, keep a short list of concrete changes, and verify each
saved result. A request for a complete system is not permission to change every
available setting. Use `manage-judgeme-emails` for detailed template/schedule
work and `manage-judgeme-reviews` for replies, moderation, imports, exports, and
review analysis; both skills are included in this plugin.

## Establish the installation path

Use existing project and store context before asking questions. Determine the
intended store, whether Judge.me is installed, its current plan, and whether the
storefront uses a Shopify theme, a page builder, or a separate application.
Distinguish a Shopify store domain from a custom storefront hostname. Inspect
the active widget version and any existing widget code before adding another.

Read current official documentation for the selected path. Menu labels, plan
entitlements, and widget support can change; do not treat old project setup
notes as proof. Ask only for information that changes the implementation.

Before editing code, explain the affected files and intended changes in simple
words. Follow the repository's instructions and installed framework guidance.
Preserve unrelated work and reuse the store's actual design tokens.

## Install and place widgets

For a Shopify theme, use the current [getting started guide](https://judge.me/help/en/articles/8389728-getting-started-with-judge-me)
and [Review Widget installation guide](https://judge.me/help/en/articles/11424925-adding-the-review-widget-on-your-product-page).
Check whether installation is already complete. On a supported Online Store 2.0
theme, verify the Judge.me app embed and product-template app block are enabled
and saved. Check all relevant product templates, rather than assuming one
template covers every product. For vintage themes or page builders, follow the
documented integration for that environment instead of applying app-block steps.

Place a [Star Rating Badge](https://judge.me/help/en/articles/11508932-adding-the-star-rating-badge-on-your-product-page)
near the product title when requested, and the full Review Widget in the
appropriate product section. Editor sample reviews are preview content and do
not establish that real reviews exist.

For a headless or externally hosted storefront, read
[the headless reference](references/headless-storefront.md) before changing
widget versions, scripts, product identifiers, or review links.

## Match the store's branding

Use the settings for the actual [new widget](https://judge.me/help/en/articles/12460582-customizing-the-review-widget-new-version)
or [legacy widget](https://judge.me/help/en/articles/8420649-customizing-the-review-widget-legacy-version).
Prefer supported controls for colors, text, layout, and review form options.
Use small, scoped CSS overrides when needed, based on inspected markup for the
installed version. Preserve existing custom CSS before a widget migration;
selectors and styling do not necessarily carry over.

Check mobile width, legible star colors, text contrast, focus visibility, and
the review form. Preserve accurate review attribution and verified-review
indicators. Do not fabricate reviews or customer media to fill an empty state.

If a requested feature is plan-locked, explain the actual requirement and any
supported alternative. Do not activate a paid plan or trial without the user's
authorization for that billing change.

## Configure review collection when requested

Judge.me's [automatic review requests guide](https://judge.me/help/en/articles/8379844-automatic-review-request-emails)
documents that installation enables review request emails. Inspect their status
and tell the merchant about that behavior as part of installation. Check the
trigger, delay, order categories, and store timezone before changing scheduling;
preserve existing automations outside the request's scope.

Use the current [email styling guide](https://judge.me/help/en/articles/11462070-personalizing-your-email-templates-with-email-styling)
and [supported variables](https://judge.me/help/en/articles/8385527-using-variables-in-your-review-request-emails)
for requested branding or copy changes. Verify field availability on the
current plan, keep functional unsubscribe links, and use the documented variable
names. Do not infer a sample-email recipient from the Shopify contact email.
Prepare the template and inspect recipients before sending a sample; send only
when the user's request authorizes it. A general setup request does not authorize
a campaign, a bulk send, or contacting Judge.me support on the user's behalf.

## Verify and report

After applying authorized settings, reopen them to verify persistence. Preview
the intended product page on mobile and desktop. Check the actual product's
rating, review list, badge-to-widget navigation, and form behavior. When there
are no real reviews, verify the empty state rather than inventing data.

For code changes, run checks appropriate to the modified files and distinguish
local verification from live verification. A form opening, HTTP attempt, or
local success notice is not proof of review ingestion. Do not submit a fake
review to test a production store.

Report what was changed, what was verified, and any specific remaining access,
plan, or deployment step. Never report installation, publication, delivery, or
review submission as complete without evidence from that operation.
