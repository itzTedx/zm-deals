import { FeedbackCard } from "@/components/feedback-card";
import { SectionHeader } from "@/components/layout/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import ImageCarousel from "@/components/ui/carousel-with-thumbnail";
import { SeparatorBox } from "@/components/ui/separator";

import { IconChevronRight } from "@/assets/icons/chevron";
import { IconCurrency } from "@/assets/icons/currency";

import { PRODUCT } from "@/data/product";
import { calculateDiscount } from "@/lib/utils";
import { PastDeals } from "@/modules/home/sections";
import { EndsInCounter } from "@/modules/product/components/ends-in-counter";

export default function ProductPage() {
  const { title, price, originalPrice, featuredImage, images, stock, overview, endsIn, reviews } = PRODUCT;
  return (
    <main className="">
      <header className="container relative grid max-w-7xl grid-cols-1 gap-6 border-x py-6 md:grid-cols-2 md:gap-8 md:py-8 lg:gap-12 lg:py-12 xl:py-16">
        {/* Image Carousel Section */}
        <div>
          <ImageCarousel images={[{ url: featuredImage }, ...images]} />
          {/* <Carousel
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
                    <Image alt={title} className="object-cover" fill src={image.url} />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            <div className="mt-3 flex w-full items-center justify-between gap-2 md:justify-start">
              <CarouselPrevious className="relative left-0 h-8 w-8 translate-y-0 md:h-10 md:w-10" variant="default" />
              <div className="flex-1 md:hidden" />
              <CarouselNext className="relative right-0 h-8 w-8 translate-y-0 md:h-10 md:w-10" variant="default" />
            </div>
          </Carousel> */}
        </div>

        {/* Product Details Section */}
        <div className="space-y-4 md:space-y-6 lg:space-y-8">
          {/* Countdown Banner */}
          <EndsInCounter endsIn={endsIn} />

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
      </header>
      <SeparatorBox className="container mx-auto max-w-7xl border-x" />
      <section className="container relative max-w-7xl border-x py-12 md:py-16 lg:py-20">
        <SectionHeader description="What our customers are saying" hasButton={false} title="Ratings & Reviews" />
        <div className="mt-9 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <FeedbackCard key={review.id} review={review} />
          ))}
        </div>
      </section>
      <PastDeals />
    </main>
  );
}
