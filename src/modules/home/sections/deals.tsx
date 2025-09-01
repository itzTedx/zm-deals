import Image from "next/image";
import Link from "next/link";

import { SectionHeader } from "@/components/layout/section-header";
import { Badge } from "@/components/ui/badge";
import { SeparatorBox } from "@/components/ui/separator";

import { IconChevronRight, IconFire, IconHourglass } from "@/assets/icons";

import { getOptimizedDealsData } from "@/modules/home/actions/query";
import { ProductCard } from "@/modules/product/components/product-card";

export const Deals = async () => {
  const { products, comboDeals, lastMinuteDeals, todayDeals } = await getOptimizedDealsData();

  return (
    <section className="container relative space-y-12 pb-8 sm:pb-12 md:space-y-16 md:pb-16 lg:pb-20">
      {lastMinuteDeals.length > 0 && (
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
            description="Hurry up! These deals are ending soon. Don't miss your chance to save big before time runs out."
            link="/deals"
            title="Last Minute Deals"
          />
          <div className="mt-6 grid grid-cols-2 gap-2 sm:mt-8 sm:gap-4 md:mt-10 lg:grid-cols-4">
            {lastMinuteDeals.map((product) => (
              <ProductCard data={product} key={product.id} />
            ))}
          </div>
        </div>
      )}

      {todayDeals.length > 0 && (
        <div>
          <Badge variant="outline">
            <IconHourglass className="text-gray-400" />
            Deals{" "}
            <span className="ml-1 rounded-sm bg-brand-500/10 px-1 py-0.5 font-medium text-brand-500 text-xs">
              Trending
            </span>
          </Badge>

          <SectionHeader
            btnText="Deals"
            className="mt-4 sm:mt-6"
            description="Hurry up! These deals are ending soon. Don't miss your chance to save big before time runs out."
            link="/deals"
            title="Today's Deals"
          />
          <div className="mt-6 grid grid-cols-2 gap-2 sm:mt-8 sm:gap-4 md:mt-10 lg:grid-cols-4">
            {todayDeals.map((product) => (
              <ProductCard data={product} key={product.id} />
            ))}
          </div>
        </div>
      )}

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
          description="Grab the best discounts on trending products. These deals are live for a limited time – shop them before they're gone!"
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

      {/* <div className="relative aspect-16/5 w-full">
        <Image alt="deals" className="rounded-2xl object-cover shadow-xl" fill src="/images/combo-banner.webp" />
      </div> */}

      <div className="relative aspect-16/3 w-full md:aspect-16/2">
        <Image
          alt="Trust indicators and guarantees"
          className="rounded-lg object-cover md:rounded-2xl"
          fill
          sizes="(max-width: 768px) 100vw, 80vw"
          src="/images/trust-banner.webp"
        />
      </div>

      {comboDeals.map((combo) => (
        <div key={combo.id}>
          <SectionHeader
            className="mt-4 sm:mt-6"
            description={combo.description}
            hasButton={false}
            title={combo.title}
          />
          <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-4 md:mt-10 lg:grid-cols-4">
            {combo.products.map(
              (product) => product.product && <ProductCard data={product.product} key={product.id} />
            )}
          </div>
        </div>
      ))}
    </section>
  );
};
