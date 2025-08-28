import Image from "next/image";
import Link from "next/link";

import { SectionHeader } from "@/components/layout/section-header";
import { Badge } from "@/components/ui/badge";
import { SeparatorBox } from "@/components/ui/separator";

import { IconChevronRight, IconFire, IconHourglass } from "@/assets/icons";

import { getLastMinuteDeals } from "@/lib/utils";
import { getProducts } from "@/modules/product/actions/query";
import { ProductCard } from "@/modules/product/components/product-card";

export const Deals = async () => {
  const products = await getProducts();
  return (
    <section className="container relative space-y-12 pb-8 sm:pb-12 md:space-y-16 md:pb-16 lg:pb-20">
      <div>
        <Badge variant="outline">
          <IconFire className="text-yellow-500" />
          Deals{" "}
          <span className="ml-1 rounded-sm bg-brand-500/10 px-1 py-0.5 font-medium text-brand-500 text-xs">
            Hot Deals
          </span>
        </Badge>

        <SectionHeader
          btnText="Deals"
          className="mt-4 sm:mt-6"
          description="Grab the best discounts on trending products. These deals are live for a limited time – shop them before they’re gone!"
          link="/deals"
          title="This Week's Hot Picks"
        />
        <div className="mt-6 grid grid-cols-2 gap-2 sm:mt-8 sm:gap-4 md:mt-10 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard data={product} key={product.id} />
          ))}
          <Link
            className="col-span-full mt-4 text-center text-muted-foreground text-sm sm:mt-6 md:text-lg"
            href="/#community"
          >
            Be the <span className="font-medium text-foreground">First</span> to Know About the{" "}
            <span className="font-medium text-foreground">Next Deal</span>
            <IconChevronRight className="ml-2 inline-block size-3" />
          </Link>
        </div>
      </div>

      <SeparatorBox />
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
            btnText="Deals"
            className="mt-4 sm:mt-6"
            description="Hurry up! These deals are ending soon. Don’t miss your chance to save big before time runs out."
            link="/deals"
            title="Last Minute Deals"
          />
          <div className="mt-6 grid grid-cols-2 gap-2 sm:mt-8 sm:gap-4 md:mt-10 lg:grid-cols-4">
            {getLastMinuteDeals(products, 24).map((product) => (
              <ProductCard data={product} key={product.id} />
            ))}
          </div>
        </div>
      )}
      <div className="relative aspect-16/5 w-full">
        <Image alt="deals" className="rounded-2xl object-cover shadow-xl" fill src="/images/combo-banner.webp" />
      </div>

      {/* <div className="relative">
        <div className="flex items-center gap-6">
          <SeparatorBox />
          <Badge variant="outline">
            <IconHourglass className="text-gray-400" />
            Combo{" "}
            <span className="ml-1 rounded-sm bg-brand-500/10 px-1 py-0.5 font-medium text-brand-500 text-xs">
              Deals
            </span>
          </Badge>
          <SeparatorBox />
        </div>

        <SectionHeader
          btnText="Combos"
          className="mt-4 sm:mt-6"
          description="Bundle your favorites and save on delivery costs. Specially curated combos give you the best value with free delivery included."
          link="/deals/combo"
          title="Save More with Combos"
        />

        <div className="mt-6 grid grid-cols-2 gap-2 sm:mt-8 sm:gap-4 md:mt-10 lg:grid-cols-4">
          {products
            .filter((product) => product.combo)
            .map((product) => (
              <ProductCard data={product} key={product.id} />
            ))}
        </div>
      </div> */}
    </section>
  );
};
