import type { Metadata } from "next";

import { Footer } from "@/components/layout/footer";
import { LoginPromptPopup } from "@/components/layout/login-prompt-popup";
import { MobileNavbar } from "@/components/layout/mobile-navbar";
import { Navbar } from "@/components/layout/navbar";

import { AnonymousCartProvider } from "@/modules/cart/components/anonymous-cart-provider";
import { CartSheet } from "@/modules/cart/components/cart-sheet";

export const metadata: Metadata = {
  title: "ZM Deals - One Deal Every Week, Big Savings",
  description:
    "Discover amazing deals on premium products every week. Limited-time offers with exclusive discounts on electronics, home goods, and more. Join thousands of smart shoppers saving money with ZM Deals.",
  openGraph: {
    title: "ZM Deals - One Deal Every Week, Big Savings",
    description:
      "Discover amazing deals on premium products every week. Limited-time offers with exclusive discounts on electronics, home goods, and more.",
    url: "/",
  },
  twitter: {
    title: "ZM Deals - One Deal Every Week, Big Savings",
    description:
      "Discover amazing deals on premium products every week. Limited-time offers with exclusive discounts on electronics, home goods, and more.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AnonymousCartProvider>
      <Navbar />
      {children}
      <Footer />
      <CartSheet />
      <LoginPromptPopup />
      <MobileNavbar />
    </AnonymousCartProvider>
  );
}
