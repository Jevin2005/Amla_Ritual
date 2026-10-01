# Product Reviews email editor references

Checked on 2026-09-26; verify current controls and entitlements in the account.

## Smart styling

Use [Smart styling templates](https://judge.me/help/en/articles/11887051-customizing-your-review-request-emails-smart-styling-templates)
for initial-request and reminder tabs. Initial body text can be changed on
Free, while subject, preheader, title, trigger changes, and reminder content
require Awesome. Smart templates do not currently support A/B testing.
Per-product assignments have additional eligibility requirements; inspect the
account before offering them. Do not change global language settings merely to
edit one template's copy.

## Custom and Legacy styling

[Custom styling templates](https://judge.me/help/en/articles/8385411-customizing-your-review-request-emails-custom-styling-templates)
use a desktop block editor. Creation and preview text are available on Free;
subject, layout, colors, and block customization have Awesome requirements.
Text blocks expose HTML mode. Do not promise unrestricted replacement of the
entire email HTML, or assume other notification editors provide the same mode.

[Global email styling](https://judge.me/help/en/articles/11462070-personalizing-your-email-templates-with-email-styling)
applies to Smart and relevant notification emails, but excludes Custom and
Legacy request templates. Inspect the impact of a global style change before
using it for a request limited to one template. Samples are sent to all Admin
notification addresses. Submitting a review from a sample link creates a real
review, so previewing a sample is not a safe synthetic submission test.

## Variables and delivery identity

Consult [supported variables](https://judge.me/help/en/articles/8385527-using-variables-in-your-review-request-emails)
for the selected email type. `buyer_first_name`, `product_title`, and `shop_name`
are examples. `product_href` carries review authorization; `unsubscribe_href`
supplies the unsubscribe destination. Do not treat a variable that produces
linked text as if it were a raw URL.

Use [sender configuration](https://judge.me/help/en/articles/8282420-setting-up-your-custom-sender-email-dkim-return-path-dmarc)
when a sender change is requested. A display name edit differs from changing the
sending domain, authentication records, or reply-to address. Preserve those
other settings unless the task includes them, and verify the monitored support
destination before promising that replies will reach the merchant.
