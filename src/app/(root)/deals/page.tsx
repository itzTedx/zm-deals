import type { Metadata } from "next";

import { SectionHeader } from "@/components/layout/section-header";
import { Badge } from "@/components/ui/badge";
import { SeparatorBox } from "@/components/ui/separator";

import { IconFire } from "@/assets/icons/fire";
import { IconHourglass } from "@/assets/icons/hourglass";

import { env } from "@/lib/env/server";
import { getLastMinuteDeals } from "@/lib/utils";
import { getProducts } from "@/modules/product/actions/query";
import { ProductCard } from "@/modules/product/components/product-card";

export const metadata: Metadata = {
  title: "Hot Deals & Last Minute Offers",
  description:
    "Discover amazing deals on premium products. Browse our collection of hot-selling deals and last-minute offers with exclusive discounts on electronics, home goods, and more.",
  keywords: [
    "hot deals",
    "last minute deals",
    "discounts",
    "savings",
    "limited time offers",
    "flash sales",
    "premium products",
  ],
  openGraph: {
    title: "Hot Deals & Last Minute Offers",
    description:
      "Discover amazing deals on premium products. Browse our collection of hot-selling deals and last-minute offers with exclusive discounts on electronics, home goods, and more.",
    url: `${env.BASE_URL}/deals`,
    siteName: "ZM Deals",
    type: "website",
  },
  twitter: {
    title: "Hot Deals & Last Minute Offers",
    description:
      "Discover amazing deals on premium products. Browse our collection of hot-selling deals and last-minute offers with exclusive discounts on electronics, home goods, and more.",
  },
  alternates: {
    canonical: `${env.BASE_URL}/deals`,
  },
};

export default async function DealsPage() {
  const products = await getProducts();
  return (
    <main className="container relative max-w-7xl space-y-12 border-x pt-12 pb-8 sm:pb-12 md:space-y-16 md:pb-16 lg:pb-20">
      {getLastMinuteDeals(products, 24).length > 0 && (
        <div>
          <Badge variant="outline">
            <IconHourglass className="text-gray-400" />
            Deals{" "}
            <span className="ml-1 rounded-sm bg-brand-500/10 px-1 py-0.5 font-medium text-brand-500 text-xs">
              Last Minute
            </span>
          </Badge>

          <SectionHeader
            className="mt-4 sm:mt-6"
            description="Hurry up! These deals are ending soon. Don't miss your chance to save big before time runs out."
            hasButton={false}
            title="Last Minute Deals"
          />
          <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-4 md:mt-10 lg:grid-cols-3">
            {getLastMinuteDeals(products, 24).map((product) => (
              <ProductCard data={product} key={product.id} />
            ))}
          </div>
        </div>
      )}
      <SeparatorBox />
      <div>
        <Badge variant="outline">
          <IconFire className="text-yellow-500" />
          Deals{" "}
          <span className="ml-1 rounded-sm bg-brand-500/10 px-1 py-0.5 font-medium text-brand-500 text-xs">
            Hot Deals
          </span>
        </Badge>

        <SectionHeader
          className="mt-4 sm:mt-6"
          description="Grab the best discounts on trending products. These deals are live for a limited time – shop them before they're gone!"
          hasButton={false}
          title="Previous Hot-Selling Deals"
        />
        <div className="mt-6 grid grid-cols-2 gap-3 pb-12 sm:mt-8 sm:gap-4 md:mt-12 md:pb-16 lg:grid-cols-3 lg:pb-20">
          {products.map((product) => (
            <ProductCard data={product} key={product.id} />
          ))}
        </div>
      </div>
      {/* <SeparatorBox />

      <div>
        <Badge variant="outline">
          <IconHourglass className="text-gray-400" />
          Deals{" "}
          <span className="ml-1 rounded-sm bg-brand-500/10 px-1 py-0.5 font-medium text-brand-500 text-xs">Combo</span>
        </Badge>

        <SectionHeader
          className="mt-4 sm:mt-6"
          description="Bundle your favorites and save on delivery costs. Specially curated combos give you the best value with free delivery included."
          hasButton={false}
          title="Save More with Combos"
        />
        <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-4 md:mt-10 lg:grid-cols-3">
          {products.filter((product) => product.combo).map((product) => (
            <ProductCard data={product} key={product.id} />
          ))}
        </div>
      </div> */}
    </main>
  );
}
