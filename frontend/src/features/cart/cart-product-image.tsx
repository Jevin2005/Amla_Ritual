"use client";

import Image from "next/image";
import { useState } from "react";
import type { Product } from "@/domain/catalog/products";
import type { CartItem } from "@/features/store/store-provider";

export function CartProductImage({ item, product }: { item: CartItem; product?: Product }) {
  const [failedOptimizations, setFailedOptimizations] = useState<string[]>([]);
  const [failedImages, setFailedImages] = useState<string[]>([]);
  const sources = [...new Set([
    item.image?.url,
    product?.featuredImage?.url,
    ...(product?.images || []).map((image) => image.url),
    "/images/product-placeholder.svg",
  ].filter((url): url is string => Boolean(url)))];
  const src = sources.find((url) => !failedImages.includes(url));
  if (!src) return <span role="img" aria-label={item.productName}>🌿</span>;
  const direct = failedOptimizations.includes(src) || src.endsWith(".svg");

  return (
    <Image
      key={`${src}-${direct}`}
      src={src}
      alt={item.image?.altText || item.productName}
      fill
      sizes="112px"
      className="object-contain"
      unoptimized={direct}
      onError={() => {
        // Retry the original CDN image if the optimization service is unavailable.
        if (direct) setFailedImages((failed) => [...failed, src]);
        else setFailedOptimizations((failed) => [...failed, src]);
      }}
    />
  );
}
