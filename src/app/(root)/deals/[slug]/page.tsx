import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { ShareCard } from "@/components/global/share-card";
import { InfoTooltip } from "@/components/global/tooltip";
import { BreadcrumbSchema, ProductSchema } from "@/components/seo/structured-data";
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
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import ImageCarousel from "@/components/ui/carousel-with-thumbnail";
import { SeparatorBox } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import {
  IconApplePay,
  IconCurrency,
  IconDocument,
  IconMasterCard,
  IconPackage,
  IconShield,
  IconVisaCard,
} from "@/assets/icons";

import { env } from "@/lib/env/server";
import { calculateDiscount, cn } from "@/lib/utils";
import { Deals } from "@/modules/home/sections";
import { getProductBySlug } from "@/modules/product/actions/query";
import { EndsInCounter } from "@/modules/product/components/ends-in-counter";
import { AddToCart } from "@/modules/product/components/ui/add-to-cart";
import { CheckboxBadge } from "@/modules/product/components/ui/checkbox-badge";
import { Reviews } from "@/modules/product/sections/reviews";

type Params = Promise<{ product: string }>;

interface Props {
  params: Params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { product } = await params;
  const res = await getProductBySlug(product);

  if (!res) {
    return {
      title: "Product Not Found",
      description: "The requested product could not be found.",
    };
  }

  const productUrl = `${env.BASE_URL}/${res.slug}`;
  const mainImage = res.images[0]?.media?.url || "/default-product-image.jpg";

