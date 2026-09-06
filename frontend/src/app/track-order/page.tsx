import type { Metadata } from "next";
import { Suspense } from "react";
import { TrackingForm } from "@/features/tracking/tracking-form";
import { PageHero } from "@/shared/ui/page-hero";

export const metadata: Metadata = {
  title: "Track Your Order",
  description: "Live real-time order tracking for your NatureMist botanical packages.",
  alternates: { canonical: "/track-order" },
  robots: { index: false, follow: true },
};

export default function TrackOrderPage() {
  return (
    <main id="main-content">
      <PageHero
        eyebrow="After the ritual leaves us"
        title="Track an order."
        description="Enter your order reference (e.g. #1004) or mobile number to view live preparation and delivery milestones."
      />
      <section className="mx-auto grid w-full max-w-[1200px] grid-cols-[1fr_0.8fr] items-start gap-[clamp(52px,8vw,96px)] px-[clamp(24px,5vw,64px)] pb-[150px] pt-[100px] max-[900px]:grid-cols-1 max-[680px]:px-5 max-[680px]:pb-[100px] max-[680px]:pt-[72px]">
        <div>
          <p className="mb-4 text-[0.68rem] font-bold uppercase leading-[1.3] tracking-[0.2em] text-[var(--botanical)]">
            Order care
          </p>
          <h2 className="m-0 max-w-[12ch] font-serif text-[clamp(3.2rem,5vw,5.5rem)] font-normal leading-[0.94] tracking-[-0.055em] text-[var(--forest)] text-balance">
            A clear journey from our shelf to yours.
          </h2>
          <p className="max-w-[620px] leading-[1.75] text-[var(--muted)]">
            Every herbal jar is packed fresh to order, sealed in UV-protected glass, and tracked directly through our courier network.
          </p>
          <ol className="mt-8 grid list-none gap-3 p-0" aria-label="Future order journey">
            {[
              ["01", "Order confirmed", "Your reference and receipt are issued and logged in Shopify."],
              ["02", "Packed with care", "Herbal powders are freshly filled and seal-inspected."],
              ["03", "On its way", "Live courier waybill milestones update automatically."],
            ].map(([number, title, copy]) => (
              <li className="grid grid-cols-[38px_1fr] gap-3 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--paper)] p-4" key={number}>
                <span className="text-[0.65rem] font-bold text-[var(--botanical)]">{number}</span>
                <span>
                  <strong className="block font-serif text-[1.1rem] font-normal text-[var(--forest)]">{title}</strong>
                  <small className="mt-1 block text-[0.72rem] leading-[1.55] text-[var(--muted)]">{copy}</small>
                </span>
              </li>
            ))}
          </ol>
        </div>
        <Suspense fallback={<div className="p-8 text-center text-sm text-[var(--muted)]">Loading tracking console…</div>}>
          <TrackingForm />
        </Suspense>
      </section>
    </main>
  );
}
