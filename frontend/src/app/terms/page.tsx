import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms", alternates: { canonical: "/terms" } };

export default function TermsPage() {
  return (
    <main id="main-content"><section className="page-hero"><div className="page-hero__inner"><p className="eyebrow">Terms</p><h1>Clear expectations,<br />from the beginning.</h1><p>Pre-launch terms for browsing the NatureMist website preview.</p></div></section><article className="content-page"><div className="notice-box"><strong>This website is currently a product and commerce preview.</strong><p>Prices, inventory, discounts, shipping terms and checkout are not final offers for sale.</p></div><h2>Product information</h2><p>Botanical identities, plant parts, net weights, label directions, batch information and commercial claims must be confirmed on final packaging before orders open.</p><h2>Ritual guidance</h2><p>Website content is general cosmetic education, not medical advice or a diagnosis. Follow final pack directions, patch test and consult a qualified professional for health concerns.</p><h2>Colour outcomes</h2><p>Botanical colour results vary. NatureMist does not guarantee a particular tone from Indigo or any pigmented powder.</p><h2>Live commerce</h2><p>Complete operator details, payment terms, cancellation rights, warranty language and governing law will be added before checkout is activated.</p></article></main>
  );
}

