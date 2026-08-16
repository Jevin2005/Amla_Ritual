import type { Metadata } from "next";
import { CheckoutPreview } from "@/features/checkout/checkout-preview";
import { PageHero } from "@/shared/ui/page-hero";

export const metadata: Metadata = {
  title: "Checkout Preview",
  description: "NatureMist secure checkout integration handoff.",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <main id="main-content">
      <PageHero
        eyebrow="Your ritual bag"
        title={<><span>Checkout,</span><br />without shortcuts.</>}
        description="Commercial data and a verified hosted payment provider come before real orders."
      />
      <CheckoutPreview />
    </main>
  );
}
