import Image from "next/image";
import type { CSSProperties } from "react";
import type { Product } from "@/domain/catalog/products";

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

  const sizeClasses = {
    small: "h-[135px] w-[88px]",
    medium: "h-[245px] w-[160px]",
    large: "h-[345px] w-[225px]",
    hero: "h-[300px] w-[195px] [animation:jar-float_5s_ease-in-out_infinite]",
  }[size];

  const labelSizeClasses = {
    small: "text-[9px]",
    medium: "text-[15px]",
    large: "text-[20px]",
    hero: "text-[18px]",
  }[size];

  const imageSizes = {
    small: "88px",
    medium: "160px",
    large: "225px",
    hero: "195px",
  }[size];

  if (product.featuredImage?.url) {
    const image = product.featuredImage;

    return (
      <div
        className={`relative flex-none [filter:drop-shadow(0_26px_22px_rgba(21,59,45,0.18))] ${sizeClasses} ${className}`}
        aria-hidden={decorative ? true : undefined}
      >
        <Image
          src={image.url}
          alt={decorative ? "" : image.altText || `${product.name} product`}
          width={image.width}
          height={image.height}
          sizes={imageSizes}
          className="h-full w-full object-contain"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative flex-none [--jar-accent:var(--botanical)] [--jar-accent-soft:var(--beige)] [filter:drop-shadow(0_26px_22px_rgba(21,59,45,0.18))] ${sizeClasses} ${className}`}
      style={style}
      role={decorative ? undefined : "img"}
      aria-hidden={decorative ? true : undefined}
      aria-label={
        decorative
          ? undefined
          : `NatureMist ${product.name} ritual jar preview; final packaging artwork to be supplied`
      }
    >
      <span className="absolute -bottom-[5%] left-[10%] h-[8%] w-4/5 rounded-[50%] bg-[rgba(21,59,45,0.22)] blur-[10px]" />
      <span className="absolute top-[1%] left-[11%] z-[3] h-[16%] w-[78%] overflow-hidden rounded-[22%_22%_8%_8%] border border-white/28 [background:repeating-linear-gradient(90deg,transparent_0_5px,rgba(255,255,255,0.08)_5px_6px),linear-gradient(90deg,#102a1e,#31543f_42%,#0d2418)] [box-shadow:inset_0_3px_3px_rgba(255,255,255,0.13),0_6px_10px_rgba(0,0,0,0.18)]">
        <span className="absolute right-[5%] bottom-[10%] left-[5%] h-px bg-white/25" />
      </span>
      <span className="absolute right-[7%] bottom-[5%] left-[7%] z-[2] h-[82%] overflow-hidden border border-white/62 [border-radius:14%_14%_18%_18%/9%_9%_12%_12%] [background:linear-gradient(90deg,rgba(255,255,255,0.6),transparent_13%,transparent_84%,rgba(255,255,255,0.22)),color-mix(in_srgb,var(--jar-accent)_58%,#574f36)] [box-shadow:inset_12px_0_20px_rgba(255,255,255,0.2),inset_-12px_0_20px_rgba(0,0,0,0.12),0_10px_22px_rgba(0,0,0,0.11)]">
        <span className="absolute [inset:30%_0_0] [background:radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.09)_0_1px,transparent_1.5px)_0_0/7px_7px,linear-gradient(color-mix(in_srgb,var(--jar-accent)_90%,#332f23),color-mix(in_srgb,var(--jar-accent)_70%,#2b2a22))]" />
        <span className={`absolute top-[21%] right-[7%] left-[7%] z-[3] flex h-[61%] flex-col items-center justify-center rounded-[8%] border border-[color-mix(in_srgb,var(--jar-accent)_34%,white)] p-[8%] text-center text-[var(--forest)] [background:linear-gradient(155deg,rgba(255,255,255,0.94),rgba(245,241,232,0.97)),var(--ivory)] [box-shadow:0_4px_12px_rgba(21,59,45,0.08)] ${labelSizeClasses}`}>
          <span className="font-serif text-[0.74em] font-medium tracking-[-0.025em]">NatureMist</span>
          <span className="my-[8%] h-px w-[15%] bg-[var(--jar-accent)]" />
          <span className="max-w-[95%] font-serif text-[1.08em] leading-[0.9] font-semibold tracking-[-0.04em] text-[var(--jar-accent)] italic">{product.name.replace(" Powder", "")}</span>
          <span className="mt-[6%] text-[0.29em] font-bold tracking-[0.11em] uppercase">Botanical powder</span>
          <span className="absolute bottom-[7%] text-[0.25em] font-bold tracking-[0.12em] uppercase">Ritual {product.collectionNumber}</span>
        </span>
        <span className="absolute top-[7%] bottom-[10%] left-[8%] z-[5] w-[7%] rounded-[99px] bg-white/25 blur-[2px]" />
      </span>
    </div>
  );
}
