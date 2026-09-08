"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

const eyebrowClass =
  "mb-4 text-[0.72rem] leading-[1.3] font-bold tracking-[0.2em] text-[var(--botanical)] uppercase";
const inputClass =
  "w-full rounded-full border border-[var(--line)] bg-[var(--paper)] px-6 py-4 text-[0.95rem] text-[var(--forest)] shadow-[0_4px_16px_rgba(21,59,45,0.04)] transition-[border-color,box-shadow] duration-200 placeholder:text-[var(--muted)]/60 focus:border-[var(--forest)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--forest)]/10";

type FaqItem = {
  question: string;
  answer: string;
  category: "botanicals" | "preparation" | "hair-types" | "orders";
};

const FAQ_DATA: FaqItem[] = [
  {
    category: "botanicals",
    question: "What makes NatureMist botanicals different from commercial hair powders?",
    answer:
      "Every NatureMist powder is 100% single-origin, micro-milled from wildcrafted or shade-dried Indian botanicals. We never use preservatives, fragrances, silicones, dyes, or anti-caking agents. Each batch is triple-sieved for ultra-smooth paste application that rinses clean without grittiness.",
  },
  {
    category: "botanicals",
    question: "How should I store my botanical powders once opened?",
    answer:
      "Store your jars in a cool, dry place away from direct sunlight and moisture. Ensure the inner lid is tightly sealed after every use. Our amber and frosted UV-protective glass preserves botanical polyphenol integrity for up to 18 months.",
  },
  {
    category: "botanicals",
    question: "Are these products certified pure and tested for heavy metals?",
    answer:
      "Yes. Every harvest batch undergoes independent third-party microbiological and heavy metal screening (lead, arsenic, mercury, cadmium) before milling to ensure absolute safety for hair, scalp, and skin.",
  },
  {
    category: "preparation",
    question: "How do I prepare an Amla or Shikakai hair mask at home?",
    answer:
      "Take 2–3 tablespoons of botanical powder. Slowly whisk in warm distilled water (or pure rose water / aloe juice) until it reaches a smooth, yogurt-like consistency. Let it rest for 10–15 minutes before applying to damp hair and scalp. Leave for 30–45 minutes, then rinse thoroughly with lukewarm water.",
  },
  {
    category: "preparation",
    question: "Which mixers work best with dry or oily scalps?",
    answer:
      "For dry hair and scalp, mix with fresh yogurt, coconut milk, or cold-pressed Castor/Almond oil for deep moisture. For oily scalps or clarifying washes, use warm green tea, aloe vera juice, or filtered water with a dash of apple cider vinegar.",
  },
  {
    category: "preparation",
    question: "Do I still need a synthetic shampoo and conditioner?",
    answer:
      "Many practitioners transition to our Shikakai and Reetha ritual as a natural soapnut cleanser that gently washes away sebum without stripping the scalp's protective lipid barrier. You can alternate between natural herbal washes and gentle clean shampoos as preferred.",
  },
  {
    category: "hair-types",
    question: "Will Amla or Bhringraj darken my blonde or chemically colored hair?",
    answer:
      "Pure Amla and Bhringraj are rich in natural tannins and phytonutrients. On very light blonde, platinum, or bleached porous hair, prolonged use can impart a subtle warm or deeper golden-ash tone. We recommend a discreet strand test behind your ear if your hair is chemically lightened.",
  },
  {
    category: "hair-types",
    question: "Are these rituals safe for sensitive, eczema, or psoriasis-prone scalps?",
    answer:
      "Our botanicals are completely unfragranced and non-synthetic. However, because plant actives are potent, we always advise performing a 24-hour patch test inside the elbow before full scalp application.",
  },
  {
    category: "orders",
    question: "How are payments processed on the website?",
    answer:
      "Our storefront connects directly to Shopify's secure, PCI-DSS Level 1 compliant hosted checkout. All payment transactions, UPI, Net Banking, Credit/Debit cards, and Cash on Delivery (where eligible) are encrypted and processed by Shopify.",
  },
  {
    category: "orders",
    question: "What is your shipping timeline and delivery coverage?",
    answer:
      "Orders are prepared and dispatched within 24–48 hours from our botanical dispensary. Domestic delivery across India typically takes 3–5 business days with tracked express couriers.",
  },
  {
    category: "orders",
    question: "What is your return and satisfaction policy?",
    answer:
      "Due to the pure, sealed botanical nature of our wellness products, unopened items in original packaging can be returned within 14 days of delivery. If an item arrived damaged, our Care Team will immediately dispatch a fresh replacement.",
  },
];

const CATEGORIES = [
  { id: "all", label: "All Questions" },
  { id: "botanicals", label: "Botanicals & Purity" },
  { id: "preparation", label: "Preparation & Usage" },
  { id: "hair-types", label: "Hair & Scalp Types" },
  { id: "orders", label: "Orders & Shopify Checkout" },
] as const;

