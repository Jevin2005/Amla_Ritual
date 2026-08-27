"use client";

import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/features/store/store-provider";
import { CheckoutForm, type OrderConfirmationData } from "./checkout-form";
import { CheckoutOrderSummary } from "./checkout-order-summary";
import { CheckoutOrderSuccess } from "./checkout-order-success";

const primaryButtonClass =
  "inline-flex min-h-[52px] items-center justify-center gap-[14px] rounded-full border border-transparent bg-[var(--forest)] px-7 py-[14px] text-[0.74rem] font-bold uppercase leading-none tracking-[0.12em] text-[var(--paper)] shadow-[0_10px_26px_rgba(21,59,45,0.18)] transition-[transform,background-color,box-shadow] duration-[350ms] ease-[var(--ease)] hover:-translate-y-0.5 hover:bg-[var(--forest-dark)] hover:shadow-[0_14px_30px_rgba(21,59,45,0.22)]";

export function CheckoutPreview() {
  const { source, cart, isHydrated, cartError } = useStore();
  const [confirmedOrder, setConfirmedOrder] = useState<OrderConfirmationData | null>(null);
  const [shippingFeePaise, setShippingFeePaise] = useState(0);

  // If order was placed successfully, show the Order Confirmation Screen
  if (confirmedOrder) {
    return <CheckoutOrderSuccess order={confirmedOrder} />;
  }

  // Hydration state
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
        <p className="max-w-[360px] text-[var(--muted)] mt-2">
          {source === "shopify"
            ? "Connecting with Shopify for current prices and inventory…"
            : "Checking the botanicals saved on this device…"}
        </p>
      </section>
    );
  }

  // Empty Cart State
  if (!cart.length) {
    return (
      <section className="mx-auto flex min-h-[560px] w-full max-w-[960px] flex-col items-center justify-center px-6 py-[70px] text-center max-[680px]:min-h-[480px]">
        <span
          className="mb-[30px] grid size-[90px] place-items-center rounded-full border border-[var(--line)] text-2xl text-[var(--botanical)]"
          aria-hidden="true"
        >
          🌿
        </span>
        <h2 className="m-0 font-serif text-[clamp(2rem,3vw,3rem)] leading-[1.04] text-[var(--forest)]">
          Your ritual bag is waiting.
        </h2>
        <p className="max-w-[420px] text-[var(--muted)] mt-2.5 text-[0.85rem]">
          {cartError || "Select a fresh wildcrafted botanical powder to begin your wash-day ritual checkout."}
        </p>
        <Link className={`${primaryButtonClass} mt-6`} href="/shop">
          Shop the Botanical Collection
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto flex flex-col min-[961px]:grid min-[961px]:grid-cols-[1.15fr_0.85fr] w-full max-w-[1280px] gap-[clamp(28px,4vw,72px)] px-[clamp(16px,4vw,56px)] pb-[120px] pt-[35px] max-[680px]:px-3.5 max-[680px]:pb-[80px] max-[680px]:pt-[20px]">
      {/* ── Left Column on Desktop / 2nd on Mobile (Phone View): Checkout Form ── */}
      <div className="order-2 min-[961px]:order-1 w-full">
        <div className="mb-6 max-[960px]:mt-2">
          <h2 className="font-serif text-[clamp(2.1rem,3.8vw,3.4rem)] font-normal leading-[1] tracking-tight text-[var(--forest)]">
            Delivery & Payment
          </h2>
          <p className="mt-1.5 text-[0.82rem] text-[var(--muted)] max-w-[580px]">
            Enter your shipping details below. All herbal jars are freshly packed, sealed in UV-protected jars, and dispatched across India.
          </p>
        </div>

        {/* Interactive Checkout Form */}
        <CheckoutForm
          onOrderSuccess={(order) => setConfirmedOrder(order)}
          shippingFeePaise={shippingFeePaise}
          onShippingChange={(fee) => setShippingFeePaise(fee)}
        />
      </div>

      {/* ── Right Column on Desktop / 1st at TOP on Mobile (Phone View): Ritual Bag Summary ── */}
      <div className="order-1 min-[961px]:order-2 self-start w-full">
        <CheckoutOrderSummary shippingFeePaise={shippingFeePaise} />
      </div>
    </section>
  );
}
