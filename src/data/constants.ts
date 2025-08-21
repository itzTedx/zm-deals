import { JSX } from "react";
import type { Route } from "next";

import { IconShoppingBag, IconWallet } from "@/assets/icons/bag";
import { IconRocket } from "@/assets/icons/rocket";
import { IconBrandInstagram, IconBrandWhatsapp, IconBrandX } from "@/assets/icons/socials";

export const NAV_LINKS: { label: string; href: Route }[] = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Past Deals",
    href: "/past-deals",
  },
  {
    label: "FAQs",
    href: "/faqs",
  },
];

export const HOW_WORKS = [
  {
    icon: IconShoppingBag,
    title: "Discover",
    description:
      "We handpick one exclusive product every week, from must-have gadgets to smart car accessories. Each deal is carefully selected to give you the best value and quality.",
  },
  {
    icon: IconWallet,
    title: "Save Big",
    description:
      "Get massive discounts with our weekly coupons. Simply apply the coupon at checkout and watch the price drop. No hidden fees — just pure savings on trending products.",
  },
  {
    icon: IconRocket,
    title: "Enjoy",
    description:
      "Sit back and relax while we ship your deal right to your doorstep. With fast delivery, secure payments powered by Stripe, and a 7-day return policy, shopping with us is hassle-free.",
  },
];

export const SOCIALS: {
  id: number;
  icon: (props: SvgProps) => JSX.Element;
  title: string;
  description: string;
  href: Route;
}[] = [
  {
    id: 1,
    icon: IconBrandX,
    title: "X",
    description: "Stay updated with sneak peeks of next week’s deal, customer highlights, and exclusive flash sales.",
    href: "https://x.com/zmdeals",
  },
  {
    id: 2,
    icon: IconBrandInstagram,
    title: "Instagram",
    description: "Join thousands of shoppers, share reviews, and never miss a limited-time coupon",
    href: "https://www.instagram.com/zmdeals",
  },
  {
    id: 3,
    icon: IconBrandWhatsapp,
    title: "Whatsapp",
    description: "WhatsApp Updates Receive instant notifications about new product drops and coupon codes.",
    href: "https://wa.me/971987654321",
  },
];

export const NEWSLETTER_LIST = ["Weekly Deals", "Exclusive Coupons", "Early Access"];

export const FOOTER_LINKS: { heading: string; links: { label: string; href: Route }[] }[] = [
  {
    heading: "Quick Links",
    links: [
      {
        label: "Home",
        href: "/",
      },
      {
        label: "Past Deals",
        href: "/past-deals",
      },
      {
        label: "Testimonials",
        href: "/testimonials",
      },
      {
        label: "FAQs",
        href: "/faqs",
      },
    ],
  },
  {
    heading: "Company",
    links: [
      {
        label: "About ZM Deals",
        href: "/about",
      },
    ],
  },
  {
    heading: "Past Deals",
    links: [
      {
        label: "Magnetic Car Phone Mount",
        href: "/deals",
      },
      {
        label: "USB Car Charger",
        href: "/deals",
      },
      {
        label: "Apple Airpods Pro 2",
        href: "/deals",
      },
    ],
  },
  {
    heading: "Legal",
    links: [
      {
        label: "Terms & Conditions",
        href: "/legal/terms-and-conditions",
      },
      {
        label: "Privacy Policy",
        href: "/legal/privacy-policy",
      },
      {
        label: "Refund & Returns Policy",
        href: "/legal/refund-and-returns-policy",
      },
      {
        label: "Shipping Information",
        href: "/legal/shipping-information",
      },
    ],
  },
  {
    heading: "Customer Support",
    links: [
      {
        label: "support@zmdeals.com",
        href: "mailto:support@zmdeals.com",
      },
      {
        label: "Whatsapp",
        href: "https://wa.me/971987654321",
      },
      {
        label: "+971-XXX-XXXXXX",
        href: "tel:+971-XXX-XXXXXX",
      },
    ],
  },
];
