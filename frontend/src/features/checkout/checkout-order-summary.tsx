"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { calculateCartBilling, calculateLineBilling, formatBillingCurrency } from "@/domain/cart/billing";
import { CartProductImage } from "@/features/cart/cart-product-image";
import { CartBillSummary } from "@/features/cart/cart-bill-summary";
import { useStore } from "@/features/store/store-provider";

export function CheckoutOrderSummary() {
  const {
    products,
    cart,
    totalPaise,
    discountAmountPaise,
    currencyCode,
    discountCodes,
    applyDiscountCode,
    removeDiscountCode,
    updateQuantity,
    removeFromCart,
    isCartBusy,
    cartError,
    clearCartError,
  } = useStore();

  const [discountInput, setDiscountInput] = useState("");
  const [discountStatus, setDiscountStatus] = useState("");

  const handleDiscountSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!discountInput.trim() || isCartBusy) return;
    setDiscountStatus("");
    const success = await applyDiscountCode(discountInput.trim());
    if (success) {
      setDiscountStatus(`Discount code "${discountInput.trim()}" applied!`);
      setDiscountInput("");
    }
  };

  const billing = calculateCartBilling({ items: cart, totalPaise, discountAmountPaise });

  return (
    <aside
      className="flex min-w-0 flex-col gap-6 rounded-3xl border border-[var(--line)] bg-[var(--paper)] p-7 shadow-[0_16px_40px_rgba(21,59,45,0.06)] min-[901px]:sticky min-[901px]:top-[calc(var(--header-height)+24px)] max-[680px]:p-5"
      aria-label="Order summary"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
        <h3 className="font-serif text-[1.4rem] font-normal text-[var(--forest)]">
          Ritual Bag Summary
        </h3>
        <span className="inline-flex items-center justify-center rounded-full bg-[var(--ivory)] px-3.5 py-1 text-[0.72rem] font-bold text-[var(--forest)] whitespace-nowrap shrink-0">
          {cart.reduce((t, item) => t + item.quantity, 0)} {cart.reduce((t, item) => t + item.quantity, 0) === 1 ? "jar" : "jars"}
        </span>
      </div>

      {/* Cart Items List */}
      <div className="flex flex-col divide-y divide-[var(--line)] max-h-[380px] overflow-y-auto pr-1">
        {cart.map((item) => {
          const product = products.find((p) => item.productId && p.id === item.productId) || products.find((p) => p.slug === item.slug);
          const maxQuantity = Math.min(12, item.quantityAvailable ?? 12);
          const lineBilling = calculateLineBilling(item);
          const variantLabel = item.selectedOptions
            .map((opt) => opt.value)
            .filter((val) => val !== "Default Title")
            .join(" · ");

          return (
            <article
              key={item.lineId}
              className="grid grid-cols-[68px_minmax(0,1fr)] items-start gap-x-3.5 gap-y-2 py-4 first:pt-0 last:pb-0"
            >
              {/* Product Visual */}
              <div
                className="relative flex h-[76px] w-[70px] shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--paper)]"
                style={{
                  backgroundColor: product?.accentSoft ? `${product.accentSoft}40` : "var(--ivory)",
                }}
              >
                <CartProductImage item={item} product={product} />
              </div>

              {/* Product Info */}
              <div className="flex min-w-0 flex-col gap-1">
                <Link
                  href={`/shop/${product?.slug || item.slug}`}
                  className="truncate font-serif text-[1.08rem] font-medium text-[var(--forest)] hover:text-[var(--botanical)] transition-colors"
                >
                  {product?.name || item.productName}
                </Link>
                <span className="text-[0.74rem] text-[var(--muted)] line-clamp-1">
                  {variantLabel || product?.subtitle || item.variantTitle}
                </span>

                {/* Quantity Stepper & Remove */}
                <div className="flex items-center gap-3 pt-1">
                  <div className="inline-flex h-7 items-center rounded-full border border-[var(--line)] bg-[var(--paper)] px-1 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => void updateQuantity(item.lineId, item.quantity - 1)}
                      disabled={isCartBusy || item.quantity <= 1}
                      className="size-5 text-xs font-bold text-[var(--forest)] disabled:opacity-30 cursor-pointer flex items-center justify-center hover:bg-[var(--ivory)] rounded-full transition-colors"
                      aria-label={`Decrease ${item.productName} quantity`}
                    >
                      −
                    </button>
                    <span className="w-5 text-center text-[0.76rem] font-bold text-[var(--forest)] select-none">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => void updateQuantity(item.lineId, item.quantity + 1)}
                      disabled={isCartBusy || !item.availableForSale || item.quantity >= maxQuantity}
                      className="size-5 text-xs font-bold text-[var(--forest)] disabled:opacity-30 cursor-pointer flex items-center justify-center hover:bg-[var(--ivory)] rounded-full transition-colors"
                      aria-label={`Increase ${item.productName} quantity`}
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => void removeFromCart(item.lineId)}
                    disabled={isCartBusy}
                    className="text-[0.68rem] font-bold tracking-[0.08em] text-[var(--muted)] hover:text-red-600 transition-colors uppercase cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>

              {/* Price */}
              <div className="col-start-2 flex min-w-0 flex-col gap-1 tabular-nums">
                <span className="text-[0.7rem] text-[var(--muted)]">{item.quantity} × {formatBillingCurrency(item.pricePaise, item.currencyCode)} each</span>
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <strong className="whitespace-nowrap text-[1.05rem] text-[var(--forest)]">{formatBillingCurrency(lineBilling.totalPaise, item.currencyCode)}</strong>
                  {lineBilling.savingsPaise > 0 && <del className="whitespace-nowrap text-[0.74rem] text-[var(--muted)]">{formatBillingCurrency(lineBilling.mrpPaise, item.currencyCode)}</del>}
                </div>
                {lineBilling.savingsPaise > 0 && <span className="text-[0.7rem] font-semibold text-[#2d6a2f]">Save {formatBillingCurrency(lineBilling.savingsPaise, item.currencyCode)}</span>}
              </div>
            </article>
          );
        })}
      </div>

      {/* ── Discount Code Section ── */}
      <div className="border-t border-[var(--line)] pt-4">
        <form onSubmit={handleDiscountSubmit} className="flex gap-2">
          <input
            type="text"
            value={discountInput}
            onChange={(e) => {
              setDiscountInput(e.target.value);
              setDiscountStatus("");
              clearCartError();
            }}
            placeholder="Discount code"
            aria-label="Discount code"
            className="h-10 min-w-0 flex-1 rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3 text-[0.8rem] uppercase tracking-wider text-[var(--forest)] placeholder:normal-case placeholder:tracking-normal placeholder:text-[var(--muted)] outline-none focus:border-[var(--botanical)]"
            disabled={isCartBusy}
          />
          <button
            type="submit"
            disabled={isCartBusy || !discountInput.trim()}
            className="h-10 rounded-xl bg-[var(--forest)] px-4 text-[0.72rem] font-bold uppercase tracking-wider text-[var(--paper)] transition-colors hover:bg-[var(--forest-dark)] disabled:opacity-50 cursor-pointer"
          >
            Apply
          </button>
        </form>

        {discountStatus && (
          <p className="mt-2 text-[0.74rem] font-semibold text-[#529d38]" role="status">
            ✓ {discountStatus}
          </p>
        )}

        {cartError && (
          <p className="mt-2 text-[0.74rem] font-semibold text-[#9a3d2b]" role="alert">
            {cartError}
          </p>
        )}

        {discountCodes.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {discountCodes.map((d) => (
              <span
                key={d.code}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#edf3dd] px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-wider text-[var(--forest)] border border-[#529d38]/30"
              >
                <span>{d.code}{!d.applicable && " · Not applicable"}</span>
                <button
                  type="button"
                  onClick={() => void removeDiscountCode(d.code)}
                  disabled={isCartBusy}
                  className="size-3.5 rounded-full hover:bg-black/10 flex items-center justify-center cursor-pointer"
                  aria-label={`Remove discount ${d.code}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Financial Breakdown ── */}
      <div className="border-t border-[var(--line)] pt-4">
        <CartBillSummary billing={billing} currencyCode={currencyCode} busy={isCartBusy} shippingPending taxPending />
        <p className="mt-3 text-[0.74rem] text-[var(--muted)]">Delivery, taxes, and your final total are confirmed at secure checkout.</p>
      </div>
    </aside>
  );
}
