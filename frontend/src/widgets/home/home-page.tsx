import Image from "next/image";
import Link from "next/link";
import { products } from "@/domain/catalog/products";
import { ProductCard } from "@/features/catalog/product-card";
import { ProductJar } from "@/features/catalog/product-jar";
import { RitualFinder } from "@/features/rituals/ritual-finder";
import { BundleCards } from "./bundle-cards";
import { FeaturedProductSwitcher } from "./featured-product-switcher";
import { HeroPurchase } from "./hero-purchase";
import { homeFaqs, ritualCards } from "./content";

const heroImage = "/images/naturemist-hero.png";
const ritualImage = "/images/naturemist-ritual.png";

const amla = products[0];

const eyebrowClass =
  "mb-4 text-[0.68rem] leading-[1.3] font-bold tracking-[0.2em] text-[var(--botanical)] uppercase";
const lightEyebrowClass =
  "mb-4 text-[0.68rem] leading-[1.3] font-bold tracking-[0.2em] text-[#c8d88e] uppercase";
const sectionTitleClass =
  "m-0 scroll-mt-[calc(var(--header-height)+24px)] text-[clamp(3rem,4.5vw,5rem)] leading-[0.96] font-normal tracking-[-0.055em] text-[var(--forest)] [font-family:var(--font-display)] max-[680px]:text-[clamp(2.75rem,13vw,4rem)]";
const sectionClass =
  "mx-auto w-full max-w-[1440px] px-[clamp(24px,5vw,72px)] py-[clamp(80px,8vw,124px)] max-[680px]:px-5 max-[680px]:py-[74px]";
const splitHeadingClass =
  "grid grid-cols-[minmax(0,1.35fr)_minmax(260px,0.65fr)] items-end gap-[clamp(48px,6vw,88px)] max-[900px]:grid-cols-1 max-[900px]:gap-[30px]";
const centeredHeadingClass =
  "mx-auto mb-[clamp(46px,5vw,72px)] max-w-[820px] text-center max-[680px]:mb-10";
const textLinkClass =
  "inline-flex items-center gap-[14px] border-b border-[var(--forest)] pb-[5px] text-[0.76rem] font-bold tracking-[0.08em] text-[var(--forest)] uppercase [transition:gap_260ms_var(--ease)] motion-reduce:transition-none hover:gap-[22px]";
const revealClass =
  "supports-[animation-timeline:view()]:[animation:section-reveal_1ms_linear_both] supports-[animation-timeline:view()]:[animation-range:entry_5%_cover_28%] supports-[animation-timeline:view()]:[animation-timeline:view()] motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:transform-none";
const buttonClass =
  "inline-flex min-h-[50px] items-center justify-center gap-[22px] border px-6 py-[13px] text-[0.72rem] leading-none font-bold tracking-[0.12em] uppercase [transition:transform_350ms_var(--ease),background-color_350ms_var(--ease),color_350ms_var(--ease),border-color_350ms_var(--ease)] motion-reduce:transition-none hover:[transform:translateY(-2px)]";
const ritualColorClasses = [
  "[--ritual-color:#b7c7a9]",
  "[--ritual-color:#d5b990]",
  "[--ritual-color:#d8c8b1]",
  "[--ritual-color:#aeb6d0]",
] as const;

