import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { RitualFinder } from "@/features/rituals/ritual-finder";

const ritualImage = "/images/naturemist-ritual.png";

export const metadata: Metadata = {
  title: "Build Your Botanical Ritual",
  description:
    "Choose a NatureMist botanical starting point and learn how to scoop, mix, apply, patch test and care for your ritual.",
  alternates: { canonical: "/rituals" },
};

export default function RitualsPage() {
  return (
    <main id="main-content">
      <section className="page-hero rituals-page-hero">
        <div className="page-hero__inner">
          <p className="eyebrow">The ritual room</p>
          <h1>Ancient care,<br />made clear.</h1>
          <p>A calm guide to choosing, preparing and understanding single-botanical powders.</p>
        </div>
      </section>

      <section className="ritual-builder-section ritual-builder-section--page" aria-labelledby="page-builder-title">
        <div className="ritual-builder-section__intro">
          <p className="eyebrow eyebrow--light">Find your starting point</p>
          <h2 id="page-builder-title">Begin with how your hair feels today.</h2>
          <p>Two thoughtful questions, one simple suggestion. No diagnosis, no permanent profile and no miracle promise.</p>
        </div>
        <RitualFinder />
      </section>

      <section className="ritual-guide section">
        <div className="ritual-guide__image">
          <Image src={ritualImage} alt="A fresh amla paste being mixed in a ceramic bowl" fill sizes="(max-width: 800px) 90vw, 42vw" className="cover-image" />
        </div>
        <div className="ritual-guide__copy">
          <p className="eyebrow">The foundational rhythm</p>
          <h2>Scoop slowly. Mix gradually. Apply with care.</h2>
          <ol>
            <li><span>01</span><div><h3>Prepare a clean, dry bowl</h3><p>Keep water out of the jar and scoop only what you need for one fresh ritual.</p></div></li>
            <li><span>02</span><div><h3>Add liquid a little at a time</h3><p>A smooth, spreadable texture is easier to apply than a rushed, lumpy mix.</p></div></li>
            <li><span>03</span><div><h3>Follow the botanical-specific timing</h3><p>Reetha, a conditioning mask and Indigo colour do not share one universal recipe.</p></div></li>
            <li><span>04</span><div><h3>Rinse thoroughly and observe</h3><p>Notice how your hair feels before changing ratios or adding another botanical.</p></div></li>
          </ol>
        </div>
      </section>

      <section className="safety-band">
        <div><p className="eyebrow eyebrow--light">Care before colour</p><h2>Patch test. Strand test. Read every direction.</h2></div>
        <p>Natural does not mean risk-free. Avoid eyes, inhalation and broken skin; stop use if irritation occurs. Indigo and pigmented botanicals require extra care on grey, blonde, bleached, porous or colour-treated hair.</p>
      </section>

      <section className="section ritual-paths">
        <div className="section-heading section-heading--center">
          <p className="eyebrow">Explore by purpose</p>
          <h2>Choose a path through the cabinet.</h2>
        </div>
        <div className="ritual-path-grid">
          <Link href="/shop?goal=Cleanse"><span>01</span><h3>Cleanse</h3><p>Reetha and Shikakai, compared with care.</p><i>Explore â†—</i></Link>
          <Link href="/shop?goal=Softness+%2B+Shine"><span>02</span><h3>Condition</h3><p>Amla and Hibiscus for softness-focused masks.</p><i>Explore â†—</i></Link>
          <Link href="/shop?goal=Scalp+Ritual"><span>03</span><h3>Ground</h3><p>Bhringraj and Amla for scalp-to-length rituals.</p><i>Explore â†—</i></Link>
          <Link href="/shop?goal=Botanical+Colour"><span>04</span><h3>Colour</h3><p>Indigo guidance with honest variables and safety.</p><i>Explore â†—</i></Link>
        </div>
      </section>
    </main>
  );
}
