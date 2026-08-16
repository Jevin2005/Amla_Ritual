import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

const heroImage = "/images/naturemist-hero.png";
const storyPillarClass =
  "min-h-[440px] bg-[var(--paper)] p-[38px] max-[900px]:min-h-[310px] max-[680px]:px-5 max-[680px]:py-7";
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
            sizes="100vw"
            fetchPriority="high"
            className="object-cover max-[680px]:object-[64%_center]"
          />
        </div>
        <div className="relative z-2 flex min-h-[inherit] flex-col justify-center px-[7vw] py-[100px] text-[var(--paper)] max-[680px]:px-5 max-[680px]:py-20">
          <p className="mb-4 text-[0.68rem] font-bold uppercase leading-[1.3] tracking-[0.2em] text-[#c8d88e]">
            The NatureMist philosophy
          </p>
          <h1 className="m-0 max-w-[950px] font-serif text-[clamp(4.5rem,8vw,9rem)] font-normal leading-[0.82] tracking-[-0.065em] max-[680px]:text-[clamp(4rem,19vw,6rem)]">
            Rooted in Ayurveda.<br />
            <em className="font-normal text-[#d8e6af]">Made for modern rituals.</em>
          </h1>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-[1500px] grid-cols-[0.4fr_1.6fr] gap-[7vw] px-[clamp(25px,6vw,96px)] py-[clamp(92px,10vw,155px)] max-[900px]:grid-cols-1 max-[680px]:gap-[30px] max-[680px]:px-5 max-[680px]:py-[85px]">
        <p className="mb-4 text-[0.68rem] font-bold uppercase leading-[1.3] tracking-[0.2em] text-[var(--botanical)]">
          Where we begin
        </p>
        <div>
          <h2 className="m-0 max-w-[900px] font-serif text-[clamp(3.6rem,6vw,7rem)] font-normal leading-[0.92] tracking-[-0.06em] text-[var(--forest)]">
            Tradition is most powerful when it can be understood.
          </h2>
          <p className="mb-0 ml-auto mt-8 max-w-[650px] text-[1.05rem] leading-[1.8] text-[var(--muted)]">
            NatureMist was imagined as a quieter kind of beauty brand—one that honours Indian ritual knowledge while giving the modern customer the clarity to prepare, combine and use botanicals with confidence.
          </p>
        </div>
      </section>

      <section className="mx-auto mb-[130px] grid max-w-[1500px] grid-cols-3 gap-px bg-[var(--line)] max-[900px]:grid-cols-1 max-[680px]:mb-20">
        <article className={storyPillarClass}>
          <span className="text-[0.62rem] text-[var(--botanical)]">01</span>
          <h2 className={storyPillarTitleClass}>Name what is inside.</h2>
          <p className="text-[0.8rem] text-[var(--muted)]">
            The botanical, the plant part, the batch and the way to use it belong in plain sight—not behind inflated language.
          </p>
        </article>
        <article className={storyPillarClass}>
          <span className="text-[0.62rem] text-[var(--botanical)]">02</span>
          <h2 className={storyPillarTitleClass}>Teach before selling.</h2>
          <p className="text-[0.8rem] text-[var(--muted)]">
            Beginners deserve practical preparation and safety guidance. Familiar users deserve the same precision.
          </p>
        </article>
        <article className={storyPillarClass}>
          <span className="text-[0.62rem] text-[var(--botanical)]">03</span>
          <h2 className={storyPillarTitleClass}>Let the ritual stay beautiful.</h2>
          <p className="text-[0.8rem] text-[var(--muted)]">
            Care can be effective, tactile and deeply desirable without becoming loud, rushed or excessive.
          </p>
        </article>
      </section>

      <section className="grid min-h-[580px] grid-cols-[1fr_0.85fr] items-center gap-[8vw] bg-[var(--forest-dark)] px-[clamp(25px,7vw,110px)] py-[85px] text-[var(--paper)] max-[900px]:grid-cols-1 max-[680px]:px-5 max-[680px]:py-[75px]">
        <p className="m-0 font-serif text-[clamp(4rem,7vw,8rem)] leading-[0.82] tracking-[-0.06em] max-[680px]:text-[clamp(4rem,18vw,6rem)]">
          “One ingredient.<br />Nothing unnecessary.”
        </p>
        <div>
          <h2 className="m-0 font-serif text-5xl font-normal">From nature to your ritual.</h2>
          <p className="text-white/60">
            Final sourcing, processing and certification details will be published only when verified for each batch and pack. That standard of restraint is part of the brand.
          </p>
          <Link
            className="mt-[18px] inline-flex min-h-[50px] items-center justify-center gap-[22px] border border-transparent bg-[var(--paper)] px-6 py-[13px] text-[0.72rem] font-bold uppercase leading-none tracking-[0.12em] text-[var(--forest)] transition-[transform,background-color,color,border-color] duration-[350ms] ease-[var(--ease)] hover:-translate-y-0.5 hover:bg-[var(--amla)]"
            href="/shop"
          >
            Meet the botanicals ↗
          </Link>
        </div>
      </section>
    </main>
  );
}
