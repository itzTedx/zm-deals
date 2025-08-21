import { SectionHeader } from "@/components/layout/section-header";
import { Badge } from "@/components/ui/badge";
import { SeparatorBox } from "@/components/ui/separator";

import { IconFire } from "@/assets/icons/fire";
import { IconHourglass } from "@/assets/icons/hourglass";

import { DEALS } from "@/data/product";
import { ProductCard } from "@/modules/product/components/product-card";

export const Deals = () => {
  return (
    <section className="container relative max-w-7xl border-x pb-8 sm:pb-12 md:pb-16 lg:pb-20">
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
        title="Previous Hot-Selling Deals"
      />
      <div className="mt-6 grid grid-cols-2 gap-3 pb-12 sm:mt-8 sm:gap-4 md:mt-12 md:pb-16 lg:grid-cols-3 lg:pb-20">
        {DEALS.map((product) => (
          <ProductCard data={product} key={product.id} />
        ))}
      </div>
      <SeparatorBox />
      <div className="pt-12 md:pt-16">
        <Badge variant="outline">
          <IconHourglass />
          Deals{" "}
          <span className="ml-1 rounded-sm bg-brand-500/10 px-1 py-0.5 font-medium text-brand-500 text-xs">
            Last Minute
          </span>
        </Badge>

        <SectionHeader
          className="mt-4 sm:mt-6"
          description="Hurry up! These deals are ending soon. Don’t miss your chance to save big before time runs out."
          hasButton={false}
          title="Last Minute Deals"
        />
        <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-4 md:mt-12 lg:grid-cols-3">
          {DEALS.map((product) => (
            <ProductCard data={product} key={product.id} />
          ))}
        </div>
      </div>

      <p className="mt-4 text-center text-muted-foreground text-sm sm:mt-6 md:text-lg">
        Be the <span className="font-medium text-foreground">First</span> to Know About the{" "}
        <span className="font-medium text-foreground">Next Deal</span>
      </p>
    </section>
  );
};
