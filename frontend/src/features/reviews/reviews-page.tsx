"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useStore } from "@/features/store/store-provider";

const eyebrowClass =
  "mb-4 text-[0.68rem] leading-[1.3] font-bold tracking-[0.2em] text-[var(--botanical)] uppercase";
const buttonClass =
  "inline-flex min-h-[52px] items-center justify-center gap-[14px] rounded-full border border-transparent bg-[var(--forest)] px-8 py-[14px] text-[0.72rem] leading-none font-bold tracking-[0.14em] text-[var(--paper)] uppercase shadow-[0_10px_26px_rgba(21,59,45,0.18)] transition-[transform,background-color,box-shadow] duration-[350ms] ease-[var(--ease)] hover:-translate-y-0.5 hover:bg-[var(--forest-dark)] hover:shadow-[0_14px_30px_rgba(21,59,45,0.22)]";

type Review = {
  id: string;
  name: string;
  location: string;
  rating: number;
  date: string;
  productSlug: string;
  productName: string;
  tag: "Hair Fall" | "Scalp Health" | "Shine & Softness" | "Colour & Graying";
  headline: string;
  content: string;
  verified: boolean;
};

const REVIEWS: Review[] = [
  {
    id: "rev-1",
    name: "Ananya Deshmukh",
    location: "Bengaluru, India",
    rating: 5,
    date: "1 week ago",
    productSlug: "amla",
    productName: "Wildcrafted Amla Powder",
    tag: "Hair Fall",
    headline: "Noticeable reduction in hair shedding within 3 weeks.",
    content:
      "I was skeptical about powdered botanicals because previous brands were coarse and gritty. NatureMist Amla is milled so finely that it blends like matcha. Mixing it with cold-pressed castor oil and applying it twice a week gave my thinning hairline visible density and bounce.",
    verified: true,
  },
  {
    id: "rev-2",
    name: "Vikram Sengupta",
    location: "Kolkata, India",
    rating: 5,
    date: "2 weeks ago",
    productSlug: "bhringraj",
    productName: "Pure Bhringraj Leaf Powder",
    tag: "Hair Fall",
    headline: "The 'King of Hair' lives up to its name.",
    content:
      "The earthy herbal aroma is authentic and soothing. No chemical fragrance whatsoever. My scalp feels deeply invigorated after washing, and post-shower hair fall in the drain has reduced dramatically.",
    verified: true,
  },
  {
    id: "rev-3",
    name: "Meera Krishnan",
    location: "Chennai, India",
    rating: 5,
    date: "3 weeks ago",
    productSlug: "shikakai",
    productName: "Triple-Sieved Shikakai Pod Powder",
    tag: "Scalp Health",
    headline: "Completely replaced commercial bottled shampoos.",
    content:
      "I have an itchy, easily irritated scalp that reacts to sulfates and synthetic perfumes. Shikakai + Reetha leaves my hair feather-light and cleanses oil effortlessly without any dryness.",
    verified: true,
  },
  {
    id: "rev-4",
    name: "Rohan Patel",
    location: "Mumbai, India",
    rating: 5,
    date: "1 month ago",
    productSlug: "castor",
    productName: "Cold-Pressed Black Castor Elixir",
    tag: "Shine & Softness",
    headline: "Incredible richness and shine for thick coarse hair.",
    content:
      "The viscous, rich texture of this cold-pressed oil coats every strand. Leaving it overnight under a silk bonnet and washing off in the morning leaves my hair remarkably soft and glossy.",
    verified: true,
  },
  {
    id: "rev-5",
    name: "Sneha Varma",
    location: "Pune, India",
    rating: 5,
    date: "1 month ago",
    productSlug: "brahmi",
    productName: "Himalayan Brahmi Powder",
    tag: "Scalp Health",
    headline: "Cooling ritual after long stressful work weeks.",
    content:
      "Brahmi is not just hair care; it's a nervous system reset. The cooling sensation on the crown of my head melts away tension while nourishing root follicles deeply.",
    verified: true,
  },
  {
    id: "rev-6",
    name: "Divya Kapoor",
    location: "New Delhi, India",
    rating: 5,
    date: "2 months ago",
    productSlug: "reetha",
    productName: "Organic Soapnut Reetha Powder",
    tag: "Shine & Softness",
    headline: "Natural lather with zero parabens.",
    content:
      "Creates a gentle, rich botanical foam that clears heavy hair oils without stripping moisture. My curls have never felt this hydrated and defined.",
    verified: true,
  },
];

