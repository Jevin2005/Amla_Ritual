import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { SiteChrome } from "@/components/site-chrome";
import { StoreProvider } from "@/components/store-provider";
import "./globals.css";

async function requestBaseUrl() {
  const requestHeaders = await headers();
  const forwardedHost = requestHeaders.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || requestHeaders.get("host") || "localhost:3000";
  const forwardedProtocol = requestHeaders.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol = forwardedProtocol || (host.startsWith("localhost") ? "http" : "https");

  try {
    return new URL(`${protocol}://${host}`);
  } catch {
    return new URL("http://localhost:3000");
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const metadataBase = await requestBaseUrl();
  const title = "NatureMist — Pure Botanicals, Powerful Rituals";
  const description =
    "Traditional Indian botanical powders, translated into clear and considered rituals for modern hair care.";

  return {
    metadataBase,
    title: {
      default: title,
      template: "%s | NatureMist",
    },
    description,
    applicationName: "NatureMist",
    keywords: [
      "NatureMist",
      "Ayurvedic hair rituals",
      "Amla powder",
      "botanical hair care",
      "Indian beauty rituals",
    ],
    openGraph: {
      type: "website",
      siteName: "NatureMist",
      title,
      description,
      url: "/",
      images: [
        {
          url: "/naturemist-social-redesign.png",
          width: 1536,
          height: 1024,
          alt: "NatureMist — Pure botanicals. Powerful rituals.",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/naturemist-social-redesign.png"],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#173f2a",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" data-scroll-behavior="smooth">
      <body>
        <StoreProvider>
          <SiteChrome>{children}</SiteChrome>
        </StoreProvider>
      </body>
    </html>
  );
}
