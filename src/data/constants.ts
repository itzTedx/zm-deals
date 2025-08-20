import { IconShoppingBag, IconWallet } from "@/assets/icons/bag";
import { IconRocket } from "@/assets/icons/rocket";
import { IconBrandInstagram, IconBrandWhatsapp, IconBrandX } from "@/assets/icons/socials";

export const NAV_LINKS = [
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
  {
    label: "Contact",
    href: "/contact",
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

export const SOCIALS = [
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
