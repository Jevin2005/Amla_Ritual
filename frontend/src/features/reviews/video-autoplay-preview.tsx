"use client";

import { useEffect, useRef } from "react";

export function VideoAutoplayPreview({
  url,
  poster,
  className = "absolute inset-0 size-full object-cover",
}: {
  url: string;
  poster?: string;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;

    const playVideo = () => {
      const promise = video.play();
      if (promise !== undefined) {
        promise.catch(() => {
          // Autoplay fallback if deferred by browser policy
        });
      }
    };

    playVideo();

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        playVideo();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              playVideo();
            }
          }
        },
        { threshold: 0.1 },
      );
      observer.observe(video);
    }

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      observer?.disconnect();
    };
  }, [url]);

  return (
    <video
      ref={videoRef}
      src={url}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      className={className}
      aria-hidden="true"
      tabIndex={-1}
    />
  );
}
