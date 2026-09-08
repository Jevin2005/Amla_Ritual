import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { globalSafety } from "@/domain/catalog/products";
import { getProductReviewSummary } from "@/domain/reviews/custom-reviews";
import {
  ProductCard,
  ProductDetailActions,
  ProductGallery,
  ProductReviewsSection,
} from "@/features/catalog";
import { StarRating } from "@/features/reviews/star-rating";
import { getStorefront, getStorefrontProduct } from "@/lib/shopify/storefront";
import { getPublicSiteUrl } from "@/lib/site-url";

export const dynamicParams = true;

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

function productDescriptionBlocks(value: string) {
  return value
    .replace(/\r\n?/g, "\n")
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const lines = block
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
      const isNumberedList =
        lines.length > 0 && lines.every((line) => /^\d+[.)]\s+/.test(line));
      const isBulletedList =
        lines.length > 0 && lines.every((line) => /^[-*\u2022]\s+/.test(line));

      return isNumberedList || isBulletedList
        ? {
          kind: isNumberedList
            ? ("ordered-list" as const)
            : ("unordered-list" as const),
          items: lines.map((line) =>
            line.replace(/^(?:[-*\u2022]|\d+[.)])\s+/, ""),
          ),
        }
        : { kind: "paragraph" as const, text: lines.join("\n") };
    });
}

export async function generateMetadata(
  props: ProductPageProps,
): Promise<Metadata> {
  const { slug } = await props.params;
  const product = await getStorefrontProduct(slug);
  if (!product) notFound();

  const image = product.featuredImage;

  return {
    title: `${product.name} | 100% Pure Botanical | NatureMist`,
    description: product.metaDescription,
    alternates: { canonical: `/shop/${slug}` },
    openGraph: {
      type: "website",
      siteName: "NatureMist",
      title: `${product.name} | Pure Botanical Powder`,
      description: product.metaDescription,
      url: `/shop/${slug}`,
      images: image
        ? [
          {
            url: image.url,
            width: image.width,
            height: image.height,
            alt: image.altText || product.name,
          },
        ]
        : undefined,
    },
  };
}

