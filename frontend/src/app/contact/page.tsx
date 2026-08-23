import type { Metadata } from "next";
import { ContactPage } from "@/features/contact/contact-page";

export const metadata: Metadata = {
  title: "Contact & Botanical Consultation | NatureMist",
  description:
    "Connect with NatureMist botanical specialists for personalized hair ritual guidance, order inquiries, and pure ingredient consultations.",
  alternates: { canonical: "/contact" },
};

export default function ContactRoute() {
  return <ContactPage />;
}
