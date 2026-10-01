"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import type { Product } from "@/domain/catalog/products";
import { ProductModel } from "./product-model";
import styles from "./product-gallery.module.css";

export function ProductGallery({ product }: { product: Product }) {
  return <Gallery key={product.id || product.slug} product={product} />;
}

function Gallery({ product }: { product: Product }) {
  const viewport = useRef<HTMLDivElement>(null);
  const enlargedMedia = useRef<HTMLDialogElement>(null);
  const selectedRef = useRef(0);
  const instructionsId = useId();
  const [activeIndex, setActiveIndex] = useState(0);
  const [enlargedIndex, setEnlargedIndex] = useState<number | null>(null);
  const baseImage = product.featuredImage?.url ? product.featuredImage : {
    url: "/images/product-placeholder.svg",
    altText: product.name,
    width: 800,
    height: 800,
  };
  const images = product.images?.length ? product.images : [baseImage];
  const slides = [
    ...images.map((image) => ({ ...image, kind: "image" as const })),
    ...(product.models || []).map((model) => ({ ...model, kind: "model" as const })),
  ];
  const selectedIndex = Math.min(activeIndex, slides.length - 1);
  const enlarged = enlargedIndex === null ? null : slides[enlargedIndex];

  function selectSlide(index: number) {
    const element = viewport.current;
    if (!element) return;
    const next = Math.max(0, Math.min(slides.length - 1, index));
    element.scrollTo({
      left: next * element.clientWidth,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  }

  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const observer = new ResizeObserver(() => {
      element.scrollTo({ left: selectedRef.current * element.clientWidth, behavior: "instant" });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (enlargedIndex === null) return;
    const dialog = enlargedMedia.current;
    if (!dialog) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (!dialog.open) dialog.showModal();
    return () => {
      document.body.style.overflow = previousOverflow;
      if (dialog.open) dialog.close();
    };
  }, [enlargedIndex]);

  return (
    <div className={styles.gallery}>
      <p id={instructionsId} className="sr-only">Swipe left or right to browse product media. Use the arrow keys when the gallery is focused. Select a poster to open the full view.</p>
      <div
        ref={viewport}
        className={styles.viewport}
        role="region"
        aria-roledescription="carousel"
        aria-label={`${product.name} product gallery`}
        aria-describedby={instructionsId}
        tabIndex={0}
        onScroll={(event) => {
          const element = event.currentTarget;
          const index = Math.max(0, Math.min(slides.length - 1, Math.round(element.scrollLeft / element.clientWidth)));
          selectedRef.current = index;
          setActiveIndex((previous) => previous === index ? previous : index);
        }}
        onKeyDown={(event) => {
          if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
          event.preventDefault();
          selectSlide(event.key === "Home" ? 0 : event.key === "End" ? slides.length - 1 : selectedIndex + (event.key === "ArrowRight" ? 1 : -1));
        }}
      >
        {slides.map((slide, index) => {
          const poster = slide.kind === "model" ? slide.previewImage || baseImage : slide;
          return (
            <div key={`${slide.kind}-${slide.url}-${index}`} className={styles.slide} role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${slides.length}`} inert={index !== selectedIndex}>
              <button
                type="button"
                className={styles.enlargePhoto}
                aria-label={slide.kind === "model" ? `Explore 3D model of ${product.name}` : `Enlarge photo ${index + 1} of ${product.name}`}
                onClick={() => setEnlargedIndex(index)}
              >
                <Image src={poster.url} alt={poster.altText || product.name} fill preload={index === 0} quality={90} sizes="(max-width: 680px) 100vw, (max-width: 960px) 90vw, 52vw" className={styles.photo} draggable={false} />
                {slide.kind === "model" && <span className={styles.modelLabel}>Explore in 3D <span aria-hidden="true">↗</span></span>}
              </button>
            </div>
          );
        })}
      </div>

      {slides.length > 1 && (
        <>
          <div className={styles.thumbnails} aria-label="Product thumbnails">
            {slides.map((slide, index) => {
              const poster = slide.kind === "model" ? slide.previewImage || baseImage : slide;
              return (
                <button key={`${slide.url}-${index}`} type="button" className={styles.thumbnail} onClick={() => selectSlide(index)} aria-pressed={selectedIndex === index} aria-label={slide.kind === "model" ? `View 3D model ${index - images.length + 1}` : `View photo ${index + 1}`}>
                  <Image src={poster.url} alt="" fill sizes="160px" className={styles.thumbnailPhoto} />
                  {slide.kind === "model" && <span className={styles.modelBadge}>3D</span>}
                </button>
              );
            })}
          </div>
          <div className={styles.mobileProgress}>
            <button type="button" onClick={() => selectSlide(selectedIndex - 1)} disabled={selectedIndex === 0} aria-label="Previous product poster">‹</button>
            <span aria-live="polite" aria-atomic="true">{selectedIndex + 1} / {slides.length}</span>
            <button type="button" onClick={() => selectSlide(selectedIndex + 1)} disabled={selectedIndex === slides.length - 1} aria-label="Next product poster">›</button>
          </div>
        </>
      )}

      <dialog ref={enlargedMedia} className={styles.lightbox} aria-label={`Full view of ${product.name}`} onClose={() => setEnlargedIndex(null)} onClick={(event) => { if (event.target === event.currentTarget) enlargedMedia.current?.close(); }}>
        <button type="button" className={styles.closePhoto} onClick={() => enlargedMedia.current?.close()} aria-label="Close full product view">×</button>
        <div className={styles.lightboxImage}>
          {enlarged?.kind === "model" ? <ProductModel model={enlarged} presentation="gallery" poster={enlarged.previewImage || baseImage} cameraDistancePercent={110} eager /> : enlarged && <Image src={enlarged.url} alt={enlarged.altText || product.name} fill sizes="96vw" quality={95} className="object-contain" />}
        </div>
      </dialog>
    </div>
  );
}
