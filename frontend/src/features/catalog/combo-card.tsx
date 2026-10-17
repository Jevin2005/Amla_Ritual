"use client";

import { formatCurrency } from "@/domain/catalog/products";
import { getComboArtworkFallback } from "@/domain/combo-artwork";
import type { ComboCatalogEntry } from "@/domain/combo-catalog";
import { MediaImage } from "@/shared/ui/media-image";
import styles from "./combo-card.module.css";

export function ComboCard({
  entry,
  eagerImage = false,
  onPreview,
}: {
  entry: ComboCatalogEntry;
  eagerImage?: boolean;
  onPreview: () => void;
}) {
  const { combo, count, purchase } = entry;
  const previewLabel = `View ${combo.name} combo`;

  return (
    <article className={styles.card} data-collection-kind="combo">
      <div className={styles.photo}>
        <button type="button" className={styles.photoButton} onClick={onPreview} aria-label={previewLabel} aria-haspopup="dialog">
          <MediaImage
            src={combo.image.url}
            fallbackSrc={getComboArtworkFallback(entry)}
            alt={combo.image.altText || combo.name}
            fill
            loading={eagerImage ? "eager" : "lazy"}
            quality={eagerImage ? 82 : 75}
            sizes="(max-width: 900px) 50vw, 33vw"
            className={styles.image}
          />
        </button>
        <span className={styles.badge}>Combo <span aria-hidden="true">·</span> {count} {count === 1 ? "jar" : "jars"}</span>
      </div>
      <div className={styles.body}>
        <p className={styles.eyebrow}>Botanical pairing</p>
        <h3 className={styles.title}>{combo.name}</h3>
        <p className={styles.ingredients} title={combo.ingredients}>{combo.ingredients}</p>
        <div className={styles.purchase}>
          <p className={styles.priceLabel}>Combined total</p>
          <p className={styles.price}>{purchase.canShowTotal ? formatCurrency(purchase.total, purchase.currencyCode) : "Price unavailable"}</p>
          <p className={styles.availability} data-available={purchase.purchasable}>
            <span aria-hidden="true" />{purchase.purchasable ? "Available" : "Currently unavailable"}
          </p>
          <button type="button" className={styles.viewButton} onClick={onPreview} aria-label={previewLabel} aria-haspopup="dialog">
            <span>View combo</span><span aria-hidden="true">↗</span>
          </button>
        </div>
      </div>
    </article>
  );
}
