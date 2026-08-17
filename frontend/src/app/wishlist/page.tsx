import type { Metadata } from "next";
import { WishlistPage } from "@/features/wishlist/wishlist-page";
import { PageHero } from "@/shared/ui/page-hero";

export const metadata: Metadata = {
  title: "Saved Rituals",
  description: "Return to the NatureMist botanical rituals saved on your device.",
  alternates: { canonical: "/wishlist" },
  robots: { index: false, follow: true },
};

export default function WishlistRoute() {
  return (
    <main id="main-content">
      <PageHero
        eyebrow="Your botanical shelf"
        title="Saved rituals."
        description="Keep a quiet shortlist while you learn what each botanical brings to the bowl."
      />
      <WishlistPage />
    </main>
  );
}
