"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { formatCurrency, calculateDiscountPercent, calculateSavingsPaise, type Product } from "@/domain/catalog/products";
import { getProductReviewSummary } from "@/domain/reviews/custom-reviews";
import { StarRating } from "@/features/reviews/star-rating";
import { JudgemePreviewBadge } from "@/features/reviews/judgeme-preview-badge";
import { isJudgemeConfigured } from "@/lib/judgeme/config";
import { useStore } from "@/features/store/store-provider";
import styles from "./product-card.module.css";

export function ProductCard({
  product,
  eagerImage = false,
}: {
  product: Product;
  eagerImage?: boolean;
}) {
  const { addToCart, toggleWishlist, isWishlisted, track, content } = useStore();
  const wished = isWishlisted(product.slug);
  const reviewSummary = getProductReviewSummary(
    content.customerReviews,
    product.slug,
  );
  const currencyCode = product.currencyCode || "INR";
  const isAvailable = product.availableForSale !== false;
  const compareAtPrice =
    product.compareAtPricePaise &&
      product.compareAtPricePaise > product.pricePaise
      ? product.compareAtPricePaise
      : null;
  const discountPercent = calculateDiscountPercent(product.pricePaise, compareAtPrice);
  const savingsPaise = calculateSavingsPaise(product.pricePaise, compareAtPrice);
  const stockLabel = isAvailable
    ? product.availability || "In stock"
    : "Sold out";
  const style = {
    "--product-accent": product.accent,
    "--product-soft": product.accentSoft,
  } as CSSProperties;

  const imageUrl = product.featuredImage?.url || product.images?.[0]?.url || "/images/product-placeholder.svg";
  const imageAlt = product.featuredImage?.altText || product.name;
  const alternateImage = product.images?.find((image) => image.url !== imageUrl);
  const [loadedAlternate, setLoadedAlternate] = useState<string | null>(null);

  return (
    <article
      className="group/card @container relative flex flex-col self-start overflow-hidden rounded-[var(--radius-md)] bg-[var(--paper)] ring-1 ring-[var(--line)] [--product-accent:var(--botanical)] [--product-soft:var(--beige)] transition-[transform,box-shadow,ring-color] duration-[420ms] ease-[var(--ease)] hover:-translate-y-1.5 hover:shadow-[var(--shadow-float)] hover:ring-[color-mix(in_srgb,var(--product-accent)_34%,transparent)] max-[680px]:rounded-lg"
      style={style}
    >
      {/* Product listing photo area - Full Cover */}
      <div className="relative aspect-square w-full flex-none overflow-hidden bg-[var(--paper)]">
        {/* High-Conversion Discount Badge */}
        {discountPercent > 0 && (
          <span className="absolute top-3 left-3 z-[3] inline-flex items-center gap-1 rounded-full bg-[var(--forest)]/92 px-2.5 py-0.5 text-[0.68rem] font-bold tracking-wider text-[#dce7ad] shadow-[0_4px_14px_rgba(21,59,45,0.28)] backdrop-blur-md max-[680px]:top-2 max-[680px]:left-2 max-[680px]:px-2 max-[680px]:py-0.5 max-[680px]:text-[0.6rem]">
            <span>{discountPercent}% OFF</span>
          </span>
        )}
        {/* Wishlist button */}
        <button
          className={`absolute top-3 right-3 z-[3] grid size-10 place-items-center rounded-full border text-[1rem] shadow-[0_4px_16px_rgba(21,59,45,0.12)] backdrop-blur-md transition-[background,color,transform,border-color] duration-200 hover:scale-105 active:scale-95 max-[680px]:top-2 max-[680px]:right-2 max-[680px]:size-8 max-[680px]:text-[0.85rem] ${
            wished
              ? "border-[var(--product-accent)] bg-[var(--paper)] text-[var(--product-accent)]"
              : "border-white/80 bg-[rgba(255,252,245,0.88)] text-[var(--forest)] hover:border-[var(--product-accent)] hover:text-[var(--product-accent)]"
          }`}
          type="button"
          onClick={() => toggleWishlist(product.slug)}
          aria-label={`${wished ? "Remove" : "Save"} ${product.name} ${wished ? "from" : "to"} wishlist`}
          aria-pressed={wished}
        >
          <span aria-hidden="true">{wished ? "♥" : "♡"}</span>
        </button>

        {/* Full-Cover listing product photo */}
        <Link
          href={`/shop/${product.slug}`}
          className={styles.photoLink}
          data-alternate={Boolean(alternateImage && loadedAlternate === alternateImage.url)}
          onClick={() => track("select_item", { item_id: product.slug, placement: "product_card" })}
          aria-label={`View ${product.name}`}
        >
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            loading={eagerImage ? "eager" : "lazy"}
            quality={eagerImage ? 82 : 75}
            sizes="(max-width: 680px) 50vw, (max-width: 900px) 50vw, 33vw"
            className={styles.primary}
          />
          {alternateImage && (
            <Image
              src={alternateImage.url}
              alt=""
              aria-hidden="true"
              fill
              loading="lazy"
              onLoad={() => setLoadedAlternate(alternateImage.url)}
              sizes="(max-width: 900px) 50vw, 33vw"
              className={styles.alternate}
            />
          )}
        </Link>
      </div>

      {/* Info area */}
      <div className="flex flex-col border-t border-[var(--line)] px-5 pt-4 pb-4 max-[680px]:px-3.5 max-[680px]:pt-3 max-[680px]:pb-3.5 max-[420px]:px-2.5 max-[420px]:py-2.5">
        <p className="mb-1 text-[0.72rem] font-bold tracking-[0.14em] text-[var(--product-accent)] uppercase max-[680px]:mb-0.5 max-[680px]:text-[0.62rem] max-[680px]:tracking-[0.1em]">
          {product.ritualStep ? `${product.ritualStep} Ritual` : "Botanical hair care"}
        </p>

        <Link
          href={`/shop/${product.slug}`}
          className="mb-1 block [font-family:var(--font-display)] text-[clamp(1.45rem,1.75vw,1.95rem)] leading-[1.08] tracking-[-0.03em] text-[var(--forest)] transition-colors duration-200 hover:text-[var(--product-accent)] max-[680px]:mb-1 max-[680px]:text-[1.18rem] max-[420px]:text-[1.05rem]"
          onClick={() => track("select_item", { item_id: product.slug, placement: "product_title" })}
        >
          {product.name}
        </Link>

        <p className="mb-0 text-[0.82rem] leading-[1.5] text-[var(--muted)] max-[900px]:hidden">
          {[product.subtitle, product.size].filter(Boolean).join(" · ")}
        </p>

        {isJudgemeConfigured() ? (
          <Link
            href={`/shop/${product.slug}#customer-reviews`}
            className={`${styles.vendorReviews} mt-1 inline-flex items-center self-start rounded-sm py-1 transition-opacity hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--forest)]`}
            onClick={() =>
              track("select_item_reviews", {
                item_id: product.slug,
                placement: "product_card",
              })
            }
            aria-label={`Read reviews for ${product.name}`}
          >
            <JudgemePreviewBadge productId={product.id} />
          </Link>
        ) : reviewSummary ? (
          <Link
            href={`/shop/${product.slug}#customer-reviews`}
            className="mt-1 inline-flex items-center self-start rounded-sm py-1 transition-opacity hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--forest)]"
            onClick={() =>
              track("select_item_reviews", {
                item_id: product.slug,
                placement: "product_card",
              })
            }
            aria-label={`Read ${reviewSummary.reviewCount} reviews for ${product.name}`}
          >
            <StarRating
              average={reviewSummary.averageRating}
              count={reviewSummary.reviewCount}
              size="compact"
            />
          </Link>
        ) : null}

        <div className="mt-3 max-[680px]:mt-2.5">
          <div className="flex items-center justify-between gap-2 border-t border-[var(--line)] pt-3 max-[680px]:pt-2.5">
            <div>
              <span className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                <span className="[font-family:var(--font-display)] text-[1.32rem] font-bold leading-none text-[var(--forest)] max-[680px]:text-[1.12rem] max-[420px]:text-[1.02rem]">
                  {formatCurrency(product.pricePaise, currencyCode)}
                </span>
                {compareAtPrice && (
                  <>
                    <span
                      className="text-[0.78rem] text-[var(--muted)] line-through max-[680px]:text-[0.66rem]"
                      aria-label={`MRP ${formatCurrency(compareAtPrice, currencyCode)}`}
                    >
                      {formatCurrency(compareAtPrice, currencyCode)}
                    </span>
                    <span className="inline-flex items-center rounded-md bg-[#2d6a2f]/10 px-1.5 py-0.5 text-[0.68rem] font-bold text-[#235825] max-[680px]:text-[0.6rem]">
                      {discountPercent}% OFF
                    </span>
                  </>
                )}
              </span>
              <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                {savingsPaise > 0 && (
                  <span className="text-[0.66rem] font-semibold text-[#2d6a2f] max-[680px]:text-[0.58rem]">
                    Save {formatCurrency(savingsPaise, currencyCode)}
                  </span>
                )}
                <span
                  className={`block text-[0.64rem] font-bold tracking-[0.08em] uppercase max-[680px]:text-[0.55rem] ${
                    isAvailable ? "text-[var(--muted)]" : "text-[#9a3f3f]"
                  }`}
                >
                  {savingsPaise > 0 ? "·" : ""} {stockLabel}
                </span>
              </div>
            </div>
            <button
              type="button"
              className="grid size-11 place-items-center rounded-full border border-[var(--product-accent)] bg-[var(--product-accent)] text-[1.15rem] text-white shadow-[0_6px_18px_color-mix(in_srgb,var(--product-accent)_24%,transparent)] transition-[background,color,transform,box-shadow] duration-[240ms] ease-[ease] hover:-translate-y-0.5 hover:bg-[var(--forest)] hover:shadow-[0_10px_28px_rgba(21,59,45,0.2)] active:scale-95 disabled:cursor-not-allowed disabled:border-[var(--line-strong)] disabled:bg-[var(--line-strong)] disabled:text-[var(--muted)] disabled:shadow-none disabled:hover:translate-y-0 max-[680px]:size-9 max-[680px]:text-[0.95rem] max-[420px]:size-8.5 max-[420px]:text-[0.88rem]"
              onClick={() => addToCart(product.slug)}
              disabled={!isAvailable}
              aria-label={
                isAvailable
                  ? `Add ${product.name} to bag`
                  : `${product.name} is sold out`
              }
            >
              <span aria-hidden="true">＋</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
