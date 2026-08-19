"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { products, type Product } from "@/domain/catalog/products";
import { ProductCard } from "@/features/catalog/product-card";
import { ProductJar } from "@/features/catalog/product-jar";
import { RitualFinder } from "@/features/rituals/ritual-finder";
import { BundleCards } from "./bundle-cards";
import { FeaturedProductSwitcher } from "./featured-product-switcher";
import { HeroPurchase } from "./hero-purchase";
import { homeFaqs, ritualCards } from "./content";

const heroImage = "/images/naturemist-hero.png";
const ritualImage = "/images/naturemist-ritual.png";

const eyebrowClass =
  "mb-4 text-[0.68rem] leading-[1.3] font-bold tracking-[0.2em] text-[var(--botanical)] uppercase";
const lightEyebrowClass =
  "mb-4 text-[0.68rem] leading-[1.3] font-bold tracking-[0.2em] text-[#c8d88e] uppercase";
const sectionTitleClass =
  "m-0 scroll-mt-[calc(var(--header-height)+24px)] text-[clamp(3rem,4.5vw,5rem)] leading-[0.96] font-normal tracking-[-0.055em] text-[var(--forest)] [font-family:var(--font-display)] max-[680px]:text-[clamp(2.45rem,11vw,3.15rem)]";
const sectionClass =
  "mx-auto w-full max-w-[1440px] px-[clamp(24px,5vw,72px)] py-[clamp(80px,8vw,124px)] max-[680px]:px-5 max-[680px]:py-16";
const splitHeadingClass =
  "grid grid-cols-[minmax(0,1.35fr)_minmax(260px,0.65fr)] items-end gap-[clamp(48px,6vw,88px)] max-[900px]:grid-cols-[minmax(0,1.15fr)_minmax(210px,0.85fr)] max-[900px]:gap-8 max-[680px]:grid-cols-1 max-[680px]:gap-6";
const centeredHeadingClass =
  "mx-auto mb-[clamp(46px,5vw,72px)] max-w-[820px] text-center max-[680px]:mb-9";
const textLinkClass =
  "inline-flex items-center gap-[14px] border-b border-[var(--forest)] pb-[5px] text-[0.76rem] font-bold tracking-[0.08em] text-[var(--forest)] uppercase [transition:gap_260ms_var(--ease)] motion-reduce:transition-none hover:gap-[22px] max-[680px]:min-h-11";
const revealClass =
  "[transition:opacity_500ms_var(--ease),transform_500ms_var(--ease)] [will-change:transform,opacity]";
const buttonClass =
  "inline-flex min-h-[50px] items-center justify-center gap-[22px] border px-6 py-[13px] text-[0.72rem] leading-none font-bold tracking-[0.12em] uppercase [transition:transform_350ms_var(--ease),background-color_350ms_var(--ease),color_350ms_var(--ease),border-color_350ms_var(--ease)] motion-reduce:transition-none hover:[transform:translateY(-2px)]";
const ritualColorClasses = [
  "[--ritual-color:#b7c7a9]",
  "[--ritual-color:#d5b990]",
  "[--ritual-color:#d8c8b1]",
  "[--ritual-color:#aeb6d0]",
] as const;
const journalCardClass =
  "relative flex min-h-[430px] flex-col justify-end overflow-hidden p-[30px] [transition:transform_450ms_var(--ease),box-shadow_450ms_var(--ease)] motion-reduce:transition-none before:absolute before:top-[50px] before:left-1/2 before:h-[180px] before:w-[180px] before:-translate-x-1/2 before:rounded-[50%_50%_0_0] before:border before:border-[rgba(23,63,42,0.25)] before:content-[''] after:absolute after:top-[100px] after:left-1/2 after:h-10 after:w-20 after:-translate-x-1/2 after:rotate-[25deg] after:rounded-[100%_0_100%_0] after:bg-[rgba(23,63,42,0.22)] after:shadow-[55px_35px_0_rgba(23,63,42,0.18),-45px_65px_0_rgba(23,63,42,0.14)] after:content-[''] hover:shadow-[var(--shadow-soft)] hover:[transform:translateY(-5px)] max-[900px]:min-h-[360px] max-[680px]:min-h-[280px] max-[680px]:p-4 max-[680px]:before:top-6 max-[680px]:before:size-[120px] max-[680px]:after:top-[56px] max-[680px]:after:h-6 max-[680px]:after:w-12 max-[680px]:after:shadow-[36px_24px_0_rgba(23,63,42,0.16),-30px_42px_0_rgba(23,63,42,0.12)]";
const journalTitleClass =
  "relative z-[2] my-2 [color:var(--forest)] [font-family:var(--font-display)] text-[clamp(2rem,2.8vw,3rem)] leading-[0.98] font-normal tracking-[-0.045em] max-[680px]:text-[1.35rem] max-[680px]:leading-[1.02] max-[680px]:tracking-[-0.035em]";
const journalCopyClass =
  "relative z-[2] mt-0 mb-4 text-[0.78rem] text-[var(--muted)] max-[680px]:mb-3 max-[680px]:line-clamp-2 max-[680px]:text-[0.7rem] max-[680px]:leading-[1.4]";

const productHeroDetails: Record<
  string,
  {
    eyebrow: string;
    headlineFirst: string;
    headlineMiddle: string;
    headlineItalic: string;
    description: string;
    badgeText: string;
    badgeSubtitle: string;
    howToText: string;
  }
> = {
  "amla-powder": {
    eyebrow: "The Amla Ritual · No. 01",
    headlineFirst: "Indulge in",
    headlineMiddle: "Pure",
    headlineItalic: "Botanical ritual.",
    description:
      "A storied Indian botanical, thoughtfully prepared for soft-feeling, luminous-looking hair—and an unhurried moment of care.",
    badgeText: "Amla · pre-wash",
    badgeSubtitle: "Softness + luminous-looking shine",
    howToText:
      "Mix gradually with water until smooth, apply in sections and follow the final pack timing before rinsing thoroughly.",
  },
  "reetha-powder": {
    eyebrow: "The Reetha Ritual · No. 02",
    headlineFirst: "Purify with",
    headlineMiddle: "Fresh",
    headlineItalic: "Saponin cleanse.",
    description:
      "A naturally saponin-containing fruit shell cleanser for a fresh-feeling scalp, removing everyday buildup gently.",
    badgeText: "Reetha · wash",
    badgeSubtitle: "Fresh-feeling scalp + gentle buildup removal",
    howToText:
      "Mix a small amount with warm water into a thin paste, apply carefully to roots, and rinse thoroughly away from eyes.",
  },
  "shikakai-powder": {
    eyebrow: "The Shikakai Ritual · No. 03",
    headlineFirst: "Soften with",
    headlineMiddle: "Gentle",
    headlineItalic: "Herbal acacia.",
    description:
      "A traditional low-lather fruit wash that supports soft, manageable-feeling hair with natural botanical slip.",
    badgeText: "Shikakai · gentle wash",
    badgeSubtitle: "Low-lather wash + smooth hair slip",
    howToText:
      "Mix with water into a smooth, pourable paste. Apply gently through roots and lengths, then rinse well.",
  },
  "bhringraj-powder": {
    eyebrow: "The Bhringraj Ritual · No. 04",
    headlineFirst: "Ground in",
    headlineMiddle: "Forest",
    headlineItalic: "Scalp ritual.",
    description:
      "A grounding deep-green botanical mask formulated for a conditioned, cared-for feeling across scalp and hair lengths.",
    badgeText: "Bhringraj · scalp mask",
    badgeSubtitle: "Scalp care + conditioned resilient lengths",
    howToText:
      "Mix into a smooth paste, section onto scalp and hair lengths, leave for the pack duration, then rinse clean.",
  },
  "hibiscus-powder": {
    eyebrow: "The Hibiscus Ritual · No. 05",
    headlineFirst: "Revitalize with",
    headlineMiddle: "Vivid",
    headlineItalic: "Floral luster.",
    description:
      "A vivid floral conditioning mask for soft-feeling, smooth and glossy-looking hair lengths.",
    badgeText: "Hibiscus · floral mask",
    badgeSubtitle: "Silky softness + vibrant glossy luster",
    howToText:
      "Mix into a silky paste, concentrate through mid-lengths and ends, follow pack timing and rinse thoroughly.",
  },
  "indigo-powder": {
    eyebrow: "The Indigo Ritual · No. 06",
    headlineFirst: "Enrich with",
    headlineMiddle: "Pure",
    headlineItalic: "Leaf color.",
    description:
      "A color-depositing leaf powder for informed, carefully strand-tested botanical color rituals.",
    badgeText: "Indigo · leaf color",
    badgeSubtitle: "Natural plant color + multi-step ritual",
    howToText:
      "Read pack directions in full, wear gloves, apply freshly mixed paste to hair sections and strand test first.",
  },
};

