import type { Metadata } from "next";
import { getStorefront } from "@/lib/shopify/storefront";
import { PageHero } from "@/shared/ui/page-hero";
import { SupportContactLinks } from "@/shared/ui/support-contact-links";
import {
  PolicyContent,
  StorePolicyContent,
} from "@/shared/ui/policy-content";

export const metadata: Metadata = { title: "Privacy", alternates: { canonical: "/privacy" } };

export default async function PrivacyPage() {
  const storefront = await getStorefront();
  const policy = storefront.policies.privacy;

  return (
    <main id="main-content">
      <PageHero
        eyebrow="Privacy Policy"
        title="Care extends to your data."
        description="We believe in radical transparency—both in our botanical hair formulations and in how we safeguard your personal information."
      />
      {policy ? (
        <StorePolicyContent html={policy.body} />
      ) : (
        <PolicyContent>
          <h2>1. Information We Collect</h2>
          <p>
            When you visit our website, place an order, or submit a consultation request, we collect the details you provide (such as your name, delivery address, phone number, email address, and order selections).
          </p>
          <h2>2. How We Use Your Information</h2>
          <p>
            Your information is used strictly to process orders, fulfill botanical shipments, provide direct customer care, and send optional ritual guides when you subscribe to our newsletter.
          </p>
          <h2>3. Payment Security & Encryption</h2>
          <p>
            All online transactions are securely encrypted and processed directly via PCI-DSS Level 1 compliant checkout gateways. We never store or view your credit/debit card numbers or banking passwords.
          </p>
          <h2>4. Cookies & Preferences</h2>
          <p>
            We use essential cookies to maintain your shopping bag items, remember your ritual preferences, and deliver a smooth browsing experience across sessions.
          </p>
          <h2>5. Contact Our Privacy Team</h2>
          <p>
            If you have questions regarding your personal data or wish to request data updates, contact <SupportContactLinks />.
          </p>
        </PolicyContent>
      )}
    </main>
  );
}
