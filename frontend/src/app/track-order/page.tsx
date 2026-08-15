import type { Metadata } from "next";
import { TrackingForm } from "@/features/tracking/tracking-form";

export const metadata: Metadata = {
  title: "Track Your Order",
  description: "NatureMist order tracking entry point.",
  alternates: { canonical: "/track-order" },
  robots: { index: false, follow: true },
};

export default function TrackOrderPage() {
  return (
    <main id="main-content">
      <section className="page-hero"><div className="page-hero__inner"><p className="eyebrow">After the ritual leaves us</p><h1>Track an order.</h1><p>Enter your NatureMist reference. Live tracking will appear here once fulfilment is connected.</p></div></section>
      <section className="tracking-section"><div><p className="eyebrow">Order care</p><h2>A clear journey from our shelf to yours.</h2><p>Tracking data is never invented. Until a fulfilment provider is connected, this preview keeps every reference on your device only.</p></div><TrackingForm /></section>
    </main>
  );
}
