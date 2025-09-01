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
import { ProductQueryResult } from "@/modules/product/types";

// Types
interface HeroProductCardProps {
  product: ProductQueryResult;
  isFirst?: boolean;
}

interface HeroBannerProps {
  className?: string;
}

// Main Component
export const Hero = async () => {
  try {
    const products = await getFeaturedProducts();

    if (!products || products.length === 0) {
      return (
        <section>
          <div className="container py-16 text-center">
            <h1 className="font-bold text-2xl text-muted-foreground">No featured products available at the moment</h1>
          </div>
        </section>
      );
    }

    const [firstProduct, ...remainingProducts] = products;

    return (
      <section>
        <div className="container relative gap-4 pb-9">
          <div className="relative">
            <Carousel
              className="w-full"
              opts={{
                align: "start",
                loop: true,
                skipSnaps: false,
              }}
            >
              <CarouselContent className="-ml-3">
                {/* First Product - Full Width */}
                <CarouselItem className="basis-full rounded-2xl py-5 pl-4 lg:basis-2/3">
                  <HeroProductCard isFirst product={firstProduct} />
                </CarouselItem>

                {/* Hero Banner */}
                <CarouselItem className="basis-full py-5 pl-4 lg:basis-1/3">
                  <HeroBanner />
                </CarouselItem>

                {/* Remaining Products */}
                {remainingProducts.map((product) => (
                  <CarouselItem className="basis-full rounded-2xl py-5 pl-4 lg:basis-2/3" key={product.id}>
                    <HeroProductCard product={product} />
                  </CarouselItem>
                ))}
              </CarouselContent>

              <CarouselPrevious
                aria-label="Previous slide"
                className="-translate-x-1/2 left-0 size-8"
                variant="outline"
              />
              <CarouselNext aria-label="Next slide" className="right-0 size-8 translate-x-1/2" variant="outline" />

              <CarouselIndicator />
            </Carousel>
          </div>
        </div>

        <TrustBanner />
      </section>
    );
  } catch (error) {
    console.error("Error loading hero section:", error);
    return (
      <section>
        <div className="container py-16 text-center">
          <h1 className="font-bold text-2xl text-muted-foreground">Unable to load featured products</h1>
          <p className="mt-2 text-muted-foreground">Please try again later</p>
        </div>
      </section>
    );
  }
};

// Extracted Components
function HeroProductCard({ product, isFirst = false }: HeroProductCardProps) {
  const discount = calculateDiscount(Number(product.compareAtPrice), Number(product.price));

  return (
    <div className="grid grid-cols-2 items-center gap-4 overflow-hidden rounded-2xl bg-card p-6 shadow-lg sm:gap-8 md:p-12">
      <div className="relative z-50 space-y-2 sm:space-y-4">
        {product.endsIn && (
          <Badge className="px-1.5 font-normal md:pl-2" variant="default">
            <IconHourglass className="text-brand-50" />
            <span className="hidden md:block">Offer</span> Ends in{" "}
            <AnimatedCountdown className="font-medium text-card text-xs sm:text-sm" endsIn={product.endsIn} />
          </Badge>
        )}

        <div className="space-y-2 sm:space-y-3">
          <h1 className="font-bold leading-tight sm:text-2xl md:text-3xl">{product.title}</h1>
          <p className="hidden text-muted-foreground text-xs sm:text-sm md:block md:text-base">{product.overview}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <p className="relative flex items-center gap-1 font-bold text-brand-600 text-lg normal-nums md:text-2xl">
            <IconCurrency className="size-4 text-brand-400 md:size-5" />
            <span>{product.price}</span>
          </p>

          {product.compareAtPrice && (
            <>
              <p className="text-muted-foreground text-xs line-through decoration-brand-500 sm:text-sm md:text-base">
                {product.compareAtPrice}
              </p>
              <div className="size-0.5 rounded-full bg-gray-300 sm:size-1" />
              <Badge className="text-xs sm:text-sm" size="sm" variant="destructive">
                Save {discount}% Today!
              </Badge>
            </>
          )}
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
          priority={isFirst}
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
          src={product.image}
          width={500}
        />
        <Background className="-translate-x-1/4 absolute top-0 left-0" />
      </div>
    </div>
  );
}

function HeroBanner({ className }: HeroBannerProps) {
  return (
    <div className={`relative h-full overflow-hidden rounded-2xl bg-card shadow-lg ${className}`}>
      <Image
        alt="Special offer banner"
        className="object-cover"
        fill
        sizes="(max-width: 768px) 33vw, 25vw"
        src="/images/hero-banner.webp"
      />
    </div>
  );
}

function TrustBanner() {
  return (
    <div className="container pb-16">
      <div className="relative aspect-16/3 w-full md:aspect-16/2">
        <Image
          alt="Trust indicators and guarantees"
          className="rounded-lg object-cover md:rounded-2xl"
          fill
          sizes="(max-width: 768px) 100vw, 80vw"
          src="/images/trust-banner.webp"
        />
      </div>
    </div>
  );
}