export function HomePage() {
  const [activeProductIndex, setActiveProductIndex] = useState(0);
  const activeProduct = products[activeProductIndex] ?? products[0];
  const details =
    productHeroDetails[activeProduct.slug] ?? productHeroDetails["amla-powder"];

  const handlePrevProduct = () => {
    setActiveProductIndex((prev) => (prev === 0 ? products.length - 1 : prev - 1));
  };

  const handleNextProduct = () => {
    setActiveProductIndex((prev) => (prev === products.length - 1 ? 0 : prev + 1));
  };

  return (
    <main className="overflow-x-clip" id="main-content">
      <section
        className="relative isolate overflow-hidden bg-[radial-gradient(circle_at_53%_18%,rgba(255,255,255,0.92),transparent_30%),radial-gradient(circle_at_92%_30%,rgba(167,201,67,0.1),transparent_25%),linear-gradient(135deg,#fbf8f0,#f5f0e3_62%,#f9f7ef)] after:absolute after:right-0 after:bottom-0 after:left-0 after:z-[7] after:h-px after:bg-[var(--line)] after:content-['']"
        aria-labelledby="hero-title"
      >
        <span
          className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(rgba(23,63,42,0.22)_0.55px,transparent_0.55px)] bg-size-[7px_7px] opacity-20 [mask-image:linear-gradient(115deg,transparent_8%,black_45%,transparent_88%)]"
          aria-hidden="true"
        />
        <div className="relative mx-auto grid w-full max-w-[1680px] grid-cols-[minmax(310px,1.15fr)_minmax(360px,1.25fr)_minmax(240px,0.85fr)] gap-[clamp(20px,2vw,36px)] px-[clamp(24px,4vw,64px)] pt-[clamp(24px,2.5vw,38px)] pb-[clamp(24px,3vw,44px)] max-[1280px]:grid-cols-[minmax(280px,1.1fr)_minmax(340px,1.2fr)_minmax(220px,0.8fr)] max-[1180px]:grid-cols-[minmax(260px,1fr)_minmax(320px,1.15fr)_minmax(200px,0.85fr)] max-[1080px]:grid-cols-[minmax(270px,1fr)_minmax(320px,1.15fr)] max-[1080px]:gap-[32px_24px] max-[1080px]:px-[4vw] max-[900px]:grid-cols-1 max-[900px]:gap-8 max-[900px]:px-5 max-[900px]:pt-6 max-[900px]:pb-10 max-[680px]:gap-6 max-[680px]:px-4 max-[680px]:pt-4 max-[680px]:pb-8">
          <div className="relative z-[4] w-full self-center [animation:hero-copy-enter_900ms_var(--ease)_both] motion-reduce:animate-none motion-reduce:transform-none motion-reduce:opacity-100">
            <p className={`${eyebrowClass} mb-3 max-[680px]:mb-1.5 max-[680px]:text-[0.55rem] max-[680px]:tracking-[0.12em]`}>
              {details.eyebrow}
            </p>
            <h1
              className="relative z-[4] m-0 max-w-[520px] [color:var(--charcoal)] [font-family:var(--font-sans)] text-[clamp(3.2rem,3.8vw,4.6rem)] leading-[0.9] font-[620] tracking-[-0.055em] max-[1180px]:text-[clamp(2.9rem,4vw,3.8rem)] max-[1080px]:max-w-[480px] max-[1080px]:text-[clamp(2.6rem,4.8vw,3.5rem)] max-[900px]:text-[clamp(2.4rem,5.8vw,3.2rem)] max-[680px]:text-[clamp(1.75rem,6.8vw,2.1rem)] max-[680px]:leading-[0.94]"
              id="hero-title"
            >
              <span className="block [animation:hero-title-enter_900ms_var(--ease)_80ms_both] motion-reduce:animate-none motion-reduce:transform-none motion-reduce:opacity-100">
                {details.headlineFirst}
              </span>
              <span className="flex items-center gap-[clamp(10px,1.2vw,18px)] [animation:hero-title-enter_900ms_var(--ease)_150ms_both] motion-reduce:animate-none motion-reduce:transform-none motion-reduce:opacity-100">
                {details.headlineMiddle}
                <span
                  className="relative inline-block h-[0.58em] w-[clamp(85px,8.5vw,135px)] translate-y-[0.04em] overflow-hidden rounded-[999px] border border-[rgba(23,63,42,0.12)] shadow-[0_12px_30px_rgba(23,63,42,0.1)] max-[680px]:w-[clamp(42px,12vw,62px)]"
                  aria-hidden="true"
                >
                  <Image
                    src={heroImage}
                    alt=""
                    fill
                    sizes="160px"
                    className="scale-[1.38] object-cover object-[77%_27%]"
                  />
                </span>
              </span>
              <em className="mt-[0.05em] ml-[0.03em] block text-[0.9em] leading-[inherit] font-normal tracking-[-0.05em] text-[var(--botanical)] italic [font-family:var(--font-display)] [animation:hero-title-enter_900ms_var(--ease)_220ms_both] max-[680px]:text-[0.85em] motion-reduce:animate-none motion-reduce:transform-none motion-reduce:opacity-100">
                {details.headlineItalic}
              </em>
            </h1>
            <p className="my-[clamp(14px,2vh,22px)_14px] max-w-[420px] text-[clamp(0.9rem,1vw,1.02rem)] leading-[1.65] text-[#4b5047] max-[900px]:max-w-[480px] max-[900px]:text-[0.85rem] max-[680px]:my-[8px_10px] max-[680px]:text-[0.72rem] max-[680px]:leading-[1.5]">
              {details.description}
            </p>
            <HeroPurchase
              key={activeProduct.slug}
              slug={activeProduct.slug}
              name={activeProduct.name}
              pricePaise={activeProduct.pricePaise}
            />
            <ul
              className="mt-4 flex max-w-[440px] list-none items-center gap-[14px] border-t border-[rgba(23,63,42,0.16)] pt-3.5 text-[var(--forest)] max-[1080px]:max-w-full max-[900px]:max-w-full max-[680px]:hidden"
              aria-label="NatureMist principles"
            >
              <li className="flex items-center gap-1.5 text-[0.54rem] font-bold tracking-[0.05em] uppercase max-[680px]:text-[0.52rem] max-[680px]:tracking-[0.04em]">
                <span className="text-[0.8rem] text-[var(--botanical)] [font-family:var(--font-display)] max-[680px]:text-[0.68rem]">
                  01
                </span>{" "}
                Single botanical
              </li>
              <li className="flex items-center gap-1.5 text-[0.54rem] font-bold tracking-[0.05em] uppercase max-[680px]:text-[0.52rem] max-[680px]:tracking-[0.04em]">
                <span className="text-[0.8rem] text-[var(--botanical)] [font-family:var(--font-display)] max-[680px]:text-[0.68rem]">
                  02
                </span>{" "}
                Clearly explained
              </li>
              <li className="flex items-center gap-1.5 text-[0.54rem] font-bold tracking-[0.05em] uppercase max-[680px]:text-[0.52rem] max-[680px]:tracking-[0.04em]">
                <span className="text-[0.8rem] text-[var(--botanical)] [font-family:var(--font-display)] max-[680px]:text-[0.68rem]">
                  03
                </span>{" "}
                Made for home rituals
              </li>
            </ul>
          </div>

          <div className="relative z-[2] h-[clamp(480px,60vh,640px)] w-full min-w-0 self-center [animation:hero-portrait-enter_1s_var(--ease)_80ms_both] max-[1180px]:h-[clamp(440px,56vh,560px)] max-[1080px]:h-[clamp(400px,52vh,480px)] max-[900px]:h-[clamp(380px,50vh,450px)] max-[680px]:h-[clamp(320px,60vh,400px)] motion-reduce:animate-none motion-reduce:transform-none motion-reduce:opacity-100">
            <span
              className="pointer-events-none absolute top-[1%] right-[-7%] bottom-[-3%] left-[-8%] z-0 rounded-[49%_51%_17%_83%/35%_38%_62%_65%] bg-[linear-gradient(150deg,rgba(188,207,161,0.62),rgba(239,227,199,0.28)_58%,rgba(167,201,67,0.12))] shadow-[0_32px_90px_rgba(52,78,47,0.12)] max-[1080px]:hidden"
              aria-hidden="true"
            />
            <span
              className="pointer-events-none absolute top-[-3%] right-[-5%] bottom-[1%] left-[-6%] z-[1] rounded-[52%_48%_14%_86%/31%_39%_61%_69%] border border-[rgba(57,111,58,0.44)] [animation:hero-orbit-drift_11s_ease-in-out_infinite_alternate] [will-change:transform] max-[1080px]:hidden motion-reduce:animate-none motion-reduce:[transform:rotate(15deg)]"
              aria-hidden="true"
            />
            {/* Layered Organic Line 2 - Outer poster frame orbit with different organic shape */}
            <span
              className="pointer-events-none absolute top-[-7.5%] right-[-9.5%] bottom-[-5%] left-[-10.5%] z-[1] rounded-[45%_55%_52%_48%/54%_43%_57%_46%] border border-[rgba(111,143,47,0.36)] [animation:hero-orbit-drift_15s_ease-in-out_-4s_infinite_alternate] [will-change:transform] max-[1080px]:hidden motion-reduce:animate-none motion-reduce:[transform:rotate(-9deg)]"
              aria-hidden="true"
            />
            <span
              className="pointer-events-none absolute top-[9%] right-[-9%] z-[4] rotate-[24deg] max-[1080px]:hidden"
              aria-hidden="true"
            >
              <i className="block h-[24px] w-[52px] rounded-[100%_0_100%_0] bg-[rgba(102,137,54,0.82)] shadow-[0_8px_20px_rgba(23,63,42,0.12)] [animation:hero-arrow_4.8s_ease-in-out_infinite] [will-change:transform] motion-reduce:animate-none" />
            </span>
            <span
              className="pointer-events-none absolute bottom-[15%] left-[-12%] z-[4] rotate-[-32deg] max-[1080px]:hidden"
              aria-hidden="true"
            >
              <i className="block h-[20px] w-[44px] rounded-[100%_0_100%_0] bg-[rgba(111,143,47,0.7)] [animation:hero-arrow_5.4s_ease-in-out_-1.6s_infinite] [will-change:transform] motion-reduce:animate-none" />
            </span>
            <span
              className="pointer-events-none absolute right-[5%] bottom-[-2%] z-[4] rotate-[138deg] max-[1080px]:hidden"
              aria-hidden="true"
            >
              <i className="block h-[17px] w-[38px] rounded-[100%_0_100%_0] bg-[rgba(143,159,78,0.68)] [animation:hero-arrow_4.2s_ease-in-out_-0.8s_infinite] [will-change:transform] motion-reduce:animate-none" />
            </span>

            {/* Mobile-only organic frame. */}
            <span
              className="pointer-events-none absolute top-[-6%] right-[-6%] bottom-[-6%] left-[-6%] z-0 hidden rounded-[50%] bg-[radial-gradient(ellipse_at_55%_42%,rgba(167,201,67,0.18),rgba(188,207,161,0.12)_48%,transparent_72%)] max-[680px]:block"
              aria-hidden="true"
            />

            <span
              className="pointer-events-none absolute top-[-4%] right-[-4%] bottom-[-4%] left-[-4%] z-[1] hidden rounded-[47%_53%_51%_49%/48%_44%_56%_52%] border border-[rgba(63,125,58,0.38)] [animation:mobile-orbit-slow_10s_ease-in-out_infinite_alternate] max-[680px]:block motion-safe:[will-change:transform] motion-reduce:animate-none motion-reduce:[transform:rotate(8deg)]"
              aria-hidden="true"
            />

            <span
              className="pointer-events-none absolute top-[-1%] right-[-2%] bottom-[-1%] left-[-2%] z-[1] hidden rounded-[53%_47%_44%_56%/52%_56%_44%_48%] border border-[rgba(57,111,58,0.22)] [animation:mobile-orbit-pulse_13s_ease-in-out_infinite_alternate] max-[680px]:block motion-safe:[will-change:transform,opacity] motion-reduce:animate-none"
              aria-hidden="true"
            />

            <span
              className="pointer-events-none absolute top-[2%] left-[-3%] z-[5] hidden [animation:mobile-float-a_6.2s_ease-in-out_infinite] max-[680px]:block motion-safe:[will-change:transform] motion-reduce:animate-none"
              aria-hidden="true"
            >
              <i className="block h-[18px] w-[38px] rotate-[-28deg] rounded-[100%_0_100%_0] bg-[rgba(102,137,54,0.8)] shadow-[0_4px_12px_rgba(23,63,42,0.14)]" />
            </span>

            <span
              className="pointer-events-none absolute top-[6%] right-[-1%] z-[5] hidden [animation:mobile-float-b_7.8s_ease-in-out_-1.4s_infinite] max-[680px]:block motion-safe:[will-change:transform] motion-reduce:animate-none"
              aria-hidden="true"
            >
              <i className="block h-[14px] w-[28px] rounded-[100%_0_100%_0] bg-[rgba(111,143,47,0.72)] shadow-[0_3px_8px_rgba(23,63,42,0.1)] rotate-[42deg]" />
            </span>

            <div className="group/portrait absolute inset-[2%_0_0] z-[2] overflow-hidden rounded-[52%_48%_9%_13%/29%_34%_5%_7%] border border-[rgba(23,63,42,0.11)] bg-[var(--beige)] shadow-[0_36px_90px_rgba(40,51,33,0.2)] max-[1080px]:inset-0 max-[1080px]:rounded-[50%_50%_8px_8px/28%_28%_1%_1%] max-[680px]:rounded-[50%_50%_12px_12px/26%_26%_2%_2%]">
              <Image
                src={heroImage}
                alt="A woman with long, dark natural hair in a sunlit botanical setting"
                fill
                sizes="(max-width: 680px) 50vw, (max-width: 900px) 52vw, (max-width: 1080px) 55vw, (max-width: 1440px) 44vw, 600px"
                className="object-cover object-[76%_center] [transform:scale(1.04)] [transition:transform_1.1s_var(--ease)] [@media(hover:hover)_and_(pointer:fine)]:group-hover/portrait:[transform:scale(1.065)] max-[680px]:object-[74%_center] motion-reduce:transition-none motion-reduce:[transform:scale(1.04)]"
              />
              <span
                className="absolute inset-0 bg-[linear-gradient(180deg,transparent_60%,rgba(17,45,28,0.2)),linear-gradient(90deg,rgba(247,244,232,0.08),transparent_35%)]"
                aria-hidden="true"
              />
              <span
                className="absolute right-4 bottom-3 text-[0.52rem] font-bold tracking-[0.14em] text-[rgba(255,255,255,0.85)] max-[680px]:right-3 max-[680px]:bottom-2.5 max-[680px]:text-[0.46rem]"
                aria-hidden="true"
              >
                0{activeProductIndex + 1} / 0{products.length}
              </span>
            </div>
            <Link
              className="absolute bottom-[28%] left-[-68px] z-[5] grid min-h-[62px] w-[225px] grid-cols-[40px_1fr_8px] items-center gap-[10px] rounded-lg border border-[rgba(255,255,255,0.55)] bg-[rgba(248,245,234,0.87)] px-3 py-[9px] shadow-[0_18px_45px_rgba(28,46,31,0.16)] backdrop-blur-[14px] [transition:transform_300ms_var(--ease),background-color_300ms_var(--ease)] hover:bg-[rgba(255,253,246,0.96)] hover:[transform:translateY(-3px)] max-[1180px]:left-[-34px] max-[1180px]:w-[205px] min-[901px]:max-[1080px]:left-[-38px] max-[900px]:left-[-38px] max-[680px]:bottom-[17%] max-[680px]:left-3 max-[680px]:w-[min(220px,67vw)] motion-reduce:transition-none motion-reduce:transform-none motion-reduce:opacity-100"
              href={`/shop/${activeProduct.slug}`}
              aria-label={`View the ${activeProduct.name} ritual`}
            >
              <span className="grid size-10 place-items-center rounded-full bg-[var(--forest)] text-[var(--paper)] [font-family:var(--font-display)]">
                {activeProduct.collectionNumber}
              </span>
              <div className="grid leading-[1.2]">
                <strong className="text-[0.88rem] font-semibold text-[var(--forest)] [font-family:var(--font-display)]">
                  {details.badgeText}
                </strong>
                <small className="mt-1 text-[0.48rem] text-[var(--muted)]">
                  {details.badgeSubtitle}
                </small>
              </div>
              <i
                className="size-[7px] rounded-full shadow-[0_0_0_5px_rgba(167,201,67,0.16)]"
                style={{ backgroundColor: activeProduct.accent }}
                aria-hidden="true"
              />
            </Link>
            <a
              className="absolute right-5 bottom-5 z-[6] grid size-[60px] place-items-center rounded-full border border-[rgba(255,255,255,0.7)] bg-[rgba(23,63,42,0.35)] text-[1.5rem] text-white shadow-[0_14px_32px_rgba(18,38,23,0.25)] backdrop-blur-[10px] [font-family:var(--font-display)] [transition:background_250ms_ease,transform_250ms_ease,border-color_250ms_ease] hover:border-white hover:bg-[rgba(23,63,42,0.7)] hover:[transform:translateY(3px)_scale(1.05)] max-[1080px]:right-4 max-[1080px]:bottom-4 max-[680px]:right-3 max-[680px]:bottom-[max(14px,env(safe-area-inset-bottom))] max-[680px]:size-12 max-[680px]:text-[1.2rem] motion-reduce:transition-none"
              href="#collection-title"
              aria-label="Scroll to the botanical collection"
            >
              <span
                className="[animation:hero-arrow_2.2s_ease-in-out_infinite] motion-reduce:animate-none"
                aria-hidden="true"
              >
                ↓
              </span>
            </a>
          </div>

          <aside
            className="relative z-[4] min-w-0 self-center scroll-mt-[calc(var(--header-height)+20px)] max-[1080px]:col-span-full max-[1080px]:grid max-[1080px]:grid-cols-[minmax(220px,0.75fr)_minmax(280px,1.25fr)] max-[1080px]:items-start max-[1080px]:gap-x-[26px] max-[1080px]:border-t max-[1080px]:border-[var(--line)] max-[1080px]:pt-7 max-[680px]:col-span-full max-[680px]:flex max-[680px]:flex-col max-[680px]:gap-y-4 max-[680px]:pt-6"
            id="featured-ritual"
            aria-label={`Featured ${activeProduct.name} ritual`}
          >
            <nav
              className="mb-[7px] grid grid-cols-[42px_1fr_42px] items-center gap-2 text-[var(--forest)] max-[1080px]:col-span-full max-[680px]:w-full max-[680px]:py-2"
              aria-label="Browse featured rituals"
            >
              <button
                type="button"
                onClick={handlePrevProduct}
                className="grid size-[42px] place-items-center rounded-full border border-[rgba(23,63,42,0.24)] text-[1.1rem] [transition:color_240ms_ease,background_240ms_ease,transform_240ms_ease] motion-reduce:transition-none hover:bg-[var(--forest)] hover:text-[var(--paper)] hover:[transform:translateY(-2px)]"
                aria-label="Previous featured ritual"
              >
                ←
              </button>
              <span className="text-center text-[0.56rem] font-bold tracking-[0.16em] text-[var(--muted)] uppercase">
                Featured ritual ({activeProductIndex + 1} / {products.length})
              </span>
              <button
                type="button"
                onClick={handleNextProduct}
                className="grid size-[42px] place-items-center rounded-full border border-[rgba(23,63,42,0.24)] text-[1.1rem] [transition:color_240ms_ease,background_240ms_ease,transform_240ms_ease] motion-reduce:transition-none hover:bg-[var(--forest)] hover:text-[var(--paper)] hover:[transform:translateY(-2px)]"
                aria-label="Next featured ritual"
              >
                →
              </button>
            </nav>
            <div className="relative grid h-[clamp(245px,31vh,305px)] place-items-center overflow-hidden border-b border-[var(--line)] bg-[radial-gradient(circle_at_52%_54%,rgba(167,201,67,0.18),transparent_49%)] max-[1080px]:col-start-1 max-[1080px]:row-[2/4] max-[1080px]:h-[300px] max-[1080px]:border-b-0 max-[680px]:col-start-auto max-[680px]:row-auto max-[680px]:h-[260px] max-[680px]:w-full max-[680px]:rounded-lg max-[680px]:border border-[var(--line)]">
              <span
                className="pointer-events-none absolute inset-0"
                aria-hidden="true"
              >
                <i className="absolute top-[20%] left-[6%] h-[18px] w-[38px] [transform:rotate(-18deg)_scale(1.1)] rounded-[100%_0_100%_0] bg-[rgba(111,143,47,0.78)]" />
                <i className="absolute top-[34%] right-[4%] h-[18px] w-[38px] rotate-[42deg] rounded-[100%_0_100%_0] bg-[rgba(111,143,47,0.78)]" />
                <i className="absolute right-[19%] bottom-[12%] h-[18px] w-[38px] [transform:rotate(115deg)_scale(0.75)] rounded-[100%_0_100%_0] bg-[rgba(111,143,47,0.78)]" />
              </span>
              <ProductJar
                key={activeProduct.slug}
                product={activeProduct}
                size="medium"
                className="z-[3] [--hero-jar-scale:0.9] [transform:scale(var(--hero-jar-scale))] [animation:hero-jar-float_5.5s_ease-in-out_infinite] max-[1180px]:[--hero-jar-scale:0.82] min-[901px]:max-[1080px]:[--hero-jar-scale:0.94] max-[900px]:[--hero-jar-scale:0.94] max-[680px]:[--hero-jar-scale:0.82] motion-reduce:animate-none motion-reduce:[transform:scale(var(--hero-jar-scale))]"
              />
              <span
                className="absolute right-[5%] bottom-[21%] z-[4] h-[23px] w-[47px] rotate-[-9deg] rounded-[50%] border-[5px] border-[rgba(255,255,255,0.72)] shadow-[0_7px_17px_rgba(31,43,25,0.16)]"
                style={{ backgroundColor: activeProduct.accent }}
                aria-hidden="true"
              />
            </div>
            <div className="py-[17px_11px] max-[1080px]:col-start-2 max-[1080px]:row-start-2 max-[1080px]:py-[14px] max-[680px]:col-start-auto max-[680px]:row-auto max-[680px]:pt-3 max-[680px]:pb-1">
              <span className="text-[0.52rem] font-bold tracking-[0.13em] text-[var(--muted)] uppercase">
                NatureMist / Ritual {activeProduct.collectionNumber}
              </span>
              <h2 className="my-[3px_1px] [color:var(--forest)] [font-family:var(--font-display)] text-[clamp(2rem,2.7vw,3.15rem)] leading-none font-normal tracking-[-0.045em] max-[1180px]:text-[clamp(1.85rem,2.5vw,2.6rem)] max-[680px]:text-[2.2rem]">
                {activeProduct.name}
              </h2>
              <p className="m-0 text-[0.52rem] font-bold tracking-[0.13em] text-[var(--muted)] uppercase">
                {activeProduct.subtitle} · packaging preview
              </p>
            </div>
            <div className="border-t border-[var(--line)] max-[1080px]:col-start-2 max-[1080px]:row-start-3 max-[680px]:col-start-auto max-[680px]:row-auto max-[680px]:border-t-0">
              <details className="group/fact border-b border-[var(--line)]">
                <summary className="flex min-h-[49px] cursor-pointer list-none items-center justify-between text-[0.98rem] text-[var(--forest)] [font-family:var(--font-display)] [&::-webkit-details-marker]:hidden max-[680px]:min-h-[46px] max-[680px]:text-[0.95rem]">
                  Why you&apos;ll love it{" "}
                  <span
                    className="[font-family:var(--font-sans)] [transition:transform_300ms_var(--ease)] motion-reduce:transition-none group-open/fact:[transform:rotate(45deg)]"
                    aria-hidden="true"
                  >
                    ＋
                  </span>
                </summary>
                <p className="mt-[-1px] mb-0 pb-[14px] text-[0.68rem] leading-[1.58] text-[var(--muted)] max-[680px]:text-[0.76rem]">
                  {activeProduct.shortDescription}
                </p>
              </details>
              <details className="group/fact border-b border-[var(--line)]">
                <summary className="flex min-h-[49px] cursor-pointer list-none items-center justify-between text-[0.98rem] text-[var(--forest)] [font-family:var(--font-display)] [&::-webkit-details-marker]:hidden max-[680px]:min-h-[46px] max-[680px]:text-[0.95rem]">
                  How to prepare{" "}
                  <span
                    className="[font-family:var(--font-sans)] [transition:transform_300ms_var(--ease)] motion-reduce:transition-none group-open/fact:[transform:rotate(45deg)]"
                    aria-hidden="true"
                  >
                    ＋
                  </span>
                </summary>
                <p className="mt-[-1px] mb-0 pb-[14px] text-[0.68rem] leading-[1.58] text-[var(--muted)] max-[680px]:text-[0.76rem]">
                  {details.howToText}
                </p>
              </details>
              <details className="group/fact border-b border-[var(--line)]" open>
                <summary className="flex min-h-[49px] cursor-pointer list-none items-center justify-between text-[0.98rem] text-[var(--forest)] [font-family:var(--font-display)] [&::-webkit-details-marker]:hidden max-[680px]:min-h-[46px] max-[680px]:text-[0.95rem]">
                  Ingredient clarity{" "}
                  <span
                    className="[font-family:var(--font-sans)] [transition:transform_300ms_var(--ease)] motion-reduce:transition-none group-open/fact:[transform:rotate(45deg)]"
                    aria-hidden="true"
                  >
                    ＋
                  </span>
                </summary>
                <p className="mt-[-1px] mb-0 pb-[14px] text-[0.68rem] leading-[1.58] text-[var(--muted)] max-[680px]:text-[0.76rem]">
                  {activeProduct.ingredient}
                </p>
              </details>
            </div>
          </aside>
        </div>
      </section>

      <section
        className={`${sectionClass} ${revealClass} overflow-hidden max-[680px]:py-12`}
        aria-labelledby="collection-title"
      >
        <div className="grid grid-cols-[minmax(0,1.35fr)_minmax(260px,0.65fr)] items-end gap-[clamp(48px,6vw,88px)] max-[900px]:grid-cols-[minmax(0,1.15fr)_minmax(210px,0.85fr)] max-[900px]:gap-8 max-[680px]:grid-cols-1 max-[680px]:gap-3">
          <div>
            <p className={eyebrowClass}>The botanical cabinet</p>
            <h2 className={sectionTitleClass} id="collection-title">
              Shop the herbal collection.
            </h2>
          </div>
          <div className="max-w-[460px] pb-1 leading-[1.75] text-[var(--muted)] max-[900px]:p-0">
            <p>Six single botanicals. Six distinct rituals. One calm, considered way to begin.</p>
            <Link className={`${textLinkClass} mt-[15px] max-[680px]:mt-2`} href="/shop">
              View all botanicals <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
        <div
          className="grid grid-cols-3 gap-[clamp(18px,2vw,30px)] pt-[72px] max-[1180px]:grid-cols-2 max-[680px]:grid-cols-2 max-[680px]:gap-3 max-[680px]:pt-6"
          aria-label="NatureMist botanical collection"
        >
          {products.map((product) => (
            <ProductCard product={product} key={product.slug} />
          ))}
        </div>
        <p className="mx-auto mt-6 max-w-[680px] text-center text-[0.7rem] leading-[1.6] text-[var(--muted)] max-[680px]:mt-5 max-[680px]:px-2 max-[680px]:text-[0.65rem]">
          Product jars and prices are editable launch previews. Final labels, net weights, batch data and commercial terms will replace them before sale.
        </p>
      </section>

      <section
        className={`mx-auto w-full max-w-[1440px] px-[clamp(24px,5vw,72px)] pt-2 pb-[clamp(80px,8vw,124px)] max-[680px]:px-4 max-[680px]:pt-2 max-[680px]:pb-12 ${revealClass}`}
        aria-labelledby="choose-title"
      >
        <div className={centeredHeadingClass}>
          <p className={eyebrowClass}>Begin with how you want to feel</p>
          <h2 className={sectionTitleClass} id="choose-title">
            Choose your ritual.
          </h2>
          <p className="mx-auto mt-5 max-w-[620px] text-[var(--muted)] max-[680px]:mt-3 max-[680px]:text-[0.78rem] max-[680px]:leading-[1.5]">
            Traditional ingredients become easier when the purpose is clear.
          </p>
        </div>
        <div className="grid grid-cols-4 gap-px overflow-hidden rounded-[3px] bg-[var(--line)] ring-1 ring-[var(--line)] max-[1180px]:grid-cols-2 max-[680px]:grid-cols-2">
          {ritualCards.map((ritual, index) => (
            <Link
              className={`group/ritual relative min-h-[390px] overflow-hidden bg-[var(--paper)] p-[clamp(24px,2.2vw,30px)] [transition:color_450ms_var(--ease),background_450ms_var(--ease)] motion-reduce:transition-none hover:bg-[var(--forest)] hover:text-[var(--paper)] max-[900px]:min-h-[360px] max-[680px]:min-h-[220px] max-[680px]:p-3.5 ${ritualColorClasses[index]}`}
              href={ritual.href}
              key={ritual.title}
            >
              <span className="text-[0.62rem] font-bold tracking-[0.14em] text-[var(--botanical)] group-hover/ritual:text-[var(--amla)] max-[680px]:text-[0.55rem]">
                {ritual.number}
              </span>
              <span
                className="absolute top-[70px] right-[5%] left-[5%] h-[190px] rounded-[50%_50%_0_0] bg-[radial-gradient(circle_at_50%_70%,color-mix(in_srgb,var(--ritual-color)_60%,white),transparent_55%),var(--ritual-color)] opacity-[0.78] [transition:transform_600ms_var(--ease),opacity_600ms_var(--ease)] motion-reduce:transition-none group-hover/ritual:[transform:scale(1.04)_translateY(-4px)] group-hover/ritual:opacity-[0.55] max-[680px]:top-7 max-[680px]:h-[100px] max-[680px]:bg-transparent max-[680px]:opacity-100"
                aria-hidden="true"
              >
                <i className="absolute bottom-[25px] left-1/2 h-10 w-[70px] [transform:rotate(-35deg)] rounded-[100%_0_100%_0] bg-[rgba(23,63,42,0.32)] origin-left max-[680px]:h-7 max-[680px]:w-[50px] max-[680px]:bg-[rgba(161,179,164,0.58)]" />
                <i className="absolute bottom-[25px] left-1/2 h-10 w-[70px] [transform:scaleX(-1)_rotate(-35deg)] rounded-[100%_0_100%_0] bg-[rgba(23,63,42,0.32)] origin-left max-[680px]:h-7 max-[680px]:w-[50px] max-[680px]:bg-[rgba(161,179,164,0.58)]" />
                <i className="absolute bottom-[65px] left-1/2 h-10 w-[70px] [transform:rotate(-75deg)_scale(0.7)] rounded-[100%_0_100%_0] bg-[rgba(23,63,42,0.32)] origin-left max-[680px]:bottom-[42px] max-[680px]:h-7 max-[680px]:w-[50px] max-[680px]:bg-[rgba(161,179,164,0.58)]" />
              </span>
              <h3 className="absolute right-[16px] bottom-[72px] left-[16px] m-0 [color:var(--forest)] [font-family:var(--font-display)] text-[clamp(1.7rem,2.4vw,2.7rem)] leading-none font-normal tracking-[-0.04em] [transition:color_350ms_ease] motion-reduce:transition-none group-hover/ritual:text-[var(--paper)] max-[680px]:right-3.5 max-[680px]:bottom-9 max-[680px]:left-3.5 max-[680px]:text-[1.15rem]">
                {ritual.title}
              </h3>
              <p className="absolute right-[30px] bottom-[47px] left-[30px] m-0 text-[0.74rem] leading-[1.5] [color:var(--muted)] [transition:color_350ms_ease] motion-reduce:transition-none group-hover/ritual:text-[var(--paper)] max-[680px]:hidden">
                {ritual.copy}
              </p>
              <span className="absolute right-6 bottom-5 text-[0.62rem] tracking-[0.1em] uppercase opacity-0 [transform:translateY(8px)] [transition:opacity_350ms_ease,transform_350ms_ease] motion-reduce:transition-none group-hover/ritual:opacity-100 group-hover/ritual:[transform:translateY(0)] max-[680px]:right-3.5 max-[680px]:bottom-2.5 max-[680px]:text-[0.52rem] max-[680px]:opacity-100 max-[680px]:[transform:translateY(0)]">
                Explore <i className="not-italic" aria-hidden="true">↗</i>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section
        className={`bg-[var(--forest)] text-[var(--paper)] ${revealClass}`}
        aria-labelledby="builder-title"
      >
        <div className="mx-auto grid w-full max-w-[1440px] grid-cols-[0.72fr_1.28fr] items-start gap-[clamp(50px,6vw,88px)] px-[clamp(24px,5vw,72px)] py-[clamp(76px,8vw,116px)] max-[900px]:grid-cols-[minmax(190px,0.7fr)_minmax(0,1.3fr)] max-[900px]:gap-8 max-[680px]:grid-cols-1 max-[680px]:gap-8 max-[680px]:px-4 max-[680px]:py-12">
          <div className="max-[900px]:max-w-[680px]">
            <p className={lightEyebrowClass}>Build your ritual</p>
            <h2
              className="m-0 [font-family:var(--font-display)] text-[clamp(3rem,4.4vw,5rem)] leading-[0.95] font-normal tracking-[-0.055em] max-[900px]:text-[clamp(2.45rem,5.5vw,3.2rem)] max-[680px]:text-[clamp(2.2rem,9.5vw,2.9rem)]"
              id="builder-title"
            >
              A botanical starting point, chosen with care.
            </h2>
            <p className="mt-7 max-w-[490px] text-[rgba(255,255,255,0.65)] max-[680px]:mt-3 max-[680px]:text-[0.82rem] max-[680px]:leading-[1.6]">
              Tell us your ritual goal and how your hair feels today. We&apos;ll suggest a simple place to begin—never a diagnosis or a promise.
            </p>
          </div>
          <RitualFinder />
        </div>
      </section>

      <section
        className={`${sectionClass} ${revealClass} max-[680px]:py-12 max-[680px]:px-4`}
        aria-labelledby="prepare-title"
      >
        <div className={splitHeadingClass}>
          <div>
            <p className={eyebrowClass}>The art of preparation</p>
            <h2 className={sectionTitleClass} id="prepare-title">
              Three steps. One unhurried ritual.
            </h2>
          </div>
          <p className="max-w-[460px] pb-1 leading-[1.75] text-[var(--muted)] max-[900px]:p-0 max-[680px]:text-[0.78rem] max-[680px]:leading-[1.5]">
            Every powder has its own directions. The rhythm, however, stays beautifully simple.
          </p>
        </div>
        <div className="mt-[72px] grid grid-cols-3 border-y border-[var(--line)] max-[680px]:mt-7 max-[680px]:grid-cols-3">
          <article className="relative min-h-[360px] border-r border-[var(--line)] px-10 pt-7 pb-10 last:border-r-0 max-[900px]:px-[18px] max-[680px]:min-h-0 max-[680px]:px-1.5 max-[680px]:py-5">
            <span className="text-[0.63rem] font-bold tracking-[0.15em] text-[var(--botanical)] max-[680px]:text-[0.52rem]">
              01
            </span>
            <span
              className="relative mx-auto mt-7 mb-[18px] block h-[135px] w-[110px] before:absolute before:top-[15px] before:left-[38px] before:h-12 before:w-[38px] before:rotate-[-12deg] before:rounded-[50%_50%_44%_44%] before:border-2 before:border-[var(--forest)] before:content-[''] after:absolute after:top-[59px] after:left-[54px] after:h-[70px] after:w-[7px] after:rotate-[-12deg] after:rounded-[9px] after:bg-[var(--forest)] after:content-[''] max-[680px]:my-2 max-[680px]:h-[70px] max-[680px]:w-[55px] max-[680px]:before:top-[5px] max-[680px]:before:left-[16px] max-[680px]:before:h-7 max-[680px]:before:w-[22px] max-[680px]:after:top-[30px] max-[680px]:after:left-[25px] max-[680px]:after:h-[35px] max-[680px]:after:w-[4px]"
              aria-hidden="true"
            >
              <i />
            </span>
            <h3 className="m-0 text-center [color:var(--forest)] [font-family:var(--font-display)] text-[2rem] font-normal max-[680px]:text-[1.15rem]">
              Scoop
            </h3>
            <p className="mx-auto mt-2 max-w-[290px] text-center text-[0.82rem] text-[var(--muted)] max-[680px]:mt-1 max-[680px]:text-[0.58rem] max-[680px]:leading-[1.3] max-[680px]:line-clamp-2">
              Begin with enough botanical powder for your hair length.
            </p>
          </article>
          <article className="relative min-h-[360px] border-r border-[var(--line)] px-10 pt-7 pb-10 last:border-r-0 max-[900px]:px-[18px] max-[680px]:min-h-0 max-[680px]:px-1.5 max-[680px]:py-5">
            <span className="text-[0.63rem] font-bold tracking-[0.15em] text-[var(--botanical)] max-[680px]:text-[0.52rem]">
              02
            </span>
            <span
              className="relative mx-auto mt-7 mb-[18px] block h-[135px] w-[110px] before:absolute before:top-12 before:left-[5px] before:h-[52px] before:w-[100px] before:rounded-[0_0_60px_60px] before:border-2 before:border-[var(--forest)] before:content-[''] after:absolute after:top-[43px] after:left-[5px] after:h-3 after:w-[100px] after:rounded-[50%] after:border-2 after:border-[var(--forest)] after:bg-[var(--ivory)] after:content-[''] max-[680px]:my-2 max-[680px]:h-[70px] max-[680px]:w-[55px] max-[680px]:before:top-6 max-[680px]:before:left-[2px] max-[680px]:before:h-[28px] max-[680px]:before:w-[50px] max-[680px]:before:rounded-[0_0_30px_30px] max-[680px]:after:top-[22px] max-[680px]:after:left-[2px] max-[680px]:after:h-2 max-[680px]:after:w-[50px]"
              aria-hidden="true"
            >
              <i />
            </span>
            <h3 className="m-0 text-center [color:var(--forest)] [font-family:var(--font-display)] text-[2rem] font-normal max-[680px]:text-[1.15rem]">
              Mix
            </h3>
            <p className="mx-auto mt-2 max-w-[290px] text-center text-[0.82rem] text-[var(--muted)] max-[680px]:mt-1 max-[680px]:text-[0.58rem] max-[680px]:leading-[1.3] max-[680px]:line-clamp-2">
              Add water gradually until the texture is smooth and spreadable.
            </p>
          </article>
          <article className="relative min-h-[360px] border-r border-[var(--line)] px-10 pt-7 pb-10 last:border-r-0 max-[900px]:px-[18px] max-[680px]:min-h-0 max-[680px]:px-1.5 max-[680px]:py-5">
            <span className="text-[0.63rem] font-bold tracking-[0.15em] text-[var(--botanical)] max-[680px]:text-[0.52rem]">
              03
            </span>
            <span
              className="relative mx-auto mt-7 mb-[18px] block h-[135px] w-[110px] before:absolute before:top-[18px] before:left-10 before:h-[84px] before:w-[37px] before:rotate-[17deg] before:rounded-[55%_55%_44%_44%] before:border-2 before:border-[var(--forest)] before:content-[''] after:absolute after:right-[5px] after:bottom-[18px] after:left-[5px] after:h-px after:bg-[var(--line)] after:shadow-[0_7px_0_var(--line),0_14px_0_var(--line)] after:content-[''] max-[680px]:my-2 max-[680px]:h-[70px] max-[680px]:w-[55px] max-[680px]:before:top-2 max-[680px]:before:left-5 max-[680px]:before:h-[45px] max-[680px]:before:w-[20px] max-[680px]:after:bottom-[8px]"
              aria-hidden="true"
            >
              <i />
            </span>
            <h3 className="m-0 text-center [color:var(--forest)] [font-family:var(--font-display)] text-[2rem] font-normal max-[680px]:text-[1.15rem]">
              Apply
            </h3>
            <p className="mx-auto mt-2 max-w-[290px] text-center text-[0.82rem] text-[var(--muted)] max-[680px]:mt-1 max-[680px]:text-[0.58rem] max-[680px]:leading-[1.3] max-[680px]:line-clamp-2">
              Follow the botanical directions, then rinse thoroughly.
            </p>
          </article>
        </div>
      </section>

      <section
        className={`mx-auto grid w-full max-w-[1440px] scroll-mt-[calc(var(--header-height)+24px)] grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] items-center gap-[clamp(52px,7vw,96px)] px-[clamp(24px,5vw,72px)] pb-[clamp(84px,9vw,132px)] max-[900px]:grid-cols-[0.8fr_1.2fr] max-[900px]:gap-11 max-[680px]:grid-cols-1 max-[680px]:gap-6 max-[680px]:px-4 max-[680px]:pb-12 ${revealClass}`}
        id="ingredient-standards"
        aria-labelledby="purity-title"
      >
        <div className="relative">
          <div className="relative aspect-[0.72] w-full overflow-hidden rounded-[50%_50%_4px_4px/22%_22%_4px_4px] bg-[var(--beige)] max-[680px]:aspect-[1.1] max-[680px]:rounded-lg">
            <Image
              src={ritualImage}
              alt="A hand slowly mixing a fresh green amla paste in a ceramic bowl beside amla fruit"
              fill
              sizes="(max-width: 680px) 92vw, (max-width: 800px) 90vw, 45vw"
              className="object-cover"
            />
          </div>
          <span className="mt-[13px] block text-[0.55rem] tracking-[0.15em] text-[var(--muted)] uppercase max-[680px]:mt-2 max-[680px]:text-[0.5rem]">
            Amla ritual · prepared fresh
          </span>
        </div>
        <div>
          <p className={eyebrowClass}>Ingredient clarity</p>
          <h2 className={`${sectionTitleClass} max-[680px]:!text-[clamp(1.75rem,7.5vw,2.4rem)] max-[680px]:!leading-[1]`} id="purity-title">
            One ingredient. Nothing hidden.
          </h2>
          <p className="my-[30px_38px] max-w-[610px] text-[clamp(1.02rem,1.3vw,1.2rem)] leading-[1.75] text-[var(--muted)] max-[680px]:my-[14px_16px] max-[680px]:text-[0.78rem] max-[680px]:leading-[1.55]">
            NatureMist translates a time-honoured practice into a ritual you can understand from first scoop to final rinse.
          </p>
          <div className="mb-[34px] border-t border-[var(--line)] max-[680px]:mb-5">
            <article className="grid grid-cols-[38px_1fr] gap-5 border-b border-[var(--line)] py-[22px] max-[680px]:grid-cols-[28px_1fr] max-[680px]:gap-3 max-[680px]:py-3">
              <span className="text-[0.62rem] text-[var(--botanical)] max-[680px]:text-[0.55rem]">01</span>
              <div>
                <h3 className="m-0 [color:var(--forest)] [font-family:var(--font-display)] text-[1.35rem] font-normal max-[680px]:text-[1.05rem]">
                  Name the botanical
                </h3>
                <p className="mt-1 mb-0 text-[0.78rem] text-[var(--muted)] max-[680px]:text-[0.68rem] max-[680px]:leading-[1.4]">
                  Common name, botanical identity and plant part—clearly stated on the final pack.
                </p>
              </div>
            </article>
            <article className="grid grid-cols-[38px_1fr] gap-5 border-b border-[var(--line)] py-[22px] max-[680px]:grid-cols-[28px_1fr] max-[680px]:gap-3 max-[680px]:py-3">
              <span className="text-[0.62rem] text-[var(--botanical)] max-[680px]:text-[0.55rem]">02</span>
              <div>
                <h3 className="m-0 [color:var(--forest)] [font-family:var(--font-display)] text-[1.35rem] font-normal max-[680px]:text-[1.05rem]">
                  Explain the ritual
                </h3>
                <p className="mt-1 mb-0 text-[0.78rem] text-[var(--muted)] max-[680px]:text-[0.68rem] max-[680px]:leading-[1.4]">
                  Preparation, pairing and safety guidance written for beginners as well as familiar users.
                </p>
              </div>
            </article>
            <article className="grid grid-cols-[38px_1fr] gap-5 border-b border-[var(--line)] py-[22px] max-[680px]:grid-cols-[28px_1fr] max-[680px]:gap-3 max-[680px]:py-3">
              <span className="text-[0.62rem] text-[var(--botanical)] max-[680px]:text-[0.55rem]">03</span>
              <div>
                <h3 className="m-0 [color:var(--forest)] [font-family:var(--font-display)] text-[1.35rem] font-normal max-[680px]:text-[1.05rem]">
                  Keep claims honest
                </h3>
                <p className="mt-1 mb-0 text-[0.78rem] text-[var(--muted)] max-[680px]:text-[0.68rem] max-[680px]:leading-[1.4]">
                  Thoughtful cosmetic language without miracle promises or invented proof.
                </p>
              </div>
            </article>
          </div>
          <Link
            className={`${buttonClass} border-[var(--forest)] text-[var(--forest)] hover:bg-[var(--forest)] hover:text-[var(--paper)] max-[680px]:min-h-11 max-[680px]:w-full max-[680px]:gap-2 max-[680px]:px-4 max-[680px]:text-[0.65rem] max-[680px]:tracking-[0.1em]`}
            href="/our-story"
          >
            Read our philosophy <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>

      <section
        className={`${sectionClass} ${revealClass}`}
        aria-labelledby="family-title"
      >
        <div className={centeredHeadingClass}>
          <p className={eyebrowClass}>A family of six</p>
          <h2 className={sectionTitleClass} id="family-title">
            Same ritual language. A different botanical note.
          </h2>
          <p className="mx-auto mt-6 max-w-[620px] text-[var(--muted)]">
            Move through the collection and find the ingredient that meets you where your hair is today.
          </p>
        </div>
        <FeaturedProductSwitcher />
      </section>

      <section
        className={`relative flex min-h-[690px] flex-col items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_38%,rgba(167,201,67,0.12),transparent_38%),var(--forest-dark)] px-[25px] pt-[100px] pb-[55px] text-center text-[var(--paper)] max-[680px]:min-h-[660px] max-[680px]:px-5 max-[680px]:pt-20 max-[680px]:pb-[104px] ${revealClass}`}
        aria-labelledby="story-title"
      >
        <div
          className="absolute top-[-30px] left-1/2 h-[280px] w-[340px] -translate-x-1/2 opacity-20 before:absolute before:top-0 before:left-1/2 before:h-full before:w-px before:bg-[var(--amla)] before:content-['']"
          aria-hidden="true"
        >
          <i className="absolute top-[35px] left-[75px] h-[45px] w-[95px] rotate-[25deg] rounded-[100%_0_100%_0] border border-[var(--amla)]" />
          <i className="absolute top-[83px] right-[74px] h-[45px] w-[95px] [transform:scaleX(-1)_rotate(25deg)] rounded-[100%_0_100%_0] border border-[var(--amla)]" />
          <i className="absolute top-[133px] left-[73px] h-[45px] w-[95px] rotate-[25deg] rounded-[100%_0_100%_0] border border-[var(--amla)]" />
          <i className="absolute top-[180px] right-[76px] h-[45px] w-[95px] [transform:scaleX(-1)_rotate(25deg)] rounded-[100%_0_100%_0] border border-[var(--amla)]" />
          <i className="absolute top-[222px] left-[79px] h-[45px] w-[95px] rotate-[25deg] rounded-[100%_0_100%_0] border border-[var(--amla)]" />
        </div>
        <p className={lightEyebrowClass}>The NatureMist philosophy</p>
        <h2
          className="m-0 max-w-[1120px] text-[clamp(4.25rem,6.5vw,7.2rem)] leading-[0.82] font-normal tracking-[-0.055em] text-[var(--paper)] [font-family:var(--font-display)] max-[680px]:text-[clamp(3rem,14vw,4rem)]"
          id="story-title"
        >
          Ancient botanicals.<br />Modern care.
        </h2>
        <p className="mx-auto my-[40px_32px] max-w-[640px] text-[1.03rem] text-[rgba(255,255,255,0.67)] max-[680px]:my-[30px_28px] max-[680px]:text-[0.9rem] max-[680px]:leading-[1.65]">
          Beauty begins at the root—with ingredients we can name, rituals we can understand and enough time to care for ourselves well.
        </p>
        <Link
          className={`${buttonClass} border-transparent bg-[var(--paper)] text-[var(--forest)] hover:bg-[var(--amla)]`}
          href="/our-story"
        >
          Our story <span aria-hidden="true">↗</span>
        </Link>
        <div className="absolute right-[5vw] bottom-6 left-[5vw] flex justify-between border-t border-[rgba(255,255,255,0.15)] pt-5 text-[0.58rem] tracking-[0.13em] text-[rgba(255,255,255,0.58)] uppercase max-[680px]:bottom-[max(24px,env(safe-area-inset-bottom))] max-[680px]:items-center max-[680px]:gap-2 max-[680px]:flex-col">
          <span>Tradition, refined</span>
          <span>Education before expectation</span>
          <span>Care without clutter</span>
        </div>
      </section>

      <section
        className={`${sectionClass} ${revealClass}`}
        aria-labelledby="bundles-title"
      >
        <div className={splitHeadingClass}>
          <div>
            <p className={eyebrowClass}>Rituals in company</p>
            <h2 className={sectionTitleClass} id="bundles-title">
              Botanicals that belong together.
            </h2>
          </div>
          <p className="max-w-[460px] pb-1 leading-[1.75] text-[var(--muted)] max-[900px]:p-0">
            Build a wash day, deepen a conditioning mask or keep the full botanical cabinet close.
          </p>
        </div>
        <BundleCards />
      </section>

      <section
        className={`mx-auto w-full max-w-[1440px] px-[clamp(24px,5vw,72px)] pt-2 pb-[clamp(80px,8vw,124px)] max-[680px]:px-5 max-[680px]:pt-0 max-[680px]:pb-16 ${revealClass}`}
        aria-labelledby="compare-title"
      >
        <div className={centeredHeadingClass}>
          <p className={eyebrowClass}>Find your first jar</p>
          <h2 className={sectionTitleClass} id="compare-title">
            A simple comparison.
          </h2>
        </div>
        <div
          className="overflow-x-auto border-t border-[var(--line)] max-[680px]:w-[calc(100%+20px)]"
          role="region"
          aria-label="Product comparison"
          tabIndex={0}
        >
          <table className="w-full min-w-[760px] border-collapse">
            <thead>
              <tr>
                <th className="border-b border-[var(--line)] px-[18px] py-[22px] text-left text-[0.58rem] tracking-[0.15em] text-[var(--forest)] uppercase">Botanical</th>
                <th className="border-b border-[var(--line)] px-[18px] py-[22px] text-left text-[0.58rem] tracking-[0.15em] text-[var(--forest)] uppercase">Ritual focus</th>
                <th className="border-b border-[var(--line)] px-[18px] py-[22px] text-left text-[0.58rem] tracking-[0.15em] text-[var(--forest)] uppercase">Step</th>
                <th className="border-b border-[var(--line)] px-[18px] py-[22px] text-left text-[0.58rem] tracking-[0.15em] text-[var(--forest)] uppercase">Experience</th>
                <th className="border-b border-[var(--line)] px-[18px] py-[22px] text-left text-[0.58rem] tracking-[0.15em] text-[var(--forest)] uppercase" />
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.slug}>
                  <th className="border-b border-[var(--line)] px-[18px] py-[22px] text-left [color:var(--forest)] [font-family:var(--font-display)] text-[1.25rem] font-normal">
                    <span
                      className="mr-[14px] inline-block size-[9px] rounded-full"
                      style={{ backgroundColor: product.accent }}
                    />
                    {product.name}
                  </th>
                  <td className="border-b border-[var(--line)] px-[18px] py-[22px] text-left text-[0.78rem] text-[var(--muted)]">{product.subtitle}</td>
                  <td className="border-b border-[var(--line)] px-[18px] py-[22px] text-left text-[0.78rem] text-[var(--muted)]">{product.ritualStep}</td>
                  <td className="border-b border-[var(--line)] px-[18px] py-[22px] text-left text-[0.78rem] text-[var(--muted)]">{product.experience}</td>
                  <td className="border-b border-[var(--line)] px-[18px] py-[22px] text-left text-[0.78rem] text-[var(--muted)]">
                    <Link
                      className="grid size-10 place-items-center rounded-full border border-[var(--line)] text-[var(--forest)] max-[680px]:size-11"
                      href={`/shop/${product.slug}`}
                      aria-label={`View ${product.name}`}
                    >
                      ↗
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section
        className={`bg-[var(--ivory-deep)] px-[clamp(24px,5vw,72px)] py-[clamp(80px,8vw,124px)] max-[680px]:px-5 max-[680px]:py-16 ${revealClass}`}
        aria-labelledby="journal-title"
      >
        <div className={centeredHeadingClass}>
          <p className={eyebrowClass}>The ritual journal</p>
          <h2 className={sectionTitleClass} id="journal-title">
            Learn the ingredient. Then make it yours.
          </h2>
          <p className="mx-auto mt-6 max-w-[620px] text-[var(--muted)]">
            Verified customer stories will join the journal after launch. Until then, begin with the ritual itself.
          </p>
        </div>
        <div className="mx-auto grid max-w-[1296px] grid-cols-3 gap-[clamp(16px,1.6vw,22px)] max-[900px]:grid-cols-1 max-[680px]:grid-cols-2 max-[680px]:gap-3">
          <Link
            href="/rituals"
            className={`${journalCardClass} bg-[#d7ddc9]`}
          >
            <span className="relative z-[2] text-[0.6rem] font-bold tracking-[0.13em] text-[var(--botanical)] uppercase">Guide 01</span>
            <h3 className={journalTitleClass}>Low-lather wash day, explained</h3>
            <p className={journalCopyClass}>Why botanical cleansing feels different.</p>
            <i className="relative z-[2] text-[0.6rem] font-bold not-italic tracking-[0.13em] text-[var(--botanical)] uppercase">Read guide ↗</i>
          </Link>
          <Link
            href="/rituals"
            className={`${journalCardClass} bg-[#e0d5c1]`}
          >
            <span className="relative z-[2] text-[0.6rem] font-bold tracking-[0.13em] text-[var(--botanical)] uppercase">Guide 02</span>
            <h3 className={journalTitleClass}>How to find the right paste texture</h3>
            <p className={journalCopyClass}>Water, patience and a smooth first mix.</p>
            <i className="relative z-[2] text-[0.6rem] font-bold not-italic tracking-[0.13em] text-[var(--botanical)] uppercase">Read guide ↗</i>
          </Link>
          <Link
            href="/shop/indigo-powder"
            className={`${journalCardClass} bg-[#c9cedc] max-[680px]:col-span-2 max-[680px]:pr-[44%] max-[680px]:before:left-[78%] max-[680px]:after:left-[78%]`}
          >
            <span className="relative z-[2] text-[0.6rem] font-bold tracking-[0.13em] text-[var(--botanical)] uppercase">Safety note</span>
            <h3 className={journalTitleClass}>Indigo starts with a strand test</h3>
            <p className={journalCopyClass}>Understand the variables before you colour.</p>
            <i className="relative z-[2] text-[0.6rem] font-bold not-italic tracking-[0.13em] text-[var(--botanical)] uppercase">Read note ↗</i>
          </Link>
        </div>
      </section>

      <section
        className={`${sectionClass} ${revealClass} grid scroll-mt-[calc(var(--header-height)+24px)] grid-cols-[0.65fr_1.35fr] gap-[clamp(52px,7vw,96px)] max-[900px]:grid-cols-1 max-[900px]:gap-12`}
        id="faq"
        aria-labelledby="faq-title"
      >
        <div>
          <p className={eyebrowClass}>Good questions, clearly answered</p>
          <h2
            className="m-0 [color:var(--forest)] [font-family:var(--font-display)] text-[clamp(3.25rem,4.5vw,5rem)] leading-[0.94] font-normal tracking-[-0.055em] max-[680px]:text-[clamp(2.45rem,11vw,3.15rem)]"
            id="faq-title"
          >
            The ritual room.
          </h2>
          <p className="text-[var(--muted)]">Begin with curiosity. Continue with care.</p>
          <Link className={textLinkClass} href="/rituals">
            Explore all ritual guidance <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <div className="border-t border-[var(--line)]">
          {homeFaqs.map((faq, index) => (
            <details
              className="group/faq border-b border-[var(--line)]"
              key={faq.question}
              open={index === 0}
            >
              <summary className="grid min-h-[78px] cursor-pointer list-none grid-cols-[35px_1fr_30px] items-center gap-[18px] text-[clamp(1.15rem,1.7vw,1.55rem)] text-[var(--forest)] [font-family:var(--font-display)] [&::-webkit-details-marker]:hidden max-[680px]:grid-cols-[28px_1fr_24px] max-[680px]:text-[1.08rem]">
                <span className="text-[0.55rem] text-[var(--botanical)] [font-family:var(--font-sans)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {faq.question}
                <i className="text-[0.9rem] not-italic [font-family:var(--font-sans)] [transition:transform_320ms_var(--ease)] motion-reduce:transition-none group-open/faq:[transform:rotate(45deg)]">
                  ＋
                </i>
              </summary>
              <p className="m-0 max-w-[680px] pt-0 pr-[30px] pb-7 pl-[53px] text-[0.86rem] text-[var(--muted)] max-[680px]:pl-[46px]">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
