"use client";

import { MediaImage as Image } from "@/shared/ui/media-image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { createPortal, flushSync } from "react-dom";
import { formatCurrency, getDefaultVariant, type Product } from "@/domain/catalog/products";
import { getComboPurchaseSummary } from "@/domain/combo-catalog";
import { useStore } from "@/features/store/store-provider";
import { useProductView } from "@/features/analytics/product-tracking";
import { useModalFocus } from "@/shared/hooks/use-modal-focus";
import styles from "./combo-preview.module.css";

type ComboPreviewProps = {
  title: string;
  ingredientLabel: string;
  image: string;
  imageFallback?: string;
  products: Product[];
  expectedProductCount: number;
  listingProduct?: Product;
  purchaseUnavailable?: boolean;
  onClose: () => void;
};

const subscribeToMount = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function ComboPreview({
  title,
  ingredientLabel,
  image,
  imageFallback,
  products,
  expectedProductCount,
  listingProduct,
  purchaseUnavailable = !listingProduct,
  onClose,
}: ComboPreviewProps) {
  const { addToCart, openCart, clearCartError, cartError, track, isCartBusy, isCartOpen, isHydrated, source } = useStore();
  const router = useRouter();
  const mounted = useSyncExternalStore(subscribeToMount, getClientSnapshot, getServerSnapshot);
  const dialogRef = useRef<HTMLElement>(null);
  const onCloseRef = useRef(onClose);
  const titleId = useId();
  const descriptionId = useId();
  const noticeId = useId();
  const photoTitleId = useId();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [variantId, setVariantId] = useState(listingProduct ? getDefaultVariant(listingProduct)?.id || "" : "");
  const submittingRef = useRef(false);
  const [photoProduct, setPhotoProduct] = useState<Product | null>(null);
  const [photoIndex, setPhotoIndex] = useState(0);
  const photoProductRef = useRef<Product | null>(null);
  const photoTriggerRef = useRef<HTMLButtonElement | null>(null);
  const backToComboRef = useRef<HTMLButtonElement | null>(null);
  const comboScrollRef = useRef(0);
  const backToCombo = useCallback(() => {
    photoProductRef.current = null;
    setPhotoProduct(null);
  }, []);

  function openProductPhotos(product: Product, trigger: HTMLButtonElement) {
    if (submittingRef.current) return;
    photoTriggerRef.current = trigger;
    comboScrollRef.current = dialogRef.current?.scrollTop || 0;
    photoProductRef.current = product;
    setPhotoIndex(0);
    setPhotoProduct(product);
  }

  useEffect(() => {
    if (photoProduct) {
      if (dialogRef.current) dialogRef.current.scrollTop = 0;
      backToComboRef.current?.focus({ preventScroll: true });
    } else if (photoTriggerRef.current) {
      if (dialogRef.current) dialogRef.current.scrollTop = comboScrollRef.current;
      photoTriggerRef.current.focus({ preventScroll: true });
    }
  }, [photoProduct]);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);
  const close = useCallback(() => {
    if (submittingRef.current) return;
    if (photoProductRef.current) backToCombo();
    else onCloseRef.current();
  }, [backToCombo]);

  // The cart has its own focus trap. Release this one before the cart opens,
  // so its initial focus and scroll lock cannot be undone by this dialog.
  useModalFocus(mounted && !isCartOpen, dialogRef, close);

  const { items } = getComboPurchaseSummary(products, expectedProductCount, source);
  const selectedVariant = listingProduct?.variants?.find((variant) => variant.id === variantId) || (listingProduct ? getDefaultVariant(listingProduct) : null);
  const selectedProduct = listingProduct ? { ...listingProduct, variants: selectedVariant ? [selectedVariant] : listingProduct.variants } : undefined;
  useProductView(listingProduct, selectedVariant);
  const summary = getComboPurchaseSummary(selectedProduct ? [selectedProduct] : [], 1, source);
  const { total, currencyCode } = summary;
  const missingListing = purchaseUnavailable || !listingProduct;
  const available = !missingListing && listingProduct.availableForSale !== false && summary.purchasable;
  const notice = missingListing ? "This combo is coming soon. You can still shop the individual jars." : !available ? "This combo is currently unavailable." : "";
  const canShowTotal = !missingListing && summary.canShowTotal;
  const maximum = Math.max(0, Math.min(12, selectedVariant?.quantityAvailable ?? 12));
  const purchaseQuantity = Math.min(quantity, Math.max(1, maximum));
  const busy = isSubmitting || isCartBusy || !isHydrated;
  const photoCandidates = photoProduct ? [photoProduct.featuredImage, ...(photoProduct.images || [])] : [];
  const photos = photoCandidates.filter((photo, index, all) => photo?.url && all.findIndex((candidate) => candidate?.url === photo.url) === index).filter((photo) => photo != null);
  const displayedPhotos = photos.length ? photos : [{ url: "/images/product-placeholder.svg", altText: photoProduct?.name || "Product photo", width: 800, height: 800 }];
  const activePhotoIndex = Math.min(photoIndex, displayedPhotos.length - 1);
  const activePhoto = displayedPhotos[activePhotoIndex];

  async function addCombo(checkout = false) {
    if (busy || submittingRef.current || !available || !listingProduct) return;
    submittingRef.current = true;
    setError("");
    clearCartError();
    setIsSubmitting(true);
    try {
      // Add the single priced combo variant, never its constituent jars.
      const cart = await addToCart(listingProduct.slug, purchaseQuantity, false, summary.items[0]?.variant?.id, listingProduct);
      if (cart) {
        submittingRef.current = false;
        // Release the dialog's focus trap before opening another surface.
        flushSync(close);
        if (checkout) {
          track("view_checkout", { mode: "in_app_checkout" });
          router.push("/checkout");
        } else openCart();
      } else {
        setError("We could not add the complete pairing. Please check your bag and try again.");
      }
    } catch {
      setError("We could not add this pairing. Please try again in a moment.");
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  if (!mounted) return null;

  return createPortal(
    <div
      className={styles.overlay}
      hidden={isCartOpen}
      onClick={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) close();
      }}
    >
      <section
        ref={dialogRef}
        className={`${styles.dialog} ${photoProduct ? styles.photoDialog : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={photoProduct ? photoTitleId : titleId}
        aria-describedby={photoProduct ? undefined : descriptionId}
        tabIndex={-1}
        onKeyDown={(event) => {
          if (!photoProduct || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
          event.preventDefault();
          setPhotoIndex(event.key === "Home" ? 0 : event.key === "End" ? displayedPhotos.length - 1 : Math.max(0, Math.min(displayedPhotos.length - 1, activePhotoIndex + (event.key === "ArrowRight" ? 1 : -1))));
        }}
      >
        {photoProduct && <div className={styles.photoViewer}>
          <header className={styles.photoHeader}>
            <button ref={backToComboRef} type="button" className={styles.backToCombo} onClick={backToCombo}>← Back to combo</button>
            <h2 id={photoTitleId}>{photoProduct.name} photos</h2>
            <button type="button" className={styles.closePhotos} aria-label="Close product photos" onClick={backToCombo}>×</button>
          </header>
          <div className={styles.largePhoto}>
            <Image key={activePhoto.url} src={activePhoto.url} alt={activePhoto.altText || photoProduct.name} fill sizes="(max-width: 640px) 90vw, 860px" className={styles.fullPhoto} />
          </div>
          <nav className={styles.photoNavigation} aria-label={`${photoProduct.name} photos`}>
            <button type="button" aria-label="Previous product photo" disabled={activePhotoIndex === 0} onClick={() => setPhotoIndex(activePhotoIndex - 1)}>←</button>
            <span role="status" aria-live="polite">Photo {activePhotoIndex + 1} of {displayedPhotos.length}</span>
            <button type="button" aria-label="Next product photo" disabled={activePhotoIndex === displayedPhotos.length - 1} onClick={() => setPhotoIndex(activePhotoIndex + 1)}>→</button>
          </nav>
          {displayedPhotos.length > 1 && <div className={styles.photoThumbnails} aria-label="Choose a product photo">
            {displayedPhotos.map((photo, index) => <button key={photo.url} type="button" aria-label={`Show photo ${index + 1} of ${photoProduct.name}`} aria-pressed={index === activePhotoIndex} onClick={() => setPhotoIndex(index)}><Image src={photo.url} alt="" fill sizes="64px" className={styles.image} /></button>)}
          </div>}
        </div>}
        <div className={styles.comboContents} hidden={Boolean(photoProduct)} inert={Boolean(photoProduct)}>
        <button
          type="button"
          className={styles.close}
          onClick={close}
          aria-label="Close combo preview"
          disabled={isSubmitting}
          data-autofocus
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
            <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>
        <div className={styles.photo}>
          <Image
            src={image}
            fallbackSrc={imageFallback}
            alt={`${ingredientLabel} botanical powder pairing`}
            fill
            sizes="(max-width: 640px) 92vw, 400px"
            className={styles.image}
          />
        </div>
        <div className={styles.content}>
          <p className={styles.eyebrow}>A ritual, better together</p>
          <h2 id={titleId} className={styles.title}>{title}</h2>
          <p id={descriptionId} className={styles.ingredients}>{ingredientLabel}</p>
          <p className={styles.quantity}>{expectedProductCount > 0 ? `${expectedProductCount} jars in this combo. ` : ""}Tap a photo to enlarge it, or a product name for details.</p>
          <ul className={styles.products}>
            {items.map(({ product, variant, price, currency, available }) => (
              <li key={product.slug} className={styles.product}>
                <button type="button" className={`${styles.thumbnail} ${styles.photoTrigger}`} aria-label={`View photos of ${product.name}`} onClick={(event) => openProductPhotos(product, event.currentTarget)} disabled={isSubmitting}>
                  <Image src={product.featuredImage?.url || product.images?.[0]?.url || "/images/product-placeholder.svg"} alt={product.name} fill sizes="56px" className={styles.image} />
                  <span aria-hidden="true">↗</span>
                </button>
                <details className={styles.productDetails}>
                  <summary className={styles.productSummary}>
                    <span className={styles.productInfo}>
                      <span className={styles.productLink}>{product.name}</span>
                      <span className={styles.productMeta}>{variant?.title && variant.title !== "Default Title" ? variant.title : product.size}</span>
                    </span>
                    <span className={styles.expand} aria-hidden="true">+</span>
                  </summary>
                  <div className={styles.productDescription}>
                    <button type="button" className={styles.productPhotosLink} onClick={(event) => openProductPhotos(product, event.currentTarget)} disabled={isSubmitting}>View product photos ↗</button>
                    {product.shortDescription && <p>{product.shortDescription}</p>}
                    {product.ingredient && <p><strong>Ingredients:</strong> {product.ingredient}</p>}
                    {product.howTo?.length > 0 && <ol>{product.howTo.map((step, index) => <li key={index}>{step}</li>)}</ol>}
                    <p>Individual price: {Number.isFinite(price) && price >= 0 ? formatCurrency(price, currency) : "Price unavailable"}{!available && " · Individually unavailable"}</p>
                    <Link href={`/shop/${product.slug}`} onClick={(event) => {
                      if (submittingRef.current) event.preventDefault();
                      else {
                        if (product.id) track("select_item", { item_id: product.id });
                        close();
                      }
                    }} className={styles.productLink}>View full product <span aria-hidden="true">↗</span></Link>
                  </div>
                </details>
              </li>
            ))}
          </ul>
          {expectedProductCount > products.length && <p className={styles.notice}>Some included product details are currently unavailable.</p>}
          {listingProduct && <div className={styles.options}>
            {(listingProduct.variants?.length || 0) > 1 && <label>Combo option<select value={variantId} disabled={busy} onChange={(event) => { setVariantId(event.target.value); setQuantity(1); setError(""); clearCartError(); }}>{listingProduct.variants?.map((variant) => <option key={variant.id} value={variant.id}>{variant.title}</option>)}</select></label>}
            <label>Quantity<select value={purchaseQuantity} disabled={busy || !available} onChange={(event) => setQuantity(Number(event.target.value))}>{Array.from({ length: Math.max(1, maximum) }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}</option>)}</select></label>
          </div>}
          {canShowTotal && (
            <div className={styles.total}>
              <span>{purchaseQuantity > 1 ? `Combo total (${purchaseQuantity} sets)` : "Combo price"}</span>
              <strong>{formatCurrency(total * purchaseQuantity, currencyCode)}</strong>
            </div>
          )}
          <div id={noticeId} className={styles.notice} aria-live="polite" aria-atomic="true">
            {notice && <p>{notice}</p>}
            {error && <p className={styles.error} role="alert">{cartError || error}</p>}
          </div>
          <button
            type="button"
            className={styles.add}
            disabled={busy || !available}
            onClick={() => addCombo()}
            aria-describedby={notice || error ? noticeId : undefined}
            aria-busy={isSubmitting}
          >
            <span>{missingListing ? "Coming soon" : isSubmitting ? "Adding your ritual…" : "Add combo to bag"}</span>
            <span aria-hidden="true">→</span>
          </button>
          {!missingListing && <button type="button" className={`${styles.add} ${styles.buyNow}`} disabled={busy || !available} onClick={() => addCombo(true)} aria-busy={isSubmitting}><span>Buy now</span><span aria-hidden="true">→</span></button>}
          <p className={styles.footnote}>The combo price covers the complete set. Shipping calculated at checkout.</p>
        </div>
        </div>
      </section>
    </div>,
    document.body,
  );
}
