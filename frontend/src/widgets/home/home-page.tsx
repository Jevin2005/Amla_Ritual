"use client";

import Link from "next/link";
import { useMemo, useState, type CSSProperties } from "react";
import { getImageHeroProducts } from "@/domain/catalog/image-hero";
import { buildCollectionCatalog, type CollectionKind } from "@/domain/collection-catalog";
import { CollectionGrid } from "@/features/catalog/collection-grid";
import { CollectionTypeFilter } from "@/features/catalog/collection-type-filter";
import { useStore } from "@/features/store/store-provider";
import { MagneticLink } from "@/shared/ui/magnetic-link";
import { IngredientClarity } from "./ingredient-clarity";
import { ProductHero } from "./product-hero";
import { PreviousProductHero } from "./previous-product-hero";
import { ProductBenefits } from "./product-benefits";
import { BuildYourRitual } from "./build-your-ritual";
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
const textLinkClass =
  "inline-flex items-center gap-[14px] border-b border-[var(--forest)] pb-[5px] text-[0.76rem] font-bold tracking-[0.08em] text-[var(--forest)] uppercase [transition:gap_260ms_var(--ease)] motion-reduce:transition-none hover:gap-[22px] max-[680px]:min-h-11";
const revealClass =
  "[transition:opacity_650ms_var(--ease),transform_650ms_var(--ease)]";

export function HomePage() {
  const { products, content, source, track } = useStore();
  const [collectionKind, setCollectionKind] = useState<CollectionKind>("all");
  const collectionEntries = useMemo(() => buildCollectionCatalog(products, content.botanicalCombos.enabled ? content.botanicalCombos.combos : [], source), [products, content.botanicalCombos, source]);
  const displayedEntries = collectionEntries.filter((entry) => collectionKind === "all" || (collectionKind === "combos" ? entry.kind === "combo" : entry.kind === "product"));
  const individualCount = collectionEntries.filter((entry) => entry.kind === "product").length;
  const homeMotion = useMemo(() => ({ ...content.motionSettings, duration: content.motionSettings.duration * 1.25 }), [content.motionSettings]);

  if (!products.length) {
    return (
      <main className="grid min-h-[70vh] place-items-center px-[var(--page-pad)] py-24 text-center" id="main-content">
        <div className="max-w-[660px]">
          <p className={eyebrowClass}>NatureMist catalog</p>
          <h1 className="m-0 font-serif text-[clamp(3rem,7vw,6rem)] font-normal leading-[0.92] tracking-[-0.05em] text-[var(--forest)]">
            The next ritual is being prepared.
          </h1>
          <p className="mx-auto mt-7 max-w-[540px] text-[var(--muted)]">
            Products will appear here as soon as our fresh botanical harvest is released.
          </p>
        </div>
      </main>
    );
  }

  const hasHero = getImageHeroProducts(products).length > 0;
  const CollectionHeading = hasHero ? "h2" : "h1";
  return (
    <main className="overflow-x-clip" id="main-content" data-home-motion="calm" style={{ "--motion-duration": homeMotion.duration } as CSSProperties}>
      <ProductHero products={products} settings={content.heroSettings} />
      <PreviousProductHero products={products} settings={content.heroSettings} />
      <section
        id="botanical-collection"
        className={`mx-auto w-full max-w-[1440px] px-[clamp(24px,5vw,72px)] py-[clamp(70px,7vw,110px)] max-[680px]:px-3 max-[680px]:py-8 max-[420px]:px-2.5 max-[420px]:py-6 ${revealClass}`}
        aria-labelledby="collection-title"
      >
        {/* ── Section heading ── */}
        <div data-motion-reveal className="mb-[clamp(36px,4vw,60px)] grid grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] items-end gap-x-[clamp(24px,4vw,64px)] max-[900px]:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] max-[900px]:gap-x-6 max-[680px]:mb-5 max-[680px]:grid-cols-1 max-[680px]:gap-y-2">
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
              Your favourite botanicals, individually or thoughtfully paired.
              Find a single jar or a combo for your everyday ritual.
            </p>
            <MagneticLink
              className={`${textLinkClass} max-[680px]:text-[0.6rem] max-[680px]:min-h-[34px]`}
              href="/shop"
            >
              Explore the full collection <span aria-hidden="true">↗</span>
            </MagneticLink>
          </div>
        </div>

        <CollectionTypeFilter value={collectionKind} onChange={(next) => { setCollectionKind(next); track("filter_applied", { filter: "type", value: next, placement: "home_collection" }); }} counts={{ all: collectionEntries.length, individual: individualCount, combos: collectionEntries.length - individualCount }} />
        <p className="sr-only" role="status" aria-live="polite">{displayedEntries.length} items in the collection</p>
        {displayedEntries.length ? <CollectionGrid entries={displayedEntries} eagerImages={!hasHero} /> : <p className="rounded-2xl border border-[var(--line)] bg-[var(--paper)] px-6 py-10 text-center text-[var(--muted)]">New combos are on their way. Explore the individual powders in the meantime.</p>}
      </section>

      <ProductBenefits motionSettings={content.motionSettings} />

      <BuildYourRitual />

      {/* ── The Art of Preparation (Three steps. One unhurried ritual) ── */}
      <section
        className={`${sectionClass} ${revealClass} max-[680px]:py-10 max-[680px]:px-3.5`}
        aria-labelledby="prepare-title"
      >
        <div data-motion-reveal className={splitHeadingClass}>
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

      <IngredientClarity />


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
              href="/faqs"
            >
              Read all FAQs <span aria-hidden="true">↗</span>
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
