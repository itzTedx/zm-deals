import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

import { Background } from "@/assets/background";
import { IconCurrency } from "@/assets/icons/currency";
import { IconHourglass } from "@/assets/icons/hourglass";

import { PRODUCT } from "@/data/product";
import { calculateDiscount } from "@/lib/utils";
import { AnimatedCountdown } from "@/modules/product/components/ends-in-counter";

export const Hero = () => {
  const { title, overview, price, originalPrice, featuredImage, images, slug, endsIn } = PRODUCT;
  return (
    <section className="overflow-hidden">
      <div className="container relative max-w-7xl border-x">
        <div className="grid grid-cols-1 items-center gap-6 pt-6 pb-6 sm:gap-8 sm:pt-8 md:grid-cols-2 md:gap-12 md:pt-12">
          <div className="space-y-4 sm:space-y-6 md:space-y-9">
            <Badge className="pl-2" variant="outline">
              <IconHourglass className="text-brand-500" /> Offer ends in{" "}
              <span className="font-semibold text-foreground">
                <AnimatedCountdown endsIn={endsIn} />
              </span>
            </Badge>
            <div className="space-y-2 sm:space-y-3">
              <h1 className="font-bold text-2xl leading-tight sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
                {title}
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base md:text-lg">{overview}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <p className="relative flex items-center gap-1 font-bold text-2xl text-brand-600 normal-nums">
                <span>
                  <IconCurrency className="size-5 text-brand-400" />
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
            <Background className="absolute top-0 left-0" />
          </div>
        </div>
      </div>
      <Carousel
        className="w-full"
        opts={{
          align: "center",
          loop: true,
        }}
      >
        <CarouselContent className="-ml-3">
          {images.map((image, index) => (
            <CarouselItem className="pl-3 md:basis-1/2 lg:basis-1/3" key={index}>
              <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-card">
                <Image alt={title} className="object-cover" fill src={image.url} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="-translate-1/2 container absolute top-1/2 left-1/2">
          <div className="flex items-center justify-between gap-2">
            <CarouselPrevious className="relative left-0 translate-y-0" variant="default" />
            <CarouselNext className="relative right-0 translate-y-0" variant="default" />
          </div>
        </div>
      </Carousel>
    </section>
  );
};
