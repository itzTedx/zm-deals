import { Badge } from "@/components/ui/badge";
import { SeparatorBox } from "@/components/ui/separator";

import { HOW_WORKS } from "@/data/constants";

export const HowWeWorks = () => {
  return (
    <section className="container relative max-w-7xl border-x px-4 py-8 sm:px-6 sm:py-12 md:py-16 lg:px-8 lg:py-20">
      <div className="relative flex items-center justify-between gap-3 pb-6 sm:gap-4 sm:pb-8 md:gap-6 md:pb-12">
        <SeparatorBox />
        <Badge variant="outline">How ZM Deals works</Badge>
        <SeparatorBox />
      </div>
      <div className="grid grid-cols-1 gap-4 divide-y sm:gap-6 md:grid-cols-3 md:divide-x md:divide-y-0 md:pb-12">
        {HOW_WORKS.map(({ title, description, icon: Icon }) => (
          <div className="px-0 py-4 text-center sm:py-6 md:px-6 md:py-0" key={title}>
            <Icon className="mx-auto size-6 sm:size-8 md:size-10" />
            <h3 className="mt-2 font-medium text-base sm:mt-3 sm:text-lg md:mt-4 md:text-xl">{title}</h3>
            <p className="mt-1 text-muted-foreground text-xs sm:mt-2 sm:text-sm md:text-base">{description}</p>
          </div>
        ))}
      </div>
      <SeparatorBox />
    </section>
  );
};