export function HomePage() {
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
        <div className="relative mx-auto grid min-h-[max(720px,calc(100svh-var(--header-height)-29px))] w-full max-w-[1440px] grid-cols-[minmax(285px,0.92fr)_minmax(390px,1.12fr)_minmax(250px,0.72fr)] gap-[clamp(22px,2.3vw,36px)] px-[clamp(24px,5vw,72px)] pt-[clamp(44px,4.5vw,68px)] pb-[clamp(34px,3.5vw,54px)] max-[1180px]:grid-cols-[minmax(255px,0.9fr)_minmax(350px,1.1fr)_minmax(220px,0.7fr)] max-[1180px]:gap-[22px] max-[1080px]:min-h-0 max-[1080px]:grid-cols-[minmax(285px,0.84fr)_minmax(390px,1.16fr)] max-[1080px]:gap-[42px_32px] max-[1080px]:px-[5vw] max-[1080px]:pt-[52px] max-[1080px]:pb-[64px] max-[900px]:grid-cols-[minmax(230px,0.84fr)_minmax(300px,1.16fr)] max-[900px]:gap-[38px_26px] max-[900px]:px-[6vw] max-[900px]:pt-[46px] max-[900px]:pb-[60px] max-[680px]:flex max-[680px]:flex-col max-[680px]:gap-0 max-[680px]:px-5 max-[680px]:pt-10 max-[680px]:pb-14">
        <div
          className="pointer-events-none absolute top-[4%] left-[31%] z-[1] h-[88%] w-[47%] rounded-full border-2 border-[rgba(63,125,58,0.42)] [transform:rotate(16deg)] [animation:hero-orbit-drift_8s_ease-in-out_infinite_alternate] max-[1180px]:left-[29%] max-[1180px]:w-1/2 min-[901px]:max-[1080px]:top-[1%] min-[901px]:max-[1080px]:left-[39%] min-[901px]:max-[1080px]:h-[58%] min-[901px]:max-[1080px]:w-[60%] max-[900px]:top-[1%] max-[900px]:left-[39%] max-[900px]:h-[58%] max-[900px]:w-[60%] max-[680px]:top-[34%] max-[680px]:left-[-17%] max-[680px]:h-[42%] max-[680px]:w-[132%] max-[680px]:opacity-75 motion-reduce:animate-none motion-reduce:[transform:rotate(16deg)]"
          aria-hidden="true"
        >
          <i className="absolute top-[1%] left-[48%] h-[18px] w-[38px] rotate-[-58deg] rounded-[100%_0_100%_0] bg-[rgba(111,143,47,0.78)]" />
          <i className="absolute right-[-9px] bottom-[28%] h-[18px] w-[38px] [transform:rotate(30deg)_scale(0.75)] rounded-[100%_0_100%_0] bg-[rgba(111,143,47,0.78)]" />
          <i className="absolute bottom-[1%] left-[19%] h-[18px] w-[38px] [transform:rotate(135deg)_scale(0.65)] rounded-[100%_0_100%_0] bg-[rgba(111,143,47,0.78)]" />
        </div>
        <div className="relative z-[4] w-full self-center [animation:hero-copy-enter_900ms_var(--ease)_both] max-[1180px]:w-[108%] max-[1080px]:w-[106%] max-[900px]:mt-[-22px] max-[900px]:w-[110%] max-[900px]:self-start max-[680px]:mt-0 max-[680px]:w-full motion-reduce:animate-none motion-reduce:transform-none motion-reduce:opacity-100">
          <p className={eyebrowClass}>The Amla Ritual · No. 01</p>
          <h1
            className="relative z-[4] m-0 max-w-[580px] [color:var(--charcoal)] [font-family:var(--font-sans)] text-[clamp(4rem,4.8vw,5.4rem)] leading-[0.84] font-[620] tracking-[-0.065em] max-[1180px]:text-[clamp(3.55rem,5vw,4.8rem)] max-[1080px]:max-w-[510px] max-[1080px]:text-[clamp(3.25rem,6vw,4.5rem)] max-[900px]:text-[clamp(2.9rem,6.5vw,3.35rem)] max-[680px]:text-[clamp(3rem,15vw,4.5rem)] max-[680px]:leading-[0.84]"
            id="hero-title"
          >
            <span className="block [animation:hero-title-enter_900ms_var(--ease)_80ms_both] motion-reduce:animate-none motion-reduce:transform-none motion-reduce:opacity-100">
              Indulge in
            </span>
            <span className="flex items-center gap-[clamp(13px,1.4vw,22px)] [animation:hero-title-enter_900ms_var(--ease)_150ms_both] motion-reduce:animate-none motion-reduce:transform-none motion-reduce:opacity-100">
              Pure
              <span
                className="relative inline-block h-[0.58em] w-[clamp(105px,10.5vw,168px)] translate-y-[0.04em] overflow-hidden rounded-[999px] border border-[rgba(23,63,42,0.12)] shadow-[0_12px_30px_rgba(23,63,42,0.1)] max-[680px]:w-[clamp(96px,31vw,145px)]"
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
            <em className="mt-[0.08em] ml-[0.03em] block whitespace-nowrap text-[0.91em] leading-[inherit] font-normal tracking-[-0.055em] text-[var(--botanical)] italic [font-family:var(--font-display)] [animation:hero-title-enter_900ms_var(--ease)_220ms_both] max-[680px]:whitespace-normal motion-reduce:animate-none motion-reduce:transform-none motion-reduce:opacity-100">
              Botanical ritual.
            </em>
          </h1>
          <p className="my-[clamp(28px,3.2vh,42px)_22px] max-w-[440px] text-[clamp(0.95rem,1.05vw,1.08rem)] leading-[1.7] text-[#4b5047] max-[900px]:my-[24px_18px] max-[900px]:max-w-[430px] max-[900px]:text-[0.82rem] max-[900px]:leading-[1.65] max-[680px]:my-[25px_16px] max-[680px]:text-[0.9rem] max-[680px]:leading-[1.6]">
            A storied Indian botanical, thoughtfully prepared for soft-feeling,
            luminous-looking hair—and an unhurried moment of care.
          </p>
          <HeroPurchase
            slug={amla.slug}
            name={amla.name}
            pricePaise={amla.pricePaise}
          />
          <ul
            className="mt-[21px] flex max-w-[440px] list-none items-center gap-[14px] border-t border-[rgba(23,63,42,0.16)] pt-[18px] text-[var(--forest)] max-[1080px]:max-w-full max-[900px]:max-w-full max-[680px]:mt-[17px] max-[680px]:grid max-[680px]:grid-cols-2 max-[680px]:gap-2 max-[680px]:pt-[15px]"
            aria-label="NatureMist principles"
          >
            <li className="flex items-center gap-1.5 text-[0.54rem] font-bold tracking-[0.05em] uppercase">
              <span className="text-[0.8rem] text-[var(--botanical)] [font-family:var(--font-display)]">
                01
              </span>{" "}
              Single botanical
            </li>
            <li className="flex items-center gap-1.5 text-[0.54rem] font-bold tracking-[0.05em] uppercase">
              <span className="text-[0.8rem] text-[var(--botanical)] [font-family:var(--font-display)]">
                02
              </span>{" "}
              Clearly explained
            </li>
            <li className="flex items-center gap-1.5 text-[0.54rem] font-bold tracking-[0.05em] uppercase max-[680px]:col-span-full">
              <span className="text-[0.8rem] text-[var(--botanical)] [font-family:var(--font-display)]">
                03
              </span>{" "}
              Made for home rituals
            </li>
          </ul>
        </div>

        <div className="relative z-[2] h-[clamp(520px,65vh,650px)] w-full min-w-0 self-center [animation:hero-portrait-enter_1s_var(--ease)_80ms_both] max-[1180px]:h-[clamp(500px,62vh,610px)] max-[1080px]:h-[clamp(460px,58vh,540px)] max-[900px]:mt-[-46px] max-[900px]:h-[clamp(450px,58vh,520px)] max-[900px]:self-start max-[680px]:mt-9 max-[680px]:h-auto max-[680px]:aspect-[4/5] motion-reduce:animate-none motion-reduce:transform-none motion-reduce:opacity-100">
          <div className="group/portrait absolute inset-0 overflow-hidden rounded-[50%_50%_8px_8px/28%_28%_1%_1%] border border-[rgba(23,63,42,0.08)] bg-[var(--beige)] shadow-[0_30px_75px_rgba(40,51,33,0.16)] max-[680px]:rounded-[50%_50%_8px_8px/25%_25%_1%_1%]">
            <Image
              src={heroImage}
              alt="A woman with long, dark natural hair in a sunlit botanical setting"
              fill
              sizes="(max-width: 680px) 92vw, (max-width: 900px) 52vw, 38vw"
              preload
              className="object-cover object-[76%_center] [transform:scale(1.04)] [transition:transform_1.1s_var(--ease)] [@media(hover:hover)_and_(pointer:fine)]:group-hover/portrait:[transform:scale(1.065)] max-[680px]:object-[74%_center] motion-reduce:transition-none motion-reduce:[transform:scale(1.04)]"
            />
            <span
              className="absolute inset-0 bg-[linear-gradient(180deg,transparent_60%,rgba(17,45,28,0.2)),linear-gradient(90deg,rgba(247,244,232,0.08),transparent_35%)]"
              aria-hidden="true"
            />
            <span
              className="absolute right-5 bottom-[18px] text-[0.55rem] font-bold tracking-[0.16em] text-[rgba(255,255,255,0.82)]"
              aria-hidden="true"
            >
              01 / 06
            </span>
          </div>
          <div className="absolute bottom-[28%] left-[-68px] z-[5] grid min-h-[62px] w-[225px] grid-cols-[40px_1fr_8px] items-center gap-[10px] rounded-lg border border-[rgba(255,255,255,0.55)] bg-[rgba(248,245,234,0.87)] px-3 py-[9px] shadow-[0_18px_45px_rgba(28,46,31,0.16)] backdrop-blur-[14px] max-[1180px]:left-[-34px] max-[1180px]:w-[205px] min-[901px]:max-[1080px]:left-[-38px] max-[900px]:left-[-38px] max-[680px]:bottom-[17%] max-[680px]:left-3 max-[680px]:w-[min(220px,67vw)] motion-reduce:transform-none motion-reduce:opacity-100">
            <span className="grid size-10 place-items-center rounded-full bg-[var(--forest)] text-[var(--paper)] [font-family:var(--font-display)]">
              01
            </span>
            <div className="grid leading-[1.2]">
              <strong className="text-[0.88rem] font-semibold text-[var(--forest)] [font-family:var(--font-display)]">
                Amla · pre-wash
              </strong>
              <small className="mt-1 text-[0.48rem] text-[var(--muted)]">
                Softness + luminous-looking shine
              </small>
            </div>
            <i
              className="size-[7px] rounded-full bg-[var(--amla)] shadow-[0_0_0_5px_rgba(167,201,67,0.16)]"
              aria-hidden="true"
            />
          </div>
          <a
            className="absolute right-[-18px] bottom-[18px] z-[6] grid size-[76px] place-items-center rounded-full border border-[rgba(255,255,255,0.8)] bg-[rgba(23,63,42,0.14)] text-[1.75rem] text-white shadow-[0_14px_34px_rgba(18,38,23,0.12)] backdrop-blur-[8px] [font-family:var(--font-display)] [transition:background_250ms_ease,transform_250ms_ease] hover:bg-[rgba(23,63,42,0.5)] hover:[transform:translateY(4px)] max-[680px]:right-3 max-[680px]:bottom-3 max-[680px]:size-16 motion-reduce:transition-none"
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
          className="relative z-[4] min-w-0 self-center scroll-mt-[calc(var(--header-height)+20px)] min-[901px]:max-[1080px]:col-span-full min-[901px]:max-[1080px]:grid min-[901px]:max-[1080px]:grid-cols-[minmax(280px,0.75fr)_minmax(380px,1.25fr)] min-[901px]:max-[1080px]:items-start min-[901px]:max-[1080px]:gap-x-9 min-[901px]:max-[1080px]:border-t min-[901px]:max-[1080px]:border-[var(--line)] min-[901px]:max-[1080px]:pt-[30px] max-[900px]:col-span-full max-[900px]:grid max-[900px]:grid-cols-[minmax(210px,0.75fr)_minmax(280px,1.25fr)] max-[900px]:items-start max-[900px]:gap-x-[26px] max-[900px]:border-t max-[900px]:border-[var(--line)] max-[900px]:pt-[30px] max-[680px]:mt-11 max-[680px]:w-full max-[680px]:grid-cols-1 max-[680px]:gap-0 max-[680px]:pt-[45px]"
          id="amla-ritual"
          aria-label="Featured Amla ritual"
        >
          <nav
            className="mb-[7px] grid grid-cols-[42px_1fr_42px] items-center gap-2 text-[var(--forest)] min-[901px]:max-[1080px]:col-span-full max-[900px]:col-span-full max-[680px]:col-span-1"
            aria-label="Browse featured rituals"
          >
            <Link
              className="grid size-[42px] place-items-center rounded-full border border-[rgba(23,63,42,0.24)] text-[1.1rem] [transition:color_240ms_ease,background_240ms_ease,transform_240ms_ease] motion-reduce:transition-none hover:bg-[var(--forest)] hover:text-[var(--paper)] hover:[transform:translateY(-2px)]"
              href="/shop/hibiscus-powder"
              aria-label="Previous featured ritual, Hibiscus"
            >
              ←
            </Link>
            <span className="text-center text-[0.56rem] font-bold tracking-[0.16em] text-[var(--muted)] uppercase">
              Featured ritual
            </span>
            <Link
              className="grid size-[42px] place-items-center rounded-full border border-[rgba(23,63,42,0.24)] text-[1.1rem] [transition:color_240ms_ease,background_240ms_ease,transform_240ms_ease] motion-reduce:transition-none hover:bg-[var(--forest)] hover:text-[var(--paper)] hover:[transform:translateY(-2px)]"
              href="/shop/reetha-powder"
              aria-label="Next featured ritual, Reetha"
            >
              →
            </Link>
          </nav>
          <div className="relative grid h-[clamp(245px,31vh,305px)] place-items-center overflow-hidden border-b border-[var(--line)] bg-[radial-gradient(circle_at_52%_54%,rgba(167,201,67,0.18),transparent_49%)] min-[901px]:max-[1080px]:col-start-1 min-[901px]:max-[1080px]:row-[2/4] min-[901px]:max-[1080px]:h-[325px] min-[901px]:max-[1080px]:border-b-0 max-[900px]:col-start-1 max-[900px]:row-[2/4] max-[900px]:h-[315px] max-[900px]:border-b-0 max-[680px]:col-start-1 max-[680px]:row-auto max-[680px]:h-[285px] max-[680px]:border-b max-[680px]:border-[var(--line)]">
            <span
              className="pointer-events-none absolute inset-0"
              aria-hidden="true"
            >
              <i className="absolute top-[20%] left-[6%] h-[18px] w-[38px] [transform:rotate(-18deg)_scale(1.1)] rounded-[100%_0_100%_0] bg-[rgba(111,143,47,0.78)]" />
              <i className="absolute top-[34%] right-[4%] h-[18px] w-[38px] rotate-[42deg] rounded-[100%_0_100%_0] bg-[rgba(111,143,47,0.78)]" />
              <i className="absolute right-[19%] bottom-[12%] h-[18px] w-[38px] [transform:rotate(115deg)_scale(0.75)] rounded-[100%_0_100%_0] bg-[rgba(111,143,47,0.78)]" />
            </span>
            <ProductJar
              product={amla}
              size="medium"
              className="z-[3] [--hero-jar-scale:0.9] [transform:scale(var(--hero-jar-scale))] [animation:hero-jar-float_5.5s_ease-in-out_infinite] max-[1180px]:[--hero-jar-scale:0.82] min-[901px]:max-[1080px]:[--hero-jar-scale:0.94] max-[900px]:[--hero-jar-scale:0.94] max-[680px]:[--hero-jar-scale:0.9] motion-reduce:animate-none motion-reduce:[transform:scale(var(--hero-jar-scale))]"
            />
            <span
              className="absolute right-[5%] bottom-[21%] z-[4] h-[23px] w-[47px] rotate-[-9deg] rounded-[50%] border-[5px] border-[rgba(255,255,255,0.72)] bg-[#92a14f] shadow-[0_7px_17px_rgba(31,43,25,0.16)]"
              aria-hidden="true"
            />
          </div>
          <div className="py-[17px_11px] min-[901px]:max-[1080px]:col-start-2 min-[901px]:max-[1080px]:row-start-2 min-[901px]:max-[1080px]:py-[25px_14px] max-[900px]:col-start-2 max-[900px]:row-start-2 max-[900px]:py-[25px_14px] max-[680px]:col-start-1 max-[680px]:row-auto max-[680px]:pt-[23px]">
            <span className="text-[0.52rem] font-bold tracking-[0.13em] text-[var(--muted)] uppercase">
              NatureMist / Ritual 01
            </span>
            <h2 className="my-[3px_1px] [color:var(--forest)] [font-family:var(--font-display)] text-[clamp(2rem,2.7vw,3.15rem)] leading-none font-normal tracking-[-0.045em] max-[1180px]:text-[clamp(1.85rem,2.5vw,2.6rem)] max-[680px]:text-[2.7rem]">
              Amla powder
            </h2>
            <p className="m-0 text-[0.52rem] font-bold tracking-[0.13em] text-[var(--muted)] uppercase">
              Condition + shine · packaging preview
            </p>
          </div>
          <div className="border-t border-[var(--line)] min-[901px]:max-[1080px]:col-start-2 min-[901px]:max-[1080px]:row-start-3 max-[900px]:col-start-2 max-[900px]:row-start-3 max-[680px]:col-start-1 max-[680px]:row-auto">
            <details className="group/fact border-b border-[var(--line)]">
              <summary className="flex min-h-[49px] cursor-pointer list-none items-center justify-between text-[0.98rem] text-[var(--forest)] [font-family:var(--font-display)] [&::-webkit-details-marker]:hidden max-[680px]:min-h-[58px] max-[680px]:text-[1.04rem]">
                Why you&apos;ll love it{" "}
                <span
                  className="[font-family:var(--font-sans)] [transition:transform_300ms_var(--ease)] motion-reduce:transition-none group-open/fact:[transform:rotate(45deg)]"
                  aria-hidden="true"
                >
                  ＋
                </span>
              </summary>
              <p className="mt-[-1px] mb-0 pb-[14px] text-[0.68rem] leading-[1.58] text-[var(--muted)] max-[680px]:text-[0.76rem]">
                {amla.shortDescription}
              </p>
            </details>
            <details className="group/fact border-b border-[var(--line)]">
              <summary className="flex min-h-[49px] cursor-pointer list-none items-center justify-between text-[0.98rem] text-[var(--forest)] [font-family:var(--font-display)] [&::-webkit-details-marker]:hidden max-[680px]:min-h-[58px] max-[680px]:text-[1.04rem]">
                How to prepare{" "}
                <span
                  className="[font-family:var(--font-sans)] [transition:transform_300ms_var(--ease)] motion-reduce:transition-none group-open/fact:[transform:rotate(45deg)]"
                  aria-hidden="true"
                >
                  ＋
                </span>
              </summary>
              <p className="mt-[-1px] mb-0 pb-[14px] text-[0.68rem] leading-[1.58] text-[var(--muted)] max-[680px]:text-[0.76rem]">
                Mix gradually with water until smooth, apply in sections and follow the final pack timing before rinsing thoroughly.
              </p>
            </details>
            <details className="group/fact border-b border-[var(--line)]" open>
              <summary className="flex min-h-[49px] cursor-pointer list-none items-center justify-between text-[0.98rem] text-[var(--forest)] [font-family:var(--font-display)] [&::-webkit-details-marker]:hidden max-[680px]:min-h-[58px] max-[680px]:text-[1.04rem]">
                Ingredient clarity{" "}
                <span
                  className="[font-family:var(--font-sans)] [transition:transform_300ms_var(--ease)] motion-reduce:transition-none group-open/fact:[transform:rotate(45deg)]"
                  aria-hidden="true"
                >
                  ＋
                </span>
              </summary>
              <p className="mt-[-1px] mb-0 pb-[14px] text-[0.68rem] leading-[1.58] text-[var(--muted)] max-[680px]:text-[0.76rem]">
                {amla.ingredient}
              </p>
            </details>
          </div>
        </aside>
        </div>
      </section>

      <section
        className={`${sectionClass} ${revealClass} overflow-hidden`}
        aria-labelledby="collection-title"
      >
        <div className={splitHeadingClass}>
          <div>
            <p className={eyebrowClass}>The botanical cabinet</p>
            <h2 className={sectionTitleClass} id="collection-title">
              Shop the herbal collection.
            </h2>
          </div>
          <div className="max-w-[460px] pb-1 leading-[1.75] text-[var(--muted)] max-[900px]:p-0">
            <p>Six single botanicals. Six distinct rituals. One calm, considered way to begin.</p>
            <Link className={`${textLinkClass} mt-[15px]`} href="/shop">
              View all botanicals <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
        <div
          className="grid grid-cols-3 gap-[clamp(18px,2vw,30px)] pt-[72px] max-[1180px]:grid-cols-2 max-[680px]:flex max-[680px]:w-[calc(100%+20px)] max-[680px]:snap-x max-[680px]:snap-mandatory max-[680px]:overflow-x-auto max-[680px]:py-[48px_24px] max-[680px]:pr-5 max-[680px]:[scrollbar-width:none] max-[680px]:[&::-webkit-scrollbar]:hidden max-[680px]:[&>*]:w-[min(83vw,340px)] max-[680px]:[&>*]:flex-none max-[680px]:[&>*]:snap-start"
          aria-label="NatureMist botanical collection"
        >
          {products.map((product) => (
            <ProductCard product={product} key={product.slug} />
          ))}
        </div>
        <p className="mx-auto mt-7 max-w-[680px] text-center text-[0.7rem] leading-[1.6] text-[var(--muted)]">
          Product jars and prices are editable launch previews. Final labels, net weights, batch data and commercial terms will replace them before sale.
        </p>
      </section>

      <section
        className={`mx-auto w-full max-w-[1440px] px-[clamp(24px,5vw,72px)] pt-2 pb-[clamp(80px,8vw,124px)] max-[680px]:px-5 max-[680px]:pt-0 max-[680px]:pb-[74px] ${revealClass}`}
        aria-labelledby="choose-title"
      >
        <div className={centeredHeadingClass}>
          <p className={eyebrowClass}>Begin with how you want to feel</p>
          <h2 className={sectionTitleClass} id="choose-title">
            Choose your ritual.
          </h2>
          <p className="mx-auto mt-6 max-w-[620px] text-[var(--muted)]">
            Traditional ingredients become easier when the purpose is clear.
          </p>
        </div>
        <div className="grid grid-cols-4 gap-px overflow-hidden rounded-[3px] bg-[var(--line)] ring-1 ring-[var(--line)] max-[1180px]:grid-cols-2 max-[680px]:grid-cols-1">
          {ritualCards.map((ritual, index) => (
            <Link
              className={`group/ritual relative min-h-[390px] overflow-hidden bg-[var(--paper)] p-[clamp(24px,2.2vw,30px)] [transition:color_450ms_var(--ease),background_450ms_var(--ease)] motion-reduce:transition-none hover:bg-[var(--forest)] hover:text-[var(--paper)] max-[900px]:min-h-[360px] max-[680px]:min-h-[340px] ${ritualColorClasses[index]}`}
              href={ritual.href}
              key={ritual.title}
            >
              <span className="text-[0.62rem] font-bold tracking-[0.14em] text-[var(--botanical)] group-hover/ritual:text-[var(--amla)]">
                {ritual.number}
              </span>
              <span
                className="absolute top-[70px] right-[5%] left-[5%] h-[190px] rounded-[50%_50%_0_0] bg-[radial-gradient(circle_at_50%_70%,color-mix(in_srgb,var(--ritual-color)_60%,white),transparent_55%),var(--ritual-color)] opacity-[0.78] [transition:transform_600ms_var(--ease),opacity_600ms_var(--ease)] motion-reduce:transition-none group-hover/ritual:[transform:scale(1.04)_translateY(-4px)] group-hover/ritual:opacity-[0.55]"
                aria-hidden="true"
              >
                <i className="absolute bottom-[25px] left-1/2 h-10 w-[70px] [transform:rotate(-35deg)] rounded-[100%_0_100%_0] bg-[rgba(23,63,42,0.32)] origin-left" />
                <i className="absolute bottom-[25px] left-1/2 h-10 w-[70px] [transform:scaleX(-1)_rotate(-35deg)] rounded-[100%_0_100%_0] bg-[rgba(23,63,42,0.32)] origin-left" />
                <i className="absolute bottom-[65px] left-1/2 h-10 w-[70px] [transform:rotate(-75deg)_scale(0.7)] rounded-[100%_0_100%_0] bg-[rgba(23,63,42,0.32)] origin-left" />
              </span>
              <h3 className="absolute right-[30px] bottom-[92px] left-[30px] m-0 [color:var(--forest)] [font-family:var(--font-display)] text-[clamp(1.7rem,2.4vw,2.7rem)] leading-none font-normal tracking-[-0.04em] [transition:color_350ms_ease] motion-reduce:transition-none group-hover/ritual:text-[var(--paper)]">
                {ritual.title}
              </h3>
              <p className="absolute right-[30px] bottom-[47px] left-[30px] m-0 text-[0.74rem] leading-[1.5] [color:var(--muted)] [transition:color_350ms_ease] motion-reduce:transition-none group-hover/ritual:text-[var(--paper)]">
                {ritual.copy}
              </p>
              <span className="absolute right-6 bottom-5 text-[0.62rem] tracking-[0.1em] uppercase opacity-0 [transform:translateY(8px)] [transition:opacity_350ms_ease,transform_350ms_ease] motion-reduce:transition-none group-hover/ritual:opacity-100 group-hover/ritual:[transform:translateY(0)]">
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
        <div className="mx-auto grid w-full max-w-[1440px] grid-cols-[0.72fr_1.28fr] items-start gap-[clamp(50px,6vw,88px)] px-[clamp(24px,5vw,72px)] py-[clamp(76px,8vw,116px)] max-[900px]:grid-cols-1 max-[900px]:gap-12 max-[680px]:px-5 max-[680px]:py-[70px]">
          <div className="max-[900px]:max-w-[680px]">
            <p className={lightEyebrowClass}>Build your ritual</p>
            <h2
              className="m-0 [font-family:var(--font-display)] text-[clamp(3rem,4.4vw,5rem)] leading-[0.95] font-normal tracking-[-0.055em] max-[680px]:text-[clamp(2.9rem,13vw,3.8rem)]"
              id="builder-title"
            >
              A botanical starting point, chosen with care.
            </h2>
            <p className="mt-7 max-w-[490px] text-[rgba(255,255,255,0.65)]">
              Tell us your ritual goal and how your hair feels today. We&apos;ll suggest a simple place to begin—never a diagnosis or a promise.
            </p>
          </div>
          <RitualFinder />
        </div>
      </section>

      <section
        className={`${sectionClass} ${revealClass}`}
        aria-labelledby="prepare-title"
      >
        <div className={splitHeadingClass}>
          <div>
            <p className={eyebrowClass}>The art of preparation</p>
            <h2 className={sectionTitleClass} id="prepare-title">
              Three steps. One unhurried ritual.
            </h2>
          </div>
          <p className="max-w-[460px] pb-1 leading-[1.75] text-[var(--muted)] max-[900px]:p-0">
            Every powder has its own directions. The rhythm, however, stays beautifully simple.
          </p>
        </div>
        <div className="mt-[72px] grid grid-cols-3 border-y border-[var(--line)] max-[680px]:grid-cols-1">
          <article className="relative min-h-[360px] border-r border-[var(--line)] px-10 pt-7 pb-10 last:border-r-0 max-[900px]:px-[18px] max-[680px]:min-h-[310px] max-[680px]:border-r-0 max-[680px]:border-b max-[680px]:last:border-b-0">
            <span className="text-[0.63rem] font-bold tracking-[0.15em] text-[var(--botanical)]">
              01
            </span>
            <span
              className="relative mx-auto mt-7 mb-[18px] block h-[135px] w-[110px] before:absolute before:top-[15px] before:left-[38px] before:h-12 before:w-[38px] before:rotate-[-12deg] before:rounded-[50%_50%_44%_44%] before:border-2 before:border-[var(--forest)] before:content-[''] after:absolute after:top-[59px] after:left-[54px] after:h-[70px] after:w-[7px] after:rotate-[-12deg] after:rounded-[9px] after:bg-[var(--forest)] after:content-['']"
              aria-hidden="true"
            >
              <i />
            </span>
            <h3 className="m-0 text-center [color:var(--forest)] [font-family:var(--font-display)] text-[2rem] font-normal">
              Scoop
            </h3>
            <p className="mx-auto mt-2 max-w-[290px] text-center text-[0.82rem] text-[var(--muted)]">
              Begin with enough botanical powder for your hair length.
            </p>
          </article>
          <article className="relative min-h-[360px] border-r border-[var(--line)] px-10 pt-7 pb-10 last:border-r-0 max-[900px]:px-[18px] max-[680px]:min-h-[310px] max-[680px]:border-r-0 max-[680px]:border-b max-[680px]:last:border-b-0">
            <span className="text-[0.63rem] font-bold tracking-[0.15em] text-[var(--botanical)]">
              02
            </span>
            <span
              className="relative mx-auto mt-7 mb-[18px] block h-[135px] w-[110px] before:absolute before:top-12 before:left-[5px] before:h-[52px] before:w-[100px] before:rounded-[0_0_60px_60px] before:border-2 before:border-[var(--forest)] before:content-[''] after:absolute after:top-[43px] after:left-[5px] after:h-3 after:w-[100px] after:rounded-[50%] after:border-2 after:border-[var(--forest)] after:bg-[var(--ivory)] after:content-['']"
              aria-hidden="true"
            >
              <i />
            </span>
            <h3 className="m-0 text-center [color:var(--forest)] [font-family:var(--font-display)] text-[2rem] font-normal">
              Mix
            </h3>
            <p className="mx-auto mt-2 max-w-[290px] text-center text-[0.82rem] text-[var(--muted)]">
              Add water gradually until the texture is smooth and spreadable.
            </p>
          </article>
          <article className="relative min-h-[360px] border-r border-[var(--line)] px-10 pt-7 pb-10 last:border-r-0 max-[900px]:px-[18px] max-[680px]:min-h-[310px] max-[680px]:border-r-0 max-[680px]:border-b max-[680px]:last:border-b-0">
            <span className="text-[0.63rem] font-bold tracking-[0.15em] text-[var(--botanical)]">
              03
            </span>
            <span
              className="relative mx-auto mt-7 mb-[18px] block h-[135px] w-[110px] before:absolute before:top-[18px] before:left-10 before:h-[84px] before:w-[37px] before:rotate-[17deg] before:rounded-[55%_55%_44%_44%] before:border-2 before:border-[var(--forest)] before:content-[''] after:absolute after:right-[5px] after:bottom-[18px] after:left-[5px] after:h-px after:bg-[var(--line)] after:shadow-[0_7px_0_var(--line),0_14px_0_var(--line)] after:content-['']"
              aria-hidden="true"
            >
              <i />
            </span>
            <h3 className="m-0 text-center [color:var(--forest)] [font-family:var(--font-display)] text-[2rem] font-normal">
              Apply
            </h3>
            <p className="mx-auto mt-2 max-w-[290px] text-center text-[0.82rem] text-[var(--muted)]">
              Follow the botanical-specific directions, then rinse thoroughly.
            </p>
          </article>
        </div>
      </section>

      <section
        className={`mx-auto grid w-full max-w-[1440px] scroll-mt-[calc(var(--header-height)+24px)] grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] items-center gap-[clamp(52px,7vw,96px)] px-[clamp(24px,5vw,72px)] pb-[clamp(84px,9vw,132px)] max-[900px]:grid-cols-[0.8fr_1.2fr] max-[900px]:gap-11 max-[680px]:grid-cols-1 max-[680px]:gap-12 max-[680px]:px-5 max-[680px]:pb-[76px] ${revealClass}`}
        id="ingredient-standards"
        aria-labelledby="purity-title"
      >
        <div className="relative">
          <div className="relative aspect-[0.72] w-full overflow-hidden rounded-[50%_50%_4px_4px/22%_22%_4px_4px] bg-[var(--beige)] max-[680px]:aspect-[0.8]">
            <Image
              src={ritualImage}
              alt="A hand slowly mixing a fresh green amla paste in a ceramic bowl beside amla fruit"
              fill
              sizes="(max-width: 800px) 90vw, 45vw"
              className="object-cover"
            />
          </div>
          <span className="mt-[13px] block text-[0.55rem] tracking-[0.15em] text-[var(--muted)] uppercase">
            Amla ritual · prepared fresh
          </span>
        </div>
        <div>
          <p className={eyebrowClass}>Ingredient clarity</p>
          <h2 className={sectionTitleClass} id="purity-title">
            One ingredient. Nothing hidden.
          </h2>
          <p className="my-[30px_38px] max-w-[610px] text-[clamp(1.02rem,1.3vw,1.2rem)] leading-[1.75] text-[var(--muted)]">
            NatureMist translates a time-honoured practice into a ritual you can understand from first scoop to final rinse.
          </p>
          <div className="mb-[34px] border-t border-[var(--line)]">
            <article className="grid grid-cols-[38px_1fr] gap-5 border-b border-[var(--line)] py-[22px]">
              <span className="text-[0.62rem] text-[var(--botanical)]">01</span>
              <div>
                <h3 className="m-0 [color:var(--forest)] [font-family:var(--font-display)] text-[1.35rem] font-normal">
                  Name the botanical
                </h3>
                <p className="mt-1 mb-0 text-[0.78rem] text-[var(--muted)]">
                  Common name, botanical identity and plant part—clearly stated on the final pack.
                </p>
              </div>
            </article>
            <article className="grid grid-cols-[38px_1fr] gap-5 border-b border-[var(--line)] py-[22px]">
              <span className="text-[0.62rem] text-[var(--botanical)]">02</span>
              <div>
                <h3 className="m-0 [color:var(--forest)] [font-family:var(--font-display)] text-[1.35rem] font-normal">
                  Explain the ritual
                </h3>
                <p className="mt-1 mb-0 text-[0.78rem] text-[var(--muted)]">
                  Preparation, pairing and safety guidance written for beginners as well as familiar users.
                </p>
              </div>
            </article>
            <article className="grid grid-cols-[38px_1fr] gap-5 border-b border-[var(--line)] py-[22px]">
              <span className="text-[0.62rem] text-[var(--botanical)]">03</span>
              <div>
                <h3 className="m-0 [color:var(--forest)] [font-family:var(--font-display)] text-[1.35rem] font-normal">
                  Keep claims honest
                </h3>
                <p className="mt-1 mb-0 text-[0.78rem] text-[var(--muted)]">
                  Thoughtful cosmetic language without miracle promises or invented proof.
                </p>
              </div>
            </article>
          </div>
          <Link
            className={`${buttonClass} border-[var(--forest)] text-[var(--forest)] hover:bg-[var(--forest)] hover:text-[var(--paper)]`}
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
        className={`relative flex min-h-[690px] flex-col items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_38%,rgba(167,201,67,0.12),transparent_38%),var(--forest-dark)] px-[25px] pt-[100px] pb-[55px] text-center text-[var(--paper)] max-[680px]:min-h-[660px] max-[680px]:px-5 max-[680px]:pt-[90px] max-[680px]:pb-[100px] ${revealClass}`}
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
          className="m-0 max-w-[1120px] text-[clamp(4.25rem,6.5vw,7.2rem)] leading-[0.82] font-normal tracking-[-0.055em] text-[var(--paper)] [font-family:var(--font-display)] max-[680px]:text-[clamp(3.65rem,17vw,5.25rem)]"
          id="story-title"
        >
          Ancient botanicals.<br />Modern care.
        </h2>
        <p className="mx-auto my-[40px_32px] max-w-[640px] text-[1.03rem] text-[rgba(255,255,255,0.67)]">
          Beauty begins at the root—with ingredients we can name, rituals we can understand and enough time to care for ourselves well.
        </p>
        <Link
          className={`${buttonClass} border-transparent bg-[var(--paper)] text-[var(--forest)] hover:bg-[var(--amla)]`}
          href="/our-story"
        >
          Our story <span aria-hidden="true">↗</span>
        </Link>
        <div className="absolute right-[5vw] bottom-6 left-[5vw] flex justify-between border-t border-[rgba(255,255,255,0.15)] pt-5 text-[0.58rem] tracking-[0.13em] text-[rgba(255,255,255,0.58)] uppercase max-[680px]:items-center max-[680px]:gap-2 max-[680px]:flex-col">
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
        className={`mx-auto w-full max-w-[1440px] px-[clamp(24px,5vw,72px)] pt-2 pb-[clamp(80px,8vw,124px)] max-[680px]:px-5 max-[680px]:pt-0 max-[680px]:pb-[74px] ${revealClass}`}
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
                      className="grid size-10 place-items-center rounded-full border border-[var(--line)] text-[var(--forest)]"
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
        className={`bg-[var(--ivory-deep)] px-[clamp(24px,5vw,72px)] py-[clamp(80px,8vw,124px)] max-[680px]:px-5 max-[680px]:py-[74px] ${revealClass}`}
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
        <div className="mx-auto grid max-w-[1296px] grid-cols-3 gap-[clamp(16px,1.6vw,22px)] max-[900px]:grid-cols-1">
          <Link
            href="/rituals"
            className="relative flex min-h-[430px] flex-col justify-end overflow-hidden bg-[#d7ddc9] p-[30px] [transition:transform_450ms_var(--ease),box-shadow_450ms_var(--ease)] motion-reduce:transition-none before:absolute before:top-[50px] before:left-1/2 before:h-[180px] before:w-[180px] before:-translate-x-1/2 before:rounded-[50%_50%_0_0] before:border before:border-[rgba(23,63,42,0.25)] before:content-[''] after:absolute after:top-[100px] after:left-1/2 after:h-10 after:w-20 after:-translate-x-1/2 after:rotate-[25deg] after:rounded-[100%_0_100%_0] after:bg-[rgba(23,63,42,0.22)] after:shadow-[55px_35px_0_rgba(23,63,42,0.18),-45px_65px_0_rgba(23,63,42,0.14)] after:content-[''] hover:shadow-[var(--shadow-soft)] hover:[transform:translateY(-5px)] max-[900px]:min-h-[360px]"
          >
            <span className="relative z-[2] text-[0.6rem] font-bold tracking-[0.13em] text-[var(--botanical)] uppercase">Guide 01</span>
            <h3 className="relative z-[2] my-2 [color:var(--forest)] [font-family:var(--font-display)] text-[clamp(2rem,2.8vw,3rem)] leading-[0.98] font-normal tracking-[-0.045em]">Low-lather wash day, explained</h3>
            <p className="relative z-[2] mt-0 mb-4 text-[0.78rem] text-[var(--muted)]">Why botanical cleansing feels different.</p>
            <i className="relative z-[2] text-[0.6rem] font-bold not-italic tracking-[0.13em] text-[var(--botanical)] uppercase">Read guide ↗</i>
          </Link>
          <Link
            href="/rituals"
            className="relative flex min-h-[430px] flex-col justify-end overflow-hidden bg-[#e0d5c1] p-[30px] [transition:transform_450ms_var(--ease),box-shadow_450ms_var(--ease)] motion-reduce:transition-none before:absolute before:top-[50px] before:left-1/2 before:h-[180px] before:w-[180px] before:-translate-x-1/2 before:rounded-[50%_50%_0_0] before:border before:border-[rgba(23,63,42,0.25)] before:content-[''] after:absolute after:top-[100px] after:left-1/2 after:h-10 after:w-20 after:-translate-x-1/2 after:rotate-[25deg] after:rounded-[100%_0_100%_0] after:bg-[rgba(23,63,42,0.22)] after:shadow-[55px_35px_0_rgba(23,63,42,0.18),-45px_65px_0_rgba(23,63,42,0.14)] after:content-[''] hover:shadow-[var(--shadow-soft)] hover:[transform:translateY(-5px)] max-[900px]:min-h-[360px]"
          >
            <span className="relative z-[2] text-[0.6rem] font-bold tracking-[0.13em] text-[var(--botanical)] uppercase">Guide 02</span>
            <h3 className="relative z-[2] my-2 [color:var(--forest)] [font-family:var(--font-display)] text-[clamp(2rem,2.8vw,3rem)] leading-[0.98] font-normal tracking-[-0.045em]">How to find the right paste texture</h3>
            <p className="relative z-[2] mt-0 mb-4 text-[0.78rem] text-[var(--muted)]">Water, patience and a smooth first mix.</p>
            <i className="relative z-[2] text-[0.6rem] font-bold not-italic tracking-[0.13em] text-[var(--botanical)] uppercase">Read guide ↗</i>
          </Link>
          <Link
            href="/shop/indigo-powder"
            className="relative flex min-h-[430px] flex-col justify-end overflow-hidden bg-[#c9cedc] p-[30px] [transition:transform_450ms_var(--ease),box-shadow_450ms_var(--ease)] motion-reduce:transition-none before:absolute before:top-[50px] before:left-1/2 before:h-[180px] before:w-[180px] before:-translate-x-1/2 before:rounded-[50%_50%_0_0] before:border before:border-[rgba(23,63,42,0.25)] before:content-[''] after:absolute after:top-[100px] after:left-1/2 after:h-10 after:w-20 after:-translate-x-1/2 after:rotate-[25deg] after:rounded-[100%_0_100%_0] after:bg-[rgba(23,63,42,0.22)] after:shadow-[55px_35px_0_rgba(23,63,42,0.18),-45px_65px_0_rgba(23,63,42,0.14)] after:content-[''] hover:shadow-[var(--shadow-soft)] hover:[transform:translateY(-5px)] max-[900px]:min-h-[360px]"
          >
            <span className="relative z-[2] text-[0.6rem] font-bold tracking-[0.13em] text-[var(--botanical)] uppercase">Safety note</span>
            <h3 className="relative z-[2] my-2 [color:var(--forest)] [font-family:var(--font-display)] text-[clamp(2rem,2.8vw,3rem)] leading-[0.98] font-normal tracking-[-0.045em]">Indigo starts with a strand test</h3>
            <p className="relative z-[2] mt-0 mb-4 text-[0.78rem] text-[var(--muted)]">Understand the variables before you colour.</p>
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
            className="m-0 [color:var(--forest)] [font-family:var(--font-display)] text-[clamp(3.25rem,4.5vw,5rem)] leading-[0.94] font-normal tracking-[-0.055em] max-[680px]:text-[clamp(2.9rem,13vw,4rem)]"
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
