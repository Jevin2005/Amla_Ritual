import type { Metadata } from "next";
import { FaqsPage } from "@/features/faqs/faqs-page";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | NatureMist",
  description:
    "Explore answers about pure botanical hair preparation, mixer recipes, scalp suitability, third-party lab testing, and Shopify checkout handoff.",
  alternates: { canonical: "/faqs" },
};

export default function FaqsRoute() {
  return <FaqsPage />;
}
