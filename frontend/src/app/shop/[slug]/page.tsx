import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { globalSafety } from "@/domain/catalog/products";
import {
  ProductCard,
  ProductDetailActions,
  ProductGallery,
  ProductReviewsSection,
} from "@/features/catalog";
import { getStorefront, getStorefrontProduct } from "@/lib/shopify/storefront";

export const dynamicParams = true;

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `NatureMist ${product.name}`,
    description: product.metaDescription,
    brand: { "@type": "Brand", name: "NatureMist" },
    category: "Botanical hair care powder",
    image: product.featuredImage?.url,
    offers: {
      "@type": "Offer",
      price: (product.pricePaise / 100).toFixed(2),
      priceCurrency: product.currencyCode || "INR",
      availability: product.availableForSale
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `/shop/${product.slug}`,
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "142",
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
          {/* Brand & Ritual Eyebrow */}
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#edf3ea] px-2.5 py-0.5 text-[0.58rem] font-bold uppercase tracking-[0.14em] text-[var(--botanical)]">
              NatureMist · {product.ritualStep} Ritual
            </span>
            <span className="text-[0.62rem] text-[var(--muted)]">·</span>
            <span className="text-[0.64rem] font-semibold text-[var(--forest)]">
              Ayurvedic Single Botanical
            </span>
          </div>

          {/* Product Headline */}
          <div>
            <h1 className="m-0 [font-family:var(--font-display)] text-[clamp(2rem,3.8vw,3.4rem)] font-normal leading-[0.98] tracking-[-0.035em] text-[var(--forest)] max-[680px]:text-[1.85rem]">
              {product.name}
            </h1>
            <p className="mt-1.5 mb-0 [font-family:var(--font-display)] text-[1.05rem] italic text-[var(--botanical)] max-[680px]:text-[0.92rem]">
              {product.subtitle}
            </p>
          </div>

          {/* Amazon-Style Rating & Review Jump Link */}
          <div className="flex items-center gap-2 text-[0.72rem] max-[680px]:text-[0.66rem]">
            <span className="text-amber-500 font-bold text-sm">★★★★★</span>
            <span className="font-bold text-[var(--forest)]">4.9</span>
            <a
              href="#customer-reviews"
              className="text-[var(--botanical)] font-medium underline hover:text-[var(--forest)] transition-colors cursor-pointer"
            >
              (142 customer reviews)
            </a>
          </div>

          {/* Short Description */}
          <p className="m-0 text-[0.82rem] leading-[1.6] text-[var(--muted)] max-[680px]:text-[0.74rem] max-[680px]:leading-[1.45]">
            {product.shortDescription}
          </p>

          {/* Amazon-Style Specifications Table */}
          <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-3.5 shadow-2xs max-[680px]:p-2.5 max-[680px]:rounded-xl">
            <span className="mb-2 block text-[0.58rem] font-bold uppercase tracking-[0.14em] text-[var(--botanical)]">
              Botanical Specifications
            </span>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[0.72rem] max-[680px]:text-[0.66rem]">
              <div className="flex items-baseline justify-between border-b border-[var(--line)] pb-1">
                <span className="text-[var(--muted)]">Botanical Name:</span>
                <span className="font-semibold text-[var(--forest)] italic">{product.botanical}</span>
              </div>
              <div className="flex items-baseline justify-between border-b border-[var(--line)] pb-1">
                <span className="text-[var(--muted)]">Plant Part:</span>
                <span className="font-semibold text-[var(--forest)]">{product.plantPart}</span>
              </div>
              <div className="flex items-baseline justify-between border-b border-[var(--line)] pb-1">
                <span className="text-[var(--muted)]">Net Quantity:</span>
                <span className="font-semibold text-[var(--forest)]">{product.size}</span>
              </div>
              <div className="flex items-baseline justify-between border-b border-[var(--line)] pb-1">
                <span className="text-[var(--muted)]">Formulation:</span>
                <span className="font-semibold text-[var(--forest)]">Shade-Dried Powder</span>
              </div>
            </div>
          </div>

          {/* About This Item (Key Benefits) */}
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-4 shadow-2xs max-[680px]:p-3 max-[680px]:rounded-xl">
            <span className="mb-2 block text-[0.58rem] font-bold uppercase tracking-[0.14em] text-[var(--forest)]">
              About this item
            </span>
            <ul className="m-0 space-y-1.5 pl-0 list-none text-[0.76rem] text-[var(--muted)] max-[680px]:text-[0.7rem]">
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
          <div className="space-y-1.5">
            <details className="group rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-3.5 transition-all max-[680px]:p-2.5 max-[680px]:rounded-xl" open>
              <summary className="flex cursor-pointer list-none items-center justify-between [font-family:var(--font-display)] text-[1.05rem] font-normal text-[var(--forest)] [&::-webkit-details-marker]:hidden max-[680px]:text-[0.92rem]">
                <span>How to prepare & apply</span>
                <span className="text-sm text-[var(--botanical)] transition-transform duration-300 group-open:rotate-45">＋</span>
              </summary>
              <ol className="mt-2.5 mb-0 space-y-1 pl-4 text-[0.76rem] text-[var(--muted)] max-[680px]:text-[0.68rem]">
                {product.howTo.map((step) => (
                  <li key={step} className="list-decimal leading-relaxed">
                    {step}
                  </li>
                ))}
              </ol>
            </details>

            <details className="group rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-3.5 transition-all max-[680px]:p-2.5 max-[680px]:rounded-xl">
              <summary className="flex cursor-pointer list-none items-center justify-between [font-family:var(--font-display)] text-[1.05rem] font-normal text-[var(--forest)] [&::-webkit-details-marker]:hidden max-[680px]:text-[0.92rem]">
                <span>Storage & Safety Guidelines</span>
                <span className="text-sm text-[var(--botanical)] transition-transform duration-300 group-open:rotate-45">＋</span>
              </summary>
              <div className="mt-2 text-[0.76rem] text-[var(--muted)] leading-relaxed max-[680px]:text-[0.68rem]">
                <p className="m-0 font-medium text-[var(--forest)]">{product.storage}</p>
                <p className="mt-1 mb-0 text-[0.68rem] text-[var(--muted)]">
                  {globalSafety}
                </p>
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* ── Customer Reviews & Ratings Section (Amazon-Style Breakdown) ── */}
      <ProductReviewsSection product={product} />

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
              Customers Also Purchased
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
              <span className="text-[0.68rem] text-[var(--muted)]">Orders packed fresh & shipped within 24 hours</span>
            </div>
          </div>
          <div className="flex items-center gap-3.5 text-left max-[680px]:gap-2.5">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white text-xl shadow-2xs">🌿</span>
            <div>
              <strong className="block text-[0.82rem] font-bold text-[var(--forest)]">100% Authentic Herb</strong>
              <span className="text-[0.68rem] text-[var(--muted)]">Single-origin shade-dried herbs, zero fillers</span>
            </div>
          </div>
          <div className="flex items-center gap-3.5 text-left max-[680px]:gap-2.5">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white text-xl shadow-2xs">🛡️</span>
            <div>
              <strong className="block text-[0.82rem] font-bold text-[var(--forest)]">Secure Encrypted Checkout</strong>
              <span className="text-[0.68rem] text-[var(--muted)]">Bank-grade encryption & satisfaction guaranteed</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
