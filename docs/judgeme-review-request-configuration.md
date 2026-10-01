# Amla Ritual review request configuration

Prepared on 2026-09-26. **Pending application in Judge.me; not a completion record.**

## Verification status

- Shopify connector is available. Its store timezone is IST and checkout domain is `checkout.naturemist.shop`.
- No browser is available to this session. Judge.me settings, current app plan, template activation, and scheduled requests could not be inspected or changed. Plugin discovery did not find a relevant Judge.me connector.
- No sample email has been sent or inspected. The requested sample recipient is awaiting confirmation; the Shopify contact email is not proof of Judge.me's notification recipients.
- Local source supports `/shop/<Shopify product handle>`. This does not establish the deployed behavior.
- Live HTTP checks were inconclusive: the web reader could not access the storefront; direct HTTPS checks failed certificate trust/connection validation in this environment. This is not evidence that the public site is down.
- Only this preparation document was added. No application code, Shopify settings, DNS, billing, or customer-facing automation was changed.

## Email fields ready to apply

Open Judge.me > Settings (or Review Collection) > Email templates > Smart Email Template > Edit.

| Field | Target value | Availability / action |
| --- | --- | --- |
| Sender name | Amla Ritual Care | Email templates > Edit sender settings; verify availability in account |
| Subject | How is your Amla Ritual feeling, {{ buyer_first_name }}? 🌿 | Awesome plan |
| Preheader | Take 30 seconds to share your botanical ritual experience. | Awesome plan |
| Heading | Your Ritual, In Your Words | Awesome plan |
| Initial body | Copy below | Free plan |
| Review trigger | In email form | Changing trigger requires Awesome |
| Button text | Share Your Experience | Check the selected trigger's button controls; documented with the paid Button trigger |
| Footer | Have questions about your hair routine? Reply directly to this email. | Custom footer requires Awesome; append to body on Free |

Judge.me's supported first-name variable is `{{ buyer_first_name }}`. Use it in place of the requested `{{ customer_first_name }}`. [Variable reference](https://judge.me/help/en/articles/8385527-using-variables-in-your-review-request-emails)

Body, retaining the requested wording with the supported variable:

> Hi {{ buyer_first_name }},
>
> It has been a couple of weeks since your bottle of {{ product_title }} arrived. We hope it has brought a calming, nourishing pause to your weekly hair care ritual.
>
> Botanical care is deeply personal. Your honest feedback helps our team refine our formulations and helps others discover mindful hair wellness.
>
> How has your experience been so far?

Free-plan body addition:

> Have questions about your hair routine? Reply directly to this email.

The Smart editor distinguishes clickable **Stars** from the complete **In email form**. A star click is not proof of a completed review. Keep the existing supported trigger on Free; an Awesome subscription is needed to reproduce the requested paid fields. No upgrade or trial has been started. [Smart template controls](https://judge.me/help/en/articles/11887051-customizing-your-review-request-emails-smart-styling-templates)

Set the display name without changing the sender address or DNS. Verify Reply-To reaches the monitored support inbox before using the support note. [Sender settings](https://judge.me/help/en/articles/8282420-setting-up-your-custom-sender-email-dkim-return-path-dmarc)

## Timing ready to apply

In Request scheduling, inspect each applicable shipping-order category:

| Setting | Target | Status |
| --- | --- | --- |
| Order trigger | Fulfilled | Supported on Free; not yet set/verified |
| Initial wait | 12 days | Supported on Free; not yet set/verified |
| Custom delivery time | Proposed: 19:00 IST (Asia/Kolkata) | A fixed time inside the requested 18:00–20:30 window; not applied |
| Reminder count | 1 | Requires Awesome; not applied |
| Reminder delay | 6 days after initial request, only while unreviewed | Requires Awesome; not applied |

Judge.me starts the Fulfilled delay when the order is fully fulfilled; partial fulfillment does not start it. It documents a single fixed send time in the store timezone, not a configurable start/end window. Verify the resulting scheduled date/time in the request dashboard. [Scheduling](https://judge.me/help/en/articles/8379844-automatic-review-request-emails)

For an account already entitled to reminders, configure one reminder at six days and verify that completed reviews suppress it. On Free this part remains unavailable. [Reminder controls](https://judge.me/help/en/articles/11792628-automatic-review-request-reminder-emails)

## Headless compatibility checks still required

The intended final product destination is `https://www.naturemist.shop/shop/{{ product_handle }}`.

The official documentation reviewed does not establish a self-service setting that rewrites both the storefront hostname and `/products/` into `/shop/`. Verify this capability in the actual Judge.me account or with Judge.me support before declaring the requirement satisfied. A setting for the hostname alone is insufficient.

Judge.me's `{{ product_href }}` includes an authorized review token. Preserve the generated token, rating, query string, and fragment through any supported URL mapping; replacing it with a plain product URL may lose verified-review behavior. [Link variables](https://judge.me/help/en/articles/8385527-using-variables-in-your-review-request-emails)

Settings > Collection flow offers an **In-store review form** destination for email links on Free, requiring the Review Widget on the destination page. Its presence does not itself verify compatibility with this headless installation. [Collection flow](https://judge.me/help/en/articles/11419250-customizing-your-review-form)

Local audit findings:

- `frontend/src/app/shop/[slug]/page.tsx` and `frontend/src/lib/shopify/storefront.ts` resolve Shopify handles through the storefront product loader.
- `frontend/next.config.ts` has no `/products/:handle` redirect. No equivalent application route was found.
- The example redirect in `docs/shopify-domain-redirect-guide.md` drops search parameters and fragments. Its deployment status is unknown.
- `judgeme-review-widget.tsx` and `product-reviews.tsx` can both react to `?write_review=true`, opening overlapping forms.
- `write-review-modal.tsx` currently ignores remote submission errors and reports local success after saving to localStorage. A local success message does not prove Judge.me received the review or will suppress a reminder. This existing implementation needs correction before it is used as the email submission destination.

These integration files already contain work in progress. They were inspected without modification.

## Sample email acceptance checks

Once admin access and recipient details are available:

1. Save and reopen the template and schedule; record the actual values and any plan-locked fields.
2. Inspect Judge.me's admin notification recipients, then use **Send sample email**. This control sends to that notification list.
3. Inspect the received subject, first-name substitution, preview, body, logo, product image, footer/support note, and Reply-To on desktop and mobile.
4. Inspect product image/title links, CTA, and star destinations. Product links must finish on the correct `www.naturemist.shop/shop/<handle>` page, retain the review request context, open the supported form, and retain any selected star rating.
5. Preserve the provider's functional unsubscribe link; it is not a product link.
6. Do not submit a fabricated review from the sample. Judge.me saves sample submissions as real reviews. Confirm real review ingestion and reminder suppression using an authorized genuine submission.

Custom footer availability and sample behavior are documented in [Email styling](https://judge.me/help/en/articles/11462070-personalizing-your-email-templates-with-email-styling).
