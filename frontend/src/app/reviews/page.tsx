import type { Metadata } from "next";
import { ReviewsPage } from "@/features/reviews/reviews-page";

export const metadata: Metadata = {
  title: "Verified Reviews & Transformations | NatureMist",
  description:
    "Discover unedited reviews and hair transformation reflections from practitioners using pure, single-origin NatureMist botanical rituals.",
  alternates: { canonical: "/reviews" },
};

export default function ReviewsRoute() {
  return <ReviewsPage />;
}
