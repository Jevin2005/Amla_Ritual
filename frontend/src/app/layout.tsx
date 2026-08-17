import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { StoreProvider } from "@/features/store/store-provider";
import { SiteChrome } from "@/widgets/site-chrome/site-chrome";
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
    <html
      lang="en-IN"
      className="scroll-smooth scroll-pt-[calc(var(--header-height)+20px)] bg-[var(--ivory)] [--header-height:88px] max-[1180px]:[--header-height:76px] max-[680px]:[--header-height:60px] motion-reduce:scroll-auto"
      data-scroll-behavior="smooth"
    >
      <body className="m-0 min-h-screen overflow-x-hidden bg-[var(--ivory)] font-sans text-base leading-[1.6] text-[var(--charcoal)] antialiased [text-rendering:optimizeLegibility] selection:bg-[var(--amla)] selection:text-[var(--forest-dark)] [&_*:focus-visible]:outline-2 [&_*:focus-visible]:outline-offset-4 [&_*:focus-visible]:outline-[var(--botanical)] [&_button:disabled]:cursor-not-allowed [&_button:disabled]:opacity-45 max-[680px]:text-[15px]">
        <StoreProvider>
          <SiteChrome>{children}</SiteChrome>
        </StoreProvider>
      </body>
    </html>
  );
}
