import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy", alternates: { canonical: "/privacy" } };

export default function PrivacyPage() {
  return (
    <main id="main-content"><section className="page-hero"><div className="page-hero__inner"><p className="eyebrow">Privacy</p><h1>Care extends to your data.</h1><p>A concise pre-launch statement for this interactive storefront preview.</p></div></section><article className="content-page"><div className="notice-box"><strong>This preview does not submit personal data to a NatureMist backend.</strong><p>Newsletter, tracking and checkout integrations remain intentionally disconnected.</p></div><h2>Device-local preferences</h2><p>Your bag and wishlist are stored in your browser so they can remain available on the same device. You can remove items at any time or clear this site’s storage through your browser settings.</p><h2>Analytics readiness</h2><p>The interface emits non-sensitive conversion event names for a future analytics integration. It does not intentionally include email addresses, names, addresses, payment details or free-text ritual answers.</p><h2>Before launch</h2><p>A complete privacy notice must identify the legal operator, purposes, lawful bases, processors, retention, cookie choices, rights and contact details for every live integration.</p></article></main>
  );
}

