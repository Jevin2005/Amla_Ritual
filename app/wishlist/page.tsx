import type { Metadata } from "next";
import { WishlistPage } from "@/components/wishlist-page";

export const metadata: Metadata = {
  title: "Saved Rituals",
  description: "Return to the NatureMist botanical rituals saved on your device.",
  alternates: { canonical: "/wishlist" },
  robots: { index: false, follow: true },
};

export default function WishlistRoute() {
  return (
    <main id="main-content">
      <section className="page-hero">
        <div className="page-hero__inner">
          <p className="eyebrow">Your botanical shelf</p>
          <h1>Saved rituals.</h1>
          <p>Keep a quiet shortlist while you learn what each botanical brings to the bowl.</p>
        </div>
      </section>
      <WishlistPage />
    </main>
  );
}

