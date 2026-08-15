import type { Metadata } from "next";
import { CheckoutPreview } from "@/features/checkout/components/checkout-preview";

export const metadata: Metadata = {
  title: "Checkout Preview",
  description: "NatureMist secure checkout integration handoff.",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <main id="main-content">
      <section className="page-hero checkout-page-hero">
        <div className="page-hero__inner"><p className="eyebrow">Your ritual bag</p><h1>Checkout,<br />without shortcuts.</h1><p>Commercial data and a verified hosted payment provider come before real orders.</p></div>
      </section>
      <CheckoutPreview />
    </main>
  );
}
