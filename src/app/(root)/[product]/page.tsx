import { FeedbackCard } from "@/components/feedback-card";
import { ShareCard } from "@/components/global/share-card";
import { InfoTooltip } from "@/components/global/tooltip";
import { SectionHeader } from "@/components/layout/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ImageCarousel from "@/components/ui/carousel-with-thumbnail";
import { SeparatorBox } from "@/components/ui/separator";

import { IconChevronRight } from "@/assets/icons/chevron";
import { IconCurrency } from "@/assets/icons/currency";

import { PRODUCT } from "@/data/product";
import { env } from "@/lib/env/client";
import { calculateDiscount } from "@/lib/utils";
import { PastDeals } from "@/modules/home/sections";
import { EndsInCounter } from "@/modules/product/components/ends-in-counter";
import { QuantityInput } from "@/modules/product/components/quantity-input";

export default function ProductPage() {
  const { title, price, originalPrice, featuredImage, images, stock, overview, description, endsIn, reviews, slug } =
    PRODUCT;
  return (
    <main className="">
      <header className="container relative grid max-w-7xl grid-cols-1 gap-6 border-x py-6 md:grid-cols-2 md:gap-8 md:py-8 lg:gap-12 lg:py-12 xl:py-16">
        {/* Image Carousel Section */}
        <div>
          <ImageCarousel images={[{ url: featuredImage }, ...images]} thumbPosition="bottom" />
        </div>

        {/* Product Details Section */}
        <div className="space-y-4 md:space-y-6">
          {/* Countdown Banner */}
          <EndsInCounter endsIn={endsIn} />

          {/* Product Title */}
          <div className="grid grid-cols-[1fr_auto] items-center gap-2">
            <h1 className="font-medium text-2xl sm:text-3xl">{title}</h1>
            <ShareCard
              description={`Check out this amazing deal: ${title} - Save ${calculateDiscount(Number(originalPrice), Number(price))}% off!`}
              link={`${env.NEXT_PUBLIC_BASE_URL}/${slug}`}
              title={title}
            />
            <p className="text-base text-gray-500 leading-relaxed">{overview}</p>
          </div>
          {/* Pricing Section */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <p className="relative flex items-center gap-1 font-bold text-2xl text-brand-600 normal-nums">
              <span>
                <IconCurrency className="size-5 text-brand-400" />
              </span>
              <span>{price}</span>
            </p>

            <p className="text-muted-foreground text-xs line-through sm:text-sm md:text-base">{originalPrice}</p>

            <div className="size-0.5 rounded-full bg-gray-300 sm:size-1" />

            <Badge className="text-xs sm:text-sm" size="sm" variant="destructive">
              Save {calculateDiscount(Number(originalPrice), Number(price))}% Today!
            </Badge>

            <div className="size-0.5 rounded-full bg-gray-300 sm:size-1" />

            <Badge size="sm">
              Only <span className="font-medium">{stock}</span> left
              <InfoTooltip info="The Stock tag shows the available units for the selected item. Sellers control whether to display it and manage their own inventory." />
            </Badge>
          </div>

          {/* CTA Button */}
          <QuantityInput />
          <Button className="w-full" size="lg">
            Claim this deal now <IconChevronRight />
          </Button>

          {/* Product Description Card */}
          {/* <Card>
            <CardHeader>
              <p className="font-medium text-muted-foreground text-sm">Product Description</p>
            </CardHeader>
            <CardContent>
              <p className="text-base text-gray-800 leading-relaxed md:text-lg">{overview}</p>
            </CardContent>
          </Card> */}
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
