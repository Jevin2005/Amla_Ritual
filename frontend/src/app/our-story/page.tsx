import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ProductJar } from "@/features/catalog/product-jar";
import { getStorefront } from "@/lib/shopify/storefront";

const processSteps = [
  {
    number: "01",
    title: "Name the botanical",
    copy: "Every ritual begins with identity: the accepted botanical name and the exact plant part intended for the powder—fruit, leaf, root, flower or pod.",
  },
  {
    number: "02",
    title: "Choose the source",
    copy: "The supplier, origin information and available quality records are considered against the needs of each herb. We publish specific provenance only when it is verified.",
  },
  {
    number: "03",
    title: "Sort and prepare",
    copy: "Raw botanicals are carefully sorted and prepared before milling. The goal is simple: a clean, consistent starting material with its natural character intact.",
  },
  {
    number: "04",
    title: "Mill and sieve",
    copy: "Dry botanicals are milled and sieved toward a fine, even texture that mixes smoothly into a modern beauty ritual. The exact method can differ by ingredient.",
  },
  {
    number: "05",
    title: "Review the batch",
    copy: "Appearance, aroma, texture and the required batch records are reviewed before release. We name a quality check or certification only after it is complete and documented.",
  },
  {
    number: "06",
    title: "Fill, seal and guide",
    copy: "The finished powder is protected from moisture and paired with clear identity, storage, preparation and safety guidance—so the care continues after the pack is opened.",
  },
];

const standards = [
  {
    number: "01",
    title: "Identity before imagery",
    copy: "Common name, botanical identity and plant part should be easy to find and easy to understand.",
  },
  {
    number: "02",
    title: "A texture made for ritual",
    copy: "The finished powder should be practical to measure, mix and apply—not merely beautiful on a shelf.",
  },
  {
    number: "03",
    title: "Claims with evidence",
    copy: "Origin, processing, testing and certification details belong on the page only when the records support them.",
  },
  {
    number: "04",
    title: "Guidance that earns trust",
    copy: "Preparation, storage, patch testing and ingredient-specific cautions are part of the product experience.",
  },
];

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "Follow the NatureMist journey from clearly identified beauty botanicals to considered powders, careful guidance and modern rituals.",
  alternates: { canonical: "/our-story" },
};

