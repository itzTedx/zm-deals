import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Banner, BannerContent, BannerIcon, BannerText, BannerTitle } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

import { IconChevronRight } from "@/assets/icons/chevron";
import { IconCurrency } from "@/assets/icons/currency";
import { IconHourglass } from "@/assets/icons/hourglass";

import { PRODUCT } from "@/data/product";
import { calculateDiscount, formatTime } from "@/lib/utils";

export default function ProductPage() {
  const { title, price, originalPrice, featuredImage, images, stock, overview, endsIn } = PRODUCT;
  return (
    <main className="container relative max-w-7xl border-x">
      <div className="grid grid-cols-1 gap-6 py-6 md:grid-cols-2 md:gap-8 md:py-8 lg:gap-12 lg:py-12 xl:py-16">
        {/* Image Carousel Section */}
        <div className="order-1 md:order-1">
          <Carousel
            className="w-full overflow-hidden rounded-xl md:rounded-2xl"
            opts={{
              align: "start",
            }}
          >
            <CarouselContent>
              <CarouselItem>
                <div className="relative aspect-square overflow-hidden rounded-xl bg-card p-4 md:aspect-9/8 md:rounded-2xl md:p-6">
                  <Image alt={title} className="object-cover" fill src={featuredImage} />
                </div>
              </CarouselItem>
              {images.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="relative aspect-square overflow-hidden rounded-xl md:aspect-9/8 md:rounded-2xl">
                    <Image alt={title} className="object-cover" fill src={image} />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            <div className="mt-3 flex w-full items-center justify-between gap-2 md:justify-start">
              <CarouselPrevious className="relative left-0 h-8 w-8 translate-y-0 md:h-10 md:w-10" variant="default" />
              <div className="flex-1 md:hidden" />
              <CarouselNext className="relative right-0 h-8 w-8 translate-y-0 md:h-10 md:w-10" variant="default" />
            </div>
          </Carousel>
        </div>

        {/* Product Details Section */}
        <div className="order-2 space-y-4 md:order-2 md:space-y-6 lg:space-y-8">
          {/* Countdown Banner */}
          <Banner variant="destructive">
            <BannerContent>
              <BannerIcon>
                <IconHourglass />
              </BannerIcon>
              <BannerText>
                <BannerTitle className="tracking-[0.0125em]">
                  Deal ends in <span className="font-medium">{formatTime(endsIn)}</span>
                </BannerTitle>
              </BannerText>
            </BannerContent>
          </Banner>

          {/* Product Title */}
          <h1 className="font-bold text-2xl leading-tight sm:text-3xl md:text-4xl">{title}</h1>

          {/* Pricing Section */}
          <div className="space-y-2 md:space-y-3">
            <p className="relative flex items-center gap-1 font-bold text-2xl text-gray-800 normal-nums md:text-3xl lg:text-4xl">
              <span>
                <IconCurrency className="size-5 text-muted-foreground lg:size-7" />
              </span>
              <span>{price}</span>
            </p>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="relative flex items-center gap-0.5 text-gray-400 normal-nums">
                <span className="-translate-y-1/2 -translate-1/2 absolute top-1/2 left-1/2 h-px w-[115%] bg-gray-400" />
                <span>
                  <IconCurrency className="size-2.5 sm:size-3 md:size-3.5" />
                </span>
                <p className="text-xs sm:text-sm md:text-base">{originalPrice}</p>
              </div>

              <div className="hidden size-1 rounded-full bg-gray-400 sm:block" />

              <Badge className="text-xs sm:text-sm" size="sm" variant="destructive">
                Save {calculateDiscount(originalPrice, price)}% Today!
              </Badge>

              <div className="hidden size-1 rounded-full bg-gray-400 sm:block" />

              <p className="text-xs sm:text-sm md:text-base">
                Only <span className="font-medium">{stock}</span> left in stock!
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <Button className="w-full text-sm sm:text-base md:text-lg" size="lg">
            Claim Your Deal Now <IconChevronRight />
          </Button>

          {/* Product Description Card */}
          <Card>
            <CardHeader>
              <p className="font-medium text-muted-foreground text-sm">Product Description</p>
            </CardHeader>
            <CardContent>
              <p className="text-base text-gray-800 leading-relaxed md:text-lg">{overview}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
