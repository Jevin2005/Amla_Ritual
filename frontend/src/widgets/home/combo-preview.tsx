"use client";

import { MediaImage as Image } from "@/shared/ui/media-image";
import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { createPortal, flushSync } from "react-dom";
import { formatCurrency, getDefaultVariant, type Product } from "@/domain/catalog/products";
import { useStore } from "@/features/store/store-provider";
import { useModalFocus } from "@/shared/hooks/use-modal-focus";
import styles from "./combo-preview.module.css";

type ComboPreviewProps = {
  title: string;
  ingredientLabel: string;
  image: string;
  products: Product[];
  expectedProductCount: number;
  onClose: () => void;
};

const subscribeToMount = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function ComboPreview({
  title,
  ingredientLabel,
  image,
  products,
  expectedProductCount,
  onClose,
}: ComboPreviewProps) {
  const { addManyToCart, isCartBusy, isCartOpen, isHydrated, source } = useStore();
  const mounted = useSyncExternalStore(subscribeToMount, getClientSnapshot, getServerSnapshot);
  const dialogRef = useRef<HTMLElement>(null);
  const onCloseRef = useRef(onClose);
  const titleId = useId();
  const descriptionId = useId();
  const noticeId = useId();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);
  const close = useCallback(() => onCloseRef.current(), []);

  // The cart has its own focus trap. Release this one before the cart opens,
  // so its initial focus and scroll lock cannot be undone by this dialog.
  useModalFocus(mounted && !isCartOpen && !isSubmitting, dialogRef, close);

  const items = products.map((product) => {
    const variant = getDefaultVariant(product);
    return {
      product,
      variant,
      price: variant?.pricePaise ?? product.pricePaise,
      currency: variant?.currencyCode || product.currencyCode || "INR",
      available:
        (variant?.availableForSale ?? product.availableForSale ?? true) &&
        (variant?.quantityAvailable == null || variant.quantityAvailable > 0),
      purchasable: source !== "shopify" || /^gid:\/\/shopify\/ProductVariant\/\d+$/.test(variant?.id || ""),
    };
  });
  const complete =
    expectedProductCount > 0 &&
    items.length === expectedProductCount &&
    new Set(products.map((product) => product.slug)).size === expectedProductCount;
  const mixedCurrencies = new Set(items.map((item) => item.currency)).size > 1;
  const invalidPrice = items.some((item) => !Number.isFinite(item.price) || item.price < 0);
  const unavailable = items.some((item) => !item.available || !item.purchasable);
  const notice = !complete
    ? "This complete pairing is not available right now. You can explore the individual jars below."
    : mixedCurrencies || invalidPrice
      ? "This pairing cannot be added together right now. Please view the individual jars for current pricing."
      : unavailable
        ? "One or more jars are currently unavailable. Explore each jar for availability."
        : "";
  const total = items.reduce((sum, item) => sum + item.price, 0);
  const canShowTotal = complete && !mixedCurrencies && !invalidPrice;
  const busy = isSubmitting || isCartBusy || !isHydrated;

  async function addCombo() {
    if (busy || notice) return;
    setError("");
    // addManyToCart opens the drawer synchronously, before its request resolves.
    flushSync(() => setIsSubmitting(true));
    try {
      const cart = await addManyToCart(products.map((product) => product.slug));
      if (cart) {
        close();
      } else {
        setError("We could not add the complete pairing. Please check your bag and try again.");
      }
    } catch {
      setError("We could not add this pairing. Please try again in a moment.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!mounted) return null;

  return createPortal(
    <div
      className={styles.overlay}
      hidden={isCartOpen || isSubmitting}
      onClick={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) close();
      }}
    >
      <section
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
      >
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
          <p className={styles.quantity}>One of each jar. A little time for yourself.</p>
          <ul className={styles.products}>
            {items.map(({ product, variant, price, currency, available }) => (
              <li key={product.slug} className={styles.product}>
                <div>
                  <Link href={`/shop/${product.slug}`} onClick={close} className={styles.productLink}>
                    {product.name}
                    <span aria-hidden="true">↗</span>
                  </Link>
                  <p className={styles.productMeta}>
                    {variant?.title && variant.title !== "Default Title" ? variant.title : product.size}
                    {!available && <span> · Currently unavailable</span>}
                  </p>
                </div>
                <span className={styles.price}>
                  {Number.isFinite(price) && price >= 0 ? formatCurrency(price, currency) : "Price unavailable"}
                </span>
              </li>
            ))}
          </ul>
          {canShowTotal && (
            <div className={styles.total}>
              <span>Combined total</span>
              <strong>{formatCurrency(total, items[0].currency)}</strong>
            </div>
          )}
          <div id={noticeId} className={styles.notice} aria-live="polite" aria-atomic="true">
            {notice && <p>{notice}</p>}
            {error && <p className={styles.error}>{error}</p>}
          </div>
          <button
            type="button"
            className={styles.add}
            disabled={busy || Boolean(notice)}
            onClick={addCombo}
            aria-describedby={notice || error ? noticeId : undefined}
            aria-busy={isSubmitting}
          >
            <span>{isSubmitting ? "Adding your ritual…" : "Add combo to bag"}</span>
            <span aria-hidden="true">→</span>
          </button>
          <p className={styles.footnote}>Individual jars, thoughtfully paired. Shipping calculated at checkout.</p>
        </div>
      </section>
    </div>,
    document.body,
  );
}
