import type { Metadata } from "next";
import { RitualsHub } from "@/widgets/rituals/rituals-hub";

export const metadata: Metadata = {
  title: "The Botanical Ritual Room | NatureMist",
  description:
    "Explore the art of unhurried Ayurvedic hair rituals. Find your botanical match, learn 4-step paste alchemy, master mixing ratios, and discover 4 purpose-driven ritual paths.",
  alternates: { canonical: "/rituals" },
};

export default function RitualsPage() {
  return (
    <main id="main-content">
      <RitualsHub />
    </main>
  );
}
