"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/features/catalog/product-card";
import { ProductJar } from "@/features/catalog/product-jar";
import { RitualFinder } from "@/features/rituals/ritual-finder";
import { useStore } from "@/features/store/store-provider";
import { BundleCards } from "./bundle-cards";
import { FeaturedProductSwitcher } from "./featured-product-switcher";
import { HeroPurchase } from "./hero-purchase";
import { VideoReviewsSection } from "./video-reviews-section";
import { homeFaqs, ritualCards } from "./content";

const eyebrowClass =
  "mb-4 text-[0.68rem] leading-[1.3] font-bold tracking-[0.2em] text-[var(--botanical)] uppercase";
const lightEyebrowClass =
  "mb-4 text-[0.68rem] leading-[1.3] font-bold tracking-[0.2em] text-[#c8d88e] uppercase";
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
const buttonClass =
  "inline-flex min-h-[52px] items-center justify-center gap-[14px] rounded-full border px-6 py-[13px] text-[0.72rem] leading-none font-bold tracking-[0.12em] uppercase shadow-[0_10px_24px_rgba(21,59,45,0.1)] [transition:transform_350ms_var(--ease),background-color_350ms_var(--ease),color_350ms_var(--ease),border-color_350ms_var(--ease),box-shadow_350ms_var(--ease)] motion-reduce:transition-none hover:shadow-[0_14px_30px_rgba(21,59,45,0.16)] hover:[transform:translateY(-2px)]";
const ritualColorClasses = [
  "[--ritual-color:#b7c7a9]",
  "[--ritual-color:#d5b990]",
  "[--ritual-color:#d8c8b1]",
  "[--ritual-color:#aeb6d0]",
] as const;

