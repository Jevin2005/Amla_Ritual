"use client";

import Link from "next/link";
import { formatCurrency } from "@/domain/catalog/products";
import { ProductJar } from "@/features/catalog/product-jar";
import { useStore } from "@/features/store/store-provider";

const primaryButtonClass =
  "inline-flex min-h-[52px] items-center justify-center gap-[14px] rounded-full border border-transparent bg-[var(--forest)] px-6 py-[13px] text-[0.72rem] font-bold uppercase leading-none tracking-[0.12em] text-[var(--paper)] shadow-[0_10px_26px_rgba(21,59,45,0.18)] transition-[transform,background-color,box-shadow] duration-[350ms] ease-[var(--ease)] hover:-translate-y-0.5 hover:bg-[var(--forest-dark)] hover:shadow-[0_14px_30px_rgba(21,59,45,0.22)]";

export function CheckoutPreview() {
  const {
    products,
    source,
    cart,
    isHydrated,
    isCartBusy,
    subtotalPaise,
    totalPaise,
    discountAmountPaise,
    currencyCode,
    totalsEstimated,
    discountCodes,
    checkoutUrl,
    cartError,
    openCart,
    track,
  } = useStore();

  if (!isHydrated) {
    return (
      <section
        className="mx-auto flex min-h-[560px] w-full max-w-[960px] flex-col items-center justify-center px-6 py-[70px] text-center max-[680px]:min-h-[480px]"
        aria-busy="true"
        aria-live="polite"
      >
        <span
          className="mb-[30px] grid size-[90px] animate-pulse place-items-center rounded-full border border-[var(--line)] text-2xl text-[var(--botanical)] motion-reduce:animate-none"
          aria-hidden="true"
        >
          ◯
        </span>
        <p className="m-0 font-serif text-[clamp(2rem,3vw,3rem)] leading-[1.04]">
          Restoring your ritual bag.
        </p>
        <p className="max-w-[360px] text-[var(--muted)]">
          {source === "shopify"
            ? "Asking Shopify for the latest prices and availability…"
            : "Checking the botanicals saved on this device…"}
        </p>
      </section>
    );
  }

  if (!cart.length) {
    return (
      <section className="mx-auto flex min-h-[560px] w-full max-w-[960px] flex-col items-center justify-center px-6 py-[70px] text-center max-[680px]:min-h-[480px]">
        <span
          className="mb-[30px] grid size-[90px] place-items-center rounded-full border border-[var(--line)] text-2xl text-[var(--botanical)]"
          aria-hidden="true"
        >
          ◯
        </span>
        <p className="m-0 font-serif text-[clamp(2rem,3vw,3rem)] leading-[1.04]">
          Your bag is waiting.
        </p>
        <p className="max-w-[420px] text-[var(--muted)]">
          {cartError || "Add a botanical ritual before continuing to checkout."}
        </p>
        <Link className={`${primaryButtonClass} mt-[15px]`} href="/shop">
          Shop the collection
        </Link>
      </section>
    );
  }

  const unavailableItems = cart.filter((item) => !item.availableForSale);

  return (
    <section className="mx-auto grid w-full max-w-[1280px] grid-cols-[1fr_0.82fr] gap-[clamp(52px,7vw,96px)] px-[clamp(24px,5vw,64px)] pb-[140px] pt-[95px] max-[900px]:grid-cols-1 max-[680px]:px-5 max-[680px]:pb-[100px] max-[680px]:pt-[72px]">
      <div>
        <p className="mb-4 text-[0.68rem] font-bold uppercase leading-[1.3] tracking-[0.2em] text-[var(--botanical)]">
          {source === "shopify" ? "Secure Shopify checkout" : "Safe checkout preview"}
        </p>
        <h2 className="m-0 max-w-[12ch] font-serif text-[clamp(3.2rem,5vw,5.5rem)] font-normal leading-[0.94] tracking-[-0.055em] text-[var(--forest)] text-balance">
          {source === "shopify"
            ? "Your hosted checkout is ready."
            : "Preview the handoff, without payment."}
        </h2>
        <p className="max-w-[650px] leading-[1.75] text-[var(--muted)]">
          {source === "shopify"
            ? "Your bag, discount codes and current merchandise totals came directly from Shopify. Continue to Shopify to enter delivery and payment details securely."
            : "Preview mode never asks for card details or creates an order. Connect Shopify to turn this review into a secure hosted checkout handoff."}
        </p>

        {source === "shopify" ? (
          <div className="my-7 grid gap-[7px] rounded-[var(--radius-md)] border border-[var(--line)] border-l-[4px] border-l-[var(--amla)] bg-[var(--paper)] p-6 shadow-[0_12px_34px_rgba(21,59,45,0.06)]">
            <strong>Payment stays on Shopify’s hosted checkout.</strong>
            <span className="text-[0.78rem] text-[var(--muted)]">
              Shipping, taxes, delivery options and the final inventory check appear there before payment.
            </span>
          </div>
        ) : (
          <div className="my-7 grid gap-[7px] rounded-[var(--radius-md)] border border-[var(--line)] border-l-[4px] border-l-[var(--amla)] bg-[var(--paper)] p-6 shadow-[0_12px_34px_rgba(21,59,45,0.06)]">
            <strong>No payment data is collected here.</strong>
            <span className="text-[0.78rem] text-[var(--muted)]">
              Prices, inventory, shipping, tax and discount rules remain preview data until Shopify is configured.
            </span>
          </div>
        )}

        {unavailableItems.length > 0 && (
          <p
            className="my-5 rounded-[var(--radius-sm)] bg-[#f7e9e4] px-4 py-3 text-[0.74rem] leading-[1.6] text-[#813c2f]"
            role="alert"
          >
            {unavailableItems.length === 1
              ? `${unavailableItems[0].productName} is no longer available. Update your bag before checkout.`
              : `${unavailableItems.length} items are no longer available. Update your bag before checkout.`}
          </p>
        )}
        {cartError && (
          <p
            className="my-5 rounded-[var(--radius-sm)] bg-[#f7e9e4] px-4 py-3 text-[0.74rem] leading-[1.6] text-[#813c2f]"
            role="alert"
          >
            {cartError}
          </p>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-5">
          {source === "shopify" &&
          checkoutUrl &&
          !unavailableItems.length &&
          !isCartBusy ? (
            <a
              className={primaryButtonClass}
              href={checkoutUrl}
              onClick={() =>
                track("begin_checkout", {
                  value: totalPaise / 100,
                  currency: currencyCode,
                  mode: "shopify_hosted",
                })
              }
            >
              Continue securely with Shopify <span aria-hidden="true">↗</span>
            </a>
          ) : source === "shopify" ? (
            <button className={primaryButtonClass} type="button" disabled>
              {isCartBusy ? "Updating your bag…" : "Checkout unavailable"}
            </button>
          ) : null}
          <button
            className="inline-flex min-h-[52px] items-center justify-center gap-[14px] rounded-full border border-[var(--forest)] bg-transparent px-6 py-[13px] text-[0.72rem] font-bold uppercase leading-none tracking-[0.12em] text-[var(--forest)] transition-[transform,background-color,color,border-color] duration-[350ms] ease-[var(--ease)] hover:-translate-y-0.5 hover:bg-[var(--forest)] hover:text-[var(--paper)]"
            type="button"
            onClick={openCart}
          >
            Return to bag
          </button>
          <Link
            className="inline-flex items-center gap-3.5 border-b border-[var(--forest)] pb-[5px] text-[0.76rem] font-bold uppercase tracking-[0.08em] text-[var(--forest)] transition-[gap] duration-[260ms] ease-[var(--ease)] hover:gap-[22px]"
            href="/shop"
          >
            Continue exploring ↗
          </Link>
        </div>
      </div>

      <aside
        className="self-start rounded-[var(--radius-lg)] bg-[var(--paper)] p-[30px] shadow-[var(--shadow-soft)] ring-1 ring-[var(--line)] min-[901px]:sticky min-[901px]:top-[calc(var(--header-height)+24px)] max-[680px]:rounded-[var(--radius-md)] max-[680px]:px-5 max-[680px]:py-6"
        aria-label="Order summary"
        aria-busy={isCartBusy}
      >
        <p className="mb-4 text-[0.68rem] font-bold uppercase leading-[1.3] tracking-[0.2em] text-[var(--botanical)]">
          {source === "shopify" ? "Shopify order summary" : "Order preview"}
        </p>
        <div className="border-t border-[var(--line)]">
          {cart.map((item) => {
            const product = products.find((entry) => entry.slug === item.slug);
            const variantLabel = item.selectedOptions
              .map((option) => option.value)
              .filter((value) => value !== "Default Title")
              .join(" · ");
            return (
              <article
                className="grid grid-cols-[68px_1fr_auto] items-center gap-3 border-b border-[var(--line)] py-[15px] max-[680px]:grid-cols-[58px_1fr]"
                key={item.lineId}
              >
                <span
                  className="flex h-[82px] w-[68px] items-end justify-center overflow-hidden rounded-[var(--radius-sm)] ring-1 ring-[var(--line)]"
                  style={{
                    backgroundColor: product?.accentSoft || "var(--ivory-deep)",
                  }}
                >
                  {product ? (
                    <ProductJar
                      product={product}
                      size="small"
                      className="origin-bottom scale-50"
                      decorative
                    />
                  ) : null}
                </span>
                <div>
                  <strong className="block font-serif font-normal text-[var(--forest)]">
                    {product?.name || item.productName}
                  </strong>
                  <small className="block text-[0.68rem] text-[var(--muted)]">
                    {variantLabel ? `${variantLabel} · ` : ""}Quantity {item.quantity}
                  </small>
                  {!item.availableForSale && (
                    <small className="font-bold text-[#9a3d2b]">Unavailable</small>
                  )}
                </div>
                <em className="font-serif not-italic text-[var(--forest)] max-[680px]:col-start-2">
                  {formatCurrency(item.lineTotalPaise, item.currencyCode)}
                </em>
              </article>
            );
          })}
        </div>

        {discountCodes.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {discountCodes.map((discount) => (
              <span
                className={`rounded-full px-3 py-1.5 text-[0.6rem] font-bold tracking-[0.05em] uppercase ring-1 ${
                  discount.applicable
                    ? "bg-[#edf3dd] text-[var(--forest)] ring-[#b8c88f]"
                    : "bg-[#f7e9e4] text-[#813c2f] ring-[#d9aaa0]"
                }`}
                key={discount.code}
              >
                {discount.code}
              </span>
            ))}
          </div>
        )}

        <dl className="mt-[22px] border-t border-[var(--line)] pt-[18px] text-[0.76rem] text-[var(--muted)]">
          <div className="flex items-center justify-between py-1">
            <dt>Subtotal</dt>
            <dd className="m-0">{formatCurrency(subtotalPaise, currencyCode)}</dd>
          </div>
          {discountAmountPaise > 0 && (
            <div className="flex items-center justify-between py-1 text-[var(--botanical)]">
              <dt>Discount savings</dt>
              <dd className="m-0">−{formatCurrency(discountAmountPaise, currencyCode)}</dd>
            </div>
          )}
          <div className="mt-2 flex items-center justify-between border-t border-[var(--line)] pt-4 text-[var(--forest)]">
            <dt>{source === "shopify" && totalsEstimated ? "Estimated total" : "Total"}</dt>
            <dd className="m-0 font-serif text-[1.4rem]">
              {formatCurrency(totalPaise, currencyCode)}
            </dd>
          </div>
        </dl>
        <p className="mt-3 text-[0.74rem] leading-[1.65] text-[var(--muted)]">
          {source === "shopify"
            ? "Shopify calculates final shipping, taxes and delivery choices after you continue."
            : "This is not a payable total. Preview mode cannot place an order."}
        </p>
      </aside>
    </section>
  );
}
