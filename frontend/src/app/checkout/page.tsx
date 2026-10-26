import type { Metadata } from "next";
import { CheckoutPreview } from "@/features/checkout/checkout-preview";

export const metadata: Metadata = {
  title: "Secure Checkout",
  description: "Review your NatureMist bag and continue to secure checkout.",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  const checkoutHosts = [
    process.env.SHOPIFY_STORE_DOMAIN || "",
    process.env.SHOPIFY_CHECKOUT_DOMAIN || "checkout.naturemist.shop",
  ].filter(Boolean);
  return (
    <main id="main-content">
      <CheckoutPreview checkoutHosts={checkoutHosts} />
    </main>
  );
}
