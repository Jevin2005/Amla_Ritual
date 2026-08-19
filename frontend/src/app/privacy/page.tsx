import type { Metadata } from "next";
import { getStorefront } from "@/lib/shopify/storefront";
import { PageHero } from "@/shared/ui/page-hero";
import {
  NoticeBox,
  PolicyContent,
  ShopifyPolicyContent,
} from "@/shared/ui/policy-content";

export const metadata: Metadata = { title: "Privacy", alternates: { canonical: "/privacy" } };

export default async function PrivacyPage() {
  const storefront = await getStorefront();
  const policy = storefront.policies.privacy;

  return (
    <main id="main-content">
      <PageHero
        eyebrow="Privacy"
        title="Care extends to your data."
        description={
          storefront.source === "shopify"
            ? "The current privacy policy maintained by NatureMist in Shopify."
            : "A concise pre-launch statement for this interactive storefront preview."
        }
      />
      {policy ? (
        <ShopifyPolicyContent html={policy.body} />
      ) : storefront.source === "shopify" ? (
        <PolicyContent>
          <NoticeBox title="The current privacy policy is temporarily unavailable.">
            Please return before submitting personal information or placing an order. The merchant must publish the Privacy Policy in Shopify Admin.
          </NoticeBox>
        </PolicyContent>
      ) : (
        <PolicyContent>
        <NoticeBox title="This preview does not submit personal data to a NatureMist backend.">
          Newsletter, tracking and checkout integrations remain intentionally disconnected.
        </NoticeBox>
        <h2>Device-local preferences</h2>
        <p>Your bag and wishlist are stored in your browser so they can remain available on the same device. You can remove items at any time or clear this site’s storage through your browser settings.</p>
        <h2>Analytics readiness</h2>
        <p>The interface emits non-sensitive conversion event names for a future analytics integration. It does not intentionally include email addresses, names, addresses, payment details or free-text ritual answers.</p>
        <h2>Before launch</h2>
        <p>A complete privacy notice must identify the legal operator, purposes, lawful bases, processors, retention, cookie choices, rights and contact details for every live integration.</p>
        </PolicyContent>
      )}
    </main>
  );
}
