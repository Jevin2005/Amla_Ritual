import type { Metadata } from "next";
import { CheckoutPreview } from "@/features/checkout/checkout-preview";
import { PageHero } from "@/shared/ui/page-hero";

export const metadata: Metadata = {
  title: "Secure Checkout",
  description: "Review your NatureMist bag and continue to Shopify hosted checkout.",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <main id="main-content">
      <PageHero
        eyebrow="Your ritual bag"
        title={<><span>Checkout,</span><br />handled securely.</>}
        description="Review the latest bag totals, then continue to Shopify's hosted checkout for delivery and payment."
      />
      <CheckoutPreview />
    </main>
  );
}
