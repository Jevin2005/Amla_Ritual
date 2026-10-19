"use client";

import type { Product } from "@/domain/catalog/products";
import type { ComboCatalogEntry } from "@/domain/combo-catalog";
import { getComboArtworkFallback } from "@/domain/combo-artwork";
import { ProductCard } from "./product-card";

export function ComboCard({ entry, eagerImage = false, onPreview }: {
  entry: ComboCatalogEntry;
  eagerImage?: boolean;
  onPreview: () => void;
}) {
  if (entry.listingProduct) return <ProductCard product={entry.listingProduct} eagerImage={eagerImage} onPreview={onPreview} imageFallback={entry.combo.image.url} />;

  // Saved editorial pairings remain visible until their separate product is published.
  const { combo, count } = entry;
  const placeholder: Product = {
    slug: combo.id, name: combo.name, tags: ["combo"],
    subtitle: combo.ingredients, size: count ? `${count} jars` : "",
    featuredImage: combo.image, pricePaise: 0, availableForSale: false,
    availability: "Coming soon", accent: "var(--botanical)", accentSoft: "var(--beige)",
    botanical: "", plantPart: "", collectionNumber: "", shortDescription: "",
    metaDescription: "", ingredient: combo.ingredients, benefits: [], howTo: [],
    mixers: [], suitableFor: [], safety: [], storage: "", texture: "", concerns: [],
    ritualStep: "", experience: "", colorConsiderations: [], searchTerms: [], faqs: [],
  };
  return <ProductCard product={placeholder} eagerImage={eagerImage} onPreview={onPreview} unpublished imageFallback={getComboArtworkFallback(entry)} />;
}
