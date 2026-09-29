import type { Metadata } from "next";
import { ReviewsPage } from "@/features/reviews/reviews-page";
import { getAllJudgemeReviews } from "@/lib/judgeme/api";

export const metadata: Metadata = {
  title: "Customer Reviews & Video Stories | NatureMist",
  description:
    "Read published written reviews and watch customer video stories connected to the exact NatureMist botanical they describe.",
  alternates: { canonical: "/reviews" },
};

export default async function ReviewsRoute() {
  const judgemeReviews = await getAllJudgemeReviews();
  return <ReviewsPage initialReviews={judgemeReviews} />;
}
