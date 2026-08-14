import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import heroImage from "@/public/images/naturemist-hero.png";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "NatureMist brings time-honoured Indian botanicals into clear, considered and modern beauty rituals.",
  alternates: { canonical: "/our-story" },
};

export default function OurStoryPage() {
  return (
    <main id="main-content">
      <section className="story-hero">
        <div className="story-hero__image"><Image src={heroImage} alt="Indian woman with naturally long dark hair in a sunlit botanical setting" fill sizes="100vw" fetchPriority="high" className="cover-image" /></div>
        <div className="story-hero__copy"><p className="eyebrow eyebrow--light">The NatureMist philosophy</p><h1>Rooted in Ayurveda.<br /><em>Made for modern rituals.</em></h1></div>
      </section>
      <section className="story-intro section">
        <p className="eyebrow">Where we begin</p>
        <div><h2>Tradition is most powerful when it can be understood.</h2><p>NatureMist was imagined as a quieter kind of beauty brand—one that honours Indian ritual knowledge while giving the modern customer the clarity to prepare, combine and use botanicals with confidence.</p></div>
      </section>
      <section className="story-pillars">
        <article><span>01</span><h2>Name what is inside.</h2><p>The botanical, the plant part, the batch and the way to use it belong in plain sight—not behind inflated language.</p></article>
        <article><span>02</span><h2>Teach before selling.</h2><p>Beginners deserve practical preparation and safety guidance. Familiar users deserve the same precision.</p></article>
        <article><span>03</span><h2>Let the ritual stay beautiful.</h2><p>Care can be effective, tactile and deeply desirable without becoming loud, rushed or excessive.</p></article>
      </section>
      <section className="story-manifesto">
        <p>“One ingredient.<br />Nothing unnecessary.”</p>
        <div><h2>From nature to your ritual.</h2><p>Final sourcing, processing and certification details will be published only when verified for each batch and pack. That standard of restraint is part of the brand.</p><Link className="button button--light" href="/shop">Meet the botanicals ↗</Link></div>
      </section>
    </main>
  );
}

