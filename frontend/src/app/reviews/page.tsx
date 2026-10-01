import type { Metadata } from "next";
import { ReviewsPage } from "@/features/reviews/reviews-page";
import { getJudgemeAllReviewsPage } from "@/lib/judgeme/all-reviews";

export const metadata: Metadata = {
  title: "Customer Reviews & Video Stories | NatureMist",
  description:
    "Read published written reviews and watch customer video stories connected to the exact NatureMist botanical they describe.",
  alternates: { canonical: "/reviews" },
};

export default async function ReviewsRoute() {
  const judgemeReviews = await getJudgemeAllReviewsPage();
  return <ReviewsPage initialJudgemeReviews={judgemeReviews} />;
}
