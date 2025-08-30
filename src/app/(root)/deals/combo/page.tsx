import { SectionHeader } from "@/components/layout/section-header";
import { Badge } from "@/components/ui/badge";

import { IconHourglass } from "@/assets/icons";

import { getComboDeals } from "@/modules/combo-deals";
import { ProductCard } from "@/modules/product/components/product-card";

export default async function ComboDeals() {
  const deals = await getComboDeals();

  return (
    <main className="container relative max-w-7xl space-y-12 border-x pt-12 pb-8 sm:pb-12 md:space-y-16 md:pb-16 lg:pb-20">
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
        <div className="mt-6 grid grid-cols-2 gap-3 pb-12 sm:mt-8 sm:gap-4 md:mt-12 md:pb-16 lg:grid-cols-3 lg:pb-20">
          {deals.map((product) => (
            <ProductCard data={product} key={product.id} />
          ))}
        </div>
      </div>
    </main>
  );
}
