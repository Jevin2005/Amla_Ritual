import type { Metadata } from "next";
import { ContactPage } from "@/features/contact/contact-page";

export const metadata: Metadata = {
  title: "Contact & Botanical Care",
  description:
    "Contact the NatureMist care team for herbal hair-pack, hair-wash and botanical colour guidance, product information and order help.",
  alternates: { canonical: "/contact" },
};

export default function ContactRoute() {
  return <ContactPage />;
}
