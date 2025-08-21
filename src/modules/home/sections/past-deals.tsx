import { SectionHeader } from "@/components/layout/section-header";
import { Badge } from "@/components/ui/badge";

import { IconFire } from "@/assets/icons/fire";

import { DEALS } from "@/data/product";
import { ProductCard } from "@/modules/product/components/product-card";

export const PastDeals = () => {
  return (
    <section className="container relative max-w-7xl border-x py-8 sm:py-12 md:py-16 lg:py-20">
      <Badge variant="outline">
        <IconFire className="text-yellow-500" />
        Deals{" "}
        <span className="ml-1 rounded-sm bg-brand-500/10 px-1 py-0.5 font-medium text-brand-500 text-xs">
          Hot Deals
        </span>
      </Badge>

      <SectionHeader
        btnText="Past Deals"
        className="mt-4 sm:mt-6"
        description="These exclusive offers didn't last long! Here's a glimpse of what our community scored before they sold out. Don't miss the next one — subscribe and be ready when the new deal drops!"
        link="/past-deals"
        title="Previous Hot-Selling Deals"
      />
      <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-4 md:mt-12 lg:grid-cols-3">
        {DEALS.map((product) => (
          <ProductCard data={product} key={product.id} />
        ))}
      </div>
      <p className="mt-4 text-center text-muted-foreground text-sm sm:mt-6 md:text-lg">
        Be the <span className="font-medium text-foreground">First</span> to Know About the{" "}
        <span className="font-medium text-foreground">Next Deal</span>
      </p>
    </section>
  );
};
