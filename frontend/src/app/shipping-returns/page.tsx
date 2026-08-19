import type { Metadata } from "next";
import { getStorefront } from "@/lib/shopify/storefront";
import { PageHero } from "@/shared/ui/page-hero";
import {
  NoticeBox,
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
        eyebrow="Customer care"
        title="Shipping + returns."
        description={
          storefront.source === "shopify"
            ? "Current delivery and return terms, maintained by NatureMist in Shopify."
            : "Clear terms belong beside every order. Final service regions, timelines and eligibility will be confirmed before launch."
        }
      />
      {storefront.source === "shopify" ? (
        <PolicyContent>
          {policies.map((policy) => (
            <section key={policy.handle}>
              <h2>{policy.title}</h2>
              <ShopifyPolicyBody html={policy.body} />
            </section>
          ))}
          {!storefront.policies.shipping || !storefront.policies.refund ? (
            <NoticeBox title="Part of this policy is temporarily unavailable.">
              The merchant must publish both Shipping and Refund policies in Shopify Admin before accepting orders.
            </NoticeBox>
          ) : null}
        </PolicyContent>
      ) : (
        <PolicyContent>
        <NoticeBox title="Pre-launch policy preview.">
          No live orders are being accepted, so no shipping or return promise is presented as final.
        </NoticeBox>
        <h2>Dispatch</h2>
        <p>Confirmed processing times, delivery regions, carriers and shipping charges will appear here once fulfilment operations are finalised.</p>
        <h2>Returns</h2>
        <p>Final return windows and eligibility will account for product safety, unopened seals, damaged parcels and applicable consumer law. We will not publish a return promise that operations cannot honour.</p>
        <h2>Damaged or incorrect parcels</h2>
        <p>The launch policy will provide a real support channel and evidence process for damaged, missing or incorrect items.</p>
        <h2>Botanical colour products</h2>
        <p>Indigo packaging will include prominent safety and strand-test guidance. A personal colour outcome is not a product defect because results vary with starting colour, porosity, preparation and prior treatments.</p>
        </PolicyContent>
      )}
    </main>
  );
}
