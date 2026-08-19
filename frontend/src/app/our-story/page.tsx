import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

const heroImage = "/images/naturemist-hero.png";
const storyPillarClass =
  "min-h-[440px] bg-[var(--paper)] p-[38px] transition-[transform,background-color] duration-500 ease-[var(--ease)] hover:-translate-y-1 hover:bg-white max-[900px]:min-h-[310px] max-[680px]:px-5 max-[680px]:py-7";
const storyPillarTitleClass =
  "mb-5 mt-[180px] font-serif text-[2.8rem] font-normal leading-[0.95] tracking-[-0.05em] text-[var(--forest)] max-[900px]:mt-[100px]";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "NatureMist brings time-honoured Indian botanicals into clear, considered and modern beauty rituals.",
  alternates: { canonical: "/our-story" },
};

export default function OurStoryPage() {
  return (
    <main id="main-content">
      <section className="relative min-h-[min(820px,calc(100svh-40px))] overflow-hidden max-[680px]:min-h-[700px]">
        <div className="absolute inset-0 after:absolute after:inset-0 after:bg-[linear-gradient(90deg,rgba(11,38,23,0.78),rgba(11,38,23,0.12)_65%)] after:content-['']">
          <Image
            src={heroImage}
            alt="Indian woman with naturally long dark hair in a sunlit botanical setting"
            fill
            loading="eager"
            sizes="100vw"
            fetchPriority="high"
            className="object-cover max-[680px]:object-[64%_center]"
          />
        </div>
        <div className="relative z-2 flex min-h-[inherit] flex-col justify-center py-[100px] text-[var(--paper)] max-[680px]:py-20">
          <div className="mx-auto w-full max-w-[1440px] px-[clamp(24px,5vw,72px)] max-[680px]:px-5">
            <p className="mb-4 text-[0.68rem] font-bold uppercase leading-[1.3] tracking-[0.2em] text-[#c8d88e]">
              The NatureMist philosophy
            </p>
            <h1 className="m-0 max-w-[11ch] font-serif text-[clamp(4.25rem,7vw,8rem)] font-normal leading-[0.84] tracking-[-0.065em] text-balance max-[680px]:text-[clamp(3.6rem,17vw,5.5rem)]">
              Rooted in Ayurveda.<br />
              <em className="font-normal text-[#d8e6af]">Made for modern rituals.</em>
            </h1>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-[1440px] grid-cols-[0.4fr_1.6fr] gap-[clamp(48px,7vw,96px)] px-[clamp(24px,5vw,72px)] py-[clamp(84px,9vw,140px)] max-[900px]:grid-cols-1 max-[680px]:gap-[30px] max-[680px]:px-5 max-[680px]:py-[75px]">
        <p className="mb-4 text-[0.68rem] font-bold uppercase leading-[1.3] tracking-[0.2em] text-[var(--botanical)]">
          Where we begin
        </p>
        <div>
          <h2 className="m-0 max-w-[900px] font-serif text-[clamp(3.4rem,5.5vw,6.5rem)] font-normal leading-[0.92] tracking-[-0.06em] text-[var(--forest)] text-balance">
            Tradition is most powerful when it can be understood.
          </h2>
          <p className="mb-0 ml-auto mt-8 max-w-[650px] text-[1.05rem] leading-[1.8] text-[var(--muted)]">
            NatureMist was imagined as a quieter kind of beauty brand—one that honours Indian ritual knowledge while giving the modern customer the clarity to prepare, combine and use botanicals with confidence.
          </p>
        </div>
      </section>

      <section className="mb-[130px] px-[clamp(24px,5vw,72px)] max-[680px]:mb-20 max-[680px]:px-5">
        <div className="mx-auto grid w-full max-w-[1296px] grid-cols-3 gap-px overflow-hidden rounded-[var(--radius-lg)] bg-[var(--line)] shadow-[var(--shadow-soft)] ring-1 ring-[var(--line)] max-[900px]:grid-cols-1 max-[680px]:rounded-[var(--radius-md)]">
          <article className={storyPillarClass}>
          <span className="text-[0.62rem] text-[var(--botanical)]">01</span>
          <h2 className={storyPillarTitleClass}>Name what is inside.</h2>
          <p className="text-[0.84rem] leading-[1.75] text-[var(--muted)]">
            The botanical, the plant part, the batch and the way to use it belong in plain sight—not behind inflated language.
          </p>
          </article>
          <article className={storyPillarClass}>
          <span className="text-[0.62rem] text-[var(--botanical)]">02</span>
          <h2 className={storyPillarTitleClass}>Teach before selling.</h2>
          <p className="text-[0.84rem] leading-[1.75] text-[var(--muted)]">
            Beginners deserve practical preparation and safety guidance. Familiar users deserve the same precision.
          </p>
          </article>
          <article className={storyPillarClass}>
          <span className="text-[0.62rem] text-[var(--botanical)]">03</span>
          <h2 className={storyPillarTitleClass}>Let the ritual stay beautiful.</h2>
          <p className="text-[0.84rem] leading-[1.75] text-[var(--muted)]">
            Care can be effective, tactile and deeply desirable without becoming loud, rushed or excessive.
          </p>
          </article>
        </div>
      </section>

      <section className="bg-[var(--forest-dark)] text-[var(--paper)]">
        <div className="mx-auto grid min-h-[580px] w-full max-w-[1440px] grid-cols-[1fr_0.85fr] items-center gap-[clamp(52px,7vw,100px)] px-[clamp(24px,5vw,72px)] py-[85px] max-[900px]:grid-cols-1 max-[680px]:min-h-0 max-[680px]:px-5 max-[680px]:py-[72px]">
        <p className="m-0 max-w-[10ch] font-serif text-[clamp(3.8rem,6vw,7rem)] leading-[0.84] tracking-[-0.06em] text-balance max-[680px]:text-[clamp(3.5rem,16vw,5.25rem)]">
          “One ingredient.<br />Nothing unnecessary.”
        </p>
        <div>
          <h2 className="m-0 max-w-[12ch] font-serif text-[clamp(2.7rem,4vw,3.5rem)] font-normal leading-[0.96] text-balance">From nature to your ritual.</h2>
          <p className="max-w-[580px] leading-[1.75] text-white/60">
            Final sourcing, processing and certification details will be published only when verified for each batch and pack. That standard of restraint is part of the brand.
          </p>
          <Link
            className="mt-[18px] inline-flex min-h-[52px] items-center justify-center gap-[14px] rounded-full border border-transparent bg-[var(--paper)] px-6 py-[13px] text-[0.72rem] font-bold uppercase leading-none tracking-[0.12em] text-[var(--forest)] shadow-[0_10px_26px_rgba(0,0,0,0.18)] transition-[transform,background-color,color,border-color] duration-[350ms] ease-[var(--ease)] hover:-translate-y-0.5 hover:bg-[var(--amla)]"
            href="/shop"
          >
            Meet the botanicals ↗
          </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
