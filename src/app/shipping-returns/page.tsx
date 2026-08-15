import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping & Returns",
  description: "NatureMist shipping and returns information for the pre-launch storefront.",
  alternates: { canonical: "/shipping-returns" },
};

export default function ShippingReturnsPage() {
  return (
    <main id="main-content"><section className="page-hero"><div className="page-hero__inner"><p className="eyebrow">Customer care</p><h1>Shipping + returns.</h1><p>Clear terms belong beside every order. Final service regions, timelines and eligibility will be confirmed before launch.</p></div></section><article className="content-page"><div className="notice-box"><strong>Pre-launch policy preview.</strong><p>No live orders are being accepted, so no shipping or return promise is presented as final.</p></div><h2>Dispatch</h2><p>Confirmed processing times, delivery regions, carriers and shipping charges will appear here once fulfilment operations are finalised.</p><h2>Returns</h2><p>Final return windows and eligibility will account for product safety, unopened seals, damaged parcels and applicable consumer law. We will not publish a return promise that operations cannot honour.</p><h2>Damaged or incorrect parcels</h2><p>The launch policy will provide a real support channel and evidence process for damaged, missing or incorrect items.</p><h2>Botanical colour products</h2><p>Indigo packaging will include prominent safety and strand-test guidance. A personal colour outcome is not a product defect because results vary with starting colour, porosity, preparation and prior treatments.</p></article></main>
  );
}

