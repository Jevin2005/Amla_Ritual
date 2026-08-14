import type { CSSProperties } from "react";
import type { Product } from "@/lib/products";

type ProductJarProps = {
  product: Product;
  size?: "small" | "medium" | "large" | "hero";
  decorative?: boolean;
  className?: string;
};

export function ProductJar({
  product,
  size = "medium",
  decorative = false,
  className = "",
}: ProductJarProps) {
  const style = {
    "--jar-accent": product.accent,
    "--jar-accent-soft": product.accentSoft,
  } as CSSProperties;

  return (
    <div
      className={`product-jar product-jar--${size} ${className}`}
      style={style}
      role={decorative ? undefined : "img"}
      aria-hidden={decorative ? true : undefined}
      aria-label={
        decorative
          ? undefined
          : `NatureMist ${product.name} ritual jar preview; final packaging artwork to be supplied`
      }
    >
      <span className="product-jar__shadow" />
      <span className="product-jar__lid">
        <span />
      </span>
      <span className="product-jar__glass">
        <span className="product-jar__powder" />
        <span className="product-jar__label">
          <span className="product-jar__brand">NatureMist</span>
          <span className="product-jar__rule" />
          <span className="product-jar__name">{product.name.replace(" Powder", "")}</span>
          <span className="product-jar__botanical">Botanical powder</span>
          <span className="product-jar__number">Ritual {product.collectionNumber}</span>
        </span>
        <span className="product-jar__shine" />
      </span>
    </div>
  );
}

