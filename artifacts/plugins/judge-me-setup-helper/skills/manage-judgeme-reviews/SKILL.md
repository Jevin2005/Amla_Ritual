---
name: manage-judgeme-reviews
description: "Analyze and manage Judge.me Product Reviews data, including customer replies, moderation, genuine-review imports, exports, and review-operation troubleshooting. Use authenticated Judge.me tools or dashboard access for requested actions, not the separate Judge.me Email marketing app."
---

# Manage Judge.me reviews

Follow [the live-action workflow](../setup-judgeme/references/live-actions.md).
Resolve the store and intended reviews/products before acting. Distinguish
read-only analysis, drafts, published replies, visibility changes, and imports.
Execute the specific requested action when access and authorization exist.

## Analyze reviews

Fetch or export the requested scope with pagination and filters. Report the
covered period, products, count, and whether the data is complete or sampled.
Separate customer statements from verified product facts, and link findings to
actual review records without exposing unnecessary customer contact details.

If using the [Product Reviews API](https://judge.me/help/en/articles/8409180-using-judge-me-api),
check the current endpoint schema and required identifier type. Its guide warns
that an invalid product ID can return all store reviews. Validate the product
mapping and returned product context before analysis or changes. Do not assume
API results contain replies or video data; inspect the fields and use another
supported view when necessary. Do not use review creation as a reversible test.

## Reply to customers

Read the complete review and existing replies, then draft a response grounded
in the merchant's actual policies. Distinguish public replies from private
messages and resolve the intended mode when unclear. Follow the
[reply documentation](https://judge.me/help/en/articles/8375131-replying-to-reviews):
private replies are sent immediately and cannot be recalled; public replies
may also notify the reviewer. A request for a draft does not authorize posting.

If sending or publishing is requested, verify the review/recipient and content,
perform that operation, and read back the result. Do not infer a refund, order
change, or compensation offer from a review-response task.

## Moderate reviews

Use the current [publishing and hiding guide](https://judge.me/help/en/articles/8368681-publishing-and-hiding-reviews)
and inspect each review's source and state. Apply the requested moderation
criteria and record the relevant reason. Do not hide low ratings merely to
present a misleading picture. Pending, hidden, archived, and deleted are
different states; confirm the final state actually achieved.

Source-specific restrictions matter: imported reviews have different deletion
options from other reviews, and Shop-synced reviews have additional limits.
Do not replace an unsupported action with a destructive one. For batch work,
resolve the exact selection first, preserve outcomes for individual records,
and report any failures without repeating successful mutations.

## Import and export

Use the official [import template guide](https://judge.me/help/en/articles/8415368-importing-reviews-using-judge-me-template)
and [export guide](https://judge.me/help/en/articles/8236266-exporting-reviews).
Import only genuine existing reviews from the user's authorized source. Map
columns and product identifiers, check duplicates and dates, and determine
publication behavior before uploading. Imports can publish by default even
under manual moderation. Imported records are not proof of verified purchases;
preserve truthful provenance. Do not fabricate reviews or verification badges.

For exports, honor the requested scope and destination and check row counts.
Split large exports according to current limits. Avoid export/reimport into the
same store as an editing shortcut because it can duplicate reviews.

Verify imported counts and product associations in Judge.me, distinguish partial
success from completion, and report any records needing correction. When access
is missing, prepare a validated mapping or response draft and state the exact
remaining action without claiming it has happened.
