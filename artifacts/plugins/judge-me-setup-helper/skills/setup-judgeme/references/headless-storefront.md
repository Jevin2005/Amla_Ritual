# Judge.me on a headless storefront

Documentation checked on 2026-09-26. Recheck current documentation and the
merchant's account before making changes.

## Choose a supported widget

Judge.me's [platform-independent widgets guide](https://judge.me/help/en/articles/8394958-platform-independent-widgets)
describes externally hosted storefronts with Shopify as the backend. This
feature requires the Awesome plan. The Review Widget is supported in its legacy
version; the new Review Widget is not supported in platform-independent mode.
Do not migrate a headless store to the new widget based on theme instructions.

The documented setup is to enable platform-independent widgets in Judge.me's
Advanced settings, save, and use the resulting store-specific script and
supported widget markup. Inspect the current script and installation before
adding another copy. A frontend feature flag or public token alone does not
prove the account is enabled or entitled to use this feature.

## Integrate with the actual application

Inspect the project's product loader, product page, existing review components,
script loading, and configuration examples. Read local framework documentation
when required by the repository. Avoid editing unrelated catalog or checkout
behavior.

Use the actual product identifier required by the selected Judge.me interface.
Resolve differences between Shopify product IDs, GraphQL IDs, product handles,
and Judge.me IDs from documentation and observed data; do not interchange them
or invent a mapping. Preserve the correct product context when navigating
between products without a full page reload.

Load scripts and initialize widgets according to the documented integration
and installed framework. Check direct page loads and client navigation for
duplicate scripts, stale product reviews, and duplicate review forms. Inspect
network responses and rendered state to distinguish loading failures from
products with no reviews.

If a custom API path is needed, consult the [Judge.me API documentation](https://judge.me/api/docs)
for the specific endpoint, token type, permissions, and product identifier.
Keep private tokens in server-side secret configuration, never public frontend
variables, generated browser code, logs, or plugin files. Do not invent MCP
endpoints or assume a Shopify token authenticates Judge.me. A custom API
implementation is a separate technical choice, not proof that platform-independent
widgets are enabled.

## Preserve review request destinations

Inspect the generated link and the actual product route. A storefront using
`/shop/<handle>` may need different routing from Shopify's `/products/<handle>`.
Changing only the hostname is not enough to establish that the destination works.

The [email variables documentation](https://judge.me/help/en/articles/8385527-using-variables-in-your-review-request-emails)
describes `product_href` as carrying an authorized review token. Preserve the
provider's query parameters, fragment, review context, and selected rating
through any supported URL mapping. Never replace a generated review URL with
a plain product URL and assume verification still works. Inspect available
settings or obtain the merchant's existing support guidance if routing is not
documented; do not invent a dashboard control.

Validate final destinations and form behavior in the real environment. If a
custom form sends reviews, handle provider failures truthfully and verify
ingestion from the provider response or dashboard. Saving to local storage is
not remote submission. Only a genuine, authorized review should be used for a
production submission test.