export function HomePage() {
  const { products, content } = useStore();
  const [activeProductIndex, setActiveProductIndex] = useState(0);

  if (!products.length) {
    return (
      <main className="grid min-h-[70vh] place-items-center px-[var(--page-pad)] py-24 text-center" id="main-content">
        <div className="max-w-[660px]">
          <p className={eyebrowClass}>Shopify catalog</p>
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

  const activeProduct = products[activeProductIndex] ?? products[0];
  const productName = activeProduct.name.replace(/ Powder$/i, "");
  const details = {
    eyebrow:
      activeProduct.hero?.eyebrow ||
      `The ${productName} Ritual`,
    headlineFirst: activeProduct.hero?.headlineFirst || "Discover",
    headlineMiddle: activeProduct.hero?.headlineMiddle || productName,
    headlineItalic:
      activeProduct.hero?.headlineItalic || "Botanical ritual.",
    description:
      activeProduct.hero?.description || activeProduct.shortDescription,
    badgeText:
      activeProduct.hero?.badgeText ||
      `${productName} · ${activeProduct.ritualStep.toLowerCase()}`,
    badgeSubtitle:
      activeProduct.hero?.badgeSubtitle || activeProduct.subtitle,
    howToText:
      activeProduct.hero?.howToText ||
      activeProduct.howTo[0] ||
      "Follow the directions on the product pack.",
  };
  const heroPoster = content.homeHeroPoster;
  const ritualPoster = content.ritualPoster;
  const colourProduct =
    products.find((product) => product.ritualStep === "Colour") ?? products[0];

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
        <div className="relative mx-auto grid w-full max-w-[1680px] grid-cols-[minmax(310px,1.15fr)_minmax(360px,1.25fr)_minmax(240px,0.85fr)] gap-[clamp(20px,2vw,36px)] px-[clamp(24px,4vw,64px)] pt-[clamp(24px,2.5vw,38px)] pb-[clamp(24px,3vw,44px)] max-[1280px]:grid-cols-[minmax(280px,1.1fr)_minmax(340px,1.2fr)_minmax(220px,0.8fr)] max-[1180px]:grid-cols-[minmax(260px,1fr)_minmax(320px,1.15fr)_minmax(200px,0.85fr)] max-[1080px]:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] max-[1080px]:gap-[28px_20px] max-[1080px]:px-[4vw] max-[900px]:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] max-[900px]:gap-[20px_16px] max-[900px]:px-4 max-[900px]:pt-4 max-[900px]:pb-8 max-[680px]:grid-cols-[minmax(0,1.18fr)_minmax(0,0.82fr)] max-[680px]:gap-[16px_10px] max-[680px]:px-3 max-[680px]:pt-3 max-[680px]:pb-6 max-[420px]:grid-cols-[minmax(0,1.22fr)_minmax(0,0.78fr)] max-[420px]:gap-[12px_8px] max-[420px]:px-2">
          <div className="relative z-[4] w-full self-center [animation:hero-copy-enter_900ms_var(--ease)_both] motion-reduce:animate-none motion-reduce:transform-none motion-reduce:opacity-100">
            <p className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[rgba(63,125,58,0.24)] bg-[rgba(63,125,58,0.08)] px-3 py-1 text-[0.66rem] font-bold tracking-[0.16em] text-[var(--botanical)] uppercase max-[900px]:mb-2 max-[900px]:text-[0.56rem] max-[680px]:mb-1.5 max-[680px]:px-2 max-[680px]:py-0.5 max-[680px]:text-[0.46rem] max-[680px]:tracking-[0.08em]">
              {details.eyebrow}
            </p>
            <h1
              className="relative z-[4] m-0 max-w-[520px] [color:var(--charcoal)] [font-family:var(--font-sans)] text-[clamp(3.2rem,3.8vw,4.6rem)] leading-[0.9] font-[620] tracking-[-0.055em] max-[1180px]:text-[clamp(2.9rem,4vw,3.8rem)] max-[1080px]:max-w-[480px] max-[1080px]:text-[clamp(2.1rem,3.8vw,2.9rem)] max-[900px]:text-[clamp(1.65rem,4vw,2.3rem)] max-[680px]:text-[clamp(1.2rem,4.8vw,1.65rem)] max-[680px]:leading-[0.92] max-[420px]:text-[clamp(1.05rem,4.5vw,1.35rem)]"
              id="hero-title"
            >
              <span className="block [animation:hero-title-enter_900ms_var(--ease)_80ms_both] motion-reduce:animate-none motion-reduce:transform-none motion-reduce:opacity-100">
                {details.headlineFirst}
              </span>
              <span className="flex items-center gap-[clamp(10px,1.2vw,18px)] max-[900px]:gap-2 max-[680px]:gap-1.5 [animation:hero-title-enter_900ms_var(--ease)_150ms_both] motion-reduce:animate-none motion-reduce:transform-none motion-reduce:opacity-100">
                {details.headlineMiddle}
                <span
                  className="relative inline-block h-[0.58em] w-[clamp(85px,8.5vw,135px)] translate-y-[0.04em] overflow-hidden rounded-[999px] border border-[rgba(23,63,42,0.12)] shadow-[0_12px_30px_rgba(23,63,42,0.1)] max-[900px]:w-[clamp(45px,9vw,65px)] max-[680px]:w-[clamp(32px,8vw,44px)]"
                  aria-hidden="true"
                >
                  <Image
                    src={heroPoster.url}
                    alt=""
                    fill
                    sizes="160px"
                    className="scale-[1.38] object-cover object-[77%_27%]"
                  />
                </span>
              </span>
              <em className="mt-[0.05em] ml-[0.03em] block text-[0.9em] leading-[inherit] font-normal tracking-[-0.05em] text-[var(--botanical)] italic [font-family:var(--font-display)] [animation:hero-title-enter_900ms_var(--ease)_220ms_both] max-[680px]:mt-0 max-[680px]:text-[0.92em] motion-reduce:animate-none motion-reduce:transform-none motion-reduce:opacity-100">
                {details.headlineItalic}
              </em>
            </h1>
            <p className="my-[clamp(14px,2vh,22px)_14px] max-w-[420px] text-[clamp(0.9rem,1vw,1.02rem)] leading-[1.65] text-[#4b5047] max-[1080px]:max-w-[440px] max-[900px]:my-2 max-[900px]:text-[0.76rem] max-[900px]:leading-[1.4] max-[680px]:my-1.5 max-[680px]:line-clamp-2 max-[680px]:text-[0.6rem] max-[680px]:leading-[1.3] max-[420px]:text-[0.54rem]">
              {details.description}
            </p>
            <HeroPurchase
              key={activeProduct.slug}
              slug={activeProduct.slug}
              name={activeProduct.name}
              pricePaise={activeProduct.pricePaise}
            />
            <div
              className="mt-5 grid max-w-[440px] grid-cols-3 gap-2 border-t border-[rgba(23,63,42,0.14)] pt-4 text-[var(--forest)] max-[1080px]:max-w-full max-[900px]:mt-3 max-[900px]:gap-1.5 max-[900px]:pt-2.5 max-[680px]:mt-2 max-[680px]:gap-1 max-[680px]:pt-1.5"
              aria-label="NatureMist principles"
            >
              <div className="flex flex-col gap-0.5 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[rgba(255,252,245,0.76)] p-2.5 text-[0.6rem] font-bold tracking-[0.06em] uppercase backdrop-blur-sm max-[900px]:p-1.5 max-[900px]:text-[0.52rem] max-[680px]:p-1 max-[680px]:text-[0.42rem] max-[680px]:leading-tight max-[420px]:text-[0.38rem]">
                <span className="text-[0.82rem] text-[var(--botanical)] [font-family:var(--font-display)] max-[900px]:text-[0.68rem] max-[680px]:text-[0.54rem]">
                  01
                </span>{" "}
                Single botanical
              </div>
              <div className="flex flex-col gap-0.5 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[rgba(255,252,245,0.76)] p-2.5 text-[0.6rem] font-bold tracking-[0.06em] uppercase backdrop-blur-sm max-[900px]:p-1.5 max-[900px]:text-[0.52rem] max-[680px]:p-1 max-[680px]:text-[0.42rem] max-[680px]:leading-tight max-[420px]:text-[0.38rem]">
                <span className="text-[0.82rem] text-[var(--botanical)] [font-family:var(--font-display)] max-[900px]:text-[0.68rem] max-[680px]:text-[0.54rem]">
                  02
                </span>{" "}
                Clearly explained
              </div>
              <div className="flex flex-col gap-0.5 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[rgba(255,252,245,0.76)] p-2.5 text-[0.6rem] font-bold tracking-[0.06em] uppercase backdrop-blur-sm max-[900px]:p-1.5 max-[900px]:text-[0.52rem] max-[680px]:p-1 max-[680px]:text-[0.42rem] max-[680px]:leading-tight max-[420px]:text-[0.38rem]">
                <span className="text-[0.82rem] text-[var(--botanical)] [font-family:var(--font-display)] max-[900px]:text-[0.68rem] max-[680px]:text-[0.54rem]">
                  03
                </span>{" "}
                Made for home rituals
              </div>
            </div>
          </div>

          <div className="relative z-[2] h-[clamp(480px,60vh,640px)] w-full min-w-0 self-center [animation:hero-portrait-enter_1s_var(--ease)_80ms_both] max-[1180px]:h-[clamp(440px,56vh,560px)] max-[1080px]:h-[clamp(360px,46vh,440px)] max-[900px]:h-[clamp(290px,40vh,370px)] max-[680px]:h-[clamp(220px,36vh,280px)] max-[420px]:h-[clamp(195px,34vh,240px)] motion-reduce:animate-none motion-reduce:transform-none motion-reduce:opacity-100">
            <span
              className="pointer-events-none absolute top-[1%] right-[-5%] bottom-[-2%] left-[-5%] z-0 rounded-[50%_50%_12px_12px/32%_32%_2%_2%] bg-[linear-gradient(150deg,rgba(188,207,161,0.62),rgba(239,227,199,0.28)_58%,rgba(167,201,67,0.12))] shadow-[0_32px_90px_rgba(52,78,47,0.12)] max-[1080px]:hidden"
              aria-hidden="true"
            />
            <span
              className="pointer-events-none absolute top-[-3%] right-[-3%] bottom-[1%] left-[-3%] z-[1] rounded-[50%_50%_16px_16px/30%_30%_2%_2%] border border-[rgba(57,111,58,0.44)] [animation:hero-orbit-drift_11s_ease-in-out_infinite_alternate] [will-change:transform] max-[1080px]:hidden motion-reduce:animate-none motion-reduce:[transform:rotate(15deg)]"
              aria-hidden="true"
            />
            {/* Layered Organic Line 2 - Outer poster frame orbit */}
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
            <div className="group/portrait absolute inset-[2%_0_0] z-[2] overflow-hidden rounded-[50%_50%_8px_8px/28%_28%_1%_1%] border border-[rgba(23,63,42,0.11)] bg-[var(--beige)] shadow-[0_36px_90px_rgba(40,51,33,0.2)] max-[1080px]:inset-0 max-[1080px]:rounded-[50%_50%_8px_8px/28%_28%_1%_1%] max-[680px]:rounded-[50%_50%_8px_8px/24%_24%_1%_1%]">
              <Image
                src={heroPoster.url}
                alt={heroPoster.altText || "NatureMist botanical hair ritual"}
                fill
                loading="eager"
                fetchPriority="high"
                sizes="(max-width: 680px) 50vw, (max-width: 900px) 50vw, (max-width: 1080px) 55vw, (max-width: 1440px) 44vw, 600px"
                className="object-cover object-[76%_center] [transform:scale(1.04)] [transition:transform_1.1s_var(--ease)] [@media(hover:hover)_and_(pointer:fine)]:group-hover/portrait:[transform:scale(1.065)] max-[680px]:object-[74%_center] motion-reduce:transition-none motion-reduce:[transform:scale(1.04)]"
              />
              <span
                className="absolute inset-0 bg-[linear-gradient(180deg,transparent_60%,rgba(17,45,28,0.2)),linear-gradient(90deg,rgba(247,244,232,0.08),transparent_35%)]"
                aria-hidden="true"
              />
              <span
                className="font-bold tracking-[0.14em] text-[var(--forest)] [font-family:var(--font-sans)] text-[0.62rem] max-[680px]:text-[0.48rem]"
                aria-live="polite"
              >
                Pure Botanical Ritual
              </span>
            </div>

            <Link
              className="absolute bottom-[28%] left-[-68px] z-[5] grid min-h-[62px] w-[225px] grid-cols-[40px_1fr_8px] items-center gap-[10px] rounded-full border border-[rgba(255,255,255,0.75)] bg-[rgba(248,245,234,0.94)] px-3.5 py-[8px] shadow-[0_18px_45px_rgba(28,46,31,0.16)] backdrop-blur-[16px] [transition:transform_300ms_var(--ease),background-color_300ms_var(--ease)] hover:bg-[rgba(255,253,246,0.98)] hover:[transform:translateY(-3px)] max-[1180px]:left-[-34px] max-[1180px]:w-[205px] max-[1080px]:left-[-20px] max-[1080px]:w-[185px] max-[900px]:bottom-[12%] max-[900px]:left-[-12px] max-[900px]:min-h-[42px] max-[900px]:w-[min(160px,94%)] max-[900px]:gap-1.5 max-[900px]:px-2 max-[900px]:py-1 max-[680px]:bottom-[10%] max-[680px]:left-[-8px] max-[680px]:min-h-[32px] max-[680px]:w-[min(145px,95%)] max-[680px]:grid-cols-[20px_1fr_6px] max-[680px]:gap-1 max-[680px]:px-1.5 max-[680px]:py-0.5 max-[420px]:bottom-[8%] max-[420px]:left-[-6px] max-[420px]:w-[min(125px,96%)] max-[420px]:grid-cols-[18px_1fr_4px] motion-reduce:transition-none motion-reduce:transform-none motion-reduce:opacity-100"
              href={`/shop/${activeProduct.slug}`}
              aria-label={`View the ${activeProduct.name} ritual`}
            >
              <span className="grid size-10 place-items-center rounded-full bg-[var(--forest)] text-[var(--paper)] text-[0.8rem] max-[900px]:size-6 max-[900px]:text-[0.6rem] max-[680px]:size-5 max-[680px]:text-[0.48rem] max-[420px]:size-4.5 max-[420px]:text-[0.42rem]">
                🌿
              </span>
              <div className="grid leading-[1.15]">
                <strong className="text-[0.88rem] font-semibold text-[var(--forest)] [font-family:var(--font-display)] max-[900px]:text-[0.66rem] max-[680px]:text-[0.52rem] max-[420px]:text-[0.46rem]">
                  {details.badgeText}
                </strong>
                <small className="mt-0.5 text-[0.48rem] text-[var(--muted)] max-[900px]:text-[0.38rem] max-[680px]:text-[0.32rem] max-[420px]:hidden">
                  {details.badgeSubtitle}
                </small>
              </div>
              <i
                className="size-[8px] rounded-full shadow-[0_0_0_5px_rgba(167,201,67,0.2)] max-[900px]:size-[5px] max-[680px]:size-[4px] max-[420px]:size-[3px]"
                style={{ backgroundColor: activeProduct.accent }}
                aria-hidden="true"
              />
            </Link>

            <a
              className="absolute right-5 bottom-5 z-[6] grid size-[60px] place-items-center rounded-full border border-[rgba(255,255,255,0.7)] bg-[rgba(23,63,42,0.4)] text-[1.5rem] text-white shadow-[0_14px_32px_rgba(18,38,23,0.25)] backdrop-blur-[12px] [font-family:var(--font-display)] [transition:background_250ms_ease,transform_250ms_ease,border-color_250ms_ease] hover:border-white hover:bg-[rgba(23,63,42,0.7)] hover:[transform:translateY(3px)_scale(1.05)] max-[1080px]:right-4 max-[1080px]:bottom-4 max-[900px]:size-[38px] max-[900px]:text-[1rem] max-[680px]:right-1.5 max-[680px]:bottom-1.5 max-[680px]:size-7 max-[680px]:text-[0.75rem] max-[420px]:size-6 max-[420px]:text-[0.65rem] motion-reduce:transition-none"
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
            className="relative z-[4] min-w-0 self-center scroll-mt-[calc(var(--header-height)+20px)] max-[1080px]:col-span-full max-[1080px]:grid max-[1080px]:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] max-[1080px]:items-start max-[1080px]:gap-x-6 max-[1080px]:border-t max-[1080px]:border-[var(--line)] max-[1080px]:pt-7 max-[680px]:col-span-full max-[680px]:grid max-[680px]:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] max-[680px]:gap-x-3 max-[680px]:border-t max-[680px]:border-[var(--line)] max-[680px]:pt-4 max-[420px]:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] max-[420px]:gap-x-2"
            id="featured-ritual"
            aria-label={`Featured ${activeProduct.name} ritual`}
          >
            <nav
              className="mb-[7px] grid grid-cols-[44px_1fr_44px] items-center gap-2 text-[var(--forest)] col-span-full max-[680px]:mb-2 max-[680px]:grid-cols-[34px_1fr_34px] max-[680px]:gap-1.5 max-[680px]:py-1"
              aria-label="Browse featured rituals"
            >
              <button
                type="button"
                onClick={handlePrevProduct}
                className="grid size-[44px] place-items-center rounded-full border border-[rgba(23,63,42,0.24)] text-[1.15rem] [transition:color_240ms_ease,background_240ms_ease,transform_240ms_ease] motion-reduce:transition-none hover:bg-[var(--forest)] hover:text-[var(--paper)] hover:[transform:translateY(-2px)] max-[680px]:size-[34px] max-[680px]:text-[0.95rem]"
                aria-label="Previous featured ritual"
              >
                ←
              </button>
              <span className="text-center text-[0.6rem] font-bold tracking-[0.16em] text-[var(--muted)] uppercase max-[680px]:text-[0.5rem] max-[680px]:tracking-[0.1em]">
                Featured Botanical Ritual
              </span>
              <button
                type="button"
                onClick={handleNextProduct}
                className="grid size-[44px] place-items-center rounded-full border border-[rgba(23,63,42,0.24)] text-[1.15rem] [transition:color_240ms_ease,background_240ms_ease,transform_240ms_ease] motion-reduce:transition-none hover:bg-[var(--forest)] hover:text-[var(--paper)] hover:[transform:translateY(-2px)] max-[680px]:size-[34px] max-[680px]:text-[0.95rem]"
                aria-label="Next featured ritual"
              >
                →
              </button>
            </nav>
            <div className="relative h-[clamp(245px,31vh,305px)] w-full overflow-hidden rounded-[var(--radius-md)] bg-[var(--paper)] shadow-[0_16px_44px_rgba(21,59,45,0.08)] ring-1 ring-[var(--line)] max-[1080px]:col-start-1 max-[1080px]:row-[2/4] max-[1080px]:h-[300px] max-[680px]:col-start-1 max-[680px]:row-[2/4] max-[680px]:h-[clamp(190px,28vh,240px)] max-[680px]:w-full max-[420px]:h-[180px]">
              <Image
                key={activeProduct.slug}
                src={activeProduct.featuredImage?.url || "/images/amla-powder.jpg"}
                alt={activeProduct.featuredImage?.altText || activeProduct.name}
                fill
                sizes="(max-width: 680px) 45vw, (max-width: 1080px) 45vw, 30vw"
                className="size-full object-cover object-center transition-all duration-500 ease-out hover:scale-105"
                priority
              />
            </div>
            <div className="py-[17px_11px] max-[1080px]:col-start-2 max-[1080px]:row-start-2 max-[1080px]:py-[14px] max-[680px]:col-start-2 max-[680px]:row-start-2 max-[680px]:pt-0 max-[680px]:pb-1.5">
              <span className="text-[0.55rem] font-bold tracking-[0.14em] text-[var(--muted)] uppercase max-[680px]:text-[0.46rem] max-[680px]:tracking-[0.08em]">
                NatureMist / Pure Botanical
              </span>
              <h2 className="my-[4px_2px] [color:var(--forest)] [font-family:var(--font-display)] text-[clamp(2rem,2.7vw,3.15rem)] leading-none font-normal tracking-[-0.045em] max-[1180px]:text-[clamp(1.85rem,2.5vw,2.6rem)] max-[680px]:my-1 max-[680px]:text-[1.25rem] max-[420px]:text-[1.1rem]">
                {activeProduct.name}
              </h2>
              <p className="m-0 text-[0.55rem] font-bold tracking-[0.14em] text-[var(--muted)] uppercase max-[680px]:text-[0.44rem] max-[680px]:tracking-[0.06em]">
                {activeProduct.subtitle} · packaging preview
              </p>
            </div>
            <div className="border-t border-[var(--line)] max-[1080px]:col-start-2 max-[1080px]:row-start-3 max-[680px]:col-start-2 max-[680px]:row-start-3 max-[680px]:border-t max-[680px]:border-[var(--line)]">
              <details className="group/fact border-b border-[var(--line)]">
                <summary className="flex min-h-[48px] cursor-pointer list-none items-center justify-between text-[0.98rem] text-[var(--forest)] [font-family:var(--font-display)] [&::-webkit-details-marker]:hidden max-[680px]:min-h-[34px] max-[680px]:text-[0.76rem] max-[420px]:text-[0.7rem]">
                  Why you&apos;ll love it{" "}
                  <span
                    className="[font-family:var(--font-sans)] [transition:transform_300ms_var(--ease)] motion-reduce:transition-none group-open/fact:[transform:rotate(45deg)] text-[0.75rem]"
                    aria-hidden="true"
                  >
                    ＋
                  </span>
                </summary>
                <p className="mt-[-1px] mb-0 pb-[14px] text-[0.74rem] leading-[1.6] text-[var(--muted)] max-[680px]:pb-2 max-[680px]:text-[0.58rem] max-[680px]:leading-[1.35] max-[420px]:text-[0.54rem]">
                  {activeProduct.shortDescription}
                </p>
              </details>
              <details className="group/fact border-b border-[var(--line)]">
                <summary className="flex min-h-[48px] cursor-pointer list-none items-center justify-between text-[0.98rem] text-[var(--forest)] [font-family:var(--font-display)] [&::-webkit-details-marker]:hidden max-[680px]:min-h-[34px] max-[680px]:text-[0.76rem] max-[420px]:text-[0.7rem]">
                  How to prepare{" "}
                  <span
                    className="[font-family:var(--font-sans)] [transition:transform_300ms_var(--ease)] motion-reduce:transition-none group-open/fact:[transform:rotate(45deg)] text-[0.75rem]"
                    aria-hidden="true"
                  >
                    ＋
                  </span>
                </summary>
                <p className="mt-[-1px] mb-0 pb-[14px] text-[0.74rem] leading-[1.6] text-[var(--muted)] max-[680px]:pb-2 max-[680px]:text-[0.58rem] max-[680px]:leading-[1.35] max-[420px]:text-[0.54rem]">
                  {details.howToText}
                </p>
              </details>
              <details className="group/fact border-b border-[var(--line)]" open>
                <summary className="flex min-h-[48px] cursor-pointer list-none items-center justify-between text-[0.98rem] text-[var(--forest)] [font-family:var(--font-display)] [&::-webkit-details-marker]:hidden max-[680px]:min-h-[34px] max-[680px]:text-[0.76rem] max-[420px]:text-[0.7rem]">
                  Ingredient clarity{" "}
                  <span
                    className="[font-family:var(--font-sans)] [transition:transform_300ms_var(--ease)] motion-reduce:transition-none group-open/fact:[transform:rotate(45deg)] text-[0.75rem]"
                    aria-hidden="true"
                  >
                    ＋
                  </span>
                </summary>
                <p className="mt-[-1px] mb-0 pb-[14px] text-[0.74rem] leading-[1.6] text-[var(--muted)] max-[680px]:pb-2 max-[680px]:text-[0.58rem] max-[680px]:leading-[1.35] max-[420px]:text-[0.54rem]">
                  {activeProduct.ingredient}
                </p>
              </details>
            </div>
          </aside>
        </div>
        {/* Bottom wave curve */}
        <svg
          className="pointer-events-none absolute right-0 bottom-0 left-0 z-[8] w-full text-[#f7f4e8] max-[680px]:hidden"
          viewBox="0 0 1440 44"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path d="M0,0 Q720,48 1440,0 L1440,44 L0,44 Z" fill="currentColor" />
        </svg>
      </section>

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
            <h2
              className="m-0 scroll-mt-[calc(var(--header-height)+24px)] text-[clamp(2.6rem,4vw,4.5rem)] leading-[0.96] font-normal tracking-[-0.045em] text-[var(--forest)] [font-family:var(--font-display)] max-[680px]:text-[clamp(1.6rem,7.5vw,2.1rem)]"
              id="collection-title"
            >
              Shop the herbal collection.
            </h2>
          </div>
          <div className="flex flex-col justify-end gap-3 max-[680px]:gap-2">
            <p className="m-0 text-[0.84rem] leading-[1.65] text-[var(--muted)] max-[680px]:text-[0.68rem] max-[680px]:leading-[1.4]">
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
          {products.map((product) => (
            <ProductCard product={product} key={product.slug} />
          ))}
        </div>

        {/* Disclaimer */}
        <p className="mx-auto mt-8 max-w-[680px] text-center text-[0.72rem] leading-[1.65] text-[var(--muted)] max-[680px]:mt-5 max-[680px]:px-1 max-[680px]:text-[0.62rem]">
          Product imagery, availability and pricing are managed through the
          NatureMist Shopify catalogue.
        </p>
      </section>

      {/* ── The Benefit of This Products Section ── */}
      <section
        className={`mx-auto w-full max-w-[1440px] px-[clamp(24px,5vw,72px)] py-[clamp(60px,7vw,110px)] max-[680px]:px-4 max-[680px]:py-10 ${revealClass}`}
        aria-labelledby="benefits-title"
      >
        <div className="grid grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] items-center gap-x-[clamp(32px,5vw,80px)] gap-y-10 max-[960px]:grid-cols-1 max-[960px]:gap-y-10">
          {/* Left Column: Heading, description, CTA */}
          <div className="flex flex-col items-start">
            <p className={`${eyebrowClass} max-[680px]:mb-1 max-[680px]:text-[0.54rem]`}>
              Botanical efficacy
            </p>
            <h2
              id="benefits-title"
              className="m-0 text-[clamp(2.4rem,4.2vw,4.2rem)] font-normal leading-[0.96] tracking-[-0.045em] text-[var(--forest)] [font-family:var(--font-display)] max-[680px]:text-[clamp(1.6rem,7.5vw,2.1rem)]"
            >
              The benefit of <br />
              this product.
            </h2>
            <p className="mt-4 mb-7 max-w-[420px] text-[0.88rem] leading-[1.65] text-[#55635a] max-[680px]:my-3 max-[680px]:text-[0.78rem] max-[680px]:leading-[1.5]">
              These powders are typically used as supplements, in smoothies, teas, or as ingredients in natural remedies.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center rounded-[8px] bg-[#5a9e32] px-7 py-3 text-[0.88rem] font-medium text-white shadow-[0_4px_14px_rgba(90,158,50,0.28)] transition-all duration-200 hover:bg-[#4a8528] hover:shadow-[0_6px_20px_rgba(90,158,50,0.36)] hover:-translate-y-0.5 active:scale-95 max-[680px]:px-6 max-[680px]:py-2.5 max-[680px]:text-[0.8rem]"
            >
              Explore Us
            </Link>
          </div>

          {/* Right Column: 2x2 Grid of numbered benefits */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 max-[680px]:grid-cols-1 max-[680px]:gap-y-6 max-[440px]:gap-y-5">
            {/* 01 */}
            <div className="flex items-center gap-3.5 max-[680px]:gap-3">
              <span className="shrink-0 text-[3.2rem] font-light leading-none tracking-tighter text-[#1a2e22] [font-family:var(--font-sans)] max-[680px]:text-[2.6rem]">
                01
              </span>
              <div className="relative size-[84px] shrink-0 overflow-hidden rounded-2xl border border-[#dedad0] bg-[#f8f6f0] p-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] max-[680px]:size-[70px] max-[680px]:rounded-xl">
                <Image
                  src="/images/amla-powder.jpg"
                  alt="Rich in vitamins A, C, E, and minerals like calcium and iron"
                  fill
                  sizes="100px"
                  className="size-full object-cover object-center rounded-[10px]"
                />
              </div>
              <p className="m-0 text-[0.82rem] leading-[1.4] text-[#4f5c53] max-[680px]:text-[0.74rem] max-[680px]:leading-[1.35]">
                Rich in vitamins A, C, E, and minerals like calcium and iron.
              </p>
            </div>

            {/* 02 */}
            <div className="flex items-center gap-3.5 max-[680px]:gap-3">
              <span className="shrink-0 text-[3.2rem] font-light leading-none tracking-tighter text-[#1a2e22] [font-family:var(--font-sans)] max-[680px]:text-[2.6rem]">
                02
              </span>
              <div className="relative size-[84px] shrink-0 overflow-hidden rounded-2xl border border-[#dedad0] bg-[#f8f6f0] p-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] max-[680px]:size-[70px] max-[680px]:rounded-xl">
                <Image
                  src="/images/reetha-powder.jpg"
                  alt="Known to help detoxify the body and support health"
                  fill
                  sizes="100px"
                  className="size-full object-cover object-center rounded-[10px]"
                />
              </div>
              <p className="m-0 text-[0.82rem] leading-[1.4] text-[#4f5c53] max-[680px]:text-[0.74rem] max-[680px]:leading-[1.35]">
                Known to help detoxify the body and support health.
              </p>
            </div>

            {/* 03 */}
            <div className="flex items-center gap-3.5 max-[680px]:gap-3">
              <span className="shrink-0 text-[3.2rem] font-light leading-none tracking-tighter text-[#1a2e22] [font-family:var(--font-sans)] max-[680px]:text-[2.6rem]">
                03
              </span>
              <div className="relative size-[84px] shrink-0 overflow-hidden rounded-2xl border border-[#dedad0] bg-[#f8f6f0] p-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] max-[680px]:size-[70px] max-[680px]:rounded-xl">
                <Image
                  src="/images/shikakai-powder.jpg"
                  alt="Can aid in digestion and is beneficial for gut health"
                  fill
                  sizes="100px"
                  className="size-full object-cover object-center rounded-[10px]"
                />
              </div>
              <p className="m-0 text-[0.82rem] leading-[1.4] text-[#4f5c53] max-[680px]:text-[0.74rem] max-[680px]:leading-[1.35]">
                Can aid in digestion and is beneficial for gut health.
              </p>
            </div>

            {/* 04 */}
            <div className="flex items-center gap-3.5 max-[680px]:gap-3">
              <span className="shrink-0 text-[3.2rem] font-light leading-none tracking-tighter text-[#1a2e22] [font-family:var(--font-sans)] max-[680px]:text-[2.6rem]">
                04
              </span>
              <div className="relative size-[84px] shrink-0 overflow-hidden rounded-2xl border border-[#dedad0] bg-[#f8f6f0] p-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] max-[680px]:size-[70px] max-[680px]:rounded-xl">
                <Image
                  src="/images/bhringraj-powder.jpg"
                  alt="Known for its ability to help regulate blood sugar levels"
                  fill
                  sizes="100px"
                  className="size-full object-cover object-center rounded-[10px]"
                />
              </div>
              <p className="m-0 text-[0.82rem] leading-[1.4] text-[#4f5c53] max-[680px]:text-[0.74rem] max-[680px]:leading-[1.35]">
                Known for its ability to help regulate blood sugar levels.
              </p>
            </div>
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
              <p className="mt-3.5 max-w-[440px] text-[0.82rem] leading-[1.6] text-white/70 max-[680px]:mt-2 max-[680px]:text-[0.74rem] max-[680px]:leading-[1.45]">
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
          <p className="max-w-[460px] pb-1 leading-[1.75] text-[var(--muted)] max-[900px]:p-0 max-[680px]:text-[0.76rem] max-[680px]:leading-[1.5]">
            Every powder has its own directions. The rhythm, however, stays beautifully simple.
          </p>
        </div>

        {/* 3-Column Grid matching desktop layout on phone view */}
        <div className="mt-[64px] grid grid-cols-3 border-y border-[var(--line)] max-[900px]:mt-10 max-[680px]:mt-6">
          {/* Step 01: Scoop */}
          <article className="relative flex flex-col items-center justify-between border-r border-[var(--line)] px-8 py-10 text-center max-[900px]:px-4 max-[900px]:py-7 max-[680px]:px-2 max-[680px]:py-5">
            <span className="self-start text-[0.63rem] font-bold tracking-[0.15em] text-[var(--botanical)] max-[680px]:text-[0.52rem]">
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
              <h3 className="m-0 [color:var(--forest)] [font-family:var(--font-display)] text-[clamp(1.4rem,2.2vw,2.2rem)] font-normal max-[680px]:text-[1.1rem]">
                Scoop
              </h3>
              <p className="mx-auto mt-2 max-w-[280px] text-[0.82rem] leading-[1.45] text-[var(--muted)] max-[680px]:mt-1 max-[680px]:text-[0.65rem] max-[680px]:leading-[1.3] max-[380px]:text-[0.58rem]">
                Begin with enough botanical powder for your hair length.
              </p>
            </div>
          </article>

          {/* Step 02: Mix */}
          <article className="relative flex flex-col items-center justify-between border-r border-[var(--line)] px-8 py-10 text-center max-[900px]:px-4 max-[900px]:py-7 max-[680px]:px-2 max-[680px]:py-5">
            <span className="self-start text-[0.63rem] font-bold tracking-[0.15em] text-[var(--botanical)] max-[680px]:text-[0.52rem]">
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
              <h3 className="m-0 [color:var(--forest)] [font-family:var(--font-display)] text-[clamp(1.4rem,2.2vw,2.2rem)] font-normal max-[680px]:text-[1.1rem]">
                Mix
              </h3>
              <p className="mx-auto mt-2 max-w-[280px] text-[0.82rem] leading-[1.45] text-[var(--muted)] max-[680px]:mt-1 max-[680px]:text-[0.65rem] max-[680px]:leading-[1.3] max-[380px]:text-[0.58rem]">
                Add water gradually until the texture is smooth and spreadable.
              </p>
            </div>
          </article>

          {/* Step 03: Apply */}
          <article className="relative flex flex-col items-center justify-between px-8 py-10 text-center max-[900px]:px-4 max-[900px]:py-7 max-[680px]:px-2 max-[680px]:py-5">
            <span className="self-start text-[0.63rem] font-bold tracking-[0.15em] text-[var(--botanical)] max-[680px]:text-[0.52rem]">
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
              <h3 className="m-0 [color:var(--forest)] [font-family:var(--font-display)] text-[clamp(1.4rem,2.2vw,2.2rem)] font-normal max-[680px]:text-[1.1rem]">
                Apply
              </h3>
              <p className="mx-auto mt-2 max-w-[280px] text-[0.82rem] leading-[1.45] text-[var(--muted)] max-[680px]:mt-1 max-[680px]:text-[0.65rem] max-[680px]:leading-[1.3] max-[380px]:text-[0.58rem]">
                Follow the botanical directions, then rinse thoroughly.
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* ── Ingredient Clarity (One ingredient. Nothing hidden) ── */}
      <section
        className={`mx-auto grid w-full max-w-[1440px] scroll-mt-[calc(var(--header-height)+24px)] grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] items-center gap-[clamp(32px,5.5vw,88px)] px-[clamp(24px,5vw,72px)] py-[clamp(60px,7vw,110px)] max-[900px]:gap-8 max-[680px]:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] max-[680px]:gap-3.5 max-[680px]:px-3 max-[680px]:py-7 max-[440px]:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] max-[440px]:gap-2.5 ${revealClass}`}
        id="ingredient-standards"
        aria-labelledby="purity-title"
      >
        {/* Left Column: Arched Image with Badge */}
        <div className="relative">
          <div className="relative aspect-[0.72] w-full overflow-hidden rounded-[160px_160px_6px_6px] bg-[var(--beige)] shadow-[0_8px_24px_rgba(23,63,42,0.06)] max-[900px]:rounded-[110px_110px_4px_4px] max-[680px]:rounded-[56px_56px_4px_4px] max-[440px]:rounded-[40px_40px_4px_4px]">
            <Image
              src={ritualPoster.url}
              alt={
                ritualPoster.altText ||
                "A botanical hair ritual being prepared in a bowl"
              }
              fill
              sizes="(max-width: 680px) 45vw, (max-width: 900px) 45vw, 45vw"
              className="object-cover object-center"
            />
            {/* Dark circular brand badge 'N' */}
            <span
              className="absolute bottom-3 left-3 grid size-7 place-items-center rounded-full bg-[#18281d] text-[0.66rem] font-serif font-bold text-[#faf8f4] shadow-md max-[680px]:bottom-1.5 max-[680px]:left-1.5 max-[680px]:size-4.5 max-[680px]:text-[0.42rem]"
              aria-hidden="true"
            >
              N
            </span>
          </div>
          <span className="mt-2.5 block text-[0.56rem] font-bold tracking-[0.14em] text-[var(--muted)] uppercase max-[680px]:mt-1 max-[680px]:text-[0.42rem] max-[440px]:text-[0.38rem]">
            Botanical ritual · prepared fresh
          </span>
        </div>

        {/* Right Column: Heading, description, 3 numbered points, CTA */}
        <div>
          <p className="mb-2 text-[0.62rem] font-bold uppercase tracking-[0.18em] text-[var(--botanical)] max-[680px]:mb-0.5 max-[680px]:text-[0.44rem]">
            Ingredient clarity
          </p>
          <h2
            className="m-0 [font-family:var(--font-display)] text-[clamp(2.2rem,3.4vw,3.6rem)] font-normal leading-[0.98] tracking-[-0.04em] text-[var(--forest)] max-[900px]:text-[1.8rem] max-[680px]:text-[0.96rem] max-[680px]:leading-[1.04] max-[440px]:text-[0.88rem]"
            id="purity-title"
          >
            One ingredient. <br />
            Nothing hidden.
          </h2>
          <p className="my-4 max-w-[540px] text-[0.85rem] leading-[1.65] text-[var(--muted)] max-[680px]:my-1.5 max-[680px]:text-[0.52rem] max-[680px]:leading-[1.3] max-[440px]:text-[0.48rem]">
            NatureMist translates a time-honoured practice into a ritual you can understand from first scoop to final rinse.
          </p>

          {/* 3 Points List */}
          <div className="border-t border-[var(--line)]">
            <article className="grid grid-cols-[26px_1fr] items-baseline gap-2 border-b border-[var(--line)] py-3 max-[680px]:grid-cols-[14px_1fr] max-[680px]:gap-1 max-[680px]:py-1">
              <span className="text-[0.62rem] font-bold text-[var(--botanical)] max-[680px]:text-[0.42rem]">
                01
              </span>
              <div>
                <h3 className="m-0 [color:var(--forest)] [font-family:var(--font-display)] text-[1.15rem] font-normal leading-tight max-[680px]:text-[0.66rem] max-[440px]:text-[0.6rem]">
                  Name the botanical
                </h3>
                <p className="mt-0.5 mb-0 text-[0.76rem] leading-[1.4] text-[var(--muted)] max-[680px]:mt-0 max-[680px]:text-[0.48rem] max-[680px]:leading-[1.2] max-[440px]:text-[0.44rem]">
                  Common name, botanical identity and plant part—clearly stated on the final pack.
                </p>
              </div>
            </article>

            <article className="grid grid-cols-[26px_1fr] items-baseline gap-2 border-b border-[var(--line)] py-3 max-[680px]:grid-cols-[14px_1fr] max-[680px]:gap-1 max-[680px]:py-1">
              <span className="text-[0.62rem] font-bold text-[var(--botanical)] max-[680px]:text-[0.42rem]">
                02
              </span>
              <div>
                <h3 className="m-0 [color:var(--forest)] [font-family:var(--font-display)] text-[1.15rem] font-normal leading-tight max-[680px]:text-[0.66rem] max-[440px]:text-[0.6rem]">
                  Explain the ritual
                </h3>
                <p className="mt-0.5 mb-0 text-[0.76rem] leading-[1.4] text-[var(--muted)] max-[680px]:mt-0 max-[680px]:text-[0.48rem] max-[680px]:leading-[1.2] max-[440px]:text-[0.44rem]">
                  Preparation, pairing and safety guidance written for beginners as well as familiar users.
                </p>
              </div>
            </article>

            <article className="grid grid-cols-[26px_1fr] items-baseline gap-2 border-b border-[var(--line)] py-3 max-[680px]:grid-cols-[14px_1fr] max-[680px]:gap-1 max-[680px]:py-1">
              <span className="text-[0.62rem] font-bold text-[var(--botanical)] max-[680px]:text-[0.42rem]">
                03
              </span>
              <div>
                <h3 className="m-0 [color:var(--forest)] [font-family:var(--font-display)] text-[1.15rem] font-normal leading-tight max-[680px]:text-[0.66rem] max-[440px]:text-[0.6rem]">
                  Keep claims honest
                </h3>
                <p className="mt-0.5 mb-0 text-[0.76rem] leading-[1.4] text-[var(--muted)] max-[680px]:mt-0 max-[680px]:text-[0.48rem] max-[680px]:leading-[1.2] max-[440px]:text-[0.44rem]">
                  Thoughtful cosmetic language without miracle promises or invented proof.
                </p>
              </div>
            </article>
          </div>

          {/* Philosophy CTA Button */}
          <Link
            className="mt-6 inline-flex min-h-[46px] items-center justify-center gap-1.5 rounded-full border border-[var(--forest)] bg-transparent px-6 py-2.5 text-[0.7rem] font-bold uppercase tracking-[0.1em] text-[var(--forest)] transition-all hover:bg-[var(--forest)] hover:text-[var(--paper)] max-[680px]:mt-2 max-[680px]:min-h-[26px] max-[680px]:px-3 max-[680px]:py-1 max-[680px]:text-[0.48rem] max-[680px]:tracking-[0.04em]"
            href="/our-story"
          >
            Read our philosophy <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>

      <section
        className={`${sectionClass} ${revealClass} max-[680px]:py-8 max-[680px]:px-3.5`}
        aria-labelledby="family-title"
      >
        <div className={`${centeredHeadingClass} max-[680px]:mb-5`}>
          <p className={`${eyebrowClass} max-[680px]:mb-1 max-[680px]:text-[0.52rem]`}>The Botanical Family</p>
          <h2 className={`${sectionTitleClass} max-[680px]:!text-[clamp(1.35rem,5.5vw,1.85rem)] max-[680px]:!leading-[1.08]`} id="family-title">
            Same ritual language. <br className="hidden max-[680px]:inline" />
            A different botanical note.
          </h2>
          <p className="mx-auto mt-6 max-w-[620px] text-[var(--muted)] max-[680px]:mt-2 max-[680px]:text-[0.66rem] max-[680px]:leading-[1.4]">
            Move through the collection and find the ingredient that meets you where your hair is today.
          </p>
        </div>
        <FeaturedProductSwitcher />
      </section>

      {/* ── The NatureMist Philosophy (Ancient botanicals. Modern care.) ── */}
      <section
        className={`mx-auto w-full max-w-[1440px] px-[clamp(24px,5vw,72px)] py-[clamp(40px,6vw,80px)] max-[680px]:px-3.5 max-[680px]:py-6 ${revealClass}`}
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
            <p className="mb-3 text-[0.68rem] font-bold uppercase tracking-[0.22em] text-[#c8d88e] max-[680px]:mb-1.5 max-[680px]:text-[0.52rem]">
              The NatureMist philosophy
            </p>
            <h2
              className="m-0 text-[clamp(2.8rem,5.5vw,5.5rem)] font-normal leading-[0.94] tracking-[-0.045em] text-[#fbfaf6] [font-family:var(--font-display)] max-[680px]:text-[2.2rem]"
              id="story-title"
            >
              Ancient botanicals.<br />Modern care.
            </h2>
            <p className="mx-auto my-6 max-w-[620px] text-[1.05rem] leading-[1.7] text-white/80 max-[680px]:my-3 max-[680px]:text-[0.78rem] max-[680px]:leading-[1.5]">
              Beauty begins at the root—with ingredients we can name, rituals we can understand and enough time to care for ourselves well.
            </p>
            <Link
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-[#fbfaf6] px-8 py-3 text-[0.74rem] font-bold uppercase tracking-[0.14em] text-[#0c2419] shadow-[0_8px_24px_rgba(0,0,0,0.25)] transition-all duration-300 hover:bg-[#c8d88e] hover:shadow-[0_12px_32px_rgba(200,216,142,0.3)] hover:-translate-y-0.5 active:scale-95 max-[680px]:min-h-[38px] max-[680px]:px-6 max-[680px]:py-2 max-[680px]:text-[0.62rem]"
              href="/our-story"
            >
              Our story <span aria-hidden="true">↗</span>
            </Link>

            {/* 3 Pillars Footer Bar */}
            <div className="mt-14 flex w-full items-center justify-between border-t border-white/12 pt-6 text-[0.68rem] font-medium tracking-[0.16em] uppercase text-white/65 max-[680px]:mt-6 max-[680px]:pt-4 max-[680px]:flex-col max-[680px]:gap-2 max-[680px]:text-[0.52rem]">
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
        className={`${sectionClass} ${revealClass} max-[680px]:py-8 max-[680px]:px-3.5`}
        aria-labelledby="bundles-title"
      >
        <div className={`${splitHeadingClass} max-[680px]:gap-2`}>
          <div>
            <p className={`${eyebrowClass} max-[680px]:mb-1 max-[680px]:text-[0.52rem]`}>Rituals in company</p>
            <h2 className={`${sectionTitleClass} max-[680px]:!text-[clamp(1.35rem,5.5vw,1.85rem)] max-[680px]:!leading-[1.08]`} id="bundles-title">
              Botanicals that belong together.
            </h2>
          </div>
          <p className="max-w-[460px] pb-1 leading-[1.75] text-[var(--muted)] max-[900px]:p-0 max-[680px]:text-[0.66rem] max-[680px]:leading-[1.4] max-[680px]:mt-0">
            Build a wash day, deepen a conditioning mask or keep the full botanical cabinet close.
          </p>
        </div>
        <BundleCards />
      </section>

      {/* ── Customer Video UGC and Reviews Section ── */}
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
            <p className="mb-3 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[#c8d88e] max-[680px]:mb-1.5 max-[680px]:text-[0.54rem]">
              Good questions, clearly answered
            </p>
            <h2
              className="m-0 font-serif text-[clamp(2.8rem,4.8vw,5.2rem)] font-normal leading-[0.94] tracking-[-0.045em] text-[#fbfaf6] max-[680px]:text-[clamp(2.1rem,9vw,2.8rem)]"
              id="faq-title"
            >
              The ritual room.
            </h2>
            <p className="mt-4 mb-6 max-w-[380px] text-[0.92rem] leading-[1.65] text-white/75 max-[680px]:my-3 max-[680px]:text-[0.78rem]">
              Begin with curiosity. Continue with care.
            </p>
            <Link
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-[0.72rem] font-bold tracking-[0.12em] uppercase text-[#fbfaf6] backdrop-blur-sm transition-all duration-200 hover:border-[#c8d88e] hover:bg-[#c8d88e] hover:text-[#0c2419] max-[680px]:px-4 max-[680px]:py-2 max-[680px]:text-[0.62rem]"
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
                <summary className="grid min-h-[74px] cursor-pointer list-none grid-cols-[32px_1fr_28px] items-center gap-4 text-[clamp(1.15rem,1.7vw,1.48rem)] font-normal text-[#fbfaf6] [font-family:var(--font-display)] transition-colors duration-200 hover:text-[#c8d88e] [&::-webkit-details-marker]:hidden max-[680px]:grid-cols-[24px_1fr_20px] max-[680px]:text-[1.02rem] max-[680px]:min-h-[58px] max-[680px]:gap-2.5">
                  <span className="font-sans text-[0.62rem] font-bold text-[#c8d88e] max-[680px]:text-[0.52rem]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{faq.question}</span>
                  <i className="font-sans text-[1.1rem] font-light not-italic text-[#c8d88e] transition-transform duration-300 group-open/faq:rotate-45 max-[680px]:text-[0.95rem]">
                    ＋
                  </i>
                </summary>
                <p className="m-0 max-w-[680px] pt-0 pr-6 pb-6 pl-12 text-[0.88rem] leading-[1.65] text-white/75 max-[680px]:pl-8 max-[680px]:pb-4 max-[680px]:text-[0.74rem]">
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
