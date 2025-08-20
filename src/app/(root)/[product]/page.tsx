import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

import { IconChevronRight } from "@/assets/icons/chevron";
import { IconCurrency } from "@/assets/icons/currency";

import { PRODUCT } from "@/data/product";
import { calculateDiscount } from "@/lib/utils";

export default function ProductPage() {
  const { title, description, price, originalPrice, featuredImage, images, stock, overview } = PRODUCT;
  return (
    <main className="container relative max-w-7xl border-x">
      <div className="grid grid-cols-2 gap-12 py-12 md:py-16">
        <Carousel
          className="w-full overflow-hidden rounded-2xl"
          opts={{
            align: "start",
          }}
        >
          <CarouselContent>
            <CarouselItem>
              <div className="relative aspect-9/8 overflow-hidden rounded-2xl bg-card p-6">
                <Image alt={title} className="object-cover" fill src={featuredImage} />
              </div>
            </CarouselItem>
            {images.map((image, index) => (
              <CarouselItem key={index}>
                <div className="relative aspect-9/8 overflow-hidden rounded-2xl">
                  <Image alt={title} className="object-cover" fill src={image} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          <div className="mt-3 flex w-full items-center gap-2">
            <CarouselPrevious className="relative left-0 translate-y-0" variant="default" />
            {/* <CarouselContent className="-ml-3 flex-1">
              <CarouselItem className="h-28 w-32 pl-3 md:basis-1/2 lg:basis-1/3">
                <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-card p-6">
                  <Image alt={title} className="object-cover" fill src={featuredImage} />
                </div>
              </CarouselItem>
              {images.map((image, index) => (
                <CarouselItem className="h-28 w-32 pl-3 md:basis-1/2 lg:basis-1/3" key={index}>
                  <div className="relative aspect-4/3 overflow-hidden rounded-2xl">
                    <Image alt={title} className="object-cover" fill src={image} />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent> */}
            <CarouselNext className="relative right-0 translate-y-0" variant="default" />
          </div>
        </Carousel>
        <div className="space-y-8 py-2">
          <h1 className="font-bold text-4xl">{title}</h1>
          <div className="space-y-1">
            <p className="relative flex items-center gap-1 font-bold text-gray-800 text-lg normal-nums sm:text-2xl md:text-3xl">
              <span>
                <IconCurrency className="size-3.5 text-muted-foreground sm:size-4 md:size-7" />
              </span>
              <span>{price}</span>
            </p>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative flex items-center gap-0.5 text-gray-400 normal-nums">
                <span className="-translate-y-1/2 -translate-1/2 absolute top-1/2 left-1/2 h-px w-[115%] bg-gray-400" />
                <span>
                  <IconCurrency className="size-3 sm:size-3.5" />
                </span>
                <p className="text-sm sm:text-base">{originalPrice}</p>
              </div>
              <div className="hidden size-0.5 rounded-full bg-gray-400 md:block" />
              <Badge size="sm" variant="destructive">
                Save {calculateDiscount(originalPrice, price)}% Today!
              </Badge>
              <div className="hidden size-0.5 rounded-full bg-gray-400 md:block" />
              <p>
                Only <span className="font-medium">{stock}</span> left in stock!
              </p>
            </div>
          </div>
          <Button className="w-full text-sm sm:text-base" size="lg">
            Claim Your Deal Now <IconChevronRight />
          </Button>
          <Card>
            <CardHeader>
              <p>Product Description</p>
            </CardHeader>
            <CardContent>
              <p className="text-gray-800 text-lg leading-relaxed">{overview}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
