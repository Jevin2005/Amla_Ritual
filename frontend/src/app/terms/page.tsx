import type { Metadata } from "next";
import { getStorefront } from "@/lib/shopify/storefront";
import { PageHero } from "@/shared/ui/page-hero";
import { SupportContactLinks } from "@/shared/ui/support-contact-links";
import {
  PolicyContent,
  StorePolicyContent,
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
        <StorePolicyContent html={policy.body} />
      ) : (
        <PolicyContent>
          <h2>1. Botanical Products & Authenticity</h2>
          <p>
            NatureMist offers 200 g botanical powders for traditional hair packs, herbal washing and plant-based hair colour. Use each product only for the purposes and in the manner stated on its current label. Potential face or body uses require separate product assessment and are not current directions for this range.
          </p>
          <h2>2. Ritual Guidance & Patch Testing</h2>
          <p>
            Our care guidance draws on traditional botanical use and is for cosmetic routines. Traditional Ayurvedic use does not establish that a finished product is clinically proven or suitable for every person. Follow the product-specific patch-test directions and, for hair colour or light or treated hair, the strand-test guidance. Avoid irritated or broken skin and stop use if irritation occurs.
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
            For questions regarding these terms, contact <SupportContactLinks />.
          </p>
        </PolicyContent>
      )}
    </main>
  );
}
