import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct, globalSafety, products } from "@/domain/catalog/products";
import { ProductCard } from "@/features/catalog/product-card";
import { ProductDetailActions } from "@/features/catalog/product-detail-actions";
import { ProductJar } from "@/features/catalog/product-jar";

const revealClass =
  "supports-[animation-timeline:view()]:[animation:section-reveal_1ms_linear_both] supports-[animation-timeline:view()]:[animation-range:entry_5%_cover_28%] supports-[animation-timeline:view()]:[animation-timeline:view()] motion-reduce:animate-none motion-reduce:transform-none motion-reduce:opacity-100";

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
          url: "/exec-2be6204a-8260-412a-adf6-d34d47c234b6.png",
          width: 1731,
          height: 909,
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

  const concernMatches = products.filter(
    (item) =>
      item.slug !== product.slug &&
      item.concerns.some((concern) => product.concerns.includes(concern)),
  );
  const related = [
    ...concernMatches,
    ...products.filter(
      (item) =>
        item.slug !== product.slug &&
        !concernMatches.some((match) => match.slug === item.slug),
    ),
  ].slice(0, 3);

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
    <main id="main-content" className="max-[680px]:pb-[72px]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <nav className="mx-auto flex w-full max-w-[1440px] items-center gap-2.5 px-[clamp(24px,5vw,72px)] py-[22px] text-[0.61rem] uppercase tracking-[0.06em] text-[var(--muted)] [&>a]:transition-colors [&>a:hover]:text-[var(--forest)] max-[680px]:overflow-x-auto max-[680px]:px-5 max-[680px]:py-[17px] max-[680px]:whitespace-nowrap" aria-label="Breadcrumb">
        <Link href="/">Home</Link><span>/</span><Link href="/shop">Shop</Link><span>/</span><span>{product.name}</span>
      </nav>

      <section
        className="mx-auto grid w-full max-w-[1440px] grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] gap-[clamp(40px,6vw,88px)] px-[clamp(24px,5vw,72px)] pb-[110px] [--pdp-accent:var(--botanical)] [--pdp-soft:var(--beige)] max-[960px]:grid-cols-1 max-[680px]:px-5 max-[680px]:pb-[75px]"
        style={{
          "--pdp-accent": product.accent,
          "--pdp-soft": product.accentSoft,
        } as React.CSSProperties}
      >
        <div>
          <div className="sticky top-[calc(var(--header-height)+24px)] flex min-h-[clamp(560px,50vw,675px)] items-end justify-center overflow-hidden rounded-[var(--radius-lg)] pb-[60px] shadow-[var(--shadow-soft)] ring-1 ring-[color-mix(in_srgb,var(--pdp-accent)_20%,transparent)] [background:radial-gradient(circle_at_50%_73%,rgba(255,255,255,0.85),transparent_35%),color-mix(in_srgb,var(--pdp-soft)_78%,var(--ivory))] max-[960px]:relative max-[960px]:top-auto max-[680px]:min-h-[460px] max-[680px]:rounded-[var(--radius-md)] max-[680px]:pb-10">
            <span className="absolute top-[9%] h-[68%] w-[62%] rounded-t-[50%] border border-[color-mix(in_srgb,var(--pdp-accent)_35%,transparent)]" aria-hidden="true" />
            <span className="absolute top-[10%] right-[10%] z-[2] h-[250px] w-[130px] rotate-[28deg] before:absolute before:left-1/2 before:h-full before:w-px before:bg-[color-mix(in_srgb,var(--pdp-accent)_45%,transparent)] before:content-[''] [&>i]:absolute [&>i]:h-[27px] [&>i]:w-[58px] [&>i]:rounded-[100%_0_100%_0] [&>i]:bg-[color-mix(in_srgb,var(--pdp-accent)_23%,transparent)] [&>i:nth-child(1)]:top-[30px] [&>i:nth-child(1)]:left-[7px] [&>i:nth-child(2)]:top-[87px] [&>i:nth-child(2)]:right-[5px] [&>i:nth-child(2)]:scale-x-[-1] [&>i:nth-child(3)]:top-[145px] [&>i:nth-child(3)]:left-[5px] [&>i:nth-child(4)]:top-[198px] [&>i:nth-child(4)]:right-[7px] [&>i:nth-child(4)]:scale-x-[-1]" aria-hidden="true"><i /><i /><i /><i /></span>
            <ProductJar product={product} size="large" className="z-[3] scale-[1.08] max-[680px]:origin-bottom max-[680px]:scale-[0.82]" />
            <p className="absolute right-[25px] bottom-[18px] left-[25px] z-[4] m-0 text-center text-[0.52rem] tracking-[0.1em] text-[color-mix(in_srgb,var(--pdp-accent)_55%,var(--muted))] uppercase">Final product photography and label artwork will replace this packaging preview.</p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 max-[680px]:grid-cols-1">
            <article className="flex min-h-[200px] flex-col items-center justify-center rounded-[var(--radius-md)] bg-[var(--paper)] p-6 text-center shadow-[0_12px_34px_rgba(21,59,45,0.06)] ring-1 ring-[var(--line)]">
              <span className="mb-[18px] h-12 w-[76px] rounded-[50%] [background:radial-gradient(circle_at_20%_35%,rgba(255,255,255,0.16)_0_1px,transparent_1.5px)_0_0/6px_6px,var(--pdp-accent)] shadow-[inset_0_8px_15px_rgba(0,0,0,0.12),0_5px_14px_rgba(0,0,0,0.12)]" aria-hidden="true" />
              <div><small className="mb-[5px] block text-[0.54rem] font-bold tracking-[0.12em] text-[var(--pdp-accent)] uppercase">Texture</small><strong className="font-serif text-base leading-[1.25] font-normal text-[var(--forest)]">{product.texture}</strong></div>
            </article>
            <article className="flex min-h-[200px] flex-col items-center justify-center rounded-[var(--radius-md)] bg-[var(--paper)] p-6 text-center shadow-[0_12px_34px_rgba(21,59,45,0.06)] ring-1 ring-[var(--line)]">
              <span className="relative mb-2 h-[70px] w-[85px] before:absolute before:top-[7px] before:left-1/2 before:h-[60px] before:w-px before:bg-[var(--pdp-accent)] before:content-[''] [&>i]:absolute [&>i]:top-[15px] [&>i]:left-3 [&>i]:h-5 [&>i]:w-9 [&>i]:rounded-[100%_0_100%_0] [&>i]:border [&>i]:border-[var(--pdp-accent)] [&>i:first-child]:rotate-[23deg] [&>i:last-child]:top-[39px] [&>i:last-child]:right-2.5 [&>i:last-child]:left-auto [&>i:last-child]:[transform:scaleX(-1)_rotate(23deg)]" aria-hidden="true"><i /><i /></span>
              <div><small className="mb-[5px] block text-[0.54rem] font-bold tracking-[0.12em] text-[var(--pdp-accent)] uppercase">Source</small><strong className="font-serif text-base leading-[1.25] font-normal text-[var(--forest)]">{product.botanical}<br />{product.plantPart}</strong></div>
            </article>
          </div>
        </div>

        <div className="min-w-0 pt-[30px] max-[960px]:pt-0">
          <p className="mb-4 text-[0.68rem] leading-[1.3] font-bold tracking-[0.2em] text-[var(--pdp-accent)] uppercase">NatureMist · Ritual {product.collectionNumber}</p>
          <h1 className="m-0 max-w-[10ch] font-serif text-[clamp(3.6rem,5.5vw,6.75rem)] font-normal leading-[0.86] tracking-[-0.055em] text-[var(--forest)] text-balance max-[680px]:text-[clamp(3.15rem,15vw,5rem)]">{product.name}</h1>
          <p className="mt-[23px] mb-0 font-serif text-2xl text-[var(--pdp-accent)] italic">{product.subtitle}</p>
          <p className="mb-[30px] mt-6 max-w-[550px] text-[1.02rem] leading-[1.75] text-[var(--muted)] max-[960px]:max-w-[720px]">{product.shortDescription}</p>
          <div className="flex items-center justify-between border-y border-[var(--line)] py-4 text-[0.68rem]"><span className="tracking-[0.1em] text-[var(--muted)] uppercase">Format</span><strong className="font-semibold text-[var(--forest)]">{product.size}</strong></div>
          <ProductDetailActions product={product} />
          <div className="mt-[22px] grid grid-cols-3 gap-2.5 border-y border-[var(--line)] py-[25px] max-[680px]:grid-cols-1">
            <span className="grid text-[0.59rem] leading-[1.4] font-bold tracking-[0.06em] text-[var(--forest)] uppercase max-[680px]:flex max-[680px]:items-center max-[680px]:gap-2.5"><i className="font-serif text-[0.85rem] not-italic text-[var(--pdp-accent)]">01</i> Single botanical</span>
            <span className="grid text-[0.59rem] leading-[1.4] font-bold tracking-[0.06em] text-[var(--forest)] uppercase max-[680px]:flex max-[680px]:items-center max-[680px]:gap-2.5"><i className="font-serif text-[0.85rem] not-italic text-[var(--pdp-accent)]">02</i> Clear preparation</span>
            <span className="grid text-[0.59rem] leading-[1.4] font-bold tracking-[0.06em] text-[var(--forest)] uppercase max-[680px]:flex max-[680px]:items-center max-[680px]:gap-2.5"><i className="font-serif text-[0.85rem] not-italic text-[var(--pdp-accent)]">03</i> Safety first</span>
          </div>
          <div className="mt-[22px] border-t border-[var(--line)]">
            <details className="group border-b border-[var(--line)]" open>
              <summary className="flex min-h-[66px] cursor-pointer list-none items-center justify-between font-serif text-[1.15rem] text-[var(--forest)] [&::-webkit-details-marker]:hidden">{"Why you'll love it"} <span className="font-sans transition-transform duration-300 ease-[ease] group-open:rotate-45">＋</span></summary>
              <ul className="m-0 pb-5 pl-5">{product.benefits.map((benefit) => <li className="text-[0.78rem] text-[var(--muted)]" key={benefit}>{benefit}</li>)}</ul>
            </details>
            <details className="group border-b border-[var(--line)]">
              <summary className="flex min-h-[66px] cursor-pointer list-none items-center justify-between font-serif text-[1.15rem] text-[var(--forest)] [&::-webkit-details-marker]:hidden">How to prepare <span className="font-sans transition-transform duration-300 ease-[ease] group-open:rotate-45">＋</span></summary>
              <ol className="m-0 pb-5 pl-5">{product.howTo.map((step) => <li className="text-[0.78rem] text-[var(--muted)]" key={step}>{step}</li>)}</ol>
            </details>
            <details className="group border-b border-[var(--line)]">
              <summary className="flex min-h-[66px] cursor-pointer list-none items-center justify-between font-serif text-[1.15rem] text-[var(--forest)] [&::-webkit-details-marker]:hidden">Ingredient details <span className="font-sans transition-transform duration-300 ease-[ease] group-open:rotate-45">＋</span></summary>
              <p className="m-0 pb-5 text-[0.78rem] text-[var(--muted)]">{product.ingredient}</p>
            </details>
          </div>
        </div>
      </section>

      <section className={`mx-auto w-full max-w-[1440px] border-t border-[var(--line)] px-[clamp(24px,5vw,72px)] py-[clamp(84px,9vw,140px)] max-[680px]:px-5 max-[680px]:py-[75px] ${revealClass}`} aria-labelledby="ritual-details-title">
        <div className="mx-auto mb-[clamp(50px,6vw,85px)] max-w-[840px] text-center max-[680px]:mb-[45px]">
          <p className="mb-4 text-[0.68rem] leading-[1.3] font-bold tracking-[0.2em] text-[var(--botanical)] uppercase">Know your botanical</p>
          <h2 className="m-0 font-serif text-[clamp(3.2rem,5vw,6.25rem)] font-normal leading-[0.96] tracking-[-0.055em] text-[var(--forest)] text-balance max-[680px]:text-[clamp(2.9rem,14vw,4.5rem)]" id="ritual-details-title">Everything the ritual asks of you.</h2>
        </div>
        <div className="grid grid-cols-4 gap-px overflow-hidden rounded-[var(--radius-lg)] bg-[var(--line)] shadow-[var(--shadow-soft)] ring-1 ring-[var(--line)] max-[1050px]:grid-cols-2 max-[680px]:grid-cols-1 max-[680px]:rounded-[var(--radius-md)]">
          <article className="min-h-[335px] bg-[var(--paper)] p-[30px] max-[680px]:min-h-[290px]"><span className="text-[0.59rem] tracking-[0.1em] text-[var(--botanical)]">01</span><h3 className="mt-[90px] mb-[18px] font-serif text-[1.8rem] font-normal text-[var(--forest)] max-[680px]:mt-[65px]">Mix it with</h3><ul className="m-0 list-none p-0">{product.mixers.map((item) => <li className="border-b border-[var(--line)] py-[7px] text-[0.75rem] text-[var(--muted)]" key={item}>{item}</li>)}</ul></article>
          <article className="min-h-[335px] bg-[var(--paper)] p-[30px] max-[680px]:min-h-[290px]"><span className="text-[0.59rem] tracking-[0.1em] text-[var(--botanical)]">02</span><h3 className="mt-[90px] mb-[18px] font-serif text-[1.8rem] font-normal text-[var(--forest)] max-[680px]:mt-[65px]">Well suited to</h3><ul className="m-0 list-none p-0">{product.suitableFor.map((item) => <li className="border-b border-[var(--line)] py-[7px] text-[0.75rem] text-[var(--muted)]" key={item}>{item}</li>)}</ul></article>
          <article className="min-h-[335px] bg-[var(--forest)] p-[30px] max-[680px]:min-h-[290px]"><span className="text-[0.59rem] tracking-[0.1em] text-[var(--botanical)]">03</span><h3 className="mt-[90px] mb-[18px] font-serif text-[1.8rem] font-normal text-[var(--paper)] max-[680px]:mt-[65px]">Use with care</h3><ul className="m-0 list-none p-0">{product.safety.map((item) => <li className="border-b border-white/14 py-[7px] text-[0.75rem] text-[var(--paper)] opacity-72" key={item}>{item}</li>)}</ul></article>
          <article className="min-h-[335px] bg-[var(--paper)] p-[30px] max-[680px]:min-h-[290px]"><span className="text-[0.59rem] tracking-[0.1em] text-[var(--botanical)]">04</span><h3 className="mt-[90px] mb-[18px] font-serif text-[1.8rem] font-normal text-[var(--forest)] max-[680px]:mt-[65px]">Keep it fresh</h3><p className="border-b border-[var(--line)] py-[7px] text-[0.75rem] text-[var(--muted)]">{product.storage}</p></article>
        </div>
        <p className="mt-[25px] rounded-[var(--radius-md)] border border-[var(--line)] border-l-[4px] border-l-[var(--amla)] bg-[var(--ivory-deep)] p-[25px] text-[0.78rem] leading-[1.65] text-[var(--muted)]"><strong className="text-[var(--forest)]">For every ritual:</strong> {globalSafety}</p>
      </section>

      <section className={`bg-[var(--forest-dark)] text-[var(--paper)] ${revealClass}`}>
        <div className="mx-auto grid w-full max-w-[1440px] grid-cols-[0.7fr_1.3fr] gap-[clamp(52px,7vw,100px)] px-[clamp(24px,5vw,72px)] py-[clamp(80px,9vw,130px)] max-[900px]:grid-cols-1 max-[680px]:px-5 max-[680px]:py-[72px]">
          <div>
            <p className="mb-4 text-[0.68rem] font-bold uppercase leading-[1.3] tracking-[0.2em] text-[#c8d88e]">Why NatureMist</p>
            <h2 className="m-0 max-w-[12ch] font-serif text-[clamp(3.25rem,5vw,5.75rem)] font-normal leading-[0.94] tracking-[-0.055em] text-balance">Tradition deserves clarity.</h2>
          </div>
          <div className="border-t border-white/18">
            <article className="grid grid-cols-[35px_1fr] gap-5 border-b border-white/18 py-6"><span className="text-[0.6rem] text-[var(--amla)]">01</span><h3 className="m-0 font-serif text-2xl font-normal">One ingredient at a time</h3><p className="col-start-2 mb-0 mt-[-12px] text-[0.78rem] text-white/58">So you can understand what belongs in your bowl and why.</p></article>
            <article className="grid grid-cols-[35px_1fr] gap-5 border-b border-white/18 py-6"><span className="text-[0.6rem] text-[var(--amla)]">02</span><h3 className="m-0 font-serif text-2xl font-normal">Guidance without folklore overload</h3><p className="col-start-2 mb-0 mt-[-12px] text-[0.78rem] text-white/58">Clear preparation, pairing and safety language for real routines.</p></article>
            <article className="grid grid-cols-[35px_1fr] gap-5 border-b border-white/18 py-6"><span className="text-[0.6rem] text-[var(--amla)]">03</span><h3 className="m-0 font-serif text-2xl font-normal">No inflated promises</h3><p className="col-start-2 mb-0 mt-[-12px] text-[0.78rem] text-white/58">Cosmetic care described honestly, with final claims tied to verified product data.</p></article>
          </div>
        </div>
      </section>

      <section className={`mx-auto w-full max-w-[1440px] px-[clamp(24px,5vw,72px)] py-[clamp(84px,9vw,140px)] max-[680px]:px-5 max-[680px]:py-[75px] ${revealClass}`} aria-labelledby="product-faq-title">
        <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(260px,0.6fr)] items-end gap-[8vw] max-[900px]:grid-cols-1 max-[900px]:gap-[35px]">
          <div><p className="mb-4 text-[0.68rem] font-bold uppercase leading-[1.3] tracking-[0.2em] text-[var(--botanical)]">Before you mix</p><h2 className="m-0 font-serif text-[clamp(3.2rem,5vw,6.25rem)] font-normal leading-[0.96] tracking-[-0.055em] text-[var(--forest)] text-balance max-[680px]:text-[clamp(2.9rem,14vw,4.5rem)]" id="product-faq-title">Questions about {product.name.replace(" Powder", "")}.</h2></div>
          <p className="max-w-[460px] pb-1 leading-[1.75] text-[var(--muted)] max-[900px]:p-0">Product-specific guidance matters. If the final pack differs from this preview, always follow the pack.</p>
        </div>
        <div className="mt-[70px] ml-auto max-w-[950px] overflow-hidden rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--paper)] px-6 shadow-[0_12px_38px_rgba(21,59,45,0.06)] max-[680px]:mt-[45px] max-[680px]:px-4">
          {product.faqs.map((faq, index) => (
            <details className="group border-b border-[var(--line)]" key={faq.question} open={index === 0}>
              <summary className="grid min-h-[78px] cursor-pointer list-none grid-cols-[35px_1fr_30px] items-center gap-[18px] font-serif text-[clamp(1.15rem,1.7vw,1.55rem)] text-[var(--forest)] [&::-webkit-details-marker]:hidden max-[680px]:grid-cols-[28px_1fr_24px] max-[680px]:text-[1.08rem]"><span className="font-sans text-[0.55rem] text-[var(--botanical)]">{String(index + 1).padStart(2, "0")}</span>{faq.question}<i className="font-sans text-[0.9rem] not-italic transition-transform duration-[320ms] ease-[var(--ease)] group-open:rotate-45">＋</i></summary>
              <p className="m-0 max-w-[680px] pt-0 pr-[30px] pb-7 pl-[53px] text-[0.86rem] text-[var(--muted)] max-[680px]:pl-[46px]">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1440px] px-[clamp(24px,5vw,72px)] py-[clamp(84px,9vw,140px)] max-[680px]:px-5 max-[680px]:py-[75px]" aria-labelledby="related-title">
        <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(260px,0.6fr)] items-end gap-[8vw] max-[900px]:grid-cols-1 max-[900px]:gap-[35px]">
          <div><p className="mb-4 text-[0.68rem] font-bold uppercase leading-[1.3] tracking-[0.2em] text-[var(--botanical)]">Continue the ritual</p><h2 className="m-0 font-serif text-[clamp(3.2rem,5vw,6.25rem)] font-normal leading-[0.96] tracking-[-0.055em] text-[var(--forest)] text-balance max-[680px]:text-[clamp(2.9rem,14vw,4.5rem)]" id="related-title">Botanicals in good company.</h2></div>
          <Link className="mt-[15px] inline-flex items-center gap-3.5 border-b border-[var(--forest)] pb-[5px] text-[0.76rem] font-bold tracking-[0.08em] text-[var(--forest)] uppercase transition-[gap] duration-[260ms] ease-[var(--ease)] hover:gap-[22px]" href="/shop">Explore all six <span aria-hidden="true">↗</span></Link>
        </div>
        <div className="mt-[65px] grid grid-cols-3 gap-[22px] max-[900px]:grid-cols-2 max-[680px]:grid-cols-1 max-[680px]:[&>article]:w-full">
          {related.map((item) => <ProductCard key={item.slug} product={item} />)}
        </div>
      </section>
    </main>
  );
}
