import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { RitualFinder } from "@/features/rituals/ritual-finder";

const ritualImage = "/images/naturemist-ritual.png";
const ritualPathClass =
  "group flex min-h-[340px] flex-col bg-[var(--paper)] p-[26px] transition-[background-color,color] duration-[350ms] hover:bg-[var(--forest)] hover:text-[var(--paper)] max-[680px]:min-h-[290px]";
const ritualPathTitleClass =
  "mb-2 mt-auto font-serif text-[2.6rem] font-normal text-[var(--forest)] transition-colors duration-[350ms] group-hover:text-[var(--paper)]";
const ritualPathCopyClass =
  "m-0 min-h-[50px] text-[0.76rem] text-[var(--muted)] transition-colors duration-[350ms] group-hover:text-[var(--paper)]";
const ritualPathLinkClass =
  "mt-[22px] text-[0.63rem] not-italic uppercase tracking-[0.1em] text-[var(--botanical)]";

export const metadata: Metadata = {
  title: "Build Your Botanical Ritual",
  description:
    "Choose a NatureMist botanical starting point and learn how to scoop, mix, apply, patch test and care for your ritual.",
  alternates: { canonical: "/rituals" },
};

export default function RitualsPage() {
  return (
    <main id="main-content">
      <section className="grid min-h-[430px] items-end bg-[linear-gradient(90deg,rgba(247,244,232,0.97),rgba(247,244,232,0.55)),repeating-radial-gradient(ellipse_at_82%_45%,rgba(63,125,58,0.12)_0_12px,transparent_13px_32px),var(--ivory-deep)] px-[clamp(25px,7vw,110px)] pb-[70px] pt-[95px] max-[680px]:min-h-[360px] max-[680px]:px-5 max-[680px]:pb-[55px] max-[680px]:pt-[75px]">
        <div className="max-w-[820px]">
          <p className="mb-4 text-[0.68rem] font-bold uppercase leading-[1.3] tracking-[0.2em] text-[var(--botanical)]">The ritual room</p>
          <h1 className="m-0 font-serif text-[clamp(3.2rem,5vw,6.5rem)] font-normal leading-[0.96] tracking-[-0.055em] text-[var(--forest)] max-[680px]:text-[clamp(3rem,15vw,4.8rem)]">Ancient care,<br />made clear.</h1>
          <p className="mb-0 mt-7 max-w-[620px] text-base text-[var(--muted)]">A calm guide to choosing, preparing and understanding single-botanical powders.</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-none grid-cols-[0.72fr_1.28fr] gap-[clamp(50px,8vw,120px)] bg-[var(--forest)] px-[clamp(25px,6vw,96px)] py-[clamp(80px,9vw,140px)] text-[var(--paper)] max-[900px]:grid-cols-1 max-[680px]:px-5 max-[680px]:py-[78px]" aria-labelledby="page-builder-title">
        <div className="max-[900px]:max-w-[680px]">
          <p className="mb-4 text-[0.68rem] font-bold uppercase leading-[1.3] tracking-[0.2em] text-[#c8d88e]">Find your starting point</p>
          <h2 className="m-0 font-serif text-[clamp(3rem,4.7vw,5.6rem)] font-normal leading-[0.95] tracking-[-0.055em] max-[680px]:text-[3.45rem]" id="page-builder-title">Begin with how your hair feels today.</h2>
          <p className="mb-0 mt-7 max-w-[490px] text-white/65">Two thoughtful questions, one simple suggestion. No diagnosis, no permanent profile and no miracle promise.</p>
        </div>
        <RitualFinder />
      </section>

      <section className="mx-auto grid w-full max-w-[1500px] grid-cols-[0.82fr_1.18fr] items-center gap-[clamp(55px,8vw,120px)] px-[clamp(25px,6vw,96px)] py-[clamp(92px,10vw,155px)] max-[900px]:grid-cols-1 max-[680px]:px-5 max-[680px]:py-[85px]">
        <div className="relative min-h-[680px] overflow-hidden rounded-[50%_50%_0_0/16%_16%_0_0] max-[900px]:min-h-[600px] max-[680px]:min-h-[490px]">
          <Image src={ritualImage} alt="A fresh amla paste being mixed in a ceramic bowl" fill sizes="(max-width: 800px) 90vw, 42vw" className="object-cover" />
        </div>
        <div>
          <p className="mb-4 text-[0.68rem] font-bold uppercase leading-[1.3] tracking-[0.2em] text-[var(--botanical)]">The foundational rhythm</p>
          <h2 className="mb-[35px] mt-0 font-serif text-[clamp(3.2rem,5vw,6rem)] font-normal leading-[0.94] tracking-[-0.055em] text-[var(--forest)]">Scoop slowly. Mix gradually. Apply with care.</h2>
          <ol className="m-0 list-none border-t border-[var(--line)] p-0">
            <li className="grid grid-cols-[35px_1fr] gap-5 border-b border-[var(--line)] py-5"><span className="text-[0.6rem] text-[var(--botanical)]">01</span><div><h3 className="m-0 font-serif text-[1.35rem] font-normal text-[var(--forest)]">Prepare a clean, dry bowl</h3><p className="mb-0 mt-1 text-[0.76rem] text-[var(--muted)]">Keep water out of the jar and scoop only what you need for one fresh ritual.</p></div></li>
            <li className="grid grid-cols-[35px_1fr] gap-5 border-b border-[var(--line)] py-5"><span className="text-[0.6rem] text-[var(--botanical)]">02</span><div><h3 className="m-0 font-serif text-[1.35rem] font-normal text-[var(--forest)]">Add liquid a little at a time</h3><p className="mb-0 mt-1 text-[0.76rem] text-[var(--muted)]">A smooth, spreadable texture is easier to apply than a rushed, lumpy mix.</p></div></li>
            <li className="grid grid-cols-[35px_1fr] gap-5 border-b border-[var(--line)] py-5"><span className="text-[0.6rem] text-[var(--botanical)]">03</span><div><h3 className="m-0 font-serif text-[1.35rem] font-normal text-[var(--forest)]">Follow the botanical-specific timing</h3><p className="mb-0 mt-1 text-[0.76rem] text-[var(--muted)]">Reetha, a conditioning mask and Indigo colour do not share one universal recipe.</p></div></li>
            <li className="grid grid-cols-[35px_1fr] gap-5 border-b border-[var(--line)] py-5"><span className="text-[0.6rem] text-[var(--botanical)]">04</span><div><h3 className="m-0 font-serif text-[1.35rem] font-normal text-[var(--forest)]">Rinse thoroughly and observe</h3><p className="mb-0 mt-1 text-[0.76rem] text-[var(--muted)]">Notice how your hair feels before changing ratios or adding another botanical.</p></div></li>
          </ol>
        </div>
      </section>

      <section className="grid grid-cols-[1fr_0.8fr] gap-[8vw] bg-[#26345c] px-[clamp(25px,7vw,110px)] py-[75px] text-[var(--paper)] max-[900px]:grid-cols-1 max-[680px]:px-5 max-[680px]:py-[65px]">
        <div><p className="mb-4 text-[0.68rem] font-bold uppercase leading-[1.3] tracking-[0.2em] text-[#c8d88e]">Care before colour</p><h2 className="m-0 max-w-[700px] font-serif text-[clamp(3rem,4.5vw,5rem)] font-normal leading-[0.95] tracking-[-0.05em]">Patch test. Strand test. Read every direction.</h2></div>
        <p className="max-w-[600px] self-end text-white/68">Natural does not mean risk-free. Avoid eyes, inhalation and broken skin; stop use if irritation occurs. Indigo and pigmented botanicals require extra care on grey, blonde, bleached, porous or colour-treated hair.</p>
      </section>

      <section className="mx-auto w-full max-w-[1500px] px-[clamp(25px,6vw,96px)] py-[clamp(92px,10vw,155px)] max-[680px]:px-5 max-[680px]:py-[85px]">
        <div className="mx-auto mb-[clamp(50px,6vw,85px)] max-w-[840px] text-center max-[680px]:mb-[45px]">
          <p className="mb-4 text-[0.68rem] font-bold uppercase leading-[1.3] tracking-[0.2em] text-[var(--botanical)]">Explore by purpose</p>
          <h2 className="m-0 font-serif text-[clamp(3.2rem,5vw,6.5rem)] font-normal leading-[0.96] tracking-[-0.055em] text-[var(--forest)] max-[680px]:text-[clamp(3rem,15vw,4.8rem)]">Choose a path through the cabinet.</h2>
        </div>
        <div className="grid grid-cols-4 gap-px bg-[var(--line)] max-[900px]:grid-cols-2 max-[680px]:grid-cols-1">
          <Link className={ritualPathClass} href="/shop?goal=Cleanse"><span className="text-[0.6rem] text-[var(--botanical)]">01</span><h3 className={ritualPathTitleClass}>Cleanse</h3><p className={ritualPathCopyClass}>Reetha and Shikakai, compared with care.</p><i className={ritualPathLinkClass}>Explore â†—</i></Link>
          <Link className={ritualPathClass} href="/shop?goal=Softness+%2B+Shine"><span className="text-[0.6rem] text-[var(--botanical)]">02</span><h3 className={ritualPathTitleClass}>Condition</h3><p className={ritualPathCopyClass}>Amla and Hibiscus for softness-focused masks.</p><i className={ritualPathLinkClass}>Explore â†—</i></Link>
          <Link className={ritualPathClass} href="/shop?goal=Scalp+Ritual"><span className="text-[0.6rem] text-[var(--botanical)]">03</span><h3 className={ritualPathTitleClass}>Ground</h3><p className={ritualPathCopyClass}>Bhringraj and Amla for scalp-to-length rituals.</p><i className={ritualPathLinkClass}>Explore â†—</i></Link>
          <Link className={ritualPathClass} href="/shop?goal=Botanical+Colour"><span className="text-[0.6rem] text-[var(--botanical)]">04</span><h3 className={ritualPathTitleClass}>Colour</h3><p className={ritualPathCopyClass}>Indigo guidance with honest variables and safety.</p><i className={ritualPathLinkClass}>Explore â†—</i></Link>
        </div>
      </section>
    </main>
  );
}
