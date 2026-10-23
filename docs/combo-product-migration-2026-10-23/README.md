# Botanical combo migration — 23 October 2026

Status: **prepared locally; no deployment or deletion**. The owner requested keeping the old entries until deployment.

## Completed

- Saved the original eight entries, section settings, definitions and product metadata in [backup.json](backup.json).
- Created public-read product metafields `custom.combo_products` (list of product references, 2–6), `custom.combo_ingredients` and `custom.combo_caption`.
- Copied all 24 values from the matching old entries and verified exact equality.
- Added `combo_products` to the existing `botanical_combos` section definition and saved the eight product IDs in the previous order.
- Updated the local Storefront query, mapping and catalog to use product-owned data. No runtime query reads the singular type or its entries.
- Replaced the old mutation-based seeder with read-only verification.

Validation: 56 focused tests, TypeScript, changed-file ESLint and the production Next.js build passed. Live Storefront verification returned all eight products in order, with all members and independent prices intact. The local production browser preview showed all three pages and correct desktop/mobile purchase dialogs; the 390 px mobile viewport had no horizontal overflow.

The old `botanical_combo` definition (ID `24054956218`), its eight entries, the section's old `combos` field and the old product linking tags remain intact. No prices or inventory were changed.

## After deployment

1. Deploy the prepared storefront to the existing Vercel project serving `naturemist.shop`. The separate Sites preview does not update this domain.
2. Verify all eight combos, their order, member details and prices on the live homepage and shop. Confirm the deployed source uses `combo_products` and no longer reads the old entries. Run the read-only verification script with the deployment's Storefront configuration.
3. Refresh this backup if any old content changed since migration. Copy any subsequent merchant edits before removing it.
4. Check for any other definitions, applications or storefronts referencing the singular type before deletion. Remove the old `combos` field from the plural section definition; retain `combo_products` and the section itself.
5. Delete only the singular **Botanical combo** definition and its entries. Shopify definition deletion cascades, so review its affected references first.
6. Remove only the obsolete `combo:gid://shopify/Metaobject/...` tags from the migrated products. Keep their exact `combo` tags and all other tags.
7. Recheck the live section and shop. Update this record with the deployment and deletion results.

Rollback before deletion: the original entries, tags and section field are still present, so the previous deployed code continues to work. After deletion, restoring the old data requires recreating Shopify entries and updating references to their new IDs; retain the backup and prefer rolling forward.
