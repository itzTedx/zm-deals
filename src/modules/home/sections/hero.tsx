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
import { IconCurrency, IconHourglass } from "@/assets/icons";

import { calculateDiscount } from "@/lib/utils";
import { getFeaturedProducts } from "@/modules/product/actions/query";
import { AnimatedCountdown } from "@/modules/product/components/ends-in-counter";

export const Hero = async () => {
  const product = await getFeaturedProducts();

  return (
    <section>
      <div className="container relative gap-4 pb-9">
        <div className="relative">
          <Carousel
            className="w-full"
            opts={{
              align: "start",
            }}
          >
            <CarouselContent className="-ml-3">
              {product && (
                <CarouselItem className="basis-1/1 rounded-2xl py-5 pl-4 lg:basis-2/3">
                  <div className="grid grid-cols-2 items-center gap-4 overflow-hidden rounded-2xl bg-card p-6 shadow-lg sm:gap-8 md:p-12">
                    <div className="relative z-50 space-y-2 sm:space-y-4">
                      {product[0].endsIn && (
                        <Badge className="px-1.5 font-normal md:pl-2" variant="default">
                          <IconHourglass className="text-brand-50" /> <span className="hidden md:block">Offer</span>{" "}
                          Ends in{" "}
                          <AnimatedCountdown
                            className="font-medium text-card text-xs sm:text-sm"
                            endsIn={product[0].endsIn}
                          />
                        </Badge>
                      )}
                      <div className="space-y-2 sm:space-y-3">
                        <h1 className="font-bold leading-tight sm:text-2xl md:text-3xl">{product[0].title}</h1>
                        <p className="hidden text-muted-foreground text-xs sm:text-sm md:block md:text-base">
                          {product[0].overview}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <p className="relative flex items-center gap-1 font-bold text-brand-600 text-lg normal-nums md:text-2xl">
                          <span>
                            <IconCurrency className="size-4 text-brand-400 md:size-5" />
                          </span>
                          <span>{product[0].price}</span>
                        </p>

                        <p className="text-muted-foreground text-xs line-through decoration-brand-500 sm:text-sm md:text-base">
                          {product[0].compareAtPrice}
                        </p>

                        <div className="size-0.5 rounded-full bg-gray-300 sm:size-1" />

                        <Badge className="text-xs sm:text-sm" size="sm" variant="destructive">
                          Save {calculateDiscount(Number(product[0].compareAtPrice), Number(product[0].price))}% Today!
                        </Badge>
                      </div>
                      <Button asChild className="w-full text-sm sm:w-auto sm:text-base">
                        <Link href={`/${product[0].slug}`}>Claim Your Deal Now</Link>
                      </Button>
                    </div>
                    <div className="relative flex justify-center md:justify-end">
                      <Image
                        alt={product[0].title}
                        className="z-10 w-full max-w-xs sm:max-w-sm md:max-w-xs"
                        height={500}
                        src={product[0].image}
                        width={500}
                      />
                      <Background className="-translate-1/4 absolute top-0 left-0" />
                    </div>
                  </div>
                </CarouselItem>
              )}
              <CarouselItem className="basis-1/1 py-5 pl-4 lg:basis-1/3">
                <div className="relative h-full overflow-hidden rounded-2xl bg-card shadow-lg">
                  <Image alt="hero" className="object-cover" fill src="/images/hero-banner.webp" />
                </div>
              </CarouselItem>
              {product.map((product) => (
                <CarouselItem className="basis-1/1 rounded-2xl py-5 pl-4 lg:basis-2/3" key={product.id}>
                  <div className="grid grid-cols-2 items-center gap-4 overflow-hidden rounded-2xl bg-card p-6 shadow-lg sm:gap-8 md:p-12">
                    <div className="relative z-50 space-y-2 sm:space-y-4">
                      {product.endsIn && (
                        <Badge className="px-1.5 font-normal md:pl-2" variant="default">
                          <IconHourglass className="text-brand-50" /> <span className="hidden md:block">Offer</span>{" "}
                          Ends in{" "}
                          <AnimatedCountdown
                            className="font-medium text-card text-xs sm:text-sm"
                            endsIn={product.endsIn}
                          />
                        </Badge>
                      )}
                      <div className="space-y-2 sm:space-y-3">
                        <h1 className="font-bold leading-tight sm:text-2xl md:text-3xl">{product.title}</h1>
                        <p className="hidden text-muted-foreground text-xs sm:text-sm md:block md:text-base">
                          {product.overview}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <p className="relative flex items-center gap-1 font-bold text-brand-600 text-lg normal-nums md:text-2xl">
                          <span>
                            <IconCurrency className="size-4 text-brand-400 md:size-5" />
                          </span>
                          <span>{product.price}</span>
                        </p>

                        <p className="text-muted-foreground text-xs line-through decoration-brand-500 sm:text-sm md:text-base">
                          {product.compareAtPrice}
                        </p>

                        <div className="size-0.5 rounded-full bg-gray-300 sm:size-1" />

                        <Badge className="text-xs sm:text-sm" size="sm" variant="destructive">
                          Save {calculateDiscount(Number(product.compareAtPrice), Number(product.price))}% Today!
                        </Badge>
                      </div>
                      <Button asChild className="w-full text-sm sm:w-auto sm:text-base">
                        <Link href={`/${product.slug}`}>Claim Your Deal Now</Link>
                      </Button>
                    </div>
                    <div className="relative flex justify-center md:justify-end">
                      <Image
                        alt={product.title}
                        className="z-10 w-full max-w-xs sm:max-w-sm md:max-w-xs"
                        height={500}
                        src={product.image}
                        width={500}
                      />
                      <Background className="-translate-1/4 absolute top-0 left-0" />
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            <CarouselPrevious className="-translate-x-1/2 left-0 size-8" variant="outline" />
            <CarouselNext className="right-0 size-8 translate-x-1/2" variant="outline" />

            <CarouselIndicator />
          </Carousel>
        </div>
      </div>
      <div className="container pb-16">
        <div className="relative aspect-16/3 w-full md:aspect-16/2">
          <Image alt="hero" className="rounded-lg object-cover md:rounded-2xl" fill src="/images/trust-banner.webp" />
        </div>
      </div>
    </section>
  );
};
