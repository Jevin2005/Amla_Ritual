import type { Metadata, Viewport } from "next";
import { getDefaultVariant, type Product } from "@/domain/catalog/products";
import { StoreProvider } from "@/features/store/store-provider";
import { getPublicSiteUrl } from "@/lib/site-url";
import { getStorefront } from "@/lib/shopify/storefront";
import { SiteChrome } from "@/widgets/site-chrome/site-chrome";
import "./globals.css";

function productForGlobalStore(product: Product): Product {
  const defaultVariant = getDefaultVariant(product);
  return {
    ...product,
    images: product.featuredImage ? [product.featuredImage] : [],
    variants: defaultVariant ? [defaultVariant] : [],
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const storefront = await getStorefront();
  const metadataBase = new URL(getPublicSiteUrl());
  const brandName = storefront.shopName || "NatureMist";
  const title = `${brandName} — Pure Botanicals, Powerful Rituals`;
  const description =
    "Traditional Indian botanical powders, translated into clear and considered rituals for modern hair care.";
  const socialImage =
    storefront.source === "shopify"
      ? storefront.content.homeHeroPoster
      : {
          url: "/og-shopify.jpg",
          width: 1200,
          height: 630,
          altText: "NatureMist — Pure botanicals. Powerful rituals.",
        };

  return {
    metadataBase,
    title: {
      default: title,
      template: `%s | ${brandName}`,
    },
    description,
    applicationName: brandName,
    keywords: [
      "NatureMist",
      "Ayurvedic hair rituals",
      "Amla powder",
      "botanical hair care",
      "Indian beauty rituals",
    ],
    openGraph: {
      type: "website",
      siteName: brandName,
      title,
      description,
      url: "/",
      images: [
        {
          url: socialImage.url,
          width: socialImage.width,
          height: socialImage.height,
          alt: socialImage.altText || `${brandName} botanical rituals`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImage.url],
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
  themeColor: "#153b2d",
  colorScheme: "light",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const storefront = await getStorefront();
  const globalProducts = storefront.products.map(productForGlobalStore);

  return (
    <html
      lang="en-IN"
      className="scroll-smooth scroll-pt-[calc(var(--header-height)+20px)] bg-[var(--ivory)] [--header-height:88px] max-[1180px]:[--header-height:76px] max-[680px]:[--header-height:60px] motion-reduce:scroll-auto"
      data-scroll-behavior="smooth"
    >
      <body className="m-0 min-h-screen overflow-x-hidden bg-[var(--ivory)] font-sans text-base leading-[1.6] text-[var(--charcoal)] antialiased [text-rendering:optimizeLegibility] selection:bg-[var(--amla)] selection:text-[var(--forest-dark)] [&_*:focus-visible]:outline-2 [&_*:focus-visible]:outline-offset-4 [&_*:focus-visible]:outline-[var(--botanical)] [&_button:disabled]:cursor-not-allowed [&_button:disabled]:opacity-45 max-[680px]:text-[15px]">
        <StoreProvider
          initialProducts={globalProducts}
          initialBundles={storefront.bundles}
          content={storefront.content}
          source={storefront.source}
        >
          <SiteChrome>{children}</SiteChrome>
        </StoreProvider>
      </body>
    </html>
  );
}
