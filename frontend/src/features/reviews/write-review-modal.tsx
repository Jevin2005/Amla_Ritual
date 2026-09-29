"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import type { Product } from "@/domain/catalog/products";
import type { CustomerReview, ReviewRating } from "@/domain/reviews/custom-reviews";
import {
  extractNumericProductId,
  getJudgemePublicToken,
  getJudgemeShopDomain,
  isJudgemeConfigured,
} from "@/lib/judgeme/config";

interface WriteReviewModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: (review: CustomerReview) => void;
  defaultEmail?: string;
}

export function WriteReviewModal({
  product,
  isOpen,
  onClose,
  onSubmitSuccess,
  defaultEmail = "",
}: WriteReviewModalProps) {
  const [rating, setRating] = useState<ReviewRating>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState(defaultEmail);
  const [quote, setQuote] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [videoName, setVideoName] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [verificationStatus, setVerificationStatus] = useState<
    "idle" | "checking" | "verified" | "failed"
  >("idle");
  const [verificationError, setVerificationError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [prevDefaultEmail, setPrevDefaultEmail] = useState(defaultEmail);
  if (defaultEmail !== prevDefaultEmail) {
    setPrevDefaultEmail(defaultEmail);
    if (defaultEmail) {
      setEmail(defaultEmail);
      setVerificationStatus("idle");
      setVerificationError("");
    }
  }

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Verify buyer purchase against Shopify store orders
  const verifyBuyerPurchase = async (emailToVerify: string): Promise<boolean> => {
    const cleanEmail = emailToVerify.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setVerificationStatus("failed");
      setVerificationError("Please enter a valid email address (e.g. name@domain.com).");
      return false;
    }

    setVerificationStatus("checking");
    setVerificationError("");

    try {
      const res = await fetch("/api/reviews/verify-buyer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          productSlug: product.slug,
          productName: product.name,
          productId: product.id,
        }),
      });

      const data = await res.json();

      if (res.ok && data.verified === true) {
        setVerificationStatus("verified");
        setVerificationError("");
        if (data.customerName && !name.trim()) {
          setName(data.customerName);
        }
        return true;
      } else {
        setVerificationStatus("failed");
        const msg =
          data.error ||
          `No verified purchase of ${product.name} found for this email. Only verified buyers who ordered this product can submit a review.`;
        setVerificationError(msg);
        return false;
      }
    } catch (err) {
      console.error("Verification error:", err);
      setVerificationStatus("failed");
      setVerificationError("Unable to verify purchase right now. Please check your connection.");
      return false;
    }
  };

  const productSlug = product.slug;
  const productName = product.name;
  const productId = product.id;

  // Auto-verify if default email is provided upon opening modal
  useEffect(() => {
    if (!defaultEmail || !defaultEmail.includes("@")) return;

    let isMounted = true;
    const checkOnMount = async () => {
      try {
        const res = await fetch("/api/reviews/verify-buyer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: defaultEmail.trim(),
            productSlug,
            productName,
            productId,
          }),
        });
        const data = await res.json();
        if (!isMounted) return;
        if (res.ok && data.verified === true) {
          setVerificationStatus("verified");
          setVerificationError("");
          if (data.customerName) {
            setName((prev) => (prev.trim() ? prev : data.customerName));
          }
        }
      } catch {
        // ignore on mount
      }
    };

    void checkOnMount();
    return () => {
      isMounted = false;
    };
  }, [defaultEmail, productSlug, productName, productId]);

  if (!isOpen) return null;

  // Process selected or dropped files (images and video)
  const processFiles = (filesList: FileList | File[]) => {
    const files = Array.from(filesList);
    if (files.length === 0) return;

    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    const videoFiles = files.filter((f) => f.type.startsWith("video/"));

    if (imageFiles.length === 0 && videoFiles.length === 0) {
      setErrorMessage("Please drop or select valid image (JPG, PNG, WEBP) or video (MP4, MOV) files.");
      return;
    }

    // Process images up to 5 total
    if (imageFiles.length > 0) {
      const remainingSlots = Math.max(0, 5 - photos.length);
      const toAdd = imageFiles.slice(0, remainingSlots);

      toAdd.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          if (result) {
            setPhotos((prev) => (prev.length < 5 ? [...prev, result] : prev));
          }
        };
        reader.readAsDataURL(file);
      });
    }

    // Process video (1 video story)
    if (videoFiles.length > 0) {
      const vid = videoFiles[0];
      const url = URL.createObjectURL(vid);
      setVideoUrl(url);
      setVideoName(vid.name);
    }
  };

  const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      processFiles(event.target.files);
    }
    event.target.value = "";
  };

  const handleDragEnter = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.currentTarget.contains(event.relatedTarget as Node)) return;
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      processFiles(event.dataTransfer.files);
    }
  };

  const removePhoto = (indexToRemove: number) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const removeVideo = () => {
    setVideoUrl("");
    setVideoName("");
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setErrorMessage("");

    if (!name.trim()) {
      setErrorMessage("Please enter your name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (!quote.trim()) {
      setErrorMessage("Please share your feedback or experience.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Strictly verify: Only valid email & verified product purchase allowed
      const isVerified =
        verificationStatus === "verified"
          ? true
          : await verifyBuyerPurchase(email);

      if (!isVerified) {
        setErrorMessage(
          verificationError ||
            `Only verified buyers who purchased ${product.name} can submit a review. No matching order found for ${email.trim()}.`
        );
        setIsSubmitting(false);
        return;
      }

      // 1. If Judge.me is configured with token, submit to Judge.me API
      if (isJudgemeConfigured()) {
        const shopDomain = getJudgemeShopDomain();
        const publicToken = getJudgemePublicToken();
        const numericId = extractNumericProductId(product.id);

        try {
          await fetch("https://judge.me/api/v1/reviews", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              shop_domain: shopDomain,
              platform: "shopify",
              id: numericId || undefined,
              handle: product.shopifyHandle || product.slug,
              name: name.trim(),
              email: email.trim(),
              rating,
              title: product.name,
              body: quote.trim(),
              public_token: publicToken || undefined,
            }),
          });
        } catch (err) {
          console.warn("Judge.me direct submission warning:", err);
        }
      }

      // 2. Create the CustomerReview object with photos & video
      const newReview: CustomerReview = {
        id: `local-rev-${Date.now()}`,
        author: name.trim(),
        rating,
        headline: product.name,
        quote: quote.trim(),
        role: "Verified Buyer",
        productSlug: product.slug,
        productName: product.name,
        verified: true,
        date: new Date().toISOString().split("T")[0],
        location: "Verified Purchase",
        featuredOnHome: false,
        photos: photos.length > 0 ? photos : undefined,
        video: videoUrl
          ? {
              url: videoUrl,
              title: videoName || `${product.name} Video Review`,
              duration: "0:45",
            }
          : null,
      };

      // 3. Persist to localStorage for persistence across reloads
      if (typeof window !== "undefined") {
        try {
          const storageKey = `naturemist_reviews_${product.slug}`;
          const existing = JSON.parse(localStorage.getItem(storageKey) || "[]");
          localStorage.setItem(storageKey, JSON.stringify([newReview, ...existing]));

          const allKey = "naturemist_all_reviews";
          const allExisting = JSON.parse(localStorage.getItem(allKey) || "[]");
          localStorage.setItem(allKey, JSON.stringify([newReview, ...allExisting]));
        } catch {
          // ignore localStorage errors in private browsing
        }
      }

      onSubmitSuccess(newReview);
      onClose();
    } catch (err) {
      console.error("Submission failed:", err);
      setErrorMessage("Something went wrong while submitting. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentDisplayRating = hoverRating || rating;
  const ratingLabels: Record<number, string> = {
    1: "1 - Poor",
    2: "2 - Fair",
    3: "3 - Average",
    4: "4 - Good",
    5: "5 - Exceptional",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="write-review-title"
    >
      <div className="relative w-full max-w-[580px] max-h-[92vh] overflow-y-auto rounded-3xl border border-[var(--line)] bg-[var(--paper)] p-7 shadow-2xl max-[680px]:p-5 max-[680px]:rounded-2xl">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 grid size-9 place-items-center rounded-full border border-[var(--line)] bg-white/80 text-lg text-[var(--forest)] transition-all hover:bg-white hover:scale-105 active:scale-95 cursor-pointer max-[680px]:top-4 max-[680px]:right-4 max-[680px]:size-8"
          aria-label="Close review dialog"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="pr-8">
          <p className="mb-1 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-[var(--botanical)]">
            Verified Feedback
          </p>
          <h3
            id="write-review-title"
            className="m-0 [font-family:var(--font-display)] text-[1.65rem] font-normal leading-tight text-[var(--forest)] max-[680px]:text-[1.4rem]"
          >
            Review {product.name}
          </h3>
          <p className="mt-1.5 mb-0 text-[0.76rem] text-[var(--muted)]">
            Share your honest thoughts, photos, or video to help fellow ritualists.
          </p>
        </div>

        {errorMessage && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-[0.78rem] text-red-700">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Star Rating Picker */}
          <div>
            <label className="block text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[var(--forest)] mb-1.5">
              Rating <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <div
                className="flex items-center gap-1"
                onMouseLeave={() => setHoverRating(null)}
              >
                {([1, 2, 3, 4, 5] as ReviewRating[]).map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    className="p-1 text-2xl transition-transform hover:scale-115 cursor-pointer focus-visible:outline-none"
                    aria-label={`Select ${star} stars`}
                  >
                    <span
                      className={
                        star <= currentDisplayRating
                          ? "text-[#d99420]"
                          : "text-black/15"
                      }
                    >
                      ★
                    </span>
                  </button>
                ))}
              </div>
              <span className="text-[0.78rem] font-semibold text-[var(--forest)]">
                {ratingLabels[currentDisplayRating]}
              </span>
            </div>
          </div>


          {/* Review Quote / Comment */}
          <div>
            <label
              htmlFor="review-body"
              className="block text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[var(--forest)] mb-1.5"
            >
              Your Review <span className="text-red-500">*</span>
            </label>
            <textarea
              id="review-body"
              rows={4}
              required
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              placeholder="How did you prepare the ritual? How did your hair feel after 2–3 applications?"
              className="w-full rounded-xl border border-[var(--line)] bg-white px-3.5 py-2.5 text-[0.84rem] text-[var(--charcoal)] placeholder:text-[var(--muted)] focus:border-[var(--botanical)] focus:outline-none focus:ring-2 focus:ring-[var(--botanical)]/20 resize-y"
            />
          </div>

          {/* ── Customer Photos & Video Stories (Drag & Drop) ── */}
          <div className="rounded-2xl border border-[var(--line)] bg-[rgba(21,59,45,0.025)] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[0.72rem] font-bold uppercase tracking-[0.12em] text-[var(--forest)]">
                Photos & Video Stories
              </span>
              <span className="text-[0.62rem] text-[var(--muted)]">
                Optional · Max 5 photos & 1 video
              </span>
            </div>

            {/* Attached Media Previews */}
            {(photos.length > 0 || videoUrl) && (
              <div className="space-y-2.5">
                {/* Photo Previews Grid */}
                {photos.length > 0 && (
                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-[0.66rem] font-semibold text-[var(--forest)]">
                        Attached Photos ({photos.length}/5)
                      </span>
                      {photos.length < 5 && (
                        <span className="text-[0.62rem] text-[var(--muted)]">
                          {5 - photos.length} photo slot{5 - photos.length > 1 ? "s" : ""} left
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      {photos.map((photo, index) => (
                        <div
                          key={index}
                          className="group relative size-16 overflow-hidden rounded-xl border border-[var(--line)] bg-white shadow-2xs transition-transform hover:scale-102"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={photo}
                            alt={`Review upload ${index + 1}`}
                            className="size-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="absolute top-1 right-1 grid size-5 place-items-center rounded-full bg-black/80 text-[0.6rem] font-bold text-white transition-transform hover:scale-115 cursor-pointer"
                            aria-label={`Remove photo ${index + 1}`}
                            title="Remove photo"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Attached Video Card */}
                {videoUrl && (
                  <div className="flex items-center justify-between rounded-xl border border-[var(--botanical)]/40 bg-white p-2.5 shadow-2xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-black flex items-center justify-center">
                        <video
                          src={videoUrl}
                          className="size-full object-cover pointer-events-none"
                          muted
                          playsInline
                        />
                        <div className="absolute inset-0 grid place-items-center bg-black/25">
                          <span className="grid size-5 place-items-center rounded-full bg-white/95 text-[0.55rem] text-[var(--forest)] font-bold">
                            ▶
                          </span>
                        </div>
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[0.78rem] font-bold text-[var(--forest)] m-0">
                          {videoName || "Attached Video Story"}
                        </p>
                        <p className="text-[0.62rem] text-[var(--muted)] m-0">
                          Video attached to review
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeVideo}
                      className="ml-3 shrink-0 rounded-lg px-2.5 py-1 text-[0.7rem] font-bold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
                      aria-label="Remove video"
                    >
                      ✕ Remove
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Hidden Unified File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleFileInputChange}
              className="hidden"
              id="review-media-input"
            />

            {/* Interactive Drag & Drop Zone */}
            {photos.length < 5 || !videoUrl ? (
              <div
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed py-5 px-4 text-center cursor-pointer transition-all duration-200 ${
                  isDragging
                    ? "border-[var(--botanical)] bg-[var(--botanical)]/10 scale-[1.01] shadow-md ring-2 ring-[var(--botanical)]/20"
                    : "border-[var(--line-strong)] bg-white/75 hover:border-[var(--botanical)] hover:bg-[var(--sand)]/50"
                }`}
              >
                <div className="flex items-center justify-center mb-2">
                  <div
                    className={`grid size-11 place-items-center rounded-full transition-transform duration-200 ${
                      isDragging
                        ? "bg-[var(--botanical)] text-white scale-110"
                        : "bg-[rgba(21,59,45,0.06)] text-[var(--forest)] group-hover:scale-105"
                    }`}
                  >
                    {/* Media Upload Cloud Icon */}
                    <svg
                      className="size-5 stroke-[1.8]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>
                </div>

                <p className="m-0 text-[0.8rem] font-bold text-[var(--forest)]">
                  {isDragging ? (
                    <span className="text-[var(--botanical)]">Drop photos or video to attach</span>
                  ) : (
                    <>
                      Drag & drop photos or video stories, or{" "}
                      <span className="text-[var(--botanical)] underline underline-offset-2">
                        browse
                      </span>
                    </>
                  )}
                </p>

                <p className="mt-1 mb-0 text-[0.66rem] text-[var(--muted)]">
                  Supports JPG, PNG, WEBP, MP4, MOV ·{" "}
                  {5 - photos.length > 0 && `${5 - photos.length} photo${5 - photos.length > 1 ? "s" : ""} `}
                  {!videoUrl && (5 - photos.length > 0 ? "and 1 video remaining" : "1 video remaining")}
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-center text-[0.72rem] font-medium text-emerald-800">
                ✓ All media slots filled (5 photos & 1 video attached). Remove any item above to replace it.
              </div>
            )}
          </div>

          {/* 2-Column Name & Email */}
          <div className="grid grid-cols-2 gap-3 max-[520px]:grid-cols-1">
            <div>
              <label
                htmlFor="review-author"
                className="block text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[var(--forest)] mb-1.5"
              >
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                id="review-author"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Priya S."
                className="w-full rounded-xl border border-[var(--line)] bg-white px-3.5 py-2.5 text-[0.84rem] text-[var(--charcoal)] placeholder:text-[var(--muted)] focus:border-[var(--botanical)] focus:outline-none focus:ring-2 focus:ring-[var(--botanical)]/20"
              />
            </div>
            <div>
              <label
                htmlFor="review-email"
                className="block text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[var(--forest)] mb-1.5"
              >
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="review-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (verificationStatus !== "idle") {
                      setVerificationStatus("idle");
                      setVerificationError("");
                    }
                  }}
                  onBlur={() => {
                    if (email.trim() && email.includes("@")) {
                      void verifyBuyerPurchase(email);
                    }
                  }}
                  placeholder="your.email@example.com"
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-[0.84rem] text-[var(--charcoal)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 transition-colors ${
                    verificationStatus === "verified"
                      ? "border-emerald-500 bg-emerald-50/20 focus:border-emerald-600 focus:ring-emerald-500/20"
                      : verificationStatus === "failed"
                      ? "border-red-400 bg-red-50/20 focus:border-red-500 focus:ring-red-400/20"
                      : "border-[var(--line)] bg-white focus:border-[var(--botanical)] focus:ring-[var(--botanical)]/20"
                  }`}
                />
                {verificationStatus === "checking" && (
                  <span className="absolute right-3 top-2.5 flex items-center gap-1.5 text-[0.68rem] text-[var(--muted)]">
                    <span className="size-3.5 rounded-full border-2 border-neutral-300 border-t-[var(--forest)] animate-spin" />
                    <span>Verifying…</span>
                  </span>
                )}
              </div>
              {verificationStatus === "verified" && (
                <p className="mt-1 mb-0 flex items-center gap-1 text-[0.68rem] font-bold text-emerald-700">
                  <span>✓</span>
                  <span>Verified Buyer · Purchase confirmed for {product.name}</span>
                </p>
              )}
              {verificationStatus === "failed" && verificationError && (
                <p className="mt-1 mb-0 text-[0.68rem] font-medium text-red-600 leading-snug">
                  {verificationError}
                </p>
              )}
            </div>
          </div>

          <p className="text-[0.68rem] text-[var(--muted)] leading-relaxed m-0 pt-1">
            Verified purchases will receive the verified customer badge. Your email remains strictly private and is never shown publicly.
          </p>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--line)]">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-5 py-2.5 text-[0.74rem] font-bold uppercase tracking-[0.08em] text-[var(--muted)] hover:text-[var(--forest)] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || verificationStatus === "checking"}
              className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[var(--forest)] px-7 py-2.5 text-[0.74rem] font-bold uppercase tracking-[0.12em] text-[var(--paper)] shadow-md transition-all hover:bg-[var(--forest-dark)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting
                ? "Verifying & Submitting..."
                : verificationStatus === "checking"
                ? "Verifying..."
                : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
