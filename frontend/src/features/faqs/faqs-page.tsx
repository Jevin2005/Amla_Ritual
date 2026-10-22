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
  category: "botanicals" | "preparation" | "compatibility" | "orders";
};

const FAQ_DATA: FaqItem[] = [
  {
    category: "botanicals",
    question: "Which powders are for hair packs, washing or colour?",
    answer:
      "Amla and Hibiscus are ingredients for traditional hair packs; Bhringraj is for traditional hair-and-scalp packs. Reetha and Shikakai are for herbal hair washing. Indigo is for a suitable botanical hair-colour process. Follow the current product directions for the step you choose.",
  },
  {
    category: "botanicals",
    question: "How much powder is in a jar or combo?",
    answer:
      "Each individual powder contains 200 g. A two-jar combo contains 2 × 200 g, or 400 g in total; a three-jar combo contains 3 × 200 g, or 600 g in total. The jars remain separate, with their own ingredients and directions.",
  },
  {
    category: "botanicals",
    question: "How should I store my botanical powders once opened?",
    answer:
      "Keep the container tightly closed in a cool, dry place away from sunlight and moisture. Use a clean, dry spoon and keep water out of the jar. Follow the expiry and storage information on the pack. Prepare paste fresh and discard any leftovers.",
  },
  {
    category: "botanicals",
    question: "Does traditional Ayurvedic use mean a product is clinically proven?",
    answer:
      "No. Ayurvedic tradition, ingredient research and testing of a finished product are different kinds of evidence. Research using extracts, oral products, animals or laboratory models does not prove results from these powders. Softness, shine, slip, reduced breakage and mildness require relevant product testing before we claim them.",
  },
  {
    category: "preparation",
    question: "How do I prepare a botanical hair pack?",
    answer:
      "Use the quantity, mixer and timing given in the current product directions. Mix a fresh portion in a clean bowl and rinse thoroughly as directed. Hair-pack directions do not establish facial or body suitability. Avoid breathing in loose powder, keep it away from your eyes and discard leftover paste.",
  },
  {
    category: "preparation",
    question: "Can I combine powders or add other ingredients?",
    answer:
      "Start with one botanical and the mixer specified in its directions. Introduce products separately so you can observe your response. A combo is a selection of separate jars, not a tested blended formula. Keep wash and pack steps separate unless the product directions explicitly support a combination.",
  },
  {
    category: "preparation",
    question: "How do Reetha and Shikakai fit into my hair routine?",
    answer:
      "Reetha and Shikakai contain naturally occurring saponins and are used for cleansing hair and scalp. Their lather and feel differ from a conventional shampoo. Choose the routine that works for your hair, rinse thoroughly and keep the cleanser away from your eyes. These are not our facial-mask powders.",
  },
  {
    category: "compatibility",
    question: "Can botanical powders affect light or colour-treated hair?",
    answer:
      "Plant pigments can affect light, grey, bleached, porous or previously coloured hair. Follow the strand-test guidance for each product before a full application, especially with Amla, Hibiscus and Indigo. A strand test checks colour and feel; it does not replace the skin patch test.",
  },
  {
    category: "compatibility",
    question: "What if my skin or scalp is sensitive or irritated?",
    answer:
      "Plant ingredients can cause irritation or allergy. Follow each product's patch-test instructions, avoid the eyes and broken or irritated skin, and stop use if irritation occurs. If you have eczema, psoriasis, an active rash or a previous reaction, seek advice from a qualified healthcare professional before trying a new botanical.",
  },
  {
    category: "compatibility",
    question: "Are Amla and Hibiscus currently suitable for face or body packs?",
    answer:
      "Face and body packs are development options, not current uses we recommend for these jars. The exact species, plant part, particle size, skin tolerance and instructions need assessment. Amla toner-extract research and Hibiscus leaf or extract studies do not establish facial results from the actual fruit or flower powders. Skin use is not currently recommended for any of the six powders.",
  },
  {
    category: "compatibility",
    question: "Can Indigo alone turn grey hair black?",
    answer:
      "Indigo alone does not guarantee black hair and can appear blue or green on light or grey hair. A darker result commonly requires a suitable henna-first method. Henna is not included in this six-powder collection. Follow the complete method's directions, check compatibility with previous treatments, and patch- and strand-test as directed.",
  },
  {
    category: "orders",
    question: "How are payments processed on the website?",
    answer:
      "The payment methods available for your order are shown at checkout. Review the order total, delivery details and selected payment method before confirming your purchase. Contact our care team if you need help with an existing order.",
  },
  {
    category: "orders",
    question: "What is your shipping timeline and delivery coverage?",
    answer:
      "Check our Shipping + Returns page for the current dispatch and delivery policy. Availability and delivery estimates depend on your destination and order. Use Track an Order for updates once tracking information is available.",
  },
  {
    category: "orders",
    question: "What is your return and satisfaction policy?",
    answer:
      "Our current Shipping + Returns policy explains eligibility, time limits and how to request help. If an item arrives damaged or incorrect, contact our care team with your order reference and details so we can review it.",
  },
];

const CATEGORIES = [
  { id: "all", label: "All Questions" },
  { id: "botanicals", label: "Botanicals & Benefits" },
  { id: "preparation", label: "Preparation & Usage" },
  { id: "compatibility", label: "Suitability & Colour" },
  { id: "orders", label: "Orders & Checkout" },
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
            Find a botanical for your hair-pack, wash or colour routine, with clear answers on pack sizes, preparation, evidence and orders.
          </p>

          {/* Search Box */}
          <div className="mx-auto mt-8 max-w-[540px]">
            <input
              type="search"
              placeholder="Search questions (e.g., 200 g, hair pack, wash, colour)..."
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
              Try another search, or ask our care team about your product and intended use.
            </p>
            <Link
              href="/contact"
              className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--forest)] px-7 text-[0.74rem] font-bold tracking-[0.12em] text-[var(--paper)] uppercase"
            >
              Ask our care team →
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
            Still choosing your hair-pack, wash or colour ritual?
          </h2>
          <p className="mx-auto mt-3 max-w-[520px] text-[0.95rem] leading-[1.7] text-white/80">
            Our care team can help you compare products, understand their intended uses and find the relevant preparation guidance.
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
