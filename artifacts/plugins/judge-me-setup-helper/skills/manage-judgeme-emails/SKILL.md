---
name: manage-judgeme-emails
description: "Create, customize, apply, and verify Judge.me Product Reviews email templates, review-request timing, and reminders. Use for review-request email copy, branding, supported HTML blocks, sender settings, variables, and collection automation; not campaigns in the separate Judge.me Email app."
---

# Customize Judge.me review emails

Use [the live-action workflow](../setup-judgeme/references/live-actions.md) to
apply requested changes when connected. This skill targets review-request and
notification emails in Judge.me Product Reviews, not the separate marketing app.

## Inspect the actual template

Resolve the store, current plan, target template, active/default status, editor
type, and applicable language. Distinguish Smart, Custom, and Legacy styling;
the same control or HTML support cannot be assumed across them. Inspect the
initial-request and reminder content separately when relevant. Read only the
relevant guides in [email editor details](references/email-editors.md).

Reuse the user's existing copy, brand assets, and preparation documents when
available, checking whether their requested fields are supported. If the
request says only "customize my template", inspect the current template and
available branding first, then ask for any essential missing content or style.
Do not silently invent sender addresses, product claims, or delivery promises.

## Prepare and apply the template

Prepare a concrete field mapping: subject, preview text, heading, body, review
trigger/button, logo and colors, footer, and sender display name where requested.
Mark fields that are unchanged or unavailable rather than promising unsupported
customization. For a new template, clarify its intended role if the existing
context does not show whether it should be activated.

Read the selected email type's current supported variables. Review-request
templates use `{{ buyer_first_name }}`; reply notifications use
`{{ reviewer_first_name }}`. Verify the mapping for other notification types
instead of reusing request-template variables. Preserve generated product
review links and the functional unsubscribe
link. Do not replace a tokenized review link with a plain product URL. For
headless routes, read the included
[headless reference](../setup-judgeme/references/headless-storefront.md).

When custom HTML is requested, use only the HTML controls the actual editor
supports. A text block's HTML mode is not a full-document email editor. Keep
email markup compatible with common email clients, preserve provider-required
elements, and inspect the rendered preview before saving. If the requested
design cannot be represented in that editor or plan, explain the specific limit
and implement the supported portion.

When access exists, edit the actual fields, save, and reopen the same template
to verify persistence. If the user asked to replace the active template, also
verify which template is active/default and any product/language assignments.
A saved inactive template has not changed the email customers receive.

## Configure collection timing and reminders

Read the current [automatic requests guide](https://judge.me/help/en/articles/8379844-automatic-review-request-emails)
and [reminder guide](https://judge.me/help/en/articles/11792628-automatic-review-request-reminder-emails).
Inspect trigger, delay, delivery time, store timezone, domestic/international/POS
categories, reminder count and interval, and relevant suppression settings.
Update the requested categories and verify the result in settings or scheduled
requests. A Fulfilled trigger is tied to full fulfillment, so inspect order
state when troubleshooting missing requests.

Explain any plan-gated reminder or scheduling control. Distinguish changing
future automation from sending historical/manual requests; do not trigger the
latter as an incidental part of template customization. If the user requests a
manual or bulk send, resolve recipients/orders, exclusions, duplicate-request
state, and requested timing before using the documented operation.

## Preview and report

Preview the saved template, including mobile layout, variable rendering,
logo/image loading, review destination, sender, reply-to, and unsubscribe.
For a requested sample email, inspect the current Admin notification recipient
list before sending; the sample can go to everyone on that list. If that exceeds
the requested recipients, resolve it before sending or changing the list.
Record a send confirmation separately from received-email verification.

Do not submit a dummy review through the sample email: sample links can create
real reviews. Validate the destination and form without submitting fabricated
content. Report which fields were applied, which template is active, what was
previewed or delivered, and the exact remaining access or plan limit.
