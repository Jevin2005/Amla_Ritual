import type { Metadata } from "next";
import { FaqsPage } from "@/features/faqs/faqs-page";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Find answers about NatureMist 200 g botanical powders, hair-pack and wash routines, colour preparation, evidence limits and orders.",
  alternates: { canonical: "/faqs" },
};

export default function FaqsRoute() {
  return <FaqsPage />;
}
