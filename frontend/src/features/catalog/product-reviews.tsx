"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { Product } from "@/domain/catalog/products";

interface ReviewItem {
  id: string;
  author: string;
  location: string;
  rating: number;
  date: string;
  title: string;
  content: string;
  hairType: string;
  verified: boolean;
  helpfulCount: number;
}

const INITIAL_REVIEWS: Record<string, ReviewItem[]> = {
  default: [
    {
      id: "rev-1",
      author: "Priya S.",
      location: "Bengaluru, IN",
      rating: 5,
      date: "2 days ago",
      title: "Transformed my wash day completely!",
      content:
        "The powder is exceptionally fine and mixes into a smooth, lump-free yogurt paste within minutes. My scalp feels calm, balanced, and my curls have a reflective shine without any silicone heaviness.",
      hairType: "3A Curly · Coarse Lengths",
      verified: true,
      helpfulCount: 38,
    },
    {
      id: "rev-2",
      author: "Ananya M.",
      location: "Mumbai, IN",
      rating: 5,
      date: "1 week ago",
      title: "Pure, potent, and authentic shade-dried quality",
      content:
        "You can instantly tell this is genuine single-botanical herb—the natural earthy aroma and vibrant color are unmistakable. I mix it with warm water once weekly. Zero chemical residue!",
      hairType: "Wavy · Color-Treated",
      verified: true,
      helpfulCount: 24,
    },
    {
      id: "rev-3",
      author: "Rohan K.",
      location: "New Delhi, IN",
      rating: 5,
      date: "2 weeks ago",
      title: "Best natural scalp ritual I've ever used",
      content:
        "My scalp used to get dry and irritated with commercial clarifying shampoos. This botanical ritual cleanses gently without stripping away natural moisture. Essential cabinet staple.",
      hairType: "Straight · Sensitive Scalp",
      verified: true,
      helpfulCount: 19,
    },
    {
      id: "rev-4",
      author: "Meera D.",
      location: "Pune, IN",
      rating: 4,
      date: "3 weeks ago",
      title: "Lovely slip and gloss, takes patience to rinse",
      content:
        "Leaves hair extremely soft and bouncy! Tip: make sure to rinse with lukewarm running water thoroughly. A wide-tooth wooden comb makes the rinse process effortless.",
      hairType: "Fine Hair · Dry Ends",
      verified: true,
      helpfulCount: 12,
    },
  ],
};

const RATING_LABELS: Record<number, string> = {
  5: "Exceptional · Loved it",
  4: "Very Good · Highly recommend",
  3: "Good · Balanced results",
  2: "Fair · Mixed experience",
  1: "Poor · Did not suit my hair",
};