const FILTER_TAGS = [
  "All",
  "Hair Fall",
  "Scalp Health",
  "Shine & Softness",
  "Colour & Graying",
] as const;

export function ReviewsPage() {
  const { content } = useStore();
  const [activeFilter, setActiveFilter] = useState<string>("All");

  const allReviews = useMemo<Review[]>(() => {
    if (!content.customerReviews || content.customerReviews.length === 0) {
      return REVIEWS;
    }
    const shopifyMapped: Review[] = content.customerReviews.map((r) => ({
      id: r.id,
      name: r.author,
      location: r.location || "India",
      rating: r.rating || 5,
      date: r.date || "Recent",
      productSlug: r.productSlug || "amla-powder",
      productName: r.productName || "Wildcrafted Amla Powder",
      tag: "Scalp Health",
      headline: r.headline || "Remarkable botanical transformation.",
      content: r.quote,
      verified: r.verified !== false,
    }));
    return [...shopifyMapped, ...REVIEWS.filter((r) => !shopifyMapped.some((s) => s.id === r.id))];
  }, [content.customerReviews]);

  const filteredReviews = useMemo(() => {
    if (activeFilter === "All") return allReviews;
    return allReviews.filter((r) => r.tag === activeFilter);
  }, [activeFilter, allReviews]);

  return (
    <main className="overflow-x-clip" id="main-content">
      {/* Hero Header */}
      <section className="relative isolate overflow-hidden bg-[radial-gradient(circle_at_50%_0%,rgba(183,212,90,0.15),transparent_40%),linear-gradient(180deg,#faf7f0,#f4efe4_70%,#f8f5ed)] px-[clamp(24px,5vw,72px)] pb-[clamp(50px,6vw,90px)] pt-[clamp(65px,8vw,110px)] text-center">
        <div className="mx-auto max-w-[820px]">
          <p className={eyebrowClass}>Community Reflections & Results</p>
          <h1 className="m-0 font-serif text-[clamp(2.8rem,5.5vw,5.5rem)] font-normal leading-[0.95] tracking-[-0.045em] text-[var(--forest)] text-balance">
            Real transformations. Pure botanicals.
          </h1>
          <p className="mx-auto mt-6 max-w-[560px] text-[1.05rem] leading-[1.75] text-[var(--muted)]">
            Read unedited reviews from practitioners across India who have returned to pure, filler-free Ayurvedic rituals.
          </p>

          {/* Social Proof Stats Bar */}
          <div className="mx-auto mt-10 grid max-w-[720px] grid-cols-3 gap-4 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--paper)] p-6 shadow-[0_12px_32px_rgba(21,59,45,0.06)] max-[600px]:grid-cols-1 max-[600px]:gap-6">
            <div>
              <p className="m-0 font-serif text-[2.4rem] font-normal leading-none text-[var(--forest)]">
                4.9 ★
              </p>
              <p className="mt-1 text-[0.74rem] font-bold tracking-[0.1em] text-[var(--muted)] uppercase">
                Average Rating (850+ reviews)
              </p>
            </div>
            <div className="border-x border-[var(--line)] max-[600px]:border-x-0 max-[600px]:border-y max-[600px]:py-4">
              <p className="m-0 font-serif text-[2.4rem] font-normal leading-none text-[var(--forest)]">
                96%
              </p>
              <p className="mt-1 text-[0.74rem] font-bold tracking-[0.1em] text-[var(--muted)] uppercase">
                Repeat Ritual Loyalty
              </p>
            </div>
            <div>
              <p className="m-0 font-serif text-[2.4rem] font-normal leading-none text-[var(--forest)]">
                100%
              </p>
              <p className="mt-1 text-[0.74rem] font-bold tracking-[0.1em] text-[var(--muted)] uppercase">
                Single-Origin Purity
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Grid */}
      <section className="mx-auto w-full max-w-[1280px] px-[clamp(24px,5vw,64px)] py-[clamp(60px,7vw,100px)]">
        {/* Filter Pills */}
        <div className="mb-12 flex flex-wrap items-center justify-center gap-2.5">
          {FILTER_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setActiveFilter(tag)}
              className={`rounded-full px-5 py-2.5 text-[0.74rem] font-bold tracking-[0.08em] uppercase transition-[background-color,color,transform] duration-200 ${
                activeFilter === tag
                  ? "bg-[var(--forest)] text-[var(--paper)] shadow-[0_6px_18px_rgba(21,59,45,0.15)]"
                  : "border border-[var(--line)] bg-[var(--paper)] text-[var(--muted)] hover:border-[var(--forest)] hover:text-[var(--forest)]"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Review Cards Grid */}
        <div className="grid grid-cols-2 gap-8 max-[850px]:grid-cols-1">
          {filteredReviews.map((review) => (
            <article
              key={review.id}
              className="flex flex-col justify-between rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--paper)] p-[clamp(28px,4vw,44px)] shadow-[0_12px_36px_rgba(21,59,45,0.05)] transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-[var(--botanical)]"
            >
              <div>
                {/* Rating & Tag Header */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-1 text-[var(--amla)]">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <span key={i} className="text-lg">★</span>
                    ))}
                  </div>
                  <span className="rounded-full bg-[var(--sand)] px-3 py-1 text-[0.66rem] font-bold tracking-[0.1em] text-[var(--forest)] uppercase">
                    {review.tag}
                  </span>
                </div>

                <h3 className="mt-4 font-serif text-[clamp(1.2rem,2vw,1.45rem)] font-normal leading-[1.2] text-[var(--forest)]">
                  “{review.headline}”
                </h3>

                <p className="mt-3 text-[0.92rem] leading-[1.75] text-[var(--muted)]">
                  {review.content}
                </p>
              </div>

              {/* Reviewer & Product Details Footer */}
              <div className="mt-6 border-t border-[var(--line)] pt-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="m-0 text-[0.88rem] font-bold text-[var(--forest)]">
                      {review.name}{" "}
                      {review.verified && (
                        <span className="text-[0.72rem] font-semibold text-[var(--botanical)]" title="Verified Customer">
                          ✓ Verified Ritualist
                        </span>
                      )}
                    </p>
                    <p className="m-0 text-[0.76rem] text-[var(--muted)]">
                      {review.location} · {review.date}
                    </p>
                  </div>

                  <Link
                    href={`/shop/${review.productSlug}`}
                    className="text-[0.72rem] font-bold tracking-[0.08em] text-[var(--forest)] uppercase underline underline-offset-4 hover:text-[var(--botanical)]"
                  >
                    View botanical →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--sand)]/50 p-[clamp(32px,5vw,56px)] text-center">
          <p className={eyebrowClass}>Begin Your Own Transformation</p>
          <h2 className="m-0 font-serif text-[clamp(2rem,4vw,3.2rem)] font-normal text-[var(--forest)]">
            Ready to experience traditional botanical hair care?
          </h2>
          <p className="mx-auto mt-4 max-w-[500px] text-[0.95rem] leading-[1.7] text-[var(--muted)]">
            Every ritual is formulated for simplicity, purity, and profound hair vitality.
          </p>
          <div className="mt-8 flex justify-center">
            <Link href="/shop" className={buttonClass}>
              Explore the collection
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
