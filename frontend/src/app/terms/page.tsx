import type { Metadata } from "next";
import { getStorefront } from "@/lib/shopify/storefront";
import { PageHero } from "@/shared/ui/page-hero";
import {
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
        eyebrow="Terms of Service"
        title={<><span>Clear expectations,</span><br />from the beginning.</>}
        description="Understanding our store terms, botanical guidelines, and customer purchase commitments."
      />
      {policy ? (
        <ShopifyPolicyContent html={policy.body} />
      ) : (
        <PolicyContent>
          <h2>1. Botanical Products & Authenticity</h2>
          <p>
            NatureMist provides pure, unadulterated botanical powders, oils, and ritual accessories. Every botanical is harvested sustainably and lab-tested for purity and potency.
          </p>
          <h2>2. Ritual Guidance & Patch Testing</h2>
          <p>
            Information provided on our website is educational and rooted in traditional Ayurvedic hair wellness. Because natural plant botanicals are active, we recommend performing a 24-hour patch test prior to full application.
          </p>
          <h2>3. Orders & Pricing</h2>
          <p>
            All prices listed on the storefront are in Indian Rupees (INR) inclusive of applicable taxes unless stated otherwise. We reserve the right to correct pricing errors and adjust availability based on seasonal harvest limits.
          </p>
          <h2>4. Customer Conduct & Intellectual Property</h2>
          <p>
            All photography, typography, ritual formulation guides, and brand assets are the exclusive property of NatureMist.
          </p>
          <h2>5. Inquiries & Support</h2>
          <p>
            For questions regarding these terms, please contact our support team at <a href="mailto:care@naturemist.com">care@naturemist.com</a>.
          </p>
        </PolicyContent>
      )}
    </main>
  );
}
