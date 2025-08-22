import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselIndicator,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import { Background } from "@/assets/background";
import { IconCurrency } from "@/assets/icons/currency";
import { IconHourglass } from "@/assets/icons/hourglass";

import { PRODUCT } from "@/data/product";
import { calculateDiscount } from "@/lib/utils";
import { AnimatedCountdown } from "@/modules/product/components/ends-in-counter";

export const Hero = () => {
  const { title, overview, price, originalPrice, featuredImage, slug, endsIn } = PRODUCT;
  return (
    <section>
      <div className="container relative max-w-7xl gap-4 border-x pb-12 md:pb-14 lg:pb-16 xl:pb-20">
        <div className="relative">
          <Carousel
            className="w-full"
            opts={{
              align: "start",
            }}
          >
            <CarouselContent className="-ml-3">
              <CarouselItem className="basis-1/1 rounded-2xl py-5 pl-4 lg:basis-2/3">
                <div className="grid grid-cols-2 items-center gap-4 overflow-hidden rounded-2xl bg-card p-6 shadow-lg sm:gap-8 md:p-12">
                  <div className="relative z-10 space-y-2 sm:space-y-4">
                    <Badge className="pl-2 font-normal" variant="default">
                      <IconHourglass className="text-brand-50" /> Offer ends in{" "}
                      <AnimatedCountdown className="font-medium text-card text-xs sm:text-sm" endsIn={endsIn} />
                    </Badge>
                    <div className="space-y-2 sm:space-y-3">
                      <h1 className="font-bold leading-tight sm:text-2xl md:text-3xl">{title}</h1>
                      <p className="text-muted-foreground text-xs sm:text-sm md:text-base">{overview}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <p className="relative flex items-center gap-1 font-bold text-brand-600 text-lg normal-nums md:text-2xl">
                        <span>
                          <IconCurrency className="size-4 text-brand-400 md:size-5" />
                        </span>
                        <span>{price}</span>
                      </p>

                      <p className="text-muted-foreground text-xs line-through decoration-brand-500 sm:text-sm md:text-base">
                        {originalPrice}
                      </p>

                      <div className="size-0.5 rounded-full bg-gray-300 sm:size-1" />

                      <Badge className="text-xs sm:text-sm" size="sm" variant="destructive">
                        Save {calculateDiscount(Number(originalPrice), Number(price))}% Today!
                      </Badge>
                    </div>
                    <Button asChild className="w-full text-sm sm:w-auto sm:text-base">
                      <Link href={`/${slug}`}>Claim Your Deal Now</Link>
                    </Button>
                  </div>
                  <div className="relative flex justify-center md:justify-end">
                    <Image
                      alt={title}
                      className="z-10 w-full max-w-xs sm:max-w-sm md:max-w-none"
                      height={500}
                      src={featuredImage}
                      width={500}
                    />
                    <Background className="-translate-1/4 absolute top-0 left-0" />
                  </div>
                </div>
              </CarouselItem>
              <CarouselItem className="basis-1/1 py-5 pl-4 lg:basis-1/3">
                <div className="relative h-full overflow-hidden rounded-2xl bg-card shadow-lg">
                  <div className="relative z-10 flex items-center rounded-xl p-6">
                    <p className="font-medium text-card text-sm uppercase">Sale</p>
                  </div>
                  <Image alt="hero" className="object-cover" fill src="/images/vacuum-holder-1.jpg" />
                </div>
              </CarouselItem>
              <CarouselItem className="basis-1/1 rounded-2xl py-5 pl-4 lg:basis-2/3">
                <div className="grid grid-cols-2 items-center gap-4 overflow-hidden rounded-2xl bg-card p-6 shadow-lg sm:gap-8 md:p-12">
                  <div className="relative z-10 space-y-2 sm:space-y-4">
                    <Badge className="pl-2 font-normal" variant="default">
                      <IconHourglass className="text-brand-50" /> Offer ends in{" "}
                      <AnimatedCountdown className="font-medium text-card text-xs sm:text-sm" endsIn={endsIn} />
                    </Badge>
                    <div className="space-y-2 sm:space-y-3">
                      <h1 className="font-bold leading-tight sm:text-2xl md:text-3xl">{title}</h1>
                      <p className="text-muted-foreground text-xs sm:text-sm md:text-base">{overview}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <p className="relative flex items-center gap-1 font-bold text-brand-600 text-lg normal-nums md:text-2xl">
                        <span>
                          <IconCurrency className="size-4 text-brand-400 md:size-5" />
                        </span>
                        <span>{price}</span>
                      </p>

                      <p className="text-muted-foreground text-xs line-through decoration-brand-500 sm:text-sm md:text-base">
                        {originalPrice}
                      </p>

                      <div className="size-0.5 rounded-full bg-gray-300 sm:size-1" />

                      <Badge className="text-xs sm:text-sm" size="sm" variant="destructive">
                        Save {calculateDiscount(Number(originalPrice), Number(price))}% Today!
                      </Badge>
                    </div>
                    <Button asChild className="w-full text-sm sm:w-auto sm:text-base">
                      <Link href={`/${slug}`}>Claim Your Deal Now</Link>
                    </Button>
                  </div>
                  <div className="relative flex justify-center md:justify-end">
                    <Image
                      alt={title}
                      className="z-10 w-full max-w-xs sm:max-w-sm md:max-w-none"
                      height={500}
                      src={featuredImage}
                      width={500}
                    />
                    <Background className="-translate-1/4 absolute top-0 left-0" />
                  </div>
                </div>
              </CarouselItem>
            </CarouselContent>

            <CarouselPrevious className="-translate-x-1/2 left-0 size-8" variant="outline" />
            <CarouselNext className="right-0 size-8 translate-x-1/2" variant="outline" />

            <CarouselIndicator />
          </Carousel>
        </div>
      </div>
    </section>
  );
};
