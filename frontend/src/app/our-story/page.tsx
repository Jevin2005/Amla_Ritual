import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ProductJar } from "@/features/catalog/product-jar";
import { getStorefront } from "@/lib/shopify/storefront";

// ─── Data ─────────────────────────────────────────────────────────────────────
const processSteps = [
  {
    number: "01",
    title: "Name the botanical",
    icon: "🌿",
    copy: "Every ritual begins with identity: the accepted botanical name and the exact plant part intended for the powder—fruit, leaf, root, flower or pod.",
  },
  {
    number: "02",
    title: "Choose the source",
    icon: "🗺",
    copy: "The supplier, origin information and available quality records are considered against the needs of each herb. We publish specific provenance only when it is verified.",
  },
  {
    number: "03",
    title: "Sort and prepare",
    icon: "✋",
    copy: "Raw botanicals are carefully sorted and prepared before milling. The goal is simple: a clean, consistent starting material with its natural character intact.",
  },
  {
    number: "04",
    title: "Mill and sieve",
    icon: "⚙",
    copy: "Dry botanicals are milled and sieved toward a fine, even texture that mixes smoothly into a modern beauty ritual. The exact method can differ by ingredient.",
  },
  {
    number: "05",
    title: "Review the batch",
    icon: "🔬",
    copy: "Appearance, aroma, texture and the required batch records are reviewed before release. We name a quality check or certification only after it is complete and documented.",
  },
  {
    number: "06",
    title: "Fill, seal and guide",
    icon: "📦",
    copy: "The finished powder is protected from moisture and paired with clear identity, storage, preparation and safety guidance—so the care continues after the pack is opened.",
  },
];

const chapters = [
  {
    number: "Chapter 01",
    title: "Ancient Roots",
    headline: "Botanicals with centuries of ritual behind them.",
    copy: "India's beauty tradition is one of the world's oldest—rooted in the careful observation of plants, their parts, and how they respond to preparation. Amla, Reetha, Shikakai, Bhringraj: these are not trends. They are documented, practiced and passed down across generations. NatureMist begins by understanding that lineage before touching the ingredient.",
    accent: "#b7c7a9",
    imageSide: "right" as const,
    stat: "6 botanicals · centuries of ritual knowledge",
  },
  {
    number: "Chapter 02",
    title: "The Sourcing Journey",
    headline: "We name a source only when we can stand behind it.",
    copy: "Our supply chain is guided by one principle: transparency earns trust, silence loses it. Each herb is considered for its botanical identity, plant part, origin and quality record. We publish provenance details only when we have verified them—and we never substitute clarity with imagery. The right botanical, from an identifiable source, prepared the right way.",
    accent: "#d5b990",
    imageSide: "left" as const,
    stat: "Single-botanical · no blends · no fillers",
  },
  {
    number: "Chapter 03",
    title: "Prepared with Care",
    headline: "The texture must serve the ritual, not the shelf.",
    copy: "A beautiful powder is not merely decorative—it must dissolve cleanly into water, mix smoothly in a bowl, spread evenly through hair. Our preparation standard holds each botanical to a consistent texture goal: fine, even, practical. Raw botanicals are sorted, cleaned and milled with care appropriate to the ingredient. The goal at every step is the same—preserve the plant's natural character.",
    accent: "#c4b5d4",
    imageSide: "right" as const,
    stat: "Finely milled · clean starting material",
  },
];

