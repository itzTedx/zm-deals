import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { IconCurrency } from "@/assets/icons/currency";
import { IconHourglass } from "@/assets/icons/hourglass";

import { PRODUCT } from "@/data/product";
import { calculateDiscount } from "@/lib/utils";

export const Hero = () => {
  const { title, description, price, originalPrice, image } = PRODUCT;
  return (
    <section className="container relative max-w-7xl border-x px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 items-center gap-6 py-6 sm:gap-8 sm:py-8 md:grid-cols-2 md:gap-12 md:py-12 lg:py-16">
        <div className="space-y-4 sm:space-y-6 md:space-y-9">
          <Badge className="pl-2" variant="outline">
            <IconHourglass className="text-brand-500" /> Offer ends in{" "}
            <span className="font-semibold text-foreground">2d 14h 23m</span>
          </Badge>
          <div className="space-y-2 sm:space-y-3">
            <h1 className="font-bold text-2xl leading-tight sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
              {title}
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg">{description}</p>
          </div>

          <div className="flex items-center gap-2">
            <p className="relative flex items-center gap-1 font-bold text-gray-800 text-lg normal-nums sm:text-xl md:text-2xl">
              <span>
                <IconCurrency className="size-3.5 sm:size-4 md:size-5" />
              </span>
              <span className="">{price}</span>
            </p>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative flex items-center gap-0.5 text-gray-400 normal-nums">
                <span className="-translate-y-1/2 -translate-1/2 absolute top-1/2 left-1/2 h-px w-[115%] bg-gray-400" />
                <span>
                  <IconCurrency className="size-3 sm:size-3.5" />
                </span>
                <p className="text-sm sm:text-base">{originalPrice}</p>
              </div>
              <Badge size="sm" variant="destructive">
                Save {calculateDiscount(originalPrice, price)}% Today!
              </Badge>
            </div>
          </div>
          <Button className="w-full text-sm sm:w-auto sm:text-base">
            <span>Claim Your Deal Now</span>
          </Button>
        </div>
        <div className="flex justify-center md:justify-end">
          <Image
            alt={title}
            className="w-full max-w-xs sm:max-w-sm md:max-w-none"
            height={500}
            src={image}
            width={500}
          />
        </div>
      </div>
    </section>
  );
};
