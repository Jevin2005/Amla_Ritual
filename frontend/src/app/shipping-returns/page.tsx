import type { Metadata } from "next";
import { getStorefront } from "@/lib/shopify/storefront";
import { PageHero } from "@/shared/ui/page-hero";
import {
  PolicyContent,
  ShopifyPolicyBody,
} from "@/shared/ui/policy-content";

export const metadata: Metadata = {
  title: "Shipping & Returns",
  description: "Current NatureMist shipping and returns information.",
  alternates: { canonical: "/shipping-returns" },
};

export default async function ShippingReturnsPage() {
  const storefront = await getStorefront();
  const policies = [storefront.policies.shipping, storefront.policies.refund].filter(
    (policy): policy is NonNullable<typeof policy> => Boolean(policy),
  );

  return (
    <main id="main-content">
      <PageHero
        eyebrow="Customer Care"
        title="Shipping & Returns"
        description="Transparent timelines, careful botanical packaging, and our commitment to customer satisfaction."
      />
      {policies.length > 0 ? (
        <PolicyContent>
          {policies.map((policy) => (
            <section key={policy.handle}>
              <h2>{policy.title}</h2>
              <ShopifyPolicyBody html={policy.body} />
            </section>
          ))}
        </PolicyContent>
      ) : (
        <PolicyContent>
          <h2>1. Dispatch & Processing Times</h2>
          <p>
            All botanical orders are prepared, packed in UV-shielded packaging, and dispatched within 24–48 hours of order confirmation from our dispensary.
          </p>
          <h2>2. Domestic Shipping & Delivery</h2>
          <p>
            We ship across all pin codes in India via express air couriers. Standard delivery timeline is 3 to 5 business days depending on your destination city. You will receive an SMS and email with real-time tracking checkpoints as soon as your parcel ships.
          </p>
          <h2>3. Shipping Charges</h2>
          <p>
            Standard express shipping is complimentary on all orders above ₹999. For orders below ₹999, a flat delivery fee of ₹80 is applied at checkout.
          </p>
          <h2>4. Returns & Replacements</h2>
          <p>
            Due to hygiene and purity standards for organic botanicals, we accept returns on unopened, sealed products within 14 days of delivery. If an item arrives damaged or incorrect, contact our Care Team at <a href="mailto:care@naturemist.com">care@naturemist.com</a> for an immediate replacement.
          </p>
        </PolicyContent>
      )}
    </main>
  );
}
