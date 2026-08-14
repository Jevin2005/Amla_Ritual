import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import heroImage from "@/public/images/naturemist-hero.png";
import ritualImage from "@/public/images/naturemist-ritual.png";
import { ProductCard } from "@/components/product-card";
import { ProductJar } from "@/components/product-jar";
import {
  BundleCards,
  FeaturedProductSwitcher,
  HeroPurchase,
  RitualFinder,
} from "@/components/home-interactions";
import { products } from "@/lib/products";

const amla = products[0];

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const ritualCards = [
  {
    number: "01",
    title: "Cleanse",
    copy: "Low-lather botanicals for a considered wash-day reset.",
    href: "/shop?goal=Cleanse",
    className: "ritual-card--cleanse",
  },
  {
    number: "02",
    title: "Nourish",
    copy: "Grounding masks for cared-for scalp and lengths.",
    href: "/shop?goal=Scalp+Ritual",
    className: "ritual-card--nourish",
  },
  {
    number: "03",
    title: "Softness + shine",
    copy: "Conditioning powders for smooth, luminous-looking hair.",
    href: "/shop?goal=Softness+%2B+Shine",
    className: "ritual-card--shine",
  },
  {
    number: "04",
    title: "Botanical colour",
    copy: "Carefully explained leaf colour, with safety first.",
    href: "/shop?goal=Botanical+Colour",
    className: "ritual-card--colour",
  },
];

const faqs = [
  {
    question: "What does single-botanical mean?",
    answer:
      "Each jar is designed around one clearly named plant powder. Final pack labels will confirm the botanical identity, plant part, net weight and batch information before launch.",
  },
  {
    question: "Which powder is best for a beginner?",
    answer:
      "Amla or Shikakai can be approachable starting points. Choose by ritual goal, introduce one botanical at a time, and always follow the final pack directions.",
  },
  {
    question: "Can I combine NatureMist powders?",
    answer:
      "Yes, many traditional rituals use complementary powders. Start simply, keep notes on how your hair feels and follow the safety guidance for every ingredient in the blend.",
  },
  {
    question: "Can I use the powders on colour-treated or very light hair?",
    answer:
      "Natural pigments can interact with grey, blonde, bleached, porous or chemically coloured hair. Patch and strand test first, particularly with Amla, Hibiscus and Indigo.",
  },
  {
    question: "Will Indigo make hair black?",
    answer:
      "Indigo alone does not guarantee black hair and may appear blue or green on light or grey hair. Darker tones commonly require a properly designed henna-led or two-step ritual.",
  },
  {
    question: "How should I store an opened jar?",
    answer:
      "Keep it tightly closed in a cool, dry place away from direct light. Always use a clean, dry spoon and never introduce water into the jar.",
  },
];

