"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { formatCurrency } from "@/domain/catalog/products";
import { ProductJar } from "@/features/catalog/product-jar";
import { useStore } from "@/features/store/store-provider";

type CheckoutOrderSummaryProps = {
  shippingFeePaise: number;
};

export function CheckoutOrderSummary({
  shippingFeePaise,
}: CheckoutOrderSummaryProps) {
  const {
    products,
    cart,
    subtotalPaise,
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
    if (!discountInput.trim()) return;
    setDiscountStatus("");
    const success = await applyDiscountCode(discountInput.trim());
    if (success) {
      setDiscountStatus(`Discount code "${discountInput.trim()}" applied!`);
      setDiscountInput("");
    }
  };

  const finalTotalPaise = totalPaise + shippingFeePaise;

  return (
    <aside
      className="flex flex-col gap-6 rounded-3xl border border-[var(--line)] bg-[var(--paper)] p-7 shadow-[0_16px_40px_rgba(21,59,45,0.06)] min-[901px]:sticky min-[901px]:top-[calc(var(--header-height)+24px)] max-[680px]:p-5"
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
          const product = products.find((p) => p.slug === item.slug);
          const maxQuantity = Math.min(12, item.quantityAvailable ?? 12);
          const variantLabel = item.selectedOptions
            .map((opt) => opt.value)
            .filter((val) => val !== "Default Title")
            .join(" · ");

          return (
            <article
              key={item.lineId}
              className="grid grid-cols-[68px_1fr_auto] items-center gap-3.5 py-4 first:pt-0 last:pb-0"
            >
              {/* Product Visual */}
              <div
                className="relative flex h-[76px] w-[70px] shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--paper)]"
                style={{
                  backgroundColor: product?.accentSoft ? `${product.accentSoft}40` : "var(--ivory)",
                }}
              >
                {item.image?.url || product?.featuredImage?.url ? (
                  <img
                    src={item.image?.url || product?.featuredImage?.url || "/images/amla-powder.jpg"}
                    alt={item.productName}
                    className="size-full object-cover object-center"
                  />
                ) : product ? (
                  <ProductJar
                    product={product}
                    size="small"
                    className="origin-bottom scale-65"
                    decorative
                  />
                ) : (
                  <span className="text-xl">🌿</span>
                )}
              </div>

              {/* Product Info */}
              <div className="flex min-w-0 flex-col gap-1">
                <Link
                  href={`/shop/${item.slug}`}
                  className="truncate font-serif text-[1.08rem] font-medium text-[var(--forest)] hover:text-[var(--botanical)] transition-colors"
                >
                  {product?.name || item.productName}
                </Link>
                <span className="text-[0.68rem] text-[var(--muted)] line-clamp-1">
                  {variantLabel || product?.subtitle || item.variantTitle}
                </span>

                {/* Quantity Stepper & Remove */}
                <div className="flex items-center gap-3 pt-1">
                  <div className="inline-flex h-7 items-center rounded-full border border-[var(--line)] bg-[var(--paper)] px-1 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => void updateQuantity(item.lineId, item.quantity - 1)}
                      disabled={isCartBusy}
                      className="size-5 text-xs font-bold text-[var(--forest)] disabled:opacity-30 cursor-pointer flex items-center justify-center hover:bg-[var(--ivory)] rounded-full transition-colors"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="w-5 text-center text-[0.74rem] font-bold text-[var(--forest)] select-none">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => void updateQuantity(item.lineId, item.quantity + 1)}
                      disabled={isCartBusy || !item.availableForSale || item.quantity >= maxQuantity}
                      className="size-5 text-xs font-bold text-[var(--forest)] disabled:opacity-30 cursor-pointer flex items-center justify-center hover:bg-[var(--ivory)] rounded-full transition-colors"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => void removeFromCart(item.lineId)}
                    disabled={isCartBusy}
                    className="text-[0.62rem] font-bold tracking-[0.08em] text-[var(--muted)] hover:text-red-600 transition-colors uppercase cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>

              {/* Price */}
              <div className="text-right shrink-0">
                <span className="font-serif text-[1.1rem] font-medium text-[var(--forest)]">
                  {formatCurrency(item.lineTotalPaise, item.currencyCode)}
                </span>
                {item.discountAmountPaise > 0 && (
                  <span className="block text-[0.58rem] font-bold text-[#529d38]">
                    Save {formatCurrency(item.discountAmountPaise, item.currencyCode)}
                  </span>
                )}
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
            placeholder="Discount code / Gift card"
            className="h-10 flex-1 rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3 text-[0.76rem] uppercase tracking-wider text-[var(--forest)] placeholder:normal-case placeholder:tracking-normal placeholder:text-[var(--muted)] outline-none focus:border-[var(--botanical)]"
            disabled={isCartBusy}
          />
          <button
            type="submit"
            disabled={isCartBusy || !discountInput.trim()}
            className="h-10 rounded-xl bg-[var(--forest)] px-4 text-[0.68rem] font-bold uppercase tracking-wider text-[var(--paper)] transition-colors hover:bg-[var(--forest-dark)] disabled:opacity-50 cursor-pointer"
          >
            Apply
          </button>
        </form>

        {discountStatus && (
          <p className="mt-2 text-[0.68rem] font-semibold text-[#529d38]" role="status">
            ✓ {discountStatus}
          </p>
        )}

        {cartError && (
          <p className="mt-2 text-[0.68rem] font-semibold text-[#9a3d2b]" role="alert">
            {cartError}
          </p>
        )}

        {discountCodes.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {discountCodes.map((d) => (
              <span
                key={d.code}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#edf3dd] px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-wider text-[var(--forest)] border border-[#529d38]/30"
              >
                <span>🏷️ {d.code}</span>
                <button
                  type="button"
                  onClick={() => void removeDiscountCode(d.code)}
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
      <dl className="flex flex-col gap-2.5 border-t border-[var(--line)] pt-4 text-[0.78rem] text-[var(--muted)]">
        <div className="flex items-center justify-between">
          <dt>Subtotal</dt>
          <dd className="font-semibold text-[var(--forest)]">
            {formatCurrency(subtotalPaise, currencyCode)}
          </dd>
        </div>

        {discountAmountPaise > 0 && (
          <div className="flex items-center justify-between text-[#529d38]">
            <dt>Discount Savings</dt>
            <dd className="font-semibold">
              −{formatCurrency(discountAmountPaise, currencyCode)}
            </dd>
          </div>
        )}

        <div className="flex items-center justify-between">
          <dt>Shipping</dt>
          <dd className="font-semibold text-[var(--forest)]">
            {shippingFeePaise === 0 ? (
              <span className="text-[#529d38]">FREE</span>
            ) : (
              formatCurrency(shippingFeePaise, currencyCode)
            )}
          </dd>
        </div>

        <div className="flex items-center justify-between">
          <dt>Estimated Taxes (GST)</dt>
          <dd className="font-medium text-[var(--muted)]">Included</dd>
        </div>

        <div className="mt-2 flex items-baseline justify-between border-t border-[var(--line)] pt-3.5 text-[var(--forest)]">
          <dt className="text-[0.92rem] font-bold">Total Payable</dt>
          <dd className="[font-family:var(--font-display)] text-[1.75rem] font-bold">
            {formatCurrency(finalTotalPaise, currencyCode)}
          </dd>
        </div>
      </dl>
    </aside>
  );
}
