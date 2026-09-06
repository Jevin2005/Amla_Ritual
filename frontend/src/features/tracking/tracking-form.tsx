"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";

type Milestone = {
  id: string;
  title: string;
  description: string;
  status: "completed" | "in_progress" | "pending";
  date: string;
};

type TrackedOrder = {
  orderName: string;
  placedAt: string;
  financialStatus: string;
  fulfillmentStatus: string;
  isCancelled: boolean;
  destination: string;
  pinCode: string;
  items: Array<{ name: string; quantity: number; price: string }>;
  totalPrice: string;
  currency: string;
  carrier: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  milestones: Milestone[];
};

export function TrackingForm() {
  const searchParams = useSearchParams();
  const initialRef =
    searchParams.get("ref") ||
    searchParams.get("orderId") ||
    searchParams.get("reference") ||
    "";

  const [reference, setReference] = useState(initialRef);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [trackedOrder, setTrackedOrder] = useState<TrackedOrder | null>(null);
  const [copiedWaybill, setCopiedWaybill] = useState(false);

  const handleCopyWaybill = (waybill: string) => {
    navigator.clipboard?.writeText(waybill);
    setCopiedWaybill(true);
    setTimeout(() => setCopiedWaybill(false), 2500);
  };

  const fetchTracking = async (queryRef: string) => {
    const cleanRef = queryRef.trim();
    if (!cleanRef) return;

    setIsLoading(true);
    setErrorMessage("");
    setTrackedOrder(null);

    try {
      const res = await fetch("/api/shopify/track-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: cleanRef }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(
          data.error || "Unable to retrieve tracking details at this time.",
        );
      } else if (!data.found) {
        setErrorMessage(data.message || `No order found matching "${cleanRef}".`);
      } else if (data.order) {
        setTrackedOrder(data.order);
      }
    } catch (err) {
      console.error("Tracking lookup error:", err);
      setErrorMessage(
        "Network error. Please check your connection and try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!initialRef) return;
    let isMounted = true;

    queueMicrotask(() => {
      if (isMounted) {
        fetchTracking(initialRef);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [initialRef]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!reference.trim()) {
      setErrorMessage("Please enter an order number (e.g. #1004) or phone number.");
      return;
    }
    fetchTracking(reference);
  };

  return (
    <div className="w-full max-w-[560px] self-center flex flex-col gap-6">
      {/* Search Input Box */}
      <form
        className="w-full rounded-3xl bg-[var(--paper)] p-8 shadow-[var(--shadow-soft)] ring-1 ring-[var(--line)] max-[680px]:p-5"
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="flex items-center justify-between mb-2">
          <label
            className="block text-[0.66rem] font-bold uppercase tracking-[0.14em] text-[var(--forest)]"
            htmlFor="order-reference"
          >
            Order reference or mobile number
          </label>
          <span className="text-[0.64rem] font-medium text-[var(--muted)]">
            e.g. #1004 or 9876543210
          </span>
        </div>

        <div className="flex gap-2 max-[500px]:flex-col">
          <input
            className="h-[52px] flex-1 rounded-2xl border border-[var(--line)] bg-[var(--ivory)] px-4 text-[0.84rem] text-[var(--forest)] outline-none transition-colors focus:border-[var(--botanical)] focus:ring-2 focus:ring-[var(--botanical)]/15"
            id="order-reference"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="e.g. #1004, NMR-1004, or 10-digit Phone"
            required
          />
          <button
            className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border border-transparent bg-[var(--forest)] px-6 text-[0.74rem] font-bold uppercase tracking-[0.1em] text-[var(--paper)] shadow-md transition-all hover:bg-[var(--forest-dark)] hover:shadow-lg disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed whitespace-nowrap"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="size-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                <span>Checking…</span>
              </span>
            ) : (
              <span>Track Ritual ➔</span>
            )}
          </button>
        </div>

        {errorMessage && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[0.74rem] font-medium text-amber-800">
            ⚠️ {errorMessage}
          </div>
        )}
      </form>

      {/* Live Tracking Result Card */}
      {trackedOrder && (
        <section
          className="w-full rounded-3xl bg-[var(--paper)] p-8 shadow-[var(--shadow-soft)] ring-1 ring-[var(--line)] transition-all max-[680px]:p-5 flex flex-col gap-6"
          aria-live="polite"
        >
          {/* Status Header */}
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--line)] pb-5">
            <div>
              <span className="text-[0.62rem] font-bold uppercase tracking-wider text-[var(--muted)]">
                Shopify Verified Order
              </span>
              <h3 className="m-0 font-serif text-[1.45rem] font-bold text-[var(--forest)]">
                {trackedOrder.orderName}
              </h3>
              <p className="m-0 mt-0.5 text-[0.74rem] text-[var(--muted)]">
                Placed on {trackedOrder.placedAt} · Delivering to {trackedOrder.destination}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-[#edf3dd] px-3 py-1 text-[0.7rem] font-bold text-[#529d38] capitalize">
                ● {trackedOrder.financialStatus === "paid" ? "Paid Online" : "Cash on Delivery"}
              </span>
              <span className="inline-flex items-center rounded-full bg-[var(--ivory)] px-3 py-1 text-[0.7rem] font-bold text-[var(--forest)] capitalize">
                {trackedOrder.fulfillmentStatus === "fulfilled" ? "Dispatched ✈️" : "Preparing 🌿"}
              </span>
            </div>
          </div>

          {/* Carrier Dispatch Notification Center */}
          {trackedOrder.trackingNumber ? (
            <div className="rounded-3xl border border-[#529d38]/35 bg-[#edf3dd]/70 p-5 shadow-xs transition-all">
              <div className="flex items-center justify-between gap-2 border-b border-[#529d38]/20 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="grid size-6 place-items-center rounded-full bg-[#529d38] text-xs text-white">
                    ✈️
                  </span>
                  <span className="text-[0.66rem] font-bold uppercase tracking-wider text-[#3d7a27]">
                    Live Carrier Dispatch Notification
                  </span>
                </div>
                <span className="rounded-full bg-[#529d38]/15 px-2.5 py-0.5 text-[0.64rem] font-bold uppercase tracking-wide text-[#3d7a27]">
                  {trackedOrder.carrier || "Priority Courier"}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[0.62rem] font-bold uppercase tracking-wider text-[var(--muted)] block">
                    Courier Waybill / AWB Number
                  </span>
                  <p className="m-0 font-mono text-base font-bold tracking-wider text-[var(--forest)]">
                    {trackedOrder.trackingNumber}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyWaybill(trackedOrder.trackingNumber || "")}
                    className="inline-flex min-h-[38px] items-center justify-center rounded-full border border-[var(--line)] bg-[var(--paper)] px-3.5 text-[0.68rem] font-bold uppercase tracking-wider text-[var(--forest)] shadow-2xs hover:bg-[var(--ivory)] transition-all cursor-pointer"
                  >
                    {copiedWaybill ? "Copied! ✓" : "Copy AWB"}
                  </button>

                  {trackedOrder.trackingUrl && (
                    <a
                      href={trackedOrder.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-full bg-[var(--forest)] px-4 text-[0.68rem] font-bold uppercase tracking-wider text-white shadow-sm hover:bg-[var(--forest-dark)] transition-all"
                    >
                      <span>Track on {trackedOrder.carrier || "Courier"}</span>
                      <span aria-hidden="true">↗</span>
                    </a>
                  )}

                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                      `🌿 NatureMist Order ${trackedOrder.orderName} Update: Dispatched via ${trackedOrder.carrier || "Courier"} (Waybill: ${trackedOrder.trackingNumber}). Track your package live: ${typeof window !== "undefined" ? window.location.href : ""}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-full bg-[#25D366] px-3.5 text-[0.68rem] font-bold uppercase tracking-wider text-white shadow-sm hover:bg-[#1faa53] transition-all"
                  >
                    <span>WhatsApp 💬</span>
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--ivory)] p-4 text-[var(--forest)]">
              <div className="flex items-start gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-[var(--paper)] text-sm shadow-2xs">
                  🌿
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <strong className="text-[0.78rem] font-semibold text-[var(--forest)]">
                      Fresh Batch Packing in Progress
                    </strong>
                    <span className="text-[0.62rem] font-bold uppercase tracking-wider text-[var(--botanical)]">
                      Stage 2 of 4
                    </span>
                  </div>
                  <p className="m-0 mt-1 text-[0.72rem] leading-relaxed text-[var(--muted)]">
                    Your wildcrafted botanical order is being seal-inspected and prepared. As soon as the courier partner picks up the box, your live Waybill ID will appear here and will be dispatched to your mobile.
                  </p>
                  <div className="mt-2.5 flex items-center gap-2">
                    <a
                      href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                        `🌿 NatureMist Order ${trackedOrder.orderName} is currently being prepared. Track status: ${typeof window !== "undefined" ? window.location.href : ""}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[0.68rem] font-bold text-[#25D366] hover:underline"
                    >
                      <span>Share status to WhatsApp</span>
                      <span aria-hidden="true">💬</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Milestones Visual Journey */}
          <div className="flex flex-col gap-6 py-2">
            <h4 className="m-0 font-serif text-[1.1rem] font-medium text-[var(--forest)]">
              Ayurvedic Dispatch Journey
            </h4>

            <div className="relative pl-6 flex flex-col gap-7 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[var(--line)]">
              {trackedOrder.milestones.map((m) => {
                const isCompleted = m.status === "completed";
                const isInProgress = m.status === "in_progress";

                return (
                  <div key={m.id} className="relative flex flex-col gap-1">
                    {/* Node Dot */}
                    <span
                      className={`absolute -left-6 top-0.5 grid size-6 place-items-center rounded-full text-xs font-bold ring-4 ring-white ${
                        isCompleted
                          ? "bg-[#529d38] text-white"
                          : isInProgress
                            ? "bg-[var(--forest)] text-white animate-pulse"
                            : "bg-[var(--line)] text-[var(--muted)]"
                      }`}
                    >
                      {isCompleted ? "✓" : isInProgress ? "●" : "○"}
                    </span>

                    <div className="flex items-baseline justify-between gap-2">
                      <strong className="text-[0.84rem] text-[var(--forest)] font-serif font-medium">
                        {m.title}
                      </strong>
                      <span className="text-[0.68rem] font-bold text-[var(--botanical)]">
                        {m.date}
                      </span>
                    </div>
                    <p className="m-0 text-[0.72rem] leading-relaxed text-[var(--muted)]">
                      {m.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Jars in parcel */}
          <div className="border-t border-[var(--line)] pt-4 flex flex-col gap-2">
            <span className="text-[0.62rem] font-bold uppercase tracking-wider text-[var(--muted)]">
              Jars in this Package ({trackedOrder.items.length})
            </span>
            <div className="divide-y divide-[var(--line)]">
              {trackedOrder.items.map((it, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 text-[0.78rem]">
                  <span className="font-serif text-[var(--forest)]">
                    {it.name} <strong className="font-sans text-[var(--muted)]">× {it.quantity}</strong>
                  </span>
                  <span className="font-bold text-[var(--forest)]">₹{Number(it.price).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* WhatsApp Support Notice */}
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--ivory)] p-4 text-center">
            <p className="m-0 text-[0.72rem] text-[var(--muted)]">
              Questions about preparation or transit? WhatsApp our herbal dispatch team at{" "}
              <strong className="text-[var(--forest)]">+91 98765 43210</strong> with reference{" "}
              <strong className="font-mono text-[var(--forest)]">{trackedOrder.orderName}</strong>.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