export function ProductReviewsSection({ product }: { product: Product }) {
  const [reviewsList, setReviewsList] = useState<ReviewItem[]>(() => {
    return INITIAL_REVIEWS[product.slug] || INITIAL_REVIEWS.default;
  });
  const [filterRating, setFilterRating] = useState<number | "all">("all");
  const [helpfulLiked, setHelpfulLiked] = useState<Record<string, boolean>>({});

  // Modal State
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [newRating, setNewRating] = useState(5);
  const [authorName, setAuthorName] = useState("");
  const [userLocation, setUserLocation] = useState("");
  const [hairType, setHairType] = useState("All Hair Types");
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewContent, setReviewContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isWriteModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isWriteModalOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isWriteModalOpen) {
        setIsWriteModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isWriteModalOpen]);

  const filteredReviews = useMemo(() => {
    if (filterRating === "all") return reviewsList;
    return reviewsList.filter((r) => r.rating === filterRating);
  }, [filterRating, reviewsList]);

  const toggleHelpful = (id: string) => {
    setHelpfulLiked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !reviewContent.trim()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const newReview: ReviewItem = {
        id: `rev-${Date.now()}`,
        author: authorName.trim(),
        location: userLocation.trim() || "Verified Buyer",
        rating: newRating,
        date: "Just now",
        title: reviewTitle.trim() || "Thoughtful botanical review",
        content: reviewContent.trim(),
        hairType: hairType,
        verified: true,
        helpfulCount: 0,
      };

      setReviewsList((prev) => [newReview, ...prev]);
      setIsSubmitting(false);
      setSubmitted(true);

      setTimeout(() => {
        setIsWriteModalOpen(false);
        setSubmitted(false);
        setAuthorName("");
        setUserLocation("");
        setReviewTitle("");
        setReviewContent("");
        setNewRating(5);
      }, 1400);
    }, 600);
  };

  return (
    <section
      id="customer-reviews"
      className="mx-auto mt-14 w-full max-w-[1440px] px-[clamp(20px,4.5vw,72px)] max-[680px]:mt-8 max-[680px]:px-3 scroll-mt-24"
      aria-labelledby="reviews-heading"
    >
      <div className="border-t border-[var(--line)] pt-10 max-[680px]:pt-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="mb-1 text-[0.64rem] font-bold uppercase tracking-[0.2em] text-[var(--botanical)] max-[680px]:text-[0.52rem]">
              Verified Customer Experiences
            </p>
            <h2
              id="reviews-heading"
              className="m-0 [font-family:var(--font-display)] text-[clamp(1.8rem,3.4vw,2.8rem)] font-normal text-[var(--forest)] max-[680px]:text-[1.35rem]"
            >
              Customer Reviews & Ratings
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setIsWriteModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--forest)] bg-white px-4 py-2 text-[0.7rem] font-bold uppercase tracking-[0.08em] text-[var(--forest)] shadow-2xs transition-all hover:bg-[var(--forest)] hover:text-white active:scale-95 cursor-pointer max-[680px]:text-[0.62rem] max-[680px]:px-3 max-[680px]:py-1.5"
          >
            <span>✍️</span>
            <span>Write a Review</span>
          </button>
        </div>

        {/* Amazon-Style Rating Breakdown Box */}
        <div className="grid grid-cols-[300px_minmax(0,1fr)] gap-8 rounded-3xl border border-[var(--line)] bg-[var(--paper)] p-6 shadow-xs max-[900px]:grid-cols-1 max-[900px]:gap-6 max-[680px]:p-4 max-[680px]:rounded-2xl">
          {/* Left Rating Score Column */}
          <div className="flex flex-col justify-center border-r border-[var(--line)] pr-6 max-[900px]:border-r-0 max-[900px]:border-b max-[900px]:pr-0 max-[900px]:pb-5">
            <div className="flex items-baseline gap-3">
              <span className="[font-family:var(--font-display)] text-[3.2rem] font-normal leading-none text-[var(--forest)] max-[680px]:text-[2.6rem]">
                4.9
              </span>
              <div className="flex flex-col">
                <div className="text-amber-500 text-sm tracking-wider">★★★★★</div>
                <span className="text-[0.68rem] text-[var(--muted)]">out of 5 stars</span>
              </div>
            </div>
            <p className="mt-2 mb-4 text-[0.74rem] text-[var(--muted)]">
              Based on {142 + reviewsList.length - 4} verified botanical care ratings
            </p>

            {/* Feature Ratings Breakdown */}
            <div className="space-y-1.5 border-t border-[var(--line)] pt-3 text-[0.7rem]">
              <div className="flex items-center justify-between text-[var(--forest)]">
                <span>Clumpless Paste Alchemy</span>
                <span className="font-bold">4.9 ★</span>
              </div>
              <div className="flex items-center justify-between text-[var(--forest)]">
                <span>Hair Softness & Gloss</span>
                <span className="font-bold">4.9 ★</span>
              </div>
              <div className="flex items-center justify-between text-[var(--forest)]">
                <span>Scalp Comfort & Cleanse</span>
                <span className="font-bold">5.0 ★</span>
              </div>
            </div>
          </div>

          {/* Right Star Distribution Bars */}
          <div className="flex flex-col justify-center gap-2">
            <span className="text-[0.62rem] font-bold uppercase tracking-wider text-[var(--muted)]">
              Rating Distribution
            </span>
            {[
              { stars: 5, pct: 92 },
              { stars: 4, pct: 6 },
              { stars: 3, pct: 2 },
              { stars: 2, pct: 0 },
              { stars: 1, pct: 0 },
            ].map((row) => (
              <button
                key={row.stars}
                type="button"
                onClick={() => setFilterRating(filterRating === row.stars ? "all" : row.stars)}
                className={`flex items-center gap-3 rounded-lg py-1 px-2 text-left text-[0.72rem] transition-colors cursor-pointer ${
                  filterRating === row.stars ? "bg-[var(--ivory)] font-bold text-[var(--forest)]" : "text-[var(--muted)] hover:bg-black/5"
                }`}
              >
                <span className="w-12 shrink-0">{row.stars} star</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[var(--line)]">
                  <div
                    className="h-full rounded-full bg-[#529d38]"
                    style={{ width: `${row.pct}%` }}
                  />
                </div>
                <span className="w-9 text-right font-medium">{row.pct}%</span>
              </button>
            ))}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="mt-6 flex flex-wrap items-center gap-2 max-[680px]:gap-1.5">
          <span className="text-[0.66rem] font-semibold text-[var(--muted)] mr-1 max-[680px]:hidden">
            Filter:
          </span>
          <button
            type="button"
            onClick={() => setFilterRating("all")}
            className={`rounded-full px-3.5 py-1 text-[0.68rem] font-semibold transition-all cursor-pointer ${
              filterRating === "all"
                ? "bg-[var(--forest)] text-white shadow-2xs"
                : "border border-[var(--line)] bg-white text-[var(--forest)] hover:bg-[var(--beige)]"
            }`}
          >
            All Reviews ({reviewsList.length})
          </button>
          {[5, 4, 3].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setFilterRating(filterRating === star ? "all" : star)}
              className={`rounded-full px-3.5 py-1 text-[0.68rem] font-semibold transition-all cursor-pointer ${
                filterRating === star
                  ? "bg-[var(--forest)] text-white shadow-2xs"
                  : "border border-[var(--line)] bg-white text-[var(--forest)] hover:bg-[var(--beige)]"
              }`}
            >
              {star} Stars
            </button>
          ))}
        </div>

        {/* Reviews List */}
        <div className="mt-5 space-y-3.5">
          {filteredReviews.map((review) => {
            const isHelpful = helpfulLiked[review.id];
            return (
              <article
                key={review.id}
                className="rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-5 shadow-2xs transition-all hover:border-black/15 max-[680px]:p-3.5 max-[680px]:rounded-xl"
              >
                {/* Reviewer Header */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="grid size-8 place-items-center rounded-full bg-[var(--forest)] text-[0.72rem] font-bold text-[#c8d88e]">
                      {review.author.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-[0.78rem] font-bold text-[var(--forest)]">
                          {review.author}
                        </strong>
                        {review.verified && (
                          <span className="inline-flex items-center gap-0.5 rounded bg-[#edf3ea] px-1.5 py-0.5 text-[0.52rem] font-bold text-[#529d38] uppercase">
                            ✓ Verified Purchase
                          </span>
                        )}
                      </div>
                      <span className="text-[0.62rem] text-[var(--muted)]">
                        {review.location} · {review.hairType}
                      </span>
                    </div>
                  </div>
                  <span className="text-[0.64rem] text-[var(--muted)]">{review.date}</span>
                </div>

                {/* Rating & Title */}
                <div className="my-2.5 flex items-center gap-2">
                  <div className="text-amber-500 text-xs">
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </div>
                  <h4 className="m-0 text-[0.84rem] font-bold text-[var(--forest)]">
                    {review.title}
                  </h4>
                </div>

                {/* Content */}
                <p className="m-0 text-[0.78rem] leading-[1.6] text-[var(--muted)] max-[680px]:text-[0.72rem]">
                  {review.content}
                </p>

                {/* Helpful Button Footer */}
                <div className="mt-3.5 flex items-center gap-3 border-t border-[var(--line)] pt-2.5 text-[0.66rem] text-[var(--muted)]">
                  <button
                    type="button"
                    onClick={() => toggleHelpful(review.id)}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-medium transition-colors cursor-pointer ${
                      isHelpful
                        ? "border-[#529d38] bg-[#edf3ea] text-[#529d38] font-bold"
                        : "border-[var(--line)] bg-white text-[var(--forest)] hover:bg-[var(--beige)]"
                    }`}
                  >
                    <span>👍 Helpful</span>
                    <span>({review.helpfulCount + (isHelpful ? 1 : 0)})</span>
                  </button>
                  <span>·</span>
                  <span className="text-[var(--muted)]">Verified Botanical Buyer</span>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* ── Write a Review Modal (Portaled to document.body with Backdrop Blur) ── */}
      {isWriteModalOpen &&
        mounted &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setIsWriteModalOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="write-review-heading"
          >
            <div
              className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--paper)] p-6 shadow-2xl animate-in zoom-in-95 duration-200 max-[680px]:p-4.5 max-[680px]:rounded-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
                <div>
                  <span className="text-[0.58rem] font-bold uppercase tracking-[0.14em] text-[var(--botanical)]">
                    Share Your Experience
                  </span>
                  <h3
                    id="write-review-heading"
                    className="m-0 [font-family:var(--font-display)] text-[1.35rem] font-normal text-[var(--forest)] max-[680px]:text-[1.15rem]"
                  >
                    Write a Botanical Review
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsWriteModalOpen(false)}
                  className="grid size-8 place-items-center rounded-full bg-[var(--ivory)] text-sm text-[var(--forest)] transition-colors hover:bg-black/10 cursor-pointer"
                  aria-label="Close review dialog"
                >
                  ✕
                </button>
              </div>

              {submitted ? (
                <div className="py-10 text-center animate-in zoom-in-95 duration-200">
                  <div className="mx-auto mb-3 grid size-14 place-items-center rounded-full bg-[#edf3ea] text-2xl text-[#529d38]">
                    ✓
                  </div>
                  <h4 className="m-0 [font-family:var(--font-display)] text-[1.35rem] text-[var(--forest)]">
                    Thank You for Sharing!
                  </h4>
                  <p className="mx-auto mt-1.5 max-w-xs text-[0.76rem] text-[var(--muted)]">
                    Your authentic ritual review has been added to {product.name}.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="mt-4 space-y-4">
                  {/* Interactive Star Rating Selector */}
                  <div>
                    <label className="mb-1 block text-[0.62rem] font-bold uppercase tracking-wider text-[var(--forest)]">
                      Overall Rating <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1" onMouseLeave={() => setHoverRating(null)}>
                        {[1, 2, 3, 4, 5].map((star) => {
                          const active = (hoverRating ?? newRating) >= star;
                          return (
                            <button
                              key={star}
                              type="button"
                              onMouseEnter={() => setHoverRating(star)}
                              onClick={() => setNewRating(star)}
                              className={`text-2xl transition-transform hover:scale-125 cursor-pointer ${
                                active ? "text-amber-500" : "text-gray-300"
                              }`}
                              aria-label={`Rate ${star} star`}
                            >
                              ★
                            </button>
                          );
                        })}
                      </div>
                      <span className="text-[0.68rem] font-medium text-[var(--botanical)]">
                        {RATING_LABELS[hoverRating ?? newRating]}
                      </span>
                    </div>
                  </div>

                  {/* Name & Location Row */}
                  <div className="grid grid-cols-2 gap-3 max-[500px]:grid-cols-1">
                    <div>
                      <label
                        htmlFor="reviewer-name"
                        className="mb-1 block text-[0.62rem] font-bold uppercase tracking-wider text-[var(--forest)]"
                      >
                        Your Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="reviewer-name"
                        type="text"
                        required
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        placeholder="e.g. Priya Sharma"
                        className="h-10 w-full rounded-xl border border-[var(--line)] bg-white px-3 text-[0.78rem] text-[var(--forest)] outline-none focus:border-[var(--botanical)] focus:ring-2 focus:ring-[var(--botanical)]/20"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="reviewer-loc"
                        className="mb-1 block text-[0.62rem] font-bold uppercase tracking-wider text-[var(--forest)]"
                      >
                        City / Location
                      </label>
                      <input
                        id="reviewer-loc"
                        type="text"
                        value={userLocation}
                        onChange={(e) => setUserLocation(e.target.value)}
                        placeholder="e.g. Mumbai, IN"
                        className="h-10 w-full rounded-xl border border-[var(--line)] bg-white px-3 text-[0.78rem] text-[var(--forest)] outline-none focus:border-[var(--botanical)] focus:ring-2 focus:ring-[var(--botanical)]/20"
                      />
                    </div>
                  </div>

                  {/* Hair Type & Texture */}
                  <div>
                    <label
                      htmlFor="reviewer-hair"
                      className="mb-1 block text-[0.62rem] font-bold uppercase tracking-wider text-[var(--forest)]"
                    >
                      Hair Type / Texture
                    </label>
                    <select
                      id="reviewer-hair"
                      value={hairType}
                      onChange={(e) => setHairType(e.target.value)}
                      className="h-10 w-full rounded-xl border border-[var(--line)] bg-white px-3 text-[0.76rem] text-[var(--forest)] outline-none focus:border-[var(--botanical)] cursor-pointer"
                    >
                      <option value="All Hair Types">All Hair Types</option>
                      <option value="Straight · Fine / Medium">Straight · Fine / Medium</option>
                      <option value="Wavy · Color-Treated">Wavy · Color-Treated</option>
                      <option value="Curly (3A-3C) · Coarse Lengths">Curly (3A-3C) · Coarse Lengths</option>
                      <option value="Coily (4A-4C) · High Porosity">Coily (4A-4C) · High Porosity</option>
                      <option value="Sensitive / Irritated Scalp">Sensitive / Irritated Scalp</option>
                    </select>
                  </div>

                  {/* Review Headline */}
                  <div>
                    <label
                      htmlFor="reviewer-title"
                      className="mb-1 block text-[0.62rem] font-bold uppercase tracking-wider text-[var(--forest)]"
                    >
                      Review Headline
                    </label>
                    <input
                      id="reviewer-title"
                      type="text"
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      placeholder="e.g. Smooth paste mixing, luminous shine"
                      className="h-10 w-full rounded-xl border border-[var(--line)] bg-white px-3 text-[0.78rem] text-[var(--forest)] outline-none focus:border-[var(--botanical)] focus:ring-2 focus:ring-[var(--botanical)]/20"
                    />
                  </div>

                  {/* Review Details */}
                  <div>
                    <label
                      htmlFor="reviewer-content"
                      className="mb-1 block text-[0.62rem] font-bold uppercase tracking-wider text-[var(--forest)]"
                    >
                      Your Experience & Observations <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="reviewer-content"
                      required
                      rows={3}
                      value={reviewContent}
                      onChange={(e) => setReviewContent(e.target.value)}
                      placeholder="How did the powder mix, feel on your scalp, and rinse out?"
                      className="w-full rounded-xl border border-[var(--line)] bg-white p-3 text-[0.78rem] text-[var(--forest)] outline-none focus:border-[var(--botanical)] focus:ring-2 focus:ring-[var(--botanical)]/20 resize-none leading-relaxed"
                    />
                  </div>

                  {/* Submit CTA */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsWriteModalOpen(false)}
                      className="h-11 flex-1 rounded-full border border-[var(--line)] bg-white text-[0.74rem] font-bold uppercase tracking-wider text-[var(--forest)] transition-colors hover:bg-[var(--beige)] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !authorName.trim() || !reviewContent.trim()}
                      className="h-11 flex-1 rounded-full bg-[#529d38] text-[0.74rem] font-bold uppercase tracking-wider text-white shadow-md transition-all hover:bg-[#43852d] active:scale-98 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? "Submitting…" : "Publish Review 🌿"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>,
          document.body,
        )}
    </section>
  );
}
