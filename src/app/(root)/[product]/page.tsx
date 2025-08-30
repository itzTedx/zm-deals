import { Suspense } from "react";
import type { Metadata } from "next";
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
import { getComboDealsByProductId } from "@/modules/combo-deals/actions/query";
import { getProductBySlug } from "@/modules/product/actions/query";
import { EndsInCounter } from "@/modules/product/components/ends-in-counter";
import { FrequentlyBoughtTogether } from "@/modules/product/components/frequently-bought-together";
import { CheckboxBadge } from "@/modules/product/components/ui/checkbox-badge";
import { CheckoutWithQuantity } from "@/modules/product/components/ui/checkout-with-quantity";
import { Reviews } from "@/modules/product/sections/reviews";

type Params = Promise<{ product: string }>;

interface Props {
  params: Params;
}

// Generate static params for all categories
// export async function generateStaticParams() {
//   const products = await getProducts();

//   return products.map((product) => ({
//     slug: product.slug,
//   }));
// }

// Revalidate pages every hour (3600 seconds)
// export const revalidate = 3600;

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

  // Get combo deals that include this product
  const comboDeals = await getComboDealsByProductId(res.id);

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
        <div className="md:col-span-3">
          {/* Breadcrumb Section */}
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
          {/* Image Carousel Section */}
          <ImageCarousel images={res.images} showThumbs={res.images.length > 1} thumbPosition="bottom" />

          {/* Product Overview Section */}
          <div className="mt-4 hidden space-y-2 md:block">
            <p className="font-medium text-gray-500 text-sm">Product Overview</p>
            <article className="prose" dangerouslySetInnerHTML={{ __html: res.description }} />
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

          {/* CTA Button */}
          <CheckoutWithQuantity data={res} />

          <SeparatorBox />
          <div className="space-y-4">
            <Banner
              className={cn(res.isDeliveryFree ? "bg-green-100" : null)}
              size={res.isDeliveryFree ? "sm" : "default"}
              variant={res.isDeliveryFree ? "success" : null}
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
                      <p className="flex items-center gap-1">
                        Shipping fee of{" "}
                        <span className="inline-flex items-center font-medium">
                          <IconCurrency className="size-3.5" />
                          {res.deliveryFee}
                        </span>
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

      <div className="container md:hidden">
        <article className="prose" dangerouslySetInnerHTML={{ __html: res.description }} />
      </div>

      {/* Reviews Section */}
      <Reviews productId={res.id} reviews={res.reviews} />

      {/* Frequently Bought Together Section */}
      <FrequentlyBoughtTogether comboDeals={comboDeals} currentProduct={res} />

      {/* Related Deals Section */}
      {/* <Deals /> */}
    </main>
  );
}
