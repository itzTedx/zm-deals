import { use } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";

import { ShareCard } from "@/components/global/share-card";
import { InfoTooltip } from "@/components/global/tooltip";
import { Badge } from "@/components/ui/badge";
import { Banner, BannerContent, BannerDescription, BannerIcon, BannerText, BannerTitle } from "@/components/ui/banner";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import ImageCarousel from "@/components/ui/carousel-with-thumbnail";
import StarRating from "@/components/ui/rating";
import { SeparatorBox } from "@/components/ui/separator";

import { IconPackage } from "@/assets/icons/bag";
import { IconDocument } from "@/assets/icons/book";
import { IconCheckboxCircle } from "@/assets/icons/checkbox";
import { IconChevronRight } from "@/assets/icons/chevron";
import { IconCurrency } from "@/assets/icons/currency";
import { IconShield } from "@/assets/icons/shield";

import { DEALS } from "@/data/product";
import { env } from "@/lib/env/client";
import { pluralize } from "@/lib/functions/pluralize";
import { calculateAverageRating, calculateDiscount } from "@/lib/utils";
import { Deals } from "@/modules/home/sections";
import { EndsInCounter } from "@/modules/product/components/ends-in-counter";
import { QuantityInput } from "@/modules/product/components/quantity-input";
import { Reviews } from "@/modules/product/sections/reviews";

type Params = Promise<{ product: string }>;

export default function ProductPage({ params }: { params: Params }) {
  const { product } = use(params);

  // const { title, price, originalPrice, featuredImage, images, stock, overview, description, endsIn, reviews, slug } =
  //   PRODUCT;

  const data = DEALS.find((deal) => deal.slug === product);

  if (!data) {
    return notFound();
  }

  return (
    <main className="">
      <header className="container relative grid max-w-7xl grid-cols-1 gap-6 border-x pt-6 pb-6 md:grid-cols-5 md:gap-8 md:pb-8 lg:gap-12 lg:pb-12">
        {/* Image Carousel Section */}
        <div className="md:col-span-3">
          <Breadcrumb className="pb-3">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/deals">Deals</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage> {data.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <ImageCarousel images={[{ url: data.featuredImage }, ...data.images]} thumbPosition="bottom" />
          <div className="mt-4 hidden space-y-2 md:block">
            <h2 className="font-medium text-gray-500 text-sm">Product Overview</h2>
            <p className="leading-relaxed">{data.description}</p>
            <div className="mt-4 space-y-4">
              {data.images.map((image) => (
                <div className="relative aspect-4/3 overflow-hidden rounded-lg bg-card" key={image.url}>
                  <Image alt={data.title} className="object-cover" fill src={image.url} />
                </div>
              ))}
            </div>
            <p className="leading-relaxed">{data.overview}</p>
          </div>
        </div>

        {/* Product Details Section */}
        <div className="sticky top-24 h-fit space-y-4 py-2 md:col-span-2 md:space-y-6">
          {/* Countdown Banner */}
          <EndsInCounter endsIn={data.endsIn} />

          {/* Product Title */}
          <div className="grid grid-cols-[1fr_auto] items-center gap-2">
            <h1 className="font-medium text-2xl sm:text-3xl">{data.title}</h1>
            <ShareCard
              description={`Check out this amazing deal: ${data.title} - Save ${calculateDiscount(Number(data.originalPrice), Number(data.price))}% off!`}
              link={`${env.NEXT_PUBLIC_BASE_URL}/${data.slug}`}
              title={data.title}
            />
            <p className="text-base text-gray-500 leading-relaxed">{data.overview}</p>
          </div>
          {/* Pricing Section */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <p className="relative flex items-center gap-1 font-bold text-2xl text-brand-600 normal-nums">
              <span>
                <IconCurrency className="size-5 text-brand-400" />
              </span>
              <span>{data.price}</span>
            </p>

            <p className="text-muted-foreground text-xs line-through decoration-brand-500 sm:text-sm md:text-base">
              {data.originalPrice}
            </p>

            <div className="size-0.5 rounded-full bg-gray-300 sm:size-1" />

            <Badge className="text-xs sm:text-sm" size="sm" variant="destructive">
              Save {calculateDiscount(Number(data.originalPrice), Number(data.price))}% Today!
            </Badge>

            <div className="size-0.5 rounded-full bg-gray-300 sm:size-1" />

            <Badge size="sm">
              Only <span className="font-medium">{data.stock}</span> left
              <InfoTooltip info="The Stock tag shows the available units for the selected item. Sellers control whether to display it and manage their own inventory." />
            </Badge>
          </div>

          {/* CTA Button */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <p className="font-medium text-gray-500 text-sm">Qty</p>
              <QuantityInput />
            </div>
            <div className="flex items-center gap-1">
              <p className="font-medium text-sm text-yellow-500">{calculateAverageRating(data.reviews)}</p>
              <StarRating readOnly value={calculateAverageRating(data.reviews)} />
              <p className="font-medium text-gray-500 text-sm">
                {data.reviews.length} {pluralize("review", data.reviews.length)}
              </p>
            </div>
          </div>
          <Button className="w-full" size="lg">
            Claim this deal now <IconChevronRight />
          </Button>
          <SeparatorBox />
          <div className="space-y-4">
            <Banner>
              <BannerContent>
                <BannerIcon>
                  <IconPackage className="size-6 text-gray-500" />
                </BannerIcon>
                <BannerText>
                  <BannerTitle className="font-medium text-gray-600">
                    {data.delivery ? "Shipping Fee" : " Free Shipping"}
                  </BannerTitle>
                  <BannerDescription>
                    {data.delivery ? (
                      <p>
                        Shipping fee of <span className="font-medium">AED{data.delivery}</span>
                      </p>
                    ) : (
                      <p className="text-muted-foreground">Free shipping on all orders over AED100</p>
                    )}
                  </BannerDescription>
                </BannerText>
              </BannerContent>
            </Banner>

            <Banner>
              <BannerContent>
                <BannerIcon>
                  <IconDocument className="size-5 text-gray-500" />
                </BannerIcon>
                <BannerText>
                  <BannerTitle className="font-medium text-gray-500">Order Guarantee</BannerTitle>
                  <BannerDescription className="flex flex-wrap gap-2">
                    <Badge size="sm" variant="success">
                      <IconCheckboxCircle /> Free Returns
                    </Badge>
                    <Badge size="sm" variant="success">
                      <IconCheckboxCircle /> Return if item damaged
                    </Badge>
                    <Badge size="sm" variant="success">
                      <IconCheckboxCircle /> Cash on Delivery
                    </Badge>
                  </BannerDescription>
                </BannerText>
              </BannerContent>
            </Banner>

            <Banner className="bg-green-100" size="sm" variant="success">
              <BannerContent className="items-center">
                <BannerIcon>
                  <IconShield className="size-6 text-green-600" />
                </BannerIcon>
                <BannerText>
                  <BannerTitle className="font-medium text-green-700">Secure Payment</BannerTitle>
                </BannerText>
              </BannerContent>
            </Banner>
          </div>
        </div>
      </header>
      <SeparatorBox className="container mx-auto max-w-7xl border-x" />
      <section className="container relative max-w-7xl border-x py-12 md:hidden md:py-16 lg:py-20">
        <div className="mt-4 space-y-1">
          <h2 className="font-medium text-gray-500 text-sm">Product Overview</h2>
          <p>{data.description}</p>
        </div>
      </section>
      <Reviews reviews={data.reviews} />
      <Deals />
    </main>
  );
}
