import type { Metadata, Viewport } from "next";
import { Suspense, type CSSProperties, type ReactNode } from "react";
import { getDefaultVariant, type Product } from "@/domain/catalog/products";
import { StoreProvider } from "@/features/store/store-provider";
import { getPublicSiteUrl } from "@/lib/site-url";
import { SUPPORT } from "@/shared/config/support";
import { getStorefront } from "@/lib/shopify/storefront";
import { SiteChrome } from "@/widgets/site-chrome/site-chrome";
import { JudgemeScript } from "@/features/reviews/judgeme-script";
import { SiteLoading } from "@/shared/ui/site-loading";
import { LoadingIndicator } from "@/shared/ui/loading-indicator";
import "./globals.css";
import "@/features/reviews/judgeme.css";

function getBrandName(shopName: string) {
  const name = shopName.trim();
  return !name || /^my store$/i.test(name) ? "NatureMist" : name;
}

function productForGlobalStore(product: Product): Product {
  const defaultVariant = getDefaultVariant(product);
  const photos = [...(product.featuredImage ? [product.featuredImage] : []), ...(product.images || [])];
  const previewImages = [...new Map(photos.map((image) => [image.url, image])).values()].slice(0, 2);
  return {
    ...product,
    images: previewImages,
    variants: defaultVariant ? [defaultVariant] : [],
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const storefront = await getStorefront();
  const metadataBase = new URL(getPublicSiteUrl());
  const brandName = getBrandName(storefront.shopName);
  const title = `${brandName} — Traditional Botanical Hair Rituals`;
  const description =
    "Explore six NatureMist botanical powders in 200 g packs for traditional hair packs, herbal washing and plant-based hair colour, with clear product-specific guidance.";
  const socialImage =
    storefront.source === "shopify"
      ? storefront.content.homeHeroPoster
      : {
          url: "/og-image.jpg",
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
      "herbal hair packs",
      "200 g botanical powders",
      "plant-based hair colour",
      "Indian beauty rituals",
    ],
    alternates: {
      canonical: "./",
    },
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
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#153b2d",
  colorScheme: "light",
};

async function StorefrontShell({ children }: { children: ReactNode }) {
  const storefront = await getStorefront();
  const globalProducts = storefront.products.map(productForGlobalStore);
  const siteUrl = getPublicSiteUrl();

  const brandName = getBrandName(storefront.shopName);
  const organizationSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: brandName,
        url: siteUrl,
        logo: `${siteUrl}/og-image.jpg`,
        description:
          "Traditional botanical powders for hair packs, herbal washing and plant-based hair colour.",
        email: SUPPORT.email,
        telephone: SUPPORT.phone,
        contactPoint: { "@type": "ContactPoint", contactType: "customer support", email: SUPPORT.email, telephone: SUPPORT.phone },
        sameAs: [siteUrl],
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: brandName,
        description:
          "Explore six NatureMist botanical powders in 200 g packs for hair-care and hair-colour routines.",
        publisher: {
          "@id": `${siteUrl}/#organization`,
        },
      },
    ],
  };

  return (
    <div
      style={{ display: "contents", "--motion-duration": storefront.content.motionSettings.duration, "--motion-intensity": storefront.content.motionSettings.intensity } as CSSProperties}
      data-site-motion={storefront.content.motionSettings.enabled ? "on" : "off"}
    >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema).replace(/</g, "\\u003c"),
          }}
        />
        <StoreProvider
          initialProducts={globalProducts}
          initialBundles={storefront.bundles}
          content={storefront.content}
          source={storefront.source}
        >
          <SiteChrome>{children}</SiteChrome>
        </StoreProvider>
        <JudgemeScript />
    </div>
  );
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className="scroll-pt-[calc(var(--header-height)+20px)] bg-[var(--ivory)] [--header-height:88px] max-[1180px]:[--header-height:76px] max-[680px]:[--header-height:60px]">
      <body className="m-0 min-h-screen overflow-x-hidden bg-[var(--ivory)] font-sans text-base leading-[1.6] text-[var(--charcoal)] antialiased [text-rendering:optimizeLegibility] selection:bg-[var(--amla)] selection:text-[var(--forest-dark)] [&_*:focus-visible]:outline-2 [&_*:focus-visible]:outline-offset-4 [&_*:focus-visible]:outline-[var(--botanical)] [&_button:disabled]:cursor-not-allowed [&_button:disabled]:opacity-45 max-[680px]:text-[15px]">
        <SiteLoading />
        <div id="site-content" style={{ display: "contents" }}>
          <Suspense fallback={<LoadingIndicator page label="Opening the botanical cabinet…" />}>
            <StorefrontShell>{children}</StorefrontShell>
          </Suspense>
        </div>
      </body>
    </html>
  );
}
