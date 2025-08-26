import "../styles/globals.css";

import type { Metadata, Viewport } from "next";

import { Providers } from "@/components/providers";
import { OrganizationSchema, WebsiteSchema } from "@/components/seo/structured-data";
import { Toaster } from "@/components/ui/sonner";

import { geist, helvetica } from "@/assets/fonts";

import { env } from "@/lib/env/client";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: {
    default: "ZM Deals - One Deal Every Week, Big Savings",
    template: "%s | ZM Deals",
  },
  description:
    "Discover amazing deals on premium products every week. Limited-time offers with exclusive discounts on electronics, home goods, and more. Join thousands of smart shoppers saving money with ZM Deals.",
  keywords: [
    "deals",
    "discounts",
    "savings",
    "limited time offers",
    "premium products",
    "electronics",
    "home goods",
    "coupons",
    "flash sales",
  ],
  authors: [{ name: "ZM Deals Team" }],
  creator: "ZM Deals",
  publisher: "ZM Deals",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(env.NEXT_PUBLIC_BASE_URL),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "ZM Deals - One Deal Every Week, Big Savings",
    description:
      "Discover amazing deals on premium products every week. Limited-time offers with exclusive discounts on electronics, home goods, and more.",
    siteName: "ZM Deals",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ZM Deals - Premium Products at Amazing Prices",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ZM Deals - One Deal Every Week, Big Savings",
    description:
      "Discover amazing deals on premium products every week. Limited-time offers with exclusive discounts on electronics, home goods, and more.",
    images: ["/og-image.jpg"],
    creator: "@zmdeals",
    site: "@zmdeals",
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

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={cn("scroll-smooth")} lang="en">
      <head>
        <link href="/favicon.ico" rel="icon" sizes="any" />
        <link href="/icon.svg" rel="icon" type="image/svg+xml" />
        <link href="/apple-touch-icon.png" rel="apple-touch-icon" />
        <link href="/manifest.json" rel="manifest" />
        <meta content="#ffffff" name="theme-color" />
        <meta content="#ffffff" name="msapplication-TileColor" />
        <meta content="/browserconfig.xml" name="msapplication-config" />
      </head>
      <body className={cn(helvetica.className, geist.variable, "max-sm:overflow-x-hidden")}>
        <Providers>
          {children}

          <Toaster position="top-center" richColors />
        </Providers>

        {/* Structured Data for SEO */}
        <WebsiteSchema
          description="Discover amazing deals on premium products every week. Limited-time offers with exclusive discounts on electronics, home goods, and more."
          name="ZM Deals"
          url={env.NEXT_PUBLIC_BASE_URL}
        />
        <OrganizationSchema
          description="Your trusted source for amazing deals on premium products every week."
          logo={`${env.NEXT_PUBLIC_BASE_URL}/logo.png`}
          name="ZM Deals"
          sameAs={["https://x.com/zmdeals", "https://www.instagram.com/zmdeals", "https://wa.me/971987654321"]}
          url={env.NEXT_PUBLIC_BASE_URL}
        />
      </body>
    </html>
  );
}
