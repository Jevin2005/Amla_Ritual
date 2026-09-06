"use client";

import Link from "next/link";
import { useState } from "react";
import { formatCurrency } from "@/domain/catalog/products";
import type { OrderConfirmationData } from "./checkout-form";

type CheckoutOrderSuccessProps = {
  order: OrderConfirmationData;
};

export function CheckoutOrderSuccess({ order }: CheckoutOrderSuccessProps) {
  const [copied, setCopied] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyRef = async () => {
    try {
      await navigator.clipboard.writeText(order.orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <>
      {/* ── Print Specific Stylesheet (Guaranteed 1-Page A4) ── */}
      <style jsx global>{`
        @media print {
          /* Hide all general site and non-printable elements */
          header,
          footer,
          nav,
          aside,
          .no-print,
          [data-site-header],
          [data-site-footer],
          [data-banner] {
            display: none !important;
          }

          html,
          body {
            height: 100% !important;
            overflow: visible !important;
            background: #ffffff !important;
            color: #111827 !important;
            font-size: 9.5pt !important;
            line-height: 1.35 !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          @page {
            size: A4 portrait;
            margin: 8mm 12mm 8mm 12mm;
          }

          .print-receipt-container {
            display: flex !important;
            flex-direction: column !important;
            width: 100% !important;
            max-width: 100% !important;
            min-height: 98% !important;
            padding: 0 !important;
            margin: 0 !important;
            background: #ffffff !important;
            box-shadow: none !important;
            border: none !important;
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
            break-inside: avoid !important;
            break-after: avoid !important;
          }

          .screen-only-view {
            display: none !important;
          }
        }

        @media screen {
          .print-only-view {
            display: none !important;
          }
        }
      `}</style>

      {/* ══════════════════════════════════════════════════
          1. SCREEN VIEW (Interactive Online UI)
          ══════════════════════════════════════════════════ */}
      <section className="screen-only-view mx-auto flex w-full max-w-[840px] flex-col items-center px-6 py-16 text-center max-[680px]:px-4 max-[680px]:py-10">
        {/* Celebration Icon */}
        <div className="relative mb-6">
          <span className="grid size-20 place-items-center rounded-full bg-[#edf3dd] text-3xl ring-8 ring-[#edf3dd]/50">
            🌿
          </span>
          <span className="absolute -bottom-1 -right-1 grid size-7 place-items-center rounded-full bg-[#529d38] text-xs text-white ring-2 ring-white">
            ✓
          </span>
        </div>

        <p className="mb-2 text-[0.72rem] font-bold uppercase tracking-[0.2em] text-[#529d38]">
          Order Confirmed & Preparing
        </p>

        <h1 className="font-serif text-[clamp(2.4rem,4.5vw,3.8rem)] font-normal leading-[1.05] tracking-tight text-[var(--forest)]">
          Your Ayurvedic ritual is on its way.
        </h1>

        <p className="mt-3 max-w-[560px] text-[0.88rem] leading-relaxed text-[var(--muted)]">
          Thank you, <strong className="text-[var(--forest)]">{order.customerName}</strong>. We have received your order and our herbalists are preparing your freshly sealed botanical jars.
        </p>

        {/* Order Summary Card */}
        <div className="mt-8 w-full rounded-3xl border border-[var(--line)] bg-[var(--paper)] p-7 text-left shadow-xs max-[680px]:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] pb-4">
            <div>
              <span className="text-[0.62rem] font-bold uppercase tracking-wider text-[var(--muted)]">
                Order Reference
              </span>
              <p className="font-mono text-base font-bold text-[var(--forest)]">
                {order.orderId}
              </p>
            </div>

            <div>
              <span className="text-[0.62rem] font-bold uppercase tracking-wider text-[var(--muted)]">
                Date Placed
              </span>
              <p className="text-xs font-semibold text-[var(--forest)]">
                {order.placedAt}
              </p>
            </div>

            <div>
              <span className="text-[0.62rem] font-bold uppercase tracking-wider text-[var(--muted)]">
                Payment Method
              </span>
              <p className="text-xs font-semibold text-[var(--forest)]">
                {order.paymentMethod}
              </p>
            </div>
          </div>

          {/* Delivery Details */}
          <div className="grid grid-cols-2 gap-6 py-5 border-b border-[var(--line)] max-[600px]:grid-cols-1">
            <div>
              <span className="text-[0.62rem] font-bold uppercase tracking-wider text-[var(--muted)]">
                Delivery Address
              </span>
              <p className="mt-1 text-[0.78rem] leading-relaxed text-[var(--forest)] font-medium">
                {order.shippingAddress}
              </p>
              <p className="mt-1 text-[0.72rem] text-[var(--muted)]">
                Contact: {order.phone} · {order.email}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[0.62rem] font-bold uppercase tracking-wider text-[var(--muted)]">
                Estimated Delivery
              </span>
              <p className="m-0 text-[0.82rem] font-bold text-[#529d38]">
                3–5 Business Days (Tracked)
              </p>
              <p className="m-0 text-[0.72rem] text-[var(--muted)]">
                A tracking link has been issued. You can track your parcel dispatch in real time below.
              </p>
            </div>
          </div>

          {/* Ordered Jars */}
          <div className="py-5">
            <span className="text-[0.62rem] font-bold uppercase tracking-wider text-[var(--muted)] mb-3 block">
              Jars in this Ritual ({order.items.length})
            </span>
            <div className="divide-y divide-[var(--line)]">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-2.5">
                  <div>
                    <strong className="font-serif text-[0.98rem] text-[var(--forest)]">
                      {item.name}
                    </strong>
                    <span className="block text-[0.68rem] text-[var(--muted)]">
                      Qty: {item.quantity} · {item.variant}
                    </span>
                  </div>
                  <span className="font-serif text-[0.95rem] text-[var(--forest)]">
                    {formatCurrency(item.pricePaise, order.currencyCode)}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-baseline justify-between border-t border-[var(--line)] pt-4 mt-3">
              <span className="text-[0.84rem] font-bold text-[var(--forest)]">
                Total Amount
              </span>
              <span className="[font-family:var(--font-display)] text-[1.45rem] font-bold text-[var(--forest)]">
                {formatCurrency(order.totalPaise, order.currencyCode)}
              </span>
            </div>
          </div>
        </div>

        {/* ── Prominent Interactive Order Tracking Card ── */}
        <div className="mt-6 w-full rounded-3xl border border-[#529d38]/35 bg-[#edf3dd]/50 p-6 text-left shadow-xs transition-all max-[680px]:p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <span className="grid size-12 place-items-center rounded-2xl bg-[#529d38] text-2xl text-white shadow-sm shrink-0">
                📦
              </span>
              <div>
                <span className="text-[0.64rem] font-bold uppercase tracking-wider text-[#529d38]">
                  Live Dispatch & Courier Journey
                </span>
                <h4 className="m-0 font-serif text-[1.15rem] font-medium text-[var(--forest)]">
                  Track your Ayurvedic package
                </h4>
                <p className="m-0 mt-0.5 text-[0.74rem] text-[var(--muted)]">
                  Order ID: <strong className="font-mono text-[var(--forest)] font-bold">{order.orderId}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 max-[500px]:w-full max-[500px]:justify-between">
              <button
                type="button"
                onClick={handleCopyRef}
                className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[var(--line)] bg-[var(--paper)] px-4 text-[0.7rem] font-bold uppercase tracking-wider text-[var(--forest)] shadow-2xs hover:bg-[var(--ivory)] transition-all cursor-pointer"
              >
                {copied ? "Copied! ✓" : "Copy ID"}
              </button>
              <Link
                href={`/track-order?ref=${encodeURIComponent(order.orderId)}`}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-[#529d38] px-6 text-[0.74rem] font-bold uppercase tracking-wider text-white shadow-sm hover:bg-[#43822d] transition-all whitespace-nowrap"
              >
                <span>Track Order</span>
                <span aria-hidden="true">➔</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href={`/track-order?ref=${encodeURIComponent(order.orderId)}`}
            className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-full bg-[var(--forest)] px-8 text-[0.74rem] font-bold uppercase tracking-wider text-[var(--paper)] shadow-md hover:bg-[var(--forest-dark)] transition-all"
          >
            <span>Live Order Status</span>
            <span aria-hidden="true">➔</span>
          </Link>
          <Link
            href="/shop"
            className="inline-flex min-h-[50px] items-center justify-center rounded-full border border-[var(--line)] bg-[var(--paper)] px-7 text-[0.74rem] font-bold uppercase tracking-wider text-[var(--forest)] hover:bg-[var(--ivory)] transition-all"
          >
            Continue Exploring Shop
          </Link>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex min-h-[50px] items-center justify-center rounded-full border border-[var(--forest)] bg-transparent px-6 text-[0.74rem] font-bold uppercase tracking-wider text-[var(--forest)] hover:bg-[var(--forest)] hover:text-white transition-all cursor-pointer"
          >
            Print Receipt 🖨️
          </button>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          2. PRINT ONLY VIEW (Strict 1-Page A4 Tax Invoice)
          ══════════════════════════════════════════════════ */}
      <div className="print-only-view print-receipt-container font-sans text-neutral-900">
        <div>
          {/* Header with Brand & Invoice Title */}
          <div className="flex items-start justify-between border-b-2 border-neutral-800 pb-3">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl">🌿</span>
                <span className="font-serif text-xl font-bold tracking-tight text-neutral-900">
                  NatureMist Botanicals
                </span>
              </div>
              <p className="mt-0.5 text-[9.5pt] text-neutral-600">
                Single-Origin Ayurvedic Hair & Scalp Rituals
              </p>
              <p className="text-[8pt] text-neutral-500">
                www.naturemist.shop · support@naturemist.shop · +91 98765 43210
              </p>
            </div>

            <div className="text-right">
              <h2 className="text-base font-bold uppercase tracking-wider text-neutral-800">
                Tax Invoice / Receipt
              </h2>
              <p className="font-mono text-xs font-bold text-neutral-900">
                {order.orderId}
              </p>
              <p className="text-[8.5pt] text-neutral-600">Date: {order.placedAt}</p>
            </div>
          </div>

          {/* Customer & Order Metadata (2-Column Grid) */}
          <div className="grid grid-cols-2 gap-4 border-b border-neutral-300 py-3 text-[9pt]">
            <div>
              <p className="font-bold uppercase tracking-wider text-neutral-500 text-[8pt]">
                Billed & Shipped To:
              </p>
              <p className="mt-0.5 font-bold text-neutral-900">{order.customerName}</p>
              <p className="text-neutral-700 leading-snug">{order.shippingAddress}</p>
              <p className="mt-0.5 text-neutral-600">
                <strong>Phone:</strong> {order.phone} | <strong>Email:</strong> {order.email}
              </p>
            </div>

            <div className="text-right">
              <p className="font-bold uppercase tracking-wider text-neutral-500 text-[8pt]">
                Order Details:
              </p>
              <p className="mt-0.5">
                <span className="text-neutral-500">Payment Mode:</span>{" "}
                <strong>{order.paymentMethod}</strong>
              </p>
              <p className="mt-0.5">
                <span className="text-neutral-500">Shipping Mode:</span>{" "}
                <strong>{order.shippingMethod}</strong>
              </p>
              <p className="mt-0.5">
                <span className="text-neutral-500">Status:</span>{" "}
                <strong className="text-green-800">Confirmed · Preparing for Dispatch</strong>
              </p>
            </div>
          </div>

          {/* Itemized Table */}
          <table className="mt-3 w-full text-left border-collapse text-[9pt]">
            <thead>
              <tr className="border-b-2 border-neutral-800 bg-neutral-100 font-bold uppercase text-[8pt] tracking-wider text-neutral-700">
                <th className="py-2 px-2.5">#</th>
                <th className="py-2 px-2.5">Ritual Botanical Jar</th>
                <th className="py-2 px-2.5">Variant / Specification</th>
                <th className="py-2 px-2.5 text-center">Qty</th>
                <th className="py-2 px-2.5 text-right">Price</th>
                <th className="py-2 px-2.5 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {order.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-2 px-2.5 text-neutral-500">{idx + 1}</td>
                  <td className="py-2 px-2.5 font-semibold text-neutral-900">{item.name}</td>
                  <td className="py-2 px-2.5 text-neutral-600">{item.variant}</td>
                  <td className="py-2 px-2.5 text-center font-bold">{item.quantity}</td>
                  <td className="py-2 px-2.5 text-right text-neutral-700">
                    {formatCurrency(Math.round(item.pricePaise / item.quantity), order.currencyCode)}
                  </td>
                  <td className="py-2 px-2.5 text-right font-bold text-neutral-900">
                    {formatCurrency(item.pricePaise, order.currencyCode)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Financial Totals Calculation Box */}
          <div className="mt-4 flex justify-end">
            <div className="w-56 border-t-2 border-neutral-800 pt-2 text-[9pt]">
              <div className="flex justify-between py-0.5 text-neutral-600">
                <span>Subtotal:</span>
                <span>{formatCurrency(order.totalPaise, order.currencyCode)}</span>
              </div>
              <div className="flex justify-between py-0.5 text-neutral-600">
                <span>Shipping & Handling:</span>
                <span>{order.shippingMethod.includes("Express") ? "₹149.00" : "FREE"}</span>
              </div>
              <div className="flex justify-between py-0.5 text-neutral-600">
                <span>GST (Tax):</span>
                <span>Included</span>
              </div>
              <div className="mt-1 flex justify-between border-t border-neutral-800 pt-1 text-[10pt] font-bold text-neutral-900">
                <span>Grand Total:</span>
                <span>{formatCurrency(order.totalPaise, order.currencyCode)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Guarantee Note */}
        <div className="mt-8 border-t border-neutral-300 pt-3 text-center text-[7.5pt] text-neutral-500">
          <p className="font-semibold text-neutral-700">
            🌿 100% Certified Organic & Single-Origin Wildcrafted Botanicals · Food-Grade UV Glass Sealed
          </p>
          <p className="mt-0.5">
            This is a computer-generated tax receipt and does not require a physical signature. For support, email support@naturemist.shop.
          </p>
          <p className="mt-0.5 font-mono text-[7pt] text-neutral-400">
            NatureMist Ayurvedic Preparations · Order Ref: {order.orderId}
          </p>
        </div>
      </div>
    </>
  );
}