export default async function OurStoryPage() {
  const { content, products } = await getStorefront();

  return (
    <main id="main-content" className="overflow-hidden">
      <section className="relative min-h-[min(860px,calc(100svh-24px))] overflow-hidden bg-[var(--forest-dark)] max-[680px]:min-h-[740px]">
        <div className="absolute inset-0 after:absolute after:inset-0 after:bg-[linear-gradient(90deg,rgba(8,31,21,0.9)_0%,rgba(8,31,21,0.54)_46%,rgba(8,31,21,0.08)_78%)] after:content-[''] max-[680px]:after:bg-[linear-gradient(180deg,rgba(8,31,21,0.28),rgba(8,31,21,0.9)_72%)]">
          <Image
            src={content.storyPoster.url}
            alt={content.storyPoster.altText}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center max-[680px]:object-[64%_center]"
          />
        </div>

        <div className="relative z-[2] mx-auto flex min-h-[inherit] w-full max-w-[1440px] flex-col justify-center px-[var(--page-pad)] py-[120px] text-[var(--paper)] max-[680px]:justify-end max-[680px]:px-5 max-[680px]:pb-[82px] max-[680px]:pt-[120px]">
          <div className="max-w-[820px]">
            <p className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-black/10 px-3.5 py-2 text-[0.66rem] font-bold uppercase tracking-[0.2em] text-[#d8e6af] backdrop-blur-sm">
              <span className="size-1.5 rounded-full bg-[var(--amla)] shadow-[0_0_0_5px_rgba(183,212,90,0.14)]" />
              Our story · From source to seal
            </p>
            <h1 className="m-0 max-w-[10.5ch] font-serif text-[clamp(4.4rem,7.6vw,8.5rem)] font-normal leading-[0.82] tracking-[-0.07em] text-balance max-[680px]:text-[clamp(3.85rem,17vw,5.7rem)]">
              Nature,
              <em className="block font-normal text-[#d8e6af]">carefully translated.</em>
            </h1>
            <p className="mb-0 mt-8 max-w-[590px] text-[1.04rem] leading-[1.75] text-white/72 max-[680px]:mt-6 max-[680px]:text-[0.94rem]">
              Beauty botanicals carry generations of ritual knowledge. NatureMist brings them forward through a considered path—from plant identity and preparation to the powder in your bowl.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-5 max-[680px]:mt-7">
              <a
                href="#making"
                className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-[var(--paper)] px-6 py-3 text-[0.7rem] font-bold uppercase tracking-[0.13em] text-[var(--forest)] shadow-[0_14px_34px_rgba(0,0,0,0.2)] transition-[transform,background-color] duration-300 hover:-translate-y-0.5 hover:bg-[var(--amla)]"
              >
                Follow the making <span className="ml-3" aria-hidden="true">↓</span>
              </a>
              <Link
                href="/shop"
                className="inline-flex min-h-11 items-center border-b border-white/45 text-[0.7rem] font-bold uppercase tracking-[0.13em] text-white transition-colors hover:border-[var(--amla)] hover:text-[var(--amla)]"
              >
                Meet the botanicals <span className="ml-2" aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-[2] border-t border-white/15 bg-[rgba(7,27,19,0.5)] backdrop-blur-md max-[680px]:hidden">
          <div className="mx-auto grid max-w-[1440px] grid-cols-3 divide-x divide-white/15 px-[var(--page-pad)]">
            {["Botanical identity", "Considered preparation", "Clear ritual guidance"].map((item, index) => (
              <p key={item} className="m-0 flex min-h-[74px] items-center gap-4 px-7 text-[0.66rem] font-bold uppercase tracking-[0.16em] text-white/68 first:pl-0">
                <span className="font-serif text-[1.1rem] font-normal text-[var(--amla)]">0{index + 1}</span>
                {item}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-[1440px] grid-cols-[0.36fr_1.14fr_0.7fr] gap-[clamp(42px,6vw,94px)] px-[var(--page-pad)] py-[clamp(95px,10vw,155px)] max-[1000px]:grid-cols-[0.38fr_1.2fr] max-[1000px]:[&>aside]:col-start-2 max-[680px]:grid-cols-1 max-[680px]:gap-8 max-[680px]:px-5 max-[680px]:py-[82px] max-[680px]:[&>aside]:col-start-auto">
        <p className="m-0 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[var(--botanical)]">
          Where we begin
        </p>
        <div>
          <h2 className="m-0 max-w-[780px] font-serif text-[clamp(3.25rem,5.2vw,6rem)] font-normal leading-[0.9] tracking-[-0.06em] text-[var(--forest)] text-balance">
            The plant is the beginning. <em className="font-normal text-[var(--botanical)]">Care is what happens next.</em>
          </h2>
          <p className="mb-0 mt-8 max-w-[690px] text-[1.03rem] leading-[1.82] text-[var(--muted)]">
            We believe natural beauty should feel both elemental and exact. The ingredient deserves respect; the customer deserves clarity. Our role is to connect the two without hiding the important details behind romantic language.
          </p>
        </div>
        <aside className="self-end border-l border-[var(--line-strong)] pl-7 max-[680px]:border-l-0 max-[680px]:border-t max-[680px]:pl-0 max-[680px]:pt-7">
          <p className="m-0 font-serif text-[clamp(1.65rem,2.4vw,2.35rem)] leading-[1.12] tracking-[-0.035em] text-[var(--forest)]">
            “We do not rush the story—or the ingredient.”
          </p>
          <p className="mb-0 mt-5 text-[0.66rem] font-bold uppercase tracking-[0.16em] text-[var(--botanical)]">
            The NatureMist point of view
          </p>
        </aside>
      </section>

      <section id="making" className="scroll-mt-[var(--header-height)] bg-[var(--forest-dark)] text-[var(--paper)]">
        <div className="mx-auto w-full max-w-[1440px] px-[var(--page-pad)] py-[clamp(90px,9vw,140px)] max-[680px]:px-5 max-[680px]:py-[78px]">
          <div className="grid grid-cols-[0.68fr_1.32fr] gap-[clamp(48px,8vw,130px)] max-[900px]:grid-cols-1 max-[900px]:gap-8">
            <p className="m-0 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[var(--amla)]">
              The making of a ritual
            </p>
            <div>
              <h2 className="m-0 max-w-[850px] font-serif text-[clamp(3.5rem,5.8vw,6.6rem)] font-normal leading-[0.88] tracking-[-0.065em] text-balance">
                From living botanical to <em className="font-normal text-[#d8e6af]">finished powder.</em>
              </h2>
              <p className="mb-0 mt-7 max-w-[660px] text-[1rem] leading-[1.8] text-white/62">
                Different herbs ask for different handling. This is the clear production standard we use to evaluate the journey, while batch-specific sourcing, processing and certifications are published only when verified.
              </p>
            </div>
          </div>

          <figure className="relative mb-[clamp(84px,9vw,135px)] mt-[clamp(58px,7vw,96px)] overflow-hidden rounded-[var(--radius-lg)] border border-white/15 bg-[#173729] shadow-[0_34px_90px_rgba(0,0,0,0.3)] max-[680px]:rounded-[var(--radius-md)]">
            <div className="relative aspect-[16/7] min-h-[340px] max-[680px]:aspect-[4/5] max-[680px]:min-h-0">
              <Image
                src="/images/naturemist-process.png"
                alt="Botanical ingredients being sorted beside sieved powder in a clean preparation studio"
                fill
                sizes="(max-width: 680px) 100vw, 1296px"
                className="object-cover max-[680px]:object-[45%_center]"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(7,27,19,0.82))]" />
            </div>
            <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-8 p-7 text-[0.68rem] leading-[1.6] text-white/68 max-[680px]:block max-[680px]:p-5">
              <span className="font-bold uppercase tracking-[0.16em] text-white">Care made visible</span>
              <span className="max-w-[480px] text-right max-[680px]:mt-2 max-[680px]:block max-[680px]:text-left">
                Editorial interpretation of botanical sorting and preparation; individual batch methods may differ.
              </span>
            </figcaption>
          </figure>

          <div className="grid grid-cols-[0.7fr_1.3fr] gap-[clamp(60px,9vw,150px)] max-[900px]:grid-cols-1 max-[900px]:gap-12">
            <div className="self-start min-[901px]:sticky min-[901px]:top-[calc(var(--header-height)+36px)]">
              <p className="m-0 text-[0.66rem] font-bold uppercase tracking-[0.18em] text-[var(--amla)]">Source to seal</p>
              <h3 className="mb-0 mt-5 max-w-[9ch] font-serif text-[clamp(2.9rem,4.3vw,5rem)] font-normal leading-[0.9] tracking-[-0.055em]">
                Six decisions. One considered path.
              </h3>
              <p className="mb-0 mt-7 max-w-[430px] leading-[1.75] text-white/56">
                A premium product is not defined by decoration. It is defined by the care, records and useful guidance that stand behind it.
              </p>
            </div>

            <ol className="m-0 list-none p-0">
              {processSteps.map((step) => (
                <li key={step.number} className="grid grid-cols-[72px_0.75fr_1.25fr] gap-7 border-t border-white/17 py-9 first:pt-0 max-[680px]:grid-cols-[48px_1fr] max-[680px]:gap-x-4 max-[680px]:gap-y-3 max-[680px]:py-7">
                  <span className="font-serif text-[1.25rem] text-[var(--amla)]">{step.number}</span>
                  <h4 className="m-0 font-serif text-[clamp(1.7rem,2.3vw,2.35rem)] font-normal leading-[1.02] tracking-[-0.035em] text-white">
                    {step.title}
                  </h4>
                  <p className="m-0 text-[0.9rem] leading-[1.78] text-white/58 max-[680px]:col-start-2">
                    {step.copy}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {products.length ? (
        <section className="mx-auto w-full max-w-[1440px] px-[var(--page-pad)] py-[clamp(95px,10vw,155px)] max-[680px]:px-5 max-[680px]:py-[82px]">
          <div className="grid grid-cols-[0.6fr_1.4fr] items-end gap-[clamp(45px,8vw,130px)] max-[900px]:grid-cols-1 max-[900px]:gap-7">
            <p className="m-0 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[var(--botanical)]">
              The botanical cabinet
            </p>
            <div>
              <h2 className="m-0 max-w-[850px] font-serif text-[clamp(3.35rem,5.5vw,6.25rem)] font-normal leading-[0.9] tracking-[-0.06em] text-[var(--forest)] text-balance">
                Different plants. <em className="font-normal text-[var(--botanical)]">The same clarity.</em>
              </h2>
              <p className="mb-0 mt-7 max-w-[650px] leading-[1.78] text-[var(--muted)]">
                Each botanical arrives with its own plant part, colour, texture and ritual role. We keep those differences visible instead of flattening them into one vague idea of “natural.”
              </p>
            </div>
          </div>

          <div className="mt-[clamp(58px,7vw,90px)] grid grid-cols-3 gap-5 max-[1000px]:grid-cols-2 max-[680px]:grid-cols-1">
            {products.map((product) => (
              <Link
                key={product.slug}
                href={`/shop/${product.slug}`}
                className="group relative grid min-h-[370px] grid-cols-[1fr_0.9fr] items-end overflow-hidden rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--paper)] p-7 shadow-[0_16px_45px_rgba(21,59,45,0.08)] transition-[transform,box-shadow,border-color] duration-500 ease-[var(--ease)] hover:-translate-y-1.5 hover:border-[color-mix(in_srgb,var(--botanical)_45%,transparent)] hover:shadow-[var(--shadow-float)] max-[680px]:min-h-[330px] max-[680px]:rounded-[var(--radius-md)] max-[680px]:p-5"
                style={{ backgroundColor: product.accentSoft }}
              >
                <div className="relative z-[2] self-end">
                  <span className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-[var(--forest)]/58">
                    Botanical {product.collectionNumber}
                  </span>
                  <h3 className="mb-0 mt-3 font-serif text-[clamp(2rem,2.8vw,2.8rem)] font-normal leading-[0.92] tracking-[-0.045em] text-[var(--forest)]">
                    {product.name.replace(" Powder", "")}
                  </h3>
                  <p className="mb-0 mt-3 text-[0.74rem] italic leading-[1.45] text-[var(--forest)]/68">
                    {product.botanical}
                  </p>
                  <p className="mb-0 mt-1 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-[var(--forest)]/55">
                    {product.plantPart}
                  </p>
                </div>
                <ProductJar
                  product={product}
                  size="medium"
                  decorative
                  className="absolute -bottom-5 right-2 origin-bottom scale-[0.82] transition-transform duration-500 ease-[var(--ease)] group-hover:scale-[0.88] max-[680px]:right-0 max-[680px]:scale-[0.72] max-[680px]:group-hover:scale-[0.76]"
                />
                <span className="absolute right-5 top-5 grid size-10 place-items-center rounded-full border border-[var(--forest)]/18 bg-white/28 text-[var(--forest)] transition-[transform,background-color] duration-300 group-hover:rotate-45 group-hover:bg-white/60" aria-hidden="true">↗</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="border-y border-[var(--line)] bg-[var(--surface-warm)]">
        <div className="mx-auto w-full max-w-[1440px] px-[var(--page-pad)] py-[clamp(90px,9vw,140px)] max-[680px]:px-5 max-[680px]:py-[78px]">
          <div className="grid grid-cols-[0.62fr_1.38fr] gap-[clamp(45px,8vw,120px)] max-[900px]:grid-cols-1 max-[900px]:gap-7">
            <p className="m-0 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[var(--botanical)]">What we protect</p>
            <h2 className="m-0 max-w-[860px] font-serif text-[clamp(3.3rem,5.4vw,6.15rem)] font-normal leading-[0.9] tracking-[-0.06em] text-[var(--forest)] text-balance">
              Premium means knowing <em className="font-normal text-[var(--botanical)]">what matters.</em>
            </h2>
          </div>

          <div className="mt-[clamp(58px,7vw,88px)] grid grid-cols-4 gap-px overflow-hidden rounded-[var(--radius-lg)] bg-[var(--line)] shadow-[var(--shadow-soft)] ring-1 ring-[var(--line)] max-[1000px]:grid-cols-2 max-[680px]:grid-cols-1 max-[680px]:rounded-[var(--radius-md)]">
            {standards.map((standard, index) => (
              <article key={standard.number} className={`flex min-h-[330px] flex-col p-8 max-[680px]:min-h-[260px] max-[680px]:p-6 ${index === 2 ? "bg-[var(--forest)] text-white" : "bg-[var(--paper)] text-[var(--forest)]"}`}>
                <span className={`text-[0.62rem] font-bold tracking-[0.16em] ${index === 2 ? "text-[var(--amla)]" : "text-[var(--botanical)]"}`}>
                  {standard.number}
                </span>
                <h3 className="mb-0 mt-auto max-w-[10ch] font-serif text-[clamp(2rem,2.7vw,2.75rem)] font-normal leading-[0.94] tracking-[-0.045em]">
                  {standard.title}
                </h3>
                <p className={`mb-0 mt-5 text-[0.82rem] leading-[1.72] ${index === 2 ? "text-white/60" : "text-[var(--muted)]"}`}>
                  {standard.copy}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="grid min-h-[760px] grid-cols-2 bg-[var(--forest-dark)] text-[var(--paper)] max-[900px]:grid-cols-1 max-[900px]:min-h-0">
        <div className="relative min-h-[760px] max-[900px]:min-h-[620px] max-[680px]:min-h-[500px]">
          <Image
            src={content.ritualPoster.url}
            alt={content.ritualPoster.altText}
            fill
            sizes="(max-width: 900px) 100vw, 50vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_60%,rgba(11,40,29,0.54))]" />
        </div>
        <div className="flex items-center px-[clamp(48px,8vw,130px)] py-[100px] max-[680px]:px-5 max-[680px]:py-[78px]">
          <div className="max-w-[650px]">
            <p className="m-0 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[var(--amla)]">The final transformation</p>
            <h2 className="mb-0 mt-6 max-w-[10ch] font-serif text-[clamp(3.6rem,6vw,7rem)] font-normal leading-[0.85] tracking-[-0.065em] text-balance">
              The last step happens <em className="font-normal text-[#d8e6af]">in your bowl.</em>
            </h2>
            <p className="mb-0 mt-8 max-w-[540px] text-[1rem] leading-[1.82] text-white/62">
              Water turns powder into paste. Time turns preparation into ritual. Clear directions give you the confidence to make that moment your own—without losing respect for the ingredient.
            </p>
            <Link
              href="/rituals"
              className="mt-9 inline-flex min-h-[52px] items-center justify-center rounded-full border border-white/22 px-6 py-3 text-[0.7rem] font-bold uppercase tracking-[0.13em] text-white transition-[transform,background-color,color] duration-300 hover:-translate-y-0.5 hover:bg-[var(--paper)] hover:text-[var(--forest)]"
            >
              Find your ritual <span className="ml-3" aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1440px] px-[var(--page-pad)] py-[clamp(95px,10vw,155px)] max-[680px]:px-5 max-[680px]:py-[82px]">
        <div className="grid grid-cols-[0.74fr_1.26fr] gap-[clamp(55px,9vw,145px)] max-[900px]:grid-cols-1 max-[900px]:gap-10">
          <div>
            <p className="m-0 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[var(--botanical)]">Honesty on every pack</p>
            <h2 className="mb-0 mt-6 max-w-[9ch] font-serif text-[clamp(3.2rem,5vw,5.8rem)] font-normal leading-[0.9] tracking-[-0.06em] text-[var(--forest)] text-balance">
              Nothing important should stay hidden.
            </h2>
            <p className="mb-0 mt-7 max-w-[530px] leading-[1.8] text-[var(--muted)]">
              Final sourcing, processing and certification details are published only when verified for the relevant batch and pack. That restraint is part of the product.
            </p>
          </div>

          <dl className="m-0 grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-lg)] bg-[var(--line)] ring-1 ring-[var(--line)] max-[680px]:grid-cols-1 max-[680px]:rounded-[var(--radius-md)]">
            {[
              ["Botanical identity", "The plant's accepted name"],
              ["Plant part", "Fruit, leaf, flower, root or pod"],
              ["Batch reference", "The released lot identified on pack"],
              ["Directions + safety", "Preparation, storage and cautions"],
            ].map(([term, description]) => (
              <div key={term} className="min-h-[170px] bg-[var(--paper)] p-7 max-[680px]:min-h-[140px] max-[680px]:p-6">
                <dt className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-[var(--botanical)]">{term}</dt>
                <dd className="mb-0 ml-0 mt-8 max-w-[14ch] font-serif text-[1.65rem] leading-[1.05] tracking-[-0.035em] text-[var(--forest)]">{description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="px-[var(--page-pad)] pb-[clamp(90px,9vw,140px)] max-[680px]:px-5 max-[680px]:pb-[78px]">
        <div className="relative mx-auto overflow-hidden rounded-[var(--radius-lg)] bg-[var(--forest)] px-[clamp(32px,7vw,100px)] py-[clamp(62px,7vw,96px)] text-[var(--paper)] shadow-[var(--shadow-soft)] max-[680px]:rounded-[var(--radius-md)]">
          <span className="pointer-events-none absolute -right-24 -top-32 size-[430px] rounded-full border border-white/10 before:absolute before:inset-12 before:rounded-full before:border before:border-white/8 before:content-['']" aria-hidden="true" />
          <div className="relative z-[2] grid grid-cols-[1.25fr_0.75fr] items-end gap-12 max-[900px]:grid-cols-1">
            <div>
              <p className="m-0 text-[0.66rem] font-bold uppercase tracking-[0.18em] text-[var(--amla)]">Continue the story</p>
              <h2 className="mb-0 mt-5 max-w-[11ch] font-serif text-[clamp(3.2rem,5.5vw,6.25rem)] font-normal leading-[0.88] tracking-[-0.06em] text-balance">
                Care begins long before the bowl.
              </h2>
            </div>
            <div>
              <p className="m-0 max-w-[440px] leading-[1.75] text-white/62">
                Meet each ingredient, understand its purpose and choose the botanical that belongs in your next ritual.
              </p>
              <div className="mt-7 flex flex-wrap gap-4">
                <Link href="/shop" className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-[var(--paper)] px-6 py-3 text-[0.7rem] font-bold uppercase tracking-[0.13em] text-[var(--forest)] transition-[transform,background-color] duration-300 hover:-translate-y-0.5 hover:bg-[var(--amla)]">
                  Explore botanicals <span className="ml-3" aria-hidden="true">↗</span>
                </Link>
                <Link href="/rituals" className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-white/22 px-6 py-3 text-[0.7rem] font-bold uppercase tracking-[0.13em] text-white transition-colors hover:border-white/55">
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
