"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import {
  getSafeCaptionsUrl,
  getSafeVideoMedia,
  getPlayableVideoMedia,
  normalizeProductSlug,
  type VideoReview,
} from "@/domain/reviews/custom-reviews";
import { useStore } from "@/features/store/store-provider";

export function VideoReviewModal({
  video,
  onClose,
}: {
  video: VideoReview | null;
  onClose: () => void;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const { addToCart, products } = useStore();
  const media = useMemo(
    () => getPlayableVideoMedia(video),
    [video],
  );
  const safeSource = useMemo(
    () => getSafeVideoMedia(video?.videoUrl),
    [video?.videoUrl],
  );
  const captionsUrl = useMemo(
    () => getSafeCaptionsUrl(video?.captionsUrl),
    [video?.captionsUrl],
  );
  const productSlug = normalizeProductSlug(video?.productSlug);
  const canAddProduct = Boolean(
    video && products.some((product) => product.slug === productSlug),
  );

  useEffect(() => {
    if (!video) return;

    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab") return;

      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], summary, iframe, video[controls], [tabindex]:not([tabindex="-1"])',
        ) || [],
      ).filter((element) => !element.hasAttribute("disabled"));
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [onClose, video]);

  if (!video) return null;

  const isEmbed = media?.kind === "embed";
  const requestedLanguage = video.captionsLanguage?.trim() || "en";
  const captionsLanguage =
    /^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/.test(requestedLanguage)
      ? requestedLanguage
      : "en";
  const captionsLabel =
    video.captionsLabel?.trim().slice(0, 60) ||
    (captionsLanguage.toLocaleLowerCase() === "en"
      ? "English"
      : captionsLanguage.toLocaleUpperCase());

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className={`relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-3xl bg-[#0e271b] text-white shadow-2xl ${isEmbed ? "max-w-[760px]" : "max-w-[460px]"}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="video-review-title"
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-20 grid size-10 place-items-center rounded-full bg-black/65 text-white backdrop-blur-md transition-colors hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          aria-label="Close video review"
        >
          ✕
        </button>

        <div
          className={`relative w-full overflow-hidden bg-black ${isEmbed ? "aspect-video" : "aspect-[9/12] max-h-[62vh]"}`}
        >
          {media?.kind === "embed" ? (
            <iframe
              src={media.url}
              title={video.title}
              className="size-full border-0"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              sandbox="allow-scripts allow-same-origin allow-presentation"
            />
          ) : media?.kind === "video" ? (
            <video
              src={media.url}
              controls
              autoPlay
              playsInline
              preload="auto"
              poster={video.image}
              crossOrigin={captionsUrl ? "anonymous" : undefined}
              className="size-full object-contain"
            >
              {captionsUrl && (
                <track
                  kind="captions"
                  src={captionsUrl}
                  srcLang={captionsLanguage}
                  label={captionsLabel}
                  default
                />
              )}
            </video>
          ) : (
            <>
              <Image
                src={video.image}
                alt=""
                fill
                sizes="460px"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e271b]/85 via-transparent to-black/35" />
              <span className="absolute bottom-5 left-5 rounded-full bg-black/55 px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-white/85 backdrop-blur-md">
                {safeSource?.kind === "video"
                  ? "Captions or transcript required"
                  : video.videoUrl
                    ? "Video unavailable"
                    : "Video coming soon"}
              </span>
            </>
          )}
        </div>

        <div className="overflow-y-auto p-5 max-[680px]:p-4">
          <div className="flex items-center justify-between gap-3 text-[0.62rem] uppercase tracking-wider text-[#c8d88e]">
            <span>{video.creator}</span>
            <span>{video.duration}</span>
          </div>
          <h3
            id="video-review-title"
            className="my-1.5 [font-family:var(--font-display)] text-[1.35rem] font-normal leading-tight text-white"
          >
            {video.title}
          </h3>
          <p className="m-0 text-[0.78rem] leading-[1.6] text-white/80">
            &ldquo;{video.testimonial}&rdquo;
          </p>

          {video.transcript && (
            <details className="mt-3 rounded-xl border border-white/10 bg-black/10 px-3 py-2">
              <summary className="cursor-pointer text-[0.62rem] font-bold uppercase tracking-[0.09em] text-[#c8d88e]">
                Read video transcript
              </summary>
              <p className="mb-0 mt-2 whitespace-pre-line text-[0.72rem] leading-[1.65] text-white/75">
                {video.transcript}
              </p>
            </details>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4">
            <div>
              <span className="block text-[0.52rem] uppercase tracking-wider text-white/55">
                Featured botanical
              </span>
              <span className="text-[0.76rem] font-semibold text-white">
                {video.productTag}
              </span>
            </div>
            {canAddProduct && (
              <div className="flex flex-wrap items-center justify-end gap-2">
                <Link
                  href={`/shop/${productSlug}#customer-reviews`}
                  onClick={onClose}
                  className="inline-flex min-h-10 items-center rounded-full border border-white/25 px-4 py-2 text-[0.62rem] font-bold uppercase tracking-wider text-white transition-colors hover:bg-white/10"
                >
                  View product
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    void addToCart(productSlug);
                    onClose();
                  }}
                  className="min-h-10 rounded-full bg-[#529d38] px-5 py-2 text-[0.68rem] font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#43852d] active:scale-95"
                >
                  Add to bag +
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
