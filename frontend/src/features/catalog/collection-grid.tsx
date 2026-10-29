"use client";

import { useCallback, useState } from "react";
import type { CollectionEntry } from "@/domain/collection-catalog";
import { getComboArtworkFallback } from "@/domain/combo-artwork";
import { ComboPreview } from "@/widgets/home/combo-preview";
import { ComboCard } from "./combo-card";
import { ProductCard } from "./product-card";
import styles from "./collection-grid.module.css";

export function CollectionGrid({ entries, eagerImages = false }: { entries: CollectionEntry[]; eagerImages?: boolean }) {
  const [previewId, setPreviewId] = useState<string | null>(null);
  const closePreview = useCallback(() => setPreviewId(null), []);
  const selected = entries.find((entry) => entry.kind === "combo" && entry.id === previewId);
  const preview = selected?.kind === "combo" ? selected.combo : null;

  return (
    <div className={styles.collection}>
      <div className={styles.grid}>
        {entries.map((entry, index) => entry.kind === "product" ? (
          <ProductCard key={entry.id} product={entry.product} eagerImage={eagerImages && index < 3} />
        ) : (
          <ComboCard key={entry.id} entry={entry.combo} eagerImage={eagerImages && index < 3} onPreview={() => {
            setPreviewId(entry.id);
          }} />
        ))}
      </div>
      {preview && <ComboPreview
        key={preview.combo.id}
        title={preview.combo.name}
        ingredientLabel={preview.combo.ingredients}
        image={preview.listingProduct?.featuredImage?.url || preview.combo.image.url}
        imageFallback={getComboArtworkFallback(preview)}
        products={preview.products}
        expectedProductCount={preview.count}
        listingProduct={preview.listingProduct}
        purchaseUnavailable={!preview.listingProduct}
        onClose={closePreview}
      />}
    </div>
  );
}