export default function Home() {
  return (
    <main id="main-content">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero__image" aria-hidden="true">
          <Image
            src={heroImage}
            alt=""
            fill
            sizes="100vw"
            fetchPriority="high"
            className="hero__photo"
          />
          <span className="hero__image-shade" />
        </div>
        <div className="hero__botanical hero__botanical--one" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </div>
        <div className="hero__content">
          <p className="eyebrow">The Amla Ritual · No. 01</p>
          <h1 id="hero-title">
            Pure amla.
            <span>Powerful ritual.</span>
          </h1>
          <p className="hero__lede">
            One storied botanical, thoughtfully prepared for soft-feeling,
            luminous-looking hair—and an unhurried moment of care.
          </p>
          <HeroPurchase />
          <ul className="hero__trust" aria-label="NatureMist principles">
            <li><span>01</span> Single botanical</li>
            <li><span>02</span> Clearly explained</li>
            <li><span>03</span> Made for home rituals</li>
          </ul>
        </div>
        <div className="hero__product">
          <p>NatureMist / Ritual 01</p>
          <ProductJar product={amla} size="hero" />
          <span className="hero__product-note">Packaging preview</span>
        </div>
        <div className="hero__scroll" aria-hidden="true">
          <span />
          Scroll to discover
        </div>
      </section>

      <section className="hero-details" id="amla-ritual" aria-label="Amla product details">
        <details>
          <summary>Why you’ll love it <span>＋</span></summary>
          <p>{amla.shortDescription}</p>
        </details>
        <details>
          <summary>How to use <span>＋</span></summary>
          <p>Mix gradually with water until smooth, apply in sections and follow the final pack timing before rinsing thoroughly.</p>
        </details>
        <details>
          <summary>Ingredient details <span>＋</span></summary>
          <p>{amla.ingredient}</p>
        </details>
      </section>

      <section className="section collection-section reveal" aria-labelledby="collection-title">
        <div className="section-heading section-heading--split">
          <div>
            <p className="eyebrow">The botanical cabinet</p>
            <h2 id="collection-title">Shop the herbal collection.</h2>
          </div>
          <div>
            <p>Six single botanicals. Six distinct rituals. One calm, considered way to begin.</p>
            <Link className="text-link" href="/shop">View all botanicals <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
        <div className="product-scroll" aria-label="NatureMist botanical collection">
          {products.map((product) => (
            <ProductCard product={product} key={product.slug} />
          ))}
        </div>
        <p className="commercial-note commercial-note--section">
          Product jars and prices are editable launch previews. Final labels, net weights, batch data and commercial terms will replace them before sale.
        </p>
      </section>

      <section className="section ritual-choices reveal" aria-labelledby="choose-title">
        <div className="section-heading section-heading--center">
          <p className="eyebrow">Begin with how you want to feel</p>
          <h2 id="choose-title">Choose your ritual.</h2>
          <p>Traditional ingredients become easier when the purpose is clear.</p>
        </div>
        <div className="ritual-card-grid">
          {ritualCards.map((ritual) => (
            <Link className={`ritual-card ${ritual.className}`} href={ritual.href} key={ritual.title}>
              <span className="ritual-card__number">{ritual.number}</span>
              <span className="ritual-card__motif" aria-hidden="true"><i /><i /><i /></span>
              <h3>{ritual.title}</h3>
              <p>{ritual.copy}</p>
              <span className="ritual-card__link">Explore <i aria-hidden="true">↗</i></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="ritual-builder-section reveal" aria-labelledby="builder-title">
        <div className="ritual-builder-section__intro">
          <p className="eyebrow eyebrow--light">Build your ritual</p>
          <h2 id="builder-title">A botanical starting point, chosen with care.</h2>
          <p>
            Tell us your ritual goal and how your hair feels today. We’ll suggest a simple place to begin—never a diagnosis or a promise.
          </p>
        </div>
        <RitualFinder />
      </section>

      <section className="section preparation-section reveal" aria-labelledby="prepare-title">
        <div className="section-heading section-heading--split">
          <div>
            <p className="eyebrow">The art of preparation</p>
            <h2 id="prepare-title">Three steps. One unhurried ritual.</h2>
          </div>
          <p>Every powder has its own directions. The rhythm, however, stays beautifully simple.</p>
        </div>
        <div className="preparation-grid">
          <article>
            <span className="preparation-grid__number">01</span>
            <span className="preparation-grid__icon scoop-icon" aria-hidden="true"><i /></span>
            <h3>Scoop</h3>
            <p>Begin with enough botanical powder for your hair length.</p>
          </article>
          <article>
            <span className="preparation-grid__number">02</span>
            <span className="preparation-grid__icon bowl-icon" aria-hidden="true"><i /></span>
            <h3>Mix</h3>
            <p>Add water gradually until the texture is smooth and spreadable.</p>
          </article>
          <article>
            <span className="preparation-grid__number">03</span>
            <span className="preparation-grid__icon apply-icon" aria-hidden="true"><i /></span>
            <h3>Apply</h3>
            <p>Follow the botanical-specific directions, then rinse thoroughly.</p>
          </article>
        </div>
      </section>

      <section className="ingredient-story reveal" id="ingredient-standards" aria-labelledby="purity-title">
        <div className="ingredient-story__image">
          <div className="arched-image">
            <Image
              src={ritualImage}
              alt="A hand slowly mixing a fresh green amla paste in a ceramic bowl beside amla fruit"
              fill
              sizes="(max-width: 800px) 90vw, 45vw"
              className="cover-image"
            />
          </div>
          <span className="ingredient-story__caption">Amla ritual · prepared fresh</span>
        </div>
        <div className="ingredient-story__copy">
          <p className="eyebrow">Ingredient clarity</p>
          <h2 id="purity-title">One ingredient. Nothing hidden.</h2>
          <p className="lead">
            NatureMist translates a time-honoured practice into a ritual you can understand from first scoop to final rinse.
          </p>
          <div className="standard-list">
            <article>
              <span>01</span>
              <div><h3>Name the botanical</h3><p>Common name, botanical identity and plant part—clearly stated on the final pack.</p></div>
            </article>
            <article>
              <span>02</span>
              <div><h3>Explain the ritual</h3><p>Preparation, pairing and safety guidance written for beginners as well as familiar users.</p></div>
            </article>
            <article>
              <span>03</span>
              <div><h3>Keep claims honest</h3><p>Thoughtful cosmetic language without miracle promises or invented proof.</p></div>
            </article>
          </div>
          <Link className="button button--outline" href="/our-story">Read our philosophy <span aria-hidden="true">↗</span></Link>
        </div>
      </section>

      <section className="section family-section reveal" aria-labelledby="family-title">
        <div className="section-heading section-heading--center">
          <p className="eyebrow">A family of six</p>
          <h2 id="family-title">Same ritual language. A different botanical note.</h2>
          <p>Move through the collection and find the ingredient that meets you where your hair is today.</p>
        </div>
        <FeaturedProductSwitcher />
      </section>

      <section className="brand-story reveal" aria-labelledby="story-title">
        <div className="brand-story__ornament" aria-hidden="true"><i /><i /><i /><i /><i /></div>
        <p className="eyebrow eyebrow--light">The NatureMist philosophy</p>
        <h2 id="story-title">Ancient botanicals.<br />Modern care.</h2>
        <p>
          Beauty begins at the root—with ingredients we can name, rituals we can understand and enough time to care for ourselves well.
        </p>
        <Link className="button button--light" href="/our-story">Our story <span aria-hidden="true">↗</span></Link>
        <div className="brand-story__principles">
          <span>Tradition, refined</span>
          <span>Education before expectation</span>
          <span>Care without clutter</span>
        </div>
      </section>

      <section className="section bundles-section reveal" aria-labelledby="bundles-title">
        <div className="section-heading section-heading--split">
          <div>
            <p className="eyebrow">Rituals in company</p>
            <h2 id="bundles-title">Botanicals that belong together.</h2>
          </div>
          <p>Build a wash day, deepen a conditioning mask or keep the full botanical cabinet close.</p>
        </div>
        <BundleCards />
      </section>

      <section className="section compare-section reveal" aria-labelledby="compare-title">
        <div className="section-heading section-heading--center">
          <p className="eyebrow">Find your first jar</p>
          <h2 id="compare-title">A simple comparison.</h2>
        </div>
        <div className="comparison-table" role="region" aria-label="Product comparison" tabIndex={0}>
          <table>
            <thead>
              <tr><th>Botanical</th><th>Ritual focus</th><th>Step</th><th>Experience</th><th /></tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.slug}>
                  <th><span style={{ backgroundColor: product.accent }} />{product.name}</th>
                  <td>{product.subtitle}</td>
                  <td>{product.ritualStep}</td>
                  <td>{product.experience}</td>
                  <td><Link href={`/shop/${product.slug}`} aria-label={`View ${product.name}`}>↗</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="journal-section reveal" aria-labelledby="journal-title">
        <div className="section-heading section-heading--center">
          <p className="eyebrow">The ritual journal</p>
          <h2 id="journal-title">Learn the ingredient. Then make it yours.</h2>
          <p>Verified customer stories will join the journal after launch. Until then, begin with the ritual itself.</p>
        </div>
        <div className="journal-grid">
          <Link href="/rituals" className="journal-card journal-card--one">
            <span>Guide 01</span><h3>Low-lather wash day, explained</h3><p>Why botanical cleansing feels different.</p><i>Read guide ↗</i>
          </Link>
          <Link href="/rituals" className="journal-card journal-card--two">
            <span>Guide 02</span><h3>How to find the right paste texture</h3><p>Water, patience and a smooth first mix.</p><i>Read guide ↗</i>
          </Link>
          <Link href="/shop/indigo-powder" className="journal-card journal-card--three">
            <span>Safety note</span><h3>Indigo starts with a strand test</h3><p>Understand the variables before you colour.</p><i>Read note ↗</i>
          </Link>
        </div>
      </section>

      <section className="section faq-section reveal" id="faq" aria-labelledby="faq-title">
        <div className="faq-section__intro">
          <p className="eyebrow">Good questions, clearly answered</p>
          <h2 id="faq-title">The ritual room.</h2>
          <p>Begin with curiosity. Continue with care.</p>
          <Link className="text-link" href="/rituals">Explore all ritual guidance <span aria-hidden="true">↗</span></Link>
        </div>
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <details key={faq.question} open={index === 0}>
              <summary><span>{String(index + 1).padStart(2, "0")}</span>{faq.question}<i>＋</i></summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
