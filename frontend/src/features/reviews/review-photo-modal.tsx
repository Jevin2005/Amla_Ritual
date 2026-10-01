"use client";

import { useEffect, useId, useRef, useState } from "react";

export type ReviewPhoto = { url: string; alt?: string };

type ReviewPhotoModalProps = {
  photo: ReviewPhoto | null;
  photos?: ReviewPhoto[];
  onClose: () => void;
};

export function ReviewPhotoModal({ photo, photos, onClose }: ReviewPhotoModalProps) {
  if (!photo) return null;
  const gallery = photos?.some((item) => item.url === photo.url) ? photos : [photo];
  return <PhotoDialog key={photo.url} photo={photo} photos={gallery} onClose={onClose} />;
}

function PhotoDialog({ photo, photos, onClose }: {
  photo: ReviewPhoto;
  photos: ReviewPhoto[];
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [activeIndex, setActiveIndex] = useState(() => Math.max(0, photos.findIndex((item) => item.url === photo.url)));
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const currentPhoto = photos[activeIndex] || photo;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.showModal();
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, []);

  function changePhoto(direction: number) {
    setActiveIndex((index) => (index + direction + photos.length) % photos.length);
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className="fixed inset-0 m-auto max-h-[92dvh] w-[calc(100%_-_2rem)] max-w-3xl overflow-y-auto rounded-2xl border-0 bg-[var(--paper)] p-0 text-[var(--forest)] shadow-2xl backdrop:bg-black/75 backdrop:backdrop-blur-sm"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onMouseDown={(event) => event.stopPropagation()}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
      onKeyDown={(event) => {
        if (photos.length < 2) return;
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          changePhoto(event.key === "ArrowLeft" ? -1 : 1);
        }
      }}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-2">
        <h3 id={titleId} className="m-0 text-sm font-semibold">Customer photo</h3>
        <button type="button" onClick={onClose} aria-label="Close customer photo" className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full text-xl hover:bg-[var(--surface-warm)] focus-visible:outline-2 focus-visible:outline-[var(--forest)]">&#215;</button>
      </div>
      <div className="flex min-h-44 items-center justify-center bg-black/95">
        {failedUrl === currentPhoto.url ? (
          <p className="px-5 text-center text-sm text-white">This photo could not be loaded.</p>
        ) : (
          // Customer media can be hosted outside the image optimizer's allowlist.
          // eslint-disable-next-line @next/next/no-img-element
          <img key={currentPhoto.url} src={currentPhoto.url} alt={currentPhoto.alt || "Photo shared with a customer review"} onError={() => setFailedUrl(currentPhoto.url)} className="block max-h-[calc(92dvh-8rem)] max-w-full object-contain" />
        )}
      </div>
      {photos.length > 1 && (
        <div className="flex items-center justify-between gap-3 px-3 py-2">
          <button type="button" onClick={() => changePhoto(-1)} aria-label="Previous photo" className="grid size-11 cursor-pointer place-items-center rounded-full border border-[var(--line)] text-lg hover:bg-[var(--surface-warm)] focus-visible:outline-2 focus-visible:outline-[var(--forest)]">&#8592;</button>
          <span role="status" aria-live="polite" aria-atomic="true" className="text-xs text-[var(--muted)]">Photo {activeIndex + 1} of {photos.length}</span>
          <button type="button" onClick={() => changePhoto(1)} aria-label="Next photo" className="grid size-11 cursor-pointer place-items-center rounded-full border border-[var(--line)] text-lg hover:bg-[var(--surface-warm)] focus-visible:outline-2 focus-visible:outline-[var(--forest)]">&#8594;</button>
        </div>
      )}
    </dialog>
  );
}
