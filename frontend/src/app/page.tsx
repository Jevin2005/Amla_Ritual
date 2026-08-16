import type { Metadata } from "next";
import { HomePage } from "@/widgets/home/home-page";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomeRoute() {
  return <HomePage />;
}
