import type { Metadata } from "next";
import { getStorefront } from "@/lib/shopify/storefront";
import { PageHero } from "@/shared/ui/page-hero";
import {
  NoticeBox,
  PolicyContent,
  ShopifyPolicyContent,
} from "@/shared/ui/policy-content";

export const metadata: Metadata = { title: "Terms", alternates: { canonical: "/terms" } };

export default async function TermsPage() {
  const storefront = await getStorefront();
  const policy = storefront.policies.terms;

  return (
    <main id="main-content">
      <PageHero
        eyebrow="Terms"
        title={<><span>Clear expectations,</span><br />from the beginning.</>}
        description={
          storefront.source === "shopify"
            ? "The current terms of service maintained by NatureMist in Shopify."
            : "Pre-launch terms for browsing the NatureMist website preview."
        }
      />
      {policy ? (
        <ShopifyPolicyContent html={policy.body} />
      ) : storefront.source === "shopify" ? (
        <PolicyContent>
          <NoticeBox title="The current terms are temporarily unavailable.">
            Please return before placing an order. The merchant must publish the Terms of Service in Shopify Admin.
          </NoticeBox>
        </PolicyContent>
      ) : (
        <PolicyContent>
        <NoticeBox title="This website is currently a product and commerce preview.">
          Prices, inventory, discounts, shipping terms and checkout are not final offers for sale.
        </NoticeBox>
        <h2>Product information</h2>
        <p>Botanical identities, plant parts, net weights, label directions, batch information and commercial claims must be confirmed on final packaging before orders open.</p>
        <h2>Ritual guidance</h2>
        <p>Website content is general cosmetic education, not medical advice or a diagnosis. Follow final pack directions, patch test and consult a qualified professional for health concerns.</p>
        <h2>Colour outcomes</h2>
        <p>Botanical colour results vary. NatureMist does not guarantee a particular tone from Indigo or any pigmented powder.</p>
        <h2>Live commerce</h2>
        <p>Complete operator details, payment terms, cancellation rights, warranty language and governing law will be added before checkout is activated.</p>
        </PolicyContent>
      )}
    </main>
  );
}
