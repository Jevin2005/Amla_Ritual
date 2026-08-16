import type { Metadata } from "next";
import { TrackingForm } from "@/features/tracking/tracking-form";
import { PageHero } from "@/shared/ui/page-hero";

export const metadata: Metadata = {
  title: "Track Your Order",
  description: "NatureMist order tracking entry point.",
  alternates: { canonical: "/track-order" },
  robots: { index: false, follow: true },
};

export default function TrackOrderPage() {
  return (
    <main id="main-content">
      <PageHero
        eyebrow="After the ritual leaves us"
        title="Track an order."
        description="Enter your NatureMist reference. Live tracking will appear here once fulfilment is connected."
      />
      <section className="mx-auto grid w-full max-w-[1200px] grid-cols-[1fr_0.8fr] items-center gap-[clamp(52px,8vw,96px)] px-[clamp(24px,5vw,64px)] pb-[150px] pt-[100px] max-[900px]:grid-cols-1 max-[680px]:px-5 max-[680px]:pb-[100px] max-[680px]:pt-[72px]">
        <div>
          <p className="mb-4 text-[0.68rem] font-bold uppercase leading-[1.3] tracking-[0.2em] text-[var(--botanical)]">
            Order care
          </p>
          <h2 className="m-0 max-w-[12ch] font-serif text-[clamp(3.2rem,5vw,5.5rem)] font-normal leading-[0.94] tracking-[-0.055em] text-[var(--forest)] text-balance">
            A clear journey from our shelf to yours.
          </h2>
          <p className="max-w-[620px] leading-[1.75] text-[var(--muted)]">
            Tracking data is never invented. Until a fulfilment provider is connected, this preview keeps every reference on your device only.
          </p>
        </div>
        <TrackingForm />
      </section>
    </main>
  );
}