export default async function ProductPage(props: ProductPageProps) {
  const { slug } = await props.params;
  const [storefront, product] = await Promise.all([
    getStorefront(),
    getStorefrontProduct(slug),
  ]);
  if (!product) notFound();

  const concernMatches = storefront.products.filter(
    (item) =>
      item.slug !== product.slug &&
      item.concerns.some((concern) => product.concerns.includes(concern)),
  );
  const related = [
    ...concernMatches,
    ...storefront.products.filter(
      (item) =>
        item.slug !== product.slug &&
        !concernMatches.some((match) => match.slug === item.slug),
    ),
  ].slice(0, 6);
  const fullDescription =
    product.description?.trim() || product.shortDescription.trim();
  const descriptionBlocks = productDescriptionBlocks(fullDescription);
  const reviewSummary = getProductReviewSummary(
    storefront.content.customerReviews,
    product.slug,
  );

  const siteUrl = getPublicSiteUrl();
  const productUrl = `${siteUrl}/shop/${product.slug}`;
  const imageUrl = product.featuredImage?.url
    ? product.featuredImage.url.startsWith("http")
      ? product.featuredImage.url
      : `${siteUrl}${product.featuredImage.url}`
    : undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `NatureMist ${product.name}`,
    description: product.metaDescription || product.shortDescription,
    brand: { "@type": "Brand", name: "NatureMist" },
    category: "Botanical hair care powder",
    image: imageUrl,
    url: productUrl,
    offers: {
      "@type": "Offer",
      price: (product.pricePaise / 100).toFixed(2),
      priceCurrency: product.currencyCode || "INR",
      availability: product.availableForSale
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: productUrl,
      seller: {
        "@type": "Organization",
        name: "NatureMist",
        url: siteUrl,
      },
    },
    additionalProperty: [
      { "@type": "PropertyValue", name: "Botanical", value: product.botanical },
      { "@type": "PropertyValue", name: "Plant part", value: product.plantPart },
    ],
  };

  return (
    <main id="main-content" className="w-full pb-16 max-[680px]:pb-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      {/* Breadcrumbs Navigation */}
      <nav
        className="mx-auto flex w-full max-w-[1440px] items-center gap-2 px-[clamp(20px,4.5vw,72px)] pt-5 pb-3 text-[0.66rem] font-medium uppercase tracking-[0.08em] text-[var(--muted)] max-[680px]:px-3.5 max-[680px]:pt-3 max-[680px]:pb-2"
        aria-label="Breadcrumb"
      >
        <Link href="/" className="hover:text-[var(--forest)] transition-colors">
          Home
        </Link>
        <span className="text-[var(--line)]">/</span>
        <Link href="/shop" className="hover:text-[var(--forest)] transition-colors">
          Shop
        </Link>
        <span className="text-[var(--line)]">/</span>
        <span className="text-[var(--forest)] font-semibold truncate">{product.name}</span>
      </nav>

      {/* ── Main Amazon-Style 2-Column Showcase ── */}
      <section
        className="mx-auto grid w-full max-w-[1440px] grid-cols-[1fr_1.08fr] items-start gap-[clamp(32px,5vw,72px)] px-[clamp(20px,4.5vw,72px)] py-2 max-[960px]:grid-cols-1 max-[960px]:gap-6 max-[680px]:px-3"
        style={{
          "--pdp-accent": product.accent,
          "--pdp-soft": product.accentSoft,
        } as React.CSSProperties}
      >
        {/* Left Column: Interactive Product Gallery */}
        <div className="w-full min-w-0 sticky top-[calc(var(--header-height)+16px)] max-[960px]:relative max-[960px]:top-0">
          <ProductGallery product={product} />
        </div>

        {/* Right Column: Aligned Amazon-Style Details & Buy Box */}
        <div className="w-full min-w-0 flex flex-col gap-4">
          {/* Product Headline */}
          <div>
            <h1 className="m-0 [font-family:var(--font-display)] text-[clamp(2rem,3.8vw,3.4rem)] font-normal leading-[0.98] tracking-[-0.035em] text-[var(--forest)] max-[680px]:text-[1.85rem]">
              {product.name}
            </h1>
            <p className="mt-1.5 mb-0 [font-family:var(--font-display)] text-[1.05rem] italic text-[var(--botanical)] max-[680px]:text-[0.92rem]">
              {product.subtitle}
            </p>
            {reviewSummary && (
              <Link
                href="#customer-reviews"
                className="mt-2 inline-flex min-h-8 items-center rounded-sm py-1 transition-opacity hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--forest)]"
                aria-label={`Jump to ${reviewSummary.reviewCount} reviews for ${product.name}`}
              >
                <StarRating
                  average={reviewSummary.averageRating}
                  count={reviewSummary.reviewCount}
                  size="default"
                />
              </Link>
            )}
          </div>

          {/* Short Description */}
          <p className="m-0 text-[0.82rem] leading-[1.6] text-[var(--muted)] max-[680px]:text-[0.74rem] max-[680px]:leading-[1.45]">
            {product.shortDescription}
          </p>
          <Link
            href="#product-description"
            className="-mt-2 inline-flex min-h-8 items-center self-start py-1 text-[0.72rem] font-bold uppercase tracking-[0.08em] text-[var(--botanical)] underline underline-offset-4 transition-colors hover:text-[var(--forest)]"
          >
            Read full description
          </Link>

          {/* Amazon-Style Specifications Table */}
          <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-4 shadow-2xs max-[680px]:p-3 max-[680px]:rounded-xl">
            <span className="mb-2.5 block text-[0.72rem] font-bold uppercase tracking-[0.14em] text-[var(--botanical)]">
              Botanical Specifications
            </span>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[0.8rem] max-[680px]:grid-cols-1 max-[680px]:gap-y-1.5 max-[680px]:text-[0.74rem]">
              <div className="flex items-baseline justify-between border-b border-[var(--line)] pb-1.5 gap-2">
                <span className="text-[var(--muted)] shrink-0">Botanical Name:</span>
                <span className="font-semibold text-[var(--forest)] italic text-right">{product.botanical}</span>
              </div>
              <div className="flex items-baseline justify-between border-b border-[var(--line)] pb-1.5 gap-2">
                <span className="text-[var(--muted)] shrink-0">Plant Part:</span>
                <span className="font-semibold text-[var(--forest)] text-right">{product.plantPart}</span>
              </div>
              <div className="flex items-baseline justify-between border-b border-[var(--line)] pb-1.5 gap-2">
                <span className="text-[var(--muted)] shrink-0">Net Quantity:</span>
                <span className="font-semibold text-[var(--forest)] text-right">{product.size}</span>
              </div>
              <div className="flex items-baseline justify-between border-b border-[var(--line)] pb-1.5 gap-2">
                <span className="text-[var(--muted)] shrink-0">Formulation:</span>
                <span className="font-semibold text-[var(--forest)] text-right">Shade-Dried Powder</span>
              </div>
            </div>
          </div>

          {/* About This Item (Key Benefits) */}
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-4 shadow-2xs max-[680px]:p-3 max-[680px]:rounded-xl">
            <span className="mb-2.5 block text-[0.72rem] font-bold uppercase tracking-[0.14em] text-[var(--forest)]">
              About this item
            </span>
            <ul className="m-0 space-y-1.5 pl-0 list-none text-[0.82rem] text-[var(--muted)] max-[680px]:text-[0.76rem]">
              {product.benefits.map((b) => (
                <li key={b} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-[#529d38] font-bold">✓</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Main Purchase Actions (Inline & Seamless) */}
          <div className="pt-1">
            <ProductDetailActions product={product} />
          </div>

          {/* Preparation & Storage Accordions */}
          <div className="space-y-2">
            <details className="group rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-4 transition-all max-[680px]:p-3 max-[680px]:rounded-xl" open>
              <summary className="flex cursor-pointer list-none items-center justify-between [font-family:var(--font-display)] text-[1.12rem] font-normal text-[var(--forest)] [&::-webkit-details-marker]:hidden max-[680px]:text-[1rem]">
                <span>How to prepare & apply</span>
                <span className="text-base text-[var(--botanical)] transition-transform duration-300 group-open:rotate-45">＋</span>
              </summary>
              <ol className="mt-2.5 mb-0 space-y-1.5 pl-4 text-[0.82rem] text-[var(--muted)] max-[680px]:text-[0.75rem]">
                {product.howTo.map((step) => (
                  <li key={step} className="list-decimal leading-relaxed">
                    {step}
                  </li>
                ))}
              </ol>
            </details>

            <details className="group rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-4 transition-all max-[680px]:p-3 max-[680px]:rounded-xl">
              <summary className="flex cursor-pointer list-none items-center justify-between [font-family:var(--font-display)] text-[1.12rem] font-normal text-[var(--forest)] [&::-webkit-details-marker]:hidden max-[680px]:text-[1rem]">
                <span>Storage & Safety Guidelines</span>
                <span className="text-base text-[var(--botanical)] transition-transform duration-300 group-open:rotate-45">＋</span>
              </summary>
              <div className="mt-2.5 text-[0.82rem] text-[var(--muted)] leading-relaxed max-[680px]:text-[0.75rem]">
                <p className="m-0 font-medium text-[var(--forest)]">{product.storage}</p>
                <p className="mt-1.5 mb-0 text-[0.74rem] text-[var(--muted)]">
                  {globalSafety}
                </p>
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* Full Shopify product description, preserved without truncation. */}
      <section
        id="product-description"
        className="mx-auto mt-14 w-full max-w-[1440px] scroll-mt-24 px-[clamp(20px,4.5vw,72px)] max-[680px]:mt-10 max-[680px]:px-3"
        aria-labelledby="product-description-title"
      >
        <div className="grid grid-cols-[minmax(180px,0.42fr)_minmax(0,1.58fr)] gap-[clamp(28px,5vw,72px)] border-t border-[var(--line)] pt-10 max-[760px]:grid-cols-1 max-[760px]:gap-4 max-[680px]:pt-7">
          <div>
            <p className="mb-1 text-[0.62rem] font-bold uppercase tracking-[0.2em] text-[var(--botanical)]">
              Complete product details
            </p>
            <h2
              id="product-description-title"
              className="m-0 [font-family:var(--font-display)] text-[clamp(1.7rem,3vw,2.45rem)] font-normal leading-[1.05] text-[var(--forest)]"
            >
              Product description
            </h2>
          </div>
          <div className="max-w-[78ch] space-y-4 rounded-3xl border border-[var(--line)] bg-[var(--paper)] p-[clamp(20px,3vw,34px)] text-[0.86rem] leading-[1.85] text-[var(--muted)] shadow-[0_10px_32px_rgba(21,59,45,0.04)] max-[680px]:rounded-2xl max-[680px]:text-[0.76rem] max-[680px]:leading-[1.72]">
            {descriptionBlocks.map((block, index) =>
              block.kind === "unordered-list" ? (
                <ul key={`list-${index}`} className="m-0 space-y-1.5 pl-5">
                  {block.items.map((item, itemIndex) => (
                    <li
                      key={`${item}-${itemIndex}`}
                      className="pl-1 marker:text-[var(--botanical)]"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              ) : block.kind === "ordered-list" ? (
                <ol
                  key={`ordered-list-${index}`}
                  className="m-0 space-y-1.5 pl-5"
                >
                  {block.items.map((item, itemIndex) => (
                    <li
                      key={`${item}-${itemIndex}`}
                      className="pl-1 marker:font-bold marker:text-[var(--botanical)]"
                    >
                      {item}
                    </li>
                  ))}
                </ol>
              ) : (
                <p
                  key={`paragraph-${index}`}
                  className="m-0 whitespace-pre-line break-words"
                >
                  {block.text}
                </p>
              ),
            )}
          </div>
        </div>
      </section>

      <ProductReviewsSection
        product={product}
        reviews={storefront.content.customerReviews}
        videoReviews={storefront.content.videoReviews}
      />

      {/* ── Product-Specific FAQ Section ── */}
      <section className="mx-auto mt-12 w-full max-w-[1440px] px-[clamp(20px,4.5vw,72px)] max-[680px]:px-3" aria-labelledby="product-faq-title">
        <div className="mb-4 flex items-end justify-between max-[680px]:flex-col max-[680px]:items-start max-[680px]:gap-0.5">
          <div>
            <p className="mb-0.5 text-[0.64rem] font-bold uppercase tracking-[0.2em] text-[var(--botanical)] max-[680px]:text-[0.52rem]">
              Questions & Answers
            </p>
            <h2
              id="product-faq-title"
              className="m-0 [font-family:var(--font-display)] text-[clamp(1.6rem,3vw,2.4rem)] font-normal text-[var(--forest)] max-[680px]:text-[1.25rem]"
            >
              Frequently Asked Questions
            </h2>
          </div>
          <span className="text-[0.64rem] text-[var(--muted)] max-[680px]:text-[0.56rem]">
            Authentic Ayurvedic answers
          </span>
        </div>

        <div className="rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-4 shadow-xs max-[680px]:p-2.5 max-[680px]:rounded-xl">
          {product.faqs.map((faq, index) => (
            <details
              className="group border-b border-[var(--line)] py-2.5 last:border-b-0"
              key={faq.question}
              open={index === 0}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between [font-family:var(--font-display)] text-[1.05rem] font-normal text-[var(--forest)] [&::-webkit-details-marker]:hidden max-[680px]:text-[0.88rem]">
                <div className="flex items-center gap-2.5">
                  <span className="text-[0.6rem] font-bold text-[var(--botanical)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{faq.question}</span>
                </div>
                <span className="text-sm text-[var(--botanical)] transition-transform duration-300 group-open:rotate-45">
                  ＋
                </span>
              </summary>
              <p className="mt-2 mb-0 pl-6 text-[0.76rem] leading-[1.55] text-[var(--muted)] max-[680px]:pl-4 max-[680px]:text-[0.68rem]">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* ── Related Botanicals Carousel ("Customers also bought") ── */}
      <section className="mx-auto mt-12 w-full max-w-[1440px] px-[clamp(20px,4.5vw,72px)] max-[680px]:px-3" aria-labelledby="related-title">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="mb-0.5 text-[0.64rem] font-bold uppercase tracking-[0.2em] text-[var(--botanical)] max-[680px]:text-[0.52rem]">
              Explore More Botanicals
            </p>
            <h2
              id="related-title"
              className="m-0 [font-family:var(--font-display)] text-[clamp(1.6rem,3vw,2.4rem)] font-normal text-[var(--forest)] max-[680px]:text-[1.25rem]"
            >
              Complete Your Ritual Set
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-[0.66rem] font-bold uppercase tracking-wider text-[var(--botanical)] hover:text-[var(--forest)] transition-colors max-[680px]:text-[0.58rem]"
          >
            View All ↗
          </Link>
        </div>

        {/* Desktop 3-Column Grid */}
        <div className="grid grid-cols-3 gap-4 max-[860px]:hidden">
          {related.slice(0, 3).map((item) => (
            <ProductCard key={item.slug} product={item} />
          ))}
        </div>

        {/* Mobile Left-Right Horizontal Swipeable Carousel (Peeking next card) */}
        <div className="hidden max-[860px]:flex max-[860px]:gap-3 max-[860px]:overflow-x-auto max-[860px]:snap-x max-[860px]:snap-mandatory max-[860px]:pb-2.5 max-[860px]:pt-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mx-3 px-3">
          {related.map((item) => (
            <div
              key={item.slug}
              className="w-[64vw] max-w-[245px] min-w-[200px] shrink-0 snap-start"
            >
              <ProductCard product={item} />
            </div>
          ))}
        </div>
      </section>

      {/* ── Reassurance Banner Strip Attached Above Footer ── */}
      <section className="mx-auto mt-16 w-full max-w-[1440px] px-[clamp(20px,4.5vw,72px)] max-[680px]:mt-10 max-[680px]:px-3">
        <div className="grid grid-cols-3 gap-4 rounded-3xl border border-[var(--line)] bg-[var(--paper)] p-6 text-center shadow-xs max-[680px]:grid-cols-1 max-[680px]:gap-3 max-[680px]:p-4 max-[680px]:rounded-2xl">
          <div className="flex items-center gap-3.5 text-left max-[680px]:gap-2.5">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white text-xl shadow-2xs">📦</span>
            <div>
              <strong className="block text-[0.82rem] font-bold text-[var(--forest)]">Fast Dispatch</strong>
              <span className="text-[0.68rem] text-[var(--muted)]">Dispatch timing is confirmed securely at checkout</span>
            </div>
          </div>
          <div className="flex items-center gap-3.5 text-left max-[680px]:gap-2.5">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white text-xl shadow-2xs">🌿</span>
            <div>
              <strong className="block text-[0.82rem] font-bold text-[var(--forest)]">Clear Product Details</strong>
              <span className="text-[0.68rem] text-[var(--muted)]">Ingredients and directions are shown before purchase</span>
            </div>
          </div>
          <div className="flex items-center gap-3.5 text-left max-[680px]:gap-2.5">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white text-xl shadow-2xs">🛡️</span>
            <div>
              <strong className="block text-[0.82rem] font-bold text-[var(--forest)]">Secure Encrypted Checkout</strong>
              <span className="text-[0.68rem] text-[var(--muted)]">Payment is completed on Shopify&rsquo;s hosted checkout</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
