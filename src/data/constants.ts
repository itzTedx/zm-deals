import { IconShoppingBag, IconWallet } from "@/assets/icons/bag";
import { IconRocket } from "@/assets/icons/rocket";

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
