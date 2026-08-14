import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { ProductDetailActions } from "@/components/product-detail-actions";
import { ProductJar } from "@/components/product-jar";
import { getProduct, globalSafety, products } from "@/lib/products";

export const dynamicParams = false;

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata(
  props: PageProps<"/shop/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const product = getProduct(slug);
  if (!product) notFound();

  return {
    title: product.name,
    description: product.metaDescription,
    alternates: { canonical: `/shop/${slug}` },
    openGraph: {
      type: "website",
      siteName: "NatureMist",
      title: `${product.name} | NatureMist`,
      description: product.metaDescription,
      url: `/shop/${slug}`,
      images: [
        {
          url: "/og.png",
          width: 1536,
          height: 1024,
          alt: "NatureMist botanical rituals",
        },
      ],
    },
  };
}

export default async function ProductPage(props: PageProps<"/shop/[slug]">) {
  const { slug } = await props.params;
  const product = getProduct(slug);
  if (!product) notFound();

  const related = products
    .filter(
      (item) =>
        item.slug !== product.slug &&
        item.concerns.some((concern) => product.concerns.includes(concern)),
    )
    .slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `NatureMist ${product.name}`,
    description: product.metaDescription,
    brand: { "@type": "Brand", name: "NatureMist" },
    category: "Botanical hair care powder",
    additionalProperty: [
      { "@type": "PropertyValue", name: "Botanical", value: product.botanical },
      { "@type": "PropertyValue", name: "Plant part", value: product.plantPart },
    ],
  };

  return (
    <main id="main-content" className="product-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link><span>/</span><Link href="/shop">Shop</Link><span>/</span><span>{product.name}</span>
      </nav>

      <section
        className="product-main"
        style={{
          "--pdp-accent": product.accent,
          "--pdp-soft": product.accentSoft,
        } as React.CSSProperties}
      >
        <div className="product-gallery">
          <div className="product-gallery__primary">
            <span className="product-gallery__arch" aria-hidden="true" />
            <span className="product-gallery__branch" aria-hidden="true"><i /><i /><i /><i /></span>
            <ProductJar product={product} size="large" />
            <p>Final product photography and label artwork will replace this packaging preview.</p>
          </div>
          <div className="product-gallery__secondary">
            <article>
              <span className="powder-swatch" aria-hidden="true" />
              <div><small>Texture</small><strong>{product.texture}</strong></div>
            </article>
            <article>
              <span className="botanical-mark" aria-hidden="true"><i /><i /></span>
              <div><small>Source</small><strong>{product.botanical}<br />{product.plantPart}</strong></div>
            </article>
          </div>
        </div>

        <div className="product-copy">
          <p className="eyebrow">NatureMist · Ritual {product.collectionNumber}</p>
          <h1>{product.name}</h1>
          <p className="product-copy__subtitle">{product.subtitle}</p>
          <p className="product-copy__description">{product.shortDescription}</p>
          <div className="product-size-line"><span>Format</span><strong>{product.size}</strong></div>
          <ProductDetailActions product={product} />
          <div className="product-quick-trust">
            <span><i>01</i> Single botanical</span>
            <span><i>02</i> Clear preparation</span>
            <span><i>03</i> Safety first</span>
          </div>
          <div className="product-accordions">
            <details open>
              <summary>Why you’ll love it <span>＋</span></summary>
              <ul>{product.benefits.map((benefit) => <li key={benefit}>{benefit}</li>)}</ul>
            </details>
            <details>
              <summary>How to prepare <span>＋</span></summary>
              <ol>{product.howTo.map((step) => <li key={step}>{step}</li>)}</ol>
            </details>
            <details>
              <summary>Ingredient details <span>＋</span></summary>
              <p>{product.ingredient}</p>
            </details>
          </div>
        </div>
      </section>

      <section className="product-ritual-details section reveal" aria-labelledby="ritual-details-title">
        <div className="section-heading section-heading--center">
          <p className="eyebrow">Know your botanical</p>
          <h2 id="ritual-details-title">Everything the ritual asks of you.</h2>
        </div>
        <div className="product-detail-grid">
          <article><span>01</span><h3>Mix it with</h3><ul>{product.mixers.map((item) => <li key={item}>{item}</li>)}</ul></article>
          <article><span>02</span><h3>Well suited to</h3><ul>{product.suitableFor.map((item) => <li key={item}>{item}</li>)}</ul></article>
          <article className="product-detail-grid__safety"><span>03</span><h3>Use with care</h3><ul>{product.safety.map((item) => <li key={item}>{item}</li>)}</ul></article>
          <article><span>04</span><h3>Keep it fresh</h3><p>{product.storage}</p></article>
        </div>
        <p className="global-safety-note"><strong>For every ritual:</strong> {globalSafety}</p>
      </section>

      <section className="why-naturemist reveal">
        <div>
          <p className="eyebrow eyebrow--light">Why NatureMist</p>
          <h2>Tradition deserves clarity.</h2>
        </div>
        <div className="why-naturemist__points">
          <article><span>01</span><h3>One ingredient at a time</h3><p>So you can understand what belongs in your bowl and why.</p></article>
          <article><span>02</span><h3>Guidance without folklore overload</h3><p>Clear preparation, pairing and safety language for real routines.</p></article>
          <article><span>03</span><h3>No inflated promises</h3><p>Cosmetic care described honestly, with final claims tied to verified product data.</p></article>
        </div>
      </section>

      <section className="section product-faq reveal" aria-labelledby="product-faq-title">
        <div className="section-heading section-heading--split">
          <div><p className="eyebrow">Before you mix</p><h2 id="product-faq-title">Questions about {product.name.replace(" Powder", "")}.</h2></div>
          <p>Product-specific guidance matters. If the final pack differs from this preview, always follow the pack.</p>
        </div>
        <div className="faq-list product-faq__list">
          {product.faqs.map((faq, index) => (
            <details key={faq.question} open={index === 0}>
              <summary><span>{String(index + 1).padStart(2, "0")}</span>{faq.question}<i>＋</i></summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="section related-section" aria-labelledby="related-title">
        <div className="section-heading section-heading--split">
          <div><p className="eyebrow">Continue the ritual</p><h2 id="related-title">Botanicals in good company.</h2></div>
          <Link className="text-link" href="/shop">Explore all six <span aria-hidden="true">↗</span></Link>
        </div>
        <div className="related-grid">
          {related.map((item) => <ProductCard key={item.slug} product={item} />)}
        </div>
      </section>
    </main>
  );
}