  return {
    title: res.title,
    description: res.description || res.overview || "",
    keywords: [res.title, "deal", "discount", "savings", "limited time offer", "product"],
    openGraph: {
      title: res.title,
      description: res.description || res.overview || "",
      url: productUrl,
      siteName: "ZM Deals",
      images: [
        {
          url: mainImage,
          width: 1200,
          height: 630,
          alt: res.title,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: res.title,
      description: res.description || res.overview || "",
      images: [mainImage],
    },
    alternates: {
      canonical: productUrl,
    },
    other: {
      "product:price:amount": res.price.toString(),
      "product:price:currency": "AED",
      "product:availability": res.inventory.stock > 0 ? "in stock" : "out of stock",
      "product:condition": "new",
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { product } = await params;

  const res = await getProductBySlug(product);

  if (!res) {
    return notFound();
  }

  const productUrl = `${env.BASE_URL}/${res.slug}`;
  const mainImage = res.images[0]?.media?.url || "/default-product-image.jpg";
  const breadcrumbItems = [
    { name: "Home", url: env.BASE_URL },
    { name: "Deals", url: `${env.BASE_URL}/deals` },
    { name: res.title, url: productUrl },
  ];

  return (
    <main className="">
      {/* Structured Data */}
      <ProductSchema
        availability={res.inventory.stock > 0 ? "InStock" : "OutOfStock"}
        brand="ZM Deals"
        category="Deals"
        currency="AED"
        description={res.description || res.overview || ""}
        image={mainImage}
        name={res.title}
        price={Number(res.price)}
        url={productUrl}
      />
      <BreadcrumbSchema items={breadcrumbItems} />

      <header className="container relative grid max-w-7xl grid-cols-1 gap-6 pt-6 pb-6 md:grid-cols-5 md:gap-8 md:pb-8 lg:gap-12 lg:pb-12">
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
                <Suspense fallback={<Skeleton className="h-4 w-24" />}>
                  <BreadcrumbPage>{res.title}</BreadcrumbPage>
                </Suspense>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <ImageCarousel images={res.images} thumbPosition="bottom" />
          <div className="mt-4 hidden space-y-2 md:block">
            <h2 className="font-medium text-gray-500 text-sm">Product Overview</h2>
            <p className="leading-relaxed">{res.description}</p>
            <div className="mt-4 space-y-4">
              {res.images.map((image) => (
                <div className="relative aspect-4/3 overflow-hidden rounded-lg bg-card" key={image.media?.url}>
                  <Image alt={res.title} className="object-cover" fill src={image.media?.url ?? ""} />
                </div>
              ))}
            </div>
            <p className="leading-relaxed">{res.overview}</p>
          </div>
        </div>

        {/* Product Details Section */}
        <div className="sticky top-24 h-fit space-y-4 py-2 md:col-span-2 md:space-y-5 md:py-6">
          {/* Countdown Banner */}
          {res.endsIn && <EndsInCounter endsIn={res.endsIn} />}

          {/* Product Title */}
          <div className="space-y-1">
            <div className="grid grid-cols-[1fr_auto] items-center gap-2">
              <h1 className="font-medium text-2xl sm:text-3xl">{res.title}</h1>
              <ShareCard
                description={`Check out this amazing deal: ${res.title} - Save ${calculateDiscount(Number(res.compareAtPrice), Number(res.price))}% off!`}
                link={`${env.BASE_URL}/${res.slug}`}
                title={res.title}
              />
            </div>

            <p className="text-gray-600 text-sm leading-relaxed">{res.overview}</p>
          </div>

          {/* Pricing Section */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <p className="relative flex items-center gap-1 font-bold text-2xl text-brand-600 normal-nums">
              <span>
                <IconCurrency className="size-5 text-brand-400" />
              </span>
              <span>{res.price}</span>
            </p>

            <p className="text-muted-foreground text-xs line-through decoration-brand-500 sm:text-sm md:text-base">
              {res.compareAtPrice}
            </p>

            <div className="size-0.5 rounded-full bg-gray-300 sm:size-1" />

            <Badge className="text-xs sm:text-sm" size="sm" variant="destructive">
              Save {calculateDiscount(Number(res.compareAtPrice), Number(res.price))}% Today!
            </Badge>

            <div className="size-0.5 rounded-full bg-gray-300 sm:size-1" />

            <Badge size="sm">
              Only <span className="font-medium">{res.inventory.stock}</span> left
              <InfoTooltip info="The Stock tag shows the available units for the selected item. Sellers control whether to display it and manage their own inventory." />
            </Badge>
          </div>

          {/* Checkout with Quantity */}
          <AddToCart data={res} />

          <SeparatorBox />
          <div className="space-y-4">
            <Banner
              className={cn(res.isDeliveryFree ? "bg-green-100" : "bg-red-100")}
              size={res.isDeliveryFree ? "sm" : "default"}
              variant={res.isDeliveryFree ? "success" : "destructive"}
            >
              <BannerContent className={cn(res.isDeliveryFree ? "items-center" : "items-start")}>
                <BannerIcon>
                  <IconPackage className="size-6" />
                </BannerIcon>
                <BannerText>
                  <BannerTitle className="font-medium">
                    {res.isDeliveryFree ? "Free Shipping" : "Shipping Fee"}
                  </BannerTitle>
                  {!res.isDeliveryFree && (
                    <BannerDescription>
                      <p>
                        Shipping fee of <span className="font-medium">AED{res.deliveryFee}</span>
                      </p>
                    </BannerDescription>
                  )}
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
                  <BannerDescription>
                    <Carousel
                      className="w-full"
                      opts={{
                        dragFree: true,
                        containScroll: "trimSnaps",
                      }}
                    >
                      <CarouselContent className="-ml-2">
                        <CarouselItem className="basis-auto pl-2">
                          <CheckboxBadge className="select-none">Free Returns</CheckboxBadge>
                        </CarouselItem>
                        <CarouselItem className="basis-auto pl-2">
                          <CheckboxBadge className="select-none">Return if item damaged</CheckboxBadge>
                        </CarouselItem>
                        <CarouselItem className="basis-auto pl-2">
                          <CheckboxBadge className="select-none">Cash on Delivery</CheckboxBadge>
                        </CarouselItem>
                      </CarouselContent>
                    </Carousel>
                  </BannerDescription>
                </BannerText>
              </BannerContent>
            </Banner>

            <Banner variant="success">
              <BannerContent>
                <BannerIcon>
                  <IconShield className="size-5" />
                </BannerIcon>
                <BannerText>
                  <BannerTitle className="font-medium">Secure Payment</BannerTitle>
                  <BannerDescription>
                    <p className="text-xs">Secured by Stripe</p>
                  </BannerDescription>
                </BannerText>
                <div className="flex items-center gap-2">
                  <IconVisaCard className="size-8" />
                  <IconMasterCard className="size-8" />
                  <IconApplePay className="size-8" />
                </div>
              </BannerContent>
            </Banner>
          </div>
        </div>
      </header>

      {/* Reviews Section */}
      <Reviews productId={res.id} reviews={res.reviews} />

      {/* Related Deals Section */}
      <Deals />
    </main>
  );
}
