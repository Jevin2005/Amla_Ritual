"use client";

import Image from "next/image";
import Link from "next/link";
import { getHomepageHeroProducts } from "@/domain/catalog/products";
import { ProductCard } from "@/features/catalog/product-card";
import { RitualFinder } from "@/features/rituals/ritual-finder";
import { useStore } from "@/features/store/store-provider";
import { BundleCards } from "./bundle-cards";
import { FeaturedProductSwitcher } from "./featured-product-switcher";
import { ProductHero } from "./product-hero";
import { VideoReviewsSection } from "./video-reviews-section";
import { homeFaqs } from "./content";

const eyebrowClass =
  "mb-4 text-[0.68rem] leading-[1.3] font-bold tracking-[0.2em] text-[var(--botanical)] uppercase";
const sectionTitleClass =
  "m-0 scroll-mt-[calc(var(--header-height)+24px)] text-[clamp(3rem,4.5vw,5rem)] leading-[0.96] font-normal tracking-[-0.045em] text-[var(--forest)] [font-family:var(--font-display)] max-[680px]:text-[clamp(2.45rem,11vw,3.15rem)]";
const sectionClass =
  "mx-auto w-full max-w-[1440px] px-[clamp(24px,5vw,72px)] py-[clamp(80px,8vw,124px)] max-[680px]:px-5 max-[680px]:py-16";
const splitHeadingClass =
  "grid grid-cols-[minmax(0,1.35fr)_minmax(260px,0.65fr)] items-end gap-[clamp(48px,6vw,88px)] max-[900px]:grid-cols-[minmax(0,1.15fr)_minmax(210px,0.85fr)] max-[900px]:gap-8 max-[680px]:grid-cols-1 max-[680px]:gap-6";
const centeredHeadingClass =
  "mx-auto mb-[clamp(46px,5vw,72px)] max-w-[820px] text-center max-[680px]:mb-9";
const textLinkClass =
  "inline-flex items-center gap-[14px] border-b border-[var(--forest)] pb-[5px] text-[0.76rem] font-bold tracking-[0.08em] text-[var(--forest)] uppercase [transition:gap_260ms_var(--ease)] motion-reduce:transition-none hover:gap-[22px] max-[680px]:min-h-11";
const revealClass =
  "[transition:opacity_650ms_var(--ease),transform_650ms_var(--ease)]";

