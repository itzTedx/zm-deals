import { Geist } from "next/font/google";
import localFont from "next/font/local";

export const helvetica = localFont({
  variable: "--font-helvetica",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "arial"],
  src: [
    {
      weight: "200",
      path: "./helvetica/HelveticaNowDisplay-Light.woff",
    },
    {
      weight: "400",
      path: "./helvetica/HelveticaNowDisplay-Regular.woff",
    },
    {
      weight: "500",
      path: "./helvetica/HelveticaNowDisplay-Medium.woff",
    },
  ],
});

export const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  weight: ["400"],
});