export function FaqsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.filter((faq) => {
      const matchesCategory =
        selectedCategory === "all" || faq.category === selectedCategory;
      const matchesQuery =
        searchQuery.trim() === "" ||
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <main className="overflow-x-clip" id="main-content">
      {/* Hero Header */}
      <section className="relative isolate overflow-hidden bg-[radial-gradient(circle_at_50%_0%,rgba(183,212,90,0.15),transparent_40%),linear-gradient(180deg,#faf7f0,#f4efe4_70%,#f8f5ed)] px-[clamp(24px,5vw,72px)] pb-[clamp(45px,6vw,80px)] pt-[clamp(65px,8vw,110px)] text-center">
        <div className="mx-auto max-w-[820px]">
          <p className={eyebrowClass}>Knowledge & Ritual Guides</p>
          <h1 className="m-0 font-serif text-[clamp(2.8rem,5.5vw,5.5rem)] font-normal leading-[0.95] tracking-[-0.045em] text-[var(--forest)] text-balance">
            Frequently Asked Questions
          </h1>
          <p className="mx-auto mt-6 max-w-[580px] text-[1.05rem] leading-[1.75] text-[var(--muted)]">
            Explore complete guidance on traditional botanical preparation, scalp compatibility, purity standards, and order handoff.
          </p>

          {/* Search Box */}
          <div className="mx-auto mt-8 max-w-[540px]">
            <input
              type="search"
              placeholder="Search questions (e.g., mixing, hair fall, delivery, color)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* Categories & Accordion */}
      <section className="mx-auto w-full max-w-[1040px] px-[clamp(24px,5vw,64px)] py-[clamp(50px,6vw,90px)]">
        {/* Category Pills */}
        <div className="mb-10 flex flex-wrap items-center justify-center gap-2.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`rounded-full px-5 py-2.5 text-[0.74rem] font-bold tracking-[0.1em] uppercase transition-[background-color,color,transform] duration-200 ${
                selectedCategory === cat.id
                  ? "bg-[var(--forest)] text-[var(--paper)] shadow-[0_6px_18px_rgba(21,59,45,0.15)]"
                  : "border border-[var(--line)] bg-[var(--paper)] text-[var(--muted)] hover:border-[var(--forest)] hover:text-[var(--forest)]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* FAQ Accordion List */}
        {filteredFaqs.length === 0 ? (
          <div className="rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--paper)] p-12 text-center">
            <p className="font-serif text-[1.4rem] text-[var(--forest)]">
              No matching answers found.
            </p>
            <p className="mt-2 text-[0.9rem] text-[var(--muted)]">
              Try searching with another word, or contact our specialists for personalized advice.
            </p>
            <Link
              href="/contact"
              className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--forest)] px-7 text-[0.74rem] font-bold tracking-[0.12em] text-[var(--paper)] uppercase"
            >
              Ask a botanical specialist →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredFaqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={faq.question}
                  className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--paper)] transition-all duration-300 hover:border-[var(--botanical)]"
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="flex w-full items-start justify-between gap-6 px-7 py-6 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="font-serif text-[clamp(1.1rem,2vw,1.35rem)] font-normal leading-[1.25] text-[var(--forest)]">
                      {faq.question}
                    </span>
                    <span
                      className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-full border border-[var(--line)] text-sm font-semibold text-[var(--forest)] transition-transform duration-300 ${
                        isOpen ? "rotate-45 bg-[var(--sand)]" : "bg-[var(--paper)]"
                      }`}
                    >
                      +
                    </span>
                  </button>
                  {isOpen && (
                    <div className="border-t border-[var(--line)] px-7 pb-7 pt-4">
                      <p className="m-0 text-[0.95rem] leading-[1.75] text-[var(--muted)]">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Consultation Callout */}
        <div className="mt-16 rounded-[var(--radius-lg)] border border-[var(--line)] bg-[radial-gradient(circle_at_90%_10%,rgba(183,212,90,0.18),transparent_40%),linear-gradient(135deg,var(--forest),var(--forest-dark))] p-[clamp(32px,5vw,56px)] text-center text-white">
          <h2 className="m-0 font-serif text-[clamp(1.8rem,3vw,2.5rem)] font-normal text-[var(--paper)]">
            Still have questions about your hair ritual?
          </h2>
          <p className="mx-auto mt-3 max-w-[520px] text-[0.95rem] leading-[1.7] text-white/80">
            Our Ayurvedic hair experts are ready to curate a bespoke botanical combination tailored to your scalp type and climate.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--amla)] px-8 text-[0.74rem] font-bold tracking-[0.14em] text-[var(--forest-dark)] uppercase shadow-lg transition-transform hover:-translate-y-0.5"
            >
              Get personalized advice →
            </Link>
            <Link
              href="/shop"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/30 px-8 text-[0.74rem] font-bold tracking-[0.14em] text-white uppercase transition-colors hover:bg-white/10"
            >
              Shop all rituals
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