export function HomePage() {
  const { products, content } = useStore();

  if (!products.length) {
    return (
      <main className="grid min-h-[70vh] place-items-center px-[var(--page-pad)] py-24 text-center" id="main-content">
        <div className="max-w-[660px]">
          <p className={eyebrowClass}>NatureMist catalog</p>
          <h1 className="m-0 font-serif text-[clamp(3rem,7vw,6rem)] font-normal leading-[0.92] tracking-[-0.05em] text-[var(--forest)]">
            The next ritual is being prepared.
          </h1>
          <p className="mx-auto mt-7 max-w-[540px] text-[var(--muted)]">
            Products will appear here as soon as they are active and published to the Headless sales channel in Shopify.
          </p>
        </div>
      </main>
    );
  }

  const hasHero = getHomepageHeroProducts(products, content.heroEntries).length > 0;
  const ritualPoster = content.ritualPoster;
  const CollectionHeading = hasHero ? "h2" : "h1";
  return (
    <main className="overflow-x-clip" id="main-content">
      <ProductHero products={products} entries={content.heroEntries} settings={content.heroSettings} />
      <section
        className={`mx-auto w-full max-w-[1440px] px-[clamp(24px,5vw,72px)] py-[clamp(70px,7vw,110px)] max-[680px]:px-3 max-[680px]:py-8 max-[420px]:px-2.5 max-[420px]:py-6 ${revealClass}`}
        aria-labelledby="collection-title"
      >
        {/* ── Section heading ── */}
        <div className="mb-[clamp(36px,4vw,60px)] grid grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] items-end gap-x-[clamp(24px,4vw,64px)] max-[900px]:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] max-[900px]:gap-x-6 max-[680px]:mb-5 max-[680px]:grid-cols-1 max-[680px]:gap-y-2">
          <div>
            <p className={`${eyebrowClass} max-[680px]:mb-1 max-[680px]:text-[0.54rem]`}>
              The botanical cabinet
            </p>
            <CollectionHeading
              className="m-0 scroll-mt-[calc(var(--header-height)+24px)] text-[clamp(2.6rem,4vw,4.5rem)] leading-[0.96] font-normal tracking-[-0.045em] text-[var(--forest)] [font-family:var(--font-display)] max-[680px]:text-[clamp(1.6rem,7.5vw,2.1rem)]"
              id="collection-title"
            >
              Shop the herbal collection.
            </CollectionHeading>
          </div>
          <div className="flex flex-col justify-end gap-3 max-[680px]:gap-2">
            <p className="m-0 text-[0.84rem] leading-[1.65] text-[var(--muted)] max-[680px]:hidden">
              Single origin botanicals. Distinct ritual paths. One calm,
              considered way to begin.
            </p>
            <Link
              className={`${textLinkClass} max-[680px]:text-[0.6rem] max-[680px]:min-h-[34px]`}
              href="/shop"
            >
              View all botanicals <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>

        {/* ── Product grid ── */}
        <div
          className="grid grid-cols-3 gap-[clamp(16px,1.8vw,26px)] max-[860px]:grid-cols-2 max-[680px]:grid-cols-2 max-[680px]:gap-2.5 max-[420px]:gap-2"
          aria-label="NatureMist botanical collection"
        >
          {products.map((product, index) => (
            <ProductCard
              product={product}
              key={product.slug}
              eagerImage={!hasHero && index < 3}
            />
          ))}
        </div>
      </section>

      {/* ── The Benefit of This Products Section ── */}
      <section
        className={`mx-auto w-full max-w-[1440px] px-[clamp(24px,5vw,72px)] py-[clamp(60px,7vw,110px)] max-[960px]:py-10 max-[680px]:px-4 max-[680px]:py-8 ${revealClass}`}
        aria-labelledby="benefits-title"
      >
        <div className="grid grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] items-center gap-x-[clamp(32px,5vw,80px)] gap-y-10 max-[960px]:grid-cols-1 max-[960px]:gap-y-8">
          {/* Left Column: Heading, description, CTA */}
          <div className="flex flex-col items-start">
            <p className={eyebrowClass}>
              Botanical efficacy
            </p>
            <h2
              id="benefits-title"
              className="m-0 text-[clamp(2.4rem,4.2vw,4.2rem)] font-normal leading-[1.02] tracking-[-0.04em] text-[var(--forest)] [font-family:var(--font-display)] max-[680px]:text-[clamp(1.75rem,7vw,2.25rem)]"
            >
              The benefit of <br />
              this product.
            </h2>
            <p className="mt-4 mb-7 max-w-[420px] text-[0.92rem] leading-[1.7] text-[#55635a] max-[680px]:mt-2.5 max-[680px]:mb-5 max-[680px]:text-[0.84rem]">
              Proven botanical hair benefits formulated with pure, single-origin shade-dried herbs.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center rounded-full bg-[#5a9e32] px-7 py-3 text-[0.82rem] font-bold uppercase tracking-[0.1em] text-white shadow-[0_4px_14px_rgba(90,158,50,0.28)] transition-all duration-200 hover:bg-[#4a8528] hover:shadow-[0_6px_20px_rgba(90,158,50,0.36)] hover:-translate-y-0.5 active:scale-95 max-[680px]:px-6 max-[680px]:py-2.5 max-[680px]:text-[0.74rem]"
            >
              Explore Us
            </Link>
          </div>

          {/* Right Column: 2x2 Grid of numbered benefits */}
          <div className="grid grid-cols-2 gap-x-5 gap-y-6 max-[820px]:gap-4 max-[680px]:grid-cols-1 max-[680px]:gap-3">
            {[
              { benefit: "Follicle Vitality: Delivers plant polyphenols and antioxidants to strengthen hair roots." },
              { benefit: "Natural Slip & Cuticle Seal: Gently detangles while imparting a reflective, silky sheen." },
              { benefit: "Sebum Balance: Purifies the scalp without stripping its essential natural moisture barrier." },
              { benefit: "Pure Pigment Depth: Enhances rich natural hair tones with zero synthetic dyes or ammonia." },
            ].map(({ benefit }, idx) => {
              const p = products[idx];
              const imgSrc = p?.featuredImage?.url ?? `/images/${["amla-powder", "reetha-powder", "shikakai-powder", "bhringraj-powder"][idx]}.jpg`;
              const imgAlt = p?.featuredImage?.altText || p?.name || benefit;
              return (
                <div
                  key={idx}
                  className="flex items-start gap-3.5 rounded-2xl border border-[#dedad0]/80 bg-[rgba(255,253,248,0.7)] p-4 shadow-2xs transition-all hover:border-[var(--botanical)] max-[680px]:p-3 max-[680px]:rounded-xl"
                >
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="shrink-0 font-mono text-[1.8rem] font-medium leading-none tracking-tight text-[#1a2e22] max-[680px]:text-[1.3rem] max-[680px]:text-[var(--botanical)]">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <div className="relative size-[64px] shrink-0 overflow-hidden rounded-xl border border-[#dedad0] bg-[#f8f6f0] p-1 shadow-2xs max-[680px]:size-[48px] max-[680px]:rounded-lg">
                      <Image
                        src={imgSrc}
                        alt={imgAlt}
                        fill
                        sizes="(max-width: 680px) 48px, 64px"
                        className="size-full object-cover object-center rounded-lg max-[680px]:rounded-md"
                      />
                    </div>
                  </div>
                  <p className="m-0 self-center text-[0.82rem] leading-[1.55] text-[#4f5c53] max-[680px]:text-[0.76rem] max-[680px]:leading-[1.45]">
                    {benefit}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Build your ritual / Botanical Starting Point ── */}
      <section
        className={`mx-auto w-full max-w-[1440px] px-[clamp(24px,5vw,72px)] py-[clamp(40px,5vw,80px)] max-[680px]:px-3.5 max-[680px]:py-6 ${revealClass}`}
        aria-labelledby="builder-title"
      >
        <div className="relative overflow-hidden rounded-[24px] border border-[#1b3d2b] bg-[radial-gradient(ellipse_at_top_left,rgba(111,143,47,0.2),transparent_65%),linear-gradient(145deg,#132c20,#0b1a13)] p-[clamp(24px,4vw,44px)] shadow-[0_20px_50px_rgba(11,26,19,0.18)] max-[680px]:p-4 max-[680px]:rounded-2xl">
          <div className="grid grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] items-center gap-x-[clamp(28px,4vw,60px)] gap-y-6 max-[920px]:grid-cols-1">
            {/* Left Header */}
            <div>
              <p className="mb-2 text-[0.62rem] font-bold uppercase tracking-[0.18em] text-[#c8d88e]">
                Build your ritual
              </p>
              <h2
                className="m-0 [font-family:var(--font-display)] text-[clamp(2rem,3.2vw,3.4rem)] leading-[0.98] font-normal tracking-[-0.04em] text-[#fdfbf6] max-[680px]:text-[1.65rem]"
                id="builder-title"
              >
                A botanical starting point, chosen with care.
              </h2>
              <p className="mt-3.5 max-w-[440px] text-[0.82rem] leading-[1.6] text-white/70 max-[680px]:hidden">
                Tell us your ritual goal and how your hair feels today. We&apos;ll suggest a simple place to begin—never a diagnosis or a promise.
              </p>
            </div>

            {/* Right Interactive Card */}
            <div>
              <RitualFinder />
            </div>
          </div>
        </div>
      </section>

      {/* ── The Art of Preparation (Three steps. One unhurried ritual) ── */}
      <section
        className={`${sectionClass} ${revealClass} max-[680px]:py-10 max-[680px]:px-3.5`}
        aria-labelledby="prepare-title"
      >
        <div className={splitHeadingClass}>
          <div>
            <p className={eyebrowClass}>The art of preparation</p>
            <h2 className={sectionTitleClass} id="prepare-title">
              Three steps. One unhurried ritual.
            </h2>
          </div>
          <p className="max-w-[460px] pb-1 leading-[1.75] text-[var(--muted)] max-[900px]:p-0 max-[680px]:hidden">
            Every powder has its own directions. The rhythm, however, stays beautifully simple.
          </p>
        </div>

        {/* 3-Column Grid matching desktop layout on phone view */}
        <div className="mt-[64px] grid grid-cols-3 border-y border-[var(--line)] max-[900px]:mt-10 max-[680px]:mt-6">
          {/* Step 01: Scoop */}
          <article className="relative flex flex-col items-center justify-between border-r border-[var(--line)] px-8 py-10 text-center max-[900px]:px-4 max-[900px]:py-7 max-[680px]:px-2.5 max-[680px]:py-5">
            <span className="self-start font-mono text-[0.76rem] font-bold tracking-[0.15em] text-[var(--botanical)] max-[680px]:text-[0.68rem]">
              01
            </span>

            {/* Spoon Icon */}
            <div className="my-6 flex items-center justify-center max-[680px]:my-3">
              <svg
                className="h-20 w-12 text-[var(--forest)] max-[900px]:h-16 max-[900px]:w-10 max-[680px]:h-12 max-[680px]:w-8"
                viewBox="0 0 40 70"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <ellipse cx="20" cy="18" rx="13" ry="16" />
                <path d="M19.5 34 L22.5 66" strokeWidth="2" />
              </svg>
            </div>

            <div>
              <h3 className="m-0 [color:var(--forest)] [font-family:var(--font-display)] text-[clamp(1.4rem,2.2vw,2.2rem)] font-normal max-[680px]:text-[1.15rem]">
                Scoop
              </h3>
              <p className="mx-auto mt-2 max-w-[280px] text-[0.84rem] leading-[1.55] text-[var(--muted)] max-[680px]:mt-1 max-[680px]:text-[0.72rem] max-[680px]:leading-[1.35]">
                Begin with enough botanical powder for your hair length.
              </p>
            </div>
          </article>

          {/* Step 02: Mix */}
          <article className="relative flex flex-col items-center justify-between border-r border-[var(--line)] px-8 py-10 text-center max-[900px]:px-4 max-[900px]:py-7 max-[680px]:px-2.5 max-[680px]:py-5">
            <span className="self-start font-mono text-[0.76rem] font-bold tracking-[0.15em] text-[var(--botanical)] max-[680px]:text-[0.68rem]">
              02
            </span>

            {/* Bowl Icon */}
            <div className="my-6 flex items-center justify-center max-[680px]:my-3">
              <svg
                className="h-20 w-20 text-[var(--forest)] max-[900px]:h-16 max-[900px]:w-16 max-[680px]:h-12 max-[680px]:w-12"
                viewBox="0 0 70 46"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <ellipse cx="35" cy="10" rx="30" ry="7" />
                <path d="M5 10 C5 34 20 42 35 42 C50 42 65 34 65 10" />
              </svg>
            </div>

            <div>
              <h3 className="m-0 [color:var(--forest)] [font-family:var(--font-display)] text-[clamp(1.4rem,2.2vw,2.2rem)] font-normal max-[680px]:text-[1.15rem]">
                Mix
              </h3>
              <p className="mx-auto mt-2 max-w-[280px] text-[0.84rem] leading-[1.55] text-[var(--muted)] max-[680px]:mt-1 max-[680px]:text-[0.72rem] max-[680px]:leading-[1.35]">
                Add water gradually until the texture is smooth and spreadable.
              </p>
            </div>
          </article>

          {/* Step 03: Apply */}
          <article className="relative flex flex-col items-center justify-between px-8 py-10 text-center max-[900px]:px-4 max-[900px]:py-7 max-[680px]:px-2.5 max-[680px]:py-5">
            <span className="self-start font-mono text-[0.76rem] font-bold tracking-[0.15em] text-[var(--botanical)] max-[680px]:text-[0.68rem]">
              03
            </span>

            {/* Droplet & Ripples Icon */}
            <div className="my-6 flex items-center justify-center max-[680px]:my-3">
              <svg
                className="h-20 w-16 text-[var(--forest)] max-[900px]:h-16 max-[900px]:w-12 max-[680px]:h-12 max-[680px]:w-9"
                viewBox="0 0 52 70"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M26 6 C26 6 12 26 12 37 C12 45 18 50 26 50 C34 50 40 45 40 37 C40 26 26 6 26 6 Z" />
                <line x1="12" y1="58" x2="40" y2="58" strokeWidth="1.3" />
                <line x1="8" y1="63" x2="44" y2="63" strokeWidth="1.3" />
                <line x1="14" y1="68" x2="38" y2="68" strokeWidth="1.3" />
              </svg>
            </div>

            <div>
              <h3 className="m-0 [color:var(--forest)] [font-family:var(--font-display)] text-[clamp(1.4rem,2.2vw,2.2rem)] font-normal max-[680px]:text-[1.15rem]">
                Apply
              </h3>
              <p className="mx-auto mt-2 max-w-[280px] text-[0.84rem] leading-[1.55] text-[var(--muted)] max-[680px]:mt-1 max-[680px]:text-[0.72rem] max-[680px]:leading-[1.35]">
                Follow the botanical directions, then rinse thoroughly.
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* ── Ingredient Clarity (One ingredient. Nothing hidden) ── */}
      <section
        className={`mx-auto grid w-full max-w-[1440px] scroll-mt-[calc(var(--header-height)+24px)] grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] items-center gap-[clamp(32px,5.5vw,88px)] px-[clamp(24px,5vw,72px)] py-[clamp(60px,7vw,110px)] max-[900px]:gap-8 max-[768px]:grid-cols-1 max-[768px]:gap-8 max-[680px]:px-4 max-[680px]:py-9 ${revealClass}`}
        id="ingredient-standards"
        aria-labelledby="purity-title"
      >
        {/* Left Column: Arched Image with Badge */}
        <div className="relative mx-auto w-full max-w-[480px] max-[768px]:max-w-[340px]">
          <div className="relative aspect-[0.72] w-full overflow-hidden rounded-[160px_160px_6px_6px] bg-[var(--beige)] shadow-[0_8px_24px_rgba(23,63,42,0.06)] max-[900px]:rounded-[110px_110px_4px_4px] max-[680px]:rounded-[90px_90px_4px_4px]">
            <Image
              src={ritualPoster.url}
              alt={
                ritualPoster.altText ||
                "A botanical hair ritual being prepared in a bowl"
              }
              fill
              sizes="(max-width: 680px) 80vw, (max-width: 900px) 45vw, 45vw"
              className="object-cover object-center"
            />
            {/* Dark circular brand badge 'N' */}
            <span
              className="absolute bottom-3.5 left-3.5 grid size-8 place-items-center rounded-full bg-[#18281d] text-[0.74rem] font-serif font-bold text-[#faf8f4] shadow-md max-[680px]:bottom-2.5 max-[680px]:left-2.5 max-[680px]:size-7 max-[680px]:text-[0.65rem]"
              aria-hidden="true"
            >
              N
            </span>
          </div>
          <span className="mt-3 block text-[0.72rem] font-bold tracking-[0.16em] text-[var(--muted)] uppercase max-[680px]:mt-2 max-[680px]:text-[0.68rem] text-center sm:text-left">
            Botanical ritual · prepared fresh
          </span>
        </div>

        {/* Right Column: Heading, description, 3 numbered points, CTA */}
        <div>
          <p className="mb-2 text-[0.74rem] font-bold uppercase tracking-[0.18em] text-[var(--botanical)] max-[680px]:mb-1 max-[680px]:text-[0.68rem]">
            Ingredient clarity
          </p>
          <h2
            className="m-0 [font-family:var(--font-display)] text-[clamp(2.2rem,3.4vw,3.6rem)] font-normal leading-[1.0] tracking-[-0.035em] text-[var(--forest)] max-[900px]:text-[2rem] max-[680px]:text-[1.75rem]"
            id="purity-title"
          >
            One ingredient. <br />
            Nothing hidden.
          </h2>
          <p className="my-4 max-w-[540px] text-[0.92rem] leading-[1.65] text-[var(--muted)] max-[900px]:text-[0.88rem] max-[680px]:my-3 max-[680px]:text-[0.84rem] max-[680px]:leading-[1.5]">
            NatureMist translates a time-honoured practice into a ritual you can understand from first scoop to final rinse.
          </p>

          {/* 3 Points List */}
          <div className="border-t border-[var(--line)]">
            <article className="grid grid-cols-[34px_1fr] items-start gap-3 border-b border-[var(--line)] py-4 max-[680px]:grid-cols-[28px_1fr] max-[680px]:gap-2.5 max-[680px]:py-3">
              <span className="font-mono text-[0.82rem] font-bold text-[var(--botanical)] pt-0.5 tracking-wider leading-none select-none max-[680px]:text-[0.76rem]">
                01
              </span>
              <div>
                <h3 className="m-0 [color:var(--forest)] [font-family:var(--font-display)] text-[clamp(1.15rem,1.4vw,1.35rem)] font-medium leading-[1.25] max-[680px]:text-[1.08rem]">
                  Name the botanical
                </h3>
                <p className="mt-1 mb-0 text-[0.86rem] leading-[1.6] text-[var(--muted)] max-[680px]:text-[0.78rem] max-[680px]:leading-[1.45]">
                  Common name, botanical identity and plant part—clearly stated on the final pack.
                </p>
              </div>
            </article>

            <article className="grid grid-cols-[34px_1fr] items-start gap-3 border-b border-[var(--line)] py-4 max-[680px]:grid-cols-[28px_1fr] max-[680px]:gap-2.5 max-[680px]:py-3">
              <span className="font-mono text-[0.82rem] font-bold text-[var(--botanical)] pt-0.5 tracking-wider leading-none select-none max-[680px]:text-[0.76rem]">
                02
              </span>
              <div>
                <h3 className="m-0 [color:var(--forest)] [font-family:var(--font-display)] text-[clamp(1.15rem,1.4vw,1.35rem)] font-medium leading-[1.25] max-[680px]:text-[1.08rem]">
                  Explain the ritual
                </h3>
                <p className="mt-1 mb-0 text-[0.86rem] leading-[1.6] text-[var(--muted)] max-[680px]:text-[0.78rem] max-[680px]:leading-[1.45]">
                  Preparation, pairing and safety guidance written for beginners as well as familiar users.
                </p>
              </div>
            </article>

            <article className="grid grid-cols-[34px_1fr] items-start gap-3 border-b border-[var(--line)] py-4 max-[680px]:grid-cols-[28px_1fr] max-[680px]:gap-2.5 max-[680px]:py-3">
              <span className="font-mono text-[0.82rem] font-bold text-[var(--botanical)] pt-0.5 tracking-wider leading-none select-none max-[680px]:text-[0.76rem]">
                03
              </span>
              <div>
                <h3 className="m-0 [color:var(--forest)] [font-family:var(--font-display)] text-[clamp(1.15rem,1.4vw,1.35rem)] font-medium leading-[1.25] max-[680px]:text-[1.08rem]">
                  Keep claims honest
                </h3>
                <p className="mt-1 mb-0 text-[0.86rem] leading-[1.6] text-[var(--muted)] max-[680px]:text-[0.78rem] max-[680px]:leading-[1.45]">
                  Thoughtful cosmetic language without miracle promises or invented proof.
                </p>
              </div>
            </article>
          </div>

          {/* Philosophy CTA Button */}
          <Link
            className="mt-7 inline-flex min-h-[46px] items-center justify-center gap-2 rounded-full border border-[var(--forest)] bg-transparent px-7 py-3 text-[0.74rem] font-bold uppercase tracking-[0.1em] text-[var(--forest)] transition-all hover:bg-[var(--forest)] hover:text-[var(--paper)] max-[680px]:mt-5 max-[680px]:min-h-[40px] max-[680px]:px-5 max-[680px]:text-[0.7rem]"
            href="/our-story"
          >
            Read our philosophy <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>

      <section
        className={`${sectionClass} ${revealClass} max-[680px]:py-8 max-[680px]:px-4`}
        aria-labelledby="family-title"
      >
        <div className={`${centeredHeadingClass} max-[680px]:mb-5`}>
          <p className={`${eyebrowClass} max-[680px]:mb-1.5 max-[680px]:text-[0.68rem]`}>The Botanical Family</p>
          <h2 className={`${sectionTitleClass} max-[680px]:!text-[clamp(1.4rem,5.5vw,1.95rem)] max-[680px]:!leading-[1.12]`} id="family-title">
            Same ritual language. <br className="hidden max-[680px]:inline" />
            A different botanical note.
          </h2>
          <p className="mx-auto mt-6 max-w-[620px] text-[var(--muted)] max-[680px]:hidden">
            Move through the collection and find the ingredient that meets you where your hair is today.
          </p>
        </div>
        <FeaturedProductSwitcher />
      </section>

      {/* ── The NatureMist Philosophy (Ancient botanicals. Modern care.) ── */}
      <section
        className={`mx-auto w-full max-w-[1440px] px-[clamp(24px,5vw,72px)] py-[clamp(40px,6vw,80px)] max-[680px]:px-4 max-[680px]:py-8 ${revealClass}`}
        aria-labelledby="story-title"
      >
        <div className="relative overflow-hidden rounded-[32px] border border-[#1b3d2b] bg-[#0c2419] bg-[radial-gradient(ellipse_at_50%_35%,rgba(167,201,67,0.2),transparent_65%),linear-gradient(160deg,#0e2a1e_0%,#071710_100%)] px-6 py-20 text-center shadow-[0_24px_64px_rgba(0,0,0,0.25)] max-[680px]:px-4 max-[680px]:py-12 max-[680px]:rounded-2xl">
          {/* Subtle Botanical Leaf Outline Watermark */}
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-15"
            aria-hidden="true"
          >
            <svg
              className="size-[340px] text-[#c8d88e] max-[680px]:size-[220px]"
              viewBox="0 0 200 200"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M100 20 C100 20 160 60 160 110 C160 145 135 175 100 180 C65 175 40 145 40 110 C40 60 100 20 100 20 Z" />
              <line x1="100" y1="20" x2="100" y2="180" strokeWidth="1.2" />
              <path d="M100 60 Q130 75 145 95" />
              <path d="M100 60 Q70 75 55 95" />
              <path d="M100 100 Q135 115 150 135" />
              <path d="M100 100 Q65 115 50 135" />
              <path d="M100 140 Q125 150 135 160" />
              <path d="M100 140 Q75 150 65 160" />
            </svg>
          </div>

          <div className="relative z-10 mx-auto flex max-w-[840px] flex-col items-center">
            <p className="mb-3 text-[0.74rem] font-bold uppercase tracking-[0.22em] text-[#c8d88e] max-[680px]:mb-1.5 max-[680px]:text-[0.66rem]">
              The NatureMist philosophy
            </p>
            <h2
              className="m-0 text-[clamp(2.8rem,5.5vw,5.5rem)] font-normal leading-[0.94] tracking-[-0.045em] text-[#fbfaf6] [font-family:var(--font-display)] max-[680px]:text-[2.2rem]"
              id="story-title"
            >
              Ancient botanicals.<br />Modern care.
            </h2>
            <p className="mx-auto my-6 max-w-[620px] text-[1.05rem] leading-[1.7] text-white/80 max-[680px]:hidden">
              Beauty begins at the root—with ingredients we can name, rituals we can understand and enough time to care for ourselves well.
            </p>
            <Link
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-[#fbfaf6] px-8 py-3 text-[0.74rem] font-bold uppercase tracking-[0.14em] text-[#0c2419] shadow-[0_8px_24px_rgba(0,0,0,0.25)] transition-all duration-300 hover:bg-[#c8d88e] hover:shadow-[0_12px_32px_rgba(200,216,142,0.3)] hover:-translate-y-0.5 active:scale-95 max-[680px]:min-h-[40px] max-[680px]:px-6 max-[680px]:py-2.5 max-[680px]:text-[0.68rem]"
              href="/our-story"
            >
              Our story <span aria-hidden="true">↗</span>
            </Link>

            {/* 3 Pillars Footer Bar */}
            <div className="mt-14 flex w-full items-center justify-between border-t border-white/12 pt-6 text-[0.76rem] font-medium tracking-[0.16em] uppercase text-white/70 max-[680px]:mt-8 max-[680px]:pt-5 max-[680px]:flex-col max-[680px]:gap-2 max-[680px]:text-[0.68rem]">
              <span>Tradition, refined</span>
              <span className="max-[680px]:hidden text-white/30">·</span>
              <span>Education before expectation</span>
              <span className="max-[680px]:hidden text-white/30">·</span>
              <span>Care without clutter</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Botanicals that belong together (Ritual Sets) ── */}
      <section
        className={`${sectionClass} ${revealClass} max-[680px]:py-8 max-[680px]:px-4`}
        aria-labelledby="bundles-title"
      >
        <div className={`${splitHeadingClass} max-[680px]:mb-5 max-[680px]:gap-2`}>
          <div>
            <p className={`${eyebrowClass} max-[680px]:block max-[680px]:text-[0.68rem] max-[680px]:mb-1`}>Rituals in company</p>
            <h2 className={`${sectionTitleClass} max-[680px]:!text-[clamp(1.4rem,5.5vw,1.95rem)] max-[680px]:!leading-[1.12]`} id="bundles-title">
              Botanicals that belong together.
            </h2>
          </div>
          <p className="max-w-[460px] pb-1 leading-[1.75] text-[var(--muted)] max-[900px]:p-0 max-[680px]:hidden">
            Build a wash day, deepen a conditioning mask or keep the full botanical cabinet close.
          </p>
        </div>
        <BundleCards />
      </section>

      {/* ── Community Videos & Customer Reviews Section ── */}
      <VideoReviewsSection />

      {/* ── The Ritual Room (FAQ) - Integrated Luxury Dark Footer-Attached Styling ── */}
      <section
        className="relative overflow-hidden bg-[#0c2419] bg-[radial-gradient(circle_at_10%_0%,rgba(183,212,90,0.14),transparent_35%),linear-gradient(160deg,#0e2a1e_0%,#071710_100%)] px-[clamp(25px,6vw,96px)] py-[clamp(75px,8vw,110px)] text-white/80 before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(rgba(255,255,255,0.12)_0.5px,transparent_0.5px)] before:bg-size-[9px_9px] before:opacity-10 max-[680px]:px-4 max-[680px]:py-10"
        id="faq"
        aria-labelledby="faq-title"
      >
        <div className="mx-auto grid max-w-[1440px] grid-cols-[0.75fr_1.25fr] items-start gap-[clamp(48px,6vw,84px)] max-[900px]:grid-cols-1 max-[900px]:gap-8">
          {/* Left Heading Column */}
          <div>
            <p className="mb-3 text-[0.76rem] font-bold uppercase tracking-[0.2em] text-[#c8d88e] max-[680px]:mb-2 max-[680px]:text-[0.7rem]">
              Good questions, clearly answered
            </p>
            <h2
              className="m-0 font-serif text-[clamp(2.8rem,4.8vw,5.2rem)] font-normal leading-[0.94] tracking-[-0.045em] text-[#fbfaf6] max-[680px]:text-[clamp(2.2rem,9vw,2.8rem)]"
              id="faq-title"
            >
              The ritual room.
            </h2>
            <p className="mt-4 mb-6 max-w-[380px] text-[0.98rem] leading-[1.7] text-white/80 max-[680px]:my-3 max-[680px]:text-[0.88rem]">
              Begin with curiosity. Continue with care.
            </p>
            <Link
              className="inline-flex min-h-[46px] items-center gap-2 rounded-full border border-white/25 bg-white/5 px-7 py-3 text-[0.76rem] font-bold tracking-[0.12em] uppercase text-[#fbfaf6] backdrop-blur-sm transition-all duration-200 hover:border-[#c8d88e] hover:bg-[#c8d88e] hover:text-[#0c2419] max-[680px]:min-h-[42px] max-[680px]:px-5 max-[680px]:text-[0.72rem]"
              href="/rituals"
            >
              Explore all ritual guidance <span aria-hidden="true">↗</span>
            </Link>
          </div>

          {/* Right Accordion Column */}
          <div className="border-t border-white/15">
            {homeFaqs.map((faq, index) => (
              <details
                className="group/faq border-b border-white/15 transition-colors duration-200"
                key={faq.question}
                open={index === 0}
              >
                <summary className="grid min-h-[74px] cursor-pointer list-none grid-cols-[38px_1fr_28px] items-center gap-4 text-[clamp(1.15rem,1.7vw,1.48rem)] font-normal text-[#fbfaf6] [font-family:var(--font-display)] transition-colors duration-200 hover:text-[#c8d88e] [&::-webkit-details-marker]:hidden max-[680px]:grid-cols-[28px_1fr_24px] max-[680px]:text-[1.1rem] max-[680px]:min-h-[60px] max-[680px]:gap-3">
                  <span className="font-mono text-[0.78rem] font-bold text-[#c8d88e] max-[680px]:text-[0.72rem]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{faq.question}</span>
                  <i className="font-sans text-[1.2rem] font-light not-italic text-[#c8d88e] transition-transform duration-300 group-open/faq:rotate-45 max-[680px]:text-[1.05rem]">
                    ＋
                  </i>
                </summary>
                <p className="m-0 max-w-[680px] pt-0 pr-6 pb-6 pl-13 text-[0.92rem] leading-[1.7] text-white/80 max-[680px]:pl-10 max-[680px]:pb-4 max-[680px]:text-[0.84rem] max-[680px]:leading-[1.6]">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