const standards = [
  { number: "01", title: "Identity before imagery", copy: "Common name, botanical identity and plant part should be easy to find and easy to understand.", icon: "◎" },
  { number: "02", title: "A texture made for ritual", copy: "The finished powder should be practical to measure, mix and apply—not merely beautiful on a shelf.", icon: "◈" },
  { number: "03", title: "Claims with evidence", copy: "Origin, processing, testing and certification details belong on the page only when the records support them.", icon: "◇" },
  { number: "04", title: "Guidance that earns trust", copy: "Preparation, storage, patch testing and ingredient-specific cautions are part of the product experience.", icon: "◉" },
];

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "Our Story — NatureMist",
  description: "Follow the NatureMist journey from clearly identified beauty botanicals to considered powders, careful guidance and modern rituals.",
  alternates: { canonical: "/our-story" },
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function OurStoryPage() {
  const { content, products } = await getStorefront();

  return (
    <main id="main-content" className="overflow-hidden">

      {/* ════════════════════════════════════════════════════
          §1  HERO
      ════════════════════════════════════════════════════ */}
      <section className="relative min-h-[100svh] overflow-hidden bg-[var(--forest-dark)]">
        {/* Background */}
        <div className="absolute inset-0">
          <Image
            src={content.storyPoster.url}
            alt={content.storyPoster.altText}
            fill priority sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(5,20,13,0.84)_0%,rgba(5,20,13,0.56)_50%,rgba(5,20,13,0.22)_100%)] max-[680px]:bg-[linear-gradient(180deg,rgba(5,20,13,0.52)_0%,rgba(5,20,13,0.90)_68%)]" />
        </div>

        {/* Content */}
        <div className="relative z-[2] mx-auto flex min-h-[100svh] w-full max-w-[1440px] flex-col justify-center px-[var(--page-pad)] py-[130px] text-[var(--paper)] max-[680px]:justify-end max-[680px]:px-4 max-[680px]:pb-[88px] max-[680px]:pt-[110px]">
          <div className="max-w-[860px]">

            {/* Eyebrow */}
            <p className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-white/18 bg-white/8 px-4 py-2.5 text-[0.65rem] font-bold uppercase tracking-[0.22em] text-[#c8d88e] backdrop-blur-md max-[680px]:mb-5 max-[680px]:gap-2 max-[680px]:px-3 max-[680px]:py-2 max-[680px]:text-[0.56rem]">
              <span className="relative flex size-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--amla)] opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-[var(--amla)]" />
              </span>
              Our story · From earth to ritual
            </p>

            {/* Headline */}
            <h1 className="m-0 max-w-[14ch] font-serif text-[clamp(4rem,8vw,9.5rem)] font-normal leading-[0.81] tracking-[-0.07em] text-balance max-[680px]:text-[clamp(2.9rem,12.5vw,4.5rem)] max-[680px]:leading-[0.85]">
              Nature,
              <em className="block font-normal text-[#c8d88e]">carefully</em>
              <em className="block font-normal text-white">translated.</em>
            </h1>

            {/* Sub-copy */}
            <p className="mb-0 mt-10 max-w-[560px] text-[1.05rem] leading-[1.76] text-white/68 max-[680px]:mt-5 max-[680px]:max-w-full max-[680px]:text-[0.82rem] max-[680px]:leading-[1.62]">
              Beauty botanicals carry generations of ritual knowledge. NatureMist brings them forward through a considered path—from plant identity and careful preparation to the powder ready in your bowl.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-wrap items-center gap-5 max-[680px]:mt-7 max-[680px]:gap-3">
              <a
                href="#story"
                className="inline-flex min-h-[52px] items-center justify-center gap-3 rounded-full bg-white px-8 py-3.5 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-[var(--forest-dark)] shadow-[0_16px_40px_rgba(0,0,0,0.26)] transition-[transform,background-color] duration-300 hover:-translate-y-0.5 hover:bg-[var(--amla)] max-[680px]:min-h-[44px] max-[680px]:px-5 max-[680px]:text-[0.62rem] max-[680px]:tracking-[0.12em]"
              >
                Follow the making
                <span aria-hidden="true">↓</span>
              </a>
              <Link
                href="/shop"
                className="inline-flex min-h-[52px] items-center gap-2 border-b border-white/40 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-white transition-colors duration-300 hover:border-[var(--amla)] hover:text-[var(--amla)] max-[680px]:min-h-[44px] max-[680px]:text-[0.62rem]"
              >
                Meet the botanicals <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom stats bar — desktop/tablet only */}
        <div className="absolute inset-x-0 bottom-0 z-[2] border-t border-white/12 bg-black/24 backdrop-blur-lg max-[680px]:hidden">
          <div className="mx-auto grid max-w-[1440px] grid-cols-3 divide-x divide-white/12 px-[var(--page-pad)]">
            {[
              { n: "01", label: "Botanical identity" },
              { n: "02", label: "Considered preparation" },
              { n: "03", label: "Clear ritual guidance" },
            ].map(({ n, label }) => (
              <p key={n} className="m-0 flex min-h-[72px] items-center gap-5 px-8 text-[0.64rem] font-bold uppercase tracking-[0.18em] text-white/55 first:pl-0">
                <span className="font-serif text-[1.15rem] font-normal text-[var(--amla)]">{n}</span>
                {label}
              </p>
            ))}
          </div>
        </div>

        {/* Mobile stats — below hero text, above bottom */}
        <div className="absolute inset-x-0 bottom-0 z-[2] hidden max-[680px]:block">
          <div className="flex items-center justify-around border-t border-white/12 bg-black/30 px-4 py-3 backdrop-blur-lg">
            {[{ n: "01", l: "Identity" }, { n: "02", l: "Preparation" }, { n: "03", l: "Guidance" }].map(({ n, l }) => (
              <div key={n} className="flex flex-col items-center gap-0.5">
                <span className="font-serif text-[0.9rem] text-[var(--amla)]">{n}</span>
                <span className="text-[0.48rem] font-bold uppercase tracking-[0.16em] text-white/50">{l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          §2  PHILOSOPHY STRIP
      ════════════════════════════════════════════════════ */}
      <section
        id="story"
        className="scroll-mt-[var(--header-height)] border-b border-[var(--line)] bg-[var(--paper)] py-[clamp(90px,10vw,150px)] max-[680px]:py-14"
      >
        <div className="mx-auto max-w-[1440px] px-[var(--page-pad)] max-[680px]:px-4">

          {/* Pull-quote */}
          <div className="mx-auto max-w-[860px] text-center">
            <span className="mb-6 block font-serif text-[4rem] leading-none text-[var(--botanical)] max-[680px]:mb-4 max-[680px]:text-[2.8rem]">"</span>
            <blockquote className="m-0 font-serif text-[clamp(2rem,3.8vw,4.2rem)] font-normal leading-[1.08] tracking-[-0.055em] text-[var(--forest)] text-balance max-[680px]:text-[clamp(1.42rem,6.5vw,2.1rem)] max-[680px]:leading-[1.14]">
              True luxury lies in transparency. We honour the plant, the soil, and the centuries of knowledge that bring them together.
            </blockquote>
            <p className="mt-7 text-[0.66rem] font-bold uppercase tracking-[0.22em] text-[var(--botanical)] max-[680px]:mt-5 max-[680px]:text-[0.54rem]">
              — The NatureMist Founding Principle
            </p>
          </div>

          {/* Stat tiles */}
          <div className="mt-[clamp(60px,7vw,96px)] grid grid-cols-3 gap-px overflow-hidden rounded-[var(--radius-lg)] bg-[var(--line)] ring-1 ring-[var(--line)] max-[680px]:mt-10 max-[680px]:grid-cols-1 max-[680px]:rounded-[var(--radius-md)]">
            {[
              { stat: "6", label: "Single botanicals", desc: "Each sold alone, never blended away from identity" },
              { stat: "100%", label: "Natural origin", desc: "No fillers, carriers or synthetic additions" },
              { stat: "Clear", label: "Ritual guidance", desc: "Preparation, safety and storage on every pack" },
            ].map(({ stat, label, desc }) => (
              <div key={label} className="bg-[var(--paper)] p-[clamp(24px,3.5vw,44px)] max-[680px]:p-5">
                <p className="m-0 font-serif text-[clamp(2.8rem,5vw,5.5rem)] font-normal leading-[0.88] tracking-[-0.06em] text-[var(--forest)] max-[680px]:text-[2.2rem]">{stat}</p>
                <p className="mt-3 text-[0.72rem] font-bold uppercase tracking-[0.16em] text-[var(--botanical)] max-[680px]:mt-2 max-[680px]:text-[0.6rem]">{label}</p>
                <p className="mb-0 mt-2 max-w-[280px] text-[0.82rem] leading-[1.65] text-[var(--muted)] max-[680px]:mt-1.5 max-[680px]:text-[0.74rem] max-[680px]:leading-[1.55]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          §3  STORY CHAPTERS
      ════════════════════════════════════════════════════ */}
      <section className="bg-[var(--surface-warm)] py-[clamp(90px,9vw,140px)] max-[680px]:py-14">
        <div className="mx-auto max-w-[1440px] px-[var(--page-pad)] max-[680px]:px-4">

          {/* Section header */}
          <div className="mb-[clamp(64px,7vw,100px)] max-[680px]:mb-10">
            <p className="mb-3 text-[0.68rem] font-bold uppercase tracking-[0.22em] text-[var(--botanical)] max-[680px]:mb-2 max-[680px]:text-[0.58rem]">
              The production story
            </p>
            <h2 className="m-0 max-w-[720px] font-serif text-[clamp(3rem,5vw,5.8rem)] font-normal leading-[0.9] tracking-[-0.06em] text-[var(--forest)] text-balance max-[680px]:text-[clamp(2rem,9.5vw,3rem)] max-[680px]:leading-[0.94]">
              From living plant to
              <em className="font-normal text-[var(--botanical)]"> ritual powder.</em>
            </h2>
          </div>

          {/* Alternating chapters */}
          <div className="space-y-[clamp(80px,10vw,140px)] max-[680px]:space-y-12">
            {chapters.map((chapter, i) => (
              <article
                key={chapter.number}
                className={`grid items-center gap-[clamp(40px,6vw,90px)] max-[800px]:grid-cols-1 max-[800px]:gap-8 max-[680px]:gap-6 ${chapter.imageSide === "right" ? "grid-cols-[1.1fr_0.9fr]" : "grid-cols-[0.9fr_1.1fr]"
                  }`}
              >
                {/* Text block */}
                <div className={chapter.imageSide === "left" ? "order-2 max-[800px]:order-1" : ""}>
                  <p className="mb-4 text-[0.64rem] font-bold uppercase tracking-[0.22em] text-[var(--botanical)] max-[680px]:mb-2.5 max-[680px]:text-[0.54rem]">
                    {chapter.number}
                  </p>
                  <h3 className="m-0 font-serif text-[clamp(2.4rem,3.8vw,4.5rem)] font-normal leading-[0.92] tracking-[-0.055em] text-[var(--forest)] text-balance max-[680px]:text-[clamp(1.6rem,7.5vw,2.4rem)] max-[680px]:leading-[1.0]">
                    {chapter.headline}
                  </h3>
                  <div className="my-5 h-px max-w-[60px] max-[680px]:my-4" style={{ backgroundColor: chapter.accent }} />
                  <p className="mb-0 max-w-[560px] text-[0.95rem] leading-[1.82] text-[var(--muted)] max-[680px]:text-[0.78rem] max-[680px]:leading-[1.68]">
                    {chapter.copy}
                  </p>
                  <p
                    className="mt-7 inline-flex items-center gap-3 rounded-full px-4 py-2 text-[0.62rem] font-bold uppercase tracking-[0.16em] max-[680px]:mt-5 max-[680px]:px-3 max-[680px]:py-1.5 max-[680px]:text-[0.52rem]"
                    style={{ backgroundColor: chapter.accent + "28", color: "var(--forest)" }}
                  >
                    <span className="size-1.5 rounded-full" style={{ backgroundColor: chapter.accent }} />
                    {chapter.stat}
                  </p>
                </div>

                {/* Visual panel */}
                <div className={chapter.imageSide === "left" ? "order-1 max-[800px]:order-2" : ""}>
                  <div
                    className="relative aspect-[0.82] w-full overflow-hidden rounded-[var(--radius-lg)] max-[800px]:aspect-[1.2] max-[680px]:aspect-[1.35] max-[680px]:rounded-[var(--radius-md)]"
                    style={{ backgroundColor: chapter.accent + "22" }}
                  >
                    <div
                      className="absolute inset-0 opacity-40"
                      style={{ background: `radial-gradient(ellipse at 55% 45%, ${chapter.accent}66 0%, transparent 68%)` }}
                    />
                    {/* Watermark number */}
                    <span
                      className="absolute -bottom-4 -right-4 select-none font-serif text-[clamp(6rem,18vw,20rem)] font-normal leading-none tracking-[-0.08em] opacity-[0.07] max-[680px]:text-[clamp(5rem,28vw,10rem)]"
                      style={{ color: "var(--forest)" }}
                      aria-hidden="true"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {/* Badge */}
                    <div className="absolute left-5 top-5 max-[680px]:left-3 max-[680px]:top-3">
                      <div
                        className="rounded-full border border-white/30 px-3 py-1.5 text-[0.6rem] font-bold uppercase tracking-[0.18em] backdrop-blur-sm max-[680px]:px-2.5 max-[680px]:py-1 max-[680px]:text-[0.5rem]"
                        style={{ backgroundColor: chapter.accent + "44", color: "var(--forest)" }}
                      >
                        {chapter.title}
                      </div>
                    </div>
                    {/* Center */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="font-serif text-[clamp(3rem,8vw,7rem)] font-normal leading-none tracking-[-0.06em] max-[680px]:text-[clamp(2.5rem,16vw,5rem)]" style={{ color: chapter.accent }}>
                          {String(i + 1).padStart(2, "0")}
                        </p>
                        <p className="mt-2 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[var(--forest)]/55 max-[680px]:text-[0.54rem]">
                          {chapter.title}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          §4  EARTH → POWDER timeline (dark)
      ════════════════════════════════════════════════════ */}
      <section id="making" className="scroll-mt-[var(--header-height)] bg-[var(--forest-dark)] text-[var(--paper)]">
        <div className="mx-auto w-full max-w-[1440px] px-[var(--page-pad)] py-[clamp(90px,9vw,140px)] max-[680px]:px-4 max-[680px]:py-14">

          <div className="grid grid-cols-[0.7fr_1.3fr] gap-[clamp(48px,8vw,120px)] max-[900px]:grid-cols-1 max-[900px]:gap-8 max-[680px]:gap-7">

            {/* Sticky intro */}
            <div className="self-start min-[901px]:sticky min-[901px]:top-[calc(var(--header-height)+40px)]">
              <p className="m-0 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[var(--amla)] max-[680px]:text-[0.58rem]">
                Source to seal
              </p>
              <h2 className="mb-0 mt-5 max-w-[10ch] font-serif text-[clamp(2.8rem,4.5vw,5.5rem)] font-normal leading-[0.88] tracking-[-0.06em] max-[900px]:max-w-full max-[680px]:mt-3 max-[680px]:text-[clamp(2rem,9vw,3rem)] max-[680px]:leading-[0.92]">
                Six decisions. One considered path.
              </h2>
              <p className="mb-0 mt-7 max-w-[400px] text-[0.92rem] leading-[1.78] text-white/52 max-[900px]:max-w-full max-[680px]:mt-4 max-[680px]:text-[0.76rem] max-[680px]:leading-[1.65]">
                A premium botanical product is not defined by decoration. It is defined by the care, records and useful guidance that stand behind it.
              </p>
            </div>

            {/* Steps */}
            <ol className="m-0 list-none p-0">
              {processSteps.map((step, i) => (
                <li
                  key={step.number}
                  className="relative grid grid-cols-[52px_1fr] gap-x-6 gap-y-1.5 border-t border-white/12 py-10 first:pt-0 max-[680px]:grid-cols-[38px_1fr] max-[680px]:gap-x-4 max-[680px]:py-6"
                >
                  {i < processSteps.length - 1 && (
                    <span
                      className="absolute left-[25px] top-[calc(36px+28px)] h-[calc(100%-36px-28px)] w-px bg-white/10 max-[680px]:left-[18px]"
                      aria-hidden="true"
                    />
                  )}
                  {/* Number circle */}
                  <div className="flex size-[34px] shrink-0 items-center justify-center rounded-full border border-[var(--amla)]/40 bg-[var(--amla)]/10 max-[680px]:size-[26px]">
                    <span className="font-serif text-[0.7rem] text-[var(--amla)] max-[680px]:text-[0.58rem]">{step.number}</span>
                  </div>
                  {/* Text */}
                  <div className="min-w-0">
                    <h4 className="m-0 font-serif text-[clamp(1.6rem,2.4vw,2.6rem)] font-normal leading-[1.02] tracking-[-0.04em] text-white max-[680px]:text-[clamp(1.2rem,5.5vw,1.75rem)] max-[680px]:leading-[1.06]">
                      {step.title}
                    </h4>
                    <p className="mb-0 mt-4 max-w-[580px] text-[0.88rem] leading-[1.78] text-white/52 max-[680px]:mt-2.5 max-[680px]:text-[0.74rem] max-[680px]:leading-[1.62]">
                      {step.copy}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          §5  BOTANICAL JOURNEY — editorial rows (no cards)
      ════════════════════════════════════════════════════ */}
      {products.length > 0 && (
        <section className="bg-[var(--paper)] py-[clamp(90px,9vw,140px)] max-[680px]:py-14">
          <div className="mx-auto max-w-[1440px] px-[var(--page-pad)] max-[680px]:px-4">

            {/* Header */}
            <div className="mb-[clamp(60px,7vw,96px)] grid grid-cols-[0.55fr_1.45fr] gap-[clamp(40px,7vw,100px)] max-[800px]:grid-cols-1 max-[800px]:gap-6 max-[680px]:mb-10 max-[680px]:gap-4">
              <div>
                <p className="m-0 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[var(--botanical)] max-[680px]:text-[0.58rem]">
                  The botanical cabinet
                </p>
                <h2 className="mb-0 mt-5 max-w-[9ch] font-serif text-[clamp(3rem,5vw,6rem)] font-normal leading-[0.88] tracking-[-0.065em] text-[var(--forest)] max-[680px]:mt-3 max-[680px]:text-[clamp(2rem,9vw,3.2rem)] max-[680px]:leading-[0.92]">
                  Six plants. Six distinct journeys.
                </h2>
              </div>
              <div className="self-end">
                <p className="mb-0 max-w-[580px] text-[1rem] leading-[1.8] text-[var(--muted)] max-[680px]:text-[0.78rem] max-[680px]:leading-[1.65]">
                  Each botanical arrives with its own plant part, colour, texture and ritual role. We keep those differences visible—because identity is the foundation of honest beauty.
                </p>
              </div>
            </div>

            {/* Jar rows */}
            <div className="space-y-px overflow-hidden rounded-[var(--radius-lg)] ring-1 ring-[var(--line)] max-[680px]:rounded-[var(--radius-md)]">
              {products.map((product) => (
                <Link
                  key={product.slug}
                  href={`/shop/${product.slug}`}
                  className="group relative flex min-h-[160px] items-center gap-[clamp(16px,4vw,56px)] overflow-hidden bg-[var(--paper)] px-[clamp(20px,4vw,52px)] py-6 transition-[background-color] duration-500 hover:bg-[var(--surface-warm)] max-[680px]:min-h-0 max-[680px]:gap-3 max-[680px]:px-4 max-[680px]:py-4"
                  style={{ borderLeft: `3px solid ${product.accent}` }}
                >
                  {/* Collection number */}
                  <span className="shrink-0 font-serif text-[1rem] text-[var(--forest)]/32 max-[680px]:hidden">
                    {product.collectionNumber}
                  </span>

                  {/* ProductJar — desktop */}
                  <div className="relative shrink-0 max-[680px]:hidden" aria-hidden="true">
                    <div
                      className="absolute left-1/2 top-1/2 size-[110px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-22 blur-xl"
                      style={{ backgroundColor: product.accent }}
                    />
                    <ProductJar
                      product={product}
                      size="small"
                      decorative
                      className="relative z-[1] transition-transform duration-700 group-hover:-translate-y-1.5 group-hover:scale-[1.06]"
                    />
                  </div>

                  {/* ProductJar — mobile (smaller) */}
                  <div
                    className="relative hidden shrink-0 max-[680px]:block"
                    aria-hidden="true"
                    style={{ height: 72, width: 46 }}
                  >
                    <div
                      className="absolute left-1/2 top-1/2 size-[50px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25 blur-lg"
                      style={{ backgroundColor: product.accent }}
                    />
                    <ProductJar
                      product={product}
                      size="small"
                      decorative
                      className="relative z-[1] !h-[72px] !w-[46px]"
                    />
                  </div>

                  {/* Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5 max-[680px]:gap-1.5">
                      <h3 className="m-0 font-serif text-[clamp(1.6rem,2.5vw,2.6rem)] font-normal leading-[0.98] tracking-[-0.045em] text-[var(--forest)] max-[680px]:text-[clamp(1.15rem,5vw,1.6rem)]">
                        {product.name.replace(" Powder", "")}
                      </h3>
                      <span
                        className="rounded-full px-2.5 py-0.5 text-[0.56rem] font-bold uppercase tracking-[0.15em] max-[680px]:px-2 max-[680px]:text-[0.48rem]"
                        style={{ backgroundColor: product.accentSoft, color: product.accent }}
                      >
                        {product.ritualStep}
                      </span>
                    </div>
                    <p className="mb-0 mt-1 text-[0.78rem] italic leading-none text-[var(--forest)]/50 max-[680px]:text-[0.62rem]">
                      {product.botanical}
                    </p>
                    <p className="mb-0 mt-3 max-w-[520px] text-[0.84rem] leading-[1.65] text-[var(--muted)] max-[680px]:mt-2 max-[680px]:line-clamp-2 max-[680px]:text-[0.72rem] max-[680px]:leading-[1.55]">
                      {product.shortDescription}
                    </p>
                  </div>

                  {/* Right side — desktop */}
                  <div className="ml-auto flex shrink-0 flex-col items-end gap-4 max-[680px]:hidden">
                    <span className="text-right text-[0.58rem] font-bold uppercase tracking-[0.16em] text-[var(--forest)]/40">
                      {product.plantPart}
                    </span>
                    <span
                      className="grid size-10 place-items-center rounded-full border text-[1rem] text-[var(--forest)] transition-[transform,background-color] duration-300 group-hover:rotate-45"
                      style={{ borderColor: product.accent + "55", backgroundColor: product.accentSoft + "66" }}
                      aria-hidden="true"
                    >↗</span>
                  </div>

                  {/* Mobile arrow */}
                  <span
                    className="ml-auto hidden shrink-0 text-[0.9rem] text-[var(--forest)]/40 transition-transform duration-300 group-hover:translate-x-0.5 max-[680px]:block"
                    aria-hidden="true"
                  >→</span>

                  {/* Hover accent */}
                  <div
                    className="pointer-events-none absolute inset-y-0 right-0 w-[28%] opacity-0 transition-opacity duration-500 group-hover:opacity-100 max-[680px]:hidden"
                    style={{ background: `linear-gradient(90deg, transparent, ${product.accentSoft}66)` }}
                    aria-hidden="true"
                  />
                </Link>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-10 text-center max-[680px]:mt-7">
              <Link
                href="/shop"
                className="inline-flex min-h-[52px] items-center justify-center gap-3 rounded-full border border-[var(--forest)] px-8 py-3.5 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-[var(--forest)] transition-[transform,background-color,color] duration-300 hover:-translate-y-0.5 hover:bg-[var(--forest)] hover:text-white max-[680px]:min-h-[44px] max-[680px]:px-6 max-[680px]:text-[0.62rem]"
              >
                Explore the full collection <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════
          §6  OUR STANDARDS
      ════════════════════════════════════════════════════ */}
      <section className="border-y border-[var(--line)] bg-[var(--forest)] text-[var(--paper)]">
        <div className="mx-auto w-full max-w-[1440px] px-[var(--page-pad)] py-[clamp(90px,9vw,140px)] max-[680px]:px-4 max-[680px]:py-14">

          <div className="mb-[clamp(56px,6vw,84px)] grid grid-cols-[0.5fr_1.5fr] items-end gap-[clamp(40px,7vw,100px)] max-[800px]:grid-cols-1 max-[800px]:gap-5 max-[680px]:mb-10 max-[680px]:gap-3">
            <p className="m-0 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[var(--amla)] max-[680px]:text-[0.58rem]">
              What we protect
            </p>
            <h2 className="m-0 max-w-[840px] font-serif text-[clamp(2.8rem,5vw,5.8rem)] font-normal leading-[0.9] tracking-[-0.06em] text-balance max-[680px]:text-[clamp(2rem,9vw,3.2rem)] max-[680px]:leading-[0.93]">
              Premium means knowing{" "}
              <em className="font-normal text-[#c8d88e]">what matters.</em>
            </h2>
          </div>

          <div className="grid grid-cols-4 gap-px overflow-hidden rounded-[var(--radius-lg)] bg-white/10 ring-1 ring-white/12 max-[1000px]:grid-cols-2 max-[680px]:grid-cols-1 max-[680px]:rounded-[var(--radius-md)]">
            {standards.map((s, index) => (
              <article
                key={s.number}
                className={`flex min-h-[320px] flex-col p-[clamp(22px,3vw,38px)] max-[680px]:min-h-[220px] max-[680px]:p-5 ${index === 2 ? "bg-white/10 backdrop-blur-sm" : "bg-[var(--forest-dark)]"
                  }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[0.64rem] font-bold tracking-[0.18em] text-[var(--amla)] max-[680px]:text-[0.54rem]">{s.number}</span>
                  <span className="text-[1.3rem] text-[var(--amla)] opacity-55 max-[680px]:text-[1rem]" aria-hidden="true">{s.icon}</span>
                </div>
                <h3 className="mb-0 mt-auto max-w-[11ch] font-serif text-[clamp(1.75rem,2.5vw,2.5rem)] font-normal leading-[0.96] tracking-[-0.04em] max-[680px]:mt-6 max-[680px]:text-[clamp(1.35rem,6vw,1.9rem)]">
                  {s.title}
                </h3>
                <p className="mb-0 mt-5 text-[0.82rem] leading-[1.72] text-white/55 max-[680px]:mt-3 max-[680px]:text-[0.72rem] max-[680px]:leading-[1.62]">
                  {s.copy}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          §7  FINAL RITUAL — image + copy split
      ════════════════════════════════════════════════════ */}
      <section className="grid min-h-[680px] grid-cols-2 bg-[var(--forest-dark)] text-[var(--paper)] max-[900px]:grid-cols-1 max-[900px]:min-h-0">
        {/* Image */}
        <div className="relative min-h-[680px] max-[900px]:min-h-[460px] max-[680px]:min-h-[300px]">
          <Image
            src={content.ritualPoster.url}
            alt={content.ritualPoster.altText || "A botanical hair ritual being prepared in a bowl"}
            fill
            sizes="(max-width: 900px) 100vw, 50vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(8,26,19,0.62))]" />
          <div className="absolute inset-x-0 bottom-0 p-7 max-[680px]:p-4">
            <p className="m-0 text-[0.6rem] font-bold uppercase tracking-[0.2em] text-white/50 max-[680px]:text-[0.5rem]">
              Botanical ritual · prepared fresh
            </p>
          </div>
        </div>

        {/* Copy */}
        <div className="flex items-center px-[clamp(44px,8vw,120px)] py-[100px] max-[900px]:px-[clamp(24px,6vw,72px)] max-[900px]:py-[80px] max-[680px]:px-4 max-[680px]:py-12">
          <div className="max-w-[580px]">
            <p className="m-0 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[var(--amla)] max-[680px]:text-[0.56rem]">
              The final transformation
            </p>
            <h2 className="mb-0 mt-7 max-w-[11ch] font-serif text-[clamp(3rem,5.5vw,6.5rem)] font-normal leading-[0.85] tracking-[-0.065em] text-balance max-[680px]:mt-4 max-[680px]:text-[clamp(2.1rem,9.5vw,3.2rem)] max-[680px]:leading-[0.9]">
              The last step happens{" "}
              <em className="font-normal text-[#c8d88e]">in your bowl.</em>
            </h2>
            <p className="mb-0 mt-8 text-[1rem] leading-[1.82] text-white/58 max-[680px]:mt-5 max-[680px]:text-[0.78rem] max-[680px]:leading-[1.68]">
              Water turns powder into paste. Time turns preparation into ritual. Clear directions give you the confidence to make that moment your own—without losing respect for the ingredient.
            </p>

            {/* Steps */}
            <div className="mt-9 space-y-3 max-[680px]:mt-6 max-[680px]:space-y-2.5">
              {["Mix with water to a smooth paste", "Apply and follow pack timing", "Rinse thoroughly and restore"].map((step, i) => (
                <div key={step} className="flex items-center gap-4 max-[680px]:gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-[var(--amla)]/40 text-[0.6rem] font-bold text-[var(--amla)] max-[680px]:size-5 max-[680px]:text-[0.52rem]">
                    {i + 1}
                  </span>
                  <p className="m-0 text-[0.84rem] text-white/62 max-[680px]:text-[0.72rem]">{step}</p>
                </div>
              ))}
            </div>

            <Link
              href="/rituals"
              className="mt-10 inline-flex min-h-[52px] items-center justify-center gap-3 rounded-full border border-white/22 px-7 py-3 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-white transition-[transform,background-color,color,border-color] duration-300 hover:-translate-y-0.5 hover:border-[var(--amla)] hover:bg-[var(--amla)] hover:text-[var(--forest)] max-[680px]:mt-7 max-[680px]:min-h-[44px] max-[680px]:px-5 max-[680px]:text-[0.62rem]"
            >
              Find your ritual <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          §8  CTA BANNER
      ════════════════════════════════════════════════════ */}
      <section className="px-[var(--page-pad)] pb-[clamp(90px,9vw,140px)] pt-[clamp(30px,4vw,60px)] max-[680px]:px-4 max-[680px]:pb-14 max-[680px]:pt-5">
        <div className="relative mx-auto overflow-hidden rounded-[var(--radius-lg)] bg-[var(--forest)] px-[clamp(32px,7vw,100px)] py-[clamp(60px,7vw,96px)] text-[var(--paper)] shadow-[var(--shadow-float)] max-[680px]:rounded-[var(--radius-md)] max-[680px]:px-5 max-[680px]:py-10">
          {/* Decorative rings */}
          <span
            className="pointer-events-none absolute -right-20 -top-28 size-[400px] rounded-full border border-white/8 before:absolute before:inset-10 before:rounded-full before:border before:border-white/6 before:content-[''] after:absolute after:inset-20 after:rounded-full after:border after:border-white/4 after:content-[''] max-[680px]:-right-16 max-[680px]:-top-20 max-[680px]:size-[280px]"
            aria-hidden="true"
          />
          <div className="relative z-[2] grid grid-cols-[1.3fr_0.7fr] items-center gap-[clamp(40px,7vw,100px)] max-[900px]:grid-cols-1 max-[900px]:gap-8 max-[680px]:gap-6">
            <div>
              <p className="m-0 text-[0.66rem] font-bold uppercase tracking-[0.2em] text-[var(--amla)] max-[680px]:text-[0.56rem]">
                Continue the story
              </p>
              <h2 className="mb-0 mt-6 max-w-[12ch] font-serif text-[clamp(2.8rem,5vw,6rem)] font-normal leading-[0.88] tracking-[-0.06em] text-balance max-[680px]:mt-4 max-[680px]:text-[clamp(2rem,9vw,3.2rem)] max-[680px]:leading-[0.92]">
                Care begins long before the bowl.
              </h2>
            </div>
            <div>
              <p className="m-0 max-w-[400px] text-[0.95rem] leading-[1.78] text-white/58 max-[680px]:text-[0.78rem] max-[680px]:leading-[1.65]">
                Meet each ingredient, understand its purpose and choose the botanical that belongs in your next ritual.
              </p>
              <div className="mt-8 flex flex-wrap gap-4 max-[680px]:mt-6 max-[680px]:gap-3">
                <Link
                  href="/shop"
                  className="inline-flex min-h-[52px] items-center justify-center gap-2.5 rounded-full bg-white px-7 py-3 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-[var(--forest)] shadow-[0_10px_28px_rgba(0,0,0,0.22)] transition-[transform,background-color] duration-300 hover:-translate-y-0.5 hover:bg-[var(--amla)] max-[680px]:min-h-[44px] max-[680px]:px-5 max-[680px]:text-[0.62rem]"
                >
                  Explore botanicals <span aria-hidden="true">↗</span>
                </Link>
                <Link
                  href="/rituals"
                  className="inline-flex min-h-[52px] items-center justify-center gap-2.5 rounded-full border border-white/25 px-7 py-3 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-white transition-colors duration-300 hover:border-white/55 max-[680px]:min-h-[44px] max-[680px]:px-5 max-[680px]:text-[0.62rem]"
                >
                  Build a ritual
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
