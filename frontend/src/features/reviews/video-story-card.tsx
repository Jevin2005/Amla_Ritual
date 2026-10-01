"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  getPlayableVideoMedia,
  getSafeCaptionsUrl,
  type VideoReview,
} from "@/domain/reviews/custom-reviews";

type VideoStoryCardProps = {
  video: VideoReview;
  onOpen?: (video: VideoReview) => void;
  className?: string;
};

export function VideoStoryCard(props: VideoStoryCardProps) {
  return <VideoStory key={`${props.video.id}:${props.video.videoUrl || ""}`} {...props} />;
}

function VideoStory({ video, onOpen, className = "" }: VideoStoryCardProps) {
  const media = getPlayableVideoMedia(video);
  const nativeUrl = media?.kind === "video" ? media.url : null;
  const captionsUrl = getSafeCaptionsUrl(video.captionsUrl);
  const captionsLanguage = /^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/.test(video.captionsLanguage || "")
    ? video.captionsLanguage
    : "en";
  const mediaRef = useRef<HTMLVideoElement>(null);
  const inViewportRef = useRef(false);
  const userPausedRef = useRef(false);
  const mountedRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [playBlocked, setPlayBlocked] = useState(false);
  const [mediaFailed, setMediaFailed] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [mediaDuration, setMediaDuration] = useState("");
  const durationLabel = nativeUrl ? mediaDuration : video.duration;
  const mediaId = useId();
  const titleId = useId();

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    const element = mediaRef.current;
    if (!element || !nativeUrl || mediaFailed) return;

    let disposed = false;
    element.muted = true;
    element.defaultMuted = true;

    const shouldPlay = () => inViewportRef.current && !document.hidden && !userPausedRef.current;
    const syncPlayback = () => {
      if (!shouldPlay()) {
        element.pause();
        return;
      }
      // Request playback only while visible; an offscreen card never autoplays.
      void element.play().catch(() => {
        if (!disposed && shouldPlay()) setPlayBlocked(true);
      });
    };

    const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(
      ([entry]) => {
        inViewportRef.current = entry.isIntersecting && entry.intersectionRatio >= 0.2;
        syncPlayback();
      },
      { threshold: [0, 0.2] },
    );
    const updateFallbackVisibility = () => {
      const bounds = element.getBoundingClientRect();
      inViewportRef.current = bounds.bottom > 0 && bounds.top < window.innerHeight;
      syncPlayback();
    };
    if (observer) {
      observer.observe(element);
    } else {
      updateFallbackVisibility();
      window.addEventListener("scroll", updateFallbackVisibility, { passive: true });
      window.addEventListener("resize", updateFallbackVisibility);
    }
    document.addEventListener("visibilitychange", syncPlayback);

    return () => {
      disposed = true;
      observer?.disconnect();
      window.removeEventListener("scroll", updateFallbackVisibility);
      window.removeEventListener("resize", updateFallbackVisibility);
      document.removeEventListener("visibilitychange", syncPlayback);
      element.pause();
    };
  }, [nativeUrl, mediaFailed]);

  function togglePlayback() {
    const element = mediaRef.current;
    if (!element) return;
    if (!element.paused) {
      userPausedRef.current = true;
      element.pause();
      return;
    }
    userPausedRef.current = false;
    setPlayBlocked(false);
    void element.play().catch(() => {
      if (mountedRef.current && !userPausedRef.current && !document.hidden) setPlayBlocked(true);
    });
  }

  function toggleSound() {
    const element = mediaRef.current;
    if (!element) return;
    element.muted = !element.muted;
    setMuted(element.muted);
  }

  function openStory() {
    // Explicitly opening the full story also stops its inline sound/playback.
    userPausedRef.current = true;
    mediaRef.current?.pause();
    onOpen?.({ ...video, duration: durationLabel || video.duration });
  }

  const controlClass = "grid size-11 shrink-0 cursor-pointer place-items-center rounded-full border border-white/35 bg-[#133b2d]/75 text-white shadow-sm backdrop-blur-sm transition-colors hover:bg-[#133b2d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

  return (
    <article aria-labelledby={titleId} className={`min-w-0 overflow-hidden rounded-[18px] border border-[#dfe3d5] bg-[#fffcf5] shadow-[0_6px_24px_rgba(26,47,29,0.045)] ${className}`}>
      <div className="relative aspect-[4/5] overflow-hidden bg-[#dce2d1]">
        {video.image && !imageFailed && (
          // Customer media may be hosted outside the product-image CDN.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={video.image} alt="" loading="lazy" onError={() => setImageFailed(true)} className="absolute inset-0 size-full object-cover" />
        )}
        {nativeUrl && !mediaFailed && (
          <video
            ref={mediaRef}
            id={mediaId}
            src={nativeUrl}
            poster={video.image || undefined}
            muted={muted}
            loop
            playsInline
            preload="metadata"
            crossOrigin={captionsUrl ? "anonymous" : undefined}
            onLoadedMetadata={(event) => {
              const duration = event.currentTarget.duration;
              if (Number.isFinite(duration) && duration > 0) {
                const seconds = Math.max(1, Math.round(duration));
                setMediaDuration(`${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`);
              }
            }}
            onPlaying={() => { setPlaying(true); setPlayBlocked(false); }}
            onPause={() => setPlaying(false)}
            onVolumeChange={(event) => setMuted(event.currentTarget.muted)}
            onError={() => { setMediaFailed(true); setPlaying(false); }}
            className="absolute inset-0 size-full object-cover"
            aria-label={`Video review by ${video.creator}: ${video.title}`}
          >
            {captionsUrl && <track kind="captions" src={captionsUrl} srcLang={captionsLanguage} label={video.captionsLabel || "Captions"} default />}
          </video>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#133b2d]/90 via-[#133b2d]/30 to-transparent" />

        {nativeUrl && !mediaFailed ? (
          <div className="absolute right-3 top-3 flex gap-2" role="group" aria-label={`Playback controls for ${video.title}`} onMouseDown={(event) => event.stopPropagation()}>
            <button type="button" onClick={togglePlayback} aria-label={`${playing ? "Pause" : "Play"} video by ${video.creator}`} aria-controls={mediaId} className={controlClass}>
              {playing ? (
                <svg width="17" height="17" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M5 4h3v12H5zm7 0h3v12h-3z" /></svg>
              ) : (
                <svg width="17" height="17" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="m6 3 11 7-11 7z" /></svg>
              )}
            </button>
            <button type="button" onClick={toggleSound} aria-label={`Sound for video by ${video.creator}`} aria-pressed={!muted} aria-controls={mediaId} className={controlClass}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M11 4 6 8H3v8h3l5 4z" />
                {muted ? <path d="m16 9 5 6m0-6-5 6" /> : <><path d="M15 8a6 6 0 0 1 0 8" /><path d="M18 5a10 10 0 0 1 0 14" /></>}
              </svg>
            </button>
          </div>
        ) : media?.kind === "embed" && onOpen ? (
          <button type="button" onClick={openStory} aria-label={`Open video review by ${video.creator}`} className="absolute left-1/2 top-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 cursor-pointer place-items-center rounded-full border border-white/70 bg-[#133b2d]/55 text-white backdrop-blur-sm transition-colors hover:bg-[#133b2d]/85 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="m6 3 11 7-11 7z" /></svg>
          </button>
        ) : null}

        {(playBlocked || mediaFailed) && <p role="status" className="absolute left-3 top-16 max-w-[calc(100%_-_1.5rem)] rounded-lg bg-[#133b2d]/85 px-3 py-2 text-xs text-white">{mediaFailed ? "Video unavailable" : "Press play to watch"}</p>}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-x-3 gap-y-1 px-4 pb-4 pt-8 text-white">
          <p className="m-0 min-w-0 break-words text-[0.76rem] font-semibold tracking-[0.02em]">{video.creator}</p>
          {durationLabel && <span className="text-[0.67rem] tabular-nums text-white/85">{durationLabel}</span>}
        </div>
      </div>

      <div className="px-3 pb-4 pt-3 sm:px-4 sm:pb-5 sm:pt-4">
        <h3 id={titleId} className="m-0 break-words [font-family:var(--font-display)] text-[0.95rem] font-normal leading-[1.3] tracking-[-0.015em] text-[var(--forest)] sm:text-[1.1rem]">
          {onOpen ? (
            <button type="button" onClick={openStory} aria-label={`Open full video review: ${video.title}`} className="-my-1 flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 rounded py-1 text-left transition-colors hover:text-[var(--botanical)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--forest)]">
              <span className="line-clamp-2">{video.title}</span>
              <svg className="shrink-0 text-[#6e805e]" width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d="M5 15 15 5M5 5h10v10" /></svg>
            </button>
          ) : <span className="line-clamp-2">{video.title}</span>}
        </h3>
        {video.testimonial && <p className="mb-0 mt-2 line-clamp-3 text-[0.72rem] leading-[1.7] text-[#65705e] sm:text-[0.8rem]">{video.testimonial}</p>}
        {video.productTag && <p className="mb-0 mt-4 text-[0.6rem] font-semibold uppercase leading-relaxed tracking-[0.14em] text-[#75804b]">{video.productTag}</p>}
      </div>
    </article>
  );
}
